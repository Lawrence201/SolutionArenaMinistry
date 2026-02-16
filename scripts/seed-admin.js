const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'lawrenceantwi63@gmail.com';
    const password = 'elder100';
    const name = 'Admin User';

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const admin = await prisma.adminAccount.upsert({
            where: { admin_email: email },
            update: {
                admin_password: hashedPassword,
                admin_name: name,
            },
            create: {
                admin_email: email,
                admin_password: hashedPassword,
                admin_name: name,
            },
        });

        console.log('Seeded admin account:', admin.admin_email);
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
