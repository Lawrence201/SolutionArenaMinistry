'use client';

import { useEffect, useState } from 'react';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import DoughnutChart from './charts/DoughnutChart';
import { formatNumber, formatPercentage, formatDate, chartColors } from '@/lib/reportUtils';
import { exportCommunicationPDF } from '@/lib/exportPDF';
import { exportCommunicationExcel } from '@/lib/exportExcel';

export default function CommunicationAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCommunicationData();
        const interval = setInterval(loadCommunicationData, 30000);
        return () => clearInterval(interval);
    }, []);

    async function loadCommunicationData() {
        try {
            const response = await fetch('/api/reports/communication');
            const result = await response.json();
            if (result.success) setData(result.data);
        } catch (error) {
            console.error('Error loading communication analytics:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="loading-state">Loading communication analytics...</div>;
    if (!data) return <div className="error-state">Failed to load communication analytics</div>;

    const messageVolumeChart = {
        labels: data?.timeline?.slice(-14).map((t: any) => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
        datasets: [{
            label: 'Messages Sent',
            data: data?.timeline?.slice(-14).map((t: any) => t.messages) || [],
            borderColor: chartColors.primary,
            backgroundColor: `${chartColors.primary}20`,
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };

    const channelChart = {
        labels: Object.keys(data?.channel_distribution || {}),
        datasets: [{
            data: Object.values(data?.channel_distribution || {}) as number[],
            backgroundColor: [chartColors.primary, chartColors.success, chartColors.warning],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    const messageTypeChart = {
        labels: Object.keys(data?.by_type || {}),
        datasets: [{
            label: 'Message Count',
            data: Object.values(data?.by_type || {}) as number[],
            backgroundColor: [chartColors.primary, chartColors.success, chartColors.warning, chartColors.purple],
            borderRadius: 8,
            barThickness: 40
        }]
    };

    return (
        <div className="communication-analytics">
            {/* Export Buttons */}
            <div className="export-buttons">
                <button className="gen-btn gen-btn-pri" onClick={() => exportCommunicationPDF(data)}>
                    📄 Export PDF
                </button>
                <button className="gen-btn gen-btn-sec" onClick={() => exportCommunicationExcel(data)}>
                    📊 Export Excel
                </button>
            </div>

            {/* Main KPI Cards */}
            <div className="kpi-grid">
                <div className="met-card">
                    <div className="met-icon" style={{ backgroundColor: `${chartColors.primary}20`, color: chartColors.primary }}>✉️</div>
                    <div className="met-info">
                        <p className="met-label">Total Messages</p>
                        <h2 className="met-value">{formatNumber(data?.totals?.total_messages || 0)}</h2>
                        <p className={`tre-ind ${(data?.totals?.growth_rate || 0) >= 0 ? 'tre-up' : 'tre-down'}`}>
                            {(data?.totals?.growth_rate || 0) >= 0 ? '↑' : '↓'} {Math.abs(data?.totals?.growth_rate || 0)}%
                        </p>
                    </div>
                </div>

                <div className="met-card">
                    <div className="met-icon" style={{ backgroundColor: `${chartColors.success}20`, color: chartColors.success }}>📨</div>
                    <div className="met-info">
                        <p className="met-label">Avg Open Rate</p>
                        <h2 className="met-value">{formatPercentage(data?.totals?.avg_open_rate || 0)}</h2>
                    </div>
                </div>

                <div className="met-card">
                    <div className="met-icon" style={{ backgroundColor: `${chartColors.warning}20`, color: chartColors.warning }}>📥</div>
                    <div className="met-info">
                        <p className="met-label">Inbox Count</p>
                        <h2 className="met-value">{formatNumber(data?.totals?.inbox_count || 0)}</h2>
                    </div>
                </div>

                <div className="met-card">
                    <div className="met-icon" style={{ backgroundColor: `${chartColors.purple}20`, color: chartColors.purple }}>👥</div>
                    <div className="met-info">
                        <p className="met-label">Active Users</p>
                        <h2 className="met-value">{formatNumber(data?.totals?.active_users || 0)}</h2>
                    </div>
                </div>
            </div>

            {/* Secondary Metrics */}
            <div className="secondary-metrics">
                <div className="metric-item">
                    <p className="metric-label">Email Sent</p>
                    <p className="metric-value">{formatNumber(data?.totals?.email_sent || 0)}</p>
                </div>
                <div className="metric-item">
                    <p className="metric-label">SMS Sent</p>
                    <p className="metric-value">{formatNumber(data?.totals?.sms_sent || 0)}</p>
                </div>
                <div className="metric-item">
                    <p className="metric-label">Push Sent</p>
                    <p className="metric-value">{formatNumber(data?.totals?.push_sent || 0)}</p>
                </div>
                <div className="metric-item">
                    <p className="metric-label">Scheduled</p>
                    <p className="metric-value">{formatNumber(data?.totals?.scheduled_messages || 0)}</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                <div className="chart-box">
                    <h3 className="chart-title">Message Volume (Last 14 Days)</h3>
                    <LineChart data={messageVolumeChart} height={300} />
                </div>

                <div className="chart-box">
                    <h3 className="chart-title">Channel Distribution</h3>
                    <DoughnutChart data={channelChart} height={300} />
                </div>

                <div className="chart-box full-width">
                    <h3 className="chart-title">Message Type Breakdown</h3>
                    <BarChart data={messageTypeChart} height={300} />
                </div>
            </div>

            {/* Recent Messages Table */}
            <div className="table-container">
                <h3 className="section-title">Recent Messages</h3>
                <table className="dat-tab">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Audience</th>
                            <th>Channels</th>
                            <th>Sent At</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data?.recent_messages || []).length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    No messages sent yet
                                </td>
                            </tr>
                        ) : (
                            (data?.recent_messages || []).map((msg: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="tab-nam">{msg.title}</td>
                                    <td><span className="badg badg-inff">{msg.type}</span></td>
                                    <td>{msg.audience}</td>
                                    <td>{msg.channels}</td>
                                    <td>{formatDate(msg.sent_at)}</td>
                                    <td><span className="badg badg-succ">{msg.status}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
