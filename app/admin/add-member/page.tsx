'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './add-member.css';

// Types
interface FormData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    maritalStatus: string;
    occupation: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    region: string;
    gpsAddress: string;
    emergencyName: string;
    emergencyPhone: string;
    emergencyRelation: string;
    status: string;
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
    sendWelcomeEmail: boolean;
    notifyPastor: boolean;
    createAccount: boolean;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    selectedMinistry?: string;
    spiritualGrowth?: string;
}

const initialFormData: FormData = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    occupation: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    gpsAddress: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    status: 'active',
    selectedMinistry: '',
    departments: [],
    leadership: 'None',
    ministries: [],
    baptismStatus: '',
    spiritualGrowth: '',
    membershipType: '',
    birthdayTitle: '',
    birthdayMessage: '',
    notes: '',
    sendWelcomeEmail: true,
    notifyPastor: true,
    createAccount: false,
};

const churchGroups = [
    { name: 'Dunamis', icon: 'lightning', color: '#6366f1' },
    { name: 'Kabod', icon: 'globe', color: '#f59e0b' },
    { name: 'Judah', icon: 'music', color: '#ec4899' },
    { name: 'Karis', icon: 'heart', color: '#ef4444' },
];

const departments = ['None', 'Usher', 'Choir', 'Media', 'Instrumentalist'];
const ministriesList = [
    { id: 'Children', label: 'Children Ministry' },
    { id: 'Women', label: 'Women Ministry' },
    { id: 'Men', label: 'Men Ministry' },
    { id: 'Youth', label: 'Youth Ministry' },
];

export default function AddMemberPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [birthdayThumbPreview, setBirthdayThumbPreview] = useState<string | null>(null);
    const [birthdayThumbFile, setBirthdayThumbFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSectionOpen, setIsSectionOpen] = useState(true);

    const totalSteps = 5;

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Handle photo upload
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotoPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle birthday thumb upload
    const handleBirthdayThumbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBirthdayThumbFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setBirthdayThumbPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle church group selection
    const handleChurchGroupSelect = (groupName: string) => {
        setFormData(prev => ({ ...prev, selectedMinistry: groupName }));
        if (errors.selectedMinistry) {
            setErrors(prev => ({ ...prev, selectedMinistry: undefined }));
        }
    };

    // Handle department selection
    const handleDepartmentChange = (dept: string) => {
        setFormData(prev => {
            if (dept === 'None') {
                return { ...prev, departments: prev.departments.includes('None') ? [] : ['None'] };
            } else {
                const newDepts = prev.departments.filter(d => d !== 'None');
                if (newDepts.includes(dept)) {
                    return { ...prev, departments: newDepts.filter(d => d !== dept) };
                } else {
                    return { ...prev, departments: [...newDepts, dept] };
                }
            }
        });
    };

    // Handle ministry selection
    const handleMinistryChange = (ministryId: string) => {
        setFormData(prev => {
            if (prev.ministries.includes(ministryId)) {
                return { ...prev, ministries: prev.ministries.filter(m => m !== ministryId) };
            } else {
                return { ...prev, ministries: [...prev.ministries, ministryId] };
            }
        });
    };

    // Validate step
    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (step === 1) {
            if (!formData.firstName.trim()) {
                newErrors.firstName = 'First name is required';
                isValid = false;
            }
            if (!formData.lastName.trim()) {
                newErrors.lastName = 'Last name is required';
                isValid = false;
            }
        }

        if (step === 2) {
            if (!formData.phone.trim()) {
                newErrors.phone = 'Phone number is required';
                isValid = false;
            }
            if (!formData.email.trim() || !formData.email.includes('@')) {
                newErrors.email = 'Valid email is required';
                isValid = false;
            }
        }

        if (step === 3) {
            const validGroups = ['dunamis', 'kabod', 'judah', 'karis'];
            if (!formData.selectedMinistry || !validGroups.includes(formData.selectedMinistry.toLowerCase())) {
                newErrors.selectedMinistry = 'Please select a church group';
                isValid = false;
            }
        }

        if (step === 4) {
            const validGrowth = ['new believer', 'growing', 'committed', 'leader', ''];
            if (formData.spiritualGrowth && !validGrowth.includes(formData.spiritualGrowth.toLowerCase())) {
                newErrors.spiritualGrowth = 'Invalid spiritual growth level';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // Navigate to next step
    const nextStep = () => {
        if (validateStep(currentStep) && currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
            setIsSectionOpen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Navigate to previous step
    const previousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            setIsSectionOpen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Cancel form
    const cancelForm = () => {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            router.push('/admin/dashboard');
        }
    };

    // Submit form
    const submitForm = async () => {
        if (!validateStep(currentStep)) return;

        setIsSubmitting(true);

        try {
            const submitData = new FormData();

            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => submitData.append(`${key}[]`, v));
                } else if (typeof value === 'boolean') {
                    submitData.append(key, value ? '1' : '0');
                } else {
                    submitData.append(key, value);
                }
            });

            // Add files
            if (photoFile) {
                submitData.append('photoInput', photoFile);
            }
            if (birthdayThumbFile) {
                submitData.append('birthdayThumb', birthdayThumbFile);
            }

            const response = await fetch('/api/admin/members/create', {
                method: 'POST',
                body: submitData,
            });

            const data = await response.json();

            if (data.success) {
                // Store member data for success page
                sessionStorage.setItem('newMemberData', JSON.stringify({
                    ...formData,
                    photoPreview: data.photoPath,
                    birthdayThumbPreview: data.birthdayThumbPath,
                }));
                router.push('/admin/add-member/success');
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Submission failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render church group icon
    const renderGroupIcon = (iconType: string) => {
        switch (iconType) {
            case 'lightning':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                );
            case 'globe':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        <path d="M2 12h20" />
                    </svg>
                );
            case 'music':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                );
            case 'heart':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    // Progress percentage
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className="add-member-container">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>Add New Member</h1>
                    <p>Register a new member to your church community</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={cancelForm}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Cancel
                    </button>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="progress-container">
                <div className="progress-steps">
                    <div className="progress-line">
                        <div className="progress-line-fill" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    {[
                        { step: 1, label: 'Personal Info' },
                        { step: 2, label: 'Contact Details' },
                        { step: 3, label: 'Ministry & Groups' },
                        { step: 4, label: 'Spiritual Info' },
                        { step: 5, label: 'Review & Submit' },
                    ].map(({ step, label }) => (
                        <div
                            key={step}
                            className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                        >
                            <div className="step-circle">{step}</div>
                            <span className="step-label">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Container */}
            <form className="form-container" onSubmit={(e) => e.preventDefault()}>
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                    <div className="form-section">
                        <div className="section-header clickable" onClick={() => setIsSectionOpen(!isSectionOpen)}>
                            <div>
                                <h2>Personal Information</h2>
                                <p>Basic details about the new member</p>
                            </div>
                            <div className={`chevron ${isSectionOpen ? 'open' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </div>

                        {isSectionOpen && (
                            <>

                                {/* Photo Upload */}
                                <div className="form-group full-width">
                                    <label className="form-label">Profile Photo</label>
                                    <div className="photo-upload">
                                        <div className="photo-preview">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Profile" />
                                            ) : (
                                                <div className="photo-placeholder">👤</div>
                                            )}
                                        </div>
                                        <div className="photo-controls">
                                            <div className="file-input-wrapper">
                                                <input
                                                    type="file"
                                                    id="photoInput"
                                                    accept="image/*"
                                                    onChange={handlePhotoUpload}
                                                />
                                                <label htmlFor="photoInput" className="file-input-label">Upload Photo</label>
                                            </div>
                                            <p className="form-helper">JPG, PNG or GIF. Max 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">First Name <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors.firstName ? 'error' : ''}`}
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                        />
                                        {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Last Name <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors.lastName ? 'error' : ''}`}
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                        />
                                        {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Gender</label>
                                        <select
                                            className="form-select"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Marital Status</label>
                                        <select
                                            className="form-select"
                                            name="maritalStatus"
                                            value={formData.maritalStatus}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select status</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Divorced">Divorced</option>
                                            <option value="Widowed">Widowed</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Occupation</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="occupation"
                                            value={formData.occupation}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Teacher, Engineer"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-actions">
                            <div className="actions-left"></div>
                            <div className="actions-right">
                                <button type="button" className="btn btn-primary" onClick={nextStep}>
                                    Next Step
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Contact Details */}
                {currentStep === 2 && (
                    <div className="form-section">
                        <div className="section-header clickable" onClick={() => setIsSectionOpen(!isSectionOpen)}>
                            <div>
                                <h2>Contact Details</h2>
                                <p>How can we reach this member?</p>
                            </div>
                            <div className={`chevron ${isSectionOpen ? 'open' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </div>

                        {isSectionOpen && (
                            <>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Phone Number <span className="required">*</span></label>
                                        <input
                                            type="tel"
                                            className={`form-input ${errors.phone ? 'error' : ''}`}
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="0551234567"
                                        />
                                        {errors.phone && <span className="form-error">{errors.phone}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Email Address <span className="required">*</span></label>
                                        <input
                                            type="email"
                                            className={`form-input ${errors.email ? 'error' : ''}`}
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="member@example.com"
                                        />
                                        {errors.email && <span className="form-error">{errors.email}</span>}
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Home Address</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Street address"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Region</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="region"
                                            value={formData.region}
                                            onChange={handleInputChange}
                                            placeholder="Region/State"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">GPS Address (Ghana Post GPS)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="gpsAddress"
                                            value={formData.gpsAddress}
                                            onChange={handleInputChange}
                                            placeholder="e.g., AK-039-5028"
                                        />
                                    </div>

                                    {formData.gpsAddress && (
                                        <div className="form-group full-width" style={{ marginTop: '10px' }}>
                                            <label className="form-label">Location Preview</label>
                                            <div style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    style={{ border: 0 }}
                                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.gpsAddress + ', Ghana')}&z=18&t=m&iwloc=addr&output=embed`}
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p className="form-helper" style={{ margin: 0 }}>Map source: Google Maps (Precise View)</p>
                                                <a
                                                    href={`https://www.ghanapostgps.com/map/#${formData.gpsAddress.replace(/-/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary"
                                                    style={{ padding: '4px 12px', fontSize: '12px' }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                        <polyline points="15 3 21 3 21 9"></polyline>
                                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                                    </svg>
                                                    Open in Ghana Post GPS
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="info-card">
                                    <h4>Emergency Contact</h4>
                                    <p>Please provide an emergency contact person in case we need to reach someone on behalf of this member.</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Emergency Contact Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="emergencyName"
                                            value={formData.emergencyName}
                                            onChange={handleInputChange}
                                            placeholder="Full name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Emergency Contact Phone</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            name="emergencyPhone"
                                            value={formData.emergencyPhone}
                                            onChange={handleInputChange}
                                            placeholder="Phone number"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Relationship</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="emergencyRelation"
                                            value={formData.emergencyRelation}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Spouse, Parent, Sibling"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-actions">
                            <div className="actions-left">
                                <button type="button" className="btn btn-secondary" onClick={previousStep}>
                                    Previous
                                </button>
                            </div>
                            <div className="actions-right">
                                <button type="button" className="btn btn-primary" onClick={nextStep}>
                                    Next Step
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Ministry & Groups */}
                {currentStep === 3 && (
                    <div className="form-section">
                        <div className="section-header clickable" onClick={() => setIsSectionOpen(!isSectionOpen)}>
                            <div>
                                <h2>Church Groups & Ministries</h2>
                                <p>Select the church groups, departments, leadership roles, and ministries this member will join</p>
                            </div>
                            <div className={`chevron ${isSectionOpen ? 'open' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </div>

                        {isSectionOpen && (
                            <>

                                <div className="info-card warning">
                                    <h4>Member Status</h4>
                                    <p>New members typically start with "Active" status. You can change this later if needed.</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Member Status <span className="required">*</span></label>
                                    <div className="radio-group">
                                        <div className="radio-item">
                                            <input
                                                type="radio"
                                                id="statusActive"
                                                name="status"
                                                value="active"
                                                checked={formData.status === 'active'}
                                                onChange={handleInputChange}
                                            />
                                            <label htmlFor="statusActive">Active</label>
                                        </div>
                                        <div className="radio-item">
                                            <input
                                                type="radio"
                                                id="statusInactive"
                                                name="status"
                                                value="inactive"
                                                checked={formData.status === 'inactive'}
                                                onChange={handleInputChange}
                                            />
                                            <label htmlFor="statusInactive">Inactive</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Church Group <span className="required">*</span></label>
                                    <p className="form-helper">Select the main church group this member will be part of</p>
                                    <div className="ministry-grid">
                                        {churchGroups.map((group, index) => (
                                            <div
                                                key={group.name}
                                                className={`ministry-card ${formData.selectedMinistry === group.name ? 'selected' : ''}`}
                                                onClick={() => handleChurchGroupSelect(group.name)}
                                                style={{ '--group-color': group.color } as React.CSSProperties}
                                                data-index={index}
                                            >
                                                <div className="ministry-icon">
                                                    {renderGroupIcon(group.icon)}
                                                </div>
                                                <div className="ministry-name">{group.name.toUpperCase()}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.selectedMinistry && <span className="form-error show">{errors.selectedMinistry}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <p className="form-helper">Select any departments this member will participate in</p>
                                    <div className="checkbox-group">
                                        {departments.map(dept => (
                                            <div key={dept} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id={dept}
                                                    checked={formData.departments.includes(dept)}
                                                    onChange={() => handleDepartmentChange(dept)}
                                                />
                                                <label htmlFor={dept}>{dept}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Leadership Role</label>
                                    <p className="form-helper">Select a leadership role if applicable</p>
                                    <div className="radio-group">
                                        {['None', 'Pastor', 'Minister', 'Group leader'].map(role => (
                                            <div key={role} className="radio-item">
                                                <input
                                                    type="radio"
                                                    id={`leadership-${role}`}
                                                    name="leadership"
                                                    value={role}
                                                    checked={formData.leadership === role}
                                                    onChange={handleInputChange}
                                                />
                                                <label htmlFor={`leadership-${role}`}>{role}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Ministries</label>
                                    <p className="form-helper">Select any ministries this member will participate in</p>
                                    <div className="checkbox-group">
                                        {ministriesList.map(ministry => (
                                            <div key={ministry.id} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id={ministry.id}
                                                    checked={formData.ministries.includes(ministry.id)}
                                                    onChange={() => handleMinistryChange(ministry.id)}
                                                />
                                                <label htmlFor={ministry.id}>{ministry.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-actions">
                            <div className="actions-left">
                                <button type="button" className="btn btn-secondary" onClick={previousStep}>
                                    Previous
                                </button>
                            </div>
                            <div className="actions-right">
                                <button type="button" className="btn btn-primary" onClick={nextStep}>
                                    Next Step
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Spiritual Info */}
                {currentStep === 4 && (
                    <div className="form-section">
                        <div className="section-header clickable" onClick={() => setIsSectionOpen(!isSectionOpen)}>
                            <div>
                                <h2>Spiritual & Membership Information</h2>
                                <p>Provide details about the member's spiritual background and church involvement</p>
                            </div>
                            <div className={`chevron ${isSectionOpen ? 'open' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </div>

                        {isSectionOpen && (
                            <>

                                <div className="info-card">
                                    <h4>Membership Details</h4>
                                    <p>Help us understand the member's background, spiritual growth, and participation in church activities.</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Baptism Status</label>
                                    <select
                                        className="form-select"
                                        name="baptismStatus"
                                        value={formData.baptismStatus}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select status</option>
                                        <option value="Baptized">Baptized</option>
                                        <option value="Not baptized">Not Yet Baptized</option>
                                        <option value="Pending">Scheduled for Baptism</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Spiritual Growth Level</label>
                                    <select
                                        className={`form-select ${errors.spiritualGrowth ? 'error' : ''}`}
                                        name="spiritualGrowth"
                                        value={formData.spiritualGrowth}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select level</option>
                                        <option value="New believer">New Believer</option>
                                        <option value="Growing">Growing Spiritually</option>
                                        <option value="Committed">Committed Member</option>
                                        <option value="Leader">Spiritually Mature / Leader</option>
                                    </select>
                                    {errors.spiritualGrowth && <span className="form-error">{errors.spiritualGrowth}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Membership Type</label>
                                    <select
                                        className="form-select"
                                        name="membershipType"
                                        value={formData.membershipType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select type</option>
                                        <option value="Full Member">Full Member</option>
                                        <option value="Associate Member">Associate Member</option>
                                        <option value="Visitor">Visitor</option>
                                    </select>
                                </div>

                                <div className="info-card" style={{ marginTop: '24px' }}>
                                    <h4>Birthday Wish (Optional)</h4>
                                    <p>Add a personalized birthday message and flyer for this member.</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label className="form-label">Birthday Thumbnail / Flyer</label>
                                        <div className="file-input-wrapper">
                                            <input
                                                type="file"
                                                id="birthdayThumb"
                                                accept="image/*"
                                                onChange={handleBirthdayThumbUpload}
                                            />
                                            <label htmlFor="birthdayThumb" className="file-input-label">Upload Flyer</label>
                                        </div>
                                        {birthdayThumbPreview && (
                                            <div className="birthday-preview">
                                                <img src={birthdayThumbPreview} alt="Birthday Flyer" />
                                            </div>
                                        )}
                                        <p className="form-helper">JPG, PNG.</p>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Birthday Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="birthdayTitle"
                                            value={formData.birthdayTitle}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Happy Birthday!"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Birthday Message</label>
                                        <textarea
                                            className="form-textarea"
                                            name="birthdayMessage"
                                            value={formData.birthdayMessage}
                                            onChange={handleInputChange}
                                            placeholder="Write a birthday wish..."
                                        />
                                    </div>
                                </div>

                                <div className="form-group full-width" style={{ marginTop: '24px' }}>
                                    <label className="form-label">Additional Notes</label>
                                    <textarea
                                        className="form-textarea"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Any other relevant information (e.g., spiritual gifts, previous church, testimony, etc.)"
                                    />
                                </div>

                                <div className="form-actions">
                                    <div className="actions-left">
                                        <button type="button" className="btn btn-secondary" onClick={previousStep}>
                                            Previous
                                        </button>
                                    </div>
                                    <div className="actions-right">
                                        <button type="button" className="btn btn-primary" onClick={nextStep}>
                                            Review & Submit
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Step 5: Review & Submit */}
                {currentStep === 5 && (
                    <div className="form-section">
                        <div className="section-header clickable" onClick={() => setIsSectionOpen(!isSectionOpen)}>
                            <div>
                                <h2>Review Information</h2>
                                <p>Please review all details before submitting</p>
                            </div>
                            <div className={`chevron ${isSectionOpen ? 'open' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </div>

                        {isSectionOpen && (
                            <>

                                {/* Personal Information Summary */}
                                <div className="summary-section">
                                    <h3>Personal Information</h3>
                                    <div className="summary-grid">
                                        <div className="summary-item">
                                            <span className="summary-label">Profile Photo</span>
                                            <div className="summary-value">
                                                {photoPreview ? (
                                                    <img src={photoPreview} alt="Profile" className="summary-photo" />
                                                ) : (
                                                    <div className="summary-photo-placeholder">👤</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Name</span>
                                            <span className="summary-value">{formData.firstName} {formData.lastName || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Date of Birth</span>
                                            <span className="summary-value">{formData.dateOfBirth || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Gender</span>
                                            <span className="summary-value">{formData.gender || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Marital Status</span>
                                            <span className="summary-value">{formData.maritalStatus || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Occupation</span>
                                            <span className="summary-value">{formData.occupation || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information Summary */}
                                <div className="summary-section">
                                    <h3>Contact Information</h3>
                                    <div className="summary-grid">
                                        <div className="summary-item">
                                            <span className="summary-label">Phone</span>
                                            <span className="summary-value">{formData.phone || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Email</span>
                                            <span className="summary-value">{formData.email || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Address</span>
                                            <span className="summary-value">{formData.address || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">City</span>
                                            <span className="summary-value">{formData.city || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Region</span>
                                            <span className="summary-value">{formData.region || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Emergency Contact</span>
                                            <span className="summary-value">
                                                {formData.emergencyName ? `${formData.emergencyName} (${formData.emergencyRelation || 'N/A'}, ${formData.emergencyPhone || 'N/A'})` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ministry & Groups Summary */}
                                <div className="summary-section">
                                    <h3>Ministry & Groups</h3>
                                    <div className="summary-grid">
                                        <div className="summary-item">
                                            <span className="summary-label">Status</span>
                                            <span className="summary-value">{formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Church Group</span>
                                            <span className="summary-value">{formData.selectedMinistry || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Departments</span>
                                            <span className="summary-value">{formData.departments.length > 0 ? formData.departments.join(', ') : 'None'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Leadership Role</span>
                                            <span className="summary-value">{formData.leadership}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Ministries</span>
                                            <span className="summary-value">
                                                {formData.ministries.length > 0
                                                    ? formData.ministries.map(m => ministriesList.find(ml => ml.id === m)?.label).join(', ')
                                                    : 'None'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Spiritual & Membership Summary */}
                                <div className="summary-section">
                                    <h3>Spiritual & Membership Information</h3>
                                    <div className="summary-grid">
                                        <div className="summary-item">
                                            <span className="summary-label">Baptism Status</span>
                                            <span className="summary-value">{formData.baptismStatus || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Spiritual Growth</span>
                                            <span className="summary-value">{formData.spiritualGrowth || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Membership Type</span>
                                            <span className="summary-value">{formData.membershipType || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Notes</span>
                                            <span className="summary-value">{formData.notes || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Birthday Wish Summary */}
                                <div className="summary-section">
                                    <h3>Birthday Wish (Optional)</h3>
                                    <div className="summary-grid">
                                        <div className="summary-item">
                                            <span className="summary-label">Flyer</span>
                                            <div className="summary-value">
                                                {birthdayThumbPreview ? (
                                                    <img src={birthdayThumbPreview} alt="Birthday Flyer" className="summary-photo" />
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>No flyer uploaded</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Title</span>
                                            <span className="summary-value">{formData.birthdayTitle || '-'}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Message</span>
                                            <span className="summary-value">{formData.birthdayMessage || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h4>What happens next?</h4>
                                    <p>After submitting, this member will be added to your church database. They will receive a welcome email with login credentials and information about upcoming events.</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Welcome Actions</label>
                                    <div className="checkbox-group">
                                        <div className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                id="sendWelcomeEmail"
                                                name="sendWelcomeEmail"
                                                checked={formData.sendWelcomeEmail}
                                                onChange={handleInputChange}
                                            />
                                            <label htmlFor="sendWelcomeEmail">Send welcome email to member</label>
                                        </div>
                                        <div className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                id="notifyPastor"
                                                name="notifyPastor"
                                                checked={formData.notifyPastor}
                                                onChange={handleInputChange}
                                            />
                                            <label htmlFor="notifyPastor">Notify pastor and ministry leader</label>
                                        </div>
                                        <div className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                id="createAccount"
                                                name="createAccount"
                                                checked={formData.createAccount}
                                                onChange={handleInputChange}
                                            />
                                            <label htmlFor="createAccount">Create member portal account</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <div className="actions-left">
                                        <button type="button" className="btn btn-secondary" onClick={previousStep}>
                                            Previous
                                        </button>
                                    </div>
                                    <div className="actions-right">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={submitForm}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Adding Member...' : 'Add Member'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}
