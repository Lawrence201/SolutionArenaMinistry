'use server';

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// ============= TYPES =============

interface AttendanceStats {
    totalMembers: number;
    membersPresent: number;
    visitorsCount: number;
    totalPresent: number;
    absentCount: number;
    malesCount: number;
    femalesCount: number;
    childrenCount: number;
    avgArrival: string;
}

interface AttendanceRecord {
    attendanceId: number;
    name: string;
    phone: string | null;
    email: string | null;
    ministry: string | null;
    position: string | null;
    photo: string | null;
    memberId: number | null;
    checkInTime: string;
    status: string;
    ministries: string | null;
}

interface VisitorRecord {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    source: string | null;
    visitorsPurpose: string | null;
    checkInTime: string;
    checkInDate: string;
}

interface AbsentMember {
    memberId: number;
    name: string;
    phone: string;
    email: string;
    ministry: string | null;
    position: string | null;
    status: string | null;
    photoPath: string | null;
    ministries: string | null;
}

// ============= STATS =============

export async function getAttendanceStats(serviceId?: string, checkInDate?: string): Promise<{ success: boolean; data?: AttendanceStats; message?: string }> {
    try {
        const date = checkInDate ? new Date(checkInDate) : new Date();
        const useServiceId = serviceId && serviceId !== '0';

        // Get total registered members
        const totalMembers = await prisma.member.count();

        // Get members present
        const membersPresent = await prisma.attendance.count({
            where: {
                member_id: { not: null },
                check_in_date: date,
                status: 'present',
                ...(useServiceId ? { service_id: serviceId } : {})
            }
        });

        // Get visitors count
        const visitorsCount = await prisma.attendance.count({
            where: {
                visitor_id: { not: null },
                check_in_date: date,
                status: 'visitor',
                ...(useServiceId ? { service_id: serviceId } : {})
            }
        });

        // Total present and absent
        const totalPresent = membersPresent + visitorsCount;
        const absentCount = totalMembers - membersPresent;

        // Get gender breakdown from members who are present
        const maleAttendance = await prisma.attendance.count({
            where: {
                check_in_date: date,
                status: 'present',
                member_id: { not: null },
                member: { gender: 'Male' },
                ...(useServiceId ? { service_id: serviceId } : {})
            }
        });

        const femaleAttendance = await prisma.attendance.count({
            where: {
                check_in_date: date,
                status: 'present',
                member_id: { not: null },
                member: { gender: 'Female' },
                ...(useServiceId ? { service_id: serviceId } : {})
            }
        });

        // Get children count (under 18)
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

        const childrenCount = await prisma.attendance.count({
            where: {
                check_in_date: date,
                status: 'present',
                member_id: { not: null },
                member: { date_of_birth: { gt: eighteenYearsAgo } },
                ...(useServiceId ? { service_id: serviceId } : {})
            }
        });

        // Calculate average arrival time
        const attendanceWithTime = await prisma.attendance.findMany({
            where: {
                check_in_date: date,
                status: { in: ['present', 'visitor'] },
                ...(useServiceId ? { service_id: serviceId } : {})
            },
            select: { check_in_time: true }
        });

        let avgArrival = 'N/A';
        if (attendanceWithTime.length > 0) {
            const totalSeconds = attendanceWithTime.reduce((sum: number, record) => {
                const time = record.check_in_time;
                if (time) {
                    const hours = time.getHours();
                    const minutes = time.getMinutes();
                    const seconds = time.getSeconds();
                    return sum + (hours * 3600 + minutes * 60 + seconds);
                }
                return sum;
            }, 0);

            const avgSeconds = Math.round(totalSeconds / attendanceWithTime.length);
            const avgHours = Math.floor(avgSeconds / 3600);
            const avgMinutes = Math.floor((avgSeconds % 3600) / 60);
            avgArrival = `${avgHours.toString().padStart(2, '0')}:${avgMinutes.toString().padStart(2, '0')}`;
        }

        return {
            success: true,
            data: {
                totalMembers,
                membersPresent,
                visitorsCount,
                totalPresent,
                absentCount,
                malesCount: maleAttendance,
                femalesCount: femaleAttendance,
                childrenCount,
                avgArrival
            }
        };
    } catch (error) {
        console.error('Error fetching attendance stats:', error);
        return { success: false, message: 'Failed to fetch attendance stats' };
    }
}

// ============= ATTENDANCE RECORDS =============

export async function getAttendanceRecords(serviceId?: string, checkInDate?: string): Promise<{ success: boolean; data?: AttendanceRecord[]; message?: string }> {
    try {
        const date = checkInDate ? new Date(checkInDate) : new Date();
        const useServiceId = serviceId && serviceId !== '0';

        const attendance = await prisma.attendance.findMany({
            where: {
                check_in_date: date,
                status: { in: ['present', 'visitor'] },
                ...(useServiceId ? { service_id: serviceId } : {})
            },
            include: {
                member: {
                    include: {
                        memberMinistries: {
                            include: { ministry: true }
                        }
                    }
                },
                visitor: true
            },
            orderBy: { check_in_time: 'desc' }
        });

        const records: AttendanceRecord[] = attendance.map(record => {
            const isMember = record.member_id !== null;
            const member = record.member;
            const visitor = record.visitor;

            // Get ministries for members
            let ministries = 'None';
            if (member?.memberMinistries && member.memberMinistries.length > 0) {
                ministries = member.memberMinistries.map((mm: { ministry: { ministry_name: string } }) => mm.ministry.ministry_name).join(', ');
            } else if (!isMember) {
                ministries = 'Visitor';
            }

            return {
                attendanceId: record.attendance_id,
                name: isMember ? `${member?.first_name} ${member?.last_name}` : (visitor?.name || 'Unknown'),
                phone: isMember ? member?.phone || null : visitor?.phone || null,
                email: isMember ? member?.email || null : visitor?.email || null,
                ministry: isMember ? member?.church_group || null : 'Visitor',
                position: isMember ? (member?.leadership_role || 'Member') : 'Visitor',
                photo: isMember ? member?.photo_path || null : null,
                memberId: record.member_id,
                checkInTime: record.check_in_time ? record.check_in_time.toTimeString().slice(0, 8) : '',
                status: record.status,
                ministries
            };
        });

        return { success: true, data: records };
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        return { success: false, message: 'Failed to fetch attendance records' };
    }
}

// ============= VISITORS =============

export async function getVisitors(serviceId?: string, checkInDate?: string): Promise<{ success: boolean; data?: VisitorRecord[]; message?: string }> {
    try {
        const date = checkInDate ? new Date(checkInDate) : new Date();
        const useServiceId = serviceId && serviceId !== '0';

        const attendance = await prisma.attendance.findMany({
            where: {
                check_in_date: date,
                status: 'visitor',
                visitor_id: { not: null },
                ...(useServiceId ? { service_id: serviceId } : {})
            },
            include: { visitor: true },
            orderBy: { check_in_time: 'desc' }
        });

        const visitors: VisitorRecord[] = attendance.map(record => ({
            id: record.visitor?.visitor_id || 0,
            name: record.visitor?.name || 'Unknown',
            phone: record.visitor?.phone || '',
            email: record.visitor?.email || null,
            source: record.visitor?.source || null,
            visitorsPurpose: record.visitor?.visitors_purpose || null,
            checkInTime: record.check_in_time ? record.check_in_time.toTimeString().slice(0, 8) : '',
            checkInDate: record.check_in_date.toISOString().split('T')[0]
        }));

        return { success: true, data: visitors };
    } catch (error) {
        console.error('Error fetching visitors:', error);
        return { success: false, message: 'Failed to fetch visitors' };
    }
}

// ============= ABSENT MEMBERS =============

export async function getAbsentMembers(serviceId?: string, checkInDate?: string): Promise<{ success: boolean; data?: AbsentMember[]; message?: string }> {
    try {
        const date = checkInDate ? new Date(checkInDate) : new Date();
        const useServiceId = serviceId && serviceId !== '0';

        // Get all member IDs who checked in
        const checkedInRecords = await prisma.attendance.findMany({
            where: {
                check_in_date: date,
                status: 'present',
                member_id: { not: null },
                ...(useServiceId ? { service_id: serviceId } : {})
            },
            select: { member_id: true }
        });

        const checkedInMemberIds = checkedInRecords.map(r => r.member_id).filter(Boolean) as number[];

        // Get all members NOT in checked-in list
        const absentMembers = await prisma.member.findMany({
            where: {
                member_id: { notIn: checkedInMemberIds.length > 0 ? checkedInMemberIds : [-1] }
            },
            include: {
                memberMinistries: {
                    include: { ministry: true }
                }
            },
            orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }]
        });

        const result: AbsentMember[] = absentMembers.map(member => ({
            memberId: member.member_id,
            name: `${member.first_name} ${member.last_name}`,
            phone: member.phone,
            email: member.email,
            ministry: member.church_group || null,
            position: member.leadership_role || 'Member',
            status: member.status || null,
            photoPath: member.photo_path || null,
            ministries: member.memberMinistries.length > 0
                ? member.memberMinistries.map((mm: { ministry: { ministry_name: string } }) => mm.ministry.ministry_name).join(', ')
                : null
        }));

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching absent members:', error);
        return { success: false, message: 'Failed to fetch absent members' };
    }
}

// ============= DELETE ATTENDANCE =============

export async function deleteAttendance(attendanceId: number): Promise<{ success: boolean; message: string }> {
    try {
        const deleted = await prisma.attendance.delete({
            where: { attendance_id: attendanceId }
        });

        if (deleted) {
            return { success: true, message: 'Attendance record deleted successfully' };
        }
        return { success: false, message: 'Record not found or already deleted' };
    } catch (error) {
        console.error('Error deleting attendance:', error);
        return { success: false, message: 'Failed to delete attendance record' };
    }
}

// ============= MEMBER CHECK-IN (VERIFY & CHECK IN) =============

export async function verifyAndCheckInMember(
    email: string,
    phone: string,
    serviceId: string,
    checkInDate?: string
): Promise<{ success: boolean; alreadyCheckedIn?: boolean; member?: Record<string, unknown>; message: string }> {
    try {
        const date = checkInDate ? new Date(checkInDate) : new Date();

        // Validate both email and phone belong to same member
        const memberByEmail = await prisma.member.findUnique({ where: { email } });
        const memberByPhone = await prisma.member.findFirst({ where: { phone } });

        if (!memberByEmail && !memberByPhone) {
            return { success: false, message: 'Incorrect email and phone number. Please check your details and try again.' };
        }

        if (memberByEmail && !memberByPhone) {
            return { success: false, message: 'Incorrect phone number. Please enter the correct phone number registered with your account.' };
        }

        if (!memberByEmail && memberByPhone) {
            return { success: false, message: 'Incorrect email address. Please enter the correct email registered with your account.' };
        }

        if (memberByEmail?.member_id !== memberByPhone?.member_id) {
            return { success: false, message: 'Email and phone number do not match the same member account. Please check your details.' };
        }

        const member = memberByEmail!;

        if (member.status !== 'Active') {
            return { success: false, message: 'Member account is inactive. Please contact the church office.' };
        }

        // Check if already checked in
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                member_id: member.member_id,
                service_id: serviceId,
                check_in_date: date
            }
        });

        if (existingAttendance) {
            return {
                success: true,
                alreadyCheckedIn: true,
                message: `You have already checked in at ${existingAttendance.check_in_time?.toTimeString().slice(0, 8)}. See you at the service!`,
                member: {
                    name: `${member.first_name} ${member.last_name}`,
                    phone: member.phone,
                    email: member.email,
                    ministry: member.church_group,
                    position: member.leadership_role,
                    photo: member.photo_path,
                    checkInTime: existingAttendance.check_in_time?.toTimeString().slice(0, 8)
                }
            };
        }

        // Create new attendance record
        const now = new Date();
        await prisma.attendance.create({
            data: {
                member_id: member.member_id,
                service_id: serviceId,
                check_in_date: date,
                check_in_time: now,
                status: 'present'
            }
        });

        return {
            success: true,
            message: `Welcome back, ${member.first_name} ${member.last_name}! Check-in successful.`,
            member: {
                name: `${member.first_name} ${member.last_name}`,
                phone: member.phone,
                email: member.email,
                ministry: member.church_group,
                position: member.leadership_role,
                photo: member.photo_path,
                checkInTime: now.toTimeString().slice(0, 8)
            }
        };
    } catch (error) {
        console.error('Error checking in member:', error);
        return { success: false, message: 'Database error during check-in' };
    }
}

// ============= VISITOR REGISTRATION =============

export async function registerVisitor(
    name: string,
    phone: string,
    email: string | undefined,
    source: string,
    visitorsPurpose: string,
    serviceId: string,
    checkInDate?: string
): Promise<{ success: boolean; message: string; visitor?: Record<string, unknown> }> {
    try {
        const date = checkInDate ? new Date(checkInDate) : new Date();

        // Check if visitor already exists
        let visitor = await prisma.visitor.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                phone
            }
        });

        let isReturning = false;

        if (visitor) {
            // Update returning visitor
            isReturning = true;
            visitor = await prisma.visitor.update({
                where: { visitor_id: visitor.visitor_id },
                data: {
                    name,
                    email: email || visitor.email,
                    source: source as 'friend' | 'social' | 'online' | 'event' | 'other' | null || visitor.source,
                    visitors_purpose: visitorsPurpose,
                    visit_count: (visitor.visit_count || 0) + 1,
                    last_visit_date: date
                }
            });
        } else {
            // Create new visitor
            visitor = await prisma.visitor.create({
                data: {
                    name,
                    phone,
                    email: email || null,
                    source: source as 'friend' | 'social' | 'online' | 'event' | 'other' | null || null,
                    visitors_purpose: visitorsPurpose,
                    visit_count: 1,
                    last_visit_date: date
                }
            });
        }

        // Check if already checked in today
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                visitor_id: visitor.visitor_id,
                service_id: serviceId,
                check_in_date: date
            }
        });

        if (!existingAttendance) {
            // Create attendance record
            await prisma.attendance.create({
                data: {
                    visitor_id: visitor.visitor_id,
                    service_id: serviceId,
                    check_in_date: date,
                    check_in_time: new Date(),
                    status: 'visitor'
                }
            });
        }

        const message = isReturning
            ? `Welcome back, ${name}! You are checked in as a returning visitor.`
            : `Welcome to our church, ${name}! You have been successfully registered and checked in.`;

        return {
            success: true,
            message,
            visitor: {
                name,
                phone,
                email: email || null,
                checkInTime: new Date().toTimeString().slice(0, 8)
            }
        };
    } catch (error) {
        console.error('Error registering visitor:', error);
        return { success: false, message: 'Database error during visitor registration' };
    }
}

// ============= QR TOKEN GENERATION =============

export async function generateQRToken(
    serviceId: string,
    date: string,
    serviceName: string
): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
        // Expire old active tokens for this service
        await prisma.attendanceToken.updateMany({
            where: { service_id: serviceId, status: 'active' },
            data: { status: 'expired' }
        });

        // Cleanup: Delete tokens older than 90 days to keep the database clean
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        await prisma.attendanceToken.deleteMany({
            where: { created_at: { lt: ninetyDaysAgo } }
        });

        // Generate new secure token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const metadata = JSON.stringify({ sid: serviceId, date, svc: serviceName, ts: Date.now() });
        const encodedMeta = Buffer.from(metadata).toString('base64');
        const finalToken = `v1.${encodedMeta}.${rawToken}`;

        // Store in database
        await prisma.attendanceToken.create({
            data: {
                service_id: serviceId,
                token_hash: finalToken,
                status: 'active'
            }
        });

        return { success: true, token: finalToken };
    } catch (error) {
        console.error('Error generating QR token:', error);
        return { success: false, message: 'Failed to generate QR token' };
    }
}

// ============= QR TOKEN VALIDATION =============

export async function validateQRToken(token: string): Promise<{
    valid: boolean;
    serviceId?: string;
    date?: string;
    serviceName?: string;
    message?: string
}> {
    try {
        // Find token in database
        const tokenRecord = await prisma.attendanceToken.findFirst({
            where: { token_hash: token }
        });

        if (!tokenRecord) {
            return { valid: false, message: 'Invalid or unknown QR code.' };
        }

        if (tokenRecord.status !== 'active') {
            return { valid: false, message: 'This QR code has expired. A new one has been generated.' };
        }

        // Check if token is older than 24 hours
        const createdAt = new Date(tokenRecord.created_at).getTime();
        const now = Date.now();
        if (now - createdAt > 86400000) {
            // Auto-expire old token
            await prisma.attendanceToken.update({
                where: { id: tokenRecord.id },
                data: { status: 'expired' }
            });
            return { valid: false, message: 'This QR code expired 24 hours after generation.' };
        }

        // Parse metadata from token
        const parts = token.split('.');
        if (parts.length >= 2) {
            try {
                const meta = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                return {
                    valid: true,
                    serviceId: meta.sid,
                    date: meta.date,
                    serviceName: meta.svc
                };
            } catch {
                // Fallback if metadata parse fails
            }
        }

        return {
            valid: true,
            serviceId: tokenRecord.service_id,
            date: new Date().toISOString().split('T')[0],
            serviceName: 'Unknown Service'
        };
    } catch (error) {
        console.error('Error validating QR token:', error);
        return { valid: false, message: 'Database error during validation.' };
    }
}

// ============= GET SERVICES (for dropdown) =============

export async function getServices(): Promise<{ success: boolean; data?: { id: string; name: string }[] }> {
    // Hardcoded services - can be replaced with database query if you have a services table
    const services = [
        { id: 'sunday-1st-service', name: 'Sunday 1st Service' },
        { id: 'sunday-2nd-service', name: 'Sunday 2nd Service' },
        { id: 'midweek-service', name: 'Midweek Service' },
        { id: 'friday-prayer', name: 'Friday Prayer Meeting' },
        { id: 'special-service', name: 'Special Service' },
        { id: 'others', name: 'Others' }
    ];

    return { success: true, data: services };
}

// ============= ADVANCED EXPORT DATA =============

export async function getAdvancedAttendanceData(
    startDate: string,
    endDate: string,
    serviceId?: string
): Promise<{
    success: boolean;
    data?: {
        summary: {
            totalSessions: number;
            totalCheckIns: number;
            uniqueMembers: number;
            uniqueVisitors: number;
        };
        memberAttendance: {
            memberId: number;
            name: string;
            ministry: string;
            count: number;
            percentage: number;
        }[];
        dailyBreakdown: {
            date: string;
            members: number;
            visitors: number;
            total: number;
        }[];
        visitorLogs: {
            name: string;
            phone: string;
            email: string | null;
            source: string | null;
            purpose: string | null;
            count: number;
            lastVisit: string;
        }[];
        rawLogs: {
            name: string;
            phone: string | null;
            email: string | null;
            type: 'Member' | 'Visitor';
            date: string;
            time: string;
            service: string;
        }[];
        ministryBreakdown: { name: string; count: number }[];
        genderBreakdown: { name: string; count: number }[];
    };
    message?: string;
}> {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const useServiceId = serviceId && serviceId !== '0' && serviceId !== 'all';

        // 1. Fetch all attendance records in range
        const attendance = await prisma.attendance.findMany({
            where: {
                check_in_date: {
                    gte: start,
                    lte: end
                },
                ...(useServiceId ? { service_id: serviceId } : {})
            },
            include: {
                member: true,
                visitor: true
            },
            orderBy: { check_in_date: 'desc' }
        });

        // 2. Aggregate Summary
        const uniqueDates = new Set(attendance.map(a => a.check_in_date.toISOString().split('T')[0]));
        const uniqueMemberIds = new Set(attendance.map(a => a.member_id).filter(Boolean));
        const uniqueVisitorIds = new Set(attendance.map(a => a.visitor_id).filter(Boolean));

        // 3. Member Attendance Counts
        const memberCounts: Record<number, { name: string; ministry: string; count: number }> = {};
        attendance.forEach(a => {
            if (a.member_id && a.member) {
                if (!memberCounts[a.member_id]) {
                    memberCounts[a.member_id] = {
                        name: `${a.member.first_name} ${a.member.last_name}`,
                        ministry: a.member.church_group || 'General',
                        count: 0
                    };
                }
                memberCounts[a.member_id].count++;
            }
        });

        const totalSessions = uniqueDates.size || 1;
        const memberAttendance = Object.entries(memberCounts).map(([id, info]) => ({
            memberId: parseInt(id),
            ...info,
            percentage: Math.round((info.count / totalSessions) * 100)
        })).sort((a, b) => b.count - a.count);

        // 4. Daily Breakdown
        const dailyMap: Record<string, { members: number; visitors: number }> = {};
        attendance.forEach(a => {
            const d = a.check_in_date.toISOString().split('T')[0];
            if (!dailyMap[d]) dailyMap[d] = { members: 0, visitors: 0 };
            if (a.member_id) dailyMap[d].members++;
            else if (a.visitor_id) dailyMap[d].visitors++;
        });

        const dailyBreakdown = Object.entries(dailyMap).map(([date, counts]) => ({
            date,
            ...counts,
            total: counts.members + counts.visitors
        })).sort((a, b) => b.date.localeCompare(a.date));

        // 5. Visitor Logs (Aggregated)
        const visitorMap: Record<number, { name: string; phone: string; email: string | null; source: string | null; purpose: string | null; count: number; lastVisit: string }> = {};
        attendance.forEach(a => {
            if (a.visitor_id && a.visitor) {
                if (!visitorMap[a.visitor_id]) {
                    visitorMap[a.visitor_id] = {
                        name: a.visitor.name,
                        phone: a.visitor.phone,
                        email: a.visitor.email,
                        source: a.visitor.source,
                        purpose: a.visitor.visitors_purpose,
                        count: 0,
                        lastVisit: a.check_in_date.toISOString().split('T')[0]
                    };
                }
                visitorMap[a.visitor_id].count++;
                const visitDate = a.check_in_date.toISOString().split('T')[0];
                if (visitDate > visitorMap[a.visitor_id].lastVisit) {
                    visitorMap[a.visitor_id].lastVisit = visitDate;
                }
            }
        });

        const visitorLogs = Object.values(visitorMap).sort((a, b) => b.count - a.count);

        // 6. Raw Logs
        const rawLogs = attendance.map(a => ({
            name: a.member_id ? `${a.member?.first_name} ${a.member?.last_name}` : (a.visitor?.name || 'Unknown'),
            phone: a.member_id ? a.member?.phone || null : a.visitor?.phone || null,
            email: a.member_id ? a.member?.email || null : a.visitor?.email || null,
            type: (a.member_id ? 'Member' : 'Visitor') as 'Member' | 'Visitor',
            date: a.check_in_date.toISOString().split('T')[0],
            time: a.check_in_time ? a.check_in_time.toTimeString().slice(0, 8) : '',
            service: a.service_id.replace(/-/g, ' ').toUpperCase()
        }));

        // 7. Ministry Breakdown
        const ministryMap: Record<string, number> = {};
        attendance.forEach(a => {
            const m = a.member?.church_group || (a.member_id ? 'General' : 'Visitor');
            ministryMap[m] = (ministryMap[m] || 0) + 1;
        });
        const ministryBreakdown = Object.entries(ministryMap).map(([name, count]) => ({ name, count }));

        // 8. Gender Breakdown
        const genderMap: Record<string, number> = { Male: 0, Female: 0, Unknown: 0 };
        attendance.forEach(a => {
            if (a.member) {
                const g = a.member.gender || 'Unknown';
                genderMap[g]++;
            } else if (a.visitor) {
                genderMap['Unknown']++;
            }
        });
        const genderBreakdown = Object.entries(genderMap).map(([name, count]) => ({ name, count }));

        return {
            success: true,
            data: {
                summary: {
                    totalSessions: uniqueDates.size,
                    totalCheckIns: attendance.length,
                    uniqueMembers: uniqueMemberIds.size,
                    uniqueVisitors: uniqueVisitorIds.size
                },
                memberAttendance,
                dailyBreakdown,
                visitorLogs,
                rawLogs,
                ministryBreakdown,
                genderBreakdown
            }
        };

    } catch (error) {
        console.error('Error in getAdvancedAttendanceData:', error);
        return { success: false, message: 'Failed to fetch advanced data' };
    }
}
// ============= SYNC STATUS (Lightweight) =============

export async function getAttendanceSyncStatus(
    serviceId?: string,
    checkInDate?: string
): Promise<{ success: boolean; lastCount: number; lastTimestamp: string | null }> {
    try {
        const date = checkInDate ? new Date(checkInDate) : new Date();
        const useServiceId = serviceId && serviceId !== '0';

        // Get the total count and the latest check-in time for this service/date
        const latestRecord = await prisma.attendance.findFirst({
            where: {
                check_in_date: date,
                ...(useServiceId ? { service_id: serviceId } : {})
            },
            orderBy: { check_in_time: 'desc' },
            select: { check_in_time: true }
        });

        const count = await prisma.attendance.count({
            where: {
                check_in_date: date,
                ...(useServiceId ? { service_id: serviceId } : {})
            }
        });

        return {
            success: true,
            lastCount: count,
            lastTimestamp: latestRecord?.check_in_time ? latestRecord.check_in_time.toISOString() : null
        };
    } catch (error) {
        console.error('Error fetching sync status:', error);
        return { success: false, lastCount: 0, lastTimestamp: null };
    }
}
// ============= GET ACTIVE QR TOKEN =============

export async function getActiveQRToken(serviceId: string): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
        const tokenRecord = await prisma.attendanceToken.findFirst({
            where: {
                service_id: serviceId,
                status: 'active'
            },
            orderBy: { created_at: 'desc' }
        });

        if (tokenRecord) {
            // Check if expired (24h)
            const createdAt = new Date(tokenRecord.created_at).getTime();
            const now = Date.now();
            if (now - createdAt > 86400000) {
                await prisma.attendanceToken.update({
                    where: { id: tokenRecord.id },
                    data: { status: 'expired' }
                });
                return { success: false, message: 'Token expired' };
            }
            return { success: true, token: tokenRecord.token_hash };
        }

        return { success: false, message: 'No active token found' };
    } catch (error) {
        console.error('Error fetching active QR token:', error);
        return { success: false, message: 'Database error' };
    }
}
