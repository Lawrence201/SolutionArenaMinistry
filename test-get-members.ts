import { prisma } from './lib/prisma';
import { subMonths } from 'date-fns';

async function testGetMembers() {
    try {
        const engagementPeriod = subMonths(new Date(), 6);
        console.log('Running members query...');

        const members = await prisma.member.findMany({
            where: {},
            include: {
                memberDepartments: { include: { department: true } },
                memberMinistries: { include: { ministry: true } },
                attendance: {
                    where: {
                        check_in_date: {
                            gte: engagementPeriod
                        }
                    }
                },
                tithes: {
                    where: {
                        date: { gte: engagementPeriod },
                        status: 'Paid'
                    }
                },
                welfareContributions: {
                    where: {
                        date: { gte: engagementPeriod },
                        status: 'Paid'
                    }
                }
            },
            orderBy: { created_at: 'desc' },
        });

        console.log('Successfully fetched members count:', members.length);
    } catch (error) {
        console.error('CRITICAL ERROR in members query:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testGetMembers();
