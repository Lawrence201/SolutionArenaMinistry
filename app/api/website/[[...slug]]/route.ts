import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const getSafeUrl = (path: string | null, fallback: string = '', subDir: string = '') => {
    if (!path) return fallback;
    if (path.startsWith('http') || path.startsWith('/')) return path;
    // If it's a legacy local path that needs /uploads/ prefix
    if (subDir && !path.startsWith('uploads/')) {
        return `/uploads/${subDir}/${path}`;
    }
    return `/${path}`;
};

/**
 * Consolidated Website API Handler
 * Handles all public-facing website API requests to stay within Vercel Hobby plan limits.
 */

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).filter(Boolean).join('/');
        const { searchParams } = new URL(req.url);

        switch (slug) {
            case 'blogs': {
                const blogs = await prisma.blog.findMany({
                    where: { status: 'published' },
                    include: { _count: { select: { comments: true } } },
                    orderBy: { published_at: 'desc' },
                    take: 3,
                });
                const processedBlogs = blogs.map((blog) => {
                    const dateToFormat = blog.published_at || blog.created_at;
                    return {
                        id: blog.id,
                        title: blog.title,
                        slug: blog.slug,
                        author: blog.author,
                        category: blog.category,
                        excerpt: blog.excerpt,
                        thumbnail_path: getSafeUrl(blog.thumbnail_path, '/assets/images/blog-placeholder.jpg', 'blogs'),
                        published_at: blog.published_at,
                        created_at: blog.created_at,
                        views: blog.views,
                        comment_count: blog._count.comments,
                        formatted_date: dateToFormat ? new Date(dateToFormat).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date TBA',
                    };
                });
                return NextResponse.json({ success: true, data: { blogs: processedBlogs }, message: 'Recent blogs retrieved successfully' });
            }

            case 'events': {
                const events = await prisma.event.findMany({
                    where: { status: 'Published' },
                    orderBy: [{ start_date: 'desc' }, { start_time: 'desc' }],
                    take: 8,
                });
                const processedEvents = events.map((event) => {
                    const formatTime = (time: Date | null) => time ? time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase() : '';
                    const startTime = formatTime(event.start_time);
                    const endTime = formatTime(event.end_time);
                    return {
                        id: event.id,
                        name: event.name,
                        type: event.type,
                        category: event.category,
                        description: event.description,
                        location: event.full_address || event.room_building || event.location || 'Location TBA',
                        start_date: event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBA',
                        start_time: startTime,
                        end_time: endTime,
                        time_range: startTime && endTime ? `${startTime} - ${endTime}` : 'Time TBA',
                        image_path: getSafeUrl(event.image_path, '/assets/images/event-img-1.webp', 'events'),
                        max_capacity: event.max_capacity,
                        age_group: event.age_group,
                        require_registration: event.require_registration,
                        is_virtual: event.is_virtual,
                        virtual_link: event.virtual_link,
                    };
                });
                return NextResponse.json({ success: true, count: processedEvents.length, events: processedEvents });
            }

            case 'footer-events': {
                const events = await prisma.event.findMany({
                    where: { status: "Published" },
                    orderBy: [{ start_date: "desc" }, { start_time: "desc" }],
                    take: 2,
                });
                const formattedEvents = events.map((event) => {
                    return {
                        id: event.id,
                        name: event.name,
                        start_date: new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
                        image_path: getSafeUrl(event.image_path, "/assets/images/f-event.webp", "events"),
                    };
                });
                return NextResponse.json({ success: true, count: formattedEvents.length, events: formattedEvents });
            }

            case 'birthdays': {
                const now = new Date();
                const birthdaysToday = await prisma.member.findMany({
                    where: {
                        status: 'Active',
                        date_of_birth: {
                            not: null
                        }
                    },
                    select: {
                        member_id: true,
                        first_name: true,
                        last_name: true,
                        photo_path: true,
                        birthday_thumb: true,
                        birthday_title: true,
                        birthday_message: true,
                        date_of_birth: true
                    }
                });

                const filteredBirthdays = birthdaysToday.filter(m => {
                    const dob = m.date_of_birth;
                    return dob && dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate();
                }).map(m => ({
                    ...m,
                    photo_path: getSafeUrl(m.photo_path, '/assets/images/placeholder-member.png', 'members'),
                    birthday_thumb: getSafeUrl(m.birthday_thumb, '/assets/images/birthday-placeholder.png', 'members')
                }));

                return NextResponse.json({ success: true, data: filteredBirthdays });
            }

            case 'statistics': {
                const now = new Date();
                const [totalEvents, totalSermons, upcomingEvents, birthdaysResult] = await Promise.all([
                    prisma.event.count({ where: { status: 'Published' } }),
                    prisma.sermon.count({ where: { is_published: true } }),
                    prisma.event.count({ where: { status: 'Published', start_date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
                    (await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM members WHERE EXTRACT(MONTH FROM date_of_birth) = ${now.getMonth() + 1} AND date_of_birth IS NOT NULL`) as any
                ]) as [number, number, number, { count: number }[]];
                return NextResponse.json({ success: true, data: { total_events: totalEvents, total_sermons: totalSermons, birthdays_this_month: birthdaysResult[0]?.count || 0, upcoming_events: upcomingEvents } });
            }

            case 'audio-playlist': {
                const sermons = await prisma.sermon.findMany({
                    where: { is_published: true, AND: [{ audio_file: { not: null } }, { audio_file: { not: '' } }] },
                    orderBy: [{ is_featured: 'desc' }, { sermon_date: 'desc' }],
                    take: 5,
                });
                const processedAudio = sermons.map((sermon) => ({
                    id: sermon.id,
                    title: sermon.sermon_title || 'Untitled Sermon',
                    speaker: sermon.sermon_speaker || 'Unknown Speaker',
                    date: sermon.sermon_date ? new Date(sermon.sermon_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date',
                    audio_url: getSafeUrl(sermon.audio_file, '', 'sermons/audio'),
                    image_url: getSafeUrl(sermon.sermon_image, '/assets/images/sermon-placeholder.jpg', 'sermons/images'),
                    duration: sermon.sermon_duration || 0,
                }));
                return NextResponse.json({ success: true, data: processedAudio, count: processedAudio.length });
            }

            case 'gallery/albums': {
                const albums = await prisma.galleryAlbum.findMany({
                    where: { status: "published" },
                    orderBy: { event_date: "desc" },
                });
                const formattedAlbums = albums.map((album) => ({
                    id: album.id,
                    name: album.album_name,
                    date: album.event_date.toISOString(),
                    category: album.category,
                    cover: getSafeUrl(album.cover_image, "/assets/images/album-placeholder.jpg", "gallery"),
                    count: album.media_count || 0,
                }));
                return NextResponse.json({ success: true, count: formattedAlbums.length, data: formattedAlbums });
            }

            case 'gallery/media': {
                const albumId = searchParams.get("album_id");
                if (!albumId) return NextResponse.json({ success: false, message: "Album ID is required" }, { status: 400 });
                const mediaItems = await prisma.galleryMedia.findMany({
                    where: { album_id: parseInt(albumId) },
                    orderBy: { uploaded_at: "desc" },
                    include: { album: true },
                });
                const formattedMedia = mediaItems.map((item) => ({
                    id: item.id,
                    type: item.media_type,
                    url: getSafeUrl(item.file_path, "", "gallery"),
                    filename: item.file_name,
                    title: item.title || item.file_name,
                    caption: item.caption || "",
                    likes: item.likes_count || 0,
                    views: item.view_count || 0,
                    width: item.width || 0,
                    height: item.height || 0,
                    thumbnail: item.thumbnail_path ? (item.thumbnail_path.startsWith('/') ? item.thumbnail_path : `/${item.thumbnail_path}`) : null,
                    duration: item.duration || null,
                    album: item.album.album_name,
                    date: item.album.event_date.toISOString(),
                    category: item.album.category,
                    uploaded_at: item.uploaded_at.toISOString(),
                }));
                return NextResponse.json({ success: true, count: formattedMedia.length, data: formattedMedia });
            }

            case 'sermons': {
                const page = parseInt(searchParams.get("page") || "1");
                const limit = parseInt(searchParams.get("limit") || "6");
                const search = searchParams.get("search") || "";
                const series = searchParams.get("series") || "";
                const category = searchParams.get("category") || "";
                const offset = (page - 1) * limit;
                const where: any = { is_published: true };
                if (search) where.OR = [{ sermon_title: { contains: search, mode: "insensitive" } }, { sermon_description: { contains: search, mode: "insensitive" } }, { sermon_speaker: { contains: search, mode: "insensitive" } }];
                if (series) where.sermon_series = series;
                if (category) where.sermon_category = category;
                const [sermons, totalCount] = await Promise.all([
                    prisma.sermon.findMany({ where, include: { scriptures: { orderBy: { display_order: "asc" } } }, orderBy: [{ is_featured: "desc" }, { sermon_date: "desc" }], skip: offset, take: limit }),
                    prisma.sermon.count({ where }),
                ]);
                const processedSermons = sermons.map(s => ({
                    ...s,
                    audio_file: getSafeUrl(s.audio_file, '', 'sermons/audio'),
                    video_file: getSafeUrl(s.video_file, '', 'sermons/videos'),
                    sermon_image: getSafeUrl(s.sermon_image, '/assets/images/sermon-placeholder.jpg', 'sermons/images')
                }));

                return NextResponse.json({ success: true, data: processedSermons, pagination: { current_page: page, total_pages: Math.ceil(totalCount / limit), total_count: totalCount, per_page: limit, has_more: page < Math.ceil(totalCount / limit) } });
            }

            default:
                return NextResponse.json({ success: false, message: `Route GET /api/website/${slug} not found` }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Website API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).filter(Boolean).join('/');

        switch (slug) {
            case 'gallery/like': {
                const formData = await req.formData();
                const mediaId = formData.get("media_id");
                if (!mediaId) return NextResponse.json({ success: false, message: "Media ID is required" }, { status: 400 });
                const userId = 1; // Placeholder
                const mediaIdInt = parseInt(mediaId as string);
                const existingLike = await prisma.galleryLike.findUnique({ where: { media_id_user_id: { media_id: mediaIdInt, user_id: userId } } });
                let action = "";
                if (existingLike) {
                    await prisma.galleryLike.delete({ where: { id: existingLike.id } });
                    await prisma.galleryMedia.update({ where: { id: mediaIdInt }, data: { likes_count: { decrement: 1 } } });
                    action = "unliked";
                } else {
                    await prisma.galleryLike.create({ data: { media_id: mediaIdInt, user_id: userId } });
                    await prisma.galleryMedia.update({ where: { id: mediaIdInt }, data: { likes_count: { increment: 1 } } });
                    action = "liked";
                }
                const updatedMedia = await prisma.galleryMedia.findUnique({ where: { id: mediaIdInt }, select: { likes_count: true } });
                return NextResponse.json({ success: true, action, likes: updatedMedia?.likes_count || 0 });
            }

            case 'gallery/track': {
                const formData = await req.formData();
                const mediaId = formData.get("media_id");
                if (!mediaId) return NextResponse.json({ success: false, message: "Media ID is required" }, { status: 400 });
                await prisma.galleryMedia.update({ where: { id: parseInt(mediaId as string) }, data: { view_count: { increment: 1 } } });
                return NextResponse.json({ success: true, message: "Download tracked" });
            }

            case 'sermons/track': {
                const body = await req.json();
                const { sermon_id, action_type } = body;
                if (!sermon_id || !action_type) return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
                const allowedActions = ['view', 'download_video', 'download_audio', 'download_pdf', 'like', 'share'];
                if (!allowedActions.includes(action_type)) return NextResponse.json({ success: false, message: "Invalid action type" }, { status: 400 });
                const userIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
                const userAgent = req.headers.get("user-agent") || "";
                await prisma.$transaction(async (tx) => {
                    await tx.sermonAnalytics.create({ data: { sermon_id: parseInt(sermon_id), action_type, user_ip: userIp as string, user_agent: userAgent } });
                    let updateData: any = {};
                    if (action_type === 'view') updateData.view_count = { increment: 1 };
                    else if (['download_video', 'download_audio', 'download_pdf'].includes(action_type)) updateData.download_count = { increment: 1 };
                    else if (action_type === 'like') updateData.like_count = { increment: 1 };
                    else if (action_type === 'share') updateData.share_count = { increment: 1 };
                    if (Object.keys(updateData).length > 0) await tx.sermon.update({ where: { id: parseInt(sermon_id) }, data: updateData });
                });
                return NextResponse.json({ success: true, message: "Action tracked successfully" });
            }

            default:
                return NextResponse.json({ success: false, message: `Route POST /api/website/${slug} not found` }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Website API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
