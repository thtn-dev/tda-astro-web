import fs from 'node:fs/promises';
import path from 'node:path';
import type { Photo, GalleryPageResponse } from '../src/types/gallery';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

async function runTests() {
  console.log('🌸 ===============================================');
  console.log('🌸 BẮT ĐẦU CHẠY KIỂM THỬ TOÀN DIỆN (VERIFICATION)');
  console.log('🌸 ===============================================\n');

  // 1. Kiểm tra photos.json
  console.log('📦 1. Kiểm tra src/data/photos.json:');
  const photosPath = path.resolve('src/data/photos.json');
  const photosRaw = await fs.readFile(photosPath, 'utf-8');
  const photos: Photo[] = JSON.parse(photosRaw);

  assert(Array.isArray(photos), 'photos.json là mảng hợp lệ');
  assert(photos.length === 60, `photos.json có đúng 60 ảnh mẫu (thực tế: ${photos.length})`);

  // Kiểm tra từng ảnh
  let allValid = true;
  let aspectRatios: number[] = [];
  let distinctIds = new Set<string>();

  for (const p of photos) {
    distinctIds.add(p.id);
    const aspect = p.height / p.width;
    aspectRatios.push(aspect);

    const hasFields =
      Boolean(p.id) &&
      Boolean(p.src) &&
      p.width > 0 &&
      p.height > 0 &&
      Boolean(p.color) &&
      p.color.startsWith('#') &&
      Boolean(p.blurDataUrl) &&
      p.blurDataUrl.startsWith('data:image/jpeg;base64,') &&
      Boolean(p.caption) &&
      Array.isArray(p.tags) &&
      Boolean(p.date);

    if (!hasFields) {
      allValid = false;
      console.error('Invalid photo:', p);
    }
  }

  assert(allValid, 'Tất cả 60 ảnh đều có đầy đủ id, src, width, height, color hex, blurDataUrl, caption, tags, date');
  assert(distinctIds.size === 60, 'Tất cả 60 ảnh có id độc nhất, không trùng lặp');

  // Đa dạng tỉ lệ ảnh
  const squareCount = aspectRatios.filter((a) => Math.abs(a - 1.0) < 0.05).length;
  const portraitCount = aspectRatios.filter((a) => a > 1.1 && a < 1.4).length;
  const tallCount = aspectRatios.filter((a) => a >= 1.4).length;
  const landscapeCount = aspectRatios.filter((a) => a < 0.9).length;

  console.log(`    - Phân bổ tỉ lệ ảnh: Vuông 1:1 (${squareCount}), Dọc vừa (${portraitCount}), Dọc cao 9:16/2:3 (${tallCount}), Ngang (${landscapeCount})`);
  assert(squareCount >= 10, 'Có ít nhất 10 ảnh vuông (1:1)');
  assert(portraitCount >= 10, 'Có ít nhất 10 ảnh dọc vừa (3:4, 4:5)');
  assert(tallCount >= 10, 'Có ít nhất 10 ảnh dọc cao (2:3, 9:16)');
  assert(landscapeCount >= 10, 'Có ít nhất 10 ảnh ngang (4:3, 3:2, 16:9)');

  // 2. Kiểm tra file ảnh vật lý trên đĩa
  console.log('\n📁 2. Kiểm tra file ảnh thực tế trong public/images:');
  const galleryDir = path.resolve('public/images/gallery');
  let missingFiles = 0;
  for (const p of photos) {
    const filename = path.basename(p.src);
    const fullPath = path.join(galleryDir, filename);
    try {
      const st = await fs.stat(fullPath);
      if (st.size < 500) missingFiles++;
    } catch {
      missingFiles++;
    }
  }
  assert(missingFiles === 0, 'Tất cả 60 file ảnh vật lý đều tồn tại trong public/images/gallery và > 500 bytes');

  const avatarStat = await fs.stat(path.resolve('public/images/avatar.jpg'));
  assert(avatarStat.size > 500, 'File avatar.jpg tồn tại và hợp lệ');

  // 3. Kiểm tra static endpoints trong dist/
  console.log('\n🌐 3. Kiểm tra Static Endpoints trong dist/data/photos:');
  const pageFiles = ['page-1.json', 'page-2.json', 'page-3.json', 'page-4.json', '1.json', '2.json', '3.json', '4.json'];
  for (const pf of pageFiles) {
    const filePath = path.resolve(`dist/data/photos/${pf}`);
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    assert(exists, `Endpoint dist/data/photos/${pf} đã được sinh SSG`);
  }

  // Kiểm tra phân trang cộng dồn
  let totalPaginatedPhotos = 0;
  const paginatedIds = new Set<string>();
  for (let pageNum = 1; pageNum <= 4; pageNum++) {
    const pPath = path.resolve(`dist/data/photos/page-${pageNum}.json`);
    const pData: GalleryPageResponse = JSON.parse(await fs.readFile(pPath, 'utf-8'));
    assert(pData.page === pageNum, `Trang ${pageNum} có thuộc tính page = ${pageNum}`);
    assert(pData.totalPages === 4, `Trang ${pageNum} có totalPages = 4`);
    assert(pData.totalPhotos === 60, `Trang ${pageNum} có totalPhotos = 60`);
    assert(pData.hasMore === (pageNum < 4), `Trang ${pageNum} hasMore = ${pageNum < 4}`);
    totalPaginatedPhotos += pData.photos.length;
    pData.photos.forEach((ph) => paginatedIds.add(ph.id));
  }
  assert(totalPaginatedPhotos === 60, `Tổng số ảnh qua 4 trang là 60`);
  assert(paginatedIds.size === 60, `Không có ảnh nào bị lặp hoặc sót qua các trang phân trang`);

  // 4. Kiểm tra HTML SSG
  console.log('\n📄 4. Kiểm tra HTML tĩnh dist/index.html:');
  const htmlPath = path.resolve('dist/index.html');
  const html = await fs.readFile(htmlPath, 'utf-8');

  assert(html.includes('<title>Mây Mây • Nhật ký ảnh nhỏ</title>'), 'HTML có tiêu đề SEO chính xác');
  assert(html.includes('id="gallery-section"'), 'HTML có container #gallery-section');
  assert(html.includes('id="masonry-columns"'), 'HTML có container #masonry-columns');
  assert(html.includes('id="gallery-sentinel"'), 'HTML có sentinel #gallery-sentinel');
  assert(html.includes('id="gallery-lightbox"'), 'HTML có dialog #gallery-lightbox');
  assert(html.includes('id="gallery-initial-data"'), 'HTML có thẻ JSON #gallery-initial-data cho hydration');

  // Đếm số card ảnh SSG trong trang 1
  const cardCount = (html.match(/class="[^"]*photo-card[^"]*"/g) || []).length;
  console.log(`    - Số card ảnh được render SSG trong HTML ban đầu: ${cardCount}`);
  assert(cardCount === 18, 'Trang 1 có đúng 18 card ảnh render SSG (Zero CLS)');

  // Kiểm tra eager loading và fetchpriority
  assert(html.includes('loading="eager"'), 'Có ảnh được gán loading="eager" cho LCP');
  assert(html.includes('fetchpriority="high"'), 'Ảnh đầu tiên có fetchpriority="high"');
  assert(html.includes('blur-placeholder'), 'Có blur placeholder base64');

  // 5. Kiểm tra CSS Bundle & Fonts
  console.log('\n🎨 5. Kiểm tra CSS Bundle & Phông chữ:');
  const distAstroDir = path.resolve('dist/_astro');
  const astroFiles = await fs.readdir(distAstroDir);
  const cssFiles = astroFiles.filter((f) => f.endsWith('.css'));
  assert(cssFiles.length > 0, `Đã tìm thấy ${cssFiles.length} file CSS trong dist/_astro`);

  let cssCombined = '';
  for (const cf of cssFiles) {
    cssCombined += await fs.readFile(path.join(distAstroDir, cf), 'utf-8');
  }

  assert(cssCombined.includes('Quicksand'), 'CSS bundle chứa font Quicksand');
  assert(cssCombined.includes('Caveat'), 'CSS bundle chứa font Caveat');

  // Báo cáo tổng kết
  console.log('\n🌸 ===============================================');
  console.log(`🌸 TỔNG KẾT: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('🌸 ===============================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
