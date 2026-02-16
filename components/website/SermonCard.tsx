"use client";

import React, { useRef } from 'react';
import Link from 'next/link';

interface Sermon {
    id: number;
    sermon_title: string;
    sermon_speaker: string;
    sermon_date: string;
    sermon_series?: string;
    sermon_description: string;
    video_file?: string;
    video_type?: 'url' | 'file';
    audio_file?: string;
    pdf_file?: string;
    sermon_image?: string;
    scriptures?: { scripture_reference: string }[];
}

interface SermonCardProps {
    sermon: Sermon;
    onOpenMedia: (type: 'video' | 'audio' | 'pdf', url: string, videoType?: 'url' | 'file') => void;
}

const SermonCard: React.FC<SermonCardProps> = ({ sermon, onOpenMedia }) => {
    const videoPreviewRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (videoPreviewRef.current) {
            videoPreviewRef.current.play().catch(err => console.log("Video autoplay failed:", err));
        }
    };

    const handleMouseLeave = () => {
        if (videoPreviewRef.current) {
            videoPreviewRef.current.pause();
            videoPreviewRef.current.currentTime = 0;
        }
    };

    const isUrlVideo = sermon.video_type === 'url';
    const hasVideo = sermon.video_file && sermon.video_file !== 'null' && sermon.video_file !== '';
    const hasFileVideo = hasVideo && !isUrlVideo;

    // Build video path for uploaded files
    let videoPath = sermon.video_file;
    if (hasFileVideo && videoPath && !videoPath.startsWith('/') && !videoPath.startsWith('http')) {
        videoPath = `/${videoPath}`;
    }

    const formattedDate = new Date(sermon.sermon_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const scripturesString = Array.isArray(sermon.scriptures)
        ? sermon.scriptures.map((s: any) => s.scripture_reference).join(', ')
        : '';

    return (
        <div className="sermon" data-aos="zoom-in-right" data-aos-duration="1000">
            <div className={`sermon-img ${hasFileVideo ? 'video' : ''}`}>
                <div className="sermon-media">
                    {hasFileVideo ? (
                        <video
                            ref={videoPreviewRef}
                            className="sermon-video-preview"
                            muted
                            playsInline
                            preload="metadata"
                            poster={sermon.sermon_image || "/assets/images/sermon-img.webp"}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
                        >
                            <source src={videoPath} type="video/mp4" />
                        </video>
                    ) : (hasVideo && isUrlVideo) ? (
                        <div dangerouslySetInnerHTML={{ __html: getIframeHTML(sermon.video_file!) }} />
                    ) : (
                        <img
                            src={sermon.sermon_image || "/assets/images/sermon-img.webp"}
                            alt={sermon.sermon_title}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/sermon-img.webp' }}
                        />
                    )}
                </div>

                <ul>
                    <li><a className="s_audio" href="javascript:void(0)" onClick={() => onOpenMedia('audio', sermon.audio_file!, 'file')}><img src="/assets/images/music-note.svg" alt="volume" /></a></li>
                    <li><a className="s_video" href="javascript:void(0)" onClick={() => onOpenMedia('video', sermon.video_file!, sermon.video_type)}><img src="/assets/images/play-button-2.svg" alt="Play Button" /></a></li>
                    <li><a className="s_pdf" href="javascript:void(0)" onClick={() => sermon.pdf_file && onOpenMedia('pdf', sermon.pdf_file, 'file')} style={{ opacity: sermon.pdf_file ? 1 : 0.5, cursor: sermon.pdf_file ? 'pointer' : 'not-allowed' }}><img src="/assets/images/book.svg" alt="Book" /></a></li>
                    <li><a className="s_music" href={sermon.audio_file} download><img src="/assets/images/download.svg" alt="download" /></a></li>
                </ul>
            </div>

            <div className="sermon-data">
                <ul>
                    <li>{sermon.sermon_speaker}</li>
                    <li>{formattedDate}</li>
                </ul>
                <h3><Link href={`/sermons/${sermon.id}`}>{sermon.sermon_title}</Link></h3>
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
};

function getIframeHTML(videoUrl: string) {
    if (!videoUrl) return '';

    const iframeStyle = 'width: 100%; height: auto; aspect-ratio: 16/9; display: block; border: none; border-radius: 8px;';

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

export default SermonCard;
