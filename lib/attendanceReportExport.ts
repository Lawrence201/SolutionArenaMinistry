import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Stats {
    totalMembers: number;
    membersPresent: number;
    absentCount: number;
    visitorsCount: number;
    totalPresent: number;
    avgArrival: string;
    malesCount: number;
    femalesCount: number;
    childrenCount: number;
}

interface AttendanceRecord {
    name: string;
    phone: string | null;
    email: string | null;
    checkInTime: string;
    ministry: string | null;
    photo: string | null;
}

interface VisitorRecord {
    name: string;
    phone: string;
    email: string | null;
    checkInTime: string;
    source: string | null;
}

interface AbsentRecord {
    name: string;
    phone: string;
    email: string;
    ministry: string | null;
    photoPath: string | null;
}

const getImageBase64 = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        return null;
    }
};

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const exportAttendanceReportToPDF = async (
    stats: Stats,
    attendanceData: AttendanceRecord[],
    visitorsData: VisitorRecord[],
    absentData: AbsentRecord[],
    currentDate: string
) => {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header with colored banner
    doc.setFillColor(30, 41, 59); // Dark blue (#1e293b)
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTENDANCE REPORT', pageWidth / 2, 17, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const formattedDate = new Date(currentDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(formattedDate, pageWidth / 2, 26, { align: 'center' });

    let yPosition = 45;

    // Statistics Summary Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 15, yPosition);
    yPosition += 10;

    const statsItems = [
        { label: 'Registered Members', value: stats.totalMembers, color: [59, 130, 246] },
        { label: 'Present Today', value: stats.totalPresent, color: [16, 185, 129] },
        { label: 'Absent', value: stats.absentCount, color: [239, 68, 68] },
        { label: 'Visitors', value: stats.visitorsCount, color: [139, 92, 246] },
        { label: 'Males', value: stats.malesCount, color: [59, 130, 246] },
        { label: 'Females', value: stats.femalesCount, color: [236, 72, 153] },
        { label: 'Children', value: stats.childrenCount, color: [245, 158, 11] },
        { label: 'Avg Arrival', value: stats.avgArrival, color: [100, 116, 139] }
    ];

    const boxWidth = 44;
    const boxHeight = 22;
    const gap = 4;

    statsItems.forEach((item, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 15 + (col * (boxWidth + gap));
        const y = yPosition + (row * (boxHeight + gap));

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'S');

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(item.label, x + boxWidth / 2, y + 7, { align: 'center' });

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(item.color[0], item.color[1], item.color[2]);
        doc.text(item.value.toString(), x + boxWidth / 2, y + 16, { align: 'center' });
    });

    yPosition += (Math.ceil(statsItems.length / 4) * (boxHeight + gap)) + 15;

    const addSectionHeader = (title: string, color: number[], count: number) => {
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(`${title} (${count})`, 15, yPosition);
        yPosition += 6;
    };

    // Live Attendance Table
    if (attendanceData.length > 0) {
        addSectionHeader('Live Attendance - Members', [30, 41, 59], attendanceData.length);

        const tableData = await Promise.all(attendanceData.map(async (r) => {
            const imgData = r.photo ? await getImageBase64(r.photo) : null;
            return {
                ...r,
                imgData
            };
        }));

        autoTable(doc, {
            startY: yPosition,
            head: [['Name', 'Phone Number', 'Email', 'Check-In', 'Ministry']],
            body: tableData.map(r => ['', r.phone || '-', r.email || '-', r.checkInTime, r.ministry || 'General']),
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, textColor: [0, 0, 0], minCellHeight: 10 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 15, right: 15 },
            columnStyles: {
                0: { cellWidth: 55 },
                1: { cellWidth: 35 },
                2: { cellWidth: 40 },
                3: { cellWidth: 25 },
                4: { cellWidth: 25 }
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 0) {
                    const r = tableData[data.row.index];
                    const x = data.cell.x + 2;
                    const y = data.cell.y + 1;

                    if (r.imgData) {
                        try {
                            doc.saveGraphicsState();
                            doc.circle(x + 4, y + 4, 4, 'S');
                            doc.addImage(r.imgData, 'JPEG', x, y, 8, 8, undefined, 'FAST');
                            doc.restoreGraphicsState();
                        } catch (e) {
                            doc.setFillColor(102, 126, 234);
                            doc.circle(x + 4, y + 4, 4, 'F');
                            doc.setTextColor(255, 255, 255);
                            doc.setFontSize(6);
                            doc.text(getInitials(r.name), x + 4, y + 4.5, { align: 'center', baseline: 'middle' });
                        }
                    } else {
                        doc.setFillColor(102, 126, 234);
                        doc.circle(x + 4, y + 4, 4, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(6);
                        doc.text(getInitials(r.name), x + 4, y + 4.5, { align: 'center', baseline: 'middle' });
                    }
                    doc.setTextColor(0, 0, 0);
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'bold');
                    doc.text(r.name, x + 10, y + 5);
                }
            }
        });
        yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Visitors Table
    if (visitorsData.length > 0) {
        addSectionHeader('Visitors', [139, 92, 246], visitorsData.length);
        autoTable(doc, {
            startY: yPosition,
            head: [['Name', 'Phone Number', 'Email', 'Check-In', 'Source']],
            body: visitorsData.map(r => [r.name, r.phone, r.email || '-', r.checkInTime, r.source || '-']),
            theme: 'striped',
            headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, textColor: [0, 0, 0], minCellHeight: 10 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 15, right: 15 },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 40 },
                2: { cellWidth: 40 },
                3: { cellWidth: 25 },
                4: { cellWidth: 25 }
            }
        });
        yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Absent Members Table
    if (absentData.length > 0) {
        addSectionHeader('Absent Members', [239, 68, 68], absentData.length);

        const absentTableData = await Promise.all(absentData.map(async (r) => {
            const imgData = r.photoPath ? await getImageBase64(r.photoPath) : null;
            return {
                ...r,
                imgData
            };
        }));

        autoTable(doc, {
            startY: yPosition,
            head: [['Name', 'Phone Number', 'Email', 'Ministry']],
            body: absentTableData.map(r => ['', r.phone, r.email, r.ministry || 'General']),
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, textColor: [0, 0, 0], minCellHeight: 10 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 15, right: 15 },
            columnStyles: {
                0: { cellWidth: 55 },
                1: { cellWidth: 50 },
                2: { cellWidth: 50 },
                3: { cellWidth: 25 }
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 0) {
                    const r = absentTableData[data.row.index];
                    const x = data.cell.x + 2;
                    const y = data.cell.y + 1;

                    if (r.imgData) {
                        try {
                            doc.saveGraphicsState();
                            doc.circle(x + 4, y + 4, 4, 'S');
                            doc.addImage(r.imgData, 'JPEG', x, y, 8, 8, undefined, 'FAST');
                            doc.restoreGraphicsState();
                        } catch (e) {
                            doc.setFillColor(203, 213, 225);
                            doc.circle(x + 4, y + 4, 4, 'F');
                            doc.setTextColor(71, 85, 105);
                            doc.setFontSize(6);
                            doc.text(getInitials(r.name), x + 4, y + 4.5, { align: 'center', baseline: 'middle' });
                        }
                    } else {
                        doc.setFillColor(203, 213, 225);
                        doc.circle(x + 4, y + 4, 4, 'F');
                        doc.setTextColor(71, 85, 105);
                        doc.setFontSize(6);
                        doc.text(getInitials(r.name), x + 4, y + 4.5, { align: 'center', baseline: 'middle' });
                    }
                    doc.setTextColor(0, 0, 0);
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'bold');
                    doc.text(r.name, x + 10, y + 5);
                }
            }
        });
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Church Management System', 15, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(new Date().toLocaleDateString(), pageWidth - 15, pageHeight - 10, { align: 'right' });
    }

    doc.save(`Attendance_Report_${currentDate}.pdf`);
};

interface AdvancedAttendanceData {
    summary: {
        totalSessions: number;
        totalCheckIns: number;
        uniqueMembers: number;
        uniqueVisitors: number;
    };
    memberAttendance: {
        memberId: number;
        name: string;
        ministry: string;
        count: number;
        percentage: number;
    }[];
    dailyBreakdown: {
        date: string;
        members: number;
        visitors: number;
        total: number;
    }[];
    visitorLogs: {
        name: string;
        phone: string;
        email: string | null;
        source: string | null;
        purpose: string | null;
        count: number;
        lastVisit: string;
    }[];
    rawLogs: {
        name: string;
        phone: string | null;
        email: string | null;
        type: 'Member' | 'Visitor';
        date: string;
        time: string;
        service: string;
    }[];
    ministryBreakdown?: { name: string; count: number }[];
    genderBreakdown?: { name: string; count: number }[];
}

export const exportAdvancedAttendanceDataToPDF = async (
    data: AdvancedAttendanceData,
    startDate: string,
    endDate: string
) => {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header with professional gradient-like blue
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ADVANCED ATTENDANCE ANALYSIS', pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`Reporting Period: ${startDate} to ${endDate}`, pageWidth / 2, 28, { align: 'center' });

    let yPosition = 50;

    // 1. Executive Summary
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 15, yPosition);
    yPosition += 8;

    const summaryItems = [
        { label: 'Total Sessions', value: data.summary.totalSessions, color: [59, 130, 246] },
        { label: 'Total Check-Ins', value: data.summary.totalCheckIns, color: [16, 185, 129] },
        { label: 'Unique Members', value: data.summary.uniqueMembers, color: [79, 70, 229] },
        { label: 'Unique Visitors', value: data.summary.uniqueVisitors, color: [139, 92, 246] },
        { label: 'Avg Attendance', value: Math.round(data.summary.totalCheckIns / (data.summary.totalSessions || 1)), color: [100, 116, 139] }
    ];

    const boxWidth = (pageWidth - 40) / 5;
    const boxHeight = 20;

    summaryItems.forEach((item, i) => {
        const x = 15 + (i * (boxWidth + 2.5));

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, yPosition, boxWidth, boxHeight, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, yPosition, boxWidth, boxHeight, 2, 2, 'S');

        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(item.label, x + boxWidth / 2, yPosition + 7, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(item.color[0], item.color[1], item.color[2]);
        doc.text(item.value.toString(), x + boxWidth / 2, yPosition + 15, { align: 'center' });
    });

    yPosition += boxHeight + 15;

    // 2. Demographic Breakdowns (Gender & Ministry)
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Demographic Distribution', 15, yPosition);
    yPosition += 6;

    // Gender Table
    autoTable(doc, {
        startY: yPosition,
        head: [['Group', 'Attendance Count']],
        body: [
            ...(data.genderBreakdown?.map(g => [g.name, g.count]) || []),
            ['---', '---'],
            ...(data.ministryBreakdown?.slice(0, 8).map(m => [m.name, m.count]) || [])
        ],
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 80 } },
        headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 15, right: 15 },
        theme: 'grid'
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // 3. Member Attendance Ranking
    if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
    }
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Member Participation Rankings (Top 20)', 15, yPosition);
    yPosition += 6;

    autoTable(doc, {
        startY: yPosition,
        head: [['Rank', 'Member Name', 'Ministry', 'Sessions Attended', 'Frequency %']],
        body: data.memberAttendance.slice(0, 20).map((m, i) => [
            i + 1,
            m.name,
            m.ministry,
            m.count,
            `${m.percentage}%`
        ]),
        headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 15, right: 15 }
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // 4. Daily Attendance Trends
    if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
    }
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Daily Attendance Trends', 15, yPosition);
    yPosition += 6;

    autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Members', 'Visitors', 'Total Attendance']],
        body: data.dailyBreakdown.slice(0, 15).map(d => [
            d.date,
            d.members,
            d.visitors,
            d.total
        ]),
        headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 15, right: 15 }
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // 5. Visitor Analysis
    if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
    }
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Visitor Analysis', 15, yPosition);
    yPosition += 6;

    autoTable(doc, {
        startY: yPosition,
        head: [['Visitor Name', 'Phone', 'Source', 'Purpose', 'Total Visits', 'Last Visit']],
        body: data.visitorLogs.slice(0, 15).map(v => [
            v.name,
            v.phone,
            v.source || 'N/A',
            v.purpose || 'N/A',
            v.count,
            v.lastVisit
        ]),
        headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 15, right: 15 }
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Advanced Attendance Report • Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }

    doc.save(`Advanced_Attendance_Report_${startDate}_${endDate}.pdf`);
};
