import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch 8 most recent published events
        const events = await prisma.event.findMany({
            where: {
                status: 'Published',
            },
            orderBy: [
                { start_date: 'desc' },
                { start_time: 'desc' },
            ],
            take: 8,
        });

        // Process events data to match legacy JSON structure
        const processedEvents = events.map((event) => {
            // Format the date and time
            const startDate = event.start_date
                ? new Date(event.start_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                })
                : 'Date TBA';

            // Prisma Time type might need special handling for formatting
            const formatTime = (time: Date | null) => {
                if (!time) return '';
                return time.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                }).toLowerCase();
            };

            const startTime = formatTime(event.start_time);
            const endTime = formatTime(event.end_time);

            // Get location - use full_address if available, otherwise use room_building or location
            const location = event.full_address || event.room_building || event.location || 'Location TBA';

            // Correctly resolve the image path
            let imagePath = event.image_path;
            if (imagePath) {
                if (imagePath.includes('/Church_Management_System/')) {
                    imagePath = imagePath.split('/').pop() || '';
                }
                if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                    imagePath = `/uploads/events/${imagePath}`;
                }
            }
            if (!imagePath) imagePath = '/assets/images/event-img-1.webp';

            return {
                id: event.id,
                name: event.name,
                type: event.type,
                category: event.category,
                description: event.description,
                location: location,
                start_date: startDate,
                start_time: startTime,
                end_time: endTime,
                time_range: startTime && endTime ? `${startTime} - ${endTime}` : 'Time TBA',
                image_path: imagePath,
                max_capacity: event.max_capacity,
                age_group: event.age_group,
                require_registration: event.require_registration,
                is_virtual: event.is_virtual,
                virtual_link: event.virtual_link,
            };
        });

        return NextResponse.json({
            success: true,
            count: processedEvents.length,
            events: processedEvents,
        });
    } catch (error: any) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch events.',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
