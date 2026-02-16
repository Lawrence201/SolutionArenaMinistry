import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/lib/emailHandler';
import { sendSMS } from '@/lib/smsHandler';

const prisma = new PrismaClient();

/**
 * POST /api/communication/send
 * Send message via email and/or SMS to selected recipients
 * 
 * Body params:
 * - title: Message title
 * - content: Message content
 * - delivery_channels: ['email', 'sms']
 * - audience_type: 'all' | 'group' | 'individual' etc.
 * - audience_value: group name (for group type)
 * - member_ids: array of member IDs (for individual type)
 * - group_id: message group ID (for custom_group type)
 * - action: 'send' | 'schedule'
 * - scheduled_at: ISO date string (for schedule action)
 * - message_type: 'announcement' | 'event' | 'prayer_request' etc.
 */
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Validate required fields
        if (!data.title || !data.content || !data.delivery_channels) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: title, content, delivery_channels' },
                { status: 400 }
            );
        }

        // Start transaction
        return await prisma.$transaction(async (tx) => {
            // 1. Create the message record
            const messageType = data.message_type || 'general';
            const scheduledAt = data.scheduled_at ? new Date(data.scheduled_at) : null;
            const status = data.action === 'schedule' ? 'scheduled' : 'pending';

            const message = await tx.message.create({
                data: {
                    message_type: messageType,
                    title: data.title,
                    content: data.content,
                    delivery_channels: data.delivery_channels,
                    status: status as any,
                    scheduled_at: scheduledAt,
                    total_recipients: 0,
                    total_sent: 0,
                    total_failed: 0
                }
            });

            // 2. Get recipients based on audience selection
            const recipients = await getRecipients(tx, data);

            if (recipients.length === 0) {
                throw new Error('No recipients found for the selected audience');
            }

            // 3. Insert recipients into message_recipients table
            let totalRecipients = 0;
            for (const recipient of recipients) {
                for (const channel of data.delivery_channels) {
                    // Skip if channel data is missing
                    if (channel === 'email' && !recipient.email) continue;
                    if (channel === 'sms' && !recipient.phone) continue;

                    await tx.messageRecipient.create({
                        data: {
                            message_id: message.message_id,
                            member_id: recipient.member_id,
                            recipient_type: recipient.type || 'member',
                            recipient_name: `${recipient.first_name} ${recipient.last_name}`,
                            recipient_email: recipient.email,
                            recipient_phone: recipient.phone,
                            delivery_channel: channel as any,
                            delivery_status: 'pending'
                        }
                    });
                    totalRecipients++;
                }
            }

            // 4. Update message with recipient count
            await tx.message.update({
                where: { message_id: message.message_id },
                data: { total_recipients: totalRecipients }
            });

            let deliveryResult: any = { message: 'Scheduled for later' };

            // 5. If sending now (not scheduled), process delivery
            if (status === 'pending') {
                deliveryResult = await processMessageDelivery(tx, message.message_id, data);

                // Update message status
                await tx.message.update({
                    where: { message_id: message.message_id },
                    data: {
                        status: 'published', // 'sent' status is 'published' in ContentStatus enum
                        sent_at: new Date(),
                        total_sent: deliveryResult.sent,
                        total_failed: deliveryResult.failed
                    }
                });

                // Log activity to dashboard
                try {
                    await tx.activityLog.create({
                        data: {
                            activity_type: 'message_sent',
                            title: 'Message sent',
                            description: `${data.title} sent to ${totalRecipients} members`,
                            icon_type: 'message',
                            related_id: message.message_id
                        }
                    });

                    // Keep only the 4 most recent activities
                    const recentActivities = await tx.activityLog.findMany({
                        orderBy: { created_at: 'desc' },
                        take: 4,
                        select: { activity_id: true }
                    });

                    const idsToKeep = recentActivities.map(a => a.activity_id);
                    await tx.activityLog.deleteMany({
                        where: { activity_id: { notIn: idsToKeep } }
                    });
                } catch (activityError) {
                    console.error('Failed to log message activity:', activityError);
                }
            } else {
                // Create scheduled message entry
                await tx.scheduledMessage.create({
                    data: {
                        message_id: message.message_id,
                        scheduled_time: scheduledAt!,
                        status: 'pending',
                        next_run: scheduledAt!
                    }
                });
            }

            return NextResponse.json({
                success: true,
                message_id: message.message_id,
                total_recipients: totalRecipients,
                status,
                delivery_stats: deliveryResult
            });
        });

    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                trace: error.stack
            },
            { status: 500 }
        );
    }
}

/**
 * Get recipients based on audience selection
 */
async function getRecipients(tx: any, data: any): Promise<any[]> {
    const audienceType = data.audience_type || 'all';

    switch (audienceType) {
        case 'all':
            return await tx.member.findMany({
                where: { status: 'Active' },
                select: {
                    member_id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone: true
                }
            });

        case 'group':
        case 'church_group':
            return await tx.member.findMany({
                where: {
                    church_group: data.audience_value,
                    status: 'Active'
                },
                select: {
                    member_id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone: true
                }
            });

        case 'ministry':
        case 'department':
            const memberMinistries = await tx.memberMinistry.findMany({
                where: {
                    ministry: {
                        ministry_name: data.audience_value
                    }
                },
                include: {
                    member: {
                        where: { status: 'Active' },
                        select: {
                            member_id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });
            return memberMinistries.map((mm: any) => mm.member).filter(Boolean);

        case 'custom_group':
            const groupMembers = await tx.messageGroupMember.findMany({
                where: { group_id: parseInt(data.group_id) },
                include: {
                    member: {
                        where: { status: 'Active' },
                        select: {
                            member_id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });
            return groupMembers.map((gm: any) => gm.member).filter(Boolean);

        case 'individual':
            return await tx.member.findMany({
                where: {
                    member_id: { in: data.member_ids }
                },
                select: {
                    member_id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone: true
                }
            });

        case 'users':
            const users = await tx.user.findMany({
                where: { is_active: true },
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true
                }
            });
            return users.map((user: any) => ({
                member_id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: null,
                type: 'user'
            }));

        default:
            return await tx.member.findMany({
                where: { status: 'Active' },
                select: {
                    member_id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone: true
                }
            });
    }
}

/**
 * Process message delivery (email/SMS)
 */
async function processMessageDelivery(
    tx: any,
    messageId: number,
    data: any
): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Get all pending recipients
    const recipients = await tx.messageRecipient.findMany({
        where: {
            message_id: messageId,
            delivery_status: 'pending'
        }
    });

    for (const recipient of recipients) {
        let success = false;

        try {
            if (recipient.delivery_channel === 'email' && recipient.recipient_email) {
                success = await sendEmail(
                    recipient.recipient_email,
                    data.title,
                    data.content,
                    messageId
                );
            } else if (recipient.delivery_channel === 'sms' && recipient.recipient_phone) {
                success = await sendSMS(
                    recipient.recipient_phone,
                    data.content,
                    messageId
                );
            }

            if (success) {
                sent++;
                await tx.messageRecipient.update({
                    where: { recipient_id: recipient.recipient_id },
                    data: {
                        delivery_status: 'sent',
                        sent_at: new Date()
                    }
                });
            } else {
                failed++;
                await tx.messageRecipient.update({
                    where: { recipient_id: recipient.recipient_id },
                    data: { delivery_status: 'failed' }
                });
            }
        } catch (error: any) {
            failed++;
            await tx.messageRecipient.update({
                where: { recipient_id: recipient.recipient_id },
                data: {
                    delivery_status: 'failed',
                    error_message: error.message
                }
            });
        }
    }

    return { sent, failed };
}
