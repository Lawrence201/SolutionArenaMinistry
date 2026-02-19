'use client';

import { useState, useEffect } from 'react';
import PieChart from './charts/PieChart';
import BarChart from './charts/BarChart';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const COLORS = [
    '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#3b82f6', '#06b6d4',
    '#10b981', '#22c55e', '#f59e0b', '#fbbf24', '#4f46e5', '#312e81'
];

export default function BirthdayAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pieData, setPieData] = useState<any>(null);
    const [barData, setBarData] = useState<any>(null);

    const loadData = async () => {
        try {
            const response = await fetch('/api/reports/birthdays');
            const result = await response.json();

            if (result.success) {
                setData(result.data);

                // Process Pie Chart Data
                setPieData({
                    labels: result.data.monthly.map((m: any) => m.month_name),
                    datasets: [{
                        data: result.data.monthly.map((m: any) => m.count),
                        backgroundColor: COLORS,
                        borderWidth: 1
                    }]
                });

                // Process Bar Chart Data
                setBarData({
                    labels: result.data.monthly.map((m: any) => m.month_name.substring(0, 3)),
                    datasets: [{
                        label: 'Birthdays',
                        data: result.data.monthly.map((m: any) => m.count),
                        backgroundColor: '#6366f1',
                        borderRadius: 6
                    }]
                });
            }
        } catch (error) {
            console.error('Error loading birthday analytics:', error);
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
            <div className="birthday-analytics" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                Loading birthday analytics...
            </div>
        );
    }

    if (!data) return <div className="error-state">Failed to load birthday analytics</div>;

    return (
        <div className="birthday-analytics">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: 0 }}>Birthday Distribution Analysis</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                    Auto-updating every 30s
                </div>
            </div>

            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>Comprehensive breakdown of member birthdays across all months</p>

            <div className="sum-grid">
                {/* Total Birthdays */}
                <div className="sum-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="sum-lab">TOTAL BIRTHDAYS</div>
                    <div className="sum-val" style={{ color: '#3b82f6' }}>{data.total_birthdays}</div>
                    <div className="sum-chan" style={{ color: '#10b981' }}>Members with birthdays</div>
                </div>

                {/* Busiest Month */}
                <div className="sum-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <div className="sum-lab">BUSIEST MONTH</div>
                    <div className="sum-val" style={{ color: '#8b5cf6' }}>{data.highest_month.month_name}</div>
                    <div className="sum-chan" style={{ color: '#10b981' }}>{data.highest_month.count} birthdays</div>
                </div>

                {/* Average Per Month */}
                <div className="sum-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="sum-lab">AVERAGE PER MONTH</div>
                    <div className="sum-val" style={{ color: '#f59e0b' }}>{data.average_per_month}</div>
                    <div className="sum-chan" style={{ color: '#10b981' }}>Birthdays per month</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                {/* Distribution by Month (Pie) */}
                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Distribution by Month</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Percentage breakdown</p>
                    </div>
                    <div style={{ height: '350px' }}>
                        {pieData && (
                            <PieChart
                                data={pieData}
                                height={350}
                                options={{
                                    plugins: {
                                        legend: {
                                            position: 'right' as const,
                                            labels: {
                                                boxWidth: 12,
                                                padding: 15,
                                                font: { size: 12 },
                                                generateLabels: (chart) => {
                                                    const data = chart.data;
                                                    if (data.labels?.length && data.datasets.length) {
                                                        return data.labels.map((label, i) => ({
                                                            text: `${label}: ${data.datasets[0].data[i]}`,
                                                            fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                                                            hidden: !chart.getDataVisibility(i),
                                                            index: i
                                                        }));
                                                    }
                                                    return [];
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Monthly Comparison (Bar) */}
                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Monthly Comparison</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Birthday count by month</p>
                    </div>
                    <div style={{ height: '350px' }}>
                        {barData && (
                            <BarChart
                                data={barData}
                                height={350}
                                options={{
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: '#f1f5f9' },
                                            ticks: { stepSize: 4 }
                                        },
                                        x: { grid: { display: false } }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Monthly Breakdown Table */}
            <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>Detailed Monthly Breakdown</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Month</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Birthday Count</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Percentage</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Visual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.monthly.map((m: any, idx: number) => {
                                const percentage = data.total_birthdays > 0 ? ((m.count / data.total_birthdays) * 100).toFixed(1) : '0.0';
                                return (
                                    <tr key={m.month} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{m.month_name}</td>
                                        <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{m.count}</td>
                                        <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{percentage}%</td>
                                        <td style={{ padding: '16px', width: '30%' }}>
                                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${percentage}%`, background: COLORS[idx], borderRadius: '4px' }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
