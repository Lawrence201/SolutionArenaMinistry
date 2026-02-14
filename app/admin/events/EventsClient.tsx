'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './events.module.css';
import {
    getEvents,
    getEventMetrics,
    getBirthdays,
    deleteEvent
} from '@/app/actions/event';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Components
import EventStats from '@/components/Admin/events/EventStats';
import EventCalendar from '@/components/Admin/events/EventCalendar';
import EventList from '@/components/Admin/events/EventList';
import BirthdaySection from '@/components/Admin/events/BirthdaySection';
import EventDetailModal from '@/components/Admin/events/EventDetailModal';
import EventInsights from '@/components/Admin/events/EventInsights';

// SVG Icons
const Icons = {
    Plus: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
    ),
    Calendar: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    )
};

interface EventsClientProps {
    initialEvents: any[];
    initialMetrics: any;
    initialBirthdays: any;
}

export default function EventsClient({ initialEvents, initialMetrics, initialBirthdays }: EventsClientProps) {
    const router = useRouter();
    const [events, setEvents] = useState(initialEvents);
    const [metrics, setMetrics] = useState(initialMetrics);
    const [birthdayData, setBirthdayData] = useState(initialBirthdays);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [birthdayTab, setBirthdayTab] = useState('all');
    const [birthdayMonth, setBirthdayMonth] = useState(new Date().getMonth() + 1);

    // Fetch events based on current filter/search/date
    const refreshEvents = useCallback(async () => {
        setIsLoading(true);
        const result = await getEvents({ filter, search: searchTerm, date: selectedDate || undefined });
        if (result.success && result.data) {
            setEvents(result.data.events);
        }
        setIsLoading(false);
    }, [filter, searchTerm, selectedDate]);

    useEffect(() => {
        // Only refresh if not initial mount with initial data
        if (filter !== 'all' || searchTerm !== '' || selectedDate !== null) {
            refreshEvents();
        }
    }, [filter, searchTerm, selectedDate, refreshEvents]);

    // Fetch birthdays whenever calendar month changes
    useEffect(() => {
        const fetchCalendarBirthdays = async () => {
            const result = await getBirthdays(currentMonth);
            if (result.success) {
                // Only update if birthdayMonth is synced with currentMonth (initial load or manual sync)
                // Actually, we want calendar dots to show birthdays for the calendar month
                // But the helper function returns structured data. 
                // We'll rely on the separate effect below for the table.
                // However, we need 'all_birthdays' for the calendar dots from THIS fetch?
                // The issue is getBirthdays returns everything.
                // Let's keep this one for calendar data (currentMonth).
                setBirthdayData((prev: any) => ({
                    ...prev,
                    all_birthdays: result.data ? result.data.all_birthdays : [] // Update dots for calendar
                }));
            }
        };
        fetchCalendarBirthdays();
    }, [currentMonth]);

    // Fetch birthdays for the table whenever birthday section month changes
    useEffect(() => {
        const fetchTableBirthdays = async () => {
            const result = await getBirthdays(birthdayMonth);
            if (result.success && result.data) {
                setBirthdayData(result.data);
            }
        };
        fetchTableBirthdays();
    }, [birthdayMonth]);

    const handleDeleteEvent = async (id: number) => {
        if (confirm('Are you sure you want to delete this event?')) {
            const result = await deleteEvent(id);
            if (result.success) {
                toast.success('Event deleted successfully');
                refreshEvents();
                const metricsResult = await getEventMetrics();
                if (metricsResult.success) setMetrics(metricsResult.data);
            } else {
                toast.error(result.message || 'Failed to delete event');
            }
        }
    };

    const openEventDetails = (event: any) => {
        setSelectedEvent(event);
        setIsDetailModalOpen(true);
    };

    const handleMonthChange = (delta: number) => {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    // Extract all birthdays for calendar display (not just current tab)
    const allBirthdaysForCalendar = useMemo(() => {
        return birthdayData ? birthdayData.all_birthdays : [];
    }, [birthdayData]);

    return (
        <div className="p-8 pb-20">
            {/* Header */}
            <header className={styles['cf-em-page-header']}>
                <div className={styles['cf-em-header-content']}>
                    <h1>Events Management</h1>
                    <p>Plan, organize and track all church activities</p>
                </div>
                <div className={styles['cf-em-header-actions']}>
                    <button className={`${styles['cf-em-btn']} ${styles['cf-em-btn-secondary']}`}>
                        <Icons.Calendar />
                        Calendar View
                    </button>
                    <button
                        className={`${styles['cf-em-btn']} ${styles['cf-em-btn-primary']}`}
                        onClick={() => router.push('/admin/add-event')}
                    >
                        <Icons.Plus />
                        New Event
                    </button>
                </div>
            </header>

            {/* AI Insights Section */}
            <EventInsights />

            {/* Metrics Section */}
            <EventStats metrics={metrics} />

            {/* Main Content Grid */}
            <div className={styles['cf-em-content-grid']}>
                {/* Left Column: Calendar */}
                <EventCalendar
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onMonthChange={handleMonthChange}
                    onDateSelect={setSelectedDate}
                    selectedDate={selectedDate}
                    events={events}
                    birthdays={allBirthdaysForCalendar}
                />

                {/* Right Column: Event List */}
                <EventList
                    events={events}
                    filter={filter}
                    onFilterChange={setFilter}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onDeleteEvent={handleDeleteEvent}
                    onViewEvent={openEventDetails}
                />
            </div>

            {/* Birthday Section */}
            <BirthdaySection
                birthdayData={birthdayData}
                birthdayMonth={birthdayMonth}
                onMonthChange={(delta) => {
                    let newMonth = birthdayMonth + delta;
                    if (newMonth < 1) newMonth = 12;
                    if (newMonth > 12) newMonth = 1;
                    setBirthdayMonth(newMonth);
                }}
                onMonthSelect={setBirthdayMonth}
                birthdayTab={birthdayTab}
                onTabChange={setBirthdayTab}
            />

            {/* Event Detail Modal */}
            <EventDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                event={selectedEvent}
            />
        </div>
    );
}
