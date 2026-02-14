'use client';

import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface BarChartProps {
    data: ChartData<'bar'>;
    options?: ChartOptions<'bar'>;
    height?: number;
}

export default function BarChart({ data, options, height = 300 }: BarChartProps) {
    const defaultOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 15,
                    font: { size: 11, weight: 'bold' },
                    color: '#374151'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6'
                },
                ticks: {
                    color: '#6b7280',
                    font: { size: 11 },
                    callback: function (value: any) {
                        return value >= 1000 ? (value / 1000) + 'k' : value;
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#6b7280',
                    font: { size: 11 }
                }
            }
        }
    };

    // Deep-ish merge for scales and plugins
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        plugins: {
            ...defaultOptions.plugins,
            ...options?.plugins,
            legend: {
                ...defaultOptions.plugins?.legend,
                ...options?.plugins?.legend,
                labels: {
                    ...defaultOptions.plugins?.legend?.labels,
                    ...options?.plugins?.legend?.labels
                }
            }
        },
        scales: {
            ...defaultOptions.scales,
            ...options?.scales,
            y: {
                ...defaultOptions.scales?.y,
                ...options?.scales?.y,
                ticks: {
                    ...defaultOptions.scales?.y?.ticks,
                    ...options?.scales?.y?.ticks
                }
            },
            x: {
                ...defaultOptions.scales?.x,
                ...options?.scales?.x,
                ticks: {
                    ...defaultOptions.scales?.x?.ticks,
                    ...options?.scales?.x?.ticks
                }
            }
        }
    } as ChartOptions<'bar'>;

    return (
        <div style={{ height: `${height}px` }}>
            <Bar data={data} options={mergedOptions} />
        </div>
    );
}
