import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveFile, deleteFile } from '@/lib/storage';
import { GalleryCategory, GalleryStatus, MediaType } from '@prisma/client';

export async function POST(request: NextRequest) {
    let createdAlbumId: number | null = null;
    let savedFilePaths: string[] = [];

    try {
        const formData = await request.formData();

        // Helper to get string values
        const getString = (key: string) => {
            const val = formData.get(key);
            return val ? val.toString() : '';
        };

        const albumName = getString('albumName');
        const eventDateStr = getString('eventDate');
        const category = getString('category') as GalleryCategory;
        const description = getString('description');
        const tags = getString('tags');
        const photographer = getString('photographer');
        const status = (getString('status') || 'published') as GalleryStatus;
        const albumIdParam = getString('album_id');

        // Validation for new albums (first chunk)
        if (!albumIdParam) {
            if (!albumName) throw new Error('Album name is required.');
            if (!eventDateStr) throw new Error('Event date is required.');
            if (!category) throw new Error('Category is required.');
        }

        // Database Transaction
        const startTransaction = async () => {
            // 1. Get or Create Album
            let albumId: number;

            if (albumIdParam) {
                albumId = parseInt(albumIdParam);
                const existingAlbum = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
                if (!existingAlbum) throw new Error(`Album with ID ${albumId} not found.`);

                // Update metadata if provided
                await prisma.galleryAlbum.update({
                    where: { id: albumId },
                    data: {
                        album_name: albumName || existingAlbum.album_name,
                        event_date: eventDateStr ? new Date(eventDateStr) : existingAlbum.event_date,
                        category: category || existingAlbum.category,
                        description: description !== undefined ? description : existingAlbum.description,
                        tags: tags !== undefined ? tags : existingAlbum.tags,
                        photographer: photographer !== undefined ? photographer : existingAlbum.photographer,
                        status: status || existingAlbum.status
                    }
                });

                // Handle deleted media
                const deletedMediaIdsStr = getString('deleted_media_ids');
                if (deletedMediaIdsStr) {
                    const deletedIds = JSON.parse(deletedMediaIdsStr);
                    if (Array.isArray(deletedIds)) {
                        for (const id of deletedIds) {
                            const mediaItem = await prisma.galleryMedia.findUnique({ where: { id: parseInt(id) } });
                            if (mediaItem) {
                                // Delete file using abstraction
                                await deleteFile(mediaItem.file_path);

                                // Delete DB
                                await prisma.galleryMedia.delete({ where: { id: parseInt(id) } });
                                // Decrement count
                                await prisma.galleryAlbum.update({
                                    where: { id: albumId },
                                    data: { media_count: { decrement: 1 } }
                                });
                            }
                        }
                    }
                }
            } else {
                // Create new album
                const newAlbum = await prisma.galleryAlbum.create({
                    data: {
                        album_name: albumName,
                        event_date: new Date(eventDateStr),
                        category: category,
                        description: description,
                        tags: tags,
                        photographer: photographer,
                        status: status,
                        media_count: 0
                    }
                });
                albumId = newAlbum.id;
            }

            createdAlbumId = albumId;

            // 2. Process Files
            const files = formData.getAll('media[]') as File[];
            let mediaCount = 0;
            const newMediaIds: number[] = [];

            for (const file of files) {
                if (!file || typeof file === 'string' || file.size === 0) continue;

                // Validate type
                const mimeType = file.type;
                const isImage = mimeType.startsWith('image/');
                const isVideo = mimeType.startsWith('video/');

                if (!isImage && !isVideo) continue;

                // Save File using abstraction
                const relativePath = await saveFile(file, 'gallery');
                if (!relativePath) continue;

                savedFilePaths.push(relativePath); // Track for cleanup on error (though for Cloudinary this is less trivial, it's fine for local)

                const mediaType = isImage ? MediaType.photo : MediaType.video;

                // Create Media Record
                const media = await prisma.galleryMedia.create({
                    data: {
                        album_id: albumId,
                        media_type: mediaType,
                        file_name: file.name,
                        file_path: relativePath,
                        file_size: file.size,
                        file_extension: file.name.split('.').pop()?.toLowerCase() || '',
                        mime_type: mimeType,
                        upload_order: 0
                    }
                });

                newMediaIds.push(media.id);
                mediaCount++;
            }

            // 3. Update Album Counts and Cover Image
            if (mediaCount > 0) {
                await prisma.galleryAlbum.update({
                    where: { id: albumId },
                    data: {
                        media_count: { increment: mediaCount }
                    }
                });

                // Set cover image if none exists
                const currentAlbum = await prisma.galleryAlbum.findUnique({
                    where: { id: albumId },
                    include: { media: true }
                });

                if (currentAlbum && !currentAlbum.cover_image && newMediaIds.length > 0) {
                    // Try to find the first photo
                    const firstPhoto = await prisma.galleryMedia.findFirst({
                        where: { album_id: albumId, media_type: MediaType.photo },
                        orderBy: { id: 'asc' }
                    });

                    if (firstPhoto) {
                        await prisma.galleryAlbum.update({
                            where: { id: albumId },
                            data: { cover_image: firstPhoto.file_path }
                        });
                    }
                }
            }

            return { albumId, mediaCount };
        };

        const result = await startTransaction();

        return NextResponse.json({
            success: true,
            message: 'Batch uploaded successfully',
            data: {
                album_id: result.albumId,
                uploaded_count: result.mediaCount
            }
        });

    } catch (error: any) {
        console.error('Gallery Upload Error:', error);

        // Cleanup saved files if transaction failed
        for (const path of savedFilePaths) {
            await deleteFile(path);
        }

        // Ideally we would rollback database changes here if we weren't using Prisma's implicit transaction support differently.
        // Since we are doing file ops mixed with DB ops, it's safer to just report error.

        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
