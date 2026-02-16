import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "6");
        const search = searchParams.get("search") || "";
        const series = searchParams.get("series") || "";
        const category = searchParams.get("category") || "";

        const offset = (page - 1) * limit;

        const where: import("@prisma/client").Prisma.SermonWhereInput = {
            is_published: true,
        };

        if (search) {
            where.OR = [
                { sermon_title: { contains: search, mode: "insensitive" } },
                { sermon_description: { contains: search, mode: "insensitive" } },
                { sermon_speaker: { contains: search, mode: "insensitive" } },
            ];
        }

        if (series) {
            where.sermon_series = series;
        }

        if (category) {
            where.sermon_category = category;
        }

        const [sermons, totalCount] = await Promise.all([
            prisma.sermon.findMany({
                where,
                include: {
                    scriptures: {
                        orderBy: {
                            display_order: "asc",
                        },
                    },
                },
                orderBy: [
                    { is_featured: "desc" },
                    { sermon_date: "desc" },
                ],
                skip: offset,
                take: limit,
            }),
            prisma.sermon.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        return NextResponse.json({
            success: true,
            data: sermons,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_count: totalCount,
                per_page: limit,
                has_more: hasMore,
            },
        });
    } catch (error: any) {
        console.error("Error fetching sermons:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch sermons", error: error.message },
            { status: 500 }
        );
    }
}
