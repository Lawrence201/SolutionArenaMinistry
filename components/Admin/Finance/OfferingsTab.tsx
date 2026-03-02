'use client';
import { useState, useEffect } from 'react';

interface Offering {
    id: string;
    transaction_id: string;
    date: string;
    service_type: string;
    service_time: string;
    amount_collected: number;
    collection_method: string;
    counted_by: string;
    status: string;
    notes?: string;
}

interface OfferingsData {
    total_today: number;
    total_week: number;
    total_month: number;
    special_offerings: number;
    offerings: Offering[];
    today_count: number;
    week_growth: string;
    month_avg: number;
    special_description: string;
}

interface OfferingsTabProps {
    refreshStats?: () => void;
}

export default function OfferingsTab({ refreshStats }: OfferingsTabProps) {
    const [data, setData] = useState<OfferingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('all');

    // Modals state
    const [viewOffering, setViewOffering] = useState<Offering | null>(null);
    const [editOffering, setEditOffering] = useState<Offering | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchOfferings();
    }, [dateRange]);

    const fetchOfferings = async () => {
        try {
            const res = await fetch(`/api/finance/offerings?range=${dateRange}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error('Error fetching offerings:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatServiceTime = (timeStr?: string) => {
        if (!timeStr) return 'N/A';
        try {
            return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timeStr;
        }
    };

    const extractTimeForInput = (timeStr?: string) => {
        if (!timeStr) return '';
        try {
            const date = new Date(timeStr);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch {
            return '';
        }
    };

    const handleDeleteOffering = async (id: string) => {
        if (!confirm(`Are you sure you want to delete offering record ${id}?\n\nThis action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/finance/offerings?id=${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                alert('Offering record deleted successfully!');
                fetchOfferings(); // Refresh tab data
                if (refreshStats) refreshStats(); // Refresh parent stats
            } else {
                alert(`Error deleting offering: ${result.message}`);
            }
        } catch (error) {
            console.error('Error deleting offering:', error);
            alert('Failed to delete offering. Please try again.');
        }
    };

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editOffering) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/finance/offerings?id=${editOffering.transaction_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editOffering)
            });
            const result = await res.json();
            if (result.success) {
                alert('Offering updated successfully!');
                setEditOffering(null);
                fetchOfferings(); // Refresh tab data
                if (refreshStats) refreshStats(); // Refresh parent stats
            } else {
                alert(`Error updating offering: ${result.message}`);
            }
        } catch (error) {
            console.error('Error updating offering:', error);
            alert('Failed to update offering. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredOfferings = data?.offerings?.filter((off) => {
        const searchStr = `${off.service_type} ${off.collection_method} ${off.amount_collected} ${off.date} ${off.status}`.toLowerCase();
        return searchStr.includes(searchTerm.toLowerCase());
    }) || [];

    if (loading) {
        return <div className="qery_contentarea">Loading Offerings...</div>;
    }

    return (
        <div className="qery_contentarea">
            <section className="yump_offarea active">
                <div className="zorp_container">
                    <div className="yump_offhead">
                        <div>
                            <h2>Offerings Management</h2>
                            <p className="yump_offsub">Track general offerings from members and visitors. All offerings are recorded as totals.</p>
                        </div>
                        <div className="yump_offfilt">
                            <label htmlFor="offeringsDateRange" className="yump_filtlab">Filter by Date:</label>
                            <select
                                id="offeringsDateRange"
                                className="yump_datesel"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                    </div>

                    <div className="yump_offgrid">
                        {/* Today's Offerings */}
                        <div className="yump_offcard cardbluelight">
                            <div className="yump_offheader">
                                <span className="yump_offtitle">Today's Offerings</span>
                                <div className="yump_officon iconbluealt">₵</div>
                            </div>
                            <div className="yump_offamt" id="offeringsTodayAmount">
                                {formatCurrency(data?.total_today || 0)}
                            </div>
                            <div className="yump_offmeta" id="offeringsTodayMeta">
                                {data?.today_count || 0} services recorded
                            </div>
                        </div>

                        {/* This Week */}
                        <div className="yump_offcard cardpurplight">
                            <div className="yump_offheader">
                                <span className="yump_offtitle">This Week</span>
                                <div className="yump_officon iconpurplealt">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 7L19 13M19 13L13 19M19 13H5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="yump_offamt" id="offeringsWeekAmount">
                                {formatCurrency(data?.total_week || 0)}
                            </div>
                            <div className="yump_offmeta" id="offeringsWeekMeta">
                                {data?.week_growth || '↑ 0.0% from last week'}
                            </div>
                        </div>

                        {/* This Month */}
                        <div className="yump_offcard cardgreenlight">
                            <div className="yump_offheader">
                                <span className="yump_offtitle">This Month</span>
                                <div className="yump_officon icongreenalt">₵</div>
                            </div>
                            <div className="yump_offamt" id="offeringsMonthAmount">
                                {formatCurrency(data?.total_month || 0)}
                            </div>
                            <div className="yump_offmeta" id="offeringsMonthMeta">
                                Average: {formatCurrency(data?.month_avg || 0)}/service
                            </div>
                        </div>

                        {/* Special Offerings */}
                        <div className="yump_offcard cardyellowlight">
                            <div className="yump_offheader">
                                <span className="yump_offtitle">Special Offerings</span>
                                <div className="yump_officon iconyellowalt">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="yump_offamt" id="offeringsSpecialAmount">
                                {formatCurrency(data?.special_offerings || 0)}
                            </div>
                            <div className="yump_offmeta" id="offeringsSpecialMeta">
                                {data?.special_description || 'Various projects'}
                            </div>
                        </div>
                    </div>

                    {/* Offerings Records Table */}
                    <div className="eorp_exparea" style={{ marginTop: '40px' }}>
                        <div className="eorp_exphead">
                            <div>
                                <h3>Offering Records</h3>
                                <p className="eorp_expsub">Detailed breakdown of all offering collections</p>
                            </div>
                            <div className="eorp_expacts">
                                <button className="borp_actbtn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    Add Record
                                </button>
                                <button className="borp_actbtn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="corp_searchcont">
                            <svg className="corp_searchic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input
                                type="text"
                                id="offeringsSearchInput"
                                className="corp_searchinp"
                                placeholder="Search by date, service type, amount..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="eorp_exptablewrap">
                            <table className="eorp_exptable">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Service Type</th>
                                        <th>Time</th>
                                        <th>Amount Collected</th>
                                        <th>Collection Method</th>
                                        <th>Counted By</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="offeringsList">
                                    {filteredOfferings.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                                No offering records found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOfferings.map((off) => (
                                            <tr key={off.transaction_id} className="eorp_exprow">
                                                <td>{new Date(off.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</td>
                                                <td>
                                                    <div className="eorp_expdesc">
                                                        <div className="eorp_exptit">{off.service_type?.replace(/_/g, ' ') || 'N/A'}</div>
                                                        {off.notes && <div className="eorp_expnote">{off.notes}</div>}
                                                    </div>
                                                </td>
                                                <td>{formatServiceTime(off.service_time)}</td>
                                                <td className="wump_amtpos">{formatCurrency(off.amount_collected || 0)}</td>
                                                <td><span className="borp_paymeth">{off.collection_method?.replace(/_/g, ' ') || 'N/A'}</span></td>
                                                <td>{off.counted_by || 'N/A'}</td>
                                                <td><span className={`borp_statbadge ${['Verified', 'Approved'].includes(off.status) ? 'borp_statpaid' : ''}`}>{off.status}</span></td>
                                                <td>
                                                    <div className="gorp_actbtns">
                                                        <button className="borp_acticon" title="View Details" onClick={() => setViewOffering(off)}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                                <circle cx="12" cy="12" r="3"></circle>
                                                            </svg>
                                                        </button>
                                                        <button className="borp_acticon" title="Edit" onClick={() => setEditOffering({ ...off, date: new Date(off.date).toISOString().split('T')[0] })}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                            </svg>
                                                        </button>
                                                        <button className="borp_acticon gorp_delbtn" title="Delete" onClick={() => handleDeleteOffering(off.transaction_id)}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* View Modal */}
            {viewOffering && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: 'white', borderRadius: '12px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '20px' }}>
                        <h2 style={{ marginTop: 0, color: '#1e293b', borderBottom: '2px solid #5B4FDE', paddingBottom: '10px' }}>Offering Details</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                            <div>
                                <p style={{ margin: '10px 0' }}><strong>Transaction ID:</strong> {viewOffering.transaction_id}</p>
                                <p style={{ margin: '10px 0' }}><strong>Date:</strong> {new Date(viewOffering.date).toLocaleDateString()}</p>
                                <p style={{ margin: '10px 0' }}><strong>Service Type:</strong> {viewOffering.service_type?.replace(/_/g, ' ')}</p>
                                <p style={{ margin: '10px 0' }}><strong>Service Time:</strong> {formatServiceTime(viewOffering.service_time)}</p>
                            </div>
                            <div>
                                <p style={{ margin: '10px 0' }}><strong>Amount Collected:</strong> <span style={{ color: '#10b981', fontSize: '1.2em' }}>{formatCurrency(viewOffering.amount_collected || 0)}</span></p>
                                <p style={{ margin: '10px 0' }}><strong>Collection Method:</strong> {viewOffering.collection_method?.replace(/_/g, ' ')}</p>
                                <p style={{ margin: '10px 0' }}><strong>Counted By:</strong> {viewOffering.counted_by || 'N/A'}</p>
                                <p style={{ margin: '10px 0' }}><strong>Status:</strong> <span style={{ background: ['Verified', 'Approved'].includes(viewOffering.status) ? '#10b981' : '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.875em' }}>{viewOffering.status}</span></p>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                            <p style={{ margin: '5px 0' }}><strong>Notes:</strong></p>
                            <p style={{ margin: '10px 0', color: '#64748b' }}>{viewOffering.notes || 'No notes recorded'}</p>
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button onClick={() => setViewOffering(null)} style={{ padding: '10px 24px', background: '#5B4FDE', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editOffering && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, overflowY: 'auto' }}>
                    <div style={{ background: 'white', borderRadius: '12px', maxWidth: '700px', width: '90%', margin: '20px auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '30px' }}>
                        <h2 style={{ marginTop: 0, color: '#1e293b', borderBottom: '2px solid #5B4FDE', paddingBottom: '10px' }}>Edit Offering Record</h2>

                        <form onSubmit={handleEditSubmit} style={{ marginTop: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>Date <span style={{ color: 'red' }}>*</span></label>
                                    <input type="date" required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                        value={editOffering.date.split('T')[0]}
                                        onChange={(e) => setEditOffering({ ...editOffering, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>Service Time</label>
                                    <input type="time" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                        value={extractTimeForInput(editOffering.service_time)}
                                        onChange={(e) => setEditOffering({ ...editOffering, service_time: `1970-01-01T${e.target.value}:00.000Z` })}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>Service Type <span style={{ color: 'red' }}>*</span></label>
                                <select required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                    value={editOffering.service_type}
                                    onChange={(e) => setEditOffering({ ...editOffering, service_type: e.target.value })}
                                >
                                    <option value="Sunday_Worship">Sunday Worship</option>
                                    <option value="Mid_week_Service">Mid-week Service</option>
                                    <option value="Special_Service">Special Service</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>Amount Collected (₵) <span style={{ color: 'red' }}>*</span></label>
                                    <input type="number" step="0.01" required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                        value={editOffering.amount_collected}
                                        onChange={(e) => setEditOffering({ ...editOffering, amount_collected: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>Collection Method <span style={{ color: 'red' }}>*</span></label>
                                    <select required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                        value={editOffering.collection_method}
                                        onChange={(e) => setEditOffering({ ...editOffering, collection_method: e.target.value })}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Mobile_Money">Mobile Money</option>
                                        <option value="Bank_Transfer">Bank Transfer</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>Counted By</label>
                                    <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                        value={editOffering.counted_by || ''}
                                        onChange={(e) => setEditOffering({ ...editOffering, counted_by: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>Status <span style={{ color: 'red' }}>*</span></label>
                                    <select required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                                        value={editOffering.status}
                                        onChange={(e) => setEditOffering({ ...editOffering, status: e.target.value })}
                                    >
                                        <option value="Approved">Verified / Approved</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>Notes</label>
                                <textarea rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
                                    value={editOffering.notes || ''}
                                    onChange={(e) => setEditOffering({ ...editOffering, notes: e.target.value })}
                                />
                            </div>

                            <div style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setEditOffering(null)} style={{ padding: '10px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" disabled={isSaving} style={{ padding: '10px 24px', background: '#5B4FDE', color: 'white', border: 'none', borderRadius: '8px', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 500 }}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
