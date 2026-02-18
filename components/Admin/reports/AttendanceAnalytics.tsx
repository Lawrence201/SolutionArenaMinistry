'use client';

import { useEffect, useState } from 'react';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import DoughnutChart from './charts/DoughnutChart';
import { formatNumber, formatPercentage, chartColors } from '@/lib/reportUtils';

export default function AttendanceAnalytics() {
    const [data, setData] = useState<any>(null);
    const [growthData, setGrowthData] = useState<any>(null);
    const [weeklyTrends, setWeeklyTrends] = useState<any>(null);
    const [demographics, setDemographics] = useState<any>(null);
    const [serviceBreakdown, setServiceBreakdown] = useState<any>(null);
    const [peakDays, setPeakDays] = useState<any>(null);
    const [groupParticipation, setGroupParticipation] = useState<any>(null);
    const [retentionMetrics, setRetentionMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                const [overviewRes, growthRes, trendsRes, demoRes, serviceRes, peakRes, groupRes, retentionRes] = await Promise.all([
                    fetch('/api/reports/attendance?type=overview'),
                    fetch('/api/reports/attendance?type=growth_metrics'),
                    fetch('/api/reports/attendance?type=trends&weeks=12'),
                    fetch('/api/reports/attendance?type=demographics'),
                    fetch('/api/reports/attendance?type=service_breakdown'),
                    fetch('/api/reports/attendance?type=peak_days'),
                    fetch('/api/reports/attendance?type=group_participation'),
                    fetch('/api/reports/attendance?type=retention')
                ]);

                const [overview, growth, trends, demo, service, peak, group, retention] = await Promise.all([
                    overviewRes.json(),
                    growthRes.json(),
                    trendsRes.json(),
                    demoRes.json(),
                    serviceRes.json(),
                    peakRes.json(),
                    groupRes.json(),
                    retentionRes.json()
                ]);

                if (overview.success) setData(overview.data);
                if (growth.success) setGrowthData(growth.data);
                if (trends.success) setWeeklyTrends(trends.data);
                if (demo.success) setDemographics(demo.data);
                if (service.success) setServiceBreakdown(service.data);
                if (peak.success) setPeakDays(peak.data);
                if (group.success) setGroupParticipation(group.data);
                if (retention.success) setRetentionMetrics(retention.data);
            } catch (error) {
                console.error('Error loading attendance analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
        const interval = setInterval(loadAllData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="attendance-analytics">
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Loading advanced attendance analytics...
                </div>
            </div>
        );
    }

    if (!data) return <div className="error-state">Failed to load attendance analytics</div>;

    const adultsCount = (data.members_attended || 0) - (data.children_count || 0);

    const weeklyTrendsChart = weeklyTrends ? {
        labels: weeklyTrends.map((t: any) => t.week),
        datasets: [
            {
                label: 'Total Attendance',
                data: weeklyTrends.map((t: any) => t.total),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
            },
            {
                label: 'Members',
                data: weeklyTrends.map((t: any) => t.members),
                borderColor: '#10b981',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#10b981',
            },
            {
                label: 'Visitors',
                data: weeklyTrends.map((t: any) => t.visitors),
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#f59e0b',
            }
        ]
    } : null;

    const demographicsChart = demographics?.age_groups?.some((g: any) => g.count > 0) ? {
        labels: demographics.age_groups.map((g: any) => g.age_group),
        datasets: [{
            data: demographics.age_groups.map((g: any) => g.count),
            backgroundColor: [
                '#6366f1',
                '#10b981',
                '#f59e0b',
                '#ec4899'
            ],
            borderWidth: 0
        }]
    } : null;

    const serviceBreakdownChart = serviceBreakdown?.length > 0 ? {
        labels: serviceBreakdown.map((s: any) => s.service_id),
        datasets: [{
            label: 'Attendance',
            data: serviceBreakdown.map((s: any) => s.count),
            backgroundColor: '#6366f1',
            borderRadius: 6
        }]
    } : null;

    const peakDaysChart = peakDays?.some((p: any) => p.count > 0) ? {
        labels: peakDays.map((p: any) => p.day),
        datasets: [{
            label: 'Attendance',
            data: peakDays.map((p: any) => p.count),
            backgroundColor: '#3b82f6',
            borderRadius: 6
        }]
    } : null;

    const groupParticipationChart = groupParticipation?.some((g: any) => g.count > 0) ? {
        labels: groupParticipation.map((g: any) => g.group),
        datasets: [{
            data: groupParticipation.map((g: any) => g.count),
            backgroundColor: [
                '#f59e0b',
                '#10b981',
                '#6366f1',
                '#ec4899',
                '#94a3b8'
            ],
            borderWidth: 0
        }]
    } : null;

    const retentionMetricsChart = retentionMetrics?.length > 0 ? {
        labels: retentionMetrics.map((r: any) => r.month),
        datasets: [
            {
                label: 'Regular',
                data: retentionMetrics.map((r: any) => r.regular),
                backgroundColor: '#10b981',
                borderRadius: 4
            },
            {
                label: 'Returning',
                data: retentionMetrics.map((r: any) => r.returning),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            },
            {
                label: 'First Timers',
                data: retentionMetrics.map((r: any) => r.first_timers),
                backgroundColor: '#f59e0b',
                borderRadius: 4
            }
        ]
    } : null;

    return (
        <div className="tab-pann acti" id="attendance">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="sec-tit" style={{ margin: 0 }}>Advanced Attendance Analytics</h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span className="cf-auto-refresh-indicator" style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                    Auto-updating every 30s
                </p>
            </div>

            {/* Main KPI Cards */}
            <div className="sum-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginTop: '1.5rem' }}>
                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
                    <div className="sum-lab" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#4b5563', fontWeight: 500, marginBottom: '0.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Total Members
                    </div>
                    <div className="sum-val" style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{formatNumber(data?.total_members || 0)}</div>
                    <div className="sum-chan" style={{ fontSize: '0.9rem', color: '#6b7280' }}>Registered in system</div>
                </div>

                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
                    <div className="sum-lab" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#4b5563', fontWeight: 500, marginBottom: '0.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <polyline points="16 11 18 13 22 9"></polyline>
                        </svg>
                        Members Attended
                    </div>
                    <div className="sum-val" style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{formatNumber(data?.members_attended || 0)}</div>
                    <div className="sum-chan" style={{ fontSize: '0.9rem', color: '#6b7280' }}>This month</div>
                </div>

                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
                    <div className="sum-lab" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#4b5563', fontWeight: 500, marginBottom: '0.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Total Visitors
                    </div>
                    <div className="sum-val" style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{formatNumber(data?.total_visitors || 0)}</div>
                    <div className="sum-chan" style={{ fontSize: '0.9rem', color: '#6b7280' }}>First-time guests</div>
                </div>

                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
                    <div className="sum-lab" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: '#4b5563', fontWeight: 500, marginBottom: '0.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="2">
                            <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                            <path d="M18 17V9"></path>
                            <path d="M13 17V5"></path>
                            <path d="M8 17v-3"></path>
                        </svg>
                        Avg Attendance
                    </div>
                    <div className="sum-val" style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{formatNumber(data?.avg_attendance || 0)}</div>
                    <div className="sum-chan" style={{ fontSize: '0.9rem', color: '#6b7280' }}>Per service</div>
                </div>
            </div>

            {/* Secondary Metrics */}
            <div className="sum-grid" style={{ marginTop: '20px' }}>
                <div className="met-card">
                    <div className="met-lab">Attendance Rate</div>
                    <div className="met-val">{data?.attendance_rate || 0}%</div>
                    <div className="met-chan">Of total members</div>
                </div>
                <div className="met-card">
                    <div className="met-lab">Peak Attendance</div>
                    <div className="met-val">{formatNumber(data?.peak_attendance || 0)}</div>
                    <div className="met-chan">Highest this month</div>
                </div>
                <div className="met-card">
                    <div className="met-lab">Growth Rate</div>
                    <div className="met-val">{growthData ? (growthData.growth_percentage > 0 ? '+' : '') + growthData.growth_percentage + '%' : '0%'}</div>
                    <div className="met-chan">Month over month</div>
                </div>
                <div className="met-card">
                    <div className="met-lab">New Attendees</div>
                    <div className="met-val">{growthData ? formatNumber(growthData.new_attendees) : '0'}</div>
                    <div className="met-chan">First time this month</div>
                </div>
            </div>

            {/* Demographics Metrics */}
            <div className="sum-grid" style={{ marginTop: '20px', marginBottom: '30px' }}>
                <div className="met-card">
                    <div className="met-lab">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                            <circle cx="12" cy="8" r="5"></circle>
                            <path d="M20 21a8 8 0 1 0-16 0"></path>
                        </svg>
                        Males
                    </div>
                    <div className="met-val">{formatNumber(data?.males_count || 0)}</div>
                    <div className="met-chan">Present this month</div>
                </div>
                <div className="met-card">
                    <div className="met-lab">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                            <circle cx="12" cy="8" r="5"></circle>
                            <path d="M20 21a8 8 0 1 0-16 0"></path>
                            <circle cx="12" cy="8" r="2"></circle>
                        </svg>
                        Females
                    </div>
                    <div className="met-val">{formatNumber(data?.females_count || 0)}</div>
                    <div className="met-chan">Present this month</div>
                </div>
                <div className="met-card">
                    <div className="met-lab">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                            <path d="M12 2a3 3 0 0 0-3 3c0 1.3.8 2.4 2 2.8V9H8v2h3v2H8v2h3v5a1 1 0 0 0 2 0v-5h3v-2h-3v-2h3V9h-3V7.8c1.2-.4 2-1.5 2-2.8a3 3 0 0 0-3-3z"></path>
                        </svg>
                        Children
                    </div>
                    <div className="met-val">{formatNumber(data?.children_count || 0)}</div>
                    <div className="met-chan">Under 18 years</div>
                </div>
                <div className="met-card">
                    <div className="met-lab">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Adults
                    </div>
                    <div className="met-val">{formatNumber(adultsCount > 0 ? adultsCount : 0)}</div>
                    <div className="met-chan">18+ years</div>
                </div>
            </div>

            {/* Weekly Attendance Trends Chart */}
            {weeklyTrendsChart && (
                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Weekly Attendance Trends</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>12-week comparison: Total, Members & Visitors</p>
                    </div>
                    <LineChart
                        data={weeklyTrendsChart}
                        height={350}
                        options={{
                            plugins: {
                                legend: {
                                    position: 'top',
                                    align: 'center',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: false,
                                        boxWidth: 40,
                                        boxHeight: 12,
                                        font: { size: 12, weight: 'normal' }
                                    }
                                }
                            }
                        }}
                    />
                </div>
            )}

            {/* Demographics and Service Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                {/* Age Demographics */}
                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Age Demographics</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Distribution by age groups</p>
                    </div>
                    {demographicsChart ? (
                        <div style={{ height: '300px' }}>
                            <DoughnutChart data={demographicsChart} height={300} />
                        </div>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                            No demographic data available.
                        </div>
                    )}
                </div>

                {/* Service Breakdown */}
                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Service Breakdown</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Attendance by service type</p>
                    </div>
                    {serviceBreakdownChart ? (
                        <div style={{ height: '300px' }}>
                            <BarChart data={serviceBreakdownChart} height={300} />
                        </div>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                            No service data available.
                        </div>
                    )}
                </div>
            </div>

            {/* Peak Days and Church Groups grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                {/* Peak Days */}
                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Peak Days</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Attendance by day of week</p>
                    </div>
                    {peakDaysChart ? (
                        <div style={{ height: '300px' }}>
                            <BarChart data={peakDaysChart} height={300} />
                        </div>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                            No peak times data available.
                        </div>
                    )}
                </div>

                {/* Church Groups Participation */}
                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Church Groups Participation</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Ministry engagement levels</p>
                    </div>
                    {groupParticipationChart ? (
                        <div style={{ height: '300px' }}>
                            <DoughnutChart data={groupParticipationChart} height={300} />
                        </div>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                            No church group data available.
                        </div>
                    )}
                </div>
            </div>

            {/* Retention Metrics Chart */}
            {retentionMetricsChart && (
                <div className="sum-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Retention Metrics</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Regular, Returning & First-time Attendees (6 months)</p>
                    </div>
                    <div style={{ height: '400px' }}>
                        <BarChart
                            data={retentionMetricsChart}
                            height={400}
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
                                    x: { stacked: true },
                                    y: { stacked: true, beginAtZero: true }
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
