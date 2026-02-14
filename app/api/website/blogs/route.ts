import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch 3 most recent published blogs
        const blogs = await prisma.blog.findMany({
            where: {
                status: 'published',
            },
            include: {
                _count: {
                    select: { comments: true },
                },
            },
            orderBy: {
                published_at: 'desc',
            },
            take: 3,
        });

        // Process blogs data to match legacy JSON structure
        const processedBlogs = blogs.map((blog) => {
            const dateToFormat = blog.published_at || blog.created_at;
            const formattedDate = dateToFormat
                ? new Date(dateToFormat).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })
                : 'Date TBA';

            return {
                id: blog.id,
                title: blog.title,
                slug: blog.slug,
                author: blog.author,
                category: blog.category,
                excerpt: blog.excerpt,
                thumbnail_path: blog.thumbnail_path,
                published_at: blog.published_at,
                created_at: blog.created_at,
                views: blog.views,
                comment_count: blog._count.comments,
                formatted_date: formattedDate,
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                blogs: processedBlogs,
            },
            message: 'Recent blogs retrieved successfully',
        });
    } catch (error: any) {
        console.error('Error fetching recent blogs:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch recent blogs.',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
