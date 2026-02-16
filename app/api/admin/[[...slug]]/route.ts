import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile, deleteFile } from "@/lib/storage";
import { BlogStatus, EventType, EventCategory, EventStatus, GalleryCategory, GalleryStatus, MediaType, Blog, Event, Sermon } from "@prisma/client";

/**
 * Consolidated Admin API Handler
 * Handles all administrative API requests to stay within Vercel Hobby plan limits.
 */

// --- Helpers ---
const getString = (formData: FormData, key: string) => formData.get(key)?.toString() || '';
const getBool = (formData: FormData, key: string) => {
    const val = formData.get(key);
    return val === 'true' || val === '1' || val === 'on';
};
const getInt = (formData: FormData, key: string) => parseInt(formData.get(key)?.toString() || '0');

const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const { searchParams } = new URL(req.url);

        switch (slug) {
            case 'dashboard-stats': {
                const currentMonthStart = new Date(); currentMonthStart.setDate(1); currentMonthStart.setHours(0, 0, 0, 0);
                const [totalMembers, newMembers, totalEvents, newEvents, offerings, tithes, projects, welfare, expenses, withdrawals, active, inactive, visitors] = await Promise.all([
                    prisma.member.count(), prisma.member.count({ where: { created_at: { gte: currentMonthStart } } }),
                    prisma.event.count(), prisma.event.count({ where: { created_at: { gte: currentMonthStart } } }),
                    prisma.offering.aggregate({ _sum: { amount_collected: true } }), prisma.tithe.aggregate({ _sum: { amount: true } }),
                    prisma.projectOffering.aggregate({ _sum: { amount_collected: true } }), prisma.welfareContribution.aggregate({ _sum: { amount: true } }),
                    prisma.expense.aggregate({ _sum: { amount: true } }), prisma.withdrawal.aggregate({ _sum: { amount: true } }),
                    prisma.member.count({ where: { status: "Active" } }), prisma.member.count({ where: { status: "Inactive" } }), prisma.member.count({ where: { membership_type: "Visitor" } })
                ]);
                return NextResponse.json({ success: true, data: { total_members: totalMembers, members_change: newMembers, total_events: totalEvents, events_change: newEvents, total_offerings: Number(offerings._sum.amount_collected || 0), total_tithes: Number(tithes._sum.amount || 0), total_project_offerings: Number(projects._sum.amount_collected || 0), total_welfare: Number(welfare._sum.amount || 0), total_expenses: Number(expenses._sum.amount || 0), total_withdrawals: Number(withdrawals._sum.amount || 0), active_members: active, inactive_members: inactive, visitors } });
            }

            case 'insights': {
                const now = new Date(); const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const [offerings, tithes, projects, welfare] = await Promise.all([
                    prisma.offering.aggregate({ _sum: { amount_collected: true }, where: { date: { gte: currentMonthStart } } }),
                    prisma.tithe.aggregate({ _sum: { amount: true }, where: { date: { gte: currentMonthStart } } }),
                    prisma.projectOffering.aggregate({ _sum: { amount_collected: true }, where: { date: { gte: currentMonthStart } } }),
                    prisma.welfareContribution.aggregate({ _sum: { amount: true }, where: { date: { gte: currentMonthStart } } })
                ]);
                const income = (Number(offerings._sum.amount_collected) || 0) + (Number(tithes._sum.amount) || 0) + (Number(projects._sum.amount_collected) || 0) + (Number(welfare._sum.amount) || 0);
                const insights = [];
                if (income > 0) insights.push({ type: "success", icon: "dollar", text: `Total income this month: GH₵${income.toLocaleString()}`, priority: 1, module: "Finance" });
                const [upcomingCount, inactiveCount] = await Promise.all([
                    prisma.event.count({ where: { start_date: { gte: now }, status: "Published" } }),
                    prisma.member.count({ where: { status: "Inactive" } })
                ]);
                if (upcomingCount === 0) insights.push({ type: "warning", icon: "calendar", text: "No events scheduled for the next 30 days", priority: 1, module: "Events" });
                if (inactiveCount > 0) insights.push({ type: "warning", icon: "alert", text: `${inactiveCount} members marked as inactive`, priority: 3, module: "Members" });
                return NextResponse.json({ success: true, data: insights });
            }

            case 'finance/balance': {
                const account = searchParams.get("account");
                let income = 0;
                if (account === 'offering') income = Number((await prisma.offering.aggregate({ _sum: { amount_collected: true } }))._sum.amount_collected || 0);
                else if (account === 'tithe') income = Number((await prisma.tithe.aggregate({ _sum: { amount: true } }))._sum.amount || 0);
                else if (account === 'projectoffering') income = Number((await prisma.projectOffering.aggregate({ _sum: { amount_collected: true } }))._sum.amount_collected || 0);
                else if (account === 'welfare') income = Number((await prisma.welfareContribution.aggregate({ _sum: { amount: true } }))._sum.amount || 0);
                const withdrawals = Number((await prisma.withdrawal.aggregate({ where: { account_type: account || '' }, _sum: { amount: true } }))._sum.amount || 0);
                return NextResponse.json({ success: true, balance: income - withdrawals, income, withdrawals });
            }

            case 'finance/records': {
                const type = searchParams.get("type");
                const search = searchParams.get("search") || '';
                const where: any = {};
                if (searchParams.get("date")) where.date = new Date(searchParams.get("date")!);
                let data: any[] = [];
                if (type === 'offering') data = await prisma.offering.findMany({ where: search ? { ...where, OR: [{ notes: { contains: search, mode: 'insensitive' } }, { transaction_id: { contains: search, mode: 'insensitive' } }] } : where, orderBy: { date: 'desc' }, take: 50 });
                else if (type === 'tithe') data = await prisma.tithe.findMany({ where: search ? { ...where, OR: [{ member: { first_name: { contains: search, mode: 'insensitive' } } }, { transaction_id: { contains: search, mode: 'insensitive' } }] } : where, include: { member: { select: { first_name: true, last_name: true } } }, orderBy: { date: 'desc' }, take: 50 });
                else if (type === 'projectoffering') data = await prisma.projectOffering.findMany({ where: search ? { ...where, OR: [{ project_name: { contains: search, mode: 'insensitive' } }, { transaction_id: { contains: search, mode: 'insensitive' } }] } : where, orderBy: { date: 'desc' }, take: 50 });
                else if (type === 'welfare') data = await prisma.welfareContribution.findMany({ where: search ? { ...where, OR: [{ notes: { contains: search, mode: 'insensitive' } }, { transaction_id: { contains: search, mode: 'insensitive' } }] } : where, include: { member: { select: { first_name: true, last_name: true } } }, orderBy: { date: 'desc' }, take: 50 });
                else if (type === 'expense') data = await prisma.expense.findMany({ where: search ? { ...where, OR: [{ description: { contains: search, mode: 'insensitive' } }, { transaction_id: { contains: search, mode: 'insensitive' } }] } : where, orderBy: { date: 'desc' }, take: 50 });

                return NextResponse.json({ success: true, data: data.map(r => ({ id: r.offering_id || r.tithe_id || r.project_offering_id || r.welfare_id || r.expense_id, transaction_id: r.transaction_id, date: r.date, amount: r.amount || r.amount_collected, member_name: r.member ? `${r.member.first_name} ${r.member.last_name}` : null, description: r.project_name || r.description || r.notes })) });
            }

            case 'members/search': {
                const query = searchParams.get("query") || '';
                const members = await prisma.member.findMany({ where: query ? { OR: [{ first_name: { contains: query, mode: "insensitive" } }, { last_name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] } : {}, take: 20 });
                return NextResponse.json({ success: true, members: members.map(m => ({ id: m.member_id, full_name: `${m.first_name} ${m.last_name}`, email: m.email, phone: m.phone, photo_path: m.photo_path })) });
            }

            case 'recent-activities': {
                const activities = await prisma.activityLog.findMany({ orderBy: { created_at: 'desc' }, take: 10 });
                return NextResponse.json({ success: true, data: activities.map(a => ({ ...a, time_ago: getTimeAgo(a.created_at) })) });
            }

            case 'upcoming-events': {
                const events = await prisma.event.findMany({ where: { start_date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }, status: "Published" }, orderBy: { start_date: 'asc' }, take: 5 });
                return NextResponse.json({ success: true, data: events.map(e => ({ id: e.id, name: e.name, date_display: e.start_date.toDateString(), time_display: e.start_time.toLocaleTimeString() })) });
            }

            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const formData = await req.formData().catch(() => null);
        const body = !formData ? await req.json().catch(() => ({})) : null;

        switch (slug) {
            case 'blogs/create': {
                const title = getString(formData!, 'title');
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const blog = await prisma.blog.create({
                    data: {
                        title: title as any,
                        slug: slug as any,
                        author: getString(formData!, 'author') as any,
                        excerpt: getString(formData!, 'excerpt') as any,
                        content: getString(formData!, 'content') as any,
                        thumbnail_path: (await saveFile(formData?.get('thumbnail') as File, 'blogs')) as any,
                        status: (getString(formData!, 'status') === 'draft' ? BlogStatus.draft : BlogStatus.published) as any
                    }
                });
                return NextResponse.json({ success: true, blog_id: blog.id });
            }

            case 'finance/create': {
                const { type, amount, date, paymentMethod, serviceType, status, countedBy, notes, member_id, project_name, category, description, vendor_payee, payment_period } = body;
                const trxId = `TRX-${Date.now()}`;
                let result;
                if (type === 'offering') {
                    result = await prisma.offering.create({
                        data: {
                            transaction_id: trxId,
                            date: new Date(date),
                            service_type: serviceType as any,
                            amount_collected: amount,
                            collection_method: paymentMethod as any,
                            counted_by: countedBy,
                            notes: notes,
                            status: status as any
                        }
                    });
                } else if (type === 'tithe') {
                    result = await prisma.tithe.create({
                        data: {
                            transaction_id: trxId,
                            member_id: member_id,
                            date: new Date(date),
                            amount: amount,
                            payment_method: paymentMethod as any,
                            notes: notes,
                            status: status as any
                        }
                    });
                } else if (type === 'projectoffering') {
                    result = await prisma.projectOffering.create({
                        data: {
                            transaction_id: trxId,
                            date: new Date(date),
                            service_type: serviceType as any,
                            project_name: project_name,
                            amount_collected: amount,
                            collection_method: paymentMethod as any,
                            counted_by: countedBy,
                            notes: notes,
                            status: status as any
                        }
                    });
                } else if (type === 'welfare') {
                    result = await prisma.welfareContribution.create({
                        data: {
                            transaction_id: trxId,
                            member_id: member_id,
                            date: new Date(date),
                            amount: amount,
                            payment_method: paymentMethod as any,
                            payment_period: payment_period as any,
                            notes: notes,
                            status: status as any
                        }
                    });
                } else if (type === 'expense') {
                    result = await prisma.expense.create({
                        data: {
                            transaction_id: trxId,
                            date: new Date(date),
                            category: category as any,
                            description: description,
                            amount: amount,
                            payment_method: paymentMethod as any,
                            vendor_payee: vendor_payee,
                            notes: notes,
                            status: status as any
                        }
                    });
                }
                return NextResponse.json({ success: true, data: result });
            }

            case 'finance/withdraw': {
                const { account_type, amount, recipient, purpose, date } = body;
                const total = Number((await (prisma as any)[account_type === 'offering' ? 'offering' : 'tithe'].aggregate({ _sum: { amount: account_type === 'offering' ? 'amount_collected' : 'amount' } }))._sum[account_type === 'offering' ? 'amount_collected' : 'amount'] || 0);
                const withdrawn = Number((await prisma.withdrawal.aggregate({ where: { account_type }, _sum: { amount: true } }))._sum.amount || 0);
                if (total - withdrawn < amount) return NextResponse.json({ success: false, message: "Insufficient funds" }, { status: 400 });
                const wd = await prisma.withdrawal.create({ data: { transaction_id: `WD-${Date.now()}`, account_type, amount, recipient, purpose, authorized_by: body.authorized_by, date: new Date(date) } });
                return NextResponse.json({ success: true, data: wd });
            }

            case 'blogs/create':
            case 'blogs/update': {
                const isUpdate = slug === 'blogs/update';
                const id = getString(formData!, 'id');
                const title = getString(formData!, 'title');
                const authorImagePath = await saveFile(formData?.get('author_image') as File, 'blogs/authors');
                const thumbnailPath = await saveFile(formData?.get('thumbnail') as File, 'blogs/thumbnails');

                const data: any = {
                    title,
                    slug: getString(formData!, 'slug') || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
                    author: getString(formData!, 'author'),
                    category: getString(formData!, 'category'),
                    tags: getString(formData!, 'tags'),
                    excerpt: getString(formData!, 'excerpt'),
                    content: getString(formData!, 'content'),
                    status: getString(formData!, 'status') as any,
                    is_featured: getBool(formData!, 'is_featured'),
                    published_at: formData?.get('publish_date') ? new Date(getString(formData!, 'publish_date')) : new Date(),
                };

                if (authorImagePath) data.author_image_path = authorImagePath;
                if (thumbnailPath) data.thumbnail_path = thumbnailPath;

                let blog;
                if (isUpdate && id) {
                    blog = await prisma.blog.update({ where: { id: parseInt(id) }, data });
                } else {
                    blog = await prisma.blog.create({ data });
                }

                return NextResponse.json({ success: true, data: blog });
            }

            case 'events/create':
            case 'events/update': {
                const isUpdate = slug === 'events/update';
                const id = getString(formData!, 'event_id') || getString(formData!, 'id');

                const eventImagePath = await saveFile(formData?.get('eventImage') as File, 'events');
                const contactImagePath = await saveFile(formData?.get('contactPersonImage') as File, 'events/contacts');
                const adImage1Path = await saveFile(formData?.get('adImage1') as File, 'events/ads');
                const adImage2Path = await saveFile(formData?.get('adImage2') as File, 'events/ads');
                const adVideo1Path = await saveFile(formData?.get('adVideo1') as File, 'events/ads');
                const adVideo2Path = await saveFile(formData?.get('adVideo2') as File, 'events/ads');

                const data: any = {
                    name: getString(formData!, 'eventName'),
                    type: getString(formData!, 'eventType').toUpperCase() as any,
                    type_other: getString(formData!, 'eventTypeOther'),
                    category: getString(formData!, 'eventCategory').toUpperCase() as any,
                    category_other: getString(formData!, 'eventCategoryOther'),
                    description: getString(formData!, 'eventDescription'),
                    start_date: new Date(getString(formData!, 'startDate')),
                    start_time: new Date(`1970-01-01T${getString(formData!, 'startTime')}:00`),
                    end_date: new Date(getString(formData!, 'endDate')),
                    end_time: new Date(`1970-01-01T${getString(formData!, 'endTime')}:00`),
                    is_recurring: getBool(formData!, 'recurringEvent'),
                    location: getString(formData!, 'eventLocation') === 'Other' ? getString(formData!, 'eventLocationCustom') : getString(formData!, 'eventLocation'),
                    room_building: getString(formData!, 'roomBuilding'),
                    full_address: getString(formData!, 'fullAddress'),
                    is_virtual: getBool(formData!, 'virtualEvent'),
                    virtual_link: getString(formData!, 'virtualLink'),
                    max_capacity: getInt(formData!, 'maxCapacity'),
                    registration_deadline: formData?.get('registrationDeadline') ? new Date(getString(formData!, 'registrationDeadline')) : null,
                    require_registration: getBool(formData!, 'requireRegistration'),
                    open_to_public: getBool(formData!, 'openToPublic'),
                    volunteers_needed: getInt(formData!, 'volunteersNeeded'),
                    contact_person: getString(formData!, 'contactPerson'),
                    contact_email: getString(formData!, 'contactEmail'),
                    contact_phone: getString(formData!, 'contactPhone'),
                    age_group: (getString(formData!, 'ageGroup').charAt(0).toUpperCase() + getString(formData!, 'ageGroup').slice(1)) as any,
                    special_notes: getString(formData!, 'specialNotes'),
                    status: getString(formData!, 'status') as any,
                };

                if (eventImagePath) data.image_path = eventImagePath;
                if (contactImagePath) data.contact_person_image = contactImagePath;
                if (adImage1Path) data.ad_image_1 = adImage1Path;
                if (adImage2Path) data.ad_image_2 = adImage2Path;
                if (adVideo1Path) data.ad_video_1 = adVideo1Path;
                if (adVideo2Path) data.ad_video_2 = adVideo2Path;

                let eventRecord: Event;
                if (isUpdate && id) {
                    eventRecord = await prisma.event.update({ where: { id: parseInt(id) }, data });
                    // Handle Tags and Roles if needed - usually requires clearing and recreating
                    const tags = JSON.parse(getString(formData!, 'eventTags') || '[]');
                    if (tags.length > 0) {
                        await prisma.eventTag.deleteMany({ where: { event_id: eventRecord.id } });
                        await prisma.eventTag.createMany({ data: tags.map((t: string) => ({ event_id: eventRecord.id, tag: t })) });
                    }
                    const roles = JSON.parse(getString(formData!, 'volunteerRoles') || '[]');
                    if (roles.length > 0) {
                        await prisma.eventVolunteerRole.deleteMany({ where: { event_id: eventRecord.id } });
                        await prisma.eventVolunteerRole.createMany({ data: roles.map((r: any) => ({ event_id: eventRecord.id, role_name: r.name, quantity_needed: parseInt(r.quantity) })) });
                    }
                } else {
                    eventRecord = await prisma.event.create({ data });
                    const tags = JSON.parse(getString(formData!, 'eventTags') || '[]');
                    if (tags.length > 0) {
                        await prisma.eventTag.createMany({ data: tags.map((t: string) => ({ event_id: eventRecord.id, tag: t })) });
                    }
                    const roles = JSON.parse(getString(formData!, 'volunteerRoles') || '[]');
                    if (roles.length > 0) {
                        await prisma.eventVolunteerRole.createMany({ data: roles.map((r: any) => ({ event_id: eventRecord.id, role_name: r.name, quantity_needed: parseInt(r.quantity) })) });
                    }
                }

                return NextResponse.json({ success: true, data: eventRecord });
            }

            case 'sermons/create':
            case 'sermons/update': {
                const isUpdate = slug === 'sermons/update';
                const id = getString(formData!, 'id');
                const videoType = getString(formData!, 'videoType') as any;

                const videoFile = await saveFile(formData?.get('videoFile') as File, 'sermons/videos');
                const audioFile = await saveFile(formData?.get('audioFile') as File, 'sermons/audio');
                const pdfFile = await saveFile(formData?.get('pdfFile') as File, 'sermons/docs');
                const sermonImage = await saveFile(formData?.get('sermonImage') as File, 'sermons/images');

                const data: any = {
                    sermon_title: getString(formData!, 'sermonTitle'),
                    sermon_speaker: getString(formData!, 'sermonSpeaker'),
                    sermon_date: new Date(getString(formData!, 'sermonDate')),
                    sermon_series: getString(formData!, 'sermonSeries'),
                    sermon_series_other: getString(formData!, 'sermonSeriesOther'),
                    sermon_description: getString(formData!, 'sermonDescription'),
                    video_type: videoType,
                    sermon_duration: getInt(formData!, 'sermonDuration'),
                    sermon_category: getString(formData!, 'sermonCategory'),
                    sermon_category_other: getString(formData!, 'sermonCategoryOther'),
                    tags: JSON.parse(getString(formData!, 'tags') || '[]'),
                    is_featured: getString(formData!, 'featuredSermon') === '1',
                    allow_downloads: getString(formData!, 'allowDownloads') === '1',
                    is_published: getString(formData!, 'publishImmediately') === '1',
                    enable_comments: getString(formData!, 'enableComments') === '1',
                };

                if (videoType === 'url') data.video_file = getString(formData!, 'videoUrl');
                else if (videoFile) data.video_file = videoFile;

                if (audioFile) data.audio_file = audioFile;
                if (pdfFile) data.pdf_file = pdfFile;
                if (sermonImage) data.sermon_image = sermonImage;

                let sermon: Sermon;
                if (isUpdate && id) {
                    sermon = await prisma.sermon.update({ where: { id: parseInt(id) }, data });
                    const scriptures = formData?.getAll('scripture[]') as string[];
                    if (scriptures && scriptures.length > 0) {
                        await prisma.sermonScripture.deleteMany({ where: { sermon_id: sermon.id } });
                        await prisma.sermonScripture.createMany({ data: scriptures.map(s => ({ sermon_id: sermon.id, scripture_reference: s })) });
                    }
                } else {
                    sermon = await prisma.sermon.create({ data });
                    const scriptures = formData?.getAll('scripture[]') as string[];
                    if (scriptures && scriptures.length > 0) {
                        await prisma.sermonScripture.createMany({ data: scriptures.map(s => ({ sermon_id: sermon.id, scripture_reference: s })) });
                    }
                }

                return NextResponse.json({ success: true, data: sermon });
            }

            case 'gallery/create': {
                const albumIdParam = getString(formData!, 'album_id');
                let albumId = albumIdParam ? parseInt(albumIdParam) : (await prisma.galleryAlbum.create({ data: { album_name: getString(formData!, 'albumName'), event_date: new Date(getString(formData!, 'eventDate')), category: getString(formData!, 'category') as GalleryCategory } })).id;
                const files = formData!.getAll('media[]') as File[];
                for (const file of files) {
                    if (file.size > 0) {
                        const path = await saveFile(file, 'gallery');
                        if (path) {
                            await prisma.galleryMedia.create({
                                data: {
                                    album_id: albumId as any,
                                    media_type: (file.type.startsWith('image/') ? 'photo' : 'video') as any,
                                    file_path: path as any,
                                    file_name: file.name as any,
                                    file_size: BigInt(file.size) as any,
                                    file_extension: (file.name.split('.').pop() || '') as any,
                                    mime_type: file.type as any,
                                    upload_order: 0 as any
                                }
                            });
                        }
                    }
                }
                return NextResponse.json({ success: true, album_id: albumId });
            }

            case 'members/create': {
                const photoPath = await saveFile(formData?.get('photoInput') as File, 'members');
                const birthdayThumbPath = await saveFile(formData?.get('birthdayThumb') as File, 'members');

                const member = await prisma.member.create({
                    data: {
                        first_name: getString(formData!, 'firstName'),
                        last_name: getString(formData!, 'lastName'),
                        date_of_birth: formData?.get('dateOfBirth') ? new Date(getString(formData!, 'dateOfBirth')) : null,
                        gender: getString(formData!, 'gender') as any,
                        marital_status: getString(formData!, 'maritalStatus') as any,
                        occupation: getString(formData!, 'occupation'),
                        phone: getString(formData!, 'phone'),
                        email: getString(formData!, 'email'),
                        address: getString(formData!, 'address'),
                        city: getString(formData!, 'city'),
                        region: getString(formData!, 'region'),
                        status: (getString(formData!, 'status').charAt(0).toUpperCase() + getString(formData!, 'status').slice(1)) as any,
                        church_group: getString(formData!, 'selectedMinistry') as any,
                        leadership_role: getString(formData!, 'leadership').replace(' ', '_') as any,
                        baptism_status: getString(formData!, 'baptismStatus') as any,
                        spiritual_growth: getString(formData!, 'spiritualGrowth').replace(' ', '_') as any,
                        membership_type: getString(formData!, 'membershipType').replace(' ', '_') as any,
                        notes: getString(formData!, 'notes'),
                        photo_path: photoPath,
                        birthday_thumb: birthdayThumbPath,
                        birthday_title: getString(formData!, 'birthdayTitle'),
                        birthday_message: getString(formData!, 'birthdayMessage'),
                        emergencyContacts: {
                            create: {
                                emergency_name: getString(formData!, 'emergencyName'),
                                emergency_phone: getString(formData!, 'emergencyPhone'),
                                emergency_relation: getString(formData!, 'emergencyRelation')
                            }
                        }
                    }
                });

                // Handle Departments
                const depts = formData?.getAll('departments[]') as string[];
                if (depts && depts.length > 0) {
                    for (const deptName of depts) {
                        if (deptName === 'None') continue;
                        const dept = await prisma.department.findFirst({ where: { department_name: deptName as any } });
                        if (dept) {
                            await prisma.memberDepartment.create({
                                data: {
                                    member_id: member.member_id,
                                    department_id: dept.department_id
                                }
                            });
                        }
                    }
                }

                // Handle Ministries
                const mins = formData?.getAll('ministries[]') as string[];
                if (mins && mins.length > 0) {
                    for (const minName of mins) {
                        const min = await prisma.ministry.findFirst({ where: { ministry_name: minName as any } });
                        if (min) {
                            await prisma.memberMinistry.create({
                                data: {
                                    member_id: member.member_id,
                                    ministry_id: min.ministry_id
                                }
                            });
                        }
                    }
                }

                return NextResponse.json({ success: true, member_id: member.member_id, photoPath, birthdayThumbPath });
            }

            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const { ids, type } = await req.json();
        if (slug === 'finance/records' || slug === 'finance/delete') {
            let res;
            if (type === 'offering') res = await prisma.offering.deleteMany({ where: { offering_id: { in: ids } } });
            else if (type === 'tithe') res = await prisma.tithe.deleteMany({ where: { tithe_id: { in: ids } } });
            return NextResponse.json({ success: true, count: res?.count });
        }
        return NextResponse.json({ success: false, message: "Invalid delete route" }, { status: 400 });
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}
