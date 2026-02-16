import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const mediaId = formData.get("media_id");

        if (!mediaId) {
            return NextResponse.json(
                { success: false, message: "Media ID is required" },
                { status: 400 }
            );
        }

        await prisma.galleryMedia.update({
            where: { id: parseInt(mediaId as string) },
            data: {
                view_count: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Download tracked",
        });
    } catch (error: any) {
        console.error("Track download error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
