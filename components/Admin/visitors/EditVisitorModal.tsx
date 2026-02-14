import React, { useState, useEffect } from 'react';
import styles from './visitors.module.css';
import { updateVisitor } from '@/app/actions/visitor';
import { Visitor, VisitorSource, FollowUpStatus } from '@prisma/client';

interface EditVisitorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    visitor: Visitor | null;
}

const EditVisitorModal: React.FC<EditVisitorModalProps> = ({ isOpen, onClose, onSuccess, visitor }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: '',
        follow_up_status: '',
        follow_up_date: '',
        follow_up_notes: ''
    });

    useEffect(() => {
        if (visitor) {
            setFormData({
                name: visitor.name,
                phone: visitor.phone,
                email: visitor.email || '',
                source: visitor.source || '',
                follow_up_status: visitor.follow_up_status || 'pending',
                follow_up_date: visitor.follow_up_date ? new Date(visitor.follow_up_date).toISOString().split('T')[0] : '',
                follow_up_notes: visitor.follow_up_notes || ''
            });
        }
    }, [visitor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        if (!visitor) return;
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateVisitor(visitor.visitor_id, {
                name: formData.name,
                phone: formData.phone,
                email: formData.email || undefined,
                source: formData.source as VisitorSource || undefined,
                follow_up_status: formData.follow_up_status as FollowUpStatus || undefined,
                follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date) : undefined,
                follow_up_notes: formData.follow_up_notes || undefined,
            });

            if (result.success) {
                onSuccess();
                onClose();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !visitor) return null;

    return (
        <div className={`${styles.cfModal} ${styles.open}`}>
            <div className={styles.cfModalPanel} style={{ maxWidth: '700px' }}>
                <div className={styles.cfModalHead}>
                    <h2>Edit Visitor</h2>
                    <button className={styles.cfModalClose} onClick={onClose}>×</button>
                </div>
                <div className={styles.cfModalContent}>
                    <form id="editVisitorForm" onSubmit={handleSubmit}>
                        <div className={styles.formGrid}>

                            <div>
                                <label className={styles.formLabel}>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className={styles.formInput}
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className={styles.formLabel}>Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    className={styles.formInput}
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className={styles.formLabel}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className={styles.formInput}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className={styles.formLabel}>Source</label>
                                <select
                                    name="source"
                                    className={styles.formSelect}
                                    value={formData.source}
                                    onChange={handleChange}
                                >
                                    <option value="">Select source...</option>
                                    <option value="friend">Friend Invitation</option>
                                    <option value="social">Social Media</option>
                                    <option value="online">Online Search</option>
                                    <option value="event">Outreach Event</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className={styles.formLabel}>Follow-up Status</label>
                                <select
                                    name="follow_up_status"
                                    className={styles.formSelect}
                                    value={formData.follow_up_status}
                                    onChange={handleChange}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="no_response">No Response</option>
                                </select>
                            </div>

                            <div>
                                <label className={styles.formLabel}>Follow-up Date</label>
                                <input
                                    type="date"
                                    name="follow_up_date"
                                    className={styles.formInput}
                                    value={formData.follow_up_date}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={styles.formGridFull}>
                                <label className={styles.formLabel}>Follow-up Notes</label>
                                <textarea
                                    name="follow_up_notes"
                                    rows={3}
                                    className={styles.formTextarea}
                                    value={formData.follow_up_notes}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                        </div>
                    </form>
                </div>
                <div className={styles.cfModalFoot}>
                    <button type="button" className={`${styles.cfBtn} ${styles.cfBtnSecondary}`} onClick={onClose}>Cancel</button>
                    <button
                        type="submit"
                        form="editVisitorForm"
                        className={`${styles.cfBtn} ${styles.cfBtnMain}`}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditVisitorModal;
