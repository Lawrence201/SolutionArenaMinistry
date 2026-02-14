import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/communication/inbox
 * Fetch received emails from inbox
 * Query params:
 * - is_read: filter by read status (optional)
 * - limit: number of emails to fetch (default: 50)
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const isReadParam = searchParams.get('is_read');
        const limit = parseInt(searchParams.get('limit') || '50');

        const where: any = {
            folder: 'INBOX'
        };

        if (isReadParam !== null) {
            where.is_read = isReadParam === 'true';
        }

        const emails = await prisma.receivedEmail.findMany({
            where,
            orderBy: { received_date: 'desc' },
            take: limit
        });

        return NextResponse.json({
            success: true,
            emails,
            count: emails.length
        });

    } catch (error: any) {
        console.error('Error fetching inbox:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
