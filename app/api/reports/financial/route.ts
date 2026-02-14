import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';
        const range = searchParams.get('range') || '30d';

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        switch (range) {
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            case 'all':
                startDate = new Date(2000, 0, 1);
                break;
        }

        // Fetch financial data based on type
        let responseData: any = {};

        // Helper to aggregate data across models
        async function fetchAggregates(start: Date) {
            const [offerings, tithes, project, welfare, expenses, withdrawals] = await Promise.all([
                prisma.offering.aggregate({ where: { date: { gte: start } }, _sum: { amount_collected: true } }),
                prisma.tithe.aggregate({ where: { date: { gte: start } }, _sum: { amount: true } }),
                prisma.projectOffering.aggregate({ where: { date: { gte: start } }, _sum: { amount_collected: true } }),
                prisma.welfareContribution.aggregate({ where: { date: { gte: start } }, _sum: { amount: true } }),
                prisma.expense.aggregate({ where: { date: { gte: start } }, _sum: { amount: true } }),
                prisma.withdrawal.aggregate({ where: { date: { gte: start } }, _sum: { amount: true } })
            ]);

            return {
                offerings: Number(offerings._sum.amount_collected || 0),
                tithes: Number(tithes._sum.amount || 0),
                project: Number(project._sum.amount_collected || 0),
                welfare: Number(welfare._sum.amount || 0),
                expenses: (Number(expenses._sum.amount || 0)) + (Number(withdrawals._sum.amount || 0))
            };
        }

        if (type === 'extended') {
            const currentYear = now.getFullYear();
            const startOfThisYear = new Date(currentYear, 0, 1);

            // 1. Top Contributors
            const contributors = await prisma.member.findMany({
                where: {
                    OR: [
                        { tithes: { some: { date: { gte: startOfThisYear } } } },
                        { welfareContributions: { some: { date: { gte: startOfThisYear } } } }
                    ]
                },
                include: {
                    tithes: {
                        where: { date: { gte: startOfThisYear } },
                        select: { amount: true }
                    },
                    welfareContributions: {
                        where: { date: { gte: startOfThisYear } },
                        select: { amount: true }
                    }
                }
            });

            const topContributorsData = contributors.map(m => {
                const totalTithe = m.tithes.reduce((acc, curr) => acc + Number(curr.amount), 0);
                const totalWelfare = m.welfareContributions.reduce((acc, curr) => acc + Number(curr.amount), 0);
                return {
                    name: `${m.first_name} ${m.last_name}`,
                    total: totalTithe + totalWelfare,
                    status: m.status === 'Active' ? 'Active' : 'Inactive'
                };
            }).sort((a, b) => b.total - a.total).slice(0, 10);

            // 2. Forecasting (Last 6 months average)
            const last6Months = [];
            for (let i = 1; i <= 6; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                last6Months.push(new Date(d));
            }

            const monthData = await Promise.all(last6Months.map(m => {
                const monthEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59);
                return fetchAggregatesBetween(m, monthEnd);
            }));

            const avgMonthlyIncome = monthData.reduce((acc, curr) => acc + (curr.offerings + curr.tithes + curr.project + curr.welfare), 0) / 6;
            const avgMonthlyExpense = monthData.reduce((acc, curr) => acc + curr.expenses, 0) / 6;

            const forecast = Array.from({ length: 3 }).map((_, i) => {
                const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
                return {
                    month: date.toLocaleString('en-US', { month: 'short' }),
                    predicted_income: avgMonthlyIncome * (1 + (i * 0.02)), // slight artificial growth
                    predicted_expense: avgMonthlyExpense
                };
            });

            // 3. Donor Retention
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

            const [newDonors, activeDonors, totalDonors] = await Promise.all([
                prisma.member.count({
                    where: {
                        OR: [
                            { tithes: { some: { date: { gte: thirtyDaysAgo } } } },
                            { welfareContributions: { some: { date: { gte: thirtyDaysAgo } } } }
                        ],
                        AND: [
                            { tithes: { none: { date: { lt: thirtyDaysAgo } } } },
                            { welfareContributions: { none: { date: { lt: thirtyDaysAgo } } } }
                        ]
                    }
                }),
                prisma.member.count({
                    where: {
                        OR: [
                            { tithes: { some: { date: { gte: ninetyDaysAgo } } } },
                            { welfareContributions: { some: { date: { gte: ninetyDaysAgo } } } }
                        ]
                    }
                }),
                prisma.member.count({
                    where: {
                        OR: [
                            { tithes: { some: {} } },
                            { welfareContributions: { some: {} } }
                        ]
                    }
                })
            ]);

            const budgetSetting = await prisma.budgetSetting.findUnique({ where: { setting_name: 'TotalBudget' } });

            return NextResponse.json({
                success: true,
                data: {
                    top_contributors: topContributorsData,
                    forecast,
                    retention: {
                        new: newDonors,
                        participating: activeDonors,
                        lapsed: totalDonors - activeDonors
                    },
                    cashflow: {
                        operating: 0.7,
                        investing: 0.2,
                        financing: 0.1
                    },
                    budget_utilization: budgetSetting ? Number(budgetSetting.setting_value) : 850000 // Mock if not set
                }
            });
        }

        const totals = await fetchAggregates(startDate);

        // YoY Growth Calculation
        const currentYear = now.getFullYear();
        const startOfThisYear = new Date(currentYear, 0, 1);
        const startOfLastYear = new Date(currentYear - 1, 0, 1);
        const endOfLastYear = new Date(currentYear - 1, 11, 31, 23, 59, 59, 999);

        const [thisYearTotals, lastYearTotals] = await Promise.all([
            fetchAggregates(startOfThisYear),
            fetchAggregatesBetween(startOfLastYear, endOfLastYear)
        ]);

        const thisYearIncome = thisYearTotals.offerings + thisYearTotals.tithes + thisYearTotals.project + thisYearTotals.welfare;
        const lastYearIncome = lastYearTotals.offerings + lastYearTotals.tithes + lastYearTotals.project + lastYearTotals.welfare;

        let yoyGrowth = 0;
        if (lastYearIncome > 0) {
            yoyGrowth = ((thisYearIncome - lastYearIncome) / lastYearIncome) * 100;
        } else if (thisYearIncome > 0) {
            yoyGrowth = 100; // 100% growth if starting from zero
        }

        if (type === 'all' || type === 'offerings') responseData.offerings = totals.offerings;
        if (type === 'all' || type === 'tithes') responseData.tithes = totals.tithes;
        if (type === 'all' || type === 'project') responseData.project_offerings = totals.project;
        if (type === 'all' || type === 'welfare') responseData.welfare = totals.welfare;
        if (type === 'all' || type === 'expenses') {
            responseData.expenses = totals.expenses;
            responseData.expense_breakdown = [
                { category: 'General Expenses', amount: totals.expenses }
            ];
        }

        // Calculate totals if fetching all
        if (type === 'all') {
            const totalIncome = totals.offerings + totals.tithes + totals.project + totals.welfare;
            const totalExpenses = totals.expenses;
            const netIncome = totalIncome - totalExpenses;

            // Expense Ratio
            const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

            // Calculate financial health (more sophisticated)
            let financialHealth = 0;
            if (totalIncome > 0) {
                const ratio = netIncome / totalIncome;
                // Perfect score if saving > 50%
                if (ratio >= 0.5) financialHealth = 100;
                else if (ratio > 0) financialHealth = Math.round(ratio * 200); // Scale 0-100 for 0-50% savings
                else financialHealth = 0;
            }

            responseData.total_income = totalIncome;
            responseData.total_expenses = totalExpenses;
            responseData.net_income = netIncome;
            responseData.financial_health = financialHealth;
            responseData.yoy_growth = yoyGrowth.toFixed(1);
            responseData.expense_ratio = expenseRatio.toFixed(1);
            responseData.this_year_income = thisYearIncome;
            responseData.last_year_income = lastYearIncome;

            // Get monthly trends for last 6 months
            const monthlyTrends = [];
            for (let i = 5; i >= 0; i--) {
                const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
                const monthName = monthStart.toLocaleString('en-US', { month: 'short' });

                const res = await fetchAggregatesBetween(monthStart, monthEnd);
                const monthIncome = res.offerings + res.tithes + res.project + res.welfare;
                const monthExpense = res.expenses;

                monthlyTrends.push({
                    month: monthName,
                    income: monthIncome,
                    expenses: monthExpense
                });
            }

            responseData.monthly_trends = monthlyTrends;
        }

        return NextResponse.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Error fetching financial data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch financial data',
                error_details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Helper to aggregate data across dynamic ranges
async function fetchAggregatesBetween(start: Date, end: Date) {
    const [offerings, tithes, project, welfare, expenses, withdrawals] = await Promise.all([
        prisma.offering.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount_collected: true } }),
        prisma.tithe.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }),
        prisma.projectOffering.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount_collected: true } }),
        prisma.welfareContribution.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }),
        prisma.expense.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }),
        prisma.withdrawal.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } })
    ]);

    return {
        offerings: Number(offerings._sum.amount_collected || 0),
        tithes: Number(tithes._sum.amount || 0),
        project: Number(project._sum.amount_collected || 0),
        welfare: Number(welfare._sum.amount || 0),
        expenses: (Number(expenses._sum.amount || 0)) + (Number(withdrawals._sum.amount || 0))
    };
}

