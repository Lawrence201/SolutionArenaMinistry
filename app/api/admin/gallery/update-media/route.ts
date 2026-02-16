import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveFile, deleteFile } from '@/lib/storage';
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
            const relativePath = await saveFile(mediaFile, 'gallery');
            if (relativePath) {
                // Delete old file
                await deleteFile(existingMedia.file_path);

                updateData.file_path = relativePath;
                updateData.file_name = mediaFile.name;
                updateData.file_size = mediaFile.size;
                updateData.file_extension = mediaFile.name.split('.').pop()?.toLowerCase() || '';
                updateData.mime_type = mediaFile.type;
                updateData.media_type = mediaFile.type.startsWith('image/') ? MediaType.photo : MediaType.video;
            }
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
