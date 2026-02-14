import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Insight {
    type: "success" | "warning" | "info" | "danger";
    icon: string;
    text: string;
    priority: number;
    module: string;
}

export async function GET(request: NextRequest) {
    try {
        const insights: Insight[] = [];
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // --- MEMBER INSIGHTS ---
        try {
            // 1. High Engagement
            const highEngagement = await prisma.member.findMany({
                where: { status: "Active" },
                select: {
                    first_name: true,
                    last_name: true,
                    _count: {
                        select: {
                            attendance: {
                                where: { check_in_date: { gte: ninetyDaysAgo } }
                            }
                        }
                    }
                },
                orderBy: { attendance: { _count: 'desc' } },
                take: 2
            });

            if (highEngagement.length > 0 && highEngagement[0]._count.attendance >= 10) {
                const names = highEngagement.map(m => `${m.first_name} ${m.last_name}`).join(' and ');
                insights.push({
                    type: "success",
                    icon: "trending-up",
                    text: `${names} show exceptional engagement patterns`,
                    priority: 1,
                    module: "Members"
                });
            }

            // 2. Follow-Up Needed (Absent 45+ days)
            const fortyFiveDaysAgo = new Date(now.getTime() - (45 * 24 * 60 * 60 * 1000));
            const absentMember = await prisma.member.findFirst({
                where: {
                    status: "Active",
                    OR: [
                        { attendance: { none: {} } },
                        { attendance: { every: { check_in_date: { lt: fortyFiveDaysAgo } } } }
                    ]
                },
                include: {
                    attendance: {
                        orderBy: { check_in_date: 'desc' },
                        take: 1
                    }
                }
            });

            if (absentMember) {
                const lastSeen = absentMember.attendance[0]?.check_in_date;
                const days = lastSeen ? Math.floor((now.getTime() - lastSeen.getTime()) / (24 * 60 * 60 * 1000)) : "90+";
                insights.push({
                    type: "warning",
                    icon: "alert",
                    text: `${absentMember.first_name} ${absentMember.last_name} hasn't attended in ${days} days - consider outreach`,
                    priority: 2,
                    module: "Members"
                });
            }

            // 3. Growth (Quarterly)
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

            const [currentQuarterCount, lastQuarterCount] = await Promise.all([
                prisma.member.count({ where: { created_at: { gte: threeMonthsAgo } } }),
                prisma.member.count({ where: { created_at: { gte: sixMonthsAgo, lt: threeMonthsAgo } } })
            ]);

            if (lastQuarterCount > 0) {
                const change = Math.round(((currentQuarterCount - lastQuarterCount) / lastQuarterCount) * 100);
                if (change !== 0) {
                    insights.push({
                        type: change > 0 ? "success" : "warning",
                        icon: "users",
                        text: `${Math.abs(change)}% ${change > 0 ? 'increase' : 'decrease'} in new members this quarter`,
                        priority: 3,
                        module: "Members"
                    });
                }
            }

            // 4. Inactive Count
            const inactiveCount = await prisma.member.count({ where: { status: "Inactive" } });
            if (inactiveCount > 0) {
                insights.push({
                    type: "warning",
                    icon: "alert",
                    text: `${inactiveCount} members marked as inactive - review engagement strategies`,
                    priority: 3,
                    module: "Members"
                });
            }
        } catch (e) {
            console.error("Member Insights Error:", e);
        }

        // --- EVENT INSIGHTS ---
        try {
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

            // 1. Upcoming Events (30 days)
            const nextMonth = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
            const upcomingCount = await prisma.event.count({
                where: {
                    start_date: { gte: now, lte: nextMonth },
                    status: "Published"
                }
            });
            if (upcomingCount === 0) {
                insights.push({
                    type: "warning",
                    icon: "calendar",
                    text: "No events scheduled for the next 30 days - plan ahead",
                    priority: 1,
                    module: "Events"
                });
            } else {
                insights.push({
                    type: "info",
                    icon: "calendar",
                    text: `${upcomingCount} events scheduled this month`,
                    priority: 3,
                    module: "Events"
                });
            }

            // 2. High Activity Category
            const activity = await prisma.event.groupBy({
                by: ['category'],
                where: {
                    start_date: { gte: threeMonthsAgo },
                    status: "Published"
                },
                _count: { category: true },
                orderBy: { _count: { category: 'desc' } },
                take: 1
            });

            if (activity.length > 0 && activity[0]._count.category && activity[0]._count.category >= 2) {
                insights.push({
                    type: "success",
                    icon: "trending-up",
                    text: `${activity[0].category} events show high activity - consider expanding`,
                    priority: 2,
                    module: "Events"
                });
            }

            // 3. Most Frequent Type
            const frequentType = await prisma.event.groupBy({
                by: ['type'],
                where: {
                    start_date: { gte: threeMonthsAgo },
                    status: "Published"
                },
                _count: { type: true },
                orderBy: { _count: { type: 'desc' } },
                take: 1
            });
            if (frequentType.length > 0) {
                insights.push({
                    type: "info",
                    icon: "calendar",
                    text: `${frequentType[0].type} events are most frequent with ${frequentType[0]._count.type} events this quarter`,
                    priority: 3,
                    module: "Events"
                });
            }
        } catch (e) {
            console.error("Event Insights Error:", e);
        }

        // --- FINANCE INSIGHTS ---
        try {
            // 1. Total Income This Month
            const [offerings, tithes, projectOfferings, welfare] = await Promise.all([
                prisma.offering.aggregate({ _sum: { amount_collected: true }, where: { date: { gte: currentMonthStart } } }),
                prisma.tithe.aggregate({ _sum: { amount: true }, where: { date: { gte: currentMonthStart } } }),
                prisma.projectOffering.aggregate({ _sum: { amount_collected: true }, where: { date: { gte: currentMonthStart } } }),
                prisma.welfareContribution.aggregate({ _sum: { amount: true }, where: { date: { gte: currentMonthStart } } })
            ]);
            const totalIncome = (Number(offerings._sum.amount_collected) || 0) + (Number(tithes._sum.amount) || 0) + (Number(projectOfferings._sum.amount_collected) || 0) + (Number(welfare._sum.amount) || 0);

            if (totalIncome > 0) {
                insights.push({
                    type: "success",
                    icon: "dollar",
                    text: `Total income this month: GH₵${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    priority: 1,
                    module: "Finance"
                });
            }

            // 2. Budget Performance (Mock annual budget 100k)
            const annualBudget = 100000;
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const ytdIncomeAggr = await Promise.all([
                prisma.offering.aggregate({ _sum: { amount_collected: true }, where: { date: { gte: yearStart } } }),
                prisma.tithe.aggregate({ _sum: { amount: true }, where: { date: { gte: yearStart } } }),
                prisma.projectOffering.aggregate({ _sum: { amount_collected: true }, where: { date: { gte: yearStart } } }),
                prisma.welfareContribution.aggregate({ _sum: { amount: true }, where: { date: { gte: yearStart } } })
            ]);
            const ytdIncome = ytdIncomeAggr.reduce((acc, curr) => acc + (Number(Object.values(curr._sum)[0]) || 0), 0);
            const monthsPassed = now.getMonth() + 1;
            const expectedIncome = (annualBudget / 12) * monthsPassed;
            if (expectedIncome > 0) {
                const performance = Math.round((ytdIncome / expectedIncome) * 100);
                insights.push({
                    type: performance >= 95 ? "success" : "warning",
                    icon: performance >= 95 ? "dollar" : "alert",
                    text: performance >= 95 ? `You're on track to meet ${performance}% of your annual budget goals` : `Budget performance at ${performance}% - review fundraising strategies`,
                    priority: 1,
                    module: "Finance"
                });
            }

            // 3. Donation Trend
            const prevMonthOfferings = await prisma.offering.aggregate({
                _sum: { amount_collected: true },
                where: { date: { gte: lastMonthStart, lte: lastMonthEnd } }
            });
            const currentMonthOfferings = Number(offerings._sum.amount_collected) || 0;
            const lastMonthOfferingsVal = Number(prevMonthOfferings._sum.amount_collected) || 0;
            if (lastMonthOfferingsVal > 0 && currentMonthOfferings > 0) {
                const change = Math.round(((currentMonthOfferings - lastMonthOfferingsVal) / lastMonthOfferingsVal) * 100);
                if (Math.abs(change) > 5) {
                    insights.push({
                        type: change > 0 ? "success" : "warning",
                        icon: change > 0 ? "trending-up" : "trending-down",
                        text: `Offerings ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)}% this month`,
                        priority: 2,
                        module: "Finance"
                    });
                }
            }
        } catch (e) {
            console.error("Finance Insights Error:", e);
        }

        // --- COMMUNICATION INSIGHTS ---
        try {
            // 1. Total Messages
            const messageCount = await prisma.message.count({
                where: { sent_at: { gte: currentMonthStart } }
            });
            if (messageCount > 0) {
                insights.push({
                    type: "info",
                    icon: "message",
                    text: `${messageCount} messages sent this month`,
                    priority: 1,
                    module: "Communication"
                });
            }
        } catch (e) {
            console.error("Communication Insights Error:", e);
        }

        // Sort by priority and limit to 12
        insights.sort((a, b) => a.priority - b.priority);
        const finalInsights = insights.slice(0, 12);

        return NextResponse.json({
            success: true,
            data: finalInsights,
            count: finalInsights.length
        });

    } catch (error) {
        console.error("Insights API Error:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Unknown error occurred"
        }, { status: 500 });
    }
}
