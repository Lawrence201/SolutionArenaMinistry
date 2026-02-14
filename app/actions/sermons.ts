'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSermons(filters: {
    view?: 'all' | 'featured' | 'recent' | 'popular' | 'published' | 'draft';
    category?: string;
    series?: string;
    search?: string;
    limit?: number;
    offset?: number;
}) {
    try {
        const { view, category, series, search, limit = 100, offset = 0 } = filters;

        let where: any = {};

        if (view === 'featured') {
            where.is_featured = true;
        } else if (view === 'recent') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            where.sermon_date = { gte: thirtyDaysAgo };
        } else if (view === 'published') {
            where.is_published = true;
        } else if (view === 'draft') {
            where.is_published = false;
        }

        if (category && category !== 'all') {
            where.sermon_category = category;
        }

        if (series && series !== 'all') {
            where.sermon_series = series;
        }

        if (search) {
            where.OR = [
                { sermon_title: { contains: search, mode: 'insensitive' } },
                { sermon_speaker: { contains: search, mode: 'insensitive' } },
                { sermon_description: { contains: search, mode: 'insensitive' } },
                { sermon_series: { contains: search, mode: 'insensitive' } },
            ];
        }

        const sermons = await prisma.sermon.findMany({
            where,
            orderBy: view === 'popular' ? { view_count: 'desc' } : [
                { sermon_date: 'desc' },
                { created_at: 'desc' }
            ],
            take: limit,
            skip: offset,
            include: {
                scriptures: true,
            }
        });

        const totalFiltered = await prisma.sermon.count({ where });

        const seriesData = await prisma.sermon.groupBy({
            by: ['sermon_series'],
            _count: {
                id: true
            },
            where: {
                sermon_series: { not: null, notIn: [''] }
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        });

        const formattedSeries = seriesData.map(s => ({
            name: s.sermon_series as string,
            count: s._count.id
        }));

        const total = await prisma.sermon.count();
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 30);
        const recent = await prisma.sermon.count({ where: { sermon_date: { gte: recentDate } } });
        const featured = await prisma.sermon.count({ where: { is_featured: true } });

        const viewResult = await prisma.sermon.aggregate({
            _sum: {
                view_count: true
            }
        });

        const mostViewed = await prisma.sermon.findFirst({
            where: { is_published: true, view_count: { gt: 0 } },
            orderBy: { view_count: 'desc' },
            select: { sermon_title: true }
        });

        const latestSpeaker = await prisma.sermon.findFirst({
            orderBy: { sermon_date: 'desc' },
            select: { sermon_speaker: true }
        });

        const avgDuration = await prisma.sermon.aggregate({
            _avg: {
                sermon_duration: true
            }
        });

        return {
            success: true,
            data: sermons,
            total,
            totalFiltered,
            series: formattedSeries,
            stats: {
                total,
                recent,
                featured,
                totalViews: viewResult._sum.view_count || 0,
                mostViewed: mostViewed?.sermon_title || 'N/A',
                latestSpeaker: latestSpeaker?.sermon_speaker || 'N/A',
                avgDuration: Math.round(avgDuration._avg.sermon_duration || 0)
            }
        };
    } catch (error) {
        console.error('Error fetching sermons:', error);
        return { success: false, message: 'Failed to load sermons' };
    }
}

export async function getSermonById(id: number) {
    try {
        const sermon = await prisma.sermon.findUnique({
            where: { id },
            include: {
                scriptures: true
            }
        });
        if (!sermon) return { success: false, message: 'Sermon not found' };
        return { success: true, data: sermon };
    } catch (error) {
        console.error('Error fetching sermon:', error);
        return { success: false, message: 'Failed to find sermon' };
    }
}

export async function deleteSermon(id: number) {
    try {
        await prisma.sermon.delete({
            where: { id }
        });
        revalidatePath('/admin/sermons');
        return { success: true };
    } catch (error) {
        console.error('Error deleting sermon:', error);
        return { success: false, message: 'Failed to delete sermon' };
    }
}

export async function getSermonInsights() {
    try {
        const insights: any[] = [];

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentPubCount = await prisma.sermon.count({
            where: {
                is_published: true,
                sermon_date: { gte: sevenDaysAgo }
            }
        });
        if (recentPubCount > 0) {
            insights.push({
                type: 'success',
                icon: 'trending-up',
                text: `${recentPubCount} sermon${recentPubCount > 1 ? 's' : ''} published this week - great content output!`,
                priority: 1
            });
        }

        const draftCount = await prisma.sermon.count({
            where: { is_published: false }
        });
        if (draftCount > 0) {
            insights.push({
                type: 'warning',
                icon: 'alert-circle',
                text: `${draftCount} draft sermon${draftCount > 1 ? 's' : ''} pending - review and publish when ready`,
                priority: 2
            });
        }

        const topSermon = await prisma.sermon.findFirst({
            where: { is_published: true, view_count: { gt: 0 } },
            orderBy: { view_count: 'desc' },
            select: { sermon_title: true, view_count: true }
        });
        if (topSermon) {
            let title = topSermon.sermon_title;
            if (title.length > 40) title = title.substring(0, 40) + '...';
            insights.push({
                type: 'success',
                icon: 'trending-up',
                text: `"${title}" has ${topSermon.view_count} views - top performing sermon!`,
                priority: 1
            });
        }

        const topSeries = await prisma.sermon.groupBy({
            by: ['sermon_series'],
            where: { is_published: true, sermon_series: { not: null, notIn: [''] } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 1
        });
        if (topSeries.length > 0) {
            insights.push({
                type: 'info',
                icon: 'book',
                text: `"${topSeries[0].sermon_series}" series has ${topSeries[0]._count.id} sermon${topSeries[0]._count.id > 1 ? 's' : ''} - popular series`,
                priority: 3
            });
        }

        const missingAudio = await prisma.sermon.count({
            where: { is_published: true, OR: [{ audio_file: null }, { audio_file: '' }] }
        });
        const missingVideo = await prisma.sermon.count({
            where: { is_published: true, OR: [{ video_file: null }, { video_file: '' }] }
        });
        if (missingAudio > 0) {
            insights.push({
                type: 'warning',
                icon: 'alert-circle',
                text: `${missingAudio} published sermon${missingAudio > 1 ? 's' : ''} without audio - add recordings`,
                priority: 3
            });
        }
        if (missingVideo > 0 && insights.length < 6) {
            insights.push({
                type: 'info',
                icon: 'video',
                text: `${missingVideo} sermon${missingVideo > 1 ? 's' : ''} without video content - consider adding`,
                priority: 4
            });
        }

        const downloadStats = await prisma.sermon.aggregate({
            _sum: { download_count: true },
            where: { is_published: true }
        });
        if (downloadStats._sum.download_count && downloadStats._sum.download_count > 0) {
            insights.push({
                type: 'success',
                icon: 'trending-up',
                text: `${downloadStats._sum.download_count} total downloads - congregation is engaged!`,
                priority: 2
            });
        }

        const lastSermon = await prisma.sermon.findFirst({
            where: { is_published: true },
            orderBy: { sermon_date: 'desc' },
            select: { sermon_date: true }
        });
        if (lastSermon) {
            const days = Math.floor((now.getTime() - new Date(lastSermon.sermon_date).getTime()) / (1000 * 3600 * 24));
            if (days > 14) {
                insights.push({
                    type: 'warning',
                    icon: 'calendar',
                    text: `${days} days since last sermon - schedule new content soon`,
                    priority: 2
                });
            }
        }

        const featuredCount = await prisma.sermon.count({
            where: { is_featured: true, is_published: true }
        });
        if (featuredCount > 0) {
            insights.push({
                type: 'info',
                icon: 'star',
                text: `${featuredCount} featured sermon${featuredCount > 1 ? 's' : ''} currently highlighted`,
                priority: 4
            });
        } else {
            insights.push({
                type: 'info',
                icon: 'star',
                text: `No featured sermons - consider highlighting important messages`,
                priority: 4
            });
        }

        insights.sort((a, b) => a.priority - b.priority);
        return { success: true, data: insights.slice(0, 6) };

    } catch (error) {
        console.error('Error fetching insights:', error);
        return { success: false, message: 'Failed to load insights' };
    }
}
