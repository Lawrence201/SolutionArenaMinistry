// Report Utility Functions
// Replicating legacy JavaScript helper functions

/**
 * Format number with commas
 */
export function formatNumber(num: number | null | undefined): string {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format currency (Ghanaian Cedis)
 */
export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '₵0.00';
    return '₵' + parseFloat(amount.toString()).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
    if (value === null || value === undefined) return '0.0%';
    return value.toFixed(decimals) + '%';
}

/**
 * Calculate percentage change between current and previous values
 */
export function calculatePercentChange(current: number, previous: number): string {
    if (!previous || previous === 0) {
        return current > 0 ? '+100.0' : '0.0';
    }
    const change = (((current - previous) / previous) * 100).toFixed(1);
    return parseFloat(change) > 0 ? '+' + change : change;
}

/**
 * Get date range based on range string
 */
export function getDateRange(range: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (range) {
        case '7d':
            start.setDate(end.getDate() - 7);
            break;
        case '30d':
        case 'month':
            start.setDate(end.getDate() - 30);
            break;
        case '90d':
            start.setDate(end.getDate() - 90);
            break;
        case '1y':
        case 'year':
            start.setFullYear(end.getFullYear() - 1);
            break;
        case 'all':
            start.setFullYear(2000, 0, 1); // Start from year 2000
            break;
        default:
            start.setDate(end.getDate() - 30);
    }

    return { start, end };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get chart color palette (matching legacy)
 */
export const chartColors = {
    primary: '#3b82f6',    // Blue
    success: '#10b981',    // Green
    warning: '#f59e0b',    // Amber/Orange
    danger: '#ef4444',     // Red
    purple: '#8b5cf6',     // Purple
    pink: '#ec4899',       // Pink
    teal: '#14b8a6',       // Teal
    indigo: '#6366f1'      // Indigo
};

/**
 * Get financial health score color
 */
export function getHealthColor(score: number): string {
    if (score >= 80) return chartColors.success;
    if (score >= 60) return chartColors.primary;
    if (score >= 40) return chartColors.warning;
    return chartColors.danger;
}

/**
 * Calculate financial health score (0-100)
 */
export function calculateFinancialHealth(income: number, expenses: number): number {
    if (income === 0) return 0;
    const ratio = (income - expenses) / income;

    if (ratio >= 0.5) return 100;
    if (ratio >= 0.3) return 80;
    if (ratio >= 0.1) return 60;
    if (ratio >= 0) return 40;
    if (ratio >= -0.2) return 20;
    return 0;
}
