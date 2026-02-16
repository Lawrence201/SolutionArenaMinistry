import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/finance/withdrawals
 * Fetch withdrawals with account type breakdown
 * Full CRUD operations
 */

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || 'month';
        const accountTypeParam = searchParams.get('account_type');
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

        // Build where clause
        const whereClause: any = {
            date: { gte: startDate, lte: endDate }
        };

        if (accountTypeParam && accountTypeParam !== 'all') {
            whereClause.account_type = accountTypeParam;
        }

        const purposeParam = searchParams.get('purpose');
        if (purposeParam && purposeParam !== 'all') {
            whereClause.purpose = { contains: purposeParam, mode: 'insensitive' };
        }

        // Fetch withdrawals and calculate summaries
        const [withdrawals, summary, accountTypes] = await Promise.all([
            prisma.withdrawal.findMany({
                where: whereClause,
                orderBy: { date: 'desc' },
                take: 100
            }),
            prisma.withdrawal.aggregate({
                where: { date: { gte: startDate, lte: endDate } },
                _sum: { amount: true },
                _count: true
            }),
            prisma.withdrawal.groupBy({
                by: ['account_type'],
                where: { date: { gte: startDate, lte: endDate } },
                _sum: { amount: true },
                _count: true
            })
        ]);

        // Specific totals for the 4 cards
        const offeringTotal = accountTypes.find(at => at.account_type === 'offering');
        const titheTotal = accountTypes.find(at => at.account_type === 'tithe');
        const projectWelfareTotal = accountTypes.filter(at => ['projectoffering', 'welfare'].includes(at.account_type));

        const combinedProjectWelfareSum = projectWelfareTotal.reduce((sum, at) => sum + (Number(at._sum.amount) || 0), 0);
        const combinedProjectWelfareCount = projectWelfareTotal.reduce((sum, at) => sum + (at._count || 0), 0);

        return NextResponse.json({
            success: true,
            data: {
                withdrawals: withdrawals,
                summary: {
                    total_amount: Number(summary._sum.amount) || 0,
                    total_count: summary._count,
                    offering_total: Number(offeringTotal?._sum.amount) || 0,
                    offering_count: offeringTotal?._count || 0,
                    tithe_total: Number(titheTotal?._sum.amount) || 0,
                    tithe_count: titheTotal?._count || 0,
                    project_welfare_total: combinedProjectWelfareSum,
                    project_welfare_count: combinedProjectWelfareCount
                }
            }
        });

    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch withdrawals',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const withdrawal = await prisma.withdrawal.create({
            data: {
                date: new Date(body.date),
                account_type: body.account_type,
                amount: parseFloat(body.amount),
                purpose: body.purpose,
                authorized_by: body.authorized_by,
                recipient: body.recipient,
                transaction_id: body.transaction_id || `WDL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                notes: body.notes || ''
            }
        });

        return NextResponse.json({
            success: true,
            data: withdrawal,
            message: 'Withdrawal created successfully'
        });

    } catch (error) {
        console.error('Error creating withdrawal:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create withdrawal',
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
                error: 'Withdrawal ID is required'
            }, { status: 400 });
        }

        const body = await req.json();

        const withdrawal = await prisma.withdrawal.update({
            where: { transaction_id: id },
            data: {
                date: body.date ? new Date(body.date) : undefined,
                account_type: body.account_type,
                amount: body.amount ? parseFloat(body.amount) : undefined,
                purpose: body.purpose,
                authorized_by: body.authorized_by,
                recipient: body.recipient,
                transaction_id: body.transaction_id,
                notes: body.notes
            }
        });

        return NextResponse.json({
            success: true,
            data: withdrawal,
            message: 'Withdrawal updated successfully'
        });

    } catch (error) {
        console.error('Error updating withdrawal:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update withdrawal',
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
                error: 'Withdrawal ID is required'
            }, { status: 400 });
        }

        await prisma.withdrawal.delete({
            where: { transaction_id: id }
        });

        return NextResponse.json({
            success: true,
            message: 'Withdrawal deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting withdrawal:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete withdrawal',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
