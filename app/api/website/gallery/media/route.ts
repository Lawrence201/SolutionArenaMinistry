import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const albumId = searchParams.get("album_id");

        if (!albumId) {
            return NextResponse.json(
                { success: false, message: "Album ID is required" },
                { status: 400 }
            );
        }

        const mediaItems = await prisma.galleryMedia.findMany({
            where: {
                album_id: parseInt(albumId),
            },
            orderBy: {
                uploaded_at: "desc",
            },
            include: {
                album: true,
            },
        });

        const formattedMedia = mediaItems.map((item) => ({
            id: item.id,
            type: item.media_type,
            url: item.file_path.startsWith('/') ? item.file_path : `/${item.file_path}`,
            filename: item.file_name,
            title: item.title || item.file_name,
            caption: item.caption || "",
            likes: item.likes_count || 0,
            views: item.view_count || 0,
            width: item.width || 0,
            height: item.height || 0,
            thumbnail: item.thumbnail_path ?
                (item.thumbnail_path.startsWith('/') ? item.thumbnail_path : `/${item.thumbnail_path}`)
                : null,
            duration: item.duration || null,
            album: item.album.album_name,
            date: item.album.event_date.toISOString(),
            category: item.album.category,
            uploaded_at: item.uploaded_at.toISOString(),
        }));

        return NextResponse.json({
            success: true,
            count: formattedMedia.length,
            data: formattedMedia,
        });
    } catch (error: any) {
        console.error("Gallery media fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load gallery", error: error.message },
            { status: 500 }
        );
    }
}
