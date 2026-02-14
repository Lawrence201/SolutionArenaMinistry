const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- CLEARING GALLERY DATA ---');

        // Delete dependencies first
        const deletedLikes = await prisma.galleryLike.deleteMany();
        console.log(`Deleted ${deletedLikes.count} gallery likes.`);

        const deletedViews = await prisma.galleryView.deleteMany();
        console.log(`Deleted ${deletedViews.count} gallery views.`);

        const deletedMedia = await prisma.galleryMedia.deleteMany();
        console.log(`Deleted ${deletedMedia.count} gallery media items.`);

        const deletedAlbums = await prisma.galleryAlbum.deleteMany();
        console.log(`Deleted ${deletedAlbums.count} gallery albums.`);

        console.log('--- GALLERY DATA CLEARED SUCCESSFULLY ---');
    } catch (e) {
        console.error('Error clearing gallery data:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
