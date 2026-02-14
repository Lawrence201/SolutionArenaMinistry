import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const accountType = searchParams.get("account");

        if (!accountType) {
            return NextResponse.json(
                { success: false, message: "Account type required" },
                { status: 400 }
            );
        }

        let totalIncome = 0;

        // Calculate total income based on account type
        switch (accountType) {
            case "offering":
                const offerings = await prisma.offering.aggregate({
                    _sum: { amount_collected: true },
                });
                totalIncome = Number(offerings._sum.amount_collected || 0);
                break;

            case "projectoffering":
                const projects = await prisma.projectOffering.aggregate({
                    _sum: { amount_collected: true },
                });
                totalIncome = Number(projects._sum.amount_collected || 0);
                break;

            case "tithe":
                const tithes = await prisma.tithe.aggregate({
                    _sum: { amount: true },
                });
                totalIncome = Number(tithes._sum.amount || 0);
                break;

            case "welfare":
                const welfare = await prisma.welfareContribution.aggregate({
                    _sum: { amount: true },
                });
                totalIncome = Number(welfare._sum.amount || 0);
                break;

            default:
                return NextResponse.json(
                    { success: false, message: "Invalid account type" },
                    { status: 400 }
                );
        }

        // Calculate total withdrawals for this account type
        // Withdrawal table has 'account_type' field matching the switch cases
        const withdrawals = await prisma.withdrawal.aggregate({
            where: {
                account_type: accountType,
            },
            _sum: {
                amount: true,
            },
        });

        const totalWithdrawals = Number(withdrawals._sum.amount || 0);
        const balance = totalIncome - totalWithdrawals;

        return NextResponse.json({
            success: true,
            balance: balance,
            income: totalIncome,
            withdrawals: totalWithdrawals
        });

    } catch (error: any) {
        console.error("Error calculating balance:", error);
        return NextResponse.json(
            { success: false, message: "Error calculating balance" },
            { status: 500 }
        );
    }
}
