import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "6");
        const offset = parseInt(searchParams.get("offset") || "0");

        const blogs = await prisma.blog.findMany({
            where: {
                status: "published",
            },
            include: {
                _count: {
                    select: { comments: true },
                },
            },
            orderBy: {
                published_at: "desc",
            },
            take: limit,
            skip: offset,
        });

        const total = await prisma.blog.count({
            where: {
                status: "published",
            },
        });

        // Format the blogs to match expected legacy keys if needed, 
        // though we can adapt the component to use Prisma's field names.
        const formattedBlogs = blogs.map((blog) => ({
            ...blog,
            comment_count: blog._count.comments,
            formatted_date: blog.published_at
                ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(blog.published_at)
                : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(blog.created_at),
        }));

        return NextResponse.json({
            success: true,
            data: {
                blogs: formattedBlogs,
                total,
                limit,
                offset,
            },
        });
    } catch (error: any) {
        console.error("Fetch blogs error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
