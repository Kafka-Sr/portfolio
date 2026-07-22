document.addEventListener('DOMContentLoaded', () => {

  /* Theme */
  const html     = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  themeBtn.addEventListener('click', () => {
    applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  initTheme();

  /* Language */
  const langBtn = document.getElementById('langToggle');

  initLang();   /* defined in i18n.js */

  langBtn.addEventListener('click', () => {
    toggleLang(); /* defined in i18n.js */
  });

  /* Footer year */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Navbar: hamburger + active link on scroll */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  /* Close mobile nav on link click */
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* Active nav link via IntersectionObserver */
  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('active'));
          const active = navLinks.querySelector(`a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );

  sections.forEach(s => navObserver.observe(s));

  /* Shared image lightbox (projects mobile + certs) */
  const lightbox = document.createElement('div');
  lightbox.className = 'cert-lightbox';
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('role', 'dialog');
  lightbox.innerHTML = `
    <img class="cert-lightbox__img" src="" alt="" />
    <button class="lightbox__arrow lightbox__arrow--prev" type="button" aria-label="Previous image">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button class="lightbox__arrow lightbox__arrow--next" type="button" aria-label="Next image">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <div class="lightbox__dots"></div>
    <button class="cert-lightbox__close" aria-label="Close">✕</button>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg   = lightbox.querySelector('.cert-lightbox__img');
  const lightboxClose = lightbox.querySelector('.cert-lightbox__close');
  const lbPrev        = lightbox.querySelector('.lightbox__arrow--prev');
  const lbNext        = lightbox.querySelector('.lightbox__arrow--next');
  const lbDotsEl      = lightbox.querySelector('.lightbox__dots');

  let lbSlides  = [];
  let lbCurrent = 0;
  let lbDots    = [];

  function lbGoTo(idx) {
    if (lbDots.length) lbDots[lbCurrent].classList.remove('active');
    lbCurrent = ((idx % lbSlides.length) + lbSlides.length) % lbSlides.length;
    lightboxImg.src = lbSlides[lbCurrent].src;
    lightboxImg.alt = lbSlides[lbCurrent].alt;
    if (lbDots.length) lbDots[lbCurrent].classList.add('active');
  }

  function openLightbox(slides, startIdx = 0) {
    lbSlides  = slides;
    lbCurrent = startIdx;
    lightboxImg.src = slides[startIdx].src;
    lightboxImg.alt = slides[startIdx].alt;

    const hasMultiple = slides.length > 1;
    lbPrev.style.display = hasMultiple ? 'flex' : 'none';
    lbNext.style.display = hasMultiple ? 'flex' : 'none';

    lbDotsEl.innerHTML = '';
    lbDots = hasMultiple ? slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'lightbox__dot' + (i === startIdx ? ' active' : '');
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', `Image ${i + 1}`);
      dot.addEventListener('click', (e) => { e.stopPropagation(); lbGoTo(lbDots.indexOf(dot)); });
      lbDotsEl.appendChild(dot);
      return dot;
    }) : [];

    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); lbGoTo(lbCurrent - 1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); lbGoTo(lbCurrent + 1); });
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft'  && lbSlides.length > 1) lbGoTo(lbCurrent - 1);
    if (e.key === 'ArrowRight' && lbSlides.length > 1) lbGoTo(lbCurrent + 1);
  });

  let lbTouchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { lbTouchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (!lightbox.classList.contains('is-open') || lbSlides.length < 2) return;
    const dx = e.changedTouches[0].clientX - lbTouchStartX;
    if (Math.abs(dx) < 40) return;
    lbGoTo(dx < 0 ? lbCurrent + 1 : lbCurrent - 1);
  }, { passive: true });

  /* Project image expand / pan / collapse */
  const isMobile = () => window.matchMedia('(hover: none)').matches;

  document.querySelectorAll('.project-card__media').forEach(media => {
    const card = media.closest('.project-card');

    /* Active-image getter — carousel-aware */
    const getActiveImg = () =>
      media.querySelector('img.carousel__active') || media.querySelector('img');

    /* Carousel (auto-activates when media has > 1 img) */
    const slides = [...media.querySelectorAll('img')];
    let carouselCurrent = 0;
    if (slides.length > 1) {
      media.classList.add('is-carousel');
      slides[0].classList.add('carousel__active');

      const prevBtn = document.createElement('button');
      prevBtn.className = 'carousel__arrow carousel__arrow--prev';
      prevBtn.setAttribute('type', 'button');
      prevBtn.setAttribute('aria-label', 'Previous image');
      prevBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;

      const nextBtn = document.createElement('button');
      nextBtn.className = 'carousel__arrow carousel__arrow--next';
      nextBtn.setAttribute('type', 'button');
      nextBtn.setAttribute('aria-label', 'Next image');
      nextBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

      const dotsEl = document.createElement('div');
      dotsEl.className = 'carousel__dots';
      const dots = slides.map((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('type', 'button');
        dot.setAttribute('aria-label', `Image ${i + 1}`);
        dotsEl.appendChild(dot);
        return dot;
      });

      function goTo(idx) {
        slides[carouselCurrent].classList.remove('carousel__active');
        slides[carouselCurrent].style.objectPosition = '';
        dots[carouselCurrent].classList.remove('active');
        carouselCurrent = ((idx % slides.length) + slides.length) % slides.length;
        slides[carouselCurrent].classList.add('carousel__active');
        dots[carouselCurrent].classList.add('active');
      }

      prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(carouselCurrent - 1); });
      nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(carouselCurrent + 1); });
      dots.forEach((dot, i) => dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(i); }));

      media.appendChild(prevBtn);
      media.appendChild(nextBtn);
      media.appendChild(dotsEl);
    }

    /* Pill — follows cursor on desktop, pinned on touch via CSS */
    const pill = document.createElement('span');
    pill.className = 'img-expand-pill';
    pill.setAttribute('data-i18n', 'proj.expandHint');
    pill.textContent = translations[currentLang]?.['proj.expandHint'] ?? 'Expand image';
    media.appendChild(pill);

    media.addEventListener('mousemove', (e) => {
      if (card.classList.contains('img-expanded')) return;
      const rect = media.getBoundingClientRect();
      pill.style.left = (e.clientX - rect.left) + 'px';
      pill.style.top  = (e.clientY - rect.top)  + 'px';
    });

    /* Pan via object-position when expanded (desktop) */
    card.addEventListener('mousemove', (e) => {
      if (!card.classList.contains('img-expanded')) return;
      const img = getActiveImg();
      if (!img) return;
      const rect = card.getBoundingClientRect();
      img.style.objectPosition = `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`;
    });


    /* Click: lightbox on mobile, flex-grow expand on desktop */
    media.addEventListener('click', () => {
      if (isMobile()) {
        const lbSet = slides.length > 1
          ? slides.map(s => ({ src: s.src, alt: s.alt }))
          : [{ src: getActiveImg()?.src ?? '', alt: getActiveImg()?.alt ?? '' }];
        openLightbox(lbSet, carouselCurrent);
        return;
      }
      if (!card.classList.contains('img-expanded')) {
        card.style.height = card.offsetHeight + 'px';
        card.classList.add('img-expanded');
      } else {
        card.classList.remove('img-expanded');
        media.querySelectorAll('img').forEach(img => img.style.objectPosition = '');
        const releaseHeight = (e) => {
          if (e.propertyName === 'flex-grow') {
            card.style.height = '';
            media.removeEventListener('transitionend', releaseHeight);
          }
        };
        media.addEventListener('transitionend', releaseHeight);
      }
    });
  });

  /* Mobile "See more" for all project cards */
  document.querySelectorAll('.project-card').forEach(card => {
    const body = card.querySelector('.project-card__body');
    if (!body) return;
    const readMoreBtn = document.createElement('button');
    readMoreBtn.className = 'mobile-read-more-btn';
    readMoreBtn.setAttribute('type', 'button');
    readMoreBtn.setAttribute('data-i18n', 'proj.mobileReadMore');
    readMoreBtn.textContent = translations[currentLang]?.['proj.mobileReadMore'] ?? 'See more';
    body.appendChild(readMoreBtn);
    readMoreBtn.addEventListener('click', () => {
      const expanded = card.classList.toggle('text-expanded');
      const key = expanded ? 'proj.mobileReadLess' : 'proj.mobileReadMore';
      readMoreBtn.setAttribute('data-i18n', key);
      readMoreBtn.textContent = translations[currentLang]?.[key]
        ?? (expanded ? 'Show less' : 'See more');
    });
  });

  /* Mobile section collapse */
  const collapsibleControls = {};
  [
    { sectionId: 'projects', wrapId: 'projectsCollapseWrap' },
    { sectionId: 'certifications', wrapId: 'certsCollapseWrap' },
  ].forEach(({ sectionId, wrapId }) => {
    const section = document.getElementById(sectionId);
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;

    const mq = window.matchMedia('(max-width: 768px)');
    const fade = document.createElement('div');
    fade.className = 'section-fade';
    fade.setAttribute('aria-hidden', 'true');

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'btn btn--chip btn--sm section-toggle-btn';

    wrap.insertAdjacentElement('afterend', fade);
    fade.insertAdjacentElement('afterend', toggleBtn);

    let stage = 0;
    let fullyExpanded = false;

    function setBtnText(key, fallback) {
      toggleBtn.setAttribute('data-i18n', key);
      toggleBtn.textContent = translations[currentLang]?.[key] ?? fallback;
    }

    function refresh() {
      wrap.classList.toggle('is-collapsible', mq.matches);

      if (!mq.matches) {
        wrap.style.maxHeight = '';
        fade.classList.add('is-hidden');
        toggleBtn.classList.add('is-hidden');
        stage = 0;
        fullyExpanded = false;
        return;
      }

      const baseH = (document.getElementById('education')?.offsetHeight || 0) * 1.5;
      const fullH = wrap.scrollHeight;

      if (!baseH || fullH <= baseH) {
        wrap.style.maxHeight = '';
        fade.classList.add('is-hidden');
        toggleBtn.classList.add('is-hidden');
        return;
      }

      if (!fullyExpanded && fullH <= baseH * (stage + 1)) {
        fullyExpanded = true;
      }

      if (fullyExpanded) {
        wrap.style.maxHeight = '';
        fade.classList.add('is-hidden');
        toggleBtn.classList.remove('is-hidden');
        toggleBtn.classList.remove('btn--chip');
        toggleBtn.classList.add('btn--ghost');
        setBtnText('common.collapseSection', 'Show Less');
        return;
      }

      wrap.style.maxHeight = (baseH * (stage + 1)) + 'px';
      fade.classList.remove('is-hidden');
      toggleBtn.classList.remove('is-hidden');
      toggleBtn.classList.remove('btn--ghost');
      toggleBtn.classList.add('btn--chip');
      setBtnText('common.seeMore', 'Show More');
    }

    toggleBtn.addEventListener('click', () => {
      if (fullyExpanded) {
        fullyExpanded = false;
        stage = 0;
        section.scrollIntoView({ block: 'start', behavior: 'instant' });
      } else {
        stage += 1;
      }
      refresh();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refresh, 150);
    });

    collapsibleControls[sectionId] = {
      refresh,
      reset: () => { stage = 0; fullyExpanded = false; refresh(); },
    };

    refresh();
  });

  /* Cert card image lightbox */
  document.querySelectorAll('.cert-card__img-wrap').forEach(wrap => {
    wrap.style.cursor = 'zoom-in';

    const pill = document.createElement('span');
    pill.className = 'img-expand-pill';
    pill.setAttribute('data-i18n', 'proj.expandHint');
    pill.textContent = translations[currentLang]?.['proj.expandHint'] ?? 'Expand image';
    wrap.appendChild(pill);

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      pill.style.left = (e.clientX - rect.left) + 'px';
      pill.style.top  = (e.clientY - rect.top)  + 'px';
    });

    wrap.addEventListener('click', () => {
      const img = wrap.querySelector('img');
      if (img) openLightbox([{ src: img.src, alt: img.alt }], 0);
    });
  });

  /* Certifications & Achievements tag filter */
  const tagFilterEl = document.getElementById('tagFilter');
  const certsGrid   = document.getElementById('certsGrid');

  if (tagFilterEl && certsGrid) {
    const CATEGORIES = ['Certification', 'Competition', 'Organisation', 'Training'];

    const allTags = new Set();
    certsGrid.querySelectorAll('[data-tags]').forEach(card => {
      try {
        JSON.parse(card.getAttribute('data-tags')).forEach(t => allTags.add(t));
      } catch (_) {}
    });

    const categoryTags = CATEGORIES.filter(c => allTags.has(c));
    const topicTags = [...allTags].filter(t => !CATEGORIES.includes(t)).sort();

    const activeTagSet = new Set();

    function makeChip(tag) {
      const chip = document.createElement('button');
      chip.className = 'tag-chip';
      chip.textContent = tag;
      chip.setAttribute('type', 'button');
      chip.dataset.tag = tag;
      chip.addEventListener('click', () => {
        if (activeTagSet.has(tag)) {
          activeTagSet.delete(tag);
          chip.classList.remove('active');
        } else {
          activeTagSet.add(tag);
          chip.classList.add('active');
        }
        filterCards();
      });
      return chip;
    }

    function makeLabel(text) {
      const label = document.createElement('span');
      label.className = 'tag-filter__group-label';
      label.textContent = text;
      return label;
    }

    tagFilterEl.appendChild(makeLabel('Categories'));
    categoryTags.forEach(tag => tagFilterEl.appendChild(makeChip(tag)));
    tagFilterEl.appendChild(makeLabel('Topics'));
    topicTags.forEach(tag => tagFilterEl.appendChild(makeChip(tag)));

    function alignCertTitles() {
      const cards = [...certsGrid.querySelectorAll('.cert-card:not(.hidden)')];

      const fields = ['.cert-card__title', '.cert-card__issuer'];

      fields.forEach(sel => {
        cards.forEach(card => {
          const el = card.querySelector(sel);
          if (el) el.style.minHeight = '';
        });

        const rows = new Map();
        cards.forEach(card => {
          const el = card.querySelector(sel);
          if (!el) return;
          const top = Math.round(card.getBoundingClientRect().top);
          if (!rows.has(top)) rows.set(top, []);
          rows.get(top).push(el);
        });

        rows.forEach(group => {
          const max = Math.max(...group.map(el => el.offsetHeight));
          group.forEach(el => { el.style.minHeight = max + 'px'; });
        });
      });
    }

    function filterCards() {
      certsGrid.querySelectorAll('[data-tags]').forEach(card => {
        if (activeTagSet.size === 0) {
          card.classList.remove('hidden');
          return;
        }
        let cardTags;
        try { cardTags = JSON.parse(card.getAttribute('data-tags')); }
        catch (_) { cardTags = []; }

        const matches = [...activeTagSet].every(t => cardTags.includes(t));
        card.classList.toggle('hidden', !matches);
      });
      alignCertTitles();
      collapsibleControls.certifications?.reset();
    }

    alignCertTitles();
    window.addEventListener('load', alignCertTitles);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(alignCertTitles, 150);
    });
  }

});
