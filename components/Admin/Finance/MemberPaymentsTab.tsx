'use client';
import { useState, useEffect, useRef } from 'react';

interface Member {
    id: number;
    id_number: string | null;
    full_name: string;
    email: string | null;
    phone: string | null;
    photo_path: string | null;
}

interface PaymentHistory {
    member_info: {
        id: number;
        full_name: string;
        email: string | null;
        phone: string | null;
        photo_path: string | null;
    };
    tithes: any[];
    welfare: any[];
    summary: {
        total_tithes: number;
        tithe_count: number;
        total_welfare: number;
        welfare_count: number;
        grand_total: number;
        total_transactions: number;
    };
}

export default function MemberPaymentsTab() {
    // State
    const [allMembers, setAllMembers] = useState<Member[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeTab, setActiveTab] = useState<'tithe' | 'welfare'>('tithe');

    const [history, setHistory] = useState<PaymentHistory | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Load members for autocomplete on mount
    useEffect(() => {
        fetchMembers();

        // Click outside listener for suggestions
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/finance/member-payments?action=get_members');
            const json = await res.json();
            if (json.success) {
                setAllMembers(json.data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        if (query.trim().length > 0) {
            const filtered = allMembers.filter(m =>
                m.full_name.toLowerCase().includes(query.toLowerCase()) ||
                (m.email && m.email.toLowerCase().includes(query.toLowerCase())) ||
                (m.phone && m.phone.includes(query))
            );
            setFilteredMembers(filtered.slice(0, 10));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectMember = (member: Member) => {
        setSearchQuery(member.full_name);
        setSelectedMember(member);
        setShowSuggestions(false);
    };

    const setDateRange = (range: string) => {
        const today = new Date();
        let start = '';
        let end = today.toISOString().split('T')[0];

        switch (range) {
            case 'today':
                start = end;
                break;
            case 'week':
                const lastWeek = new Date();
                lastWeek.setDate(today.getDate() - 7);
                start = lastWeek.toISOString().split('T')[0];
                break;
            case 'month':
                start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                break;
            case 'year':
                start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                break;
            case 'all':
                start = '';
                end = '';
                break;
        }

        setStartDate(start);
        setEndDate(end);
    };

    const fetchHistory = async () => {
        if (!selectedMember) {
            alert('Please search and select a member first');
            return;
        }

        setLoading(true);
        try {
            let url = `/api/finance/member-payments?action=get_payment_history&member_id=${selectedMember.id}`;
            if (startDate) url += `&start_date=${startDate}`;
            if (endDate) url += `&end_date=${endDate}`;

            const res = await fetch(url);
            const json = await res.json();
            if (json.success) {
                setHistory(json.data);
            } else {
                alert(json.error || 'Failed to load history');
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            alert('Failed to load history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        setHistory(null);
        setSelectedMember(null);
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
    };

    const formatCurrency = (amount: number) => {
        return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="zump_contwrap active" style={{ display: 'block' }}>
            <div className="yump_offarea active">
                <div className="zorp_container">
                    {/* Header */}
                    <div className="yump_offhead">
                        <div>
                            <h2>Member Payment History</h2>
                            <p className="yump_offsub">View detailed payment records for individual members including tithes and welfare contributions</p>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="member-payment-filters" style={{ background: '#f9fafb', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                            {/* Member Search */}
                            <div style={{ position: 'relative' }}>
                                <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '8px', fontSize: '14px' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}>
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    Search Member by Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Type member name to search..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onFocus={() => searchQuery.trim().length !== 0 && setShowSuggestions(true)}
                                        style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: 'white' }}
                                    />
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#9ca3af"
                                        strokeWidth="2"
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                                    >
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.3-4.3"></path>
                                    </svg>
                                </div>

                                {/* Autocomplete Suggestions */}
                                {showSuggestions && (
                                    <div ref={suggestionsRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', marginTop: '4px', maxHeight: '300px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000 }}>
                                        {filteredMembers.length > 0 ? (
                                            filteredMembers.map(member => (
                                                <div
                                                    key={member.id}
                                                    onClick={() => handleSelectMember(member)}
                                                    style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.2s' }}
                                                    className="suggestion-item"
                                                >
                                                    {member.photo_path ? (
                                                        <img src={`../Add_Members/${member.photo_path}`} alt={member.full_name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '36px', height: '36px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '13px' }}>
                                                            {getInitials(member.full_name)}
                                                        </div>
                                                    )}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{member.full_name}</div>
                                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{member.email || member.phone || 'No contact info'}</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No members found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            <div>
                                <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '8px', fontSize: '14px' }}>From Date</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '8px', fontSize: '14px' }}>To Date</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                            </div>

                            {/* Search Button */}
                            <div>
                                <button
                                    onClick={fetchHistory}
                                    disabled={loading}
                                    style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', opacity: loading ? 0.7 : 1 }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.3-4.3"></path>
                                    </svg>
                                    {loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div style={{ marginTop: '16px', display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: '13px', color: '#6b7280', alignSelf: 'center', marginRight: '8px' }}>Quick Filters:</span>
                            {['Today', 'This Week', 'This Month', 'This Year', 'All Time'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setDateRange(filter.toLowerCase().replace(' ', ''))}
                                    style={{ padding: '6px 12px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Area */}
                    {!history && !loading ? (
                        /* Empty State */
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '12px' }}>
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                            <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '18px' }}>Select a Member to View History</h3>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Choose a member from the dropdown above and click Search to view their payment records</p>
                        </div>
                    ) : history ? (
                        <>
                            {/* Member Info Card */}
                            <div style={{ background: '#1e40af', color: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', position: 'relative' }}>
                                <button
                                    onClick={clearHistory}
                                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', overflow: 'hidden' }}>
                                            {history.member_info.photo_path ? (
                                                <img src={`../Add_Members/${history.member_info.photo_path}`} alt={history.member_info.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '24px', fontWeight: 600 }}>{getInitials(history.member_info.full_name)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{history.member_info.full_name}</h3>
                                            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>{history.member_info.email || 'No email'}</p>
                                            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>{history.member_info.phone || 'No phone'}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', marginRight: '40px' }}>
                                        <p style={{ margin: 0, opacity: 0.8, fontSize: '13px' }}>Date Range</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 500 }}>
                                            {startDate && endDate ? `${startDate} - ${endDate}` : startDate ? `From ${startDate}` : endDate ? `Until ${endDate}` : 'All Time'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>Total Tithes</span>
                                        <div style={{ width: '36px', height: '36px', background: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                                <path d="M13 7L19 13M19 13H5M19 13L13 19"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(history.summary.total_tithes)}</div>
                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{history.summary.tithe_count} transactions</div>
                                </div>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>Total Welfare</span>
                                        <div style={{ width: '36px', height: '36px', background: '#fce7f3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e879f9" strokeWidth="2">
                                                <circle cx="12" cy="12" r="9"></circle>
                                                <polyline points="12 7 12 12 15 15"></polyline>
                                            </svg>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#e879f9' }}>{formatCurrency(history.summary.total_welfare)}</div>
                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{history.summary.welfare_count} transactions</div>
                                </div>
                                <div style={{ background: '#1e40af', padding: '20px', borderRadius: '12px', color: 'white' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 500, opacity: 0.9 }}>Grand Total</span>
                                        <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{formatCurrency(history.summary.grand_total)}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.9 }}>{history.summary.total_transactions} total transactions</div>
                                </div>
                            </div>

                            {/* Tabs & Tables */}
                            <div style={{ marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setActiveTab('tithe')}
                                        style={{ padding: '12px 24px', background: activeTab === 'tithe' ? '#2563eb' : '#f3f4f6', color: activeTab === 'tithe' ? 'white' : '#6b7280', border: 'none', borderBottom: activeTab === 'tithe' ? '3px solid #1e40af' : 'none', fontWeight: 600, cursor: 'pointer', fontSize: '14px', borderRadius: '8px 8px 0 0' }}
                                    >
                                        Tithe Payments
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('welfare')}
                                        style={{ padding: '12px 24px', background: activeTab === 'welfare' ? '#2563eb' : '#f3f4f6', color: activeTab === 'welfare' ? 'white' : '#6b7280', border: 'none', borderBottom: activeTab === 'welfare' ? '3px solid #1e40af' : 'none', fontWeight: 600, cursor: 'pointer', fontSize: '14px', borderRadius: '8px 8px 0 0' }}
                                    >
                                        Welfare Contributions
                                    </button>
                                </div>
                            </div>

                            {/* Tithe Table */}
                            {activeTab === 'tithe' && (
                                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Tithe Payments</h3>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>Individual tithe contribution records</p>
                                    </div>
                                    <div className="eorp_exptablewrap">
                                        <table className="eorp_exptable">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '50px' }}>#</th>
                                                    <th>Date</th>
                                                    <th>Amount</th>
                                                    <th>Method</th>
                                                    <th>Reference</th>
                                                    <th>Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.tithes.length > 0 ? history.tithes.map((item, index) => (
                                                    <tr key={item.transaction_id}>
                                                        <td>{index + 1}</td>
                                                        <td>{formatDate(item.date)}</td>
                                                        <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                                                        <td>{item.payment_method || 'Cash'}</td>
                                                        <td style={{ fontFamily: 'monospace', color: '#6b7280' }}>{item.receipt_number || 'N/A'}</td>
                                                        <td>{item.notes || '-'}</td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No tithe records found for this period</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Welfare Table */}
                            {activeTab === 'welfare' && (
                                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Welfare Contributions</h3>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>Individual welfare contribution records</p>
                                    </div>
                                    <div className="eorp_exptablewrap">
                                        <table className="eorp_exptable">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '50px' }}>#</th>
                                                    <th>Date</th>
                                                    <th>Amount</th>
                                                    <th>Method</th>
                                                    <th>Reference</th>
                                                    <th>Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.welfare.length > 0 ? history.welfare.map((item, index) => (
                                                    <tr key={item.welfare_id}>
                                                        <td>{index + 1}</td>
                                                        <td>{formatDate(item.date)}</td>
                                                        <td style={{ color: '#e879f9', fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                                                        <td>{item.payment_method || 'Cash'}</td>
                                                        <td style={{ fontFamily: 'monospace', color: '#6b7280' }}>{item.reference_number || 'N/A'}</td>
                                                        <td>{item.notes || '-'}</td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No welfare records found for this period</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Loading State */
                        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                            Loading payment history...
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .suggestion-item:hover {
                    background: #f9fafb;
                }
                .suggestion-item:last-child {
                    border-bottom: none;
                }
            `}</style>
        </div>
    );
}
