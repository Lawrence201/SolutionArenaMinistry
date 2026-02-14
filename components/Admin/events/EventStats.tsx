import React from 'react';
import styles from '@/app/admin/events/events.module.css';

interface EventMetrics {
    total_events: number;
    upcoming_events: number;
    in_service_events: number;
    past_events: number;
}

interface EventStatsProps {
    metrics: EventMetrics;
}

const Icons = {
    Calendar: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
    Clock: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Users: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )
};

export default function EventStats({ metrics }: EventStatsProps) {
    return (
        <section className={styles['cf-event-metrics-container']}>
            <div className={styles['cf-event-metric-card']}>
                <div className={`${styles['cf-metric-icon']} ${styles['cf-metric-total']}`}>
                    <Icons.Calendar />
                </div>
                <div className={styles['cf-metric-content']}>
                    <h3>{metrics.total_events}</h3>
                    <p>Total Events</p>
                    <span className={styles['cf-metric-badge']}>This Year</span>
                </div>
            </div>
            <div className={styles['cf-event-metric-card']}>
                <div className={`${styles['cf-metric-icon']} ${styles['cf-metric-upcoming']}`}>
                    <Icons.Clock />
                </div>
                <div className={styles['cf-metric-content']}>
                    <h3>{metrics.upcoming_events}</h3>
                    <p>Upcoming</p>
                    <span className={styles['cf-metric-badge']}>Next 30 Days</span>
                </div>
            </div>
            <div className={styles['cf-event-metric-card']}>
                <div className={`${styles['cf-metric-icon']} ${styles['cf-metric-service']}`}>
                    <Icons.Users />
                </div>
                <div className={styles['cf-metric-content']}>
                    <h3>{metrics.in_service_events}</h3>
                    <p>In Service</p>
                    <span className={styles['cf-metric-badge']}>Active Today</span>
                </div>
            </div>
        </section>
    );
}
