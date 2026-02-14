import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'overview';
        const range = searchParams.get('range') || 'month';
        const weeks = parseInt(searchParams.get('weeks') || '12');

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        let responseData: any = {};

        if (type === 'overview') {
            const totalMembers = await prisma.member.count();

            // Unique members attended this month
            const memberAttendance = await prisma.attendance.groupBy({
                by: ['member_id'],
                where: {
                    check_in_date: { gte: startOfMonth },
                    member_id: { not: null },
                    status: 'present'
                }
            });
            const membersAttended = memberAttendance.length;

            // Total visitors this month (Raw count of visitor records)
            const totalVisitors = await prisma.attendance.count({
                where: {
                    check_in_date: { gte: startOfMonth },
                    status: 'visitor'
                }
            });

            // Avg Attendance (Members + Visitors) per service
            const dailyCounts = await prisma.attendance.groupBy({
                by: ['check_in_date', 'service_id'],
                where: {
                    check_in_date: { gte: startOfMonth },
                    status: { in: ['present', 'visitor'] }
                },
                _count: true
            });

            const totalServiceAttendance = dailyCounts.reduce((acc, curr) => acc + curr._count, 0);
            const avgAttendance = dailyCounts.length > 0 ? Math.round(totalServiceAttendance / dailyCounts.length) : 0;
            const peakAttendance = dailyCounts.length > 0 ? Math.max(...dailyCounts.map(d => d._count)) : 0;

            const attendanceRate = totalMembers > 0 ? Math.round((membersAttended / totalMembers) * 100 * 10) / 10 : 0;

            // Demographics (Gender & Children)
            const genderBreakdown = await prisma.member.groupBy({
                by: ['gender'],
                where: {
                    attendance: {
                        some: {
                            check_in_date: { gte: startOfMonth },
                            status: 'present'
                        }
                    }
                },
                _count: true
            });

            const malesCount = genderBreakdown.find(g => g.gender?.toLowerCase() === 'male')?._count || 0;
            const femalesCount = genderBreakdown.find(g => g.gender?.toLowerCase() === 'female')?._count || 0;

            // Children (< 18 based on DOB)
            const eighteenYearsAgo = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
            const childrenCount = await prisma.member.count({
                where: {
                    date_of_birth: { gt: eighteenYearsAgo },
                    attendance: {
                        some: {
                            check_in_date: { gte: startOfMonth },
                            status: 'present'
                        }
                    }
                }
            });

            responseData = {
                total_members: totalMembers,
                members_attended: membersAttended,
                total_visitors: totalVisitors,
                avg_attendance: avgAttendance,
                attendance_rate: attendanceRate,
                peak_attendance: peakAttendance,
                males_count: malesCount,
                females_count: femalesCount,
                children_count: childrenCount
            };
        }

        if (type === 'growth_metrics') {
            const currentTotal = await prisma.attendance.count({
                where: {
                    check_in_date: { gte: startOfMonth },
                    status: { in: ['present', 'visitor'] }
                }
            });

            const previousTotal = await prisma.attendance.count({
                where: {
                    check_in_date: { gte: lastMonthStart, lte: lastMonthEnd },
                    status: { in: ['present', 'visitor'] }
                }
            });

            let growth = 0;
            if (previousTotal > 0) {
                growth = Math.round(((currentTotal - previousTotal) / previousTotal) * 100 * 10) / 10;
            } else {
                growth = currentTotal > 0 ? 100 : 0;
            }

            // New attendees (First time attending this month)
            const newAttendeesCount = await prisma.attendance.count({
                where: {
                    check_in_date: { gte: startOfMonth },
                    status: 'present',
                    member: {
                        attendance: {
                            none: {
                                check_in_date: { lt: startOfMonth }
                            }
                        }
                    }
                }
            });

            responseData = {
                growth_percentage: growth,
                new_attendees: newAttendeesCount
            };
        }

        if (type === 'trends') {
            const trends = [];
            for (let i = weeks - 1; i >= 0; i--) {
                const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
                weekStart.setDate(weekStart.getDate() - (weekStart.getDay() || 7) + 1); // Monday
                weekStart.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

                const [members, visitors] = await Promise.all([
                    prisma.attendance.count({
                        where: { check_in_date: { gte: weekStart, lt: weekEnd }, status: 'present' }
                    }),
                    prisma.attendance.count({
                        where: { check_in_date: { gte: weekStart, lt: weekEnd }, status: 'visitor' }
                    })
                ]);

                trends.push({
                    week: weekLabel,
                    total: members + visitors,
                    members: members,
                    visitors: visitors
                });
            }
            responseData = trends;
        }

        if (type === 'demographics') {
            const eighteenYearsAgo = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
            const thirtyYearsAgo = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());
            const fiftyYearsAgo = new Date(now.getFullYear() - 50, now.getMonth(), now.getDate());

            const [children, youth, adults, seniors] = await Promise.all([
                prisma.member.count({
                    where: {
                        date_of_birth: { gt: eighteenYearsAgo },
                        attendance: { some: { check_in_date: { gte: startOfMonth }, status: 'present' } }
                    }
                }),
                prisma.member.count({
                    where: {
                        date_of_birth: { lte: eighteenYearsAgo, gt: thirtyYearsAgo },
                        attendance: { some: { check_in_date: { gte: startOfMonth }, status: 'present' } }
                    }
                }),
                prisma.member.count({
                    where: {
                        date_of_birth: { lte: thirtyYearsAgo, gt: fiftyYearsAgo },
                        attendance: { some: { check_in_date: { gte: startOfMonth }, status: 'present' } }
                    }
                }),
                prisma.member.count({
                    where: {
                        date_of_birth: { lte: fiftyYearsAgo },
                        attendance: { some: { check_in_date: { gte: startOfMonth }, status: 'present' } }
                    }
                })
            ]);

            responseData = {
                age_groups: [
                    { age_group: 'Children (0-17)', count: children },
                    { age_group: 'Youth (18-29)', count: youth },
                    { age_group: 'Adults (30-49)', count: adults },
                    { age_group: 'Seniors (50+)', count: seniors }
                ]
            };
        }

        if (type === 'service_breakdown') {
            const breakdown = await prisma.attendance.groupBy({
                by: ['service_id'],
                where: {
                    check_in_date: { gte: startOfMonth },
                    status: { in: ['present', 'visitor'] }
                },
                _count: true
            });

            responseData = breakdown.map(b => ({
                service_id: b.service_id,
                count: b._count
            }));
        }

        if (type === 'peak_days') {
            const attendance = await prisma.attendance.findMany({
                where: {
                    check_in_date: { gte: startOfMonth },
                    status: { in: ['present', 'visitor'] }
                },
                select: { check_in_date: true }
            });

            const dayCounts: Record<string, number> = {
                'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0,
                'Friday': 0, 'Saturday': 0, 'Sunday': 0
            };

            attendance.forEach(a => {
                const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(a.check_in_date);
                if (dayCounts[day] !== undefined) dayCounts[day]++;
            });

            responseData = Object.entries(dayCounts).map(([day, count]) => ({ day, count }));
        }

        if (type === 'group_participation') {
            const breakdown = await prisma.attendance.groupBy({
                by: ['member_id'],
                where: {
                    check_in_date: { gte: startOfMonth },
                    member_id: { not: null },
                    status: 'present'
                },
                _count: true
            });

            const memberIds = breakdown.map(b => b.member_id as number);
            const members = await prisma.member.findMany({
                where: { member_id: { in: memberIds } },
                select: { member_id: true, church_group: true }
            });

            const groupCounts: Record<string, number> = {};
            breakdown.forEach(b => {
                const member = members.find(m => m.member_id === b.member_id);
                const group = member?.church_group || 'Unassigned';
                groupCounts[group] = (groupCounts[group] || 0) + b._count;
            });

            responseData = Object.entries(groupCounts).map(([group, count]) => ({ group, count }));
        }

        if (type === 'retention') {
            const todayDate = new Date();
            const months = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date(todayDate);
                date.setMonth(todayDate.getMonth() - i);
                months.push({
                    name: date.toLocaleString('en-US', { month: 'short' }),
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    start: new Date(date.getFullYear(), date.getMonth(), 1),
                    end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
                });
            }

            const retentionData = await Promise.all(months.map(async (m) => {
                const attendees = await prisma.attendance.findMany({
                    where: {
                        check_in_date: { gte: m.start, lte: m.end },
                        status: { in: ['present', 'visitor'] },
                    },
                    select: { member_id: true }
                });

                const uniqueMemberIds = Array.from(new Set(attendees.map(a => a.member_id).filter(id => id !== null))) as number[];

                let regular = 0;
                let returning = 0;
                let firstTimers = 0;

                const prevMonthStart = new Date(m.year, m.month - 1, 1);
                const prevMonthEnd = new Date(m.year, m.month, 0);

                await Promise.all(uniqueMemberIds.map(async (id) => {
                    // Check first ever attendance
                    const firstEver = await prisma.attendance.findFirst({
                        where: { member_id: id, status: { in: ['present', 'visitor'] } },
                        orderBy: { check_in_date: 'asc' },
                        select: { check_in_date: true }
                    });

                    if (firstEver && firstEver.check_in_date >= m.start && firstEver.check_in_date <= m.end) {
                        firstTimers++;
                    } else {
                        // Check if attended last month
                        const attendedLastMonth = await prisma.attendance.findFirst({
                            where: {
                                member_id: id,
                                check_in_date: { gte: prevMonthStart, lte: prevMonthEnd },
                                status: { in: ['present', 'visitor'] }
                            }
                        });

                        if (attendedLastMonth) {
                            regular++;
                        } else {
                            returning++;
                        }
                    }
                }));

                // Handle visitors as first timers? The image shows "Regular, Returning & First-time"
                // Usually visitors are first timers.
                const visitorsCount = attendees.filter(a => a.member_id === null).length;
                firstTimers += visitorsCount;

                return {
                    month: m.name,
                    regular,
                    returning,
                    first_timers: firstTimers
                };
            }));

            responseData = retentionData;
        }

        return NextResponse.json({ success: true, data: responseData });

    } catch (error) {
        console.error('Attendance API Error:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

