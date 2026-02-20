
import { PrismaClient, Gender, MaritalStatus, MemberStatus, ChurchGroup, LeadershipRole, BaptismStatus, SpiritualGrowth, MembershipType, AttendanceStatus, ServiceType, ExpenseCategory, PaymentMethod, ExpenseStatus, TitheStatus, VisitorSource, FollowUpStatus, WelfarePaymentPeriod, BlogStatus, EventType, EventCategory, EventStatus, VideoType, MediaType, GalleryCategory, GalleryStatus } from '@prisma/client';
import { subMonths, subDays, startOfMonth, endOfMonth, eachDayOfInterval, format, addDays, setHours, setMinutes } from 'date-fns';

const prisma = new PrismaClient();

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper for random number in range
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Helper for random decimal
const randomDecimal = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);

const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Emmanuel', 'Kofi', 'Ama', 'Kwame', 'Kwesi', 'Abena', 'Akua', 'Yaw', 'Afia', 'Ekow'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Mensah', 'Appiah', 'Owusu', 'Annan', 'Boateng', 'Quansah', 'Egyin', 'Donkor', 'Asare', 'Adu'];

async function main() {
    console.log('🚀 Starting Heavy Database Population...');

    // 1. Create Members (150)
    console.log('👥 Creating 150 Members...');
    const memberIds: number[] = [];
    for (let i = 0; i < 150; i++) {
        const firstName = randomItem(firstNames);
        const lastName = randomItem(lastNames);
        const member = await prisma.member.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
                phone: `024${randomInt(1000000, 9999999)}`,
                date_of_birth: subDays(new Date(), randomInt(18 * 365, 70 * 365)),
                gender: randomItem(Object.values(Gender)),
                marital_status: randomItem(Object.values(MaritalStatus)),
                occupation: randomItem(['Engineer', 'Teacher', 'Doctor', 'Nurse', 'Student', 'Businessman', 'Accountant', 'Farmer']),
                address: `${randomInt(1, 100)} Church Street`,
                city: randomItem(['Accra', 'Kumasi', 'Takoradi', 'Cape Coast', 'Tema']),
                region: 'Greater Accra',
                status: MemberStatus.Active,
                church_group: randomItem(Object.values(ChurchGroup)),
                leadership_role: randomItem(Object.values(LeadershipRole)),
                baptism_status: randomItem(Object.values(BaptismStatus)),
                spiritual_growth: randomItem(Object.values(SpiritualGrowth)),
                membership_type: MembershipType.Full_Member,
            }
        });
        memberIds.push(member.member_id);
    }

    // 2. Create Visitors (50)
    console.log('🐾 Creating 50 Visitors...');
    for (let i = 0; i < 50; i++) {
        const name = `${randomItem(firstNames)} ${randomItem(lastNames)}`;
        await prisma.visitor.create({
            data: {
                name,
                phone: `055${randomInt(1000000, 9999999)}`,
                email: `visitor${i}@example.com`,
                source: randomItem(Object.values(VisitorSource)),
                visitors_purpose: 'Worship and Fellowship',
                follow_up_status: randomItem(Object.values(FollowUpStatus)),
                visit_count: randomInt(1, 4),
                created_at: subDays(new Date(), randomInt(1, 180)),
            }
        });
    }

    // 3. Attendance & Finances for last 12 months
    console.log('📅 Generating Attendance and Financial Data for 12 months...');
    const now = new Date();
    for (let m = 0; m < 12; m++) {
        const monthDate = subMonths(now, m);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const days = eachDayOfInterval({ start, end });

        console.log(`   - Processing ${format(monthDate, 'MMMM yyyy')}...`);

        for (const day of days) {
            const dayOfWeek = day.getDay(); // 0 = Sunday, 3 = Wednesday

            // Sunday Service
            if (dayOfWeek === 0) {
                const serviceId = `SUN-${format(day, 'yyyyMMdd')}`;

                // Attendance (Random 70-90% of members)
                for (const memberId of memberIds) {
                    if (Math.random() > 0.2) {
                        await prisma.attendance.create({
                            data: {
                                member_id: memberId,
                                service_id: serviceId,
                                check_in_date: day,
                                check_in_time: setHours(setMinutes(day, randomInt(0, 59)), 8),
                                status: AttendanceStatus.present
                            }
                        });
                    }
                }

                // Tithes (Random 10-20% of attending members)
                for (const memberId of memberIds) {
                    if (Math.random() > 0.8) {
                        await prisma.tithe.create({
                            data: {
                                transaction_id: `TTH-${format(day, 'yyyyMMdd')}-${memberId}`,
                                member_id: memberId,
                                date: day,
                                amount: randomDecimal(50, 500),
                                payment_method: randomItem(Object.values(PaymentMethod)),
                                status: TitheStatus.Paid
                            }
                        });
                    }
                }

                // Offering
                await prisma.offering.create({
                    data: {
                        transaction_id: `OFF-${format(day, 'yyyyMMdd')}`,
                        date: day,
                        service_type: ServiceType.Sunday_Worship,
                        amount_collected: randomDecimal(1000, 3000),
                        collection_method: PaymentMethod.Cash,
                        status: ExpenseStatus.Approved
                    }
                });
            }

            // Wednesday Service
            if (dayOfWeek === 3) {
                const serviceId = `WED-${format(day, 'yyyyMMdd')}`;
                for (const memberId of memberIds) {
                    if (Math.random() > 0.5) { // 50% attendance on Wednesdays
                        await prisma.attendance.create({
                            data: {
                                member_id: memberId,
                                service_id: serviceId,
                                check_in_date: day,
                                check_in_time: setHours(setMinutes(day, randomInt(0, 59)), 18),
                                status: AttendanceStatus.present
                            }
                        });
                    }
                }
            }
        }

        // Monthly Expenses
        for (let e = 0; e < 5; e++) {
            await prisma.expense.create({
                data: {
                    transaction_id: `EXP-${format(monthDate, 'yyyyMM')}-${e}`,
                    date: subDays(end, randomInt(0, 27)),
                    category: randomItem(Object.values(ExpenseCategory)),
                    description: 'Monthly utility/maintenance',
                    amount: randomDecimal(200, 1000),
                    payment_method: PaymentMethod.Bank_Transfer,
                    status: ExpenseStatus.Approved
                }
            });
        }
    }

    // 4. Content (Sermons, Blogs, Events)
    console.log('📝 Adding Content (Sermons, Blogs, Events)...');
    for (let i = 0; i < 10; i++) {
        await prisma.sermon.create({
            data: {
                sermon_title: `Power of Faith Vol ${i + 1}`,
                sermon_speaker: 'Senior Pastor',
                sermon_date: subDays(new Date(), i * 7),
                sermon_description: 'A deep dive into faith and perseverance.',
                view_count: randomInt(100, 1000),
                is_published: true
            }
        });

        await prisma.blog.create({
            data: {
                title: `Church Growth Insight ${i + 1}`,
                slug: `church-growth-insight-${i + 1}`,
                author: 'Admin',
                excerpt: 'Understanding how we grow together as a community.',
                content: 'Full blog content goes here...',
                status: BlogStatus.published,
                published_at: subDays(new Date(), i * 5),
                views: randomInt(50, 500)
            }
        });
    }

    console.log('✅ Population Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
