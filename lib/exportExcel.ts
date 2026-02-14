import * as XLSX from 'xlsx';

/**
 * Export Financial Report to Excel
 * Replicating legacy exportFinanceExcel function
 */
export async function exportFinanceExcel(data: any) {
    try {
        // Prepare workbook
        const wb = XLSX.utils.book_new();

        // Summary sheet
        const summaryData = [
            ['Financial Analytics Summary'],
            ['Generated:', new Date().toLocaleDateString()],
            [''],
            ['Metric', 'Value'],
            ['Total Income', data.totalIncome || '₵0.00'],
            ['Total Expenses', data.totalExpenses || '₵0.00'],
            ['Net Balance', data.netBalance || '₵0.00'],
            ['Financial Health', (data.financialHealth || 0) + '%']
        ];

        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

        // Category Breakdown sheet
        if (data.categories && data.categories.length > 0) {
            const categoryData = [
                ['Category', 'Amount']
            ];

            data.categories.forEach((cat: any) => {
                categoryData.push([cat.name, cat.amount]);
            });

            const ws2 = XLSX.utils.aoa_to_sheet(categoryData);
            XLSX.utils.book_append_sheet(wb, ws2, 'Categories');
        }

        // Save
        XLSX.writeFile(wb, 'financial-analytics.xlsx');
        return true;
    } catch (error) {
        console.error('Excel export error:', error);
        return false;
    }
}

/**
 * Export Communication Report to Excel
 */
export async function exportCommunicationExcel(data: any) {
    try {
        const wb = XLSX.utils.book_new();

        // Summary sheet
        const summaryData = [
            ['Communication Analytics Summary'],
            ['Generated:', new Date().toLocaleDateString()],
            [''],
            ['Metric', 'Value'],
            ['Total Messages', data.totals?.total_messages || 0],
            ['Email Sent', data.totals?.email_sent || 0],
            ['SMS Sent', data.totals?.sms_sent || 0],
            ['Push Sent', data.totals?.push_sent || 0],
            ['Average Open Rate', (data.totals?.avg_open_rate || 0) + '%'],
            ['Inbox Count', data.totals?.inbox_count || 0],
            ['Active Users', data.totals?.active_users || 0]
        ];

        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

        // Recent Messages sheet
        if (data.recent_messages && data.recent_messages.length > 0) {
            const messagesData = [
                ['Title', 'Type', 'Audience', 'Channels', 'Sent At', 'Status']
            ];

            data.recent_messages.forEach((msg: any) => {
                messagesData.push([
                    msg.title,
                    msg.type,
                    msg.audience,
                    msg.channels,
                    msg.sent_at,
                    msg.status
                ]);
            });

            const ws2 = XLSX.utils.aoa_to_sheet(messagesData);
            XLSX.utils.book_append_sheet(wb, ws2, 'Recent Messages');
        }

        // Save
        XLSX.writeFile(wb, 'communication-analytics.xlsx');
        return true;
    } catch (error) {
        console.error('Excel export error:', error);
        return false;
    }
}
