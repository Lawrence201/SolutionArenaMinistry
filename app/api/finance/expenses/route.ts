import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/finance/expenses
 * Fetch expenses with category breakdown
 * Full CRUD operations
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
                default:
                    startDate = new Date('1900-01-01');
                    endDate = new Date('9999-12-31');
                    break;
            }
        }

        // Fetch previous month stats for comparison
        const prevMonthStart = new Date(startDate);
        prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
        const prevMonthEnd = new Date(startDate);
        prevMonthEnd.setMilliseconds(-1);

        // Fetch budget settings
        const budgetSettings = await prisma.budgetSetting.findFirst({
            where: { setting_name: 'Monthly Budget' }
        });

        // Fetch expenses data
        const [expenses, summary, categories, statusCounts, prevSummary] = await Promise.all([
            prisma.expense.findMany({
                where: { date: { gte: startDate, lte: endDate } },
                orderBy: { date: 'desc' },
                take: 50 // Limit to 50 for performance
            }),
            prisma.expense.aggregate({
                where: {
                    date: { gte: startDate, lte: endDate },
                    status: 'Approved'
                },
                _sum: { amount: true },
                _count: true,
                _avg: { amount: true }
            }),
            prisma.expense.groupBy({
                by: ['category'],
                where: {
                    date: { gte: startDate, lte: endDate },
                    status: 'Approved'
                },
                _sum: { amount: true },
                orderBy: { _sum: { amount: 'desc' } }
            }),
            prisma.expense.groupBy({
                by: ['status'],
                where: { date: { gte: startDate, lte: endDate } },
                _count: true
            }),
            prisma.expense.aggregate({
                where: {
                    date: { gte: prevMonthStart, lte: prevMonthEnd },
                    status: 'Approved'
                },
                _sum: { amount: true }
            })
        ]);

        // Calculate pending total separately
        const pendingTotal = await prisma.expense.aggregate({
            where: {
                date: { gte: startDate, lte: endDate },
                status: 'Pending'
            },
            _sum: { amount: true }
        });

        const totalAmount = Number(summary._sum.amount) || 0;
        const previousAmount = Number(prevSummary._sum.amount) || 0;
        const pendingAmount = Number(pendingTotal._sum.amount) || 0;

        const changePercent = previousAmount > 0
            ? ((totalAmount - previousAmount) / previousAmount) * 100
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                expenses: expenses,
                summary: {
                    total_amount: totalAmount,
                    total_count: summary._count,
                    avg_amount: Number(summary._avg.amount) || 0,
                    pending_total: pendingAmount,
                    previous_month_total: previousAmount,
                    change_percent: parseFloat(changePercent.toFixed(1))
                },
                budget: {
                    total: Number(budgetSettings?.setting_value) || 5000, // Default if not found
                    remaining: Math.max(0, (Number(budgetSettings?.setting_value) || 5000) - totalAmount)
                },
                categories: categories.map(cat => ({
                    category: cat.category,
                    total_amount: Number(cat._sum.amount) || 0
                })),
                status_counts: statusCounts.reduce((acc, curr) => {
                    acc[curr.status.toLowerCase()] = curr._count;
                    return acc;
                }, {} as Record<string, number>)
            }
        });

    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch expenses',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const expense = await prisma.expense.create({
            data: {
                transaction_id: `EXP${Date.now()}`,
                date: new Date(body.date),
                category: body.category,
                description: body.description,
                amount: parseFloat(body.amount),
                vendor_payee: body.vendor_payee,
                payment_method: body.payment_method,
                notes: body.notes || '',
                status: body.status || 'Pending'
            }
        });

        return NextResponse.json({
            success: true,
            data: expense,
            message: 'Expense record created successfully'
        });

    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create expense',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Expense ID is required'
            }, { status: 400 });
        }

        const body = await req.json();

        const expense = await prisma.expense.update({
            where: { transaction_id: id },
            data: {
                date: body.date ? new Date(body.date) : undefined,
                category: body.category,
                description: body.description,
                amount: body.amount ? parseFloat(body.amount) : undefined,
                vendor_payee: body.vendor_payee,
                payment_method: body.payment_method,
                status: body.status,
                notes: body.notes
            }
        });

        return NextResponse.json({
            success: true,
            data: expense,
            message: 'Expense updated successfully'
        });

    } catch (error) {
        console.error('Error updating expense:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update expense',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Expense ID is required'
            }, { status: 400 });
        }

        await prisma.expense.delete({
            where: { transaction_id: id }
        });

        return NextResponse.json({
            success: true,
            message: 'Expense deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete expense',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
