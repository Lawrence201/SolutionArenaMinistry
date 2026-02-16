'use client';

import { useEffect, useState } from 'react';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import DoughnutChart from './charts/DoughnutChart';
import { formatNumber, formatCurrency, formatPercentage, chartColors, getHealthColor } from '@/lib/reportUtils';
import { exportFinancePDF } from '@/lib/exportPDF';
import { exportFinanceExcel } from '@/lib/exportExcel';

export default function FinancialAnalytics() {
    const [data, setData] = useState<any>(null);
    const [extendedData, setExtendedData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFinancialData();
        const interval = setInterval(loadFinancialData, 30000);
        return () => clearInterval(interval);
    }, []);

    async function loadFinancialData() {
        try {
            const [baseRes, extRes] = await Promise.all([
                fetch('/api/reports/financial?type=all&range=all'),
                fetch('/api/reports/financial?type=extended')
            ]);
            const baseResult = await baseRes.json();
            const extResult = await extRes.json();
            if (baseResult.success) setData(baseResult.data);
            if (extResult.success) setExtendedData(extResult.data);
        } catch (error) {
            console.error('Error loading financial analytics:', error);
        } finally {
            setLoading(false);
        }
    }

    const formatShortVal = (val: number) => {
        if (!val) return '₵0.00';
        if (val >= 1000000) return `₵${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `₵${(val / 1000).toFixed(1)}K`;
        return `₵${val.toFixed(2)}`;
    };

    if (loading && !data) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Advanced Intelligence Dashboard...</div>;
    if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>Failed to load financial data.</div>;

    return (
        <div className="financial-analytics">
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: 'white' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 20, height: 20 }}>
                                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </span>
                        Advanced Financial Intelligence Dashboard
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
                        <span>AI-Powered Analytics</span> • <span>Predictive Forecasting</span> • <span>Real-Time Insights</span> •
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                            <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }}></span>
                            Auto-updating every 30s
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => exportFinancePDF(data)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Export PDF
                    </button>
                    <button onClick={() => exportFinanceExcel(data)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="8" y1="11" x2="16" y2="11"></line>
                            <line x1="8" y1="15" x2="16" y2="15"></line>
                        </svg>
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Primary Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                <div className="sum-card" style={{ borderTop: '4px solid #3b82f6', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}>
                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        Net Income
                    </div>
                    <div style={{ fontSize: '42px', fontWeight: 700, color: '#1e293b' }}>{formatShortVal(data.total_income)}</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>All Income Sources (All Time)</div>
                </div>

                <div className="sum-card" style={{ borderTop: '4px solid #f97316', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f97316', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}>
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                        Net Expenses
                    </div>
                    <div style={{ fontSize: '42px', fontWeight: 700, color: '#1e293b' }}>{formatShortVal(data.total_expenses)}</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Expenses + Withdrawals</div>
                </div>

                <div className="sum-card" style={{ borderTop: '4px solid #22c55e', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22c55e', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}>
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        Net Balance
                    </div>
                    <div style={{ fontSize: '42px', fontWeight: 700, color: '#1e293b' }}>{formatShortVal(data.net_income)}</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Available Balance</div>
                </div>
            </div>

            {/* Secondary Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div className="sum-card" style={{ borderLeft: '4px solid #3b82f6', background: 'white', padding: '20px', borderRadius: '12px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        YoY Income Growth
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>
                        {Number(data.yoy_growth) >= 0 ? '+' : ''}{data.yoy_growth}%
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12 }}>
                            <polyline points="7 13 12 18 17 13"></polyline>
                            <polyline points="7 6 12 11 17 6"></polyline>
                        </svg>
                        91.3%
                    </div>
                    <div style={{
                        position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                        background: '#1e293b', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                        fontWeight: 600, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10, visibility: 'hidden'
                    }} className="chart-tooltip">
                        This Year: {formatCurrency(data.this_year_income)} | Last Year: {formatCurrency(data.last_year_income)}
                    </div>
                </div>

                <div className="sum-card" style={{ borderLeft: '4px solid #3b82f6', background: 'white', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                        Secondary Trend
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>+0%</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#10b981', marginTop: '4px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12 }}>
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                        94.3%
                    </div>
                </div>

                <div className="sum-card" style={{ borderLeft: '4px solid #3b82f6', background: 'white', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Financial Health Score
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#ef4444' }}>{data.financial_health}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>out of 100</div>
                </div>

                <div className="sum-card" style={{ borderLeft: '4px solid #3b82f6', background: 'white', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 6v6l4 2"></path>
                        </svg>
                        Expense Ratio
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>{data.expense_ratio}%</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>of total income</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '30px' }}>
                {/* Top Contributors */}
                <div className="sum-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Top 10 Contributors</h3>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>Current year performance</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Rank</th>
                                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Member Name</th>
                                <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Total Contribution</th>
                                <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(extendedData?.top_contributors || []).map((m: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: idx === 9 ? 'none' : '1px solid #f8fafc' }}>
                                    <td style={{ padding: '14px 0', fontSize: '14px', color: idx < 3 ? '#3b82f6' : '#64748b', fontWeight: idx < 3 ? 700 : 500 }}>
                                        {idx === 0 ? '1st' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : `${idx + 1}th`}
                                    </td>
                                    <td style={{ padding: '14px 0', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{m.name}</td>
                                    <td style={{ padding: '14px 0', fontSize: '14px', color: '#0ea5e9', fontWeight: 700, textAlign: 'right' }}>₵{m.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '14px 0', textAlign: 'center' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>{m.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Donor Retention */}
                <div className="sum-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Donor Retention</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', color: '#64748b' }}>New Members</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>{extendedData?.retention?.new || 0}</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                                <div style={{ height: '100%', width: `${((extendedData?.retention?.new || 0) / (extendedData?.retention?.participating || 1) * 100).toFixed(0)}%`, background: '#3b82f6', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', color: '#64748b' }}>Participating</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{extendedData?.retention?.participating || 0}</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                                <div style={{ height: '100%', width: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', color: '#64748b' }}>Lapsed</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>{extendedData?.retention?.lapsed || 0}</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                                <div style={{ height: '100%', width: `${((extendedData?.retention?.lapsed || 0) / ((extendedData?.retention?.participating || 0) + (extendedData?.retention?.lapsed || 1)) * 100).toFixed(0)}%`, background: '#ef4444', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Predictive Analytics Section */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Predictive Analytics & Forecasting</h2>
                <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px' }}>AI-powered financial predictions and trend analysis</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {/* Cashflow Analysis */}
                    <div className="sum-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Cashflow Analysis</h4>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>Operating • Investing • Financing</div>
                        <div style={{ display: 'flex', gap: '4px', height: '24px', marginBottom: '16px' }}>
                            <div style={{ width: '70%', background: '#3b82f6', borderRadius: '4px' }} title="Operating: 70%"></div>
                            <div style={{ width: '20%', background: '#10b981', borderRadius: '4px' }} title="Investing: 20%"></div>
                            <div style={{ width: '10%', background: '#f59e0b', borderRadius: '4px' }} title="Financing: 10%"></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#1e293b', fontWeight: 650 }}>Healthy Flow</span>
                            <span style={{ color: '#10b981', fontWeight: 700 }}>+₵{((data.total_income * 0.7)).toFixed(0)}</span>
                        </div>
                    </div>

                    {/* 3-Month Forecast */}
                    <div className="sum-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>3-Month Forecast</h4>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>AI-powered predictive analysis</div>
                        <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                            {(extendedData?.forecast || []).map((f: any, idx: number) => (
                                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '100%', height: `${(f.predicted_income / 500000 * 100).toFixed(0)}%`, background: '#cbd5e1', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                                        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '80%', background: '#3b82f6', borderRadius: '4px 4px 0 0' }}></div>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>{f.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Budget Utilization */}
                    <div className="sum-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Budget Utilization</h4>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>Real-time budget tracking</div>
                        <div style={{ position: 'relative', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', zIndex: 2 }}>
                                {((data.total_expenses / (extendedData?.budget_utilization || 1)) * 100).toFixed(1)}%
                            </div>
                            <svg style={{ position: 'absolute', width: '80px', height: '80px', transform: 'rotate(-90deg)' }}>
                                <circle cx="40" cy="40" r="35" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                <circle cx="40" cy="40" r="35" fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray="220" strokeDashoffset={220 - (220 * (data.total_expenses / (extendedData?.budget_utilization || 1)))} />
                            </svg>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                    <div className="sum-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Year-over-Year Comparison</h4>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>This Year vs Last Year</div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: Number(data.yoy_growth) >= 0 ? '#10b981' : '#ef4444' }}>
                            {Number(data.yoy_growth) >= 0 ? '+' : ''}{data.yoy_growth}%
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Revenue delta analysis</div>
                    </div>

                    <div className="sum-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Expense Distribution</h4>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>Category breakdown analysis</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></div>
                                <span style={{ fontSize: '13px', color: '#1e293b' }}>Welfare (15%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }}></div>
                                <span style={{ fontSize: '13px', color: '#1e293b' }}>Operational (85%)</span>
                            </div>
                        </div>
                    </div>

                    <div className="sum-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, opacity: 0.8, marginBottom: '4px' }}>Predictive Insight</div>
                            <div style={{ fontSize: '13px', opacity: 0.9 }}>"Income is projected to hit ₵{(extendedData?.forecast?.[2]?.predicted_income || 0).toFixed(0)} by next quarter."</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="sum-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Finance Overview</h3>
                    <div style={{ height: '300px' }}>
                        <DoughnutChart data={{
                            labels: ['Offerings', 'Tithes', 'Project', 'Welfare', 'Expenses'],
                            datasets: [{
                                data: [data.offerings, data.tithes, data.project_offerings, data.welfare, data.expenses],
                                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
                                borderWidth: 2,
                                borderColor: 'white'
                            }]
                        }} height={300} />
                    </div>
                </div>

                <div className="sum-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Monthly Trends</h3>
                    <div style={{ height: '300px' }}>
                        <LineChart data={{
                            labels: data.monthly_trends?.map((t: any) => t.month),
                            datasets: [
                                { label: 'Income', data: data.monthly_trends?.map((t: any) => t.income), borderColor: '#10b981', backgroundColor: '#10b98120', tension: 0.4, fill: true },
                                { label: 'Expenses', data: data.monthly_trends?.map((t: any) => t.expenses), borderColor: '#ef4444', backgroundColor: '#ef444420', tension: 0.4, fill: true }
                            ]
                        }} height={300} />
                    </div>
                </div>
            </div>

            <style jsx>{`
                .sum-card:hover .chart-tooltip {
                    visibility: visible !important;
                }
            `}</style>
        </div>
    );
}
