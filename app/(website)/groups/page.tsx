"use client";

import React from "react";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import GroupsContent from "@/components/website/GroupsContent";

const GroupsPage = () => {
    return (
        <main className="website-page">
            <Header />
            {/* Banner Section */}
            <section className="banner position-relative" style={{ minHeight: "400px" }}>
                <div className="parallax" style={{ backgroundImage: "url(/assets/images/about.jpg)", minHeight: "600px" }}></div>
                <div className="banner-data text-center">
                    <h2 className="text-white font-bold">Groups & Department</h2>
                    <ul className="flex-all">
                        <li><a href="/" className="text-white">Home</a></li>
                        <li><a href="/groups" className="text-white">Our Groups & Department</a></li>
                    </ul>
                </div>
            </section>
            <GroupsContent />
            <Footer />
        </main>
    );
};

export default GroupsPage;
