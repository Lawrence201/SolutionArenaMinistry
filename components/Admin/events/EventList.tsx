'use client';

import React from 'react';
import styles from '@/app/admin/events/events.module.css';

interface EventListProps {
    events: any[];
    filter: string;
    onFilterChange: (filter: string) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onDeleteEvent: (id: number) => void;
    onViewEvent: (event: any) => void;
}

const Icons = {
    Search: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
    ),
    Calendar: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
    Users: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    Clock: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    MapPin: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
    )
};

export default function EventList({
    events,
    filter,
    onFilterChange,
    searchTerm,
    onSearchChange,
    onDeleteEvent,
    onViewEvent
}: EventListProps) {

    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return styles['cf-em-confirmed'];
            case 'cancelled': return styles['cf-em-cancelled'];
            case 'needs-volunteers': return styles['cf-em-needs-volunteers'];
            case 'needs-planning': return styles['cf-em-needs-planning'];
            default: return '';
        }
    };

    const getTypeBadgeClass = (type: string) => {
        switch (type.toLowerCase()) {
            case 'service': return styles['cf-em-service'];
            case 'ministry': return styles['cf-em-ministry'];
            case 'study': return styles['cf-em-study'];
            case 'outreach': return styles['cf-em-outreach'];
            case 'retreat': return styles['cf-em-retreat'];
            default: return '';
        }
    };

    return (
        <div className={styles['cf-em-events-section']}>
            <div className={styles['cf-em-events-controls']}>
                <div className={styles['cf-em-tabs']}>
                    {['all', 'upcoming', 'service', 'ministry'].map(t => (
                        <button
                            key={t}
                            className={`${styles['cf-em-tab']} ${filter === t ? styles['cf-em-active'] : ''}`}
                            onClick={() => onFilterChange(t)}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
                <div className={styles['cf-em-search-bar']}>
                    <span className={styles['cf-em-search-icon']}><Icons.Search /></span>
                    <input
                        type="text"
                        placeholder="Search events..."
                        className={styles['cf-em-search-input']}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles['cf-em-event-list']}>
                {events.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No events found matching your criteria</div>
                ) : (
                    events.map(event => {
                        const percentage = event.max_capacity > 0 ? Math.round(((event.attending || 0) / event.max_capacity) * 100) : 0;
                        const attendingCount = event.attending || 0;
                        const volunteersCount = event.volunteers_needed || 0;

                        return (
                            <div key={event.id} className={styles['cf-em-event-card']}>
                                <div className={styles['cf-em-event-image-container']}>
                                    <img
                                        src={event.image_path || '/placeholder-event.jpg'}
                                        alt={event.name}
                                        className={styles['cf-em-event-image']}
                                        onError={(e) => (e.currentTarget.src = '/placeholder-event.jpg')}
                                    />
                                    <div className={styles['cf-em-event-image-overlay']}>
                                        <div className={styles['cf-em-event-badges']}>
                                            <span className={`${styles['cf-em-badge']} ${getTypeBadgeClass(event.type)}`}>
                                                {event.type}
                                            </span>
                                            <span className={`${styles['cf-em-badge']} ${getStatusBadgeClass(event.status)}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles['cf-em-event-content']}>
                                    <div className={styles['cf-em-event-header']}>
                                        <div className={styles['cf-em-event-title-row']}>
                                            <h3 className={styles['cf-em-event-title']}>{event.name}</h3>
                                        </div>
                                        <div className={styles['cf-em-event-actions']}>
                                            <button
                                                className={styles['cf-em-event-btn']}
                                                onClick={() => window.location.href = `/admin/edit-event/${event.id}`}
                                            >
                                                Edit
                                            </button>
                                            <button className={styles['cf-em-event-btn']} onClick={() => onViewEvent(event)}>View</button>
                                            <button
                                                className={styles['cf-em-event-btn']}
                                                style={{ background: '#ef4444', color: 'white', borderColor: '#ef4444' }}
                                                onClick={() => onDeleteEvent(event.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p className={styles['cf-em-event-description']}>
                                        {event.description && event.description.length > 100
                                            ? event.description.substring(0, 100) + '...'
                                            : event.description}
                                    </p>
                                    <div className={styles['cf-em-event-details']}>
                                        <div className={styles['cf-em-event-detail-item']}>
                                            <span className={styles['cf-em-detail-icon']}><Icons.Calendar /></span>
                                            <span>{new Date(event.start_date + 'T00:00:00').toLocaleDateString()}</span>
                                        </div>
                                        <div className={styles['cf-em-event-detail-item']}>
                                            <span className={styles['cf-em-detail-icon']}><Icons.Users /></span>
                                            <span>{attendingCount} / {event.max_capacity} attending</span>
                                        </div>
                                        <div className={styles['cf-em-event-detail-item']}>
                                            <span className={styles['cf-em-detail-icon']}><Icons.Clock /></span>
                                            <span>
                                                {(() => {
                                                    if (!event.start_time) return '';
                                                    if (typeof event.start_time === 'string' && event.start_time.includes(':')) {
                                                        const [hours, minutes] = event.start_time.split(':');
                                                        const date = new Date();
                                                        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                                                        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                                                    }
                                                    return new Date(event.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                                                })()}
                                            </span>
                                        </div>
                                        <div className={styles['cf-em-event-detail-item']}>
                                            <span className={styles['cf-em-detail-icon']}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></span>
                                            <span>{volunteersCount} volunteers</span>
                                        </div>
                                        <div className={styles['cf-em-event-detail-item']}>
                                            <span className={styles['cf-em-detail-icon']}><Icons.MapPin /></span>
                                            <span>{event.location}</span>
                                        </div>

                                        {event.contact_person && (
                                            <div className={styles['cf-em-event-detail-item']} style={{ gridColumn: '1 / -1', marginTop: '4px', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {event.contact_person_image ? (
                                                        <img src={event.contact_person_image} alt="Contact" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>
                                                            {event.contact_person.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                                                        Contact: <span style={{ fontWeight: 500, color: '#334155' }}>{event.contact_person}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles['cf-em-event-stats']}>
                                        <div className={styles['cf-em-progress-bar']}>
                                            <div
                                                className={styles['cf-em-progress-fill']}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
