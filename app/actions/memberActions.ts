'use server';

import { MemberStatus, LeadershipRole, Gender, ChurchGroup, BaptismStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { Member } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, startOfWeek, subWeeks, endOfWeek } from 'date-fns';
import { prisma } from '@/lib/prisma';


export type MemberStats = {
    total: number;
    active: number;
    inactive: number;
    pastors: number;
    ministers: number;
    groupLeaders: number;
    males: number;
    females: number;
    children: number;
    baptized: number;
    notBaptized: number;
    pendingBaptism: number;
    kabod: number;
    dunamis: number;
    judah: number;
    karis: number;
    birthdayThisMonth: number;
    totalEvents: number;
};

export async function getMemberStats(): Promise<MemberStats> {
    try {
        // Run group queries sequentially to minimize connection usage
        const total = await prisma.member.count();

        const statusGroups = await prisma.member.groupBy({
            by: ['status'],
            _count: true,
        });

        const roleGroups = await prisma.member.groupBy({
            by: ['leadership_role'],
            _count: true,
        });

        const genderGroups = await prisma.member.groupBy({
            by: ['gender'],
            _count: true,
        });

        const baptismGroups = await prisma.member.groupBy({
            by: ['baptism_status'],
            _count: true,
        });

        const groupGroups = await prisma.member.groupBy({
            by: ['church_group'],
            _count: true,
        });

        const totalEvents = await prisma.event.count();

        const childrenCount = await prisma.member.count({
            where: {
                memberMinistries: {
                    some: {
                        ministry: {
                            ministry_name: 'Children'
                        }
                    }
                }
            }
        });

        const today = new Date();
        // Use PostgreSQL compatible date extraction
        const birthdayRaw = await prisma.$queryRaw`
            SELECT COUNT(*) as count 
            FROM "members" 
            WHERE EXTRACT(MONTH FROM date_of_birth) = ${today.getMonth() + 1} 
            AND status = 'Active'
        ` as any[];

        const birthdayCount = Number(birthdayRaw[0]?.count || 0);

        // Helper to SAFELY get count from groups
        const getCount = (groups: any[], field: string, value: string) => {
            const group = groups.find((g: any) => g[field] === value);
            return group ? group._count : 0;
        };
        // Helper specifically for null checks if needed, but Prisma groupBy returns typed objects usually.
        // church_group can be null, handled by find.

        return {
            total,
            active: getCount(statusGroups, 'status', 'Active'),
            inactive: getCount(statusGroups, 'status', 'Inactive'),
            pastors: getCount(roleGroups, 'leadership_role', 'Pastor'),
            ministers: getCount(roleGroups, 'leadership_role', 'Minister'),
            groupLeaders: getCount(roleGroups, 'leadership_role', 'Group_leader'),
            males: getCount(genderGroups, 'gender', 'Male'),
            females: getCount(genderGroups, 'gender', 'Female'),
            children: childrenCount,
            baptized: getCount(baptismGroups, 'baptism_status', 'Baptized'),
            notBaptized: getCount(baptismGroups, 'baptism_status', 'Not_baptized'),
            pendingBaptism: getCount(baptismGroups, 'baptism_status', 'Pending'),
            kabod: getCount(groupGroups, 'church_group', 'Kabod'),
            dunamis: getCount(groupGroups, 'church_group', 'Dunamis'),
            judah: getCount(groupGroups, 'church_group', 'Judah'),
            karis: getCount(groupGroups, 'church_group', 'Karis'),
            birthdayThisMonth: birthdayCount,
            totalEvents: totalEvents,
        };
    } catch (error) {
        console.error('Error fetching member stats:', error);
        // Return zeros on error to prevent page crash
        return {
            total: 0,
            active: 0,
            inactive: 0,
            pastors: 0,
            ministers: 0,
            groupLeaders: 0,
            males: 0,
            females: 0,
            children: 0,
            baptized: 0,
            notBaptized: 0,
            pendingBaptism: 0,
            kabod: 0,
            dunamis: 0,
            judah: 0,
            karis: 0,
            birthdayThisMonth: 0,
            totalEvents: 0,
        };
    }
}

export type MemberFilters = {
    search?: string;
    status?: string;
    church_group?: string;
}

export async function getMemberFilters(searchParams: { [key: string]: string | string[] | undefined }): Promise<MemberFilters> {
    return {
        search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
        status: typeof searchParams.status === 'string' ? searchParams.status : undefined,
        church_group: typeof searchParams.church_group === 'string' ? searchParams.church_group : undefined,
    };
}

export async function getMembers(filters: MemberFilters = {}) {
    try {
        console.log('🔍 getMembers called with filters:', JSON.stringify(filters, null, 2));

        const where: any = {};
        if (filters?.search) {
            where.OR = [
                { first_name: { contains: filters.search, mode: 'insensitive' } },
                { last_name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.status && filters.status !== 'All Status' && filters.status !== 'All Members' && filters.status !== 'all') {
            const statusLower = filters.status.toLowerCase();
            console.log('📊 Status filter detected:', filters.status, '→', statusLower);
            if (statusLower === 'visitor') {
                where.membership_type = 'Visitor';
                console.log('✅ Setting membership_type filter:', where.membership_type);
            } else if (statusLower === 'active') {
                where.status = 'Active';
                console.log('✅ Setting status filter to Active');
            } else if (statusLower === 'inactive') {
                where.status = 'Inactive';
                console.log('✅ Setting status filter to Inactive');
            }
        }
        if (filters?.church_group && filters.church_group !== 'All Groups') {
            where.church_group = filters.church_group;
        }

        console.log('🎯 Final where clause:', JSON.stringify(where, null, 2));

        const threeMonthsAgo = subMonths(new Date(), 3);

        const members = await prisma.member.findMany({
            where,
            include: {
                memberDepartments: { include: { department: true } },
                memberMinistries: { include: { ministry: true } },
                attendance: {
                    where: {
                        check_in_date: {
                            gte: threeMonthsAgo
                        }
                    }
                },
                tithes: {
                    where: {
                        date: { gte: threeMonthsAgo },
                        status: 'Paid'
                    }
                },
                welfareContributions: {
                    where: {
                        date: { gte: threeMonthsAgo },
                        status: 'Paid'
                    }
                }
            },
            orderBy: { created_at: 'desc' },
        });

        // 1. Calculate the denominator: Number of Sundays in the last 90 days
        let totalSundays = 0;
        const now = new Date();
        const checkDate = new Date(threeMonthsAgo);

        while (checkDate <= now) {
            if (checkDate.getDay() === 0) { // 0 is Sunday
                totalSundays++;
            }
            checkDate.setDate(checkDate.getDate() + 1);
        }
        totalSundays = Math.max(totalSundays, 1); // Avoid division by zero

        // 2. Get unique service dates in the last 3 months (for debug/reference if needed, but we use totalSundays now)
        const distinctServiceDates = await prisma.attendance.findMany({
            where: {
                check_in_date: {
                    gte: threeMonthsAgo
                }
            },
            select: {
                check_in_date: true
            },
            distinct: ['check_in_date']
        });

        const serviceDates = distinctServiceDates.map(d => new Date(d.check_in_date).getTime());

        // Enrich members with calculated fields
        const enrichedMembers = members.map(member => {
            const joinDate = new Date(member.created_at);
            const effectiveStartDate = joinDate > threeMonthsAgo ? joinDate : threeMonthsAgo;

            // 1. Attendance Score (40%)
            // We now use totalSundays as the fixed denominator for a 3-month window
            const attendanceCount = member.attendance.length;
            const attendancePct = Math.min(Math.round((attendanceCount / totalSundays) * 100), 100);

            // 2. Tithes Score (30%)
            // Check how many months they paid at least one tithe vs how many months they've been a member (max 3)
            const titheMonths = new Set(member.tithes.map(t => new Date(t.date).getMonth() + '-' + new Date(t.date).getFullYear()));

            // Calculate number of full/partial months since joining (capped at 3)
            const now = new Date();
            const startMonth = effectiveStartDate.getMonth();
            const startYear = effectiveStartDate.getFullYear();
            const endMonth = now.getMonth();
            const endYear = now.getFullYear();

            let monthsToCount = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
            monthsToCount = Math.min(monthsToCount, 3);

            const titheScore = Math.min((titheMonths.size / monthsToCount) * 100, 100);

            // 3. Welfare Score (30%)
            const welfareMonths = new Set(member.welfareContributions.map(w => new Date(w.date).getMonth() + '-' + new Date(w.date).getFullYear()));
            const welfareScore = Math.min((welfareMonths.size / monthsToCount) * 100, 100);

            // Final Engagement Score
            const finalScore = (attendancePct * 0.4) + (titheScore * 0.3) + (welfareScore * 0.3);

            let engagement = 'Low';
            if (finalScore >= 90) engagement = 'Extreme';
            else if (finalScore >= 75) engagement = 'High';
            else if (finalScore >= 50) engagement = 'Moderate';
            else if (finalScore >= 25) engagement = 'Low';
            else engagement = 'Very Low';

            // Override for very new members (< 1 week) to give them a 'Moderate' start
            const daysSinceJoined = (new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceJoined < 7 && finalScore < 50) engagement = 'Moderate';

            return {
                ...member,
                attendance: attendancePct,
                engagement: engagement
            };
        });

        return enrichedMembers;
    } catch (error) {
        console.error('Error fetching members:', error);
        return [];
    }
}

export type MemberInsight = {
    type: 'success' | 'warning' | 'info' | 'error';
    icon: 'trending-up' | 'trending-down' | 'users' | 'alert' | 'calendar' | 'user-check';
    text: string;
    priority: number;
};

export async function getMemberInsights(): Promise<{ success: boolean; data: MemberInsight[] }> {
    try {
        const insights: MemberInsight[] = [];
        const today = new Date();
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        try {
            const highEngagementRaw = await prisma.$queryRaw`
            SELECT m.first_name, m.last_name, COUNT(DISTINCT a.attendance_id) as count
            FROM "members" m
            LEFT JOIN "attendance" a ON m.member_id = a.member_id 
            WHERE m.status = 'Active' AND a.check_in_date >= ${ninetyDaysAgo}
            GROUP BY m.member_id 
            HAVING COUNT(DISTINCT a.attendance_id) >= 10
            ORDER BY count DESC
            LIMIT 2
        ` as any[];

            if (highEngagementRaw && highEngagementRaw.length > 0) {
                const names = highEngagementRaw.map((r: any) => `${r.first_name} ${r.last_name}`);
                const nameList = names.join(' and ');
                insights.push({
                    type: 'success',
                    icon: 'trending-up',
                    text: `${nameList} show exceptional engagement patterns`,
                    priority: 1
                });
            }
        } catch (e) {
            console.warn('Insight 1 query failed, skipping', e);
        }

        try {
            const fortyFiveDaysAgo = new Date(today);
            fortyFiveDaysAgo.setDate(today.getDate() - 45);

            const absentRaw = await prisma.$queryRaw`
            SELECT m.first_name, m.last_name, MAX(a.check_in_date) as last_date
            FROM "members" m
            LEFT JOIN "attendance" a ON m.member_id = a.member_id
            WHERE m.status = 'Active'
            GROUP BY m.member_id
            HAVING MAX(a.check_in_date) < ${fortyFiveDaysAgo} OR MAX(a.check_in_date) IS NULL
            ORDER BY last_date ASC
            LIMIT 1
        ` as any[];

            if (absentRaw && absentRaw.length > 0) {
                const row = absentRaw[0];
                const days = row.last_date ? Math.floor((today.getTime() - new Date(row.last_date).getTime()) / (1000 * 3600 * 24)) : '90+';
                insights.push({
                    type: 'warning',
                    icon: 'alert',
                    text: `${row.first_name} ${row.last_name} hasn't attended in ${days} days - consider outreach`,
                    priority: 2
                });
            }
        } catch (e) {
            console.warn('Insight 2 query failed, skipping', e);
        }

        const currentQuarterCount = await prisma.member.count({
            where: { created_at: { gte: threeMonthsAgo } }
        });

        const lastQuarterCount = await prisma.member.count({
            where: {
                created_at: {
                    gte: sixMonthsAgo,
                    lt: threeMonthsAgo
                }
            }
        });

        if (lastQuarterCount > 0 && currentQuarterCount > 0) {
            const change = Math.round(((currentQuarterCount - lastQuarterCount) / lastQuarterCount) * 100);
            if (change > 0) {
                insights.push({
                    type: 'success',
                    icon: 'users',
                    text: `${change}% increase in new members this quarter`,
                    priority: 1
                });
            } else if (change < 0) {
                insights.push({
                    type: 'warning',
                    icon: 'users',
                    text: `${Math.abs(change)}% decrease in new members this quarter`,
                    priority: 3
                });
            }
        }

        const inactiveCount = await prisma.member.count({ where: { status: 'Inactive' } });
        if (inactiveCount > 0) {
            insights.push({
                type: 'warning',
                icon: 'alert',
                text: `${inactiveCount} members marked as inactive - review engagement strategies`,
                priority: 3
            });
        }

        try {
            const birthdayRaw = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM "members" 
            WHERE EXTRACT(MONTH FROM date_of_birth) = ${today.getMonth() + 1} AND status = 'Active'
        ` as any[];
            const countVal = Number(birthdayRaw[0]?.count || 0);

            if (countVal > 0) {
                insights.push({
                    type: 'info',
                    icon: 'calendar',
                    text: `${countVal} member birthdays this month - send greetings`,
                    priority: 4
                });
            }
        } catch (e) {
            console.warn('Insight 5 query failed, skipping', e);
        }

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const visitorCount = await prisma.member.count({
            where: {
                membership_type: 'Visitor',
                created_at: { gte: sevenDaysAgo }
            }
        });

        if (visitorCount > 0) {
            insights.push({
                type: 'info',
                icon: 'user-check',
                text: `${visitorCount} new visitors this week - schedule follow-up calls`,
                priority: 2
            });
        }

        const groupCounts = await prisma.member.groupBy({
            by: ['church_group'],
            where: { status: 'Active', church_group: { not: null } },
            _count: { church_group: true }
        });

        if (groupCounts.length > 0) {
            const sortedGroups = groupCounts
                .sort((a, b) => a._count.church_group - b._count.church_group);

            if (sortedGroups[0]._count.church_group < 10) {
                insights.push({
                    type: 'warning',
                    icon: 'users',
                    text: `${sortedGroups[0].church_group} group has only ${sortedGroups[0]._count.church_group} members - consider recruitment`,
                    priority: 4
                });
            }
        }

        insights.sort((a, b) => a.priority - b.priority);
        return { success: true, data: insights.slice(0, 6) };


    } catch (error) {
        console.error('Error getting member insights:', error);
        return { success: false, data: [] };
    }
}

export async function updateMember(memberId: number, data: any) {
    try {
        // Filter out fields that shouldn't be updated directly or need formatting
        const { member_id, created_at, updated_at, ...updateData } = data;

        // Convert date strings to Date objects if necessary
        if (updateData.date_of_birth) {
            updateData.date_of_birth = new Date(updateData.date_of_birth);
        }

        const updatedMember = await prisma.member.update({
            where: { member_id: memberId },
            data: updateData,
        });

        revalidatePath('/admin/members');
        return { success: true, member: updatedMember };
    } catch (error) {
        console.error('Error updating member:', error);
        return { success: false, error: 'Failed to update member' };
    }
}
