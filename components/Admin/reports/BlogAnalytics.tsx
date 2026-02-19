'use client';

import { useState, useEffect } from 'react';
import LineChart from './charts/LineChart';
import DoughnutChart from './charts/DoughnutChart';
import BarChart from './charts/BarChart';

export default function BlogAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const response = await fetch('/api/reports/blogs');
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error loading blog analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="blog-analytics" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                Loading blog analytics...
            </div>
        );
    }

    if (!data) return <div className="error-state">Failed to load blog analytics</div>;

    const trendData = {
        labels: data.monthly_trends.map((t: any) => t.month),
        datasets: [{
            label: 'Monthly Posts',
            data: data.monthly_trends.map((t: any) => t.count),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const categoryData = {
        labels: data.category_distribution.map((c: any) => c.name),
        datasets: [{
            data: data.category_distribution.map((c: any) => c.count),
            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b'],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    const statusData = {
        labels: data.status_distribution.map((s: any) => s.name),
        datasets: [{
            data: data.status_distribution.map((s: any) => s.count),
            backgroundColor: ['#10b981', '#f59e0b'],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    const authorData = {
        labels: data.top_authors.map((a: any) => a.name),
        datasets: [{
            label: 'Posts',
            data: data.top_authors.map((a: any) => a.posts),
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: '#667eea',
            borderWidth: 1,
            borderRadius: 6
        }]
    };

    return (
        <div className="blog-analytics">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: 0 }}>Blog Analytics</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Content performance insights • <span style={{ color: '#10b981' }}>Auto-updating every 30s</span></p>
                </div>
            </div>

            {/* Primary Metrics */}
            <div className="sum-grid">
                <div className="sum-card">
                    <div className="sum-lab">TOTAL BLOG POSTS</div>
                    <div className="sum-val" style={{ color: '#667eea' }}>{data.total_posts}</div>
                    <div className="sum-chan">All time</div>
                </div>
                <div className="sum-card">
                    <div className="sum-lab">PUBLISHED</div>
                    <div className="sum-val" style={{ color: '#10b981' }}>{data.published_posts}</div>
                    <div className="sum-chan">Live posts</div>
                </div>
                <div className="sum-card">
                    <div className="sum-lab">DRAFTS</div>
                    <div className="sum-val" style={{ color: '#f59e0b' }}>{data.draft_posts}</div>
                    <div className="sum-chan">Pending review</div>
                </div>
                <div className="sum-card">
                    <div className="sum-lab">FEATURED</div>
                    <div className="sum-val" style={{ color: '#8b5cf6' }}>{data.featured_posts}</div>
                    <div className="sum-chan">Highlighted posts</div>
                </div>
            </div>

            {/* Secondary Metrics */}
            <div className="sum-grid" style={{ marginTop: '24px' }}>
                <div className="sum-card">
                    <div className="sum-lab">POSTS THIS MONTH</div>
                    <div className="sum-val">{data.posts_this_month}</div>
                    <div className="sum-chan" style={{ color: data.month_growth >= 0 ? '#10b981' : '#ef4444' }}>
                        {data.month_growth >= 0 ? '↑' : '↓'} {Math.abs(data.month_growth)}% vs last month
                    </div>
                </div>
                <div className="sum-card">
                    <div className="sum-lab">CATEGORIES</div>
                    <div className="sum-val">{data.total_categories}</div>
                    <div className="sum-chan">Active categories</div>
                </div>
                <div className="sum-card">
                    <div className="sum-lab">AUTHORS</div>
                    <div className="sum-val">{data.total_authors}</div>
                    <div className="sum-chan">Contributors</div>
                </div>
                <div className="sum-card">
                    <div className="sum-lab">AVG/MONTH</div>
                    <div className="sum-val">{data.avg_posts_per_month}</div>
                    <div className="sum-chan">Average posts</div>
                </div>
            </div>

            {/* Charts Row 1: Monthly Trend */}
            <div className="sum-card" style={{ marginTop: '32px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>Monthly Posting Trends</h3>
                <div style={{ height: '300px' }}>
                    <LineChart data={trendData} height={300} />
                </div>
            </div>

            {/* Charts Row 2: Category & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
                <div className="sum-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>Category Distribution</h3>
                    <div style={{ height: '280px' }}>
                        <DoughnutChart data={categoryData} height={280} options={{ plugins: { legend: { position: 'right' } } }} />
                    </div>
                </div>
                <div className="sum-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>Status Breakdown</h3>
                    <div style={{ height: '280px' }}>
                        <DoughnutChart data={statusData} height={280} options={{ plugins: { legend: { position: 'right' } } }} />
                    </div>
                </div>
            </div>

            {/* Charts Row 3: Top Contributors */}
            <div className="sum-card" style={{ marginTop: '24px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>Top Contributors</h3>
                <div style={{ height: '250px' }}>
                    <BarChart data={authorData} height={250} options={{ indexAxis: 'y', plugins: { legend: { display: false } } }} />
                </div>
            </div>

            {/* Recent Posts Table */}
            <div className="sum-card" style={{ marginTop: '32px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '24px' }}>Recent Blog Posts</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Title</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Author</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Category</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recent_posts.map((post: any) => (
                                <tr key={post.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>
                                        {post.title}
                                        {post.is_featured && <span style={{ marginLeft: '8px', padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '10px' }}>FEATURED</span>}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{post.author}</td>
                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                        <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>{post.category}</span>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            background: post.status === 'published' ? '#dcfce7' : '#fef3c7',
                                            color: post.status === 'published' ? '#166534' : '#92400e'
                                        }}>
                                            {post.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{post.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
