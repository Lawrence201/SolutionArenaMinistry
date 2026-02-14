import React from 'react';
import { prisma } from '@/lib/prisma';
import VisitorsClient from './VisitorsClient';

export const dynamic = 'force-dynamic';

export default async function VisitorsPage() {
    const visitors = await prisma.visitor.findMany({
        orderBy: {
            created_at: 'desc',
        },
        include: {
            attendance: true // Including simple relation if needed, though list mostly uses own fields
        }
    });

    return <VisitorsClient initialVisitors={visitors} />;
}
