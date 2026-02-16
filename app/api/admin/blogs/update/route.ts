import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { BlogStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const id = parseInt(formData.get('id')?.toString() || '0');

        if (!id) {
            return NextResponse.json({ success: false, message: 'Blog ID is required' }, { status: 400 });
        }

        // Fetch existing blog
        const existingBlog = await prisma.blog.findUnique({
            where: { id }
        });

        if (!existingBlog) {
            return NextResponse.json({ success: false, message: 'Blog post not found' }, { status: 404 });
        }

        // Helper to get string value
        const getString = (key: string) => {
            const val = formData.get(key);
            return val ? val.toString() : null;
        };

        // Helper to get boolean value
        const getBool = (key: string) => {
            const val = formData.get(key);
            return val === 'true' || val === '1' || val === 'on';
        };

        // Helper to save file and cleanup old
        const handleFileReplacement = async (file: File | null, oldPath: string | null, subDir: string) => {
            if (!file || typeof file === 'string') return oldPath;

            // Delete old file if exists
            if (oldPath) {
                try {
                    const fullPath = join(process.cwd(), 'public', oldPath);
                    await unlink(fullPath);
                } catch (err) {
                    console.warn(`Failed to delete old file ${oldPath}:`, err);
                }
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadDir = join(process.cwd(), 'public', 'uploads', subDir);
            await mkdir(uploadDir, { recursive: true });

            const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const filePath = join(uploadDir, uniqueName);
            await writeFile(filePath, buffer);

            return `/uploads/${subDir}/${uniqueName}`;
        };

        const title = getString('title') || existingBlog.title;
        const author = getString('author') || existingBlog.author;
        const publishDate = getString('publish_date');
        const category = getString('category');
        const tags = getString('tags');
        const excerpt = getString('excerpt') || existingBlog.excerpt;
        const content = getString('content') || existingBlog.content;
        const status = getString('status');
        const isFeatured = getBool('is_featured');

        // Handle Image Updates
        const thumbnailFile = formData.get('thumbnail') as File;
        const authorImageFile = formData.get('author_image') as File;

        const thumbnailPath = await handleFileReplacement(thumbnailFile, existingBlog.thumbnail_path, 'blogs');
        const authorImagePath = await handleFileReplacement(authorImageFile, existingBlog.author_image_path, 'blogs');

        // Generate slug if title changed
        let slug = existingBlog.slug;
        if (title !== existingBlog.title) {
            const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            slug = baseSlug;
            let counter = 1;
            while (true) {
                const conflict = await prisma.blog.findFirst({
                    where: { slug, id: { not: id } }
                });
                if (!conflict) break;
                slug = `${baseSlug}-${counter++}`;
            }
        }

        // Update Blog
        await prisma.blog.update({
            where: { id },
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
                published_at: status === 'published' ? (publishDate ? new Date(`${publishDate}T00:00:00`) : existingBlog.published_at) : null,
            }
        });

        // Log Activity
        await prisma.activityLog.create({
            data: {
                activity_type: 'other',
                title: 'Blog Updated',
                description: `Updated blog post: ${title}`,
                icon_type: 'edit',
                related_id: id,
                created_by: 'Admin'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Blog updated successfully'
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
