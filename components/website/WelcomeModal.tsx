"use client";

import React, { useEffect, useState } from "react";
import styles from "./WelcomeModal.module.css";
import Link from "next/link";
import { useSession } from "next-auth/react";

const WelcomeModal = () => {
    const { status } = useSession();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // If not logged in, show modal after delay
        if (status === "unauthenticated") {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [status]);

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
                        <Link href="/login?register=true" className={styles.primaryBtn}>
                            Create profile
                        </Link>
                        <button className={styles.secondaryBtn} onClick={dismissModal}>Dismiss</button>
                        <div className={styles.loginPrompt}>
                            <span>Already have an account?</span>
                            <Link href="/login" className={styles.loginLink}>Log in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
