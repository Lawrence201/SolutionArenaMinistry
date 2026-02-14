import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/finance/project-offerings
 * Fetch project offerings with project breakdown
 * Full CRUD operations
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
            activeProjects,
            rangeRecords
        ] = await Promise.all([
            // Today
            prisma.projectOffering.aggregate({
                where: { date: { gte: startOfToday } },
                _sum: { amount_collected: true },
                _count: true
            }),
            // This Week
            prisma.projectOffering.aggregate({
                where: { date: { gte: startOfWeek } },
                _sum: { amount_collected: true }
            }),
            // Last Week (for growth calculation)
            prisma.projectOffering.aggregate({
                where: { date: { gte: startOfLastWeek, lt: startOfWeek } },
                _sum: { amount_collected: true }
            }),
            // This Month
            prisma.projectOffering.aggregate({
                where: { date: { gte: startOfMonth } },
                _sum: { amount_collected: true },
                _count: true,
                _avg: { amount_collected: true }
            }),
            // Active Projects (Distinct project names)
            prisma.projectOffering.groupBy({
                by: ['project_name']
            }),
            // Records for the selected range
            prisma.projectOffering.findMany({
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
                active_projects: activeProjects.length,
                records: rangeRecords.map(rec => ({
                    id: rec.project_offering_id.toString(),
                    transaction_id: rec.transaction_id,
                    date: rec.date.toISOString(),
                    project_name: rec.project_name,
                    service_type: rec.service_type,
                    service_time: rec.service_time ? rec.service_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                    amount: Number(rec.amount_collected),
                    method: rec.collection_method,
                    collected_by: rec.counted_by,
                    status: rec.status === 'Approved' ? 'Verified' : 'Pending',
                    notes: rec.notes
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching project offerings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch project offerings',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const projectOffering = await prisma.projectOffering.create({
            data: {
                transaction_id: `POFF${Date.now()}`,
                date: new Date(body.date),
                project_name: body.project_name,
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
            data: projectOffering,
            message: 'Project offering created successfully'
        });

    } catch (error) {
        console.error('Error creating project offering:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create project offering',
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
                error: 'Project offering ID is required'
            }, { status: 400 });
        }

        const body = await req.json();

        const projectOffering = await prisma.projectOffering.update({
            where: { transaction_id: id },
            data: {
                date: body.date ? new Date(body.date) : undefined,
                project_name: body.project_name,
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
            data: projectOffering,
            message: 'Project offering updated successfully'
        });

    } catch (error) {
        console.error('Error updating project offering:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update project offering',
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
                error: 'Project offering ID is required'
            }, { status: 400 });
        }

        await prisma.projectOffering.delete({
            where: { transaction_id: id }
        });

        return NextResponse.json({
            success: true,
            message: 'Project offering deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting project offering:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete project offering',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
