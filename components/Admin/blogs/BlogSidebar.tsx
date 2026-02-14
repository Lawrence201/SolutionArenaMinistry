'use client';

import React from 'react';

interface BlogSidebarProps {
    series: any[];
    currentSeries: string;
    onSeriesChange: (series: string) => void;
    quickStats: {
        latestAuthor: string;
        postsThisMonth: number;
        mostPopular?: string;
    };
}

export default function BlogSidebar({ series, currentSeries, onSeriesChange, quickStats }: BlogSidebarProps) {
    return (
        <div className="cf-blog-sidebar">
            <div className="cf-sidebar-card">
                <h2 className="cf-sidebar-title">Blog Categories</h2>
                <p className="cf-sidebar-subtitle">Browse by category</p>

                <div className="cf-category-list">
                    <div
                        className={`cf-category-item ${currentSeries === 'all' ? 'active' : ''}`}
                        onClick={() => onSeriesChange('all')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="cf-category-dot"></div>
                            <span>All Posts</span>
                        </div>
                        <span className="cf-count-pill">{series.reduce((acc, s) => acc + s.count, 0)}</span>
                    </div>
                    {series.map((s, idx) => (
                        <div
                            key={idx}
                            className={`cf-category-item ${currentSeries === s.name ? 'active' : ''}`}
                            onClick={() => onSeriesChange(s.name)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="cf-category-dot"></div>
                                <span>{s.name}</span>
                            </div>
                            <span className="cf-count-pill">{s.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cf-sidebar-card">
                <h2 className="cf-sidebar-title">Quick Stats</h2>
                <div style={{ marginTop: '20px' }}>
                    <div className="cf-quick-stats-row">
                        <span className="cf-stat-label">Most Popular</span>
                        <span className="cf-stat-value">{quickStats.mostPopular || 'No featured posts yet'}</span>
                    </div>
                    <div className="cf-quick-stats-row">
                        <span className="cf-stat-label">Latest Author</span>
                        <span className="cf-stat-value">{quickStats.latestAuthor}</span>
                    </div>
                    <div className="cf-quick-stats-row">
                        <span className="cf-stat-label">This Month</span>
                        <span className="cf-stat-value">{quickStats.postsThisMonth} posts</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
