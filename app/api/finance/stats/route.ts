import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/finance/stats
 * Fetch financial KPI statistics with month-over-month comparison
 * Based on legacy get_finance_data_v2.php?type=stats
 */
export async function GET(req: NextRequest) {
    try {
        // Calculate date ranges
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const currentMonthEnd = new Date(currentMonth);
        currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
        currentMonthEnd.setDate(0);
        currentMonthEnd.setHours(23, 59, 59, 999);

        const previousMonth = new Date(currentMonth);
        previousMonth.setMonth(previousMonth.getMonth() - 1);

        const previousMonthEnd = new Date(previousMonth);
        previousMonthEnd.setMonth(previousMonthEnd.getMonth() + 1);
        previousMonthEnd.setDate(0);
        previousMonthEnd.setHours(23, 59, 59, 999);

        // Get all-time totals and current month stats in parallel
        const [
            allTimeOfferings,
            currentOfferings,
            previousOfferings,
            allTimeTithes,
            currentTithes,
            previousTithes,
            allTimeProjectOfferings,
            currentProjectOfferings,
            previousProjectOfferings,
            allTimeWelfare,
            currentWelfare,
            previousWelfare,
            allTimeExpenses,
            currentExpenses,
            previousExpenses,
            allTimeWithdrawals,
            currentWithdrawals,
            previousWithdrawals
        ] = await Promise.all([
            // All-time offerings
            prisma.offering.aggregate({
                _sum: { amount_collected: true }
            }),
            // Current month offerings
            prisma.offering.aggregate({
                where: { date: { gte: currentMonth, lte: currentMonthEnd } },
                _sum: { amount_collected: true }
            }),
            // Previous month offerings
            prisma.offering.aggregate({
                where: { date: { gte: previousMonth, lte: previousMonthEnd } },
                _sum: { amount_collected: true }
            }),
            // All-time tithes
            prisma.tithe.aggregate({
                _sum: { amount: true }
            }),
            // Current month tithes
            prisma.tithe.aggregate({
                where: { date: { gte: currentMonth, lte: currentMonthEnd } },
                _sum: { amount: true }
            }),
            // Previous month tithes
            prisma.tithe.aggregate({
                where: { date: { gte: previousMonth, lte: previousMonthEnd } },
                _sum: { amount: true }
            }),
            // All-time project offerings
            prisma.projectOffering.aggregate({
                _sum: { amount_collected: true }
            }),
            // Current month project offerings
            prisma.projectOffering.aggregate({
                where: { date: { gte: currentMonth, lte: currentMonthEnd } },
                _sum: { amount_collected: true }
            }),
            // Previous month project offerings
            prisma.projectOffering.aggregate({
                where: { date: { gte: previousMonth, lte: previousMonthEnd } },
                _sum: { amount_collected: true }
            }),
            // All-time welfare
            prisma.welfareContribution.aggregate({
                _sum: { amount: true }
            }),
            // Current month welfare
            prisma.welfareContribution.aggregate({
                where: { date: { gte: currentMonth, lte: currentMonthEnd } },
                _sum: { amount: true }
            }),
            // Previous month welfare
            prisma.welfareContribution.aggregate({
                where: { date: { gte: previousMonth, lte: previousMonthEnd } },
                _sum: { amount: true }
            }),
            // All-time expenses
            prisma.expense.aggregate({
                _sum: { amount: true }
            }),
            // Current month expenses
            prisma.expense.aggregate({
                where: {
                    date: { gte: currentMonth, lte: currentMonthEnd },
                    status: 'Approved'
                },
                _sum: { amount: true }
            }),
            // Previous month expenses
            prisma.expense.aggregate({
                where: {
                    date: { gte: previousMonth, lte: previousMonthEnd },
                    status: 'Approved'
                },
                _sum: { amount: true }
            }),
            // All-time withdrawals
            prisma.withdrawal.aggregate({
                _sum: { amount: true }
            }),
            // Current month withdrawals
            prisma.withdrawal.aggregate({
                where: { date: { gte: currentMonth, lte: currentMonthEnd } },
                _sum: { amount: true }
            }),
            // Previous month withdrawals
            prisma.withdrawal.aggregate({
                where: { date: { gte: previousMonth, lte: previousMonthEnd } },
                _sum: { amount: true }
            })
        ]);

        // Calculate percentage changes
        const calculatePercentageChange = (oldValue: number, newValue: number): number => {
            if (oldValue === 0) {
                return newValue > 0 ? 100 : 0;
            }
            return Math.round(((newValue - oldValue) / oldValue) * 100 * 10) / 10;
        };

        // Build response
        const stats = {
            offerings: {
                total: Number(allTimeOfferings._sum.amount_collected) || 0,
                current_month: Number(currentOfferings._sum.amount_collected) || 0,
                change: calculatePercentageChange(
                    Number(previousOfferings._sum.amount_collected) || 0,
                    Number(currentOfferings._sum.amount_collected) || 0
                )
            },
            tithes: {
                total: Number(allTimeTithes._sum.amount) || 0,
                current_month: Number(currentTithes._sum.amount) || 0,
                change: calculatePercentageChange(
                    Number(previousTithes._sum.amount) || 0,
                    Number(currentTithes._sum.amount) || 0
                )
            },
            project_offerings: {
                total: Number(allTimeProjectOfferings._sum.amount_collected) || 0,
                current_month: Number(currentProjectOfferings._sum.amount_collected) || 0,
                change: calculatePercentageChange(
                    Number(previousProjectOfferings._sum.amount_collected) || 0,
                    Number(currentProjectOfferings._sum.amount_collected) || 0
                )
            },
            welfare: {
                total: Number(allTimeWelfare._sum.amount) || 0,
                current_month: Number(currentWelfare._sum.amount) || 0,
                change: calculatePercentageChange(
                    Number(previousWelfare._sum.amount) || 0,
                    Number(currentWelfare._sum.amount) || 0
                )
            },
            expenses: {
                total: (Number(allTimeExpenses._sum.amount) || 0) + (Number(allTimeWithdrawals._sum.amount) || 0),
                current_month: (Number(currentExpenses._sum.amount) || 0) + (Number(currentWithdrawals._sum.amount) || 0),
                change: calculatePercentageChange(
                    (Number(previousExpenses._sum.amount) || 0) + (Number(previousWithdrawals._sum.amount) || 0),
                    (Number(currentExpenses._sum.amount) || 0) + (Number(currentWithdrawals._sum.amount) || 0)
                )
            }
        };

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching finance stats:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch financial statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
