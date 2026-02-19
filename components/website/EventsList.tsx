"use client";

import React, { useState, useEffect } from "react";
import EventCard from "./EventCard";
import { getEvents } from "@/app/actions/event";

const EventsList = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (timeStr: string) => {
        // Assuming timeStr is HH:mm from the server action
        const [hours, minutes] = timeStr.split(":");
        const h = parseInt(hours);
        const ampm = h >= 12 ? "pm" : "am";
        const formattedHours = h % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
    };

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            const result = await getEvents({ limit: 10 });
            if (result.success && result.data) {
                // Apply legacy location fallback logic
                const formatted = result.data.events.map((event: any) => ({
                    ...event,
                    displayLocation: event.full_address || event.room_building || event.location || "Location TBA",
                }));
                setEvents(formatted);
            }
            setLoading(false);
        };
        fetchEvents();
    }, []);

    return (
        <section className="gap events">
            <div className="container">
                <div className="row" id="eventsContainer">
                    {loading ? (
                        <div className="col-12 text-center" id="loadingMessage">
                            <p style={{ padding: "50px 0", fontSize: "18px" }}>Loading events...</p>
                        </div>
                    ) : events.length > 0 ? (
                        events.map((event) => (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                name={event.name}
                                image_path={event.image_path || "/assets/images/event-img-1.webp"}
                                location={event.displayLocation}
                                start_date={formatDate(event.start_date)}
                                end_date={event.end_date ? formatDate(event.end_date) : null}
                                time_range={`${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}
                                contact_person={event.contact_person}
                                contact_phone={event.contact_phone}
                                contact_email={event.contact_email}
                            />
                        ))
                    ) : (
                        <div className="col-12 text-center">
                            <p style={{ padding: "50px 0", fontSize: "18px" }}>
                                No events available at the moment.
                            </p>
                        </div>
                    )}
                </div>

                {events.length > 0 && (
                    <div className="d-flex justify-content-center loadmore">
                        <a href="#" onClick={(e) => e.preventDefault()} className="theme-btn">
                            Load More
                        </a>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .events .loadmore {
          margin-top: 40px;
        }

        .events .theme-btn {
          padding: 15px 40px;
          background: #1f4372;
          color: #fff;
          border-radius: 5px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .events .theme-btn:hover {
          background: #edb109;
          color: #fff;
        }

        @media (max-width: 991px) {
          .events {
            padding-top: 180px !important;
          }
        }
      `}} />
        </section>
    );
};

export default EventsList;
