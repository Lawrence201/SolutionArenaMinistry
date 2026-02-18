import React from "react";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import BlogContent from "@/components/website/BlogContent";

export const metadata = {
    title: "Our Blog | Solution Arena Ministry",
    description: "Stay updated with the latest news, articles, and spiritual insights from Solution Arena Ministry.",
};

const BlogPage = () => {
    return (
        <main className="website-page">
            <Header />
            {/* Hero Section */}
            <section className="banner position-relative" style={{ minHeight: "400px" }}>
                <div className="parallax" style={{ backgroundImage: "url(/assets/images/about.jpg)", minHeight: "600px" }}></div>
                <div className="banner-data text-center">
                    <h2 className="text-white font-bold">Our Blog</h2>
                    <ul className="flex-all">
                        <li><a href="/" className="text-white">Home</a></li>
                        <li><a href="/blog" className="text-white">Our Blog</a></li>
                    </ul>
                </div>
            </section>

            <BlogContent />
            <Footer />
        </main>
    );
};

export default BlogPage;
