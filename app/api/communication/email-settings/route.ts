import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/communication/email-settings
 * Retrieve email settings (SMTP configuration)
 */
export async function GET(req: NextRequest) {
    try {
        const settings = await prisma.communicationSetting.findMany({
            where: { setting_type: 'email' }
        });

        // Format as key-value pairs
        const formattedSettings: any = {};
        settings.forEach(setting => {
            if (setting.setting_key) {
                formattedSettings[setting.setting_key] = setting.setting_value;
            }
        });

        return NextResponse.json({
            success: true,
            settings: formattedSettings
        });

    } catch (error: any) {
        console.error('Error fetching email settings:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/communication/email-settings
 * Update email settings (SMTP configuration)
 * Body params:
 * - email_from_name
 * - email_from_address
 * - smtp_host
 * - smtp_port
 * - smtp_username
 * - smtp_password
 * - smtp_encryption ('tls' | 'ssl')
 */
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const settingsToUpdate = [
            'email_from_name',
            'email_from_address',
            'smtp_host',
            'smtp_port',
            'smtp_username',
            'smtp_password',
            'smtp_encryption'
        ];

        for (const key of settingsToUpdate) {
            if (data[key] !== undefined) {
                await prisma.communicationSetting.upsert({
                    where: { setting_key: key },
                    create: {
                        setting_key: key,
                        setting_value: data[key].toString(),
                        setting_type: 'email',
                        description: `Email setting: ${key}`
                    },
                    update: {
                        setting_value: data[key].toString()
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Email settings updated successfully'
        });

    } catch (error: any) {
        console.error('Error updating email settings:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
