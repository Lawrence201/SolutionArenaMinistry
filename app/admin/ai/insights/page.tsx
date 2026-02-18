import { redirect } from 'next/navigation';

export default function AIInsightsPlaceholder() {
    // Redirect to the Finance page which already has AI insights integrated
    redirect('/admin/finance');
    return null;
}
