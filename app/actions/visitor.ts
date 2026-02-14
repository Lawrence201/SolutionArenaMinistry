'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { VisitorSource, FollowUpStatus, Prisma } from '@prisma/client';

// Define return type for actions
type ActionResponse = {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
};

export async function createVisitor(data: {
    name: string;
    phone: string;
    email?: string;
    source?: VisitorSource;
    visitors_purpose?: string;
    assigned_to?: string; // This is a string in schema, but we might want to link it to member eventually
}): Promise<ActionResponse> {
    try {
        const newVisitor = await prisma.visitor.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                source: data.source,
                visitors_purpose: data.visitors_purpose,
                assigned_to: data.assigned_to,
                visit_count: 1,
                last_visit_date: new Date(),
                follow_up_status: 'pending',
            },
        });

        revalidatePath('/admin/visitors');
        return { success: true, message: 'Visitor added successfully', data: newVisitor };
    } catch (error) {
        console.error('Error creating visitor:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, message: 'A visitor with this phone number already exists.' };
            }
        }
        return { success: false, message: 'Failed to create visitor' };
    }
}

export async function updateVisitor(id: number, data: {
    name?: string;
    phone?: string;
    email?: string;
    source?: VisitorSource;
    follow_up_status?: FollowUpStatus;
    follow_up_date?: Date;
    follow_up_notes?: string;
}): Promise<ActionResponse> {
    try {
        const updatedVisitor = await prisma.visitor.update({
            where: { visitor_id: id },
            data: data,
        });

        revalidatePath('/admin/visitors');
        return { success: true, message: 'Visitor updated successfully', data: updatedVisitor };
    } catch (error) {
        console.error('Error updating visitor:', error);
        return { success: false, message: 'Failed to update visitor' };
    }
}

export async function assignVisitor(id: number, memberName: string, notes?: string): Promise<ActionResponse> {
    try {
        const timestamp = new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const assignmentLog = `\n[${timestamp}] Assigned to: ${memberName}${notes ? ` - ${notes}` : ''}`;

        const currentVisitor = await prisma.visitor.findUnique({
            where: { visitor_id: id },
            select: { follow_up_notes: true }
        });

        const updatedVisitor = await prisma.visitor.update({
            where: { visitor_id: id },
            data: {
                assigned_to: memberName,
                follow_up_notes: (currentVisitor?.follow_up_notes || '') + assignmentLog,
                updated_at: new Date()
            }
        });

        revalidatePath('/admin/visitors');
        return { success: true, message: 'Visitor assigned successfully', data: updatedVisitor };
    } catch (error) {
        console.error('Error assigning visitor:', error);
        return { success: false, message: 'Failed to assign visitor' };
    }
}

export async function updateFollowup(id: number, data: {
    status: FollowUpStatus;
    notes: string;
    contactMethod?: string;
    outcome?: string;
    nextDate?: Date;
    createdBy?: string;
}): Promise<ActionResponse> {
    try {
        // Use a transaction to ensure both visitor update and followup history are recorded
        // mirroring update_followup.php transaction logic
        const result = await prisma.$transaction(async (tx) => {
            const visitor = await tx.visitor.update({
                where: { visitor_id: id },
                data: {
                    follow_up_status: data.status,
                    follow_up_notes: data.notes,
                    follow_up_date: data.nextDate,
                    updated_at: new Date()
                }
            });

            // Log history record
            await tx.visitorFollowup.create({
                data: {
                    visitor_id: id,
                    followup_date: new Date(),
                    contact_method: data.contactMethod || 'phone',
                    notes: data.notes,
                    outcome: data.outcome || String(data.status),
                    next_followup_date: data.nextDate,
                    created_by: data.createdBy || 'System'
                }
            });

            return visitor;
        });

        revalidatePath('/admin/visitors');
        return { success: true, message: 'Follow-up updated and recorded', data: result };
    } catch (error) {
        console.error('Error updating follow-up:', error);
        return { success: false, message: 'Failed to update follow-up history' };
    }
}

export async function deleteVisitor(id: number): Promise<ActionResponse> {
    try {
        await prisma.visitor.delete({
            where: { visitor_id: id }
        });
        revalidatePath('/admin/visitors');
        return { success: true, message: 'Visitor deleted successfully' };
    } catch (error) {
        console.error('Error deleting visitor:', error);
        return { success: false, message: 'Failed to delete visitor' };
    }
}
