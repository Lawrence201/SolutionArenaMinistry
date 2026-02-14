import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to convert display string to Prisma ServiceType enum
function toServiceType(str: string): string {
    const map: Record<string, string> = {
        "Sunday Worship": "Sunday_Worship",
        "Wednesday Service": "Wednesday_Service",
        "Prayer Meeting": "Prayer_Meeting",
        "Special Offering": "Special_Offering",
        "Special Project Offering": "Special_Project_Offering"
    };
    return map[str] || "Sunday_Worship";
}

// Helper function to convert display string to Prisma PaymentMethod enum
function toPaymentMethod(str: string): string {
    const map: Record<string, string> = {
        "Cash": "Cash",
        "Mobile Money": "Mobile_Money",
        "Bank Transfer": "Bank_Transfer",
        "Cheque": "Cheque",
        "Mixed": "Mixed"
    };
    return map[str] || "Cash";
}

// Helper function to convert display string to Prisma WelfarePaymentPeriod enum
function toWelfarePaymentPeriod(str: string): string {
    const map: Record<string, string> = {
        "Monthly": "Monthly",
        "Quarterly": "Quarterly",
        "Annually": "Annually"
    };
    return map[str] || "Monthly";
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, date, paymentMethod } = body;

        if (!type || !date || !paymentMethod) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate a unique transaction ID
        const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const dateObj = new Date(date);
        const paymentMethodEnum = toPaymentMethod(paymentMethod) as any;

        let result;

        switch (type) {
            case "offering":
                result = await prisma.offering.create({
                    data: {
                        transaction_id: transactionId,
                        date: dateObj,
                        service_type: toServiceType(body.serviceType) as any,
                        service_time: body.serviceTime ? new Date(`1970-01-01T${body.serviceTime}:00`) : null,
                        amount_collected: parseFloat(body.amount),
                        collection_method: paymentMethodEnum,
                        counted_by: body.countedBy,
                        notes: body.notes,
                        status: "Pending",
                    },
                });
                break;

            case "projectoffering":
                result = await prisma.projectOffering.create({
                    data: {
                        transaction_id: transactionId,
                        date: dateObj,
                        service_type: toServiceType(body.serviceType) as any,
                        service_time: body.serviceTime ? new Date(`1970-01-01T${body.serviceTime}:00`) : null,
                        project_name: body.projectName,
                        amount_collected: parseFloat(body.amount),
                        collection_method: paymentMethodEnum,
                        counted_by: body.countedBy,
                        notes: body.notes,
                        status: "Pending",
                    },
                });
                break;

            case "tithe":
                result = await prisma.tithe.create({
                    data: {
                        transaction_id: transactionId,
                        date: dateObj,
                        member_id: body.memberId ? parseInt(body.memberId) : null,
                        amount: parseFloat(body.amount),
                        payment_method: paymentMethodEnum,
                        receipt_number: body.receiptNumber,
                        notes: body.notes,
                        status: "Paid",
                    },
                });
                break;

            case "welfare":
                result = await prisma.welfareContribution.create({
                    data: {
                        transaction_id: transactionId,
                        date: dateObj,
                        member_id: body.memberId ? parseInt(body.memberId) : null,
                        amount: parseFloat(body.amount),
                        payment_method: paymentMethodEnum,
                        payment_period: toWelfarePaymentPeriod(body.paymentPeriod) as any,
                        status: body.status || "Paid",
                        notes: body.notes,
                    },
                });
                break;

            case "expense":
                result = await prisma.expense.create({
                    data: {
                        transaction_id: transactionId,
                        date: dateObj,
                        category: body.category,
                        custom_category: body.customCategory,
                        description: body.description,
                        vendor_payee: body.vendor,
                        amount: parseFloat(body.amount),
                        payment_method: paymentMethodEnum,
                        status: body.status || "Pending",
                        notes: body.notes,
                    },
                });
                break;

            default:
                return NextResponse.json(
                    { success: false, message: "Invalid transaction type" },
                    { status: 400 }
                );
        }

        // Log the activity
        await prisma.activityLog.create({
            data: {
                activity_type: "donation_recorded",
                title: `${type.charAt(0).toUpperCase() + type.slice(1)} Recorded`,
                description: `Recorded ${type} of amount ${body.amount}`,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Record saved successfully",
            transaction_id: transactionId,
            data: result,
        });
    } catch (error: any) {
        console.error("Error creating finance record:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
