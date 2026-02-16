/**
 * Email Handler for Next.js
 * Handles sending emails using Nodemailer
 */

import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailSettings {
    email_from_name: string;
    email_from_address: string;
    smtp_host: string;
    smtp_port: string | number;
    smtp_username: string;
    smtp_password: string;
    smtp_encryption: string;
}

/**
 * Get email settings from database
 */
export async function getEmailSettings(): Promise<EmailSettings> {
    const defaults: EmailSettings = {
        email_from_name: 'Church Management System',
        email_from_address: 'noreply@church.com',
        smtp_host: 'smtp.gmail.com',
        smtp_port: '587',
        smtp_username: '',
        smtp_password: '',
        smtp_encryption: 'tls'
    };

    try {
        const settings = await prisma.communicationSetting.findMany({
            where: { setting_type: 'email' }
        });

        settings.forEach(setting => {
            if (setting.setting_key && setting.setting_value) {
                (defaults as any)[setting.setting_key] = setting.setting_value;
            }
        });
    } catch (error) {
        console.error('Error loading email settings:', error);
    }

    return defaults;
}

/**
 * Send email to a recipient
 */
export async function sendEmail(
    to: string,
    subject: string,
    body: string,
    messageId?: number
): Promise<boolean> {
    try {
        const settings = await getEmailSettings();

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: settings.smtp_host,
            port: parseInt(settings.smtp_port.toString()),
            secure: settings.smtp_encryption === 'ssl', // true for SSL, false for TLS
            auth: {
                user: settings.smtp_username,
                pass: settings.smtp_password,
            },
            tls: {
                rejectUnauthorized: false // For development only
            }
        });

        // Send email
        const info = await transporter.sendMail({
            from: `"${settings.email_from_name}" <${settings.email_from_address}>`,
            to,
            subject,
            text: body, // Plain text version
            html: body.replace(/\n/g, '<br>'), // HTML version
        });

        // Log success
        await logEmail(messageId, to, subject, body, 'sent', null);
        console.log('Email sent successfully to', to);

        return true;

    } catch (error: any) {
        console.error('Email sending error:', error);

        // Log failure
        await logEmail(messageId, to, subject, body, 'failed', error.message);

        return false;
    }
}

/**
 * Log email to database
 */
async function logEmail(
    messageId: number | undefined,
    email: string,
    subject: string,
    content: string,
    status: string,
    errorMessage: string | null
): Promise<void> {
    try {
        await prisma.emailLog.create({
            data: {
                message_id: messageId || null,
                recipient_email: email,
                subject,
                message_content: content,
                status: status as any,
                error_message: errorMessage,
                sent_at: status === 'sent' ? new Date() : null
            }
        });
    } catch (error: any) {
        console.error('Email log error:', error.message);
    }
}

/**
 * Send bulk emails with batch processing
 */
export async function sendBulkEmails(
    recipients: { email: string; name: string }[],
    subject: string,
    body: string,
    messageId?: number,
    batchSize: number = 50
): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        for (const recipient of batch) {
            if (!recipient.email) continue;

            const success = await sendEmail(recipient.email, subject, body, messageId);
            if (success) {
                sent++;
            } else {
                failed++;
            }
        }

        // Wait between batches to avoid overwhelming SMTP server
        if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return { sent, failed };
}

/**
 * Test email configuration
 */
export async function testEmailConfig(testEmail: string): Promise<boolean> {
    const subject = 'Test Email - Church Management System';
    const body = 'This is a test email. If you receive this, your email configuration is working correctly!';

    return await sendEmail(testEmail, subject, body);
}
