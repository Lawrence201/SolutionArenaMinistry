import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const id = parseInt(formData.get('id')?.toString() || '0');

        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing sermon ID' }, { status: 400 });
        }

        // Fetch existing sermon to handle file cleanup
        const existingSermon = await prisma.sermon.findUnique({
            where: { id }
        });

        if (!existingSermon) {
            return NextResponse.json({ success: false, message: 'Sermon not found' }, { status: 404 });
        }

        // --- Helper Functions ---
        const getString = (key: string) => {
            const val = formData.get(key);
            return val ? val.toString() : '';
        };

        const getInt = (key: string) => {
            const val = formData.get(key);
            return val ? parseInt(val.toString()) : 0;
        };

        const getBool = (key: string) => {
            return formData.get(key) === '1';
        };

        const deleteFile = async (relativeBtnPath: string | null) => {
            if (!relativeBtnPath || relativeBtnPath.startsWith('http')) return;
            try {
                const fullPath = path.join(process.cwd(), 'public', relativeBtnPath);
                await unlink(fullPath);
            } catch (error) {
                console.error(`Failed to delete file: ${relativeBtnPath}`, error);
            }
        };

        const saveFile = async (file: File | null, subDir: string, oldPath: string | null) => {
            if (!file || !(file instanceof File) || file.size === 0) return oldPath;

            // If we have a new file, delete the old one
            if (oldPath) {
                await deleteFile(oldPath);
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const timestamp = Date.now();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filename = `${timestamp}_${sanitizedName}`;

            const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);
            await mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);

            return `/uploads/${subDir}/${filename}`;
        };

        // --- Validation ---
        const title = getString('sermonTitle');
        const speaker = getString('sermonSpeaker');
        const dateStr = getString('sermonDate');
        const description = getString('sermonDescription');

        if (!title || !speaker || !dateStr || !description) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // --- File Uploads & Cleanup ---
        const videoType = getString('videoType') as 'file' | 'url';
        const videoUrl = getString('videoUrl');
        let videoFilePath = existingSermon.video_file;

        if (videoType === 'file') {
            const file = formData.get('videoFile');
            if (file instanceof File && file.size > 0) {
                videoFilePath = await saveFile(file, 'videos', existingSermon.video_file);
            }
        } else {
            // If switched to URL, delete old video file if it existed
            if (existingSermon.video_type === 'file' && existingSermon.video_file) {
                await deleteFile(existingSermon.video_file);
            }
            videoFilePath = videoUrl;
        }

        const audioFilePath = await saveFile(formData.get('audioFile') as File, 'audio', existingSermon.audio_file);
        const pdfFilePath = await saveFile(formData.get('pdfFile') as File, 'pdfs', existingSermon.pdf_file);
        const imageFilePath = await saveFile(formData.get('sermonImage') as File, 'images', existingSermon.sermon_image);

        // --- Data Preparation ---
        let series = getString('sermonSeries');
        const seriesOther = getString('sermonSeriesOther');
        if (series === 'other' && seriesOther) series = seriesOther;

        let category = getString('sermonCategory');
        const categoryOther = getString('sermonCategoryOther');
        if (category === 'other' && categoryOther) category = categoryOther;

        let tags: any = [];
        try {
            tags = JSON.parse(getString('tags') || '[]');
        } catch (e) {
            tags = [];
        }

        const sermonDate = new Date(dateStr);

        // --- Database Transaction ---
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Sermon Record
            const sermon = await tx.sermon.update({
                where: { id },
                data: {
                    sermon_title: title,
                    sermon_speaker: speaker,
                    sermon_date: sermonDate,
                    sermon_series: series || null,
                    sermon_series_other: seriesOther || null,
                    sermon_description: description,
                    video_file: videoFilePath,
                    video_type: videoType,
                    audio_file: audioFilePath,
                    pdf_file: pdfFilePath,
                    sermon_image: imageFilePath,
                    sermon_duration: getInt('sermonDuration') || null,
                    sermon_category: category || null,
                    sermon_category_other: categoryOther || null,
                    tags: tags,
                    is_featured: getBool('featuredSermon'),
                    allow_downloads: getBool('allowDownloads'),
                    is_published: getBool('publishImmediately'),
                    enable_comments: getBool('enableComments'),
                    updated_at: new Date(),
                }
            });

            // 2. Update Scripture References (Replace all)
            await tx.sermonScripture.deleteMany({
                where: { sermon_id: id }
            });

            const scriptures = formData.getAll('scripture[]');
            if (scriptures.length > 0) {
                let order = 1;
                for (const ref of scriptures) {
                    if (ref.toString().trim()) {
                        await tx.sermonScripture.create({
                            data: {
                                sermon_id: id,
                                scripture_reference: ref.toString(),
                                display_order: order++
                            }
                        });
                    }
                }
            }

            return sermon;
        });

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error('Error updating sermon:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
