'use client';
import { useState, useEffect } from 'react';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: any;
    type: 'tithe' | 'welfare' | 'offering' | 'project_offering' | 'withdrawal' | 'expense';
}

export default function ReceiptModal({ isOpen, onClose, record, type }: ReceiptModalProps) {
    if (!isOpen || !record) return null;

    const title = type === 'tithe' ? 'CPS / TITHE RECEIPT' :
        type === 'welfare' ? 'WELFARE DUES RECEIPT' :
            type === 'offering' ? 'OFFERING RECEIPT' :
                type === 'withdrawal' ? 'WITHDRAWAL VOUCHER' :
                    type === 'expense' ? 'EXPENSE PAYMENT VOUCHER' : 'PROJECT OFFERING RECEIPT';

    const subtitle = type === 'tithe' ? 'Church Payment System Contribution' :
        type === 'welfare' ? 'Welfare Fund Contribution' :
            type === 'withdrawal' ? 'Authorized Fund Withdrawal Record' :
                type === 'expense' ? 'Official Expense Payment Voucher' :
                    'Financial Contribution Receipt';

    const formatCurrency = (amount: number) => {
        return `₵${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handlePrint = () => {
        const content = document.getElementById('receiptContentInner')?.innerHTML;
        if (!content) return;

        const printWindow = window.open('', '', 'height=800,width=800');
        if (!printWindow) return;

        printWindow.document.write('<html><head><title>Receipt</title>');
        printWindow.document.write('<style>body { font-family: sans-serif; padding: 20px; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(content);
        // Hide the action buttons in the printed version
        printWindow.document.write('<style>#receiptActions { display: none !important; }</style>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    // For withdrawals, use beneficiary info
    const personName = type === 'withdrawal' ? record.recipient :
        type === 'expense' ? record.vendor_payee : record.member_name;
    const personPhoto = type === 'withdrawal' || type === 'expense' ? null : record.member_photo;
    const initials = personName ? personName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'NA';

    return (
        <div
            className="receipt_modal_overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                overflowY: 'auto',
                padding: '20px'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                id="receiptContentInner"
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    maxWidth: '900px',
                    width: '100%',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    padding: '40px'
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '3px solid #5B4FDE', paddingBottom: '20px', marginBottom: '30px' }}>
                    <h1 style={{ margin: 0, color: '#1e293b', fontSize: '32px', fontWeight: '700' }}>{title}</h1>
                    <p style={{ margin: '10px 0 0 0', color: '#64748b', fontSize: '16px' }}>{subtitle}</p>
                </div>

                {/* Person Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px', padding: '25px', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', borderRadius: '12px', borderLeft: '5px solid #5B4FDE' }}>
                    <div>
                        {personPhoto ? (
                            <img src={personPhoto} alt={personName} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #5B4FDE' }} />
                        ) : (
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 'bold', color: 'white', border: '4px solid #5B4FDE' }}>
                                {initials}
                            </div>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '24px' }}>{personName || 'Unknown'}</h2>
                        {type !== 'withdrawal' && (
                            <>
                                <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Email:</strong> {record.member_email || 'N/A'}</p>
                                <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Phone:</strong> {record.member_phone || 'N/A'}</p>
                            </>
                        )}
                        {type === 'withdrawal' && (
                            <>
                                <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Purpose:</strong> {record.purpose || 'N/A'}</p>
                                <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Authorized By:</strong> {record.authorized_by || 'N/A'}</p>
                            </>
                        )}
                        {type === 'expense' && (
                            <>
                                <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Category:</strong> {record.category || 'N/A'}</p>
                                <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Description:</strong> {record.description || 'N/A'}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Transaction Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}>Transaction ID</p>
                        <p style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>{record.transaction_id || record.id}</p>
                    </div>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}>Date</p>
                        <p style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}>{type === 'withdrawal' ? 'Account' : 'Payment Method'}</p>
                        <p style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>{record.account_type || record.payment_method || 'N/A'}</p>
                    </div>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}>Status</p>
                        <p style={{ margin: 0, color: '#10b981', fontSize: '18px', fontWeight: '600' }}>{type === 'withdrawal' ? 'Approved' : 'Paid'}</p>
                    </div>
                </div>

                {/* Amount Section */}
                <div style={{ padding: '30px', background: 'linear-gradient(135deg, ' + (type === 'withdrawal' ? '#EF4444, #B91C1C' : '#5B4FDE, #764ba2') + ' 100%)', borderRadius: '12px', textAlign: 'center', marginBottom: '30px' }}>
                    <p style={{ margin: '0 0 10px 0', color: 'rgba(255,255,255,0.9)', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>{type === 'withdrawal' ? 'Total Amount Withdrawn' : 'Total Amount Paid'}</p>
                    <p style={{ margin: 0, color: 'white', fontSize: '48px', fontWeight: '700' }}>{formatCurrency(record.amount)}</p>
                </div>

                {/* Notes */}
                {record.notes && (
                    <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b', marginBottom: '30px' }}>
                        <p style={{ margin: '0 0 10px 0', color: '#92400e', fontWeight: '600' }}>Notes:</p>
                        <p style={{ margin: 0, color: '#78350f' }}>{record.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '2px solid #e2e8f0' }}>
                    <p style={{ margin: '5px 0', color: '#64748b', fontSize: '14px' }}>{type === 'withdrawal' ? 'Financial Integrity is our priority.' : 'Thank you for your faithful giving!'}</p>
                    <p style={{ margin: '5px 0', color: '#94a3b8', fontSize: '12px' }}>Generated on {new Date().toLocaleString()}</p>
                </div>

                {/* Action Buttons */}
                <div id="receiptActions" style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        onClick={handlePrint}
                        style={{ padding: '12px 30px', background: type === 'withdrawal' ? '#EF4444' : '#5B4FDE', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
                    >
                        Print {type === 'withdrawal' ? 'Voucher' : 'Receipt'}
                    </button>
                    <button
                        onClick={onClose}
                        style={{ padding: '12px 30px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
