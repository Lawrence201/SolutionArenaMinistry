'use client';
import { useState, useEffect } from 'react';

import '../../../app/admin/add_finance/add-finance.css';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: any;
    type: 'tithe' | 'welfare' | 'offering' | 'project_offering' | 'withdrawal' | 'expense';
}

export default function ReceiptModal({ isOpen, onClose, record, type }: ReceiptModalProps) {
    if (!isOpen || !record) return null;

    const titlePrefix = type === 'tithe' ? 'Tithe' :
        type === 'welfare' ? 'Welfare' :
            type === 'offering' ? 'Offering' :
                type === 'withdrawal' ? 'Withdrawal' :
                    type === 'expense' ? 'Expense' : 'Project Offering';

    const getReceiptNumber = () => {
        return record.receipt_number || record.transaction_id || record.id || `RCT-${Date.now()}`;
    };
    const personName = type === 'withdrawal' ? record.recipient :
        type === 'expense' ? record.vendor_payee : record.member_name || record.collected_by;
    const personPhoto = type === 'withdrawal' || type === 'expense' ? null : record.member_photo;
    const initials = personName ? personName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'NA';

    const formatCurrency = (amount: number) => {
        return `₵${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        const filename = `${personName.replace(/\s+/g, '_')}_${titlePrefix}_Receipt.pdf`;
        document.title = filename;
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content receipt-modal-content">
                <div className="modal-header no-print">
                    <h2>Receipt Preview</h2>
                    <button onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="modal-body receipt-preview">
                    {/* Header */}
                    <div className="receipt-header">
                        <img src="/assets/Logo.PNG" alt="SAM Logo" className="church-logo-img" />
                        <h1>Solution Arena Ministry</h1>
                        <p>{titlePrefix} Receipt</p>
                    </div>

                    <div className="receipt-divider"></div>

                    {/* Member Info */}
                    <div className="receipt-member-section">
                        {personPhoto && personPhoto !== 'NULL' && (
                            <img
                                src={personPhoto.startsWith('/') || personPhoto.startsWith('http') ? personPhoto : `/uploads/members/${personPhoto}`}
                                alt="Member"
                                className="receipt-member-photo"
                            />
                        )}
                        <div className="receipt-member-details">
                            <h3>{personName || 'Unknown'}</h3>
                            {type !== 'withdrawal' && type !== 'expense' && (
                                <p>{record.member_email || 'N/A'}</p>
                            )}
                            {(type === 'withdrawal' || type === 'expense') && (
                                <p>{type === 'withdrawal' ? record.purpose : record.category}</p>
                            )}
                        </div>
                    </div>

                    <div className="receipt-details-grid">
                        <div className="receipt-row">
                            <span className="label">Receipt Number</span>
                            <span className="value">{getReceiptNumber()}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Date</span>
                            <span className="value">{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">{type === 'withdrawal' ? 'Account' : 'Payment Method'}</span>
                            <span className="value">{record.account_type || record.payment_method || record.collection_method || 'Cash'}</span>
                        </div>
                        <div className="receipt-row total">
                            <span className="label">Amount</span>
                            <span className="value">{formatCurrency(record.amount || record.amount_collected)}</span>
                        </div>
                    </div>

                    <div className="receipt-footer">
                        <p>{type === 'withdrawal' || type === 'expense' ? 'Financial Integrity is our priority.' : 'Thank you for your faithful giving!'}</p>
                        <p className="small">system generated receipt</p>
                    </div>
                </div>

                <div className="modal-footer no-print">
                    <button className="rrap_btn" onClick={onClose} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                    <button className="rrap_btn rrap_btnprim" onClick={handlePrint} style={{ padding: '8px 16px', background: '#5B4FDE', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Print / Download PDF</button>
                </div>
            </div>
        </div>
    );
}
