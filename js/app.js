// Master Application Logic for THE REAL ESTATE
// Minimal, Royal, Cinematic, Scroll-Directed
import { translations } from './translations.js';
import { propertiesData, projectsData, developersData } from './data.js';
import { analytics } from './analytics.js';

class RealEstateApp {
  constructor() {
    this.currentLang = 'en'; // English-only per PRD Section 2
    this.currentView = 'grid'; // 'grid' | 'list'
    this.savedIds = new Set(JSON.parse(localStorage.getItem('the_real_estate_saved_ids') || '[]'));
    
    // WhatsApp configuration: unset by default per PRD Section 14
    this.whatsappConfigured = localStorage.getItem('the_real_estate_wa_mode') === 'configured';
    this.whatsappNumber = this.whatsappConfigured ? '+8801700000000' : '';

    this.filters = {
      search: '',
      location: 'all',
      type: 'all',
      purpose: 'Buy',
      budget: 'all',
      bedrooms: 'all',
      sort: 'featured'
    };

    this.activeProperty = null;
    this.activeAreaUnit = 'sqft';
    this.currentGalleryIndex = 0;

    // Scroll Film Engine State
    this.totalFrames = 161;
    this.canvasFrames = [];
    this.framesLoaded = 0;
    this.currentFrameIndex = 0;
    this.lastScrollProgress = 0;

    this.init();
  }

  init() {
    this.initHeroFilmEngine();
    this.renderProperties();
    this.updateSavedBadge();
    this.bindEvents();
    this.updateAdminDashboard();

    analytics.track('hero_poster_visible', { total_frames: this.totalFrames });
  }

  initHeroFilmEngine() {
    const canvas = document.getElementById('hero-film-canvas');
    if (!canvas) return;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.preloadFilmFrames();

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateFilmOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    document.querySelectorAll('.timeline-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const sceneNum = parseInt(btn.dataset.targetScene, 10);
        this.jumpToScene(sceneNum);
      });
    });
  }

  resizeCanvas() {
    const canvas = document.getElementById('hero-film-canvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (this.canvasFrames[this.currentFrameIndex]?.complete) {
      this.drawFrame(this.currentFrameIndex);
    }
  }

  preloadFilmFrames() {
    const firstImg = new Image();
    firstImg.src = './public/frames/ezgif-frame-001.jpg';
    firstImg.onload = () => {
      this.framesLoaded++;
      this.drawFrame(0);
      const loader = document.getElementById('initial-loader');
      if (loader) {
        setTimeout(() => {
          loader.classList.add('fade-out');
        }, 200);
      }
    };
    this.canvasFrames[0] = firstImg;

    for (let i = 2; i <= this.totalFrames; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, '0');
      img.src = `./public/frames/ezgif-frame-${numStr}.jpg`;
      img.onload = () => {
        this.framesLoaded++;
      };
      this.canvasFrames[i - 1] = img;
    }
  }

  updateFilmOnScroll() {
    const track = document.getElementById('hero-scroll-track');
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const trackHeight = track.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollableDistance = trackHeight - viewportHeight;

    if (scrollableDistance <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

    if (progress > 0.02 && !analytics.filmEvents?.started) {
      if (!analytics.filmEvents) analytics.filmEvents = {};
      analytics.filmEvents.started = true;
      analytics.track('scroll_film_started_by_scroll');
    }
    if (progress >= 0.95 && !analytics.filmEvents?.completed) {
      if (!analytics.filmEvents) analytics.filmEvents = {};
      analytics.filmEvents.completed = true;
      analytics.track('scroll_film_completed');
    }
    if (progress < this.lastScrollProgress && progress < 0.5 && analytics.filmEvents?.completed && !analytics.filmEvents?.rewound) {
      analytics.filmEvents.rewound = true;
      analytics.track('scroll_film_rewound');
    }

    this.lastScrollProgress = progress;

    const targetFrame = Math.min(this.totalFrames - 1, Math.floor(progress * (this.totalFrames - 1)));
    if (targetFrame !== this.currentFrameIndex) {
      this.currentFrameIndex = targetFrame;
      this.drawFrame(targetFrame);
    }

    let activeScene = 1;
    if (progress >= 0.80) {
      activeScene = 5;
    } else if (progress >= 0.60) {
      activeScene = 4;
    } else if (progress >= 0.38) {
      activeScene = 3;
    } else if (progress >= 0.18) {
      activeScene = 2;
    } else {
      activeScene = 1;
    }

    this.setActiveScene(activeScene);
  }

  setActiveScene(sceneNum) {
    for (let i = 1; i <= 5; i++) {
      const overlay = document.getElementById(`scene-${i}`);
      if (overlay) {
        if (i === sceneNum) {
          overlay.classList.add('active');
        } else {
          overlay.classList.remove('active');
        }
      }
    }

    document.querySelectorAll('.timeline-step').forEach(btn => {
      const btnScene = parseInt(btn.dataset.targetScene, 10);
      if (btnScene === sceneNum) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  jumpToScene(sceneNum) {
    const track = document.getElementById('hero-scroll-track');
    if (!track) return;
    const trackTop = track.offsetTop;
    const scrollableDistance = track.offsetHeight - window.innerHeight;

    const sceneProgresses = { 1: 0.05, 2: 0.28, 3: 0.49, 4: 0.70, 5: 0.90 };
    const targetProgress = sceneProgresses[sceneNum] || 0;
    const targetScroll = trackTop + (targetProgress * scrollableDistance);

    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    analytics.track('scroll_film_progress', { jumped_to_scene: sceneNum });
  }

  drawFrame(frameIndex) {
    const canvas = document.getElementById('hero-film-canvas');
    if (!canvas) return;

    let img = this.canvasFrames[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < 20; offset++) {
        if (frameIndex - offset >= 0 && this.canvasFrames[frameIndex - offset]?.complete) {
          img = this.canvasFrames[frameIndex - offset];
          break;
        }
        if (frameIndex + offset < this.totalFrames && this.canvasFrames[frameIndex + offset]?.complete) {
          img = this.canvasFrames[frameIndex + offset];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const hRatio = w / img.width;
    const vRatio = h / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const cx = (w - img.width * ratio) / 2;
    const cy = (h - img.height * ratio) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);
  }

  getFilteredProperties() {
    const q = this.filters.search.toLowerCase().trim();

    return propertiesData.filter(prop => {
      if (q) {
        const matchTitle = (prop.title_en || '').toLowerCase().includes(q);
        const matchTag = (prop.tagline_en || '').toLowerCase().includes(q);
        const matchCity = (prop.location_city || '').toLowerCase().includes(q);
        const matchArea = (prop.location_area || '').toLowerCase().includes(q);
        const matchDev = (prop.developer_name || '').toLowerCase().includes(q);
        const matchType = (prop.property_type || '').toLowerCase().includes(q);
        if (!matchTitle && !matchTag && !matchCity && !matchArea && !matchDev && !matchType) return false;
      }

      if (this.filters.location !== 'all' && prop.location_area !== this.filters.location && prop.location_city !== this.filters.location) {
        return false;
      }
      if (this.filters.type !== 'all' && prop.property_type !== this.filters.type) {
        return false;
      }
      if (this.filters.purpose !== 'all' && prop.sale_or_rent !== this.filters.purpose) {
        return false;
      }
      if (this.filters.bedrooms !== 'all') {
        const minBeds = parseInt(this.filters.bedrooms, 10);
        if ((prop.bedrooms || 0) < minBeds) return false;
      }
      if (this.filters.budget !== 'all') {
        const p = prop.price_bdt;
        if (this.filters.budget === 'under20m' && p >= 20000000) return false;
        if (this.filters.budget === '20m-50m' && (p < 20000000 || p > 50000000)) return false;
        if (this.filters.budget === '50m-100m' && (p < 50000000 || p > 100000000)) return false;
        if (this.filters.budget === 'above100m' && p <= 100000000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (this.filters.sort === 'price-asc') return a.price_bdt - b.price_bdt;
      if (this.filters.sort === 'price-desc') return b.price_bdt - a.price_bdt;
      if (this.filters.sort === 'area-desc') return b.area_sq_ft - a.area_sq_ft;
      if (this.filters.sort === 'newest') return (b.id > a.id ? 1 : -1);
      return (b.featured_status ? 1 : 0) - (a.featured_status ? 1 : 0);
    });
  }

  renderProperties() {
    const container = document.getElementById('properties-container');
    const emptyState = document.getElementById('no-results');
    const countEl = document.getElementById('results-count-text');
    if (!container) return;

    const props = this.getFilteredProperties();
    if (countEl) countEl.textContent = `Showing ${props.length} Curated Residences in Bangladesh`;

    if (props.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    if (this.currentView === 'grid') {
      container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
      container.innerHTML = props.map(p => this.createPropertyCardHTML(p)).join('');
    } else {
      container.className = 'space-y-6';
      container.innerHTML = props.map(p => this.createPropertyListHTML(p)).join('');
    }

    this.bindPropertyCardActions();
  }

  formatBDT(price) {
    if (!price) return 'Contact Advisor';
    if (price >= 10000000) {
      return `BDT ${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 1000000) {
      return `BDT ${(price / 1000000).toFixed(1)}M`;
    }
    return `BDT ${price.toLocaleString()}`;
  }

  createPropertyCardHTML(p) {
    const isSaved = this.savedIds.has(p.id);
    const formattedPrice = this.formatBDT(p.price_bdt);
    const heroImg = p.gallery?.[0] || './public/frames/ezgif-frame-001.jpg';

    return `
      <article class="editorial-card group flex flex-col justify-between" data-id="${p.id}">
        <div>
          <div class="relative aspect-[16/11] overflow-hidden bg-warm-stone cursor-pointer open-prop-detail">
            <img src="${heroImg}" alt="${p.title_en}" class="w-full h-full object-cover" loading="lazy" />
            <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span class="badge-royal-subtle !bg-graphite/80 !text-parchment !border-white/10 text-[10px] backdrop-blur-md">
                ${p.construction_status || 'Ready'}
              </span>
              <span class="badge-royal-trust !bg-graphite/80 !border-white/10 text-[10px] backdrop-blur-md">
                Verified Docs
              </span>
            </div>
            <button class="save-prop-btn absolute top-3 right-3 w-8 h-8 rounded-full bg-graphite/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-parchment hover:text-antique transition" data-id="${p.id}" title="${isSaved ? 'Remove from Saved' : 'Save Residence'}">
              <svg class="w-4 h-4 ${isSaved ? 'text-antique fill-current' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <div class="absolute bottom-3 left-3">
              <span class="font-serif text-xl font-bold text-white tracking-wide bg-graphite/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                ${formattedPrice}
              </span>
            </div>
          </div>

          <div class="p-5">
            <div class="flex items-center justify-between text-[11px] text-muted-text uppercase tracking-wider mb-1.5">
              <span>${p.location_area}, ${p.location_city}</span>
              <span class="font-mono text-antique">${p.property_type}</span>
            </div>
            <h3 class="font-serif text-2xl text-ink font-medium leading-snug group-hover:text-antique transition cursor-pointer open-prop-detail">
              ${p.title_en}
            </h3>
            <p class="text-xs text-muted-text mt-1.5 font-light line-clamp-2 leading-relaxed">
              ${p.tagline_en}
            </p>
            <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-ink/10 text-center text-xs">
              <div class="bg-parchment p-2 rounded-lg border border-ink/10">
                <span class="block text-[10px] text-muted-text uppercase">Area</span>
                <span class="font-medium text-ink">${p.area_sq_ft.toLocaleString()} sq ft</span>
              </div>
              <div class="bg-parchment p-2 rounded-lg border border-ink/10">
                <span class="block text-[10px] text-muted-text uppercase">Beds</span>
                <span class="font-medium text-ink">${p.bedrooms || '—'}</span>
              </div>
              <div class="bg-parchment p-2 rounded-lg border border-ink/10">
                <span class="block text-[10px] text-muted-text uppercase">Baths</span>
                <span class="font-medium text-ink">${p.bathrooms || '—'}</span>
              </div>
            </div>
            <div class="flex items-center justify-between mt-4 text-[11px] text-muted-text">
              <span class="truncate max-w-[170px]">${p.developer_name}</span>
              <span class="text-[10px] font-mono text-soft-taupe">Updated Oct 2026</span>
            </div>
          </div>
        </div>

        <div class="px-5 pb-5 pt-1 flex items-center gap-2">
          <button class="btn-royal-primary text-xs !py-2.5 flex-1 open-prop-detail" data-id="${p.id}">
            View Details
          </button>
          <button class="btn-royal-antique text-xs !py-2.5 px-3 prop-whatsapp-btn" data-id="${p.id}" title="Chat on WhatsApp">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
          </button>
        </div>
      </article>
    `;
  }

  createPropertyListHTML(p) {
    const isSaved = this.savedIds.has(p.id);
    const formattedPrice = this.formatBDT(p.price_bdt);
    const heroImg = p.gallery?.[0] || './public/frames/ezgif-frame-001.jpg';

    return `
      <article class="editorial-card group flex flex-col sm:flex-row items-stretch" data-id="${p.id}">
        <div class="sm:w-72 relative overflow-hidden bg-warm-stone cursor-pointer open-prop-detail">
          <img src="${heroImg}" alt="${p.title_en}" class="w-full h-full object-cover min-h-[200px]" loading="lazy" />
          <span class="absolute top-3 left-3 badge-royal-subtle !bg-graphite/80 !text-parchment text-[10px] backdrop-blur-md">
            ${p.construction_status || 'Ready'}
          </span>
        </div>
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-muted-text mb-1">
              <span>${p.location_area}, ${p.location_city}</span>
              <span class="font-serif text-xl font-bold text-ink">${formattedPrice}</span>
            </div>
            <h3 class="font-serif text-2xl text-ink font-medium group-hover:text-antique transition cursor-pointer open-prop-detail">
              ${p.title_en}
            </h3>
            <p class="text-xs text-muted-text mt-1 font-light">${p.tagline_en}</p>
            <div class="flex items-center gap-6 mt-4 text-xs font-mono text-ink">
              <span>${p.area_sq_ft.toLocaleString()} sq ft</span>
              <span>·</span>
              <span>${p.bedrooms || 0} Beds</span>
              <span>·</span>
              <span>${p.bathrooms || 0} Baths</span>
              <span>·</span>
              <span>${p.developer_name}</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-ink/10 flex items-center justify-between">
            <span class="text-[10px] font-mono text-muted-text">Updated Oct 2026 · RAJUK Reference Verified</span>
            <div class="flex items-center gap-2">
              <button class="save-prop-btn p-2 rounded-full border border-ink/15 text-muted-text hover:text-antique transition" data-id="${p.id}">
                <svg class="w-4 h-4 ${isSaved ? 'text-antique fill-current' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
              <button class="btn-royal-primary text-xs !py-2 open-prop-detail" data-id="${p.id}">View Details</button>
              <button class="btn-royal-antique text-xs !py-2 prop-whatsapp-btn" data-id="${p.id}">Chat on WhatsApp</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  bindPropertyCardActions() {
    document.querySelectorAll('.open-prop-detail').forEach(el => {
      el.addEventListener('click', () => {
        const card = el.closest('[data-id]');
        const id = card?.dataset.id || el.dataset.id;
        if (id) this.openPropertyDetail(id);
      });
    });

    document.querySelectorAll('.prop-whatsapp-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const prop = propertiesData.find(p => p.id === id);
        if (prop) this.handleWhatsAppAction(prop);
      });
    });

    document.querySelectorAll('.save-prop-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.toggleSaveProperty(id);
      });
    });
  }

  openPropertyDetail(id) {
    const prop = propertiesData.find(p => p.id === id);
    if (!prop) return;

    this.activeProperty = prop;
    this.activeAreaUnit = 'sqft';
    this.currentGalleryIndex = 0;

    const modal = document.getElementById('property-modal');
    const content = document.getElementById('property-modal-content');
    if (!modal || !content) return;

    content.innerHTML = this.createPropertyDetailModalHTML(prop);
    this.bindPropertyDetailModalEvents();

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    analytics.track('property_opened', {
      property_id: prop.id,
      property_name: prop.title_en,
      location: `${prop.location_area}, ${prop.location_city}`,
      price_bdt: prop.price_bdt
    });
  }

  createPropertyDetailModalHTML(p) {
    const isSaved = this.savedIds.has(p.id);
    const formattedPrice = this.formatBDT(p.price_bdt);
    const exactPrice = `BDT ${p.price_bdt.toLocaleString()}`;
    const gallery = p.gallery && p.gallery.length ? p.gallery : ['./public/frames/ezgif-frame-001.jpg'];

    return `
      <div>
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4 mb-6">
          <div class="flex items-center gap-2">
            <span class="badge-royal-trust text-xs">${p.construction_status || 'Ready to Move'}</span>
            <span class="badge-royal-subtle text-xs">Updated Oct 2026</span>
            <span class="badge-royal-subtle text-xs">ID: ${p.id}</span>
          </div>
          <div class="text-xs text-muted-text">
            <span>Developer:</span> <strong class="text-ink font-medium">${p.developer_name}</strong>
          </div>
        </div>

        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span class="text-xs uppercase tracking-widest text-antique font-semibold block mb-1">
              ${p.location_sector_block_road || p.location_area}, ${p.location_city}
            </span>
            <h2 class="font-serif text-3xl sm:text-5xl text-ink font-normal leading-tight">
              ${p.title_en}
            </h2>
            <p class="text-xs sm:text-sm text-muted-text mt-2 font-light max-w-2xl leading-relaxed">
              ${p.tagline_en}
            </p>
          </div>
          <div class="text-left md:text-right">
            <div class="font-serif text-3xl sm:text-4xl font-bold text-ink">${formattedPrice}</div>
            <div class="text-xs text-muted-text font-mono mt-0.5">${exactPrice} (Exact)</div>
          </div>
        </div>

        <div class="relative aspect-[16/9] rounded-2xl overflow-hidden bg-warm-stone mb-6 border border-ink/10">
          <img id="detail-main-img" src="${gallery[0]}" alt="${p.title_en}" class="w-full h-full object-cover transition-opacity duration-300" />
          ${gallery.length > 1 ? `
            <button id="detail-prev-img" class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-graphite/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black transition">‹</button>
            <button id="detail-next-img" class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-graphite/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black transition">›</button>
            <div class="absolute bottom-4 right-4 bg-graphite/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-mono border border-white/10">
              <span id="detail-img-counter">1</span> / ${gallery.length}
            </div>
          ` : ''}
        </div>

        <div class="bg-warm-stone border border-ink/10 rounded-2xl p-5 mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span class="text-xs font-medium text-ink uppercase tracking-wider block">Dimensions & Area Measurement</span>
              <span class="text-[11px] text-muted-text">Calculated conversion (approximate)</span>
            </div>
            <div class="flex items-center gap-1.5 bg-white p-1 rounded-full border border-ink/10 text-xs font-medium">
              <button class="unit-toggle-btn px-3 py-1 rounded-full bg-ink text-parchment" data-unit="sqft">sq ft</button>
              <button class="unit-toggle-btn px-3 py-1 rounded-full text-muted-text hover:text-ink" data-unit="katha">katha</button>
              <button class="unit-toggle-btn px-3 py-1 rounded-full text-muted-text hover:text-ink" data-unit="decimal">decimal</button>
              <button class="unit-toggle-btn px-3 py-1 rounded-full text-muted-text hover:text-ink" data-unit="sqm">sq m</button>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div class="bg-white p-3 rounded-xl border border-ink/10">
              <span class="block text-[10px] text-muted-text uppercase">Primary Area</span>
              <span id="unit-converted-area" class="font-serif text-xl font-bold text-ink">${p.area_sq_ft.toLocaleString()} sq ft</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-ink/10">
              <span class="block text-[10px] text-muted-text uppercase">Bedrooms</span>
              <span class="font-serif text-xl font-bold text-ink">${p.bedrooms || '—'}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-ink/10">
              <span class="block text-[10px] text-muted-text uppercase">Bathrooms</span>
              <span class="font-serif text-xl font-bold text-ink">${p.bathrooms || '—'}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-ink/10">
              <span class="block text-[10px] text-muted-text uppercase">Orientation</span>
              <span class="font-serif text-xl font-bold text-ink">${p.facing || 'South'}</span>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <h3 class="font-serif text-2xl text-ink font-medium mb-3">Architectural Overview</h3>
          <p class="text-xs sm:text-sm text-muted-text font-light leading-relaxed whitespace-pre-line">
            ${p.description_en}
          </p>
        </div>

        <div class="mb-8">
          <h3 class="font-serif text-2xl text-ink font-medium mb-3">Specifications</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3 bg-white border border-ink/10 rounded-xl">
              <span class="text-muted-text block text-[10px] uppercase">Floor Level</span>
              <span class="font-medium text-ink">${p.floor_level || 'Custom'}</span>
            </div>
            <div class="p-3 bg-white border border-ink/10 rounded-xl">
              <span class="text-muted-text block text-[10px] uppercase">Parking Bays</span>
              <span class="font-medium text-ink">${p.parking || 1} Dedicated Bays</span>
            </div>
            <div class="p-3 bg-white border border-ink/10 rounded-xl">
              <span class="text-muted-text block text-[10px] uppercase">Verandas</span>
              <span class="font-medium text-ink">${p.balconies || 2} Balconies</span>
            </div>
            <div class="p-3 bg-white border border-ink/10 rounded-xl">
              <span class="text-muted-text block text-[10px] uppercase">Handover Status</span>
              <span class="font-medium text-ink">${p.handover_date || 'Ready'}</span>
            </div>
            <div class="p-3 bg-white border border-ink/10 rounded-xl">
              <span class="text-muted-text block text-[10px] uppercase">Developer Group</span>
              <span class="font-medium text-ink">${p.developer_name}</span>
            </div>
            <div class="p-3 bg-white border border-ink/10 rounded-xl">
              <span class="text-muted-text block text-[10px] uppercase">Listing Status</span>
              <span class="font-medium text-antique">Available for Viewing</span>
            </div>
          </div>
        </div>

        ${p.amenities && p.amenities.length ? `
          <div class="mb-8">
            <h3 class="font-serif text-2xl text-ink font-medium mb-3">Residence Amenities</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              ${p.amenities.map(a => `
                <div class="flex items-center gap-2 p-2.5 bg-white border border-ink/10 rounded-lg text-ink font-light">
                  <span class="w-1.5 h-1.5 rounded-full bg-antique"></span>
                  <span>${a}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${p.floor_plans && p.floor_plans.length ? `
          <div class="mb-8">
            <h3 class="font-serif text-2xl text-ink font-medium mb-3">Architectural Floor Plan</h3>
            <div class="rounded-2xl border border-ink/10 bg-warm-stone overflow-hidden p-4 text-center">
              <img src="${p.floor_plans[0].image}" alt="Floor Plan" class="max-h-96 mx-auto rounded-lg object-contain" />
              <span class="block text-xs text-muted-text mt-3 font-mono">${p.floor_plans[0].title} (${p.floor_plans[0].area})</span>
            </div>
          </div>
        ` : ''}

        <div class="mb-8">
          <h3 class="font-serif text-2xl text-ink font-medium mb-3">Document Verification Status</h3>
          <div class="space-y-2 mb-4">
            ${(p.documents || []).map(doc => `
              <div class="flex items-center justify-between p-3 bg-white border border-ink/10 rounded-xl text-xs">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-antique"></span>
                  <span class="font-medium text-ink">${doc.name}</span>
                  <span class="text-[10px] text-muted-text font-mono">(${doc.type})</span>
                </div>
                <span class="badge-royal-trust text-[10px]">Reviewed · ${doc.date}</span>
              </div>
            `).join('')}
          </div>

          <div class="disclosure-box">
            <div class="font-medium text-ink mb-1 flex items-center gap-2">
              <svg class="w-4 h-4 text-antique" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Independent Verification Disclosure</span>
            </div>
            <p>
              Property information and uploaded documents are provided for convenience. Buyers should independently verify ownership, approvals, agreement terms, registration, taxes, fees, financing, and other legal or financial matters with qualified professionals and relevant authorities before making a decision.
            </p>
          </div>
        </div>

        <div class="pt-6 border-t border-ink/10 flex flex-wrap items-center justify-between gap-4 sticky bottom-0 bg-parchment/95 backdrop-blur-md py-4">
          <div class="flex items-center gap-2">
            <button class="modal-whatsapp-trigger btn-royal-antique text-xs flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
              <span>Chat on WhatsApp</span>
            </button>
            <button class="modal-viewing-trigger btn-royal-primary text-xs">Schedule a Viewing</button>
            <button class="modal-callback-trigger btn-royal-outline text-xs">Request Callback</button>
          </div>
          <button class="modal-save-trigger btn-royal-outline text-xs flex items-center gap-1.5" data-id="${p.id}">
            <svg class="w-3.5 h-3.5 ${isSaved ? 'text-antique fill-current' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>${isSaved ? 'Saved' : 'Save Residence'}</span>
          </button>
        </div>
      </div>
    `;
  }

  bindPropertyDetailModalEvents() {
    if (!this.activeProperty) return;
    const p = this.activeProperty;
    const gallery = p.gallery || [];

    const mainImg = document.getElementById('detail-main-img');
    const counterEl = document.getElementById('detail-img-counter');
    const prevBtn = document.getElementById('detail-prev-img');
    const nextBtn = document.getElementById('detail-next-img');

    if (prevBtn && nextBtn && gallery.length > 1) {
      prevBtn.addEventListener('click', () => {
        this.currentGalleryIndex = (this.currentGalleryIndex - 1 + gallery.length) % gallery.length;
        mainImg.src = gallery[this.currentGalleryIndex];
        if (counterEl) counterEl.textContent = this.currentGalleryIndex + 1;
      });

      nextBtn.addEventListener('click', () => {
        this.currentGalleryIndex = (this.currentGalleryIndex + 1) % gallery.length;
        mainImg.src = gallery[this.currentGalleryIndex];
        if (counterEl) counterEl.textContent = this.currentGalleryIndex + 1;
      });
    }

    const convertedEl = document.getElementById('unit-converted-area');
    document.querySelectorAll('.unit-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.unit-toggle-btn').forEach(b => {
          b.className = 'unit-toggle-btn px-3 py-1 rounded-full text-muted-text hover:text-ink';
        });
        btn.className = 'unit-toggle-btn px-3 py-1 rounded-full bg-ink text-parchment';

        const unit = btn.dataset.unit;
        const sqft = p.area_sq_ft;
        let text = `${sqft.toLocaleString()} sq ft`;

        if (unit === 'katha') {
          const katha = (sqft / 720).toFixed(2);
          text = `${katha} Katha`;
        } else if (unit === 'decimal') {
          const dec = (sqft / 435.6).toFixed(2);
          text = `${dec} Decimal`;
        } else if (unit === 'sqm') {
          const sqm = (sqft / 10.7639).toFixed(1);
          text = `${sqm} sq m`;
        }

        if (convertedEl) convertedEl.textContent = text;
      });
    });

    document.querySelector('.modal-whatsapp-trigger')?.addEventListener('click', () => {
      this.handleWhatsAppAction(p);
    });

    document.querySelector('.modal-viewing-trigger')?.addEventListener('click', () => {
      this.openLeadModal('viewing', p);
    });

    document.querySelector('.modal-callback-trigger')?.addEventListener('click', () => {
      this.openLeadModal('callback', p);
    });

    const saveTrigger = document.querySelector('.modal-save-trigger');
    if (saveTrigger) {
      saveTrigger.addEventListener('click', () => {
        this.toggleSaveProperty(p.id);
        const isSaved = this.savedIds.has(p.id);
        saveTrigger.innerHTML = `
          <svg class="w-3.5 h-3.5 ${isSaved ? 'text-antique fill-current' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span>${isSaved ? 'Saved' : 'Save Residence'}</span>
        `;
      });
    }
  }

  handleWhatsAppAction(property = null) {
    const prop = property || this.activeProperty || propertiesData[0];
    const propName = prop ? prop.title_en : 'General Portfolio';
    const propLoc = prop ? `${prop.location_area}, ${prop.location_city}` : 'Dhaka, Bangladesh';
    const propId = prop ? prop.id : 'N/A';

    analytics.track('whatsapp_cta_clicked', {
      whatsapp_configured: this.whatsappConfigured,
      property_id: propId,
      property_name: propName
    });

    if (this.whatsappConfigured && this.whatsappNumber) {
      const message = `Hello The Real Estate team, I’m interested in ${propName} in ${propLoc} (Ref: ${propId}). Please share current availability, pricing, and viewing options.`;
      const url = `https://wa.me/${this.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      this.openWhatsAppSampleSheet(prop);
    }
  }

  openWhatsAppSampleSheet(prop) {
    this.activeProperty = prop;
    const sheet = document.getElementById('whatsapp-sheet-modal');
    const nameEl = document.getElementById('wa-context-property-name');
    const idEl = document.getElementById('wa-context-property-id');

    if (nameEl) nameEl.textContent = prop ? prop.title_en : 'General Bangladesh Portfolio';
    if (idEl) idEl.textContent = prop ? `Ref ID: ${prop.id}` : 'General Inquiry';

    if (sheet) {
      sheet.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    analytics.track('sample_whatsapp_sheet_opened', {
      property_id: prop ? prop.id : 'N/A'
    });
  }

  openLeadModal(type = 'viewing', prop = null) {
    const modal = document.getElementById('lead-form-modal');
    const titleEl = document.getElementById('lead-modal-title');
    const subEl = document.getElementById('lead-modal-subtitle');
    const typeInput = document.getElementById('lead-form-type');
    const propIdInput = document.getElementById('lead-form-prop-id');
    const propNameInput = document.getElementById('lead-form-prop-name');
    const nrbFields = document.getElementById('lead-nrb-fields');

    if (!modal) return;

    const p = prop || this.activeProperty;
    if (typeInput) typeInput.value = type;
    if (propIdInput) propIdInput.value = p ? p.id : '';
    if (propNameInput) propNameInput.value = p ? p.title_en : '';

    if (type === 'viewing') {
      if (titleEl) titleEl.textContent = 'Schedule a Private Viewing';
      if (subEl) subEl.textContent = p ? `Viewing for ${p.title_en} (${p.location_area})` : 'Private property viewing';
      if (nrbFields) nrbFields.classList.add('hidden');
    } else if (type === 'callback') {
      if (titleEl) titleEl.textContent = 'Request a Callback';
      if (subEl) subEl.textContent = 'A senior advisor will reach out during your preferred time.';
      if (nrbFields) nrbFields.classList.add('hidden');
    } else if (type === 'nrb') {
      if (titleEl) titleEl.textContent = 'Schedule Virtual Consultation';
      if (subEl) subEl.textContent = 'Dedicated consultation for Non-Resident Bangladeshis across time zones.';
      if (nrbFields) nrbFields.classList.remove('hidden');
    } else if (type === 'developer') {
      if (titleEl) titleEl.textContent = 'Present Your Project';
      if (subEl) subEl.textContent = 'Submit an architectural dossier for inclusion in The Real Estate showcase.';
      if (nrbFields) nrbFields.classList.add('hidden');
    } else if (type === 'landowner') {
      if (titleEl) titleEl.textContent = 'Discuss Land Partnership';
      if (subEl) subEl.textContent = 'Joint-venture consultation with vetted Grade-A developers in Dhaka.';
      if (nrbFields) nrbFields.classList.add('hidden');
    } else {
      if (titleEl) titleEl.textContent = 'Submit Property Enquiry';
      if (subEl) subEl.textContent = p ? `Inquiry regarding ${p.title_en}` : 'Connect with our advisory team.';
      if (nrbFields) nrbFields.classList.add('hidden');
    }

    const waSheet = document.getElementById('whatsapp-sheet-modal');
    if (waSheet) waSheet.classList.add('hidden');

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  handleLeadSubmit(e) {
    e.preventDefault();

    const type = document.getElementById('lead-form-type')?.value || 'enquiry';
    const propId = document.getElementById('lead-form-prop-id')?.value || '';
    const propName = document.getElementById('lead-form-prop-name')?.value || '';
    const name = document.getElementById('lead-name')?.value || '';
    const phone = document.getElementById('lead-phone')?.value || '';
    const email = document.getElementById('lead-email')?.value || '';
    const country = document.getElementById('lead-country')?.value || '';
    const timezone = document.getElementById('lead-timezone')?.value || '';
    const message = document.getElementById('lead-message')?.value || '';

    const lead = analytics.recordLead({
      lead_type: type,
      property_id: propId,
      property_name: propName,
      name,
      phone,
      email,
      country,
      timezone,
      message
    });

    document.getElementById('lead-form-modal')?.classList.add('hidden');
    const successModal = document.getElementById('lead-success-modal');
    const refIdEl = document.getElementById('lead-success-id');
    if (refIdEl) refIdEl.textContent = `#${lead.id}`;
    if (successModal) successModal.classList.remove('hidden');

    e.target.reset();
    this.updateAdminDashboard();
  }

  toggleSaveProperty(id) {
    if (this.savedIds.has(id)) {
      this.savedIds.delete(id);
      analytics.track('property_unsaved', { property_id: id });
    } else {
      this.savedIds.add(id);
      analytics.track('property_saved', { property_id: id });
    }

    localStorage.setItem('the_real_estate_saved_ids', JSON.stringify(Array.from(this.savedIds)));
    this.updateSavedBadge();
    this.renderProperties();
  }

  updateSavedBadge() {
    const badge = document.getElementById('nav-saved-count');
    if (badge) badge.textContent = this.savedIds.size;
  }

  openSavedModal() {
    const modal = document.getElementById('saved-modal');
    const container = document.getElementById('saved-list-container');
    if (!modal || !container) return;

    const savedProps = propertiesData.filter(p => this.savedIds.has(p.id));

    if (savedProps.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-muted-text">
          <p class="font-serif text-xl text-ink mb-1">No saved residences yet</p>
          <p class="text-xs">Click the bookmark icon on any property card to save it for review.</p>
        </div>
      `;
    } else {
      container.innerHTML = savedProps.map(p => `
        <div class="flex items-center justify-between p-4 bg-white border border-ink/10 rounded-xl" data-id="${p.id}">
          <div class="flex items-center gap-3">
            <img src="${p.gallery?.[0] || './public/frames/ezgif-frame-001.jpg'}" alt="${p.title_en}" class="w-14 h-14 object-cover rounded-lg" />
            <div>
              <h4 class="font-serif text-lg text-ink font-medium leading-tight">${p.title_en}</h4>
              <span class="text-xs text-muted-text font-mono">${this.formatBDT(p.price_bdt)} · ${p.location_area}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-royal-primary text-xs !py-1.5 open-prop-detail" data-id="${p.id}">View</button>
            <button class="save-prop-btn text-xs text-muted-text hover:text-ink px-2" data-id="${p.id}">Remove</button>
          </div>
        </div>
      `).join('');

      this.bindPropertyCardActions();
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  updateAdminDashboard() {
    const leadCountEl = document.getElementById('admin-lead-count');
    const eventCountEl = document.getElementById('admin-event-count');
    const waLabelEl = document.getElementById('admin-wa-mode-label');
    const leadsTbody = document.getElementById('admin-leads-tbody');
    const eventsContainer = document.getElementById('admin-content-events');

    const leads = analytics.getLeads();
    const events = analytics.getEvents();

    if (leadCountEl) leadCountEl.textContent = leads.length;
    if (eventCountEl) eventCountEl.textContent = events.length;
    if (waLabelEl) {
      waLabelEl.textContent = this.whatsappConfigured ? 'Configured (+88017...)' : 'Unset (Default)';
    }

    if (leadsTbody) {
      if (leads.length === 0) {
        leadsTbody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-soft-taupe font-light">No leads captured yet. Submit any viewing or callback request to audit.</td></tr>`;
      } else {
        leadsTbody.innerHTML = leads.map(l => `
          <tr class="border-b border-white/5 hover:bg-white/5 transition">
            <td class="py-2.5 font-mono text-[10px]">${l.timeFormatted || 'Recent'}</td>
            <td class="py-2.5 text-white font-medium">${l.name}</td>
            <td class="py-2.5 font-mono">${l.phone}</td>
            <td class="py-2.5 uppercase text-[10px] text-antique">${l.lead_type}</td>
            <td class="py-2.5 truncate max-w-[140px]">${l.property_name || 'General'}</td>
            <td class="py-2.5 text-parchment">${l.status}</td>
          </tr>
        `).join('');
      }
    }

    if (eventsContainer) {
      eventsContainer.innerHTML = events.slice(0, 30).map(e => `
        <div class="p-2 bg-white/5 rounded border border-white/5 flex items-center justify-between">
          <span class="text-antique font-semibold">${e.event_name}</span>
          <span class="text-[10px] text-soft-taupe">${e.timeFormatted}</span>
        </div>
      `).join('');
    }
  }

  toggleWhatsAppMode() {
    this.whatsappConfigured = !this.whatsappConfigured;
    this.whatsappNumber = this.whatsappConfigured ? '+8801700000000' : '';
    localStorage.setItem('the_real_estate_wa_mode', this.whatsappConfigured ? 'configured' : 'unset');
    this.updateAdminDashboard();
    analytics.track('whatsapp_mode_toggled', { configured: this.whatsappConfigured });
  }

  bindEvents() {
    document.getElementById('nav-saved-btn')?.addEventListener('click', () => {
      this.openSavedModal();
    });

    document.getElementById('nav-whatsapp-btn')?.addEventListener('click', () => {
      this.handleWhatsAppAction();
    });

    document.querySelectorAll('.open-prop-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id) this.openPropertyDetail(id);
      });
    });

    document.querySelectorAll('.collection-card').forEach(card => {
      card.addEventListener('click', () => {
        const coll = card.dataset.collection;
        analytics.track('collection_opened', { collection: coll });

        if (coll === 'Signature Residences') {
          this.filters.type = 'Penthouse';
          const el = document.getElementById('filter-type'); if (el) el.value = 'Penthouse';
        } else if (coll === 'Ready to Move') {
          this.filters.purpose = 'Buy';
          const el = document.getElementById('filter-purpose'); if (el) el.value = 'Buy';
        } else if (coll === 'New Projects') {
          this.filters.type = 'Apartment';
          const el = document.getElementById('filter-type'); if (el) el.value = 'Apartment';
        } else if (coll === 'Land & Plots') {
          this.filters.type = 'Plot';
          const el = document.getElementById('filter-type'); if (el) el.value = 'Plot';
        } else if (coll === 'Commercial Spaces') {
          this.filters.type = 'Commercial';
          const el = document.getElementById('filter-type'); if (el) el.value = 'Commercial';
        } else if (coll === 'International Buyers') {
          document.getElementById('nrb-section')?.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        this.renderProperties();
        document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value;
        this.renderProperties();
        analytics.track('search_submitted', { query: this.filters.search });
      });
    }

    document.getElementById('filter-location')?.addEventListener('change', (e) => {
      this.filters.location = e.target.value;
      this.renderProperties();
      analytics.track('filter_applied', { filter: 'location', value: e.target.value });
    });

    document.getElementById('filter-type')?.addEventListener('change', (e) => {
      this.filters.type = e.target.value;
      this.renderProperties();
      analytics.track('filter_applied', { filter: 'type', value: e.target.value });
    });

    document.getElementById('filter-purpose')?.addEventListener('change', (e) => {
      this.filters.purpose = e.target.value;
      this.renderProperties();
      analytics.track('filter_applied', { filter: 'purpose', value: e.target.value });
    });

    document.getElementById('filter-budget')?.addEventListener('change', (e) => {
      this.filters.budget = e.target.value;
      this.renderProperties();
      analytics.track('filter_applied', { filter: 'budget', value: e.target.value });
    });

    document.getElementById('filter-bedrooms')?.addEventListener('change', (e) => {
      this.filters.bedrooms = e.target.value;
      this.renderProperties();
      analytics.track('filter_applied', { filter: 'bedrooms', value: e.target.value });
    });

    document.getElementById('sort-select')?.addEventListener('change', (e) => {
      this.filters.sort = e.target.value;
      this.renderProperties();
    });

    document.getElementById('view-grid-btn')?.addEventListener('click', () => {
      this.currentView = 'grid';
      document.getElementById('view-grid-btn').className = 'px-3 py-1 rounded-full font-medium transition bg-ink text-parchment';
      document.getElementById('view-list-btn').className = 'px-3 py-1 rounded-full font-medium transition text-muted-text hover:text-ink';
      this.renderProperties();
    });

    document.getElementById('view-list-btn')?.addEventListener('click', () => {
      this.currentView = 'list';
      document.getElementById('view-list-btn').className = 'px-3 py-1 rounded-full font-medium transition bg-ink text-parchment';
      document.getElementById('view-grid-btn').className = 'px-3 py-1 rounded-full font-medium transition text-muted-text hover:text-ink';
      this.renderProperties();
    });

    const resetFilters = () => {
      this.filters = {
        search: '',
        location: 'all',
        type: 'all',
        purpose: 'Buy',
        budget: 'all',
        bedrooms: 'all',
        sort: 'featured'
      };
      if (searchInput) searchInput.value = '';
      const loc = document.getElementById('filter-location'); if (loc) loc.value = 'all';
      const type = document.getElementById('filter-type'); if (type) type.value = 'all';
      const purp = document.getElementById('filter-purpose'); if (purp) purp.value = 'Buy';
      const bud = document.getElementById('filter-budget'); if (bud) bud.value = 'all';
      const bed = document.getElementById('filter-bedrooms'); if (bed) bed.value = 'all';
      const sort = document.getElementById('sort-select'); if (sort) sort.value = 'featured';
      this.renderProperties();
    };

    document.getElementById('reset-filters-btn')?.addEventListener('click', resetFilters);
    document.getElementById('no-results-reset-btn')?.addEventListener('click', resetFilters);

    document.getElementById('nrb-consultation-btn')?.addEventListener('click', () => {
      this.openLeadModal('nrb');
    });

    document.getElementById('nrb-guide-btn')?.addEventListener('click', () => {
      analytics.track('brochure_requested', { dossier: 'NRB Investment Guide' });
      alert('The Real Estate NRB Dossier (PDF) download started.');
    });

    document.querySelectorAll('.partnership-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        this.openLeadModal(type);
      });
    });

    document.getElementById('cta-shortlist-btn')?.addEventListener('click', () => {
      this.openLeadModal('callback');
    });
    document.getElementById('cta-advisor-btn')?.addEventListener('click', () => {
      this.openLeadModal('callback');
    });
    document.getElementById('cta-whatsapp-btn')?.addEventListener('click', () => {
      this.handleWhatsAppAction();
    });

    document.getElementById('wa-action-callback')?.addEventListener('click', () => {
      this.openLeadModal('callback', this.activeProperty);
    });
    document.getElementById('wa-action-viewing')?.addEventListener('click', () => {
      this.openLeadModal('viewing', this.activeProperty);
    });
    document.getElementById('wa-action-enquiry')?.addEventListener('click', () => {
      this.openLeadModal('enquiry', this.activeProperty);
    });

    document.getElementById('lead-form')?.addEventListener('submit', (e) => {
      this.handleLeadSubmit(e);
    });

    const openAdmin = () => {
      document.getElementById('admin-modal')?.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      this.updateAdminDashboard();
    };

    document.getElementById('admin-open-btn')?.addEventListener('click', openAdmin);
    document.getElementById('footer-admin-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      openAdmin();
    });

    document.getElementById('admin-toggle-wa-mode')?.addEventListener('click', () => {
      this.toggleWhatsAppMode();
    });

    const tabLeads = document.getElementById('admin-tab-leads');
    const tabEvents = document.getElementById('admin-tab-events');
    const contentLeads = document.getElementById('admin-content-leads');
    const contentEvents = document.getElementById('admin-content-events');

    tabLeads?.addEventListener('click', () => {
      tabLeads.className = 'text-antique border-b-2 border-antique pb-2';
      tabEvents.className = 'text-soft-taupe pb-2 hover:text-white';
      contentLeads?.classList.remove('hidden');
      contentEvents?.classList.add('hidden');
    });

    tabEvents?.addEventListener('click', () => {
      tabEvents.className = 'text-antique border-b-2 border-antique pb-2';
      tabLeads.className = 'text-soft-taupe pb-2 hover:text-white';
      contentEvents?.classList.remove('hidden');
      contentLeads?.classList.add('hidden');
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        document.body.style.overflow = '';
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        document.body.style.overflow = '';
      }
    });
  }
}

export { RealEstateApp };
