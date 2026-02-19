import React from 'react';
import styles from './visitors.module.css';
import { Visitor } from '@prisma/client';
import { format } from 'date-fns';

interface VisitorsTableProps {
    visitors: (Visitor & { attendance: any[] })[];
    onEdit: (visitor: Visitor) => void;
    onAssign: (visitor: Visitor) => void;
    onDelete: (visitorId: number) => void;
    onConvertToMember: (visitor: Visitor) => void;
}

const VisitorsTable: React.FC<VisitorsTableProps> = ({ visitors, onEdit, onAssign, onDelete, onConvertToMember }) => {

    const getBadgeClass = (status: string | null) => {
        if (!status) return styles.cfBadge;
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case 'pending': return `${styles.cfBadge} ${styles.pending}`;
            case 'contacted': return `${styles.cfBadge} ${styles.contacted}`;
            case 'scheduled': return `${styles.cfBadge} ${styles.scheduled}`;
            case 'completed': return `${styles.cfBadge} ${styles.completed}`;
            case 'no_response': return `${styles.cfBadge} ${styles.no_response}`;
            default: return styles.cfBadge;
        }
    };

    const isUrgent = (visitor: any) => {
        if (visitor.follow_up_status !== 'pending') return false;
        if (!visitor.last_visit_date) return false;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(visitor.last_visit_date) >= thirtyDaysAgo;
    };

    const getSourceBadgeClass = (source: string | null) => {
        // Just using info/secondary for sources as per legacy logic if any, currently simple text in table
        return "";
    };

    return (
        <div className={styles.cfDirectoryContainer}>
            <div className={styles.cfDirectoryHead}>
                <div className={styles.cfDirectoryLabel}>
                    <h2>Visitor Directory</h2>
                    <p>Complete list of all church visitors</p>
                </div>
            </div>

            <div className={styles.cfTableWrapper}>
                <table className={styles.cfMembersTable}>
                    <thead>
                        <tr>
                            <th>Visitor</th>
                            <th>Contact</th>
                            <th>Source</th>
                            <th>Visit Count</th>
                            <th>Latest Visit</th>
                            <th>Follow-up Status</th>
                            <th>Assigned To</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visitors.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>No visitors found.</td>
                            </tr>
                        ) : (
                            visitors.map((visitor) => (
                                <tr key={visitor.visitor_id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className={styles.visitorName}>{visitor.name}</span>
                                            {isUrgent(visitor) && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    background: '#fee2e2',
                                                    color: '#ef4444',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase'
                                                }}>Urgent</span>
                                            )}
                                        </div>
                                        <span className={styles.visitorMeta}>{visitor.visitors_purpose || 'No purpose recorded'}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                                </svg>
                                                {visitor.phone}
                                            </div>
                                            {visitor.email && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                                    </svg>
                                                    {visitor.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 500
                                        }}>
                                            {visitor.source || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: '#1e293b', marginLeft: '12px' }}>{visitor.attendance.length}</span>
                                    </td>
                                    <td>
                                        {visitor.last_visit_date ? format(new Date(visitor.last_visit_date), 'MMM d, yyyy') : 'N/A'}
                                    </td>
                                    <td>
                                        <span className={getBadgeClass(visitor.follow_up_status)}>
                                            {visitor.follow_up_status?.replace('_', ' ') || 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        {visitor.assigned_to ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: '#e2e8f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    color: '#64748b'
                                                }}>
                                                    {visitor.assigned_to.charAt(0)}
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 500 }}>{visitor.assigned_to}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className={styles.cfBtn}
                                                style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b' }}
                                                title="Edit Visitor"
                                                onClick={() => onEdit(visitor)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                                    <path d="m15 5 4 4"></path>
                                                </svg>
                                            </button>
                                            <button
                                                className={styles.cfBtn}
                                                style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#10b981', background: '#f0fdf4' }}
                                                title="Convert to Member"
                                                onClick={() => onConvertToMember(visitor)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="9" cy="7" r="4"></circle>
                                                    <polyline points="16 11 18 13 22 9"></polyline>
                                                </svg>
                                            </button>
                                            <button
                                                className={styles.cfBtn}
                                                style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b' }}
                                                title="Assign Member"
                                                onClick={() => onAssign(visitor)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="9" cy="7" r="4"></circle>
                                                    <line x1="19" x2="19" y1="8" y2="14"></line>
                                                    <line x1="22" x2="16" y1="11" y2="11"></line>
                                                </svg>
                                            </button>
                                            <button
                                                className={styles.cfBtn}
                                                style={{ padding: '6px', border: '1px solid #fee2e2', borderRadius: '6px', color: '#ef4444', background: '#fef2f2' }}
                                                title="Delete"
                                                onClick={() => onDelete(visitor.visitor_id)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18"></path>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.cfPagination}>
                <div className={styles.cfPageStats}>
                    Showing <span id="showingCount">{visitors.length}</span> visitors
                </div>
            </div>
        </div>
    );
};

export default VisitorsTable;
