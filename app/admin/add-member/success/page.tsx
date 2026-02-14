'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ViewProfileModal from '../../../../components/Admin/members/ViewProfileModal';
import './success.css';

interface MemberData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    gender: string;
    dateOfBirth: string;
    maritalStatus: string;
    occupation: string;
    address: string;
    city: string;
    region: string;
    selectedMinistry: string;
    departments: string[];
    leadership: string;
    ministries: string[];
    baptismStatus: string;
    spiritualGrowth: string;
    membershipType: string;
    birthdayTitle: string;
    birthdayMessage: string;
    notes: string;
    emergencyName: string;
    emergencyPhone: string;
    emergencyRelation: string;
    photoPreview: string | null;
    birthdayThumbPreview: string | null;
}

export default function AddMemberSuccessPage() {
    const router = useRouter();
    const [mappedMember, setMappedMember] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [memberData, setMemberData] = useState<MemberData | null>(null);

    // Get data from session storage
    useEffect(() => {
        const stored = sessionStorage.getItem('newMemberData');
        if (stored) {
            try {
                setMemberData(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse member data', e);
            }
        }
    }, []);

    // Map data when available
    useEffect(() => {
        if (memberData) {
            setMappedMember({
                member_id: 0,
                first_name: memberData.firstName,
                last_name: memberData.lastName,
                email: memberData.email,
                phone: memberData.phone,
                status: memberData.status,
                gender: memberData.gender,
                date_of_birth: memberData.dateOfBirth,
                marital_status: memberData.maritalStatus,
                occupation: memberData.occupation,
                address: memberData.address,
                city: memberData.city,
                region: memberData.region,
                church_group: memberData.selectedMinistry,
                leadership_role: memberData.leadership,
                baptism_status: memberData.baptismStatus,
                spiritual_growth: memberData.spiritualGrowth,
                membership_type: memberData.membershipType,
                birthday_title: memberData.birthdayTitle,
                birthday_message: memberData.birthdayMessage,
                notes: memberData.notes,
                emergency_name: memberData.emergencyName,
                emergency_phone: memberData.emergencyPhone,
                emergency_relation: memberData.emergencyRelation,
                photo_path: memberData.photoPreview,
                created_at: new Date().toISOString(),
                attendance: 0,
                memberMinistries: memberData.ministries ? memberData.ministries.map(m => ({ ministry: { ministry_name: typeof m === 'string' ? m : '' } })) : [],
                memberDepartments: memberData.departments ? memberData.departments.map(d => ({ department: { department_name: d } })) : []
            });
        }
    }, [memberData]);

    const viewMemberProfile = () => {
        if (!mappedMember) {
            alert('No member data available. Please try again.');
            router.push('/admin/add-member');
            return;
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const addAnother = () => {
        sessionStorage.removeItem('newMemberData');
        router.push('/admin/add-member');
    };

    const goToDashboard = () => {
        sessionStorage.removeItem('newMemberData');
        router.push('/admin/dashboard');
    };

    return (
        <div className="success-page">
            <div className="success-card">
                <div className="success-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="success-title">Member Added Successfully! 🎉</h2>
                <p className="success-text">
                    The new member has been successfully registered in the
                    <strong> Church Management System</strong>.
                    You can now view their profile or add another member.
                </p>
                <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={viewMemberProfile}>
                        View Member Profile
                    </button>
                    <button className="btn btn-primary" onClick={addAnother}>
                        Add Another Member
                    </button>
                </div>
                <button className="btn-link" onClick={goToDashboard}>
                    ← Back to Dashboard
                </button>
            </div>

            {/* Reuse ViewProfileModal */}
            <ViewProfileModal
                member={mappedMember}
                isOpen={showModal}
                handleClose={closeModal}
            />
        </div>
    );
}
