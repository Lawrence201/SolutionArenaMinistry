'use client';

import { useEffect, useState } from 'react';
import '@/app/admin/reports/reports.css';

interface Insight {
    type: "success" | "warning" | "info" | "danger";
    icon: string;
    text: string;
    priority: number;
    module: string;
}

export default function KeyInsights() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await fetch('/api/admin/insights');
                const data = await response.json();
                if (data.success) {
                    setInsights(data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch insights:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
        const interval = setInterval(fetchInsights, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const getInsightIcon = (iconType: string, type: string) => {
        const color = type === 'success' ? '#10b981' :
            type === 'warning' ? '#f59e0b' :
                type === 'danger' ? '#ef4444' : '#3b82f6';

        const icons: { [key: string]: string } = {
            'trending-up': `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`,
            'trending-down': `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 6"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>`,
            'users': `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
            'alert': `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            'dollar': `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
            'calendar': `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
            'mail': `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
            'message': `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
            'clock': `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
            'user-check': `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>`
        };

        return icons[iconType] || icons['alert'];
    };

    const getCardClass = (type: string) => {
        switch (type) {
            case 'success': return 'succ';
            case 'warning': return 'warn';
            case 'info': return 'info';
            case 'danger': return 'danger';
            default: return '';
        }
    };

    return (
        <div className="tab-pann acti" id="insights">
            <div className="ins-grid">
                {loading ? (
                    <div className="ins-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                        <div className="ins-tex" style={{ color: '#94a3b8' }}>Loading insights from all modules...</div>
                    </div>
                ) : insights.length === 0 ? (
                    <div className="ins-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                        <div className="ins-tex" style={{ color: '#94a3b8' }}>No insights available yet - add more data to see AI-powered insights</div>
                    </div>
                ) : (
                    insights.map((insight, index) => (
                        <div key={index} className={`ins-card ${getCardClass(insight.type)}`}>
                            <div className="ins-ico"
                                style={{ width: '22px', height: '22px', marginBottom: '16px' }}
                                dangerouslySetInnerHTML={{ __html: getInsightIcon(insight.icon, insight.type) }}
                            />
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 10px',
                                    background: 'rgba(99, 102, 241, 0.08)',
                                    color: '#4f46e5',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {insight.module}
                                </span>
                            </div>
                            <div className="ins-tex">{insight.text}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
