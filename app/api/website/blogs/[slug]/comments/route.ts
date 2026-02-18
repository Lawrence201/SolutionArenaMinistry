import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // First find the blog to get its ID
        const blog = await prisma.blog.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog not found" },
                { status: 404 }
            );
        }

        const comments = await prisma.comment.findMany({
            where: {
                blog_id: blog.id,
                parent_id: null, // Top level
            },
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
                        },
                    },
                    orderBy: {
                        created_at: "asc",
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            data: comments,
        });
    } catch (error: any) {
        console.error("Fetch comments error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const body = await request.json();
        const { content, parent_id, user_id } = body;

        // In a real app, we'd get user_id from the session.
        // For now, we expect it in the body (or fallback for demo/dev).
        if (!user_id) {
            return NextResponse.json(
                { success: false, message: "User must be logged in to comment." },
                { status: 401 }
            );
        }

        const { slug } = await params;
        const blog = await prisma.blog.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog not found" },
                { status: 404 }
            );
        }

        const newComment = await prisma.comment.create({
            data: {
                blog_id: blog.id,
                user_id: parseInt(user_id),
                parent_id: parent_id ? parseInt(parent_id) : null,
                content,
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        profile_picture: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Comment posted successfully",
            data: newComment,
        });
    } catch (error: any) {
        console.error("Post comment error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
