import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || 'month';
        const start = searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : new Date();
        if (!searchParams.get('start_date')) start.setDate(1);
        const end = searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : new Date();
        end.setHours(23, 59, 59, 999);

        switch (slug) {
            case 'overview': {
                const [off, tit, proj, wel, exp, withd] = await Promise.all([
                    prisma.offering.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount_collected: true } }),
                    prisma.tithe.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }),
                    prisma.projectOffering.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount_collected: true } }),
                    prisma.welfareContribution.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }),
                    prisma.expense.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }),
                    prisma.withdrawal.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } })
                ]);
                const income = (Number(off._sum.amount_collected) || 0) + (Number(tit._sum.amount) || 0) + (Number(proj._sum.amount_collected) || 0) + (Number(wel._sum.amount) || 0);
                const expenses = (Number(exp._sum.amount) || 0) + (Number(withd._sum.amount) || 0);
                return NextResponse.json({ success: true, data: { summary: { total_income: income, total_expenses: expenses, net_balance: income - expenses } } });
            }
            case 'stats': {
                const totalIncome = Number((await prisma.offering.aggregate({ _sum: { amount_collected: true } }))._sum.amount_collected || 0) + Number((await prisma.tithe.aggregate({ _sum: { amount: true } }))._sum.amount || 0);
                return NextResponse.json({ success: true, data: { total_income: totalIncome } });
            }
            case 'tithes': {
                const tithes = await prisma.tithe.findMany({ where: { date: { gte: start, lte: end } }, include: { member: { select: { first_name: true, last_name: true } } }, orderBy: { date: 'desc' }, take: 100 });
                return NextResponse.json({ success: true, data: { tithes: tithes.map(t => ({ ...t, member_name: t.member ? `${t.member.first_name} ${t.member.last_name}` : 'Unknown' })) } });
            }
            case 'offerings': {
                const offerings = await prisma.offering.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: 'desc' }, take: 100 });
                return NextResponse.json({ success: true, data: { offerings: offerings.map(o => ({ ...o, amount_collected: Number(o.amount_collected) })) } });
            }
            case 'expenses': {
                const expenses = await prisma.expense.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: 'desc' }, take: 100 });
                return NextResponse.json({ success: true, data: { expenses: expenses.map(e => ({ ...e, amount: Number(e.amount) })) } });
            }
            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const body = await req.json();
        switch (slug) {
            case 'tithes': {
                const t = await prisma.tithe.create({ data: { transaction_id: `CPS${Date.now()}`, member_id: body.member_id, date: new Date(body.date), amount: parseFloat(body.amount), payment_method: body.payment_method, receipt_number: body.receipt_number || '', notes: body.notes || '' } });
                return NextResponse.json({ success: true, data: t });
            }
            case 'offerings': {
                const o = await prisma.offering.create({ data: { transaction_id: `OFF${Date.now()}`, date: new Date(body.date), service_type: body.service_type, amount_collected: parseFloat(body.amount_collected), collection_method: body.collection_method, counted_by: body.counted_by, notes: body.notes || '', status: body.status === 'Verified' ? 'Approved' : 'Pending' } });
                return NextResponse.json({ success: true, data: o });
            }
            case 'expenses': {
                const e = await prisma.expense.create({ data: { transaction_id: `EXP${Date.now()}`, date: new Date(body.date), category: body.category, description: body.description, amount: parseFloat(body.amount), vendor_payee: body.vendor_payee, payment_method: body.payment_method, notes: body.notes || '', status: body.status || 'Pending' } });
                return NextResponse.json({ success: true, data: e });
            }
            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const id = new URL(req.url).searchParams.get('id');
        const body = await req.json();
        if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
        switch (slug) {
            case 'tithes': await prisma.tithe.update({ where: { transaction_id: id }, data: { amount: body.amount ? parseFloat(body.amount) : undefined, notes: body.notes } }); break;
            case 'offerings': await prisma.offering.update({ where: { transaction_id: id }, data: { amount_collected: body.amount_collected ? parseFloat(body.amount_collected) : undefined, notes: body.notes } }); break;
            case 'expenses': await prisma.expense.update({ where: { transaction_id: id }, data: { amount: body.amount ? parseFloat(body.amount) : undefined, status: body.status } }); break;
            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Updated successfully" });
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const { slug: slugArr } = await params;
        const slug = (slugArr || []).join('/');
        const id = new URL(req.url).searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
        switch (slug) {
            case 'tithes': await prisma.tithe.delete({ where: { transaction_id: id } }); break;
            case 'offerings': await prisma.offering.delete({ where: { transaction_id: id } }); break;
            case 'expenses': await prisma.expense.delete({ where: { transaction_id: id } }); break;
            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}
