import * as XLSX from 'xlsx';

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
        type: 'Member' | 'Visitor';
        date: string;
        time: string;
        service: string;
    }[];
    ministryBreakdown?: { name: string; count: number }[];
    genderBreakdown?: { name: string; count: number }[];
}

export const exportAttendanceToExcel = (data: AdvancedAttendanceData, startDate: string, endDate: string) => {
    const workbook = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = [
        ['ATTENDANCE SUMMARY REPORT'],
        ['Period:', `${startDate} to ${endDate}`],
        [],
        ['Metric', 'Value'],
        ['Total Sessions (Days/Services)', data.summary.totalSessions],
        ['Total Check-Ins', data.summary.totalCheckIns],
        ['Unique Members Present', data.summary.uniqueMembers],
        ['Unique Visitors Present', data.summary.uniqueVisitors],
        ['Average Attendance per Session', Math.round(data.summary.totalCheckIns / (data.summary.totalSessions || 1))],
        [],
        ['GENDER BREAKDOWN'],
        ...(data.genderBreakdown?.map(g => [g.name, g.count]) || [])
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // 2. Member Attendance Ranking
    const memberHeaders = ['Member Name', 'Ministry', 'Attendance Count', 'Attendance Percentage (%)'];
    const memberRows = data.memberAttendance.map(m => [m.name, m.ministry, m.count, `${m.percentage}%`]);
    const memberSheet = XLSX.utils.aoa_to_sheet([memberHeaders, ...memberRows]);
    XLSX.utils.book_append_sheet(workbook, memberSheet, 'Member Rankings');

    // 3. Ministry Breakdown
    if (data.ministryBreakdown) {
        const ministryHeaders = ['Ministry / Group', 'Total Attendance Count'];
        const ministryRows = data.ministryBreakdown.map(m => [m.name, m.count]);
        const ministrySheet = XLSX.utils.aoa_to_sheet([ministryHeaders, ...ministryRows]);
        XLSX.utils.book_append_sheet(workbook, ministrySheet, 'Ministry Stats');
    }

    // 4. Daily Breakdown
    const dailyHeaders = ['Date', 'Members', 'Visitors', 'Total Attendance'];
    const dailyRows = data.dailyBreakdown.map(d => [d.date, d.members, d.visitors, d.total]);
    const dailySheet = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyRows]);
    XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Trends');

    // 5. Visitor Analysis
    const visitorHeaders = ['Visitor Name', 'Phone', 'Email', 'Source', 'Purpose', 'Visit Count', 'Last Visit Date'];
    const visitorRows = data.visitorLogs.map(v => [v.name, v.phone, v.email || '-', v.source || '-', v.purpose || '-', v.count, v.lastVisit]);
    const visitorSheet = XLSX.utils.aoa_to_sheet([visitorHeaders, ...visitorRows]);
    XLSX.utils.book_append_sheet(workbook, visitorSheet, 'Visitor Analysis');

    // 6. Raw Audit Logs
    const rawHeaders = ['Name', 'Category', 'Date', 'Time', 'Service'];
    const rawRows = data.rawLogs.map(r => [r.name, r.type, r.date, r.time, r.service]);
    const rawSheet = XLSX.utils.aoa_to_sheet([rawHeaders, ...rawRows]);
    XLSX.utils.book_append_sheet(workbook, rawSheet, 'Raw Analysis Logs');

    // Set column widths for better readability
    summarySheet['!cols'] = [{ wch: 35 }, { wch: 20 }];
    memberSheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 25 }];
    dailySheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
    visitorSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 }];
    rawSheet['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 30 }];

    // Export
    XLSX.writeFile(workbook, `Advanced_Attendance_Report_${startDate}_${endDate}.xlsx`);
};
