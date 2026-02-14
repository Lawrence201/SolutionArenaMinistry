'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type MembersTableProps = {
    members: any[];
    selectedMembers: Set<number>;
    onToggleSelectionAction: (id: number) => void;
    onSelectAllAction: () => void;
    onClearSelectionAction: () => void;
    onEditMemberAction: (member: any) => void;
    onViewProfileAction: (member: any) => void;
    onDeleteMemberAction: (id: number) => void;
};

// Calculate engagement based on attendance - updated with new tiers
const getEngagement = (engagement: string): string => {
    switch (engagement) {
        case 'Extreme': return 'extreme';
        case 'High': return 'high';
        case 'Moderate': return 'moderate';
        case 'Low': return 'low';
        case 'Very Low': return 'very-low';
        default: return 'moderate';
    }
};

export default function MembersTable({
    members,
    selectedMembers,
    onToggleSelectionAction,
    onSelectAllAction,
    onClearSelectionAction,
    onEditMemberAction,
    onViewProfileAction,
    onDeleteMemberAction
}: MembersTableProps) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('search') || '';

    const highlightText = (text: string | null | undefined, term: string) => {
        if (!text) return '';
        if (!term) return text;

        const parts = text.toString().split(new RegExp(`(${term})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === term.toLowerCase() ? (
                        <mark key={i} style={{ backgroundColor: '#fef08a', color: '#854d0e', fontWeight: 600, padding: '1px 3px', borderRadius: '3px' }}>{part}</mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const toggleMenu = (id: number) => {
        if (openMenuId === id) {
            setOpenMenuId(null);
        } else {
            setOpenMenuId(id);
        }
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleEditClick = (member: any) => {
        setOpenMenuId(null);
        onEditMemberAction(member);
    };

    return (
        <div className="cf-directory-container">
            <div className="cf-directory-head">
                <div className="cf-directory-label">
                    <h2>Member Directory</h2>
                    <p>Complete list of all church members</p>
                </div>
                <div className="cf-directory-controls">
                    <button className="cf-btn cf-btn-alternate" onClick={onSelectAllAction}>Select All</button>
                    <button className="cf-btn cf-btn-alternate" onClick={onClearSelectionAction}>Clear Selection</button>
                    {selectedMembers.size > 0 && (
                        <span style={{ marginLeft: '10px', fontSize: '14px', color: '#64748b' }}>
                            {selectedMembers.size} selected
                        </span>
                    )}
                </div>
            </div>

            <div className="cf-table-wrapper">
                <table className="cf-members-table" id="memberTable" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <thead>
                        <tr>
                            <th className="cf-checkbox-cell" style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    id="selectAllCheckbox"
                                    checked={members.length > 0 && selectedMembers.size === members.length}
                                    onChange={onSelectAllAction}
                                />
                            </th>
                            <th style={{ cursor: 'pointer', width: '18%' }}>Member</th>
                            <th style={{ width: '18%' }}>Contact</th>
                            <th style={{ cursor: 'pointer', width: '7%' }}>Status</th>
                            <th style={{ cursor: 'pointer', width: '10%' }}>Ministry</th>
                            <th style={{ cursor: 'pointer', width: '11%' }}>Engagement</th>
                            <th style={{ cursor: 'pointer', width: '14%', whiteSpace: 'nowrap' }}>Church Group</th>
                            <th style={{ cursor: 'pointer', width: '10%' }}>Department</th>
                            <th style={{ cursor: 'pointer', width: '10%' }}>Attendance</th>
                            <th style={{ width: '60px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="memberTableBody">
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan={10} style={{ textAlign: 'center', padding: '20px' }}>
                                    No members found.
                                </td>
                            </tr>
                        ) : (
                            members.map(member => (
                                <tr key={member.member_id} className={selectedMembers.has(member.member_id) ? 'cf-row-selected' : ''}>
                                    <td className="cf-checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.has(member.member_id)}
                                            onChange={() => onToggleSelectionAction(member.member_id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="cf-member-card">
                                            <div className="cf-member-icon">
                                                {member.photo_path ? (
                                                    <img
                                                        src={member.photo_path.startsWith('/') ? member.photo_path : `/assets/${member.photo_path}`}
                                                        alt={member.first_name}
                                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: block');
                                                        }}
                                                    />
                                                ) : null}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: member.photo_path ? 'none' : 'block' }}>
                                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                            </div>
                                            <div className="cf-member-info">
                                                <h4>{highlightText(`${member.first_name} ${member.last_name}`, searchTerm)}</h4>
                                                <p>Joined {new Date(member.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cf-contact-group">
                                            <div className="cf-contact-item">
                                                <span className="cf-contact-icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                                                </span>
                                                <span className="cf-contact-text">{highlightText(member.email, searchTerm)}</span>
                                            </div>
                                            <div className="cf-contact-item">
                                                <span className="cf-contact-icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                                </span>
                                                <span className="cf-contact-text">{highlightText(member.phone, searchTerm)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={`cf-badge ${member.status?.toLowerCase() || 'active'}`}>{highlightText(member.status || 'Active', searchTerm)}</span></td>
                                    <td>{highlightText(member.memberMinistries && member.memberMinistries.length > 0 ? member.memberMinistries[0].ministry.ministry_name : 'No Ministry', searchTerm)}</td>
                                    <td><span className={`cf-badge ${getEngagement(member.engagement)}`}>{highlightText(member.engagement, searchTerm)}</span></td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{highlightText(member.church_group || '-', searchTerm)}</td>
                                    <td>{highlightText(member.memberDepartments && member.memberDepartments.length > 0 ? member.memberDepartments[0].department.department_name : 'No Department', searchTerm)}</td>
                                    <td>
                                        <div className="cf-progress-group">
                                            <div className="cf-progress-track">
                                                <div className="cf-progress-bar" style={{ width: `${member.attendance || 0}%` }}></div>
                                            </div>
                                            <span className="cf-progress-text">{member.attendance || 0}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cf-actions-cell" style={{ position: 'relative' }}>
                                            <button className="cf-menu-trigger" onClick={(e) => { e.stopPropagation(); toggleMenu(member.member_id); }}>⋮</button>
                                            <div className={`cf-dropdown-menu ${openMenuId === member.member_id ? 'cf-show' : ''}`} id={`menu-${member.member_id}`} style={{ right: 0 }}>
                                                <div className="cf-menu-item" onClick={() => { setOpenMenuId(null); onViewProfileAction(member); }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    <span>View Profile</span>
                                                </div>
                                                <div className="cf-menu-item" onClick={() => handleEditClick(member)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                                                    <span>Edit Member</span>
                                                </div>
                                                <div className="cf-menu-item" onClick={() => { setOpenMenuId(null); onDeleteMemberAction(member.member_id); }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                                    <span>Delete Member</span>
                                                </div>
                                                <div className="cf-menu-item" onClick={() => console.log('Message')}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                                                    <span>Send Message</span>
                                                </div>
                                                <div className="cf-menu-item" onClick={() => console.log('Insights')}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg>
                                                    <span>AI Insights</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="cf-pagination">
                <div className="cf-page-stats">
                    Showing <span id="showingCount">{members.length}</span> members
                </div>
            </div>
        </div>
    );
}
