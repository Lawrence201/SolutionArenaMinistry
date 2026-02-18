"use client";

import React from "react";
import styles from "./MinistersSection.module.css";

const MinistersSection = () => {
    const ministers = [
        {
            name: "Minister Bright Acaqua",
            description: "Leading with passion and dedication to serve the community."
        },
        {
            name: "Minister Gloria Doryomo",
            description: "Committed to spiritual growth and guidance for all members."
        },
        {
            name: "Minister Rebecca Tetteh",
            description: "Empowering faith and nurturing lives with love and care."
        },
        {
            name: "Minister Micheal",
            description: "Guiding the congregation with wisdom and unwavering devotion."
        }
    ];

    return (
        <section className={`gap pastor ${styles.ministersSection}`}>
            <div className="container">
                <div className={styles.heading}>
                    <img src="/assets/images/Logo.PNG" alt="Heading Image" />
                    <p>Meet our Able Ministers of God</p>
                    <h2>Our Ministers</h2>
                </div>

                <div className={styles.longRect}>
                    <img src="/assets/images/ministers.JPG" alt="Long Rectangle Banner" />
                </div>

                <div className={styles.ministersList}>
                    {ministers.map((minister, index) => (
                        <div key={index} className={styles.minister}>
                            <h3>{minister.name}</h3>
                            <p>{minister.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MinistersSection;
