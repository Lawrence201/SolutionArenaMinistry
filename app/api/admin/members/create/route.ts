import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveFile } from '@/lib/storage';

// Validation helpers
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
    return /^[\d\s\-\+]{7,20}$/.test(phone);
}

// Map string values to Prisma enums
function mapChurchGroup(value: string): 'Dunamis' | 'Kabod' | 'Judah' | 'Karis' | null {
    if (!value) return null;
    const map: Record<string, 'Dunamis' | 'Kabod' | 'Judah' | 'Karis'> = {
        'dunamis': 'Dunamis',
        'kabod': 'Kabod',
        'judah': 'Judah',
        'karis': 'Karis',
    };
    return map[value.toLowerCase()] || null;
}

function mapGender(value: string): 'Male' | 'Female' | null {
    if (value === 'Male') return 'Male';
    if (value === 'Female') return 'Female';
    return null;
}

function mapMaritalStatus(value: string): 'Single' | 'Married' | 'Divorced' | 'Widowed' | null {
    const validValues = ['Single', 'Married', 'Divorced', 'Widowed'];
    return validValues.includes(value) ? value as 'Single' | 'Married' | 'Divorced' | 'Widowed' : null;
}

function mapMemberStatus(value: string): 'Active' | 'Inactive' {
    return value === 'inactive' ? 'Inactive' : 'Active';
}

function mapLeadershipRole(value: string): 'None' | 'Pastor' | 'Minister' | 'Group_leader' | null {
    const map: Record<string, 'None' | 'Pastor' | 'Minister' | 'Group_leader'> = {
        'none': 'None',
        'pastor': 'Pastor',
        'minister': 'Minister',
        'group leader': 'Group_leader',
    };
    return map[value.toLowerCase()] || null;
}

function mapBaptismStatus(value: string): 'Baptized' | 'Not_baptized' | 'Pending' | null {
    const map: Record<string, 'Baptized' | 'Not_baptized' | 'Pending'> = {
        'baptized': 'Baptized',
        'not baptized': 'Not_baptized',
        'pending': 'Pending',
    };
    return map[value.toLowerCase()] || null;
}

function mapSpiritualGrowth(value: string): 'New_believer' | 'Growing' | 'Committed' | 'Leader' | null {
    const map: Record<string, 'New_believer' | 'Growing' | 'Committed' | 'Leader'> = {
        'new believer': 'New_believer',
        'growing': 'Growing',
        'committed': 'Committed',
        'leader': 'Leader',
    };
    return map[value.toLowerCase()] || null;
}

function mapMembershipType(value: string): 'Full_Member' | 'Associate_Member' | 'Visitor' | null {
    const map: Record<string, 'Full_Member' | 'Associate_Member' | 'Visitor'> = {
        'full member': 'Full_Member',
        'associate member': 'Associate_Member',
        'visitor': 'Visitor',
    };
    return map[value.toLowerCase()] || null;
}

function mapDepartmentName(value: string): 'None' | 'Usher' | 'Choir' | 'Media' | 'Instrumentalist' | null {
    const validValues = ['None', 'Usher', 'Choir', 'Media', 'Instrumentalist'];
    return validValues.includes(value) ? value as 'None' | 'Usher' | 'Choir' | 'Media' | 'Instrumentalist' : null;
}

function mapMinistryName(value: string): 'Children' | 'Women' | 'Men' | 'Youth' | null {
    // Current frontend values match database enums now, but handle both for safety
    const map: Record<string, 'Children' | 'Women' | 'Men' | 'Youth'> = {
        'children-ministry': 'Children',
        'women-ministry': 'Women',
        'men-ministry': 'Men',
        'youth-ministry': 'Youth',
        'children': 'Children',
        'women': 'Women',
        'men': 'Men',
        'youth': 'Youth',
    };
    return map[value.toLowerCase()] || null;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Extract form fields
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const dateOfBirth = formData.get('dateOfBirth') as string;
        const gender = formData.get('gender') as string;
        const maritalStatus = formData.get('maritalStatus') as string;
        const occupation = formData.get('occupation') as string;
        const phone = formData.get('phone') as string;
        const email = formData.get('email') as string;
        const address = formData.get('address') as string;
        const city = formData.get('city') as string;
        const region = formData.get('region') as string;
        const status = formData.get('status') as string;
        const selectedMinistry = formData.get('selectedMinistry') as string;
        const leadership = formData.get('leadership') as string;
        const baptismStatus = formData.get('baptismStatus') as string;
        const spiritualGrowth = formData.get('spiritualGrowth') as string;
        const membershipType = formData.get('membershipType') as string;
        const birthdayTitle = formData.get('birthdayTitle') as string;
        const birthdayMessage = formData.get('birthdayMessage') as string;
        const notes = formData.get('notes') as string;

        // Emergency contact
        const emergencyName = formData.get('emergencyName') as string;
        const emergencyPhone = formData.get('emergencyPhone') as string;
        const emergencyRelation = formData.get('emergencyRelation') as string;

        // Welcome actions
        const sendWelcomeEmail = formData.get('sendWelcomeEmail') === '1';
        const notifyPastor = formData.get('notifyPastor') === '1';
        const createAccount = formData.get('createAccount') === '1';

        // Arrays
        const departments = formData.getAll('departments[]') as string[];
        const ministries = formData.getAll('ministries[]') as string[];

        // Files
        const photoFile = formData.get('photoInput') as File | null;
        const birthdayThumbFile = formData.get('birthdayThumb') as File | null;

        // Validation
        if (!firstName || !firstName.trim()) {
            return NextResponse.json({ success: false, message: 'First name is required' }, { status: 400 });
        }

        if (!lastName || !lastName.trim()) {
            return NextResponse.json({ success: false, message: 'Last name is required' }, { status: 400 });
        }

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 });
        }

        if (!phone || !isValidPhone(phone)) {
            return NextResponse.json({ success: false, message: 'Valid phone number is required' }, { status: 400 });
        }

        const churchGroup = mapChurchGroup(selectedMinistry);
        if (!churchGroup) {
            return NextResponse.json({ success: false, message: 'Valid church group is required' }, { status: 400 });
        }

        // Check for existing email
        const existingMember = await prisma.member.findFirst({
            where: { email: email.toLowerCase().trim() }
        });

        if (existingMember) {
            return NextResponse.json({ success: false, message: 'A member with this email already exists' }, { status: 400 });
        }

        // Handle file uploads
        const photoPath = await saveFile(photoFile, 'members');
        const birthdayThumbPath = await saveFile(birthdayThumbFile, 'members');

        // Create member with transaction
        const result = await prisma.$transaction(async (tx: any) => {
            // Create member with proper enum types
            const member = await tx.member.create({
                data: {
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    email: email.toLowerCase().trim(),
                    phone: phone.trim(),
                    date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null,
                    gender: mapGender(gender),
                    marital_status: mapMaritalStatus(maritalStatus),
                    occupation: occupation || null,
                    address: address || null,
                    city: city || null,
                    region: region || null,
                    status: mapMemberStatus(status),
                    church_group: churchGroup,
                    leadership_role: mapLeadershipRole(leadership) || 'None',
                    baptism_status: mapBaptismStatus(baptismStatus),
                    spiritual_growth: mapSpiritualGrowth(spiritualGrowth),
                    membership_type: mapMembershipType(membershipType),
                    photo_path: photoPath,
                    birthday_thumb: birthdayThumbPath,
                    birthday_title: birthdayTitle || null,
                    birthday_message: birthdayMessage || null,
                    notes: notes || null,
                }
            });

            // Create emergency contact if provided
            if (emergencyName && emergencyName.trim()) {
                await tx.emergencyContact.create({
                    data: {
                        member_id: member.member_id,
                        emergency_name: emergencyName.trim(),
                        emergency_phone: emergencyPhone || null,
                        emergency_relation: emergencyRelation || null,
                    }
                });
            }

            // Link departments
            if (departments.length > 0 && !departments.includes('None')) {
                for (const deptName of departments) {
                    const mappedDept = mapDepartmentName(deptName);
                    if (mappedDept && mappedDept !== 'None') {
                        const dept = await tx.department.findFirst({
                            where: { department_name: mappedDept }
                        });
                        if (dept) {
                            await tx.memberDepartment.create({
                                data: {
                                    member_id: member.member_id,
                                    department_id: dept.department_id
                                }
                            });
                        }
                    }
                }
            }

            // Link ministries
            if (ministries.length > 0) {
                for (const ministryId of ministries) {
                    const ministryName = mapMinistryName(ministryId);
                    if (ministryName) {
                        const ministry = await tx.ministry.findFirst({
                            where: { ministry_name: ministryName }
                        });
                        if (ministry) {
                            await tx.memberMinistry.create({
                                data: {
                                    member_id: member.member_id,
                                    ministry_id: ministry.ministry_id
                                }
                            });
                        }
                    }
                }
            }

            // Create welcome actions record
            await tx.welcomeAction.create({
                data: {
                    member_id: member.member_id,
                    send_welcome_email: sendWelcomeEmail,
                    notify_pastor: notifyPastor,
                    create_account: createAccount,
                }
            });

            // Log activity
            await tx.activityLog.create({
                data: {
                    activity_type: 'member_added',
                    title: 'New Member Registered',
                    description: `${firstName} ${lastName} has been registered as a new member.`,
                    icon_type: 'user-plus',
                }
            });

            return member;
        });

        return NextResponse.json({
            success: true,
            message: 'Member created successfully',
            memberId: result.member_id,
            photoPath: photoPath,
            birthdayThumbPath: birthdayThumbPath,
            redirect: '/admin/add-member/success'
        });

    } catch (error: unknown) {
        console.error('Create member error:', error);

        let errorMessage = 'Failed to create member. Please try again.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as { code: string; message: string };
            if (prismaError.code === 'P2002') {
                errorMessage = 'A member with this email already exists.';
            }
        }

        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
}
