import React, { useState } from 'react';
import styles from './visitors.module.css';
import { createVisitor } from '@/app/actions/visitor';
import { VisitorSource } from '@prisma/client';

interface AddVisitorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddVisitorModal: React.FC<AddVisitorModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: '',
        visitors_purpose: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createVisitor({
                name: formData.name,
                phone: formData.phone,
                email: formData.email || undefined,
                source: formData.source as VisitorSource || undefined,
                visitors_purpose: formData.visitors_purpose || undefined
            });

            if (result.success) {
                onSuccess();
                onClose();
                setFormData({ name: '', phone: '', email: '', source: '', visitors_purpose: '' }); // Reset
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

    if (!isOpen) return null;

    return (
        <div className={`${styles.cfModal} ${styles.open}`}>
            <div className={styles.cfModalPanel} style={{ maxWidth: '600px' }}>
                <div className={styles.cfModalHead}>
                    <h2>Add New Visitor</h2>
                    <button className={styles.cfModalClose} onClick={onClose}>×</button>
                </div>
                <div className={styles.cfModalContent}>
                    <form id="addVisitorForm" onSubmit={handleSubmit}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGridFull}>
                                <label className={styles.formLabel}>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className={styles.formInput}
                                    placeholder="Enter visitor's full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className={styles.formLabel}>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    className={styles.formInput}
                                    placeholder="e.g. 024xxxxxxx"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className={styles.formLabel}>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className={styles.formInput}
                                    placeholder="visitor@example.com"
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
                                <label className={styles.formLabel}>Visit Purpose</label>
                                <input
                                    type="text"
                                    name="visitors_purpose"
                                    className={styles.formInput}
                                    placeholder="e.g. Moving specifically to area"
                                    value={formData.visitors_purpose}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </form>
                </div>
                <div className={styles.cfModalFoot}>
                    <button type="button" className={`${styles.cfBtn} ${styles.cfBtnSecondary}`} onClick={onClose}>Cancel</button>
                    <button
                        type="submit"
                        form="addVisitorForm"
                        className={`${styles.cfBtn} ${styles.cfBtnPrimary}`}
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Visitor'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddVisitorModal;
