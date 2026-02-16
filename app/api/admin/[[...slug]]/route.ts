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
                return NextResponse.json({ success: true, data: data.map(r => ({ id: r.offering_id || r.tithe_id || r.project_offering_id || r.welfare_id, transaction_id: r.transaction_id, date: r.date, amount: r.amount || r.amount_collected, member_name: r.member ? `${r.member.first_name} ${r.member.last_name}` : null })) });
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
                const { type, amount, date, paymentMethod, serviceType, status, countedBy, notes } = body;
                const trxId = `TRX-${Date.now()}`;
                let result;
                if (type === 'offering') {
                    result = await prisma.offering.create({
                        data: {
                            transaction_id: trxId,
                            amount_collected: parseFloat(amount),
                            date: new Date(date),
                            service_type: (serviceType || 'Sunday Worship') as any,
                            collection_method: (paymentMethod || 'Cash') as any,
                            counted_by: countedBy || '',
                            notes: notes || '',
                            status: (status || 'Pending') as any
                        }
                    });
                } else if (type === 'tithe') {
                    result = await prisma.tithe.create({
                        data: {
                            transaction_id: trxId,
                            amount: parseFloat(amount),
                            date: new Date(date),
                            payment_method: (paymentMethod || 'Cash') as any,
                            status: (status || 'Paid') as any,
                            member_id: parseInt(body.memberId) || null,
                            notes: notes || ''
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
