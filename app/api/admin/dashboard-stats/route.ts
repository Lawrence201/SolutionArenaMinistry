import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const stats: any = {};

        // ========================================
        // TOTAL MEMBERS
        // ========================================
        const totalMembers = await prisma.member.count();
        stats.total_members = totalMembers;

        // Get new members this month
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const newMembersThisMonth = await prisma.member.count({
            where: {
                created_at: {
                    gte: currentMonthStart
                }
            }
        });
        stats.members_change = newMembersThisMonth;

        // ========================================
        // TOTAL EVENTS
        // ========================================
        const totalEvents = await prisma.event.count();
        stats.total_events = totalEvents;

        const newEventsThisMonth = await prisma.event.count({
            where: {
                created_at: {
                    gte: currentMonthStart
                }
            }
        });
        stats.events_change = newEventsThisMonth;

        // ========================================
        // FINANCIAL TOTALS (All Time)
        // ========================================
        const offeringsTotal = await prisma.offering.aggregate({
            _sum: { amount_collected: true }
        });
        stats.total_offerings = Number(offeringsTotal._sum.amount_collected) || 0;

        const tithesTotal = await prisma.tithe.aggregate({
            _sum: { amount: true }
        });
        stats.total_tithes = Number(tithesTotal._sum.amount) || 0;

        const projectOfferingsTotal = await prisma.projectOffering.aggregate({
            _sum: { amount_collected: true }
        });
        stats.total_project_offerings = Number(projectOfferingsTotal._sum.amount_collected) || 0;

        const welfareTotal = await prisma.welfareContribution.aggregate({
            _sum: { amount: true }
        });
        stats.total_welfare = Number(welfareTotal._sum.amount) || 0;

        // ========================================
        // EXPENSES & WITHDRAWALS (All Time)
        // ========================================
        const expensesTotal = await prisma.expense.aggregate({
            _sum: { amount: true }
        });
        stats.total_expenses = Number(expensesTotal._sum.amount) || 0;

        const withdrawalsTotal = await prisma.withdrawal.aggregate({
            _sum: { amount: true }
        });
        stats.total_withdrawals = Number(withdrawalsTotal._sum.amount) || 0;

        // ========================================
        // MEMBERSHIP OVERVIEW
        // ========================================
        const activeMembers = await prisma.member.count({
            where: { status: "Active" }
        });
        stats.active_members = activeMembers;

        const inactiveMembers = await prisma.member.count({
            where: { status: "Inactive" }
        });
        stats.inactive_members = inactiveMembers;

        const visitors = await prisma.member.count({
            where: { membership_type: "Visitor" }
        });
        stats.visitors = visitors;

        // ========================================
        // MONTHLY GOALS
        // ========================================
        const currentMonthEnd = new Date();
        currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
        currentMonthEnd.setDate(0);
        currentMonthEnd.setHours(23, 59, 59, 999);

        // New members this month
        stats.new_members_month = newMembersThisMonth;
        stats.new_members_goal = 50;
        stats.new_members_percent = stats.new_members_goal > 0
            ? Math.round((newMembersThisMonth / (stats.new_members_goal as number)) * 100)
            : 0;

        // Tithes (Last 3 Months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const tithesLast3Months = await prisma.tithe.aggregate({
            _sum: { amount: true },
            where: {
                date: { gte: threeMonthsAgo }
            }
        });
        stats.tithes_last_3_months = Number(tithesLast3Months._sum.amount) || 0;
        stats.donations_goal = 60000;

        // Event Attendance This Month
        const attendanceThisMonth = await prisma.attendance.count({
            where: {
                check_in_date: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd
                },
                status: "present"
            }
        });
        stats.event_attendance_month = attendanceThisMonth;
        stats.attendance_goal = 400;
        stats.attendance_percent = stats.attendance_goal > 0
            ? Math.round((attendanceThisMonth / (stats.attendance_goal as number)) * 100)
            : 0;

        // ========================================
        // FINANCIAL TRENDS (Last 6 months)
        // ========================================
        const financialTrends = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date();
            monthStart.setMonth(monthStart.getMonth() - i);
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);
            monthEnd.setHours(23, 59, 59, 999);

            const monthName = monthStart.toLocaleString('default', { month: 'short' });

            // Get all income for this month
            const [offerings, tithes, projectOfferings, welfare] = await Promise.all([
                prisma.offering.aggregate({
                    _sum: { amount_collected: true },
                    where: { date: { gte: monthStart, lte: monthEnd } }
                }),
                prisma.tithe.aggregate({
                    _sum: { amount: true },
                    where: { date: { gte: monthStart, lte: monthEnd } }
                }),
                prisma.projectOffering.aggregate({
                    _sum: { amount_collected: true },
                    where: { date: { gte: monthStart, lte: monthEnd } }
                }),
                prisma.welfareContribution.aggregate({
                    _sum: { amount: true },
                    where: { date: { gte: monthStart, lte: monthEnd } }
                })
            ]);

            const totalIncome =
                (Number(offerings._sum.amount_collected) || 0) +
                (Number(tithes._sum.amount) || 0) +
                (Number(projectOfferings._sum.amount_collected) || 0) +
                (Number(welfare._sum.amount) || 0);

            financialTrends.push({
                month: monthName,
                amount: totalIncome
            });
        }
        stats.financial_trends = financialTrends;

        // ========================================
        // ATTENDANCE TRENDS (Last 6 months)
        // ========================================
        const attendanceTrends = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date();
            monthStart.setMonth(monthStart.getMonth() - i);
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);
            monthEnd.setHours(23, 59, 59, 999);

            const monthName = monthStart.toLocaleString('default', { month: 'short' });

            const attendance = await prisma.attendance.count({
                where: {
                    check_in_date: { gte: monthStart, lte: monthEnd },
                    status: "present"
                }
            });

            attendanceTrends.push({
                month: monthName,
                attendance: attendance
            });
        }
        stats.attendance_trends = attendanceTrends;

        return NextResponse.json({
            success: true,
            data: stats,
            message: "Statistics retrieved successfully"
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Unknown error occurred"
        }, { status: 500 });
    }
}
