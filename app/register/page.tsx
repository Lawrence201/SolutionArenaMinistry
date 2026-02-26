'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './register.css';

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
    membershipType: 'Full Member',
    birthdayTitle: '',
    birthdayMessage: '',
    notes: '',
    sendWelcomeEmail: true,
    notifyPastor: true,
    createAccount: true, // Default to true for self-registration
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

function RegistrationForm() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
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
        if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
            router.push('/');
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

            const response = await fetch('/api/admin/members/create', {
                method: 'POST',
                body: submitData,
            });

            const data = await response.json();

            if (data.success) {
                // Trigger profile download automatically
                try {
                    const { generateMemberProfilePDF } = await import('@/utils/memberProfilePdf');
                    await generateMemberProfilePDF({
                        ...formData,
                        member_id: data.member_id,
                        photo_path: photoPreview || data.photoPath, // Use local base64 preview for reliability on Vercel
                        created_at: new Date()
                    });
                } catch (pdfError) {
                    console.error('PDF generation failed:', pdfError);
                }

                router.push('/register/success');
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
        <div className="register-page-wrapper">
            <div className="register-container">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <h1>Membership Form</h1>
                        <p>Fill out the form below</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={cancelForm}>
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
                            <div className="section-header">
                                <div>
                                    <h2>Personal Information</h2>
                                    <p>Tell us a bit about yourself</p>
                                </div>
                            </div>

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
                                        placeholder="Enter your first name"
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
                                        placeholder="Enter your last name"
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
                            <div className="section-header">
                                <div>
                                    <h2>Contact Details</h2>
                                    <p>How can we reach you?</p>
                                </div>
                            </div>

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
                                        placeholder="you@example.com"
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
                            </div>

                            <div className="info-card">
                                <h4>Emergency Contact</h4>
                                <p>Please provide an emergency contact person.</p>
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
                            <div className="section-header">
                                <div>
                                    <h2>Church Groups & Ministries</h2>
                                    <p>Tell us which groups or departments you'd like to join</p>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Church Group <span className="required">*</span></label>
                                <p className="form-helper">Select the main church group you will be part of</p>
                                <div className="ministry-grid">
                                    {churchGroups.map((group, index) => (
                                        <div
                                            key={group.name}
                                            className={`ministry-card ${formData.selectedMinistry === group.name ? 'selected' : ''}`}
                                            onClick={() => handleChurchGroupSelect(group.name)}
                                            style={{ '--group-color': group.color } as React.CSSProperties}
                                        >
                                            <div className="ministry-icon">
                                                {renderGroupIcon(group.icon)}
                                            </div>
                                            <div className="ministry-name">{group.name.toUpperCase()}</div>
                                        </div>
                                    ))}
                                </div>
                                {errors.selectedMinistry && <span className="form-error">{errors.selectedMinistry}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <p className="form-helper">Select any departments you are interested in</p>
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
                                <label className="form-label">Ministries</label>
                                <p className="form-helper">Select any ministries you would like to participate in</p>
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
                            <div className="section-header">
                                <div>
                                    <h2>Spiritual Information</h2>
                                    <p>Optional details about your spiritual background</p>
                                </div>
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
                                    className="form-select"
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
                        </div>
                    )}

                    {/* Step 5: Review & Submit */}
                    {currentStep === 5 && (
                        <div className="form-section">
                            <div className="section-header">
                                <div>
                                    <h2>Review Your Information</h2>
                                    <p>Please double-check your details before submitting</p>
                                </div>
                            </div>

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
                                        <span className="summary-label">Full Name</span>
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

                            {/* Contact & Location Summary */}
                            <div className="summary-section">
                                <h3>Contact & Location</h3>
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
                                        <span className="summary-label">Home Address</span>
                                        <span className="summary-value">{formData.address || '-'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">City / Region</span>
                                        <span className="summary-value">{formData.city || '-'}{formData.region ? `, ${formData.region}` : ''}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">GPS Address</span>
                                        <span className="summary-value">{formData.gpsAddress || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact Summary */}
                            <div className="summary-section">
                                <h3>Emergency Contact</h3>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="summary-label">Contact Name</span>
                                        <span className="summary-value">{formData.emergencyName || '-'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Phone / Relation</span>
                                        <span className="summary-value">{formData.emergencyPhone || '-'}{formData.emergencyRelation ? ` (${formData.emergencyRelation})` : ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Involvement & Spiritual Summary */}
                            <div className="summary-section">
                                <h3>Church Involvement</h3>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="summary-label">Church Group</span>
                                        <span className="summary-value">{formData.selectedMinistry || '-'}</span>
                                    </div>
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
                                        <span className="summary-value">{formData.membershipType}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Departments</span>
                                        <span className="summary-value">{formData.departments.length > 0 ? formData.departments.join(', ') : 'None selected'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Ministries</span>
                                        <span className="summary-value">
                                            {formData.ministries.length > 0
                                                ? formData.ministries.map(m => ministriesList.find(ml => ml.id === m)?.label || m).join(', ')
                                                : 'None selected'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="info-card">
                                <h4>Welcome!</h4>
                                <p>By submitting this form, you are registering as a member of our church. We look forward to seeing you!</p>
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
                                        {isSubmitting ? 'Registering...' : 'Complete Registration'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="register-page-wrapper">Loading form...</div>}>
            <RegistrationForm />
        </Suspense>
    );
}
