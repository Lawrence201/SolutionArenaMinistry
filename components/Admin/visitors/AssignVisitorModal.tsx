import React, { useState } from 'react';
import styles from './visitors.module.css';
import { assignVisitor } from '@/app/actions/visitor';
import { searchMembers } from '@/app/actions/memberActions';
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
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [memberName, setMemberName] = useState('');
    const [members, setMembers] = useState<{ id: number; name: string; photo?: string | null; role?: string | null }[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notes, setNotes] = useState('');

    React.useEffect(() => {
        const fetchMembers = async () => {
            if (memberName.length < 2) {
                setMembers([]);
                setShowDropdown(false);
                return;
            }

            setLoadingMembers(true);
            const result = await searchMembers(memberName);
            if (result.success && result.data) {
                setMembers(result.data);
                setShowDropdown(result.data.length > 0);
            }
            setLoadingMembers(false);
        };

        const timer = setTimeout(fetchMembers, 300);
        return () => clearTimeout(timer);
    }, [memberName]);

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
                        <div style={{ position: 'relative' }}>
                            <label className={styles.formLabel}>Assign to (Member Name) *</label>
                            <input
                                type="text"
                                required
                                className={styles.formInput}
                                placeholder="Start typing member name..."
                                value={memberName}
                                onChange={(e) => {
                                    setMemberName(e.target.value);
                                    if (!showDropdown && e.target.value.length >= 2) setShowDropdown(true);
                                }}
                                onFocus={() => memberName.length >= 2 && setShowDropdown(true)}
                            />
                            {loadingMembers && (
                                <div style={{ position: 'absolute', right: '12px', top: '38px' }}>
                                    <div className={styles.spinnerSmall}></div>
                                </div>
                            )}
                            {showDropdown && members.length > 0 && (
                                <div className={styles.searchDropdown}>
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className={styles.dropdownItem}
                                            onClick={() => {
                                                setMemberName(member.name);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <div className={styles.memberSmallCard}>
                                                <div className={styles.memberSmallIcon}>
                                                    {member.photo ? (
                                                        <img src={member.photo} alt={member.name} />
                                                    ) : (
                                                        <span>{member.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className={styles.memberSmallInfo}>
                                                    <h4>{member.name}</h4>
                                                    <p>{member.role || 'Member'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
