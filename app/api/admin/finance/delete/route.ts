import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { records } = body;

        if (!records || !Array.isArray(records) || records.length === 0) {
            return NextResponse.json(
                { success: false, message: "No records provided" },
                { status: 400 }
            );
        }

        let deletedCount = 0;

        // Process deletions in a transaction
        await prisma.$transaction(async (tx) => {
            for (const record of records) {
                const { id, type } = record;
                if (!id || !type) continue;

                switch (type) {
                    case "offering":
                        // 'id' here is expected to be transaction_id string from frontend
                        await tx.offering.delete({ where: { transaction_id: id } });
                        deletedCount++;
                        break;
                    case "projectoffering":
                        await tx.projectOffering.delete({ where: { transaction_id: id } });
                        deletedCount++;
                        break;
                    case "tithe":
                        await tx.tithe.delete({ where: { transaction_id: id } });
                        deletedCount++;
                        break;
                    case "welfare":
                        await tx.welfareContribution.delete({ where: { transaction_id: id } });
                        deletedCount++;
                        break;
                    case "expense":
                        await tx.expense.delete({ where: { transaction_id: id } });
                        deletedCount++;
                        break;
                    default:
                        // Skip invalid types
                        break;
                }

                // NOTE: Legacy stored deletion logs. We could add that here if needed,
                // but Prisma doesn't natively support "move on delete" without manual logic.
                // For now, simple deletion is sufficient as per standard modern practices unless strict audit required.
            }
        });

        return NextResponse.json({
            success: true,
            message: "Records deleted successfully",
            deleted_count: deletedCount,
        });

    } catch (error: any) {
        console.error("Error deleting records:", error);
        // Handle "Record to delete does not exist" gracefully
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, message: "One or more records could not be found." },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Error deleting records: " + error.message },
            { status: 500 }
        );
    }
}
