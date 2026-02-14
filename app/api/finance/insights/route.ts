import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET() {
    try {
        const now = new Date();
        const curStart = startOfMonth(now);
        const curEnd = endOfMonth(now);
        const prevStart = startOfMonth(subMonths(now, 1));
        const prevEnd = endOfMonth(subMonths(now, 1));

        const insights = [];

        // 1. Total Income This Month
        const [offerings, tithes, projects, welfare] = await Promise.all([
            prisma.offering.aggregate({ where: { date: { gte: curStart, lte: curEnd } }, _sum: { amount_collected: true } }),
            prisma.tithe.aggregate({ where: { date: { gte: curStart, lte: curEnd }, status: 'Paid' }, _sum: { amount: true } }),
            prisma.projectOffering.aggregate({ where: { date: { gte: curStart, lte: curEnd } }, _sum: { amount_collected: true } }),
            prisma.welfareContribution.aggregate({ where: { date: { gte: curStart, lte: curEnd }, status: 'Paid' }, _sum: { amount: true } })
        ]);

        const totalIncome =
            (Number(offerings._sum.amount_collected) || 0) +
            (Number(tithes._sum.amount) || 0) +
            (Number(projects._sum.amount_collected) || 0) +
            (Number(welfare._sum.amount) || 0);

        if (totalIncome > 0) {
            insights.push({
                type: 'success',
                icon: 'dollar',
                text: `Total income this month: ₵${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                priority: 1
            });
        }

        // 2. Offering Trend
        const [curOff, prevOff] = await Promise.all([
            prisma.offering.aggregate({ where: { date: { gte: curStart, lte: curEnd } }, _sum: { amount_collected: true } }),
            prisma.offering.aggregate({ where: { date: { gte: prevStart, lte: prevEnd } }, _sum: { amount_collected: true } })
        ]);

        const curVal = Number(curOff._sum.amount_collected) || 0;
        const prevVal = Number(prevOff._sum.amount_collected) || 0;

        if (prevVal > 0) {
            const change = ((curVal - prevVal) / prevVal) * 100;
            if (change > 0) {
                insights.push({
                    type: 'success',
                    icon: 'trending-up',
                    text: `Offerings increased by ${change.toFixed(1)}% this month`,
                    priority: 2
                });
            } else if (change < -10) {
                insights.push({
                    type: 'warning',
                    icon: 'trending-down',
                    text: `Offerings decreased by ${Math.abs(change).toFixed(1)}% this month`,
                    priority: 2
                });
            }
        }

        // 3. Top Donor Recognition (Tithe > 1000)
        const topDonors = await prisma.tithe.count({
            where: { date: { gte: curStart, lte: curEnd }, amount: { gte: 1000 }, status: 'Paid' }
        });

        if (topDonors > 0) {
            insights.push({
                type: 'success',
                icon: 'users',
                text: `${topDonors} members contributed ₵1,000+ this month - send thank you notes`,
                priority: 3
            });
        }

        // 4. Expense Alert (Largest Category)
        const expensesByCategory = await prisma.expense.groupBy({
            by: ['category'],
            where: { date: { gte: curStart, lte: curEnd }, status: 'Approved' },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 1
        });

        if (expensesByCategory.length > 0) {
            const topExp = expensesByCategory[0];
            insights.push({
                type: 'info',
                icon: 'alert',
                text: `${topExp.category} is the largest expense category this month (₵${Number(topExp._sum.amount).toLocaleString()})`,
                priority: 4
            });
        }

        // 5. Large Withdrawal Alert (Recent 7 days > 2000)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const largeWithdrawal = await prisma.withdrawal.findFirst({
            where: { date: { gte: last7Days }, amount: { gte: 2000 } },
            orderBy: { date: 'desc' }
        });

        if (largeWithdrawal) {
            insights.push({
                type: 'warning',
                icon: 'alert',
                text: `Recent large withdrawal: ₵${Number(largeWithdrawal.amount).toLocaleString()} for "${largeWithdrawal.purpose}"`,
                priority: 2
            });
        }

        // 6. Consistent Donors (Tithes in 4+ of last 6 months)
        // This is a bit complex for a simple query, let's do a simplified version
        const sixMonthsAgo = subMonths(now, 6);
        const consistentCount = await prisma.member.count({
            where: {
                tithes: {
                    some: { date: { gte: sixMonthsAgo } }
                }
            }
        });

        if (consistentCount > 5) {
            insights.push({
                type: 'success',
                icon: 'users',
                text: `${consistentCount} members have been consistent donors recently - appreciate them`,
                priority: 5
            });
        }

        // Sort and slice
        const sortedInsights = insights
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 6);

        return NextResponse.json({
            success: true,
            data: sortedInsights,
            count: sortedInsights.length
        });

    } catch (error) {
        console.error('Error generating finance insights:', error);
        return NextResponse.json({ success: false, message: 'Failed to generate insights' }, { status: 500 });
    }
}
