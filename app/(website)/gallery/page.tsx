"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import Image from "next/image";
import "./Gallery.css";
import { toast, Toaster } from "react-hot-toast";

interface Album {
    id: number;
    name: string;
    date: string;
    category: string;
    cover: string;
    count: number;
}

interface MediaItem {
    id: number;
    type: string;
    url: string;
    filename: string;
    title: string;
    caption: string;
    likes: number;
    views: number;
    liked?: boolean;
}

export default function GalleryPage() {
    const [view, setView] = useState<"albums" | "media">("albums");
    const [albums, setAlbums] = useState<Album[]>([]);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [currentAlbum, setCurrentAlbum] = useState<{ id: number; name: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Share state
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/website/gallery/albums");
            const result = await res.json();
            if (result.success) {
                setAlbums(result.data);
            }
        } catch (err) {
            console.error("Error fetching albums:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMedia = async (albumId: number, albumName: string) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/website/gallery/media?album_id=${albumId}`);
            const result = await res.json();
            if (result.success) {
                setMediaItems(result.data);
                setCurrentAlbum({ id: albumId, name: albumName });
                setView("media");
            }
        } catch (err) {
            console.error("Error fetching media:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (mediaId: number) => {
        try {
            const formData = new FormData();
            formData.append("media_id", mediaId.toString());

            const res = await fetch("/api/website/gallery/like", {
                method: "POST",
                body: formData,
            });

            if (res.status === 401) {
                toast.error("Please login to like media");
                return;
            }

            const result = await res.json();
            if (result.success) {
                setMediaItems((prev) =>
                    prev.map((item) =>
                        item.id === mediaId
                            ? { ...item, likes: result.likes, liked: result.action === "liked" }
                            : item
                    )
                );
                toast.success(result.action === "liked" ? "Liked!" : "Unliked");
            }
        } catch (err) {
            console.error("Error liking media:", err);
        }
    };

    const handleDownload = async (item: MediaItem) => {
        try {
            const formData = new FormData();
            formData.append("media_id", item.id.toString());
            await fetch("/api/website/gallery/track", {
                method: "POST",
                body: formData,
            });

            const link = document.createElement("a");
            link.href = item.url;
            link.download = item.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Error tracking download:", err);
        }
    };

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const navigateLightbox = (dir: number) => {
        setCurrentIndex((prev) => {
            let next = prev + dir;
            if (next < 0) return mediaItems.length - 1;
            if (next >= mediaItems.length) return 0;
            return next;
        });
    };

    const openShare = (url: string) => {
        setShareUrl(window.location.origin + url);
        setShareModalOpen(true);
    };

    const copyShareLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
    };

    return (
        <main className="website-page">
            <Header />
            <Toaster position="bottom-right" />

            {/* Hero Section */}
            <section className="banner position-relative" style={{ minHeight: "400px" }}>
                <div className="parallax" style={{ backgroundImage: "url(/assets/images/about.jpg)", minHeight: "600px" }}></div>
                <div className="banner-data text-center">
                    <h2 className="text-white font-bold">Gallery</h2>
                    <ul className="flex-all">
                        <li><a href="/" className="text-white">Home</a></li>
                        <li><a href="/gallery" className="text-white">Gallery</a></li>
                    </ul>
                </div>
            </section>

            <section className="gallery-section">
                <div className="container-fluid px-md-5">
                    {view === "media" && (
                        <div className="gallery-controls mb-5 d-flex justify-content-between align-items-center">
                            <button
                                className="theme-btn"
                                onClick={() => setView("albums")}
                                style={{ padding: "10px 25px" }}
                            >
                                <i className="fa-solid fa-arrow-left me-2"></i> Back to Albums
                            </button>
                            <h2 className="text-primary m-0">{currentAlbum?.name}</h2>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : view === "albums" ? (
                        <div className="gallery-grid">
                            {albums.map((album) => (
                                <div key={album.id} className="album-card" onClick={() => fetchMedia(album.id, album.name)}>
                                    <div className="album-cover">
                                        <Image
                                            src={album.cover}
                                            alt={album.name}
                                            width={600}
                                            height={500}
                                            style={{ objectFit: 'cover' }}
                                            onError={(e) => console.error(`Album cover failed to load: ${album.cover}`, e)}
                                        />
                                        <div className="album-overlay">
                                            <h3>{album.name}</h3>
                                            <div className="album-meta">
                                                <span>{album.count} Media Items</span> • <span>{new Date(album.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {albums.length === 0 && <p className="text-center col-12">No albums found.</p>}
                        </div>
                    ) : (
                        <div className="gallery-grid">
                            {mediaItems.map((item, idx) => (
                                <div key={item.id} className="gallery-item">
                                    {item.type === "video" ? (
                                        <div className="video-thumb" onClick={() => openLightbox(idx)}>
                                            <video src={item.url} muted />
                                            <div className="play-overlay" style={{
                                                position: "absolute", top: "50%", left: "50%",
                                                transform: "translate(-50%, -50%)", fontSize: "40px", color: "#fff"
                                            }}>
                                                <i className="fa-solid fa-circle-play"></i>
                                            </div>
                                        </div>
                                    ) : (
                                        <Image
                                            src={item.url}
                                            alt={item.title}
                                            width={600}
                                            height={500}
                                            style={{ objectFit: 'cover' }}
                                            onClick={() => openLightbox(idx)}
                                            onError={(e) => console.error(`Gallery image failed to load: ${item.url}`, e)}
                                        />
                                    )}
                                    <div className="gallery-item-actions">
                                        <button
                                            className={`action-btn ${item.liked ? 'liked' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleLike(item.id); }}
                                        >
                                            <i className={`fa-heart ${item.liked ? 'fa-solid' : 'fa-regular'}`}></i> {item.likes}
                                        </button>
                                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleDownload(item); }}>
                                            <i className="fa-solid fa-download"></i> <span className="btn-text">Download</span>
                                        </button>
                                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); openShare(item.url); }}>
                                            <i className="fa-solid fa-share-nodes"></i> <span className="btn-text">Share</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {mediaItems.length === 0 && <p className="text-center col-12">No media found in this album.</p>}
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div className="lightbox-modal" style={{ display: "flex" }} onClick={() => setLightboxOpen(false)}>
                    <span className="lightbox-close">&times;</span>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        {mediaItems[currentIndex].type === "video" ? (
                            <video src={mediaItems[currentIndex].url} controls autoPlay />
                        ) : (
                            <img src={mediaItems[currentIndex].url} alt={mediaItems[currentIndex].title} />
                        )}
                    </div>
                    <div className="lightbox-nav">
                        <button className="nav-btn" onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}>
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button className="nav-btn" onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}>
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {shareModalOpen && (
                <div className="share-modal" style={{ display: "flex" }} onClick={() => setShareModalOpen(false)}>
                    <div className="share-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Share Media</h3>
                        <div className="share-options">
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-btn facebook">
                                <i className="fa-brands fa-facebook-f"></i>
                            </a>
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-btn twitter">
                                <i className="fa-brands fa-x-twitter"></i>
                            </a>
                            <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" className="share-btn whatsapp">
                                <i className="fa-brands fa-whatsapp"></i>
                            </a>
                        </div>
                        <div className="input-group">
                            <input type="text" className="form-control" value={shareUrl} readOnly />
                            <button className="btn btn-primary" onClick={copyShareLink}>Copy</button>
                        </div>
                        <button className="btn btn-link mt-3 text-secondary" onClick={() => setShareModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
