import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/communication/recipients
 * Fetches recipient lists based on audience selection
 * Query params:
 * - audience_type: all | group | department | church_group | ministry | individual | users
 * - audience_value: specific group/department name (for group/department types)
 * - member_ids: comma-separated member IDs (for individual type)
 * - group_id: message group ID (for custom_group type)
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const audienceType = searchParams.get('audience_type') || 'all';
        const audienceValue = searchParams.get('audience_value');
        const memberIdsParam = searchParams.get('member_ids');
        const groupId = searchParams.get('group_id');

        let recipients: any[] = [];

        switch (audienceType) {
            case 'all':
                // Get all active members
                recipients = await prisma.member.findMany({
                    where: { status: 'Active' },
                    select: {
                        member_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone: true
                    }
                });
                break;

            case 'group':
            case 'church_group':
                // Get members from specific church group
                if (!audienceValue) {
                    return NextResponse.json(
                        { success: false, message: 'audience_value required for group selection' },
                        { status: 400 }
                    );
                }
                recipients = await prisma.member.findMany({
                    where: {
                        church_group: audienceValue as any,
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
                break;

            case 'ministry':
            case 'department':
                // Get members from specific ministry/department
                if (!audienceValue) {
                    return NextResponse.json(
                        { success: false, message: 'audience_value required for ministry/department selection' },
                        { status: 400 }
                    );
                }

                const memberMinistries = await prisma.memberMinistry.findMany({
                    where: {
                        ministry: {
                            ministry_name: audienceValue as any
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

                recipients = memberMinistries.map(mm => mm.member).filter(Boolean);
                break;

            case 'custom_group':
                // Get members from message group
                if (!groupId) {
                    return NextResponse.json(
                        { success: false, message: 'group_id required for custom_group selection' },
                        { status: 400 }
                    );
                }

                const groupMembers = await prisma.messageGroupMember.findMany({
                    where: { group_id: parseInt(groupId) },
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

                recipients = groupMembers.map(gm => gm.member).filter(Boolean);
                break;

            case 'individual':
                // Specific member(s)
                if (!memberIdsParam) {
                    return NextResponse.json(
                        { success: false, message: 'member_ids required for individual selection' },
                        { status: 400 }
                    );
                }

                const memberIds = memberIdsParam.split(',').map(id => parseInt(id.trim()));
                recipients = await prisma.member.findMany({
                    where: {
                        member_id: { in: memberIds }
                    },
                    select: {
                        member_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone: true
                    }
                });
                break;

            case 'users':
                // Get all active users
                const users = await prisma.user.findMany({
                    where: { is_active: true },
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                });

                // Map to recipient format (users don't have phone in schema)
                recipients = users.map(user => ({
                    member_id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: null,
                    type: 'user'
                }));
                break;

            default:
                return NextResponse.json(
                    { success: false, message: 'Invalid audience_type' },
                    { status: 400 }
                );
        }

        // Format recipients with full name
        const formattedRecipients = recipients.map((r: any) => ({
            ...r,
            name: `${r.first_name} ${r.last_name}`,
            type: r.type || 'member'
        }));

        return NextResponse.json({
            success: true,
            recipients: formattedRecipients,
            count: formattedRecipients.length
        });

    } catch (error: any) {
        console.error('Error fetching recipients:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch recipients',
                error: error.message
            },
            { status: 500 }
        );
    }
}
