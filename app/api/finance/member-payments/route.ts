import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/finance/member-payments
 * GET ?action=get_members - Fetch all members for search dropdown
 * GET ?action=get_payment_history&member_id=...&start_date=...&end_date=... - Fetch details for one member
 */

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');

        if (action === 'get_members') {
            const members = await prisma.member.findMany({
                select: {
                    member_id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone: true,
                    photo_path: true
                },
                orderBy: { first_name: 'asc' }
            });

            const formattedMembers = members.map(m => ({
                id: m.member_id,
                full_name: `${m.first_name} ${m.last_name}`,
                email: m.email,
                phone: m.phone,
                photo_path: m.photo_path
            }));

            return NextResponse.json({
                success: true,
                data: formattedMembers
            });
        }

        if (action === 'get_payment_history') {
            const memberIdParam = searchParams.get('member_id');
            const startDateParam = searchParams.get('start_date');
            const endDateParam = searchParams.get('end_date');

            if (!memberIdParam) {
                return NextResponse.json({
                    success: false,
                    error: 'Member ID is required'
                }, { status: 400 });
            }

            const memberId = parseInt(memberIdParam);
            const whereClause: any = { member_id: memberId };

            if (startDateParam || endDateParam) {
                whereClause.date = {};
                if (startDateParam) whereClause.date.gte = new Date(startDateParam);
                if (endDateParam) {
                    const end = new Date(endDateParam);
                    end.setHours(23, 59, 59, 999);
                    whereClause.date.lte = end;
                }
            }

            const [memberInfo, tithes, welfare] = await Promise.all([
                prisma.member.findUnique({
                    where: { member_id: memberId },
                    select: {
                        member_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone: true,
                        photo_path: true
                    }
                }),
                prisma.tithe.findMany({
                    where: whereClause,
                    orderBy: { date: 'desc' }
                }),
                prisma.welfareContribution.findMany({
                    where: whereClause,
                    orderBy: { date: 'desc' }
                })
            ]);

            if (!memberInfo) {
                return NextResponse.json({
                    success: false,
                    error: 'Member not found'
                }, { status: 404 });
            }

            const totalTithes = tithes.reduce((sum, t) => sum + Number(t.amount), 0);
            const totalWelfare = welfare.reduce((sum, w) => sum + Number(w.amount), 0);

            return NextResponse.json({
                success: true,
                data: {
                    member_info: {
                        id: memberInfo.member_id,
                        full_name: `${memberInfo.first_name} ${memberInfo.last_name}`,
                        email: memberInfo.email,
                        phone: memberInfo.phone,
                        photo_path: memberInfo.photo_path
                    },
                    tithes: tithes,
                    welfare: welfare,
                    summary: {
                        total_tithes: totalTithes,
                        tithe_count: tithes.length,
                        total_welfare: totalWelfare,
                        welfare_count: welfare.length,
                        grand_total: totalTithes + totalWelfare,
                        total_transactions: tithes.length + welfare.length
                    }
                }
            });
        }

        // Default behavior (keep backward compatibility if needed, though we just created this)
        return NextResponse.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('Error in member-payments API:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process request',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
