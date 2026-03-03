const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_IUsbv27CnzHy@ep-holy-dust-ahoodz3g-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
        },
    },
});

async function main() {
    console.log('--- Remote Admin Diagnostic ---');
    try {
        const admins = await prisma.adminAccount.findMany({
            select: { admin_email: true, admin_name: true }
        });
        console.log('Existing Admin Emails:');
        admins.forEach(a => console.log(`- ${a.admin_email} (${a.admin_name})`));

        if (admins.length === 0) {
            console.log('NO ADMINS FOUND!');
        }
    } catch (error) {
        console.error('DIAGNOSTIC ERROR:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
