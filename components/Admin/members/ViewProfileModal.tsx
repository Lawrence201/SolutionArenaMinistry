'use client';

import React, { useEffect } from 'react';

type ViewProfileModalProps = {
    member: any | null;
    isOpen: boolean;
    handleClose: () => void;
};

declare global {
    interface Window {
        jspdf: any;
    }
}

export default function ViewProfileModal({ member, isOpen, handleClose }: ViewProfileModalProps) {
    useEffect(() => {
        // Load jsPDF script if not already loaded
        if (isOpen && !window.jspdf) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, [isOpen]);

    if (!isOpen || !member) return null;

    const memberName = `${member.first_name} ${member.last_name}`;
    const joinedDate = member.created_at ? new Date(member.created_at).toLocaleDateString() : 'Not specified';
    const ministry = member.memberMinistries && member.memberMinistries.length > 0
        ? member.memberMinistries[0].ministry.ministry_name
        : 'No Ministry';
    const department = member.memberDepartments && member.memberDepartments.length > 0
        ? member.memberDepartments[0].department.department_name
        : 'No Department';

    // Calculate engagement based on attendance
    const getEngagement = (attendance: number) => {
        if (attendance >= 75) return 'High';
        if (attendance >= 40) return 'Medium';
        return 'Low';
    };
    const engagement = getEngagement(member.attendance || 0);

    // Print function
    const printProfile = () => {
        window.print();
    };

    const exportProfileToPDF = async () => {
        if (!member) return;

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            let yPos = 20;

            // ========== HEADER: Member Profile Title ==========
            doc.setFontSize(22);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(79, 70, 229); // Purple color
            doc.text('Member Profile', 105, yPos, { align: 'center' });

            yPos += 20;

            // ========== PROFILE HEADER SECTION ==========
            const headerStartY = yPos;

            // LEFT SIDE: Member Details
            doc.setFont(undefined, 'bold');
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text(`${member.first_name} ${member.last_name}`, 14, yPos);

            yPos += 10;

            // Contact info
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.text(`Email: ${member.email || ''}`, 14, yPos);

            yPos += 6;
            doc.text(`Phone: ${member.phone || ''}`, 14, yPos);

            yPos += 6;
            const joinDate = member.created_at ? new Date(member.created_at).toLocaleDateString() : 'Not specified';
            doc.text(`Joined: ${joinDate}`, 14, yPos);

            yPos += 10;

            // Status badges
            doc.setFontSize(9);

            // Active/Inactive badge
            const status = member.status || 'Active';
            doc.setFillColor(209, 250, 229); // Light green for active
            if (status.toLowerCase() === 'inactive') {
                doc.setFillColor(254, 202, 202); // Light red for inactive
            }
            doc.roundedRect(14, yPos - 5, 28, 8, 2, 2, 'F');

            doc.setTextColor(6, 95, 70);
            if (status.toLowerCase() === 'inactive') {
                doc.setTextColor(153, 27, 27);
            }
            doc.text(status, 16, yPos);

            // Engagement badge
            const validEngagement = engagement || 'Low'; // Fallback
            doc.setFillColor(219, 234, 254); // Light blue
            doc.roundedRect(46, yPos - 5, 50, 8, 2, 2, 'F');
            doc.setTextColor(29, 78, 216);
            doc.text(`${validEngagement} Engagement`, 48, yPos);

            // RIGHT SIDE: Profile Picture
            const imageSize = 40;
            const imageX = 196 - imageSize - 10; // 10 margin from right edge
            const imageY = headerStartY;

            // Helper to load image
            const loadImageForPDF = (url: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = url;
                });
            };

            const photoUrl = member.photo_path ? (member.photo_path.startsWith('/') || member.photo_path.startsWith('http') ? member.photo_path : `/uploads/members/${member.photo_path}`) : null;

            if (photoUrl) {
                try {
                    const img = await loadImageForPDF(photoUrl);

                    // Draw white background circle for image
                    doc.setFillColor(255, 255, 255);
                    doc.circle(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2 + 1, 'F');

                    // Draw border circle - Ash gray color
                    doc.setDrawColor(229, 231, 235);
                    doc.setLineWidth(1);
                    doc.circle(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2 + 1, 'S');

                    // Add image (clipping implies square in jsPDF addImage usually, unless using specialized clip args. Legacy code just placed it.)
                    doc.addImage(img, 'JPEG', imageX, imageY, imageSize, imageSize, '', 'FAST');
                } catch (e) {
                    // Draw placeholder on error
                    console.error('Image load failed', e);
                    drawPlaceholder(doc, imageX, imageY, imageSize);
                }
            } else {
                drawPlaceholder(doc, imageX, imageY, imageSize);
            }

            // Move position down past the profile header
            yPos = Math.max(yPos + 10, imageY + imageSize + 10);

            // Draw separator line
            doc.setDrawColor(229, 231, 235);
            doc.line(14, yPos, 196, yPos);
            yPos += 10;

            // Personal Information Section
            doc.setFontSize(14);
            doc.setTextColor(79, 70, 229);
            doc.text('Personal Information', 14, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            const personalInfo = [
                ['Gender:', member.gender || 'Not specified'],
                ['Date of Birth:', member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'Not specified'],
                ['Marital Status:', member.marital_status || 'Not specified'],
                ['Occupation:', member.occupation || 'Not specified'],
                ['Address:', member.address || 'Not specified'],
                ['City:', member.city || 'Not specified'],
                ['Region:', member.region || 'Not specified']
            ];

            personalInfo.forEach(([label, value], index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                const xPos = col === 0 ? 14 : 110; // Left align or right column align
                const currentY = yPos + (row * 14);

                doc.setFont(undefined, 'bold');
                doc.setTextColor(55, 65, 81);
                doc.text(label, xPos, currentY);

                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 0);
                const valueText = doc.splitTextToSize(value as string, 80);
                doc.text(valueText, xPos, currentY + 5);
            });

            yPos += Math.ceil(personalInfo.length / 2) * 14 + 10;

            // Separator line
            doc.setDrawColor(229, 231, 235);
            doc.line(14, yPos, 196, yPos);
            yPos += 10;

            // Church Information Section
            doc.setFontSize(14);
            doc.setTextColor(79, 70, 229);
            doc.text('Church Information', 14, yPos);
            yPos += 8;

            doc.setFontSize(10);

            // Re-calculate derived values
            const ministryName = member.memberMinistries?.[0]?.ministry?.ministry_name || 'No Ministry';
            const deptName = member.memberDepartments?.[0]?.department?.department_name || 'No Department';

            const churchInfo = [
                ['Church Group:', member.church_group || 'Not assigned'],
                ['Ministries:', ministryName],
                ['Departments:', deptName],
                ['Leadership Role:', member.leadership_role || 'None'],
                ['Baptism Status:', member.baptism_status || 'Not specified'],
                ['Spiritual Growth:', member.spiritual_growth || 'Not specified'],
                ['Membership Type:', member.membership_type || 'Not specified'],
                ['Attendance Rate:', `${member.attendance || 0}%`]
            ];

            churchInfo.forEach(([label, value], index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                const xPos = col === 0 ? 14 : 110;
                const currentY = yPos + (row * 14);

                doc.setFont(undefined, 'bold');
                doc.setTextColor(55, 65, 81);
                doc.text(label, xPos, currentY);

                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 0);
                const valueText = doc.splitTextToSize(value as string, 80);
                doc.text(valueText, xPos, currentY + 5);
            });

            yPos += Math.ceil(churchInfo.length / 2) * 14 + 10;

            // Emergency Contact if exists
            if (member.emergency_name) {
                doc.setDrawColor(229, 231, 235);
                doc.line(14, yPos, 196, yPos);
                yPos += 10;

                doc.setFontSize(14);
                doc.setTextColor(79, 70, 229);
                doc.text('Emergency Contact', 14, yPos);
                yPos += 8;

                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(55, 65, 81);
                doc.text('Name:', 14, yPos);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 0);
                doc.text(member.emergency_name, 14, yPos + 5);

                doc.setFont(undefined, 'bold');
                doc.setTextColor(55, 65, 81);
                doc.text('Phone:', 110, yPos);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 0);
                doc.text(member.emergency_phone || '', 110, yPos + 5);

                yPos += 14;

                doc.setFont(undefined, 'bold');
                doc.setTextColor(55, 65, 81);
                doc.text('Relation:', 14, yPos);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 0);
                doc.text(member.emergency_relation || '', 14, yPos + 5);
            }

            doc.save(`${member.first_name}_${member.last_name}_Profile.pdf`);

        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    function drawPlaceholder(doc: any, x: number, y: number, size: number) {
        doc.setFillColor(243, 244, 246);
        doc.circle(x + size / 2, y + size / 2, size / 2, 'F');
        doc.setDrawColor(156, 163, 175);
        doc.circle(x + size / 2, y + size / 2, size / 2, 'S');

        // Draw simple user icon
        doc.setFillColor(156, 163, 175);
        doc.circle(x + size / 2, y + size / 2 - 5, 6, 'F'); // head
        doc.ellipse(x + size / 2, y + size / 2 + 10, 10, 8, 'F'); // body
    }

    return (
        <div className={`cf-modal ${isOpen ? 'cf-show' : ''}`} id="profileModal" onClick={handleClose}>
            <div className="cf-modal-panel" onClick={(e) => e.stopPropagation()}>
                <div className="cf-modal-head">
                    <h2>Member Profile</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="cf-btn cf-btn-alternate" onClick={exportProfileToPDF} style={{ padding: '8px 16px', fontSize: '14px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '5px' }}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            PDF
                        </button>
                        <button className="cf-btn cf-btn-alternate" onClick={printProfile} style={{ padding: '8px 16px', fontSize: '14px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '5px' }}>
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect width="12" height="8" x="6" y="14"></rect>
                            </svg>
                            Print
                        </button>
                        <button className="cf-modal-close" onClick={handleClose}>×</button>
                    </div>
                </div>
                <div className="cf-modal-content" id="profileModalBody">
                    <div className="cf-profile-header">
                        <div className="cf-profile-avatar">
                            {member.photo_path ? (
                                <img
                                    src={member.photo_path.startsWith('/') || member.photo_path.startsWith('http') ? member.photo_path : `/uploads/members/${member.photo_path}`}
                                    alt={memberName}
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/images/defaults/user_placeholder.png'; // Fallback
                                        (e.target as HTMLImageElement).onerror = null; // Prevent infinite loop
                                    }}
                                />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            )}
                        </div>
                        <div className="cf-profile-data">
                            <h3>{memberName}</h3>
                            <div className="cf-profile-meta">
                                <span className="cf-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                                    <span>{member.email}</span>
                                </span>
                                <span className="cf-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    <span>{member.phone}</span>
                                </span>
                                <span className="cf-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                                    <span>Joined {joinedDate}</span>
                                </span>
                            </div>
                            <div className="cf-tags-row">
                                <span className={`cf-badge ${(member.status || 'active').toLowerCase()}`}>{member.status || 'Active'}</span>
                                <span className={`cf-badge ${engagement.toLowerCase()}`}>{engagement} Engagement</span>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="cf-info-section">
                        <h4>Personal Information</h4>
                        <div className="cf-grid-dual">
                            <div className="cf-field-group">
                                <span className="cf-field-label">Gender</span>
                                <span className="cf-field-value">{member.gender || 'Not specified'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Date of Birth</span>
                                <span className="cf-field-value">{member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'Not specified'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Marital Status</span>
                                <span className="cf-field-value">{member.marital_status || 'Not specified'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Occupation</span>
                                <span className="cf-field-value">{member.occupation || 'Not specified'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Address</span>
                                <span className="cf-field-value">{member.address || 'Not specified'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">City</span>
                                <span className="cf-field-value">{member.city || 'Not specified'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Region</span>
                                <span className="cf-field-value">{member.region || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Church Information */}
                    <div className="cf-info-section">
                        <h4>Church Information</h4>
                        <div className="cf-grid-dual">
                            <div className="cf-field-group">
                                <span className="cf-field-label">Church Group</span>
                                <span className="cf-field-value">{member.church_group || 'Not assigned'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Ministries</span>
                                <span className="cf-field-value">{ministry}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Departments</span>
                                <span className="cf-field-value">{department}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Leadership Role</span>
                                <span className="cf-field-value">{member.leadership_role || 'None'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Baptism Status</span>
                                <span className="cf-field-value">{member.baptism_status || 'Not specified'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Spiritual Growth</span>
                                <span className="cf-field-value">{member.spiritual_growth || 'Not specified'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Membership Type</span>
                                <span className="cf-field-value">{member.membership_type || 'Not specified'}</span>
                            </div>
                            <div className="cf-field-group">
                                <span className="cf-field-label">Attendance Rate</span>
                                <span className="cf-field-value">{member.attendance || 0}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    {member.emergency_name && (
                        <div className="cf-info-section">
                            <h4>Emergency Contact</h4>
                            <div className="cf-grid-dual">
                                <div className="cf-field-group">
                                    <span className="cf-field-label">Name</span>
                                    <span className="cf-field-value">{member.emergency_name}</span>
                                </div>
                                <div className="cf-field-group">
                                    <span className="cf-field-label">Phone</span>
                                    <span className="cf-field-value">{member.emergency_phone}</span>
                                </div>
                                <div className="cf-field-group">
                                    <span className="cf-field-label">Relation</span>
                                    <span className="cf-field-value">{member.emergency_relation}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {member.notes && (
                        <div className="cf-info-section">
                            <h4>Notes</h4>
                            <p>{member.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
