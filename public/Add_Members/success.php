<?php
session_start();

// Get member data from session or generate default message
$memberAdded = isset($_SESSION['new_member_data']);
$memberData = $_SESSION['new_member_data'] ?? null;

// Clear the session data after retrieving it  
if ($memberAdded) {
    unset($_SESSION['new_member_data']);
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Success — ChurchFlow</title>
    <style>
        /* ----------- GLOBAL STYLES ----------- */
        body {
            font-family: 'Inter', 'Poppins', sans-serif;
            background: #f8fafc;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        /* ----------- CARD ----------- */
        .success-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 3rem 2.5rem;
            box-shadow: 0 10px 35px rgba(0, 0, 0, 0.06);
            text-align: center;
            max-width: 460px;
            width: 90%;
            animation: fadeIn 0.7s ease forwards;
        }

        /* ----------- ICON ----------- */
        .success-icon {
            width: 78px;
            height: 78px;
            border-radius: 50%;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.8rem;
            box-shadow: 0 6px 18px rgba(34, 197, 94, 0.3);
            animation: scaleIn 0.6s ease;
        }

        .success-icon svg {
            width: 38px;
            height: 38px;
            color: #fff;
        }

        /* ----------- TEXT ----------- */
        .success-title {
            font-size: 1.6rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.7rem;
        }

        .success-text {
            font-size: 0.95rem;
            color: #4b5563;
            margin-bottom: 2rem;
            line-height: 1.7;
        }

        /* ----------- BUTTONS ----------- */
        .action-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .btn {
            padding: 0.75rem 1.6rem;
            border-radius: 10px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            font-size: 0.95rem;
            transition: all 0.25s ease;
        }

        .btn-primary {
            background: linear-gradient(90deg, #2563eb, #1d4ed8);
            color: #ffffff;
            box-shadow: 0 3px 10px rgba(37, 99, 235, 0.25);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(37, 99, 235, 0.35);
        }

        .btn-secondary {
            background: #f3f4f6;
            color: #111827;
        }

        .btn-secondary:hover {
            background: #e5e7eb;
            transform: translateY(-2px);
        }

        /* ----------- ANIMATIONS ----------- */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(25px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes scaleIn {
            0% {
                transform: scale(0.6);
                opacity: 0;
            }

            80% {
                transform: scale(1.05);
                opacity: 1;
            }

            100% {
                transform: scale(1);
            }
        }
        
        /* Profile Modal Styles */
        .cf-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: none;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow-y: auto;
        }
        
        .cf-modal-panel {
            background: white;
            border-radius: 12px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .cf-modal-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .cf-modal-head h2 {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
        }
        
        .cf-modal-content {
            padding: 24px;
        }
        
        .cf-profile-header {
            display: flex;
            gap: 24px;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .cf-profile-avatar {
            flex-shrink: 0;
        }
        
        .cf-profile-data {
            flex: 1;
        }
        
        .cf-profile-data h3 {
            font-size: 28px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 12px 0;
        }
        
        .cf-profile-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 12px;
        }
        
        .cf-meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #64748b;
        }
        
        .cf-meta-item svg {
            flex-shrink: 0;
        }
        
        .cf-tags-row {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .cf-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-transform: capitalize;
        }
        
        .cf-badge.active {
            background: #dcfce7;
            color: #166534;
        }
        
        .cf-badge.inactive {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .cf-info-section {
            margin-bottom: 32px;
        }
        
        .cf-info-section h4 {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 16px 0;
        }
        
        .cf-grid-dual {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
        
        .cf-field-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .cf-field-label {
            font-size: 13px;
            font-weight: 500;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .cf-field-value {
            font-size: 15px;
            color: #1e293b;
            font-weight: 500;
        }
        
        .cf-info-section p {
            font-size: 14px;
            color: #475569;
            line-height: 1.6;
            margin: 0;
        }
        
        @media (max-width: 768px) {
            .cf-grid-dual {
                grid-template-columns: 1fr;
            }
            
            .cf-profile-header {
                flex-direction: column;
                text-align: center;
            }
        }
    </style>
</head>

<body>

    <div class="success-card">
        <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h2 class="success-title">Member Added Successfully</h2>
        <p class="success-text">
            The new member has been successfully registered in the
            <strong>Church Management System</strong>.
            You can now view their profile or add another member.
        </p>
        <div class="action-buttons">
            <button class="btn btn-secondary" onclick="viewMemberProfile()">
                View Member Profile
            </button>
            <button class="btn btn-primary" onclick="window.location.href='/Church_Management_System/admin_dashboard/Add_Members/enroll_members.html'">
                Add Another Member
            </button>
        </div>
    </div>
    
    <!-- Member Profile Modal -->
    <div class="cf-modal" id="profileModal">
        <div class="cf-modal-panel">
            <div class="cf-modal-head">
                <h2>Member Profile</h2>
                <button class="cf-modal-close" onclick="closeProfileModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">×</button>
            </div>
            <div class="cf-modal-content" id="profileModalBody">
                <!-- Profile content will be populated by JavaScript -->
            </div>
        </div>
    </div>

    <script>
        // Store member data from PHP
        const memberData = <?php echo $memberAdded ? json_encode($memberData) : 'null'; ?>;
        
        function viewMemberProfile() {
            if (!memberData) {
                alert('No member data available. Please try again.');
                window.location.href = '/Church_Management_System/admin_dashboard/Add_Members/enroll_members.html';
                return;
            }
            
            const member = memberData;
            const modal = document.getElementById('profileModal');
            const body = document.getElementById('profileModalBody');
            
            body.innerHTML = `
                <div class="cf-profile-header">
                    <div class="cf-profile-avatar">
                        ${member.photo_path ?
                            `<img src="/Church_Management_System/admin_dashboard/Add_Members/${member.photo_path}" alt="${member.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>`
                            :
                            `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>`
                        }
                    </div>
                    <div class="cf-profile-data">
                        <h3>${member.name}</h3>
                        <div class="cf-profile-meta">
                            <span class="cf-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                                <span>${member.email}</span>
                            </span>
                            <span class="cf-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                <span>${member.phone}</span>
                            </span>
                            <span class="cf-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                                <span>Just Registered</span>
                            </span>
                        </div>
                        <div class="cf-tags-row">
                            <span class="cf-badge ${member.status.toLowerCase()}">${member.status}</span>
                        </div>
                    </div>
                </div>
        
                <div class="cf-info-section">
                    <h4>Personal Information</h4>
                    <div class="cf-grid-dual">
                        <div class="cf-field-group">
                            <span class="cf-field-label">Gender</span>
                            <span class="cf-field-value">${member.gender || 'Not specified'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Date of Birth</span>
                            <span class="cf-field-value">${member.date_of_birth || 'Not specified'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Marital Status</span>
                            <span class="cf-field-value">${member.marital_status || 'Not specified'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Occupation</span>
                            <span class="cf-field-value">${member.occupation || 'Not specified'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Address</span>
                            <span class="cf-field-value">${member.address || 'Not specified'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">City</span>
                            <span class="cf-field-value">${member.city || 'Not specified'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Region</span>
                            <span class="cf-field-value">${member.region || 'Not specified'}</span>
                        </div>
                    </div>
                </div>
        
                <div class="cf-info-section">
                    <h4>Church Information</h4>
                    <div class="cf-grid-dual">
                        <div class="cf-field-group">
                            <span class="cf-field-label">Church Group</span>
                            <span class="cf-field-value">${member.church_group || 'Not assigned'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Ministries</span>
                            <span class="cf-field-value">${member.ministries || 'No Ministry'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Departments</span>
                            <span class="cf-field-value">${member.departments || 'No Department'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Leadership Role</span>
                            <span class="cf-field-value">${member.leadership_role || 'None'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Baptism Status</span>
                            <span class="cf-field-value">${member.baptism_status || 'Not specified'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Spiritual Growth</span>
                            <span class="cf-field-value">${member.spiritual_growth || 'Not specified'}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Membership Type</span>
                            <span class="cf-field-value">${member.membership_type || 'Not specified'}</span>
                        </div>
                    </div>
                </div>
        
                ${member.emergency_name ? `
                <div class="cf-info-section">
                    <h4>Emergency Contact</h4>
                    <div class="cf-grid-dual">
                        <div class="cf-field-group">
                            <span class="cf-field-label">Name</span>
                            <span class="cf-field-value">${member.emergency_name}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Phone</span>
                            <span class="cf-field-value">${member.emergency_phone}</span>
                        </div>
                        <div class="cf-field-group">
                            <span class="cf-field-label">Relation</span>
                            <span class="cf-field-value">${member.emergency_relation}</span>
                        </div>
                    </div>
                </div>
                ` : ''}
        
                ${member.notes ? `
                <div class="cf-info-section">
                    <h4>Notes</h4>
                    <p>${member.notes}</p>
                </div>
                ` : ''}
            `;
            
            modal.style.display = 'flex';
        }
        
        function closeProfileModal() {
            document.getElementById('profileModal').style.display = 'none';
        }
    </script>

</body>

</html>