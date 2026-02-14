import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/communication/messages
 * Fetch sent/scheduled/draft messages with filters
 * Query params:
 * - status: 'draft' | 'scheduled' | 'published' (sent)
 * - limit: number of messages to fetch (default: 50)
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const messages = await prisma.message.findMany({
            where,
            include: {
                recipients: {
                    select: {
                        recipient_id: true,
                        delivery_status: true,
                        delivery_channel: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: limit
        });

        // Format messages with delivery stats
        const formattedMessages = messages.map(msg => ({
            ...msg,
            delivery_stats: {
                total: msg.total_recipients || 0,
                sent: msg.total_sent || 0,
                failed: msg.total_failed || 0,
                opened: msg.total_opened || 0
            }
        }));

        return NextResponse.json({
            success: true,
            messages: formattedMessages,
            count: formattedMessages.length
        });

    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/communication/messages
 * Delete a message by ID
 * Query params:
 * - message_id: ID of the message to delete
 */
export async function DELETE(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const messageId = searchParams.get('message_id');

        if (!messageId) {
            return NextResponse.json(
                { success: false, error: 'message_id required' },
                { status: 400 }
            );
        }

        await prisma.message.delete({
            where: { message_id: parseInt(messageId) }
        });

        return NextResponse.json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting message:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
