-- Email Settings Configuration for Communication Hub
-- Run this SQL script in your PostgreSQL database to configure email settings
-- These match the legacy PHP system configuration

-- Insert/Update email settings
INSERT INTO communication_settings (setting_key, setting_value, setting_type, description)
VALUES 
    ('email_from_name', 'Church Management System', 'email', 'The name that appears as the email sender'),
    ('email_from_address', 'noreply@church.com', 'email', 'The email address that appears as sender (update this to your Gmail)'),
    ('smtp_host', 'smtp.gmail.com', 'email', 'SMTP server host for Gmail'),
    ('smtp_port', '465', 'email', 'SMTP port (465 for SSL, 587 for TLS)'),
    ('smtp_username', '', 'email', 'Your Gmail address (e.g., yourchurch@gmail.com)'),
    ('smtp_password', '', 'email', 'Your Gmail App Password (NOT regular password)'),
    ('smtp_encryption', 'ssl', 'email', 'Encryption method (ssl or tls)')
ON CONFLICT (setting_key) 
DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = CURRENT_TIMESTAMP;

-- View current settings
SELECT setting_key, setting_value, description 
FROM communication_settings 
WHERE setting_type = 'email'
ORDER BY setting_key;
