'use client';

import React from 'react';
import { Eye, Edit, Trash2, Calendar, User, Hash } from 'lucide-react';
import { Blog } from '@prisma/client';

interface BlogCardProps {
    blog: Blog;
    onView: () => void;
    onDelete: () => void;
}

export default function BlogCard({ blog, onView, onDelete }: BlogCardProps) {
    const formattedDate = blog.published_at
        ? new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Draft';

    return (
        <div className="cf-blog-card-refined">
            <div className="cf-card-media-wrapper" onClick={onView} style={{ cursor: 'pointer' }}>
                <img
                    src={blog.thumbnail_path || '/Assests/default-event.jpg'}
                    alt={blog.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/Assests/default-event.jpg';
                    }}
                />
            </div>

            <div className="cf-card-info-content">
                <div>
                    <h3 className="cf-card-title">{blog.title}</h3>
                    <div className="cf-card-author-small">
                        {blog.slug}
                    </div>
                    <p className="cf-card-excerpt">{blog.excerpt}</p>
                </div>

                <div className="cf-card-footer">
                    <div className="cf-card-meta-item-fixed">
                        <User size={14} />
                        <span>{blog.author}</span>
                    </div>
                    <div className="cf-card-meta-item-fixed">
                        <Calendar size={14} />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="cf-card-category-tag">
                        {blog.category}
                    </div>
                </div>
            </div>

            <span className="cf-card-status-fixed">
                {blog.status === 'published' ? 'Published' : 'Draft'}
            </span>

            <div className="cf-card-actions-fixed">
                <div className="cf-view-pill">
                    <Eye size={16} />
                    <span>{blog.views || 0}</span>
                </div>
                <a href={`/admin/add-blog?id=${blog.id}`} className="cf-action-icon-btn cf-btn-edit-lite" onClick={(e) => e.stopPropagation()}>
                    <Edit size={18} />
                </a>
                <button className="cf-action-icon-btn cf-btn-delete-lite" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
