import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/finance/offerings
 * Fetch offerings data with date range filtering
 * Query params: range (today, week, month, quarter, year, all, custom)
 *               start_date, end_date (for custom range)
 * POST /api/finance/offerings
 * Create new offering record
 * PUT /api/finance/offerings?id=xyz
 * Update existing offering
 * DELETE /api/finance/offerings?id=xyz
 * Delete offering record
 * Based on legacy get_finance_data_v2.php?type=offerings
 */

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || 'all';
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

        // Stats for cards (always relative to now)
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            todayStats,
            weekStats,
            lastWeekStats,
            monthStats,
            specialStats,
            rangeOfferings
        ] = await Promise.all([
            // Today
            prisma.offering.aggregate({
                where: { date: { gte: startOfToday } },
                _sum: { amount_collected: true },
                _count: true
            }),
            // This Week
            prisma.offering.aggregate({
                where: { date: { gte: startOfWeek } },
                _sum: { amount_collected: true }
            }),
            // Last Week (for growth calculation)
            prisma.offering.aggregate({
                where: { date: { gte: startOfLastWeek, lt: startOfWeek } },
                _sum: { amount_collected: true }
            }),
            // This Month
            prisma.offering.aggregate({
                where: { date: { gte: startOfMonth } },
                _sum: { amount_collected: true },
                _count: true,
                _avg: { amount_collected: true }
            }),
            // Special Offerings (Project Offerings)
            prisma.projectOffering.aggregate({
                _sum: { amount_collected: true }
            }),
            // Offerings for the selected range
            prisma.offering.findMany({
                where: { date: { gte: startDate, lte: endDate } },
                orderBy: [
                    { date: 'desc' },
                    { service_time: 'desc' }
                ],
                take: 100
            })
        ]);

        const thisWeekTotal = Number(weekStats._sum.amount_collected) || 0;
        const lastWeekTotal = Number(lastWeekStats._sum.amount_collected) || 0;
        let weekGrowth = "↑ 0.0% from last week";
        if (lastWeekTotal > 0) {
            const growth = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
            const sign = growth >= 0 ? "↑" : "↓";
            weekGrowth = `${sign} ${Math.abs(growth).toFixed(1)}% from last week`;
        }

        return NextResponse.json({
            success: true,
            data: {
                total_today: Number(todayStats._sum.amount_collected) || 0,
                today_count: todayStats._count || 0,
                total_week: thisWeekTotal,
                week_growth: weekGrowth,
                total_month: Number(monthStats._sum.amount_collected) || 0,
                month_avg: Number(monthStats._avg.amount_collected) || 0,
                special_offerings: Number(specialStats._sum.amount_collected) || 0,
                special_description: "Various projects",
                offerings: rangeOfferings.map(off => ({
                    id: off.offering_id.toString(),
                    date: off.date.toISOString(),
                    service_type: off.service_type,
                    service_time: off.service_time ? off.service_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                    amount_collected: Number(off.amount_collected),
                    collection_method: off.collection_method,
                    counted_by: off.counted_by,
                    status: off.status === 'Approved' ? 'Verified' : 'Pending',
                    notes: off.notes
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching offerings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch offerings',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const offering = await prisma.offering.create({
            data: {
                transaction_id: `OFF${Date.now()}`,
                date: new Date(body.date),
                service_type: body.service_type,
                service_time: body.service_time ? new Date(`1970-01-01T${body.service_time}:00Z`) : null,
                amount_collected: parseFloat(body.amount_collected),
                collection_method: body.collection_method,
                counted_by: body.counted_by,
                notes: body.notes || '',
                status: body.status === 'Verified' ? 'Approved' : 'Pending'
            }
        });

        return NextResponse.json({
            success: true,
            data: offering,
            message: 'Offering record created successfully'
        });

    } catch (error) {
        console.error('Error creating offering:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create offering',
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
                error: 'Offering ID is required'
            }, { status: 400 });
        }

        const body = await req.json();

        const offering = await prisma.offering.update({
            where: { transaction_id: id },
            data: {
                date: body.date ? new Date(body.date) : undefined,
                service_type: body.service_type,
                service_time: body.service_time ? new Date(`1970-01-01T${body.service_time}:00Z`) : undefined,
                amount_collected: body.amount_collected ? parseFloat(body.amount_collected) : undefined,
                collection_method: body.collection_method,
                counted_by: body.counted_by,
                notes: body.notes,
                status: body.status === 'Verified' ? 'Approved' : body.status
            }
        });

        return NextResponse.json({
            success: true,
            data: offering,
            message: 'Offering updated successfully'
        });

    } catch (error) {
        console.error('Error updating offering:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update offering',
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
                error: 'Offering ID is required'
            }, { status: 400 });
        }

        await prisma.offering.delete({
            where: { transaction_id: id }
        });

        return NextResponse.json({
            success: true,
            message: 'Offering deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting offering:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete offering',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
