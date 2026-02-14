'use client';

import { useState } from 'react';
import ExecutiveSummary from '@/components/Admin/reports/ExecutiveSummary';
import FinancialAnalytics from '@/components/Admin/reports/FinancialAnalytics';
import AttendanceAnalytics from '@/components/Admin/reports/AttendanceAnalytics';
import VisitorAnalytics from '@/components/Admin/reports/VisitorAnalytics';
import CommunicationAnalytics from '@/components/Admin/reports/CommunicationAnalytics';
import KeyInsights from '@/components/Admin/reports/KeyInsights';
import './reports.css';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('executive');

    const tabs = [
        { id: 'executive', label: 'Executive Summary' },
        { id: 'insights', label: 'Key Insights' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'visitors', label: 'Visitors' },
        { id: 'financial', label: 'Financial' },
        { id: 'birthdays', label: 'Birthday Analytics' },
        { id: 'blogs', label: 'Blog Analytics' },
        { id: 'communication', label: 'Communication' },
        { id: 'engagement', label: 'Engagement' }
    ];

    return (
        <div className="reports-dashboard">
            {/* High-Fidelity Header */}
            <div className="ride-header">
                <div className="vibe-content">
                    <h1>Reports & Analytics</h1>
                    <p>Comprehensive insights into church performance, member engagement, and financial health</p>
                </div>
                <div className="flow-actions">
                    <button className="pulse-btn pulse-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                        Generate Report
                    </button>
                    <button className="pulse-btn pulse-secondary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export All
                    </button>
                </div>
            </div>

            {/* Legacy Filter Bar */}
            <div className="rampa-filters">
                <div className="wave-group">
                    <label className="tide-label">Select Range</label>
                    <select className="flow-select">
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                        <option>All Time</option>
                    </select>
                </div>
                <div className="wave-group">
                    <label className="tide-label">Member Type</label>
                    <select className="flow-select">
                        <option>All Members</option>
                        <option>Adults</option>
                        <option>Youth</option>
                        <option>Children</option>
                    </select>
                </div>
                <div className="wave-group">
                    <label className="tide-label">Ministry</label>
                    <select className="flow-select">
                        <option>All Ministries</option>
                        <option>Youth Ministry</option>
                        <option>Worship Team</option>
                        <option>Children's Ministry</option>
                        <option>Prayer Team</option>
                    </select>
                </div>
                <button className="pulse-btn pulse-primary" style={{ marginBottom: 0 }}>
                    Apply Filters
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="rampa-tabs">
                <div className="vibe-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`flow-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content-area">
                <div className={`tab-pann ${activeTab === 'executive' ? 'acti' : ''}`}>
                    {activeTab === 'executive' && <ExecutiveSummary />}
                </div>

                <div className={`tab-pann ${activeTab === 'insights' ? 'acti' : ''}`}>
                    {activeTab === 'insights' && <KeyInsights />}
                </div>

                <div className={`tab-pann ${activeTab === 'attendance' ? 'acti' : ''}`}>
                    {activeTab === 'attendance' && <AttendanceAnalytics />}
                </div>

                <div className={`tab-pann ${activeTab === 'visitors' ? 'acti' : ''}`}>
                    {activeTab === 'visitors' && <VisitorAnalytics />}
                </div>

                <div className={`tab-pann ${activeTab === 'financial' ? 'acti' : ''}`}>
                    {activeTab === 'financial' && <FinancialAnalytics />}
                </div>

                <div className={`tab-pann ${activeTab === 'birthdays' ? 'acti' : ''}`}>
                    {activeTab === 'birthdays' && (
                        <div className="placeholder-content">
                            <div className="placeholder-icon">🎂</div>
                            <h3>Birthday Analytics</h3>
                            <p>Upcoming birthdays and celebration tracking</p>
                            <p className="coming-soon">Coming Soon</p>
                        </div>
                    )}
                </div>

                <div className={`tab-pann ${activeTab === 'blogs' ? 'acti' : ''}`}>
                    {activeTab === 'blogs' && (
                        <div className="placeholder-content">
                            <div className="placeholder-icon">📝</div>
                            <h3>Blog Analytics</h3>
                            <p>Content performance and engagement metrics</p>
                            <p className="coming-soon">Coming Soon</p>
                        </div>
                    )}
                </div>

                <div className={`tab-pann ${activeTab === 'communication' ? 'acti' : ''}`}>
                    {activeTab === 'communication' && <CommunicationAnalytics />}
                </div>

                <div className={`tab-pann ${activeTab === 'engagement' ? 'acti' : ''}`}>
                    {activeTab === 'engagement' && (
                        <div className="placeholder-content">
                            <div className="placeholder-icon">🤝</div>
                            <h3>Engagement</h3>
                            <p>Detailed member lifestyle and contribution tracking</p>
                            <p className="coming-soon">Coming Soon</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

