import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { saveBase64Image, deleteFile } from '@/lib/storage';

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
