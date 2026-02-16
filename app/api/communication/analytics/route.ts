import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/communication/analytics
 * Returns detailed analytics data for the Communication Analytics tab
 * Query params:
 * - period: '7days' | '30days' | '90days' (default: 30days)
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const period = searchParams.get('period') || '30days';

        // Calculate date range
        const daysMap: any = {
            '7days': 7,
            '30days': 30,
            '90days': 90
        };
        const days = daysMap[period] || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get messages by type
        const messagesByType = await prisma.message.groupBy({
            by: ['message_type'],
            _count: { message_id: true },
            where: {
                created_at: { gte: startDate }
            }
        });

        // Get delivery channel stats
        const channelStats = await prisma.messageRecipient.groupBy({
            by: ['delivery_channel', 'delivery_status'],
            _count: { recipient_id: true },
            where: {
                created_at: { gte: startDate }
            }
        });

        // Format channel statistics
        const formattedChannelStats = {
            email: {
                sent: 0,
                opened: 0,
                failed: 0,
                total: 0
            },
            sms: {
                sent: 0,
                failed: 0,
                total: 0
            }
        };

        channelStats.forEach(stat => {
            const channel = stat.delivery_channel;
            const count = stat._count.recipient_id;

            if (channel === 'email') {
                formattedChannelStats.email.total += count;
                if (stat.delivery_status === 'sent') formattedChannelStats.email.sent += count;
                if (stat.delivery_status === 'opened') formattedChannelStats.email.opened += count;
                if (stat.delivery_status === 'failed') formattedChannelStats.email.failed += count;
            } else if (channel === 'sms') {
                formattedChannelStats.sms.total += count;
                if (stat.delivery_status === 'sent') formattedChannelStats.sms.sent += count;
                if (stat.delivery_status === 'failed') formattedChannelStats.sms.failed += count;
            }
        });

        // Calculate open rates
        const emailOpenRate = formattedChannelStats.email.sent > 0
            ? Math.round((formattedChannelStats.email.opened / formattedChannelStats.email.sent) * 100)
            : 0;

        // Get top performing messages
        const topMessages = await prisma.message.findMany({
            where: {
                created_at: { gte: startDate },
                status: 'published'
            },
            orderBy: { total_opened: 'desc' },
            take: 5,
            select: {
                message_id: true,
                title: true,
                total_sent: true,
                total_opened: true,
                created_at: true
            }
        });

        // Get daily message count for trend chart
        const dailyMessages = await prisma.$queryRaw<any[]>`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM messages
            WHERE created_at >= ${startDate}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;

        return NextResponse.json({
            success: true,
            period,
            analytics: {
                messages_by_type: messagesByType.map(m => ({
                    type: m.message_type,
                    count: m._count.message_id
                })),
                channel_stats: formattedChannelStats,
                email_open_rate: emailOpenRate,
                top_messages: topMessages.map(msg => ({
                    ...msg,
                    open_rate: (msg.total_sent || 0) > 0
                        ? Math.round(((msg.total_opened || 0) / (msg.total_sent || 1)) * 100)
                        : 0
                })),
                daily_trend: dailyMessages
            }
        });

    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
