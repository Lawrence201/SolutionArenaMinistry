const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- ALBUMS IN DB ---');
        const albums = await prisma.galleryAlbum.findMany();
        albums.forEach(a => {
            console.log(`Album: ${a.album_name} | Photographer: ${a.photographer} | Date: ${a.event_date}`);
        });

        console.log('\n--- MEDIA IN DB ---');
        const media = await prisma.galleryMedia.findMany({ take: 5 });
        media.forEach(m => {
            console.log(`Media: ${m.title} | Path: ${m.file_path}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
