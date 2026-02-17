'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { GalleryCategory, GalleryStatus, MediaType } from '@prisma/client';
import { saveFile, deleteFile } from '@/lib/storage';

// --- Types ---

export type GalleryFilters = {
    view?: 'all' | 'albums' | 'photos' | 'videos';
    category?: string;
    search?: string;
};

// --- Server Actions ---

/**
 * Fetches gallery data based on view, category, and search filters.
 * Matches fetch_galleries.php
 */
export async function getGalleryData(filters: GalleryFilters = {}) {
    try {
        const { view = 'all', category = 'all', search = '' } = filters;

        let data: any[] = [];

        // --- 1. Fetch Data Logic ---

        // If view is 'albums' or we need to fall back to albums
        if (view === 'albums') {
            const where: any = {};

            if (category !== 'all') {
                where.category = category as GalleryCategory;
            }

            if (search) {
                where.OR = [
                    { album_name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { tags: { contains: search, mode: 'insensitive' } },
                    { photographer: { contains: search, mode: 'insensitive' } }
                ];
            }

            const albums = await prisma.galleryAlbum.findMany({
                where,
                include: {
                    media: {
                        select: { media_type: true, file_path: true },
                    }
                },
                orderBy: [
                    { event_date: 'desc' },
                    { created_at: 'desc' }
                ]
            });

            data = albums.map(album => {
                const photoCount = album.media.filter(m => m.media_type === MediaType.photo).length;
                const videoCount = album.media.filter(m => m.media_type === MediaType.video).length;

                // Pick first available media as cover if no cover_image specified
                let coverImage = album.cover_image;
                if (!coverImage && album.media.length > 0) {
                    // Try to find a photo first
                    const firstPhoto = album.media.find(m => m.media_type === MediaType.photo);
                    if (firstPhoto) {
                        coverImage = firstPhoto.file_path;
                    } else {
                        // Fallback to first media (video?)
                        coverImage = album.media[0].file_path;
                    }
                }

                return {
                    id: album.id,
                    type: 'album',
                    title: album.album_name,
                    category: album.category,
                    mediaCount: album.media_count || album.media.length,
                    date: album.event_date.toISOString().split('T')[0],
                    description: album.description || '',
                    coverImage: coverImage || 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800',
                    photographer: album.photographer || 'Unknown',
                    photoCount,
                    videoCount,
                    views: album.view_count || 0
                };
            });
        }
        // If view is 'all', 'photos', or 'videos', we fetch individual media items
        else {
            const where: any = {};

            // For 'all', we typically want all media (photos and videos)
            if (view === 'photos') where.media_type = MediaType.photo;
            if (view === 'videos') where.media_type = MediaType.video;

            if (category !== 'all') {
                where.album = { category: category };
            }

            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { caption: { contains: search, mode: 'insensitive' } },
                    { album: { album_name: { contains: search, mode: 'insensitive' } } }
                ];
            }

            const mediaItems = await prisma.galleryMedia.findMany({
                where,
                include: {
                    album: {
                        select: { category: true, photographer: true, album_name: true }
                    }
                },
                orderBy: { uploaded_at: 'desc' }
            });

            data = mediaItems.map(item => ({
                id: item.id,
                type: item.media_type, // 'photo' or 'video'
                title: item.title || item.file_name,
                category: item.album.category,
                url: item.file_path,
                date: item.uploaded_at.toISOString().split('T')[0],
                likes: item.likes_count,
                views: item.view_count,
                photographer: item.album.photographer,
                duration: item.duration ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : undefined
            }));
        }

        // --- 2. Statistics Logic ---
        const [totalAlbums, totalMedia, totalPhotos, totalVideos] = await Promise.all([
            prisma.galleryAlbum.count(),
            prisma.galleryMedia.count(),
            prisma.galleryMedia.count({ where: { media_type: MediaType.photo } }),
            prisma.galleryMedia.count({ where: { media_type: MediaType.video } })
        ]);

        const stats = {
            totalAlbums,
            totalMedia,
            totalPhotos,
            totalVideos
        };

        // --- 3. Category Counts ---
        const categoryGroups = await prisma.galleryAlbum.groupBy({
            by: ['category'],
            _count: { category: true }
        });

        // Initialize with 0
        const categoryCounts: Record<string, number> = {
            all: totalAlbums, // 'all' usually represents all albums in the category list context
            worship: 0,
            events: 0,
            youth: 0,
            baptism: 0,
            celebrations: 0
        };

        categoryGroups.forEach(group => {
            const catKey = group.category.toLowerCase(); // Ensure mapping matches standard keys
            // You might need a more robust mapping if DB values differ from keys
            if (categoryCounts.hasOwnProperty(catKey)) {
                categoryCounts[catKey] = group._count.category;
            } else {
                categoryCounts[catKey] = group._count.category; // Dynamically add if new
            }
        });

        return {
            success: true,
            data,
            stats,
            categoryCounts
        };

    } catch (error) {
        console.error('getGalleryData Error:', error);
        return { success: false, message: 'Failed to fetch gallery data', data: [], stats: { totalAlbums: 0, totalMedia: 0, totalPhotos: 0, totalVideos: 0 }, categoryCounts: { all: 0 } };
    }
}

/**
 * Returns gallery insights.
 * Matches get_gallery_insights.php
 */
export async function getGalleryInsights() {
    try {
        const insights: any[] = [];
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Recent Uploads (last 7 days)
        const recentMedia = await prisma.galleryMedia.findMany({
            where: { uploaded_at: { gte: sevenDaysAgo } },
            select: { media_type: true }
        });

        if (recentMedia.length > 0) {
            const photos = recentMedia.filter(m => m.media_type === MediaType.photo).length;
            const videos = recentMedia.filter(m => m.media_type === MediaType.video).length;

            let textParts: string[] = [];
            if (photos > 0) textParts.push(`${photos} photo${photos > 1 ? 's' : ''}`);
            if (videos > 0) textParts.push(`${videos} video${videos > 1 ? 's' : ''}`);

            insights.push({
                type: 'success',
                icon: 'trending-up',
                text: `${textParts.join(' and ')} uploaded this week`
            });
        }

        // 2. New Albums (last 7 days)
        const newAlbums = await prisma.galleryAlbum.findMany({
            where: { created_at: { gte: sevenDaysAgo } },
            orderBy: { created_at: 'desc' },
            select: { album_name: true }
        });

        if (newAlbums.length > 0) {
            if (newAlbums.length === 1) {
                insights.push({
                    type: 'info',
                    icon: 'image',
                    text: `New album '${newAlbums[0].album_name}' created`
                });
            } else {
                insights.push({
                    type: 'info',
                    icon: 'image',
                    text: `${newAlbums.length} new albums created this week`
                });
            }
        }

        // 3. Storage Warning
        const totalMediaCount = await prisma.galleryMedia.count();
        if (totalMediaCount > 1000) {
            insights.push({
                type: 'warning',
                icon: 'alert',
                text: `Gallery has ${totalMediaCount} media items - consider archiving old content`
            });
        } else if (totalMediaCount > 500) {
            insights.push({
                type: 'info',
                icon: 'image',
                text: `Gallery contains ${totalMediaCount} media items`
            });
        }

        // 4. Most Popular (Likes)
        const popularMedia = await prisma.galleryMedia.findFirst({
            where: { likes_count: { gt: 0 } },
            orderBy: { likes_count: 'desc' },
            select: { title: true, likes_count: true, media_type: true }
        });

        if (popularMedia && (popularMedia.likes_count || 0) >= 10) {
            const typeLabel = popularMedia.media_type === MediaType.video ? 'Video' : 'Photo';
            insights.push({
                type: 'success',
                icon: 'trending-up',
                text: `${typeLabel} '${popularMedia.title}' has ${popularMedia.likes_count} likes`
            });
        }

        // 5. Unpublished Albums (Drafts)
        const draftCount = await prisma.galleryAlbum.count({
            where: { status: GalleryStatus.draft }
        });
        if (draftCount > 0) {
            insights.push({
                type: 'warning',
                icon: 'alert',
                text: `${draftCount} album${draftCount > 1 ? 's' : ''} waiting to be published`
            });
        }

        // 6. Empty Albums
        const emptyAlbumsCount = await prisma.galleryAlbum.count({
            where: {
                media: { none: {} }
            }
        });
        if (emptyAlbumsCount > 0) {
            insights.push({
                type: 'info',
                icon: 'alert',
                text: `${emptyAlbumsCount} empty album${emptyAlbumsCount > 1 ? 's' : ''} can be removed`
            });
        }

        // 7. Fallback
        if (insights.length === 0) {
            insights.push({
                type: 'info',
                icon: 'image',
                text: 'No recent gallery activity - upload new media to get started'
            });
        }

        return { success: true, data: insights.slice(0, 4) };

    } catch (error) {
        console.error('getGalleryInsights Error:', error);
        return { success: false, message: 'Failed to fetch insights' };
    }
}

/**
 * Deletes an album or a specific media item.
 * Matches delete_gallery.php
 */
export async function deleteGalleryItem(id: number, type: 'album' | 'photo' | 'video') {
    try {
        if (!id) return { success: false, message: 'Invalid ID' };

        if (type === 'album') {
            // Fetch album to get all media files
            const album = await prisma.galleryAlbum.findUnique({
                where: { id },
                include: { media: true }
            });

            if (!album) return { success: false, message: 'Album not found' };

            // Delete files
            for (const media of album.media) {
                await deleteFile(media.file_path);
            }
            if (album.cover_image && !album.cover_image.startsWith('http')) {
                // Check if cover image is not one of the media files (optimization: usually cover is distinct or copy, but logic in legacy implies cover might be separate upload)
                // In legacy `update_gallery.php`, cover is uploaded separately.
                await deleteFile(album.cover_image);
            }

            // Delete DB Record (Cascade will delete media records, but we did files manual)
            await prisma.galleryAlbum.delete({
                where: { id }
            });

            revalidatePath('/admin/gallery');
            return { success: true, message: 'Album deleted successfully' };

        } else {
            // Delete Single Media
            const media = await prisma.galleryMedia.findUnique({
                where: { id }
            });

            if (!media) return { success: false, message: 'Media not found' };

            const albumId = media.album_id;

            // Delete File
            await deleteFile(media.file_path);

            // Delete Record
            await prisma.galleryMedia.delete({
                where: { id }
            });

            // Update Album Count
            const count = await prisma.galleryMedia.count({ where: { album_id: albumId } });
            await prisma.galleryAlbum.update({
                where: { id: albumId },
                data: { media_count: count }
            });

            revalidatePath('/admin/gallery');
            return { success: true, message: `${type} deleted successfully` };
        }

    } catch (error) {
        console.error('deleteGalleryItem Error:', error);
        return { success: false, message: 'Failed to delete item' };
    }
}

/**
 * Fetches data for editing a gallery item (Album or Media).
 * Matches fetch_gallery_item.php
 */
export async function getGalleryItemForEdit(id: number, type: 'album' | 'media') {
    try {
        if (type === 'album') {
            const album = await prisma.galleryAlbum.findUnique({
                where: { id },
                include: {
                    media: {
                        orderBy: { uploaded_at: 'desc' }
                    }
                }
            });
            if (!album) return { success: false, message: 'Album not found' };

            // Format for frontend if needed
            return { success: true, data: album, type: 'album' };
        } else {
            const media = await prisma.galleryMedia.findUnique({
                where: { id },
                include: { album: true }
            });
            if (!media) return { success: false, message: 'Media not found' };

            return { success: true, data: media, type: 'media' };
        }
    } catch (error) {
        console.error('getGalleryItemForEdit Error:', error);
        return { success: false, message: 'Failed to fetch item' };
    }
}

/**
 * Updates an album.
 * Matches update_gallery.php
 */
export async function updateAlbum(formData: FormData) {
    try {
        const albumId = parseInt(formData.get('album_id') as string);
        if (!albumId) return { success: false, message: 'Album ID is required' };

        const albumName = formData.get('album_name') as string;
        const eventDate = new Date(formData.get('event_date') as string);
        const category = formData.get('category') as GalleryCategory;
        const description = formData.get('description') as string;
        const tags = formData.get('tags') as string;
        const photographer = formData.get('photographer') as string;
        const status = formData.get('status') as GalleryStatus || GalleryStatus.draft;

        // Handle Cover Image
        const coverImageFile = formData.get('cover_image') as File;
        let coverImagePath: string | undefined;

        const existingAlbum = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
        if (!existingAlbum) return { success: false, message: 'Album not found' };

        if (coverImageFile && coverImageFile.size > 0) {
            coverImagePath = await saveFile(coverImageFile, 'gallery/covers') || undefined;
            // Delete old?
            if (existingAlbum.cover_image && coverImagePath) {
                await deleteFile(existingAlbum.cover_image);
            }
        }

        // Update Album
        await prisma.galleryAlbum.update({
            where: { id: albumId },
            data: {
                album_name: albumName,
                event_date: eventDate,
                category,
                description,
                tags,
                photographer,
                status,
                cover_image: coverImagePath, // will update if defined, else ignore? No, Prisma update only updates what's passed.
                ...(coverImagePath && { cover_image: coverImagePath })
            }
        });

        // Handle Deleted Media IDs
        const deletedMediaIdsStr = formData.get('deleted_media_ids') as string;
        if (deletedMediaIdsStr) {
            const deletedIds = JSON.parse(deletedMediaIdsStr);
            if (Array.isArray(deletedIds)) {
                for (const id of deletedIds) {
                    await deleteGalleryItem(parseInt(id), 'photo'); // Reuse delete logic, type arg just for msg
                }
            }
        }

        revalidatePath('/admin/gallery');
        revalidatePath('/admin/add-gallery');
        return { success: true, message: 'Album updated successfully' };

    } catch (error) {
        console.error('updateAlbum Error:', error);
        return { success: false, message: 'Failed to update album' };
    }
}

/**
 * Updates a media item.
 * Matches update_media.php
 */
export async function updateMedia(formData: FormData) {
    try {
        const mediaId = parseInt(formData.get('media_id') as string);
        if (!mediaId) return { success: false, message: 'Media ID is required' };

        const title = formData.get('title') as string;
        const caption = formData.get('caption') as string;
        const mediaFile = formData.get('media_file') as File;

        const existingMedia = await prisma.galleryMedia.findUnique({ where: { id: mediaId } });
        if (!existingMedia) return { success: false, message: 'Media not found' };

        let filePath: string | undefined;
        let fileName: string | undefined;
        let fileSize: number | undefined;
        let mediaType: MediaType | undefined;

        if (mediaFile && mediaFile.size > 0) {
            filePath = await saveFile(mediaFile, 'gallery/media') || undefined;
            if (filePath) {
                // Delete old file
                await deleteFile(existingMedia.file_path);

                fileName = mediaFile.name;
                fileSize = mediaFile.size;
                const ext = fileName.split('.').pop()?.toLowerCase();
                if (['mp4', 'webm', 'mov'].includes(ext || '')) {
                    mediaType = MediaType.video;
                } else {
                    mediaType = MediaType.photo;
                }
            }
        }

        await prisma.galleryMedia.update({
            where: { id: mediaId },
            data: {
                title,
                caption,
                ...(filePath && { file_path: filePath }),
                ...(fileName && { file_name: fileName }),
                ...(fileSize && { file_size: BigInt(fileSize) }), // Schema uses BigInt
                ...(mediaType && { media_type: mediaType })
            }
        });

        revalidatePath('/admin/gallery');
        revalidatePath('/admin/add-gallery');
        return { success: true, message: 'Media updated successfully' };

    } catch (error) {
        console.error('updateMedia Error:', error);
        return { success: false, message: 'Failed to update media' };
    }
}

/**
 * Helper to fetch album media 
 * Matches fetch_album_media.php
 */
export async function getAlbumMedia(albumId: number) {
    return getGalleryItemForEdit(albumId, 'album');
}
