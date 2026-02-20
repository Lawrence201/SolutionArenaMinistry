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
            case 'stats': {
                const [offeringTotal, titheTotal, projectTotal, welfareTotal, expenseTotal, withdrawalTotal] = await Promise.all([
                    prisma.offering.aggregate({ _sum: { amount_collected: true } }),
                    prisma.tithe.aggregate({ _sum: { amount: true } }),
                    prisma.projectOffering.aggregate({ _sum: { amount_collected: true } }),
                    prisma.welfareContribution.aggregate({ _sum: { amount: true } }),
                    prisma.expense.aggregate({ _sum: { amount: true } }),
                    prisma.withdrawal.aggregate({ _sum: { amount: true } })
                ]);

                return NextResponse.json({
                    success: true,
                    data: {
                        offerings: { total: Number(offeringTotal._sum.amount_collected || 0) },
                        tithes: { total: Number(titheTotal._sum.amount || 0) },
                        project_offerings: { total: Number(projectTotal._sum.amount_collected || 0) },
                        welfare: { total: Number(welfareTotal._sum.amount || 0) },
                        expenses: { total: Number(expenseTotal._sum.amount || 0) + Number(withdrawalTotal._sum.amount || 0) }
                    }
                });
            }
            case 'insights': {
                // Mock insights or calculate basic ones
                const insights = [
                    { icon: 'trending-up', type: 'success', text: 'Offerings have increased by 12% compared to last month.' },
                    { icon: 'alert', type: 'warning', text: 'Utility expenses are 5% higher than budgeted for this period.' },
                    { icon: 'target', type: 'info', text: 'You are on track to reach the annual project offering goal.' }
                ];
                return NextResponse.json({ success: true, data: insights });
            }
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

                // Fetch trends (simplified: last 6 months)
                const trends = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
                    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

                    const [mOff, mTit, mExp, mWithd] = await Promise.all([
                        prisma.offering.aggregate({ where: { date: { gte: mStart, lte: mEnd } }, _sum: { amount_collected: true } }),
                        prisma.tithe.aggregate({ where: { date: { gte: mStart, lte: mEnd } }, _sum: { amount: true } }),
                        prisma.expense.aggregate({ where: { date: { gte: mStart, lte: mEnd } }, _sum: { amount: true } }),
                        prisma.withdrawal.aggregate({ where: { date: { gte: mStart, lte: mEnd } }, _sum: { amount: true } })
                    ]);

                    const mInc = (Number(mOff._sum.amount_collected) || 0) + (Number(mTit._sum.amount) || 0);
                    const mExpTotal = (Number(mExp._sum.amount) || 0) + (Number(mWithd._sum.amount) || 0);

                    trends.push({
                        month: mStart.toLocaleString('default', { month: 'short' }),
                        income: mInc,
                        expenses: mExpTotal,
                        balance: mInc - mExpTotal
                    });
                }

                // Recent transactions (merged)
                const [recentOff, recentTit, recentExp] = await Promise.all([
                    prisma.offering.findMany({ take: 5, orderBy: { date: 'desc' } }),
                    prisma.tithe.findMany({ take: 5, orderBy: { date: 'desc' }, include: { member: true } }),
                    prisma.expense.findMany({ take: 5, orderBy: { date: 'desc' } })
                ]);

                const recent_transactions = [
                    ...recentOff.map(o => ({ id: o.transaction_id, transaction_id: o.transaction_id, date: o.date.toISOString(), type: 'Offering', category: 'General', amount: Number(o.amount_collected) })),
                    ...recentTit.map(t => ({ id: t.transaction_id, transaction_id: t.transaction_id, date: t.date.toISOString(), type: 'Tithe', member: t.member ? `${t.member.first_name} ${t.member.last_name}` : 'Unknown', category: 'Tithe', amount: Number(t.amount) })),
                    ...recentExp.map(e => ({ id: e.transaction_id, transaction_id: e.transaction_id, date: e.date.toISOString(), type: 'Expense', description: e.description, category: e.category, amount: Number(e.amount) }))
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

                const categories = [
                    { name: 'Offerings', value: Number(off._sum.amount_collected) || 0, color: '#10B981' },
                    { name: 'Tithes', value: Number(tit._sum.amount) || 0, color: '#3B82F6' },
                    { name: 'Projects', value: Number(proj._sum.amount_collected) || 0, color: '#F59E0B' },
                    { name: 'Welfare', value: Number(wel._sum.amount) || 0, color: '#E879F9' }
                ];

                return NextResponse.json({
                    success: true,
                    data: {
                        summary: {
                            total_income: income,
                            total_expenses: expenses,
                            net_balance: income - expenses,
                            recent_transactions_count: recent_transactions.length
                        },
                        trends,
                        categories,
                        recent_transactions
                    }
                });
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
            case 'welfare': {
                const welfare = await prisma.welfareContribution.findMany({ where: { date: { gte: start, lte: end } }, include: { member: { select: { first_name: true, last_name: true, email: true, photo_path: true } } }, orderBy: { date: 'desc' }, take: 100 });
                const [total, unique, withd] = await Promise.all([
                    prisma.welfareContribution.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
                    prisma.welfareContribution.groupBy({ by: ['member_id'] }),
                    prisma.withdrawal.aggregate({ where: { account_type: 'Welfare' }, _sum: { amount: true } })
                ]);
                const totalAmount = Number(total?._sum?.amount || 0);
                const withdAmount = Number(withd?._sum?.amount || 0);
                return NextResponse.json({ success: true, data: { welfare: welfare.map(w => ({ ...w, amount: Number(w.amount), member_name: w.member ? `${w.member.first_name} ${w.member.last_name}` : 'Unknown', member_email: w.member?.email || '', member_photo: w.member?.photo_path || '' })), summary: { total_amount: totalAmount - withdAmount, gross_amount: totalAmount, total_withdrawals: withdAmount, total_count: total?._count?._all || 0, unique_members: unique.length, avg_amount: unique.length > 0 ? totalAmount / unique.length : 0 } } });
            }
            case 'project-offerings': {
                const records = await prisma.projectOffering.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: 'desc' }, take: 100 });
                return NextResponse.json({ success: true, data: { records: records.map(r => ({ ...r, amount: Number(r.amount_collected) })) } });
            }
            case 'withdrawals': {
                const account = searchParams.get('account_type');
                const purpose = searchParams.get('purpose');
                const where: any = { date: { gte: start, lte: end } };
                if (account && account !== 'all') where.account_type = account;
                if (purpose && purpose !== 'all') where.purpose = purpose;
                const withdrawals = await prisma.withdrawal.findMany({ where, orderBy: { date: 'desc' }, take: 100 });
                const [total, off, tit, projWel] = await Promise.all([
                    prisma.withdrawal.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
                    prisma.withdrawal.aggregate({ where: { account_type: 'Offering' }, _sum: { amount: true }, _count: { _all: true } }),
                    prisma.withdrawal.aggregate({ where: { account_type: 'Tithe' }, _sum: { amount: true }, _count: { _all: true } }),
                    prisma.withdrawal.aggregate({ where: { account_type: { in: ['Project', 'Welfare'] } }, _sum: { amount: true }, _count: { _all: true } })
                ]);
                return NextResponse.json({ success: true, data: { withdrawals: withdrawals.map(w => ({ ...w, amount: Number(w.amount) })), summary: { total_amount: Number(total?._sum?.amount || 0), total_count: total?._count?._all || 0, offering_total: Number(off?._sum?.amount || 0), offering_count: off?._count?._all || 0, tithe_total: Number(tit?._sum?.amount || 0), tithe_count: tit?._count?._all || 0, project_welfare_total: Number(projWel?._sum?.amount || 0), project_welfare_count: projWel?._count?._all || 0 } } });
            }
            case 'member-payments': {
                const action = searchParams.get('action');
                if (action === 'get_members') {
                    const members = await prisma.member.findMany({ select: { member_id: true, first_name: true, last_name: true, email: true, phone: true, photo_path: true } });
                    return NextResponse.json({ success: true, data: members.map(m => ({ ...m, id: m.member_id, full_name: `${m.first_name} ${m.last_name}` })) });
                } else {
                    const memberId = parseInt(searchParams.get('member_id') || '0');
                    const [member, tithes, welfare] = await Promise.all([
                        prisma.member.findUnique({ where: { member_id: memberId } }),
                        prisma.tithe.findMany({ where: { member_id: memberId, date: { gte: start, lte: end } }, orderBy: { date: 'desc' } }),
                        prisma.welfareContribution.findMany({ where: { member_id: memberId, date: { gte: start, lte: end } }, orderBy: { date: 'desc' } })
                    ]);
                    if (!member) return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
                    const totalTithes = tithes.reduce((sum, t) => sum + Number(t.amount), 0);
                    const totalWelfare = welfare.reduce((sum, w) => sum + Number(w.amount), 0);
                    return NextResponse.json({ success: true, data: { member_info: { id: member.member_id, full_name: `${member.first_name} ${member.last_name}`, email: member.email, phone: member.phone, photo_path: member.photo_path }, tithes: tithes.map(t => ({ ...t, amount: Number(t.amount) })), welfare: welfare.map(w => ({ ...w, amount: Number(w.amount) })), summary: { total_tithes: totalTithes, tithe_count: tithes.length, total_welfare: totalWelfare, welfare_count: welfare.length, grand_total: totalTithes + totalWelfare, total_transactions: tithes.length + welfare.length } } });
                }
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
                const t = await prisma.tithe.create({ data: { transaction_id: `CPS${Date.now()}`, member_id: body.member_id, date: new Date(body.date), amount: parseFloat(body.amount), payment_method: body.payment_method as any, receipt_number: body.receipt_number || '', notes: body.notes || '' } });
                return NextResponse.json({ success: true, data: t });
            }
            case 'offerings': {
                const o = await prisma.offering.create({ data: { transaction_id: `OFF${Date.now()}`, date: new Date(body.date), service_type: body.service_type as any, amount_collected: parseFloat(body.amount_collected), collection_method: body.collection_method as any, counted_by: body.counted_by, notes: body.notes || '', status: (body.status === 'Verified' ? 'Approved' : 'Pending') as any } });
                return NextResponse.json({ success: true, data: o });
            }
            case 'expenses': {
                const e = await prisma.expense.create({ data: { transaction_id: `EXP${Date.now()}`, date: new Date(body.date), category: body.category as any, description: body.description, amount: parseFloat(body.amount), vendor_payee: body.vendor_payee, payment_method: body.payment_method as any, notes: body.notes || '', status: (body.status || 'Pending') as any } });
                return NextResponse.json({ success: true, data: e });
            }
            case 'welfare': {
                const w = await prisma.welfareContribution.create({ data: { transaction_id: `WEL${Date.now()}`, member_id: body.member_id, date: new Date(body.date), amount: parseFloat(body.amount), payment_method: body.payment_method as any, payment_period: (body.payment_period || 'Monthly') as any, notes: body.notes || '' } });
                return NextResponse.json({ success: true, data: w });
            }
            case 'withdrawals': {
                const w = await prisma.withdrawal.create({ data: { transaction_id: `WTH${Date.now()}`, date: new Date(body.date), account_type: body.account_type as any, recipient: body.recipient, purpose: body.purpose, amount: parseFloat(body.amount), authorized_by: body.authorized_by, notes: body.notes || '' } });
                return NextResponse.json({ success: true, data: w });
            }
            case 'project-offerings': {
                const p = await prisma.projectOffering.create({ data: { transaction_id: `PROJ${Date.now()}`, date: new Date(body.date), project_name: body.project_name, service_type: (body.service_type || 'Sunday_Service') as any, amount_collected: parseFloat(body.amount_collected), collection_method: body.collection_method as any, notes: body.notes || '', status: 'Approved' } });
                return NextResponse.json({ success: true, data: p });
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
            case 'welfare': await prisma.welfareContribution.update({ where: { transaction_id: id }, data: { amount: body.amount ? parseFloat(body.amount) : undefined, notes: body.notes } }); break;
            case 'withdrawals': await prisma.withdrawal.update({ where: { transaction_id: id }, data: { amount: body.amount ? parseFloat(body.amount) : undefined, notes: body.notes } }); break;
            case 'project-offerings': await prisma.projectOffering.update({ where: { transaction_id: id }, data: { amount_collected: body.amount_collected ? parseFloat(body.amount_collected) : undefined, notes: body.notes } }); break;
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
            case 'welfare': await prisma.welfareContribution.delete({ where: { transaction_id: id } }); break;
            case 'withdrawals': await prisma.withdrawal.delete({ where: { transaction_id: id } }); break;
            case 'project-offerings': await prisma.projectOffering.delete({ where: { transaction_id: id } }); break;
            default: return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (error: any) { return NextResponse.json({ success: false, message: error.message }, { status: 500 }); }
}
