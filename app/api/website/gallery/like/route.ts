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

        // TODO: Implement proper session check. 
        // For now, since we don't have NextAuth, we might need to check a cookie
        // or assume a default user for testing if no auth is set up yet in Next.js.
        // The legacy app uses a 'user_id' from PHP session.

        // Placeholder user_id
        const userId = 1;

        const mediaIdInt = parseInt(mediaId as string);

        // Check if liked
        const existingLike = await prisma.galleryLike.findUnique({
            where: {
                media_id_user_id: {
                    media_id: mediaIdInt,
                    user_id: userId,
                },
            },
        });

        let action = "";
        if (existingLike) {
            // Unlike
            await prisma.galleryLike.delete({
                where: { id: existingLike.id },
            });
            await prisma.galleryMedia.update({
                where: { id: mediaIdInt },
                data: {
                    likes_count: {
                        decrement: 1,
                    },
                },
            });
            action = "unliked";
        } else {
            // Like
            await prisma.galleryLike.create({
                data: {
                    media_id: mediaIdInt,
                    user_id: userId,
                },
            });
            await prisma.galleryMedia.update({
                where: { id: mediaIdInt },
                data: {
                    likes_count: {
                        increment: 1,
                    },
                },
            });
            action = "liked";
        }

        const updatedMedia = await prisma.galleryMedia.findUnique({
            where: { id: mediaIdInt },
            select: { likes_count: true },
        });

        return NextResponse.json({
            success: true,
            action,
            likes: updatedMedia?.likes_count || 0,
        });
    } catch (error: any) {
        console.error("Like media error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
