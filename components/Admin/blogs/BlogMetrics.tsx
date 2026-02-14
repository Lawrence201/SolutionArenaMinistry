'use client';

import React from 'react';
import { BookOpen, CheckCircle, Clock, Star } from 'lucide-react';

interface BlogMetricsProps {
    stats: {
        total: number;
        published: number;
        drafts: number;
        featured: number;
    };
}

export default function BlogMetrics({ stats }: BlogMetricsProps) {
    const metricItems = [
        { label: 'Total Posts', value: stats.total, icon: <BookOpen size={24} />, color: 'blue', badge: 'ALL TIME' },
        { label: 'Published', value: stats.published, icon: <CheckCircle size={24} />, color: 'emerald', badge: 'LIVE' },
        { label: 'Drafts', value: stats.drafts, icon: <Clock size={24} />, color: 'amber', badge: 'PENDING' },
        { label: 'Featured', value: stats.featured, icon: <Star size={24} />, color: 'purple', badge: 'HIGHLIGHTED' },
    ];

    return (
        <div className="cf-sermon-metrics-container">
            {metricItems.map((item, idx) => (
                <div key={idx} className="cf-sermon-metric-card">
                    <div className={`cf-metric-icon cf-metric-${item.color}`} style={{
                        borderLeft: `4px solid var(--color-${item.color}-500)`
                    }}>
                        {item.icon}
                    </div>
                    <div className="cf-metric-content">
                        <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', margin: '0' }}>{item.value}</h3>
                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{item.label}</p>
                        <div style={{ marginTop: '8px' }}>
                            <span className={`cf-status-badge badge-${item.color}`} style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                background: `var(--badge-${item.color}-bg, #f1f5f9)`,
                                color: `var(--badge-${item.color}-text, #64748b)`
                            }}>
                                {item.badge}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
