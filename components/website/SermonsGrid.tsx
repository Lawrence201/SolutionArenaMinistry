"use client";

import React, { useState, useEffect } from 'react';
import SermonCard from './SermonCard';
import SermonModals from './SermonModals';

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

const SermonsGrid: React.FC = () => {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'video' | 'audio' | 'pdf';
        url: string;
        title?: string;
        videoType?: 'url' | 'file';
    }>({
        isOpen: false,
        type: 'video',
        url: '',
    });

    const fetchSermons = async (pageNum: number, append = false) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/website/sermons?page=${pageNum}&limit=6`);
            const data = await response.json();

            if (data.success) {
                if (append) {
                    setSermons(prev => [...prev, ...data.data]);
                } else {
                    setSermons(data.data);
                }
                setHasMore(data.pagination.has_more);
                setError(false);
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

    useEffect(() => {
        fetchSermons(1);
    }, []);

    const loadMore = () => {
        if (hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchSermons(nextPage, true);
        }
    };

    const handleOpenMedia = async (type: 'video' | 'audio' | 'pdf', url: string, videoType?: 'url' | 'file') => {
        // Track the action
        const sermon = sermons.find(s => s.video_file === url || s.audio_file === url || s.pdf_file === url);
        if (sermon) {
            let actionType = 'view';
            if (type === 'audio') actionType = 'view'; // Assuming 'view' includes audio play
            if (type === 'pdf') actionType = 'download_pdf';

            fetch('/api/website/sermons/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sermon_id: sermon.id, action_type: actionType })
            }).catch(err => console.error("Error tracking action:", err));
        }

        setModalConfig({
            isOpen: true,
            type,
            url,
            title: sermon?.sermon_title,
            videoType
        });
    };

    return (
        <section className="gap light-bg recent-sermon-one">
            <div className="container">
                {error && (
                    <div className="alert alert-danger text-center">
                        <p>Failed to load sermons. Please try again later.</p>
                        <button className="btn btn-primary" onClick={() => fetchSermons(1)}>Retry</button>
                    </div>
                )}

                {!error && sermons.length === 0 && !loading && (
                    <div className="text-center">
                        <h4>No sermons available at the moment.</h4>
                        <p>Please check back later for new sermons.</p>
                    </div>
                )}

                <div className="row">
                    {sermons.map((sermon) => (
                        <div key={sermon.id} className="col-lg-12">
                            <SermonCard
                                sermon={sermon}
                                onOpenMedia={handleOpenMedia}
                            />
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="text-center my-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {hasMore && !loading && (
                    <div className="d-flex justify-content-center loadmore">
                        <button className="theme-btn" onClick={loadMore}>
                            Load More
                        </button>
                    </div>
                )}
            </div>

            <SermonModals
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                type={modalConfig.type}
                url={modalConfig.url}
                title={modalConfig.title}
                videoType={modalConfig.videoType}
            />
        </section>
    );
};

export default SermonsGrid;
