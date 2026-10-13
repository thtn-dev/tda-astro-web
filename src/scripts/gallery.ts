import type { Photo, GalleryPageResponse } from '../types/gallery';

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

class GalleryController {
  private container: HTMLElement;
  private columnsContainer: HTMLElement;
  private sentinel: HTMLElement;
  private columnElements: HTMLElement[] = [];
  private columnHeights: number[] = [];

  private loadedPhotos: Photo[] = [];
  private photoCardMap: Map<string, HTMLElement> = new Map();

  private currentPage: number = 1;
  private totalPages: number = 1;
  private isLoading: boolean = false;
  private hasMore: boolean = true;
  private currentColsCount: number = 0;

  // Lightbox elements
  private lightbox: HTMLDialogElement | null = null;
  private lightboxImage: HTMLImageElement | null = null;
  private lightboxCaption: HTMLElement | null = null;
  private lightboxDate: HTMLElement | null = null;
  private lightboxTags: HTMLElement | null = null;
  private lightboxCounter: HTMLElement | null = null;
  private lightboxSpinner: HTMLElement | null = null;
  private currentLightboxIndex: number = -1;

  // Mobile touch swipe
  private touchStartX: number = 0;
  private touchStartY: number = 0;

  constructor() {
    const container = document.getElementById('gallery-section');
    const colsContainer = document.getElementById('masonry-columns');
    const sentinel = document.getElementById('gallery-sentinel');

    if (!container || !colsContainer || !sentinel) {
      console.warn('Gallery DOM elements not found');
      return;
    }

    this.container = container;
    this.columnsContainer = colsContainer;
    this.sentinel = sentinel;

    this.initDataFromDom();
    this.initLightbox();
    this.setupColumns();
    this.setupIntersectionObserver();
    this.setupResizeObserver();
  }

  private initDataFromDom(): void {
    const dataScript = document.getElementById('gallery-initial-data');
    if (dataScript && dataScript.textContent) {
      try {
        const parsed = JSON.parse(dataScript.textContent);
        this.loadedPhotos = parsed.photos || [];
        this.totalPages = parsed.totalPages || 1;
        this.hasMore = this.currentPage < this.totalPages;
      } catch (e) {
        console.error('Failed to parse initial gallery data:', e);
      }
    }

    // Collect pre-rendered cards
    const initialCards = this.columnsContainer.querySelectorAll<HTMLElement>('.photo-card');
    initialCards.forEach((card) => {
      const id = card.dataset.id;
      if (id) {
        this.photoCardMap.set(id, card);
        this.bindCardEvents(card);
      }
    });
  }

  private getTargetColumnCount(containerWidth?: number): number {
    const width = containerWidth !== undefined ? containerWidth : window.innerWidth;
    if (containerWidth !== undefined) {
      if (width < 600) return 2;
      if (width < 960) return 3;
      return 4;
    }
    if (width < 640) return 2;
    if (width < 1024) return 3;
    return 4;
  }

  private setupColumns(forceRebalance: boolean = false): void {
    const targetCols = this.getTargetColumnCount();
    const existingCols = this.columnsContainer.querySelectorAll<HTMLElement>('.masonry-col');

    // If pre-rendered or already balanced to targetCols, adopt existing DOM without wiping
    if (existingCols.length === targetCols && !forceRebalance) {
      this.currentColsCount = targetCols;
      this.columnElements = Array.from(existingCols);
      this.columnHeights = Array.from({ length: targetCols }, () => 0);
      this.columnElements.forEach((col, colIdx) => {
        const cards = col.querySelectorAll<HTMLElement>('.photo-card');
        cards.forEach((card) => {
          const w = parseFloat(card.dataset.width || '800');
          const h = parseFloat(card.dataset.height || '600');
          this.columnHeights[colIdx] += (h / w) + 0.04;
        });
      });
      return;
    }

    if (targetCols === this.currentColsCount && !forceRebalance) {
      return;
    }

    this.currentColsCount = targetCols;
    this.columnsContainer.innerHTML = '';
    this.columnElements = [];
    this.columnHeights = [];

    // Create column containers
    for (let i = 0; i < targetCols; i++) {
      const col = document.createElement('div');
      col.className = 'masonry-col flex flex-col gap-3 sm:gap-4 flex-1 min-w-0';
      this.columnsContainer.appendChild(col);
      this.columnElements.push(col);
      this.columnHeights.push(0);
    }

    // Distribute all loaded photos using lowest-column math
    this.loadedPhotos.forEach((photo, index) => {
      let card = this.photoCardMap.get(photo.id);
      if (!card) {
        card = this.createCardElement(photo, index);
        this.photoCardMap.set(photo.id, card);
      } else {
        card.dataset.index = String(index);
      }

      this.appendCardToLowestColumn(card, photo.width, photo.height);
    });
  }

  private appendCardToLowestColumn(card: HTMLElement, width: number, height: number): void {
    const aspect = height / width;
    let minCol = 0;
    for (let i = 1; i < this.columnHeights.length; i++) {
      if (this.columnHeights[i] < this.columnHeights[minCol]) {
        minCol = i;
      }
    }

    this.columnElements[minCol].appendChild(card);
    // Aspect ratio + slight uniform offset for card gap
    this.columnHeights[minCol] += aspect + 0.04;
  }

  private createCardElement(photo: Photo, index: number): HTMLElement {
    const card = document.createElement('article');
    card.className =
      'photo-card group relative w-full rounded-2xl overflow-hidden cursor-pointer shadow-soft hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 select-none focus:outline-none focus:ring-2 focus:ring-[var(--color-rose)]';
    card.dataset.id = photo.id;
    card.dataset.index = String(index);
    card.dataset.width = String(photo.width);
    card.dataset.height = String(photo.height);
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Xem ảnh: ${photo.caption}`);

    const aspectPercent = ((photo.height / photo.width) * 100).toFixed(2);

    card.innerHTML = `
      <div class="relative w-full overflow-hidden" style="padding-bottom: ${aspectPercent}%; background-color: ${photo.color}">
        <img
          src="${photo.blurDataUrl}"
          alt=""
          aria-hidden="true"
          class="blur-placeholder absolute inset-0 w-full h-full object-cover filter blur-sm scale-105 pointer-events-none transition-opacity duration-500"
        />
        <img
          src="${photo.src}"
          alt="${escapeHtml(photo.alt)}"
          loading="lazy"
          decoding="async"
          class="main-img absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-400"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 text-white pointer-events-none">
          <p class="text-xs sm:text-sm font-semibold drop-shadow-sm line-clamp-2">${escapeHtml(photo.caption)}</p>
          <span class="text-[11px] text-white/80 mt-1">${photo.date || ''}</span>
        </div>
      </div>
    `;

    const img = card.querySelector<HTMLImageElement>('.main-img');
    const blur = card.querySelector<HTMLImageElement>('.blur-placeholder');
    if (img) {
      if (img.complete) {
        img.classList.remove('opacity-0');
        if (blur) blur.style.opacity = '0';
      } else {
        img.addEventListener('load', () => {
          img.classList.remove('opacity-0');
          if (blur) blur.style.opacity = '0';
        });
      }
    }

    this.bindCardEvents(card);
    return card;
  }

  private bindCardEvents(card: HTMLElement): void {
    const activate = () => {
      const idx = parseInt(card.dataset.index || '-1', 10);
      if (idx >= 0 && idx < this.loadedPhotos.length) {
        this.openLightbox(idx);
      }
    };

    card.addEventListener('click', activate);
    card.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  }

  private setupResizeObserver(): void {
    let resizeTimer: number;
    const handleResize = (width?: number) => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const targetCols = this.getTargetColumnCount(width);
        if (targetCols !== this.currentColsCount) {
          this.setupColumns(true);
        }
      }, 150);
    };

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          handleResize(entry.contentRect.width);
        }
      });
      ro.observe(this.columnsContainer);
    } else {
      window.addEventListener('resize', () => handleResize());
    }
  }

  private setupIntersectionObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.isLoading && this.hasMore) {
          this.loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: '700px',
        threshold: 0,
      }
    );

    observer.observe(this.sentinel);
  }

  private updateSentinelUI(state: 'idle' | 'loading' | 'error' | 'ended'): void {
    if (state === 'loading') {
      this.sentinel.innerHTML = `
        <div class="flex items-center justify-center gap-3 py-10 text-[var(--color-rose-dark)]">
          <svg class="w-6 h-6 animate-spin text-[var(--color-rose)]" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span class="text-sm font-medium">Đang tải thêm những góc ảnh xinh... 🌸</span>
        </div>
      `;
    } else if (state === 'error') {
      this.sentinel.innerHTML = `
        <div class="flex flex-col items-center justify-center gap-3 py-8">
          <p class="text-sm text-[var(--color-muted)]">Chưa tải được ảnh tiếp theo nè 🥺</p>
          <button id="gallery-retry-btn" type="button" class="px-5 py-2 rounded-full bg-[var(--color-rose)] hover:bg-[var(--color-rose-dark)] text-white text-xs sm:text-sm font-semibold shadow-soft transition-all duration-200">
            Thử lại một chút nha 🌸
          </button>
        </div>
      `;
      const retryBtn = document.getElementById('gallery-retry-btn');
      retryBtn?.addEventListener('click', () => this.loadNextPage());
    } else if (state === 'ended') {
      this.sentinel.innerHTML = `
        <div class="flex items-center justify-center gap-2 py-12 text-[var(--color-muted)]">
          <div class="h-[1px] w-12 bg-[var(--color-rose)]/25"></div>
          <span class="text-xs sm:text-sm font-medium tracking-wide">✨ Bạn đã xem hết ảnh rồi nha ✨</span>
          <div class="h-[1px] w-12 bg-[var(--color-rose)]/25"></div>
        </div>
      `;
    } else {
      this.sentinel.innerHTML = '<div class="h-10"></div>';
    }
  }

  private async loadNextPage(): Promise<void> {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    const nextPage = this.currentPage + 1;
    this.updateSentinelUI('loading');

    try {
      // Try /data/photos/page-${nextPage}.json, fallback to /data/photos/${nextPage}.json
      let res = await fetch(`/data/photos/page-${nextPage}.json`);
      if (!res.ok) {
        res = await fetch(`/data/photos/${nextPage}.json`);
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: GalleryPageResponse = await res.json();
      const startIndex = this.loadedPhotos.length;

      data.photos.forEach((photo, idx) => {
        const fullIndex = startIndex + idx;
        this.loadedPhotos.push(photo);
        const card = this.createCardElement(photo, fullIndex);
        this.photoCardMap.set(photo.id, card);
        this.appendCardToLowestColumn(card, photo.width, photo.height);
      });

      this.currentPage = nextPage;
      this.hasMore = data.hasMore;

      if (!this.hasMore) {
        this.updateSentinelUI('ended');
      } else {
        this.updateSentinelUI('idle');
      }
    } catch (err) {
      console.error('Error fetching gallery page:', err);
      this.updateSentinelUI('error');
    } finally {
      this.isLoading = false;
    }
  }

  // ==================== LIGHTBOX ====================
  private initLightbox(): void {
    this.lightbox = document.getElementById('gallery-lightbox') as HTMLDialogElement | null;
    if (!this.lightbox) return;

    this.lightboxImage = document.getElementById('lightbox-image') as HTMLImageElement | null;
    this.lightboxCaption = document.getElementById('lightbox-caption');
    this.lightboxDate = document.getElementById('lightbox-date');
    this.lightboxTags = document.getElementById('lightbox-tags');
    this.lightboxCounter = document.getElementById('lightbox-counter');
    this.lightboxSpinner = document.getElementById('lightbox-spinner');

    const closeBtn = document.getElementById('lightbox-close-btn');
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');

    closeBtn?.addEventListener('click', () => this.closeLightbox());
    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.stepLightbox(-1);
    });
    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.stepLightbox(1);
    });

    // Close when clicking outside content (backdrop, margins, padding)
    this.lightbox.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;
      if (target.closest('#lightbox-caption-card') || target.id === 'lightbox-image') {
        return;
      }
      this.closeLightbox();
    });

    // Native dialog close event guarantees scroll unlock
    this.lightbox.addEventListener('close', () => {
      document.body.style.overflow = '';
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!this.lightbox?.open) return;
      if (e.key === 'Escape') {
        this.closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.stepLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.stepLightbox(1);
      }
    });

    // Mobile touch gestures (swipe left / right to navigate, swipe down to close)
    this.lightbox.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );

    this.lightbox.addEventListener(
      'touchcancel',
      () => {
        this.touchStartX = 0;
        this.touchStartY = 0;
      },
      { passive: true }
    );

    this.lightbox.addEventListener(
      'touchend',
      (e: TouchEvent) => {
        if (e.changedTouches.length === 1 && this.touchStartX !== 0) {
          const diffX = e.changedTouches[0].clientX - this.touchStartX;
          const diffY = e.changedTouches[0].clientY - this.touchStartY;

          // Swipe down to close
          if (diffY > 80 && Math.abs(diffY) > Math.abs(diffX) * 1.5) {
            this.closeLightbox();
          } else if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
            // Horizontal swipe
            if (diffX > 0) {
              this.stepLightbox(-1); // swipe right -> prev
            } else {
              this.stepLightbox(1); // swipe left -> next
            }
          }
          this.touchStartX = 0;
          this.touchStartY = 0;
        }
      },
      { passive: true }
    );
  }

  private openLightbox(index: number): void {
    if (!this.lightbox || index < 0 || index >= this.loadedPhotos.length) return;
    this.currentLightboxIndex = index;
    this.renderLightboxPhoto();
    this.lightbox.showModal();
    document.body.style.overflow = 'hidden';
  }

  private closeLightbox(): void {
    if (!this.lightbox) return;
    this.lightbox.close();
    document.body.style.overflow = '';
  }

  private stepLightbox(delta: number): void {
    const total = this.loadedPhotos.length;
    if (total === 0) return;

    // Prefetch next page if browsing near the end of loaded photos
    if (delta > 0 && this.currentLightboxIndex >= total - 2 && this.hasMore && !this.isLoading) {
      this.loadNextPage();
    }

    this.currentLightboxIndex = (this.currentLightboxIndex + delta + total) % total;
    this.renderLightboxPhoto();
  }

  private renderLightboxPhoto(): void {
    const targetIndex = this.currentLightboxIndex;
    const photo = this.loadedPhotos[targetIndex];
    if (!photo || !this.lightboxImage) return;

    if (this.lightboxSpinner) this.lightboxSpinner.classList.remove('opacity-0');

    // Show blur placeholder immediately while full image loads
    this.lightboxImage.src = photo.blurDataUrl;
    this.lightboxImage.style.filter = 'blur(8px)';
    this.lightboxImage.style.opacity = '0.85';

    const tempImg = new Image();
    tempImg.onload = () => {
      // Avoid race conditions if user already navigated away
      if (this.currentLightboxIndex !== targetIndex || !this.lightboxImage) return;
      this.lightboxImage.src = photo.src;
      this.lightboxImage.alt = photo.alt;
      this.lightboxImage.style.filter = 'none';
      this.lightboxImage.style.opacity = '1';
      if (this.lightboxSpinner) this.lightboxSpinner.classList.add('opacity-0');
    };
    tempImg.onerror = () => {
      if (this.currentLightboxIndex !== targetIndex || !this.lightboxImage) return;
      if (this.lightboxSpinner) this.lightboxSpinner.classList.add('opacity-0');
    };
    tempImg.src = photo.src;

    // Prefetch adjacent photos for instant transitions
    if (this.loadedPhotos[targetIndex + 1]) {
      const nextPreload = new Image();
      nextPreload.src = this.loadedPhotos[targetIndex + 1].src;
    }
    if (targetIndex > 0 && this.loadedPhotos[targetIndex - 1]) {
      const prevPreload = new Image();
      prevPreload.src = this.loadedPhotos[targetIndex - 1].src;
    }

    if (this.lightboxCaption) this.lightboxCaption.textContent = photo.caption;
    if (this.lightboxDate) this.lightboxDate.textContent = photo.date || '';
    if (this.lightboxTags) {
      this.lightboxTags.textContent = photo.tags && photo.tags.length > 0 ? `• #${photo.tags.join(' #')}` : '';
    }
    if (this.lightboxCounter) {
      this.lightboxCounter.textContent = `${targetIndex + 1} / ${this.loadedPhotos.length}`;
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new GalleryController());
} else {
  new GalleryController();
}
