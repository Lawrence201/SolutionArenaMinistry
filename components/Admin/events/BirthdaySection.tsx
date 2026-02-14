'use client';

import React from 'react';
import styles from '@/app/admin/events/events.module.css';

interface BirthdaySectionProps {
    birthdayData: any;
    birthdayMonth: number;
    onMonthChange: (delta: number) => void;
    onMonthSelect: (month: number) => void;
    birthdayTab: string;
    onTabChange: (tab: string) => void;
}

const Icons = {
    ChevronLeft: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
    ),
    ChevronRight: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
    ),
    Calendar: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
    Cake: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 .5 2 .5" /><path d="M2 21h20" /><path d="M7 8v3" /><path d="M12 8v3" /><path d="M17 8v3" /><path d="M7 4a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5v-2A.5.5 0 0 1 7 4z" /><path d="M12 4a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5z" /><path d="M17 4a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5z" /></svg>
    )
};

export default function BirthdaySection({
    birthdayData,
    birthdayMonth,
    onMonthChange,
    onMonthSelect,
    birthdayTab,
    onTabChange
}: BirthdaySectionProps) {

    if (!birthdayData) return null;

    const currentData = birthdayTab === 'all' ? birthdayData.all_birthdays :
        birthdayTab === 'celebrated' ? birthdayData.celebrated :
            birthdayData.upcoming;

    return (
        <section className={styles['cf-birthday-section']}>
            <div className={styles['cf-birthday-header']}>
                <div className={styles['cf-birthday-title']}>
                    <Icons.Cake />
                    <h2>Member Birthdays</h2>
                </div>
                <div className={styles['cf-birthday-month-selector']}>
                    <button className={styles['cf-month-nav-btn']} onClick={() => onMonthChange(-1)}><Icons.ChevronLeft /></button>
                    <select
                        className={styles['cf-month-select']}
                        value={birthdayMonth}
                        onChange={(e) => onMonthSelect(parseInt(e.target.value))}
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <button className={styles['cf-month-nav-btn']} onClick={() => onMonthChange(1)}><Icons.ChevronRight /></button>
                </div>
            </div>

            <div className={styles['cf-birthday-tabs']}>
                <button
                    className={`${styles['cf-birthday-tab']} ${birthdayTab === 'all' ? styles.active : ''}`}
                    onClick={() => onTabChange('all')}
                >
                    All <span className={styles['cf-tab-count']}>{birthdayData.total_count}</span>
                </button>
                <button
                    className={`${styles['cf-birthday-tab']} ${birthdayTab === 'upcoming' ? styles.active : ''}`}
                    onClick={() => onTabChange('upcoming')}
                >
                    Upcoming <span className={styles['cf-tab-count']}>{birthdayData.upcoming_count}</span>
                </button>
                <button
                    className={`${styles['cf-birthday-tab']} ${birthdayTab === 'celebrated' ? styles.active : ''}`}
                    onClick={() => onTabChange('celebrated')}
                >
                    Celebrated <span className={styles['cf-tab-count']}>{birthdayData.celebrated_count}</span>
                </button>
            </div>

            <div className={styles['cf-birthday-table-container']}>
                {currentData.length === 0 ? (
                    <div className={styles['cf-birthday-empty']}>
                        <Icons.Cake />
                        <p>No birthdays found for this month</p>
                    </div>
                ) : (
                    <table className={styles['cf-birthday-table']}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Group</th>
                                <th>Contact</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((member: any) => (
                                <tr key={member.id}>
                                    <td>
                                        <div className={styles['cf-birthday-date']}>
                                            <Icons.Calendar />
                                            {birthdayData.month_name} {member.birth_day}
                                        </div>
                                    </td>
                                    <td><span className={styles['cf-birthday-name']}>{member.name}</span></td>
                                    <td>
                                        <span className={`${styles['cf-birthday-status']} ${member.is_passed ? styles.celebrated : styles.upcoming}`}>
                                            {member.is_passed ? 'Celebrated' : 'Upcoming'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles['cf-birthday-group']} ${styles[member.church_group?.toLowerCase() || 'none']}`}>
                                            {member.church_group || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles['cf-birthday-contact']}>
                                            <div>{member.phone || 'N/A'}</div>
                                            <div className="text-xs opacity-60">{member.email}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <button className={styles['cf-birthday-action-btn']}>
                                            Send Wish
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}
