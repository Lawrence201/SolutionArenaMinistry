"use client";

import React, { useState, useEffect } from "react";

const DigitalMinistry = () => {
    const [stats, setStats] = useState({
        total_events: 0,
        total_sermons: 0,
        birthdays_this_month: 0,
        upcoming_events: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/website/statistics');
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (err) {
                console.error("Error loading statistics:", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <section className="gap digital-ministry green-overlay">
            <div className="parallax" style={{ backgroundImage: "url(/assets/images/counter-bg.webp)" }}></div>
            <div className="container">
                <div className="heading">
                    <h2 className="text-white mx-auto">An In-Depth Look at Our Church Events, Sermons, and Fellowship Milestones</h2>
                </div>
                <div className="row">
                    <div className="col-lg-3 col-md-6 col-sm-12">
                        <div className="dg-counter text-center">
                            <h3 className="text-white"><span className="stat-counter" id="stat-total-events">{stats.total_events}</span></h3>
                            <p className="text-white mx-auto">Total Events</p>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                        <div className="dg-counter text-center">
                            <h3 className="text-white"><span className="stat-counter" id="stat-total-sermons">{stats.total_sermons}</span></h3>
                            <p className="text-white mx-auto">Total Sermons</p>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                        <div className="dg-counter text-center">
                            <h3 className="text-white"><span className="stat-counter" id="stat-birthdays-month">{stats.birthdays_this_month}</span></h3>
                            <p className="text-white mx-auto">Birthdays This Month</p>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                        <div className="dg-counter text-center">
                            <h3 className="text-white"><span className="stat-counter" id="stat-upcoming-events">{stats.upcoming_events}</span></h3>
                            <p className="text-white mx-auto">Upcoming Events</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DigitalMinistry;
