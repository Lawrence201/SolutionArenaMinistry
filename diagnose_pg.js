const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Searching for Emily in PostgreSQL...");
    try {
        const members = await prisma.member.findMany({
            where: {
                first_name: {
                    contains: 'Emily',
                    mode: 'insensitive'
                }
            }
        });
        console.log("Results:", JSON.stringify(members, null, 2));

        console.log("\nSearching for all January birthdays...");
        const janBirthdays = await prisma.member.findMany({
            where: {
                date_of_birth: {
                    not: null
                }
            }
        });
        const jan = janBirthdays.filter(m => {
            const d = new Date(m.date_of_birth);
            return d.getMonth() === 0; // January is 0
        });
        console.log("January Birthdays:", JSON.stringify(jan, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
