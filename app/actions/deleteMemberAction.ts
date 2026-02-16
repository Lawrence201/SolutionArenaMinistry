"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { deleteFile } from '@/lib/storage';

export async function deleteMember(memberId: number) {
    try {
        // 1. Fetch member to get file paths before deletion
        const member = await prisma.member.findUnique({
            where: { member_id: memberId },
            select: { photo_path: true, birthday_thumb: true }
        });

        if (!member) {
            return { success: false, error: 'Member not found' };
        }

        // 2. Delete from database (Cascade should handle related tables like Ministries, Depts, Contacts)
        await prisma.member.delete({
            where: { member_id: memberId },
        });

        // 3. Delete files using the storage abstraction
        await Promise.all([
            deleteFile(member.photo_path),
            deleteFile(member.birthday_thumb)
        ]);

        // 4. Revalidate path
        revalidatePath('/admin/members');
        revalidatePath('/admin/dashboard');

        return {
            success: true,
            message: 'Member and associated data deleted successfully'
        };

    } catch (error: any) {
        console.error('Error deleting member:', error);

        // Handle Foreign Key constraint errors specifically if meaningful
        if (error.code === 'P2003') {
            return { success: false, error: 'Cannot delete member because of related financial or other records that do not cascade delete.' };
        }

        return { success: false, error: error.message || 'Failed to delete member' };
    }
}
