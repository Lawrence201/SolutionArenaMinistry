import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

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

        const saveFile = async (file: File | null, subDir: string) => {
            if (!file) return null;

            const buffer = Buffer.from(await file.arrayBuffer());
            // Create "unique" filename: timestamp_sanitizedName
            const timestamp = Date.now();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filename = `${timestamp}_${sanitizedName}`;

            // Define paths
            // Saving to public/uploads/... so they are accessible
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);

            // Ensure directory exists
            await mkdir(uploadDir, { recursive: true });

            // Write file
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);

            // Return relative path for DB
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

        // Media Validation
        const videoType = getString('videoType') as 'file' | 'url';
        const videoUrl = getString('videoUrl');
        const hasVideoFile = formData.get('videoFile') instanceof File;
        const hasAudioFile = formData.get('audioFile') instanceof File;

        // Logic check: Must have Video (File OR URL) OR Audio
        const hasVideo = (videoType === 'file' && hasVideoFile) || (videoType === 'url' && !!videoUrl);
        if (!hasVideo && !hasAudioFile) {
            return NextResponse.json({ success: false, message: 'At least one media source (Video or Audio) is required' }, { status: 400 });
        }


        // --- File Uploads ---
        let videoFilePath: string | null = null;
        if (videoType === 'file') {
            const file = formData.get('videoFile') as File;
            videoFilePath = await saveFile(file, 'videos');
        } else {
            // If URL, we store it in the same column or handle via video_type logic
            videoFilePath = videoUrl;
        }

        const audioFilePath = await saveFile(formData.get('audioFile') as File, 'audio');
        const pdfFilePath = await saveFile(formData.get('pdfFile') as File, 'pdfs');
        const imageFilePath = await saveFile(formData.get('sermonImage') as File, 'images');

        // --- Data Preparation ---
        // Handle Series & Category "Other" logic
        let series = getString('sermonSeries');
        const seriesOther = getString('sermonSeriesOther');
        if (series === 'other' && seriesOther) series = seriesOther;

        let category = getString('sermonCategory');
        const categoryOther = getString('sermonCategoryOther');
        if (category === 'other' && categoryOther) category = categoryOther;

        // Tags parsing
        let tags: any = [];
        try {
            tags = JSON.parse(getString('tags') || '[]');
        } catch (e) {
            tags = [];
        }

        // Publishing dates
        const publishImmediately = getBool('publishImmediately');
        const publishedAt = publishImmediately ? new Date() : null;

        const sermonDate = new Date(dateStr);

        // --- Database Transaction ---
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Sermon Record
            const sermon = await tx.sermon.create({
                data: {
                    sermon_title: title,
                    sermon_speaker: speaker,
                    sermon_date: sermonDate,
                    sermon_series: series || null,
                    sermon_series_other: seriesOther || null, // Keeping strict to schema if column exists
                    sermon_description: description,
                    video_file: videoFilePath, // Stores Path OR URL
                    video_type: videoType,
                    audio_file: audioFilePath,
                    pdf_file: pdfFilePath,
                    sermon_image: imageFilePath,
                    sermon_duration: getInt('sermonDuration') || null,
                    sermon_category: category || null,
                    sermon_category_other: categoryOther || null,
                    tags: tags, // Json type
                    is_featured: getBool('featuredSermon'),
                    allow_downloads: getBool('allowDownloads'),
                    is_published: getBool('publishImmediately'), // "Draft" if false
                    enable_comments: getBool('enableComments'),
                    published_at: publishedAt,
                    // created_at and updated_at are handled by default/updatedAt
                }
            });

            // 2. Create Scripture References
            const scriptures = formData.getAll('scripture[]');
            if (scriptures.length > 0) {
                let order = 1;
                for (const ref of scriptures) {
                    if (ref.toString().trim()) {
                        await tx.sermonScripture.create({
                            data: {
                                sermon_id: sermon.id,
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
        console.error('Error creating sermon:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
