import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'overview';
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        switch (slug) {
            case 'executive-summary': {
                const now = new Date();
                const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

                const [totalMembers, newMembers, prevNewMembers, activeMembers, inactiveMembers, visitors] = await Promise.all([
                    prisma.member.count(),
                    prisma.member.count({ where: { created_at: { gte: currentMonthStart } } }),
                    prisma.member.count({ where: { created_at: { gte: prevMonthStart, lte: prevMonthEnd } } }),
                    prisma.member.count({ where: { status: "Active" } }),
                    prisma.member.count({ where: { status: "Inactive" } }),
                    prisma.member.count({ where: { membership_type: "Visitor" } })
                ]);

                const ministries = await prisma.member.groupBy({
                    by: ['church_group'],
                    _count: { _all: true },
                    where: { NOT: { church_group: null } }
                });

                const [currOff, currTit, currPrj, currWel, prevOff, prevTit, prevPrj, prevWel] = await Promise.all([
                    prisma.offering.aggregate({ where: { date: { gte: currentMonthStart } }, _sum: { amount_collected: true } }),
                    prisma.tithe.aggregate({ where: { date: { gte: currentMonthStart } }, _sum: { amount: true } }),
                    prisma.projectOffering.aggregate({ where: { date: { gte: currentMonthStart } }, _sum: { amount_collected: true } }),
                    prisma.welfareContribution.aggregate({ where: { date: { gte: currentMonthStart } }, _sum: { amount: true } }),
                    prisma.offering.aggregate({ where: { date: { gte: prevMonthStart, lte: prevMonthEnd } }, _sum: { amount_collected: true } }),
                    prisma.tithe.aggregate({ where: { date: { gte: prevMonthStart, lte: prevMonthEnd } }, _sum: { amount: true } }),
                    prisma.projectOffering.aggregate({ where: { date: { gte: prevMonthStart, lte: prevMonthEnd } }, _sum: { amount_collected: true } }),
                    prisma.welfareContribution.aggregate({ where: { date: { gte: prevMonthStart, lte: prevMonthEnd } }, _sum: { amount: true } }),
                ]);

                const currInc = (Number(currOff._sum.amount_collected) || 0) + (Number(currTit._sum.amount) || 0) + (Number(currPrj._sum.amount_collected) || 0) + (Number(currWel._sum.amount) || 0);
                const prevInc = (Number(prevOff._sum.amount_collected) || 0) + (Number(prevTit._sum.amount) || 0) + (Number(prevPrj._sum.amount_collected) || 0) + (Number(prevWel._sum.amount) || 0);

                const [currAtt, prevAtt] = await Promise.all([
                    prisma.attendance.aggregate({ where: { check_in_date: { gte: currentMonthStart } }, _count: { _all: true } }),
                    prisma.attendance.aggregate({ where: { check_in_date: { gte: prevMonthStart, lte: prevMonthEnd } }, _count: { _all: true } }),
                ]);

                const trends = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const mS = new Date(d.getFullYear(), d.getMonth(), 1);
                    const mE = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
                    const [mMem, mOff, mTit, mAtt] = await Promise.all([
                        prisma.member.count({ where: { created_at: { lte: mE } } }),
                        prisma.offering.aggregate({ where: { date: { gte: mS, lte: mE } }, _sum: { amount_collected: true } }),
                        prisma.tithe.aggregate({ where: { date: { gte: mS, lte: mE } }, _sum: { amount: true } }),
                        prisma.attendance.count({ where: { check_in_date: { gte: mS, lte: mE } } })
                    ]);
                    trends.push({
                        month: d.toLocaleString('en-US', { month: 'short' }),
                        members: mMem,
                        attendance: mAtt,
                        income: (Number(mOff._sum.amount_collected) || 0) + (Number(mTit._sum.amount) || 0)
                    });
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        membership: {
                            total: totalMembers,
                            active: activeMembers,
                            new_30d: newMembers,
                            prev_new_30d: prevNewMembers,
                            growth_rate: prevNewMembers > 0 ? ((newMembers - prevNewMembers) / prevNewMembers) * 100 : 0,
                            retention_rate: 98,
                        },
                        ministries: ministries.map(m => ({ church_group: m.church_group, count: m._count._all })),
                        financial: {
                            total_income: currInc,
                            prev_total_income: prevInc,
                            income_growth: prevInc > 0 ? ((currInc - prevInc) / prevInc) * 100 : 0,
                            financial_health: 85
                        },
                        attendance: {
                            avg_attendance: currAtt._count._all > 0 ? Math.round(currAtt._count._all / 4) : 0,
                            prev_avg_attendance: prevAtt._count._all > 0 ? Math.round(prevAtt._count._all / 4) : 0,
                            growth_rate: prevAtt._count._all > 0 ? Math.round(((currAtt._count._all - prevAtt._count._all) / prevAtt._count._all) * 100) : 0,
                            attendance_rate: activeMembers > 0 ? Math.round(((currAtt._count._all / 4) / activeMembers) * 100) : 0
                        },
                        engagement: {
                            active: activeMembers,
                            inactive: inactiveMembers,
                            visitors: visitors,
                            at_risk: Math.round(inactiveMembers * 0.2),
                            engagement_rate: 78
                        },
                        events: { upcoming: 3, unique_attendees: 120, engagement_rate: 45 },
                        communication: { messages_sent: 1450, delivery_rate: 99 },
                        trends
                    }
                });
            }

            case 'communication': {
                const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

                const [totalMsgs, currMsgs, prevMsgs, emailCount, smsCount, pushCount, scheduledCount, activeUsers] = await Promise.all([
                    prisma.message.count({ where: { status: 'published' } }),
                    prisma.message.count({ where: { status: 'published', sent_at: { gte: currentMonthStart } } }),
                    prisma.message.count({ where: { status: 'published', sent_at: { gte: prevMonthStart, lte: prevMonthEnd } } }),
                    prisma.messageRecipient.count({ where: { delivery_channel: 'email' } }),
                    prisma.messageRecipient.count({ where: { delivery_channel: 'sms' } }),
                    prisma.messageRecipient.count({ where: { delivery_channel: 'push' } }),
                    prisma.scheduledMessage.count({ where: { status: 'pending' } }),
                    prisma.user.count({ where: { is_active: true } })
                ]);

                const timeline = [];
                for (let i = 13; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(date);
                    endOfDay.setHours(23, 59, 59, 999);
                    const count = await prisma.message.count({ where: { status: 'published', sent_at: { gte: date, lte: endOfDay } } });
                    timeline.push({ date: date.toISOString(), messages: count });
                }

                const types = await prisma.message.groupBy({ by: ['message_type'], _count: { _all: true }, where: { status: 'published' } });
                const by_type: any = {};
                types.forEach(t => { if (t.message_type) by_type[t.message_type] = t._count._all; });

                const recent = await prisma.message.findMany({ take: 5, orderBy: { sent_at: 'desc' }, where: { status: 'published' } });

                return NextResponse.json({
                    success: true,
                    data: {
                        totals: {
                            total_messages: totalMsgs,
                            growth_rate: prevMsgs > 0 ? Math.round(((currMsgs - prevMsgs) / prevMsgs) * 100) : 0,
                            avg_open_rate: 85,
                            inbox_count: 12,
                            active_users: activeUsers,
                            email_sent: emailCount,
                            sms_sent: smsCount,
                            push_sent: pushCount,
                            scheduled_messages: scheduledCount
                        },
                        timeline,
                        channel_distribution: { Email: emailCount, SMS: smsCount, Push: pushCount },
                        by_type,
                        recent_messages: recent.map(m => ({
                            title: m.title,
                            type: m.message_type,
                            audience: m.total_recipients + " Members",
                            channels: Array.isArray(m.delivery_channels) ? (m.delivery_channels as string[]).join(', ') : 'Email',
                            sent_at: m.sent_at?.toISOString(),
                            status: "Sent"
                        }))
                    }
                });
            }

            case 'visitors': {
                const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

                if (type === 'trends') {
                    const trends = [];
                    for (let i = 5; i >= 0; i--) {
                        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const mS = new Date(d.getFullYear(), d.getMonth(), 1);
                        const mE = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
                        const [newCount, returningCount] = await Promise.all([
                            prisma.visitor.count({ where: { created_at: { gte: mS, lte: mE }, visit_count: 1 } }),
                            prisma.visitor.count({ where: { created_at: { lte: mE }, visit_count: { gt: 1 } } })
                        ]);
                        trends.push({ label: d.toLocaleString('en-US', { month: 'short' }), new: newCount, returning: returningCount });
                    }
                    return NextResponse.json({ success: true, data: trends });
                }

                if (type === 'recent') {
                    const recent = await prisma.visitor.findMany({ take: 10, orderBy: { last_visit_date: 'desc' } });
                    return NextResponse.json({
                        success: true,
                        data: recent.map(v => ({
                            id: v.visitor_id,
                            name: v.name,
                            phone: v.phone,
                            email: v.email,
                            source: v.source || 'Online',
                            first_visit: v.created_at.toISOString(),
                            last_visit: v.last_visit_date?.toISOString(),
                            status: v.follow_up_status?.toLowerCase() || 'pending',
                            assigned_to: v.assigned_to || 'Unassigned'
                        }))
                    });
                }

                const [total, newWeekly, pending, converted, returning, contacted, scheduled, urgent, bySource] = await Promise.all([
                    prisma.visitor.count(),
                    prisma.visitor.count({ where: { created_at: { gte: sevenDaysAgo } } }),
                    prisma.visitor.count({ where: { follow_up_status: 'pending' } }),
                    prisma.visitor.count({ where: { converted_to_member: true } }),
                    prisma.visitor.count({ where: { visit_count: { gt: 1 } } }),
                    prisma.visitor.count({ where: { follow_up_status: 'contacted' } }),
                    prisma.visitor.count({ where: { follow_up_status: 'scheduled' } }),
                    prisma.visitor.count({ where: { follow_up_status: 'pending', created_at: { lte: threeDaysAgo } } }),
                    prisma.visitor.groupBy({
                        by: ['source'],
                        _count: { _all: true },
                        where: { NOT: { source: null } }
                    })
                ]);

                // Calculate funnel data
                const firstVisit = total;
                const secondVisit = returning;
                const regular = await prisma.visitor.count({ where: { visit_count: { gte: 3 } } });
                const members = converted;

                return NextResponse.json({
                    success: true,
                    data: {
                        total_visitors: total,
                        new_this_week: newWeekly,
                        pending_follow_ups: pending,
                        conversion_rate: total > 0 ? Math.round((converted / total) * 100) : 0,
                        converted_count: converted,
                        returning_visitors: returning,
                        contacted_count: contacted,
                        scheduled_count: scheduled,
                        urgent_count: urgent,
                        by_source: bySource.reduce((acc: any, curr) => {
                            if (curr.source) acc[curr.source] = curr._count._all;
                            return acc;
                        }, {}),
                        funnel: {
                            first_visit: firstVisit,
                            second_visit: secondVisit,
                            regular: regular,
                            members: members
                        }
                    }
                });
            }

            case 'attendance': {
                if (type === 'growth_metrics') {
                    const [curr, prev] = await Promise.all([
                        prisma.attendance.count({ where: { check_in_date: { gte: startOfMonth } } }),
                        prisma.attendance.count({ where: { check_in_date: { gte: new Date(now.getFullYear(), now.getMonth() - 1, 1), lt: startOfMonth } } })
                    ]);
                    return NextResponse.json({ success: true, data: { growth_percentage: prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0, new_attendees: curr } });
                }
                if (type === 'trends') {
                    const weeks = 12;
                    const trends = [];
                    for (let i = weeks - 1; i >= 0; i--) {
                        const start = new Date(now);
                        start.setDate(now.getDate() - (i * 7));
                        const end = new Date(start);
                        end.setDate(start.getDate() + 7);
                        const [total, members, visitors] = await Promise.all([
                            prisma.attendance.count({ where: { check_in_date: { gte: start, lt: end } } }),
                            prisma.attendance.count({ where: { check_in_date: { gte: start, lt: end }, status: 'present' } }),
                            prisma.attendance.count({ where: { check_in_date: { gte: start, lt: end }, status: 'visitor' } })
                        ]);
                        trends.push({ week: `Week ${weeks - i}`, total, members, visitors });
                    }
                    return NextResponse.json({ success: true, data: trends });
                }
                if (type === 'demographics') {
                    const members = await prisma.member.findMany({
                        where: { date_of_birth: { not: null } },
                        select: { date_of_birth: true }
                    });
                    const ageGroups = { '0-12': 0, '13-19': 0, '20-35': 0, '36+': 0 };
                    members.forEach(m => {
                        const age = now.getFullYear() - m.date_of_birth!.getFullYear();
                        if (age <= 12) ageGroups['0-12']++;
                        else if (age <= 19) ageGroups['13-19']++;
                        else if (age <= 35) ageGroups['20-35']++;
                        else ageGroups['36+']++;
                    });
                    return NextResponse.json({ success: true, data: { age_groups: Object.entries(ageGroups).map(([group, count]) => ({ age_group: group, count })) } });
                }
                if (type === 'service_breakdown') {
                    const services = await prisma.attendance.groupBy({ by: ['service_id'], _count: { _all: true }, where: { check_in_date: { gte: startOfMonth } } });
                    return NextResponse.json({ success: true, data: services.map(s => ({ service_id: s.service_id, count: s._count._all })) });
                }
                if (type === 'peak_days') {
                    const attendance = await prisma.attendance.findMany({
                        where: { check_in_date: { gte: startOfMonth } },
                        select: { check_in_date: true }
                    });
                    const dayCounts: Record<string, number> = { 'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0 };
                    attendance.forEach(a => {
                        const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(a.check_in_date);
                        dayCounts[day]++;
                    });
                    return NextResponse.json({ success: true, data: Object.entries(dayCounts).map(([day, count]) => ({ day, count })).filter(d => d.count > 0) });
                }
                if (type === 'group_participation') {
                    const groups = await prisma.member.groupBy({ by: ['church_group'], _count: { _all: true } });
                    return NextResponse.json({ success: true, data: groups.map(g => ({ group: g.church_group || 'None', count: g._count._all })) });
                }
                if (type === 'retention') {
                    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                    const months = [];
                    for (let i = 0; i < 6; i++) {
                        const mStart = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
                        const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 1);

                        const [regulars, returnings, firstTimers] = await Promise.all([
                            prisma.attendance.count({ where: { check_in_date: { gte: mStart, lt: mEnd }, member_id: { not: null } } }),
                            prisma.attendance.count({ where: { check_in_date: { gte: mStart, lt: mEnd }, visitor_id: { not: null }, visitor: { visit_count: { gt: 1 } } } }),
                            prisma.attendance.count({ where: { check_in_date: { gte: mStart, lt: mEnd }, OR: [{ visitor_id: { not: null }, visitor: { visit_count: 1 } }, { member: { created_at: { gte: mStart, lt: mEnd } } }] } })
                        ]);

                        months.push({
                            month: mStart.toLocaleString('default', { month: 'short' }),
                            regular: regulars,
                            returning: returnings,
                            first_timers: firstTimers
                        });
                    }
                    return NextResponse.json({ success: true, data: months });
                }

                // Default: overview
                const totalMembers = await prisma.member.count();
                const [attended, visitors, peak] = await Promise.all([
                    prisma.attendance.count({ where: { check_in_date: { gte: startOfMonth }, status: 'present' } }),
                    prisma.attendance.count({ where: { check_in_date: { gte: startOfMonth }, status: 'visitor' } }),
                    prisma.attendance.count({ where: { check_in_date: { gte: startOfMonth } } })
                ]);
                const males = await prisma.member.count({ where: { gender: 'Male', attendance: { some: { check_in_date: { gte: startOfMonth } } } } });
                const females = await prisma.member.count({ where: { gender: 'Female', attendance: { some: { check_in_date: { gte: startOfMonth } } } } });

                return NextResponse.json({
                    success: true,
                    data: {
                        total_members: totalMembers,
                        members_attended: attended,
                        total_visitors: visitors,
                        avg_attendance: Math.round(attended / 4),
                        attendance_rate: totalMembers > 0 ? Math.round((attended / totalMembers) * 100) : 0,
                        peak_attendance: peak,
                        males_count: males,
                        females_count: females,
                        children_count: Math.round(attended * 0.2)
                    }
                });
            }

            case 'financial': {
                const [off, tit, proj, wel, exp, withd] = await Promise.all([
                    prisma.offering.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount_collected: true } }),
                    prisma.tithe.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),
                    prisma.projectOffering.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount_collected: true } }),
                    prisma.welfareContribution.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),
                    prisma.expense.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),
                    prisma.withdrawal.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } })
                ]);
                const income = (Number(off._sum.amount_collected) || 0) + (Number(tit._sum.amount) || 0) + (Number(proj._sum.amount_collected) || 0) + (Number(wel._sum.amount) || 0);
                const expenses = (Number(exp._sum.amount) || 0) + (Number(withd._sum.amount) || 0);
                return NextResponse.json({ success: true, data: { total_income: income, total_expenses: expenses, net_income: income - expenses } });
            }

            case 'birthdays': {
                const monthlyData: any[] = await prisma.$queryRaw`
                    SELECT EXTRACT(MONTH FROM date_of_birth)::int as month, COUNT(*)::int as count
                    FROM members
                    WHERE date_of_birth IS NOT NULL
                    GROUP BY month
                    ORDER BY month
                `;

                const months = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];

                const chartData = months.map((monthName, index) => {
                    const monthNum = index + 1;
                    const found = monthlyData.find(d => d.month === monthNum);
                    return {
                        month: monthNum,
                        month_name: monthName,
                        count: found ? found.count : 0
                    };
                });

                const totalBirthdays = chartData.reduce((sum, item) => sum + item.count, 0);
                let highestMonth = chartData[0];
                chartData.forEach(d => {
                    if (d.count > highestMonth.count) highestMonth = d;
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        monthly: chartData,
                        total_birthdays: totalBirthdays,
                        highest_month: highestMonth,
                        average_per_month: totalBirthdays > 0 ? (totalBirthdays / 12).toFixed(1) : 0
                    }
                });
            }

            case 'insights': {
                const insights = [
                    { type: "success", icon: "trending-up", text: "Membership has grown by 8% this month.", priority: 1, module: "Members" },
                    { type: "info", icon: "dollar", text: "Project offering goals for the sanctuary project are 65% complete.", priority: 2, module: "Finance" },
                    { type: "warning", icon: "alert", text: "Attendance in the 2nd service is 15% lower than the 1st service.", priority: 3, module: "Attendance" }
                ];
                return NextResponse.json({ success: true, data: insights });
            }

            case 'blogs': {
                const now = new Date();
                const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

                const [
                    total, published, drafts, featured,
                    currMonth, prevMonth,
                    recentPosts, categories, authors
                ] = await Promise.all([
                    prisma.blog.count(),
                    prisma.blog.count({ where: { status: 'published' } }),
                    prisma.blog.count({ where: { status: 'draft' } }),
                    prisma.blog.count({ where: { is_featured: true } }),
                    prisma.blog.count({ where: { created_at: { gte: currentMonthStart } } }),
                    prisma.blog.count({ where: { created_at: { gte: prevMonthStart, lte: prevMonthEnd } } }),
                    prisma.blog.findMany({ take: 10, orderBy: { created_at: 'desc' } }),
                    prisma.blog.groupBy({
                        by: ['category'],
                        _count: { _all: true },
                        orderBy: { _count: { category: 'desc' } }
                    }),
                    prisma.blog.groupBy({
                        by: ['author'],
                        _count: { _all: true },
                        orderBy: { _count: { author: 'desc' } },
                        take: 5
                    })
                ]);

                // Calculate growth
                let growth = 0;
                if (prevMonth > 0) {
                    growth = Math.round(((currMonth - prevMonth) / prevMonth) * 100);
                } else if (currMonth > 0) {
                    growth = 100;
                }

                // Monthly trends (last 12 months)
                const trends = [];
                for (let i = 11; i >= 0; i--) {
                    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
                    const count = await prisma.blog.count({
                        where: { created_at: { gte: start, lte: end } }
                    });
                    trends.push({
                        month: start.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
                        count
                    });
                }

                // Average posts per month
                const firstPost = await prisma.blog.findFirst({ orderBy: { created_at: 'asc' } });
                let avgPerMonth = 0;
                if (firstPost) {
                    const monthsDiff = Math.max(1, (now.getFullYear() - firstPost.created_at.getFullYear()) * 12 + (now.getMonth() - firstPost.created_at.getMonth()) + 1);
                    avgPerMonth = Number((total / monthsDiff).toFixed(1));
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        total_posts: total,
                        published_posts: published,
                        draft_posts: drafts,
                        featured_posts: featured,
                        posts_this_month: currMonth,
                        month_growth: growth,
                        category_distribution: categories.map(c => ({
                            name: c.category || 'Uncategorized',
                            count: c._count._all
                        })),
                        status_distribution: [
                            { name: 'Published', count: published },
                            { name: 'Draft', count: drafts }
                        ],
                        monthly_trends: trends,
                        top_authors: authors.map(a => ({
                            name: a.author || 'Anonymous',
                            posts: a._count._all
                        })),
                        recent_posts: recentPosts.map(p => ({
                            id: p.id,
                            title: p.title,
                            author: p.author || 'Anonymous',
                            category: p.category || 'Uncategorized',
                            status: p.status,
                            is_featured: p.is_featured,
                            date: p.published_at?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ||
                                p.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        })),
                        total_categories: categories.length,
                        total_authors: authors.length,
                        avg_posts_per_month: avgPerMonth
                    }
                });
            }

            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
