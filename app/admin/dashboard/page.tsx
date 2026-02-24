"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface DashboardStats {
    total_members: number;
    members_change: number;
    total_events: number;
    events_change: number;
    total_offerings: number;
    total_tithes: number;
    total_project_offerings: number;
    total_welfare: number;
    total_expenses: number;
    total_withdrawals: number;
    active_members: number;
    inactive_members: number;
    visitors: number;
    new_members_month: number;
    new_members_goal: number;
    new_members_percent: number;
    tithes_last_3_months: number;
    donations_goal: number;
    event_attendance_month: number;
    attendance_goal: number;
    attendance_percent: number;
    financial_trends: { month: string; amount: number }[];
    attendance_trends: { month: string; attendance: number }[];
}

interface Insight {
    type: "success" | "warning" | "info" | "danger";
    icon: string;
    text: string;
}

interface Activity {
    id: number;
    type: string;
    title: string;
    description: string;
    icon_type: string;
    time_ago: string;
}

interface UpcomingEvent {
    id: number;
    name: string;
    date_display: string;
    time_display: string;
    attendance: number;
    color: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [insightCount, setInsightCount] = useState(0);

    const fetchDashboardData = useCallback(async () => {
        try {
            const [statsRes, insightsRes, activitiesRes, eventsRes] = await Promise.all([
                fetch('/api/admin/dashboard-stats'),
                fetch('/api/admin/insights'),
                fetch('/api/admin/recent-activities?limit=4'),
                fetch('/api/admin/upcoming-events?limit=5')
            ]);

            const [statsData, insightsData, activitiesData, eventsData] = await Promise.all([
                statsRes.json(),
                insightsRes.json(),
                activitiesRes.json(),
                eventsRes.json()
            ]);

            if (statsData.success) setStats(statsData.data);
            if (insightsData.success) {
                setInsights(insightsData.data);
                setInsightCount(insightsData.count);
            }
            if (activitiesData.success) setActivities(activitiesData.data);
            if (eventsData.success) setUpcomingEvents(eventsData.data);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    // Calculate net income and net balance
    const netIncome = stats ? (stats.total_offerings + stats.total_tithes + stats.total_project_offerings + stats.total_welfare) : 0;
    const netBalance = netIncome - (stats?.total_expenses || 0) - (stats?.total_withdrawals || 0);

    const formatCurrency = (value: number): string => {
        if (value >= 1000) {
            return '₵' + (value / 1000).toFixed(1) + 'K';
        }
        return '₵' + value.toFixed(2);
    };

    const formatFullCurrency = (value: number): string => {
        return '₵' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Chart data
    const attendanceData = {
        labels: stats?.attendance_trends?.map(t => t.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Actual Attendance',
            data: stats?.attendance_trends?.map(t => t.attendance) || [0, 0, 0, 0, 0, 0],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: '#3b82f6'
        }]
    };

    const financialData = {
        labels: stats?.financial_trends?.map(t => t.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Income',
            data: stats?.financial_trends?.map(t => t.amount) || [0, 0, 0, 0, 0, 0],
            backgroundColor: '#3b82f6',
            borderRadius: 6
        }]
    };

    const membershipData = {
        labels: ['Active Members', 'Inactive Members', 'Visitors'],
        datasets: [{
            data: [stats?.active_members || 0, stats?.inactive_members || 0, stats?.visitors || 0],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            borderWidth: 0,
        }],
    };

    // Insight icon helper
    const getInsightIcon = (iconType: string, type: string) => {
        const colors: Record<string, string> = {
            'success': '#10b981',
            'warning': '#f59e0b',
            'info': '#3b82f6',
            'danger': '#ef4444'
        };
        const color = colors[type] || '#3b82f6';

        const icons: Record<string, React.ReactNode> = {
            'trending-up': (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
            ),
            'trending-down': (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                    <polyline points="16 17 22 17 22 11"></polyline>
                </svg>
            ),
            'alert': (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" x2="12" y1="8" y2="12"></line>
                    <line x1="12" x2="12.01" y1="16" y2="16"></line>
                </svg>
            ),
            'users': (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            'calendar': (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <line x1="16" x2="16" y1="2" y2="6"></line>
                    <line x1="8" x2="8" y1="2" y2="6"></line>
                    <line x1="3" x2="21" y1="10" y2="10"></line>
                </svg>
            ),
            'dollar': (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" x2="12" y1="2" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            'message': (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            )
        };

        return icons[iconType] || icons['alert'];
    };

    // Activity icon helper
    const getActivityIcon = (type: string) => {
        const iconStyles: Record<string, { style: React.CSSProperties; color: string }> = {
            'member': { style: { background: '#dbeafe', color: '#3b82f6' }, color: '#3b82f6' },
            'member_added': { style: { background: '#dbeafe', color: '#3b82f6' }, color: '#3b82f6' },
            'donation': { style: { background: '#d1fae5', color: '#10b981' }, color: '#10b981' },
            'donation_recorded': { style: { background: '#d1fae5', color: '#10b981' }, color: '#10b981' },
            'event': { style: { background: '#fed7aa', color: '#f59e0b' }, color: '#f59e0b' },
            'event_scheduled': { style: { background: '#fed7aa', color: '#f59e0b' }, color: '#f59e0b' },
            'message': { style: { background: '#fef3c7', color: '#f59e0b' }, color: '#f59e0b' },
            'message_sent': { style: { background: '#fef3c7', color: '#f59e0b' }, color: '#f59e0b' },
            'birthday': { style: { background: '#fce7f3', color: '#ec4899' }, color: '#ec4899' },
            'birthday_today': { style: { background: '#fce7f3', color: '#ec4899' }, color: '#ec4899' },
        };

        const iconInfo = iconStyles[type] || iconStyles['member'];

        return {
            style: iconInfo.style,
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="19" x2="19" y1="8" y2="14"></line>
                    <line x1="22" x2="16" y1="11" y2="11"></line>
                </svg>
            )
        };
    };

    // Tithes goal calculation
    const tithesPercent = stats?.donations_goal && stats.donations_goal > 0
        ? Math.round((stats.tithes_last_3_months / stats.donations_goal) * 100)
        : 0;
    const tithesFormatted = stats?.tithes_last_3_months && stats.tithes_last_3_months >= 1000
        ? 'GH₵' + (stats.tithes_last_3_months / 1000).toFixed(1) + 'K'
        : 'GH₵' + (stats?.tithes_last_3_months || 0);

    return (
        <>
            <div className="dashboard-header">
                <div className="dashboard-header-text">
                    <h1>Main Dashboard</h1>
                    <p>Love God Solutionarian. Here&apos;s what&apos;s happening at your church.</p>
                </div>
                <div className="header-actions">
                    <Link href="/admin/reports" className="btn btn-secondary">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                                <path d="M18 17V9"></path>
                                <path d="M13 17V5"></path>
                                <path d="M8 17v-3"></path>
                            </svg>
                        </span>
                        <span>View Reports</span>
                    </Link>

                    <Link href="/admin/ai/insights" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L13.5 7.5H19L14.5 11L16 16.5L12 13L8 16.5L9.5 11L5 7.5H10.5L12 2Z" fill="white" />
                            </svg>
                        </span>
                        <span>AI Insights</span>
                    </Link>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="insights-section">
                <div className="insights-header">
                    <img src="/assets/chatbot.png" alt="AI Insights" />
                    <h2>AI-Powered Insights</h2>
                </div>
                <div className="insights-grid" id="insightsGrid">
                    {loading ? (
                        <div className="insight-card" style={{ textAlign: 'center', padding: '20px' }}>
                            <p style={{ color: '#94a3b8' }}>Loading insights...</p>
                        </div>
                    ) : insights.length === 0 ? (
                        <div className="insight-card" style={{ textAlign: 'center', padding: '20px' }}>
                            <p style={{ color: '#94a3b8' }}>No insights available</p>
                        </div>
                    ) : (
                        insights.map((insight, index) => (
                            <div key={index} className={`insight-card ${insight.type}`}>
                                <span className="insight-icon">{getInsightIcon(insight.icon, insight.type)}</span>
                                <span className="insight-text">{insight.text}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Total Members</span>
                        <div className="stat-icon blue">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="stat-value">{stats?.total_members || 0}</div>
                    <div className="stat-change">+{stats?.members_change || 0}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Total Events</span>
                        <div className="stat-icon purple">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 2v4"></path>
                                <path d="M16 2v4"></path>
                                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                <path d="M3 10h18"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="stat-value">{stats?.total_events || 0}</div>
                    <div className="stat-change">+{stats?.events_change || 0}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Net Income</span>
                        <div className="stat-icon green">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" x2="12" y1="2" y2="22"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="stat-value" id="netIncomeValue" style={{ cursor: 'help', position: 'relative' }} title={formatFullCurrency(netIncome)} data-full-amount={formatFullCurrency(netIncome)}>
                        {formatCurrency(netIncome)}
                    </div>
                    <div className="stat-change" style={{ color: '#6b7280', fontWeight: 500 }}>All Income Sources (All Time)</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Net Balance Left</span>
                        <div className="stat-icon blue">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path>
                                <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
                                <path d="M16 11h0"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="stat-value" id="netBalanceValue" style={{ color: netBalance >= 0 ? '#10b981' : '#ef4444', cursor: 'help', position: 'relative' }} title={formatFullCurrency(netBalance)} data-full-amount={formatFullCurrency(netBalance)}>
                        {formatCurrency(netBalance)}
                    </div>
                    <div className="stat-change" style={{ color: '#6b7280', fontWeight: 500 }}>After Expenses &amp; Withdrawals</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Monthly Attendance Trends</h3>
                        <p className="chart-subtitle">Monthly attendance vs targets</p>
                    </div>
                    <div className="chart-container">
                        <Line data={attendanceData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: true, position: 'bottom' } },
                            scales: { y: { beginAtZero: true } }
                        }} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Financial Income Trends</h3>
                        <p className="chart-subtitle">Monthly income from all sources</p>
                    </div>
                    <div className="chart-container">
                        <Bar data={financialData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function (value) {
                                            return 'GH₵' + Number(value).toLocaleString();
                                        }
                                    }
                                }
                            }
                        }} />
                    </div>
                </div>
            </div>

            {/* Three Column Grid */}
            <div className="three-column-grid">
                {/* Quick Actions */}
                <div className="quick-actions">
                    <div className="section-header">
                        <span style={{ fontSize: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="orange" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
                            </svg>
                        </span>
                        <h3>Quick Actions</h3>
                    </div>
                    <p className="section-subtitle">Common tasks you can perform instantly</p>

                    <div className="action-buttons">
                        <Link href="/admin/members/add" className="action-bt primary">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <line x1="19" x2="19" y1="8" y2="14"></line>
                                    <line x1="22" x2="16" y1="11" y2="11"></line>
                                </svg>
                            </span>
                            <span>Add New Member</span>
                        </Link>
                        <Link href="/admin/events/new" className="action-bt">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="orange" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8 2v4"></path>
                                    <path d="M16 2v4"></path>
                                    <path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"></path>
                                    <path d="M3 10h18"></path>
                                    <path d="M16 19h6"></path>
                                    <path d="M19 16v6"></path>
                                </svg>
                            </span>
                            <span>Schedule Event</span>
                        </Link>
                        <Link href="/admin/finance/add" className="action-bt">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                                    <line x1="2" x2="22" y1="10" y2="10"></line>
                                </svg>
                            </span>
                            <span>Record Donation</span>
                        </Link>
                        <Link href="/admin/communication/send" className="action-bt">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                                    <path d="m21.854 2.147-10.94 10.939"></path>
                                </svg>
                            </span>
                            <span>Send Message</span>
                        </Link>
                        <Link href="/admin/gallery/add" className="action-bt">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="purple" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                                    <line x1="16" x2="22" y1="5" y2="5"></line>
                                    <line x1="19" x2="19" y1="2" y2="8"></line>
                                    <circle cx="9" cy="9" r="2"></circle>
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                                </svg>
                            </span>
                            <span>Add Gallery</span>
                        </Link>
                        <Link href="/admin/sermons/add" className="action-bt">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="brown" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                                    <path d="M9 10h6"></path>
                                    <path d="M12 7v6"></path>
                                </svg>
                            </span>
                            <span>Add Sermon</span>
                        </Link>
                        <Link href="/admin/blogs/add" className="action-bt">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="teal" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                                </svg>
                            </span>
                            <span>Add Blogs</span>
                        </Link>
                    </div>
                </div>

                {/* Membership Overview */}
                <div className="membership-overview">
                    <div className="section-header">
                        <h3>Membership Overview</h3>
                    </div>
                    <p className="section-subtitle">Current membership distribution</p>

                    <div className="donut-container" style={{ position: 'relative', height: '220px', marginBottom: '24px' }}>
                        <Doughnut data={membershipData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            cutout: '70%'
                        }} />
                    </div>

                    <div className="membership-legend">
                        <div className="legend-item">
                            <div className="legend-label">
                                <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                                <span>Active Members</span>
                            </div>
                            <span className="legend-value">{stats?.active_members || 0}</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-label">
                                <span className="legend-dot" style={{ background: '#10b981' }}></span>
                                <span>Inactive Members</span>
                            </div>
                            <span className="legend-value">{stats?.inactive_members || 0}</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-label">
                                <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                                <span>Visitors</span>
                            </div>
                            <span className="legend-value">{stats?.visitors || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="upcoming-events">
                    <div className="section-header">
                        <h3>Upcoming Events</h3>
                    </div>
                    <div className="events-list" id="upcomingEventsList">
                        {loading ? (
                            <div className="event-item" style={{ textAlign: 'center', padding: '20px' }}>
                                <p style={{ color: '#94a3b8' }}>Loading upcoming events...</p>
                            </div>
                        ) : upcomingEvents.length === 0 ? (
                            <div className="event-item" style={{ textAlign: 'center', padding: '20px' }}>
                                <p style={{ color: '#94a3b8' }}>No upcoming events scheduled</p>
                            </div>
                        ) : (
                            upcomingEvents.map((event) => (
                                <div key={event.id} className="event-item">
                                    <div className="event-info">
                                        <span className="event-dot" style={{ background: event.color }}></span>
                                        <div className="event-details">
                                            <h4>{event.name}</h4>
                                            <p>{event.date_display}, {event.time_display}</p>
                                        </div>
                                    </div>
                                    <span className="event-attendance">
                                        {event.attendance > 0 ? `${event.attendance} attending` : 'No registrations yet'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                    <Link href="/admin/events" className="view-all-link">
                        <span>View All Events</span>
                        <span>→</span>
                    </Link>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bottom-section-grid">
                {/* Recent Activity */}
                <div className="recent-activity">
                    <div className="section-header">
                        <span style={{ fontSize: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </span>
                        <h3>Recent Activity</h3>
                    </div>
                    <p className="section-subtitle">Latest actions performed in the system</p>
                    <div className="activity-list" id="activityList">
                        {loading ? (
                            <div className="activity-item" style={{ textAlign: 'center', padding: '20px' }}>
                                <p style={{ color: '#94a3b8' }}>Loading recent activities...</p>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="activity-item" style={{ textAlign: 'center', padding: '20px' }}>
                                <p style={{ color: '#94a3b8' }}>No recent activities</p>
                            </div>
                        ) : (
                            activities.map((activity) => {
                                const iconInfo = getActivityIcon(activity.icon_type || activity.type);
                                return (
                                    <div key={activity.id} className="activity-item">
                                        <div className="activity-icon" style={iconInfo.style}>
                                            <span>{iconInfo.svg}</span>
                                        </div>
                                        <div className="activity-content">
                                            <h4>{activity.title}</h4>
                                            <p>{activity.description}</p>
                                        </div>
                                        <span className="activity-time">{activity.time_ago}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Monthly Goals */}
                <div className="monthly-goals">
                    <div className="section-header">
                        <span style={{ fontSize: '20px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="6"></circle>
                                <circle cx="12" cy="12" r="2"></circle>
                            </svg>
                        </span>
                        <h3>Monthly Goals</h3>
                    </div>
                    <p className="section-subtitle">Track progress toward your monthly targets</p>
                    <div className="goals-list">
                        <div className="goal-item">
                            <div className="goal-header">
                                <span className="goal-title">New Members</span>
                                <span className="goal-value">{stats?.new_members_month || 0} / {stats?.new_members_goal || 50}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{
                                    width: `${Math.min(stats?.new_members_percent || 0, 100)}%`,
                                    background: (stats?.new_members_percent || 0) >= 100 ? '#10b981' : '#3b82f6'
                                }}></div>
                            </div>
                            <p className={`goal-status ${(stats?.new_members_percent || 0) >= 100 ? 'success' : ''}`}>
                                {(stats?.new_members_percent || 0) >= 100
                                    ? `Goal exceeded! ${stats?.new_members_percent}% completed`
                                    : `${stats?.new_members_percent || 0}% completed`}
                            </p>
                        </div>
                        <div className="goal-item">
                            <div className="goal-header">
                                <span className="goal-title">Tithes (Last 3 Months)</span>
                                <span className="goal-value">{tithesFormatted} / GH₵{(stats?.donations_goal || 60000) / 1000}K</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{
                                    width: `${Math.min(tithesPercent, 100)}%`,
                                    background: tithesPercent >= 100 ? '#10b981' : '#3b82f6'
                                }}></div>
                            </div>
                            <p className={`goal-status ${tithesPercent >= 100 ? 'success' : ''}`}>
                                {tithesPercent >= 100
                                    ? `Goal exceeded! ${tithesPercent}% completed`
                                    : tithesPercent >= 90
                                        ? `Almost there! ${tithesPercent}% completed`
                                        : `${tithesPercent}% completed`}
                            </p>
                        </div>
                        <div className="goal-item">
                            <div className="goal-header">
                                <span className="goal-title">Event Attendance</span>
                                <span className="goal-value">{stats?.event_attendance_month || 0} / {stats?.attendance_goal || 400}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{
                                    width: `${Math.min(stats?.attendance_percent || 0, 100)}%`,
                                    background: (stats?.attendance_percent || 0) >= 100 ? '#10b981' : '#3b82f6'
                                }}></div>
                            </div>
                            <p className="goal-status">{stats?.attendance_percent || 0}% completed</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
