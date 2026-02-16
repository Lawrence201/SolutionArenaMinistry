"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./About.module.css";

const About = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [currentBeliefSlide, setCurrentBeliefSlide] = useState(0);
    const [chunkSize, setChunkSize] = useState(6);

    const beliefsData = [
        {
            title: "Word-Based Church",
            icon: "fa-solid fa-book",
            desc: "Every act and speech is tested against the Bible. We are strictly a Word-based church."
        },
        {
            title: "Holy Spirit",
            icon: "fa-solid fa-dove",
            desc: "We are a Holy Ghost-filled, tongues-speaking church, relying on the Spirit's guidance."
        },
        {
            title: "Ministry",
            icon: "fa-solid fa-church",
            desc: "We are a Teaching, Evangelistic, Prophetic, and Apostolic ministry."
        },
        {
            title: "Women's Ministry",
            icon: "fa-solid fa-female",
            desc: "We believe in women's ministry and fully support the participation of women in God's work."
        },
        {
            title: "Music",
            icon: "fa-solid fa-music",
            desc: "We are a highly musical church that values worship and praise through music."
        },
        {
            title: "Gifts of the Spirit",
            icon: "fa-solid fa-gift",
            desc: "We believe in the operation of the gifts of the Spirit in the church today."
        },
        {
            title: "Generous Giving",
            icon: "fa-solid fa-hand-holding-dollar",
            desc: "We believe in generous giving, freely and willingly, not under compulsion."
        },
        {
            title: "Value of Every Soul",
            icon: "fa-solid fa-heart",
            desc: "We believe every soul is valuable and must be treated with empathy, love, and respect."
        },
        {
            title: "Righteous Living",
            icon: "fa-solid fa-hand-sparkles",
            desc: "We believe in imputed righteousness, grace, and holy living as the lifestyle of a believer."
        },
        {
            title: "Eternal Life",
            icon: "fa-solid fa-infinity",
            desc: "We believe in eternal life, judgment, heaven, and hell as taught in Scripture."
        }
    ];

    const toggleVideo = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            setChunkSize(isMobile ? 2 : 6);
            setCurrentBeliefSlide(0);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const chunks = [];
    for (let i = 0; i < beliefsData.length; i += chunkSize) {
        chunks.push(beliefsData.slice(i, i + chunkSize));
    }

    const moveBeliefsSlide = (index: number) => {
        setCurrentBeliefSlide(index);
    };

    return (
        <div id="about">
            {/* Banner Section */}
            {/* Banner Section */}
            <section className="banner position-relative" style={{ minHeight: "400px" }}>
                <div className="parallax" style={{ backgroundImage: "url(/assets/images/about.jpg)", minHeight: "600px" }}></div>
                <div className="banner-data text-center">
                    <h2 className="text-white font-bold">About Us</h2>
                    <ul className="flex-all">
                        <li><a href="/" className="text-white">Home</a></li>
                        <li><a href="/about-us" className="text-white">About Us</a></li>
                    </ul>
                </div>
            </section>

            {/* Introduction Section */}
            <section className="gap no-bottom about-us">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-sm-12">
                            <div className="content">
                                <h2 className={styles.sectionTitle}>Welcome to Solution Arena Ministry</h2>
                                <p className={styles.w85}>
                                    Solution Arena Ministry, also known as City of Truth, was founded on 1st
                                    February 2019 by the leading of the Holy
                                    Spirit. We are a Christ-centered, Word-based commission committed to presenting Jesus as the
                                    ultimate Solution and
                                    equipping believers to grow in purpose, maturity, and readiness for eternity.
                                </p>

                                <div className={`sidetwo ${styles.sidetwo}`}>
                                    <div className={styles.contacts}>
                                        <ul className="list-unstyled">
                                            <li className={styles.serviceItem}>
                                                <span className={styles.icon}>
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 559.98 559.98" style={{ width: "24px", height: "24px" }}>
                                                        <g>
                                                            <path d="M279.99,0C125.601,0,0,125.601,0,279.99c0,154.39,125.601,279.99,279.99,279.99c154.39,0,279.99-125.601,279.99-279.99 C559.98,125.601,434.38,0,279.99,0z M279.99,498.78c-120.644,0-218.79-98.146-218.79-218.79 c0-120.638,98.146-218.79,218.79-218.79s218.79,98.152,218.79,218.79C498.78,400.634,400.634,498.78,279.99,498.78z" />
                                                            <path d="M304.226,280.326V162.976c0-13.103-10.618-23.721-23.716-23.721c-13.102,0-23.721,10.618-23.721,23.721v124.928 c0,0.373,0.092,0.723,0.11,1.096c-0.312,6.45,1.91,12.999,6.836,17.926l88.343,88.336c9.266,9.266,24.284,9.266,33.543,0 c9.26-9.266,9.266-24.284,0-33.544L304.226,280.326z" />
                                                        </g>
                                                    </svg>
                                                </span>
                                                <p className={styles.themeClr}><strong>Sunday:</strong> Jesus Celebration Service – 8:30am to 11:30am</p>
                                            </li>
                                            <li className={styles.serviceItem}>
                                                <span className={styles.icon}>
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 559.98 559.98" style={{ width: "24px", height: "24px" }}>
                                                        <g>
                                                            <path d="M279.99,0C125.601,0,0,125.601,0,279.99c0,154.39,125.601,279.99,279.99,279.99c154.39,0,279.99-125.601,279.99-279.99 C559.98,125.601,434.38,0,279.99,0z M279.99,498.78c-120.644,0-218.79-98.146-218.79-218.79 c0-120.638,98.146-218.79,218.79-218.79s218.79,98.152,218.79,218.79C498.78,400.634,400.634,498.78,279.99,498.78z" />
                                                            <path d="M304.226,280.326V162.976c0-13.103-10.618-23.721-23.716-23.721c-13.102,0-23.721,10.618-23.721,23.721v124.928 c0,0.373,0.092,0.723,0.11,1.096c-0.312,6.45,1.91,12.999,6.836,17.926l88.343,88.336c9.266,9.266,24.284,9.266,33.543,0 c9.26-9.266,9.266-24.284,0-33.544L304.226,280.326z" />
                                                        </g>
                                                    </svg>
                                                </span>
                                                <p className={styles.themeClr}><strong>First Sunday Of Every Month:</strong> Music And Communion Service – 5:00pm (Evening)</p>
                                            </li>
                                            <li className={styles.serviceItem}>
                                                <span className={styles.icon}>
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 559.98 559.98" style={{ width: "24px", height: "24px" }}>
                                                        <g>
                                                            <path d="M279.99,0C125.601,0,0,125.601,0,279.99c0,154.39,125.601,279.99,279.99,279.99c154.39,0,279.99-125.601,279.99-279.99 C559.98,125.601,434.38,0,279.99,0z M279.99,498.78c-120.644,0-218.79-98.146-218.79-218.79 c0-120.638,98.146-218.79,218.79-218.79s218.79,98.152,218.79,218.79C498.78,400.634,400.634,498.78,279.99,498.78z" />
                                                            <path d="M304.226,280.326V162.976c0-13.103-10.618-23.721-23.716-23.721c-13.102,0-23.721,10.618-23.721,23.721v124.928 c0,0.373,0.092,0.723,0.11,1.096c-0.312,6.45,1.91,12.999,6.836,17.926l88.343,88.336c9.266,9.266,24.284,9.266,33.543,0 c9.26-9.266,9.266-24.284,0-33.544L304.226,280.326z" />
                                                        </g>
                                                    </svg>
                                                </span>
                                                <p className={styles.themeClr}><strong>Wednesday:</strong> Holy Ghost Empowerment Service – 6:00pm to 8:00pm</p>
                                            </li>
                                            <li className={styles.serviceItem}>
                                                <span className={styles.icon}>
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 559.98 559.98" style={{ width: "24px", height: "24px" }}>
                                                        <g>
                                                            <path d="M279.99,0C125.601,0,0,125.601,0,279.99c0,154.39,125.601,279.99,279.99,279.99c154.39,0,279.99-125.601,279.99-279.99 C559.98,125.601,434.38,0,279.99,0z M279.99,498.78c-120.644,0-218.79-98.146-218.79-218.79 c0-120.638,98.146-218.79,218.79-218.79s218.79,98.152,218.79,218.79C498.78,400.634,400.634,498.78,279.99,498.78z" />
                                                            <path d="M304.226,280.326V162.976c0-13.103-10.618-23.721-23.716-23.721c-13.102,0-23.721,10.618-23.721,23.721v124.928 c0,0.373,0.092,0.723,0.11,1.096c-0.312,6.45,1.91,12.999,6.836,17.926l88.343,88.336c9.266,9.266,24.284,9.266,33.543,0 c9.26-9.266,9.266-24.284,0-33.544L304.226,280.326z" />
                                                        </g>
                                                    </svg>
                                                </span>
                                                <p className={styles.themeClr}><strong>3rd Friday of Every Month:</strong> Court Room Service – 9:00am to 11:00am</p>
                                            </li>
                                            <li className={styles.serviceItem}>
                                                <span className={styles.icon}>
                                                    <svg version="1.1" id="map-pin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: "24px", height: "24px" }}>
                                                        <g>
                                                            <g>
                                                                <path d="M256,0C153.755,0,70.573,83.182,70.573,185.426c0,126.888,165.939,313.167,173.004,321.035 c6.636,7.391,18.222,7.378,24.846,0c7.065-7.868,173.004-194.147,173.004-321.035C441.425,83.182,358.244,0,256,0z M256,278.719 c-51.442,0-93.292-41.851-93.292-93.293S204.559,92.134,256,92.134s93.291,41.851,93.291,93.293S307.441,278.719,256,278.719z" />
                                                            </g>
                                                        </g>
                                                    </svg>
                                                </span>
                                                <p className={styles.themeClr}>Mallam-Abaase Junction</p>
                                            </li>
                                            <li>
                                                <p className={styles.themeClr} style={{ fontSize: "24px", marginTop: "20px" }}>All services are held <strong>in person</strong> at our church premises.</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div
                                className={styles.churchAboutVideo}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <video ref={videoRef} id="myVideo" poster="/assets/images/solution.JPG">
                                    <source src="/assets/videos/solution.MP4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>

                                <div
                                    className={styles.playBtnCircle}
                                    onClick={toggleVideo}
                                    style={{
                                        opacity: isPlaying ? (isHovered ? 1 : 0) : (isHovered ? 1 : 0),
                                        visibility: (isHovered || !isPlaying) ? 'visible' : 'hidden'
                                    }}
                                >
                                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{
                                        marginLeft: isPlaying ? '0' : '8px'
                                    }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Beliefs Section */}
            <div id="beliefs" className="our-beliefs" style={{ marginTop: "50px" }}>
                <div className="py-16 bg-gray-100" id="beliefs-section">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="heading">
                            <img src="/assets/images/Logo.PNG" alt="Heading Image" className={styles.headingImg} style={{ margin: '0 auto', display: 'block' }} />
                            <p className="text-center">Foundation of Faith and Practice</p>
                            <h2 className="text-center text-3xl font-bold">Our Beliefs</h2>
                        </div>

                        <div className="beliefs-slider-container mt-12 overflow-hidden relative">
                            <div
                                id="beliefs-track"
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${currentBeliefSlide * 100}%)` }}
                            >
                                {chunks.map((chunk, slideIndex) => (
                                    <div key={slideIndex} className="beliefs-slide w-full flex-shrink-0">
                                        <div className={`grid ${chunkSize === 2 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-8`}>
                                            {chunk.map((item, idx) => (
                                                <div key={idx} className="bg-white p-8 rounded-lg shadow-md">
                                                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                                                        <i className={`${item.icon} text-blue-600 text-2xl`}></i>
                                                    </div>
                                                    <h3 className="text-xl font-bold mb-4 text-center">{item.title}</h3>
                                                    <p className="text-gray-600">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div id="beliefs-dots" className="flex justify-center mt-8 gap-3">
                                {chunks.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`belief-dot w-3 h-3 rounded-full transition-all duration-300 ${index === currentBeliefSlide ? 'bg-blue-600' : 'bg-gray-300'}`}
                                        onClick={() => moveBeliefsSlide(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Join and Worship Section */}
            <section id="join-us" className="gap about-us">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="church-about-img-two">
                                <img src="/assets/images/draw.PNG" alt="church-about-img-two" />
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-12 col-sm-12">
                            <div className={`content ${styles.servicesOnline}`}>
                                <h2>Join and Worship with us</h2>
                                <div className="sidetwo">
                                    <div className={styles.contacts}>
                                        <li className={styles.serviceItem}>
                                            <span className={styles.icon}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
                                                    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="32" y1="4" x2="32" y2="16" />
                                                        <line x1="26" y1="10" x2="38" y2="10" />
                                                        <path d="M12 28L32 16L52 28V56H12V28Z" />
                                                        <rect x="28" y="42" width="8" height="14" />
                                                        <rect x="20" y="34" width="6" height="8" />
                                                        <rect x="38" y="34" width="6" height="8" />
                                                        <polyline points="8,30 32,18 56,30" />
                                                    </g>
                                                </svg>
                                            </span>
                                            <ul>
                                                <li><h3>Sunday Worship Service</h3></li>
                                                <li><p>Join us every week as we gather to praise, pray, and grow together through the Word of God.</p></li>
                                            </ul>
                                        </li>
                                    </div>

                                    <div className={styles.contacts}>
                                        <li className={styles.serviceItem}>
                                            <span className={styles.icon}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
                                                    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M18 38c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.2 5 5z" />
                                                        <line x1="18" y1="12" x2="18" y2="38" />
                                                        <path d="M34 32c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.2 5 5z" />
                                                        <line x1="34" y1="8" x2="34" y2="32" />
                                                        <line x1="18" y1="12" x2="34" y2="8" />
                                                        <path d="M44 26h8v2c0 2.8-2.2 5-5 5h-2c-2.8 0-5-2.2-5-5v-2h8z" />
                                                        <line x1="48" y1="33" x2="48" y2="42" />
                                                        <line x1="44" y1="42" x2="52" y2="42" />
                                                        <rect x="46" y="24" width="4" height="6" />
                                                        <circle cx="48" cy="18" r="4" />
                                                        <line x1="48" y1="16" x2="48" y2="20" />
                                                        <line x1="46" y1="18" x2="50" y2="18" />
                                                    </g>
                                                </svg>
                                            </span>
                                            <ul>
                                                <li><h3>Music & Communion</h3></li>
                                                <li><p>Join us on every first sunday of every month to sing and dine with the lord</p></li>
                                            </ul>
                                        </li>
                                    </div>

                                    <div className={styles.contacts}>
                                        <li className={styles.serviceItem}>
                                            <span className={styles.icon}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
                                                    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M32 50c-8-7-16-12-16-18 0-4.4 3.6-8 8-8 2.5 0 4.7 1.1 6.2 2.9.8 1 1.3 2.1 1.8 3.1.5-1 1-2.1 1.8-3.1C35.3 25.1 37.5 24 40 24c4.4 0 8 3.6 8 8 0 6-8 11-16 18z" />
                                                        <circle cx="18" cy="16" r="3" />
                                                        <path d="M12 24c0-2 2.7-4 6-4s6 2 6 4v4H12v-4z" />
                                                        <circle cx="32" cy="14" r="3" />
                                                        <path d="M26 22c0-2 2.7-4 6-4s6 2 6 4v4H26v-4z" />
                                                        <circle cx="46" cy="16" r="3" />
                                                        <path d="M40 24c0-2 2.7-4 6-4s6 2 6 4v4H40v-4z" />
                                                    </g>
                                                </svg>
                                            </span>
                                            <ul>
                                                <li><h3>Court Room Service</h3></li>
                                                <li><p>Join as Every 3rd Sunday of every month for an amazing experience with the Lord.</p></li>
                                            </ul>
                                        </li>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Faith Quote Section */}
            <section className="gap pray">
                <div className="parallax" style={{ backgroundImage: "url(/assets/images/faith.jpg)" }}></div>
                <div className="container">
                    <div className="row">
                        <div className="pray-data text-center">
                            <h2 className="m-auto text-white">"Faith is the anchor that keeps us steady, trusting that God is
                                working even when we
                                cannot see."</h2>
                            <p className="text-white font-bold">Hebrews 11:1</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Pastors Section */}
            <section className="gap pastor">
                <div className="container">
                    <div className="heading">
                        <img src="/assets/images/Logo.PNG" alt="Heading Image" style={{ display: 'block', maxWidth: '115px', height: 'auto', margin: '0 auto' }} />
                        <p>Meet our able servants of God</p>
                        <h2>Our Pastors</h2>
                    </div>
                    <div className="row margin">
                        <div className="col-lg-4 col-md-6 col-sm-12 p-lg-0">
                            <div className={`profile ${styles.profile}`}>
                                <img className={`img-fluid w-100 ${styles.profileImgFluid}`} src="/assets/images/Img-5.JPG" alt="Pastor Image" />
                                <div className="meta green-bg">
                                    <a className="font-bold text-white" href="/pastor-detail">Pastor Richard Adahhu</a>
                                    <p className="font-bold text-white">Assistant Pastor</p>
                                    <div className="social">
                                        <ul className="social-medias">
                                            <li><a href="JavaScript:void(0)"><img src="/assets/images/facebook.svg" alt="facebook" /></a></li>
                                            <li><a href="JavaScript:void(0)"><i className="fab fa-x-twitter"></i></a></li>
                                            <li><a href="JavaScript:void(0)"><img src="/assets/images/instagram.svg" alt="instagram" /></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 col-sm-12 p-lg-0">
                            <div className={`profile ${styles.profile}`}>
                                <img className={`img-fluid w-100 ${styles.profileImgFluid}`} src="/assets/images/Img-3.JPG" alt="Pastor Image" />
                                <div className="meta green-bg">
                                    <a className="font-bold text-white" href="/pastor-detail">Dr Emmanuel Boateng</a>
                                    <p className="font-bold text-white">Senior Pastor</p>
                                    <div className="social">
                                        <ul className="social-medias">
                                            <li><a href="JavaScript:void(0)"><img src="/assets/images/facebook.svg" alt="facebook" /></a></li>
                                            <li><a href="JavaScript:void(0)"><i className="fab fa-x-twitter"></i></a></li>
                                            <li><a href="JavaScript:void(0)"><img src="/assets/images/instagram.svg" alt="instagram" /></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 col-sm-12 p-lg-0">
                            <div className={`profile ${styles.profile}`}>
                                <img className={`img-fluid w-100 ${styles.profileImgFluid}`} src="/assets/images/Img-6.JPG" alt="Pastor Image 3" />
                                <div className="meta green-bg">
                                    <a className="font-bold text-white" href="/pastor-detail">Pastor Evan Anin</a>
                                    <p className="font-bold text-white">Assistant Pastor</p>
                                    <div className="social">
                                        <ul className="social-medias">
                                            <li><a href="JavaScript:void(0)"><img src="/assets/images/facebook.svg" alt="facebook" /></a></li>
                                            <li><a href="JavaScript:void(0)"><i className="fab fa-x-twitter"></i></a></li>
                                            <li><a href="JavaScript:void(0)"><img src="/assets/images/instagram.svg" alt="instagram" /></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tailwind CDN */}
            <script src="https://cdn.tailwindcss.com"></script>
        </div>
    );
};

export default About;
