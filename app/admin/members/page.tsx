import { Suspense } from 'react';
import { getMemberStats, getMembers, getMemberFilters, getMemberInsights } from '@/app/actions/memberActions';
import MembersDashboard from '@/components/Admin/members/MembersDashboard';

export default async function MembersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Await searchParams as it's now a Promise in Next.js 15
    const resolvedSearchParams = await searchParams;
    const filters = await getMemberFilters(resolvedSearchParams);

    // Fetch data sequentially to prevent database connection pool exhaustion
    const stats = await getMemberStats();
    const members = await getMembers(filters);
    const insightsResult = await getMemberInsights();

    const insights = insightsResult.success ? insightsResult.data : [];

    return (
        <Suspense fallback={<div>Loading members...</div>}>
            <MembersDashboard
                stats={stats}
                members={members}
                insights={insights}
            />
        </Suspense>
    );
}
