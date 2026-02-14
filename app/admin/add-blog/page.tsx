'use client';

import React, { useState, useRef, useEffect } from 'react';
import './add-blog.css';
import { getBlogById } from '@/app/actions/blogs';

export default function AddBlogPage() {
    const [id, setId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publishDate, setPublishDate] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('published');
    const [isFeatured, setIsFeatured] = useState(false);

    // File states
    const [authorImage, setAuthorImage] = useState<File | null>(null);
    const [authorImagePreview, setAuthorImagePreview] = useState<string | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Notification State
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Show Notification Helper
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Initialize and Fetch Data for Editing
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const blogId = urlParams.get('id');

        if (blogId) {
            setId(blogId);
            fetchBlogDetails(parseInt(blogId));
        } else {
            const today = new Date().toISOString().split('T')[0];
            setPublishDate(today);
        }
    }, []);

    async function fetchBlogDetails(blogId: number) {
        setIsLoading(true);
        try {
            const result = await getBlogById(blogId);
            if (result.success && result.data) {
                const blog = result.data;
                setTitle(blog.title || '');
                setAuthor(blog.author || '');
                setPublishDate(blog.published_at ? new Date(blog.published_at).toISOString().split('T')[0] : '');
                setCategory(blog.category || '');
                setTags(blog.tags || '');
                setExcerpt(blog.excerpt || '');
                setContent(blog.content || '');
                setStatus(blog.status || 'published');
                setIsFeatured(blog.is_featured || false);
                setAuthorImagePreview(blog.author_image_path || null);
                setThumbnailPreview(blog.thumbnail_path || null);
            } else {
                showNotification('Error loading blog details', 'error');
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            showNotification('An error occurred while loading blog details', 'error');
        }
        setIsLoading(false);
    }

    // Wait, let's just use the server action directly for simplicity or add a quick API.
    // I'll update this to use the server action.

    // Handle Author Image Selection
    const handleAuthorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAuthorImage(file);
            setAuthorImagePreview(URL.createObjectURL(file));
        }
    };

    // Handle Thumbnail Selection
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    // Handle Form Submission
    const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();

        // Basic validation
        if (!title.trim()) { showNotification('Please enter a blog title', 'error'); return; }
        if (!author.trim()) { showNotification('Please enter the author name', 'error'); return; }
        if (!publishDate && !isDraft && status === 'published') { showNotification('Please select a publish date', 'error'); return; }
        if (!excerpt.trim()) { showNotification('Please enter a short excerpt', 'error'); return; }
        if (!content.trim()) { showNotification('Please enter the blog content', 'error'); return; }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            if (id) formData.append('id', id);
            formData.append('title', title);
            formData.append('author', author);
            formData.append('publish_date', publishDate);
            formData.append('category', category);
            formData.append('tags', tags);
            formData.append('excerpt', excerpt);
            formData.append('content', content);
            formData.append('status', isDraft ? 'draft' : status);
            formData.append('is_featured', isFeatured ? 'true' : 'false');

            if (authorImage) formData.append('author_image', authorImage);
            if (thumbnail) formData.append('thumbnail', thumbnail);

            const apiUrl = id ? '/api/admin/blogs/update' : '/api/admin/blogs/create';
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                showNotification(id ? 'Blog post updated successfully!' : (isDraft ? 'Draft saved successfully!' : 'Blog post published successfully!'), 'success');

                if (!id) {
                    // Reset form only if creating
                    setTitle('');
                    setAuthor('');
                    setCategory('');
                    setTags('');
                    setExcerpt('');
                    setContent('');
                    setStatus('published');
                    setIsFeatured(false);
                    setAuthorImage(null);
                    setAuthorImagePreview(null);
                    setThumbnail(null);
                    setThumbnailPreview(null);
                    const today = new Date().toISOString().split('T')[0];
                    setPublishDate(today);
                }

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Redirect back to list after short delay if edited
                if (id) {
                    setTimeout(() => window.location.href = '/admin/blogs', 1500);
                }

            } else {
                showNotification('Error: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showNotification('An error occurred while saving the blog post.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading blog details...</div>;
    }

    return (
        <div className="cf-add-blog-container">
            {notification && (
                <div className={`cf-notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="cf-add-blog-header">
                <h1>{id ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
                <p>{id ? 'Update your blog article and keep your community informed.' : 'Add a new article to your church website blog. Keep the content clear, simple and uplifting.'}</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} encType="multipart/form-data">
                {/* Basic Information */}
                <div className="cf-blog-card">
                    <h3 className="cf-blog-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-blog-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                        </svg>
                        Basic Information
                    </h3>

                    <div className="cf-blog-form-grid">
                        <div className="cf-blog-form-group full-width">
                            <label className="cf-blog-label required">Blog Title</label>
                            <input
                                type="text"
                                className="cf-blog-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Walking in Faith Through Difficult Seasons"
                                required
                            />
                            <span className="cf-blog-hint">This title will appear on the website and in search results.</span>
                        </div>

                        <div className="cf-blog-form-group">
                            <label className="cf-blog-label required">Author</label>
                            <input
                                type="text"
                                className="cf-blog-input"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="e.g., Pastor John Doe"
                                required
                            />
                            <span className="cf-blog-hint">Name of the person who wrote or delivered this message.</span>
                        </div>

                        <div className="cf-blog-form-group">
                            <label className="cf-blog-label">Author Image</label>
                            <input
                                type="file"
                                className="cf-blog-input"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={handleAuthorImageChange}
                            />
                            <span className="cf-blog-hint">Optional. Shows next to author name. Square image recommended.</span>
                            {authorImagePreview && (
                                <div style={{ marginTop: '10px' }}>
                                    <img src={authorImagePreview} alt="Author Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>

                        <div className="cf-blog-form-group">
                            <label className="cf-blog-label required">Publish Date</label>
                            <input
                                type="date"
                                className="cf-blog-input"
                                value={publishDate}
                                onChange={(e) => setPublishDate(e.target.value)}
                                required
                            />
                            <span className="cf-blog-hint">Date the blog should appear on the website.</span>
                        </div>

                        <div className="cf-blog-form-group">
                            <label className="cf-blog-label">Category</label>
                            <select
                                className="cf-blog-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select category</option>
                                <option value="devotional">Devotional</option>
                                <option value="testimony">Testimony</option>
                                <option value="announcement">Announcement</option>
                                <option value="event-recap">Event Recap</option>
                                <option value="teaching">Teaching</option>
                                <option value="other">Other</option>
                            </select>
                            <span className="cf-blog-hint">Used to group related posts on the website.</span>
                        </div>

                        <div className="cf-blog-form-group">
                            <label className="cf-blog-label">Tags</label>
                            <input
                                type="text"
                                className="cf-blog-input"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., faith, hope, prayer"
                            />
                            <span className="cf-blog-hint">Comma-separated keywords to help with filtering and search.</span>
                        </div>

                        <div className="cf-blog-form-group full-width">
                            <label className="cf-blog-label required">Short Excerpt</label>
                            <textarea
                                className="cf-blog-textarea"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Short summary that appears on the blog listing page..."
                                required
                            ></textarea>
                            <span className="cf-blog-hint">1–3 sentences. This will show under the title on the blog page.</span>
                        </div>

                        <div className="cf-blog-form-group full-width">
                            <label className="cf-blog-label required">Full Content</label>
                            <textarea
                                className="cf-blog-textarea"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write the full blog content here..."
                                required
                            ></textarea>
                            <span className="cf-blog-hint">You can paste formatted text from your notes. Keep paragraphs short and readable.</span>
                        </div>
                    </div>
                </div>

                {/* Thumbnail Image */}
                <div className="cf-blog-card">
                    <h3 className="cf-blog-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-blog-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="9" cy="9" r="2"></circle>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                        </svg>
                        Thumbnail Image
                    </h3>

                    <div className="cf-blog-form-grid">
                        <div className="cf-blog-form-group full-width">
                            {!thumbnailPreview ? (
                                <div
                                    className="cf-blog-upload-box"
                                    onClick={() => document.getElementById('blogThumbnail')?.click()}
                                >
                                    <input
                                        type="file"
                                        id="blogThumbnail"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        style={{ display: 'none' }}
                                        onChange={handleThumbnailChange}
                                    />
                                    <div className="cf-blog-upload-icon-wrapper">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="9" cy="9" r="2"></circle>
                                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                                        </svg>
                                    </div>
                                    <div className="cf-blog-upload-title">Upload Blog Thumbnail</div>
                                    <div className="cf-blog-upload-subtitle">Drag and drop or click to browse</div>
                                    <div className="cf-blog-upload-formats">PNG, JPG, JPEG, WEBP • Recommended 800x600px</div>
                                </div>
                            ) : (
                                <div className="cf-blog-upload-box has-file" onClick={() => document.getElementById('blogThumbnail')?.click()}>
                                    <input
                                        type="file"
                                        id="blogThumbnail"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        style={{ display: 'none' }}
                                        onChange={handleThumbnailChange}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <img src={thumbnailPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                                        <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
                                            {thumbnail?.name}
                                        </div>
                                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                                            Click to change image
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Publishing Options */}
                <div className="cf-blog-card">
                    <h3 className="cf-blog-section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="cf-blog-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                            <path d="m9 12 2 2 4-4"></path>
                        </svg>
                        Publishing Options
                    </h3>

                    <div className="cf-blog-form-grid">
                        <div className="cf-blog-form-group">
                            <label className="cf-blog-label">Status</label>
                            <select
                                className="cf-blog-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                            <span className="cf-blog-hint">Draft posts will not appear on the website.</span>
                        </div>

                        <div className="cf-blog-form-group">
                            <div className="cf-blog-toggle-container">
                                <label className="cf-blog-toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                    />
                                    <span className="cf-blog-toggle-slider"></span>
                                </label>
                                <div>
                                    <div className="cf-blog-toggle-label">Featured Post</div>
                                    <div className="cf-blog-toggle-description">Highlight this post at the top of the blog page.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="cf-blog-actions">
                        <button type="button" className="cf-blog-btn cf-blog-btn-cancel" onClick={() => window.history.back()}>Cancel</button>
                        <button type="button" className="cf-blog-btn cf-blog-btn-secondary" onClick={(e) => handleSubmit(e, true)}>Save as Draft</button>
                        <button type="submit" className="cf-blog-btn cf-blog-btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Publishing...' : 'Publish Blog'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
