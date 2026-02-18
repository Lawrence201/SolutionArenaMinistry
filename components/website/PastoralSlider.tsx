"use client";

import React, { useState } from "react";
import styles from "./PastoralSlider.module.css";

const PastoralSlider = () => {
    // Array of images for the slider
    const sliderImages = [
        { id: 1, src: "/assets/images/lady_4.JPG", alt: "lady 4" },
        { id: 2, src: "/assets/images/lady-5.jpg", alt: "lady 5" },
        { id: 3, src: "/assets/images/lady-6.JPG", alt: "lady 6" },
        { id: 4, src: "/assets/images/lady-7.JPG", alt: "lady 7" },
    ];

    // Main image state
    const [mainImage, setMainImage] = useState("/assets/images/lady-3.JPG");
    const [activeSlide, setActiveSlide] = useState(0); // 0 means default main image, 1-4 for next-slides

    const handleSlideClick = (src: string, id: number) => {
        setMainImage(src);
        setActiveSlide(id);
    };

    return (
        <section className={`gap no-top ${styles.circleSlider}`}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6">
                        <div className={styles.cSlider}>
                            <div>
                                <h2 className="font-bold">The Role of Pastors in Guiding Church Members</h2>
                                <p>
                                    “ Pastors play a vital role in nurturing the spiritual growth of the church. They teach
                                    God’s Word with clarity, offer counsel during difficult seasons, provide leadership
                                    that builds unity, and serve as shepherds who care for the wellbeing of every member.
                                    Their dedication strengthens the entire church community. ”
                                </p>
                                <ul className="list-unstyled">
                                    <li>
                                        <h3 className="font-bold">Pastoral Service Overview</h3>
                                    </li>
                                    <li className="d-flex font-bold">
                                        Emphasizing the commitment of{" "}
                                        <span className={styles.themeClr}>&nbsp;Solution Arena Ministry</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className={styles.navCSlider}>
                            {sliderImages.map((image) => (
                                <a
                                    key={image.id}
                                    className={`${styles.nextSlide} ${activeSlide === image.id ? styles.navActive : ""}`}
                                    href="JavaScript:void(0)"
                                    onClick={() => handleSlideClick(image.src, image.id)}
                                >
                                    <img
                                        className="animate__animated animate__fadeIn"
                                        src={image.src}
                                        alt={image.alt}
                                    />
                                </a>
                            ))}

                            <div className={styles.sliderMainImg}>
                                <img src={mainImage} alt="Main Pastor" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PastoralSlider;
