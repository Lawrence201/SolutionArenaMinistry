"use client";

import React from "react";
import "./admin.css";

export default function AdminHeader() {
    const toggleSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    };

    return (
        <div className="header">
            <button className="mobile-menu-toggle" onClick={toggleSidebar}>☰</button>
            <div className="search-bar">
                <input type="text" className="search-input" placeholder="Search members, events, or anything..." />
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                </svg>
            </div>
            <div className="header-right">
                <div className="notification-icon">
                    <span style={{ fontSize: '20px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                        </svg>
                    </span>
                    <span className="notification-badge">0</span>
                </div>
                <div className="user-profile">
                    <span style={{ fontSize: '14px', fontWeight: 500 }} id="adminNameDisplay">Admin</span>
                    <span style={{ fontSize: '20px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    );
}
