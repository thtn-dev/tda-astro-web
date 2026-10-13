process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildPhotos } from './build-photos';

const GALLERY_DIR = path.resolve(process.cwd(), 'public/images/gallery');
const IMAGES_DIR = path.resolve(process.cwd(), 'public/images');

import { SAMPLE_LIST, type SamplePhotoDef } from './sample-data';


async function downloadPhoto(item: SamplePhotoDef, index: number, total: number): Promise<void> {
  const filePath = path.join(GALLERY_DIR, item.filename);

  try {
    const stat = await fs.stat(filePath);
    if (stat.size > 2000) {
      // File already exists and valid
      return;
    }
  } catch {
    // Need download
  }

  // Primary URL: Picsum Photos with specific seed and dimensions
  const url = `https://picsum.photos/seed/${item.seed}/${item.width}/${item.height}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (AstroGallerySampleSeed/1.0)'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 500) {
      throw new Error('Downloaded buffer is suspiciously small');
    }

    await fs.writeFile(filePath, buffer);
    console.log(`  [${index + 1}/${total}] ✓ Đã tải ảnh: ${item.filename} (${item.width}x${item.height})`);
  } catch (err) {
    console.warn(`  [${index + 1}/${total}] ⚠️ Picsum lỗi (${item.filename}), tạo ảnh pastel fallback...`);
    // Fallback: Generate SVG/JPG pastel placeholder
    const pastelColors = ['#FFF2EE', '#FCE9E6', '#F5EBE6', '#EBF4EC', '#F4EEF7', '#FEF7E8'];
    const accentColors = ['#E8A0A8', '#D47E88', '#B8CDB8', '#9DB89D', '#D1B4CF', '#E8C59A'];
    const bg = pastelColors[index % pastelColors.length];
    const accent = accentColors[index % accentColors.length];

    const svg = `
      <svg width="${item.width}" height="${item.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="${bg}" />
            <stop offset="100%" stop-color="${accent}" stop-opacity="0.25" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <circle cx="${item.width / 2}" cy="${item.height / 2 - 30}" r="${Math.min(item.width, item.height) * 0.18}" fill="${accent}" opacity="0.35" />
        <text x="50%" y="${item.height / 2 + 35}" font-family="sans-serif" font-size="28" font-weight="600" fill="#4A3F44" text-anchor="middle">${item.caption.slice(0, 24)}</text>
        <text x="50%" y="${item.height / 2 + 75}" font-family="sans-serif" font-size="18" fill="#8A7C82" text-anchor="middle">✨ ${item.width} x ${item.height}px</text>
      </svg>
    `;

    // Save as JPEG via sharp if available or directly write file
    try {
      const sharp = (await import('sharp')).default;
      const jpgBuffer = await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer();
      await fs.writeFile(filePath, jpgBuffer);
    } catch {
      await fs.writeFile(filePath, svg);
    }
  }
}

async function ensureAvatar(): Promise<void> {
  const avatarPath = path.join(IMAGES_DIR, 'avatar.jpg');
  try {
    const stat = await fs.stat(avatarPath);
    if (stat.size > 1000) return;
  } catch {}

  console.log('🌸 Đang tạo avatar dịu dàng cho landing page...');
  const avatarUrl = 'https://picsum.photos/seed/may-girl-avatar/400/400';
  try {
    const res = await fetch(avatarUrl);
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(avatarPath, buffer);
      return;
    }
  } catch {}

  // Fallback avatar
  const svg = `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="avGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCE9E6" />
          <stop offset="100%" stop-color="#E8A0A8" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="200" fill="url(#avGrad)" />
      <circle cx="200" cy="160" r="70" fill="#FFF9F5" />
      <path d="M 100 350 C 120 260, 280 260, 300 350 Z" fill="#FFF9F5" />
      <text x="200" y="380" font-family="sans-serif" font-size="20" font-weight="bold" fill="#4A3F44" text-anchor="middle">Mây Mây 🌸</text>
    </svg>
  `;
  try {
    const sharp = (await import('sharp')).default;
    const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
    await fs.writeFile(avatarPath, jpg);
  } catch {
    await fs.writeFile(avatarPath, svg);
  }
}

async function main() {
  console.log('====================================================');
  console.log('✨ Bắt đầu sinh bộ dữ liệu 60 ảnh mẫu đa tỉ lệ...');
  console.log('🌐 Nguồn ảnh miễn phí ngẫu nhiên: Picsum Photos API');
  console.log('====================================================');

  await fs.mkdir(GALLERY_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  await ensureAvatar();

  // Concurrency pool (download 5 images at a time)
  const CONCURRENCY = 5;
  for (let i = 0; i < SAMPLE_LIST.length; i += CONCURRENCY) {
    const chunk = SAMPLE_LIST.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map((item, idx) => downloadPhoto(item, i + idx, SAMPLE_LIST.length)));
  }

  console.log('\n🎉 Đã tải hoàn tất ~60 ảnh vào public/images/gallery!');
  console.log('🚀 Tiếp tục chạy buildPhotos() để tính toán metadata, aspect-ratio và blur base64...');

  await buildPhotos();
  console.log('💖 Hoàn thành trọn vẹn bộ dữ liệu ảnh mẫu!');
}

main().catch((err) => {
  console.error('Lỗi khi chạy seed-sample-photos:', err);
  process.exit(1);
});
