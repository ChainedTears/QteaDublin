/* ═══════════════════════════════════════════════════════════
   QTEA DUBLIN — Interactive Behaviors
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── INTRO / LOADING SCREEN ──────────────────────────── */
  // The full wordmark intro plays once per browser session; reloads after
  // that get a quick fade so returning visitors aren't kept waiting.
  const loader = document.getElementById('loader');
  const INTRO_KEY = 'qtea-intro-seen';
  const INTRO_DURATION = 2300;
  const QUICK_DURATION = 250;
  const FONT_WAIT_MAX = 900;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introSeen = false;
  try { introSeen = sessionStorage.getItem(INTRO_KEY) === '1'; } catch (e) {}
  const quickIntro = introSeen || reduceMotion;

  document.body.classList.add('loading');
  document.querySelectorAll('.hero-reveal').forEach((el) => el.classList.add('hero-animate'));

  function dismissLoader() {
    if (loader) loader.classList.add('done');
    document.body.classList.remove('loading');
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (e) {}
    // Let the curtain start lifting before the hero settles in underneath
    setTimeout(heroEntrance, quickIntro ? 0 : 350);
  }

  function playIntro() {
    if (!loader) return heroEntrance();
    if (quickIntro) {
      loader.classList.add('loader--quick', 'is-playing');
      setTimeout(dismissLoader, QUICK_DURATION);
      return;
    }
    loader.classList.add('is-playing');
    setTimeout(dismissLoader, INTRO_DURATION);
  }

  // Wait (briefly) for Newsreader so the wordmark doesn't animate in a fallback font
  const fontReady = document.fonts && document.fonts.load
    ? document.fonts.load('300 64px "Newsreader"').catch(() => {})
    : Promise.resolve();
  const fontTimeout = new Promise((resolve) => setTimeout(resolve, quickIntro ? 0 : FONT_WAIT_MAX));
  Promise.race([fontReady, fontTimeout]).then(playIntro);


  /* ─── DOM REFERENCES ─────────────────────────────────── */
  const html = document.documentElement;
  const nav = document.getElementById('nav');
  const themeToggle = document.getElementById('themeToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const heroBg = document.getElementById('heroBg');

  /* ─── THEME MANAGEMENT ───────────────────────────────── */
  const THEME_KEY = 'qtea-theme';

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  setTheme(getPreferredTheme());

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });


  /* ─── MOBILE MENU ────────────────────────────────────── */
  function toggleMobileMenu() {
    const isActive = mobileMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
  }

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });


  /* ─── NAVBAR HIDE/SHOW ON SCROLL ─────────────────────── */
  let lastScrollY = 0;
  let ticking = false;

  function updateNav() {
    const scrollY = window.scrollY;
    const scrollingDown = scrollY > lastScrollY && scrollY > 100;

    if (scrollingDown) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });


  /* ─── PARALLAX EFFECT ────────────────────────────────── */
  let parallaxTicking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight;

    if (scrollY < heroHeight * 1.5 && heroBg) {
      const translateY = scrollY * 0.35;
      const opacity = 1 - scrollY / heroHeight;
      heroBg.style.transform = `translate3d(0, ${translateY}px, 0)`;
      heroBg.style.opacity = Math.max(0, opacity);
    }

    parallaxTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }, { passive: true });


  /* ─── INTERSECTION OBSERVER: REVEAL ON SCROLL ────────── */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-up');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || 0, 10);
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));


  /* ─── COUNTER ANIMATION ──────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.round(eased * target);

      el.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }


  /* ─── SMOOTH ANCHOR SCROLLING ────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      e.preventDefault();

      const navHeight = nav.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });


  /* ─── HERO ENTRANCE ANIMATION (CSS-driven, no GSAP dependency) ── */
  // Called by dismissLoader(); elements were given .hero-animate up front
  function heroEntrance() {
    const heroReveals = document.querySelectorAll('.hero-reveal');
    void document.body.offsetHeight;

    heroReveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 130);
    });
  }


  /* ─── PERFORMANCE: DISABLE HOVER ON SCROLL ───────────── */
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    document.body.style.pointerEvents = 'none';
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      document.body.style.pointerEvents = '';
    }, 150);
  }, { passive: true });


  /* ─── IMAGE CAROUSEL ─────────────────────────────────── */
  // Curated and ordered by hand: alternate drinks and food, best shot first.
  // To add a photo, drop a 4:5 image (800×1000 works well) into images/
  // and add a line here.
  const PHOTOS = [
    { src: 'images/cheese-foam-black-tea.webp', alt: 'Black tea topped with cheese foam' },
    { src: 'images/basil-popcorn-chicken.webp', alt: 'House-made basil popcorn chicken' },
    { src: 'images/taro-milk-tea.webp', alt: 'Taro milk tea with tapioca pearls' },
    { src: 'images/spam-musubi.webp', alt: 'Spam musubi wrapped in nori' },
    { src: 'images/passion-fruit-tea.webp', alt: 'Passion fruit green tea over ice' },
    { src: 'images/egg-waffle-sundae.webp', alt: 'Egg waffle cone filled with soft serve' },
    { src: 'images/thai-tea.webp', alt: 'Layered iced milk tea' },
    { src: 'images/chicken-and-curly-fries.webp', alt: 'Popcorn chicken and curly fries' },
    { src: 'images/black-tea-oreo-smoothie.webp', alt: 'Black tea Oreo smoothie with whipped cream' },
    { src: 'images/egg-waffle.webp', alt: 'Golden egg waffle on a wooden board' },
  ];

  function initCarousel() {
    const carousel = document.getElementById('carousel');
    const track = document.getElementById('carouselTrack');
    const currentLabel = document.getElementById('carouselCurrent');
    const totalLabel = document.getElementById('carouselTotal');
    const placeholder = document.querySelector('.about__art');
    if (!carousel || !track || PHOTOS.length === 0) return;

    PHOTOS.forEach((photo, i) => {
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.width = 800;
      img.height = 1000;
      img.decoding = 'async';
      if (i > 0) img.loading = 'lazy';
      img.draggable = false;
      if (i === 0) {
        img.classList.add('active');
        img.addEventListener('load', reveal, { once: true });
        if (img.complete) reveal();
      }
      track.appendChild(img);
    });

    const pad = (n) => String(n).padStart(2, '0');
    if (totalLabel) totalLabel.textContent = pad(PHOTOS.length);

    function reveal() {
      if (placeholder) placeholder.classList.add('hidden');
      carousel.classList.add('loaded');
    }

    let current = 0;
    let autoTimer;
    const images = track.querySelectorAll('img');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    function goTo(index) {
      images[current].classList.remove('active');
      current = index;
      images[current].classList.add('active');
      if (currentLabel) currentLabel.textContent = pad(current + 1);
    }

    function next() { goTo((current + 1) % PHOTOS.length); }
    function prev() { goTo((current - 1 + PHOTOS.length) % PHOTOS.length); }

    function resetAuto() {
      clearInterval(autoTimer);
      if (PHOTOS.length > 1) {
        autoTimer = setInterval(next, 5000);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => { next(); resetAuto(); });
    }

    resetAuto();
  }

  initCarousel();

})();
