import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch 5 most recent published sermons with audio files
        const sermons = await prisma.sermon.findMany({
            where: {
                is_published: true,
                audio_file: {
                    not: null,
                    not: '',
                },
            },
            orderBy: [
                { is_featured: 'desc' },
                { sermon_date: 'desc' },
            ],
            take: 5,
        });

        // Process audio data to match legacy JSON structure
        const processedAudio = sermons.map((sermon) => {
            // Format date
            const sermonDate = sermon.sermon_date
                ? new Date(sermon.sermon_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
                : 'Unknown Date';

            return {
                id: sermon.id,
                title: sermon.sermon_title || 'Untitled Sermon',
                speaker: sermon.sermon_speaker || 'Unknown Speaker',
                date: sermonDate,
                audio_url: sermon.audio_file || '',
                image_url: sermon.sermon_image || '',
                duration: sermon.sermon_duration || 0,
            };
        });

        return NextResponse.json({
            success: true,
            data: processedAudio,
            count: processedAudio.length,
        });
    } catch (error: any) {
        console.error('Error fetching audio playlist:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch audio playlist.',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
