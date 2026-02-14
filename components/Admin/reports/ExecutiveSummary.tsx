'use client';

import { useEffect, useState } from 'react';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import DoughnutChart from './charts/DoughnutChart';
import { formatNumber, formatCurrency } from '@/lib/reportUtils';

interface ExecutiveSummaryProps {
    onDataLoad?: (data: any) => void;
}

export default function ExecutiveSummary({ onDataLoad }: ExecutiveSummaryProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExecutiveSummary();
    }, []);

    async function loadExecutiveSummary() {
        try {
            setLoading(true);
            const response = await fetch('/api/reports/executive-summary');
            const result = await response.json();

            if (result.success) {
                setData(result.data);
                onDataLoad?.(result.data);
            }
        } catch (error) {
            console.error('Error loading executive summary:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="tab-pann acti">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '16px' }}>Loading executive summary...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="tab-pann acti">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#ef4444', fontSize: '16px' }}>Failed to load analytics</p>
                </div>
            </div>
        );
    }

    // Chart 1: Growth Trends
    const growthTrendData = {
        labels: data.trends.map((t: any) => t.month),
        datasets: [
            {
                label: 'New Members',
                data: data.trends.map((t: any) => t.members),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6'
            },
            {
                label: 'Avg Attendance',
                data: data.trends.map((t: any) => t.attendance),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
            }
        ]
    };

    // Chart 2: Ministry Distribution
    const ministryData = {
        labels: data.ministries.map((m: any) => m.church_group),
        datasets: [{
            data: data.ministries.map((m: any) => m.count),
            backgroundColor: [
                '#3b82f6', // Blue
                '#10b981', // Green
                '#f59e0b', // Orange
                '#ef4444', // Red
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    // Chart 3: Financial Trends
    const financialTrendData = {
        labels: data.trends.map((t: any) => t.month),
        datasets: [{
            label: 'Income',
            data: data.trends.map((t: any) => t.income),
            backgroundColor: '#10b981',
            borderRadius: 6
        }]
    };

    // Chart 4: Attendance Trends
    const attendanceTrendData = {
        labels: data.trends.map((t: any) => t.month),
        datasets: [{
            label: 'Avg Attendance',
            data: data.trends.map((t: any) => t.attendance),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#6366f1'
        }]
    };

    // Chart 5: Member Engagement Overview
    const engagementOverviewData = {
        labels: ['Active', 'Inactive', 'Visitors', 'At Risk'],
        datasets: [{
            label: 'Count',
            data: [
                data.engagement.active,
                data.engagement.inactive,
                data.engagement.visitors,
                data.engagement.at_risk
            ],
            backgroundColor: [
                '#10b981', // Green
                '#94a3b8', // Gray
                '#3b82f6', // Blue
                '#ef4444'  // Red
            ],
            borderRadius: 6
        }]
    };

    // KPI Table Calculation Logic
    const kpis = [
        {
            metric: 'Average Attendance',
            current: formatNumber(data.attendance.avg_attendance),
            previous: formatNumber(data.attendance.prev_avg_attendance),
            change: parseFloat(data.attendance.growth_rate),
            target: Math.round(data.membership.active * 0.75),
            status: data.attendance.avg_attendance >= (data.membership.active * 0.75) ? 'Target Met' : 'Below Target'
        },
        {
            metric: 'Total Income',
            current: formatCurrency(data.financial.total_income),
            previous: formatCurrency(data.financial.prev_total_income),
            change: parseFloat(data.financial.income_growth),
            target: formatCurrency(data.financial.prev_total_income * 1.05),
            status: data.financial.income_growth >= 0 ? 'On Track' : 'Below Target'
        },
        {
            metric: 'New Members',
            current: formatNumber(data.membership.new_30d),
            previous: formatNumber(data.membership.prev_new_30d),
            change: parseFloat(data.membership.growth_rate),
            target: 5,
            status: data.membership.new_30d >= 5 ? 'Excellent' : data.membership.new_30d >= 3 ? 'Good' : 'Needs Improvement'
        },
        {
            metric: 'Engagement Rate',
            current: `${data.engagement.engagement_rate}%`,
            previous: '85%',
            change: data.engagement.engagement_rate - 85,
            target: '85%',
            status: data.engagement.engagement_rate >= 85 ? 'Exceeded' : 'Good'
        }
    ];

    return (
        <div className="tab-pann acti">
            {/* System Overview Cards */}
            <div className="sum-grid">
                <div className="sum-card succ">
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Total Members
                    </div>
                    <div className="sum-val">{formatNumber(data.membership.total)}</div>
                    <div className="sum-chan">
                        {data.membership.growth_rate >= 0 ? '+' : ''}{data.membership.growth_rate.toFixed(1)}% growth | {data.membership.new_30d} new this month
                    </div>
                </div>

                <div className="sum-card">
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                        Active Engagement
                    </div>
                    <div className="sum-val">{data.engagement.engagement_rate}%</div>
                    <div className="sum-chan">
                        {data.engagement.active} active | {data.engagement.at_risk} at risk
                    </div>
                </div>

                <div className="sum-card succ">
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        Financial Health
                    </div>
                    <div className="sum-val">{formatCurrency(data.financial.total_income)}</div>
                    <div className="sum-chan">
                        {data.financial.total_income > 0 ? `Score: ${data.financial.financial_health}/100` : 'Loading...'}
                    </div>
                </div>

                <div className="sum-card">
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Avg Attendance
                    </div>
                    <div className="sum-val">{formatNumber(data.attendance.avg_attendance)}</div>
                    <div className="sum-chan">
                        {data.attendance.growth_rate >= 0 ? '+' : ''}{data.attendance.growth_rate}% | {data.attendance.attendance_rate}% attendance rate
                    </div>
                </div>

                <div className="sum-card inff">
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10H3M16 2v4M8 2v4m13 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8m18 0H3"></path></svg>
                        Upcoming Events
                    </div>
                    <div className="sum-val">{data.events.upcoming}</div>
                    <div className="sum-chan">
                        {data.events.unique_attendees} unique attendees | {data.events.engagement_rate}% engagement
                    </div>
                </div>

                <div className="sum-card alt">
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
                        Messages Sent
                    </div>
                    <div className="sum-val">{data.communication.messages_sent}</div>
                    <div className="sum-chan">
                        {data.communication.messages_sent} sent | {data.communication.delivery_rate}% delivery rate
                    </div>
                </div>

                <div className="sum-card dang">
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        Members at Risk
                    </div>
                    <div className="sum-val">{data.engagement.at_risk}</div>
                    <div className="sum-chan">Need follow-up contact</div>
                </div>

                <div className="sum-card sec">
                    <div className="sum-lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Retention Rate
                    </div>
                    <div className="sum-val">{data.membership.retention_rate}%</div>
                    <div className="sum-chan">{data.membership.active} active members</div>
                </div>
            </div>

            {/* KPI Table Section */}
            <div className="cha-card fulw" style={{ marginBottom: '24px', padding: '24px' }}>
                <div className="sec-hea" style={{ marginBottom: '16px' }}>
                    <h2 className="sec-tit">Key Performance Indicators</h2>
                </div>
                <table className="dat-tab">
                    <thead>
                        <tr>
                            <th style={{ backgroundColor: 'transparent' }}>METRIC</th>
                            <th style={{ backgroundColor: 'transparent' }}>CURRENT</th>
                            <th style={{ backgroundColor: 'transparent' }}>PREVIOUS</th>
                            <th style={{ backgroundColor: 'transparent' }}>CHANGE</th>
                            <th style={{ backgroundColor: 'transparent' }}>TARGET</th>
                            <th style={{ backgroundColor: 'transparent' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpis.map((kpi, idx) => (
                            <tr key={idx}>
                                <td className="tab-nam">{kpi.metric}</td>
                                <td><strong>{kpi.current}</strong></td>
                                <td>{kpi.previous}</td>
                                <td>
                                    <span className={`tre-ind ${kpi.change >= 0 ? 'tre-up' : 'tre-down'}`}>
                                        {kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change).toFixed(idx === 3 ? 1 : 1)}%
                                    </span>
                                </td>
                                <td>{kpi.target}</td>
                                <td>
                                    <span className={`badg ${kpi.status === 'Excellent' || kpi.status === 'Exceeded' || kpi.status === 'Target Met' ? 'badg-succ' :
                                        kpi.status === 'Good' || kpi.status === 'On Track' ? 'badg-warn' : 'badg-dang'
                                        }`}>
                                        {kpi.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Charts Grid */}
            <div className="cha-grid">
                {/* Growth Trends */}
                <div className="cha-card">
                    <div className="cha-hea">
                        <h3>Growth Trends</h3>
                        <p className="cha-sub">Members & Attendance (6 months)</p>
                    </div>
                    <div className="cha-can" style={{ height: '350px' }}>
                        <LineChart
                            data={growthTrendData}
                            height={350}
                            options={{
                                plugins: {
                                    legend: {
                                        labels: {
                                            pointStyle: 'rect',
                                            usePointStyle: true
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Ministry Distribution */}
                <div className="cha-card">
                    <div className="cha-hea">
                        <h3>Ministry Distribution</h3>
                        <p className="cha-sub">Members by church group</p>
                    </div>
                    <div className="cha-can" style={{ height: '350px' }}>
                        <DoughnutChart data={ministryData} height={350} />
                    </div>
                </div>

                {/* Financial Trends */}
                <div className="cha-card">
                    <div className="cha-hea">
                        <h3>Financial Trends</h3>
                        <p className="cha-sub">Income over 6 months (GH₵)</p>
                    </div>
                    <div className="cha-can" style={{ height: '350px' }}>
                        <BarChart
                            data={financialTrendData}
                            height={350}
                            options={{
                                scales: {
                                    y: {
                                        ticks: {
                                            callback: (value) => 'GH₵' + formatNumber(value as number)
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Attendance Trends */}
                <div className="cha-card">
                    <div className="cha-hea">
                        <h3>Attendance Trends</h3>
                        <p className="cha-sub">Average attendance (6 months)</p>
                    </div>
                    <div className="cha-can" style={{ height: '350px' }}>
                        <LineChart data={attendanceTrendData} height={350} />
                    </div>
                </div>

                {/* Member Engagement Overview - FINAL CHART */}
                <div className="cha-card">
                    <div className="cha-hea">
                        <h3>Member Engagement Overview</h3>
                        <p className="cha-sub">Active, Inactive, Visitors & At Risk</p>
                    </div>
                    <div className="cha-can" style={{ height: '350px' }}>
                        <BarChart
                            data={engagementOverviewData}
                            height={350}
                            options={{
                                plugins: {
                                    legend: { display: false }
                                },
                                scales: {
                                    x: { grid: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
