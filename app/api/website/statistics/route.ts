import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12

        // 1. Total Events (Published)
        const totalEvents = await prisma.event.count({
            where: {
                status: 'Published',
            },
        });

        // 2. Total Sermons (Published)
        const totalSermons = await prisma.sermon.count({
            where: {
                is_published: true,
            },
        });

        // 3. Birthdays This Month
        // Note: Prisma doesn't have a built-in MONTH() function for filters, 
        // so we use raw query or fetch and filter if small, but let's try raw for performance.
        const birthdaysThisMonthResult = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count 
      FROM members 
      WHERE EXTRACT(MONTH FROM date_of_birth) = ${currentMonth}
      AND date_of_birth IS NOT NULL
    ` as { count: number }[];
        const birthdaysThisMonth = birthdaysThisMonthResult[0]?.count || 0;

        // 4. Upcoming Events (from today onwards)
        const upcomingEvents = await prisma.event.count({
            where: {
                status: 'Published',
                start_date: {
                    gte: new Date(now.setHours(0, 0, 0, 0)),
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                total_events: totalEvents,
                total_sermons: totalSermons,
                birthdays_this_month: birthdaysThisMonth,
                upcoming_events: upcomingEvents,
            },
        });
    } catch (error: any) {
        console.error('Error fetching statistics:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch statistics.',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
