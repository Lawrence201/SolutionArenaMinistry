import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const today = new Date();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'overview';

        if (type === 'trends') {
            const weeks = [];
            for (let i = 7; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - (i * 7));
                const start = new Date(date);
                start.setDate(date.getDate() - date.getDay());
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);

                weeks.push({
                    label: `Week ${8 - i}`,
                    start,
                    end
                });
            }

            // Optimization: Get ALL visitor attendance for these 8 weeks in one go
            const overallStart = weeks[0].start;
            const overallEnd = weeks[7].end;

            const allVisitorAttendance = await prisma.attendance.findMany({
                where: {
                    check_in_date: { gte: overallStart, lte: overallEnd },
                    status: 'visitor'
                },
                select: { visitor_id: true, check_in_date: true }
            });

            // Need to know when each visitor first ever attended
            const visitorIds = Array.from(new Set(allVisitorAttendance.map(a => a.visitor_id).filter(id => id !== null))) as number[];

            const firstVisits = await prisma.attendance.groupBy({
                by: ['visitor_id'],
                where: {
                    visitor_id: { in: visitorIds },
                    status: 'visitor'
                },
                _min: { check_in_date: true }
            });

            const firstVisitMap = new Map(firstVisits.map(f => [f.visitor_id, f._min.check_in_date]));

            const trendData = weeks.map(w => {
                const weekVisitors = allVisitorAttendance.filter(a => a.check_in_date >= w.start && a.check_in_date <= w.end);
                const uniqueIdsInWeek = Array.from(new Set(weekVisitors.map(a => a.visitor_id)));

                let newVisitors = 0;
                let returning = 0;

                uniqueIdsInWeek.forEach(id => {
                    const firstDate = firstVisitMap.get(id);
                    if (firstDate && firstDate >= w.start && firstDate <= w.end) {
                        newVisitors++;
                    } else {
                        returning++;
                    }
                });

                return {
                    label: w.label,
                    new: newVisitors,
                    returning: returning
                };
            });

            return NextResponse.json({ success: true, data: trendData });
        }

        if (type === 'recent') {
            const recentVisitors = await prisma.visitor.findMany({
                orderBy: { created_at: 'desc' },
                take: 10,
                include: {
                    attendance: {
                        orderBy: { check_in_date: 'asc' },
                        select: { check_in_date: true }
                    }
                }
            });

            const formattedVisitors = recentVisitors.map(v => {
                const visits = v.attendance.map(a => a.check_in_date);
                const firstVisit = visits[0];
                const lastVisit = visits.length > 1 ? visits[visits.length - 1] : null;

                return {
                    id: v.visitor_id,
                    name: v.name,
                    phone: v.phone,
                    email: v.email,
                    source: v.source,
                    first_visit: firstVisit,
                    last_visit: lastVisit,
                    status: v.follow_up_status,
                    assigned_to: v.assigned_to || 'Unassigned'
                };
            });

            return NextResponse.json({ success: true, data: formattedVisitors });
        }

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);

        const [
            totalVisitors,
            newThisWeek,
            pendingFollowUps,
            convertedCount,
            returningVisitors,
            contactedCount,
            scheduledCount,
            urgentCount
        ] = await Promise.all([
            prisma.visitor.count(),
            prisma.visitor.count({ where: { created_at: { gte: startOfWeek } } }),
            prisma.visitor.count({ where: { follow_up_status: 'pending' } }),
            prisma.visitor.count({ where: { converted_to_member: true } }),
            prisma.visitor.count({ where: { visit_count: { gt: 1 } } }),
            prisma.visitorFollowup.count(),
            prisma.visitor.count({ where: { follow_up_date: { gt: today } } }),
            prisma.visitor.count({ where: { follow_up_status: 'pending', created_at: { lt: threeDaysAgo } } })
        ]);

        const conversionRate = totalVisitors > 0 ? (convertedCount / totalVisitors) * 100 : 0;

        return NextResponse.json({
            success: true,
            data: {
                total_visitors: totalVisitors,
                new_this_week: newThisWeek,
                pending_follow_ups: pendingFollowUps,
                conversion_rate: conversionRate.toFixed(0),
                converted_count: convertedCount,
                returning_visitors: returningVisitors,
                contacted_count: contactedCount,
                scheduled_count: scheduledCount,
                urgent_count: urgentCount
            }
        });
    } catch (error: any) {
        console.error('Visitor Analytics Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch visitor analytics' },
            { status: 500 }
        );
    }
}
