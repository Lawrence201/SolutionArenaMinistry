import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getDateDisplay(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
        return "Today";
    } else if (eventDate.getTime() === tomorrow.getTime()) {
        return "Tomorrow";
    } else if (eventDate < nextWeek) {
        return eventDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
        return eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

function getTimeDisplay(time: Date): string {
    return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const events = await prisma.event.findMany({
            where: {
                start_date: { gte: today },
                status: "Published"
            },
            orderBy: [
                { start_date: 'asc' },
                { start_time: 'asc' }
            ],
            take: limit
        });

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

        const formattedEvents = await Promise.all(events.map(async (event, index) => {
            // Get attendance count for this event
            const attendanceCount = await prisma.attendance.count({
                where: {
                    service_id: String(event.id),
                    status: "present"
                }
            });

            return {
                id: event.id,
                name: event.name,
                type: event.type,
                date_display: getDateDisplay(event.start_date),
                time_display: getTimeDisplay(event.start_time),
                location: event.location,
                attendance: attendanceCount,
                color: colors[index % colors.length],
                full_date: event.start_date.toISOString().split('T')[0],
                full_time: event.start_time.toISOString()
            };
        }));

        return NextResponse.json({
            success: true,
            data: formattedEvents,
            count: formattedEvents.length
        });

    } catch (error) {
        console.error("Upcoming Events API Error:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Unknown error occurred"
        }, { status: 500 });
    }
}
