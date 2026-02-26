'use client';

import Link from 'next/link';
import '../register.css';

export default function RegistrationSuccessPage() {
    return (
        <div className="register-page-wrapper">
            <div className="register-container success-page-container">
                <div className="success-card">
                    <div className="success-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>

                    <h1 className="success-title">Registration Successful!</h1>

                    <p className="success-message">
                        Welcome to the family! Your membership registration has been received and is being processed.
                        We are excited to have you as part of Solution Arena ministry.
                    </p>

                    <div className="success-actions">
                        <Link href="/register" className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
                            Register Another Person
                        </Link>
                        <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '12px' }}>
                            You can now close this window or add someone else.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
