import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();

        // Fetch members with birthdays TODAY
        const birthdaysToday = await prisma.$queryRaw`
      SELECT 
        member_id, 
        first_name, 
        last_name, 
        photo_path, 
        birthday_thumb, 
        birthday_title, 
        birthday_message, 
        date_of_birth,
        EXTRACT(DAY FROM date_of_birth)::int as birth_day 
      FROM members 
      WHERE EXTRACT(MONTH FROM date_of_birth) = ${currentMonth}
      AND EXTRACT(DAY FROM date_of_birth) = ${currentDay}
      AND status = 'Active' 
      ORDER BY EXTRACT(DAY FROM date_of_birth) ASC
    ` as any[];

        return NextResponse.json({
            success: true,
            data: birthdaysToday,
        });
    } catch (error: any) {
        console.error('Error fetching birthdays:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch birthdays.',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
