"use client";

import React from "react";
import Header from "@/components/website/Header";
import Hero from "@/components/website/Hero";
import Fellowship from "@/components/website/Fellowship";
import RecentSermons from "@/components/website/RecentSermons";
import DigitalMinistry from "@/components/website/DigitalMinistry";
import LiveStream from "@/components/website/LiveStream";
import BirthdayCelebrations from "@/components/website/BirthdayCelebrations";
import UpcomingEvents from "@/components/website/UpcomingEvents";
import { RecentBlogs, MapSection } from "@/components/website/BlogAndMap";
import Footer from "@/components/website/Footer";

export default function WebsiteHomePage() {
    return (
        <main className="website-page">
            <Header />
            <Hero />
            <Fellowship />
            <RecentSermons />
            <DigitalMinistry />
            <LiveStream />
            <BirthdayCelebrations />
            <UpcomingEvents />
            <RecentBlogs />
            <MapSection />
            <Footer />

            {/* 
        NOTE: Dynamic content loading scripts (JS) and modal initialization 
        will be handled in the next step to ensure full functionality.
        The UI layout is now exactly mirrored from the legacy code.
      */}
        </main>
    );
}
