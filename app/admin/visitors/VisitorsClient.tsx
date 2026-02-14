'use client';

import React, { useState, useMemo } from 'react';
import styles from '@/components/Admin/visitors/visitors.module.css';
import AdminLayout from '@/components/Admin/AdminLayout'; // Assuming standard Admin Layout
import VisitorStats from '@/components/Admin/visitors/VisitorStats';
import VisitorsTable from '@/components/Admin/visitors/VisitorsTable';
import AddVisitorModal from '@/components/Admin/visitors/AddVisitorModal';
import EditVisitorModal from '@/components/Admin/visitors/EditVisitorModal';
import AssignVisitorModal from '@/components/Admin/visitors/AssignVisitorModal';
import { Visitor } from '@prisma/client';
import { deleteVisitor } from '@/app/actions/visitor';
import { useRouter, useSearchParams } from 'next/navigation';

interface VisitorsClientProps {
    initialVisitors: (Visitor & { attendance: any[] })[];
}

const VisitorsClient: React.FC<VisitorsClientProps> = ({ initialVisitors }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

    // Initial check for ?add=true
    React.useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setIsAddModalOpen(true);
        }
    }, [searchParams]);

    const visitors = initialVisitors;

    // Filter Logic
    const filteredVisitors = useMemo(() => {
        let filtered = visitors;

        // Tab Filter
        if (filter !== 'all') {
            if (filter === 'new') {
                // "New" logic: visits in last 7 days + visit_count === 1
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                filtered = filtered.filter(v => v.attendance.length === 1 && v.created_at >= sevenDaysAgo);
            } else if (filter === 'returning') {
                filtered = filtered.filter(v => v.attendance.length > 1);
            } else if (filter === 'converted') {
                filtered = filtered.filter(v => v.converted_to_member === true);
            } else if (filter === 'urgent') {
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                filtered = filtered.filter(v => v.follow_up_status === 'pending' && v.last_visit_date && v.last_visit_date >= threeDaysAgo);
            } else {
                // Status matching
                filtered = filtered.filter(v => v.follow_up_status === filter);
            }
        }

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(v =>
                v.name.toLowerCase().includes(q) ||
                v.phone.includes(q) ||
                (v.email && v.email.toLowerCase().includes(q)) ||
                (v.source && v.source.toLowerCase().includes(q))
            );
        }

        return filtered;
    }, [visitors, filter, searchQuery]);

    // Derived Stats
    const totalVisitors = visitors.length;
    // New this week: created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newVisitors = visitors.filter(v => v.created_at >= sevenDaysAgo).length;

    const pendingFollowups = visitors.filter(v => v.follow_up_status === 'pending').length;
    const contactedCount = visitors.filter(v => v.follow_up_status === 'contacted').length;
    const scheduledCount = visitors.filter(v => v.follow_up_status === 'scheduled').length;
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const urgentFollowups = visitors.filter(v => v.follow_up_status === 'pending' && v.last_visit_date && v.last_visit_date >= threeDaysAgo).length;
    const returningVisitors = visitors.filter(v => v.attendance.length > 1).length;
    const convertedMembers = visitors.filter(v => v.converted_to_member === true).length;
    const conversionRate = totalVisitors > 0 ? Math.round((convertedMembers / totalVisitors) * 100) + '%' : '0%';

    // Handlers
    const handleEditClick = (visitor: Visitor) => {
        setSelectedVisitor(visitor);
        setIsEditModalOpen(true);
    };

    const handleAssignClick = (visitor: Visitor) => {
        setSelectedVisitor(visitor);
        setIsAssignModalOpen(true);
    };

    const handleDeleteClick = async (visitorId: number) => {
        if (confirm('Are you sure you want to delete this visitor?')) {
            const result = await deleteVisitor(visitorId);
            if (!result.success) {
                alert(result.message);
            } else {
                router.refresh(); // Refresh to show updated list
            }
        }
    };

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <div className={styles.dashboardContent}>
            {/* Note: In Next.js Layout handles sidebar/header usually. 
        If reusing Layout component, we just render content. 
        If legacy had custom header structure inside content area, we replicate it here.
    */}
            <div className={styles.cfHeaderPrimary}>
                <div className={styles.cfHeadingZone}>
                    <h1>Visitor Management</h1>
                    <p>Track and manage church visitors and follow-ups</p>
                </div>
                <div className={styles.cfControlsCluster}>
                    <button
                        className={`${styles.cfBtn} ${styles.cfBtnAlternate}`}
                        onClick={() => router.push('/admin/members')}
                    >
                        <span>Back to Members</span>
                    </button>
                    <button
                        className={`${styles.cfBtn} ${styles.cfBtnMain}`}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                        <span>Add Visitor</span>
                    </button>
                </div>
            </div>

            <VisitorStats
                totalVisitors={totalVisitors}
                newVisitors={newVisitors}
                urgentFollowups={urgentFollowups}
                pendingFollowups={pendingFollowups}
                contactedCount={contactedCount}
                returningVisitors={returningVisitors}
                convertedMembers={convertedMembers}
                conversionRate={conversionRate}
            />

            <div className={styles.cfFilterContainer}>
                <div className={styles.cfFilterUpper}>
                    <div className={styles.cfSearchWrapper}>
                        <span className={styles.cfSearchIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                        </span>
                        <input
                            type="text"
                            className={styles.cfSearchInput}
                            placeholder="Search visitors by name, phone, email, source..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.cfFilterLower}> {/* Added lower container if needed for layout */}
                    <div className={styles.cfTabsGroup}>
                        {[
                            { label: 'All Visitors', value: 'all' },
                            { label: 'New', value: 'new' },
                            { label: 'Urgent', value: 'urgent' },
                            { label: 'Pending', value: 'pending' },
                            { label: 'Contacted', value: 'contacted' },
                            { label: 'Returning', value: 'returning' },
                            { label: 'Converted', value: 'converted' },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                className={`${styles.cfTabItem} ${filter === tab.value ? styles.cfActive : ''}`}
                                onClick={() => setFilter(tab.value)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <VisitorsTable
                visitors={filteredVisitors}
                onEdit={handleEditClick}
                onAssign={handleAssignClick}
                onDelete={handleDeleteClick}
            />

            <AddVisitorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleRefresh}
            />

            <EditVisitorModal
                isOpen={isEditModalOpen && !!selectedVisitor}
                onClose={() => { setIsEditModalOpen(false); setSelectedVisitor(null); }}
                onSuccess={handleRefresh}
                visitor={selectedVisitor}
            />

            <AssignVisitorModal
                isOpen={isAssignModalOpen && !!selectedVisitor}
                onClose={() => { setIsAssignModalOpen(false); setSelectedVisitor(null); }}
                onSuccess={handleRefresh}
                visitor={selectedVisitor}
            />
        </div>
    );
};

export default VisitorsClient;
