"use client";

import React, { useEffect, useRef, useState } from "react";

const About = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
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

            {/* About Us Section */}
            <section className="gap no-bottom about-us">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-sm-12">
                            <div className="content">
                                <h2 className="section-title" style={{ color: "#1f4372", fontWeight: 900, textTransform: "uppercase", lineHeight: "1.2" }}>
                                    WELCOME TO SOLUTION <br /> ARENA MINISTRY
                                </h2>

                                <p className="w-85">Solution Arena Ministry, also known as City of Truth, was founded on 1st
                                    February 2019 by the leading of the Holy
                                    Spirit. We are a Christ-centered, Word-based commission committed to presenting Jesus as the
                                    ultimate Solution and
                                    equipping believers to grow in purpose, maturity, and readiness for eternity.</p>

                                <div className="sidetwo-custom">
                                    <div className="contacts-custom">
                                        <ul className="service-list-custom">
                                            <li className="service-item-custom">
                                                <span className="icon">
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 559.98 559.98" style={{ width: "24px", height: "24px" }}>
                                                        <g>
                                                            <path
                                                                d="M279.99,0C125.601,0,0,125.601,0,279.99c0,154.39,125.601,279.99,279.99,279.99c154.39,0,279.99-125.601,279.99-279.99 C559.98,125.601,434.38,0,279.99,0z M279.99,498.78c-120.644,0-218.79-98.146-218.79-218.79 c0-120.638,98.146-218.79,218.79-218.79s218.79,98.152,218.79,218.79C498.78,400.634,400.634,498.78,279.99,498.78z" />
                                                            <path
                                                                d="M304.226,280.326V162.976c0-13.103-10.618-23.721-23.716-23.721c-13.102,0-23.721,10.618-23.721,23.721v124.928 c0,0.373,0.092,0.723,0.11,1.096c-0.312,6.45,1.91,12.999,6.836,17.926l88.343,88.336c9.266,9.266,24.284,9.266,33.543,0 c9.26-9.266,9.266-24.284,0-33.544L304.226,280.326z" />
                                                        </g>
                                                    </svg>
                                                </span>
                                                <p className="service-text"><strong className="navy-bold">Sunday:</strong> <span className="service-desc">Jesus Celebration Service – 8:30am to 11:30am</span></p>
                                            </li>
                                            <li className="service-item-custom">
                                                <span className="icon">
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 559.98 559.98" style={{ width: "24px", height: "24px" }}>
                                                        <g>
                                                            <path
                                                                d="M279.99,0C125.601,0,0,125.601,0,279.99c0,154.39,125.601,279.99,279.99,279.99c154.39,0,279.99-125.601,279.99-279.99 C559.98,125.601,434.38,0,279.99,0z M279.99,498.78c-120.644,0-218.79-98.146-218.79-218.79 c0-120.638,98.146-218.79,218.79-218.79s218.79,98.152,218.79,218.79C498.78,400.634,400.634,498.78,279.99,498.78z" />
                                                            <path
                                                                d="M304.226,280.326V162.976c0-13.103-10.618-23.721-23.716-23.721c-13.102,0-23.721,10.618-23.721,23.721v124.928 c0,0.373,0.092,0.723,0.11,1.096c-0.312,6.45,1.91,12.999,6.836,17.926l88.343,88.336c9.266,9.266,24.284,9.266,33.543,0 c9.26-9.266,9.266-24.284,0-33.544L304.226,280.326z" />
                                                        </g>
                                                    </svg>
                                                </span>
                                                <p className="service-text"><strong className="navy-bold">First Sunday Of Every Month:</strong> <span className="service-desc">Music And Communion Service – 5:00pm (Evening)</span></p>
                                            </li>
                                            <li className="service-item-custom">
                                                <span className="icon">
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 559.98 559.98" style={{ width: "24px", height: "24px" }}>
                                                        <g>
                                                            <path
                                                                d="M279.99,0C125.601,0,0,125.601,0,279.99c0,154.39,125.601,279.99,279.99,279.99c154.39,0,279.99-125.601,279.99-279.99 C559.98,125.601,434.38,0,279.99,0z M279.99,498.78c-120.644,0-218.79-98.146-218.79-218.79 c0-120.638,98.146-218.79,218.79-218.79s218.79,98.152,218.79,218.79C498.78,400.634,400.634,498.78,279.99,498.78z" />
                                                            <path
                                                                d="M304.226,280.326V162.976c0-13.103-10.618-23.721-23.716-23.721c-13.102,0-23.721,10.618-23.721,23.721v124.928 c0,0.373,0.092,0.723,0.11,1.096c-0.312,6.45,1.91,12.999,6.836,17.926l88.343,88.336c9.266,9.266,24.284,9.266,33.543,0 c9.26-9.266,9.266-24.284,0-33.544L304.226,280.326z" />
                                                        </g>
                                                    </svg>
                                                </span>
                                                <p className="service-text"><strong className="navy-bold">Wednesday:</strong> <span className="service-desc">Holy Ghost Empowerment Service – 6:00pm to 8:00pm</span></p>
                                            </li>
                                            <li className="service-item-custom">
                                                <span className="icon">
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 559.98 559.98" style={{ width: "24px", height: "24px" }}>
                                                        <g>
                                                            <path
                                                                d="M279.99,0C125.601,0,0,125.601,0,279.99c0,154.39,125.601,279.99,279.99,279.99c154.39,0,279.99-125.601,279.99-279.99 C559.98,125.601,434.38,0,279.99,0z M279.99,498.78c-120.644,0-218.79-98.146-218.79-218.79 c0-120.638,98.146-218.79,218.79-218.79s218.79,98.152,218.79,218.79C498.78,400.634,400.634,498.78,279.99,498.78z" />
                                                            <path
                                                                d="M304.226,280.326V162.976c0-13.103-10.618-23.721-23.716-23.721c-13.102,0-23.721,10.618-23.721,23.721v124.928 c0,0.373,0.092,0.723,0.11,1.096c-0.312,6.45,1.91,12.999,6.836,17.926l88.343,88.336c9.266,9.266,24.284,9.266,33.543,0 c9.26-9.266,9.266-24.284,0-33.544L304.226,280.326z" />
                                                        </g>
                                                    </svg>
                                                </span>
                                                <p className="service-text"><strong className="navy-bold">3rd Friday of Every Month:</strong> <span className="service-desc">Court Room Service – 9:00am to 11:00am</span></p>
                                            </li>
                                            <li className="service-item">
                                                <span className="icon">
                                                    <svg version="1.1" id="map-pin" xmlns="http://www.w3.org/2000/svg"
                                                        xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                                        viewBox="0 0 512 512" style={{ width: "24px", height: "24px" }}>
                                                        <g>
                                                            <g>
                                                                <path
                                                                    d="M256,0C153.755,0,70.573,83.182,70.573,185.426c0,126.888,165.939,313.167,173.004,321.035 c6.636,7.391,18.222,7.378,24.846,0c7.065-7.868,173.004-194.147,173.004-321.035C441.425,83.182,358.244,0,256,0z M256,278.719 c-51.442,0-93.292-41.851-93.292-93.293S204.559,92.134,256,92.134s93.291,41.851,93.291,93.293S307.441,278.719,256,278.719z" />
                                                            </g>
                                                        </g>
                                                    </svg>
                                                </span>
                                                <p className="service-text"><span className="service-desc">Mallam-Abaase Junction</span></p>
                                            </li>
                                        </ul>
                                        <p className="centered-info">All services are held <strong>in person</strong> at our church premises.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="church-about-video" style={{ marginTop: "40px", position: "relative" }}>
                                <video ref={videoRef} id="myVideo" poster="/assets/images/solution.JPG">
                                    <source src="/assets/videos/solution.MP4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>

                                <div id="btn-faws-play-pause" onClick={toggleVideo}>
                                    <div className="play-btn-circle">
                                        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} id="icon-play"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Beliefs Section */}
            <div id="beliefs" className="tailwind-scope" style={{ marginTop: "50px" }}>
                <div className="tw-py-16 tw-bg-gray-100" id="beliefs-section">
                    <div className="tw-max-w-7xl tw-mx-auto tw-px-4 tw-sm:px-6 tw-lg:px-8">
                        <div className="heading">
                            <img src="/assets/images/Logo.PNG" alt="Heading Image"
                                className="tw-mx-auto tw-block tw-max-w-[115px] tw-my-2" />
                            <p className="tw-text-center">Foundation of Faith and Practice</p>
                            <h2 className="tw-text-center tw-text-3xl tw-font-bold">Our Beliefs</h2>
                        </div>

                        <div className="beliefs-slider-container tw-mt-12 tw-overflow-hidden tw-relative">
                            <div id="beliefs-track" className="tw-flex tw-transition-transform tw-duration-500 tw-ease-in-out"
                                style={{ transform: `translateX(-${currentBeliefSlide * 100}%)` }}>
                                {chunks.map((chunk, slideIndex) => (
                                    <div key={slideIndex} className="beliefs-slide tw-w-full tw-flex-shrink-0">
                                        <div className={`tw-grid ${chunkSize === 2 ? 'tw-grid-cols-1' : 'tw-grid-cols-1 lg:tw-grid-cols-3'} tw-gap-8`}>
                                            {chunk.map((item, idx) => (
                                                <div key={idx} className="tw-bg-white tw-p-8 tw-rounded-lg tw-shadow-md">
                                                    <div className="tw-bg-blue-100 tw-w-16 tw-h-16 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-6 tw-mx-auto">
                                                        <i className={`${item.icon} tw-text-blue-600 tw-text-2xl`}></i>
                                                    </div>
                                                    <h3 className="tw-text-xl tw-font-bold tw-mb-4 tw-text-center">{item.title}</h3>
                                                    <p className="tw-text-gray-600">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div id="beliefs-dots" className="tw-flex tw-justify-center tw-mt-8 tw-gap-3">
                                {chunks.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`belief-dot tw-w-3 tw-h-3 tw-rounded-full tw-transition-all tw-duration-300 ${index === currentBeliefSlide ? 'tw-bg-blue-600' : 'tw-bg-gray-300'}`}
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
                            <div className="content services-online">
                                <h2>Join and Worship with us</h2>

                                <div className="sidetwo">
                                    <div className="contacts">
                                        <li className="service-item">
                                            <span className="icon">
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
                                                <li>
                                                    <h3>Sunday Worship Service</h3>
                                                </li>
                                                <li>
                                                    <p>Join us every week as we gather to praise, pray, and grow together
                                                        through the Word of God.</p>
                                                </li>
                                            </ul>
                                        </li>
                                    </div>

                                    <div className="contacts">
                                        <li className="service-item">
                                            <span className="icon">
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
                                                <li>
                                                    <h3>Music & Communion</h3>
                                                </li>
                                                <li>
                                                    <p>Join us on every first sunday of every month to sing and dine with the
                                                        lord </p>
                                                </li>
                                            </ul>
                                        </li>
                                    </div>

                                    <div className="contacts">
                                        <li className="service-item">
                                            <span className="icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
                                                    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path
                                                            d="M32 50c-8-7-16-12-16-18 0-4.4 3.6-8 8-8 2.5 0 4.7 1.1 6.2 2.9.8 1 1.3 2.1 1.8 3.1.5-1 1-2.1 1.8-3.1C35.3 25.1 37.5 24 40 24c4.4 0 8 3.6 8 8 0 6-8 11-16 18z" />
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
                                                <li>
                                                    <h3>Court Room Service</h3>
                                                </li>
                                                <li>
                                                    <p>Join as Every 3rd Sunday of every month for an amazing experience with the Lord.</p>
                                                </li>
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
                        <img src="/assets/images/Logo.PNG" alt="Heading Image" />
                        <p>Meet our able servants of God</p>
                        <h2>Our Pastors</h2>
                    </div>
                    <div className="row margin">
                        <div className="col-lg-4 col-md-6 col-sm-12 p-lg-0">
                            <div className="profile">
                                <img className="img-fluid w-100" src="/assets/images/Img-5.JPG" alt="Pastor Image" />
                                <div className="meta green-bg">
                                    <a className="font-bold text-white" href="/pastor-detail">Pastor Richard Adahhu</a>
                                    <p className="font-bold text-white">Assistant Pastor</p>
                                    <div className="social">
                                        <ul className="social-medias">
                                            <li><a href="#"><img src="/assets/images/facebook.svg" alt="facebook" /></a></li>
                                            <li><a href="#"><i className="fab fa-x-twitter"></i></a></li>
                                            <li><a href="#"><img src="/assets/images/instagram.svg" alt="instagram" /></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 col-sm-12 p-lg-0">
                            <div className="profile">
                                <img className="img-fluid w-100" src="/assets/images/Img-3.JPG" alt="Pastor Image" />
                                <div className="meta green-bg">
                                    <a className="font-bold text-white" href="/pastor-detail">Dr Emmanuel Boateng</a>
                                    <p className="font-bold text-white">Senior Pastor</p>
                                    <div className="social">
                                        <ul className="social-medias">
                                            <li><a href="#"><img src="/assets/images/facebook.svg" alt="facebook" /></a></li>
                                            <li><a href="#"><i className="fab fa-x-twitter"></i></a></li>
                                            <li><a href="#"><img src="/assets/images/instagram.svg" alt="instagram" /></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 col-sm-12 p-lg-0">
                            <div className="profile">
                                <img className="img-fluid w-100" src="/assets/images/Img-6.JPG" alt="Pastor Image 3" />
                                <div className="meta green-bg">
                                    <a className="font-bold text-white" href="/pastor-detail">Pastor Evan Anin</a>
                                    <p className="font-bold text-white">Assistant Pastor</p>
                                    <div className="social">
                                        <ul className="social-medias">
                                            <li><a href="#"><img src="/assets/images/facebook.svg" alt="facebook" /></a></li>
                                            <li><a href="#"><i className="fab fa-x-twitter"></i></a></li>
                                            <li><a href="#"><img src="/assets/images/instagram.svg" alt="instagram" /></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Styles */}
            <style jsx>{`
                /* Section Title */
                .section-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #2c3e50;
                    text-align: left;
                    margin-bottom: 20px;
                }

                @media (max-width: 992px) {
                    .section-title {
                        font-size: 1.9rem;
                    }
                }

                @media (max-width: 768px) {
                    .section-title {
                        font-size: 1.7rem;
                    }
                }

                @media (max-width: 576px) {
                    .section-title {
                        font-size: 1.5rem;
                        margin-top: 35px;
                    }
                }

                @media (max-width: 420px) {
                    .section-title {
                        font-size: 1.45rem;
                        margin-top: 50px;
                    }
                }

                /* Service Items */
                .service-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 20px 0;
                }

                .service-item {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 18px;
                    width: 100%;
                }

                .service-item .icon {
                    width: 48px;
                    height: 48px;
                    background: #1f4372;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 20px;
                    flex-shrink: 0;
                }

                .service-item .icon svg {
                    fill: white;
                    width: 24px;
                    height: 24px;
                }

                .service-text {
                    margin: 0;
                    line-height: 1.5;
                    font-family: 'Poppins', sans-serif;
                }

                .navy-bold {
                    color: #1f4372;
                    font-weight: 700;
                    font-size: 20px;
                    display: inline;
                }

                .service-desc {
                    color: #444;
                    font-weight: 400;
                    font-size: 19px;
                    display: inline;
                }

                .centered-info {
                    text-align: center;
                    font-size: 20px;
                    margin-top: 30px;
                    color: #000;
                    font-family: 'Poppins', sans-serif;
                    width: 100%;
                }

                .centered-info strong {
                    font-weight: 900;
                    color: #000;
                }

                /* Service Key Layout Styles */
                .contacts-custom {
                    width: 100%;
                    display: block;
                }

                .service-list-custom {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 20px 0;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }

                .service-item-custom {
                    display: flex; /* Row layout */
                    align-items: flex-start;
                    margin-bottom: 20px;
                    width: 100%;
                    position: relative;
                }

                .service-item-custom .icon {
                    flex-shrink: 0; /* Never shrink icon */
                    width: 48px;
                    height: 48px;
                    background: #2b476b;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 20px;
                }

                .service-item-custom .icon svg {
                    fill: white;
                    width: 24px;
                    height: 24px;
                }

                .service-text {
                    flex: 1; /* Take remaining width */
                    min-width: 0; /* Prevent flex overflow */
                    margin: 0;
                    padding-top: 2px; /* Visual alignment with icon */
                }

                .navy-bold {
                    color: #133869;
                    font-weight: 700;
                    font-size: 20px;
                    display: inline;
                }

                .service-desc {
                    color: #133869;
                    font-weight: 400;
                    font-size: 19px;
                    display: inline;
                }

                @media (max-width: 992px) {
                    .service-item-custom {
                        gap: 6px;
                    }
                    .service-item-custom .service-text {
                        font-size: 17px;
                    }
                    .service-item-custom .navy-bold {
                        font-size: 21px;
                    }
                    .service-item-custom .icon {
                        width: 40px;
                        height: 40px;
                    }
                    .service-item-custom .icon svg {
                        width: 20px;
                        height: 20px;
                    }
                }

                @media (max-width: 768px) {
                    .service-item-custom {
                        gap: 6px;
                    }
                    .service-item-custom .service-text {
                        font-size: 16px;
                    }
                    .service-item-custom .navy-bold {
                        font-size: 20px;
                    }
                    .service-item-custom .icon {
                        width: 36px;
                        height: 36px;
                        margin-right: 15px;
                    }
                    .service-item-custom .icon svg {
                        width: 18px;
                        height: 18px;
                    }
                }

                @media (max-width: 576px) {
                    .service-item-custom {
                        gap: 5px;
                        margin-bottom: 15px;
                    }
                    .service-item-custom .service-text {
                        font-size: 15px;
                    }
                    .service-item-custom .navy-bold {
                        font-size: 18px;
                    }
                    .service-item-custom .icon {
                        width: 32px;
                        height: 32px;
                        margin-right: 12px;
                    }
                    .service-item-custom .icon svg {
                        width: 16px;
                        height: 16px;
                    }
                }

                @media (max-width: 420px) {
                    .service-item-custom {
                        gap: 4px;
                    }
                    .service-item-custom .service-text {
                        font-size: 14px;
                    }
                    .service-item-custom .navy-bold {
                        font-size: 17px;
                    }
                    .service-item-custom .icon {
                        width: 28px;
                        height: 28px;
                        margin-right: 10px;
                    }
                    .service-item-custom .icon svg {
                        width: 14px;
                        height: 14px;
                    }
                }

                /* Video Player */
                .church-about-video {
                    position: relative;
                }

                .church-about-video video {
                    width: 100%;
                    height: 670px;
                    object-fit: cover;
                    border-radius: 20px;
                }

                #btn-faws-play-pause {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    cursor: pointer;
                    z-index: 2;
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .play-btn-circle {
                    width: 80px;
                    height: 80px;
                    background: #1f4372;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                }

                #icon-play {
                    color: white;
                    font-size: 30px;
                    margin-left: 5px; /* Offset to center triangle play icon */
                }

                .church-about-video:hover #btn-faws-play-pause {
                    transform: translate(-50%, -50%) scale(1.1);
                    opacity: 1;
                }

                @media (max-width: 992px) {
                    .church-about-video video {
                        height: 500px;
                    }
                    #btn-faws-play-pause {
                        font-size: 48px;
                    }
                }

                @media (max-width: 768px) {
                    .church-about-video video {
                        height: 420px;
                    }
                    #btn-faws-play-pause {
                        font-size: 45px;
                    }
                }

                @media (max-width: 576px) {
                    .church-about-video video {
                        height: 400px;
                        border-radius: 15px;
                    }
                    #btn-faws-play-pause {
                        font-size: 40px;
                    }
                }

                @media (max-width: 420px) {
                    .church-about-video video {
                        height: 420px;
                        border-radius: 12px;
                    }
                    #btn-faws-play-pause {
                        font-size: 36px;
                    }
                }

                /* Heading */
                .heading img {
                    display: block;
                    max-width: 115px;
                    height: auto;
                    margin: 0 auto;
                    transform: translateY(8px);
                }

                @media (max-width: 480px) {
                    .heading img {
                        transform: translateY(15px);
                        max-width: 90px;
                    }
                }

                /* Pastor Profiles */
                .profile img.img-fluid {
                    height: 580px !important;
                    width: 100% !important;
                    object-fit: cover;
                    display: block;
                }

                .profile {
                    margin: 5px;
                }

                .social-medias li a i {
                    font-size: 20px;
                }

                /* Tailwind Scope */
                .tailwind-scope {
                    all: initial;
                }

                .tailwind-scope * {
                    all: unset;
                }
            `}</style>

            {/* Tailwind CDN */}
            <script src="https://cdn.tailwindcss.com"></script>
            <script dangerouslySetInnerHTML={{
                __html: `
                    tailwind.config = {
                        prefix: 'tw-',
                        content: [
                            '.tailwind-scope *',
                            '.tailwind-scope'
                        ]
                    };
                `
            }} />
        </div>
    );
};

export default About;
