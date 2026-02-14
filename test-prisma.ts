
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Successfully connected to database!');

        const memberCount = await prisma.member.count();
        console.log(`Current member count: ${memberCount}`);

        // Print internal config (if accessible, though hidden) to see engine type if possible, 
        // or just rely on success/failure.
        console.log('Prisma Client connected successfully with library engine.');
    } catch (error) {
        console.error('Error connecting to database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
