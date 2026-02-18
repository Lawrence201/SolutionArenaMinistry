'use client';

import { useState, useEffect } from 'react';
import LineChart from './charts/LineChart';

export default function VisitorAnalytics() {
    const [data, setData] = useState<any>(null);
    const [trendData, setTrendData] = useState<any>(null);
    const [recentVisitors, setRecentVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [statsRes, trendsRes, recentRes] = await Promise.all([
                fetch('/api/reports/visitors'),
                fetch('/api/reports/visitors?type=trends'),
                fetch('/api/reports/visitors?type=recent')
            ]);

            const [stats, trends, recent] = await Promise.all([
                statsRes.json(),
                trendsRes.json(),
                recentRes.json()
            ]);

            if (stats.success) setData(stats.data);
            if (trends.success) {
                setTrendData({
                    labels: trends.data.map((d: any) => d.label),
                    datasets: [
                        {
                            label: 'New Visitors',
                            data: trends.data.map((d: any) => d.new),
                            borderColor: '#db2777',
                            backgroundColor: '#db2777',
                            tension: 0.4
                        },
                        {
                            label: 'Returning',
                            data: trends.data.map((d: any) => d.returning),
                            borderColor: '#3b82f6',
                            backgroundColor: '#3b82f6',
                            tension: 0.4
                        }
                    ]
                });
            }
            if (recent.success) setRecentVisitors(recent.data);
        } catch (error) {
            console.error('Error loading visitor analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="visitor-analytics" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                Loading visitor analytics...
            </div>
        );
    }

    if (!data) return <div className="error-state">Failed to load visitor analytics</div>;

    return (
        <div className="visitor-analytics">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: 0 }}>Visitor Analytics</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                    Auto-updating every 30s
                </div>
            </div>

            <div className="sum-grid">
                {/* 1. TOTAL VISITORS */}
                <div className="sum-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        TOTAL VISITORS
                    </div>
                    <div className="sum-val">{data?.total_visitors || 0}</div>
                    <div className="sum-chan">{data?.new_this_week || 0} new visitors this week</div>
                </div>

                {/* 2. PENDING FOLLOW-UPS */}
                <div className="sum-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                        </svg>
                        PENDING FOLLOW-UPS
                    </div>
                    <div className="sum-val" style={{ color: '#6366f1' }}>{data?.pending_follow_ups || 0}</div>
                    <div className="sum-chan" style={{ color: '#10b981' }}>Needs attention</div>
                </div>

                {/* 3. CONVERSION RATE */}
                <div className="sum-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                        </svg>
                        CONVERSION RATE
                    </div>
                    <div className="sum-val" style={{ color: '#f59e0b' }}>{data?.conversion_rate || 0}%</div>
                    <div className="sum-chan" style={{ color: '#10b981' }}>{data?.converted_count || 0} new members</div>
                </div>

                {/* 4. RETURNING VISITORS */}
                <div className="sum-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                            <path d="M1 4v6h6" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                        RETURNING VISITORS
                    </div>
                    <div className="sum-val" style={{ color: '#10b981' }}>{data?.returning_visitors || 0}</div>
                    <div className="sum-chan" style={{ color: '#10b981' }}>Visited more than once</div>
                </div>

                {/* 5. NEW THIS WEEK */}
                <div className="sum-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        NEW THIS WEEK
                    </div>
                    <div className="sum-val" style={{ color: '#3b82f6' }}>{data?.new_this_week || 0}</div>
                    <div className="sum-chan" style={{ color: '#10b981' }}>Last 7 days</div>
                </div>

                {/* 6. CONTACTED */}
                <div className="sum-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        CONTACTED
                    </div>
                    <div className="sum-val" style={{ color: '#6366f1' }}>{data?.contacted_count || 0}</div>
                    <div className="sum-chan" style={{ color: '#10b981' }}>Follow-up made</div>
                </div>

                {/* 7. SCHEDULED */}
                <div className="sum-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        SCHEDULED
                    </div>
                    <div className="sum-val" style={{ color: '#f59e0b' }}>{data?.scheduled_count || 0}</div>
                    <div className="sum-chan" style={{ color: '#10b981' }}>Appointments set</div>
                </div>

                {/* 8. URGENT FOLLOW-UPS */}
                <div className="sum-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        URGENT FOLLOW-UPS
                    </div>
                    <div className="sum-val" style={{ color: '#10b981' }}>{data?.urgent_count || 0}</div>
                    <div className="sum-chan" style={{ color: '#16a34a' }}>Over 3 days old</div>
                </div>
            </div>

            {/* Visitor Overview Chart */}
            <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Visitor Overview</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>First-time vs returning visitors</p>
                </div>
                <div style={{ height: '350px' }}>
                    {trendData ? (
                        <LineChart
                            data={trendData}
                            height={350}
                            options={{
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        align: 'center',
                                        labels: {
                                            padding: 20,
                                            usePointStyle: false,
                                            boxWidth: 40,
                                            boxHeight: 12,
                                            font: { size: 12, weight: 'normal' }
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 0.1
                                        }
                                    }
                                }
                            }}
                        />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            Loading trend data...
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Visitors Table */}
            <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>Recent Visitors</h3>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Latest visitors to track and follow up</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Name</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Phone</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Email</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Source</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>First Visit</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Last Visit</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Follow-up Status</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Assigned To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentVisitors.map((visitor) => (
                                <tr key={visitor.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{visitor.name}</td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{visitor.phone}</td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{visitor.email}</td>
                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                        <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', color: '#475569' }}>
                                            {visitor.source}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                                        {visitor.first_visit ? new Date(visitor.first_visit).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                                        {visitor.last_visit ? new Date(visitor.last_visit).toLocaleDateString() : 'First visit'}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textAlign: 'center',
                                            minWidth: '100px',
                                            background: visitor.status === 'scheduled' ? '#dcfce7' :
                                                visitor.status === 'pending' ? '#fef3c7' :
                                                    visitor.status === 'contacted' ? '#f3e8ff' :
                                                        visitor.status === 'completed' ? '#ecfdf5' :
                                                            visitor.status === 'no_response' ? '#e0f2fe' : '#f1f5f9',
                                            color: visitor.status === 'scheduled' ? '#166534' :
                                                visitor.status === 'pending' ? '#92400e' :
                                                    visitor.status === 'contacted' ? '#6b21a8' :
                                                        visitor.status === 'completed' ? '#065f46' :
                                                            visitor.status === 'no_response' ? '#075985' : '#475569'
                                        }}>
                                            {visitor.status?.charAt(0)?.toUpperCase() + visitor.status?.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{visitor.assigned_to}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
