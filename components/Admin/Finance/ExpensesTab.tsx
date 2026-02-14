'use client';
import { useState, useEffect } from 'react';
import ReceiptModal from './ReceiptModal';

interface Expense {
    transaction_id: string;
    date: string;
    category: string;
    description: string;
    vendor_payee: string;
    amount: number;
    payment_method: string;
    status: string;
    notes?: string;
}

interface ExpensesData {
    expenses: Expense[];
    summary: {
        total_amount: number;
        total_count: number;
        avg_amount: number;
        pending_total: number;
        previous_month_total: number;
        change_percent: number;
    };
    budget: {
        total: number;
        remaining: number;
    };
    categories: Array<{
        category: string;
        total_amount: number;
    }>;
    status_counts: Record<string, number>;
}

export default function ExpensesTab() {
    const [data, setData] = useState<ExpensesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState('month');

    // Budget Modal State
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [newBudgetAmount, setNewBudgetAmount] = useState<string>('');
    const [isSavingBudget, setIsSavingBudget] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [isSavingExpense, setIsSavingExpense] = useState(false);

    // Add Record Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Utilities',
        description: '',
        amount: '',
        vendor_payee: '',
        payment_method: 'Cash',
        notes: '',
        status: 'Approved'
    });

    // Receipt Modal State
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Expense | null>(null);

    useEffect(() => {
        fetchExpenses();
    }, [dateRange]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/finance/expenses?range=${dateRange}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
                if (json.data.budget) {
                    setNewBudgetAmount((json.data.budget.total || 0).toString());
                }
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBudget = async () => {
        const amount = parseFloat(newBudgetAmount);
        if (isNaN(amount) || amount < 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        setIsSavingBudget(true);
        try {
            const res = await fetch('/api/finance/budget', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            const json = await res.json();
            if (json.success) {
                setIsBudgetModalOpen(false);
                fetchExpenses(); // Refresh data
            } else {
                alert(json.error || 'Failed to update budget');
            }
        } catch (error) {
            console.error('Error saving budget:', error);
            alert('Failed to save budget settings');
        } finally {
            setIsSavingBudget(false);
        }
    };

    const handleAddExpense = async () => {
        if (!newExpense.description || !newExpense.amount || !newExpense.vendor_payee) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSavingExpense(true);
        try {
            const res = await fetch('/api/finance/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense)
            });
            const json = await res.json();
            if (json.success) {
                setIsAddModalOpen(false);
                setNewExpense({
                    date: new Date().toISOString().split('T')[0],
                    category: 'Utilities',
                    description: '',
                    amount: '',
                    vendor_payee: '',
                    payment_method: 'Cash',
                    notes: '',
                    status: 'Approved'
                });
                fetchExpenses();
            } else {
                alert(json.error || 'Failed to add expense');
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense record');
        } finally {
            setIsSavingExpense(false);
        }
    };

    const handleUpdateExpense = async () => {
        if (!editingExpense) return;

        setIsSavingExpense(true);
        try {
            const res = await fetch(`/api/finance/expenses?id=${editingExpense.transaction_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingExpense)
            });
            const json = await res.json();
            if (json.success) {
                setIsEditModalOpen(false);
                fetchExpenses();
            } else {
                alert(json.error || 'Failed to update expense');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense record');
        } finally {
            setIsSavingExpense(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense record?')) return;

        try {
            const res = await fetch(`/api/finance/expenses?id=${id}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (json.success) {
                fetchExpenses();
            } else {
                alert(json.error || 'Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Failed to delete expense record');
        }
    };

    const handleExport = () => {
        if (!data || data.expenses.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ['Date', 'Description', 'Category', 'Vendor/Payee', 'Amount', 'Payment Method', 'Status'];
        const csvRows = [
            headers.join(','),
            ...data.expenses.map(e => [
                new Date(e.date).toLocaleDateString(),
                `"${e.description.replace(/"/g, '""')}"`,
                e.category,
                `"${e.vendor_payee.replace(/"/g, '""')}"`,
                e.amount,
                e.payment_method,
                e.status
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `expenses_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount: number) => {
        return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const filteredExpenses = data?.expenses?.filter(expense => {
        const matchesSearch =
            expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.vendor_payee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.category?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || expense.category.toLowerCase() === categoryFilter.toLowerCase();
        const matchesStatus = statusFilter === 'all' || expense.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesCategory && matchesStatus;
    }) || [];

    const largestCategory = data?.categories?.[0] || { category: 'None', total_amount: 0 };
    const budgetTotal = data?.budget?.total || 0;
    const expenseTotal = data?.summary?.total_amount || 0;
    const budgetPercent = budgetTotal > 0 ? (expenseTotal / budgetTotal) * 100 : 0;

    return (
        <div className="qery_contentarea">
            {/* Expense Summary Cards */}
            <div className="dorp_expsumgrid">
                {/* Total Expenses Card */}
                <div className="dorp_expsumcard dorp_cardredlight">
                    <div className="dorp_exphdr">
                        <div>
                            <div className="dorp_exptit" style={{ color: '#7F1D1D' }}>Total Expenses</div>
                            <div className="dorp_expsub" style={{ color: '#991B1B' }}>{dateRange === 'all' ? 'All Time' : 'Current Period'}</div>
                        </div>
                        <div className="dorp_expicon dorp_iconred">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="dorp_expamt">{loading ? '₵0.00' : formatCurrency(expenseTotal)}</div>
                    <div className={`dorp_expchg ${data?.summary?.change_percent && data.summary.change_percent > 0 ? 'negative' : 'positive'}`}>
                        {data?.summary?.change_percent !== undefined ?
                            `${data.summary.change_percent > 0 ? '+' : ''}${data.summary.change_percent}% from last month` :
                            '0% from last month'}
                    </div>
                </div>

                {/* Pending Approval Card */}
                <div className="dorp_expsumcard dorp_cardorangelight">
                    <div className="dorp_exphdr">
                        <div>
                            <div className="dorp_exptit" style={{ color: '#7C2D12' }}>Pending Approval</div>
                            <div className="dorp_expsub" style={{ color: '#9A3412' }}>Awaiting Review</div>
                        </div>
                        <div className="dorp_expicon dorp_iconorange">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                    </div>
                    <div className="dorp_expamt expct">{loading ? '0' : data?.status_counts?.pending || 0}</div>
                    <div className="dorp_expchg neutral" style={{ color: '#7C2D12' }}>{formatCurrency(data?.summary?.pending_total || 0)} total value</div>
                </div>

                {/* Budget Remaining Card */}
                <div className="dorp_expsumcard dorp_cardbluelight">
                    <div className="dorp_exphdr">
                        <div>
                            <div className="dorp_exptit" style={{ color: '#1E40AF' }}>Budget Remaining</div>
                            <div className="dorp_expsub" style={{ color: '#1E3A8A' }}>Out of {formatCurrency(budgetTotal)}</div>
                        </div>
                        <div className="dorp_expicon dorp_iconblue">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="dorp_expamt">{loading ? '₵0.00' : formatCurrency(data?.budget?.remaining || 0)}</div>
                    <div className="dorp_expprog">
                        <div className="dorp_expfill" style={{ width: `${Math.min(budgetPercent, 100)}%`, backgroundColor: budgetPercent > 90 ? '#ef4444' : '#5B4FDE' }}></div>
                    </div>
                    <button className="btn_set_bud" onClick={() => setIsBudgetModalOpen(true)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                        </svg>
                        Set Budget
                    </button>
                </div>

                {/* Largest Category Card */}
                <div className="dorp_expsumcard dorp_cardpurplight">
                    <div className="dorp_exphdr">
                        <div>
                            <div className="dorp_exptit" style={{ color: '#5B21B6' }}>Largest Category</div>
                            <div className="dorp_expsub" style={{ color: '#4C1D95' }}>By Expenditure</div>
                        </div>
                        <div className="dorp_expicon dorp_iconpurple">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="dorp_expamt expcat" style={{ fontSize: '20px' }}>{loading ? 'None' : largestCategory.category} ({(largestCategory.total_amount / (expenseTotal || 1) * 100).toFixed(1)}%)</div>
                    <div className="dorp_expchg neutral" style={{ color: '#5B21B6' }}>{formatCurrency(largestCategory.total_amount)} total</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="dorp_expfilt">
                <div className="corp_searchcont" style={{ flex: 1, marginBottom: 0 }}>
                    <svg className="corp_searchic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        className="corp_searchinp"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="dorp_filtgrp">
                    <label>Category</label>
                    <select className="dorp_filtinp" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="all">All Categories</option>
                        <option value="utilities">Utilities</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="salaries">Salaries</option>
                        <option value="missions">Missions</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="dorp_filtgrp">
                    <label>Period</label>
                    <select className="dorp_filtinp" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="borp_actbtn" style={{ background: '#5B4FDE', color: 'white', border: 'none' }} onClick={() => setIsAddModalOpen(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Record
                    </button>
                    <button className="borp_actbtn" onClick={handleExport}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export
                    </button>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="borp_cpsarea">
                <div className="borp_cpstablewrap">
                    <table className="borp_cpstable">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Vendor/Payee</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Status</th>
                                <th>Receipt</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>Loading expenses...</td></tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>No expenses found for this period</td></tr>
                            ) : filteredExpenses.map((expense) => (
                                <tr key={expense.transaction_id}>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    <td>
                                        <div className="eorp_expdesc">
                                            <div className="eorp_exptit">{expense.description}</div>
                                            {expense.notes && <div className="eorp_expnote">{expense.notes}</div>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`forp_cattag forp_cat${expense.category.toLowerCase().substring(0, 4)}`}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td>{expense.vendor_payee}</td>
                                    <td className="wump_amtneg">{formatCurrency(expense.amount)}</td>
                                    <td>{expense.payment_method}</td>
                                    <td>
                                        <span className={`borp_statbadge forp_stat${expense.status.toLowerCase().substring(0, 4)}`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="gorp_receiptbtn" onClick={() => { setSelectedReceipt(expense); setIsReceiptModalOpen(true); }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                            </svg>
                                        </button>
                                    </td>
                                    <td>
                                        <div className="gorp_actbtns">
                                            <button className="borp_acticon" title="Edit" onClick={() => { setEditingExpense(expense); setIsEditModalOpen(true); }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button className="borp_acticon gorp_delbtn" title="Delete" onClick={() => handleDeleteExpense(expense.transaction_id)}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Expense Modal */}
            {(isEditModalOpen || isAddModalOpen) && (
                <div className="budget_modal_overlay">
                    <div className="budget_modal_content" style={{ maxWidth: '600px' }}>
                        <div className="budget_modal_header">
                            <h2>{isEditModalOpen ? 'Edit Expense Record' : 'Add New Expense'}</h2>
                            <button className="budget_modal_close" onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }}>×</button>
                        </div>
                        <div className="budget_modal_body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="budget_form_group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    className="budget_inp"
                                    value={isEditModalOpen ? editingExpense?.date.split('T')[0] : newExpense.date}
                                    onChange={(e) => isEditModalOpen ? setEditingExpense({ ...editingExpense!, date: e.target.value }) : setNewExpense({ ...newExpense, date: e.target.value })}
                                />
                            </div>
                            <div className="budget_form_group">
                                <label>Category</label>
                                <select
                                    className="budget_inp"
                                    value={isEditModalOpen ? editingExpense?.category : newExpense.category}
                                    onChange={(e) => isEditModalOpen ? setEditingExpense({ ...editingExpense!, category: e.target.value }) : setNewExpense({ ...newExpense, category: e.target.value })}
                                >
                                    <option value="Utilities">Utilities</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Salaries">Salaries</option>
                                    <option value="Missions">Missions</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="budget_form_group" style={{ gridColumn: 'span 2' }}>
                                <label>Description</label>
                                <input
                                    type="text"
                                    className="budget_inp"
                                    placeholder="e.g. Electricity Bill Jan 2024"
                                    value={isEditModalOpen ? editingExpense?.description : newExpense.description}
                                    onChange={(e) => isEditModalOpen ? setEditingExpense({ ...editingExpense!, description: e.target.value }) : setNewExpense({ ...newExpense, description: e.target.value })}
                                />
                            </div>
                            <div className="budget_form_group">
                                <label>Amount (₵)</label>
                                <input
                                    type="number"
                                    className="budget_inp"
                                    placeholder="0.00"
                                    value={isEditModalOpen ? editingExpense?.amount : newExpense.amount}
                                    onChange={(e) => isEditModalOpen ? setEditingExpense({ ...editingExpense!, amount: parseFloat(e.target.value) }) : setNewExpense({ ...newExpense, amount: e.target.value })}
                                />
                            </div>
                            <div className="budget_form_group">
                                <label>Vendor/Payee</label>
                                <input
                                    type="text"
                                    className="budget_inp"
                                    placeholder="e.g. ECG"
                                    value={isEditModalOpen ? editingExpense?.vendor_payee : newExpense.vendor_payee}
                                    onChange={(e) => isEditModalOpen ? setEditingExpense({ ...editingExpense!, vendor_payee: e.target.value }) : setNewExpense({ ...newExpense, vendor_payee: e.target.value })}
                                />
                            </div>
                            <div className="budget_form_group">
                                <label>Payment Method</label>
                                <select
                                    className="budget_inp"
                                    value={isEditModalOpen ? editingExpense?.payment_method : newExpense.payment_method}
                                    onChange={(e) => isEditModalOpen ? setEditingExpense({ ...editingExpense!, payment_method: e.target.value }) : setNewExpense({ ...newExpense, payment_method: e.target.value })}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Mobile Money">Mobile Money</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                            <div className="budget_form_group">
                                <label>Status</label>
                                <select
                                    className="budget_inp"
                                    value={isEditModalOpen ? editingExpense?.status : newExpense.status}
                                    onChange={(e) => isEditModalOpen ? setEditingExpense({ ...editingExpense!, status: e.target.value }) : setNewExpense({ ...newExpense, status: e.target.value })}
                                >
                                    <option value="Approved">Approved</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="budget_form_group" style={{ gridColumn: 'span 2' }}>
                                <label>Notes</label>
                                <textarea
                                    className="budget_inp"
                                    style={{ height: '80px', resize: 'none' }}
                                    placeholder="Optional notes or references..."
                                    value={isEditModalOpen ? editingExpense?.notes : newExpense.notes}
                                    onChange={(e) => isEditModalOpen ? setEditingExpense({ ...editingExpense!, notes: e.target.value }) : setNewExpense({ ...newExpense, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="budget_modal_footer">
                            <button className="btn_cancel" onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }}>Cancel</button>
                            <button
                                className="btn_save_bud"
                                onClick={isEditModalOpen ? handleUpdateExpense : handleAddExpense}
                                disabled={isSavingExpense}
                            >
                                {isSavingExpense ? 'Saving...' : 'Save Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Settings Modal */}
            {isBudgetModalOpen && (
                <div className="budget_modal_overlay">
                    <div className="budget_modal_content">
                        <div className="budget_modal_header">
                            <h2>Set Monthly Budget</h2>
                            <button className="budget_modal_close" onClick={() => setIsBudgetModalOpen(false)}>×</button>
                        </div>
                        <div className="budget_modal_body">
                            <p className="budget_info_text">
                                Set the total monthly budget for tracking church expenses.
                                This helps you monitor spending and maintain financial discipline.
                            </p>

                            <div className="budget_form_group">
                                <label>Monthly Budget Amount (₵)</label>
                                <div className="budget_input_wrap">
                                    <span className="budget_input_curency">₵</span>
                                    <input
                                        type="number"
                                        className="budget_inp"
                                        placeholder="0.00"
                                        value={newBudgetAmount}
                                        onChange={(e) => setNewBudgetAmount(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="current_budget_box">
                                <span className="cur_bud_lab">Current Budget:</span>
                                <span className="cur_bud_val">{formatCurrency(budgetTotal)}</span>
                            </div>
                        </div>
                        <div className="budget_modal_footer">
                            <button className="btn_cancel" onClick={() => setIsBudgetModalOpen(false)}>Cancel</button>
                            <button
                                className="btn_save_bud"
                                onClick={handleSaveBudget}
                                disabled={isSavingBudget}
                            >
                                {isSavingBudget ? 'Saving...' : 'Save Budget'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            <ReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                record={selectedReceipt}
                type="expense"
            />
        </div>
    );
}
