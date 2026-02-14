"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import "./admin.css";

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Toggle sidebar for mobile
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            if (!isOpen) {
                sidebar.classList.add('open');
            } else {
                sidebar.classList.remove('open');
            }
        }
    };

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const sidebar = document.querySelector('.sidebar');
            const toggle = document.querySelector('.mobile-menu-toggle');

            if (
                window.innerWidth <= 1028 &&
                sidebar &&
                !sidebar.contains(event.target as Node) &&
                toggle &&
                !toggle.contains(event.target as Node) &&
                sidebar.classList.contains('open')
            ) {
                setIsOpen(false);
                sidebar.classList.remove('open');
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    return (
        <>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="logo">
                    <Link href="/admin/dashboard">
                        <img src="/assets/Logo.PNG" alt="Logo" />
                    </Link>
                    <div className="logo-text">
                        <h1>SOLUTION PANEL</h1>
                        <p>The City of truth</p>
                    </div>
                    <button className="sidebar-close" onClick={toggleSidebar}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="menu-section">
                        <div className="menu-label">Main Menu</div>
                        <Link href="/admin/dashboard" className={`menu-item ${pathname === '/admin/dashboard' ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                                    <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                                    <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                                    <rect width="7" height="5" x="3" y="16" rx="1"></rect>
                                </svg>
                            </span>
                            <span>Dashboard</span>
                        </Link>

                        <Link href="/admin/members" className={`menu-item ${pathname.includes('/admin/members') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </span>
                            <span>Members</span>
                        </Link>

                        <Link href="/admin/visitors" className={`menu-item ${pathname.includes('/admin/visitors') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <polyline points="16 11 18 13 22 9"></polyline>
                                </svg>
                            </span>
                            <span>Visitors</span>
                        </Link>
                        <Link href="/admin/events" className={`menu-item ${pathname.includes('/admin/events') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8 2v4"></path>
                                    <path d="M16 2v4"></path>
                                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                    <path d="M3 10h18"></path>
                                </svg>
                            </span>
                            <span>Events</span>
                        </Link>
                        <Link href="/admin/gallery" className={`menu-item ${pathname.includes('/admin/gallery') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 22H4a2 2 0 0 1-2-2V6"></path>
                                    <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"></path>
                                    <circle cx="12" cy="8" r="2"></circle>
                                    <rect width="16" height="16" x="6" y="2" rx="2"></rect>
                                </svg>
                            </span>
                            <span>Gallery</span>
                        </Link>
                        <Link href="/admin/sermons" className={`menu-item ${pathname.includes('/admin/sermons') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                                    <path d="M12 2v8"></path>
                                    <path d="M9 7h6"></path>
                                </svg>
                            </span>
                            <span>Sermons</span>
                        </Link>
                        <Link href="/admin/finance" className={`menu-item ${pathname.includes('/admin/finance') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" x2="12" y1="2" y2="22"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </span>
                            <span>Finances</span>
                        </Link>
                        <Link href="/admin/blogs" className={`menu-item ${pathname.includes('/admin/blogs') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                                    <path d="M18 14h-8"></path>
                                    <path d="M15 18h-5"></path>
                                    <path d="M10 6h8v4h-8V6Z"></path>
                                </svg>
                            </span>
                            <span>Blogs</span>
                        </Link>
                        <Link href="/admin/communication" className={`menu-item ${pathname.includes('/admin/communication') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </span>
                            <span>Communications</span>
                        </Link>
                        <Link href="/admin/attendance" className={`menu-item ${pathname.includes('/admin/attendance') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <polyline points="16 11 18 13 22 9"></polyline>
                                </svg>
                            </span>
                            <span>Attendance</span>
                        </Link>
                        <Link href="/admin/reports" className={`menu-item ${pathname.includes('/admin/reports') ? 'active' : ''}`}>

                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                                    <path d="M18 17V9"></path>
                                    <path d="M13 17V5"></path>
                                    <path d="M8 17v-3"></path>
                                </svg>
                            </span>
                            <span>Reports</span>
                        </Link>
                    </div>

                    <div className="menu-section">
                        <div className="menu-label">AI Features</div>
                        <Link href="/admin/ai/insights" className={`menu-item has-badge ${pathname.includes('/admin/ai/insights') ? 'active' : ''}`}>
                            <span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L13.5 7.5H19L14.5 11L16 16.5L12 13L8 16.5L9.5 11L5 7.5H10.5L12 2Z" fill="currentColor" opacity="0.2" />
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M12 5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M12 16V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M5 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M16 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M7.5 7.5L9.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M14.5 14.5L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M7.5 16.5L9.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M14.5 9.5L16.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                                    <circle cx="19" cy="12" r="1.5" fill="currentColor" />
                                    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                                    <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                                </svg>
                            </span>
                            <span>AI Insights </span>
                            <span className="badge">New</span>
                        </Link>
                        <Link href="/admin/ai/analytics" className={`menu-item has-badge ${pathname.includes('/admin/ai/analytics') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                                    <path d="M18 17V9"></path>
                                    <path d="M13 17V5"></path>
                                    <path d="M8 17v-3"></path>
                                </svg>
                            </span>
                            <span>Member Analytics</span>
                            <span className="badge">New</span>
                        </Link>
                        <Link href="/admin/ai/reports" className={`menu-item has-badge ${pathname.includes('/admin/ai/reports') ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                                    <path d="M10 9H8"></path>
                                    <path d="M16 13H8"></path>
                                    <path d="M16 17H8"></path>
                                </svg>
                            </span>
                            <span>Smart Reports</span>
                            <span className="badge">New</span>
                        </Link>
                    </div>

                    <div className="menu-section">
                        <div className="menu-label">Quick Actions</div>
                        <Link href="/admin/add-member" className={`menu-item ${pathname === '/admin/add-member' ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <line x1="19" x2="19" y1="8" y2="14"></line>
                                    <line x1="22" x2="16" y1="11" y2="11"></line>
                                </svg>
                            </span>
                            <span>Add Member</span>
                        </Link>
                        <Link href="/admin/add-event" className={`menu-item ${pathname === '/admin/add-event' ? 'active' : ''}`}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8 2v4"></path>
                                    <path d="M16 2v4"></path>
                                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                    <path d="M3 10h18"></path>
                                </svg>
                            </span>
                            <span>New Event</span>
                        </Link>
                        <Link href="/admin/add-gallery" className={`menu-item ${pathname === '/admin/add-gallery' ? 'active' : ''}`}>
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                                    <line x1="16" x2="22" y1="5" y2="5"></line>
                                    <line x1="19" x2="19" y1="2" y2="8"></line>
                                    <circle cx="9" cy="9" r="2"></circle>
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                                </svg>
                            </span>
                            <span>Add Gallery</span>
                        </Link>
                        <Link href="/admin/add-sermon" className={`menu-item ${pathname === '/admin/add-sermon' ? 'active' : ''}`}>
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="12" x2="12" y1="11" y2="17"></line>
                                    <line x1="9" x2="15" y1="14" y2="14"></line>
                                </svg>
                            </span>
                            <span>Add Sermon</span>
                        </Link>
                        <Link href="/admin/add_finance" className={`menu-item ${pathname === '/admin/add_finance' ? 'active' : ''}`}>
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" x2="12" y1="2" y2="22"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </span>
                            <span>Record Donation</span>
                        </Link>
                        <Link href="/admin/add-blog" className={`menu-item ${pathname === '/admin/add-blog' ? 'active' : ''}`}>
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                                </svg>
                            </span>
                            <span>Add Blogs</span>
                        </Link>
                        <Link href="/admin/communication/send" className="menu-item">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                                </svg>
                            </span>
                            <span>Send Message</span>
                        </Link>
                        <Link href="/admin/settings" className="menu-item">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </span>
                            <span>Settings</span>
                        </Link>
                    </div>

                    <div className="menu-section">
                        <div onClick={() => console.log('Logout')} className="menu-item" style={{ color: '#ef4444', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </span>
                            <span>Logout</span>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
