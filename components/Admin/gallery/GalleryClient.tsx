'use client';

import React, { useState, useEffect } from 'react';
import './gallery.css';
import {
    LayoutGrid,
    List as ListIcon,
    Image as ImageIcon,
    Film,
    Layers,
    Search,
    Filter,
    ImagePlus,
    Calendar,
    User,
    MoreHorizontal,
    Eye,
    Download,
    Heart,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    Edit,
    Bot,
    Grid,
    Video as VideoIcon,
    Folder,
    Trash,
    Clock,
    Play
} from 'lucide-react';
import Link from 'next/link';
import { getGalleryData, getGalleryInsights, deleteGalleryItem } from '@/app/actions/gallery';

// Types
type MediaType = 'photo' | 'video' | 'album';

interface MediaItem {
    id: number;
    type: MediaType;
    title: string;
    url?: string; // For photos/videos
    coverImage?: string; // For albums
    description?: string;
    date: string;
    photographer?: string;
    category: string;
    likes?: number;
    views?: number;
    duration?: string; // For videos
    mediaCount?: number; // For albums
    photoCount?: number;
    videoCount?: number;
}

interface GalleryStats {
    totalMedia: number;
    totalPhotos: number;
    totalVideos: number;
    totalAlbums: number;
}

interface CategoryCounts {
    all: number;
    worship: number;
    events: number;
    youth: number;
    baptism: number;
    celebrations: number;
    [key: string]: number; // Allow flexible keys
}

interface Insight {
    type: 'success' | 'info' | 'warning' | 'error';
    icon: string;
    text: string;
}

export default function GalleryClient() {
    console.log('GalleryClient: rendering');
    const [galleryData, setGalleryData] = useState<MediaItem[]>([]);
    const [filteredData, setFilteredData] = useState<MediaItem[]>([]);
    const [stats, setStats] = useState<GalleryStats>({ totalMedia: 0, totalPhotos: 0, totalVideos: 0, totalAlbums: 0 });
    const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({ all: 0, worship: 0, events: 0, youth: 0, baptism: 0, celebrations: 0 });
    const [insights, setInsights] = useState<Insight[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [currentView, setCurrentView] = useState<'all' | 'albums' | 'photos' | 'videos'>('all');
    const [currentCategory, setCurrentCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

    // Lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);
    const [lightboxItems, setLightboxItems] = useState<MediaItem[]>([]);

    useEffect(() => {
        loadGalleryData();
        loadInsights();
    }, [currentView, currentCategory]); // Re-fetch when major filters change

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadGalleryData();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadGalleryData = async () => {
        setIsLoading(true);
        try {
            const result = await getGalleryData({
                view: currentView,
                category: currentCategory,
                search: searchTerm
            });

            if (result.success) {
                setGalleryData(result.data);
                setFilteredData(result.data); // Server already filtered
                setStats(result.stats);
                setCategoryCounts(result.categoryCounts as CategoryCounts);
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error('Failed to load gallery data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadInsights = async () => {
        try {
            const result = await getGalleryInsights();
            if (result.success) {
                setInsights(result.data);
            }
        } catch (error) {
            console.error('Error loading insights', error);
        }
    }

    const deleteItem = async (id: number, type: MediaType) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const result = await deleteGalleryItem(id, type);
            if (result.success) {
                loadGalleryData(); // Refresh
                loadInsights();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Delete failed', error);
            alert('Failed to delete item');
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Lightbox Logic
    const openLightbox = (item: MediaItem) => {
        if (item.type === 'album') return;

        // Filter out albums for lightbox navigation
        const items = filteredData.filter(i => i.type !== 'album');
        const index = items.findIndex(i => i.id === item.id);

        setLightboxItems(items);
        setCurrentLightboxIndex(index !== -1 ? index : 0);
        setLightboxOpen(true);
    };

    const openAlbumCover = (item: MediaItem) => {
        // Just show this one item (cover)
        setLightboxItems([item]);
        setCurrentLightboxIndex(0);
        setLightboxOpen(true);
    }

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const navigateLightbox = (direction: number) => {
        const newIndex = (currentLightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
        setCurrentLightboxIndex(newIndex);
    };

    const currentLightboxItem = lightboxItems[currentLightboxIndex];

    const getInsightIcon = (iconName: string) => {
        switch (iconName) {
            case 'trending-up': return <Bot className="w-5 h-5 text-green-500" />;
            case 'image': return <ImageIcon className="w-5 h-5 text-blue-500" />;
            case 'alert': return <Bot className="w-5 h-5 text-amber-500" />;
            default: return <Bot className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <>
            {/* Page Header */}
            <div className="cf-em-page-header">
                <div className="cf-em-header-content">
                    <h1>Media Gallery</h1>
                    <p>Manage and organize your church's photos, videos, and albums</p>
                </div>
                <div className="cf-em-header-actions">
                    <Link href="/admin/add-gallery" className="cf-em-btn cf-em-btn-primary">
                        <ImagePlus size={20} />
                        <span>Upload Media</span>
                    </Link>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="insights-section">
                <div className="insights-header">
                    <div className="insight-header-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="insight-icon">
                            <Bot className="w-6 h-6 text-blue-500" />
                        </span>
                        <h2>AI-Powered Insights</h2>
                    </div>
                    <div className="cf-alerts-layout" id="insightsGrid">
                        {insights.length > 0 ? (
                            insights.map((insight, idx) => (
                                <div key={idx} className={`cf-alert-tile cf-alert-${insight.type}`} style={{ padding: '15px' }}>
                                    <div className="flex items-center gap-3">
                                        {getInsightIcon(insight.icon)}
                                        <span>{insight.text}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="cf-alert-tile" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>
                                <p style={{ color: '#94a3b8' }}>Loading insights...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Gallery Metrics */}
            <div className="cf-gallery-metrics">
                <div className="cf-metric-card">
                    <div className="cf-metric-icon cf-metric-total">
                        <Grid size={28} />
                    </div>
                    <div className="cf-metric-content">
                        <h3>{stats.totalMedia}</h3>
                        <p>Total Items</p>
                        <span className="cf-metric-badge cf-badge-total">All Media</span>
                    </div>
                </div>
                <div className="cf-metric-card">
                    <div className="cf-metric-icon cf-metric-photos">
                        <ImageIcon size={28} color="pink" />
                    </div>
                    <div className="cf-metric-content">
                        <h3>{stats.totalPhotos}</h3>
                        <p>Photos</p>
                        <span className="cf-metric-badge cf-badge-photos">Images</span>
                    </div>
                </div>
                <div className="cf-metric-card">
                    <div className="cf-metric-icon cf-metric-videos">
                        <VideoIcon size={28} color="#1e40af" />
                    </div>
                    <div className="cf-metric-content">
                        <h3>{stats.totalVideos}</h3>
                        <p>Videos</p>
                        <span className="cf-metric-badge cf-badge-videos">Recordings</span>
                    </div>
                </div>
                <div className="cf-metric-card">
                    <div className="cf-metric-icon cf-metric-albums">
                        <Folder size={28} color="#065f46" />
                    </div>
                    <div className="cf-metric-content">
                        <h3>{stats.totalAlbums}</h3>
                        <p>Albums</p>
                        <span className="cf-metric-badge cf-badge-albums">Collections</span>
                    </div>
                </div>
            </div>

            {/* Main Gallery Content */}
            <div className="cf-gallery-content-grid">
                {/* Sidebar Categories */}
                <div className="cf-gallery-sidebar">
                    <div className="cf-gallery-category-card">
                        <div className="cf-category-header">
                            <h2>Categories</h2>
                            <p>Browse by type</p>
                        </div>
                        <div className="cf-category-list">
                            <div className={`cf-category-item ${currentCategory === 'all' ? 'cf-category-active' : ''}`} onClick={() => setCurrentCategory('all')}>
                                <div className="cf-category-dot"></div>
                                <div className="cf-category-info">
                                    <span className="cf-category-name">All Media</span>
                                    <span className="cf-category-count">{categoryCounts.all}</span>
                                </div>
                            </div>
                            <div className={`cf-category-item ${currentCategory === 'worship' ? 'cf-category-active' : ''}`} onClick={() => setCurrentCategory('worship')}>
                                <div className="cf-category-dot"></div>
                                <div className="cf-category-info">
                                    <span className="cf-category-name">Worship Services</span>
                                    <span className="cf-category-count">{categoryCounts.worship || 0}</span>
                                </div>
                            </div>
                            <div className={`cf-category-item ${currentCategory === 'events' ? 'cf-category-active' : ''}`} onClick={() => setCurrentCategory('events')}>
                                <div className="cf-category-dot"></div>
                                <div className="cf-category-info">
                                    <span className="cf-category-name">Church Events</span>
                                    <span className="cf-category-count">{categoryCounts.events || 0}</span>
                                </div>
                            </div>
                            <div className={`cf-category-item ${currentCategory === 'youth' ? 'cf-category-active' : ''}`} onClick={() => setCurrentCategory('youth')}>
                                <div className="cf-category-dot"></div>
                                <div className="cf-category-info">
                                    <span className="cf-category-name">Youth Ministry</span>
                                    <span className="cf-category-count">{categoryCounts.youth || 0}</span>
                                </div>
                            </div>
                            <div className={`cf-category-item ${currentCategory === 'baptism' ? 'cf-category-active' : ''}`} onClick={() => setCurrentCategory('baptism')}>
                                <div className="cf-category-dot"></div>
                                <div className="cf-category-info">
                                    <span className="cf-category-name">Baptisms</span>
                                    <span className="cf-category-count">{categoryCounts.baptism || 0}</span>
                                </div>
                            </div>
                            <div className={`cf-category-item ${currentCategory === 'celebrations' ? 'cf-category-active' : ''}`} onClick={() => setCurrentCategory('celebrations')}>
                                <div className="cf-category-dot"></div>
                                <div className="cf-category-info">
                                    <span className="cf-category-name">Celebrations</span>
                                    <span className="cf-category-count">{categoryCounts.celebrations || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Gallery Area */}
                <div className="cf-gallery-main">
                    {/* Controls */}
                    <div className="cf-gallery-controls">
                        <div className="cf-gallery-tabs">
                            <button className={`cf-gallery-tab ${currentView === 'all' ? 'cf-tab-active' : ''}`} onClick={() => setCurrentView('all')}>All</button>
                            <button className={`cf-gallery-tab ${currentView === 'albums' ? 'cf-tab-active' : ''}`} onClick={() => setCurrentView('albums')}>Albums</button>
                            <button className={`cf-gallery-tab ${currentView === 'photos' ? 'cf-tab-active' : ''}`} onClick={() => setCurrentView('photos')}>Photos</button>
                            <button className={`cf-gallery-tab ${currentView === 'videos' ? 'cf-tab-active' : ''}`} onClick={() => setCurrentView('videos')}>Videos</button>
                        </div>
                        <div className="cf-gallery-search">
                            <span className="cf-search-icon">
                                <Search size={18} />
                            </span>
                            <input
                                type="text"
                                className="cf-search-input"
                                placeholder="Search media..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="cf-view-toggle">
                            <button
                                className={`cf-view-btn ${displayMode === 'grid' ? 'cf-view-active' : ''}`}
                                onClick={() => setDisplayMode('grid')}
                                title="Grid View"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                className={`cf-view-btn ${displayMode === 'list' ? 'cf-view-active' : ''}`}
                                onClick={() => setDisplayMode('list')}
                                title="List View"
                            >
                                <ListIcon size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className={`cf-gallery-grid ${displayMode === 'list' ? 'cf-list-view' : ''}`} id="galleryGrid">
                        {isLoading ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                                <p>Loading gallery...</p>
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="cf-empty-state">
                                <Grid className="w-20 h-20 text-slate-300 mb-5 mx-auto" />
                                <h3>No Media Found</h3>
                                <p>Try adjusting your filters or upload new media</p>
                                <Link href="/admin/add-gallery" className="cf-em-btn cf-em-btn-primary">
                                    Upload Media
                                </Link>
                            </div>
                        ) : (
                            filteredData.map((item) => {
                                if (item.type === 'album') {
                                    return (
                                        <div key={item.id} className="cf-album-item" onClick={() => openAlbumCover(item)}>
                                            <div className="cf-album-cover">
                                                <img src={item.coverImage} alt={item.title} className="cf-album-cover-image" />
                                                <div className="cf-album-cover-gradient"></div>
                                            </div>
                                            <div className="cf-gallery-item-actions" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5, zIndex: 10 }}>
                                                <Link href={`/admin/add-gallery?id=${item.id}&type=album`} className="cf-item-action-btn" title="Edit" style={{ background: 'white', padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none', display: 'flex', color: 'inherit' }}>
                                                    <Edit size={16} />
                                                </Link>
                                                <button className="cf-item-action-btn delete" onClick={() => deleteItem(item.id, 'album')} title="Delete" style={{ background: 'white', padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none', color: 'red' }}>
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                            <div className="cf-album-content">
                                                <h3 className="cf-album-title">{item.title}</h3>
                                                <div className="cf-album-meta">
                                                    <div className="cf-album-stat">
                                                        <Grid size={16} />
                                                        <span>{item.mediaCount} items</span>
                                                    </div>
                                                    <div className="cf-album-stat">
                                                        <ImageIcon size={16} />
                                                        <span>{item.photographer || 'Unknown'}</span>
                                                    </div>
                                                </div>
                                                <p className="cf-album-description">{item.description || 'No description'}</p>
                                                <div className="cf-album-date" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <Calendar size={14} />
                                                    {formatDate(item.date)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else if (item.type === 'photo') {
                                    return (
                                        <div key={item.id} className="cf-gallery-item" onClick={() => openLightbox(item)}>
                                            <img src={item.url} alt={item.title} loading="lazy" />
                                            <span className="cf-gallery-item-badge cf-badge-photo">Photo</span>
                                            <div className="cf-gallery-item-overlay">
                                                <h3 className="cf-item-title">{item.title}</h3>
                                                <div className="cf-item-info">
                                                    <div className="cf-item-meta">
                                                        <Heart /> {item.likes || 0}
                                                    </div>
                                                    <div className="cf-item-meta">
                                                        <Calendar /> {formatDate(item.date)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cf-gallery-item-actions" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5, zIndex: 10 }}>
                                                <Link href={`/admin/add-gallery?id=${item.id}&type=media`} className="cf-item-action-btn" style={{ background: 'white', padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none', display: 'flex', color: 'inherit' }}>
                                                    <Edit size={16} />
                                                </Link>
                                                <button className="cf-item-action-btn delete" onClick={() => deleteItem(item.id, 'photo')} style={{ background: 'white', padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none', color: 'red' }}>
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                } else if (item.type === 'video') {
                                    return (
                                        <div key={item.id} className="cf-gallery-item" onClick={() => openLightbox(item)}>
                                            <video src={item.url} muted className="cf-gallery-item-image"></video>
                                            <span className="cf-gallery-item-badge cf-badge-video">Video</span>
                                            <div className="cf-play-icon">
                                                <Play fill="currentColor" size={32} />
                                            </div>
                                            <div className="cf-gallery-item-overlay">
                                                <h3 className="cf-item-title">{item.title}</h3>
                                                <div className="cf-item-info">
                                                    <div className="cf-item-meta">
                                                        <Heart /> {item.likes || 0}
                                                    </div>
                                                    <div className="cf-item-meta">
                                                        <Clock /> {item.duration || '0:00'}
                                                    </div>
                                                    <div className="cf-item-meta">
                                                        <Eye /> {item.views || 0}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cf-gallery-item-actions" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5, zIndex: 10 }}>
                                                <Link href={`/admin/add-gallery?id=${item.id}&type=media`} className="cf-item-action-btn" style={{ background: 'white', padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none', display: 'flex', color: 'inherit' }}>
                                                    <Edit size={16} />
                                                </Link>
                                                <button className="cf-item-action-btn delete" onClick={() => deleteItem(item.id, 'video')} style={{ background: 'white', padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none', color: 'red' }}>
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && currentLightboxItem && (
                <div className="cf-lightbox active" onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}>
                    <div className="cf-lightbox-content">
                        <button className="cf-lightbox-close" onClick={closeLightbox}>
                            <X size={32} />
                        </button>
                        {lightboxItems.length > 1 && (
                            <>
                                <button className="cf-lightbox-prev" onClick={() => navigateLightbox(-1)}>
                                    <ChevronLeft size={40} />
                                </button>
                                <button className="cf-lightbox-next" onClick={() => navigateLightbox(1)}>
                                    <ChevronRight size={40} />
                                </button>
                            </>
                        )}
                        <div className="cf-lightbox-media" id="lightboxMedia">
                            {currentLightboxItem.type === 'video' ? (
                                <video src={currentLightboxItem.url || currentLightboxItem.coverImage} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '12px' }}></video>
                            ) : (
                                <img src={currentLightboxItem.url || currentLightboxItem.coverImage} alt={currentLightboxItem.title} style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }} />
                            )}
                        </div>
                        <div className="cf-lightbox-info">
                            <div className="cf-lightbox-title">{currentLightboxItem.title}</div>
                            <div className="cf-lightbox-meta">
                                <span>{formatDate(currentLightboxItem.date)}</span>
                                <span>•</span>
                                <span>{currentLightboxItem.photographer || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
