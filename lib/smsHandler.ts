/**
 * SMS Handler for Next.js
 * Handles sending SMS using Twilio or Africa's Talking
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SMSSettings {
    sms_provider: string;
    sms_api_key: string;
    sms_api_secret: string;
    sms_sender_id: string;
    max_sms_per_batch: string;
}

/**
 * Get SMS settings from database
 */
export async function getSMSSettings(): Promise<SMSSettings> {
    const defaults: SMSSettings = {
        sms_provider: 'none',
        sms_api_key: '',
        sms_api_secret: '',
        sms_sender_id: 'CHURCH',
        max_sms_per_batch: '100'
    };

    try {
        const settings = await prisma.communicationSetting.findMany({
            where: { setting_type: 'sms' }
        });

        settings.forEach(setting => {
            if (setting.setting_key && setting.setting_value) {
                (defaults as any)[setting.setting_key] = setting.setting_value;
            }
        });
    } catch (error) {
        console.error('Error loading SMS settings:', error);
    }

    return defaults;
}

/**
 * Send SMS to a recipient
 */
export async function sendSMS(
    phone: string,
    message: string,
    messageId?: number
): Promise<boolean> {
    try {
        const settings = await getSMSSettings();

        if (settings.sms_provider === 'none') {
            console.log('SMS SIMULATED: To:', phone, 'Message:', message);
            // Simulate success for development
            await logSMS(messageId, phone, message, 'sent', 'simulated', null);
            return true;
        }

        let result = false;

        switch (settings.sms_provider) {
            case 'twilio':
                result = await sendViaTwilio(phone, message, settings, messageId);
                break;

            case 'africastalking':
                result = await sendViaAfricasTalking(phone, message, settings, messageId);
                break;

            default:
                throw new Error('Invalid SMS provider');
        }

        await logSMS(messageId, phone, message, result ? 'sent' : 'failed', settings.sms_provider, null);
        return result;

    } catch (error: any) {
        const settings = await getSMSSettings();
        await logSMS(messageId, phone, message, 'failed', settings.sms_provider, error.message);
        console.error('SMS error:', error);
        return false;
    }
}

/**
 * Send SMS via Twilio
 */
async function sendViaTwilio(
    phone: string,
    message: string,
    settings: SMSSettings,
    messageId?: number
): Promise<boolean> {
    const accountSid = settings.sms_api_key;
    const authToken = settings.sms_api_secret;
    const fromNumber = settings.sms_sender_id;

    if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not configured');
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams({
        From: fromNumber,
        To: phone,
        Body: message
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });

    if (response.ok) {
        return true;
    } else {
        const error = await response.json();
        throw new Error(error.message || 'Twilio API error');
    }
}

/**
 * Send SMS via Africa's Talking
 */
async function sendViaAfricasTalking(
    phone: string,
    message: string,
    settings: SMSSettings,
    messageId?: number
): Promise<boolean> {
    const username = settings.sms_api_key;
    const apiKey = settings.sms_api_secret;
    const from = settings.sms_sender_id;

    if (!username || !apiKey) {
        throw new Error("Africa's Talking credentials not configured");
    }

    const url = 'https://api.africastalking.com/version1/messaging';

    const formData = new URLSearchParams({
        username,
        to: phone,
        message,
        from
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'apiKey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });

    if (response.ok) {
        const result = await response.json();
        if (result.SMSMessageData?.Recipients?.length > 0) {
            return true;
        }
    }

    const text = await response.text();
    throw new Error("Africa's Talking API error: " + text);
}

/**
 * Log SMS to database
 */
async function logSMS(
    messageId: number | undefined,
    phone: string,
    content: string,
    status: string,
    provider: string,
    errorMessage: string | null
): Promise<void> {
    try {
        await prisma.smsLog.create({
            data: {
                message_id: messageId || null,
                recipient_phone: phone,
                message_content: content,
                status,
                provider,
                error_message: errorMessage,
                sent_at: status === 'sent' ? new Date() : null
            }
        });
    } catch (error: any) {
        console.error('SMS log error:', error.message);
    }
}

/**
 * Send bulk SMS with batch processing
 */
export async function sendBulkSMS(
    recipients: { phone: string; name: string }[],
    message: string,
    messageId?: number,
    batchSize: number = 100
): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        for (const recipient of batch) {
            if (!recipient.phone) continue;

            const success = await sendSMS(recipient.phone, message, messageId);
            if (success) {
                sent++;
            } else {
                failed++;
            }
        }

        // Wait between batches to avoid API rate limiting
        if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return { sent, failed };
}

/**
 * Validate and format phone number
 */
export function validatePhoneNumber(phone: string): string {
    // Remove spaces, dashes, parentheses
    let cleaned = phone.replace(/[^0-9+]/g, '');

    // If doesn't start with +, you may want to add country code
    // Example for Ghana: if (!cleaned.startsWith('+')) cleaned = '+233' + cleaned.replace(/^0/, '');

    return cleaned;
}

/**
 * Test SMS configuration
 */
export async function testSMSConfig(testPhone: string): Promise<boolean> {
    const message = 'Test SMS from Church Management System. Your SMS is working!';
    return await sendSMS(testPhone, message);
}

/**
 * Get SMS character count and number of messages
 */
export function getSMSInfo(message: string): { characters: number; messages: number; cost_estimate: number } {
    const length = message.length;
    const singleSMSLength = 160;
    const multiSMSLength = 153;

    const parts = length <= singleSMSLength ? 1 : Math.ceil(length / multiSMSLength);

    return {
        characters: length,
        messages: parts,
        cost_estimate: parts * 0.05 // Adjust based on your provider
    };
}
