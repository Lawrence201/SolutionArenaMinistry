"use client";

import React, { useState, useEffect } from "react";

interface FooterEvent {
    id: number;
    name: string;
    start_date: string;
    image_path: string;
}

const Footer = () => {
    const [events, setEvents] = useState<FooterEvent[]>([]);

    useEffect(() => {
        const fetchFooterEvents = async () => {
            try {
                const response = await fetch('/api/website/footer-events');
                const data = await response.json();
                if (data.success) {
                    setEvents(data.events);
                }
            } catch (err) {
                console.error("Error loading footer events:", err);
            }
        };
        fetchFooterEvents();
    }, []);

    return (
        <>
            {/* Subscribe Section */}
            <section className="subscribe" style={{ backgroundColor: "#1f4372", padding: "60px 0" }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-5 col-md-12 col-sm-12">
                            <h3 className="text-white" style={{ fontSize: "40px", fontWeight: "bold", margin: "0" }}>Let’s Keep in Touch!</h3>
                            <p className="text-white" style={{ fontSize: "17px", marginTop: "5px" }}>Subscribe to keep up with fresh news and exciting updates.</p>
                        </div>
                        <div className="col-lg-7 col-md-12 col-sm-12">
                            <form style={{ position: "relative" }}>
                                <input
                                    type="email"
                                    name="Email"
                                    placeholder="Enter Your Email Address..."
                                    style={{
                                        width: "100%",
                                        height: "80px",
                                        fontSize: "18px",
                                        paddingLeft: "40px",
                                        color: "#a0a0a0",
                                        border: "0",
                                        backgroundColor: "white"
                                    }}
                                />
                                <button style={{
                                    position: "absolute",
                                    top: "50%",
                                    right: "5px",
                                    transform: "translateY(-50%)",
                                    height: "70px",
                                    width: "150px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "white",
                                    textTransform: "uppercase",
                                    border: "1px solid white",
                                    backgroundColor: "#1f4372",
                                    cursor: "pointer",
                                    transition: "0.3s"
                                }}>SUBSCRIBE</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="gap footer-one no-bottom green-overlay">
                <div className="parallax" style={{ backgroundImage: "url(/assets/images/footer-bg.webp)" }}></div>
                <div className="container">
                    <div className="row part-one">
                        <div className="col-lg-3 col-md-6 col-sm-12">
                            <div className="logo-box">
                                <div className="logo-img-area">
                                    <a href="/">
                                        <img src="/assets/images/head.PNG" alt="Logo" />
                                    </a>
                                </div>
                                <div className="logo-caption">
                                    <h1>SOLUTION ARENA <br /> MINISTRY</h1>
                                    <p>The City of truth</p>
                                </div>
                            </div>

                            <style dangerouslySetInnerHTML={{
                                __html: `
                  .logo-img-area img {
                    display: block;
                    max-width: 125px;
                    height: auto;
                  }
                  .logo-box {
                    display: flex;
                    align-items: center;
                  }
                  .logo-caption {
                    text-align: left;
                    position: relative;
                    top: 10px;
                  }
                  .logo-caption h1 {
                    font-size: 20px;
                    font-weight: 900;
                    color: #1f4372;
                    margin: 0;
                    font-family: "Montserrat", sans-serif;
                  }
                  .logo-caption p {
                    font-size: 14px;
                    font-weight: 500;
                    color: #edb109;
                    font-family: "Cinzel", serif;
                  }
                  @media (max-width: 780px) {
                    .logo-img-area img { max-width: 110px; }
                    .logo-caption h1 { font-size: 18px; }
                    .logo-caption p { font-size: 13px; }
                    .logo-caption { top: 5px; left: -15px; }
                  }
                  @media (max-width: 480px) {
                    .logo-img-area img { max-width: 120px; }
                    .logo-box { flex-direction: row; align-items: center; justify-content: flex-start; }
                    .logo-caption { text-align: left; position: relative; top: 10px; left: 0px; margin-left: 8px; }
                    .logo-caption h1 { font-size: 16px; }
                    .logo-caption p { font-size: 12px; position: relative; top: -5px; }
                    
                    /* Subscribe Section Mobile Font Sizes */
                    .subscribe h3 {
                      font-size: 28px !important;
                    }
                    .subscribe p {
                      font-size: 14px !important;
                    }
                  }
                `}} />

                            <p className="text-white" style={{ marginTop: "20px" }}>For more enquiries:</p>
                            <div className="footer-contact">
                                <p className="text-white">
                                    <span style={{ color: "#355a8b", fontWeight: "bold" }}>Telephone: </span>
                                    <a href="tel:+233243918126" className="text-white">+233 24 391 8126</a>
                                </p>
                                <p className="text-white">
                                    <span style={{ color: "#355a8b", fontWeight: "bold" }}>Telephone: </span>
                                    <a href="tel:+233544106812" className="text-white">+233 54 410 6812</a>
                                </p>
                                <p className="text-white" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                    <span style={{ color: "#355a8b", fontWeight: "bold" }}>Email: </span>
                                    <a href="mailto:sarenaministry@gmail.com" className="text-white">sarenaministry@gmail.com</a>
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 col-sm-12">
                            <h2 className="text-white">Quick Links</h2>
                            <ul className="quick-links">
                                <li><a href="/sermons">Our Sermons</a></li>
                                <li><a href="/about-us">About Us</a></li>
                                <li><a href="/events">Our Events</a></li>
                                <li><a href="/blog">Our Blogs</a></li>
                                <li><a href="/contact-us">Contact Us</a></li>
                                <li><a href="/pastors">Pastor Details</a></li>
                            </ul>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                  .quick-links { padding-left: 20px; list-style: none; margin-top: 20px; }
                  .quick-links li { position: relative; margin-bottom: 12px; }
                  .quick-links li::before {
                    content: url('/assets/images/arrow-right.svg');
                    width: 12px;
                    position: absolute;
                    left: -20px;
                    top: 50%;
                    transform: translateY(-50%);
                  }
                  .quick-links li a { color: #ddd; font-size: 18px; transition: 0.3s; display: block; }
                  .quick-links li a:hover { transform: translateX(5px); color: #fff; }
                `}} />
                        </div>

                        <div className="col-lg-4 col-md-6 col-sm-12">
                            <h2 className="text-white">Recent News</h2>
                            <ul className="footer-events" id="footerEventsContainer" style={{ marginTop: "20px" }}>
                                {events.map(event => (
                                    <li key={event.id}>
                                        <img src={event.image_path} alt={event.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
                                        <div className="event-content">
                                            <h6><a href={`/events/${event.id}`} className="text-white">{event.name}</a></h6>
                                            <span className="text-white" style={{ fontSize: "14px", fontWeight: "bold", position: "relative", paddingLeft: "25px" }}>
                                                <img src="/assets/images/calendar-clr.svg" alt="calendar" style={{ width: "18px", position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }} />
                                                {event.start_date}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                  .footer-events { list-style: none; padding: 0; }
                  .footer-events li { display: flex; gap: 15px; margin-bottom: 20px; align-items: center; }
                  .footer-events li img { flex-shrink: 0; }
                  .event-content h6 { margin-bottom: 5px; }
                  .event-content a { font-size: 18px; font-weight: 600; }
                `}} />
                        </div>
                    </div>

                    <div className="copy-right" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "40px 0" }}>
                        <div className="social">
                            <ul className="social-medias" style={{ display: "flex", gap: "15px" }}>
                                <li><a href="https://facebook.com" target="_blank" style={{ color: "white", fontSize: "20px" }}><i className="fa-brands fa-facebook-f"></i></a></li>
                                <li><a href="https://youtube.com" target="_blank" style={{ color: "white", fontSize: "20px" }}><i className="fa-brands fa-youtube"></i></a></li>
                                <li><a href="https://instagram.com" target="_blank" style={{ color: "white", fontSize: "20px" }}><i className="fa-brands fa-instagram"></i></a></li>
                            </ul>
                        </div>

                        <div className="footer-rights">
                            <div className="footer-row">
                                <div className="footer-text">
                                    <span style={{ color: "#fff", fontSize: "14px" }}>Designed by <strong>Lawrence Egyin</strong> at <strong>A+ Softek</strong>.</span>
                                    <span className="footer-contact" style={{ color: "#fff", fontSize: "14px", marginTop: "5px", display: "block" }}>
                                        For more enquiries: <a href="tel:+233544829203" style={{ color: "#fff", fontWeight: "bold" }}>+233 54 482 9203</a>
                                    </span>
                                </div>
                                <img src="/assets/images/A+Softex.PNG" alt="A+ Softek Logo" className="footer-logo" />
                            </div>
                        </div>

                        <style dangerouslySetInnerHTML={{
                            __html: `
                .footer-rights { position: relative; text-align: center; }
                .footer-row { display: flex; justify-content: center; align-items: center; gap: 15px; }
                .footer-text { text-align: left; }
                .footer-logo { max-width: 120px; height: auto; }
                @media (max-width: 768px) {
                    .copy-right { flex-direction: column; gap: 30px; text-align: center; }
                    .footer-row { flex-direction: column; }
                    .footer-text { text-align: center; }
                }
                @media (max-width: 480px) {
                    .footer-rights { width: 100%; max-width: 100%; text-align: left; top: 0; }
                    .footer-row { flex-direction: column; align-items: flex-start; justify-content: flex-start; gap: 10px; width: 100%; }
                    .footer-text { text-align: left; top: 0; width: 100%; }
                    .footer-logo { max-width: 120px; height: auto; }
                    .footer-text span, .footer-text a { font-size: 13px; }
                }
              `}} />
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
