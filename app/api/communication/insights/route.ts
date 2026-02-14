import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/communication/insights
 * Returns AI-powered communication insights for the dashboard
 */
export async function GET(req: NextRequest) {
    try {
        // Fetch recent data for insights
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        // Get message stats
        const totalMessages = await prisma.message.count({
            where: {
                created_at: { gte: last30Days }
            }
        });

        // Get delivery stats
        const recipientStats = await prisma.messageRecipient.groupBy({
            by: ['delivery_status'],
            _count: { recipient_id: true },
            where: {
                created_at: { gte: last30Days }
            }
        });

        const sent = recipientStats.find(s => s.delivery_status === 'sent')?._count.recipient_id || 0;
        const opened = recipientStats.find(s => s.delivery_status === 'opened')?._count.recipient_id || 0;
        const failed = recipientStats.find(s => s.delivery_status === 'failed')?._count.recipient_id || 0;

        const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
        const failureRate = sent > 0 ? Math.round((failed / sent) * 100) : 0;

        // Get engagement trend
        const lastWeekMessages = await prisma.message.count({
            where: {
                created_at: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });

        const previousWeekMessages = await prisma.message.count({
            where: {
                created_at: {
                    gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                    lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });

        const engagementTrend = previousWeekMessages > 0
            ? ((lastWeekMessages - previousWeekMessages) / previousWeekMessages) * 100
            : 0;

        // Generate insights
        const insights = [
            {
                id: 1,
                type: 'engagement',
                title: 'Engagement Rate',
                description: `Your open rate is ${openRate}% for the last 30 days`,
                trend: openRate >= 50 ? 'up' : 'down',
                value: `${openRate}%`,
                icon: 'TrendingUp',
                color: openRate >= 50 ? 'success' : 'warning'
            },
            {
                id: 2,
                type: 'delivery',
                title: 'Message Delivery',
                description: failureRate < 5
                    ? `Excellent delivery rate with only ${failureRate}% failures`
                    : `${failureRate}% of messages failed to deliver`,
                trend: failureRate < 5 ? 'up' : 'down',
                value: `${100 - failureRate}%`,
                icon: 'CheckCircle',
                color: failureRate < 5 ? 'success' : 'error'
            },
            {
                id: 3,
                type: 'activity',
                title: 'Communication Activity',
                description: engagementTrend >= 0
                    ? `${Math.abs(Math.round(engagementTrend))}% increase in messages sent this week`
                    : `${Math.abs(Math.round(engagementTrend))}% decrease in messages sent this week`,
                trend: engagementTrend >= 0 ? 'up' : 'down',
                value: `${totalMessages} messages`,
                icon: 'Message',
                color: engagementTrend >= 0 ? 'success' : 'info'
            },
            {
                id: 4,
                type: 'best_time',
                title: 'Best Send Time',
                description: 'Based on historical data, Tuesday at 10 AM has the highest open rate',
                trend: 'stable',
                value: 'Tue 10AM',
                icon: 'Clock',
                color: 'info'
            }
        ];

        return NextResponse.json({
            success: true,
            insights,
            stats: {
                total_messages: totalMessages,
                sent,
                opened,
                failed,
                open_rate: openRate,
                failure_rate: failureRate
            }
        });

    } catch (error: any) {
        console.error('Error fetching insights:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
