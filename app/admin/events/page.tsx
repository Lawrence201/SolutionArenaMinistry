import { Suspense } from 'react';
import EventsClient from './EventsClient';
import { getEvents, getEventMetrics, getBirthdays } from '@/app/actions/event';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
    const currentMonth = new Date().getMonth() + 1;

    // Fetch initial data in parallel
    const [eventsData, metricsData, birthdayData] = await Promise.all([
        getEvents({ filter: 'all' }),
        getEventMetrics(),
        getBirthdays(currentMonth)
    ]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<div className="p-8 text-center">Loading Events Management...</div>}>
                <EventsClient
                    initialEvents={eventsData.success ? eventsData.data.events : []}
                    initialMetrics={metricsData.success ? metricsData.data : {
                        total_events: 0,
                        upcoming_events: 0,
                        in_service_events: 0,
                        past_events: 0
                    }}
                    initialBirthdays={birthdayData.success ? birthdayData.data : null}
                />
            </Suspense>
        </div>
    );
}
