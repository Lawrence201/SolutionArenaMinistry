"use client";

import React, { useState, useEffect } from "react";

const WebsiteModals = () => {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [mediaData, setMediaData] = useState<any>({ url: "", type: "", title: "" });

    useEffect(() => {
        // Listen for custom trigger events (for legacy interop)
        const handleOpenModal = (e: any) => {
            const { modalName, data } = e.detail;
            setActiveModal(modalName);
            if (data) setMediaData(data);
        };

        window.addEventListener("open-website-modal", handleOpenModal);

        // Register legacy global functions for convenience
        (window as any).openVideoModal = (url: string, type: string) => {
            setActiveModal("video");
            setMediaData({ url, type });
        };
        (window as any).openAudioModal = (url: string, title: string) => {
            setActiveModal("audio");
            setMediaData({ url, title });
        };
        (window as any).openPdfModal = (url: string) => {
            setActiveModal("pdf");
            setMediaData({ url });
        };

        return () => {
            window.removeEventListener("open-website-modal", handleOpenModal);
        };
    }, []);

    const closeModal = () => {
        setActiveModal(null);
        setMediaData({ url: "", type: "", title: "" });
    };

    return (
        <>
            {/* Video Modal */}
            {activeModal === "video" && (
                <div className="cf-video-modal" onClick={closeModal} style={modalOverlayStyle}>
                    <button className="cf-video-close-btn" style={closeBtnStyle}>✕</button>
                    <div className="cf-video-viewer-container" onClick={(e) => e.stopPropagation()} style={viewerContainerStyle}>
                        {mediaData.type === 'url' ? (
                            <iframe
                                src={getEmbedUrl(mediaData.url)}
                                style={{ width: "100%", height: "100%" }}
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video controls autoPlay style={{ width: "100%", height: "100%" }}>
                                <source src={mediaData.url} type="video/mp4" />
                            </video>
                        )}
                    </div>
                </div>
            )}

            {/* Audio Modal */}
            {activeModal === "audio" && (
                <div className="cf-audio-modal" onClick={closeModal} style={modalOverlayStyle}>
                    <div className="cf-audio-viewer-container" onClick={(e) => e.stopPropagation()} style={{ ...viewerContainerStyle, height: "auto", padding: "30px", maxWidth: "500px" }}>
                        <h3 style={{ marginBottom: "20px", textAlign: "center" }}>{mediaData.title || "Sermon Audio"}</h3>
                        <audio controls autoPlay style={{ width: "100%" }}>
                            <source src={mediaData.url} type="audio/mpeg" />
                        </audio>
                        <button onClick={closeModal} style={{ marginTop: "20px", padding: "10px 20px", background: "#133869", color: "white", border: "none", borderRadius: "4px", width: "100%" }}>Close</button>
                    </div>
                </div>
            )}

            {/* PDF Modal */}
            {activeModal === "pdf" && (
                <div className="cf-pdf-modal" onClick={closeModal} style={modalOverlayStyle}>
                    <button className="cf-pdf-close-btn" style={closeBtnStyle}>✕</button>
                    <div className="cf-pdf-viewer-container" onClick={(e) => e.stopPropagation()} style={viewerContainerStyle}>
                        <iframe src={mediaData.url} style={{ width: "100%", height: "100%" }} frameBorder="0" />
                    </div>
                </div>
            )}

            {/* Note: Welcome and Donation modals can be added here similarly if needed */}
        </>
    );
};

// Styling Constants (Matching Legacy)
const modalOverlayStyle: React.CSSProperties = {
    display: "flex", position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0, 0, 0, 0.9)", zIndex: 9999, justifyContent: "center", alignItems: "center"
};

const closeBtnStyle: React.CSSProperties = {
    position: "absolute", top: "20px", right: "30px", background: "rgba(255, 255, 255, 0.2)",
    border: "none", color: "white", fontSize: "40px", fontWeight: "bold", cursor: "pointer",
    width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
};

const viewerContainerStyle: React.CSSProperties = {
    width: "90%", maxWidth: "1200px", height: "90vh", background: "#000", borderRadius: "8px", overflow: "hidden"
};

function getEmbedUrl(url: string) {
    if (url.includes('youtube.com/watch?v=')) {
        return `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`;
    }
    if (url.includes('youtu.be/')) {
        return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
    }
    return url;
}

export default WebsiteModals;
