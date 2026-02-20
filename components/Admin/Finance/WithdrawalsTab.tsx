'use client';
import { useState, useEffect } from 'react';
import ReceiptModal from './ReceiptModal';
import EditModal from './EditModal';

interface Withdrawal {
    id: number;
    transaction_id: string;
    account_type: string;
    amount: number;
    recipient: string;
    purpose: string;
    authorized_by: string;
    date: string;
    notes?: string;
    created_at: string;
}

interface Summary {
    total_amount: number;
    total_count: number;
    offering_total: number;
    offering_count: number;
    tithe_total: number;
    tithe_count: number;
    project_welfare_total: number;
    project_welfare_count: number;
}

interface WithdrawalsData {
    withdrawals: Withdrawal[];
    summary: Summary;
}

export default function WithdrawalsTab() {
    const [data, setData] = useState<WithdrawalsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [accountFilter, setAccountFilter] = useState('all');
    const [purposeFilter, setPurposeFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');

    // Modal states
    const [selectedRecord, setSelectedRecord] = useState<Withdrawal | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        fetchWithdrawals();
    }, [dateRange, accountFilter, purposeFilter]);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/finance/withdrawals?range=${dateRange}&account_type=${accountFilter}&purpose=${purposeFilter}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: Withdrawal) => {
        setSelectedRecord(record);
        setIsEditOpen(true);
    };

    const handleViewDetails = (record: Withdrawal) => {
        setSelectedRecord(record);
        setIsReceiptOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this withdrawal record?')) return;

        try {
            const res = await fetch(`/api/finance/withdrawals?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                fetchWithdrawals();
            } else {
                alert('Error deleting record: ' + json.error);
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Failed to delete record.');
        }
    };

    const handleSaveEdit = async (updatedData: any) => {
        if (!selectedRecord) return;

        try {
            const res = await fetch(`/api/finance/withdrawals?id=${selectedRecord.transaction_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const json = await res.json();
            if (json.success) {
                fetchWithdrawals();
                setIsEditOpen(false);
            } else {
                throw new Error(json.error);
            }
        } catch (error) {
            console.error('Error saving withdrawal:', error);
            throw error;
        }
    };

    const formatCurrency = (amount: number) => {
        return `₵${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleExport = () => {
        if (!data || data.withdrawals.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ['Transaction ID', 'Date', 'Account', 'Recipient', 'Purpose', 'Amount', 'Authorized By'];
        const csvRows = [
            headers.join(','),
            ...data.withdrawals.map(w => [
                w.transaction_id,
                new Date(w.date).toLocaleDateString(),
                w.account_type,
                `"${w.recipient.replace(/"/g, '""')}"`,
                `"${w.purpose.replace(/"/g, '""')}"`,
                w.amount,
                `"${w.authorized_by.replace(/"/g, '""')}"`
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `withdrawals_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const filteredRecords = data?.withdrawals?.filter(record =>
        record.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const summary = data?.summary || {
        total_amount: 0,
        total_count: 0,
        offering_total: 0,
        offering_count: 0,
        tithe_total: 0,
        tithe_count: 0,
        project_welfare_total: 0,
        project_welfare_count: 0
    };

    return (
        <div className="qery_contentarea">
            <div className="zorp_container">
                <div className="yump_offhead">
                    <div>
                        <h2>Withdrawals Management</h2>
                        <p className="yump_offsub">Track all money withdrawn from church accounts for assistance and other purposes.</p>
                    </div>
                </div>

                {/* Withdrawal Summary Cards */}
                <div className="dorp_expsumgrid">
                    <div className="dorp_expsumcard dorp_cardredlight">
                        <div className="dorp_exphdr">
                            <div>
                                <div className="dorp_exptit" style={{ color: '#7f1d1d' }}>Total Withdrawals</div>
                                <div className="dorp_expsub" style={{ color: '#991b1b' }}>All Time</div>
                            </div>
                            <div className="dorp_expicon dorp_iconred">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                        </div>
                        <div className="dorp_expamt">{loading ? "₵0.00" : formatCurrency(summary.total_amount)}</div>
                        <div className="dorp_expchg neutral">{loading ? "0" : summary.total_count} transactions</div>
                    </div>

                    <div className="dorp_expsumcard dorp_cardorangelight">
                        <div className="dorp_exphdr">
                            <div>
                                <div className="dorp_exptit" style={{ color: '#7c2d12' }}>Offerings Account</div>
                                <div className="dorp_expsub" style={{ color: '#9a3412' }}>Withdrawn</div>
                            </div>
                            <div className="dorp_expicon dorp_iconorange">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#7c2d12" fontSize="14" fontWeight="bold">₵</text>
                                </svg>
                            </div>
                        </div>
                        <div className="dorp_expamt">{loading ? "₵0.00" : formatCurrency(summary.offering_total)}</div>
                        <div className="dorp_expchg neutral">{loading ? "0" : summary.offering_count} withdrawals</div>
                    </div>

                    <div className="dorp_expsumcard cardbluelight">
                        <div className="dorp_exphdr">
                            <div>
                                <div className="dorp_exptit" style={{ color: '#1e40af' }}>Tithes Account</div>
                                <div className="dorp_expsub" style={{ color: '#1e3a8a' }}>Withdrawn</div>
                            </div>
                            <div className="dorp_expicon iconbluealt">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#1e40af" fontSize="14" fontWeight="bold">₵</text>
                                </svg>
                            </div>
                        </div>
                        <div className="dorp_expamt">{loading ? "₵0.00" : formatCurrency(summary.tithe_total)}</div>
                        <div className="dorp_expchg neutral">{loading ? "0" : summary.tithe_count} withdrawals</div>
                    </div>

                    <div className="dorp_expsumcard cardpurplight">
                        <div className="dorp_exphdr">
                            <div>
                                <div className="dorp_exptit" style={{ color: '#5b21b6' }}>Project & Welfare</div>
                                <div className="dorp_expsub" style={{ color: '#4c1d95' }}>Combined Withdrawn</div>
                            </div>
                            <div className="dorp_expicon iconpurplealt">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#5b21b6" fontSize="14" fontWeight="bold">₵</text>
                                </svg>
                            </div>
                        </div>
                        <div className="dorp_expamt expcat">{loading ? "₵0.00" : formatCurrency(summary.project_welfare_total)}</div>
                        <div className="dorp_expchg neutral">{loading ? "0" : summary.project_welfare_count} withdrawals</div>
                    </div>
                </div>

                {/* Withdrawal Filters */}
                <div className="dorp_expfilt">
                    <div className="dorp_filtgrp">
                        <label className="yump_filtlab">Account:</label>
                        <select className="dorp_filtinp" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
                            <option value="all">All Accounts</option>
                            <option value="offering">Offerings</option>
                            <option value="tithe">Tithes (CPS)</option>
                            <option value="projectoffering">Project Offerings</option>
                            <option value="welfare">Welfare</option>
                        </select>
                    </div>
                    <div className="dorp_filtgrp">
                        <label className="yump_filtlab">Purpose:</label>
                        <select className="dorp_filtinp" value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)}>
                            <option value="all">All Purposes</option>
                            <option value="medical">Medical Assistance</option>
                            <option value="funeral">Funeral Support</option>
                            <option value="education">Education Support</option>
                            <option value="emergency">Emergency Assistance</option>
                            <option value="project">Project Expense</option>
                            <option value="ministry">Ministry Work</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="dorp_filtgrp">
                        <label className="yump_filtlab">Date Range:</label>
                        <select className="dorp_filtinp" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                            <option value="all">All Time</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                </div>

                {/* Withdrawals Table */}
                <div className="eorp_exparea">
                    <div className="eorp_exphead">
                        <div>
                            <h3>Withdrawal Transactions</h3>
                            <p className="eorp_expsub">View and manage all withdrawal records</p>
                        </div>
                        <div className="eorp_expacts">
                            <button className="borp_actbtn" onClick={handleExport}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Export
                            </button>
                            <button className="borp_actbtn" onClick={() => window.print()}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                                Print
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="corp_searchcont" style={{ marginBottom: '20px' }}>
                        <svg className="corp_searchic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input
                            type="text"
                            className="corp_searchinp"
                            placeholder="Search by recipient, purpose, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="eorp_exptablewrap">
                        <table className="eorp_exptable">
                            <thead>
                                <tr>
                                    <th>TRANSACTION ID</th>
                                    <th>DATE</th>
                                    <th>ACCOUNT</th>
                                    <th>RECIPIENT</th>
                                    <th>PURPOSE</th>
                                    <th>AMOUNT</th>
                                    <th>AUTHORIZED BY</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                            Loading Withdrawals...
                                        </td>
                                    </tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>No withdrawals found</p>
                                            <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>Withdrawal records will appear here</p>
                                        </td>
                                    </tr>
                                ) : filteredRecords.map((record) => (
                                    <tr key={record.transaction_id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{record.transaction_id}</td>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`borp_paymeth forp_cat${(record.account_type || '').toLowerCase().substring(0, 4)}`}>
                                                {record.account_type}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{record.recipient}</td>
                                        <td>{record.purpose}</td>
                                        <td style={{ color: '#EF4444', fontWeight: 600 }}>-{formatCurrency(record.amount)}</td>
                                        <td style={{ fontWeight: 500 }}>{record.authorized_by}</td>
                                        <td>
                                            <div className="gorp_actbtns">
                                                <button className="borp_acticon" title="View Voucher" onClick={() => handleViewDetails(record)}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                </button>
                                                <button className="borp_acticon" title="Edit" onClick={() => handleEdit(record)}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button className="borp_acticon gorp_delbtn" title="Delete" onClick={() => handleDelete(record.transaction_id)}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ReceiptModal
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                record={selectedRecord}
                type="withdrawal"
            />
            <EditModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={handleSaveEdit}
                record={selectedRecord}
                type="withdrawal"
            />
        </div>
    );
}
