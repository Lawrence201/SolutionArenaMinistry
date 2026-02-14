import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        // Get date ranges
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Membership metrics
        const [totalMembers, newMembers30d, newMembers60d] = await Promise.all([
            prisma.member.count(),
            prisma.member.count({ where: { created_at: { gte: thirtyDaysAgo } } }),
            prisma.member.count({ where: { created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } })
        ]);

        const membershipGrowthRate = newMembers60d > 0
            ? (((newMembers30d - newMembers60d) / newMembers60d) * 100).toFixed(1)
            : '0.0';

        // Active members (checked in in last 30 days)
        const activeMembers = await prisma.attendance.groupBy({
            by: ['member_id'],
            where: {
                check_in_date: { gte: thirtyDaysAgo },
                member_id: { not: null }
            }
        });

        const activeMemberCount = activeMembers.length;
        const inactiveMemberCount = totalMembers - activeMemberCount;

        // Financial metrics aggregation (Matches finance/overview logic)
        const [offerings, tithes, projectOfferings, welfare, expenses, withdrawals] = await Promise.all([
            prisma.offering.aggregate({
                where: { date: { gte: thirtyDaysAgo } },
                _sum: { amount_collected: true }
            }),
            prisma.tithe.aggregate({
                where: { date: { gte: thirtyDaysAgo } },
                _sum: { amount: true }
            }),
            prisma.projectOffering.aggregate({
                where: { date: { gte: thirtyDaysAgo } },
                _sum: { amount_collected: true }
            }),
            prisma.welfareContribution.aggregate({
                where: { date: { gte: thirtyDaysAgo } },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { date: { gte: thirtyDaysAgo } },
                _sum: { amount: true }
            }),
            prisma.withdrawal.aggregate({
                where: { date: { gte: thirtyDaysAgo } },
                _sum: { amount: true }
            })
        ]);

        const totalIncome =
            (Number(offerings._sum.amount_collected) || 0) +
            (Number(tithes._sum.amount) || 0) +
            (Number(projectOfferings._sum.amount_collected) || 0) +
            (Number(welfare._sum.amount) || 0);

        const totalExpenses =
            (Number(expenses._sum.amount) || 0) +
            (Number(withdrawals._sum.amount) || 0);

        const netIncome = totalIncome - totalExpenses;

        // Calculate financial health (0-100)
        let financialHealth = 0;
        if (totalIncome > 0) {
            const ratio = netIncome / totalIncome;
            if (ratio >= 0.5) financialHealth = 100;
            else if (ratio >= 0.3) financialHealth = 80;
            else if (ratio >= 0.1) financialHealth = 60;
            else if (ratio >= 0) financialHealth = 40;
            else if (ratio >= -0.2) financialHealth = 20;
        }

        // Attendance metrics (Calculated from individual check-in records)
        const attendanceRecords = await prisma.attendance.findMany({
            where: { check_in_date: { gte: thirtyDaysAgo } },
            select: {
                status: true,
                service_id: true
            }
        });

        const totalAttendanceCount = attendanceRecords.length;
        const uniqueServices = new Set(attendanceRecords.map(r => r.service_id)).size;
        const avgAttendance = uniqueServices > 0
            ? Math.round(totalAttendanceCount / uniqueServices)
            : 0;

        // Events metrics
        const [upcomingEvents, pastEvents] = await Promise.all([
            prisma.event.count({ where: { start_date: { gte: now } } }),
            prisma.event.count({ where: { start_date: { lt: now, gte: thirtyDaysAgo } } })
        ]);

        // Communication metrics
        const messagesSent = await prisma.message.count({
            where: { created_at: { gte: thirtyDaysAgo } }
        });

        // Get ministry distribution
        const ministries = await prisma.member.groupBy({
            by: ['church_group'],
            _count: true,
            where: { church_group: { not: null } }
        });

        const ministryDistribution = ministries.map(m => ({
            church_group: m.church_group || 'Unassigned',
            count: m._count
        }));

        // Calculate engagement rate
        const engagementRate = totalMembers > 0
            ? ((activeMemberCount / totalMembers) * 100).toFixed(1)
            : '0.0';

        // At-risk members
        const atRiskCount = totalMembers - activeMemberCount;

        // Get 6-month trends
        const trends = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
            const monthName = monthStart.toLocaleString('en-US', { month: 'short' });

            const [mMembers, mAttendance, mOffering, mTithe, mProject, mWelfare] = await Promise.all([
                prisma.member.count({ where: { created_at: { lte: monthEnd } } }),
                prisma.attendance.count({ where: { check_in_date: { gte: monthStart, lte: monthEnd } } }),
                prisma.offering.aggregate({ where: { date: { gte: monthStart, lte: monthEnd } }, _sum: { amount_collected: true } }),
                prisma.tithe.aggregate({ where: { date: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
                prisma.projectOffering.aggregate({ where: { date: { gte: monthStart, lte: monthEnd } }, _sum: { amount_collected: true } }),
                prisma.welfareContribution.aggregate({ where: { date: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } })
            ]);

            const monthIncome =
                (Number(mOffering._sum.amount_collected) || 0) +
                (Number(mTithe._sum.amount) || 0) +
                (Number(mProject._sum.amount_collected) || 0) +
                (Number(mWelfare._sum.amount) || 0);

            trends.push({
                month: monthName,
                members: mMembers,
                attendance: mAttendance,
                income: monthIncome
            });
        }

        // Previous month metrics (for KPI table comparison)
        const [prevMembers, prevAttendance, prevOffering, prevTithe, prevProject, prevWelfare] = await Promise.all([
            prisma.member.count({ where: { created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma.attendance.findMany({
                where: { check_in_date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
                select: { service_id: true }
            }),
            prisma.offering.aggregate({ where: { date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { amount_collected: true } }),
            prisma.tithe.aggregate({ where: { date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { amount: true } }),
            prisma.projectOffering.aggregate({ where: { date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { amount_collected: true } }),
            prisma.welfareContribution.aggregate({ where: { date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { amount: true } })
        ]);

        const prevIncome =
            (Number(prevOffering._sum.amount_collected) || 0) +
            (Number(prevTithe._sum.amount) || 0) +
            (Number(prevProject._sum.amount_collected) || 0) +
            (Number(prevWelfare._sum.amount) || 0);

        const prevUniqueServices = new Set(prevAttendance.map(r => r.service_id)).size;
        const prevAvgAttendance = prevUniqueServices > 0 ? Math.round(prevAttendance.length / prevUniqueServices) : 0;

        // Unique attendees across all events in last 30 days
        const uniqueAtRecords = await prisma.attendance.groupBy({
            by: ['member_id'],
            where: {
                check_in_date: { gte: thirtyDaysAgo },
                member_id: { not: null }
            }
        });
        const uniqueAttendeesCount = uniqueAtRecords.length;

        // Visitor metrics
        const [visitorModelCount, visitorMemberCount] = await Promise.all([
            prisma.visitor.count(),
            prisma.member.count({ where: { membership_type: 'Visitor' } })
        ]);
        const totalVisitors = visitorModelCount + visitorMemberCount;

        const summary = {
            membership: {
                total: totalMembers,
                active: activeMemberCount,
                inactive: inactiveMemberCount,
                new_30d: newMembers30d,
                prev_new_30d: prevMembers,
                visitors: totalVisitors,
                growth_rate: parseFloat(membershipGrowthRate),
                retention_rate: totalMembers > 0 ? ((activeMemberCount / totalMembers) * 100).toFixed(1) : '0.0'
            },
            financial: {
                total_income: totalIncome,
                prev_total_income: prevIncome,
                total_expenses: totalExpenses,
                net_income: netIncome,
                financial_health: financialHealth,
                income_growth: prevIncome > 0 ? (((totalIncome - prevIncome) / prevIncome) * 100).toFixed(1) : '0.0'
            },
            attendance: {
                avg_attendance: avgAttendance,
                prev_avg_attendance: prevAvgAttendance,
                total_records: totalAttendanceCount,
                growth_rate: prevAvgAttendance > 0 ? (((avgAttendance - prevAvgAttendance) / prevAvgAttendance) * 100).toFixed(1) : '0.0',
                attendance_rate: activeMemberCount > 0 ? ((avgAttendance / activeMemberCount) * 100).toFixed(1) : '0.0'
            },
            events: {
                upcoming: upcomingEvents,
                past: pastEvents,
                unique_attendees: uniqueAttendeesCount,
                engagement_rate: totalMembers > 0 ? ((uniqueAttendeesCount / totalMembers) * 100).toFixed(1) : '0.0'
            },
            communication: {
                messages_sent: messagesSent,
                delivery_rate: 100
            },
            ministries: ministryDistribution,
            engagement: {
                active: activeMemberCount,
                inactive: inactiveMemberCount,
                at_risk: atRiskCount > 0 ? atRiskCount : 0,
                visitors: totalVisitors,
                engagement_rate: parseFloat(engagementRate),
                prev_engagement_rate: 85 // Legacy default
            },
            trends: trends
        };

        return NextResponse.json({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error('Error fetching executive summary:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch executive summary',
                error_details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

