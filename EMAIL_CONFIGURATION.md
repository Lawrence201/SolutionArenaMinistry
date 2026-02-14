# Email Configuration Guide

## Quick Setup

The Communication Hub email system is now ready. You need to configure SMTP settings to send emails.

### Option 1: Using pgAdmin (Recommended)

1. Open **pgAdmin**
2. Connect to your `church_management_system` database
3. Click **Tools** → **Query Tool**
4. Open the file: [`configure_email_settings.sql`](file:///c:/xampp/htdocs/Church_Management_System/Church_Management_System/configure_email_settings.sql)
5. **Update these values** before running:
   - `email_from_address`: Your Gmail (e.g., `yourchurch@gmail.com`)
   - `smtp_username`: Same Gmail address
   - `smtp_password`: Your Gmail App Password (see steps below)
6. Click **Execute** (F5)

### Option 2: Manual Update via pgAdmin

1. Open pgAdmin → Navigate to `communication_settings` table
2. Add/update these rows:

| setting_key | setting_value | setting_type |
|-------------|---------------|--------------|
| `email_from_name` | Church Management System | email |
| `email_from_address` | yourchurch@gmail.com | email |
| `smtp_host` | smtp.gmail.com | email |
| `smtp_port` | 465 | email |
| `smtp_username` | yourchurch@gmail.com | email |
| `smtp_password` | your-16-char-app-password | email |
| `smtp_encryption` | ssl | email |

---

## How to Get Gmail App Password

> ⚠️ **Important**: You MUST use a Gmail App Password, NOT your regular Gmail password!

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** (left sidebar)
3. Under "How you sign in to Google", click **2-Step Verification**
4. Enable it if not already enabled
5. Scroll down and click **App passwords**
6. Enter your Google password when prompted
7. Select app: **Mail**
8. Select device: **Other (Custom name)**
9. Type: `Church Management System`
10. Click **Generate**
11. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)
12. Paste it in the `smtp_password` field (remove spaces)

---

## Testing Email Configuration

After setting up, test it in the Communication Hub:

1. Go to Communication page: `http://localhost:3000/admin/communication`
2. Fill in the compose form:
   - **Audience**: Select "All Members" or your email
   - **Title**: Test Email
   - **Content**: Testing email configuration
   - **Channel**: Select "Email"
3. Click **Send Now**
4. You should see a success toast notification!

---

## Troubleshooting

### "Failed to send message"
- Check that Gmail App Password is correct (no spaces)
- Verify smtp_username matches email_from_address
- Ensure 2-Step Verification is enabled on Gmail

### "Connection timeout"
- Check port is 465 (for SSL)
- Check encryption is 'ssl'
- Verify Windows Firewall allows port 465

### "Invalid credentials"
- You're using regular Gmail password instead of App Password
- Generate a new App Password and try again

---

## Current Configuration

Based on legacy system:
- **SMTP Host**: smtp.gmail.com
- **Port**: 465 (SSL)
- **Encryption**: SSL
- **Provider**: Gmail

This matches the configuration in your legacy PHP system!
