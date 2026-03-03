const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_IUsbv27CnzHy@ep-holy-dust-ahoodz3g-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
        },
    },
});

async function main() {
    console.log('--- Remote Admin Fallback Script ---');
    const password = 'elder100';
    const email = 'lawrenceantwi@gmail.com';
    const name = 'Lawrence (Fallback)';

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const admin = await prisma.adminAccount.upsert({
            where: { admin_email: email },
            update: {
                admin_name: name,
                admin_password: hashedPassword,
            },
            create: {
                admin_name: name,
                admin_email: email,
                admin_password: hashedPassword,
            },
        });
        console.log('SUCCESS: Admin account created/updated for:', admin.admin_email);
    } catch (error) {
        console.error('ERROR creating admin account:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
