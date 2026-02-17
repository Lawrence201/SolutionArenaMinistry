import type { Metadata } from "next";
import Script from "next/script";
import WebsiteModals from "@/components/website/WebsiteModals";
import Preloader from "@/components/website/Preloader";

export const metadata: Metadata = {
    // ... existing metadata ...
    title: "Solution Home",
    description: "Church Management System",
    icons: {
        icon: "/assets/images/favicon.PNG",
        shortcut: "/assets/images/favicon.PNG",
        apple: "/assets/images/favicon.PNG",
    },
};

export default function WebsiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="website-root">
            {/* External CSS Libraries */}
            <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
            <link rel="stylesheet" href="/assets/css/slick.css" />
            <link rel="stylesheet" href="/assets/css/animate.min.css" />
            <link rel="stylesheet" href="/assets/css/aos.css" />
            <link rel="stylesheet" href="/assets/css/jquery.fancybox.min.css" />

            {/* Fonts */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Poppins:wght@300;400;600;700&family=Playfair+Display:wght@400;700&display=swap"
                rel="stylesheet"
            />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

            {/* Custom Styles */}
            <link rel="stylesheet" href="/assets/css/style.css" />
            <link rel="stylesheet" href="/assets/css/color.css" />
            <link rel="stylesheet" href="/assets/css/birthday_styles.css" />
            <link rel="stylesheet" href="/assets/css/responsive.css" />

            {children}
            <Preloader />
            <WebsiteModals />

            {/* Legacy JS Scripts */}
            <Script src="/assets/js/jquery.min.js" strategy="beforeInteractive" />
            <Script src="/assets/js/bootstrap.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/slick.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/aos.js" strategy="afterInteractive" />
            <Script src="/assets/js/jquery.fancybox.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/custom.js" strategy="afterInteractive" />
        </div>
    );
}
