import React from 'react';
import { Square, Type, Book, Users, Star } from 'lucide-react';

interface SermonSidebarProps {
    series: { name: string; count: number }[];
    currentSeries: string;
    onSeriesChange: (series: string) => void;
    currentCategory: string;
    onCategoryChange: (category: string) => void;
    quickStats: {
        mostViewed: string;
        latestSpeaker: string;
        avgDuration: number;
    };
}

export default function SermonSidebar({
    series,
    currentSeries,
    onSeriesChange,
    currentCategory,
    onCategoryChange,
    quickStats
}: SermonSidebarProps) {
    const categories = [
        { id: 'all', name: 'All', icon: <Square size={16} /> },
        { id: 'sunday-service', name: 'Sunday Service', icon: <Type size={16} /> },
        { id: 'bible-study', name: 'Bible Study', icon: <Book size={16} /> },
        { id: 'conference', name: 'Conference', icon: <Users size={16} /> },
        { id: 'special-event', name: 'Special Event', icon: <Star size={16} /> },
    ];

    return (
        <div className="cf-sermon-sidebar-section">
            <div className="cf-sermon-series-card">
                <div className="cf-sermon-series-header">
                    <h2>Sermon Series</h2>
                    <p>Browse by series</p>
                </div>
                <div className="cf-sermon-series-list">
                    <div
                        className={`cf-series-item ${currentSeries === 'all' ? 'cf-series-active' : ''}`}
                        onClick={() => onSeriesChange('all')}
                    >
                        <div className="cf-series-dot"></div>
                        <div className="cf-series-info">
                            <span className="cf-series-name">All Sermons</span>
                        </div>
                    </div>
                    {series.map((s, idx) => (
                        <div
                            key={idx}
                            className={`cf-series-item ${currentSeries === s.name ? 'cf-series-active' : ''}`}
                            onClick={() => onSeriesChange(s.name)}
                        >
                            <div className="cf-series-dot"></div>
                            <div className="cf-series-info">
                                <span className="cf-series-name">{s.name}</span>
                                <span className="cf-series-count">{s.count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cf-sermon-filter-card">
                <h3>Filter by Category</h3>
                <div className="cf-category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`cf-category-btn ${currentCategory === cat.id ? 'cf-category-active' : ''}`}
                            onClick={() => onCategoryChange(cat.id)}
                        >
                            {cat.icon}
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="cf-sermon-stats-card">
                <h3>Quick Stats</h3>
                <div className="cf-stat-item">
                    <span className="cf-stat-label">Most Viewed</span>
                    <span className="cf-stat-value">{quickStats.mostViewed}</span>
                </div>
                <div className="cf-stat-item">
                    <span className="cf-stat-label">Latest Speaker</span>
                    <span className="cf-stat-value">{quickStats.latestSpeaker}</span>
                </div>
                <div className="cf-stat-item">
                    <span className="cf-stat-label">Avg. Duration</span>
                    <span className="cf-stat-value">{quickStats.avgDuration} min</span>
                </div>
            </div>
        </div>
    );
}
