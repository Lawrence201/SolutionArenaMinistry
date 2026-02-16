const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdmin() {
    const email = 'lawrenceantwi63@gmail.com';
    const password = 'elder100';
    const name = 'Admin';

    console.log(`Updating admin account for: ${email}`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.adminAccount.upsert({
            where: { admin_email: email },
            update: {
                admin_password: hashedPassword,
                admin_name: name
            },
            create: {
                admin_email: email,
                admin_password: hashedPassword,
                admin_name: name
            }
        });

        console.log('Success: Admin account updated/created.');
        console.log('Admin ID:', admin.admin_id);
    } catch (error) {
        console.error('Error updating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdmin();
