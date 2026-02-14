'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
    ChartData
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface LineChartProps {
    data: ChartData<'line'>;
    options?: ChartOptions<'line'>;
    height?: number;
}

export default function LineChart({ data, options, height = 300 }: LineChartProps) {
    const defaultOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 15,
                    font: { size: 12, weight: 'bold' },
                    color: '#374151',
                    usePointStyle: true,
                    pointStyle: 'rect'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 }
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
    } as ChartOptions<'line'>;

    return (
        <div style={{ height: `${height}px` }}>
            <Line data={data} options={mergedOptions} />
        </div>
    );
}
