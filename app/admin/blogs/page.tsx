import { Metadata } from 'next';
import BlogsClient from '@/components/Admin/blogs/BlogsClient';

export const metadata: Metadata = {
    title: 'Blog Management | Solution Panel',
    description: 'Manage and publish blog articles for your church website',
};

export default function BlogsPage() {
    return <BlogsClient />;
}
