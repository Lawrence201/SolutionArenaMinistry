'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateEvent, createEvent } from '@/app/actions/event';

// Ideally usage of shared CSS. 'add-event.css' was imported in the add-event page.
// Let's assume we can reuse that if it's global or import it here.
// Since the user is using `app/admin/add-event/add-event.css` in that page, let's see if we can import it.
// Assuming relative path from components/Admin/events to app/admin/add-event might be clean.
// Or better, just copy the styles or rely on global styles if possible.
// For now I will try to import the CSS from the add-event folder if possible or just use the same classes.
import '@/app/admin/add-event/add-event.css';

interface EditEventFormProps {
    event?: any;
}

export default function EditEventForm({ event }: EditEventFormProps) {
    const router = useRouter();
    const isEditMode = !!event;

    // Map initial data
    const initialFormData = {
        eventName: event?.name || '',
        eventType: event?.type?.toLowerCase() || '',
        eventTypeOther: event?.type_other || '',
        eventCategory: event?.category?.toLowerCase() || '',
        eventCategoryOther: event?.category_other || '',
        eventDescription: event?.description || '',
        startDate: event?.start_date || '',
        startTime: event?.start_time || '',
        endDate: event?.end_date || '',
        endTime: event?.end_time || '',
        recurringEvent: event?.is_recurring || false,
        eventLocation: event?.location || '', // Handling of "Other" logic needed below
        eventLocationCustom: '',
        roomBuilding: event?.room_building || '',
        fullAddress: event?.full_address || '',
        virtualEvent: event?.is_virtual || false,
        virtualLink: event?.virtual_link || '',
        maxCapacity: event?.max_capacity?.toString() || '50',
        registrationDeadline: event?.registration_deadline || '',
        requireRegistration: event?.require_registration || false,
        openToPublic: event?.open_to_public || false,
        volunteersNeeded: event?.volunteers_needed?.toString() || '0',
        contactPerson: event?.contact_person || '',
        contactEmail: event?.contact_email || '',
        contactPhone: event?.contact_phone || '',
        ageGroup: 'all', // Default or map if available
        specialNotes: event?.special_notes || '',
        status: event?.status || 'Published'
    };

    // Refine location logic
    const predefinedLocations = ['main-sanctuary', 'fellowship-hall', 'youth-room', 'prayer-room', 'outdoor', 'offsite'];
    // Check if current location is in predefined or needs to be custom
    // This is a simple check, usually needs exact string matching
    let locationVal = initialFormData.eventLocation;
    let customLocationVal = '';

    // Simplistic check - if not in list, assume other.
    // Ideally we match roughly what the select values are.
    // The select values in AddEventPage are: main-sanctuary, fellowship-hall, youth-room, prayer-room, outdoor, offsite, Other.
    const isPredefined = predefinedLocations.includes(locationVal || '');
    if (!isPredefined && locationVal) {
        customLocationVal = locationVal;
        locationVal = 'Other';
    }

    initialFormData.eventLocation = locationVal;
    initialFormData.eventLocationCustom = customLocationVal;

    const [formData, setFormData] = useState(initialFormData);

    const [tags, setTags] = useState<string[]>(event?.tags ? event.tags.map((t: any) => t.tag) : []);
    const [tagInput, setTagInput] = useState('');

    const initialRoles = event?.volunteerRoles && event.volunteerRoles.length > 0
        ? event.volunteerRoles.map((r: any) => ({ name: r.role_name, quantity: r.quantity_needed.toString() }))
        : [{ name: '', quantity: '' }];
    const [volunteerRoles, setVolunteerRoles] = useState<{ name: string; quantity: string }[]>(initialRoles);

    // File states
    const [eventImage, setEventImage] = useState<File | null>(null);
    const [eventImagePreview, setEventImagePreview] = useState<string | null>(event?.image_path || null);

    const [contactImage, setContactImage] = useState<File | null>(null);
    const [contactImagePreview, setContactImagePreview] = useState<string | null>(event?.contact_person_image || null);

    // Ad Media States
    const [adImage1, setAdImage1] = useState<File | null>(null);
    const [adImage1Preview, setAdImage1Preview] = useState<string | null>(event?.ad_image_1 || null);

    const [adImage2, setAdImage2] = useState<File | null>(null);
    const [adImage2Preview, setAdImage2Preview] = useState<string | null>(event?.ad_image_2 || null);

    const [adVideo1, setAdVideo1] = useState<File | null>(null);
    const [adVideo1Preview, setAdVideo1Preview] = useState<string | null>(event?.ad_video_1 || null);

    const [adVideo2, setAdVideo2] = useState<File | null>(null);
    const [adVideo2Preview, setAdVideo2Preview] = useState<string | null>(event?.ad_video_2 || null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs for file inputs
    const eventImageInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, checked } = e.target;
        setFormData(prev => ({ ...prev, [id]: checked }));
    };

    // Tag Input Logic
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = tagInput.trim();
            if (value && !tags.includes(value)) {
                setTags([...tags, value]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Volunteer Roles Logic
    const addVolunteerRole = () => {
        setVolunteerRoles([...volunteerRoles, { name: '', quantity: '' }]);
    };

    const updateVolunteerRole = (index: number, field: 'name' | 'quantity', value: string) => {
        const newRoles = [...volunteerRoles];
        newRoles[index][field] = value;
        setVolunteerRoles(newRoles);
    };

    // File Handling
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        if (isEditMode) {
            data.append('event_id', event.id.toString());
        }

        // Append all text fields
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value.toString());
        });

        // Append tags
        data.append('eventTags', JSON.stringify(tags));

        // Append volunteer roles
        const validRoles = volunteerRoles.filter(role => role.name && role.quantity);
        data.append('volunteerRoles', JSON.stringify(validRoles));

        // Append files
        if (eventImage) data.append('eventImage', eventImage);
        if (contactImage) data.append('contactPersonImage', contactImage);
        if (adImage1) data.append('adImage1', adImage1);
        if (adImage2) data.append('adImage2', adImage2);
        if (adVideo1) data.append('adVideo1', adVideo1);
        if (adVideo2) data.append('adVideo2', adVideo2);

        // Append Status
        data.append('status', isDraft ? 'Draft' : 'Published');

        try {
            const result = isEditMode
                ? await updateEvent(data)
                : await createEvent(data);

            if (result.success) {
                alert(isDraft ? 'Event saved as draft successfully!' : (isEditMode ? 'Event updated successfully!' : 'Event created successfully!'));
                router.push('/admin/events');
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cf-add-event-container">
            <div className="cf-add-event-header">
                <h1>{isEditMode ? 'Edit Event' : 'New Event'}</h1>
                <p>{isEditMode ? 'Update the details of the event' : 'Create a new event and schedule details'}</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} encType="multipart/form-data">
                {/* Basic Information */}
                <div className="cf-form-card">
                    <h3 className="cf-form-section-title">Basic Information</h3>
                    <div className="cf-form-grid">
                        <div className="cf-form-group full-width">
                            <label className="cf-form-label required">Event Name</label>
                            <input
                                type="text"
                                className="cf-form-input"
                                id="eventName"
                                placeholder="e.g., Sunday Morning Service"
                                value={formData.eventName}
                                onChange={handleInputChange}
                                required
                            />
                            <span className="cf-form-hint">Enter a clear and descriptive name for your event</span>
                        </div>

                        <div className="cf-form-group">
                            <label className="cf-form-label required">Event Type</label>
                            <select
                                className="cf-form-select"
                                id="eventType"
                                value={formData.eventType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select event type</option>
                                <option value="service">Worship / Church Service</option>
                                <option value="bible-study">Bible Study / Teaching</option>
                                <option value="prayer">Prayer Meeting</option>
                                <option value="conference">Conference / Convention</option>
                                <option value="retreat">Retreat / Camp</option>
                                <option value="outreach">Evangelism / Community Outreach</option>
                                <option value="training">Training / Workshop</option>
                                <option value="fundraiser">Fundraising Event</option>
                                <option value="celebration">Special Celebration</option>
                                <option value="meeting">Leaders / Departmental Meeting</option>
                                <option value="social">Social Gathering / Fellowship</option>
                                <option value="other">Other</option>
                            </select>
                            {formData.eventType === 'other' && (
                                <textarea
                                    id="eventTypeOther"
                                    className="cf-form-textarea"
                                    placeholder="Please specify event type..."
                                    style={{ marginTop: '8px' }}
                                    value={formData.eventTypeOther}
                                    onChange={handleInputChange}
                                    required
                                ></textarea>
                            )}
                        </div>

                        <div className="cf-form-group">
                            <label className="cf-form-label required">Event Category</label>
                            <select
                                className="cf-form-select"
                                id="eventCategory"
                                value={formData.eventCategory}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select category</option>
                                <option value="worship">Worship & Prayer Ministry</option>
                                <option value="youth">Youth & Children Ministry</option>
                                <option value="women">Women’s Ministry</option>
                                <option value="men">Men’s Ministry</option>
                                <option value="education">Christian Education / Bible School</option>
                                <option value="missions">Evangelism & Missions</option>
                                <option value="choir">Choir / Music Department</option>
                                <option value="fellowship">General Fellowship</option>
                                <option value="admin">Church Administration / Leadership</option>
                                <option value="media">Media & Technical Team</option>
                                <option value="community">Community Development / Outreach</option>
                                <option value="other">Other</option>
                            </select>
                            {formData.eventCategory === 'other' && (
                                <textarea
                                    id="eventCategoryOther"
                                    className="cf-form-textarea"
                                    placeholder="Please specify category..."
                                    style={{ marginTop: '8px' }}
                                    value={formData.eventCategoryOther}
                                    onChange={handleInputChange}
                                    required
                                ></textarea>
                            )}
                        </div>

                        <div className="cf-form-group full-width">
                            <label className="cf-form-label required">Event Description</label>
                            <textarea
                                className="cf-form-textarea"
                                id="eventDescription"
                                placeholder="Provide a detailed description of the event..."
                                value={formData.eventDescription}
                                onChange={handleInputChange}
                                required
                            ></textarea>
                            <span className="cf-form-hint">Minimum 50 characters recommended</span>
                        </div>
                    </div>
                </div>

                {/* Date & Time Information */}
                <div className="cf-form-card">
                    <h3 className="cf-form-section-title">Date & Time Information</h3>
                    <div className="cf-form-grid">
                        <div className="cf-form-group">
                            <label className="cf-form-label required">Start Date</label>
                            <input type="date" className="cf-form-input" id="startDate" value={formData.startDate} onChange={handleInputChange} required />
                        </div>

                        <div className="cf-form-group">
                            <label className="cf-form-label required">Start Time</label>
                            <input type="time" className="cf-form-input" id="startTime" value={formData.startTime} onChange={handleInputChange} required />
                        </div>

                        <div className="cf-form-group">
                            <label className="cf-form-label required">End Date</label>
                            <input type="date" className="cf-form-input" id="endDate" value={formData.endDate} onChange={handleInputChange} required />
                        </div>

                        <div className="cf-form-group">
                            <label className="cf-form-label required">End Time</label>
                            <input type="time" className="cf-form-input" id="endTime" value={formData.endTime} onChange={handleInputChange} required />
                        </div>

                        <div className="cf-form-group full-width">
                            <div className="cf-checkbox-group">
                                <input type="checkbox" className="cf-checkbox" id="recurringEvent" checked={formData.recurringEvent} onChange={handleCheckboxChange} />
                                <label className="cf-checkbox-label" htmlFor="recurringEvent">This is a recurring event</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div className="cf-form-card">
                    <h3 className="cf-form-section-title">Location Information</h3>
                    <div className="cf-form-grid">
                        <div className="cf-form-group">
                            <label className="cf-form-label required">Event Location</label>
                            <select className="cf-form-select" id="eventLocation" value={formData.eventLocation} onChange={handleInputChange} required>
                                <option value="">Select location</option>
                                <option value="main-sanctuary">Main Sanctuary</option>
                                <option value="fellowship-hall">Fellowship Hall</option>
                                <option value="youth-room">Youth Room</option>
                                <option value="prayer-room">Prayer Room</option>
                                <option value="outdoor">Outdoor Area</option>
                                <option value="offsite">Off-Site Location</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {formData.eventLocation === 'Other' && (
                            <div className="cf-form-group">
                                <label className="cf-form-label">Specify Location</label>
                                <input type="text" className="cf-form-input" id="eventLocationCustom" value={formData.eventLocationCustom} onChange={handleInputChange} placeholder="Enter custom location" required />
                            </div>
                        )}

                        <div className="cf-form-group">
                            <label className="cf-form-label">Room/Building</label>
                            <input type="text" className="cf-form-input" id="roomBuilding" value={formData.roomBuilding} onChange={handleInputChange} placeholder="e.g., Building A, Room 101" />
                        </div>

                        <div className="cf-form-group full-width">
                            <label className="cf-form-label">Full Address (if off-site)</label>
                            <input type="text" className="cf-form-input" id="fullAddress" value={formData.fullAddress} onChange={handleInputChange} placeholder="Enter complete address for off-site events" />
                        </div>

                        <div className="cf-form-group full-width">
                            <div className="cf-checkbox-group">
                                <input type="checkbox" className="cf-checkbox" id="virtualEvent" checked={formData.virtualEvent} onChange={handleCheckboxChange} />
                                <label className="cf-checkbox-label" htmlFor="virtualEvent">This event will be available virtually</label>
                            </div>
                        </div>

                        {formData.virtualEvent && (
                            <div className="cf-form-group full-width">
                                <label className="cf-form-label">Virtual Meeting Link</label>
                                <input type="url" className="cf-form-input" id="virtualLink" value={formData.virtualLink} onChange={handleInputChange} placeholder="https://zoom.us/j/123456789" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Capacity & Registration */}
                <div className="cf-form-card">
                    <h3 className="cf-form-section-title">Capacity & Registration</h3>
                    <div className="cf-form-grid">
                        <div className="cf-form-group">
                            <label className="cf-form-label required">Maximum Capacity</label>
                            <input type="number" className="cf-form-input" id="maxCapacity" min="1" value={formData.maxCapacity} onChange={handleInputChange} required />
                            <span className="cf-form-hint">Total number of attendees allowed</span>
                        </div>

                        <div className="cf-form-group">
                            <label className="cf-form-label">Registration Deadline</label>
                            <input type="date" className="cf-form-input" id="registrationDeadline" value={formData.registrationDeadline} onChange={handleInputChange} />
                        </div>

                        <div className="cf-form-group full-width">
                            <div className="cf-checkbox-group">
                                <input type="checkbox" className="cf-checkbox" id="requireRegistration" checked={formData.requireRegistration} onChange={handleCheckboxChange} />
                                <label className="cf-checkbox-label" htmlFor="requireRegistration">Require pre-registration for this event</label>
                            </div>
                        </div>

                        <div className="cf-form-group full-width">
                            <div className="cf-checkbox-group">
                                <input type="checkbox" className="cf-checkbox" id="openToPublic" checked={formData.openToPublic} onChange={handleCheckboxChange} />
                                <label className="cf-checkbox-label" htmlFor="openToPublic">Open to the public (non-members can attend)</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Volunteer Management */}
                <div className="cf-form-card">
                    <h3 className="cf-form-section-title">Volunteer Requirements</h3>
                    <div className="cf-form-grid">
                        <div className="cf-form-group">
                            <label className="cf-form-label">Volunteers Needed</label>
                            <input type="number" className="cf-form-input" id="volunteersNeeded" min="0" value={formData.volunteersNeeded} onChange={handleInputChange} />
                        </div>

                        <div className="cf-form-group full-width">
                            <label className="cf-form-label">Volunteer Roles</label>
                            <div className="cf-volunteers-section">
                                {volunteerRoles.map((role, index) => (
                                    <div key={index} className="cf-volunteer-item">
                                        <input
                                            type="text"
                                            className="cf-form-input"
                                            placeholder="Role name (e.g., Usher, Greeter)"
                                            value={role.name}
                                            onChange={(e) => updateVolunteerRole(index, 'name', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            className="cf-form-input"
                                            placeholder="Qty"
                                            min="1"
                                            style={{ maxWidth: '100px' }}
                                            value={role.quantity}
                                            onChange={(e) => updateVolunteerRole(index, 'quantity', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="cf-add-volunteer-btn" onClick={addVolunteerRole}>+ Add Another Role</button>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="cf-form-card">
                    <h3 className="cf-form-section-title">Additional Details</h3>
                    <div className="cf-form-grid">
                        <div className="cf-form-group">
                            <label className="cf-form-label">Contact Person</label>
                            <input type="text" className="cf-form-input" id="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="Name of event coordinator" />
                        </div>

                        <div className="cf-form-group">
                            <label className="cf-form-label">Contact Email</label>
                            <input type="email" className="cf-form-input" id="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="coordinator@church.com" />
                        </div>

                        <div className="cf-form-group">
                            <label className="cf-form-label">Contact Phone</label>
                            <input type="tel" className="cf-form-input" id="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="+233 53 482 9203" />
                        </div>

                        <div className="cf-form-group full-width">
                            <label className="cf-form-label">Contact Person Image</label>
                            {contactImagePreview && (
                                <div className="cf-image-upload-preview" style={{ marginBottom: '10px' }}>
                                    <img src={contactImagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '8px' }} />
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{contactImage ? 'New image selected' : 'Current image'}</div>
                                </div>
                            )}
                            <input type="file" className="cf-form-input" accept="image/*" onChange={(e) => handleFileChange(e, setContactImage, setContactImagePreview)} />
                            <span className="cf-form-hint">Upload a picture of the coordinator (Max 5MB)</span>
                        </div>

                        <div className="cf-form-group">
                            <label className="cf-form-label">Age Group</label>
                            <select className="cf-form-select" id="ageGroup" value={formData.ageGroup} onChange={handleInputChange}>
                                <option value="all">All Ages</option>
                                <option value="children">Children (0-12)</option>
                                <option value="youth">Youth (13-18)</option>
                                <option value="young-adults">Young Adults (19-30)</option>
                                <option value="adults">Adults (31+)</option>
                                <option value="seniors">Seniors (65+)</option>
                            </select>
                        </div>

                        <div className="cf-form-group full-width">
                            <label className="cf-form-label">Event Tags</label>
                            <div className="cf-tag-input-wrapper">
                                {tags.map((tag, index) => (
                                    <span key={index} className="cf-tag">
                                        {tag}
                                        <span className="cf-tag-remove" onClick={() => removeTag(tag)}>×</span>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    className="cf-tag-input"
                                    placeholder="Type and press Enter to add tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                />
                            </div>
                            <span className="cf-form-hint">Add tags to help members find this event (e.g., worship, family, prayer)</span>
                        </div>

                        <div className="cf-form-group full-width">
                            <label className="cf-form-label">Special Notes/Instructions</label>
                            <textarea
                                className="cf-form-textarea"
                                id="specialNotes"
                                placeholder="Any special instructions for attendees..."
                                style={{ minHeight: '80px' }}
                                value={formData.specialNotes}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Advertisement Media */}
                <div className="cf-form-card">
                    <h3 className="cf-form-section-title">Advertisement Media (Optional)</h3>
                    <div className="cf-form-grid">
                        <div className="cf-form-group">
                            <label className="cf-form-label">Advertisement Image 1</label>
                            {adImage1Preview && (
                                <div style={{ marginBottom: '10px' }}>
                                    <img src={adImage1Preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '8px' }} />
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{adImage1 ? 'New selected' : 'Current'}</div>
                                </div>
                            )}
                            <input type="file" className="cf-form-input" accept="image/*" onChange={(e) => handleFileChange(e, setAdImage1, setAdImage1Preview)} />
                        </div>
                        <div className="cf-form-group">
                            <label className="cf-form-label">Advertisement Image 2</label>
                            {adImage2Preview && (
                                <div style={{ marginBottom: '10px' }}>
                                    <img src={adImage2Preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '8px' }} />
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{adImage2 ? 'New selected' : 'Current'}</div>
                                </div>
                            )}
                            <input type="file" className="cf-form-input" accept="image/*" onChange={(e) => handleFileChange(e, setAdImage2, setAdImage2Preview)} />
                        </div>
                        <div className="cf-form-group">
                            <label className="cf-form-label">Advertisement Video 1</label>
                            {adVideo1Preview && (
                                <div style={{ marginBottom: '10px' }}>
                                    <video src={adVideo1Preview} controls style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '8px' }}></video>
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{adVideo1 ? 'New selected' : 'Current'}</div>
                                </div>
                            )}
                            <input type="file" className="cf-form-input" accept="video/mp4,video/webm,video/ogg" onChange={(e) => handleFileChange(e, setAdVideo1, setAdVideo1Preview)} />
                            <span className="cf-form-hint">Max 100MB</span>
                        </div>
                        <div className="cf-form-group">
                            <label className="cf-form-label">Advertisement Video 2</label>
                            {adVideo2Preview && (
                                <div style={{ marginBottom: '10px' }}>
                                    <video src={adVideo2Preview} controls style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '8px' }}></video>
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{adVideo2 ? 'New selected' : 'Current'}</div>
                                </div>
                            )}
                            <input type="file" className="cf-form-input" accept="video/mp4,video/webm,video/ogg" onChange={(e) => handleFileChange(e, setAdVideo2, setAdVideo2Preview)} />
                            <span className="cf-form-hint">Max 100MB</span>
                        </div>
                    </div>
                </div>

                {/* Event Image */}
                <div className="cf-form-card">
                    <h3 className="cf-form-section-title">Event Image</h3>
                    <div className="cf-image-upload" onClick={() => eventImageInputRef.current?.click()}>
                        {eventImagePreview ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img src={eventImagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                                <div className="cf-upload-text" style={{ marginTop: '10px' }}>{eventImage ? `Image selected: ${eventImage.name}` : `Current event image`}</div>
                                <div className="cf-upload-subtext">Click to change image</div>
                            </div>
                        ) : (
                            <>
                                <div className="cf-upload-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </div>
                                <div className="cf-upload-text">Click to upload event image or drag and drop</div>
                                <div className="cf-upload-subtext">PNG, JPG or JPEG (max. 5MB)</div>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={eventImageInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e, setEventImage, setEventImagePreview)}
                    />
                </div>

                {/* Form Actions */}
                <div className="cf-form-actions">
                    <button type="button" className="cf-btn cf-btn-cancel" onClick={() => router.push('/admin/events')}>Cancel</button>
                    <button type="button" className="cf-btn cf-btn-draft" disabled={isSubmitting} onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}>
                        {isSubmitting ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button type="submit" className="cf-btn cf-btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? (isEditMode ? 'Updating Event...' : 'Creating Event...') : (isEditMode ? 'Update Event' : 'Create Event')}
                    </button>
                </div>
            </form>
        </div>
    );
}
