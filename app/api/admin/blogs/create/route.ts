
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';
import { BlogStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Helper to get string value
        const getString = (key: string) => {
            const val = formData.get(key);
            return val ? val.toString() : '';
        };

        // Helper to get boolean value
        const getBool = (key: string) => {
            const val = formData.get(key);
            return val === 'true' || val === '1' || val === 'on';
        };

        // Helper to generate unique slug
        const generateUniqueSlug = async (title: string) => {
            let slug = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            let uniqueSlug = slug;
            let counter = 1;

            while (true) {
                const existing = await prisma.blog.findUnique({
                    where: { slug: uniqueSlug }
                });

                if (!existing) {
                    return uniqueSlug;
                }

                uniqueSlug = `${slug}-${counter}`;
                counter++;
            }
        };

        // 1. Extract Data
        const title = getString('title');
        const author = getString('author');
        const publishDate = getString('publish_date');
        const category = getString('category');
        const tags = getString('tags');
        const excerpt = getString('excerpt');
        const content = getString('content');
        const status = getString('status');
        const isFeatured = getBool('is_featured');

        // Validation
        if (!title || !author || !publishDate || !excerpt || !content) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // 2. Handle File Uploads
        // Both blog thumbnails and author images can go into specific folders or just 'blogs'
        // Legacy PHP put everything in 'uploads/', let's use 'blogs' for thumbnails and 'authors' for author images to be organized, or just 'blogs' for all.
        // The previous event route saved to 'uploads/events'. Let's save to 'uploads/blogs'.
        const thumbnailPath = await saveFile(formData.get('thumbnail') as File, 'blogs');
        const authorImagePath = await saveFile(formData.get('author_image') as File, 'blogs');

        // 3. Generate Slug
        const slug = await generateUniqueSlug(title);

        // 4. Create Blog
        const newBlog = await prisma.blog.create({
            data: {
                title,
                slug,
                author,
                author_image_path: authorImagePath,
                category: category || null,
                tags: tags || null,
                excerpt,
                content,
                thumbnail_path: thumbnailPath,
                status: status === 'draft' ? BlogStatus.draft : BlogStatus.published,
                is_featured: isFeatured,
                published_at: status === 'published' ? new Date(`${publishDate}T00:00:00`) : null,
            }
        });

        // 5. Log Activity
        await prisma.activityLog.create({
            data: {
                activity_type: 'other', // Or create a specific enum if available, sticking to existing enums
                title: 'New Blog Post',
                description: `Created blog post: ${title}`,
                icon_type: 'file-text', // Using a generic icon type
                related_id: newBlog.id,
                created_by: 'Admin'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Blog created successfully',
            blog_id: newBlog.id
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
