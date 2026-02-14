const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const models = Object.keys(prisma).filter(key => !key.startsWith('_') && typeof prisma[key] === 'object');
        console.log('Available models:', models);

        if (prisma.visitor) {
            console.log('Visitor model exists in client.');
            const count = await prisma.visitor.count();
            console.log('Visitor count:', count);
        }

        if (prisma.visitorFollowup) {
            console.log('VisitorFollowup model exists in client.');
            const count = await prisma.visitorFollowup.count();
            console.log('VisitorFollowup count:', count);
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
