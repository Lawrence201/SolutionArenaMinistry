import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const members = await prisma.member.count();
    const attendance = await prisma.attendance.count();
    const events = await prisma.event.count();
    const offerings = await prisma.offering.count();
    const tithes = await prisma.tithe.count();
    const messages = await prisma.message.count();

    console.log({
        members,
        attendance,
        events,
        offerings,
        tithes,
        messages
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
