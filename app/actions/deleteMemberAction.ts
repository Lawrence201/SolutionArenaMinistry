'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { unlink } from 'fs/promises';
import { join } from 'path';

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

        // 3. Delete files from filesystem
        const errors: string[] = [];

        if (member.photo_path && member.photo_path.startsWith('/uploads/')) {
            try {
                const absolutePath = join(process.cwd(), 'public', member.photo_path);
                await unlink(absolutePath);
            } catch (err) {
                console.error(`Failed to delete photo: ${member.photo_path}`, err);
                errors.push(`Failed to delete photo file`);
            }
        }

        if (member.birthday_thumb && member.birthday_thumb.startsWith('/uploads/')) {
            try {
                const absolutePath = join(process.cwd(), 'public', member.birthday_thumb);
                await unlink(absolutePath);
            } catch (err) {
                console.error(`Failed to delete birthday thumb: ${member.birthday_thumb}`, err);
                errors.push(`Failed to delete birthday flyer`);
            }
        }

        // 4. Revalidate path
        revalidatePath('/admin/members');
        revalidatePath('/admin/dashboard');

        return {
            success: true,
            message: 'Member and associated data deleted successfully',
            warnings: errors.length > 0 ? errors : undefined
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
