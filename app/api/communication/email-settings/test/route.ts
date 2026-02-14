import { NextRequest, NextResponse } from 'next/server';
import { testEmailConfig } from '@/lib/emailHandler';

/**
 * POST /api/communication/email-settings/test
 * Test email configuration by sending a test email
 * Body params:
 * - email: Test recipient email address
 */
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email address required' },
                { status: 400 }
            );
        }

        const result = await testEmailConfig(email);

        if (result) {
            return NextResponse.json({
                success: true,
                message: 'Test email sent successfully! Check your inbox.'
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to send test email. Please check your SMTP settings.'
                },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Error testing email config:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
