import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: { finalY: number }; // Add other properties if needed
    }
}

// Helper to load image for PDF
const loadImageForPDF = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

export const exportToExcel = (members: any[]) => {
    if (!members || members.length === 0) {
        alert('No members to export!');
        return;
    }

    try {
        const excelData = members.map(member => ({
            'Name': `${member.first_name} ${member.last_name}`,
            'Email': member.email || '',
            'Phone': member.phone || '',
            'Gender': member.gender || '',
            'Date of Birth': member.date_of_birth || '',
            'Marital Status': member.marital_status || '',
            'Occupation': member.occupation || '',
            'Address': member.address || '',
            'City': member.city || '',
            'Region': member.region || '',
            'Status': member.status || '',
            'Church Group': member.church_group || '',
            'Ministries': member.ministries || '',
            'Departments': member.departments || '',
            'Leadership Role': member.leadership_role || '',
            'Baptism Status': member.baptism_status || '',
            'Spiritual Growth': member.spiritual_growth || '',
            'Membership Type': member.membership_type || '',
            'Engagement': member.engagement || '', // You might need to calc this if not in object
            'Attendance': member.attendance ? member.attendance + '%' : '0%',
            'Date Joined': member.created_at ? new Date(member.created_at).toLocaleDateString() : '',
            'Emergency Contact': member.emergency_name || '',
            'Emergency Phone': member.emergency_phone || '',
            'Emergency Relation': member.emergency_relation || '',
            'Notes': member.notes || '',
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 25 }, // Name
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 10 }, // Gender
            { wch: 15 }, // DOB
            { wch: 15 }, // Marital
            { wch: 20 }, // Occupation
            { wch: 30 }, // Address
            { wch: 15 }, // City
            { wch: 15 }, // Region
            { wch: 10 }, // Status
            { wch: 15 }, // Church Group
            { wch: 20 }, // Ministries
            { wch: 20 }, // Departments
            { wch: 15 }, // Leadership
            { wch: 15 }, // Baptism
            { wch: 15 }, // Spiritual Growth
            { wch: 15 }, // Membership Type
            { wch: 12 }, // Engagement
            { wch: 12 }, // Attendance
            { wch: 15 }, // Joined
            { wch: 20 }, // Emergency Contact
            { wch: 15 }, // Emergency Phone
            { wch: 15 }, // Emergency Relation
            { wch: 30 }, // Notes
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Members');

        XLSX.writeFile(wb, `church_members_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error: any) {
        console.error('Error exporting Excel:', error);
        alert('Error exporting Excel: ' + error.message);
    }
};

export const exportToPDF = async (members: any[]) => {
    if (!members || members.length === 0) {
        alert('No members to export!');
        return;
    }

    try {
        const doc = new jsPDF('landscape');

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Church Members Directory', 14, 15);

        // Date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);
        doc.text(`Total Members: ${members.length}`, 14, 28);

        // Pre-load images
        const imageMap = new Map<number, HTMLImageElement>();
        await Promise.all(members.map(async (member) => {
            if (member.photo_path) {
                try {
                    let src = member.photo_path;
                    if (!src.startsWith('http') && !src.startsWith('/')) {
                        src = `/uploads/${src}`;
                    }
                    const img = await loadImageForPDF(src);
                    const id = member.member_id || member.id;
                    if (id) imageMap.set(id, img);
                } catch (e) {
                    console.error(`Failed to load image for member ${member.first_name}`, e);
                }
            }
        }));

        const tableColumn = ["", "Name", "Email", "Phone", "Status", "Ministry", "Church Group", "Emergency Number"];
        const tableRows: any[] = [];

        members.forEach(member => {
            // Helper to extract ministry name safely
            const ministryName = member.memberMinistries && member.memberMinistries.length > 0
                ? member.memberMinistries[0].ministry.ministry_name
                : (member.ministries || 'No Ministry');

            const memberData = [
                '', // Placeholder for Photo
                `${member.first_name} ${member.last_name}`,
                member.email || '-',
                member.phone || '-',
                member.status || 'Active',
                ministryName,
                member.church_group || '-',
                member.emergency_phone || '-' // Replaced Attendance with Emergency Number
            ];
            tableRows.push(memberData);
        });

        // Generate table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'striped',
            styles: {
                fontSize: 9,
                cellPadding: 3,
                valign: 'middle', // Vertically align text
                minCellHeight: 15 // Ensure row is tall enough for image
            },
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 15 } // Width for Photo column
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 0) {
                    const member = members[data.row.index];
                    const id = member.member_id || member.id;
                    const img = imageMap.get(id);

                    if (img) {
                        // Draw image
                        const cell = data.cell;
                        const padding = 2;
                        const size = 10; // Image size (width/height)

                        // Center image in cell
                        const x = cell.x + (cell.width - size) / 2;
                        const y = cell.y + (cell.height - size) / 2;

                        // Circular clip is hard in simple jsPDF addImage without context manipulation
                        // For autoTable cell, simple square or rectangular image is safest/easiest to standard
                        // To make it circular involves advanced canvas calls. For now standard square/rect.
                        doc.addImage(img, 'JPEG', x, y, size, size);
                    }
                }
            }
        });

        doc.save(`church_members_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error: any) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF: ' + error.message);
    }
};
