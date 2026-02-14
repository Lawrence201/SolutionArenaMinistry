import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch 5 most recent published sermons
        const sermons = await prisma.sermon.findMany({
            where: {
                is_published: true,
            },
            include: {
                scriptures: {
                    orderBy: {
                        display_order: 'asc',
                    },
                },
            },
            orderBy: [
                { is_featured: 'desc' },
                { sermon_date: 'desc' },
            ],
            take: 5,
        });

        // Process sermons data to match legacy JSON structure
        const processedSermons = sermons.map((sermon) => {
            // Format scriptures as comma-separated string
            const scripturesStr = sermon.scriptures
                .map((s) => s.scripture_reference)
                .join(', ');

            // Format date
            const sermonDate = sermon.sermon_date
                ? new Date(sermon.sermon_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
                : 'Unknown Date';

            // Safely truncate description (max 120 chars as per legacy)
            const description = sermon.sermon_description
                ? sermon.sermon_description.length > 120
                    ? sermon.sermon_description.substring(0, 120) + '...'
                    : sermon.sermon_description
                : '';

            return {
                id: sermon.id,
                title: sermon.sermon_title || 'Untitled Sermon',
                speaker: sermon.sermon_speaker || 'Unknown Speaker',
                date: sermonDate,
                date_raw: sermon.sermon_date,
                series: sermon.sermon_series || '',
                description: description,
                full_description: sermon.sermon_description || '',
                video_url: sermon.video_file || '', // Fallback handled by frontend or custom.js
                video_type: sermon.video_type || 'file',
                audio_url: sermon.audio_file || '',
                image_url: sermon.sermon_image || '',
                pdf_url: sermon.pdf_file || null,
                duration: sermon.sermon_duration,
                category: sermon.sermon_category || '',
                scriptures: scripturesStr,
                is_featured: sermon.is_featured,
                allow_downloads: sermon.allow_downloads,
                view_count: sermon.view_count || 0,
                download_count: sermon.download_count || 0,
            };
        });

        return NextResponse.json({
            success: true,
            data: processedSermons,
            count: processedSermons.length,
        });
    } catch (error: any) {
        console.error('Error fetching recent sermons:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch sermons.',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
