import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const albums = await prisma.galleryAlbum.findMany({
            where: {
                status: "published",
            },
            orderBy: {
                event_date: "desc",
            },
            select: {
                id: true,
                album_name: true,
                event_date: true,
                category: true,
                cover_image: true,
                media_count: true,
            },
        });

        const formattedAlbums = albums.map((album) => ({
            id: album.id,
            name: album.album_name,
            date: album.event_date.toISOString(),
            category: album.category,
            cover: album.cover_image ?
                (album.cover_image.startsWith('/') ? album.cover_image : `/${album.cover_image}`)
                : "/assets/images/album-placeholder.jpg",
            count: album.media_count || 0,
        }));

        return NextResponse.json({
            success: true,
            count: formattedAlbums.length,
            data: formattedAlbums,
        });
    } catch (error: any) {
        console.error("Gallery albums fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load albums", error: error.message },
            { status: 500 }
        );
    }
}
