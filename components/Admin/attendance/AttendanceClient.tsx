'use client';

import React, { useState, useEffect, useCallback } from 'react';
import './attendance.css';
import {
    Users, UserCheck, UserX, UserPlus, Clock,
    QrCode, Activity, Eye, UserMinus, Search,
    Trash2, X, Check, RefreshCw,
    Calendar, Download, Image as ImageIcon,
    FileSpreadsheet, FileText
} from 'lucide-react';
import {
    getAttendanceStats,
    getAttendanceRecords,
    getVisitors,
    getAbsentMembers,
    deleteAttendance,
    generateQRToken,
    registerVisitor,
    getAdvancedAttendanceData,
    getAttendanceSyncStatus,
    getActiveQRToken
} from '@/app/actions/attendance';
import { QRCodeSVG } from 'qrcode.react';
import { exportQRCodeToPDF, exportQRCodeToPNG } from '@/lib/qrExport';
import { exportAttendanceReportToPDF, exportAdvancedAttendanceDataToPDF } from '@/lib/attendanceReportExport';
import { exportAttendanceToExcel } from '@/lib/attendanceExcelExport';

// Types
interface Stats {
    totalMembers: number;
    membersPresent: number;
    absentCount: number;
    visitorsCount: number;
    totalPresent: number;
    avgArrival: string;
    malesCount: number;
    femalesCount: number;
    childrenCount: number;
}

interface AttendanceRecord {
    attendanceId: number;
    memberId: number | null;
    name: string;
    email: string | null;
    phone: string | null;
    photo: string | null;
    checkInTime: string;
    status: string;
    ministry: string | null;
    ministries: string | null;
}

interface VisitorRecord {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    checkInTime: string;
    source: string | null;
    visitorsPurpose: string | null;
}

interface AbsentRecord {
    memberId: number;
    name: string;
    email: string;
    phone: string;
    photoPath: string | null;
    status: string | null;
    ministry: string | null;
    ministries: string | null;
}

export default function AttendanceClient() {
    // State
    const [stats, setStats] = useState<Stats>({
        totalMembers: 0,
        membersPresent: 0,
        absentCount: 0,
        visitorsCount: 0,
        totalPresent: 0,
        avgArrival: '--:--',
        malesCount: 0,
        femalesCount: 0,
        childrenCount: 0
    });
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [visitorsData, setVisitorsData] = useState<VisitorRecord[]>([]);
    const [absentData, setAbsentData] = useState<AbsentRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'qr' | 'live' | 'visitors' | 'absent'>('qr');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportRange, setExportRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [ministryFilter, setMinistryFilter] = useState('');
    const [visitorSearch, setVisitorSearch] = useState('');
    const [absentSearch, setAbsentSearch] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState({ live: 1, visitors: 1, absent: 1 });
    const rowsPerPage = 10;

    // QR Code State
    const [selectedService, setSelectedService] = useState('sunday-morning');
    const [customServiceName, setCustomServiceName] = useState('');
    const [qrGenerated, setQrGenerated] = useState(false);
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [qrUrl, setQrUrl] = useState<string>('');


    // Visitor Form State
    const [visitorFormData, setVisitorFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: '',
        purpose: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [showVisitorModal, setShowVisitorModal] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [qrBaseUrl, setQrBaseUrl] = useState('');

    // Sync state for smart polling
    const [lastSync, setLastSync] = useState<{ count: number; timestamp: string | null }>({
        count: 0,
        timestamp: null
    });


    // Load data from server actions
    const loadData = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        try {
            // Fetch all data in parallel
            const [statsResult, attendanceResult, visitorsResult, absentResult, qrResult] = await Promise.all([
                getAttendanceStats(selectedService, currentDate),
                getAttendanceRecords(selectedService, currentDate),
                getVisitors(selectedService, currentDate),
                getAbsentMembers(selectedService, currentDate),
                getActiveQRToken(selectedService)
            ]);

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }

            if (attendanceResult.success && attendanceResult.data) {
                setAttendanceData(attendanceResult.data);
            }

            if (visitorsResult.success && visitorsResult.data) {
                setVisitorsData(visitorsResult.data);
            }

            if (absentResult.success && absentResult.data) {
                setAbsentData(absentResult.data);
            }

            // Persistence check: If an active token exists, use it
            if (qrResult.success && qrResult.token) {
                setQrToken(qrResult.token);
                setQrGenerated(true);
            } else {
                // If no active token, we don't force a new one, but we reset the state 
                // so the generic service URL can be used as fallback
                setQrToken(null);
                setQrGenerated(false);
            }
        } catch (error) {
            console.error('Error loading attendance data:', error);
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    }, [currentDate, selectedService]);

    // Auto-refresh useEffect (Smart Polling)
    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined' && !qrBaseUrl) {
            setQrBaseUrl(window.location.origin);
        }

        // Initial load
        loadData();

        // Smart polling: Check for changes every 2 seconds
        const interval = setInterval(async () => {
            try {
                const status = await getAttendanceSyncStatus(selectedService, currentDate);
                if (status.success) {
                    // Only refresh full data if the count or latest timestamp has changed
                    if (status.lastCount !== lastSync.count || status.lastTimestamp !== lastSync.timestamp) {
                        console.log('Change detected, refreshing attendance data...');
                        loadData(true);
                        setLastSync({
                            count: status.lastCount,
                            timestamp: status.lastTimestamp
                        });
                    }
                }
            } catch (error) {
                console.error('Sync check failed:', error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [loadData, qrBaseUrl, lastSync, selectedService, currentDate]);


    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const service = e.target.value;
        setSelectedService(service);
        if (service !== 'others') {
            setCustomServiceName('');
        }
    };

    const handleGenerateQR = async () => {
        try {
            const serviceName = getServiceDisplayName();
            const result = await generateQRToken(selectedService, currentDate, serviceName);

            if (result.success && result.token) {
                setQrToken(result.token);
                const baseUrl = qrBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
                setQrUrl(`${baseUrl}/checkin?token=${result.token}`);
                setQrGenerated(true);
            } else {
                alert('Failed to generate QR code: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Error generating QR code');
        }
    };

    const getServiceDisplayName = () => {
        if (selectedService === 'others') {
            return customServiceName || 'Other Service';
        }
        if (selectedService === 'sunday-morning') return 'Sunday Morning Service';
        if (selectedService === 'sunday-evening') return 'Sunday Evening Service';
        if (selectedService === 'midweek') return 'Midweek Service';

        // Dynamic fallback for any other hyphenated service IDs
        return selectedService.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleExportPDF = async () => {
        const qrElement = document.getElementById('attendance-qr');
        if (!qrElement) {
            alert('Please generate/view the QR code first');
            return;
        }
        try {
            await exportQRCodeToPDF(qrElement, {
                serviceName: getServiceDisplayName(),
                date: currentDate
            });
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Failed to export PDF');
        }
    };

    const handleExportPNG = async () => {
        const qrElement = document.getElementById('attendance-qr');
        if (!qrElement) {
            alert('Please generate/view the QR code first');
            return;
        }
        try {
            await exportQRCodeToPNG(qrElement, {
                serviceName: getServiceDisplayName(),
                date: currentDate
            });
        } catch (error) {
            console.error('Error exporting PNG:', error);
            alert('Failed to export PNG');
        }
    };

    const handleAdvancedExport = async (format: 'pdf' | 'excel') => {
        setIsExporting(true);
        try {
            const result = await getAdvancedAttendanceData(exportRange.start, exportRange.end, selectedService);
            if (result.success && result.data) {
                if (format === 'excel') {
                    exportAttendanceToExcel(result.data, exportRange.start, exportRange.end);
                } else {
                    await exportAdvancedAttendanceDataToPDF(result.data, exportRange.start, exportRange.end);
                }
                setShowExportModal(false);
            } else {
                alert(result.message || 'Failed to fetch advanced data');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('An unexpected error occurred during export');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportFullReport = () => {
        exportAttendanceReportToPDF(
            stats,
            attendanceData,
            visitorsData,
            absentData,
            currentDate
        );
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this check-in record?')) {
            try {
                const result = await deleteAttendance(id);
                if (result.success) {
                    setAttendanceData(prev => prev.filter(item => item.attendanceId !== id));
                } else {
                    alert('Failed to delete: ' + result.message);
                }
            } catch (error) {
                console.error('Error deleting attendance:', error);
                alert('Error deleting attendance record');
            }
        }
    };

    const handleVisitorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await registerVisitor(
                visitorFormData.name,
                visitorFormData.phone,
                visitorFormData.email || undefined,
                visitorFormData.source,
                visitorFormData.purpose,
                selectedService,
                currentDate
            );

            if (result.success) {
                alert(result.message);
                setShowVisitorModal(false);
                setVisitorFormData({ name: '', phone: '', email: '', source: '', purpose: '' });
                loadData(); // Refresh data
            } else {
                alert('Failed: ' + result.message);
            }
        } catch (error) {
            console.error('Error registering visitor:', error);
            alert('Error registering visitor');
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateQRValue = () => {
        const baseUrl = qrBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
        if (qrToken) {
            return `${baseUrl}/checkin?token=${qrToken}`;
        }
        const serviceParam = selectedService === 'others' && customServiceName ? customServiceName : selectedService;
        return `${baseUrl}/checkin?selectedService=${serviceParam}`;
    };


    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getDefaultAvatar = () => {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Cpath d='M20 20a6 6 0 100-12 6 6 0 000 12zM8 32a12 12 0 0124 0' fill='%23fff'/%3E%3C/svg%3E";
    };

    // Filter functions
    const filteredAttendance = attendanceData.filter(item =>
        (!searchInput || item.name.toLowerCase().includes(searchInput.toLowerCase())) &&
        (!statusFilter || item.status === statusFilter) &&
        (!ministryFilter || item.ministry === ministryFilter)
    );

    const filteredVisitors = visitorsData.filter(item =>
        !visitorSearch || item.name.toLowerCase().includes(visitorSearch.toLowerCase())
    );

    const filteredAbsent = absentData.filter(item =>
        !absentSearch || item.name.toLowerCase().includes(absentSearch.toLowerCase())
    );

    // Pagination helpers
    const getPaginatedData = (data: any[], type: 'live' | 'visitors' | 'absent') => {
        const start = (currentPage[type] - 1) * rowsPerPage;
        return data.slice(start, start + rowsPerPage);
    };

    const getTotalPages = (dataLength: number) => Math.ceil(dataLength / rowsPerPage);

    return (
        <div className="attendance-page">
            {/* Page Header */}
            <div className="rap-header">
                <div className="head-core">
                    <h1>Attendance Records</h1>
                    <p>Real-time tracking and member management</p>
                </div>
                <div className="head-tools">
                    <div className="date-filter">
                        <input
                            type="date"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            className="date-input"
                        />
                    </div>
                    <button className="vox-btn vox-btn-main" onClick={handleExportFullReport}>
                        <Download size={18} />
                        Export PDF
                    </button>
                    <button className="vox-btn btn-outline" style={{ background: '#10b981', color: 'white' }} onClick={() => setShowExportModal(true)}>
                        <FileSpreadsheet size={18} />
                        Advanced Export
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="dash-grid">
                <div className="dash-box">
                    <div className="dash-top">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span className="dash-label">Members</span>
                    </div>
                    <div className="dash-num">{stats.totalMembers}</div>
                    <div className="dash-shift">Registered Members</div>
                </div>

                <div className="dash-box">
                    <div className="dash-top">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span className="dash-label">Present Today</span>
                    </div>
                    <div className="dash-num">{stats.membersPresent}</div>
                    <div className="dash-shift">Today</div>
                </div>

                <div className="dash-box">
                    <div className="dash-top">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        <span className="dash-label">Absent</span>
                    </div>
                    <div className="dash-num">{stats.absentCount}</div>
                    <div className="dash-shift">Today</div>
                </div>

                <div className="dash-box">
                    <div className="dash-top">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                            <path d="M12 14v7" />
                            <path d="M9 17l3-3 3 3" />
                        </svg>
                        <span className="dash-label">Visitors</span>
                    </div>
                    <div className="dash-num">{stats.visitorsCount}</div>
                    <div className="dash-shift">First-time Today</div>
                </div>

                <div className="dash-box">
                    <div className="dash-top">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="dash-label">Avg Arrival</span>
                    </div>
                    <div className="dash-num">{stats.avgArrival}</div>
                    <div className="dash-shift">Real-time average</div>
                </div>

                <div className="dash-box">
                    <div className="dash-top">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="5" />
                            <path d="M20 21a8 8 0 1 0-16 0" />
                            <path d="M12 13v-2" />
                        </svg>
                        <span className="dash-label">Males</span>
                    </div>
                    <div className="dash-num">{stats.malesCount}</div>
                    <div className="dash-shift">Present Today</div>
                </div>

                <div className="dash-box">
                    <div className="dash-top">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="5" />
                            <path d="M20 21a8 8 0 1 0-16 0" />
                            <circle cx="12" cy="8" r="2" />
                        </svg>
                        <span className="dash-label">Females</span>
                    </div>
                    <div className="dash-num">{stats.femalesCount}</div>
                    <div className="dash-shift">Present Today</div>
                </div>

                <div className="dash-box">
                    <div className="dash-top">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2a3 3 0 0 0-3 3c0 1.3.8 2.4 2 2.8V9H8v2h3v2H8v2h3v5a1 1 0 0 0 2 0v-5h3v-2h-3v-2h3V9h-3V7.8c1.2-.4 2-1.5 2-2.8a3 3 0 0 0-3-3z" />
                        </svg>
                        <span className="dash-label">Children</span>
                    </div>
                    <div className="dash-num">{stats.childrenCount}</div>
                    <div className="dash-shift">Present Today</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <nav className="nav-tabs">
                <button
                    className={`nav-tab ${activeTab === 'qr' ? 'current' : ''}`}
                    onClick={() => setActiveTab('qr')}
                >
                    QR Check-In
                </button>
                <button
                    className={`nav-tab ${activeTab === 'live' ? 'current' : ''}`}
                    onClick={() => setActiveTab('live')}
                >
                    Live Attendance
                </button>
                <button
                    className={`nav-tab ${activeTab === 'visitors' ? 'current' : ''}`}
                    onClick={() => setActiveTab('visitors')}
                >
                    Visitors
                </button>
                <button
                    className={`nav-tab ${activeTab === 'absent' ? 'current' : ''}`}
                    onClick={() => setActiveTab('absent')}
                >
                    Absent Members
                </button>
            </nav>

            {/* Tab Content */}
            <div className="tab-content">
                {/* QR Check-In Tab */}
                {activeTab === 'qr' && (
                    <div id="qr-content" className="tab-panel current">
                        <div className="qr-recent-grid">
                            <div className="qr-section">
                                <div className="vax-head">
                                    <h2>QR Code Generator</h2>
                                    <p>Generate and manage service check-in URLs</p>
                                </div>

                                <div className="form-block">
                                    <label>Service Type</label>
                                    <select
                                        value={selectedService}
                                        onChange={handleServiceChange}
                                    >
                                        <option value="sunday-morning">Sunday Morning Service</option>
                                        <option value="sunday-evening">Sunday Evening Service</option>
                                        <option value="midweek">Midweek Service</option>
                                        <option value="others">Other Service</option>
                                    </select>
                                    {selectedService === 'others' && (
                                        <input
                                            type="text"
                                            placeholder="Enter custom service name"
                                            value={customServiceName}
                                            onChange={(e) => setCustomServiceName(e.target.value)}
                                            className="other-service-input"
                                            style={{ marginTop: '10px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                        />
                                    )}

                                    <div className="qr-base-url-config" style={{ marginTop: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '5px' }}>
                                            Base URL for QR Codes (IP/Domain)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., http://172.20.10.4:3000"
                                            value={qrBaseUrl}
                                            onChange={(e) => setQrBaseUrl(e.target.value)}
                                            className="qr-base-input"
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                                        />
                                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                            Specify your laptop&apos;s IP to test on mobile via local network.
                                        </p>
                                    </div>
                                </div>

                                <div className="vax-frame">
                                    {mounted ? (
                                        <QRCodeSVG
                                            id="attendance-qr"
                                            value={generateQRValue()}
                                            size={240}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    ) : (
                                        <div style={{ width: 240, height: 240, background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Loading QR Code...</span>
                                        </div>
                                    )}
                                </div>

                                <div className="vax-info">
                                    <h3>About QR Check-In</h3>
                                    <p>1. Open your phone camera</p>
                                    <p>2. Point it at the QR code above</p>
                                    <p>3. Tap the notification to open the check-in page</p>
                                    <p>4. Select Member or Visitor</p>
                                    <p>5. Enter your details to complete check-in</p>
                                    <p>6. Show the success screen to an usher</p>
                                </div>

                                <div className="btn-row" style={{ marginTop: '20px' }}>
                                    <button
                                        className="vox-btn vox-btn-main"
                                        onClick={handleGenerateQR}
                                        style={{ width: '100%', marginBottom: '15px' }}
                                    >
                                        <QrCode size={18} />
                                        Generate Service QR Code
                                    </button>
                                </div>

                                <div className="btn-row">
                                    <button className="vox-btn" onClick={handleExportPDF}>
                                        <Download size={18} />
                                        Export PDF
                                    </button>
                                    <button className="vox-btn" onClick={handleExportPNG}>
                                        <ImageIcon size={18} />
                                        Export PNG
                                    </button>
                                </div>
                            </div>

                            <div className="recent-checkins" style={{ flex: 1.5 }}>
                                <div className="section-title-wrap">
                                    <h3>
                                        <Clock className="clock-icon" size={24} />
                                        Recent Check-ins
                                    </h3>
                                    <div className="title-underline"></div>
                                </div>

                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>NAME</th>
                                                <th>CHECK-IN TIME</th>
                                                <th>PHONE NUMBER</th>
                                                <th>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceData.slice(0, 5).map((item) => (
                                                <tr key={item.attendanceId}>
                                                    <td>
                                                        <div className="member-cell">
                                                            {item.photo ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={item.photo}
                                                                    alt={item.name}
                                                                    className="member-avatar"
                                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/Logo.PNG' }}
                                                                />
                                                            ) : (
                                                                <div className="visitor-avatar">
                                                                    {getInitials(item.name)}
                                                                </div>
                                                            )}
                                                            <div className="member-info">
                                                                <span className="member-name">{item.name}</span>
                                                                <span className="member-role">{item.email || 'No email'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span className="time-badge">{item.checkInTime}</span></td>
                                                    <td><span className="phone-text">{item.phone || 'N/A'}</span></td>
                                                    <td>
                                                        <button
                                                            className="vox-btn vox-btn-alert vox-btn-tiny"
                                                            onClick={() => handleDelete(item.attendanceId)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {attendanceData.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-10 italic text-slate-400">
                                                        No recent check-ins found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* Live Attendance Tab */}
                {activeTab === 'live' && (
                    <div className="tab-panel live-panel current">
                        <div className="track-head">
                            <div className="track-title">
                                <h2>Live Attendance</h2>
                                <p>Viewing member check-ins for {currentDate}</p>
                            </div>
                            <div className="find-filter">
                                <input
                                    type="text"
                                    className="find-input"
                                    placeholder="Search by name..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="filter-choice"
                                >
                                    <option value="">All Status</option>
                                    <option value="present">Present</option>
                                    <option value="late">Late</option>
                                </select>
                                <select
                                    value={ministryFilter}
                                    onChange={(e) => setMinistryFilter(e.target.value)}
                                    className="filter-choice"
                                >
                                    <option value="">All Ministries</option>
                                    <option value="General">General</option>
                                    <option value="Choir">Choir</option>
                                    <option value="Usher">Usher</option>
                                    <option value="Protocol">Protocol</option>
                                </select>
                            </div>
                        </div>

                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th>PHONE NUMBER</th>
                                        <th>CHECK-IN TIME</th>
                                        <th>STATUS</th>
                                        <th>MINISTRY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading records...</td>
                                        </tr>
                                    ) : filteredAttendance.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No records found</td>
                                        </tr>
                                    ) : (
                                        getPaginatedData(filteredAttendance, 'live').map(item => (
                                            <tr key={item.attendanceId}>
                                                <td>
                                                    <div className="member-cell">
                                                        {item.photo ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={item.photo}
                                                                alt={item.name}
                                                                className="member-avatar"
                                                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/Logo.PNG' }}
                                                            />
                                                        ) : (
                                                            <div className="visitor-avatar">
                                                                {getInitials(item.name)}
                                                            </div>
                                                        )}
                                                        <div className="member-info">
                                                            <span className="member-name">{item.name}</span>
                                                            <span className="member-role">{item.email || 'No email'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="phone-text">{item.phone || 'N/A'}</span></td>
                                                <td><span className="time-badge">{item.checkInTime}</span></td>
                                                <td>
                                                    <span className={`status-pill ${item.status}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td><span className="ministry-badge">{item.ministry || 'General'}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {getTotalPages(filteredAttendance.length) > 1 && (
                            <div className="pagination">
                                <button
                                    disabled={currentPage.live === 1}
                                    onClick={() => setCurrentPage(prev => ({ ...prev, live: prev.live - 1 }))}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: getTotalPages(filteredAttendance.length) }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={currentPage.live === i + 1 ? 'active' : ''}
                                        onClick={() => setCurrentPage(prev => ({ ...prev, live: i + 1 }))}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage.live === getTotalPages(filteredAttendance.length)}
                                    onClick={() => setCurrentPage(prev => ({ ...prev, live: prev.live + 1 }))}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Visitors Tab */}
                {activeTab === 'visitors' && (
                    <div className="tab-panel visitors-panel current">
                        <div className="track-head">
                            <div className="track-title">
                                <h2>Visitors</h2>
                                <p>Recorded visitor check-ins for {currentDate}</p>
                            </div>
                            <div className="find-filter">
                                <input
                                    type="text"
                                    className="find-input"
                                    placeholder="Search visitors..."
                                    value={visitorSearch}
                                    onChange={(e) => setVisitorSearch(e.target.value)}
                                />
                                <button className="vox-btn vox-btn-main" onClick={() => setShowVisitorModal(true)}>
                                    <UserPlus size={18} />
                                    Register Visitor
                                </button>
                            </div>
                        </div>

                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th>PHONE NUMBER</th>
                                        <th>EMAIL ADDRESS</th>
                                        <th>CHECK-IN TIME</th>
                                        <th>SOURCE</th>
                                        <th>PURPOSE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Loading visitors...</td>
                                        </tr>
                                    ) : filteredVisitors.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No visitor records found</td>
                                        </tr>
                                    ) : (
                                        getPaginatedData(filteredVisitors, 'visitors').map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="member-cell">
                                                        <div className="visitor-avatar">
                                                            {getInitials(item.name)}
                                                        </div>
                                                        <div className="member-info">
                                                            <span className="member-name">{item.name}</span>
                                                            <span className="member-role">Visitor</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="phone-text">{item.phone || 'N/A'}</span></td>
                                                <td><span className="email-text">{item.email || 'N/A'}</span></td>
                                                <td><span className="time-badge">{item.checkInTime}</span></td>
                                                <td><span className="source-badge">{item.source || 'N/A'}</span></td>
                                                <td><span className="ministry-badge">{item.visitorsPurpose || 'N/A'}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {getTotalPages(filteredVisitors.length) > 1 && (
                            <div className="pagination">
                                <button
                                    disabled={currentPage.visitors === 1}
                                    onClick={() => setCurrentPage(prev => ({ ...prev, visitors: prev.visitors - 1 }))}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: getTotalPages(filteredVisitors.length) }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={currentPage.visitors === i + 1 ? 'active' : ''}
                                        onClick={() => setCurrentPage(prev => ({ ...prev, visitors: i + 1 }))}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage.visitors === getTotalPages(filteredVisitors.length)}
                                    onClick={() => setCurrentPage(prev => ({ ...prev, visitors: prev.visitors + 1 }))}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Absent Tab */}
                {activeTab === 'absent' && (
                    <div className="tab-panel absent-panel current" id="absent-content">
                        <div className="track-head">
                            <div className="track-title">
                                <h2>Absent Members</h2>
                                <p>Members not yet checked in for {currentDate}</p>
                            </div>
                            <div className="find-filter">
                                <input
                                    type="text"
                                    className="find-input"
                                    placeholder="Search absent members..."
                                    value={absentSearch}
                                    onChange={(e) => setAbsentSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th>EMAIL ADDRESS</th>
                                        <th>PHONE NUMBER</th>
                                        <th>STATUS</th>
                                        <th>MINISTRY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading absent list...</td>
                                        </tr>
                                    ) : filteredAbsent.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Everyone is present!</td>
                                        </tr>
                                    ) : (
                                        getPaginatedData(filteredAbsent, 'absent').map(item => (
                                            <tr key={item.memberId}>
                                                <td>
                                                    <div className="member-cell">
                                                        {item.photoPath ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={item.photoPath}
                                                                alt={item.name}
                                                                className="member-avatar"
                                                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/Logo.PNG' }}
                                                            />
                                                        ) : (
                                                            <div className="visitor-avatar" style={{ background: '#cbd5e1', color: '#475569' }}>
                                                                {getInitials(item.name)}
                                                            </div>
                                                        )}
                                                        <div className="member-info">
                                                            <span className="member-name">{item.name}</span>
                                                            <span className="member-role">{item.ministry || 'General'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="email-text">{item.email || 'N/A'}</span></td>
                                                <td><span className="phone-text">{item.phone || 'N/A'}</span></td>
                                                <td>
                                                    <span className={`status-badge ${item.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                                        {item.status || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td><span className="ministry-badge">{item.ministry || 'General'}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {getTotalPages(filteredAbsent.length) > 1 && (
                            <div className="pagination">
                                <button
                                    disabled={currentPage.absent === 1}
                                    onClick={() => setCurrentPage(prev => ({ ...prev, absent: prev.absent - 1 }))}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: getTotalPages(filteredAbsent.length) }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={currentPage.absent === i + 1 ? 'active' : ''}
                                        onClick={() => setCurrentPage(prev => ({ ...prev, absent: i + 1 }))}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage.absent === getTotalPages(filteredAbsent.length)}
                                    onClick={() => setCurrentPage(prev => ({ ...prev, absent: prev.absent + 1 }))}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Visitor Registration Modal */}
            {showVisitorModal && (
                <div className="modal-overlay" onClick={() => setShowVisitorModal(false)}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowVisitorModal(false)}>
                            <X size={24} />
                        </button>
                        <h2>Register New Visitor</h2>
                        <form className="visitor-form" onSubmit={handleVisitorSubmit}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input type="text" placeholder="Enter visitor's name" required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" placeholder="0XX XXX XXXX" />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" placeholder="visitor@email.com" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>How did you hear about us?</label>
                                <select>
                                    <option value="">Select source</option>
                                    <option value="friend">Friend/Family</option>
                                    <option value="social_media">Social Media</option>
                                    <option value="website">Website</option>
                                    <option value="flyer">Flyer/Poster</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Purpose of Visit</label>
                                <input type="text" placeholder="e.g., First Time Visit, Special Program" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowVisitorModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" style={{ background: '#2563eb', color: 'white' }}>
                                    <Check size={18} />
                                    Register Visitor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Advanced Export Modal */}
            {showExportModal && (
                <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
                    <div className="modal-container advanced-export-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', borderRadius: '16px' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                            <div className="header-content">
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Advanced Export</h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Comprehensive attendance analysis and reporting</p>
                            </div>
                            <button onClick={() => setShowExportModal(false)} className="modal-close" style={{ top: '24px', right: '24px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: '24px 0' }}>
                            <div className="export-section">
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                    Target Service
                                </label>
                                <select
                                    value={selectedService}
                                    onChange={handleServiceChange}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', marginBottom: '20px' }}
                                >
                                    <option value="all">All Services (Aggregated)</option>
                                    <option value="sunday-morning">Sunday Morning Service</option>
                                    <option value="sunday-evening">Sunday Evening Service</option>
                                    <option value="midweek">Midweek Service</option>
                                </select>

                                <div className="date-range-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                            Start Date
                                        </label>
                                        <div className="input-with-icon" style={{ position: 'relative' }}>
                                            <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input
                                                type="date"
                                                className="vox-input"
                                                value={exportRange.start}
                                                onChange={(e) => setExportRange({ ...exportRange, start: e.target.value })}
                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                            End Date
                                        </label>
                                        <div className="input-with-icon" style={{ position: 'relative' }}>
                                            <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input
                                                type="date"
                                                className="vox-input"
                                                value={exportRange.end}
                                                onChange={(e) => setExportRange({ ...exportRange, end: e.target.value })}
                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="report-features" style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #e0f2fe', marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                        Included Analysis
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#0c4a6e' }}>
                                            <Check size={14} /> Member Rankings
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#0c4a6e' }}>
                                            <Check size={14} /> Daily Trends
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#0c4a6e' }}>
                                            <Check size={14} /> Visitor Analysis
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#0c4a6e' }}>
                                            <Check size={14} /> Raw Audit Logs
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="export-actions" style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className="vox-btn"
                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#059669', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    onClick={() => handleAdvancedExport('excel')}
                                    disabled={isExporting}
                                >
                                    {isExporting ? <RefreshCw className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
                                    Excel (.xlsx)
                                </button>
                                <button
                                    className="vox-btn"
                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#2563eb', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    onClick={() => handleAdvancedExport('pdf')}
                                    disabled={isExporting}
                                >
                                    {isExporting ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
                                    Summary PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
