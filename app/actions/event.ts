'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { EventStatus, EventType, EventCategory } from '@prisma/client';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';

export async function getEvents(options: {
    filter?: string;
    search?: string;
    date?: string;
    limit?: number;
} = {}) {
    const { filter = 'all', search = '', date = '', limit } = options;

    try {
        const where: any = {
            status: { not: EventStatus.Cancelled },
        };

        // Date filter
        if (date) {
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            const nextDate = new Date(selectedDate);
            nextDate.setDate(selectedDate.getDate() + 1);

            where.start_date = {
                gte: selectedDate,
                lt: nextDate,
            };
        }

        // Filter by type/category
        if (filter !== 'all') {
            if (filter === 'upcoming') {
                where.start_date = { gte: new Date() };
            } else if (filter === 'service') {
                where.type = EventType.Service;
            } else if (filter === 'ministry') {
                where.category = { in: [EventCategory.Youth, EventCategory.Women, EventCategory.Men, EventCategory.Choir] };
            } else {
                // General category or type filter
                where.OR = [
                    { type: { equals: filter as any } },
                    { category: { equals: filter as any } },
                ];
            }
        }

        // Search filter
        if (search) {
            where.OR = [
                ...(where.OR || []),
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ];
        }

        const events = await prisma.event.findMany({
            where,
            orderBy: [
                { start_date: 'asc' },
                { start_time: 'asc' },
            ],
            take: limit,
            include: {
                tags: true,
                volunteerRoles: true,
            },
        });

        const formattedEvents = events.map(event => ({
            ...event,
            start_date: event.start_date.toISOString().split('T')[0],
            start_time: event.start_time.toTimeString().slice(0, 5),
            end_date: event.end_date.toISOString().split('T')[0],
            end_time: event.end_time.toTimeString().slice(0, 5),
            registration_deadline: event.registration_deadline ? event.registration_deadline.toISOString().split('T')[0] : '',
            attending: Math.floor(event.max_capacity * 0.7), // Mock data to match legacy behavior
        }));

        return { success: true, data: { events: formattedEvents } };
    } catch (error) {
        console.error('Error fetching events:', error);
        return { success: false, message: 'Failed to fetch events' };
    }
}

export async function getEventMetrics() {
    try {
        const now = new Date();

        const [total, upcoming, inService, past] = await Promise.all([
            // Total active events
            prisma.event.count({
                where: { status: { not: EventStatus.Cancelled } }
            }),
            // Upcoming events
            prisma.event.count({
                where: {
                    status: { not: EventStatus.Cancelled },
                    OR: [
                        { start_date: { gt: now } },
                        {
                            start_date: { equals: now },
                            start_time: { gt: now }
                        }
                    ]
                }
            }),
            // Happening today
            prisma.event.count({
                where: {
                    status: { not: EventStatus.Cancelled },
                    start_date: {
                        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
                    }
                }
            }),
            // Past events
            prisma.event.count({
                where: {
                    status: { not: EventStatus.Cancelled },
                    OR: [
                        { end_date: { lt: now } },
                        {
                            end_date: { equals: now },
                            end_time: { lt: now }
                        }
                    ]
                }
            })
        ]);

        return {
            success: true,
            data: {
                total_events: total,
                upcoming_events: upcoming,
                in_service_events: inService,
                past_events: past
            }
        };
    } catch (error) {
        console.error('Error fetching event metrics:', error);
        return { success: false, message: 'Failed to fetch metrics' };
    }
}

export async function getBirthdays(month: number) {
    try {
        const allMembers = await prisma.member.findMany({
            where: {
                status: 'Active',
                date_of_birth: { not: null }
            },
            select: {
                member_id: true,
                first_name: true,
                last_name: true,
                phone: true,
                email: true,
                date_of_birth: true,
                church_group: true
            }
        });

        // Use UTC values to avoid local timezone shifts during anniversary extraction
        const filteredMembers = allMembers.filter(m => {
            if (!m.date_of_birth) return false;
            const dob = new Date(m.date_of_birth);
            return (dob.getUTCMonth() + 1) === month;
        });

        const today = new Date();
        const typedMembers = filteredMembers.map(m => {
            const dob = new Date(m.date_of_birth!);
            const birthDay = dob.getUTCDate();
            const birthMonth = dob.getUTCMonth() + 1;

            // Age calculation
            let age = today.getFullYear() - dob.getUTCFullYear();
            const m_diff = (today.getMonth() + 1) - birthMonth;
            if (m_diff < 0 || (m_diff === 0 && today.getDate() < birthDay)) {
                age--;
            }

            // Determine if birthday has passed relative to today
            let is_passed = false;
            const currentMonthIdx = today.getMonth() + 1;

            if (month < currentMonthIdx) {
                is_passed = true;
            } else if (month > currentMonthIdx) {
                is_passed = false;
            } else {
                is_passed = birthDay < today.getDate();
            }

            return {
                id: m.member_id,
                name: `${m.first_name} ${m.last_name}`,
                phone: m.phone,
                email: m.email,
                birth_day: birthDay,
                birth_month: birthMonth,
                age: age,
                church_group: m.church_group,
                date_of_birth: m.date_of_birth,
                is_passed // Add this field
            };
        });

        const celebrated = typedMembers.filter(m => m.is_passed);
        const upcoming = typedMembers.filter(m => !m.is_passed);

        return {
            success: true,
            data: {
                all_birthdays: typedMembers,
                celebrated,
                upcoming,
                total_count: typedMembers.length,
                celebrated_count: celebrated.length,
                upcoming_count: upcoming.length,
                month_name: new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })
            }
        };
    } catch (error) {
        console.error('Error fetching birthdays:', error);
        return { success: false, message: 'Failed to fetch birthdays' };
    }
}

export async function getEventInsights() {
    try {
        const insights: any[] = [];
        const now = new Date();
        const next30Days = new Date();
        next30Days.setDate(now.getDate() + 30);
        const prev3Months = new Date();
        prev3Months.setMonth(now.getMonth() - 3);

        // Reference: app/actions/event.ts logic based on get_event_insights.php

        const [
            upcoming30DaysCount,
            volunteerNeedsCount,
            typeDistribution,
            categoryEngagement,
            largeCapacityEvent,
            recentPastCount,
            currentMonthCount
        ] = await Promise.all([
            // 1. Upcoming Events (Next 30 Days)
            prisma.event.count({
                where: {
                    status: EventStatus.Published,
                    start_date: { gte: now, lte: next30Days }
                }
            }),
            // 2. Volunteer Needs
            prisma.event.count({
                where: {
                    status: EventStatus.Published,
                    start_date: { gte: now },
                    volunteers_needed: { gt: 0 }
                }
            }),
            // 3. Type Distribution (Top 1)
            prisma.event.groupBy({
                by: ['type'],
                where: {
                    status: EventStatus.Published,
                    start_date: { gte: prev3Months }
                },
                _count: { type: true },
                orderBy: { _count: { type: 'desc' } },
                take: 1
            }),
            // 4. Category Engagement (Top 1)
            prisma.event.groupBy({
                by: ['category'],
                where: {
                    status: EventStatus.Published,
                    start_date: { gte: prev3Months },
                    // category: { not: null } // Removed as category is required
                },
                _count: { category: true },
                orderBy: { _count: { category: 'desc' } },
                take: 1
            }),
            // 5. Large Capacity Event (Top 1)
            prisma.event.findFirst({
                where: {
                    status: EventStatus.Published,
                    start_date: { gte: now },
                    max_capacity: { gt: 0 }
                },
                orderBy: { max_capacity: 'desc' },
                select: { name: true, max_capacity: true }
            }),
            // 6. Recent Past Events (Last 7 Days)
            prisma.event.count({
                where: {
                    status: EventStatus.Published,
                    end_date: { lt: now, gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
            // 7. This Month Events
            prisma.event.count({
                where: {
                    status: EventStatus.Published,
                    start_date: {
                        gte: new Date(now.getFullYear(), now.getMonth(), 1),
                        lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
                    }
                }
            })
        ]);

        // Logic to populate insights array based on results (matching PHP logic)

        // 1. Upcoming Count
        if (upcoming30DaysCount > 5) {
            insights.push({ type: 'info', icon: 'calendar', text: `${upcoming30DaysCount} events scheduled in the next 30 days`, priority: 1 });
        } else if (upcoming30DaysCount > 0) {
            insights.push({ type: 'info', icon: 'calendar', text: `${upcoming30DaysCount} events scheduled in the next 30 days`, priority: 1 });
        } else {
            insights.push({ type: 'warning', icon: 'calendar', text: "No events scheduled for the next 30 days - plan ahead", priority: 1 });
        }

        // 2. Volunteer Needs
        if (volunteerNeedsCount > 0) {
            insights.push({ type: 'warning', icon: 'users', text: `${volunteerNeedsCount} upcoming events need volunteers`, priority: 2 });
        }

        // 3. Type Distribution
        if (typeDistribution.length > 0) {
            const topType = typeDistribution[0];
            insights.push({ type: 'info', icon: 'calendar', text: `${topType.type} events are most frequent with ${topType._count.type} events this quarter`, priority: 3 });
        }

        // 4. Category Engagement
        if (categoryEngagement.length > 0) {
            const topCat = categoryEngagement[0];
            if (topCat._count.category >= 2) {
                insights.push({ type: 'success', icon: 'trending-up', text: `${topCat.category} events show high activity - consider expanding`, priority: 2 });
            }
        }

        // 5. Capacity
        if (largeCapacityEvent && largeCapacityEvent.max_capacity >= 100) {
            insights.push({ type: 'info', icon: 'users', text: `${largeCapacityEvent.name} has large capacity (${largeCapacityEvent.max_capacity}) - ensure adequate resources`, priority: 4 });
        }

        // 6. Follow-up
        if (recentPastCount > 0) {
            insights.push({ type: 'info', icon: 'message', text: `${recentPastCount} recent events completed - send follow-up surveys`, priority: 5 });
        }

        // 7. This Month
        if (currentMonthCount > 0) {
            insights.push({ type: 'success', icon: 'calendar', text: `${currentMonthCount} events scheduled this month`, priority: 3 });
        }

        // Sort by priority and limit to 6
        insights.sort((a, b) => a.priority - b.priority);
        const finalInsights = insights.slice(0, 6);

        return { success: true, data: finalInsights };

    } catch (error) {
        console.error('Error fetching event insights:', error);
        return { success: false, message: 'Failed to fetch insights' };
    }
}

export async function deleteEvent(id: number) {
    try {
        // 1. Fetch event to get file paths
        const event = await prisma.event.findUnique({
            where: { id }
        });

        if (!event) return { success: false, message: 'Event not found' };

        // 2. Helper to delete files
        const deleteFile = async (filePath: string | null) => {
            if (!filePath) return;
            try {
                const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
                const fullPath = join(process.cwd(), 'public', relativePath);
                await unlink(fullPath);
            } catch (error) {
                console.error(`Failed to delete file: ${filePath}`, error);
            }
        };

        // 3. Delete all associated media
        await Promise.all([
            deleteFile(event.image_path),
            deleteFile(event.contact_person_image),
            deleteFile(event.ad_image_1),
            deleteFile(event.ad_image_2),
            deleteFile(event.ad_video_1),
            deleteFile(event.ad_video_2)
        ]);

        // 4. Hard delete the event
        await prisma.event.delete({
            where: { id }
        });

        revalidatePath('/admin/events');
        return { success: true };
    } catch (error) {
        console.error('Error deleting event:', error);
        return { success: false, message: 'Failed to delete event' };
    }
}

export async function getEventById(id: number) {
    try {
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                tags: true,
                volunteerRoles: true,
            },
        });

        if (!event) {
            return { success: false, message: 'Event not found' };
        }

        // Parse JSON fields if necessary, but Prisma handles relations well.
        // We might need to format dates for the frontend inputs (YYYY-MM-DD and HH:mm)
        const formattedEvent = {
            ...event,
            start_date: event.start_date.toISOString().split('T')[0],
            start_time: event.start_time.toTimeString().slice(0, 5),
            end_date: event.end_date.toISOString().split('T')[0],
            end_time: event.end_time.toTimeString().slice(0, 5),
            registration_deadline: event.registration_deadline ? event.registration_deadline.toISOString().split('T')[0] : '',
        }

        return { success: true, data: formattedEvent };
    } catch (error) {
        console.error('Error fetching event:', error);
        return { success: false, message: 'Failed to fetch event' };
    }
}

// Helper to get string value
const getString = (formData: FormData, key: string) => {
    const val = formData.get(key);
    return val ? val.toString() : '';
};

// Helper to get boolean value
const getBool = (formData: FormData, key: string) => {
    const val = formData.get(key);
    return val === 'true' || val === '1' || val === 'on';
};

// Helper to save file
const saveFile = async (file: File | null) => {
    if (!file || file.size === 0 || file.name === 'undefined') return null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'events');

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    return `/uploads/events/${uniqueName}`;
};

// Helper to delete old file
const deleteOldFile = async (filePath: string | null) => {
    if (!filePath) return;
    try {
        // Remove leading slash for local path resolution
        const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        const fullPath = join(process.cwd(), 'public', relativePath);
        await unlink(fullPath);
    } catch (error) {
        console.error(`Failed to delete old file: ${filePath}`, error);
        // non-fatal
    }
};

export async function updateEvent(formData: FormData) {

    try {
        const eventId = parseInt(getString(formData, 'event_id'));
        if (!eventId) return { success: false, message: 'Event ID is required' };

        // 1. Fetch existing event to get old file paths
        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!existingEvent) return { success: false, message: 'Event not found' };

        // 2. Extract and Save New Files
        const eventImageFile = formData.get('eventImage') as File;
        const contactImageFile = formData.get('contactPersonImage') as File;
        const adImage1File = formData.get('adImage1') as File;
        const adImage2File = formData.get('adImage2') as File;
        const adVideo1File = formData.get('adVideo1') as File;
        const adVideo2File = formData.get('adVideo2') as File;

        const newEventImage = await saveFile(eventImageFile);
        const newContactImage = await saveFile(contactImageFile);
        const newAdImage1 = await saveFile(adImage1File);
        const newAdImage2 = await saveFile(adImage2File);
        const newAdVideo1 = await saveFile(adVideo1File);
        const newAdVideo2 = await saveFile(adVideo2File);

        // 3. Delete old files if replaced
        if (newEventImage && existingEvent.image_path) await deleteOldFile(existingEvent.image_path);
        if (newContactImage && existingEvent.contact_person_image) await deleteOldFile(existingEvent.contact_person_image);
        if (newAdImage1 && existingEvent.ad_image_1) await deleteOldFile(existingEvent.ad_image_1);
        if (newAdImage2 && existingEvent.ad_image_2) await deleteOldFile(existingEvent.ad_image_2);
        if (newAdVideo1 && existingEvent.ad_video_1) await deleteOldFile(existingEvent.ad_video_1);
        if (newAdVideo2 && existingEvent.ad_video_2) await deleteOldFile(existingEvent.ad_video_2);

        // 4. Map Enums (Duplicate logic from create route, ideally should be shared utils)
        const typeMap: Record<string, EventType> = {
            'service': EventType.Service,
            'bible-study': EventType.Bible_study,
            'prayer': EventType.Prayer,
            'conference': EventType.Conference,
            'retreat': EventType.Retreat,
            'outreach': EventType.Outreach,
            'training': EventType.Training,
            'fundraiser': EventType.Fundraiser,
            'celebration': EventType.Celebration,
            'meeting': EventType.Meeting,
            'social': EventType.Social,
            'other': EventType.Other,
        };
        const eventType = typeMap[getString(formData, 'eventType')] || EventType.Other;

        const catMap: Record<string, EventCategory> = {
            'worship': EventCategory.Worship,
            'youth': EventCategory.Youth,
            'women': EventCategory.Women,
            'men': EventCategory.Men,
            'education': EventCategory.Education,
            'missions': EventCategory.Missions,
            'choir': EventCategory.Choir,
            'fellowship': EventCategory.Fellowship,
            'admin': EventCategory.Admin,
            'media': EventCategory.Media,
            'community': EventCategory.Community,
            'other': EventCategory.Other,
        };
        const eventCategory = catMap[getString(formData, 'eventCategory')] || EventCategory.Other;

        // 5. Prepare Update Data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            name: getString(formData, 'eventName'),
            type: eventType,
            type_other: getString(formData, 'eventTypeOther') || null,
            category: eventCategory,
            category_other: getString(formData, 'eventCategoryOther') || null,
            description: getString(formData, 'eventDescription'),
            start_date: new Date(getString(formData, 'startDate')),
            start_time: new Date(`1970-01-01T${getString(formData, 'startTime')}`),
            end_date: new Date(getString(formData, 'endDate')),
            end_time: new Date(`1970-01-01T${getString(formData, 'endTime')}`),
            is_recurring: getBool(formData, 'recurringEvent'),
            location: getString(formData, 'eventLocation') === 'Other' ? getString(formData, 'eventLocationCustom') : getString(formData, 'eventLocation'),
            room_building: getString(formData, 'roomBuilding') || null,
            full_address: getString(formData, 'fullAddress') || null,
            is_virtual: getBool(formData, 'virtualEvent'),
            virtual_link: getString(formData, 'virtualLink') || null,
            max_capacity: parseInt(getString(formData, 'maxCapacity')) || 50,
            registration_deadline: getString(formData, 'registrationDeadline') ? new Date(getString(formData, 'registrationDeadline')) : null,
            require_registration: getBool(formData, 'requireRegistration'),
            open_to_public: getBool(formData, 'openToPublic'),
            volunteers_needed: parseInt(getString(formData, 'volunteersNeeded')) || 0,
            contact_person: getString(formData, 'contactPerson') || null,
            contact_email: getString(formData, 'contactEmail') || null,
            contact_phone: getString(formData, 'contactPhone') || null,
            special_notes: getString(formData, 'specialNotes') || null,
            status: getString(formData, 'status') === 'Draft' ? EventStatus.Draft : EventStatus.Published,
            updated_at: new Date(),
        };

        // Only update image fields if new files were uploaded
        if (newEventImage) updateData.image_path = newEventImage;
        if (newContactImage) updateData.contact_person_image = newContactImage;
        if (newAdImage1) updateData.ad_image_1 = newAdImage1;
        if (newAdImage2) updateData.ad_image_2 = newAdImage2;
        if (newAdVideo1) updateData.ad_video_1 = newAdVideo1;
        if (newAdVideo2) updateData.ad_video_2 = newAdVideo2;

        await prisma.event.update({
            where: { id: eventId },
            data: updateData
        });

        // 6. Handle Relations (Tags and Volunteer Roles) - Delete and Re-insert approach
        const tags = JSON.parse(getString(formData, 'eventTags') || '[]');
        const volunteerRoles = JSON.parse(getString(formData, 'volunteerRoles') || '[]');

        // Transaction for relations
        await prisma.$transaction(async (tx) => {
            // Update Tags
            await tx.eventTag.deleteMany({ where: { event_id: eventId } });
            if (tags.length > 0) {
                await tx.eventTag.createMany({
                    data: tags.map((tag: string) => ({ event_id: eventId, tag }))
                });
            }

            // Update Volunteer Roles
            await tx.eventVolunteerRole.deleteMany({ where: { event_id: eventId } });
            if (volunteerRoles.length > 0) {
                await tx.eventVolunteerRole.createMany({
                    data: volunteerRoles.map((role: any) => ({
                        event_id: eventId,
                        role_name: role.name,
                        quantity_needed: parseInt(role.quantity)
                    }))
                });
            }
        });

        revalidatePath('/admin/events');
        revalidatePath(`/admin/events/${eventId}`);

        return { success: true, message: 'Event updated successfully' };

    } catch (error: any) {
        console.error('Error updating event:', error);
        return { success: false, message: error.message };
    }
}

export async function createEvent(formData: FormData) {
    try {
        // 1. Extract and Save Files
        const eventImageFile = formData.get('eventImage') as File;
        const contactImageFile = formData.get('contactPersonImage') as File;
        const adImage1File = formData.get('adImage1') as File;
        const adImage2File = formData.get('adImage2') as File;
        const adVideo1File = formData.get('adVideo1') as File;
        const adVideo2File = formData.get('adVideo2') as File;

        const newEventImage = await saveFile(eventImageFile);
        const newContactImage = await saveFile(contactImageFile);
        const newAdImage1 = await saveFile(adImage1File);
        const newAdImage2 = await saveFile(adImage2File);
        const newAdVideo1 = await saveFile(adVideo1File);
        const newAdVideo2 = await saveFile(adVideo2File);

        // 2. Map Enums
        const typeMap: Record<string, EventType> = {
            'service': EventType.Service,
            'bible-study': EventType.Bible_study,
            'prayer': EventType.Prayer,
            'conference': EventType.Conference,
            'retreat': EventType.Retreat,
            'outreach': EventType.Outreach,
            'training': EventType.Training,
            'fundraiser': EventType.Fundraiser,
            'celebration': EventType.Celebration,
            'meeting': EventType.Meeting,
            'social': EventType.Social,
            'other': EventType.Other,
        };
        const eventType = typeMap[getString(formData, 'eventType')] || EventType.Other;

        const catMap: Record<string, EventCategory> = {
            'worship': EventCategory.Worship,
            'youth': EventCategory.Youth,
            'women': EventCategory.Women,
            'men': EventCategory.Men,
            'education': EventCategory.Education,
            'missions': EventCategory.Missions,
            'choir': EventCategory.Choir,
            'fellowship': EventCategory.Fellowship,
            'admin': EventCategory.Admin,
            'media': EventCategory.Media,
            'community': EventCategory.Community,
            'other': EventCategory.Other,
        };
        const eventCategory = catMap[getString(formData, 'eventCategory')] || EventCategory.Other;

        // 3. Prepare Create Data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createData: any = {
            name: getString(formData, 'eventName'),
            type: eventType,
            type_other: getString(formData, 'eventTypeOther') || null,
            category: eventCategory,
            category_other: getString(formData, 'eventCategoryOther') || null,
            description: getString(formData, 'eventDescription'),
            start_date: new Date(getString(formData, 'startDate')),
            start_time: new Date(`1970-01-01T${getString(formData, 'startTime')}`),
            end_date: new Date(getString(formData, 'endDate')),
            end_time: new Date(`1970-01-01T${getString(formData, 'endTime')}`),
            is_recurring: getBool(formData, 'recurringEvent'),
            location: getString(formData, 'eventLocation') === 'Other' ? getString(formData, 'eventLocationCustom') : getString(formData, 'eventLocation'),
            room_building: getString(formData, 'roomBuilding') || null,
            full_address: getString(formData, 'fullAddress') || null,
            is_virtual: getBool(formData, 'virtualEvent'),
            virtual_link: getString(formData, 'virtualLink') || null,
            max_capacity: parseInt(getString(formData, 'maxCapacity')) || 50,
            registration_deadline: getString(formData, 'registrationDeadline') ? new Date(getString(formData, 'registrationDeadline')) : null,
            require_registration: getBool(formData, 'requireRegistration'),
            open_to_public: getBool(formData, 'openToPublic'),
            volunteers_needed: parseInt(getString(formData, 'volunteersNeeded')) || 0,
            contact_person: getString(formData, 'contactPerson') || null,
            contact_email: getString(formData, 'contactEmail') || null,
            contact_phone: getString(formData, 'contactPhone') || null,
            special_notes: getString(formData, 'specialNotes') || null,
            status: getString(formData, 'status') === 'Draft' ? EventStatus.Draft : EventStatus.Published,
            image_path: newEventImage,
            contact_person_image: newContactImage,
            ad_image_1: newAdImage1,
            ad_image_2: newAdImage2,
            ad_video_1: newAdVideo1,
            ad_video_2: newAdVideo2,
        };

        // 4. Create Event and Relations
        const tags = JSON.parse(getString(formData, 'eventTags') || '[]');
        const volunteerRoles = JSON.parse(getString(formData, 'volunteerRoles') || '[]');

        await prisma.$transaction(async (tx) => {
            const newEvent = await tx.event.create({
                data: createData
            });

            // Create Tags
            if (tags.length > 0) {
                await tx.eventTag.createMany({
                    data: tags.map((tag: string) => ({ event_id: newEvent.id, tag }))
                });
            }

            // Create Volunteer Roles
            if (volunteerRoles.length > 0) {
                await tx.eventVolunteerRole.createMany({
                    data: volunteerRoles.map((role: any) => ({
                        event_id: newEvent.id,
                        role_name: role.name,
                        quantity_needed: parseInt(role.quantity)
                    }))
                });
            }
        });

        revalidatePath('/admin/events');

        return { success: true, message: 'Event created successfully' };

    } catch (error: any) {
        console.error('Error creating event:', error);
        return { success: false, message: error.message };
    }
}

