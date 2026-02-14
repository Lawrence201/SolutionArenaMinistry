"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import './add-sermon.css';
import { usePathname, useSearchParams } from 'next/navigation';
import { getSermonById } from '@/app/actions/sermons';

interface Scripture {
    reference: string;
}

interface MediaPreview {
    url: string;
    file: File | null;
    type: 'video' | 'audio' | 'pdf' | 'image' | 'video-url';
    name?: string;
    size?: string;
}

export default function AddSermonPage() {
    return (
        <Suspense fallback={<div className="cf-add-sermon-container">Loading form...</div>}>
            <AddSermonForm />
        </Suspense>
    );
}

function AddSermonForm() {
    // Basic Info
    const [title, setTitle] = useState('');
    const [speaker, setSpeaker] = useState('');
    const [date, setDate] = useState('');
    const [series, setSeries] = useState('');
    const [seriesOther, setSeriesOther] = useState('');
    const [description, setDescription] = useState('');

    // Scripture References
    const [scriptures, setScriptures] = useState<Scripture[]>([{ reference: '' }]);

    // Media Files
    const [videoType, setVideoType] = useState<'file' | 'url'>('file');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [sermonImage, setSermonImage] = useState<File | null>(null);

    // Previews
    const [videoPreview, setVideoPreview] = useState<MediaPreview | null>(null);
    const [audioPreview, setAudioPreview] = useState<MediaPreview | null>(null);
    const [pdfPreview, setPdfPreview] = useState<MediaPreview | null>(null);
    const [imagePreview, setImagePreview] = useState<MediaPreview | null>(null);

    // Additional Details
    const [duration, setDuration] = useState('');
    const [category, setCategory] = useState('');
    const [categoryOther, setCategoryOther] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Publishing Options
    const [isFeatured, setIsFeatured] = useState(false);
    const [allowDownloads, setAllowDownloads] = useState(true);
    const [publishImmediately, setPublishImmediately] = useState(true);
    const [enableComments, setEnableComments] = useState(true);

    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs for file inputs
    const videoInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const searchParams = useSearchParams();
    const sermonId = searchParams.get('id');
    const isEditMode = !!sermonId;

    useEffect(() => {
        if (isEditMode) {
            fetchSermonData();
        } else {
            // Set default date to today only for new sermons
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
        }
    }, [sermonId]);

    const fetchSermonData = async () => {
        if (!sermonId) return;
        const result = await getSermonById(parseInt(sermonId));
        if (result.success && result.data) {
            const s = result.data;
            setTitle(s.sermon_title || '');
            setSpeaker(s.sermon_speaker || '');
            if (s.sermon_date) {
                setDate(new Date(s.sermon_date).toISOString().split('T')[0]);
            }

            // Series handling
            const seriesOptions = ['faith-foundations', 'gospel-truth', 'prayer-life'];
            const sermonSeries = s.sermon_series || '';
            if (seriesOptions.includes(sermonSeries)) {
                setSeries(sermonSeries);
            } else if (sermonSeries) {
                setSeries('other');
                setSeriesOther(sermonSeries);
            }

            setDescription(s.sermon_description || '');
            if (s.scriptures) {
                setScriptures(s.scriptures.map((sc: any) => ({ reference: sc.scripture_reference || '' })));
            }

            // Media
            setVideoType((s.video_type as 'file' | 'url') || 'file');
            if (s.video_type === 'url') {
                setVideoUrl(s.video_file || '');
                setVideoPreview({ url: s.video_file || '', file: null, type: 'video-url', name: 'External Video URL' });
            } else if (s.video_file) {
                setVideoPreview({ url: s.video_file, file: null, type: 'video', name: 'Existing Video' });
            }

            if (s.audio_file) {
                setAudioPreview({ url: s.audio_file, file: null, type: 'audio', name: 'Existing Audio' });
            }
            if (s.pdf_file) {
                setPdfPreview({ url: s.pdf_file, file: null, type: 'pdf', name: 'Existing PDF' });
            }
            if (s.sermon_image) {
                setImagePreview({ url: s.sermon_image, file: null, type: 'image', name: 'Existing Image' });
            }

            setDuration(s.sermon_duration?.toString() || '');

            // Category handling
            const categoryOptions = ['sunday-service', 'bible-study', 'special-event'];
            const sermonCategory = s.sermon_category || '';
            if (categoryOptions.includes(sermonCategory)) {
                setCategory(sermonCategory);
            } else if (sermonCategory) {
                setCategory('other');
                setCategoryOther(sermonCategory);
            }

            setTags((s.tags as any) || []);
            setIsFeatured(!!s.is_featured);
            setAllowDownloads(!!s.allow_downloads);
            setPublishImmediately(!!s.is_published);
            setEnableComments(!!s.enable_comments);
        } else {
            showNotification(result.message || 'Failed to load sermon data', 'error');
        }
    };

    // --- Helper Functions ---

    function formatFileSize(bytes: number) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function getYouTubeID(url: string) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function handleScriptureChange(index: number, value: string) {
        const newScriptures = [...scriptures];
        newScriptures[index].reference = value;
        setScriptures(newScriptures);
    }

    function addScriptureField() {
        setScriptures([...scriptures, { reference: '' }]);
    }

    function removeScriptureField(index: number) {
        if (scriptures.length > 1) {
            const newScriptures = scriptures.filter((_, i) => i !== index);
            setScriptures(newScriptures);
        } else {
            showNotification('At least one scripture reference field is required.', 'error');
        }
    }

    // --- Tag Management ---

    function handleTagKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = tagInput.trim();
            if (value && !tags.includes(value.toLowerCase())) {
                setTags([...tags, value.toLowerCase()]);
                setTagInput('');
            }
        }
    }

    function removeTag(tagToRemove: string) {
        setTags(tags.filter(tag => tag !== tagToRemove));
    }

    // --- Media Handling ---

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio' | 'pdf' | 'image') {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewData: MediaPreview = {
            url: URL.createObjectURL(file), // For video/audio/image
            file: file,
            type: type,
            name: file.name,
            size: formatFileSize(file.size)
        };

        if (type === 'video') {
            setVideoFile(file);
            setVideoPreview(previewData);
            setVideoUrl(''); // Clear URL if file uploaded
        } else if (type === 'audio') {
            setAudioFile(file);
            setAudioPreview(previewData);
        } else if (type === 'pdf') {
            setPdfFile(file);
            setPdfPreview(previewData);
        } else if (type === 'image') {
            setSermonImage(file);
            setImagePreview(previewData);
        }
    }

    function removeFile(type: 'video' | 'audio' | 'pdf' | 'image') {
        if (type === 'video') {
            setVideoFile(null);
            setVideoPreview(null);
            if (videoInputRef.current) videoInputRef.current.value = '';
        } else if (type === 'audio') {
            setAudioFile(null);
            setAudioPreview(null);
            if (audioInputRef.current) audioInputRef.current.value = '';
        } else if (type === 'pdf') {
            setPdfFile(null);
            setPdfPreview(null);
            if (pdfInputRef.current) pdfInputRef.current.value = '';
        } else if (type === 'image') {
            setSermonImage(null);
            setImagePreview(null);
            if (imageInputRef.current) imageInputRef.current.value = '';
        }
    }

    function handleVideoUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
        const url = e.target.value;
        setVideoUrl(url);

        if (url) {
            // Basic validation and preview generation for URL
            // (In real app, you might want to embed the video player here)
            setVideoPreview({
                url: url,
                file: null,
                type: 'video-url',
                name: 'External Video URL'
            });
            setVideoFile(null); // Clear file if URL used
        } else {
            setVideoPreview(null);
        }
    }

    // --- Notification System ---
    function showNotification(message: string, type: 'success' | 'error') {
        const container = document.getElementById('cf-notification-container');
        if (!container) {
            // Create container if it doesn't exist (though it should be in layout or created once)
            const newContainer = document.createElement('div');
            newContainer.id = 'cf-notification-container';
            newContainer.style.position = 'fixed';
            newContainer.style.top = '20px';
            newContainer.style.right = '20px';
            newContainer.style.zIndex = '9999';
            newContainer.style.display = 'flex';
            newContainer.style.flexDirection = 'column';
            newContainer.style.gap = '10px';
            document.body.appendChild(newContainer);

            // Recursively call to use the new container
            showNotification(message, type);
            return;
        }

        const notification = document.createElement('div');
        notification.className = `cf-notification ${type} slide-in`;

        // Add styles inline for simplicity or ensure they are in CSS
        notification.style.padding = '16px 24px';
        notification.style.borderRadius = '12px';
        notification.style.background = 'white';
        notification.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        notification.style.borderLeft = type === 'success' ? '4px solid #10b981' : '4px solid #ef4444';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '12px';
        notification.style.minWidth = '300px';

        const icon = type === 'success' ?
            `<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>` :
            `<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

        notification.innerHTML = `
            ${icon}
            <div>
                <h4 style="margin:0; font-weight:600; color:#1f2937; font-size:14px;">${type === 'success' ? 'Success' : 'Error'}</h4>
                <p style="margin:0; color:#6b7280; font-size:13px;">${message}</p>
            </div>
        `;

        container.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    };


    async function handleSubmit(e: React.FormEvent, isDraft: boolean = false) {
        e.preventDefault();

        // Validation
        if (!title.trim()) { showNotification('Please enter a sermon title.', 'error'); return; }
        if (!speaker.trim()) { showNotification('Please enter a speaker name.', 'error'); return; }
        if (!date) { showNotification('Please select a sermon date.', 'error'); return; }
        if (!description.trim() || description.length < 50) { showNotification('Please provide a description (min 50 chars).', 'error'); return; }

        // Media validation
        const hasVideo = (videoType === 'file' && videoFile) || (videoType === 'url' && videoUrl);
        const hasAudio = !!audioFile;

        if (!hasVideo && !hasAudio) {
            showNotification('Please provide at least one media source (Video or Audio).', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('sermonTitle', title);
            formData.append('sermonSpeaker', speaker);
            formData.append('sermonDate', date);
            formData.append('sermonSeries', series);
            formData.append('sermonSeriesOther', seriesOther);
            formData.append('sermonDescription', description);

            // Scripture
            scriptures.forEach(s => {
                if (s.reference.trim()) formData.append('scripture[]', s.reference);
            });

            // Media
            formData.append('videoType', videoType);
            if (videoType === 'file' && videoFile) formData.append('videoFile', videoFile);
            if (videoType === 'url' && videoUrl) formData.append('videoUrl', videoUrl);
            if (audioFile) formData.append('audioFile', audioFile);
            if (pdfFile) formData.append('pdfFile', pdfFile);
            if (sermonImage) formData.append('sermonImage', sermonImage);

            // Details
            formData.append('sermonDuration', duration);
            formData.append('sermonCategory', category);
            formData.append('sermonCategoryOther', categoryOther);
            formData.append('tags', JSON.stringify(tags));

            // Publishing
            formData.append('featuredSermon', isFeatured ? '1' : '0');
            formData.append('allowDownloads', allowDownloads ? '1' : '0');
            formData.append('publishImmediately', (isDraft ? false : publishImmediately) ? '1' : '0');
            formData.append('enableComments', enableComments ? '1' : '0');

            if (isEditMode) {
                formData.append('id', sermonId!);
            }

            const apiUrl = isEditMode ? '/api/admin/sermons/update' : '/api/admin/sermons/create';
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                showNotification(isDraft ? 'Draft saved successfully!' : 'Sermon published successfully!', 'success');
                // Reset form
                window.location.reload();
            } else {
                showNotification(result.message || 'Error occurred.', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('An error occurred while saving.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // New Series Function
    function createNewSeries() {
        const name = prompt("Enter new sermon series name:");
        if (name && name.trim()) {
            // In a real app, you might save this to DB immediately or just add to local state
            // For now we set it as the value (assuming the select handles custom values or we treat it as 'other')
            // A better UX might be adding it to the list of options dynamically
            alert("For this demo, please select 'Other' and type '" + name + "'");
            setSeries('other');
            setSeriesOther(name);
        }
    };

    return (
        <div className="cf-add-sermon-container">
            <div className="cf-add-sermon-header">
                <h1>{isEditMode ? `Edit Sermon: ${title}` : 'Create New Sermon'}</h1>
                <p>{isEditMode ? 'Modify the details of this sermon' : 'Add a new sermon to your church website with multimedia content'}</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} encType="multipart/form-data">
                {/* Basic Information */}
                <div className="cf-sermon-form-card">
                    <h3 className="cf-sermon-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-sermon-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                        </svg>
                        Basic Information
                    </h3>

                    <div className="cf-sermon-form-grid">
                        <div className="cf-sermon-form-group full-width">
                            <label className="cf-sermon-form-label required">Sermon Title</label>
                            <input
                                type="text"
                                className="cf-sermon-input"
                                placeholder="e.g., Spiritually Reborn As God's Children"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <span className="cf-sermon-hint">Enter a compelling and descriptive title for your sermon</span>
                        </div>

                        <div className="cf-sermon-form-group">
                            <label className="cf-sermon-form-label required">Speaker / Preacher</label>
                            <input
                                type="text"
                                className="cf-sermon-input"
                                placeholder="e.g., Pastor John Smith"
                                value={speaker}
                                onChange={(e) => setSpeaker(e.target.value)}
                                required
                            />
                            <span className="cf-sermon-hint">Name of the person delivering the sermon</span>
                        </div>

                        <div className="cf-sermon-form-group">
                            <label className="cf-sermon-form-label required">Sermon Date</label>
                            <input
                                type="date"
                                className="cf-sermon-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                            <span className="cf-sermon-hint">Date when the sermon was delivered</span>
                        </div>

                        <div className="cf-sermon-form-group full-width">
                            <label className="cf-sermon-form-label">Sermon Series</label>
                            <div className="cf-series-selector">
                                <select
                                    className="cf-sermon-select"
                                    value={series}
                                    onChange={(e) => setSeries(e.target.value)}
                                >
                                    <option value="">Select a series (optional)</option>
                                    <option value="faith-foundations">Faith Foundations</option>
                                    <option value="gospel-truth">Gospel Truth</option>
                                    <option value="prayer-life">Power of Prayer</option>
                                    <option value="other">Other</option>
                                </select>
                                <button type="button" className="cf-new-series-btn" onClick={createNewSeries}>+ New Series</button>
                            </div>
                            {series === 'other' && (
                                <textarea
                                    className="cf-sermon-textarea"
                                    placeholder="Please specify sermon series..."
                                    style={{ marginTop: '12px', minHeight: '60px' }}
                                    value={seriesOther}
                                    onChange={(e) => setSeriesOther(e.target.value)}
                                />
                            )}
                            <span className="cf-sermon-hint">Group this sermon with others in a series</span>
                        </div>

                        <div className="cf-sermon-form-group full-width">
                            <label className="cf-sermon-form-label required">Sermon Description</label>
                            <textarea
                                className="cf-sermon-textarea"
                                placeholder="Provide a brief summary of the sermon message and key points..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                            <span className="cf-sermon-hint">Minimum 50 characters recommended</span>
                        </div>
                    </div>
                </div>

                {/* Scripture References */}
                <div className="cf-sermon-form-card">
                    <h3 className="cf-sermon-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-sermon-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                            <path d="M12 6v6"></path>
                            <path d="M9 9h6"></path>
                        </svg>
                        Scripture References
                    </h3>

                    <div className="cf-info-box">
                        <div className="cf-info-box-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 16v-4"></path>
                                <path d="M12 8h.01"></path>
                            </svg>
                            Scripture Reference Format
                        </div>
                        <div className="cf-info-box-content">
                            Enter scripture references that were used in this sermon. Examples: "John 3:16", "Romans 8:28-30"
                        </div>
                    </div>

                    <div className="cf-scripture-list">
                        {scriptures.map((item, index) => (
                            <div key={index} className="cf-scripture-item">
                                <input
                                    type="text"
                                    className="cf-sermon-input"
                                    placeholder="e.g., John 3:16-18"
                                    value={item.reference}
                                    onChange={(e) => handleScriptureChange(index, e.target.value)}
                                />
                                <button type="button" className="cf-remove-scripture-btn" onClick={() => removeScriptureField(index)}>Remove</button>
                            </div>
                        ))}
                    </div>

                    <button type="button" className="cf-add-scripture-btn" onClick={addScriptureField}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Scripture Reference
                    </button>
                </div>

                {/* Media Files */}
                <div className="cf-sermon-form-card">
                    <h3 className="cf-sermon-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-sermon-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                        Media Files
                    </h3>

                    <div className="cf-info-box">
                        <div className="cf-info-box-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 16v-4"></path>
                                <path d="M12 8h.01"></path>
                            </svg>
                            Media Upload Guidelines
                        </div>
                        <div className="cf-info-box-content">
                            Upload sermon media files or provide video links. At least one media type (video/audio) is required.
                        </div>
                    </div>

                    <div className="cf-media-upload-grid">
                        <div className="cf-video-upload-container">
                            <div className="cf-video-toggle-wrapper">
                                <label className="cf-video-toggle-option">
                                    <input
                                        type="radio"
                                        name="videoType"
                                        value="file"
                                        checked={videoType === 'file'}
                                        onChange={() => setVideoType('file')}
                                    />
                                    <span className="cf-toggle-radio"></span>
                                    Upload Video File
                                </label>
                                <label className="cf-video-toggle-option">
                                    <input
                                        type="radio"
                                        name="videoType"
                                        value="url"
                                        checked={videoType === 'url'}
                                        onChange={() => setVideoType('url')}
                                    />
                                    <span className="cf-toggle-radio"></span>
                                    Video URL/Link
                                </label>
                            </div>

                            {videoType === 'file' ? (
                                <div
                                    className={`cf-media-upload-box ${videoPreview ? 'has-file' : ''}`}
                                    onClick={() => !videoPreview && videoInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={videoInputRef}
                                        accept="video/mp4,video/webm,video/ogg"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileUpload(e, 'video')}
                                    />
                                    {!videoPreview ? (
                                        <>
                                            <div className="cf-upload-icon-wrapper">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                                </svg>
                                            </div>
                                            <div className="cf-upload-title">Upload Video File</div>
                                            <div className="cf-upload-subtitle">Drag and drop or click to browse</div>
                                            <div className="cf-upload-formats">MP4, WEBM, OGG</div>
                                        </>
                                    ) : (
                                        <div className="cf-file-preview">
                                            <video controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}>
                                                <source src={videoPreview.url} type={videoPreview.file?.type} />
                                            </video>
                                            <div style={{ marginTop: '8px' }}>
                                                <strong>{videoPreview.name}</strong><br />
                                                Size: {videoPreview.size}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeFile('video'); }}
                                                style={{ marginTop: '12px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                            >
                                                Remove Video
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={`cf-video-url-box ${videoPreview ? 'has-file' : ''}`}>
                                    {!videoPreview ? (
                                        <>
                                            <div className="cf-url-icon-wrapper">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                                </svg>
                                            </div>
                                            <div className="cf-upload-title">Video URL/Link</div>
                                            <input
                                                type="url"
                                                className="cf-video-url-input"
                                                placeholder="https://youtube.com/watch?v=..."
                                                value={videoUrl}
                                                onChange={handleVideoUrlChange}
                                            />
                                            <div className="cf-upload-formats">Supported: YouTube, Vimeo, Facebook, etc.</div>
                                        </>
                                    ) : (
                                        <div className="cf-file-preview" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            {/* Logic to render embed or basic link preview */}
                                            {videoPreview.url.includes('youtube.com') || videoPreview.url.includes('youtu.be') ? (
                                                <iframe
                                                    width="100%"
                                                    height="250"
                                                    src={`https://www.youtube.com/embed/${getYouTubeID(videoPreview.url)}`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    style={{ borderRadius: '8px' }}
                                                ></iframe>
                                            ) : (videoPreview.url.includes('facebook.com') || videoPreview.url.includes('fb.watch')) ? (
                                                <iframe
                                                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoPreview.url)}&show_text=false&width=560`}
                                                    width="100%"
                                                    height="250"
                                                    style={{ border: 'none', overflow: 'hidden', borderRadius: '8px' }}
                                                    scrolling="no"
                                                    frameBorder="0"
                                                    allowFullScreen={true}
                                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                                ></iframe>
                                            ) : (
                                                <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px', marginBottom: '10px', width: '100%', textAlign: 'center' }}>
                                                    <a href={videoPreview.url} target="_blank" rel="noopener noreferrer" style={{ color: '#659df8', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                                        {videoPreview.url}
                                                    </a>
                                                </div>
                                            )}

                                            <div style={{ marginTop: '12px' }}>
                                                <strong>External Video Link</strong>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => { setVideoUrl(''); setVideoPreview(null); }}
                                                style={{ marginTop: '12px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                            >
                                                Change URL
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Audio Upload */}
                        <div
                            className={`cf-media-upload-box ${audioPreview ? 'has-file' : ''}`}
                            onClick={() => !audioPreview && audioInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={audioInputRef}
                                accept="audio/mp3,audio/wav,audio/ogg,audio/mpeg"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e, 'audio')}
                            />
                            {!audioPreview ? (
                                <>
                                    <div className="cf-upload-icon-wrapper">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18V5l12-2v13"></path>
                                            <circle cx="6" cy="18" r="3"></circle>
                                            <circle cx="18" cy="16" r="3"></circle>
                                        </svg>
                                    </div>
                                    <div className="cf-upload-title">Upload Audio</div>
                                    <div className="cf-upload-subtitle">Drag and drop or click to browse</div>
                                    <div className="cf-upload-formats">MP3, WAV, OGG</div>
                                </>
                            ) : (
                                <div className="cf-file-preview">
                                    <audio controls style={{ width: '100%' }}>
                                        <source src={audioPreview.url} type={audioPreview.file?.type} />
                                    </audio>
                                    <div style={{ marginTop: '8px' }}>
                                        <strong>{audioPreview.name}</strong><br />
                                        Size: {audioPreview.size}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFile('audio'); }}
                                        style={{ marginTop: '12px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        Remove Audio
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* PDF Upload */}
                        <div
                            className={`cf-media-upload-box ${pdfPreview ? 'has-file' : ''}`}
                            onClick={() => !pdfPreview && pdfInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={pdfInputRef}
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e, 'pdf')}
                            />
                            {!pdfPreview ? (
                                <>
                                    <div className="cf-upload-icon-wrapper">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                    </div>
                                    <div className="cf-upload-title">Upload PDF Notes</div>
                                    <div className="cf-upload-subtitle">Optional sermon notes</div>
                                </>
                            ) : (
                                <div className="cf-file-preview">
                                    <div style={{ textAlign: 'center' }}>
                                        <strong>{pdfPreview.name}</strong><br />
                                        Size: {pdfPreview.size}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFile('pdf'); }}
                                        style={{ marginTop: '12px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        Remove PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sermon Thumbnail */}
                <div className="cf-sermon-form-card">
                    <h3 className="cf-sermon-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-sermon-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="9" cy="9" r="2"></circle>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                        </svg>
                        Sermon Thumbnail Image
                    </h3>

                    <div
                        className={`cf-media-upload-box ${imagePreview ? 'has-file' : ''}`}
                        onClick={() => !imagePreview && imageInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={imageInputRef}
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(e, 'image')}
                        />
                        {!imagePreview ? (
                            <>
                                <div className="cf-upload-icon-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="9" cy="9" r="2"></circle>
                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                                    </svg>
                                </div>
                                <div className="cf-upload-title">Upload Sermon Thumbnail</div>
                                <div className="cf-upload-formats">PNG, JPG, WEBP (Rec: 800x600px)</div>
                            </>
                        ) : (
                            <div className="cf-file-preview">
                                <img src={imagePreview.url} style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }} alt="Preview" />
                                <div style={{ marginTop: '8px' }}>
                                    <strong>{imagePreview.name}</strong><br />
                                    Size: {imagePreview.size}
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeFile('image'); }}
                                    style={{ marginTop: '12px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Remove Image
                                </button>
                            </div>
                        )}

                    </div>
                </div>

                {/* Additional Details */}
                <div className="cf-sermon-form-card">
                    <h3 className="cf-sermon-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-sermon-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        Additional Details
                    </h3>

                    <div className="cf-sermon-form-grid">
                        <div className="cf-sermon-form-group">
                            <label className="cf-sermon-form-label">Duration (minutes)</label>
                            <input
                                type="number"
                                className="cf-sermon-input"
                                placeholder="e.g., 45"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                        </div>

                        <div className="cf-sermon-form-group">
                            <label className="cf-sermon-form-label">Category</label>
                            <select
                                className="cf-sermon-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select category</option>
                                <option value="sunday-service">Sunday Service</option>
                                <option value="bible-study">Bible Study</option>
                                <option value="special-event">Special Event</option>
                                <option value="other">Other</option>
                            </select>
                            {category === 'other' && (
                                <textarea
                                    className="cf-sermon-textarea"
                                    placeholder="Please specify category..."
                                    style={{ marginTop: '12px', minHeight: '60px' }}
                                    value={categoryOther}
                                    onChange={(e) => setCategoryOther(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="cf-sermon-form-group full-width">
                            <label className="cf-sermon-form-label">Tags</label>
                            <div className="cf-sermon-tag-wrapper" onClick={() => document.getElementById('tagInput')?.focus()}>
                                {tags.map(tag => (
                                    <span key={tag} className="cf-sermon-tag">
                                        {tag}
                                        <span className="cf-sermon-tag-remove" onClick={(e) => { e.stopPropagation(); removeTag(tag); }}>&times;</span>
                                    </span>
                                ))}
                                <input
                                    id="tagInput"
                                    type="text"
                                    className="cf-sermon-tag-input"
                                    placeholder="Type and press Enter to add tags..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                />
                            </div>
                            <span className="cf-sermon-hint">Add relevant tags for better searchability</span>
                        </div>
                    </div>
                </div>

                {/* Publishing Options */}
                <div className="cf-sermon-form-card">
                    <h3 className="cf-sermon-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-sermon-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                            <path d="m9 12 2 2 4-4"></path>
                        </svg>
                        Publishing Options
                    </h3>

                    <div className="cf-sermon-form-grid">
                        <div className="cf-sermon-form-group">
                            <div className="cf-toggle-container">
                                <label className="cf-toggle-switch">
                                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                                    <span className="cf-toggle-slider"></span>
                                </label>
                                <div>
                                    <div className="cf-toggle-label">Featured Sermon</div>
                                    <div className="cf-toggle-description">Display prominently</div>
                                </div>
                            </div>
                        </div>

                        <div className="cf-sermon-form-group">
                            <div className="cf-toggle-container">
                                <label className="cf-toggle-switch">
                                    <input type="checkbox" checked={allowDownloads} onChange={(e) => setAllowDownloads(e.target.checked)} />
                                    <span className="cf-toggle-slider"></span>
                                </label>
                                <div>
                                    <div className="cf-toggle-label">Allow Downloads</div>
                                    <div className="cf-toggle-description">Let users download media</div>
                                </div>
                            </div>
                        </div>

                        <div className="cf-sermon-form-group">
                            <div className="cf-toggle-container">
                                <label className="cf-toggle-switch">
                                    <input type="checkbox" checked={publishImmediately} onChange={(e) => setPublishImmediately(e.target.checked)} />
                                    <span className="cf-toggle-slider"></span>
                                </label>
                                <div>
                                    <div className="cf-toggle-label">Publish Immediately</div>
                                    <div className="cf-toggle-description">Make visible to public</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cf-sermon-form-actions">
                    <button type="button" className="cf-sermon-btn cf-sermon-btn-cancel" onClick={() => window.history.back()}>
                        Cancel
                    </button>
                    <button type="button" className="cf-sermon-btn cf-sermon-btn-draft" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update as Draft' : 'Save as Draft')}
                    </button>
                    <button type="submit" className="cf-sermon-btn cf-sermon-btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update Sermon' : 'Publish Sermon')}
                    </button>
                </div>

            </form>
        </div>
    );
}
