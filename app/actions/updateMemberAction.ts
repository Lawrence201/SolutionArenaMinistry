'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

export async function updateMember(memberId: number, formData: any) {
    try {
        // Fetch current member data to check for file cleanup
        const currentMember = await prisma.member.findUnique({
            where: { member_id: memberId },
            select: { photo_path: true, birthday_thumb: true }
        });

        // Handle photo upload if it's base64
        let photoPath = formData.photo_path || null;
        if (formData.photoData && formData.photoData.startsWith('data:')) {
            photoPath = await saveBase64Image(formData.photoData, 'members');
        }

        // Handle birthday thumb upload if it's base64
        let birthdayThumb = formData.birthday_thumb || null;
        if (formData.birthdayThumbData && formData.birthdayThumbData.startsWith('data:')) {
            birthdayThumb = await saveBase64Image(formData.birthdayThumbData, 'birthday');
        }

        // Determine files to delete (cleaning)
        const filesToDelete: string[] = [];
        if (currentMember?.photo_path && photoPath !== currentMember.photo_path && currentMember.photo_path.startsWith('/uploads/')) {
            filesToDelete.push(join(process.cwd(), 'public', currentMember.photo_path));
        }
        if (currentMember?.birthday_thumb && birthdayThumb !== currentMember.birthday_thumb && currentMember.birthday_thumb.startsWith('/uploads/')) {
            filesToDelete.push(join(process.cwd(), 'public', currentMember.birthday_thumb));
        }

        // Update member
        const member = await prisma.member.update({
            where: { member_id: memberId },
            data: {
                first_name: formData.first_name,
                last_name: formData.last_name,
                date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth) : null,
                gender: formData.gender || null,
                marital_status: formData.marital_status || null,
                occupation: formData.occupation || null,
                phone: formData.phone,
                email: formData.email,
                address: formData.address || null,
                city: formData.city || null,
                region: formData.region || null,
                emergencyContacts: {
                    deleteMany: {},
                    create: {
                        emergency_name: formData.emergency_name || null,
                        emergency_phone: formData.emergency_phone || null,
                        emergency_relation: formData.emergency_relation || null,
                    }
                },
                status: formData.status || 'Active',
                church_group: formData.church_group || null,
                leadership_role: formData.leadership_role || 'None',
                baptism_status: formData.baptism_status || null,
                spiritual_growth: formData.spiritual_growth || null,
                membership_type: formData.membership_type || null,
                notes: formData.notes || null,
                photo_path: photoPath,
                birthday_thumb: birthdayThumb,
                birthday_title: formData.birthday_title || null,
                birthday_message: formData.birthday_message || null,
            },
        });

        // Handle departments (many-to-many)
        if (formData.departments) {
            // Delete existing department associations
            await prisma.memberDepartment.deleteMany({
                where: { member_id: memberId }
            });

            // Parse and add new departments
            const deptNames = formData.departments.split(',').map((d: string) => d.trim()).filter((d: string) => d && d !== 'none');
            if (deptNames.length > 0) {
                // Get department IDs from names - Use fuzzy match or strict enum? 
                // Since component sends valid enum strings now, strict match is fine.
                // However, 'None' is in enum, but might not be desired in DB if it means "no department".
                // But let's assume if user selected it, it's fine.
                const validDeptNames = deptNames.filter((d: string) => d !== 'None'); // Filter out 'None' if it's just a placeholder? 
                // Actually, if 'None' is a valid enum, we leave it. But I suspect 'None' shouldn't be stored in memberDepartment.
                // Let's filter 'None' out just in case.

                const departments = await prisma.department.findMany({
                    where: {
                        department_name: {
                            in: deptNames // Prisma will error if invalid enum value passed
                        }
                    }
                });

                if (departments.length > 0) {
                    await prisma.memberDepartment.createMany({
                        data: departments.map(dept => ({
                            member_id: memberId,
                            department_id: dept.department_id
                        }))
                    });
                }
            }
        }

        // Handle ministries (many-to-many)
        if (formData.ministries) {
            // Delete existing ministry associations
            await prisma.memberMinistry.deleteMany({
                where: { member_id: memberId }
            });

            // Parse and add new ministries
            const ministryNames = formData.ministries.split(',').map((m: string) => m.trim()).filter((m: string) => m);
            if (ministryNames.length > 0) {
                // Get ministry IDs from names
                const ministries = await prisma.ministry.findMany({
                    where: {
                        ministry_name: {
                            in: ministryNames
                        }
                    }
                });

                if (ministries.length > 0) {
                    await prisma.memberMinistry.createMany({
                        data: ministries.map(min => ({
                            member_id: memberId,
                            ministry_id: min.ministry_id
                        }))
                    });
                }
            }
        }

        // Process file deletion only after successful update
        for (const file of filesToDelete) {
            try {
                await unlink(file);
            } catch (err) {
                console.error(`Failed to delete old file ${file}:`, err);
                // Continue even if delete fails
            }
        }

        revalidatePath('/admin/members');
        return { success: true, message: 'Member updated successfully', member };
    } catch (error: any) {
        console.error('Error updating member:', error);
        return {
            success: false,
            error: error.message || 'Failed to update member'
        };
    }
}

async function saveBase64Image(base64Data: string, folder: string): Promise<string> {
    try {
        // Extract base64 data and determine file extension
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) throw new Error('Invalid base64 image data');

        const ext = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');

        // Generate unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
        await mkdir(uploadDir, { recursive: true });

        // Write file
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return relative path for database
        return `/uploads/${folder}/${filename}`;
    } catch (error) {
        console.error('Error saving base64 image:', error);
        throw error;
    }
}
