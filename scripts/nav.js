/**
 * nav.js — Navigation behaviors
 * Fully isolated. No dependencies on other JS files.
 * Handles:
 *  - Frosted glass on scroll (60px threshold)
 *  - Reading progress bar
 *  - Active link tracking via IntersectionObserver
 *  - Hamburger menu toggle (mobile)
 *  - Smooth scroll on nav link click
 */

(function NavModule() {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────
  const SCROLL_THRESHOLD = 60;   // px before navbar frosts
  const SECTIONS = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];

  // ── Elements ─────────────────────────────────────────────────────────────
  let navbar, progressBar, navLinks, hamburger, navLinksContainer;
  let isMobileOpen = false;

  // ── Frosted glass ─────────────────────────────────────────────────────────
  function updateNavStyle() {
    const scrollY = window.scrollY;
    if (!navbar) return;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    const contact = document.querySelector('#contact-wrap, [id*="contact"], section:last-of-type');
    if (contact) {
      const rect = contact.getBoundingClientRect();
      if (rect.top < 100) {
        navbar.classList.add('on-contact');
      } else {
        navbar.classList.remove('on-contact');
      }
    }
  }

  // ── Reading progress bar ─────────────────────────────────────────────────
  function updateProgressBar() {
    const docEl  = document.documentElement;
    const scrollTop  = window.scrollY || docEl.scrollTop;
    const docHeight  = docEl.scrollHeight - docEl.clientHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  // ── Active section tracking ───────────────────────────────────────────────
  function initSectionObserver() {
    const sectionEls = SECTIONS
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (!sectionEls.length || !navLinks.length) return;

    const sectionMap = new Map();
    sectionEls.forEach(el => sectionMap.set(el.id, el));

    // Track which sections are intersecting with their ratio
    const visibilityMap = new Map();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        visibilityMap.set(entry.target.id, entry.intersectionRatio);
      });

      // Pick the section with the highest visible ratio
      let topId = null;
      let topRatio = 0;
      visibilityMap.forEach((ratio, id) => {
        if (ratio > topRatio) {
          topRatio = ratio;
          topId = id;
        }
      });

      if (topId) {
        navLinks.forEach(link => {
          const target = link.getAttribute('data-section') || link.getAttribute('href')?.replace('#', '');
          link.classList.toggle('active', target === topId);
        });
      }
    }, {
      threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0],
      rootMargin: `-${60}px 0px -40% 0px`
    });

    sectionEls.forEach(el => observer.observe(el));
  }

  // ── Scroll handler ────────────────────────────────────────────────────────
  function onScroll() {
    updateNavStyle();
    updateProgressBar();
  }

  // ── Hamburger toggle ──────────────────────────────────────────────────────
  function toggleMobileMenu() {
    isMobileOpen = !isMobileOpen;
    hamburger.classList.toggle('open', isMobileOpen);
    navLinksContainer.classList.toggle('mobile-open', isMobileOpen);
    hamburger.setAttribute('aria-expanded', String(isMobileOpen));
    hamburger.setAttribute('aria-label', isMobileOpen ? 'Close navigation' : 'Open navigation');
  }

  function closeMobileMenu() {
    if (isMobileOpen) {
      isMobileOpen = false;
      hamburger.classList.remove('open');
      navLinksContainer.classList.remove('mobile-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  // ── Smooth scroll on link click ───────────────────────────────────────────
  function onNavLinkClick(e) {
    const link = e.target.closest('.nav-link');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;

    closeMobileMenu();

    // Scroll with offset for navbar height
    const navH = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    navbar          = document.getElementById('navbar');
    progressBar     = document.getElementById('progress-bar');
    navLinksContainer = document.querySelector('.nav-links');
    hamburger       = document.querySelector('.hamburger');
    navLinks        = Array.from(document.querySelectorAll('.nav-link'));

    if (!navbar) return;

    // Initial state
    updateNavStyle();
    updateProgressBar();

    // Scroll events — passive for performance
    window.addEventListener('scroll', onScroll, { passive: true });

    // Active section tracking
    initSectionObserver();

    // Hamburger
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Mobile overlay click-outside to close
    document.addEventListener('click', (e) => {
      if (
        isMobileOpen &&
        !navLinksContainer.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    // Smooth scroll on nav links
    if (navLinksContainer) {
      navLinksContainer.addEventListener('click', onNavLinkClick);
    }

    // Also handle logo click → top
    const logo = document.querySelector('.nav-logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeMobileMenu();
      });
    }

    // Close mobile menu on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    }, { passive: true });
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

(function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const sun = document.getElementById('icon-sun');
  const moon = document.getElementById('icon-moon');
  if (!btn) return;
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
    sun.style.display = 'block';
    moon.style.display = 'none';
  }
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    sun.style.display = isDark ? 'block' : 'none';
    moon.style.display = isDark ? 'none' : 'block';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
})();
