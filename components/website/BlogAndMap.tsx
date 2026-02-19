"use client";

import React, { useState, useEffect } from "react";

interface Blog {
    id: number;
    title: string;
    author: string;
    published_date: string;
    excerpt: string;
    thumbnail: string;
    comment_count: number;
}

export const RecentBlogs = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('/api/website/blogs');
                const data = await response.json();
                if (data.success && data.data && data.data.blogs) {
                    const mappedBlogs = data.data.blogs.map((b: any) => ({
                        id: b.id,
                        title: b.title,
                        slug: b.slug,
                        author: b.author,
                        published_date: b.formatted_date,
                        excerpt: b.excerpt,
                        thumbnail: b.thumbnail_path,
                        comment_count: b.comment_count,
                        views: b.views || 0
                    }));
                    setBlogs(mappedBlogs);
                }
            } catch (err) {
                console.error("Error loading blogs:", err);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <section className="gap blog">
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
                            .heading h2 {
                                font-size: 32px !important;
                            }
                            .heading p {
                                font-size: 15px !important;
                            }
                        }
                        .blog-meta {
                            margin-bottom: 30px;
                            display: flex;
                            flex-direction: column;
                            height: 100%;
                        }
                        .blog-meta figure {
                            margin-bottom: 20px;
                            overflow: hidden;
                        }
                        .blog-meta figure img {
                            height: 250px;
                            width: 100%;
                            object-fit: cover;
                            transition: transform 0.3s ease;
                        }
                        .blog-meta ul {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            list-style: none;
                            padding: 0;
                            margin-bottom: 15px;
                        }
                        .blog-meta ul li {
                            font-size: 14px;
                            color: #666;
                        }
                        .blog-meta ul li.date {
                            color: #3e81db;
                            font-weight: bold;
                        }
                        .blog-meta a.font-bold {
                            display: block;
                            font-size: 24px;
                            font-weight: 700;
                            color: #222;
                            text-decoration: none;
                            margin-bottom: 15px;
                            line-height: 1.3;
                            transition: color 0.3s;
                        }
                        .blog-meta a.font-bold:hover {
                            color: #3e81db;
                        }
                        .blog-meta p {
                            color: #666;
                            line-height: 1.6;
                            margin-bottom: 20px;
                            flex-grow: 1;
                        }
                        .blog-meta .read-more {
                            align-self: flex-start;
                            padding: 8px 18px;
                            font-size: 13px;
                            min-width: unset;
                            line-height: normal;
                        }
                        .loadmore {
                            margin-top: 40px;
                        }
                    `}} />
                    <p>Read our latest stories and articles from the church community.</p>
                    <h2>Recent Blogs</h2>
                </div>
                <div className="row justify-content-center">
                    {blogs.length > 0 ? (
                        blogs.slice(0, 3).map((blog, index) => {
                            const delay = 400 + (index * 100);
                            const duration = 600 + (index * 300);
                            const excerpt = blog.excerpt && blog.excerpt.length > 120
                                ? blog.excerpt.substring(0, 120) + '...'
                                : blog.excerpt;

                            let thumbnailSrc = blog.thumbnail;
                            if (thumbnailSrc && !thumbnailSrc.startsWith('/') && !thumbnailSrc.startsWith('http')) {
                                thumbnailSrc = `/assets/images/${thumbnailSrc.split('/').pop()}`;
                            }

                            return (
                                <div key={blog.id} className="col-lg-4 col-md-6 col-sm-12">
                                    <div className="blog-meta" data-aos="fade-up" data-aos-delay={delay} data-aos-duration={duration}>
                                        {thumbnailSrc && (
                                            <figure>
                                                <a href={`/blog/${(blog as any).slug}`}>
                                                    <img
                                                        src={thumbnailSrc}
                                                        alt={blog.title}
                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/blog-img-1.webp' }}
                                                    />
                                                </a>
                                            </figure>
                                        )}
                                        <ul>
                                            <li className="date">{blog.published_date}</li>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                                {(blog as any).views || 0}
                                                <img src="/assets/images/message.svg" alt="Message" style={{ marginLeft: '10px' }} />
                                                {blog.comment_count || 0}
                                            </li>
                                        </ul>
                                        <a href={`/blog/${(blog as any).slug}`} className="font-bold">{blog.title}</a>
                                        <p>{excerpt}</p>
                                        <a href={`/blog/${(blog as any).slug}`} className="theme-btn read-more">Read More</a>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-12 text-center">
                            <p>No recent articles found.</p>
                        </div>
                    )}
                </div>

                <div className="d-flex justify-content-center loadmore">
                    <a href="/blog" className="theme-btn">View All Posts</a>
                </div>
            </div>
        </section>
    );
};

export const MapSection = () => {
    return (
        <div className="map" style={{ paddingBottom: "100px" }}>
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
                    }}>Discover our church location.</p>
                    <h2 style={{
                        fontSize: "60px",
                        fontWeight: "900",
                        color: "#222",
                        margin: "0",
                        lineHeight: "1.2"
                    }}>Our Location</h2>
                </div>
                <div className="map-wrapper" style={{ position: "relative" }}>
                    <iframe
                        id="churchMap"
                        src="https://www.google.com/maps?q=5.574380648684242,-0.28743606802307203&output=embed"
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                    ></iframe>

                    {/* Liquid Glass Button */}
                    <button className="glass-btn" onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    const userLat = position.coords.latitude;
                                    const userLng = position.coords.longitude;
                                    const churchLat = 5.574380648684242;
                                    const churchLng = -0.28743606802307203;
                                    const mapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${churchLat},${churchLng}`;
                                    window.open(mapsUrl, "_blank");
                                },
                                () => alert("Unable to access your location. Please allow location permission.")
                            );
                        } else {
                            alert("Your browser does not support geolocation.");
                        }
                    }}>
                        Get Directions
                    </button>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .glass-btn {
                            position: absolute;
                            top: 15px;
                            right: 15px;
                            z-index: 10;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            padding: 12px 24px;
                            border-radius: 50px;
                            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
                            backdrop-filter: blur(20px) saturate(180%);
                            -webkit-backdrop-filter: blur(20px) saturate(180%);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
                            color: #619de5;
                            font-family: 'Poppins', sans-serif;
                            font-weight: 600;
                            font-size: 14px;
                            letter-spacing: 0.5px;
                            cursor: pointer;
                            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                        }
                        .glass-btn:hover {
                            background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
                            border-color: rgba(255, 255, 255, 0.5);
                            transform: translateY(-3px) scale(1.02);
                            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
                        }
                        .glass-btn:active {
                            transform: scale(0.96);
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                        }
                        @media (max-width: 480px) {
                            .map .heading h2 {
                                font-size: 32px !important;
                            }
                            .map .heading p {
                                font-size: 15px !important;
                            }
                        }
                    `}} />
                </div>
            </div>
        </div>
    );
};

const BlogAndMap = () => {
    return (
        <>
            <RecentBlogs />
            <MapSection />
        </>
    );
};

export default BlogAndMap;
