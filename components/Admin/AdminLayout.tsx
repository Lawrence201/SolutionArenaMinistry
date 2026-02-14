import React from "react";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Toaster position="top-right" />
            <div className="container">
                <Sidebar />
                <div className="main-content">
                    <AdminHeader />
                    <div className="dashboard-content">
                        {children}
                    </div>
                </div>
            </div>

            {/* Footer - Outside container like original HTML */}
            <footer className="site-footer">
                <div className="footer-content">
                    <p className="left-text">
                        © <span id="year">{new Date().getFullYear()}</span> Advanced Church Management System built by
                        <span className="highlight-name"> Lawrence Egyin</span>
                    </p>
                    <p className="right-text">
                        Email: <a href="mailto:lawrenceantwi63@gmail.com">lawrenceantwi63@gmail.com</a> |
                        Phone: <a href="tel:+233534829203">0534829203</a>
                    </p>
                </div>
            </footer>
        </>
    );
}

