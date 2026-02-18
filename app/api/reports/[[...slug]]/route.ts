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

                // Membership Stats
                const [totalMembers, newMembers, prevNewMembers, activeMembers, inactiveMembers, visitors] = await Promise.all([
                    prisma.member.count(),
                    prisma.member.count({ where: { created_at: { gte: currentMonthStart } } }),
                    prisma.member.count({ where: { created_at: { gte: prevMonthStart, lte: prevMonthEnd } } }),
                    prisma.member.count({ where: { status: "Active" } }),
                    prisma.member.count({ where: { status: "Inactive" } }),
                    prisma.member.count({ where: { membership_type: "Visitor" } })
                ]);

                // Ministry Distribution
                const ministries = await prisma.member.groupBy({
                    by: ['church_group'],
                    _count: { _all: true },
                    where: { NOT: { church_group: null } }
                });

                // Financial Summary (Current vs Prev Month)
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

                // Attendance Summary
                const [currAtt, prevAtt] = await Promise.all([
                    prisma.attendance.aggregate({ where: { check_in_date: { gte: currentMonthStart } }, _avg: { attendance_id: true }, _count: { _all: true } }),
                    prisma.attendance.aggregate({ where: { check_in_date: { gte: prevMonthStart, lte: prevMonthEnd } }, _avg: { attendance_id: true }, _count: { _all: true } }),
                ]);

                // 6 Month Trends
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
                            retention_rate: 98, // Simulated
                        },
                        ministries: ministries.map(m => ({ church_group: m.church_group, count: m._count._all })),
                        financial: {
                            total_income: currInc,
                            prev_total_income: prevInc,
                            income_growth: prevInc > 0 ? ((currInc - prevInc) / prevInc) * 100 : 0,
                            financial_health: 85
                        },
                        attendance: {
                            avg_attendance: currAtt._count._all > 0 ? Math.round(currAtt._count._all / 4) : 0, // Approx weekly
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
            case 'insights': {
                // Return data formatted for KeyInsights.tsx
                const insights = [
                    { type: "success", icon: "trending-up", text: "Membership has grown by 8% this month.", priority: 1, module: "Members" },
                    { type: "info", icon: "dollar", text: "Project offering goals for the sanctuary project are 65% complete.", priority: 2, module: "Finance" },
                    { type: "warning", icon: "alert", text: "Attendance in the 2nd service is 15% lower than the 1st service.", priority: 3, module: "Attendance" }
                ];
                return NextResponse.json({ success: true, data: insights });
            }
            case 'attendance': {
                if (type === 'overview') {
                    const totalMembers = await prisma.member.count();
                    const attended = (await prisma.attendance.groupBy({ by: ['member_id'], where: { check_in_date: { gte: startOfMonth }, status: 'present' } })).length;
                    const visitors = await prisma.attendance.count({ where: { check_in_date: { gte: startOfMonth }, status: 'visitor' } });
                    return NextResponse.json({ success: true, data: { total_members: totalMembers, members_attended: attended, total_visitors: visitors, attendance_rate: totalMembers > 0 ? (attended / totalMembers) * 100 : 0 } });
                }
                return NextResponse.json({ success: true, data: {} });
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
            case 'blogs': {
                return NextResponse.json({
                    success: true,
                    data: {
                        total_blogs: await prisma.blog.count(),
                        published_blogs: await prisma.blog.count({ where: { status: 'published' } }),
                        draft_blogs: await prisma.blog.count({ where: { status: 'draft' } })
                    }
                });
            }
            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
