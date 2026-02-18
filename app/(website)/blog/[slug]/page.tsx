import type { Metadata } from "next";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import BlogDetailContent from "@/components/website/BlogDetailContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: `Blog Post | Solution Arena Ministry`,
    };
}

const BlogDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    return (
        <main className="website-page">
            <Header />

            {/* Hero Section */}
            <section className="banner position-relative" style={{ minHeight: "400px" }}>
                <div className="parallax" style={{ backgroundImage: "url(/assets/images/about.jpg)", minHeight: "600px" }}></div>
                <div className="banner-data text-center">
                    <h2 className="text-white font-bold">Blog Post</h2>
                    <ul className="flex-all">
                        <li><a href="/" className="text-white">Home</a></li>
                        <li><a href="/blog" className="text-white">Blog</a></li>
                    </ul>
                </div>
            </section>

            <BlogDetailContent slug={slug} />
            <Footer />
        </main>
    );
};

export default BlogDetailPage;
