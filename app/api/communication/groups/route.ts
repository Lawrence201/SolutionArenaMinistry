import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/communication/groups
 * Fetch all custom message groups
 */
export async function GET(req: NextRequest) {
    try {
        const groups = await prisma.messageGroup.findMany({
            include: {
                members: {
                    include: {
                        member: {
                            select: {
                                member_id: true,
                                first_name: true,
                                last_name: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Format groups with member count
        const formattedGroups = groups.map(group => ({
            ...group,
            member_count: group.members.length,
            members: group.members.map(m => m.member)
        }));

        return NextResponse.json({
            success: true,
            groups: formattedGroups
        });

    } catch (error: any) {
        console.error('Error fetching groups:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/communication/groups
 * Create a new message group
 * Body params:
 * - group_name: Name of the group
 * - description: Optional description
 * - group_type: 'static' | 'dynamic'
 * - member_ids: Array of member IDs to add
 */
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        if (!data.group_name) {
            return NextResponse.json(
                { success: false, error: 'group_name required' },
                { status: 400 }
            );
        }

        const group = await prisma.messageGroup.create({
            data: {
                group_name: data.group_name,
                description: data.description,
                group_type: data.group_type || 'static'
            }
        });

        // Add members if provided
        if (data.member_ids && Array.isArray(data.member_ids)) {
            for (const memberId of data.member_ids) {
                await prisma.messageGroupMember.create({
                    data: {
                        group_id: group.group_id,
                        member_id: memberId
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            group_id: group.group_id,
            message: 'Group created successfully'
        });

    } catch (error: any) {
        console.error('Error creating group:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/communication/groups
 * Delete a message group
 * Query params:
 * - group_id: ID of the group to delete
 */
export async function DELETE(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const groupId = searchParams.get('group_id');

        if (!groupId) {
            return NextResponse.json(
                { success: false, error: 'group_id required' },
                { status: 400 }
            );
        }

        await prisma.messageGroup.delete({
            where: { group_id: parseInt(groupId) }
        });

        return NextResponse.json({
            success: true,
            message: 'Group deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting group:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
