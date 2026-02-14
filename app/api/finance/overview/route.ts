import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/finance/overview
 * Fetch overview financial data with date range filtering
 * Query params: range (today, week, month, quarter, year, all, custom)
 *               start_date, end_date (for custom range)
 * Based on legacy get_finance_data_v2.php?type=overview
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || 'month';
        const startDateParam = searchParams.get('start_date');
        const endDateParam = searchParams.get('end_date');

        // Calculate date ranges
        let startDate: Date;
        let endDate: Date = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (range === 'custom' && startDateParam && endDateParam) {
            startDate = new Date(startDateParam);
            endDate = new Date(endDateParam);
            endDate.setHours(23, 59, 59, 999);
        } else {
            switch (range) {
                case 'today':
                    startDate = new Date();
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 7);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startDate = new Date();
                    startDate.setDate(1);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'quarter':
                    startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 3);
                    startDate.setDate(1);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'year':
                    startDate = new Date();
                    startDate.setMonth(0);
                    startDate.setDate(1);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'all':
                default:
                    startDate = new Date('1900-01-01');
                    endDate = new Date('9999-12-31');
                    break;
            }
        }

        // Fetch all financial data in parallel
        const [offerings, tithes, projectOfferings, welfare, expenses, withdrawals] = await Promise.all([
            prisma.offering.aggregate({
                where: { date: { gte: startDate, lte: endDate } },
                _sum: { amount_collected: true }
            }),
            prisma.tithe.aggregate({
                where: { date: { gte: startDate, lte: endDate } },
                _sum: { amount: true }
            }),
            prisma.projectOffering.aggregate({
                where: { date: { gte: startDate, lte: endDate } },
                _sum: { amount_collected: true }
            }),
            prisma.welfareContribution.aggregate({
                where: { date: { gte: startDate, lte: endDate } },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { date: { gte: startDate, lte: endDate } },
                _sum: { amount: true }
            }),
            prisma.withdrawal.aggregate({
                where: { date: { gte: startDate, lte: endDate } },
                _sum: { amount: true }
            })
        ]);

        const totalOfferings = Number(offerings._sum.amount_collected) || 0;
        const totalTithes = Number(tithes._sum.amount) || 0;
        const totalProjectOfferings = Number(projectOfferings._sum.amount_collected) || 0;
        const totalWelfare = Number(welfare._sum.amount) || 0;
        const totalExpensesOnly = Number(expenses._sum.amount) || 0;
        const totalWithdrawals = Number(withdrawals._sum.amount) || 0;

        const totalIncome = totalOfferings + totalTithes + totalProjectOfferings + totalWelfare;
        const totalExpenses = totalExpensesOnly + totalWithdrawals; // Matches legacy "Net Expenses"
        const netBalance = totalIncome - totalExpenses;

        // --- FETCH CHART DATA (6 MONTHS) ---
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                month: d.toLocaleString('default', { month: 'short' }),
                year: d.getFullYear(),
                monthIndex: d.getMonth()
            });
        }

        const trends = await Promise.all(months.map(async (m) => {
            const start = new Date(m.year, m.monthIndex, 1);
            const end = new Date(m.year, m.monthIndex + 1, 0, 23, 59, 59, 999);

            const [incOffering, incTithe, incProject, incWelfare, expOnly, withTotal] = await Promise.all([
                prisma.offering.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount_collected: true } }),
                prisma.tithe.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }),
                prisma.projectOffering.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount_collected: true } }),
                prisma.welfareContribution.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }),
                prisma.expense.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }),
                prisma.withdrawal.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } })
            ]);

            const monthIncome =
                (Number(incOffering._sum.amount_collected) || 0) +
                (Number(incTithe._sum.amount) || 0) +
                (Number(incProject._sum.amount_collected) || 0) +
                (Number(incWelfare._sum.amount) || 0);
            const monthExpense =
                (Number(expOnly._sum.amount) || 0) +
                (Number(withTotal._sum.amount) || 0);

            return {
                month: m.month,
                income: monthIncome,
                expenses: monthExpense,
                balance: monthIncome - monthExpense
            };
        }));

        // --- FETCH CATEGORY DATA ---
        const categories = [
            { name: 'Tithe', value: totalTithes, color: '#3B82F6' },
            { name: 'Welfare', value: totalWelfare, color: '#10B981' },
            { name: 'Project Offering', value: totalProjectOfferings, color: '#F59E0B' },
            { name: 'Offering', value: totalOfferings, color: '#EC4899' },
            { name: 'Other', value: 0, color: '#6366F1' } // Placeholder for other categories
        ];

        // Fetch recent transactions from all sources using corrected model names
        const [offeringTxns, titheTxns, projectTxns, welfareTxns, expenseTxns] = await Promise.all([
            prisma.offering.findMany({
                orderBy: { date: 'desc' },
                take: 10,
                select: {
                    offering_id: true,
                    date: true,
                    amount_collected: true,
                    service_type: true,
                }
            }),
            prisma.tithe.findMany({
                orderBy: { date: 'desc' },
                take: 10,
                select: {
                    tithe_id: true,
                    member_id: true,
                    date: true,
                    amount: true,
                }
            }),
            prisma.projectOffering.findMany({
                orderBy: { date: 'desc' },
                take: 10,
                select: {
                    project_offering_id: true,
                    project_name: true,
                    date: true,
                    amount_collected: true,
                }
            }),
            prisma.welfareContribution.findMany({
                orderBy: { date: 'desc' },
                take: 10,
                select: {
                    welfare_id: true,
                    member_id: true,
                    date: true,
                    amount: true,
                }
            }),
            prisma.expense.findMany({
                orderBy: { date: 'desc' },
                take: 10,
                select: {
                    expense_id: true,
                    date: true,
                    category: true,
                    description: true,
                    amount: true,
                }
            })
        ]);

        // Combine transactions from all sources
        const recentTransactions = [
            ...offeringTxns.map((t: any) => ({
                id: `OFF${t.offering_id}`,
                transaction_id: `OFF${t.date.getFullYear()}${String(t.date.getMonth() + 1).padStart(2, '0')}${t.offering_id}`,
                date: t.date.toISOString(),
                type: 'Offering',
                description: t.service_type || 'General',
                category: 'Income',
                amount: Number(t.amount_collected) || 0
            })),
            ...titheTxns.map((t: any) => ({
                id: `TXN${t.tithe_id}`,
                transaction_id: `TXN${t.date.getFullYear()}${String(t.date.getMonth() + 1).padStart(2, '0')}${t.tithe_id}`,
                date: t.date.toISOString(),
                type: 'Tithe',
                member: t.member_id || 'N/A',
                category: 'Income',
                amount: Number(t.amount) || 0
            })),
            ...projectTxns.map((t: any) => ({
                id: `POFF${t.project_offering_id}`,
                transaction_id: `POFF${t.date.getFullYear()}${String(t.date.getMonth() + 1).padStart(2, '0')}${t.project_offering_id}`,
                date: t.date.toISOString(),
                type: 'Project Offering',
                description: t.project_name || 'General',
                category: 'Income',
                amount: Number(t.amount_collected) || 0
            })),
            ...welfareTxns.map((t: any) => ({
                id: `WEL${t.welfare_id}`,
                transaction_id: `WEL${t.date.getFullYear()}${String(t.date.getMonth() + 1).padStart(2, '0')}${t.welfare_id}`,
                date: t.date.toISOString(),
                type: 'Welfare',
                member: t.member_id || 'N/A',
                category: 'Income',
                amount: Number(t.amount) || 0
            })),
            ...expenseTxns.map((t: any) => ({
                id: `EXP${t.expense_id}`,
                transaction_id: `EXP${t.date.getFullYear()}${String(t.date.getMonth() + 1).padStart(2, '0')}${t.expense_id}`,
                date: t.date.toISOString(),
                type: 'Expense',
                description: t.description || t.category || 'General',
                category: 'Expense',
                amount: Number(t.amount) || 0
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    total_income: totalIncome,
                    total_expenses: totalExpenses,
                    net_balance: netBalance,
                    recent_transactions_count: recentTransactions.length
                },
                trends: trends,
                categories: categories,
                recent_transactions: recentTransactions
            }
        });

    } catch (error) {
        console.error('Error fetching overview data:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch overview data',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
