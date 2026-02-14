import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { MediaType } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const mediaId = formData.get('media_id')?.toString();
        const title = formData.get('title')?.toString();
        const caption = formData.get('caption')?.toString();
        const mediaFile = formData.get('media_file') as File | null;

        if (!mediaId) {
            return NextResponse.json({ success: false, message: 'Media ID is required' }, { status: 400 });
        }

        const id = parseInt(mediaId);
        const existingMedia = await prisma.galleryMedia.findUnique({ where: { id } });

        if (!existingMedia) {
            return NextResponse.json({ success: false, message: 'Media item not found' }, { status: 404 });
        }

        let updateData: any = {
            title: title || existingMedia.title,
            caption: caption || existingMedia.caption
        };

        // Handle File Update
        if (mediaFile && mediaFile.size > 0) {
            const now = new Date();
            const year = now.getFullYear().toString();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'gallery', year, month);

            await mkdir(uploadDir, { recursive: true });

            const buffer = Buffer.from(await mediaFile.arrayBuffer());
            const fileExtension = mediaFile.name.split('.').pop()?.toLowerCase() || '';
            const uniqueFileName = `gallery_update_${Date.now()}.${fileExtension}`;
            const filePath = join(uploadDir, uniqueFileName);

            await writeFile(filePath, buffer);

            const relativePath = `/uploads/gallery/${year}/${month}/${uniqueFileName}`;
            const mediaType = mediaFile.type.startsWith('image/') ? MediaType.photo : MediaType.video;

            // Delete old file
            try {
                const oldPath = join(process.cwd(), 'public', existingMedia.file_path);
                await unlink(oldPath);
            } catch (e) { console.error('Failed to delete old media file:', e); }

            updateData.file_path = relativePath;
            updateData.file_name = mediaFile.name;
            updateData.file_size = mediaFile.size;
            updateData.file_extension = fileExtension;
            updateData.mime_type = mediaFile.type;
            updateData.media_type = mediaType;
        }

        const updated = await prisma.galleryMedia.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: 'Media updated successfully',
            data: updated
        });

    } catch (error: any) {
        console.error('Gallery Media Update Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
