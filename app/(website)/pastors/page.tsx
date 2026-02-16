"use client";

import React from "react";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import styles from "./Pastors.module.css";

const PastorDetailPage = () => {
    return (
        <main className="website-page">
            <Header />

            {/* Banner Section */}
            <section className="banner position-relative" style={{ minHeight: "400px" }}>
                <div className="parallax" style={{ backgroundImage: "url(/assets/images/about.jpg)", minHeight: "600px" }}></div>
                <div className="banner-data text-center">
                    <h2 className="text-white font-bold">Pastor Detail</h2>
                    <ul className="flex-all">
                        <li><a href="/" className="text-white">Home</a></li>
                        <li><a href="/pastors" className="text-white">Pastor Detail</a></li>
                    </ul>
                </div>
            </section>

            {/* Pastor Detail Start */}
            <section className={`gap pastor-detail ${styles.pastorDetailSection}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className={styles.pastorMeta}>

                                {/* Featured Image */}
                                <img
                                    className={`w-100 img-fluid ${styles.featuredImg}`}
                                    src="/assets/images/pastor-featured-img.webp"
                                    alt="Pastor Featured Image"
                                />

                                <div className={styles.pastorInfoWrapper}>
                                    {/* Overlapping Pastor Portrait */}
                                    <img
                                        className={styles.pastorImg}
                                        src="/assets/images/Img-3.JPG"
                                        alt="Pastor"
                                    />

                                    <div className={styles.nameSection}>
                                        <h3 className={styles.pastorName}>
                                            <span className={styles.prefix}>Reverend</span>
                                            <span className={styles.mainName}>Doctor Emmanuel El Boateng</span>
                                        </h3>

                                        <div className={styles.infoGrid}>
                                            <div className="left-side">
                                                <p className={styles.designation}>
                                                    Senior Pastor - Servant of God
                                                </p>
                                                <div className="social mt-3">
                                                    <ul className={styles.socialList}>
                                                        <li>
                                                            <a href="https://www.facebook.com/profile.php?id=100064869240415&mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer">
                                                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="m15.997 3.985h2.191v-3.816c-.378-.052-1.678-.169-3.192-.169-3.159 0-5.323 1.987-5.323 5.639v3.361h-3.486v4.266h3.486v10.734h4.274v-10.733h3.345l.531-4.266h-3.877v-2.939c.001-1.233.333-2.077 2.051-2.077z" />
                                                                </svg>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                                                                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M512,97.248c-19.04,8.352-39.328,13.888-60.48,16.576c21.76-12.992,38.368-33.408,46.176-58.016 c-20.288,12.096-42.688,20.64-66.56,25.408C411.872,60.704,384.416,48,354.464,48c-58.112,0-104.896,47.168-104.896,104.992 c0,8.32,0.704,16.32,2.432,23.936c-87.264-4.256-164.48-46.08-216.352-109.792c-9.056,15.712-14.368,33.696-14.368,53.056 c0,36.352,18.72,68.576,46.624,87.232c-16.864-0.32-33.408-5.216-47.424-12.928c0,0.32,0,0.736,0,1.152 c0,51.008,36.384,93.376,84.096,103.136c-8.544,2.336-17.856,3.456-27.52,3.456c-6.72,0-13.504-0.384-19.872-1.792 c13.6,41.568,52.192,72.128,98.08,73.12c-35.712,27.936-81.056,44.768-130.144,44.768c-8.608,0-16.864-0.384-25.12-1.44 C46.496,446.88,101.6,464,161.024,464c193.152,0,298.752-160,298.752-298.688c0-4.64-0.16-9.12-0.384-13.568 C480.224,136.96,497.728,118.496,512,97.248z" />
                                                                </svg>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a href="https://www.instagram.com/solutionarenaministry?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                                                                <svg viewBox="0 0 511 511.9" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="m510.949219 150.5c-1.199219-27.199219-5.597657-45.898438-11.898438-62.101562-6.5-17.199219-16.5-32.597657-29.601562-45.398438-12.800781-13-28.300781-23.101562-45.300781-29.5-16.296876-6.300781-34.898438-10.699219-62.097657-11.898438-27.402343-1.300781-36.101562-1.601562-105.601562-1.601562s-78.199219.300781-105.5 1.5c-27.199219 1.199219-45.898438 5.601562-62.097657 11.898438-17.203124 6.5-32.601562 16.5-45.402343 29.601562-13 12.800781-23.097657 28.300781-29.5 45.300781-6.300781 16.300781-10.699219 34.898438-11.898438 62.097657-1.300781 27.402343-1.601562 36.101562-1.601562 105.601562s.300781 78.199219 1.5 105.5c1.199219 27.199219 5.601562 45.898438 11.902343 62.101562 6.5 17.199219 16.597657 32.597657 29.597657 45.398438 12.800781 13 28.300781 23.101562 45.300781 29.5 16.300781 6.300781 34.898438 10.699219 62.101562 11.898438 27.296876 1.203124 36 1.5 105.5 1.5s78.199219-.296876 105.5-1.5c27.199219-1.199219 45.898438-5.597657 62.097657-11.898438 34.402343-13.300781 61.601562-40.5 74.902343-74.898438 6.296876-16.300781 10.699219-34.902343 11.898438-62.101562 1.199219-27.300781 1.5-36 1.5-105.5s-.101562-78.199219-1.300781-105.5zm-46.097657 209c-1.101562 25-5.300781 38.5-8.800781 47.5-8.601562 22.300781-26.300781 40-48.601562 48.601562-9 3.5-22.597657 7.699219-47.5 8.796876-27 1.203124-35.097657 1.5-103.398438 1.5s-76.5-.296876-103.402343-1.5c-25-1.097657-38.5-5.296876-47.5-8.796876-11.097657-4.101562-21.199219-10.601562-29.398438-19.101562-8.5-8.300781-15-18.300781-19.101562-29.398438-3.5-9-7.699219-22.601562-8.796876-47.5-1.203124-27-1.5-35.101562-1.5-103.402343s.296876-76.5 1.5-103.398438c1.097657-25 5.296876-38.5 8.796876-47.5 4.101562-11.101562 10.601562-21.199219 19.203124-29.402343 8.296876-8.5 18.296876-15 29.398438-19.097657 9-3.5 22.601562-7.699219 47.5-8.800781 27-1.199219 35.101562-1.5 103.398438-1.5 68.402343 0 76.5.300781 103.402343 1.5 25 1.101562 38.5 5.300781 47.5 8.800781 11.097657 4.097657 21.199219 10.597657 29.398438 19.097657 8.5 8.300781 15 18.300781 19.101562 29.402343 3.5 9 7.699219 22.597657 8.800781 47.5 1.199219 27 1.5 35.097657 1.5 103.398438s-.300781 76.300781-1.5 103.300781zm0 0" />
                                                                    <path d="m256.449219 124.5c-72.597657 0-131.5 58.898438-131.5 131.5s58.902343 131.5 131.5 131.5c72.601562 0 131.5-58.898438 131.5-131.5s-58.898438-131.5-131.5-131.5zm0 216.800781c-47.097657 0-85.300781-38.199219-85.300781-85.300781s38.203124-85.300781 85.300781-85.300781c47.101562 0 85.300781 38.199219 85.300781 85.300781s-38.199219 85.300781-85.300781 85.300781zm0 0" />
                                                                    <path d="m423.851562 119.300781c0 16.953125-13.746093 30.699219-30.703124 30.699219-16.953126 0-30.699219-13.746094-30.699219-30.699219 0-16.957031 13.746093-30.699219 30.699219-30.699219 16.957031 0 30.703124 13.742188 30.703124 30.699219zm0 0" />
                                                                </svg>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="right-side">
                                                <ul className={styles.contactList}>
                                                    <li className={styles.contactItem}>
                                                        <svg width="25" viewBox="0 0 454.573 454.573">
                                                            <path d="M452.441,156.234l-65.829-46.498V41.817c-0.66-6.728-5.843-12.128-12.539-13.061H85.682 c-6.695,0.934-11.879,6.333-12.539,13.061v67.396l-68.441,47.02c-2.711,1.968-4.428,5.021-4.702,8.359v248.163 c0.89,6.811,6.25,12.172,13.061,13.061h433.633c5.747,0,7.837-6.792,7.837-13.061V164.593 C454.531,161.458,455.053,158.323,452.441,156.234z M386.612,134.813l44.931,30.824l-44.931,33.959V134.813z M94.041,49.654 h271.673v166.139l-135.837,102.4l-135.837-102.4V49.654z M73.143,134.291v65.829l-44.931-34.482L73.143,134.291z M20.898,187.058 l146.286,110.759L20.898,396.56V187.058z M45.976,404.919l138.971-93.518l37.094,28.212c2.1,1.623,4.661,2.538,7.314,2.612 c2.09,0,3.135-1.045,5.224-2.612l38.661-29.78l140.539,95.086H45.976z M433.633,392.903l-143.151-96.131l143.151-109.714V392.903 z" />
                                                        </svg>
                                                        <p className={styles.contactText}>123 456 789 09</p>
                                                    </li>
                                                    <li className={styles.contactItem + " mt-3"}>
                                                        <svg width="25" viewBox="0 0 454.573 454.573">
                                                            <path d="M452.441,156.234l-65.829-46.498V41.817c-0.66-6.728-5.843-12.128-12.539-13.061H85.682 c-6.695,0.934-11.879,6.333-12.539,13.061v67.396l-68.441,47.02c-2.711,1.968-4.428,5.021-4.702,8.359v248.163 c0.89,6.811,6.25,12.172,13.061,13.061h433.633c5.747,0,7.837-6.792,7.837-13.061V164.593 C454.531,161.458,455.053,158.323,452.441,156.234z M386.612,134.813l44.931,30.824l-44.931,33.959V134.813z M94.041,49.654 h271.673v166.139l-135.837,102.4l-135.837-102.4V49.654z M73.143,134.291v65.829l-44.931-34.482L73.143,134.291z M20.898,187.058 l146.286,110.759L20.898,396.56V187.058z M45.976,404.919l138.971-93.518l37.094,28.212c2.1,1.623,4.661,2.538,7.314,2.612 c2.09,0,3.135-1.045,5.224-2.612l38.661-29.78l140.539,95.086H45.976z M433.633,392.903l-143.151-96.131l143.151-109.714V392.903 z" />
                                                        </svg>
                                                        <p className={styles.contactText}>username@domain.org</p>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-12">
                            <div className={styles.contentSection}>
                                <h3 className={styles.sectionTitle}>Information</h3>
                                <p className={styles.infoText}>
                                    Reverend Doctor Emmanuel El Boateng is a seasoned minister of the gospel whose life is marked by passion, excellence, and unwavering commitment to the work of God. As the leader of Solution Arena Ministry, he has devoted himself to raising believers who are grounded in truth, transformed by the Word, and equipped to fulfill their God-given destinies. His ministry is built on integrity, compassion, and a sincere desire to see people encounter Jesus in a practical and life-changing way.
                                </p>
                                <p className={styles.infoText}>
                                    Through his deep teaching of Scripture, powerful prayer ministry, and fatherly guidance, Reverend Dr. El Boateng has become a source of inspiration to many within and beyond the church. His leadership brings clarity, direction, and spiritual growth, helping individuals understand their identity in Christ and walk boldly in purpose. He continues to invest his time and heart into building a strong, united, and spiritually empowered church family.
                                </p>
                                <p className={styles.infoText}>
                                    His dedication, humility, and wisdom have shaped Solution Arena Ministry into a place of hope, transformation, and divine encounter. Reverend Dr. Emmanuel El Boateng remains committed to raising leaders, strengthening believers, and advancing the Kingdom of God with excellence and passion.
                                </p>

                                <h3 className={styles.sectionTitle + " mt-5"}>Experience Skills</h3>
                                <div className={styles.skillsGrid}>
                                    <div className={styles.skillPill}>Teaching & Preaching (95%)</div>
                                    <div className={styles.skillPill}>Leadership & Administration (88%)</div>
                                    <div className={styles.skillPill}>Counseling & Mentorship (92%)</div>
                                    <div className={styles.skillPill}>Worship Coordination (85%)</div>
                                    <div className={styles.skillPill}>Pastoral Experience (98%)</div>
                                </div>

                                <h3 className={`${styles.sectionTitle} mt-5`}>Points of My Service</h3>
                                <ul className={styles.checklist}>
                                    {[
                                        "Offering spiritual guidance, counseling, and support to individuals and families.",
                                        "Leading prayer, worship, and church services with excellence and dedication.",
                                        "Training and equipping church members to discover and use their God-given gifts.",
                                        "Building a strong, united church community grounded in love and truth.",
                                        "Organizing outreach initiatives to impact lives within and beyond the church.",
                                    ].map((item, idx) => (
                                        <li key={idx} className={styles.checklistItem}>
                                            <svg className={styles.checkIcon} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                                <g>
                                                    <path d="M497.36,69.995c-7.532-7.545-19.753-7.558-27.285-0.032L238.582,300.845l-83.522-90.713 c-7.217-7.834-19.419-8.342-27.266-1.126c-7.841,7.217-8.343,19.425-1.126,27.266l97.126,105.481 c3.557,3.866,8.535,6.111,13.784,6.22c0.141,0.006,0.277,0.006,0.412,0.006c5.101,0,10.008-2.026,13.623-5.628L497.322,97.286 C504.873,89.761,504.886,77.54,497.36,69.995z" />
                                                </g>
                                                <g>
                                                    <path d="M492.703,236.703c-10.658,0-19.296,8.638-19.296,19.297c0,119.883-97.524,217.407-217.407,217.407 c-119.876,0-217.407-97.524-217.407-217.407c0-119.876,97.531-217.407,217.407-217.407c10.658,0,19.297-8.638,19.297-19.296 C275.297,8.638,266.658,0,256,0C114.84,0,0,114.84,0,256c0,141.154,114.84,256,256,256c141.154,0,256-114.846,256-256 C512,245.342,503.362,236.703,492.703,236.703z" />
                                                </g>
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default PastorDetailPage;
