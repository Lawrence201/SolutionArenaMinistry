
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Ministries ---');
    const ministries = await prisma.ministry.findMany();
    console.log(JSON.stringify(ministries, null, 2));

    console.log('\n--- Checking Departments ---');
    const departments = await prisma.department.findMany();
    console.log(JSON.stringify(departments, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
