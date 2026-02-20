import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
    const visitors = await prisma.visitor.findMany({
        include: {
            attendance: true
        }
    });

    const data = visitors.map(v => ({
        id: v.visitor_id,
        name: v.name,
        visit_count: v.visit_count,
        last_visit_date: v.last_visit_date,
        attendance_count: v.attendance.length
    }));

    fs.writeFileSync('visitor_stats.json', JSON.stringify(data, null, 2));
    console.log(`Wrote ${data.length} visitor records to visitor_stats.json`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
