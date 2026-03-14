/* ═══════════════════════════════════════════════════════════
   QTEA DUBLIN — Interactive Behaviors
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── LOADING SCREEN ──────────────────────────────────── */
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  document.body.classList.add('loading');

  const LOAD_DURATION = 1200;
  const loadStart = performance.now();
  let loadRAF;

  function updateLoaderBar() {
    const elapsed = performance.now() - loadStart;
    const progress = Math.min(elapsed / LOAD_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    if (loaderBar) loaderBar.style.width = (eased * 100) + '%';

    if (progress < 1) {
      loadRAF = requestAnimationFrame(updateLoaderBar);
    } else {
      dismissLoader();
    }
  }

  function dismissLoader() {
    if (loader) loader.classList.add('done');
    document.body.classList.remove('loading');
  }

  loadRAF = requestAnimationFrame(updateLoaderBar);


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


  /* ─── ORB RANDOMIZATION & CURSOR INTERACTION ──────────── */
  const orbs = document.querySelectorAll('.hero__orb');
  const orbData = [];

  orbs.forEach(function (orb) {
    const top = Math.random() * 80;
    const left = Math.random() * 80;
    const floatDuration = 8 + Math.random() * 8;
    const floatDelay = Math.random() * -floatDuration;

    orb.style.top = top + '%';
    orb.style.left = left + '%';

    orbData.push({
      el: orb,
      baseX: 0,
      baseY: 0,
      currentX: 0,
      currentY: 0,
      floatDuration: floatDuration,
      floatDelay: floatDelay,
    });
  });

  let mouseX = 0;
  let mouseY = 0;
  let heroRect = null;

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroRect = heroSection.getBoundingClientRect();

    heroSection.addEventListener('mousemove', function (e) {
      heroRect = heroSection.getBoundingClientRect();
      mouseX = (e.clientX - heroRect.left) / heroRect.width - 0.5;
      mouseY = (e.clientY - heroRect.top) / heroRect.height - 0.5;
    });

    heroSection.addEventListener('mouseleave', function () {
      mouseX = 0;
      mouseY = 0;
    });
  }

  function animateOrbs() {
    var now = performance.now() / 1000;
    orbData.forEach(function (data, i) {
      var floatY = Math.sin((now + data.floatDelay) * (2 * Math.PI / data.floatDuration)) * 15;
      var floatX = Math.cos((now + data.floatDelay) * (2 * Math.PI / (data.floatDuration * 1.3))) * 8;

      var strength = (i % 2 === 0) ? 80 : -60;
      var targetX = floatX + mouseX * strength;
      var targetY = floatY + mouseY * strength;

      data.currentX += (targetX - data.currentX) * 0.06;
      data.currentY += (targetY - data.currentY) * 0.04;

      data.el.style.transform = 'translate3d(' + data.currentX.toFixed(1) + 'px, ' + data.currentY.toFixed(1) + 'px, 0)';
    });
    requestAnimationFrame(animateOrbs);
  }

  requestAnimationFrame(animateOrbs);


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


  /* ─── CARD TILT MICRO-INTERACTION ────────────────────── */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach((card) => {
    card.addEventListener('click', () => {
      const order = document.getElementById('order');
      if (!order) return;
      const navHeight = nav.offsetHeight;
      window.scrollTo({
        top: order.getBoundingClientRect().top + window.scrollY - navHeight,
        behavior: 'smooth',
      });
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;

      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  });


  /* ─── BUTTON MOUSE-FOLLOW GLOW ────────────────────────── */
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      btn.style.setProperty('--btn-x', (e.clientX - rect.left) + 'px');
      btn.style.setProperty('--btn-y', (e.clientY - rect.top) + 'px');
    });
  });


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


  /* ─── HERO ENTRANCE ANIMATION (GSAP) ────────────────── */
  function heroEntrance() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.set('.hero__content .reveal', { opacity: 0, y: 40 });

    tl.to('.hero__content .reveal', {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.15,
      delay: 0.3,
      onComplete: function () {
        document.querySelectorAll('.hero__content .reveal').forEach((el) => {
          el.classList.add('visible');
          el.style.transform = '';
          el.style.opacity = '';
        });
      },
    });
  }

  if (document.readyState === 'complete') {
    heroEntrance();
  } else {
    window.addEventListener('load', heroEntrance);
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
  const EXTENSIONS = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'webp'];
  const MAX_IMAGES = 20;

  function initCarousel() {
    const carousel = document.getElementById('carousel');
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    const placeholder = document.querySelector('.about__art');
    if (!carousel || !track) return;

    const loaded = [];
    const found = new Set();
    let probeCount = 0;
    const totalProbes = MAX_IMAGES * EXTENSIONS.length;

    for (let i = 1; i <= MAX_IMAGES; i++) {
      EXTENSIONS.forEach(function (ext) {
        const src = 'images/' + i + '.' + ext;
        const key = i;
        const img = new Image();
        img.onload = function () {
          if (!found.has(key)) {
            found.add(key);
            loaded.push(src);
          }
          probeCount++;
          if (probeCount === totalProbes) buildCarousel();
        };
        img.onerror = function () {
          probeCount++;
          if (probeCount === totalProbes) buildCarousel();
        };
        img.src = src;
      });
    }

    function buildCarousel() {
      if (loaded.length === 0) return;

      for (let i = loaded.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [loaded[i], loaded[j]] = [loaded[j], loaded[i]];
      }

      loaded.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Qtea Dublin bubble tea house - photo ' + (i + 1);
        img.loading = 'lazy';
        img.draggable = false;
        if (i === 0) img.classList.add('active');
        track.appendChild(img);

        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Image ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });

      if (placeholder) placeholder.classList.add('hidden');
      carousel.classList.add('loaded');

      let current = 0;
      let autoTimer;
      const images = track.querySelectorAll('img');
      const dots = dotsContainer.querySelectorAll('.carousel__dot');
      const prevBtn = document.getElementById('carouselPrev');
      const nextBtn = document.getElementById('carouselNext');

      function goTo(index) {
        images[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = index;
        images[current].classList.add('active');
        dots[current].classList.add('active');
      }

      function next() { goTo((current + 1) % loaded.length); }
      function prev() { goTo((current - 1 + loaded.length) % loaded.length); }

      function resetAuto() {
        clearInterval(autoTimer);
        if (loaded.length > 1) {
          autoTimer = setInterval(next, 4000);
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
  }

  initCarousel();

})();
