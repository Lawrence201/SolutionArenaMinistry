import React, { useState } from 'react';
import styles from './visitors.module.css';
import { assignVisitor } from '@/app/actions/visitor';
import { Visitor } from '@prisma/client';

interface AssignVisitorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    visitor: Visitor | null;
    // In a real app we'd pass members list here
    members?: { id: number; name: string }[];
}

const AssignVisitorModal: React.FC<AssignVisitorModalProps> = ({ isOpen, onClose, onSuccess, visitor }) => {
    const [loading, setLoading] = useState(false);
    const [memberName, setMemberName] = useState(''); // Using text input for now as per legacy potentially, or simulated select
    const [notes, setNotes] = useState('');

    // Simulating members based on legacy code or just a text input if no member list provided
    // Legacy had: <select id="assignMemberId"><option value="">Select a member...</option></select>
    // We'll use a text input for simplified "Assign To" string as per schema, or a mock select

    const handleSubmit = async (e: React.FormEvent) => {
        if (!visitor) return;
        e.preventDefault();
        setLoading(true);

        try {
            const result = await assignVisitor(visitor.visitor_id, memberName, notes);

            if (result.success) {
                onSuccess();
                onClose();
                setMemberName('');
                setNotes('');
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
            <div className={styles.cfModalPanel} style={{ maxWidth: '500px' }}>
                <div className={styles.cfModalHead}>
                    <h2>Assign Visitor</h2>
                    <button className={styles.cfModalClose} onClick={onClose}>×</button>
                </div>
                <div className={styles.cfModalContent}>
                    <form id="assignVisitorForm" onSubmit={handleSubmit}>
                        <div>
                            <label className={styles.formLabel}>Assign to (Member Name) *</label>
                            {/* 
                   Ideally this should be a searchable select of members.
                   For now, matching schema 'assigned_to' which is a String, 
                   we allow typing a name.
               */}
                            <input
                                type="text"
                                required
                                className={styles.formInput}
                                placeholder="Enter member name"
                                value={memberName}
                                onChange={(e) => setMemberName(e.target.value)}
                            />
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label className={styles.formLabel}>Notes</label>
                            <textarea
                                rows={3}
                                className={styles.formTextarea}
                                placeholder="Add any notes about this assignment..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                    </form>
                </div>
                <div className={styles.cfModalFoot}>
                    <button type="button" className={`${styles.cfBtn} ${styles.cfBtnSecondary}`} onClick={onClose}>Cancel</button>
                    <button
                        type="submit"
                        form="assignVisitorForm"
                        className={`${styles.cfBtn} ${styles.cfBtnMain}`}
                        disabled={loading}
                    >
                        {loading ? 'Assign' : 'Assign'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignVisitorModal;
