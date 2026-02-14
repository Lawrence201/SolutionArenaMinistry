
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('DEBUG: PRISMA_CLIENT_ENGINE_TYPE =', process.env.PRISMA_CLIENT_ENGINE_TYPE);
console.log('DEBUG: DATABASE_URL =', process.env.DATABASE_URL);

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Successfully connected to database with Library engine!');
        const count = await prisma.member.count();
        console.log('Count:', count);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
