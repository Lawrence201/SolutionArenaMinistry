import React from 'react';
import { BookOpen, Calendar, Award, TrendingUp } from 'lucide-react';

interface SermonMetricsProps {
    stats: {
        total: number;
        recent: number;
        featured: number;
        totalViews: number;
    };
}

export default function SermonMetrics({ stats }: SermonMetricsProps) {
    // Add defensive check for toLocaleString
    const formattedViews = (stats?.totalViews || 0).toLocaleString();

    return (
        <div className="cf-sermon-metrics-container">
            <div className="cf-sermon-metric-card">
                <div className="cf-metric-icon cf-metric-total">
                    <BookOpen size={28} />
                </div>
                <div className="cf-metric-content">
                    <h3>{stats?.total || 0}</h3>
                    <p>Total Sermons</p>
                    <span className="cf-metric-badge cf-badge-total">All Time</span>
                </div>
            </div>

            <div className="cf-sermon-metric-card">
                <div className="cf-metric-icon cf-metric-recent">
                    <Calendar size={28} />
                </div>
                <div className="cf-metric-content">
                    <h3>{stats?.recent || 0}</h3>
                    <p>Recent Sermons</p>
                    <span className="cf-metric-badge cf-badge-recent">Last 30 Days</span>
                </div>
            </div>

            <div className="cf-sermon-metric-card">
                <div className="cf-metric-icon cf-metric-featured">
                    <Award size={28} />
                </div>
                <div className="cf-metric-content">
                    <h3>{stats?.featured || 0}</h3>
                    <p>Featured</p>
                    <span className="cf-metric-badge cf-badge-featured">Highlighted</span>
                </div>
            </div>

            <div className="cf-sermon-metric-card">
                <div className="cf-metric-icon cf-metric-views">
                    <TrendingUp size={28} />
                </div>
                <div className="cf-metric-content">
                    <h3>{formattedViews}</h3>
                    <p>Total Views</p>
                    <span className="cf-metric-badge cf-badge-views">Engagement</span>
                </div>
            </div>
        </div>
    );
}
