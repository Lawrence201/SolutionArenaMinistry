'use client';
import { useState, useEffect, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

interface Transaction {
    id: string;
    transaction_id: string;
    date: string;
    type: string;
    member?: string;
    description?: string;
    category: string;
    amount: number;
}

interface Trend {
    month: string;
    income: number;
    expenses: number;
    balance: number;
}

interface FinanceCategory {
    name: string;
    value: number;
    color: string;
}

interface OverviewData {
    summary: {
        total_income: number;
        total_expenses: number;
        net_balance: number;
        recent_transactions_count: number;
    };
    trends: Trend[];
    categories: FinanceCategory[];
    recent_transactions: Transaction[];
}

export default function OverviewTab() {
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        try {
            const res = await fetch('/api/finance/overview?range=month');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error('Error fetching overview:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const isIncomeType = (type: string) => {
        return ['Offering', 'Tithe', 'Project Offering', 'Welfare'].includes(type);
    };

    // --- Line Chart Logic ---
    const lineChartPoints = useMemo(() => {
        if (!data?.trends || data.trends.length === 0) return null;

        const chartHeight = 250;
        const chartPadding = 30;
        const xPositions = [150, 250, 350, 450, 550, 650];

        const allValues = data.trends.flatMap(t => [Math.abs(t.income), Math.abs(t.expenses), Math.abs(t.balance)]);
        const maxValue = Math.max(...allValues, 100);

        // Legacy-style scaling with 5 intervals
        const intervals = 5;
        const rawStep = maxValue / intervals;

        // Find a clean step (e.g., multiples of 1k, 2k, 5k, 10k, 20k, 50k)
        let step = 1000;
        if (rawStep > 10000) step = Math.ceil(rawStep / 10000) * 10000;
        else if (rawStep > 5000) step = Math.ceil(rawStep / 5000) * 5000;
        else if (rawStep > 1000) step = Math.ceil(rawStep / 1000) * 1000;
        else step = Math.ceil(rawStep / 500) * 500;

        // Match user's specific requirement for 34k steps when max is ~160k
        if (maxValue > 136000 && maxValue <= 170000) step = 34000;

        const roundedMax = step * intervals;

        const incomePoints: string[] = [];
        const expensePoints: string[] = [];
        const balancePoints: string[] = [];
        const pointsData: any[] = [];

        data.trends.forEach((t, i) => {
            const x = xPositions[i] || 0;
            const incomeY = chartHeight - ((Math.max(t.income, 0) / roundedMax) * (chartHeight - chartPadding)) + 20;
            const expenseY = chartHeight - ((Math.max(t.expenses, 0) / roundedMax) * (chartHeight - chartPadding)) + 20;
            const balanceY = chartHeight - ((Math.max(t.balance, 0) / roundedMax) * (chartHeight - chartPadding)) + 20;

            incomePoints.push(`${x},${incomeY}`);
            expensePoints.push(`${x},${expenseY}`);
            balancePoints.push(`${x},${balanceY}`);

            pointsData.push({ x, incomeY, expenseY, balanceY, ...t });
        });

        const yAxisLabels = [0, 1, 2, 3, 4, 5].map(i => {
            const val = step * (5 - i);
            if (val === 0) return '';
            return val >= 1000 ? `₵${(val / 1000).toFixed(0)}k` : `₵${val.toFixed(0)}`;
        });

        return {
            incomePoints: incomePoints.join(' '),
            expensePoints: expensePoints.join(' '),
            balancePoints: balancePoints.join(' '),
            pointsData,
            yAxisLabels,
            roundedMax
        };
    }, [data?.trends]);

    // --- Pie Chart Logic ---
    const pieData = useMemo(() => {
        if (!data?.categories || data.categories.length === 0) return null;
        const hasData = data.categories.some(c => c.value > 0);
        if (!hasData) return null;

        return {
            labels: data.categories.map(c => c.name),
            datasets: [{
                data: data.categories.map(c => c.value),
                backgroundColor: data.categories.map(c => c.color),
                borderWidth: 0,
            }]
        };
    }, [data?.categories]);

    const pieOptions = {
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const value = context.raw;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${context.label}: ₵${value.toLocaleString()} (${percentage}%)`;
                    }
                }
            }
        },
        maintainAspectRatio: false,
        responsive: true,
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading overview charts...</div>;

    return (
        <div className="qery_contentarea">
            {/* Charts Section */}
            <section className="vorp_chartsarea">
                <div className="zorp_container">
                    <div className="vorp_chartsgrid">
                        {/* Financial Trends Chart */}
                        <div className="vorp_chartcard">
                            <h3>Financial Trends (6 Months)</h3>
                            <div className="vorp_chartcont">
                                {lineChartPoints && (
                                    <svg className="vorp_chartsvg" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid meet">
                                        {/* Y-axis labels */}
                                        {lineChartPoints.yAxisLabels.map((lab, i) => (
                                            <text key={i} x="40" y={25 + i * 51} className="vorp_axislab">{lab}</text>
                                        ))}

                                        {/* X-axis labels */}
                                        {data?.trends.map((t, i) => (
                                            <text key={i} x={150 + i * 100} y="295" className="vorp_axislab" textAnchor="middle">{t.month}</text>
                                        ))}

                                        {/* Grid lines */}
                                        {[0, 1, 2, 3, 4, 5].map(i => (
                                            <line key={i} x1="100" y1={20 + i * 52} x2="780" y2={20 + i * 52} stroke="#F3F4F6" strokeWidth="1" />
                                        ))}
                                        {[0, 1, 2, 3, 4, 5].map(i => (
                                            <line key={i} x1={150 + i * 100} y1="25" x2={150 + i * 100} y2="280" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                                        ))}

                                        {/* Hover Line */}
                                        {hoveredPoint && (
                                            <line x1={hoveredPoint.x} y1="25" x2={hoveredPoint.x} y2="280" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="6,3" />
                                        )}

                                        {/* Data Lines - Changed order for visibility (Income on top) */}
                                        <polyline className="vorp_line expense" points={lineChartPoints.expensePoints} fill="none" stroke="#EF4444" strokeWidth="2.5" />
                                        <polyline className="vorp_line balance" points={lineChartPoints.balancePoints} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
                                        <polyline className="vorp_line income" points={lineChartPoints.incomePoints} fill="none" stroke="#10B981" strokeWidth="3.5" />

                                        {/* Data Dots with hover triggers */}
                                        {lineChartPoints.pointsData.map((pt, i) => (
                                            <g key={i} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                                                <circle className="vorp_dot" cx={pt.x} cy={pt.incomeY} r="4" fill="white" stroke="#10B981" strokeWidth="2.5" />
                                                <circle className="vorp_dot" cx={pt.x} cy={pt.balanceY} r="4" fill="white" stroke="#3B82F6" strokeWidth="2.5" />
                                                <circle className="vorp_dot" cx={pt.x} cy={pt.expenseY} r="4" fill="white" stroke="#EF4444" strokeWidth="2.5" />
                                                {/* Invisible larger hit area */}
                                                <rect x={pt.x - 20} y="25" width="40" height="255" fill="transparent" style={{ cursor: 'pointer' }} />
                                            </g>
                                        ))}
                                    </svg>
                                )}

                                {/* Legend */}
                                <div className="vorp_chartleg">
                                    <div className="vorp_legitem"><span className="vorp_legdot green"></span><span>Net Income</span></div>
                                    <div className="vorp_legitem"><span className="vorp_legdot blue"></span><span>Net Balance</span></div>
                                    <div className="vorp_legitem"><span className="vorp_legdot red"></span><span>Net Expenses</span></div>
                                </div>

                                {/* Custom Tooltip - Transformed to White UI */}
                                {hoveredPoint && (
                                    <div className="vorp_tooltip show vorp_tooltip_white" style={{
                                        left: hoveredPoint.x,
                                        top: Math.min(hoveredPoint.incomeY, hoveredPoint.expenseY, hoveredPoint.balanceY) - 50
                                    }}>
                                        <div className="vorp_tipmonth_dark">{hoveredPoint.month}</div>
                                        <div className="vorp_tip_row"><span className="vorp_tip_label">Net Income:</span><span className="vorp_tip_val_inc">{formatCurrency(hoveredPoint.income)}</span></div>
                                        <div className="vorp_tip_row"><span className="vorp_tip_label">Net Balance:</span><span className="vorp_tip_val_bal">{formatCurrency(hoveredPoint.balance)}</span></div>
                                        <div className="vorp_tip_row"><span className="vorp_tip_label">Net Expenses:</span><span className="vorp_tip_val_exp">{formatCurrency(hoveredPoint.expenses)}</span></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Finance Categories Chart */}
                        <div className="vorp_chartcard">
                            <h3>Finance Categories</h3>
                            <p className="vorp_sub">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} breakdown</p>
                            <div className="vorp_piecont">
                                {pieData ? (
                                    <div style={{ width: '100%', height: '260px' }}>
                                        <Pie data={pieData} options={pieOptions} />
                                    </div>
                                ) : (
                                    <div className="vorp_no_data">No data for this period</div>
                                )}
                                <div className="vorp_pieleg">
                                    {data?.categories.map((c, i) => (
                                        <div key={i} className="vorp_pielegitem">
                                            <span className="vorp_legsq" style={{ backgroundColor: c.color }}></span>
                                            <span>{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Transactions Section */}
            <section className="wump_txnarea">
                <div className="zorp_container">
                    <div className="wump_txncard">
                        <div className="wump_txnhead">
                            <div>
                                <h3>Recent Transactions</h3>
                                <p className="wump_txnsub">Track your latest financial activities across all categories</p>
                            </div>
                            <button className="wump_viewall">View All</button>
                        </div>

                        <div className="wump_txntablewrap">
                            <div className="cf-table-wrapper">
                                <table className="wump_txntable">
                                    <thead>
                                        <tr>
                                            <th>TRANSACTION ID</th>
                                            <th>DATE</th>
                                            <th>TYPE</th>
                                            <th>MEMBER/DESCRIPTION</th>
                                            <th>CATEGORY</th>
                                            <th>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!data?.recent_transactions || data.recent_transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                                    No recent transactions found
                                                </td>
                                            </tr>
                                        ) : (
                                            data.recent_transactions.map((txn) => {
                                                const isIncome = isIncomeType(txn.type);
                                                const amountClass = isIncome ? 'wump_amtpos' : 'wump_amtneg';
                                                const badgeClass = isIncome ? 'income' : 'expense';
                                                const sign = isIncome ? '+' : '-';
                                                const formattedAmount = sign + formatCurrency(txn.amount);

                                                return (
                                                    <tr key={txn.id} className="wump_txnrow">
                                                        <td className="wump_txnid">{txn.transaction_id}</td>
                                                        <td>{new Date(txn.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</td>
                                                        <td>{txn.type}</td>
                                                        <td>{txn.member || txn.description || 'N/A'}</td>
                                                        <td>
                                                            <span className={`wump_catbadge ${badgeClass}`}>
                                                                {txn.category}
                                                            </span>
                                                        </td>
                                                        <td className={amountClass}>{formattedAmount}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
