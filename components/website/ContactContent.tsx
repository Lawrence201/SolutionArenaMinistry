"use client";

import React, { useState, useEffect } from "react";
import styles from "./ContactContent.module.css";

const ContactContent = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
    const [inquiryType, setInquiryType] = useState("");

    useEffect(() => {
        // In the legacy, this fetched auth/check_session.php
        // In the current project, we might use next-auth or similar
        // For now, I'll simulate a logged-out state or mock the check
        const checkSession = async () => {
            try {
                // Mock session check
                setIsLoggedIn(false);
            } catch (error) {
                console.error("Error checking session:", error);
            }
        };
        checkSession();
    }, []);

    const handleGetDirections = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    const churchLat = 5.574380648684242;
                    const churchLng = -0.28743606802307203;
                    const mapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${churchLat},${churchLng}`;
                    window.open(mapsUrl, "_blank");
                },
                () => {
                    alert("Unable to access your location. Please allow location permission.");
                }
            );
        } else {
            alert("Your browser does not support geolocation.");
        }
    };

    return (
        <section className={styles.contactSection}>
            <div className={styles.contactHeader}>
                <div className="container">
                    <h2 className="m-auto text-center">If You Have any Questions Feel Free to Contact Us</h2>
                </div>
            </div>

            <div className="container mt-5">
                <div className="row">
                    <div className="col-lg-6 col-md-12 col-sm-12">
                        <div className={styles.content}>
                            {/* Ghana - Accra */}
                            <div className={styles.cDetail}>
                                <div className={styles.countrySide}>
                                    <span className="font-bold">Ghana - Accra</span>
                                </div>
                                <div className={styles.infoSide}>
                                    <ul className={styles.contactList}>
                                        <li className={styles.locationDetail}>
                                            Solution Arena Ministry<br />
                                            Mallam-Abaase
                                        </li>
                                        <li className={styles.contactItem}>
                                            <span className={styles.contactLabel}>Telephone:</span>
                                            <a href="tel:+233243918126" className={styles.contactLink}>+233 24 391 8126</a>
                                        </li>
                                        <li className={styles.contactItem}>
                                            <span className={styles.contactLabel}>Telephone:</span>
                                            <a href="tel:+233544106812" className={styles.contactLink}>+233 54 410 6812</a>
                                        </li>
                                        <li className={styles.contactItem}>
                                            <span className={styles.contactLabel}>Email:</span>
                                            <a href="mailto:sarenaministry@gmail.com" className={styles.contactLink}>sarenaministry@gmail.com</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Accra-Ghana */}
                            <div className={styles.cDetail}>
                                <div className={styles.countrySide}>
                                    <span className="font-bold">Accra-Ghana</span>
                                </div>
                                <div className={styles.infoSide}>
                                    <ul className={styles.contactList}>
                                        <li className={styles.locationDetail}>
                                            Solution Arena Ministry<br />
                                            Mallam-Abaase
                                        </li>
                                        <li className={styles.contactItem}>
                                            <span className={styles.contactLabel}>Telephone:</span>
                                            <a href="tel:+233243918126" className={styles.contactLink}>+233 24 391 8126</a>
                                        </li>
                                        <li className={styles.contactItem}>
                                            <span className={styles.contactLabel}>Telephone:</span>
                                            <a href="tel:+233544106812" className={styles.contactLink}>+233 54 410 6812</a>
                                        </li>
                                        <li className={styles.contactItem}>
                                            <span className={styles.contactLabel}>Email:</span>
                                            <a href="mailto:sarenaministry@gmail.com" className={styles.contactLink}>sarenaministry@gmail.com</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-12 col-sm-12">
                        {!isLoggedIn ? (
                            <div className={styles.loginRequired}>
                                <div className={styles.iconWrapper}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#2b4764" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="8.5" cy="7" r="4"></circle>
                                        <line x1="20" y1="8" x2="20" y2="14"></line>
                                        <line x1="23" y1="11" x2="17" y2="11"></line>
                                    </svg>
                                </div>
                                <h3 className={styles.loginTitle}>Login Required</h3>
                                <p className={styles.loginDesc}>Please login or register to send us a message.</p>
                                <div className={styles.authButtons}>
                                    <a href="/login" className={styles.loginBtn}>LOGIN</a>
                                    <a href="/register" className={styles.registerBtn}>REGISTER</a>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.formContainer}>
                                <form className={styles.contactForm}>
                                    <div className="row">
                                        <div className="col-md-6 mb-4">
                                            <label>Full Name <span>*</span></label>
                                            <input type="text" placeholder="John Doe" required />
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <label>Email Address <span>*</span></label>
                                            <input type="email" placeholder="john@example.com" required />
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <label>Phone Number</label>
                                            <input type="tel" placeholder="+233 534829203" />
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <label>Inquiry Type <span>*</span></label>
                                            <select required value={inquiryType} onChange={(e) => setInquiryType(e.target.value)}>
                                                <option value="" disabled>Select Inquiry Type</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="prayer">Prayer Request</option>
                                                <option value="membership">Membership Information</option>
                                                <option value="events">Event Details</option>
                                                <option value="pastoral">Pastoral Care</option>
                                                <option value="others">Others</option>
                                            </select>
                                        </div>
                                        {inquiryType === "others" && (
                                            <div className="col-12 mb-4">
                                                <label>Please Specify <span>*</span></label>
                                                <input type="text" placeholder="Please specify your inquiry type" required />
                                            </div>
                                        )}
                                        <div className="col-12 mb-4">
                                            <label>Subject <span>*</span></label>
                                            <input type="text" placeholder="How can we help you?" required />
                                        </div>
                                        <div className="col-12 mb-4">
                                            <label>Message <span>*</span></label>
                                            <textarea placeholder="Write your message here..." rows={5} required></textarea>
                                        </div>
                                        <div className="col-12 mb-4">
                                            <label className={styles.checkboxLabel}>
                                                <input type="checkbox" required />
                                                <span>I agree to send this message</span>
                                            </label>
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" className="theme-btn w-100">Send Message</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Section */}
                <div className={styles.mapSection}>
                    <div className={styles.mapWrapper}>
                        <iframe
                            src="https://www.google.com/maps?q=5.574380648684242,-0.28743606802307203&output=embed"
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <button className={styles.glassBtn} onClick={handleGetDirections}>
                            Get Directions
                        </button>
                    </div>
                </div>

                {/* Social Grid */}
                <div className={styles.socialGrid}>
                    <ul className={styles.socialList}>
                        <li>
                            <a href="#" className={styles.fb}>
                                <svg viewBox="0 0 320 512" width="20" height="20"><path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" /></svg>
                                Facebook
                            </a>
                        </li>
                        <li>
                            <a href="#" className={styles.tw}>
                                <svg viewBox="0 0 512 512" width="20" height="20"><path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" /></svg>
                                Twitter
                            </a>
                        </li>
                        <li>
                            <a href="#" className={styles.ig}>
                                <svg viewBox="0 0 448 512" width="20" height="20"><path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" /></svg>
                                Instagram
                            </a>
                        </li>
                        <li>
                            <a href="#" className={styles.yt}>
                                <svg viewBox="0 0 576 512" width="20" height="20"><path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.781 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" /></svg>
                                Youtube
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default ContactContent;
