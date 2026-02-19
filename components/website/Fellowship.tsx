"use client";

import React from "react";

const Fellowship = () => {
    return (
        <section className="gap fellowship">
            <div className="container">
                <h2 className="text-center mx-auto">Our Divine Mission, Transformational Vision, and the Love-Centered Culture
                    We Uphold</h2>
                <div className="row">
                    <div className="col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="200"
                        data-aos-duration="400">
                        <div className="offer text-center">
                            <span>
                                <img src="/assets/images/mission.png" alt="Wedding" />
                            </span>
                            <h3><a href="#" onClick={(e) => e.preventDefault()}>Our Mission</a></h3>
                            <p className="mx-auto">SOLUTION Arena Ministry is a commission with a divine mandate to present
                                Jesus the Solutionist to the world and conform
                                all men into His image.</p>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="400"
                        data-aos-duration="700">
                        <div className="offer text-center">
                            <span>
                                <img src="/assets/images/pray.svg" alt="Pray" />
                            </span>
                            <h3><a href="#" onClick={(e) => e.preventDefault()}>Our Vision</a></h3>
                            <p className="mx-auto">Our vision is to make God's people useful on earth and prepared for Heaven
                                through the teachings and
                                exhortation of God's Word.</p>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="600"
                        data-aos-duration="800">
                        <div className="offer text-center">
                            <span>
                                <img src="/assets/images/handshake.png" alt="Bird" />
                            </span>
                            <h3><a href="#" onClick={(e) => e.preventDefault()}>Our Greetings</a></h3>
                            <p className="mx-auto">Love God Love The Church, Love The Pastor Love Everyone. This teaches us to
                                Love God first, give honor to the Pastor and love everyone</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Fellowship;
