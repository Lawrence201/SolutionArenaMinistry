
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/recent-activities?limit=5',
    method: 'GET',
};

// Note: This script assumes the dev server is running locally on port 3000.
// Since I cannot run the dev server and this script simultaneously easily if it's not already running,
// I will instead use prisma directly in a script to verify what the query returns.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const limit = 5;
    const activities = await prisma.activityLog.findMany({
        orderBy: { created_at: 'desc' },
        take: limit
    });
    console.log('Result length:', activities.length);
    activities.forEach((a, i) => {
        console.log(`${i + 1}: ${a.title}`);
    });
    await prisma.$disconnect();
}

main().catch(console.error);
