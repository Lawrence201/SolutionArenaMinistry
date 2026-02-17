import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

/**
 * Saves a file either locally or to Cloudinary based on environment configuration.
 * @param file The File object from FormData
 * @param subDir The subdirectory (e.g., 'blogs', 'events')
 * @returns The public URL or relative path to the saved file
 */
export async function saveFile(file: File | null, subDir: string): Promise<string | null> {
    if (!file || file.size === 0) return null;

    if (STORAGE_TYPE === 'cloudinary') {
        return uploadToCloudinary(file, subDir);
    } else {
        return saveFileLocally(file, subDir);
    }
}

/**
 * Deletes a file either locally or from Cloudinary.
 * @param filePath The stored path or URL
 */
export async function deleteFile(filePath: string | null) {
    if (!filePath) return;

    if (filePath.startsWith('http') || STORAGE_TYPE === 'cloudinary') {
        return deleteFromCloudinary(filePath);
    } else {
        return deleteFileLocally(filePath);
    }
}

/**
 * Saves a base64 encoded image either locally or to Cloudinary.
 * @param base64Data The base64 data string (including data:image/prefix)
 * @param subDir The subdirectory (e.g., 'members', 'birthday')
 * @returns The public URL or relative path to the saved file
 */
export async function saveBase64Image(base64Data: string, subDir: string): Promise<string | null> {
    if (!base64Data || !base64Data.startsWith('data:')) return null;

    if (STORAGE_TYPE === 'cloudinary') {
        return uploadBase64ToCloudinary(base64Data, subDir);
    } else {
        return saveBase64Locally(base64Data, subDir);
    }
}

// --- Helper Functions ---

async function uploadBase64ToCloudinary(base64Data: string, subDir: string): Promise<string | null> {
    try {
        const result = await cloudinary.uploader.upload(base64Data, {
            folder: `church_cms/${subDir}`,
            resource_type: 'auto',
        });
        return result?.secure_url || null;
    } catch (error) {
        console.error('Cloudinary Base64 Upload Error:', error);
        throw new Error('Failed to upload base64 to Cloudinary');
    }
}

async function uploadToCloudinary(file: File, subDir: string): Promise<string | null> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: `church_cms/${subDir}`,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Error:', error);
                        reject(error);
                    } else {
                        resolve(result?.secure_url || null);
                    }
                }
            ).end(buffer);
        });
    } catch (error) {
        console.error('Cloudinary Error:', error);
        throw new Error('Failed to upload to Cloudinary');
    }
}

async function saveBase64Locally(base64Data: string, subDir: string): Promise<string | null> {
    try {
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) throw new Error('Invalid base64 image data');

        const ext = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const uploadDir = join(process.cwd(), 'public', 'uploads', subDir);
        await mkdir(uploadDir, { recursive: true });

        const filePath = join(uploadDir, filename);
        await writeFile(filePath, buffer);

        return `/uploads/${subDir}/${filename}`;
    } catch (error) {
        console.error('Local Base64 Save Error:', error);
        console.warn('NOTE: Local filesystem saving is not supported in serverless environments like Vercel. Redirect to Cloudinary for production.');
        return null; // Return null instead of throwing to prevent application crash
    }
}

async function saveFileLocally(file: File, subDir: string): Promise<string | null> {
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');

        // Use a consistent structure for local uploads
        const uploadDir = join(process.cwd(), 'public', 'uploads', subDir, String(year), month);

        await mkdir(uploadDir, { recursive: true });

        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = join(uploadDir, uniqueName);

        await writeFile(filePath, buffer);

        return `/uploads/${subDir}/${year}/${month}/${uniqueName}`;
    } catch (error) {
        console.error('Local Save Error:', error);
        console.warn('NOTE: Local filesystem saving is not supported in serverless environments like Vercel. Redirect to Cloudinary for production.');
        return null; // Return null instead of throwing to prevent application crash
    }
}

async function deleteFromCloudinary(url: string) {
    try {
        // Extract public_id from URL
        // Example URL: https://res.cloudinary.com/dcibwgt4k/image/upload/v12345/church_cms/blogs/sample.jpg
        const parts = url.split('/');
        const fileNameWithExt = parts.pop() || '';
        const publicIdWithoutExt = fileNameWithExt.split('.')[0];

        // Find 'church_cms' in parts to reconstruct folder
        const folderIndex = parts.indexOf('church_cms');
        if (folderIndex !== -1) {
            const folderPath = parts.slice(folderIndex).join('/');
            const publicId = `${folderPath}/${publicIdWithoutExt}`;
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
    }
}

async function deleteFileLocally(filePath: string) {
    try {
        const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        const fullPath = join(process.cwd(), 'public', relativePath);
        await unlink(fullPath);
    } catch (error) {
        console.error(`Local Delete Error for ${filePath}:`, error);
    }
}
