'use client';

import React from 'react';
import styles from '@/app/admin/events/events.module.css';

interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: any;
}

export default function EventDetailModal({ isOpen, onClose, event }: EventDetailModalProps) {
    if (!isOpen || !event) return null;

    const percentage = event.max_capacity > 0 ? Math.round(((event.attending || 0) / event.max_capacity) * 100) : 0;

    // Formatting helpers
    const formatDate = (dateString: string | Date | undefined) => {
        if (!dateString) return '';
        // If it comes as "YYYY-MM-DD", append T00:00:00 to avoid timezone shifts
        const d = new Date(typeof dateString === 'string' && dateString.includes('-') && !dateString.includes('T')
            ? dateString + 'T00:00:00'
            : dateString);
        return d.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatTime = (timeString: string | Date | undefined) => {
        if (!timeString) return '';
        if (typeof timeString === 'string' && timeString.includes(':')) {
            const [hours, minutes] = timeString.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        }
        return new Date(timeString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className={`${styles['cf-em-modal']} ${isOpen ? styles['cf-em-show'] : ''}`} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={styles['cf-em-modal-content']}>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={onClose}
                        className={styles['cf-em-modal-close']}
                    >
                        &times;
                    </button>

                    {/* Event Image */}
                    <div className={styles['cf-em-event-image-container']} style={{ height: '300px' }}>
                        <img
                            src={event.image_path || '/placeholder-event.jpg'}
                            alt={event.name}
                            className={styles['cf-em-event-image']}
                            onError={(e) => (e.currentTarget.src = '/placeholder-event.jpg')}
                        />
                    </div>

                    <div style={{ padding: '24px' }}>
                        {/* Event Header */}
                        <div className={styles['cf-em-event-detail-section']}>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>{event.name}</h3>
                            <div className={styles['cf-em-event-badges']} style={{ margin: '10px 0 20px 0' }}>
                                <span className={`${styles['cf-em-badge']} ${styles[`cf-em-${event.type?.toLowerCase()}`]}`}>{event.type}</span>
                                <span className={`${styles['cf-em-badge']} ${styles[`cf-em-${event.category ? event.category.toLowerCase() : 'general'}`]}`}>{event.category || 'General'}</span>
                                <span className={`${styles['cf-em-badge']} ${styles[`cf-em-${event.status?.toLowerCase()}`]}`}>{event.status}</span>
                            </div>
                            <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>{event.description}</p>

                            <div className={styles['cf-em-stats-row']}>
                                <div className={styles['cf-em-stat-box']}>
                                    <div className={styles['cf-em-stat-box-value']}>{event.attending || 0}</div>
                                    <div className={styles['cf-em-stat-box-label']}>Attending</div>
                                </div>
                                <div className={styles['cf-em-stat-box']}>
                                    <div className={styles['cf-em-stat-box-value']}>{event.max_capacity}</div>
                                    <div className={styles['cf-em-stat-box-label']}>Capacity</div>
                                </div>
                                <div className={styles['cf-em-stat-box']}>
                                    <div className={styles['cf-em-stat-box-value']}>{event.volunteers_needed || 0}</div>
                                    <div className={styles['cf-em-stat-box-label']}>Volunteers</div>
                                </div>
                                <div className={styles['cf-em-stat-box']}>
                                    <div className={styles['cf-em-stat-box-value']}>{percentage}%</div>
                                    <div className={styles['cf-em-stat-box-label']}>Filled</div>
                                </div>
                            </div>
                        </div>

                        {/* Date & Time Information */}
                        <div className={styles['cf-em-event-detail-section']}>
                            <h3>Date & Time</h3>
                            <div className={styles['cf-em-detail-grid']}>
                                <div className={styles['cf-em-detail-item']}>
                                    <span className={styles['cf-em-detail-label']}>Start Date</span>
                                    <span className={styles['cf-em-detail-value']}>{formatDate(event.start_date)}</span>
                                </div>
                                <div className={styles['cf-em-detail-item']}>
                                    <span className={styles['cf-em-detail-label']}>Start Time</span>
                                    <span className={styles['cf-em-detail-value']}>{formatTime(event.start_time)}</span>
                                </div>
                                <div className={styles['cf-em-detail-item']}>
                                    <span className={styles['cf-em-detail-label']}>End Date</span>
                                    <span className={styles['cf-em-detail-value']}>{formatDate(event.end_date)}</span>
                                </div>
                                <div className={styles['cf-em-detail-item']}>
                                    <span className={styles['cf-em-detail-label']}>End Time</span>
                                    <span className={styles['cf-em-detail-value']}>{formatTime(event.end_time)}</span>
                                </div>
                                {event.is_recurring && (
                                    <div className={styles['cf-em-detail-item']} style={{ gridColumn: '1 / -1' }}>
                                        <span className={styles['cf-em-detail-label']}>Recurring Event</span>
                                        <span className={styles['cf-em-detail-value']}>Yes</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className={styles['cf-em-event-detail-section']}>
                            <h3>Location</h3>
                            <div className={styles['cf-em-detail-grid']}>
                                <div className={styles['cf-em-detail-item']}>
                                    <span className={styles['cf-em-detail-label']}>Venue</span>
                                    <span className={styles['cf-em-detail-value']}>{event.location}</span>
                                </div>
                                {event.room_building && (
                                    <div className={styles['cf-em-detail-item']}>
                                        <span className={styles['cf-em-detail-label']}>Room/Building</span>
                                        <span className={styles['cf-em-detail-value']}>{event.room_building}</span>
                                    </div>
                                )}
                                {event.full_address && (
                                    <div className={styles['cf-em-detail-item']} style={{ gridColumn: '1 / -1' }}>
                                        <span className={styles['cf-em-detail-label']}>Address</span>
                                        <span className={styles['cf-em-detail-value']}>{event.full_address}</span>
                                    </div>
                                )}
                                {event.is_virtual && (
                                    <>
                                        <div className={styles['cf-em-detail-item']}>
                                            <span className={styles['cf-em-detail-label']}>Virtual Event</span>
                                            <span className={styles['cf-em-detail-value']}>Yes</span>
                                        </div>
                                        {event.virtual_link && (
                                            <div className={styles['cf-em-detail-item']}>
                                                <span className={styles['cf-em-detail-label']}>Virtual Link</span>
                                                <span className={styles['cf-em-detail-value']}>
                                                    <a href={event.virtual_link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{event.virtual_link}</a>
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Registration & Access */}
                        <div className={styles['cf-em-event-detail-section']}>
                            <h3>Registration & Access</h3>
                            <div className={styles['cf-em-detail-grid']}>
                                <div className={styles['cf-em-detail-item']}>
                                    <span className={styles['cf-em-detail-label']}>Requires Registration</span>
                                    <span className={styles['cf-em-detail-value']}>{event.require_registration ? 'Yes' : 'No'}</span>
                                </div>
                                {event.registration_deadline && (
                                    <div className={styles['cf-em-detail-item']}>
                                        <span className={styles['cf-em-detail-label']}>Registration Deadline</span>
                                        <span className={styles['cf-em-detail-value']}>{formatDate(event.registration_deadline)}</span>
                                    </div>
                                )}
                                <div className={styles['cf-em-detail-item']}>
                                    <span className={styles['cf-em-detail-label']}>Open to Public</span>
                                    <span className={styles['cf-em-detail-value']}>{event.open_to_public ? 'Yes' : 'No'}</span>
                                </div>
                                <div className={styles['cf-em-detail-item']}>
                                    <span className={styles['cf-em-detail-label']}>Age Group</span>
                                    <span className={styles['cf-em-detail-value']}>{event.age_group || 'All'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Volunteer Roles */}
                        {event.volunteerRoles && event.volunteerRoles.length > 0 && (
                            <div className={styles['cf-em-event-detail-section']}>
                                <h3>Volunteer Roles</h3>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: '#f8fafc' }}>
                                            <tr>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Role</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Needed</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {event.volunteerRoles.map((role: any) => (
                                                <tr key={role.id}>
                                                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #e2e8f0' }}>{role.role_name}</td>
                                                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #e2e8f0' }}>{role.quantity_needed}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                            <div className={styles['cf-em-event-detail-section']}>
                                <h3>Tags</h3>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {event.tags.map((tag: any) => (
                                        <span key={tag.id} style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '16px', fontSize: '13px', fontWeight: '500' }}>
                                            #{tag.tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                onClick={onClose}
                                className={styles['cf-em-event-btn']}
                                style={{ padding: '10px 24px', fontSize: '14px' }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => window.location.href = `/admin/edit-event/${event.id}`}
                                className={styles['cf-em-event-btn']}
                                style={{ padding: '10px 24px', fontSize: '14px', background: '#2563eb', color: 'white', borderColor: '#2563eb' }}
                            >
                                Edit Event
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
