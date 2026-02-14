'use client';
import { useState, useEffect } from 'react';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedData: any) => Promise<void>;
    record: any;
    type: 'tithe' | 'welfare' | 'offering' | 'project_offering' | 'withdrawal';
}

export default function EditModal({ isOpen, onClose, onSave, record, type }: EditModalProps) {
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (record) {
            setFormData({
                date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
                amount: record.amount || 0,
                payment_method: record.payment_method || 'Cash',
                notes: record.notes || '',
                // Welfare/Tithe specific
                member_name: record.member_name || '',
                // Withdrawal specific
                purpose: record.purpose || '',
                recipient: record.recipient || '',
                authorized_by: record.authorized_by || '',
                account_type: record.account_type || ''
            });
        }
    }, [record]);

    if (!isOpen || !record) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const title = type === 'tithe' ? 'Edit CPS Contribution' :
        type === 'welfare' ? 'Edit Welfare Due' :
            type === 'withdrawal' ? 'Edit Withdrawal' : 'Edit Recording';

    return (
        <div
            className="edit_modal_overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    maxWidth: '500px',
                    width: '100%',
                    padding: '24px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {type !== 'withdrawal' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Member Name</label>
                            <input
                                type="text"
                                value={formData.member_name}
                                disabled
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                            />
                        </div>
                    )}

                    {type === 'withdrawal' && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Recipient / Beneficiary</label>
                                <input
                                    type="text"
                                    value={formData.recipient}
                                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Authorized By</label>
                                <input
                                    type="text"
                                    value={formData.authorized_by}
                                    onChange={(e) => setFormData({ ...formData, authorized_by: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                        </>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Amount (₵)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>{type === 'withdrawal' ? 'Account Type' : 'Payment Method'}</label>
                        <select
                            value={type === 'withdrawal' ? formData.account_type : formData.payment_method}
                            onChange={(e) => setFormData({ ...formData, [type === 'withdrawal' ? 'account_type' : 'payment_method']: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        >
                            {type === 'withdrawal' ? (
                                <>
                                    <option value="offering">Offerings</option>
                                    <option value="tithe">Tithes (CPS)</option>
                                    <option value="projectoffering">Project Offerings</option>
                                    <option value="welfare">Welfare</option>
                                </>
                            ) : (
                                <>
                                    <option value="Cash">Cash</option>
                                    <option value="Mobile Money">Mobile Money</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cheque">Cheque</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{ flex: 1, padding: '12px', background: '#5B4FDE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '12px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
