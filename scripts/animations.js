document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.contact-link').forEach(el => {
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.classList.add('visible');
  });
});

/**
 * animations.js — Scroll-triggered animations & micro-interactions
 * Fully isolated. No dependencies on other JS files.
 * Handles:
 *  - IntersectionObserver reveal for all sections
 *  - Skill bar fill animation with spring overshoot
 *  - Staggered tag cloud entrance
 *  - Staggered spec card entrance
 *  - Tilt parallax on project cards (±6deg)
 *  - Magnetic buttons (5px shift within 70px)
 *  - Featured card cursor glow on mousemove
 *  - Project filter bar
 */

(function AnimationsModule() {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────
  const TILT_MAX      = 6;    // degrees
  const MAG_RADIUS    = 70;   // px — magnetic effect radius
  const MAG_STRENGTH  = 5;    // px max shift

  let prefersReducedMotion = false;

  // ── Reduced motion ────────────────────────────────────────────────────────
  function checkReducedMotion() {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ── Generic reveal observer ───────────────────────────────────────────────
  function initRevealObserver() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (prefersReducedMotion) {
      targets.forEach(el => el.classList.add('visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(el => obs.observe(el));
  }

  // ── Section-specific reveal observers ────────────────────────────────────
  function initSectionReveals() {
    // Common targets that use the 'revealed' class
    const revealTargets = [
      { selector: '.section-header',      threshold: 0.2,  rootMargin: '0px 0px -40px 0px' },
      { selector: '.about-avatar-card',   threshold: 0.2,  rootMargin: '0px 0px -40px 0px' },
      { selector: '.about-manifesto',     threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
      { selector: '.timeline-entry',      threshold: 0.15, rootMargin: '0px 0px -30px 0px' },
      { selector: '.edu-card',            threshold: 0.2,  rootMargin: '0px 0px -30px 0px' },
      { selector: '.proj-featured',       threshold: 0.1,  rootMargin: '0px 0px -40px 0px' },
      { selector: '.proj-card',           threshold: 0.12, rootMargin: '0px 0px -30px 0px' },
      { selector: '.contact-left',        threshold: 0.2,  rootMargin: '0px 0px -40px 0px' },
      { selector: '.contact-right',       threshold: 0.2,  rootMargin: '0px 0px -40px 0px' },
    ];

    revealTargets.forEach(({ selector, threshold, rootMargin }) => {
      const els = document.querySelectorAll(selector);
      if (!els.length) return;

      if (prefersReducedMotion) {
        els.forEach(el => el.classList.add('revealed'));
        return;
      }

      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger siblings within the same parent
            const siblings = Array.from(
              entry.target.parentElement?.querySelectorAll(selector) || [entry.target]
            );
            const idx = siblings.indexOf(entry.target);
            const delay = idx * 80;

            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);

            obs.unobserve(entry.target);
          }
        });
      }, { threshold, rootMargin });

      els.forEach(el => obs.observe(el));
    });
  }

  // ── Skill bars ────────────────────────────────────────────────────────────
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');
    if (!bars.length) return;

    if (prefersReducedMotion) {
      bars.forEach(bar => {
        const target = bar.getAttribute('data-pct') || '0';
        bar.style.width = target + '%';
      });
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar    = entry.target;
          const target = parseFloat(bar.getAttribute('data-pct') || '0');

          // Step 1: Animate to target + 4% (overshoot)
          bar.style.transition = 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
          bar.style.width = (target + 4) + '%';

          // Step 2: Spring back to real value
          setTimeout(() => {
            bar.style.transition = 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            bar.style.width = target + '%';
          }, 820);

          obs.unobserve(bar);
        }
      });
    }, { threshold: 0.5 });

    bars.forEach(bar => obs.observe(bar));
  }

  // ── Staggered spec cards ──────────────────────────────────────────────────
  function initSpecCards() {
    const cards = document.querySelectorAll('.spec-card');
    if (!cards.length) return;

    if (prefersReducedMotion) {
      cards.forEach(el => el.classList.add('revealed'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cards  = Array.from(entry.target.parentElement?.querySelectorAll('.spec-card') || [entry.target]);
          const idx    = cards.indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, idx * 80);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });

    cards.forEach(el => obs.observe(el));
  }

  // ── Staggered tool tags ───────────────────────────────────────────────────
  function initToolTags() {
    const tags = document.querySelectorAll('.tool-tag');
    if (!tags.length) return;

    if (prefersReducedMotion) {
      tags.forEach(el => el.classList.add('revealed'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      // When the container becomes visible, stagger all tags within it
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const allTags = Array.from(entry.target.querySelectorAll('.tool-tag'));
          allTags.forEach((tag, i) => {
            setTimeout(() => tag.classList.add('revealed'), i * 45);
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const container = document.querySelector('.tool-tags');
    if (container) obs.observe(container);

    // Also handle individually
    const soloObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement?.querySelectorAll('.tool-tag') || []);
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('revealed'), idx * 45);
          soloObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    tags.forEach(tag => {
      if (!tag.closest('.tool-tags')) soloObs.observe(tag);
    });
  }

  // ── Currently pills stagger ───────────────────────────────────────────────
  function initCurrentlyPills() {
    const pills = document.querySelectorAll('.currently-pill');
    if (!pills.length) return;

    if (prefersReducedMotion) {
      pills.forEach(el => el.classList.add('revealed'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement?.querySelectorAll('.currently-pill') || []);
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('revealed'), idx * 60);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    pills.forEach(p => obs.observe(p));
  }

  // ── Tilt parallax on project cards ───────────────────────────────────────
  function initTiltCards() {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.proj-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const nx     = (e.clientX - cx) / (rect.width  / 2);  // -1 to 1
        const ny     = (e.clientY - cy) / (rect.height / 2);  // -1 to 1

        const rotateX = -ny * TILT_MAX;
        const rotateY =  nx * TILT_MAX;

        card.style.transform =
          `translateY(-4px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  }

  // ── Magnetic buttons ──────────────────────────────────────────────────────
  function initMagneticButtons() {
    if (prefersReducedMotion) return;

    const magnets = document.querySelectorAll('.btn[data-magnetic], .magnetic');
    // Also apply to hero CTAs
    const heroCTAs = document.querySelectorAll('.hero-ctas .btn');

    const allMagnets = [...magnets, ...heroCTAs];

    allMagnets.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect   = btn.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = e.clientX - cx;
        const dy     = e.clientY - cy;
        const dist   = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAG_RADIUS) {
          const strength = (1 - dist / MAG_RADIUS);
          const shiftX   = dx * strength * (MAG_STRENGTH / 20);
          const shiftY   = dy * strength * (MAG_STRENGTH / 20);
          btn.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
        }
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ── Featured card cursor glow ─────────────────────────────────────────────
  function initFeaturedCardGlow() {
    if (prefersReducedMotion) return;

    const featured = document.querySelector('.proj-featured');
    const glow     = featured?.querySelector('.proj-featured-glow');
    if (!featured || !glow) return;

    featured.addEventListener('mousemove', (e) => {
      const rect = featured.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = x + 'px';
      glow.style.top  = y + 'px';
    }, { passive: true });
  }

  // ── Project filter bar ────────────────────────────────────────────────────
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projCards  = document.querySelectorAll('.proj-card, .proj-featured');

    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter') || 'all';

        projCards.forEach(card => {
          const category = card.getAttribute('data-category') || '';

          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden');
            // Re-trigger entrance animation
            card.classList.remove('revealed');
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                card.classList.add('revealed');
              });
            });
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  // ── Timeline pulse dots ───────────────────────────────────────────────────
  function initTimelineDots() {
    const dots = document.querySelectorAll('.timeline-dot');
    if (!dots.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('active', entry.isIntersecting);
      });
    }, { threshold: 0.5 });

    dots.forEach(dot => obs.observe(dot));
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    checkReducedMotion();

    initRevealObserver();
    initSectionReveals();
    initSkillBars();
    initSpecCards();
    initToolTags();
    initCurrentlyPills();
    initTiltCards();
    initMagneticButtons();
    initFeaturedCardGlow();
    initProjectFilters();
    initTimelineDots();

    // Respond to reduced motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
    });
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
