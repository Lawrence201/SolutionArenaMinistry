import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/finance/tithes
 * Fetch tithes (CPS) data with member info
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

        // Fetch tithes with member info
        const [tithes, summary, uniqueMembers, withdrawals] = await Promise.all([
            prisma.tithe.findMany({
                where: { date: { gte: startDate, lte: endDate } },
                include: {
                    member: {
                        select: {
                            first_name: true,
                            last_name: true,
                            email: true,
                            photo_path: true
                        }
                    }
                },
                orderBy: { date: 'desc' },
                take: 100
            }),
            prisma.tithe.aggregate({
                where: { date: { gte: startDate, lte: endDate } },
                _sum: { amount: true },
                _count: true,
                _avg: { amount: true }
            }),
            prisma.tithe.groupBy({
                by: ['member_id'],
                where: { date: { gte: startDate, lte: endDate } }
            }),
            prisma.withdrawal.aggregate({
                where: {
                    account_type: 'tithe',
                    date: { gte: startDate, lte: endDate }
                },
                _sum: { amount: true }
            })
        ]);

        const grossTotal = Number(summary._sum.amount) || 0;
        const totalWithdrawals = Number(withdrawals._sum.amount) || 0;
        const netBalance = grossTotal - totalWithdrawals;

        // Format tithes with member names
        const formattedTithes = tithes.map(tithe => ({
            ...tithe,
            member_name: tithe.member ? `${tithe.member.first_name} ${tithe.member.last_name}` : 'Unknown',
            member_email: tithe.member?.email || '',
            member_photo: tithe.member?.photo_path || ''
        }));

        return NextResponse.json({
            success: true,
            data: {
                tithes: formattedTithes,
                summary: {
                    total_amount: netBalance,
                    gross_amount: grossTotal,
                    total_withdrawals: totalWithdrawals,
                    total_count: summary._count,
                    unique_members: uniqueMembers.length,
                    avg_amount: Number(summary._avg.amount) || 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching tithes:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch tithes',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const tithe = await prisma.tithe.create({
            data: {
                transaction_id: `CPS${Date.now()}`,
                member_id: body.member_id,
                date: new Date(body.date),
                amount: parseFloat(body.amount),
                payment_method: body.payment_method,
                receipt_number: body.receipt_number || '',
                notes: body.notes || ''
            }
        });

        return NextResponse.json({
            success: true,
            data: tithe,
            message: 'Tithe record created successfully'
        });

    } catch (error) {
        console.error('Error creating tithe:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create tithe',
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
                error: 'Tithe ID is required'
            }, { status: 400 });
        }

        const body = await req.json();

        const tithe = await prisma.tithe.update({
            where: { transaction_id: id },
            data: {
                member_id: body.member_id,
                date: body.date ? new Date(body.date) : undefined,
                amount: body.amount ? parseFloat(body.amount) : undefined,
                payment_method: body.payment_method,
                receipt_number: body.receipt_number,
                notes: body.notes
            }
        });

        return NextResponse.json({
            success: true,
            data: tithe,
            message: 'Tithe updated successfully'
        });

    } catch (error) {
        console.error('Error updating tithe:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update tithe',
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
                error: 'Tithe ID is required'
            }, { status: 400 });
        }

        await prisma.tithe.delete({
            where: { transaction_id: id }
        });

        return NextResponse.json({
            success: true,
            message: 'Tithe deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting tithe:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete tithe',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
