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

import WelcomeModal from "@/components/website/WelcomeModal";
import Preloader from "@/components/website/Preloader";

export default function WebsiteHomePage() {
    return (
        <main className="website-page">
            <Preloader />
            <WelcomeModal />
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
        </main>
    );
}
