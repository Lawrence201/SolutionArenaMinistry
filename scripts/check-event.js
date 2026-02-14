
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.event.count();
    console.log(`Total events: ${count}`);

    const event = await prisma.event.findUnique({
        where: { id: 1 }
    });

    if (event) {
        console.log('Event 1 found:', event.name);
    } else {
        console.log('Event 1 NOT found');
        // List first 5 events to see what IDs exist
        const events = await prisma.event.findMany({ take: 5, select: { id: true, name: true } });
        console.log('Existing events:', events);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
