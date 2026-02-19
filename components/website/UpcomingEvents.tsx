"use client";

import React, { useState, useEffect } from "react";

interface Event {
    id: number;
    name: string;
    start_date: string;
    time_range: string;
    location: string;
    image_path: string;
}

const UpcomingEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/website/events');
                const data = await response.json();
                if (data.success) {
                    setEvents(data.events);

                    // Manually initialize slick for this container
                    setTimeout(() => {
                        if (typeof window !== "undefined" && (window as any).$ && (window as any).$.fn.slick) {
                            const $ = (window as any).$;
                            const $slider = $("#eventsCarouselContainer");
                            if ($slider.length && !$slider.hasClass('slick-initialized')) {
                                $slider.slick({
                                    slidesToShow: 5,
                                    slidesToScroll: 1,
                                    arrows: false,
                                    dots: false,
                                    centerMode: true,
                                    infinite: true,
                                    cssEase: 'linear',
                                    draggable: true,
                                    autoplay: true,
                                    autoplaySpeed: 2000,
                                    speed: 1000,
                                    responsive: [
                                        {
                                            breakpoint: 1500,
                                            settings: {
                                                slidesToShow: 4,
                                                slidesToScroll: 1
                                            }
                                        },
                                        {
                                            breakpoint: 1200,
                                            settings: {
                                                slidesToShow: 3,
                                                slidesToScroll: 1
                                            }
                                        },
                                        {
                                            breakpoint: 900,
                                            settings: {
                                                slidesToShow: 2,
                                                slidesToScroll: 1
                                            }
                                        },
                                        {
                                            breakpoint: 600,
                                            settings: {
                                                slidesToShow: 1,
                                                slidesToScroll: 1
                                            }
                                        }
                                    ]
                                });
                            }
                        }
                    }, 500);
                }
            } catch (err) {
                console.error("Error loading events:", err);
            }
        };
        fetchEvents();
    }, []);

    return (
        <section className="gap events-carousal">
            <div className="container">
                <div className="heading">
                    <img src="/assets/images/Logo.PNG" alt="Church Logo" className="logo" />
                    <p>Stay connected with all our upcoming programs, activities, and special gatherings.</p>
                    <h2>Upcoming Events You Won’t Want to Miss</h2>
                    <style dangerouslySetInnerHTML={{
                        __html: `
            .events-carousal .heading {
                text-align: center !important;
                margin-bottom: 50px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .events-carousal .heading .logo {
                max-width: 110px;
                height: auto;
                margin-bottom: 20px;
            }
            .events-carousal .heading p {
                font-family: 'Poppins', sans-serif;
                color: #666;
                text-transform: none;
                letter-spacing: normal;
                font-size: 20px;
                margin-bottom: 12px;
                font-weight: 400;
                max-width: 850px;
            }
            .events-carousal .heading h2 {
                font-size: 54px;
                font-weight: 800;
                color: #1a1a1a;
                margin: 0;
                line-height: 1.1;
                max-width: 900px;
            }
            
            #eventsCarouselContainer {
                margin: 0 -8px;
            }
            
            .event {
                position: relative;
                overflow: hidden;
                margin: 0 8px;
                border-radius: 10px;
                aspect-ratio: 2/3.2;
                background: #f0f0f0;
                max-height: 450px;
            }
            
            .events-carousal .event > img {
                width: 100%;
                height: 100% !important;
                object-fit: cover;
                transition: transform 0.6s ease;
            }
            
            .event:hover > img {
                transform: scale(1.08);
            }
            
            .event-data {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                padding: 20px 15px;
                background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
                color: white;
                z-index: 2;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
            }
            
            .event-data p.location {
                font-size: 13px;
                opacity: 0.9;
                margin-bottom: 3px;
                color: #eee !important;
            }
            
            .event-data h4 {
                margin: 0 0 8px 0;
            }
            
            .event-data h4 a {
                color: white;
                font-size: 24px;
                font-weight: 600;
                text-decoration: none;
                line-height: 1.2;
            }
            
            .event-data ul {
                list-style: none;
                padding: 0;
                margin: 0 0 12px 0;
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            
            .event-data ul li {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: #eee;
                gap: 8px;
            }
            
            .event-data ul li img {
                width: 14px;
                height: 14px;
                filter: brightness(0) invert(1);
            }
            
            .event-data .theme-btn {
                background: #fff;
                color: #000;
                padding: 8px 15px;
                font-size: 12px;
                font-weight: 600;
                border-radius: 50px;
                text-align: center;
                display: inline-block;
                width: fit-content;
                transition: all 0.3s ease;
            }
            
            .event-data .theme-btn:hover {
                background: #000;
                color: #fff;
            }
            
            @media (max-width: 991px) {
                .events-carousal .heading h2 {
                    font-size: 32px;
                }
            }
            @media (max-width: 480px) {
                .events-carousal .heading h2 {
                    font-size: 28px !important;
                }
                .events-carousal .heading p {
                    font-size: 14px !important;
                }
            }
          `}} />
                </div>
                <div className="events-carousal-slider" id="eventsCarouselContainer">
                    {events.map((event) => (
                        <div key={event.id}>
                            <div className="event">
                                <img
                                    src={event.image_path}
                                    alt={event.name}
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/event-img-1.webp' }}
                                />
                                <div className="event-data">
                                    <p className="location">{event.location}</p>
                                    <h4><a href={`/event-detail.html?id=${event.id}`}>{event.name}</a></h4>
                                    <ul>
                                        <li><img src="/assets/images/calendar.svg" alt="calendar" /> {event.start_date}</li>
                                        <li><img src="/assets/images/clock.svg" alt="clock" /> {event.time_range}</li>
                                    </ul>
                                    <a className="theme-btn" href={`/event-detail.html?id=${event.id}`}>VIEW DETAILS</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-center" style={{ marginTop: '60px' }}>
                    <a href="/about-us" className="theme-btn" style={{
                        padding: '18px 45px',
                        fontSize: '18px',
                        fontWeight: '700',
                        backgroundColor: '#1a1a1a',
                        color: '#fff',
                        borderRadius: '50px',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        textDecoration: 'none'
                    }}>More About Us</a>
                </div>
            </div>
        </section>
    );
};

export default UpcomingEvents;
