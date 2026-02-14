import React from 'react';
import { Calendar, Clock, User, Eye, Download, Book, Video } from 'lucide-react';
import Link from 'next/link';

interface SermonCardProps {
    sermon: any;
    onView: () => void;
    onDelete: () => void;
}

export default function SermonCard({ sermon, onView, onDelete }: SermonCardProps) {
    const date = new Date(sermon.sermon_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const getYouTubeID = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const renderMedia = () => {
        if (sermon.video_type === 'url' && sermon.video_file) {
            const ytId = getYouTubeID(sermon.video_file);
            if (ytId) {
                return (
                    <div className="cf-card-video-preview">
                        <img
                            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                            alt="YouTube Thumbnail"
                            className="cf-card-main-image"
                        />
                    </div>
                );
            }
            if (sermon.video_file.includes('facebook.com') || sermon.video_file.includes('fb.watch')) {
                return (
                    <div className="cf-card-video-preview">
                        <img src="/Assests/default-event.jpg" alt="Facebook Video" className="cf-card-main-image" />
                    </div>
                );
            }
        }

        if (sermon.video_type === 'file' && sermon.video_file) {
            return (
                <video className="cf-card-main-image" muted playsInline preload="metadata">
                    <source src={sermon.video_file} type="video/mp4" />
                </video>
            );
        }

        const imagePath = sermon.sermon_image ? sermon.sermon_image : '/Assests/default-event.jpg';
        return <img src={imagePath} alt={sermon.sermon_title} className="cf-card-main-image" />;
    };

    // Parse scriptures if they come as a comma-separated string or array
    const scripture = Array.isArray(sermon.scriptures)
        ? sermon.scriptures.map((s: any) => s.scripture_reference).join(', ')
        : (sermon.scriptures || '');

    return (
        <div className="cf-sermon-card-refined">
            <div className="cf-card-media-wrapper" onClick={onView}>
                <div className="cf-card-media-inner">
                    {renderMedia()}
                </div>

                {/* Top Left Badge */}
                <div className="cf-card-category-badge">
                    {sermon.sermon_category?.replace('-', ' ') || 'sunday service'}
                </div>

                {/* Live Overlay Style */}
                <div className="cf-card-live-indicator">
                    <div className="cf-live-avatar">
                        <img src="/assets/Logo.PNG" alt="avatar" />
                    </div>
                    <span>{sermon.sermon_speaker} was live</span>
                </div>

                {/* Bottom Right Media Icon */}
                <div className="cf-card-media-toggle">
                    <Video size={18} />
                </div>
            </div>

            <div className="cf-card-info-content">
                <div className="cf-card-time-row">
                    <span className="cf-card-date">
                        <Calendar size={14} /> {date}
                    </span>
                    {sermon.sermon_duration && (
                        <span className="cf-card-duration">
                            <Clock size={14} /> {sermon.sermon_duration} min
                        </span>
                    )}
                </div>

                <h3 className="cf-card-title">{sermon.sermon_title}</h3>

                <p className="cf-card-speaker">
                    <User size={12} /> {sermon.sermon_speaker}
                </p>

                <p className="cf-card-excerpt">
                    {sermon.sermon_description.substring(0, 80)}
                    {sermon.sermon_description.length > 80 ? '...' : ''}
                </p>

                {scripture && (
                    <div className="cf-card-scripture">
                        <Book size={12} /> {scripture}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px' }}>
                    {sermon.sermon_series && (
                        <div className="cf-card-series-pill">
                            {sermon.sermon_series}
                        </div>
                    )}

                    <div className="cf-card-stats-row" style={{ border: 'none', padding: 0, gap: '15px' }}>
                        <span className="cf-card-stat">
                            <Eye size={12} /> {sermon.view_count || 0}
                        </span>
                        <span className="cf-card-stat">
                            <Download size={12} /> {sermon.download_count || 0}
                        </span>
                    </div>
                </div>

                <div className="cf-card-actions-row">
                    <button className="cf-action-btn cf-btn-outlined" style={{ flex: 1 }} onClick={onView}>View</button>
                    <Link href={`/admin/add-sermon?id=${sermon.id}`} className="cf-action-btn cf-btn-outlined" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        Edit
                    </Link>
                    <button className="cf-action-btn cf-btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}>Delete</button>
                </div>
            </div>
        </div>
    );
}
