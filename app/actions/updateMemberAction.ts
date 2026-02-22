"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { saveBase64Image, deleteFile } from '@/lib/storage';
import {
    Gender,
    MaritalStatus,
    MemberStatus,
    ChurchGroup,
    LeadershipRole,
    BaptismStatus,
    SpiritualGrowth,
    MembershipType
} from '@prisma/client';

const normalizeEnum = (val: string | null | undefined): any => {
    if (!val || val === 'None' || val === 'none' || val.trim() === '') return null;
    // Replace spaces and hyphens with underscores and capitalize properly if needed
    // Most enums in this schema are PascalCase with underscores for spaces (e.g. New_believer)
    // but Prisma @map handles the mapping. However, we should try to match the enum key name.
    return val.replace(/\s+/g, '_').replace(/-/g, '_') as any;
};

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
            const newPhotoPath = await saveBase64Image(formData.photoData, 'members');
            if (newPhotoPath) {
                if (currentMember?.photo_path) await deleteFile(currentMember.photo_path);
                photoPath = newPhotoPath;
            }
        }

        // Handle birthday thumb upload if it's base64
        let birthdayThumb = formData.birthday_thumb || null;
        if (formData.birthdayThumbData && formData.birthdayThumbData.startsWith('data:')) {
            const newThumb = await saveBase64Image(formData.birthdayThumbData, 'birthday');
            if (newThumb) {
                if (currentMember?.birthday_thumb) await deleteFile(currentMember.birthday_thumb);
                birthdayThumb = newThumb;
            }
        }

        // Update member
        const member = await prisma.member.update({
            where: { member_id: memberId },
            data: {
                first_name: formData.first_name,
                last_name: formData.last_name,
                date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth) : null,
                gender: normalizeEnum(formData.gender),
                marital_status: normalizeEnum(formData.marital_status),
                occupation: formData.occupation || null,
                phone: formData.phone,
                email: formData.email,
                address: formData.address || null,
                city: formData.city || null,
                region: formData.region || null,
                gps_address: formData.gps_address || null,
                emergencyContacts: {
                    deleteMany: {},
                    create: {
                        emergency_name: formData.emergency_name || null,
                        emergency_phone: formData.emergency_phone || null,
                        emergency_relation: formData.emergency_relation || null,
                    }
                },
                status: (formData.status || 'Active') as MemberStatus,
                church_group: normalizeEnum(formData.church_group),
                leadership_role: (normalizeEnum(formData.leadership_role) || 'None') as LeadershipRole,
                baptism_status: normalizeEnum(formData.baptism_status),
                spiritual_growth: normalizeEnum(formData.spiritual_growth),
                membership_type: normalizeEnum(formData.membership_type),
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
