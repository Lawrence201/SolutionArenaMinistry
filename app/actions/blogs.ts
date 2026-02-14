'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function getBlogs(params: {
    view?: 'all' | 'featured' | 'published' | 'draft';
    category?: string;
    search?: string;
} = {}) {
    try {
        const { view = 'all', category, search } = params;

        let where: any = {};

        // Status Filter
        if (view === 'published') where.status = 'published';
        else if (view === 'draft') where.status = 'draft';
        else if (view === 'featured') where.is_featured = true;

        // Category Filter
        if (category && category !== 'all') {
            where.category = category;
        }

        // Search Filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }

        const blogs = await prisma.blog.findMany({
            where,
            orderBy: { created_at: 'desc' },
        });

        // Get Stats
        const total = await prisma.blog.count();
        const publishedCount = await prisma.blog.count({ where: { status: 'published' } });
        const draftCount = await prisma.blog.count({ where: { status: 'draft' } });
        const featuredCount = await prisma.blog.count({ where: { is_featured: true } });

        // Get Categories
        const categoryGroups = await prisma.blog.groupBy({
            by: ['category'],
            _count: { category: true },
            where: { category: { not: null } }
        });

        const series = categoryGroups.map(c => ({
            name: c.category,
            count: c._count.category
        }));

        // Quick Stats
        const latestBlog = await prisma.blog.findFirst({
            orderBy: { created_at: 'desc' }
        });

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const postsThisMonth = await prisma.blog.count({
            where: {
                created_at: { gte: firstDayOfMonth },
                status: 'published'
            }
        });

        return {
            success: true,
            data: blogs,
            stats: {
                total,
                published: publishedCount,
                drafts: draftCount,
                featured: featuredCount,
                latestAuthor: latestBlog?.author || '-',
                postsThisMonth: postsThisMonth,
            },
            series // Reusing the naming convention from sermons for UI consistency
        };
    } catch (error: any) {
        console.error('Error fetching blogs:', error);
        return { success: false, message: error.message };
    }
}

export async function getBlogById(id: number) {
    try {
        const blog = await prisma.blog.findUnique({
            where: { id }
        });
        return { success: true, data: blog };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteBlog(id: number) {
    try {
        const blog = await prisma.blog.findUnique({
            where: { id }
        });

        if (!blog) throw new Error('Blog post not found');

        // Delete files
        if (blog.thumbnail_path) {
            try {
                const fullPath = join(process.cwd(), 'public', blog.thumbnail_path);
                await unlink(fullPath);
            } catch (err) {
                console.warn('Failed to delete thumbnail:', err);
            }
        }

        if (blog.author_image_path) {
            try {
                const fullPath = join(process.cwd(), 'public', blog.author_image_path);
                await unlink(fullPath);
            } catch (err) {
                console.warn('Failed to delete author image:', err);
            }
        }

        await prisma.blog.delete({
            where: { id }
        });

        // Log entry
        await prisma.activityLog.create({
            data: {
                activity_type: 'other',
                title: 'Blog Deleted',
                description: `Deleted blog post: ${blog.title}`,
                icon_type: 'trash',
                related_id: id,
                created_by: 'Admin'
            }
        });

        revalidatePath('/admin/blogs');
        return { success: true, message: 'Blog deleted successfully' };
    } catch (error: any) {
        console.error('Error deleting blog:', error);
        return { success: false, message: error.message };
    }
}

export async function getBlogInsights() {
    try {
        const insights = [];
        const now = new Date();

        // 1. Recent posts
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentCount = await prisma.blog.count({
            where: { status: 'published', created_at: { gte: weekAgo } }
        });
        if (recentCount > 0) {
            insights.push({
                type: 'success',
                icon: 'trending-up',
                text: `${recentCount} blog post${recentCount > 1 ? 's' : ''} published this week`
            });
        }

        // 2. Drafts
        const draftCount = await prisma.blog.count({
            where: { status: 'draft' }
        });
        if (draftCount > 0) {
            insights.push({
                type: 'warning',
                icon: 'alert-circle',
                text: `${draftCount} draft post${draftCount > 1 ? 's' : ''} waiting to be published`
            });
        }

        // 3. Latest Author
        const latest = await prisma.blog.findFirst({
            where: { status: 'published' },
            orderBy: { created_at: 'desc' }
        });
        if (latest) {
            insights.push({
                type: 'success',
                icon: 'star', // Using a star to highlight
                text: `Latest post '${latest.title}' by ${latest.author}`
            });
        }

        // 4. Milestone
        const totalPublished = await prisma.blog.count({ where: { status: 'published' } });
        const milestones = [200, 150, 100, 50, 25, 10];
        const currentMilestone = milestones.find(m => totalPublished >= m);
        if (currentMilestone) {
            insights.push({
                type: 'info',
                icon: 'book',
                text: `Milestone reached: ${totalPublished} published blog posts!`
            });
        }

        // Default if empty
        if (insights.length === 0) {
            insights.push({
                type: 'info',
                icon: 'trending-up',
                text: 'No recent blog activity - create a new post to get started'
            });
        }

        return { success: true, data: insights.slice(0, 4) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
