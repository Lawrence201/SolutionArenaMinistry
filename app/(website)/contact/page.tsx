import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import ContactContent from "@/components/website/ContactContent";

const ContactPage = () => {
    return (
        <main className="website-page">
            <Header />
            {/* Banner Section */}
            <section className="banner position-relative" style={{ minHeight: "400px", marginBottom: "40px" }}>
                <div className="parallax" style={{ backgroundImage: "url(/assets/images/about.jpg)", minHeight: "600px" }}></div>
                <div className="banner-data text-center">
                    <h2 className="text-white font-bold">Contact Us</h2>
                    <ul className="flex-all">
                        <li><a href="/" className="text-white">Home</a></li>
                        <li><a href="/contact" className="text-white">Contact Us</a></li>
                    </ul>
                </div>
            </section>
            <ContactContent />
            <Footer />
        </main>
    );
};

export default ContactPage;
