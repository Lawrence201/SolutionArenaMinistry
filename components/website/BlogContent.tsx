"use client";

import React, { useState, useEffect } from "react";
import styles from "./BlogContent.module.css";
import Link from "next/link";

interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail_path: string | null;
    formatted_date: string;
    views: number;
    comment_count: number;
}

const BlogContent = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 6;

    useEffect(() => {
        fetchBlogs();
    }, [offset]);

    const fetchBlogs = async () => {
        try {
            const response = await fetch(`/api/website/blogs?limit=${limit}&offset=${offset}`);
            const result = await response.json();
            if (result.success) {
                if (offset === 0) {
                    setBlogs(result.data.blogs);
                } else {
                    setBlogs((prev) => [...prev, ...result.data.blogs]);
                }
                setTotal(result.data.total);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        setOffset((prev) => prev + limit);
    };

    return (
        <section className={styles.blogSection}>
            <div className="container">
                <div className="row">
                    {blogs.map((blog, index) => (
                        <div key={blog.id} className="col-lg-4 col-md-6 col-sm-12 mb-5">
                            <div className={styles.blogCard}>
                                {blog.thumbnail_path && (
                                    <figure className={styles.thumbnail}>
                                        <img
                                            src={`/assets/images/${blog.thumbnail_path.split('/').pop()}`}
                                            alt={blog.title}
                                            className="img-fluid"
                                        />
                                    </figure>
                                )}
                                <div className={styles.blogMeta}>
                                    <ul className={styles.metaList}>
                                        <li className={styles.date}>{blog.formatted_date}</li>
                                        <li className={styles.metaStats}>
                                            <span className={styles.views}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                                {blog.views}
                                            </span>
                                            <span className={styles.comments}>
                                                <img src="/assets/images/message.svg" alt="Comments" />
                                                {blog.comment_count}
                                            </span>
                                        </li>
                                    </ul>
                                    <Link href={`/blog/${blog.slug}`} className={styles.blogTitle}>
                                        {blog.title}
                                    </Link>
                                    <p className={styles.excerpt}>
                                        {blog.excerpt.length > 150 ? blog.excerpt.substring(0, 150) + "..." : blog.excerpt}
                                    </p>
                                    <Link href={`/blog/${blog.slug}`} className={`theme-btn mt-3 ${styles.readMore}`}>
                                        Read More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {blogs.length < total && (
                    <div className="d-flex justify-content-center mt-5">
                        <button className="theme-btn" onClick={handleLoadMore}>
                            Load More
                        </button>
                    </div>
                )}

                {blogs.length === 0 && !loading && (
                    <div className="text-center py-5">
                        <h3>No blog posts available at the moment.</h3>
                        <p>Please check back later for updates.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BlogContent;
