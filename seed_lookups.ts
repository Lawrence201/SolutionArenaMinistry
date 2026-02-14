
import { PrismaClient, MinistryName, DepartmentName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding Ministries ---');
    const ministries = Object.values(MinistryName);
    for (const name of ministries) {
        const exists = await prisma.ministry.findFirst({ where: { ministry_name: name } });
        if (!exists) {
            await prisma.ministry.create({ data: { ministry_name: name, description: `${name} Ministry` } });
            console.log(`Created Ministry: ${name}`);
        } else {
            console.log(`Ministry ${name} exists.`);
        }
    }

    console.log('\n--- Seeding Departments ---');
    const departments = Object.values(DepartmentName);
    for (const name of departments) {
        const exists = await prisma.department.findFirst({ where: { department_name: name } });
        if (!exists) {
            await prisma.department.create({ data: { department_name: name, description: `${name} Department` } });
            console.log(`Created Department: ${name}`);
        } else {
            console.log(`Department ${name} exists.`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
