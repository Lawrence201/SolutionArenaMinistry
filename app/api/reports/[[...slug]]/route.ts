import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'overview';
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        switch (slug) {
            case 'attendance': {
                if (type === 'overview') {
                    const totalMembers = await prisma.member.count();
                    const attended = (await prisma.attendance.groupBy({ by: ['member_id'], where: { check_in_date: { gte: startOfMonth }, status: 'present' } })).length;
                    const visitors = await prisma.attendance.count({ where: { check_in_date: { gte: startOfMonth }, status: 'visitor' } });
                    return NextResponse.json({ success: true, data: { total_members: totalMembers, members_attended: attended, total_visitors: visitors, attendance_rate: totalMembers > 0 ? (attended / totalMembers) * 100 : 0 } });
                }
                return NextResponse.json({ success: true, data: {} });
            }
            case 'financial': {
                const [off, tit, proj, wel, exp, withd] = await Promise.all([
                    prisma.offering.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount_collected: true } }),
                    prisma.tithe.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),
                    prisma.projectOffering.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount_collected: true } }),
                    prisma.welfareContribution.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),
                    prisma.expense.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),
                    prisma.withdrawal.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } })
                ]);
                const income = (Number(off._sum.amount_collected) || 0) + (Number(tit._sum.amount) || 0) + (Number(proj._sum.amount_collected) || 0) + (Number(wel._sum.amount) || 0);
                const expenses = (Number(exp._sum.amount) || 0) + (Number(withd._sum.amount) || 0);
                return NextResponse.json({ success: true, data: { total_income: income, total_expenses: expenses, net_income: income - expenses } });
            }
            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}
