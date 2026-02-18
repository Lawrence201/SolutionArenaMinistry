import { redirect } from 'next/navigation';

export default function AIReportsPlaceholder() {
    // Redirect to the Reports page
    redirect('/admin/reports');
    return null;
}
