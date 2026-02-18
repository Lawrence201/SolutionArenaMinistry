"use client";

import React from "react";
import styles from "./GroupsContent.module.css";

const GroupsContent = () => {
    const families = [
        { name: "The DUNAMIS Family", img: "/assets/images/dunamis.jpg" },
        { name: "The JUDAH Family", img: "/assets/images/judah.jpg" },
        { name: "The KARIS Family", img: "/assets/images/karis.jpg" },
        { name: "The KABOD Family", img: "/assets/images/kabod.jpg" },
    ];

    return (
        <div className={styles.root}>
            {/* Our Ministries Section */}
            <section className={styles.groupsContent}>
                <div className="container">
                    <div className={styles.heading}>
                        <h2>Together We Grow: Explore the Vibrant Groups Within Solution Arena Ministry</h2>
                    </div>
                    <div className="row">
                        {families.map((family, index) => (
                            <div key={index} className="col-lg-6 col-md-6 col-sm-12">
                                <div className={`${styles.ministry} text-center light-bg position-relative`}>
                                    <img
                                        className="rounded-circle position-relative img-fluid w-100"
                                        src={family.img}
                                        alt={family.name}
                                    />
                                    <a href="JavaScript:void(0)" className="font-bold flex-all position-relative">
                                        {family.name}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Media Quick Links */}
            <div className={styles.socialGrid}>
                <div className="container">
                    <ul className={styles.socialList}>
                        <li className={styles.socialItem}>
                            <a href="JavaScript:void(0)" className={`${styles.socialIcon} rounded-circle`}>
                                <svg viewBox="0 0 24 24"><path d="m15.997 3.985h2.191v-3.816c-.378-.052-1.678-.169-3.192-.169-3.159 0-5.323 1.987-5.323 5.639v3.361h-3.486v4.266h3.486v10.734h4.274v-10.733h3.345l.531-4.266h-3.877v-2.939c.001-1.233.333-2.077 2.051-2.077z" /></svg>
                            </a>
                            <p className="font-bold">Facebook Page</p>
                        </li>
                        <li className={styles.socialItem}>
                            <a href="JavaScript:void(0)" className={`${styles.socialIcon} rounded-circle`}>
                                <svg viewBox="0 0 48 48"><path d="M33.52 13.15c-2.59-1.52-4.2-3.55-4.67-6.4h-4.88v22.52c0 2.09-.85 3.97-2.22 5.34-1.37 1.38-3.25 2.22-5.34 2.22-4.17 0-7.56-3.39-7.56-7.56s3.39-7.56 7.56-7.56c.75 0 1.48.11 2.17.32v-5.03c-1.76-.28-3.56-.25-5.34.16-1.78.41-3.46 1.15-4.94 2.18-1.48 1.03-2.75 2.33-3.74 3.84C2.57 25.67 2 27.59 2 29.59c0 7.36 5.97 13.33 13.33 13.33 3.7 0 7.06-1.5 9.5-3.93 2.43-2.43 3.93-5.8 3.93-9.5V19.7c2.02 1.4 4.39 2.26 6.96 2.39v-4.98c-2.35-.14-4.52-.88-6.2-1.96z" /></svg>
                            </a>
                            <p className="font-bold">Follow us on TikTok</p>
                        </li>
                        <li className={styles.socialItem}>
                            <a href="JavaScript:void(0)" className={`${styles.socialIcon} rounded-circle`}>
                                <svg viewBox="0 0 511 511.9" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m510.949219 150.5c-1.199219-27.199219-5.597657-45.898438-11.898438-62.101562-6.5-17.199219-16.5-32.597657-29.601562-45.398438-12.800781-13-28.300781-23.101562-45.300781-29.5-16.296876-6.300781-34.898438-10.699219-62.097657-11.898438-27.402343-1.300781-36.101562-1.601562-105.601562-1.601562s-78.199219.300781-105.5 1.5c-27.199219 1.199219-45.898438 5.601562-62.097657 11.898438-17.203124 6.5-32.601562 16.5-45.402343 29.601562-13 12.800781-23.097657 28.300781-29.5 45.300781-6.300781 16.300781-10.699219 34.898438-11.898438 62.097657-1.300781 27.402343-1.601562 36.101562-1.601562 105.601562s.300781 78.199219 1.5 105.5c1.199219 27.199219 5.601562 45.898438 11.902343 62.101562 6.5 17.199219 16.597657 32.597657 29.597657 45.398438 12.800781 13 28.300781 23.101562 45.300781 29.5 16.300781 6.300781 34.898438-10.699219 62.101562 11.898438-27.296876 1.203124 36 1.5 105.5 1.5s78.199219-.296876 105.5-1.5c27.199219-1.199219 45.898438-5.597657 62.097657-11.898438 34.402343-13.300781 61.601562-40.5 74.902343-74.898438 6.296876-16.300781 10.699219-34.902343 11.898438-62.101562 1.199219-27.300781 1.5-36 1.5-105.5s-.101562-78.199219-1.300781-105.5zm-46.097657 209c-1.101562 25-5.300781 38.5-8.800781 47.5-8.601562 22.300781-26.300781 40-48.601562 48.601562-9 3.5-22.597657 7.699219-47.5 8.796876-27 1.203124-35.097657 1.5-103.398438 1.5s-76.5-.296876-103.402343-1.5c-25-1.097657-38.5-5.296876-47.5-8.796876-11.097657-4.101562-21.199219-10.601562-29.398438-19.101562-8.5-8.300781-15-18.300781-19.101562-29.398438-3.5-9-7.699219-22.601562-8.796876-47.5-1.203124-27-1.5-35.101562-1.5-103.402343s.296876-76.5 1.5-103.398438c1.097657-25 5.296876-38.5 8.796876-47.5 4.101562-11.101562 10.601562-21.199219 19.203124-29.402343 8.296876-8.5 18.296876-15 29.398438-19.097657 9-3.5 22.601562-7.699219 47.5-8.800781 27-1.199219 35.101562-1.5 103.398438-1.5 68.402343 0 76.5.300781 103.402343 1.5 25 1.101562 38.5 5.300781 47.5 8.800781 11.097657 4.097657 21.199219 10.597657 29.398438 19.097657 8.5 8.300781 15 18.300781 19.101562 29.402343 3.5 9 7.699219 22.597657 8.800781 47.5 1.199219 27 1.5 35.097657 1.5 103.398438s-.300781 76.300781-1.5 103.300781zm0 0" />
                                    <path d="m256.449219 124.5c-72.597657 0-131.5 58.898438-131.5 131.5s58.902343 131.5 131.5 131.5c72.601562 0 131.5-58.898438 131.5-131.5s-58.898438-131.5-131.5-131.5zm0 216.800781c-47.097657 0-85.300781-38.199219-85.300781-85.300781s38.203124-85.300781 85.300781-85.300781c47.101562 0 85.300781 38.199219 85.300781 85.300781s-38.199219 85.300781-85.300781 85.300781zm0 0" />
                                    <path d="m423.851562 119.300781c0 16.953125-13.746093 30.699219-30.703124 30.699219-16.953126 0-30.699219-13.746094-30.699219-30.699219 0-16.957031 13.746093-30.699219 30.699219-30.699219 16.957031 0 30.703124 13.742188 30.703124 30.699219zm0 0" />
                                </svg>
                            </a>
                            <p className="font-bold">Instagram Updates</p>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Choir Section */}
            <section className={styles.choirSection}>
                <div className="container">
                    <div className={styles.choirHeading}>
                        <img src="/assets/images/Logo.PNG" alt="Church Logo" />
                        <p>Meet Our Nobel Choir</p>
                        <h2>Ambassadors Of Worship</h2>
                    </div>
                    <div className="row align-items-center">
                        <div className="col-lg-6 col-md-12 col-sm-12">
                            <div className={styles.progPart}>
                                <h2>Ambassadors of Worship Choir</h2>
                                <p>
                                    Our choir, the Ambassadors of Worship, leads the congregation in soulful worship and
                                    heartfelt praise. With every song, they inspire, uplift, and bring the presence of God closer to every heart.
                                    Their harmonies, dedication, and passion create a powerful atmosphere of devotion,
                                    encouraging all members to join in worship and experience the joy and peace of the Lord.
                                    Through their music, the Ambassadors of Worship not only glorify God but also touch lives,
                                    fostering unity, faith, and spiritual growth within the church community.
                                </p>
                                <div className={styles.progBar}>
                                    <div className={styles.progress}>
                                        <div className={styles.progressBar} style={{ width: "96%" }}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Worship (96%)
                                        </div>
                                    </div>
                                    <div className={styles.progress}>
                                        <div className={styles.progressBar} style={{ width: "88%" }}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Services (88%)
                                        </div>
                                    </div>
                                    <div className={styles.progress}>
                                        <div className={styles.progressBar} style={{ width: "97%" }}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Experience (97%)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-sm-12">
                            <div className={styles.videoSec}>
                                <div className={styles.videoWrapper}>
                                    <img src="/assets/images/amb-2.jpg" alt="Choir Member" />
                                    <a href="https://www.youtube.com/watch?v=uemObN8_dcw" target="_blank" rel="noopener noreferrer" className={styles.playBtn}>
                                        <svg id="play-btn" viewBox="0 0 494.942 494.942">
                                            <path d="m35.353 0 424.236 247.471-424.236 247.471z" />
                                        </svg>
                                    </a>
                                </div>
                                <img src="/assets/images/ambassors.JPG" alt="Choir Group" className={styles.largeImg} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Media Crew Section */}
            <section className={styles.mediaSection}>
                <div className="container">
                    <div className={styles.choirHeading}>
                        <img src="/assets/images/Logo.PNG" alt="Church Logo" />
                        <p>Meet our Able Media Crew</p>
                        <h2>Our Media Crew</h2>
                    </div>
                    <div className={styles.longRect}>
                        <img src="/assets/images/media.JPG" alt="Media Crew Banner" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GroupsContent;
