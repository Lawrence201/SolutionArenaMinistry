"use client";

import React, { useState, useEffect } from "react";
import styles from "./BlogDetailContent.module.css";
import { format } from "date-fns";

interface User {
    first_name: string;
    last_name: string;
    profile_picture: string | null;
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    user: User;
    replies?: Comment[];
}

interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    author: string;
    category: string | null;
    thumbnail_path: string | null;
    published_at: string | null;
    created_at: string;
    views: number;
    comments: Comment[];
}

interface Category {
    name: string;
    count: number;
}

interface SidebarPost {
    id: number;
    title: string;
    slug: string;
    thumbnail_path: string | null;
    published_at?: string | null;
    created_at?: string;
    views?: number;
}

interface BlogDetailContentProps {
    slug: string;
}

const BlogDetailContent: React.FC<BlogDetailContentProps> = ({ slug }) => {
    const [blog, setBlog] = useState<Blog | null>(null);
    const [recentPosts, setRecentPosts] = useState<SidebarPost[]>([]);
    const [popularPosts, setPopularPosts] = useState<SidebarPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentContent, setCommentContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ id: number; name: string } | null>(null);

    useEffect(() => {
        fetchBlog();
        // checkAuth(); // Assuming this will be implemented later
    }, [slug]);

    const fetchBlog = async () => {
        try {
            const response = await fetch(`/api/website/blogs/${slug}`);
            const result = await response.json();
            if (result.success) {
                setBlog(result.data.blog);
                setRecentPosts(result.data.recentPosts);
                setPopularPosts(result.data.popularPosts);
                setCategories(result.data.categories);
            }
        } catch (error) {
            console.error("Error fetching blog:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-5">Loading...</div>;
    if (!blog) return <div className="text-center py-5">Blog post not found.</div>;

    return (
        <section className={`gap ${styles.blogDetail}`}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-8 col-md-12 col-sm-12">
                        <div className={styles.blogContentArea}>
                            {/* Main Content */}
                            <div className={styles.blogMeta}>
                                {blog.thumbnail_path && (
                                    <img
                                        className="img-fluid w-100 rounded"
                                        src={`/assets/images/${blog.thumbnail_path.split('/').pop()}`}
                                        alt={blog.title}
                                    />
                                )}
                                <ul className={styles.metaInfo}>
                                    <li className={styles.date}>{blog.published_at ? format(new Date(blog.published_at), "MMMM dd, yyyy") : format(new Date(blog.created_at), "MMMM dd, yyyy")}</li>
                                    <li className={styles.views}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                        {blog.views}
                                    </li>
                                    <li className={styles.commentCount}>
                                        <img src="/assets/images/message.svg" alt="Message" />
                                        {blog.comments.length}
                                    </li>
                                </ul>
                                <h2 className={styles.mainTitle}>{blog.title}</h2>
                                <ul className={styles.blogAuthor}>
                                    <li>
                                        <div className={styles.authorAvatar}>
                                            <img src="/assets/images/author.webp" alt="Author" />
                                        </div>
                                    </li>
                                    <li className={styles.authorInfo}>
                                        Posted by <a href="#">{blog.author || "Admin"}</a>
                                    </li>
                                </ul>
                            </div>

                            <div
                                className={styles.content}
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />

                            {/* Author Box */}
                            <div className={`green-bg ${styles.authorBox}`}>
                                <div className={styles.authorBoxImg}>
                                    <img src="/assets/images/img-author.webp" alt="Author" />
                                </div>
                                <div className={styles.authorBoxMeta}>
                                    <h3>{blog.author || "Admin"} <span>- Blogger</span></h3>
                                    <p>Thank you for reading this article. Stay blessed!</p>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className={styles.commentsSection}>
                                <h3>Comments ({blog.comments.length})</h3>
                                <div className={styles.commentsList}>
                                    {blog.comments.map(comment => (
                                        <div key={comment.id} className={styles.commentItem}>
                                            <div className={styles.commentHeader}>
                                                <div className={styles.userAvatar}>
                                                    {comment.user.profile_picture ? (
                                                        <img src={`/assets/images/${comment.user.profile_picture.split('/').pop()}`} alt="" />
                                                    ) : (
                                                        <div className={styles.placeholderAvatar}>{comment.user.first_name[0]}</div>
                                                    )}
                                                </div>
                                                <div className={styles.commentInfo}>
                                                    <h4 className={styles.userName}>{comment.user.first_name} {comment.user.last_name}</h4>
                                                    <span className={styles.postDate}>{format(new Date(comment.created_at), "MMM dd, yyyy")}</span>
                                                </div>
                                            </div>
                                            <p className={styles.commentText}>{comment.content}</p>

                                            {comment.replies && comment.replies.map(reply => (
                                                <div key={reply.id} className={`${styles.commentItem} ${styles.replyItem}`}>
                                                    <div className={styles.commentHeader}>
                                                        <div className={styles.userAvatarSmall}>
                                                            {reply.user.profile_picture ? (
                                                                <img src={`/assets/images/${reply.user.profile_picture.split('/').pop()}`} alt="" />
                                                            ) : (
                                                                <div className={styles.placeholderAvatarSmall}>{reply.user.first_name[0]}</div>
                                                            )}
                                                        </div>
                                                        <div className={styles.commentInfo}>
                                                            <h4 className={styles.userNameSmall}>{reply.user.first_name} {reply.user.last_name}</h4>
                                                            <span className={styles.postDateSmall}>{format(new Date(reply.created_at), "MMM dd, yyyy")}</span>
                                                        </div>
                                                    </div>
                                                    <p className={styles.commentTextSmall}>{reply.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.leaveReply}>
                                    <h4>Leave a Reply</h4>
                                    <form className={styles.commentForm}>
                                        <textarea placeholder="Write your comment here..." rows={5}></textarea>
                                        <button type="submit" className="theme-btn mt-3">Post Comment</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4 col-md-12 col-sm-12">
                        <aside className={styles.sidebar}>
                            {/* Recent Articles */}
                            <div className={styles.widget}>
                                <h3>Recent Articles</h3>
                                <ul className={styles.sidebarArticles}>
                                    {recentPosts.map(post => (
                                        <li key={post.id}>
                                            <div className={styles.sidebarThumb}>
                                                <img
                                                    src={post.thumbnail_path ? `/assets/images/${post.thumbnail_path.split('/').pop()}` : "/assets/images/sidebar-img.webp"}
                                                    alt={post.title}
                                                />
                                            </div>
                                            <div className={styles.sidebarInfo}>
                                                <span className={styles.sidebarDate}>
                                                    {post.published_at ? format(new Date(post.published_at), "MMM dd, yyyy") : format(new Date(post.created_at!), "MMM dd, yyyy")}
                                                </span>
                                                <a href={`/blog/${post.slug}`} className={styles.sidebarTitle}>{post.title}</a>
                                                <a href={`/blog/${post.slug}`} className={styles.sidebarReadMore}>Read More</a>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Categories */}
                            <div className={`${styles.widget} ${styles.widgetCategories}`}>
                                <h3>Categories</h3>
                                <ul>
                                    {categories.map((cat, idx) => (
                                        <li key={idx}>
                                            <a href={`/blog?category=${cat.name}`}>{cat.name}</a>
                                            <span>{cat.count}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Popular Posts */}
                            <div className={styles.widget}>
                                <h3>Popular Posts</h3>
                                <ul className={styles.popularPosts}>
                                    {popularPosts.map(post => (
                                        <li key={post.id}>
                                            <div className={styles.sidebarThumb}>
                                                <a href={`/blog/${post.slug}`}>
                                                    <img
                                                        src={post.thumbnail_path ? `/assets/images/${post.thumbnail_path.split('/').pop()}` : "/assets/images/sidebar-img.webp"}
                                                        alt={post.title}
                                                    />
                                                </a>
                                            </div>
                                            <div className={styles.popularInfo}>
                                                <a href={`/blog/${post.slug}`} className={styles.popularTitle}>{post.title}</a>
                                                <span>{post.views} views</span>
                                                <a href={`/blog/${post.slug}`} className={styles.sidebarReadMore}>Read More</a>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Internal Link helper for the login banner
const Link = ({ href, children, className }: any) => (
    <a href={href} className={className}>{children}</a>
);

export default BlogDetailContent;
