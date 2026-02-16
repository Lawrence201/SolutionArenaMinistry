"use client";

import React, { useEffect } from 'react';
import styles from './Sermons.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'video' | 'audio' | 'pdf';
    url: string;
    title?: string;
    videoType?: 'url' | 'file';
}

const SermonModals: React.FC<ModalProps> = ({ isOpen, onClose, type, url, title, videoType }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getEmbedUrl = (videoUrl: string) => {
        try {
            const urlObj = new URL(videoUrl);
            const host = urlObj.hostname.toLowerCase();

            if (host.includes('youtube.com') || host.includes('youtu.be')) {
                let videoId = '';
                if (videoUrl.includes('youtube.com/watch?v=')) {
                    videoId = urlObj.searchParams.get('v') || '';
                } else if (videoUrl.includes('youtu.be/')) {
                    videoId = urlObj.pathname.substring(1);
                }
                return `https://www.youtube.com/embed/${videoId}`;
            } else if (host.includes('facebook.com') || host.includes('fb.watch')) {
                return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&width=560`;
            } else if (host.includes('vimeo.com')) {
                const parts = urlObj.pathname.split('/');
                const videoId = parts[parts.length - 1];
                return `https://player.vimeo.com/video/${videoId}`;
            }
        } catch (e) {
            console.error('Error parsing video URL:', e);
        }
        return videoUrl;
    };

    return (
        <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ''}`} onClick={onClose}>
            <button className={styles.modalClose} onClick={onClose}>✕</button>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                {type === 'video' && (
                    <div className={styles.videoContainer}>
                        {videoType === 'url' ? (
                            <iframe
                                src={getEmbedUrl(url)}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                style={{ width: '100%', height: '100%' }}
                            />
                        ) : (
                            <video controls autoPlay style={{ width: '100%', height: '100%' }}>
                                <source src={url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                )}

                {type === 'audio' && (
                    <div className={styles.audioContainer}>
                        <h3 className={styles.audioTitle}>{title || 'Sermon Audio'}</h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px' }}>Playing sermon audio</p>
                        <audio controls autoPlay style={{ width: '100%' }}>
                            <source src={url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}

                {type === 'pdf' && (
                    <div className={styles.pdfContainer}>
                        <iframe src={url} style={{ width: '100%', height: '100%' }} frameBorder="0" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SermonModals;
