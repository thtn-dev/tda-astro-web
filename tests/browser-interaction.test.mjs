import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

class SimpleCDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.logs = [];

    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
        this.logs.push(`[Console ${msg.params.type}] ${text}`);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        this.logs.push(`[JS Exception] ${msg.params.exceptionDetails.text}`);
      }
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async close() {
    this.ws.close();
  }
}

async function runBrowserTests() {
  console.log('🌸 ========================================================');
  console.log('🌸 KIỂM THỬ TRÌNH DUYỆT THỰC TẾ (HEADLESS CHROME + CDP)');
  console.log('🌸 ========================================================\n');

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-first-run',
    '--window-size=1280,900',
    '--user-data-dir=C:\\Users\\thtnam\\AppData\\Local\\Temp\\chrome-test-suite-' + Date.now(),
    'http://localhost:4321',
  ]);

  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failCount++;
    }
  }

  try {
    let target = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        const res = await fetch('http://localhost:9224/json');
        const list = await res.json();
        target = list.find((t) => t.type === 'page' && t.url.includes('localhost:4321'));
        if (target) break;
      } catch {}
    }

    if (!target) throw new Error('Không thể kết nối đến target Chrome!');

    const cdp = new SimpleCDP(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await sleep(1500);

    // TEST 1: Desktop Layout (1280px) -> 4 Columns
    console.log('📱 1. Kiểm tra layout Responsive theo màn hình:');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(300);
    const desktopCols = await cdp.evaluate(`document.querySelectorAll('#masonry-columns .masonry-col').length`);
    assert(desktopCols === 4, `Desktop (1280px) hiển thị đúng 4 cột (thực tế: ${desktopCols})`);

    // TEST 2: Tablet Layout (768px) -> 3 Columns
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 1,
      mobile: false,
    });
    // Trigger resize observer / window resize
    await cdp.evaluate(`window.dispatchEvent(new Event('resize'))`);
    await sleep(400);
    const tabletCols = await cdp.evaluate(`document.querySelectorAll('#masonry-columns .masonry-col').length`);
    assert(tabletCols === 3, `Tablet (768px) hiển thị đúng 3 cột (thực tế: ${tabletCols})`);

    // TEST 3: Mobile Layout (375px) -> 2 Columns
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await cdp.evaluate(`window.dispatchEvent(new Event('resize'))`);
    await sleep(400);
    const mobileCols = await cdp.evaluate(`document.querySelectorAll('#masonry-columns .masonry-col').length`);
    assert(mobileCols === 2, `Mobile (375px) hiển thị đúng 2 cột (thực tế: ${mobileCols})`);

    // Reset back to desktop for subsequent tests
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.evaluate(`window.dispatchEvent(new Event('resize'))`);
    await sleep(400);

    // TEST 4: Keyboard Accessibility & Opening Lightbox
    console.log('\n⌨️ 2. Kiểm tra trợ năng (Accessibility) & Phím tắt Lightbox:');
    const a11yAttrs = await cdp.evaluate(`
      (() => {
        const card = document.querySelector('.photo-card');
        return {
          tabIndex: card ? card.tabIndex : -1,
          role: card ? card.getAttribute('role') : null,
          ariaLabel: card ? card.getAttribute('aria-label') : null,
        };
      })()
    `);
    assert(a11yAttrs.tabIndex === 0, 'Card ảnh có tabindex="0" để có thể focus bằng phím Tab');
    assert(a11yAttrs.role === 'button', 'Card ảnh có role="button" cho screen reader');
    assert(Boolean(a11yAttrs.ariaLabel && a11yAttrs.ariaLabel.includes('Xem ảnh')), 'Card ảnh có aria-label mô tả nội dung');

    // Mở Lightbox bằng phím Enter trên card đầu tiên
    await cdp.evaluate(`
      (() => {
        const card = document.querySelector('.photo-card');
        card.focus();
        card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      })()
    `);
    await sleep(300);

    const lightboxState = await cdp.evaluate(`
      (() => {
        const dialog = document.getElementById('gallery-lightbox');
        const img = document.getElementById('lightbox-image');
        const caption = document.getElementById('lightbox-caption');
        const counter = document.getElementById('lightbox-counter');
        return {
          isOpen: dialog ? dialog.open : false,
          bodyOverflow: document.body.style.overflow,
          imgSrc: img ? img.src : '',
          caption: caption ? caption.textContent.trim() : '',
          counter: counter ? counter.textContent.trim() : '',
        };
      })()
    `);

    assert(lightboxState.isOpen === true, 'Bấm Enter mở thành công native <dialog>');
    assert(lightboxState.bodyOverflow === 'hidden', 'Body scroll được khóa (overflow: hidden) khi Lightbox mở');
    assert(lightboxState.counter === '1 / 18', `Hiển thị đúng số đếm ảnh (1 / 18, thực tế: ${lightboxState.counter})`);
    assert(Boolean(lightboxState.caption && !lightboxState.caption.includes('Khoảnh khắc dịu dàng #')), `Caption tiếng Việt có ý nghĩa: "${lightboxState.caption}"`);
    assert(!lightboxState.imgSrc.endsWith('localhost:4321/'), `Không bị lỗi empty src bug (thực tế: ${lightboxState.imgSrc.slice(0, 40)}...)`);

    // TEST 5: Lightbox Next/Prev via Keyboard Arrow Keys
    console.log('\n↔️ 3. Kiểm tra điều hướng mũi tên trái/phải trong Lightbox:');
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await sleep(200);

    const afterRight = await cdp.evaluate(`
      (() => {
        return {
          counter: document.getElementById('lightbox-counter')?.textContent?.trim(),
          caption: document.getElementById('lightbox-caption')?.textContent?.trim(),
        };
      })()
    `);
    assert(afterRight.counter === '2 / 18', `Bấm ArrowRight chuyển sang ảnh tiếp theo (thực tế: ${afterRight.counter})`);

    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 });
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 });
    await sleep(200);

    const afterLeft = await cdp.evaluate(`document.getElementById('lightbox-counter')?.textContent?.trim()`);
    assert(afterLeft === '1 / 18', `Bấm ArrowLeft lùi lại ảnh trước (thực tế: ${afterLeft})`);

    // TEST 6: Close via Escape & Body Scroll Restoration
    console.log('\n❌ 4. Kiểm tra đóng Lightbox & phục hồi cuộn trang:');
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await sleep(300);

    const afterEscape = await cdp.evaluate(`
      (() => {
        const dialog = document.getElementById('gallery-lightbox');
        return {
          isOpen: dialog ? dialog.open : false,
          bodyOverflow: document.body.style.overflow,
        };
      })()
    `);
    assert(afterEscape.isOpen === false, 'Phím Escape đóng Lightbox thành công');
    assert(afterEscape.bodyOverflow === '', 'Cuộn trang (body overflow) được khôi phục về ban đầu');

    // TEST 7: Close via Outside Click
    console.log('\n🖱️ 5. Kiểm tra click backdrop bên ngoài đóng Lightbox:');
    await cdp.evaluate(`document.querySelector('.photo-card').click()`);
    await sleep(200);
    // Click outside image & caption
    await cdp.evaluate(`
      (() => {
        const dialog = document.getElementById('gallery-lightbox');
        dialog.click();
      })()
    `);
    await sleep(200);
    const afterBackdropClick = await cdp.evaluate(`
      (() => {
        const dialog = document.getElementById('gallery-lightbox');
        return { isOpen: dialog ? dialog.open : false, bodyOverflow: document.body.style.overflow };
      })()
    `);
    assert(afterBackdropClick.isOpen === false, 'Click vùng ngoài ảnh đóng Lightbox thành công');
    assert(afterBackdropClick.bodyOverflow === '', 'Cuộn trang được phục hồi sau khi đóng qua click ngoài');

    // TEST 8: Mobile Touch Gestures (Swipe down to close, swipe left/right to navigate)
    console.log('\n👆 6. Kiểm tra cử chỉ vuốt chạm cảm ứng (Touch swipe):');
    await cdp.evaluate(`document.querySelector('.photo-card').click()`);
    await sleep(200);

    // Simulate swipe left (next)
    await cdp.evaluate(`
      (() => {
        const dialog = document.getElementById('gallery-lightbox');
        const touchStart = new Touch({ identifier: 1, target: dialog, clientX: 280, clientY: 200 });
        const touchEnd = new Touch({ identifier: 1, target: dialog, clientX: 100, clientY: 205 });
        dialog.dispatchEvent(new TouchEvent('touchstart', { touches: [touchStart], changedTouches: [touchStart], bubbles: true }));
        dialog.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [touchEnd], bubbles: true }));
      })()
    `);
    await sleep(200);
    const afterSwipeLeft = await cdp.evaluate(`document.getElementById('lightbox-counter')?.textContent?.trim()`);
    assert(afterSwipeLeft === '2 / 18', `Vuốt sang trái chuyển sang ảnh kế tiếp (thực tế: ${afterSwipeLeft})`);

    // Simulate swipe down (close)
    await cdp.evaluate(`
      (() => {
        const dialog = document.getElementById('gallery-lightbox');
        const touchStart = new Touch({ identifier: 2, target: dialog, clientX: 200, clientY: 150 });
        const touchEnd = new Touch({ identifier: 2, target: dialog, clientX: 205, clientY: 300 });
        dialog.dispatchEvent(new TouchEvent('touchstart', { touches: [touchStart], changedTouches: [touchStart], bubbles: true }));
        dialog.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [touchEnd], bubbles: true }));
      })()
    `);
    await sleep(200);
    const afterSwipeDown = await cdp.evaluate(`document.getElementById('gallery-lightbox')?.open`);
    assert(afterSwipeDown === false, 'Vuốt xuống dưới đóng Lightbox thành công');

    // TEST 9: Infinite Scroll (Loads all 60 photos across 4 pages)
    console.log('\n🔄 7. Kiểm tra cuộn vô tận (Infinite Scroll) tải đủ 60 ảnh:');
    let loadedCards = await cdp.evaluate(`document.querySelectorAll('#masonry-columns .photo-card').length`);
    assert(loadedCards === 18, `Trang 1 ban đầu có 18 ảnh SSG (thực tế: ${loadedCards})`);

    // Scroll to bottom multiple times to load all pages
    for (let p = 2; p <= 4; p++) {
      await cdp.evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
      await sleep(1000);
      loadedCards = await cdp.evaluate(`document.querySelectorAll('#masonry-columns .photo-card').length`);
      console.log(`    - Sau khi cuộn lần ${p - 1}: đã tải ${loadedCards}/60 ảnh`);
    }

    assert(loadedCards === 60, `Đã tải đầy đủ toàn bộ 60 ảnh mẫu qua Infinite Scroll (thực tế: ${loadedCards})`);

    const endedBadge = await cdp.evaluate(`
      document.getElementById('gallery-sentinel')?.textContent?.includes('Bạn đã xem hết ảnh rồi nha')
    `);
    assert(endedBadge === true, 'Hiển thị huy hiệu "Bạn đã xem hết ảnh rồi nha" khi hết ảnh');

    console.log('\n🌸 ========================================================');
    console.log(`🌸 TỔNG KẾT BROWSER TESTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('🌸 ========================================================');

    await cdp.close();
    if (failCount > 0) process.exit(1);
  } finally {
    chromeProc.kill();
  }
}

runBrowserTests().catch((err) => {
  console.error('Lỗi fatal trong browser tests:', err);
  process.exit(1);
});
