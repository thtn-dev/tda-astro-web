import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { Photo } from '../src/types/gallery';

const GALLERY_DIR = path.resolve(process.cwd(), 'public/images/gallery');
const OUTPUT_FILE = path.resolve(process.cwd(), 'src/data/photos.json');

import { SAMPLE_MAP } from './sample-data';


function componentToHex(c: number): string {
  const hex = Math.round(Math.min(255, Math.max(0, c))).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export async function buildPhotos(): Promise<Photo[]> {
  console.log('🌸 Bắt đầu quét thư mục ảnh:', GALLERY_DIR);

  try {
    await fs.access(GALLERY_DIR);
  } catch {
    await fs.mkdir(GALLERY_DIR, { recursive: true });
    console.log('📁 Đã tạo thư mục gallery:', GALLERY_DIR);
  }

  // Read existing photos.json to preserve custom edits
  let existingMap = new Map<string, Photo>();
  try {
    const raw = await fs.readFile(OUTPUT_FILE, 'utf-8');
    const existingList: Photo[] = JSON.parse(raw);
    for (const p of existingList) {
      existingMap.set(p.id, p);
    }
  } catch {
    // No existing file or invalid JSON, ignore
  }

  const entries = await fs.readdir(GALLERY_DIR, { withFileTypes: true });
  const imageFiles = entries
    .filter(
      (e) => e.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(e.name)
    )
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  if (imageFiles.length === 0) {
    console.warn('⚠️ Chưa tìm thấy ảnh nào trong public/images/gallery.');
    console.warn('👉 Hãy chạy "npm run photos:seed" để tải sẵn ~60 ảnh mẫu!');
    return [];
  }

  console.log(`🖼️ Đang xử lý ${imageFiles.length} hình ảnh...`);

  const photos: Photo[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const filePath = path.join(GALLERY_DIR, filename);
    const id = path.parse(filename).name;
    const existing = existingMap.get(id);

    try {
      const buffer = await fs.readFile(filePath);
      const image = sharp(buffer);
      const metadata = await image.metadata();

      const width = metadata.width || 800;
      const height = metadata.height || 600;

      // Extract dominant color
      const stats = await image.stats();
      const dominant = stats.dominant;
      const dominantHex = dominant
        ? rgbToHex(dominant.r, dominant.g, dominant.b)
        : '#FCE9E6';

      // Generate compact blur placeholder (< 1KB base64)
      const targetWidth = 16;
      const targetHeight = Math.max(10, Math.round(targetWidth * (height / width)));
      const blurBuffer = await sharp(buffer)
        .resize(targetWidth, targetHeight, { fit: 'cover' })
        .jpeg({ quality: 30 })
        .toBuffer();
      const blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;

      // Default or existing metadata
      const sample = SAMPLE_MAP[id];
      const isGenericCaption = existing?.caption && existing.caption.startsWith('Khoảnh khắc dịu dàng #');
      const caption = (!isGenericCaption && existing?.caption) || sample?.caption || `Khoảnh khắc dịu dàng #${i + 1} ✨`;
      const alt = (!isGenericCaption && existing?.alt) || sample?.caption || caption;
      const date = existing?.date || sample?.date || `2026-03-${String((i % 28) + 1).padStart(2, '0')}`;
      const tags = (existing?.tags && existing.tags.length > 0 && existing.tags[0] !== 'aesthetic' ? existing.tags : sample?.tags) || ['aesthetic', 'gentle', 'photo'];


      photos.push({
        id,
        src: `/images/gallery/${filename}`,
        width,
        height,
        alt,
        color: dominantHex,
        blurDataUrl,
        caption,
        date,
        tags,
      });

      if ((i + 1) % 15 === 0 || i === imageFiles.length - 1) {
        console.log(`  ✓ Đã xử lý ${i + 1}/${imageFiles.length} ảnh`);
      }
    } catch (err) {
      console.error(`❌ Lỗi khi xử lý ảnh ${filename}:`, err);
    }
  }

  // Ensure output directory exists
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(photos, null, 2), 'utf-8');

  console.log(`✨ Hoàn tất! Đã lưu metadata ${photos.length} ảnh vào: src/data/photos.json`);
  return photos;
}

// Auto run when executed directly
import { fileURLToPath } from 'node:url';
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isDirectRun) {
  buildPhotos().catch((err) => {
    console.error('Fatal error in buildPhotos:', err);
    process.exit(1);
  });
}
