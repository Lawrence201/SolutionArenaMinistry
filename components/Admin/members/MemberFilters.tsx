'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type MemberFiltersProps = {
    selectedCount: number;
    filteredCount: number;
};

export default function MemberFilters({ selectedCount, filteredCount }: MemberFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    const currentSearch = searchParams.get('search') || '';

    // Determine search input style state
    let searchStyle: React.CSSProperties = {};
    let iconColor = 'text-muted-foreground';
    let wrapperStyle: React.CSSProperties = {};

    if (currentSearch) {
        if (filteredCount === 0) {
            // Error/No results state (Red)
            searchStyle = {
                borderColor: '#ef4444',
                backgroundColor: '#fee2e2',
                color: '#dc2626'
            };
            iconColor = 'text-red-500'; // Tailwind class or custom style
            wrapperStyle = { color: '#dc2626' }; // For icon SVG override if needed
        } else {
            // Active search state (Purple)
            searchStyle = {
                borderColor: '#4f46e5',
                backgroundColor: '#f3f4f6',
                color: '#4f46e5'
            };
            iconColor = 'text-indigo-600';
            wrapperStyle = { color: '#4f46e5' };
        }
    }

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleSort = (column: string) => {
        // Placeholder for sort logic - in a real app this would update URL or state
        console.log(`Sorting by ${column}`);
        setIsSortMenuOpen(false);
    };

    const handleFilter = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status === 'all') {
            params.delete('status');
        } else {
            params.set('status', status);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const currentStatus = searchParams.get('status') || 'all';

    return (
        <div className="cf-filter-container">
            <div className="cf-filter-upper">
                <div className="cf-search-wrapper" style={wrapperStyle}>
                    <span className="cf-search-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${iconColor}`}
                            style={currentSearch && filteredCount === 0 ? { stroke: '#dc2626' } : (currentSearch ? { stroke: '#4f46e5' } : {})}
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                    </span>
                    <input
                        type="text"
                        className="cf-search-input"
                        placeholder="Search members, status, groups, departments, ministries..."
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={currentSearch}
                        style={searchStyle}
                    />
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button className="cf-btn cf-btn-alternate" onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18"></path>
                            <path d="M7 12h10"></path>
                            <path d="M10 18h4"></path>
                        </svg>
                        <span>Sort By</span>
                    </button>
                    <div className={`cf-dropdown-menu ${isSortMenuOpen ? 'cf-show' : ''}`} style={{ minWidth: '200px' }}>
                        <div className="cf-menu-item" onClick={() => handleSort('name')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Name</span>
                        </div>
                        <div className="cf-menu-item" onClick={() => handleSort('status')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 6v6l4 2"></path>
                            </svg>
                            <span>Status</span>
                        </div>
                        <div className="cf-menu-item" onClick={() => handleSort('ministry')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>Ministry</span>
                        </div>
                        <div className="cf-menu-item" onClick={() => handleSort('church_group')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 9h4"></path>
                                <path d="M12 7v5"></path>
                                <path d="M14 22v-4a2 2 0 0 0-4 0v4"></path>
                                <path d="M18 22V5.618a1 1 0 0 0-.553-.894l-4.553-2.277a2 2 0 0 0-1.788 0L6.553 4.724A1 1 0 0 0 6 5.618V22"></path>
                            </svg>
                            <span>Church Group</span>
                        </div>
                        <div className="cf-menu-item" onClick={() => handleSort('department')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                                <path d="M3 9h18"></path>
                                <path d="M9 21V9"></path>
                            </svg>
                            <span>Department</span>
                        </div>
                        <div className="cf-menu-item" onClick={() => handleSort('engagement')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                            <span>Engagement</span>
                        </div>
                        <div className="cf-menu-item" onClick={() => handleSort('attendance')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                            <span>Attendance</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="cf-filter-lower">
                <div className="cf-tabs-group">
                    <button className={`cf-tab-item ${currentStatus === 'all' ? 'cf-active' : ''}`} onClick={() => handleFilter('all')}>All Members</button>
                    <button className={`cf-tab-item ${currentStatus === 'Active' ? 'cf-active' : ''}`} onClick={() => handleFilter('Active')}>Active</button>
                    <button className={`cf-tab-item ${currentStatus === 'Visitor' ? 'cf-active' : ''}`} onClick={() => handleFilter('Visitor')}>Visitors</button>
                    <button className={`cf-tab-item ${currentStatus === 'Inactive' ? 'cf-active' : ''}`} onClick={() => handleFilter('Inactive')}>Inactive</button>
                </div>

                <div className="cf-batch-controls">
                    <span id="selectedCount">{selectedCount} selected</span>
                    <button className="cf-btn cf-btn-alternate" disabled={selectedCount === 0}>Send Email</button>
                    <button className="cf-btn cf-btn-alternate" disabled={selectedCount === 0}>Export Selected</button>
                </div>
            </div>
        </div>
    );
}
