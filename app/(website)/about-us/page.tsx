"use client";

import React from "react";
import Header from "@/components/website/Header";
import About from "@/components/website/About";
import Footer from "@/components/website/Footer";
import Preloader from "@/components/website/Preloader";

export default function AboutUsPage() {
    return (
        <main className="website-page">
            <Header />
            <About />
            <Footer />
        </main>
    );
}
