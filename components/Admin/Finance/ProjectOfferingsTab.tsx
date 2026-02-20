'use client';
import { useState, useEffect } from 'react';

interface Record {
    id: string;
    transaction_id: string;
    date: string;
    project_name: string;
    service_type: string;
    service_time: string;
    amount: number;
    method: string;
    collected_by: string;
    status: string;
    notes?: string;
}

interface ProjectOfferingsData {
    total_today: number;
    today_count: number;
    total_week: number;
    week_growth: string;
    total_month: number;
    month_avg: number;
    active_projects: number;
    records: Record[];
}

export default function ProjectOfferingsTab() {
    const [data, setData] = useState<ProjectOfferingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('all');

    useEffect(() => {
        fetchProjectOfferings();
    }, [dateRange]);

    const fetchProjectOfferings = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/finance/project-offerings?range=${dateRange}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error('Error fetching project offerings:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const filteredRecords = data?.records?.filter(record =>
        record.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.date?.includes(searchTerm) ||
        record.collected_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="qery_contentarea">
            <section className="yump_offarea active">
                <div className="zorp_container">
                    <div className="yump_offhead">
                        <div>
                            <h2>Project Offering Management</h2>
                            <p className="yump_offsub">Track project offerings from members and visitors. All project offerings are recorded as totals for specific church projects.</p>
                        </div>
                        <div className="yump_offfilt">
                            <label htmlFor="projectOfferingDateRange" className="yump_filtlab">Filter by Date:</label>
                            <select
                                id="projectOfferingDateRange"
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
                        {/* Today's Project Offerings */}
                        <div className="yump_offcard cardbluelight">
                            <div className="yump_offheader">
                                <span className="yump_offtitle">Today's Project Offerings</span>
                                <div className="yump_officon iconbluealt">
                                    ₵
                                </div>
                            </div>
                            <div className="yump_offamt">{loading ? '₵0' : formatCurrency(data?.total_today || 0)}</div>
                            <div className="yump_offmeta">{loading ? '0' : data?.today_count || 0} projects recorded</div>
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
                            <div className="yump_offamt">{loading ? '₵0' : formatCurrency(data?.total_week || 0)}</div>
                            <div className="yump_offmeta">{data?.week_growth || '↑ 0.0% from last week'}</div>
                        </div>

                        {/* This Month */}
                        <div className="yump_offcard cardgreenlight">
                            <div className="yump_offheader">
                                <span className="yump_offtitle">This Month</span>
                                <div className="yump_officon icongreenalt">
                                    ₵
                                </div>
                            </div>
                            <div className="yump_offamt">{loading ? '₵0' : formatCurrency(data?.total_month || 0)}</div>
                            <div className="yump_offmeta">Average: {formatCurrency(data?.month_avg || 0)} /project</div>
                        </div>

                        {/* Active Projects */}
                        <div className="yump_offcard cardyellowlight">
                            <div className="yump_offheader">
                                <span className="yump_offtitle">Active Projects</span>
                                <div className="yump_officon iconyellowalt">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="yump_offamt">{loading ? '0' : data?.active_projects || 0}</div>
                            <div className="yump_offmeta">Building fund, Mission, etc.</div>
                        </div>
                    </div>

                    {/* Project Offering Records Table */}
                    <div className="eorp_exparea" style={{ marginTop: '40px' }}>
                        <div className="eorp_exphead">
                            <div>
                                <h3>Project Offering Records</h3>
                                <p className="eorp_expsub">Detailed breakdown of all project offering collections</p>
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
                                        <th>Project Details</th>
                                        <th>Time</th>
                                        <th>Amount Collected</th>
                                        <th>Collection Method</th>
                                        <th>Counted By</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading records...</td>
                                        </tr>
                                    ) : filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>No records found</td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map(record => (
                                            <tr key={record.transaction_id} className="eorp_exprow">
                                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="eorp_expdesc">
                                                        <div className="eorp_exptit">{record.service_type}</div>
                                                        <div className="eorp_expnote">{record.project_name}</div>
                                                    </div>
                                                </td>
                                                <td>{record.service_time}</td>
                                                <td className="wump_amtpos">{formatCurrency(record.amount)}</td>
                                                <td><span className="borp_paymeth">{record.method}</span></td>
                                                <td>{record.collected_by}</td>
                                                <td>
                                                    <span className={`borp_statbadge ${record.status === 'Verified' ? 'borp_statpaid' : 'borp_statpending'}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="gorp_actbtns">
                                                        <button className="borp_acticon" title="View Details">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                                <circle cx="12" cy="12" r="3"></circle>
                                                            </svg>
                                                        </button>
                                                        <button className="borp_acticon" title="Edit">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                            </svg>
                                                        </button>
                                                        <button className="borp_acticon gorp_delbtn" title="Delete">
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
        </div>
    );
}
