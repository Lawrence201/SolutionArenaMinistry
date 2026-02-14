'use client';

import React, { useState, useEffect } from 'react';
import './sermons.css';
import { Search, Plus, Bot, X, Video, Music, FileText, TrendingUp, AlertCircle, Book, Calendar, Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { getSermons, deleteSermon, getSermonInsights } from '@/app/actions/sermons';
import SermonMetrics from './SermonMetrics';
import SermonSidebar from './SermonSidebar';
import SermonCard from './SermonCard';

export default function SermonsClient() {
    const [sermons, setSermons] = useState<any[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ total: 0, recent: 0, featured: 0, totalViews: 0 });
    const [quickStats, setQuickStats] = useState<any>({ mostViewed: '-', latestSpeaker: '-', avgDuration: 0 });
    const [insights, setInsights] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [view, setView] = useState<'all' | 'featured' | 'recent' | 'popular' | 'published' | 'draft'>('all');
    const [category, setCategory] = useState('all');
    const [currentSeries, setCurrentSeries] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('date-desc');

    const [selectedSermon, setSelectedSermon] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [view, category, currentSeries, sort]);

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
        const result = await getSermons({ view, category, series: currentSeries, search });
        if (result.success && result.stats) {
            setSermons(result.data || []);
            setSeries(result.series || []);
            setStats(result.stats);
            setQuickStats({
                mostViewed: result.stats.mostViewed,
                latestSpeaker: result.stats.latestSpeaker,
                avgDuration: result.stats.avgDuration
            });
        }
        setIsLoading(false);
    }

    async function loadInsights() {
        const result = await getSermonInsights();
        if (result.success) {
            setInsights(result.data || []);
        }
    }

    async function handleDelete(sermon: any) {
        if (confirm(`Are you sure you want to delete this sermon?\n\nTitle: ${sermon.sermon_title}\nSpeaker: ${sermon.sermon_speaker}\n\nThis action cannot be undone.`)) {
            const result = await deleteSermon(sermon.id);
            if (result.success) {
                loadData();
            } else {
                alert('Failed to delete sermon');
            }
        }
    }

    const getInsightIcon = (iconName: string) => {
        switch (iconName) {
            case 'trending-up': return <TrendingUp size={20} />;
            case 'alert-circle': return <AlertCircle size={20} />;
            case 'book': return <Book size={20} />;
            case 'video': return <Video size={20} />;
            case 'calendar': return <Calendar size={20} />;
            case 'star': return <Star size={20} />;
            default: return <TrendingUp size={20} />;
        }
    };

    return (
        <div className="admin-sermons-page">
            <div className="cf-em-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div className="cf-em-header-content">
                    <h1>Sermons</h1>
                    <p>Plan, organize, and track all church sermons and activities</p>
                </div>
                <div className="cf-em-header-actions">
                    <Link href="/admin/add-sermon" className="cf-em-btn cf-em-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
                        <Plus size={20} />
                        <span>New Sermon</span>
                    </Link>
                </div>
            </div>

            {/* AI Insights - Refined with Chatbot Image */}
            <div className="insights-section" style={{ marginBottom: '32px', background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
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
                            No insights available - add more sermon data to see AI insights
                        </div>
                    )}
                </div>
            </div>

            <SermonMetrics stats={stats} />

            <div className="cf-sermon-content-grid">
                <SermonSidebar
                    series={series}
                    currentSeries={currentSeries}
                    onSeriesChange={setCurrentSeries}
                    currentCategory={category}
                    onCategoryChange={setCategory}
                    quickStats={quickStats}
                />

                <div className="cf-sermons-main-section">
                    <div className="cf-sermons-controls">
                        <div className="cf-sermon-tabs">
                            <button className={`cf-sermon-tab ${view === 'all' ? 'cf-sermon-active' : ''}`} onClick={() => setView('all')}>All Sermons</button>
                            <button className={`cf-sermon-tab ${view === 'featured' ? 'cf-sermon-active' : ''}`} onClick={() => setView('featured')}>Featured</button>
                            <button className={`cf-sermon-tab ${view === 'recent' ? 'cf-sermon-active' : ''}`} onClick={() => setView('recent')}>Recent</button>
                            <button className={`cf-sermon-tab ${view === 'popular' ? 'cf-sermon-active' : ''}`} onClick={() => setView('popular')}>Popular</button>
                        </div>

                        <div className="cf-sermon-search-bar">
                            <span className="cf-sermon-search-icon">
                                <Search size={18} />
                            </span>
                            <input
                                type="text"
                                className="cf-sermon-search-input"
                                placeholder="Search sermons..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select className="cf-sermon-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="title">Title (A-Z)</option>
                            <option value="views">Most Viewed</option>
                        </select>
                    </div>

                    <div className="cf-sermon-list">
                        {isLoading ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading...</div>
                        ) : sermons.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No sermons found.</div>
                        ) : (
                            sermons.map(sermon => (
                                <SermonCard
                                    key={sermon.id}
                                    sermon={sermon}
                                    onView={() => setSelectedSermon(sermon)}
                                    onDelete={() => handleDelete(sermon)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Professional Legacy View Modal */}
            {selectedSermon && (
                <div className="cf-modal-overlay" onClick={() => setSelectedSermon(null)}>
                    <div className="cf-modal-container cf-sermon-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="cf-modal-close" onClick={() => setSelectedSermon(null)}>
                            <X size={24} />
                        </button>

                        <div className="cf-modal-scrollable-content">
                            {/* Image Header */}
                            {selectedSermon.sermon_image && (
                                <div className="cf-modal-image-header">
                                    <img
                                        src={selectedSermon.sermon_image}
                                        alt={selectedSermon.sermon_title}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            <div className="cf-modal-inner-padding">
                                <h2 className="cf-modal-title">{selectedSermon.sermon_title}</h2>

                                {/* Metadata Grid */}
                                <div className="cf-modal-meta-grid">
                                    <div className="cf-meta-tile cf-tile-speaker">
                                        <span className="cf-tile-label">Speaker</span>
                                        <span className="cf-tile-value">{selectedSermon.sermon_speaker}</span>
                                    </div>
                                    <div className="cf-meta-tile cf-tile-date">
                                        <span className="cf-tile-label">Date</span>
                                        <span className="cf-tile-value">
                                            {new Date(selectedSermon.sermon_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="cf-meta-tile cf-tile-duration">
                                        <span className="cf-tile-label">Duration</span>
                                        <span className="cf-tile-value">
                                            {selectedSermon.sermon_duration || 'N/A'} {selectedSermon.sermon_duration ? 'min' : ''}
                                        </span>
                                    </div>
                                    <div className="cf-meta-tile cf-tile-series">
                                        <span className="cf-tile-label">Series</span>
                                        <span className="cf-tile-value">{selectedSermon.sermon_series || 'N/A'}</span>
                                    </div>
                                    <div className="cf-meta-tile cf-tile-category">
                                        <span className="cf-tile-label">Category</span>
                                        <span className="cf-tile-value">
                                            {selectedSermon.sermon_category ? selectedSermon.sermon_category.replace('-', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase()) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="cf-meta-tile cf-tile-views">
                                        <span className="cf-tile-label">Views</span>
                                        <span className="cf-tile-value">{selectedSermon.view_count || 0}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="cf-modal-description-box">
                                    <span className="cf-tile-label">Description</span>
                                    <p>{selectedSermon.sermon_description}</p>
                                </div>

                                {/* Media Assets */}
                                {(selectedSermon.video_file || selectedSermon.audio_file || selectedSermon.pdf_file) && (
                                    <div className="cf-modal-media-section">
                                        <p className="cf-media-section-title">
                                            <Video size={16} />
                                            Available Media
                                        </p>
                                        <div className="cf-media-buttons-row">
                                            {selectedSermon.video_file && (
                                                <a href={selectedSermon.video_file} target="_blank" rel="noopener noreferrer" className="cf-media-link-btn cf-btn-video">
                                                    <Video size={16} /> Watch Video
                                                </a>
                                            )}
                                            {selectedSermon.audio_file && (
                                                <a href={selectedSermon.audio_file} target="_blank" rel="noopener noreferrer" className="cf-media-link-btn cf-btn-audio">
                                                    <Music size={16} /> Play Audio
                                                </a>
                                            )}
                                            {selectedSermon.pdf_file && (
                                                <a href={selectedSermon.pdf_file} target="_blank" rel="noopener noreferrer" className="cf-media-link-btn cf-btn-pdf">
                                                    <FileText size={16} /> Download PDF
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
