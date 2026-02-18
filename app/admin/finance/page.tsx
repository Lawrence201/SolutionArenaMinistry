'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Admin/Sidebar';
import OverviewTab from '@/components/Admin/Finance/OverviewTab';
import OfferingsTab from '@/components/Admin/Finance/OfferingsTab';
import ProjectOfferingsTab from '@/components/Admin/Finance/ProjectOfferingsTab';
import TithesTab from '@/components/Admin/Finance/TithesTab';
import WelfareTab from '@/components/Admin/Finance/WelfareTab';
import MemberPaymentsTab from '@/components/Admin/Finance/MemberPaymentsTab';
import ExpensesTab from '@/components/Admin/Finance/ExpensesTab';
import WithdrawalsTab from '@/components/Admin/Finance/WithdrawalsTab';
import './finance.css';

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalOfferings: 0,
        totalTithes: 0,
        totalProjectOfferings: 0,
        totalWelfare: 0,
        totalExpenses: 0
    });
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingInsights, setLoadingInsights] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const response = await fetch('/api/finance/insights');
            const data = await response.json();
            if (data.success) {
                setInsights(data.data);
            }
        } catch (error) {
            console.error('Error fetching insights:', error);
        } finally {
            setLoadingInsights(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/finance/stats');
            const data = await response.json();
            if (data.success) {
                setStats({
                    totalOfferings: data.data.offerings?.total || 0,
                    totalTithes: data.data.tithes?.total || 0,
                    totalProjectOfferings: data.data.project_offerings?.total || 0,
                    totalWelfare: data.data.welfare?.total || 0,
                    totalExpenses: data.data.expenses?.total || 0
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Helper for AI Insight Icons (Legacy SVGs)
    const getInsightIcon = (icon: string, type: string) => {
        const colors: any = {
            'success': '#10b981',
            'warning': '#f59e0b',
            'info': '#3b82f6',
            'danger': '#ef4444'
        };
        const color = colors[type] || '#64748b';

        switch (icon) {
            case 'trending-up':
                return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
            case 'trending-down':
                return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>;
            case 'dollar':
                return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
            case 'alert':
                return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
            case 'target':
                return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
            case 'piggy-bank':
                return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path><path d="M2 9v1c0 1.1.9 2 2 2h1"></path><path d="M16 11h0"></path></svg>;
            case 'users':
                return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
            case 'clock':
                return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
            default:
                return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
        }
    };

    return (
        <div className="finance-page">
            <div className="cf-header-primary">
                <div className="cf-heading-zone">
                    <h1>Financial Management</h1>
                    <p>Track donations, expenses, and budgets with AI-powered insights</p>
                </div>
                <div className="cf-controls-cluster">
                    <button className="cf-btn cf-btn-alternate">
                        <span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7,10 12,15 17,10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </span>
                        <span>Export Report</span>
                    </button>
                    <a href="#" className="cf-btn cf-btn-main">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                        </span>
                        <span>Record Donation</span>
                    </a>
                </div>
            </div>

            {/* AI Insights Section (Legacy Replica) */}
            <div className="insights-section">
                <div className="insights-header">
                    <div className="insight-header-row">
                        <span className="insight-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5B4FDE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                <path d="M8 9h8"></path>
                                <path d="M8 13h6"></path>
                            </svg>
                        </span>
                        <h2>AI-Powered Insights</h2>
                    </div>
                    <div className="cf-alerts-layout">
                        {loadingInsights ? (
                            <div className="cf-alert-tile" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1', borderLeft: 'none', display: 'block' }}>
                                <p style={{ color: '#94a3b8' }}>Loading insights...</p>
                            </div>
                        ) : (insights && insights.length > 0) ? (
                            insights.map((insight, index) => (
                                <div key={index} className={`cf-alert-tile cf-${insight.type}`}>
                                    <span className="cf-alert-symbol">
                                        {getInsightIcon(insight.icon, insight.type)}
                                    </span>
                                    <div className="cf-alert-text">
                                        <p>{insight.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="cf-alert-tile" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1', borderLeft: 'none', display: 'block' }}>
                                <p style={{ color: '#94a3b8' }}>No insights available - add more data to see AI analysis</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <section className="zzamp_statsarea">
                <div className="zorp_container">
                    <div className="zzamp_statsgrid">
                        {/* Card 1 - Total Offerings */}
                        <div className="zzamp_statcard zzamp_cardblue">
                            <div className="zzamp_stathead">
                                <span className="zzamp_stattitle">Total Offerings</span>
                                <div className="zzamp_staticon zzamp_iconblue">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#5B4FDE" fontSize="18" fontWeight="bold">₵</text>
                                    </svg>
                                </div>
                            </div>
                            <div className="zzamp_statval">{loading ? '₵0.00' : formatCurrency(stats.totalOfferings)}</div>
                            <div className="zzamp_statchg" style={{ color: '#6b7280', fontWeight: 500 }}>Grand Total (All Time)</div>
                        </div>

                        {/* Card 2 - Total Tithes */}
                        <div className="zzamp_statcard zzamp_cardgreen">
                            <div className="zzamp_stathead">
                                <span className="zzamp_stattitle">Total Tithes</span>
                                <div className="zzamp_staticon zzamp_icongreen">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M13 7L19 13M19 13L13 19M19 13H5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="zzamp_statval">{loading ? '₵0.00' : formatCurrency(stats.totalTithes)}</div>
                            <div className="zzamp_statchg" style={{ color: '#6b7280', fontWeight: 500 }}>Grand Total (All Time)</div>
                        </div>

                        {/* Card 3 - Project Offerings */}
                        <div className="zzamp_statcard zzamp_cardyellow">
                            <div className="zzamp_stathead">
                                <span className="zzamp_stattitle">Project Offerings</span>
                                <div className="zzamp_staticon zzamp_iconyellow">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect x="5" y="5" width="14" height="14" rx="2" stroke="#F59E0B" strokeWidth="2" />
                                        <path d="M9 9H15M9 12H15M9 15H12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="zzamp_statval">{loading ? '₵0.00' : formatCurrency(stats.totalProjectOfferings)}</div>
                            <div className="zzamp_statchg" style={{ color: '#6b7280', fontWeight: 500 }}>Grand Total (All Time)</div>
                        </div>

                        {/* Card 4 - Welfare Dues */}
                        <div className="zzamp_statcard zzamp_cardpink">
                            <div className="zzamp_stathead">
                                <span className="zzamp_stattitle">Welfare Dues</span>
                                <div className="zzamp_staticon zzamp_iconpink">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#E879F9" strokeWidth="2" />
                                        <path d="M12 8V12L14.5 14.5" stroke="#E879F9" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="zzamp_statval">{loading ? '₵0.00' : formatCurrency(stats.totalWelfare)}</div>
                            <div className="zzamp_statchg" style={{ color: '#6b7280', fontWeight: 500 }}>Grand Total (All Time)</div>
                        </div>

                        {/* Card 5 - Net Expenses */}
                        <div className="zzamp_statcard zzamp_cardgray">
                            <div className="zzamp_stathead">
                                <span className="zzamp_stattitle">Net Expenses</span>
                                <div className="zzamp_staticon zzamp_icongray">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="2" />
                                        <path d="M12 8V12M12 16H12.01" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="zzamp_statval">{loading ? '₵0.00' : formatCurrency(stats.totalExpenses)}</div>
                            <div className="zzamp_statchg" style={{ color: '#6b7280', fontWeight: 500 }}>Expenses + Withdrawals (All Time)</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="qery_tabsarea">
                <div className="zorp_container">
                    <div className="qery_tabsbar">
                        <div className="qery_tabslist">
                            <button className={`qery_tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                            <button className={`qery_tab ${activeTab === 'offerings' ? 'active' : ''}`} onClick={() => setActiveTab('offerings')}>Offerings</button>
                            <button className={`qery_tab ${activeTab === 'project-offerings' ? 'active' : ''}`} onClick={() => setActiveTab('project-offerings')}>Project Offering</button>
                            <button className={`qery_tab ${activeTab === 'tithes' ? 'active' : ''}`} onClick={() => setActiveTab('tithes')}>Tithes (CPS)</button>
                            <button className={`qery_tab ${activeTab === 'welfare' ? 'active' : ''}`} onClick={() => setActiveTab('welfare')}>Welfare</button>
                            <button className={`qery_tab ${activeTab === 'member-payments' ? 'active' : ''}`} onClick={() => setActiveTab('member-payments')}>Member Payments</button>
                            <button className={`qery_tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>Expenses</button>
                            <button className={`qery_tab ${activeTab === 'withdrawals' ? 'active' : ''}`} onClick={() => setActiveTab('withdrawals')}>Withdrawals</button>
                        </div>
                        <button className="qery_filbtn">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Filter
                        </button>
                    </div>
                </div>
            </section>

            {/* Tab Content */}
            <div className="dashboard-content-tabs">
                {activeTab === 'overview' && <OverviewTab />}

                {activeTab === 'offerings' && <OfferingsTab />}

                {activeTab === 'project-offerings' && <ProjectOfferingsTab />}

                {activeTab === 'tithes' && <TithesTab />}

                {activeTab === 'welfare' && <WelfareTab />}

                {activeTab === 'member-payments' && <MemberPaymentsTab />}

                {activeTab === 'expenses' && <ExpensesTab />}

                {activeTab === 'withdrawals' && <WithdrawalsTab />}
            </div>
        </div>
    );
}
