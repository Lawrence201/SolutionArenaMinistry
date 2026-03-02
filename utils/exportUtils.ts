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

// Helper to create a rounded square image using canvas
const getRoundedImage = (img: HTMLImageElement, size: number, radius: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return img.src;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Create rounded rect path
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();

    // Draw and scale image to fill the square
    const imgWidth = img.width;
    const imgHeight = img.height;
    const minDim = Math.min(imgWidth, imgHeight);
    const sx = (imgWidth - minDim) / 2;
    const sy = (imgHeight - minDim) / 2;

    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

    return canvas.toDataURL('image/png');
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
            'GPS Address': member.gps_address || '',
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
            { wch: 20 }, // GPS Address
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

        // Pre-load and process images
        const imageMap = new Map<number, string>();
        await Promise.all(members.map(async (member) => {
            if (member && member.photo_path) {
                try {
                    let src = member.photo_path;
                    if (!src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
                        src = `/uploads/members/${src}`;
                    }
                    const img = await loadImageForPDF(src);
                    const id = member.member_id || member.id;
                    if (id) {
                        // Create a rounded version (square with rounded corners)
                        const roundedDataUrl = getRoundedImage(img, 100, 15);
                        imageMap.set(id, roundedDataUrl);
                    }
                } catch (e) {
                    console.error(`Failed to load image for member ${member.first_name}`, e);
                }
            }
        }));

        // Define columns with dataKeys for better data binding
        const tableColumns = [
            { header: "", dataKey: "photo" },
            { header: "Name", dataKey: "name" },
            { header: "Email", dataKey: "email" },
            { header: "Phone", dataKey: "phone" },
            { header: "GPS Address", dataKey: "gps" },
            { header: "Status", dataKey: "status" },
            { header: "Ministry", dataKey: "ministry" },
            { header: "Emergency Name", dataKey: "eName" },
            { header: "Emergency Phone", dataKey: "ePhone" }
        ];

        // Map members to row objects
        const tableRows = members.map(member => {
            const ministryName = member.memberMinistries && member.memberMinistries.length > 0
                ? member.memberMinistries[0].ministry.ministry_name
                : (member.ministries || 'No Ministry');

            return {
                photo: '', // Placeholder
                name: `${member.first_name || ''} ${member.last_name || ''}`,
                email: member.email || '-',
                phone: member.phone || '-',
                gps: member.gps_address || '-',
                status: member.status || 'Active',
                ministry: ministryName,
                eName: member.emergency_name || '-',
                ePhone: member.emergency_phone || '-',
                _member_id: member.member_id || member.id // Hidden ID for ref
            };
        });

        // Generate table
        autoTable(doc, {
            columns: tableColumns,
            body: tableRows,
            startY: 35,
            theme: 'striped',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                valign: 'middle',
                minCellHeight: 18
            },
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                photo: { cellWidth: 18 },
                name: { fontStyle: 'bold', cellWidth: 35 }
            },
            didDrawCell: (data) => {
                // Check if this is the photo column in the body section
                if (data.section === 'body' && (data.column as any).dataKey === 'photo') {
                    const raw = data.row.raw as any;
                    const id = raw?._member_id;
                    const roundedImgData = id ? imageMap.get(id) : null;

                    if (roundedImgData) {
                        const cell = data.cell;
                        const size = 12; // Image size

                        // Center image in cell
                        const x = cell.x + (cell.width - size) / 2;
                        const y = cell.y + (cell.height - size) / 2;

                        doc.addImage(roundedImgData, 'PNG', x, y, size, size);
                    } else {
                        // Draw a simple gray rounded rectangle as placeholder
                        const cell = data.cell;
                        const size = 10;
                        const x = cell.x + (cell.width - size) / 2;
                        const y = cell.y + (cell.height - size) / 2;

                        doc.setDrawColor(200, 200, 200);
                        doc.setFillColor(240, 240, 240);
                        doc.roundedRect(x, y, size, size, 2, 2, 'FD');

                        // User icon placeholder
                        doc.setDrawColor(150, 150, 150);
                        doc.circle(x + size / 2, y + size / 2 - 1, 2, 'S');
                        doc.ellipse(x + size / 2, y + size / 2 + 3, 3, 2, 'S');
                    }
                }
            }
        });

        doc.save(`church_members_directory_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error: any) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF: ' + error.message);
    }
};
