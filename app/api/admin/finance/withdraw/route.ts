import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            account_type,
            amount,
            recipient,
            purpose,
            authorized_by,
            date,
            notes
        } = body;

        // Validation
        if (!account_type || !amount || !recipient || !purpose || !authorized_by || !date) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid amount" },
                { status: 400 }
            );
        }

        // 1. Check current balance
        let totalIncome = 0;

        switch (account_type) {
            case "offering":
                const off = await prisma.offering.aggregate({ _sum: { amount_collected: true } });
                totalIncome = Number(off._sum.amount_collected || 0);
                break;
            case "projectoffering":
                const proj = await prisma.projectOffering.aggregate({ _sum: { amount_collected: true } });
                totalIncome = Number(proj._sum.amount_collected || 0);
                break;
            case "tithe":
                const tithes = await prisma.tithe.aggregate({ _sum: { amount: true } });
                totalIncome = Number(tithes._sum.amount || 0);
                break;
            case "welfare":
                const wel = await prisma.welfareContribution.aggregate({ _sum: { amount: true } });
                totalIncome = Number(wel._sum.amount || 0);
                break;
            default:
                return NextResponse.json({ success: false, message: "Invalid account type" }, { status: 400 });
        }

        const withdrawals = await prisma.withdrawal.aggregate({
            where: { account_type: account_type },
            _sum: { amount: true }
        });

        const currentWithdrawals = Number(withdrawals._sum.amount || 0);
        const balance = totalIncome - currentWithdrawals;

        if (balance < withdrawAmount) {
            return NextResponse.json(
                { success: false, message: `Insufficient funds. Available: ₵${balance.toFixed(2)}` },
                { status: 400 }
            );
        }

        // 2. Process Withdrawal
        const transactionId = `WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const withdrawal = await prisma.withdrawal.create({
            data: {
                transaction_id: transactionId,
                account_type: account_type,
                amount: withdrawAmount,
                recipient: recipient,
                purpose: purpose,
                authorized_by: authorized_by,
                date: new Date(date),
                notes: notes
            }
        });

        // 3. Log Activity
        await prisma.activityLog.create({
            data: {
                activity_type: "other",
                title: "Withdrawal Processed",
                description: `Withdrew ₵${withdrawAmount} from ${account_type} for ${purpose}`,
            }
        });

        return NextResponse.json({
            success: true,
            message: "Withdrawal processed successfully",
            transaction_id: transactionId,
            new_balance: (balance - withdrawAmount).toFixed(2),
            data: withdrawal
        });

    } catch (error: any) {
        console.error("Error processing withdrawal:", error);
        return NextResponse.json(
            { success: false, message: "Error processing withdrawal" },
            { status: 500 }
        );
    }
}
