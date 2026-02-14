'use client';

import React, { useState } from 'react';
import MemberStats from './MemberStats';
import MemberFilters from './MemberFilters';
import MembersTable from './MembersTable';
import MemberInsights from './MemberInsights';
import { MemberStats as MemberStatsType, MemberInsight } from '@/app/actions/memberActions';
import EditMemberModal from './EditMemberModal';
import ViewProfileModal from './ViewProfileModal';
import { deleteMember } from '@/app/actions/deleteMemberAction';
import Toast from '@/components/ui/Toast';

type MembersDashboardProps = {
    stats: MemberStatsType;
    members: any[];
    insights: MemberInsight[];
};

export default function MembersDashboard({ stats, members, insights }: MembersDashboardProps) {
    const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [viewingMember, setViewingMember] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    // Import export utils
    const { exportToPDF, exportToExcel } = require('@/utils/exportUtils');

    const toggleMemberSelection = (id: number) => {
        const newSelected = new Set(selectedMembers);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedMembers(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedMembers.size === members.length) {
            setSelectedMembers(new Set());
        } else {
            setSelectedMembers(new Set(members.map(m => m.member_id)));
        }
    };

    const handleClearSelection = () => {
        setSelectedMembers(new Set());
    };

    const handleEditClick = (member: any) => {
        setEditingMember(member);
        setIsEditModalOpen(true);
    };

    const handleViewProfileClick = (member: any) => {
        setViewingMember(member);
        setIsProfileModalOpen(true);
    };

    const handleDeleteMember = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this member? This action cannot be undone and will remove all associated data and files.')) {
            try {
                const result = await deleteMember(id);
                if (result.success) {
                    setToast({ message: 'Member deleted successfully', type: 'success' });
                } else {
                    setToast({ message: result.error || 'Failed to delete member', type: 'error' });
                }
            } catch (error) {
                console.error('Delete error:', error);
                setToast({ message: 'An unexpected error occurred during deletion', type: 'error' });
            }
        }
    };

    const handleExport = (type: 'pdf' | 'excel') => {
        setIsExportMenuOpen(false);
        if (type === 'pdf') {
            exportToPDF(members);
        } else {
            exportToExcel(members);
        }
    };

    // Close export menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setIsExportMenuOpen(false);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <>
            <div className="cf-header-primary">
                <div className="cf-heading-zone">
                    <h1>Member Management</h1>
                    <p>Manage all church members effectively</p>
                </div>
                <div className="cf-controls-cluster">
                    <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
                        <button
                            className="cf-btn cf-btn-alternate"
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        >
                            <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></span>
                            <span>Export</span>
                        </button>
                        <div className={`cf-dropdown-menu ${isExportMenuOpen ? 'cf-show' : ''}`} id="exportMenu" style={{ minWidth: '160px' }}>
                            <div className="cf-menu-item" onClick={() => handleExport('pdf')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                <span>Export to PDF</span>
                            </div>
                            <div className="cf-menu-item" onClick={() => handleExport('excel')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><line x1="15" y1="11" x2="9" y2="19"></line><line x1="9" y1="11" x2="15" y2="19"></line></svg>
                                <span>Export to Excel</span>
                            </div>
                        </div>
                    </div>

                    <button className="cf-btn cf-btn-screen">
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter h-4 w-4 mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg></span>
                        <span>Filter</span>
                    </button>

                    <button className="cf-btn cf-btn-main" onClick={() => { setEditingMember({}); setIsEditModalOpen(true); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Member
                    </button>
                </div>
            </div>

            <MemberInsights insights={insights} />

            <MemberStats stats={stats} />

            <MemberFilters
                selectedCount={selectedMembers.size}
                filteredCount={members.length}
            />

            <MembersTable
                members={members}
                selectedMembers={selectedMembers}
                onToggleSelectionAction={toggleMemberSelection}
                onSelectAllAction={handleSelectAll}
                onClearSelectionAction={handleClearSelection}
                onEditMemberAction={(member) => {
                    setEditingMember(member);
                    setIsEditModalOpen(true);
                }}
                onViewProfileAction={(member) => {
                    setViewingMember(member);
                    setIsProfileModalOpen(true);
                }}
                onDeleteMemberAction={async (id) => {
                    if (confirm('Are you sure you want to delete this member?')) {
                        const result = await deleteMember(id);
                        if (result.success) {
                            setToast({ message: 'Member deleted successfully', type: 'success' });
                            // Revalidate data via router
                            window.location.reload();
                        } else {
                            setToast({ message: result.error || 'Failed to delete member', type: 'error' });
                        }
                    }
                }}
            />

            <EditMemberModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                member={editingMember}
            />

            <ViewProfileModal
                isOpen={isProfileModalOpen}
                handleClose={() => setIsProfileModalOpen(false)}
                member={viewingMember}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}
