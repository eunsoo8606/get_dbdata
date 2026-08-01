const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'public', 'images');

async function convertAllToWebp() {
    const files = fs.readdirSync(imgDir);

    for (const file of files) {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
            const inputPath = path.join(imgDir, file);
            const fileNameWithoutExt = path.parse(file).name;
            const outputPath = path.join(imgDir, `${fileNameWithoutExt}.webp`);

            console.log(`⏳ Converting ${file} -> ${fileNameWithoutExt}.webp ...`);

            await sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outputPath);

            const origSize = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(2);
            const webpSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);

            console.log(`✅ Converted ${file} (${origSize}MB) -> ${fileNameWithoutExt}.webp (${webpSize}MB)`);
        }
    }
    console.log('🎉 모든 이미지 WebP 변환이 성공적으로 완료되었습니다!');
}

convertAllToWebp().catch(console.error);
