'use client';

import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData
} from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

interface DoughnutChartProps {
    data: ChartData<'doughnut'>;
    options?: ChartOptions<'doughnut'>;
    height?: number;
}

export default function DoughnutChart({ data, options, height = 300 }: DoughnutChartProps) {
    const defaultOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 15,
                    font: { size: 11, weight: 'bold' },
                    color: '#374151',
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return (
        <div style={{ height: `${height}px` }}>
            <Doughnut data={data} options={mergedOptions} />
        </div>
    );
}
