import React, { useState, useEffect } from 'react';
import '../admin.css';
import { updateMember } from '@/app/actions/updateMemberAction';
import Toast from '@/components/ui/Toast';

type EditMemberModalProps = {
    isOpen: boolean;
    member: any;
    onClose: () => void;
    onSave?: (updatedMember: any) => void;
};

export default function EditMemberModal({ isOpen, member, onClose, onSave }: EditMemberModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [birthdayThumbPreview, setBirthdayThumbPreview] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (isOpen && member) {
            setCurrentStep(1);
            setFormData({
                first_name: member.first_name || member.firstName || '',
                last_name: member.last_name || member.lastName || '',
                date_of_birth: member.date_of_birth || '',
                gender: member.gender || '',
                marital_status: member.marital_status || '',
                occupation: member.occupation || '',
                phone: member.phone || '',
                email: member.email || '',
                address: member.address || '',
                city: member.city || '',
                region: member.region || '',
                gps_address: member.gps_address || '',
                emergency_name: member.emergency_name || '',
                emergency_phone: member.emergency_phone || '',
                emergency_relation: member.emergency_relation || '',
                status: member.status || 'Active',
                church_group: member.church_group || '',
                departments: member.departments || '',
                leadership_role: member.leadership_role || 'None',
                ministries: member.ministries || '',
                baptism_status: member.baptism_status || '',
                spiritual_growth: member.spiritual_growth || '',
                membership_type: member.membership_type || '',
                notes: member.notes || '',
                birthday_title: member.birthday_title || '',
                birthday_message: member.birthday_message || '',
                photo_path: member.photo_path || null,
                birthday_thumb: member.birthday_thumb || null,
            });

            // Match MembersTable photo display logic
            if (member.photo_path) {
                setPhotoPreview(
                    member.photo_path.startsWith('/') || member.photo_path.startsWith('http')
                        ? member.photo_path
                        : `/uploads/members/${member.photo_path}`
                );
            } else {
                setPhotoPreview(null);
            }

            if (member.birthday_thumb) {
                setBirthdayThumbPreview(
                    member.birthday_thumb.startsWith('/') || member.birthday_thumb.startsWith('http')
                        ? member.birthday_thumb
                        : `/uploads/birthday/${member.birthday_thumb}`
                );
            } else {
                setBirthdayThumbPreview(null);
            }
        }
    }, [isOpen, member]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleMinistrySelect = (ministryName: string) => {
        setFormData({ ...formData, church_group: ministryName });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value, checked } = e.target;
        let currentValues = formData[fieldName] ? formData[fieldName].split(',').map((s: string) => s.trim()) : [];

        if (value === 'none') {
            currentValues = checked ? ['none'] : [];
        } else {
            if (checked) {
                currentValues = currentValues.filter((v: string) => v !== 'none');
                currentValues.push(value);
            } else {
                currentValues = currentValues.filter((v: string) => v !== value);
            }
        }
        setFormData({ ...formData, [fieldName]: currentValues.join(',') });
    };

    const isChecked = (fieldName: string, value: string) => {
        const currentValues = formData[fieldName] ? formData[fieldName].split(',').map((s: string) => s.trim().toLowerCase()) : [];
        return currentValues.includes(value.toLowerCase());
    };



    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Add photo data to form if it's base64 (new upload)
            const submitData = {
                ...formData,
                photoData: photoPreview?.startsWith('data:') ? photoPreview : null,
                birthdayThumbData: birthdayThumbPreview?.startsWith('data:') ? birthdayThumbPreview : null,
            };

            const result = await updateMember(member.member_id, submitData);
            if (result.success) {
                if (onSave) {
                    onSave(result.member);
                }
                setToast({ message: 'Member updated successfully!', type: 'success' });

                // Wait for toast to be seen before closing/refreshing
                setTimeout(() => {
                    onClose();
                    window.location.reload(); // Keeping reload to ensure all derived data (stats, etc) updates
                }, 1500);
            } else {
                setToast({ message: 'Failed to update member: ' + (result.error || 'Unknown error'), type: 'error' });
            }
        } catch (error) {
            console.error('Error updating member:', error);
            setToast({ message: 'An error occurred while updating', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`cf-modal ${isOpen ? 'cf-show' : ''}`} id="editModal" onClick={onClose}>
            <div className="cf-modal-panel" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
                <div className="cf-modal-head">
                    <h2 id="editModalTitle">Edit Member</h2>
                    <button className="cf-modal-close" onClick={onClose}>×</button>
                </div>

                {/* Progress Indicator */}
                <div className="xax-progress-container" style={{ padding: '0 24px' }}>
                    <div className="cuttin-progress-steps">
                        <div className="xax-progress-line">
                            <div className="cuttin-progress-line-fill" id="editProgressFill" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
                        </div>
                        {[
                            { step: 1, label: 'Personal' },
                            { step: 2, label: 'Contact' },
                            { step: 3, label: 'Ministry' },
                            { step: 4, label: 'Spiritual' }
                        ].map((item) => (
                            <div key={item.step}
                                className={`xax-step ${currentStep >= item.step ? 'active' : ''}`}
                                data-step={item.step}
                                onClick={() => setCurrentStep(item.step)}
                                style={{ cursor: 'pointer' }}>
                                <div className="cuttin-step-circle">{item.step}</div>
                                <span className="cuttin-step-label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cf-modal-content">
                    <form id="memberForm">
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="cuttin-form-section active" id="editStep1">
                                <div className="xax-section-header" style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                                        Personal Information</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b' }}>Basic details about the member</p>
                                </div>

                                <div className="cuttin-form-group full-width" style={{ marginBottom: '24px' }}>
                                    <label className="xax-form-label">Profile Photo</label>
                                    <div className="cuttin-photo-upload">
                                        <div className="xax-photo-preview" id="editPhotoPreview">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Profile" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }} />
                                            ) : (
                                                <div className="cuttin-photo-placeholder">👤</div>
                                            )}
                                        </div>
                                        <div className="xax-photo-controls">
                                            <div className="cuttin-file-input-wrapper">
                                                <input type="file" id="editPhotoInput" name="editPhotoInput"
                                                    accept="image/*" onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            const reader = new FileReader();
                                                            reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
                                                            reader.readAsDataURL(e.target.files[0]);
                                                        }
                                                    }} />
                                                <label htmlFor="editPhotoInput" className="xax-file-input-label">Upload
                                                    Photo</label>
                                            </div>
                                            <p className="cuttin-form-helper">JPG, PNG or GIF. Max 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="xax-form-grid"
                                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">First Name <span
                                            className="cuttin-required">*</span></label>
                                        <input type="text" className="xax-form-input" name="first_name" value={formData.first_name || ''} onChange={handleChange} required />
                                    </div>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">Last Name <span
                                            className="cuttin-required">*</span></label>
                                        <input type="text" className="xax-form-input" name="last_name" value={formData.last_name || ''} onChange={handleChange} required />
                                    </div>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">Date of Birth</label>
                                        <input type="date" className="xax-form-input" name="date_of_birth" value={formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : ''} onChange={handleChange} />
                                    </div>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">Gender</label>
                                        <select className="xax-form-select" name="gender" value={formData.gender || ''} onChange={handleChange}>
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">Marital Status</label>
                                        <select className="xax-form-select" name="marital_status" value={formData.marital_status || ''} onChange={handleChange}>
                                            <option value="">Select status</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Divorced">Divorced</option>
                                            <option value="Widowed">Widowed</option>
                                        </select>
                                    </div>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">Occupation</label>
                                        <input type="text" className="xax-form-input" name="occupation" value={formData.occupation || ''} onChange={handleChange}
                                            placeholder="e.g., Teacher, Engineer" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Contact Details */}
                        {currentStep === 2 && (
                            <div className="cuttin-form-section active" id="editStep2">
                                <div className="xax-section-header" style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                                        Contact Details</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b' }}>How can we reach this member?</p>
                                </div>

                                <div className="xax-form-grid"
                                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">Phone Number <span
                                            className="cuttin-required">*</span></label>
                                        <input type="tel" className="xax-form-input" name="phone" value={formData.phone || ''} onChange={handleChange}
                                            placeholder="0551234567" required />
                                    </div>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">Email Address <span
                                            className="cuttin-required">*</span></label>
                                        <input type="email" className="xax-form-input" name="email" value={formData.email || ''} onChange={handleChange}
                                            placeholder="member@example.com" required />
                                    </div>
                                    <div className="cuttin-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="xax-form-label">Home Address</label>
                                        <input type="text" className="xax-form-input" name="address" value={formData.address || ''} onChange={handleChange}
                                            placeholder="Street address" />
                                    </div>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">City</label>
                                        <input type="text" className="xax-form-input" name="city" value={formData.city || ''} onChange={handleChange} placeholder="City" />
                                    </div>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">Region</label>
                                        <input type="text" className="xax-form-input" name="region" value={formData.region || ''} onChange={handleChange}
                                            placeholder="Region/State" />
                                    </div>

                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">GPS Address (Ghana Post GPS)</label>
                                        <input type="text" className="xax-form-input" name="gps_address" value={formData.gps_address || ''} onChange={handleChange}
                                            placeholder="e.g., AK-039-5028" />
                                    </div>

                                    {formData.gps_address && (
                                        <div className="cuttin-form-group" style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                                            <label className="xax-form-label">Location Preview</label>
                                            <div style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    style={{ border: 0 }}
                                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.gps_address)}&output=embed`}
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                            <p className="cuttin-form-helper">Map source: Google Maps (Resolving GPS Address)</p>
                                        </div>
                                    )}
                                </div>

                                <div className="cuttin-info-card" style={{ margin: '24px 0' }}>
                                    <h4 className="xax-info-card-title">Emergency Contact</h4>
                                    <p className="xax-info-card-text">Please provide an emergency contact person in case
                                        we need to reach someone on behalf of this member.</p>
                                </div>

                                <div className="xax-form-grid"
                                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">Emergency Contact Name</label>
                                        <input type="text" className="xax-form-input" name="emergency_name" value={formData.emergency_name || ''} onChange={handleChange}
                                            placeholder="Full name" />
                                    </div>
                                    <div className="cuttin-form-group">
                                        <label className="xax-form-label">Emergency Contact Phone</label>
                                        <input type="tel" className="xax-form-input" name="emergency_phone" value={formData.emergency_phone || ''} onChange={handleChange}
                                            placeholder="Phone number" />
                                    </div>
                                    <div className="cuttin-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="xax-form-label">Relationship</label>
                                        <input type="text" className="xax-form-input" name="emergency_relation" value={formData.emergency_relation || ''} onChange={handleChange}
                                            placeholder="e.g., Spouse, Parent, Sibling" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Ministry & Groups - CONTINUED IN NEXT PART */}
                        {currentStep === 3 && (
                            <div className="cuttin-form-section active" id="editStep3">
                                <div className="xax-section-header" style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                                        Church Groups & Ministries</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b' }}>Select the church groups,
                                        departments, leadership roles, and ministries</p>
                                </div>

                                <div className="cuttin-form-group" style={{ marginBottom: '24px' }}>
                                    <label className="xax-form-label">Member Status <span
                                        className="cuttin-required">*</span></label>
                                    <div className="cuttin-radio-group" style={{ display: 'flex', gap: '16px' }}>
                                        <div className="xax-radio-item">
                                            <input type="radio" id="editStatusActive" name="status"
                                                value="Active" checked={formData.status === 'Active'} onChange={handleChange} />
                                            <label htmlFor="editStatusActive">Active</label>
                                        </div>
                                        <div className="xax-radio-item">
                                            <input type="radio" id="editStatusInactive" name="status"
                                                value="Inactive" checked={formData.status === 'Inactive'} onChange={handleChange} />
                                            <label htmlFor="editStatusInactive">Inactive</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="cuttin-form-group" style={{ marginBottom: '24px' }}>
                                    <label className="xax-form-label">Church Group <span
                                        className="cuttin-required">*</span></label>
                                    <p className="cuttin-form-helper" style={{ marginBottom: '16px' }}>Select the main
                                        church group this member will be part of</p>
                                    <div className="cuttin-ministry-grid"
                                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                        {['Dunamis', 'Kabod', 'Judah', 'Karis'].map((group) => (
                                            <div key={group} className={`xax-ministry-card ${formData.church_group === group ? 'selected' : ''}`}
                                                onClick={() => handleMinistrySelect(group)}>
                                                <div className="cuttin-ministry-icon">
                                                    {group === 'Dunamis' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
                                                    {group === 'Kabod' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>}
                                                    {group === 'Judah' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>}
                                                    {group === 'Karis' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>}
                                                </div>
                                                <div className="xax-ministry-name">{group}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <input type="hidden" id="editSelectedMinistry" value={formData.church_group || ''} />
                                </div>

                                <div className="cuttin-form-group" style={{ marginBottom: '24px' }}>
                                    <label className="xax-form-label">Department</label>
                                    <p className="cuttin-form-helper" style={{ marginBottom: '12px' }}>Select any
                                        departments this member will participate in</p>
                                    <div className="cuttin-checkbox-group" style={{ flexDirection: 'column' }}>
                                        {['None', 'Usher', 'Choir', 'Media', 'Instrumentalist'].map((dept) => (
                                            <div key={dept} className="xax-checkbox-item">
                                                <input type="checkbox" id={`editDept${dept}`} name="departments"
                                                    value={dept} checked={isChecked('departments', dept)} onChange={(e) => handleCheckboxChange(e, 'departments')} />
                                                <label htmlFor={`editDept${dept}`}>{dept}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="cuttin-form-group" style={{ marginBottom: '24px' }}>
                                    <label className="xax-form-label">Leadership Role</label>
                                    <div className="cuttin-radio-group"
                                        style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        {['None', 'Pastor', 'Minister', 'Group Leader'].map((role) => (
                                            <div key={role} className="xax-radio-item">
                                                <input type="radio" id={`edit${role.replace(' ', '')}`} name="leadership_role"
                                                    value={role} checked={formData.leadership_role === role} onChange={handleChange} />
                                                <label htmlFor={`edit${role.replace(' ', '')}`}>{role}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="cuttin-form-group">
                                    <label className="xax-form-label">Ministries</label>
                                    <p className="cuttin-form-helper" style={{ marginBottom: '12px' }}>Select any ministries
                                        this member will participate in</p>
                                    <div className="cuttin-checkbox-group" style={{ flexDirection: 'column' }}>
                                        {[
                                            { label: 'Children Ministry', value: 'Children' },
                                            { label: 'Women Ministry', value: 'Women' },
                                            { label: 'Men Ministry', value: 'Men' },
                                            { label: 'Youth Ministry', value: 'Youth' }
                                        ].map((min) => (
                                            <div key={min.value} className="xax-checkbox-item">
                                                <input type="checkbox" id={`edit${min.value}`} name="ministries"
                                                    value={min.value} checked={isChecked('ministries', min.value)} onChange={(e) => handleCheckboxChange(e, 'ministries')} />
                                                <label htmlFor={`edit${min.value}`}>{min.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Spiritual & Membership Information */}
                        {currentStep === 4 && (
                            <div className="cuttin-form-section active" id="editStep4">
                                <div className="xax-section-header" style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                                        Spiritual & Membership Information</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b' }}>Provide details about the member's
                                        spiritual background</p>
                                </div>

                                <div className="cuttin-form-group" style={{ marginBottom: '20px' }}>
                                    <label className="xax-form-label">Baptism Status</label>
                                    <select className="xax-form-select" id="editBaptismStatus" name="baptism_status" value={formData.baptism_status || ''} onChange={handleChange}>
                                        <option value="">Select status</option>
                                        <option value="Baptized">Baptized</option>
                                        <option value="Not baptized">Not Yet Baptized</option>
                                        <option value="Pending">Scheduled for Baptism</option>
                                    </select>
                                </div>

                                <div className="cuttin-form-group" style={{ marginBottom: '20px' }}>
                                    <label className="xax-form-label">Spiritual Growth Level</label>
                                    <select className="xax-form-select" id="editSpiritualGrowth" name="spiritual_growth" value={formData.spiritual_growth || ''} onChange={handleChange}>
                                        <option value="">Select level</option>
                                        <option value="New believer">New Believer</option>
                                        <option value="Growing">Growing Spiritually</option>
                                        <option value="Committed">Committed Member</option>
                                        <option value="Leader">Spiritually Mature / Leader</option>
                                    </select>
                                </div>

                                <div className="cuttin-form-group" style={{ marginBottom: '20px' }}>
                                    <label className="xax-form-label">Membership Type</label>
                                    <select className="xax-form-select" id="editMembershipType" name="membership_type" value={formData.membership_type || ''} onChange={handleChange}>
                                        <option value="">Select type</option>
                                        <option value="Full Member">Full Member</option>
                                        <option value="Associate Member">Associate Member</option>
                                        <option value="Visitor">Visitor</option>
                                    </select>
                                </div>

                                <div className="cuttin-form-group">
                                    <label className="xax-form-label">Additional Notes</label>
                                    <textarea className="xax-form-textarea" id="editNotes" name="notes" value={formData.notes || ''} onChange={handleChange}
                                        placeholder="Any other relevant information (e.g., spiritual gifts, previous church, testimony, etc.)"></textarea>
                                </div>

                                {/* Birthday Wish Section (Optional) */}
                                <div className="xax-form-group"
                                    style={{ marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                    <h4 style={{ color: '#3b82f6', marginBottom: '20px', fontWeight: 600 }}>Birthday Wish
                                        (Optional)</h4>

                                    <div className="xax-form-group">
                                        <label className="xax-form-label">Birthday Thumbnail / Flyer</label>
                                        <div style={{ marginBottom: '10px' }}>
                                            <input type="file" id="editBirthdayThumb" accept="image/png, image/jpeg"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => setBirthdayThumbPreview(ev.target?.result as string);
                                                        reader.readAsDataURL(e.target.files[0]);
                                                    }
                                                }} />
                                            <label htmlFor="editBirthdayThumb"
                                                style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, border: '1px solid #cbd5e1', transition: 'all 0.2s' }}>
                                                Upload Flyer
                                            </label>
                                        </div>
                                        {birthdayThumbPreview && (
                                            <div id="editBirthdayThumbPreview" style={{ marginTop: '10px', maxWidth: '100px' }}>
                                                <img src={birthdayThumbPreview} alt="Birthday Flyer" style={{ width: '100%', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                                            </div>
                                        )}
                                        <p className="xax-form-helper">JPG, PNG.</p>
                                    </div>

                                    <div className="xax-form-group">
                                        <label className="xax-form-label">Birthday Title</label>
                                        <input type="text" className="xax-form-input" id="editBirthdayTitle" name="birthday_title" value={formData.birthday_title || ''} onChange={handleChange}
                                            placeholder="e.g. Happy Birthday Lawrence" style={{ width: '100%' }} />
                                    </div>

                                    <div className="xax-form-group">
                                        <label className="xax-form-label">Birthday Message</label>
                                        <textarea className="xax-form-textarea" id="editBirthdayMessage" name="birthday_message" value={formData.birthday_message || ''} onChange={handleChange} rows={3}
                                            placeholder="Enter a personalized birthday wish..."
                                            style={{ width: '100%' }}></textarea>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="cf-modal-foot">
                    <button className="cf-btn cf-btn-alternate" onClick={currentStep === 1 ? onClose : handlePrev}>
                        {currentStep === 1 ? 'Cancel' : 'Previous'}
                    </button>
                    <button className="cf-btn cf-btn-main" id="editNextBtn" onClick={currentStep === 4 ? handleSubmit : handleNext}>
                        {currentStep === 4 ? (isSubmitting ? 'Saving...' : 'Save Member') : 'Next Step'}
                    </button>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
