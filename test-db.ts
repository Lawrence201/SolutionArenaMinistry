import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const members = await prisma.member.findMany({
            take: 5
        });
        console.log('Successfully fetched members count:', members.length);
        if (members.length > 0) {
            console.log('First member:', members[0].first_name, members[0].last_name);
        }
    } catch (error) {
        console.error('Error fetching members:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
