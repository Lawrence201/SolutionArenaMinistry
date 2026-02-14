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
    title: string;
    speaker: string;
    date: string;
    description: string;
    video_url: string;
    video_type: string;
    audio_url: string;
    image_url: string;
    pdf_url: string | null;
    scriptures: string;
}

const RecentSermons = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchSermons = async () => {
            try {
                const response = await fetch('/api/website/sermons');
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
                transform: translateY(15px);
                max-width: 90px;
              }
            }
          `}} />
                    <p>Explore our latest sermons filled with inspiration, revelation, and spiritual growth.</p>
                    <h2>Recent Sermons</h2>
                </div>

                {loading && (
                    <div id="recent-sermons-loading" style={{ textAlignCenter: "center", padding: "40px" }}>
                        <p>Loading recent sermons...</p>
                    </div>
                )}

                {error && (
                    <div id="recent-sermons-error" style={{ textAlignCenter: "center", padding: "40px" }}>
                        <p>Unable to load sermons. Please try again later.</p>
                    </div>
                )}

                <div className="row" id="recent-sermons-container">
                    {sermons.map((sermon) => (
                        <div key={sermon.id} className="sermon" data-aos="zoom-in-right" data-aos-duration="1000">
                            <div className={`sermon-img ${sermon.video_type === 'file' ? 'video' : ''}`}>
                                <div className="sermon-media">
                                    {sermon.video_type === 'url' ? (
                                        <div dangerouslySetInnerHTML={{ __html: getIframeHTML(sermon.video_url) }} />
                                    ) : (
                                        <img
                                            src={sermon.image_url || "/assets/images/sermon-img.webp"}
                                            alt={sermon.title}
                                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/sermon-img.webp' }}
                                        />
                                    )}

                                    <div className="audio-player style2">
                                        <audio controls>
                                            <source src={sermon.audio_url} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                </div>

                                <ul>
                                    <li><a className="s_audio" href="javascript:void(0)" onClick={() => openAudioModal(sermon.audio_url, sermon.title)}><img src="/assets/images/music-note.svg" alt="volume" /></a></li>
                                    <li><a className="s_video" href="javascript:void(0)" onClick={() => openVideoModal(sermon.video_url, sermon.video_type)}><img src="/assets/images/play-button-2.svg" alt="Play Button" /></a></li>
                                    <li><a className="s_pdf" href="javascript:void(0)" onClick={() => sermon.pdf_url && openPdfModal(sermon.pdf_url)} style={{ opacity: sermon.pdf_url ? 1 : 0.5, cursor: sermon.pdf_url ? 'pointer' : 'not-allowed' }}><img src="/assets/images/book.svg" alt="Book" /></a></li>
                                    <li><a className="s_music" href="javascript:void(0)" onClick={() => downloadAudio(sermon.audio_url)}><img src="/assets/images/download.svg" alt="download" /></a></li>
                                </ul>
                            </div>

                            <div className="sermon-data">
                                <ul>
                                    <li>{sermon.speaker}</li>
                                    <li>{sermon.date}</li>
                                </ul>
                                <h3><a href={`/sermon-detail.html?id=${sermon.id}`}>{sermon.title}</a></h3>
                                <p>{sermon.description}</p>
                                {sermon.scriptures && (
                                    <div className="sermon-scriptures" style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                                        <i className="fa fa-book" aria-hidden="true" style={{ marginRight: "5px" }}></i>
                                        {sermon.scriptures}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="d-flex justify-content-center loadmore">
                    <a href="/sermons.html" className="theme-btn">Load More</a>
                </div>
            </div>
        </section>
    );
};

function getIframeHTML(videoUrl: string) {
    if (!videoUrl) return '';
    const iframeStyle = 'width: 100%; height: auto; aspect-ratio: 16/9; display: block; border: none; border-radius: 8px;';

    if (videoUrl.includes('facebook.com') || videoUrl.includes('fb.watch')) {
        return `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&width=560&autoplay=0&muted=0" style="${iframeStyle}" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media" allowFullScreen="true"></iframe>`;
    }

    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = '';
        if (videoUrl.includes('v=')) videoId = videoUrl.split('v=')[1].split('&')[0];
        else if (videoUrl.includes('youtu.be/')) videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        return `<iframe src="https://www.youtube.com/embed/${videoId}" style="${iframeStyle}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }

    return `<iframe src="${videoUrl}" style="${iframeStyle}" allowfullscreen></iframe>`;
}

export default RecentSermons;
