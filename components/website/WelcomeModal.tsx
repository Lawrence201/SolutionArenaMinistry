"use client";

import React, { useEffect, useState } from "react";
import styles from "./WelcomeModal.module.css";
import Link from "next/link";

const WelcomeModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                // Try to fetch session from a compatible endpoint
                // If migration is in progress, this might be a PHP endpoint or a new Next.js API route
                const response = await fetch('/auth/check_session.php');
                if (response.ok) {
                    const data = await response.json();
                    if (data.isLoggedIn) {
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (error) {
                // If fetch fails (e.g. 404), we assume not logged in and show modal
                console.log("Session check failed, assuming guest.");
            }

            // If not logged in or check failed, show modal after delay
            const timer = setTimeout(() => {
                setShowModal(true);
                setIsLoading(false);
            }, 2000);

            return () => clearTimeout(timer);
        };

        checkSession();
    }, []);

    const dismissModal = () => {
        setShowModal(false);
    };

    if (!showModal) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.card}>
                <button className={styles.closeBtn} onClick={dismissModal}>✕</button>
                <div className={styles.content}>
                    <div className={styles.icon}>
                        <img src="/assets/images/user-profile.svg" alt="Welcome Icon" />
                    </div>
                    <div className={styles.text}>
                        <h3>Welcome to Solution Arena Ministry Website</h3>
                        <p>Join our community to access exclusive content, sermons, and stay connected with us.</p>
                    </div>
                    <div className={styles.actions}>
                        <Link href="/auth/register" className={styles.primaryBtn}>
                            Create profile
                        </Link>
                        <button className={styles.secondaryBtn} onClick={dismissModal}>Dismiss</button>
                        <div className={styles.loginPrompt}>
                            <span>Already have an account?</span>
                            <Link href="/auth/login" className={styles.loginLink}>Log in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
