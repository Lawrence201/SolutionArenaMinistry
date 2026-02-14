import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/communication/stats
 * Returns communication statistics: inbox count, messages sent, open rates
 */
export async function GET(req: NextRequest) {
    try {
        // Get inbox count
        const inboxCount = await prisma.receivedEmail.count({
            where: { folder: 'INBOX' }
        });

        // Get unread inbox count
        const unreadCount = await prisma.receivedEmail.count({
            where: {
                folder: 'INBOX',
                is_read: false
            }
        });

        // Get total sent messages
        const totalSent = await prisma.message.count({
            where: { status: 'published' } // 'sent' status is 'published' in ContentStatus enum
        });

        // Get scheduled messages
        const scheduledCount = await prisma.message.count({
            where: { status: 'scheduled' }
        });

        // Get total recipients reached
        const totalRecipients = await prisma.message.aggregate({
            _sum: { total_sent: true },
            where: { status: 'published' }
        });

        // Get average open rate
        const recipientStats = await prisma.messageRecipient.groupBy({
            by: ['delivery_status'],
            _count: { recipient_id: true }
        });

        const totalDelivered = recipientStats.find(s => s.delivery_status === 'sent')?._count.recipient_id || 0;
        const totalOpened = recipientStats.find(s => s.delivery_status === 'opened')?._count.recipient_id || 0;
        const avgOpenRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;

        // Get users count
        const usersCount = await prisma.user.count({
            where: { is_active: true }
        });

        return NextResponse.json({
            success: true,
            data: {
                inbox_count: inboxCount,
                unread_count: unreadCount,
                users_count: usersCount,
                total_sent: totalSent,
                total_scheduled: scheduledCount,
                total_recipients: totalRecipients._sum.total_sent || 0,
                avg_open_rate: avgOpenRate,
                opened_count: totalOpened
            }
        });

    } catch (error: any) {
        console.error('Error fetching communication stats:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch communication stats',
                error: error.message
            },
            { status: 500 }
        );
    }
}
