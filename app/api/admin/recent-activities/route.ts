import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} sec ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const activities = await prisma.activityLog.findMany({
            orderBy: { created_at: 'desc' },
            take: limit
        });

        const formattedActivities = activities.map(activity => ({
            id: activity.activity_id,
            type: activity.activity_type,
            title: activity.title,
            description: activity.description,
            icon_type: activity.icon_type || 'default',
            related_id: activity.related_id,
            time_ago: getTimeAgo(activity.created_at),
            created_at: activity.created_at.toISOString()
        }));

        return NextResponse.json({
            success: true,
            data: formattedActivities,
            count: formattedActivities.length
        });

    } catch (error) {
        console.error("Recent Activities API Error:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Unknown error occurred"
        }, { status: 500 });
    }
}
