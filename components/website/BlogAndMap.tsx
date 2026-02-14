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
                                transform: translateY(15px);
                                max-width: 90px;
                            }
                        }
                        .blog-meta {
                            margin-bottom: 30px;
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
                            gap: 15px;
                            list-style: none;
                            padding: 0;
                            margin-bottom: 15px;
                        }
                        .blog-meta ul li {
                            font-size: 14px;
                            color: #666;
                        }
                        .blog-meta ul li.date {
                            color: #ffc266;
                            font-weight: bold;
                        }
                        .blog-meta a.font-bold {
                            display: block;
                            font-size: 24px;
                            font-weight: 700;
                            color: #222;
                            text-decoration: none;
                            margin-bottom: 15px;
                        }
                        .blog-meta p {
                            color: #666;
                            line-height: 1.6;
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
                        blogs.map((blog, index) => {
                            const delay = 400 + (index * 100);
                            const duration = 600 + (index * 300);
                            const excerpt = blog.excerpt && blog.excerpt.length > 120
                                ? blog.excerpt.substring(0, 120) + '...'
                                : blog.excerpt;

                            // Correctly resolve the thumbnail path
                            // The legacy system used: ../admin_dashboard/Add_Blogs/ + blog.thumbnail_path
                            // In Next.js, these are stored in public/uploads/blogs/ or similar.
                            // However, the component seems to expect them under /assets/images/ or similar.
                            // Let's use the path as provided by the API if it starts with http or /, otherwise prepend /uploads/blogs/
                            let thumbnailSrc = blog.thumbnail;
                            if (thumbnailSrc && !thumbnailSrc.startsWith('/') && !thumbnailSrc.startsWith('http')) {
                                thumbnailSrc = `/uploads/blogs/${thumbnailSrc}`;
                            }

                            return (
                                <div key={blog.id} className="col-lg-4 col-md-6 col-sm-12">
                                    <div className="blog-meta" data-aos="fade-up" data-aos-delay={delay} data-aos-duration={duration}>
                                        {thumbnailSrc && (
                                            <figure>
                                                <img
                                                    src={thumbnailSrc}
                                                    alt={blog.title}
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/blog-img-1.webp' }}
                                                />
                                            </figure>
                                        )}
                                        <ul>
                                            <li className="date">{blog.published_date}</li>
                                            <li style={{ display: 'flex', alignItems: 'center' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                                {(blog as any).views || 0}
                                            </li>
                                            <li style={{ display: 'flex', alignItems: 'center' }}>
                                                <img src="/assets/images/message.svg" alt="Message" style={{ marginRight: '5px' }} />
                                                {blog.comment_count || 0}
                                            </li>
                                        </ul>
                                        <a href={`/blog-detail.html?id=${blog.id}`} className="font-bold">{blog.title}</a>
                                        <p>{excerpt}</p>
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
                    <a href="/blog.html" className="theme-btn">View All Posts</a>
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
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.623194514!2d-0.2033!3d5.6037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzYnMTMuMyJOIDDCsDEyJzExLjkiVw!5e0!3m2!1sen!2sgh!4v1634567890123!5m2!1sen!2sgh"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                    ></iframe>
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
