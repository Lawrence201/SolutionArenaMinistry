"use client";

import React, { useState, useEffect, useRef } from "react";

interface AudioTrack {
    id: number;
    title: string;
    speaker: string;
    date: string;
    audio_url: string;
    image_url: string;
    duration: number;
}

const LiveStream = () => {
    const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState("00:00");
    const [durationText, setDurationText] = useState("00:00");
    const audioRef = useRef<HTMLAudioElement>(null);
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const response = await fetch('/api/website/audio-playlist');
                const data = await response.json();
                if (data.success) {
                    setPlaylist(data.data);
                }
            } catch (err) {
                console.error("Error loading playlist:", err);
            }
        };
        fetchPlaylist();
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const formatTime = (t: number) => {
        const min = Math.floor(t / 60);
        const sec = Math.floor(t % 60);
        return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
    };

    const onTimeUpdate = () => {
        if (audioRef.current && barRef.current) {
            const t = audioRef.current.currentTime;
            const d = audioRef.current.duration;
            setCurrentTime(formatTime(t));
            if (!isNaN(d)) {
                setDurationText(formatTime(d));
                const progress = (t / d) * 100;
                barRef.current.style.width = progress + "%";
            }
        }
    };

    const nextTrack = () => {
        if (playlist.length > 0) {
            const nextIndex = (currentTrackIndex + 1) % playlist.length;
            setCurrentTrackIndex(nextIndex);
            setIsPlaying(true);
        }
    };

    const previousTrack = () => {
        if (playlist.length > 0) {
            const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            setCurrentTrackIndex(prevIndex);
            setIsPlaying(true);
        }
    };

    const changeTrack = (index: number) => {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };

    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current) {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const percent = x / width;
            audioRef.current.currentTime = percent * audioRef.current.duration;
        }
    };

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play();
        }
    }, [currentTrackIndex, isPlaying]);

    const currentTrack = playlist[currentTrackIndex];

    return (
        <>
            <section className="gap no-bottom live-stream">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .live-stream .heading img {
                        display: block;
                        max-width: 115px;
                        height: auto;
                        margin: 0 auto;
                        transform: translateY(8px);
                    }
                    .live-stream .audio-player {
                        width: 100%;
                    }
                    .live-stream .player-ctn {
                        width: 100%;
                        margin-bottom: 60px;
                        padding: 0;
                        background: #fff;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    .live-stream .audio-run {
                        padding: 67px 10px 10px;
                        position: relative;
                        min-height: 300px;
                    }
                    .live-stream .audio-run .parallax {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-attachment: fixed;
                        background-size: cover;
                        background-position: center;
                        z-index: 1;
                    }
                    .live-stream .audio-run .parallax::after {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: rgba(0,0,0,0.3);
                        z-index: 2;
                    }
                    .live-stream .btn-ctn {
                        position: relative;
                        z-index: 3;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 20px;
                    }
                    .live-stream .btn-action {
                        cursor: pointer;
                        z-index: 3;
                    }
                    .live-stream #btn-faws-play-pause {
                        width: 140px;
                        height: 140px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 100px;
                        background: transparent;
                        border: 2px solid #fff;
                        transition: all 0.3s ease;
                    }
                    .live-stream #btn-faws-play-pause:hover {
                        background: rgba(255,255,255,0.1);
                    }
                    .live-stream #btn-faws-play-pause i {
                        font-size: 40px;
                        color: white !important;
                    }
                    .live-stream .next-prev {
                        width: 55px !important;
                        height: 55px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: white;
                        border-radius: 100px;
                        transition: all 0.3s ease;
                    }
                    .live-stream .next-prev i {
                        font-size: 18px;
                        color: #000 !important;
                    }
                    .live-stream .btn-mute {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        width: 40px !important;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: white;
                        border-radius: 100px;
                        cursor: pointer;
                        z-index: 4;
                    }
                    .live-stream .btn-mute i {
                        font-size: 15px;
                        color: #333 !important;
                    }
                    .live-stream .infos-ctn {
                        position: relative;
                        z-index: 3;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin: 20px;
                        color: white;
                    }
                    .live-stream .infos-ctn .timer, 
                    .live-stream .infos-ctn .duration {
                        font-size: 16px;
                        font-weight: bold;
                        color: white;
                    }
                    .live-stream .infos-ctn .title {
                        font-size: 22px;
                        font-weight: 500;
                        color: white;
                        text-align: center;
                    }
                    .live-stream #myProgress {
                        position: relative;
                        z-index: 3;
                        width: 100%;
                        background-image: url('/assets/images/audio-p-bar.webp');
                        background-repeat: no-repeat;
                        background-size: cover;
                        cursor: pointer;
                        border-radius: 10px;
                        height: 30px;
                    }
                    .live-stream #myBar {
                        width: 0%;
                        height: 30px;
                        border-radius: 10px;
                        background-image: url('/assets/images/audio-p-bar-clr.webp');
                        background-repeat: no-repeat;
                        background-size: cover;
                    }
                    .live-stream .playlist-ctn {
                        margin-top: 0;
                    }
                    .live-stream .playlist-track-ctn {
                        display: flex;
                        background-color: #fbf9f7;
                        margin-top: 2px;
                        cursor: pointer;
                        align-items: center;
                        padding: 15px 20px;
                        transition: all 0.3s ease;
                    }
                    .live-stream .playlist-track-ctn:hover {
                        background-color: #f3f0ed;
                    }
                    .live-stream .playlist-track-ctn.active-track {
                        background-color: #fff;
                    }
                    .live-stream .playlist-track-ctn.active-track .playlist-title,
                    .live-stream .playlist-track-ctn.active-track .playlist-duration {
                        color: #ffc266 !important;
                        font-weight: bold;
                    }
                    .live-stream .playlist-track-ctn.active-track .playlist-btn-play {
                        background-color: #ffc266;
                    }
                    .live-stream .playlist-track-ctn.active-track .playlist-btn-play i {
                        color: white !important;
                    }
                    .live-stream .playlist-btn-play {
                        width: 50px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: white;
                        border-radius: 100px;
                        margin-right: 22px;
                        flex-shrink: 0;
                    }
                    .live-stream .playlist-btn-play i {
                        color: #909090 !important;
                        font-size: 13px;
                    }
                    .live-stream .playlist-info-track {
                        width: 80%;
                    }
                    .live-stream .playlist-title,
                    .live-stream .playlist-duration {
                        color: #111;
                        font-size: 20px;
                        font-weight: 500;
                    }
                    .live-stream .playlist-author {
                        font-size: 14px;
                        color: #666;
                    }
                    .live-stream .loadmore {
                        margin-top: 40px;
                        margin-bottom: 60px;
                    }
                `}} />
                <div className="container">
                    <div className="heading text-center" style={{ marginBottom: "50px" }}>
                        <img
                            src="/assets/images/Logo.PNG"
                            alt="Church Logo"
                            style={{
                                display: "block",
                                maxWidth: "115px",
                                height: "auto",
                                margin: "0 auto 15px"
                            }}
                        />
                        <p style={{
                            fontSize: "18px",
                            color: "#666",
                            marginBottom: "10px",
                            fontWeight: "500"
                        }}>Explore inspiring teachings and impactful messages from our recent sermons.</p>
                        <h2 style={{
                            fontSize: "60px",
                            fontWeight: "900",
                            color: "#222",
                            margin: "0",
                            lineHeight: "1.2"
                        }}>Listen to Our Live Audio Sermons</h2>
                    </div>

                    <div className="row">
                        <div className="audio-player">
                            <audio
                                ref={audioRef}
                                onTimeUpdate={onTimeUpdate}
                                src={currentTrack?.audio_url}
                                onEnded={nextTrack}
                            />

                            <div className="player-ctn">
                                <div className="audio-run" data-aos="fade-up" data-aos-duration="1000">
                                    <div className="parallax" style={{
                                        backgroundImage: "url(/assets/images/livestream.webp)",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        backgroundAttachment: "scroll"
                                    }}></div>

                                    <div className="btn-mute" id="toggleMute" onClick={toggleMute} style={{ top: "20px", right: "20px" }}>
                                        <div id="btn-faws-volume">
                                            <i id="icon-vol-up" className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
                                        </div>
                                    </div>

                                    <div className="btn-ctn" style={{ minHeight: "220px" }}>
                                        <div className="btn-action first-btn next-prev" onClick={previousTrack}>
                                            <div id="btn-faws-back">
                                                <i className='fas fa-step-backward'></i>
                                            </div>
                                        </div>

                                        <div className="btn-action" onClick={togglePlay}>
                                            <div id="btn-faws-play-pause" style={{ background: "#2e4666", border: "none" }}>
                                                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} id="icon-play" style={{ color: "white" }}></i>
                                            </div>
                                        </div>

                                        <div className="btn-action next-prev" onClick={nextTrack}>
                                            <div id="btn-faws-next">
                                                <i className="fas fa-step-forward" aria-hidden="true"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="progress-ctn" style={{ position: "relative", zIndex: 3, padding: "0 20px 20px" }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="timer" style={{ color: "white", fontWeight: "bold", minWidth: "45px" }}>{currentTime}</div>
                                            <div id="myProgress" onClick={seek} style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.2)", borderRadius: "4px" }}>
                                                <div id="myBar" ref={barRef} style={{ height: "100%", background: "white", borderRadius: "4px", width: "0%" }}></div>
                                            </div>
                                            <div className="duration" style={{ color: "white", fontWeight: "bold", minWidth: "45px" }}>{durationText}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="playlist-ctn" data-aos="fade-up" data-aos-duration="1500">
                                    {playlist.slice(0, 5).map((track, index) => (
                                        <div
                                            key={track.id}
                                            className={`playlist-track-ctn ${index === currentTrackIndex ? 'active-track' : ''}`}
                                            onClick={() => changeTrack(index)}
                                        >
                                            <div className="playlist-btn-play">
                                                <i className="fas fa-play"></i>
                                            </div>
                                            <div className="playlist-info-track">
                                                <div className="playlist-title">{track.title}</div>
                                                <div className="playlist-author">{track.speaker}</div>
                                            </div>
                                            <div className="playlist-duration">{track.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center loadmore">
                        <a href="/sermons.html" className="theme-btn" style={{
                            backgroundColor: "#2e4666",
                            color: "white",
                            padding: "15px 40px",
                            borderRadius: "50px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            fontSize: "14px",
                            border: "none"
                        }}>View All Playlist</a>
                    </div>
                </div>
            </section>
        </>
    );
};

export default LiveStream;
