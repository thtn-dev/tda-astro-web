# 🌸 Mây Mây • Landing Page Cá Nhân & Pinterest Masonry Gallery

Trang landing page cá nhân phong cách nhẹ nhàng, dễ thương, thanh lịch được xây dựng bằng **Astro v7 (Static Site Generation - SSG)** và **Tailwind CSS**. Trang web sở hữu thư viện ảnh dạng **Pinterest Masonry** tối ưu hóa cực cao: không giật layout (**CLS ≈ 0**), tải lười (**Infinite Scroll** phân trang tĩnh), và **Lightbox** xem ảnh lớn native HTML5 `<dialog>` siêu mượt.

---

## ✨ Điểm Nổi Bật

- 🎨 **Phong cách Dễ Thương & Thanh Lịch**: Bảng màu pastel nhẹ nhàng (Kem `#FFF9F5`, Hồng phấn `#FCE9E6`, Hồng tro `#E8A0A8`, Xanh xô thơm `#B8CDB8`).
- ✍️ **Font chữ Tự Host**: Kết hợp phông chữ `Quicksand` (tiêu đề & nội dung) và `Caveat` (viết tay accent) thông qua `@fontsource`, hỗ trợ đầy đủ tiếng Việt.
- 📐 **Thuật toán Pinterest Masonry Thuần Toán Học**: Phân phối ảnh vào cột có chiều cao tích lũy thấp nhất, không phụ thuộc đo lường DOM, không gây reflow.
  - Mobile (< 640px): 2 cột
  - Tablet (640px - 1024px): 3 cột
  - Desktop (≥ 1024px): 4 cột
  - `ResizeObserver` điều chỉnh lại cột mượt mà khi xoay màn hình (debounced 150ms).
- ⚡ **Zero CLS & Instant LCP**: Trang 1 (18 ảnh) được render sẵn trong mã nguồn HTML tĩnh (SSG). Mỗi khung ảnh có sẵn `aspect-ratio` và màu nền chủ đạo kết hợp ảnh mờ base64 placeholder (<1KB).
- 🔄 **Phân Trang Tĩnh & Infinite Scroll**: Tự động chia ảnh thành các tệp JSON tĩnh `/data/photos/page-1.json`, `/data/photos/page-2.json`... Kích hoạt qua `IntersectionObserver` khi cuộn trang.
- 🔍 **Native Lightbox Modal**: Thẻ `<dialog>` chuẩn HTML5, hỗ trợ phím mũi tên `←` / `→`, phím `Escape`, cử chỉ vuốt ngón tay trên điện thoại (touch swipe) và tự động khóa cuộn nền.
- 🚀 **Siêu Nhẹ**: Không dùng bất kỳ framework cồng kềnh nào (React, Vue...), toàn bộ logic client chỉ dùng vanilla TypeScript (<5KB gzip).

---

## 🛠️ Cài Đặt & Phát Triển

### 1. Cài đặt phụ thuộc

```bash
npm install
```

> **Lưu ý trên Windows / Node 24**: Nếu gặp vấn đề về chứng chỉ SSL nội bộ, chạy với:
> ```powershell
> $env:NODE_OPTIONS="--use-system-ca"; npm install
> ```

### 2. Khởi chạy máy chủ phát triển (Dev Server)

Theo quy định dự án, khởi chạy Astro ở chế độ nền:

```bash
astro dev --background
```

Quản lý server:
- Kiểm tra trạng thái: `astro dev status`
- Xem log: `astro dev logs`
- Dừng server: `astro dev stop`

Truy cập: [http://localhost:4321](http://localhost:4321)

---

## 📸 Quản Lý Dữ Liệu & Hình Ảnh

### Tải nhanh 60 ảnh mẫu ngẫu nhiên (`photos:seed`)
Dự án đã tích hợp sẵn script tự động tải ~60 ảnh phong cảnh/aesthetic miễn phí đa dạng tỉ lệ (1:1, 3:4, 4:5, 2:3, 9:16, 4:3, 3:2, 16:9) từ Picsum Photos và trích xuất metadata:

```bash
npm run photos:seed
```

### Thêm ảnh thực tế của bạn
1. Sao chép các tệp ảnh (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`) vào thư mục:
   ```text
   public/images/gallery/
   ```
2. Chạy lệnh quét và cập nhật metadata:
   ```bash
   npm run photos
   ```
   Script `scripts/build-photos.ts` sử dụng thư viện `sharp` để:
   - Đọc kích thước thật (width, height)
   - Trích xuất mã màu chủ đạo (dominant color)
   - Tạo ảnh mờ base64 (<1KB) làm placeholder
   - Cập nhật tệp `src/data/photos.json` (giữ nguyên caption/tag bạn đã chỉnh sửa trước đó).

---

## 📝 Tùy Chỉnh Nội Dung & Giao Diện

### 1. Thay đổi thông tin cá nhân & Mạng xã hội
Toàn bộ nội dung hiển thị nằm tại tệp `src/data/site.json`:
- `name`: Tên bạn (ví dụ: Mây Mây)
- `nickname`: Tên tài khoản ngắn
- `tagline`: Câu châm ngôn ngắn gọn
- `bio`: Các đoạn văn giới thiệu bản thân
- `hobbies`: Danh sách sở thích hiển thị dạng chip tag
- `socials`: Danh sách mạng xã hội (Instagram, TikTok, Threads, Email)

### 2. Thay đổi ảnh đại diện (Avatar)
Thay thế tệp ảnh tại:
```text
public/images/avatar.jpg
```

### 3. Tùy biến bảng màu (Design Tokens)
Chỉnh sửa trong tệp `src/styles/global.css`:
```css
@theme {
  --color-cream: #FFF9F5;      /* Màu nền chính */
  --color-blush: #FCE9E6;      /* Màu hồng phấn */
  --color-rose: #E8A0A8;       /* Màu nhấn hoa hồng */
  --color-rose-dark: #D47E88;  /* Màu nhấn khi hover */
  --color-sage: #B8CDB8;       /* Màu xanh xô thơm */
  --color-cocoa: #4A3F44;      /* Màu chữ chính */
  --color-muted: #8A7C82;      /* Màu chữ phụ */
}
```

---

## 🧪 Kiểm Thử (Verification)

Chạy bộ kiểm thử tự động toàn diện:

```bash
npm test
```

Bộ test tự động kiểm tra 49 tiêu chí:
- Tính toàn vẹn của 60 ảnh và file vật lý
- Sự đa dạng về tỉ lệ khung hình (vuông, dọc, dọc cao, ngang, rộng)
- Các static endpoints JSON (`page-1.json`, `page-2.json`...)
- Cấu trúc HTML SSG trang 1 (không CLS, eager loading, fetchpriority)
- Font tự host và các design token.

---

## 🚀 Đóng Gói & Triển Khai (Deployment)

### Đóng gói tĩnh (Build SSG)
```bash
npm run build
```
Kết quả được xuất ra thư mục tĩnh `./dist/`. Bạn có thể kiểm tra trước khi publish bằng:
```bash
npm run preview
```

### Triển khai lên Vercel / Netlify / Cloudflare Pages
1. **Vercel**:
   - Framework Preset: **Astro**
   - Build Command: `npm run build`
   - Output Directory: `dist`
2. **Netlify**:
   - Build Command: `npm run build`
   - Publish directory: `dist`
3. **Cloudflare Pages**:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`

---

## 📄 Bản Quyền
Dự án được tạo riêng theo phong cách cá nhân dịu dàng, trang nhã. Toàn bộ mã nguồn mở và sẵn sàng tùy biến! 🌸
