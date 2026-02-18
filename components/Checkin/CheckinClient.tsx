'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Loader2, AlertCircle, ArrowLeft, Check, CheckCircle, 
  UserCheck, UserPlus 
} from 'lucide-react';
import { validateQRToken, verifyAndCheckInMember, registerVisitor } from '@/app/actions/attendance';
import './checkin.css';

type ScreenType = 'loading' | 'error' | 'selection' | 'member' | 'visitor' | 'member-success' | 'visitor-success';

interface MemberData {
    name: string;
    email: string;
    phone: string;
    ministry?: string;
    position?: string;
    photo?: string;
    checkInTime?: string;
}

interface VisitorData {
    name: string;
    phone: string;
    email?: string;
    checkInTime?: string;
}

export default function CheckinClient() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [currentScreen, setCurrentScreen] = useState<ScreenType>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [serviceInfo, setServiceInfo] = useState({ serviceId: '', date: '', serviceName: '' });

    // Member form
    const [memberEmail, setMemberEmail] = useState('');
    const [memberPhone, setMemberPhone] = useState('');
    const [memberError, setMemberError] = useState('');
    const [memberLoading, setMemberLoading] = useState(false);
    const [memberData, setMemberData] = useState<MemberData | null>(null);
    const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

    // Visitor form
    const [visitorName, setVisitorName] = useState('');
    const [visitorPhone, setVisitorPhone] = useState('');
    const [visitorEmail, setVisitorEmail] = useState('');
    const [visitorSource, setVisitorSource] = useState('');
    const [visitorPurpose, setVisitorPurpose] = useState('');
    const [visitorError, setVisitorError] = useState('');
    const [visitorLoading, setVisitorLoading] = useState(false);
    const [visitorData, setVisitorData] = useState<VisitorData | null>(null);

    useEffect(() => {
        async function validateTokenOnLoad() {
            if (!token) {
                setErrorMessage('Invalid or missing check-in link. Please scan the QR code again.');
                setCurrentScreen('error');
                return;
            }

            try {
                const result = await validateQRToken(token);
                if (result.valid && result.serviceId && result.date && result.serviceName) {
                    setServiceInfo({
                        serviceId: result.serviceId,
                        date: result.date,
                        serviceName: result.serviceName
                    });
                    setCurrentScreen('selection');
                } else {
                    setErrorMessage(result.message || 'This check-in link has expired or is invalid.');
                    setCurrentScreen('error');
                }
            } catch (error) {
                setErrorMessage('Unable to verify check-in link. Please try again.');
                setCurrentScreen('error');
                console.error('Token validation error:', error);
            }
        }

        validateTokenOnLoad();
    }, [token]);

    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMemberError('');

        if (!memberEmail || !memberPhone) {
            setMemberError('Please enter both email and phone number.');
            return;
        }

        if (!/^\d{10}$/.test(memberPhone)) {
            setMemberError('Phone number must be exactly 10 digits.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)) {
            setMemberError('Please enter a valid email address.');
            return;
        }

        setMemberLoading(true);

        try {
            const result = await verifyAndCheckInMember(
                memberEmail,
                memberPhone,
                serviceInfo.serviceId,
                serviceInfo.date
            );

            if (result.success && result.member) {
                const member = result.member as Record<string, string>;
                setMemberData({
                    name: member.name || 'Unknown',
                    email: member.email || 'No email',
                    phone: member.phone || 'N/A',
                    ministry: member.ministry,
                    position: member.position,
                    photo: member.photo,
                    checkInTime: member.checkInTime || new Date().toLocaleTimeString()
                });
                setAlreadyCheckedIn(result.alreadyCheckedIn || false);
                setCurrentScreen('member-success');
            } else {
                setMemberError(result.message || 'Check-in failed. Please verify your details.');
            }
        } catch (error) {
            setMemberError('An error occurred. Please try again.');
            console.error('Member check-in error:', error);
        } finally {
            setMemberLoading(false);
        }
    };

    const handleVisitorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setVisitorError('');

        if (!visitorName || !visitorPhone) {
            setVisitorError('Name and phone number are required.');
            return;
        }

        if (!/^\d{10}$/.test(visitorPhone)) {
            setVisitorError('Phone number must be exactly 10 digits.');
            return;
        }

        if (visitorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail)) {
            setVisitorError('Please enter a valid email address.');
            return;
        }

        setVisitorLoading(true);

        try {
            const result = await registerVisitor(
                visitorName,
                visitorPhone,
                visitorEmail || undefined,
                visitorSource,
                visitorPurpose,
                serviceInfo.serviceId,
                serviceInfo.date
            );

            if (result.success) {
                setVisitorData({
                    name: visitorName,
                    phone: visitorPhone,
                    email: visitorEmail,
                    checkInTime: new Date().toLocaleTimeString()
                });
                setCurrentScreen('visitor-success');
            } else {
                setVisitorError(result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            setVisitorError('An error occurred. Please try again.');
            console.error('Visitor registration error:', error);
        } finally {
            setVisitorLoading(false);
        }
    };

    const resetToSelection = () => {
        setCurrentScreen('selection');
        setMemberEmail('');
        setMemberPhone('');
        setMemberError('');
        setVisitorName('');
        setVisitorPhone('');
        setVisitorEmail('');
        setVisitorSource('');
        setVisitorPurpose('');
        setVisitorError('');
        setMemberData(null);
        setVisitorData(null);
        setAlreadyCheckedIn(false);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="checkin-container">
            <div className="left">
                <div className="form-wrapper">

                    {/* Loading */}
                    {currentScreen === 'loading' && (
                        <div className="center-container">
                            <img src="/assets/Logo.PNG" alt="Solution Arena Ministry" className="heading-image" />
                            <h1>Solution Arena Ministry</h1>
                            <div className="loading-spinner">
                                <Loader2 className="animate-spin" size={32} />
                                <p>Verifying check-in link...</p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {currentScreen === 'error' && (
                        <div className="center-container">
                            <img src="/assets/Logo.PNG" alt="Solution Arena Ministry" className="heading-image" />
                            <h1>Solution Arena Ministry</h1>
                            <div className="error-display">
                                <AlertCircle size={48} className="error-icon" />
                                <p style={{ color: '#dc2626', fontSize: '16px' }}>{errorMessage}</p>
                                <p style={{ fontSize: '14px', marginTop: '10px', color: '#aaa' }}>
                                    Please contact the administrator or scan a new QR code.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Selection */}
                    {currentScreen === 'selection' && (
                        <div id="selection-screen">
                            <div className="center-container">
                                <img src="/assets/Logo.PNG" alt="Solution Arena Ministry" className="heading-image" />
                                <h1>Solution Arena Ministry</h1>
                                <p>
                                    Check-in for {serviceInfo.serviceName} on {new Date(serviceInfo.date).toLocaleDateString()}
                                </p>
                            </div>

                            <button className="btn-primary" id="member-btn" onClick={() => setCurrentScreen('member')}>
                                <UserCheck size={20} />
                                Check in as Member
                            </button>

                            <button className="btn-secondary" id="visitor-btn" onClick={() => setCurrentScreen('visitor')}>
                                <UserPlus size={20} />
                                Check in as Visitor
                            </button>
                        </div>
                    )}

                    {/* Member Form */}
                    {currentScreen === 'member' && (
                        <div id="member-form" className="form-container active">
                            <button className="back-btn" id="back-member" onClick={() => setCurrentScreen('selection')}>
                                <ArrowLeft size={18} />
                                Back
                            </button>

                            <div className="center-container">
                                <img src="/assets/Logo.PNG" alt="Solution Arena Ministry" className="heading-image" />
                                <h1>Solution Arena Ministry</h1>
                                <p>Check-in attendance for today's service</p>
                            </div>

                            <form onSubmit={handleMemberSubmit}>
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        id="memberEmail"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={memberEmail}
                                        onChange={(e) => setMemberEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number * (10 digits)</label>
                                    <input
                                        type="tel"
                                        id="memberPhone"
                                        className="form-control"
                                        placeholder="0XXXXXXXXX"
                                        value={memberPhone}
                                        onChange={(e) => setMemberPhone(e.target.value)}
                                        maxLength={10}
                                        required
                                    />
                                </div>

                                {memberError && (
                                    <div className="error-message" id="member-error">
                                        <AlertCircle size={24} />
                                        <p>{memberError}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    id="memberSubmit"
                                    disabled={memberLoading}
                                >
                                    {memberLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Checking in...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Check In
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Visitor Form */}
                    {currentScreen === 'visitor' && (
                        <div id="visitor-form" className="form-container active">
                            <button className="back-btn" id="back-visitor" onClick={() => setCurrentScreen('selection')}>
                                <ArrowLeft size={18} />
                                Back
                            </button>

                            <div className="center-container">
                                <img src="/assets/Logo.PNG" alt="Solution Arena Ministry" className="heading-image" />
                                <h1>Solution Arena Ministry</h1>
                                <p>Welcome! We're glad you're here.</p>
                            </div>

                            <form onSubmit={handleVisitorSubmit}>
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        id="visitorName"
                                        className="form-control"
                                        placeholder="Enter your full name"
                                        value={visitorName}
                                        onChange={(e) => setVisitorName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number * (10 digits)</label>
                                    <input
                                        type="tel"
                                        id="visitorPhone"
                                        className="form-control"
                                        placeholder="0XXXXXXXXX"
                                        value={visitorPhone}
                                        onChange={(e) => setVisitorPhone(e.target.value)}
                                        maxLength={10}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        id="visitorEmail"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={visitorEmail}
                                        onChange={(e) => setVisitorEmail(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>How did you hear about us?</label>
                                    <select
                                        id="visitorSource"
                                        className="form-control"
                                        value={visitorSource}
                                        onChange={(e) => setVisitorSource(e.target.value)}
                                    >
                                        <option value="">Select an option</option>
                                        <option value="friend">Friend</option>
                                        <option value="social">Social Media</option>
                                        <option value="online">Online Search</option>
                                        <option value="event">Event</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>What did you come here for?</label>
                                    <select
                                        id="visitorPurpose"
                                        className="form-control"
                                        value={visitorPurpose}
                                        onChange={(e) => setVisitorPurpose(e.target.value)}
                                    >
                                        <option value="">Select an option</option>
                                        <option value="worship">To Worship With Us</option>
                                        <option value="visit">To Visit</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {visitorError && (
                                    <div className="error-message" id="visitor-error">
                                        <AlertCircle size={24} />
                                        <p>{visitorError}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    id="visitorSubmit"
                                    disabled={visitorLoading}
                                >
                                    {visitorLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Check In
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ──────────────────────────────────────────────── */}
                    {/* Member Success – exact original structure       */}
                    {/* ──────────────────────────────────────────────── */}
                    {currentScreen === 'member-success' && memberData && (
                        <div id="member-success-card" className="success-card">
                            <div className="check-icon">
                                <img src="/assets/Logo.PNG" alt="Solution Arena Ministry" className="heading-image" />
                            </div>

                            <div className="member-badge">MEMBER</div>

                            {memberData.photo ? (
                                <img
                                    src={memberData.photo}
                                    alt={memberData.name}
                                    className="member-photo"
                                    onError={(e) => (e.currentTarget.src = '/assets/Logo.PNG')}
                                />
                            ) : (
                                <div className="visitor-avatar">
                                    <span>{getInitials(memberData.name)}</span>
                                </div>
                            )}

                            <h2 id="successMemberName">{memberData.name}</h2>
                            <p className="member-email" id="successMemberEmail">{memberData.email}</p>

                            <div className="info-grid">
                                <div className="info-item">
                                    <div className="info-label">Phone</div>
                                    <div className="info-value" id="successMemberPhone">{memberData.phone}</div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Check-in Time</div>
                                    <div className="info-value" id="successCheckInTime">{memberData.checkInTime}</div>
                                </div>
                            </div>

                            <div className={`status-badge ${alreadyCheckedIn ? 'already' : ''}`}>
                                <CheckCircle size={18} />
                                <span>
                                    {alreadyCheckedIn ? 'Already Checked In' : 'Check-in Successful'}
                                </span>
                            </div>

                            <p style={{
                                marginTop: '20px',
                                color: alreadyCheckedIn ? '#f59e0b' : '#64748b',
                                fontSize: '14px'
                            }}>
                                {alreadyCheckedIn
                                    ? 'You were already checked in for this service.'
                                    : 'Show this screen to an usher'}
                            </p>

                            <button className="done-btn" onClick={resetToSelection}>
                                Done
                            </button>
                        </div>
                    )}

                    {/* ──────────────────────────────────────────────── */}
                    {/* Visitor Success – exact original structure      */}
                    {/* ──────────────────────────────────────────────── */}
                    {currentScreen === 'visitor-success' && visitorData && (
                        <div id="visitor-success-card" className="success-card">
                            <div className="check-icon">
                                <img src="/assets/Logo.PNG" alt="Solution Arena Ministry" className="heading-image" />
                            </div>

                            <div className="member-badge visitor-badge">VISITOR</div>

                            <div className="visitor-avatar">
                                <span>{getInitials(visitorData.name)}</span>
                            </div>

                            <h2 id="successVisitorName">{visitorData.name}</h2>
                            <p className="member-email" id="successVisitorEmail">
                                {visitorData.email || 'Welcome to Solution Arena Ministry!'}
                            </p>

                            <div className="info-grid">
                                <div className="info-item">
                                    <div className="info-label">Phone</div>
                                    <div className="info-value" id="successVisitorPhone">{visitorData.phone}</div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Check-in Time</div>
                                    <div className="info-value" id="successVisitorCheckInTime">{visitorData.checkInTime}</div>
                                </div>
                            </div>

                            <div className="status-badge">
                                <CheckCircle size={18} />
                                <span>Check-in Successful</span>
                            </div>

                            <p style={{ marginTop: '20px', color: '#64748b', fontSize: '14px' }}>
                                Show this screen to an usher
                            </p>

                            <button className="done-btn" onClick={resetToSelection}>
                                Done
                            </button>
                        </div>
                    )}

                    <div className="footer-text">
                        <span className="main-text">Solution Arena Ministry © 2026 | Attendance</span>
                        <span className="created-by">Created by <strong>Lawrence Egyin</strong></span>
                    </div>

                </div>
            </div>

            <div className="right">
                <div className="welcome-text">
                    <h2>Welcome to</h2>
                    <h1>Attendance Check-In</h1>
                </div>
            </div>
        </div>
    );
}