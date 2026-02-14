
import React, { useEffect, useState } from 'react';

type ToastProps = {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
};

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!message) return null;

    const backgroundColor =
        type === 'success' ? '#10b981' :
            type === 'error' ? '#ef4444' :
                '#3b82f6';

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor,
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
            {type === 'success' && <span>✓</span>}
            {type === 'error' && <span>✕</span>}
            {type === 'info' && <span>ℹ</span>}
            <span style={{ fontWeight: 500 }}>{message}</span>
            <button
                onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '10px', fontSize: '18px' }}
            >
                ×
            </button>
        </div>
    );
}
