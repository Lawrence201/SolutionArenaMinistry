import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const events = await prisma.event.findMany({
            where: {
                status: "Published",
            },
            orderBy: [
                { start_date: "desc" },
                { start_time: "desc" },
            ],
            take: 2,
        });

        const formattedEvents = events.map((event) => {
            // Format date: Monday, January 1, 2024
            const startDate = new Date(event.start_date);
            const formattedDate = startDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });

            // Clean image path
            let imagePath = event.image_path || "/assets/images/f-event.webp";
            if (imagePath.includes('/Church_Management_System')) {
                imagePath = imagePath.replace('/Church_Management_System/chruch_website/', '/');
                imagePath = imagePath.replace('/Church_Management_System/', '/');
            }
            if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                imagePath = '/' + imagePath;
            }

            return {
                id: event.id,
                name: event.name,
                start_date: formattedDate,
                image_path: imagePath,
            };
        });

        return NextResponse.json({
            success: true,
            count: formattedEvents.length,
            events: formattedEvents,
        });
    } catch (error) {
        console.error("Error fetching footer events:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
