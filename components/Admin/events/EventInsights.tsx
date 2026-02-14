'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/app/admin/events/events.module.css';
import { getEventInsights } from '@/app/actions/event';

// Icons mapping based on PHP logic
const Icons: Record<string, React.ReactNode> = {
    calendar: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
    users: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    'trending-up': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
    ),
    message: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    )
};

export default function EventInsights() {
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            const result = await getEventInsights();
            if (result.success && result.data) {
                setInsights(result.data);
            }
            setLoading(false);
        };
        fetchInsights();
    }, []);

    return (
        <div className={styles['insights-section']}>
            <div className={styles['insights-header']}>
                <img src="/images/chatbot.png" alt="AI Insights" />
                <h2>AI-Powered Insights</h2>
            </div>

            <div className={styles['insights-grid']}>
                {loading ? (
                    <div className={styles['insight-card']} style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1', background: '#f8fafc' }}>
                        <p className={styles['insight-text']}>Loading insights...</p>
                    </div>
                ) : insights.length === 0 ? (
                    <div className={styles['insight-card']} style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1', background: '#f8fafc' }}>
                        <p className={styles['insight-text']}>No insights available right now.</p>
                    </div>
                ) : (
                    insights.map((insight, index) => (
                        <div key={index} className={`${styles['insight-card']} ${styles[insight.type]}`}>
                            <div className={styles['insight-icon']}>
                                {Icons[insight.icon] || Icons.calendar}
                            </div>
                            <div className={styles['insight-text']}>
                                {insight.text}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
