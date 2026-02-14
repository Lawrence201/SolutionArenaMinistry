'use client';

import React, { useState, useEffect } from 'react';
import './blogs.css';
import { Search, Plus, Bot, X, TrendingUp, AlertCircle, Book, Star, Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';
import { getBlogs, deleteBlog, getBlogInsights } from '@/app/actions/blogs';
import BlogMetrics from './BlogMetrics';
import BlogSidebar from './BlogSidebar';
import BlogCard from './BlogCard';

export default function BlogsClient() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ total: 0, published: 0, drafts: 0, featured: 0 });
    const [quickStats, setQuickStats] = useState<any>({ latestAuthor: '-', postsThisMonth: 0 });
    const [insights, setInsights] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [view, setView] = useState<'all' | 'featured' | 'published' | 'draft'>('all');
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedBlog, setSelectedBlog] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [view, category]);

    useEffect(() => {
        loadInsights();
    }, []);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    async function loadData() {
        setIsLoading(true);
        const result = await getBlogs({ view, category, search });
        if (result.success && result.stats) {
            setBlogs(result.data || []);
            setSeries(result.series || []);
            setStats(result.stats);
            setQuickStats({
                latestAuthor: result.stats.latestAuthor,
                postsThisMonth: result.stats.postsThisMonth
            });
        }
        setIsLoading(false);
    }

    async function loadInsights() {
        const result = await getBlogInsights();
        if (result.success) {
            setInsights(result.data || []);
        }
    }

    async function handleDelete(blog: any) {
        if (confirm(`Are you sure you want to delete this blog post?\n\nTitle: ${blog.title}\nAuthor: ${blog.author}\n\nThis action cannot be undone and will delete all associated images.`)) {
            const result = await deleteBlog(blog.id);
            if (result.success) {
                loadData();
                loadInsights();
            } else {
                alert('Failed to delete blog');
            }
        }
    }

    const getInsightIcon = (iconName: string) => {
        switch (iconName) {
            case 'trending-up': return <TrendingUp size={20} />;
            case 'alert-circle': return <AlertCircle size={20} />;
            case 'book': return <Book size={20} />;
            case 'star': return <Star size={20} />;
            default: return <TrendingUp size={20} />;
        }
    };

    return (
        <div className="admin-blogs-page">
            <div className="cf-em-page-header">
                <div className="cf-em-header-content">
                    <h1>Blog Posts</h1>
                    <p>Manage and publish articles for your church website</p>
                </div>
                <div className="cf-em-header-actions">
                    <Link href="/admin/add-blog" className="cf-em-btn cf-em-btn-primary">
                        <Plus size={20} />
                        <span>New Blog Post</span>
                    </Link>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="insights-section">
                <div className="cf-ai-insights-header">
                    <div className="cf-ai-icon-wrapper">
                        <img src="/assets/chatbot.png" alt="AI Chatbot" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    </div>
                    <h2>AI-Powered Insights</h2>
                </div>

                <div className="cf-insights-grid">
                    {insights.length > 0 ? (
                        insights.map((insight, idx) => (
                            <div key={idx} className={`cf-insight-card cf-insight-${insight.type}`}>
                                <div className="cf-insight-icon">
                                    {getInsightIcon(insight.icon)}
                                </div>
                                <div className="cf-insight-text">
                                    {insight.text}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                            No insights available - add more blog posts to see AI insights
                        </div>
                    )}
                </div>
            </div>

            <BlogMetrics stats={stats} />

            <div className="cf-blog-content-grid">
                <BlogSidebar
                    series={series}
                    currentSeries={category}
                    onSeriesChange={setCategory}
                    quickStats={quickStats}
                />

                <div className="cf-blogs-main-section">
                    <div className="cf-blogs-controls">
                        <div className="cf-blog-tabs">
                            <button className={`cf-blog-tab ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>All Posts</button>
                            <button className={`cf-blog-tab ${view === 'published' ? 'active' : ''}`} onClick={() => setView('published')}>Published</button>
                            <button className={`cf-blog-tab ${view === 'draft' ? 'active' : ''}`} onClick={() => setView('draft')}>Drafts</button>
                            <button className={`cf-blog-tab ${view === 'featured' ? 'active' : ''}`} onClick={() => setView('featured')}>Featured</button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                            <div className="cf-search-wrapper">
                                <span className="cf-search-icon">
                                    <Search size={16} />
                                </span>
                                <input
                                    type="text"
                                    className="cf-search-input"
                                    placeholder="Search blog posts, authors..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <select className="cf-sort-select">
                                <option>Newest First</option>
                                <option>Oldest First</option>
                                <option>Most Viewed</option>
                            </select>
                        </div>
                    </div>

                    <div className="cf-blog-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {isLoading ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading...</div>
                        ) : blogs.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No blog posts found.</div>
                        ) : (
                            blogs.map(blog => (
                                <BlogCard
                                    key={blog.id}
                                    blog={blog}
                                    onView={() => setSelectedBlog(blog)}
                                    onDelete={() => handleDelete(blog)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Professional Detail Modal */}
            {selectedBlog && (
                <div className="cf-modal-overlay" onClick={() => setSelectedBlog(null)}>
                    <div className="cf-modal-container cf-blog-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="cf-modal-close" onClick={() => setSelectedBlog(null)}>
                            <X size={24} />
                        </button>

                        <div className="cf-modal-scrollable-content">
                            {selectedBlog.thumbnail_path && (
                                <div className="cf-modal-image-header">
                                    <img src={selectedBlog.thumbnail_path} alt={selectedBlog.title} />
                                </div>
                            )}

                            <div className="cf-modal-inner-padding">
                                <div className="cf-modal-badge-row">
                                    <span className="cf-modal-badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>{selectedBlog.category || 'Uncategorized'}</span>
                                    {selectedBlog.status === 'published' ? (
                                        <span className="cf-modal-badge" style={{ background: '#f0fdf4', color: '#166534' }}>Published</span>
                                    ) : (
                                        <span className="cf-modal-badge" style={{ background: '#fffbeb', color: '#92400e' }}>Draft</span>
                                    )}
                                </div>

                                <h2 className="cf-modal-title">{selectedBlog.title}</h2>

                                <div className="cf-modal-meta-row">
                                    <div className="cf-meta-item">
                                        <User size={18} />
                                        <span>{selectedBlog.author}</span>
                                    </div>
                                    <div className="cf-meta-item">
                                        <Calendar size={18} />
                                        <span>{selectedBlog.published_at ? new Date(selectedBlog.published_at).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="cf-meta-item">
                                        <FileText size={18} />
                                        <span>{selectedBlog.views || 0} Views</span>
                                    </div>
                                </div>

                                <div className="cf-modal-content-box">
                                    <span className="cf-section-label">Short Excerpt</span>
                                    <div className="cf-modal-excerpt">
                                        {selectedBlog.excerpt}
                                    </div>
                                </div>

                                <div className="cf-modal-content-box">
                                    <span className="cf-section-label">Full Article</span>
                                    <div className="cf-modal-full-content">
                                        {selectedBlog.content}
                                    </div>
                                </div>

                                {selectedBlog.tags && (
                                    <div className="cf-modal-tags-box">
                                        {selectedBlog.tags.split(',').map((tag: string, i: number) => (
                                            <span key={i} className="cf-tag-pill">#{tag.trim()}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="cf-modal-footer-actions">
                                    <Link href={`/admin/add-blog?id=${selectedBlog.id}`} className="cf-modal-primary-btn" style={{ textAlign: 'center', textDecoration: 'none' }}>
                                        Edit Post
                                    </Link>
                                    <button className="cf-modal-danger-btn" onClick={() => { handleDelete(selectedBlog); setSelectedBlog(null); }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
