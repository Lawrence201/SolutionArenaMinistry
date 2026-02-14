import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/finance/budget
 * Fetch the monthly budget setting
 * 
 * POST /api/finance/budget
 * Update the monthly budget setting
 */

export async function GET() {
    try {
        const budget = await prisma.budgetSetting.findFirst({
            where: { setting_name: 'Monthly Budget' }
        });

        return NextResponse.json({
            success: true,
            data: {
                monthly_budget: Number(budget?.setting_value) || 0
            }
        });
    } catch (error) {
        console.error('Error fetching budget:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch budget'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const amount = parseFloat(body.amount);

        if (isNaN(amount) || amount < 0) {
            return NextResponse.json({
                success: false,
                error: 'Invalid budget amount'
            }, { status: 400 });
        }

        const budget = await prisma.budgetSetting.upsert({
            where: { setting_name: 'Monthly Budget' },
            update: { setting_value: amount },
            create: {
                setting_name: 'Monthly Budget',
                setting_value: amount,
                description: 'Total monthly budget for church expenses'
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                monthly_budget: Number(budget.setting_value)
            },
            message: 'Budget updated successfully'
        });
    } catch (error) {
        console.error('Error updating budget:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update budget'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
