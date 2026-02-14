'use client';
import { useState, useEffect } from 'react';

interface WelfareRecord {
    transaction_id: string;
    date: string;
    amount: number;
    payment_method: string;
    notes: string;
    member_name: string;
    member_email: string;
    member_photo: string;
}

interface WelfareData {
    welfare: WelfareRecord[];
    summary: {
        total_amount: number;
        gross_amount: number;
        total_withdrawals: number;
        total_count: number;
        unique_members: number;
        avg_amount: number;
    };
}

import ReceiptModal from './ReceiptModal';
import EditModal from './EditModal';

export default function WelfareTab() {
    const [data, setData] = useState<WelfareData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('all');

    // Modal states
    const [selectedRecord, setSelectedRecord] = useState<WelfareRecord | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        fetchWelfare();
    }, [dateRange]);

    const fetchWelfare = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/finance/welfare?range=${dateRange}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error('Error fetching welfare:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: WelfareRecord) => {
        setSelectedRecord(record);
        setIsEditOpen(true);
    };

    const handleViewReceipt = (record: WelfareRecord) => {
        setSelectedRecord(record);
        setIsReceiptOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this welfare record?')) return;

        try {
            const res = await fetch(`/api/finance/welfare?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                fetchWelfare();
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
            const res = await fetch(`/api/finance/welfare?id=${selectedRecord.transaction_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const json = await res.json();
            if (json.success) {
                fetchWelfare();
            } else {
                throw new Error(json.error);
            }
        } catch (error) {
            console.error('Error saving welfare:', error);
            throw error;
        }
    };

    const formatCurrency = (amount: number) => {
        return `₵${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const filteredRecords = data?.welfare?.filter(record =>
        record.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.amount.toString().includes(searchTerm)
    ) || [];

    // Helper to get initials
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <section className="yump_offarea active">
            <div className="zorp_container">
                <div className="yump_offhead">
                    <div>
                        <h2>Welfare Tracking</h2>
                        <p className="yump_offsub">Welfare dues and contributions from members for mutual support systems.</p>
                    </div>
                    <div className="yump_offfilt">
                        <label htmlFor="welfareDateRange" className="yump_filtlab">Filter by Date:</label>
                        <select
                            id="welfareDateRange"
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
                    {/* Members Contributing */}
                    <div className="yump_offcard cardbluelight">
                        <div className="yump_offheader">
                            <span className="yump_offtitle">Members Contributing</span>
                            <div className="yump_officon iconbluealt">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <div className="yump_offamt">{loading ? "0" : (data?.summary?.unique_members || 0)}</div>
                    </div>

                    {/* This Month / Selected Range */}
                    <div className="yump_offcard cardpurplight">
                        <div className="yump_offheader">
                            <span className="yump_offtitle">{dateRange === 'month' ? 'This Month' : 'Total Amount'}</span>
                            <div className="yump_officon iconpurplealt">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 7L19 13M19 13L13 19M19 13H5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <div className="yump_offamt">{loading ? "₵0.00" : formatCurrency(data?.summary?.total_amount || 0)}</div>
                    </div>

                    {/* Average per Member */}
                    <div className="yump_offcard cardgreenlight">
                        <div className="yump_offheader">
                            <span className="yump_offtitle">Average per Member</span>
                            <div className="yump_officon icongreenalt">₵</div>
                        </div>
                        <div className="yump_offamt">{loading ? "₵0.00" : formatCurrency(data?.summary?.avg_amount || 0)}</div>
                    </div>
                </div>

                {/* Welfare List */}
                <div className="borp_cpsarea">
                    <div className="borp_cpshead">
                        <div>
                            <h3>Welfare Dues Records</h3>
                            <p className="borp_cpssub">List of members who contributed to welfare in the selected period</p>
                        </div>
                        <div className="borp_cpsacts">
                            <button className="borp_actbtn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 11 12 14 22 4"></polyline>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                </svg>
                                Select All
                            </button>
                            <button className="borp_actbtn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Clear Selection
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
                            className="corp_searchinp"
                            placeholder="Search by name, amount, payment method..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="borp_cpstablewrap">
                        <table className="borp_cpstable">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" /></th>
                                    <th>Member</th>
                                    <th>Amount Paid</th>
                                    <th>Payment Date</th>
                                    <th>Payment Method</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="welfareList">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            Loading Welfare Dues...
                                        </td>
                                    </tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No welfare records found for this period.
                                        </td>
                                    </tr>
                                ) : filteredRecords.map((record) => (
                                    <tr className="borp_cpsrow" key={record.transaction_id}>
                                        <td><input type="checkbox" /></td>
                                        <td>
                                            <div className="borp_meminfo">
                                                <div className="borp_memavatar" style={{ backgroundColor: '#DB2777' }}>
                                                    {record.member_photo ? (
                                                        <img src={record.member_photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : getInitials(record.member_name)}
                                                </div>
                                                <div>
                                                    <div className="borp_memname">{record.member_name}</div>
                                                    <div className="borp_mememail">{record.member_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="borp_amtcell" style={{ color: '#DB2777' }}>{formatCurrency(record.amount)}</td>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td><span className="borp_paymeth" style={{ background: '#FCE7F3', color: '#DB2777' }}>{record.payment_method}</span></td>
                                        <td><span className="borp_statbadge" style={{ background: '#FCE7F3', color: '#DB2777' }}>Contributed</span></td>
                                        <td>
                                            <div className="gorp_actbtns">
                                                <button className="borp_acticon" title="View Receipt" onClick={() => handleViewReceipt(record)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                </button>
                                                <button className="borp_acticon" title="Edit" onClick={() => handleEdit(record)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button className="borp_acticon gorp_delbtn" title="Delete" onClick={() => handleDelete(record.transaction_id)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                type="welfare"
            />
            <EditModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={handleSaveEdit}
                record={selectedRecord}
                type="welfare"
            />
        </section>
    );
}
