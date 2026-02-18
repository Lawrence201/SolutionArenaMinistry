import { redirect } from 'next/navigation';

export default function AIAnalyticsPlaceholder() {
    // Redirect to the Reports page which is the main hub for analytics
    redirect('/admin/reports');
    return null;
}
