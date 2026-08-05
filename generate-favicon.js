const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'images', 'favicon.png');
const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(__dirname, 'public', 'images');

async function createFavicons() {
    console.log('⏳ Processing favicon from:', inputPath);

    // 1. Resized PNGs
    const size64 = await sharp(inputPath).resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const size32 = await sharp(inputPath).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const size16 = await sharp(inputPath).resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const size180 = await sharp(inputPath).resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

    // Write PNG icons
    fs.writeFileSync(path.join(imagesDir, 'apple-touch-icon.png'), size180);
    fs.writeFileSync(path.join(imagesDir, 'favicon-32x32.png'), size32);
    fs.writeFileSync(path.join(imagesDir, 'favicon-16x16.png'), size16);

    // 2. Build multi-resolution ICO file (64x64, 32x32, 16x16)
    const images = [
        { width: 64, height: 64, data: size64 },
        { width: 32, height: 32, data: size32 },
        { width: 16, height: 16, data: size16 }
    ];

    const numImages = images.length;
    const headerSize = 6;
    const directorySize = 16 * numImages;
    let currentOffset = headerSize + directorySize;

    const directoryBuffers = [];
    const imageBuffers = [];

    for (const img of images) {
        const dirBuf = Buffer.alloc(16);
        dirBuf.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
        dirBuf.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
        dirBuf.writeUInt8(0, 2); // Palette count
        dirBuf.writeUInt8(0, 3); // Reserved
        dirBuf.writeUInt16LE(1, 4); // Color planes
        dirBuf.writeUInt16LE(32, 6); // Bits per pixel
        dirBuf.writeUInt32LE(img.data.length, 8); // Size of image data
        dirBuf.writeUInt32LE(currentOffset, 12); // Offset

        directoryBuffers.push(dirBuf);
        imageBuffers.push(img.data);

        currentOffset += img.data.length;
    }

    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // ICO type
    header.writeUInt16LE(numImages, 4); // Number of images

    const icoBuffer = Buffer.concat([header, ...directoryBuffers, ...imageBuffers]);

    // Save favicon.ico in both public/ and public/images/
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    fs.writeFileSync(path.join(imagesDir, 'favicon.ico'), icoBuffer);

    console.log('✅ favicon.ico (64x64, 32x32, 16x16) successfully created!');
    console.log('✅ apple-touch-icon.png (180x180) & PNG icons created!');
}

createFavicons().catch(console.error);
