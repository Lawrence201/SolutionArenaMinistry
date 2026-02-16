import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sermon_id, action_type } = body;

        if (!sermon_id || !action_type) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const allowedActions = ['view', 'download_video', 'download_audio', 'download_pdf', 'like', 'share'];
        if (!allowedActions.includes(action_type)) {
            return NextResponse.json(
                { success: false, message: "Invalid action type" },
                { status: 400 }
            );
        }

        const userIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
        const userAgent = req.headers.get("user-agent") || "";

        // Use transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
            // Create analytics record
            await tx.sermonAnalytics.create({
                data: {
                    sermon_id: parseInt(sermon_id),
                    action_type: action_type,
                    user_ip: userIp as string,
                    user_agent: userAgent,
                },
            });

            // Update counters
            let updateData: import("@prisma/client").Prisma.SermonUpdateInput = {};
            switch (action_type) {
                case 'view':
                    updateData.view_count = { increment: 1 };
                    break;
                case 'download_video':
                case 'download_audio':
                case 'download_pdf':
                    updateData.download_count = { increment: 1 };
                    break;
                case 'like':
                    updateData.like_count = { increment: 1 };
                    break;
                case 'share':
                    updateData.share_count = { increment: 1 };
                    break;
            }

            if (Object.keys(updateData).length > 0) {
                await tx.sermon.update({
                    where: { id: parseInt(sermon_id) },
                    data: updateData,
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: "Action tracked successfully",
        });
    } catch (error: any) {
        console.error("Error tracking sermon action:", error);
        return NextResponse.json(
            { success: false, message: "Failed to track action", error: error.message },
            { status: 500 }
        );
    }
}
