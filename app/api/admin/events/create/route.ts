
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveFile } from '@/lib/storage';
import { EventType, EventCategory, EventStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Helper to get string value
        const getString = (key: string) => {
            const val = formData.get(key);
            return val ? val.toString() : '';
        };

        // Helper to get boolean value
        const getBool = (key: string) => {
            const val = formData.get(key);
            return val === 'true' || val === '1' || val === 'on';
        };

        // 1. Extract and Save Files
        const eventImage = await saveFile(formData.get('eventImage') as File, 'events');
        const contactPersonImage = await saveFile(formData.get('contactPersonImage') as File, 'events');
        const adImage1 = await saveFile(formData.get('adImage1') as File, 'events');
        const adImage2 = await saveFile(formData.get('adImage2') as File, 'events');
        const adVideo1 = await saveFile(formData.get('adVideo1') as File, 'events');
        const adVideo2 = await saveFile(formData.get('adVideo2') as File, 'events');

        // 2. Map Enums
        // Mappings for EventType
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
        const rawType = getString('eventType');
        const eventType = typeMap[rawType] || EventType.Other;

        // Mappings for EventCategory
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
        const rawCat = getString('eventCategory');
        const eventCategory = catMap[rawCat] || EventCategory.Other;

        // 3. Prepare Data
        const eventData = {
            name: getString('eventName'),
            type: eventType,
            type_other: getString('eventTypeOther') || null,
            category: eventCategory,
            category_other: getString('eventCategoryOther') || null,
            description: getString('eventDescription'),
            start_date: new Date(getString('startDate')),
            // Time fields in DB are DateTime, usually we set a dummy date with the time
            start_time: new Date(`1970-01-01T${getString('startTime')}`),
            end_date: new Date(getString('endDate')),
            end_time: new Date(`1970-01-01T${getString('endTime')}`),
            is_recurring: getBool('recurringEvent'),
            location: getString('eventLocation') === 'Other' ? getString('eventLocationCustom') : getString('eventLocation'),
            room_building: getString('roomBuilding') || null,
            full_address: getString('fullAddress') || null,
            is_virtual: getBool('virtualEvent'),
            virtual_link: getString('virtualLink') || null,
            max_capacity: parseInt(getString('maxCapacity')) || 50,
            registration_deadline: getString('registrationDeadline') ? new Date(getString('registrationDeadline')) : null,
            require_registration: getBool('requireRegistration'),
            open_to_public: getBool('openToPublic'),
            volunteers_needed: parseInt(getString('volunteersNeeded')) || 0,
            contact_person: getString('contactPerson') || null,
            contact_email: getString('contactEmail') || null,
            contact_phone: getString('contactPhone') || null,
            contact_person_image: contactPersonImage,
            special_notes: getString('specialNotes') || null,
            image_path: eventImage,
            ad_image_1: adImage1,
            ad_image_2: adImage2,
            ad_video_1: adVideo1,
            ad_video_2: adVideo2,
            status: getString('status') === 'Draft' ? EventStatus.Draft : EventStatus.Published,
            // age_group is handled by Prisma default usually but we can map if needed. 
            // The frontend sends 'children', 'youth' etc but schema expects AgeGroup enum.
            // For simplicity/safety, we might skip age_group if exact mapping is complex or let it default.
            // Let's rely on default 'All' or map if crucial. The schema has 'age_group' Enum AgeGroup.
        };

        // 4. Create Event Transaction
        const newEvent = await prisma.event.create({
            data: eventData
        });

        // 5. Handle Relations (Tags and Volunteer Roles)
        // Parse JSON strings
        const tags = JSON.parse(getString('eventTags') || '[]');
        const volunteerRoles = JSON.parse(getString('volunteerRoles') || '[]');

        if (tags.length > 0) {
            await prisma.eventTag.createMany({
                data: tags.map((tag: string) => ({
                    event_id: newEvent.id,
                    tag: tag
                }))
            });
        }

        if (volunteerRoles.length > 0) {
            await prisma.eventVolunteerRole.createMany({
                data: volunteerRoles.map((role: any) => ({
                    event_id: newEvent.id,
                    role_name: role.name,
                    quantity_needed: parseInt(role.quantity)
                }))
            });
        }

        // 6. Log Activity (Optional but good for parity)
        await prisma.activityLog.create({
            data: {
                activity_type: 'event_scheduled',
                title: 'Event scheduled',
                description: `${newEvent.name} added to calendar`,
                icon_type: 'event',
                related_id: newEvent.id,
                created_by: 'Admin' // Should come from session in real app
            }
        });

        return NextResponse.json({ success: true, message: 'Event created successfully', event_id: newEvent.id });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
