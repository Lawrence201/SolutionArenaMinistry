"use client";

import React, { useEffect } from "react";
import Link from 'next/link';

const HomeAbout = () => {
    useEffect(() => {
        // Manually initialize slick for prayers-slider
        const timer = setTimeout(() => {
            if (typeof window !== "undefined" && (window as any).$ && (window as any).$.fn.slick) {
                const $ = (window as any).$;
                const $slider = $(".prayers-slider");
                if ($slider.length && !$slider.hasClass('slick-initialized')) {
                    $slider.slick({
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        arrows: false,
                        dots: true,
                        autoplay: true,
                        autoplaySpeed: 5000,
                        speed: 1000,
                        fade: true,
                        cssEase: 'linear'
                    });
                }
            }
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="gap no-top about-one">
            <div className="container">
                <div className="row align-items-end">
                    <div className="col-lg-6 col-md-12 col-sm-12">
                        <div className="about-data">
                            <h2>A Church Built on the Word and Anchored in Love</h2>
                            <p>
                                We are a Word-based church devoted to honoring God and showing His love to all people. Our
                                heart is to teach the truth
                                of Scripture with clarity, nurture spiritual growth, and create a warm, welcoming family
                                where everyone matters.
                                Wherever you are in your walk with God, you’ll find encouragement, support, and a place to
                                belong with us.
                            </p>
                            <Link href="/about-us" className="theme-btn">More About Us</Link>
                        </div>

                        <div className="about-gallery gallery">
                            <figure className="fade-figure">
                                <img className="img-main" src="/assets/images/Img-5.JPG" alt="about image" />
                                <img className="img-hidden" src="/assets/images/sam.jpg" alt="about image hidden" />
                                <a data-fancybox="gallery" href="/assets/images/Img-5.JPG">
                                    <img src="/assets/images/plus.svg" alt="Plus" />
                                </a>
                            </figure>

                            <style dangerouslySetInnerHTML={{
                                __html: `
                                    /* Base image */
                                    .img-main {
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        animation: fadeMain 10s infinite;
                                        /* longer loop */
                                    }

                                    /* Second image */
                                    .img-hidden {
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        opacity: 0;
                                        animation: fadeHidden 10s infinite;
                                    }

                                    /* Keyframes for crossfade */
                                    @keyframes fadeMain {
                                        0% { opacity: 1; }
                                        80% { opacity: 1; }
                                        90% { opacity: 0; }
                                        100% { opacity: 0; }
                                    }

                                    @keyframes fadeHidden {
                                        0% { opacity: 0; }
                                        80% { opacity: 0; }
                                        90% { opacity: 1; }
                                        100% { opacity: 1; }
                                    }
                                `
                            }} />

                            <figure>
                                <img src="/assets/images/Img-6.JPG" alt="about image" />
                                <a data-fancybox="gallery" href="/assets/images/Img-6.JPG">
                                    <img src="/assets/images/plus.svg" alt="Plus 1" />
                                </a>
                            </figure>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-12 col-sm-12">
                        <div className="prayers-slider green-bg">
                            <div>
                                <img className="img-fluid w-100" src="/assets/images/Img-3.JPG" alt="About Image"
                                    style={{ width: "640px", height: "500px", objectFit: "cover", display: "block", maxHeight: "100%", objectPosition: "top" }} />
                                <div className="slider-data">
                                    <h2 className="text-white">O Lord, you have searched me out and known me; you know my
                                        sitting down and my rising up.</h2>
                                    <h3 className="text-white">Psalm 139: 1-2</h3>
                                </div>
                            </div>
                            <div>
                                <img className="img-fluid w-100" src="/assets/images/lady_1.jpg" alt="About Image"
                                    style={{ width: "640px", height: "500px", objectFit: "cover", display: "block", maxHeight: "100%", objectPosition: "top" }} />
                                <div className="slider-data">
                                    <h2 className="text-white">Unless the Lord builds the house, those who build it labour in
                                        vain.</h2>
                                    <h3 className="text-white">Psalm 127: 1-2</h3>
                                </div>
                            </div>
                            <div>
                                <img className="img-fluid w-100" src="/assets/images/Img-2.JPG" alt="About Image"
                                    style={{ width: "640px", height: "500px", objectFit: "cover", display: "block", maxHeight: "100%", objectPosition: "top" }} />
                                <div className="slider-data">
                                    <h2 className="text-white">God is with you, wherever you may be and whatever you may choose
                                        to do.</h2>
                                    <h3 className="text-white">Psalm 127: 1-2</h3>
                                </div>
                            </div>
                            <div>
                                <img className="img-fluid w-100" src="/assets/images/lady_2.JPG" alt="About Image"
                                    style={{ width: "640px", height: "500px", objectFit: "cover", display: "block", maxHeight: "100%", objectPosition: "top" }} />
                                <div className="slider-data">
                                    <h2 className="text-white">"And above all these things put on love, which is the bond of
                                        perfectness."</h2>
                                    <h3 className="text-white">Colossians 3:14 (KJV)</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeAbout;
