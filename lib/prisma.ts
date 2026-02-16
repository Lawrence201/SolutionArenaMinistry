import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Helper to add connection limit to URL
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL;
    if (!url) return undefined;

    // ALWAYS limit connections to avoid pool exhaustion
    // Next.js dev/build runs multiple workers/requests, each potentially creating connections.
    const hasQuery = url.includes('?');
    const separator = hasQuery ? '&' : '?';
    // Check if connection_limit is already set
    if (!url.includes('connection_limit')) {
        return `${url}${separator}connection_limit=2`;
    }
    return url;
};

const databaseUrl = getDatabaseUrl();

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasources: databaseUrl ? {
            db: {
                url: databaseUrl,
            },
        } : undefined,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


