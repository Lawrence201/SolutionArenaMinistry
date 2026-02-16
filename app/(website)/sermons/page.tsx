import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/website/Header';
import Footer from '@/components/website/Footer';
import SermonsGrid from '@/components/website/SermonsGrid';
import styles from '@/components/website/About.module.css'; // Reusing banner styles

export const metadata: Metadata = {
    title: 'Sermons | Solution Arena Ministry',
    description: 'Watch and listen to our latest sermons and teachings.',
};

const SermonsPage = () => {
    return (
        <>
            <Header />

            {/* Banner Section */}
            <section className="banner position-relative" style={{ minHeight: "400px" }}>
                <div className="parallax" style={{ backgroundImage: "url(/assets/images/about.jpg)", minHeight: "600px" }}></div>
                <div className="banner-data text-center">
                    <h2 className="text-white font-bold">Sermons</h2>
                    <ul className="flex-all">
                        <li><a href="/" className="text-white">Home</a></li>
                        <li><a href="/sermons" className="text-white">Sermons</a></li>
                    </ul>
                </div>
            </section>

            <SermonsGrid />

            <Footer />
        </>
    );
};

export default SermonsPage;
