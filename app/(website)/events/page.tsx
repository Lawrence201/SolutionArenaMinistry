import React from "react";
import { Metadata } from "next";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import EventsList from "@/components/website/EventsList";

export const metadata: Metadata = {
  title: "Events | Solution Arena Ministry",
  description: "Stay connected with all our upcoming programs, activities, and special gatherings.",
};

const EventsPage = () => {
  return (
    <main>
      <Header />

      {/* Banner Section */}
      <section
        className="banner position-relative"
        style={{ minHeight: "400px", marginBottom: "40px" }}
      >
        <div
          className="parallax"
          style={{
            backgroundImage: "url(/assets/images/about.jpg)",
            minHeight: "600px",
          }}
        ></div>

        <div className="banner-data text-center">
          <h2 className="text-white font-bold">Events</h2>
          <ul className="flex-all">
            <li>
              <a href="/" className="text-white">
                Home
              </a>
            </li>
            <li>
              <a href="/events" className="text-white">
                Events
              </a>
            </li>
          </ul>
        </div>
      </section>


      <EventsList />

      <Footer />
    </main>
  );
};

export default EventsPage;
