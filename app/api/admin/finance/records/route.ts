import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const type = searchParams.get("type");
        const search = searchParams.get("search");
        const date = searchParams.get("date");

        if (!type) {
            return NextResponse.json({ success: false, message: "Type is required" }, { status: 400 });
        }

        let data = [];
        let whereClause: any = {};

        if (date) {
            whereClause.date = new Date(date);
        }

        switch (type) {
            case "offering":
                if (search) {
                    whereClause.OR = [
                        { serviceType: { contains: search, mode: 'insensitive' } },
                        { notes: { contains: search, mode: 'insensitive' } },
                        { transactionId: { contains: search, mode: 'insensitive' } }
                    ];
                }
                data = await prisma.offering.findMany({
                    where: whereClause,
                    orderBy: { date: 'desc' },
                    take: 50
                });
                break;

            case "projectoffering":
                if (search) {
                    whereClause.OR = [
                        { projectName: { contains: search, mode: 'insensitive' } },
                        { serviceType: { contains: search, mode: 'insensitive' } },
                        { notes: { contains: search, mode: 'insensitive' } },
                        { transactionId: { contains: search, mode: 'insensitive' } }
                    ];
                }
                data = await prisma.projectOffering.findMany({
                    where: whereClause,
                    orderBy: { date: 'desc' },
                    take: 50
                });
                break;

            case "tithe":
                // For relational search, it's tricker with Prisma findMany top-level OR, 
                // but we can search on member relation
                if (search) {
                    whereClause.OR = [
                        { member: { first_name: { contains: search, mode: 'insensitive' } } },
                        { member: { last_name: { contains: search, mode: 'insensitive' } } },
                        { member: { email: { contains: search, mode: 'insensitive' } } },
                        { transaction_id: { contains: search, mode: 'insensitive' } },
                        { receipt_number: { contains: search, mode: 'insensitive' } }
                    ];
                }
                data = await prisma.tithe.findMany({
                    where: whereClause,
                    include: { member: { select: { first_name: true, last_name: true, email: true } } },
                    orderBy: { date: 'desc' },
                    take: 50
                });
                // Transform for frontend
                data = data.map((item: any) => ({
                    ...item,
                    member_name: item.member ? `${item.member.first_name} ${item.member.last_name}` : 'Unknown',
                    member_email: item.member?.email
                }));
                break;

            case "welfare":
                if (search) {
                    whereClause.OR = [
                        { member: { first_name: { contains: search, mode: 'insensitive' } } },
                        { member: { last_name: { contains: search, mode: 'insensitive' } } },
                        { transaction_id: { contains: search, mode: 'insensitive' } }
                    ];
                }
                data = await prisma.welfareContribution.findMany({
                    where: whereClause,
                    include: { member: { select: { first_name: true, last_name: true, email: true } } },
                    orderBy: { date: 'desc' },
                    take: 50
                });
                data = data.map((item: any) => ({
                    ...item,
                    member_name: item.member ? `${item.member.first_name} ${item.member.last_name}` : 'Unknown',
                    member_email: item.member?.email
                }));
                break;

            case "expense": // Although not explicitly in legacy JS list, good to have
                if (search) {
                    whereClause.OR = [
                        { category: { contains: search } }, // ExpenseCategory is enum, simplified
                        { description: { contains: search, mode: 'insensitive' } },
                        { vendor_payee: { contains: search, mode: 'insensitive' } }
                    ];
                }
                data = await prisma.expense.findMany({
                    where: whereClause,
                    orderBy: { date: 'desc' },
                    take: 50
                });
                break;
        }

        // Normalize data structure for frontend
        const normalizedData = data.map((record: any) => ({
            id: record.offering_id || record.project_offering_id || record.tithe_id || record.welfare_id || record.expense_id,
            transaction_id: record.transaction_id,
            date: record.date,
            amount: record.amount || record.amount_collected,
            // Specific fields
            service_type: record.service_type,
            service_time: record.service_time,
            project_name: record.project_name,
            transactionId: record.transaction_id,
            member_name: record.member_name,
            member_email: record.member_email,
            description: record.description,
            notes: record.notes
        }));

        return NextResponse.json({ success: true, data: normalizedData });

    } catch (error) {
        console.error("Error fetching records:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { ids, type } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0 || !type) {
            return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
        }

        let deletionResult;

        switch (type) {
            case 'offering':
                deletionResult = await prisma.offering.deleteMany({
                    where: { offering_id: { in: ids } }
                });
                break;
            case 'projectoffering':
                deletionResult = await prisma.projectOffering.deleteMany({
                    where: { project_offering_id: { in: ids } }
                });
                break;
            case 'tithe':
                deletionResult = await prisma.tithe.deleteMany({
                    where: { tithe_id: { in: ids } }
                });
                break;
            case 'welfare':
                deletionResult = await prisma.welfareContribution.deleteMany({
                    where: { welfare_id: { in: ids } }
                });
                break;
            case 'expense':
                deletionResult = await prisma.expense.deleteMany({
                    where: { expense_id: { in: ids } }
                });
                break;
            default: return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json({ success: true, count: deletionResult.count });

    } catch (error) {
        console.error("Error deleting records:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
