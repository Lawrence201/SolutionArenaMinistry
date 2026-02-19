"use client";

import React, { useState, useEffect } from "react";

declare global {
    interface Window {
        openAudioModal: (url: string, title: string) => void;
        openVideoModal: (url: string, type: string) => void;
        openPdfModal: (url: string) => void;
    }
}

interface Sermon {
    id: number;
    sermon_title: string;
    sermon_speaker: string;
    sermon_date: string;
    sermon_description: string;
    video_file: string;
    video_type: string;
    audio_file: string;
    sermon_image: string;
    pdf_file: string | null;
    scriptures: any; // Handled as related objects
}

const RecentSermons = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const videoRefs = React.useRef<{ [key: number]: HTMLVideoElement | null }>({});

    useEffect(() => {
        const fetchSermons = async () => {
            try {
                const response = await fetch('/api/website/sermons?limit=4');
                const data = await response.json();
                if (data.success) {
                    setSermons(data.data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Error loading sermons:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchSermons();
    }, []);

    const openAudioModal = (url: string, title: string) => {
        if (window.openAudioModal) window.openAudioModal(url, title);
    };

    const openVideoModal = (url: string, type: string) => {
        if (window.openVideoModal) window.openVideoModal(url, type);
    };

    const openPdfModal = (url: string) => {
        if (window.openPdfModal) window.openPdfModal(url);
    };

    const downloadAudio = (url: string) => {
        window.open(url, '_blank');
    };

    const handleMouseEnter = (id: number) => {
        const video = videoRefs.current[id];
        if (video) {
            video.play().catch(err => console.log("Video preview play failed:", err));
        }
    };

    const handleMouseLeave = (id: number) => {
        const video = videoRefs.current[id];
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    };

    return (
        <section className="gap light-bg recent-sermon-one">
            <div className="container">
                <div className="heading">
                    <img src="/assets/images/Logo.PNG" alt="Heading Image" />
                    <style dangerouslySetInnerHTML={{
                        __html: `
            .heading img {
              display: block;
              max-width: 115px;
              height: auto;
              margin: 0 auto;
              transform: translateY(8px);
            }
            @media (max-width: 480px) {
              .heading img {
                transform: translateY(15px); /* Matches legacy Mobile shift */
                max-width: 90px;
              }
            }
          `}} />
                    <p>Explore our latest sermons filled with inspiration, revelation, and spiritual growth.</p>
                    <h2>Recent Sermons</h2>
                </div>

                {loading && (
                    <div id="recent-sermons-loading" style={{ textAlign: "center", padding: "40px" }}>
                        <p>Loading recent sermons...</p>
                    </div>
                )}

                {error && (
                    <div id="recent-sermons-error" style={{ textAlign: "center", padding: "40px" }}>
                        <p>Unable to load sermons. Please try again later.</p>
                    </div>
                )}

                <div className="row" id="recent-sermons-container">
                    {sermons.map((sermon) => {
                        const formattedDate = new Date(sermon.sermon_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });

                        const scripturesString = Array.isArray(sermon.scriptures)
                            ? sermon.scriptures.map((s: any) => s.scripture_reference).join(', ')
                            : '';

                        const isUrlVideo = sermon.video_type === 'url';
                        const hasVideo = sermon.video_file && sermon.video_file !== 'null' && sermon.video_file !== '';
                        const hasFileVideo = hasVideo && !isUrlVideo;

                        // Build video path for uploaded files
                        let videoPath = sermon.video_file;
                        if (hasFileVideo && videoPath && !videoPath.startsWith('/') && !videoPath.startsWith('http')) {
                            // Normalize legacy or relative paths with a leading slash
                            videoPath = `/${videoPath}`;
                        }

                        return (
                            <div key={sermon.id} className="sermon" data-aos="zoom-in-right" data-aos-duration="1000">
                                <div className={`sermon-img ${hasFileVideo ? 'video' : ''}`}>
                                    <div className="sermon-media">
                                        {hasFileVideo ? (
                                            <video
                                                ref={el => { videoRefs.current[sermon.id] = el }}
                                                className="sermon-video-preview"
                                                muted
                                                playsInline
                                                preload="metadata"
                                                poster={sermon.sermon_image || "/assets/images/sermon-img.webp"}
                                                onMouseEnter={() => handleMouseEnter(sermon.id)}
                                                onMouseLeave={() => handleMouseLeave(sermon.id)}
                                                style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
                                            >
                                                <source src={videoPath} type="video/mp4" />
                                            </video>
                                        ) : hasVideo && isUrlVideo ? (
                                            <div style={{ height: '100%', width: '100%' }} dangerouslySetInnerHTML={{ __html: getIframeHTML(sermon.video_file) }} />
                                        ) : (
                                            <img
                                                src={sermon.sermon_image || "/assets/images/sermon-img.webp"}
                                                alt={sermon.sermon_title}
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/sermon-img.webp' }}
                                            />
                                        )}

                                    </div>

                                    <ul>
                                        <li><a className="s_audio" href="javascript:void(0)" onClick={() => openAudioModal(sermon.audio_file, sermon.sermon_title)}><img src="/assets/images/music-note.svg" alt="volume" /></a></li>
                                        <li><a className="s_video" href="javascript:void(0)" onClick={() => openVideoModal(sermon.video_file, sermon.video_type)}><img src="/assets/images/play-button-2.svg" alt="Play Button" /></a></li>
                                        <li><a className="s_pdf" href="javascript:void(0)" onClick={() => sermon.pdf_file && openPdfModal(sermon.pdf_file)} style={{ opacity: sermon.pdf_file ? 1 : 0.5, cursor: sermon.pdf_file ? 'pointer' : 'not-allowed' }}><img src="/assets/images/book.svg" alt="Book" /></a></li>
                                        <li><a className="s_music" href="javascript:void(0)" onClick={() => downloadAudio(sermon.audio_file)}><img src="/assets/images/download.svg" alt="download" /></a></li>
                                    </ul>
                                </div>

                                <div className="sermon-data">
                                    <ul>
                                        <li>{sermon.sermon_speaker}</li>
                                        <li>{formattedDate}</li>
                                    </ul>
                                    <h3><a href={`/sermons/${sermon.id}`}>{sermon.sermon_title}</a></h3>
                                    <p>{sermon.sermon_description}</p>
                                    {scripturesString && (
                                        <div className="sermon-scriptures" style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                                            <i className="fa fa-book" aria-hidden="true" style={{ marginRight: "5px" }}></i>
                                            {scripturesString}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="d-flex justify-content-center loadmore">
                    <a href="/sermons" className="theme-btn">View more</a>
                </div>
            </div>
        </section>
    );
};

function getIframeHTML(videoUrl: string) {
    if (!videoUrl) return '';

    const iframeStyle = 'width: 100%; height: 100%; display: block; border: none; border-radius: 8px;';

    // Check if it's a Facebook URL
    if (videoUrl.includes('facebook.com') || videoUrl.includes('fb.watch')) {
        let cleanUrl = videoUrl;
        if (videoUrl.includes('facebook.com')) {
            try {
                const fbUrl = new URL(videoUrl);
                fbUrl.hostname = 'www.facebook.com';
                cleanUrl = fbUrl.toString();
            } catch (e) {
                console.error('Error normalizing Facebook URL:', e);
            }
        }
        return `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=0&width=560&autoplay=0&muted=0" style="${iframeStyle}" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media" allowFullScreen="true"></iframe>`;
    }

    // Check if it's a YouTube URL
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = '';
        if (videoUrl.includes('v=')) {
            videoId = videoUrl.split('v=')[1].split('&')[0];
        } else if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        }
        if (videoId) {
            return `<iframe src="https://www.youtube.com/embed/${videoId}" style="${iframeStyle}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
    }

    // Check if it's a Vimeo URL
    if (videoUrl.includes('vimeo.com')) {
        let vimeoId = '';
        if (videoUrl.includes('/video/')) {
            vimeoId = videoUrl.split('/video/')[1].split('?')[0];
        } else {
            const match = videoUrl.match(/vimeo\.com\/(\d+)/);
            if (match) vimeoId = match[1];
        }
        if (vimeoId) {
            return `<iframe src="https://player.vimeo.com/video/${vimeoId}" style="${iframeStyle}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        }
    }

    // Check if it's Dailymotion
    if (videoUrl.includes('dailymotion.com')) {
        return `<iframe src="${videoUrl}" style="${iframeStyle}" allowfullscreen></iframe>`;
    }

    // Default iframe
    return `<iframe src="${videoUrl}" style="${iframeStyle}" allowfullscreen></iframe>`;
}

export default RecentSermons;
