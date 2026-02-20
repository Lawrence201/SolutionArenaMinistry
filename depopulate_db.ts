import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Starting Database Depopulation...');

    // Get all table names from the database
    // We filter out Prisma's internal tables and the admin accounts to prevent lockout
    const tableNamesResult = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    );

    const tables = tableNamesResult
        .map((t) => t.tablename)
        .filter((name) => name !== '_prisma_migrations' && name !== 'admin_accounts');

    console.log(`📋 Found ${tables.length} tables to truncate.`);

    for (const table of tables) {
        try {
            console.log(`   - Truncating ${table}...`);
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${table}" CASCADE;`);
        } catch (error) {
            console.error(`❌ Failed to truncate ${table}:`, error);
        }
    }

    console.log('✅ Depopulation Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
