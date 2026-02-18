import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const blog = await prisma.blog.findUnique({
            where: { slug },
            include: {
                comments: {
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                                profile_picture: true,
                            },
                        },
                        replies: {
                            include: {
                                user: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                        profile_picture: true,
                                    },
                                }
                            }
                        }
                    },
                    where: {
                        parent_id: null, // Fetch top-level comments; replies are included
                    },
                    orderBy: {
                        created_at: "desc",
                    },
                },
            },
        });

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog post not found" },
                { status: 404 }
            );
        }

        // Increment view count
        await prisma.blog.update({
            where: { id: blog.id },
            data: { views: { increment: 1 } },
        });

        // Sidebar Data
        const recentPosts = await prisma.blog.findMany({
            where: { status: "published", NOT: { id: blog.id } },
            orderBy: { published_at: "desc" },
            take: 3,
            select: {
                id: true,
                title: true,
                slug: true,
                thumbnail_path: true,
                published_at: true,
                created_at: true,
            }
        });

        const popularPosts = await prisma.blog.findMany({
            where: { status: "published", NOT: { id: blog.id } },
            orderBy: { views: "desc" },
            take: 3,
            select: {
                id: true,
                title: true,
                slug: true,
                thumbnail_path: true,
                views: true,
            }
        });

        // Group by category and count
        const categoriesRaw = await prisma.blog.groupBy({
            by: ['category'],
            where: { status: "published" },
            _count: {
                category: true
            }
        });

        const categories = categoriesRaw.map(c => ({
            name: c.category || "General",
            count: c._count.category
        }));

        return NextResponse.json({
            success: true,
            data: {
                blog,
                recentPosts,
                popularPosts,
                categories
            },
        });
    } catch (error: any) {
        console.error("Fetch blog detail error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
