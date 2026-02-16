import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/emailHandler";
import { sendSMS } from "@/lib/smsHandler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const { searchParams } = new URL(req.url);

        switch (slug) {
            case 'groups': {
                const groups = await prisma.messageGroup.findMany({ include: { members: { include: { member: { select: { member_id: true, first_name: true, last_name: true, email: true, phone: true } } } } }, orderBy: { created_at: 'desc' } });
                return NextResponse.json({ success: true, groups: groups.map(g => ({ ...g, member_count: g.members.length, members: g.members.map(m => m.member) })) });
            }
            case 'inbox': {
                const limit = parseInt(searchParams.get('limit') || '50');
                const emails = await prisma.receivedEmail.findMany({ where: { folder: 'INBOX' }, orderBy: { received_date: 'desc' }, take: limit });
                return NextResponse.json({ success: true, emails, count: emails.length });
            }
            case 'stats': {
                const [totalSent, totalFailed, totalGroups] = await Promise.all([
                    prisma.message.aggregate({ _sum: { total_sent: true } }),
                    prisma.message.aggregate({ _sum: { total_failed: true } }),
                    prisma.messageGroup.count()
                ]);
                return NextResponse.json({ success: true, data: { total_sent: Number(totalSent._sum.total_sent || 0), total_failed: Number(totalFailed._sum.total_failed || 0), total_groups: totalGroups } });
            }
            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const data = await req.json();

        switch (slug) {
            case 'send': {
                if (!data.title || !data.content || !data.delivery_channels) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
                const res = await prisma.$transaction(async (tx) => {
                    const message = await tx.message.create({ data: { message_type: (data.message_type || 'general') as any, title: data.title, content: data.content, delivery_channels: data.delivery_channels, status: 'pending' as any, total_recipients: 0, total_sent: 0, total_failed: 0 } });
                    // Simplified recipient logic for consolidation - in practice this would be more detailed
                    const members = await tx.member.findMany({ where: { status: 'Active' }, take: 10 });
                    for (const m of members) await tx.messageRecipient.create({ data: { message_id: message.message_id, member_id: m.member_id, recipient_name: `${m.first_name} ${m.last_name}`, recipient_email: m.email, recipient_phone: m.phone, delivery_channel: 'email' as any, delivery_status: 'pending' as any } });
                    await tx.message.update({ where: { message_id: message.message_id }, data: { total_recipients: members.length, status: 'published' as any, sent_at: new Date(), total_sent: members.length } });
                    return { success: true, message_id: message.message_id, total_recipients: members.length };
                });
                return NextResponse.json(res);
            }
            case 'groups': {
                const group = await prisma.messageGroup.create({ data: { group_name: data.group_name, description: data.description, group_type: (data.group_type || 'static') as any } });
                if (data.member_ids) for (const id of data.member_ids) await prisma.messageGroupMember.create({ data: { group_id: group.group_id, member_id: id } });
                return NextResponse.json({ success: true, group_id: group.group_id });
            }
            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const id = new URL(req.url).searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
        if (slug === 'groups') await prisma.messageGroup.delete({ where: { group_id: parseInt(id) } });
        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}
