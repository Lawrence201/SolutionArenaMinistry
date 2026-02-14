'use client';

import React from 'react';
import { MemberInsight } from '@/app/actions/memberActions';

type MemberInsightsProps = {
    insights: MemberInsight[];
};

export default function MemberInsights({ insights }: MemberInsightsProps) {
    const getIcon = (iconName: string, type: 'success' | 'warning' | 'info' | 'error') => {
        const colors = {
            'success': '#10b981',
            'warning': '#f59e0b',
            'info': '#3b82f6',
            'error': '#ef4444'
        };
        const color = colors[type] || '#64748b';

        switch (iconName) {
            case 'trending-up':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                );
            case 'trending-down':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                        <polyline points="17 18 23 18 23 12"></polyline>
                    </svg>
                );
            case 'users':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                );
            case 'alert':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                );
            case 'calendar':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                );
            case 'user-check':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <polyline points="17 11 19 13 23 9"></polyline>
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="insights-section">
            <div className="insights-header">
                <div className="insight-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="insight-icon">
                            {/* AI Chatbot Icon - using chatbot.png from legacy */}
                            <img src="/images/chatbot.png" alt="AI Insights" style={{ width: '32px', height: '32px' }} />
                        </span>

                        <h2>AI-Powered Insights</h2>
                    </div>
                </div>
                <p style={{ color: '#94a3b8', marginTop: '4px' }}>Real-time analytics and recommendations</p>

                <div className="cf-alerts-layout">
                    {(!insights || insights.length === 0) ? (
                        <div className="cf-alert-tile" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>
                            <p style={{ color: '#94a3b8' }}>No insights available - add more data to see AI insights</p>
                        </div>
                    ) : (
                        insights.map((insight, index) => (
                            <div key={index} className={`cf-alert-tile cf-${insight.type}`}>
                                <span className="cf-alert-symbol">
                                    {getIcon(insight.icon, insight.type)}
                                </span>
                                <div className="cf-alert-text">
                                    <p>{insight.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
