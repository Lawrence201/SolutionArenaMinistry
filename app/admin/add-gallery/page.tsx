'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import './add-gallery.css';
import { getGalleryItemForEdit } from '@/app/actions/gallery';

interface GalleryFile extends File {
    id: string; // Temporary ID for UI handling
    previewUrl?: string;
}

interface ExistingMedia {
    id: number;
    file_path: string;
    media_type: string;
    title?: string;
    file_name: string;
    file_size: number;
}

function AddGalleryContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get('id');
    const editType = searchParams.get('type');
    const isEditMode = !!editId;

    // Form State
    const [albumId, setAlbumId] = useState<string | null>(null);
    const [albumName, setAlbumName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [photographer, setPhotographer] = useState('');
    const [status, setStatus] = useState('published');

    // File Handling State
    const [selectedFiles, setSelectedFiles] = useState<GalleryFile[]>([]);
    const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
    const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    // Notification State
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Load Data for Edit Mode
    useEffect(() => {
        if (isEditMode && editId) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const result = await getGalleryItemForEdit(parseInt(editId), editType === 'album' ? 'album' : 'media');
                    if (result.success && result.data) {
                        const data = result.data;
                        setAlbumId(data.id.toString());

                        if (editType === 'album') {
                            const albumData = data as any;
                            setAlbumName(albumData.album_name || '');
                            setEventDate(albumData.event_date ? new Date(albumData.event_date).toISOString().split('T')[0] : '');
                            setCategory(albumData.category || '');
                            setDescription(albumData.description || '');
                            setTags(albumData.tags || '');
                            setPhotographer(albumData.photographer || '');
                            setStatus(albumData.status || 'published');
                            setExistingMedia(albumData.media || []);
                        } else {
                            const mediaData = data as any;
                            // Media Item specific pre-population
                            setAlbumName(mediaData.title || mediaData.file_name || '');
                            setDescription(mediaData.caption || '');
                            // Store original media to show it
                            setExistingMedia([mediaData]);
                        }
                    } else {
                        showNotification(result.message || 'Failed to load gallery data', 'error');
                    }
                } catch (error) {
                    console.error('Error fetching gallery item:', error);
                    showNotification('An error occurred while loading data', 'error');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isEditMode, editId, editType]);

    // File Input Helper
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFiles = (files: File[]) => {
        if (editType === 'media' && isEditMode) {
            // Only one file allowed for individual media replacement
            const file = files[0];
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const galleryFile = file as GalleryFile;
                galleryFile.id = 'replacement';
                galleryFile.previewUrl = URL.createObjectURL(file);
                setSelectedFiles([galleryFile]);
            }
            return;
        }

        const MAX_FILES = 30;
        const currentCount = selectedFiles.length + existingMedia.length;
        const remainingSlots = MAX_FILES - currentCount;

        if (remainingSlots <= 0) {
            showNotification(`Maximum limit of ${MAX_FILES} files reached.`, 'error');
            return;
        }

        let filesToAdd: GalleryFile[] = [];
        const validFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));

        if (validFiles.length > remainingSlots) {
            showNotification(`Only ${remainingSlots} slots available.`, 'error');
            validFiles.splice(remainingSlots);
        }

        validFiles.forEach(file => {
            const galleryFile = file as GalleryFile;
            galleryFile.id = Math.random().toString(36).substring(7);
            galleryFile.previewUrl = URL.createObjectURL(file);
            filesToAdd.push(galleryFile);
        });

        setSelectedFiles(prev => [...prev, ...filesToAdd]);
    };

    const removeFile = (id: string) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== id));
    };

    const removeExistingMedia = (id: number) => {
        setExistingMedia(prev => prev.filter(m => m.id !== id));
        setDeletedMediaIds(prev => [...prev, id]);
    };

    const clearAll = () => {
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatFileSize = (bytes: number | bigint) => {
        const bytesNum = Number(bytes);
        if (bytesNum === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytesNum) / Math.log(k));
        return parseFloat((bytesNum / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Submission Logic
    const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();

        // Validation
        if (!isEditMode && selectedFiles.length === 0) {
            showNotification('Please select at least one file to upload.', 'error');
            return;
        }

        if (!albumName.trim()) { showNotification('Name/Title is required.', 'error'); return; }

        if (editType !== 'media') {
            if (!eventDate) { showNotification('Event date is required.', 'error'); return; }
            if (!category) { showNotification('Category is required.', 'error'); return; }
        }

        setIsSubmitting(true);
        const finalStatus = isDraft ? 'draft' : status;

        try {
            const formData = new FormData();

            if (isEditMode && editType === 'media' && editId) {
                // Update Single Media
                formData.append('media_id', editId);
                formData.append('title', albumName);
                formData.append('caption', description);
                if (selectedFiles.length > 0) {
                    formData.append('media_file', selectedFiles[0]);
                }

                const response = await fetch('/api/admin/gallery/update-media', { // We'll create or update a unified route
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                if (result.success) {
                    showNotification('Media item updated successfully!', 'success');
                    router.push('/admin/gallery');
                } else {
                    showNotification(result.message, 'error');
                }
            } else {
                // Album Logic (Create/Update)
                // If it's a large upload, we could still do chunks, but for meta updates we need one clear call first or a unified route
                formData.append('albumName', albumName);
                formData.append('eventDate', eventDate);
                formData.append('category', category);
                formData.append('description', description);
                formData.append('tags', tags);
                formData.append('photographer', photographer);
                formData.append('status', finalStatus);

                if (isEditMode && editId) {
                    formData.append('album_id', editId);
                    if (deletedMediaIds.length > 0) {
                        formData.append('deleted_media_ids', JSON.stringify(deletedMediaIds));
                    }
                }

                // If adding new media
                if (selectedFiles.length > 0) {
                    // For simplicity in edit mode, let's treat the first upload as an update + first batch
                    selectedFiles.forEach(file => {
                        formData.append('media[]', file);
                    });
                }

                const response = await fetch('/api/admin/gallery/create', { // Use the create route which we'll update to handle album_id
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (result.success) {
                    showNotification(`Gallery ${isEditMode ? 'updated' : 'published'} successfully!`, 'success');
                    router.push('/admin/gallery');
                } else {
                    showNotification(result.message, 'error');
                }
            }

        } catch (error) {
            console.error('Critical upload error:', error);
            showNotification('An unexpected error occurred. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
        }
    };

    if (isLoading) return <div className="cf-gallery-container"><div className="cf-upload-subtitle">Loading data...</div></div>;

    return (
        <div className="cf-gallery-container">
            {notification && (
                <div className={`cf-notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="cf-gallery-header">
                <h1>{isEditMode ? `Edit ${editType === 'album' ? 'Album' : 'Media Item'}` : 'Add Gallery Media'}</h1>
                <p>Manage your church gallery. {isEditMode ? 'Update details or manage files.' : 'Upload photos and videos to share moments.'}</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)}>
                {/* Media Upload Section */}
                <div className="cf-gallery-card">
                    <h3 className="cf-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                            <line x1="16" y1="5" x2="22" y2="5"></line>
                            <line x1="19" y1="2" x2="19" y2="8"></line>
                            <circle cx="9" cy="9" r="2"></circle>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                        </svg>
                        {editType === 'media' ? 'Replace Media File' : 'Manage Media Files'}
                    </h3>

                    <div
                        className={`cf-upload-zone ${isDragging ? 'drag-over' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*,video/*"
                            multiple={editType !== 'media'}
                            hidden
                            onChange={handleFileSelect}
                        />
                        <div className="cf-upload-icon-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <div className="cf-upload-title">{isEditMode && editType === 'media' ? 'Click or Drag to Replace File' : (selectedFiles.length > 0 ? 'Add More Files' : 'Drag & Drop Files Here')}</div>
                        <div className="cf-upload-subtitle">{!isEditMode || editType !== 'media' ? 'or click to browse' : 'Current file will be replaced'}</div>
                    </div>

                    {/* Preview Section */}
                    {(selectedFiles.length > 0 || existingMedia.length > 0) && (
                        <div style={{ marginTop: '24px' }}>
                            <div className="cf-preview-header">
                                <div className="cf-preview-title">Gallery Content ({selectedFiles.length + existingMedia.length})</div>
                                {selectedFiles.length > 0 && (
                                    <button type="button" className="cf-btn-secondary cf-btn" onClick={clearAll} style={{ width: 'auto' }}>
                                        Clear New
                                    </button>
                                )}
                            </div>
                            <div className="cf-media-grid">
                                {/* Existing Media */}
                                {existingMedia.map((media) => (
                                    <div key={`existing-${media.id}`} className="cf-media-item">
                                        {media.media_type === 'video' ? (
                                            <video className="cf-media-preview" src={media.file_path} />
                                        ) : (
                                            <img className="cf-media-preview" src={media.file_path} alt={media.file_name} />
                                        )}
                                        <span className={`cf-media-type-badge ${media.media_type === 'video' ? 'video' : ''}`}>
                                            Existing {media.media_type === 'video' ? 'Video' : 'Photo'}
                                        </span>
                                        <div className="cf-media-overlay">
                                            <div className="cf-media-filename">{media.title || media.file_name}</div>
                                            <div className="cf-media-size">{formatFileSize(media.file_size)}</div>
                                        </div>
                                        {!isEditMode || editType !== 'media' ? (
                                            <div className="cf-media-actions">
                                                <button type="button" className="cf-media-action-btn delete" title="Mark for deletion" onClick={() => removeExistingMedia(media.id)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18"></path>
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}

                                {/* New Selections */}
                                {selectedFiles.map((file) => (
                                    <div key={file.id} className="cf-media-item">
                                        {file.type.startsWith('video/') ? (
                                            <video className="cf-media-preview" src={file.previewUrl} muted />
                                        ) : (
                                            <img className="cf-media-preview" src={file.previewUrl} alt={file.name} />
                                        )}
                                        <span className={`cf-media-type-badge ${file.type.startsWith('video/') ? 'video' : ''}`} style={{ background: '#22c55e' }}>
                                            NEW {file.type.startsWith('video/') ? 'Video' : 'Photo'}
                                        </span>
                                        <div className="cf-media-overlay">
                                            <div className="cf-media-filename">{file.name}</div>
                                            <div className="cf-media-size">{formatFileSize(file.size)}</div>
                                        </div>
                                        <div className="cf-media-actions">
                                            <button type="button" className="cf-media-action-btn delete" onClick={() => removeFile(file.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18"></path>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Gallery Details */}
                <div className="cf-gallery-card">
                    <h3 className="cf-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <line x1="10" y1="9" x2="8" y2="9"></line>
                        </svg>
                        {editType === 'media' ? 'Media Details' : 'Gallery Information'}
                    </h3>

                    <div className="cf-form-grid">
                        <div className="cf-form-group full-width">
                            <label className="cf-form-label required">{editType === 'media' ? 'Title' : 'Album/Event Name'}</label>
                            <input
                                type="text"
                                className="cf-form-input"
                                placeholder={editType === 'media' ? "Media Title" : "e.g., Easter Sunday Service 2024"}
                                required
                                value={albumName}
                                onChange={(e) => setAlbumName(e.target.value)}
                            />
                            <span className="cf-form-hint">{editType === 'media' ? 'A descriptive title for this item' : 'Give this collection a descriptive name'}</span>
                        </div>

                        {editType !== 'media' && (
                            <>
                                <div className="cf-form-group">
                                    <label className="cf-form-label required">Event Date</label>
                                    <input
                                        type="date"
                                        className="cf-form-input"
                                        required
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                    />
                                </div>

                                <div className="cf-form-group">
                                    <label className="cf-form-label required">Category</label>
                                    <select
                                        className="cf-form-select"
                                        required
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="">Select category</option>
                                        <option value="worship">Worship Services</option>
                                        <option value="events">Church Events</option>
                                        <option value="youth">Youth Ministry</option>
                                        <option value="missions">Missions & Outreach</option>
                                        <option value="celebrations">Special Celebrations</option>
                                        <option value="community">Community Gatherings</option>
                                        <option value="baptism">Baptisms</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="cf-form-group full-width">
                            <label className="cf-form-label">Description / Caption</label>
                            <textarea
                                className="cf-form-textarea"
                                placeholder="Add some context..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>

                        {editType !== 'media' && (
                            <>
                                <div className="cf-form-group">
                                    <label className="cf-form-label">Tags</label>
                                    <input
                                        type="text"
                                        className="cf-form-input"
                                        placeholder="worship, praise..."
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                    />
                                </div>

                                <div className="cf-form-group">
                                    <label className="cf-form-label">Photographer</label>
                                    <input
                                        type="text"
                                        className="cf-form-input"
                                        placeholder="Name of photographer"
                                        value={photographer}
                                        onChange={(e) => setPhotographer(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="cf-actions">
                    <button type="button" className="cf-btn cf-btn-cancel" onClick={() => router.push('/admin/gallery')}>
                        Cancel
                    </button>
                    {!isEditMode && (
                        <button type="button" className="cf-btn cf-btn-secondary" onClick={(e) => handleSubmit(e, true)}>
                            Save as Draft
                        </button>
                    )}
                    <button type="submit" className="cf-btn cf-btn-primary" disabled={isSubmitting}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        {isSubmitting ? 'Processing...' : (isEditMode ? 'Update Gallery' : 'Upload Gallery')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function AddGalleryPage() {
    return (
        <Suspense fallback={<div className="cf-gallery-container"><div className="cf-upload-subtitle">Loading...</div></div>}>
            <AddGalleryContent />
        </Suspense>
    );
}
