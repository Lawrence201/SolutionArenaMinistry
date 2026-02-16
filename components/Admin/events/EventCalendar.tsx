'use client';

import React, { useMemo } from 'react';
import styles from '@/app/admin/events/events.module.css';

interface EventCalendarProps {
    currentMonth: number;
    currentYear: number;
    onMonthChange: (delta: number) => void;
    onDateSelect: (date: string | null) => void;
    selectedDate: string | null;
    events: any[];
    birthdays: any[];
}

const Icons = {
    ChevronLeft: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
    ),
    ChevronRight: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
    )
};

export default function EventCalendar({
    currentMonth,
    currentYear,
    onMonthChange,
    onDateSelect,
    selectedDate,
    events,
    birthdays
}: EventCalendarProps) {

    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    // Simplified first day: 0 = Sunday, 1 = Monday, etc.
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

    const days = [];
    // Previous month blanks
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ day: null, fullDate: null, inactive: true });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({ day: i, fullDate: dateStr, inactive: false });
    }
    // Next month blanks to complete 42 cells (6 rows)
    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) {
        days.push({ day: null, fullDate: null, inactive: true });
    }

    const getLocalDateString = (date: Date | string) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const hasEvent = (date: string) => events.some(e => getLocalDateString(e.start_date) === date);
    const hasBirthday = (date: string) => {
        const [y, m, d] = date.split('-').map(Number);
        return birthdays.some(b => b.birth_month === m && b.birth_day === d);
    };

    const getDayEvents = (date: string) => events.filter(e => getLocalDateString(e.start_date) === date);
    const getDayBirthdays = (date: string) => {
        const [y, m, d] = date.split('-').map(Number);
        return birthdays.filter(b => b.birth_month === m && b.birth_day === d);
    };

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Calculate Upcoming This Week (next 7 days including today)
    const upcomingThisWeek = useMemo(() => {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        return events
            .filter(e => {
                const eventDate = new Date(e.start_date);
                // Normalize eventDate to start of day for comparison
                eventDate.setHours(0, 0, 0, 0);
                const todayStart = new Date(today);
                todayStart.setHours(0, 0, 0, 0);
                const nextWeekEnd = new Date(nextWeek);
                nextWeekEnd.setHours(23, 59, 59, 999); // End of the 7th day

                return eventDate >= todayStart && eventDate <= nextWeekEnd;
            })
            .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
            .slice(0, 3); // Legacy image shows a few items
    }, [events, today]);

    const prevMonth = () => onMonthChange(-1);
    const nextMonth = () => onMonthChange(1);

    return (
        <div className={styles['cf-em-calendar-section']}>
            <div className={styles['cf-em-calendar-header']}>
                <h2>Event Calendar</h2>
                <p>Select a date to view events</p>
            </div>

            <div className={styles['cf-em-calendar']}>
                <div className={styles['cf-em-calendar-nav']}>
                    <button onClick={prevMonth} className={styles['cf-em-nav-btn']}>‹</button>
                    <span className={styles['cf-em-calendar-month']}>
                        {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className={styles['cf-em-nav-btn']}>›</button>
                </div>

                <div className={styles['cf-em-calendar-grid']}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className={styles['cf-em-calendar-day-header']}>{day}</div>
                    ))}
                    {days.map((d, i) => {
                        const isToday = d.fullDate === todayStr;
                        const isSelected = d.fullDate === selectedDate;
                        const dayEvents = d.fullDate ? getDayEvents(d.fullDate) : [];
                        const dayBirthdays = d.fullDate ? getDayBirthdays(d.fullDate) : [];

                        let tooltip = '';
                        if (dayEvents.length > 0) {
                            tooltip += 'Events:\n';
                            dayEvents.forEach(e => {
                                const time = new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                tooltip += `  • ${e.name} (${e.type}) - ${time}\n`;
                            });
                        }
                        if (dayBirthdays.length > 0) {
                            if (tooltip) tooltip += '\n';
                            tooltip += 'Birthdays:\n';
                            dayBirthdays.forEach(b => {
                                tooltip += `  🎂 ${b.name} (${b.age} years old)\n`;
                            });
                        }

                        return (
                            <div
                                key={i}
                                className={`
                                    ${styles['cf-em-calendar-day']} 
                                    ${d.inactive ? styles['cf-em-inactive'] : ''} 
                                    ${isToday ? styles['cf-em-today'] : ''} 
                                    ${isSelected ? styles['cf-em-selected'] : ''} 
                                    ${dayEvents.length > 0 ? styles['cf-em-has-event'] : ''}
                                    ${dayBirthdays.length > 0 ? styles['cf-em-has-birthday'] : ''}
                                `}
                                data-tooltip={tooltip || undefined}
                                onClick={() => d.fullDate && onDateSelect(d.fullDate)}
                            >
                                {!d.inactive && d.day}
                                {!d.inactive && dayBirthdays.length > 0 && (
                                    <span className={styles['cf-em-birthday-indicator']}>🎂</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming This Week Section internal to the calendar card */}
            <div className={styles['cf-em-upcoming-section']}>
                <h3>Upcoming This Week</h3>
                <div className={styles['cf-em-upcoming-list']}>
                    {upcomingThisWeek.length > 0 ? (
                        upcomingThisWeek.map(event => (
                            <div key={event.id} className={styles['cf-em-upcoming-item']}>
                                <span className={styles['cf-em-upcoming-dot']}></span>
                                <div className={styles['cf-em-upcoming-details']}>
                                    <h4>{event.name}</h4>
                                    <p>
                                        {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No events scheduled for this week</p>
                    )}
                </div>
            </div>
        </div>
    );
}
