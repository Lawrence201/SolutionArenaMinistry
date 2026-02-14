import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export Financial Report to PDF
 * Replicating legacy exportFinancePDF function
 */
export async function exportFinancePDF(data: any) {
    try {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text('Financial Analytics Report', 14, 20);

        // Date
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

        // Summary Section
        doc.setFontSize(14);
        doc.text('Financial Summary', 14, 40);

        doc.setFontSize(10);
        let yPos = 50;

        // Summary data
        const summaryData = [
            ['Total Income', data.totalIncome || '₵0.00'],
            ['Total Expenses', data.totalExpenses || '₵0.00'],
            ['Net Balance', data.netBalance || '₵0.00'],
            ['Financial Health', (data.financialHealth || 0) + '%']
        ];

        summaryData.forEach(([label, value]) => {
            doc.text(`${label}: ${value}`, 14, yPos);
            yPos += 8;
        });

        // Category Breakdown Table
        if (data.categories && data.categories.length > 0) {
            yPos += 10;
            doc.setFontSize(14);
            doc.text('Category Breakdown', 14, yPos);
            yPos += 8;

            autoTable(doc, {
                startY: yPos,
                head: [['Category', 'Amount']],
                body: data.categories.map((cat: any) => [cat.name, cat.amount]),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] }
            });
        }

        // Save
        doc.save('financial-analytics.pdf');
        return true;
    } catch (error) {
        console.error('PDF export error:', error);
        return false;
    }
}

/**
 * Export Communication Report to PDF
 */
export async function exportCommunicationPDF(data: any) {
    try {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text('Communication Analytics Report', 14, 20);

        // Date
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

        // Summary
        doc.setFontSize(12);
        doc.text('Summary:', 14, 40);

        doc.setFontSize(10);
        doc.text(`Total Messages Sent: ${data.totalMessages || 0}`, 14, 50);
        doc.text(`Average Open Rate: ${data.avgOpenRate || 0}%`, 14, 58);

        // Save
        doc.save('communication-analytics.pdf');
        return true;
    } catch (error) {
        console.error('PDF export error:', error);
        return false;
    }
}
