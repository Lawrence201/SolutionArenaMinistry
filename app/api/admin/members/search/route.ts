import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get("query");

        // If no query, return recent members
        const whereClause = query ? {
            OR: [
                { first_name: { contains: query, mode: "insensitive" } },
                { last_name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
            ],
        } : {};

        const members = await prisma.member.findMany({
            where: whereClause as any,
            orderBy: { created_at: 'desc' },
            select: {
                member_id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                photo_path: true,
            },
            take: 20, // Limit results
        });

        // Format for frontend
        const formattedMembers = members.map((m) => ({
            id: m.member_id,
            full_name: `${m.first_name} ${m.last_name}`,
            email: m.email,
            phone: m.phone,
            photo_path: m.photo_path,
        }));

        return NextResponse.json({ success: true, members: formattedMembers });
    } catch (error: any) {
        console.error("Error searching members:", error);
        return NextResponse.json(
            { success: false, message: "Error searching members" },
            { status: 500 }
        );
    }
}
