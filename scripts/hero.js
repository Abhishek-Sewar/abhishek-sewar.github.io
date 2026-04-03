/**
 * hero.js — Hero section behaviors
 * Fully isolated. No dependencies on other JS files.
 * Handles:
 *  - Page entrance sequence with staggered delays
 *  - Skills ticker 3D card-flip rotation
 *  - Countup stats animation
 *  - Scroll indicator fade after 80px
 *  - Cursor parallax on neural visual (14%)
 */

(function HeroModule() {
  'use strict';

  // ── Skills ticker data ────────────────────────────────────────────────────
  const SKILLS = [
    'LLM Systems & RAG Pipelines',
    'Computer Vision & Perception',
    'Agentic AI & LangChain',
    'Robotics & Sensor Fusion',
    'PyTorch · TensorFlow · HuggingFace',
  ];

  // ── Entrance sequence config ──────────────────────────────────────────────
  // [selector, delay_ms]
  const ENTRANCE_SEQUENCE = [
    ['.hero-badge',      150],
    ['.hero-name',       280],
    ['.hero-role',       400],
    ['.hero-value-prop', 470],
    ['.ticker-wrapper',  560],
    ['.hero-ctas',       680],
    ['.hero-stats',      800],
    ['.hero-right',      950],
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let currentSkillIndex = 0;
  let tickerInterval    = null;
  let prefersReducedMotion = false;

  // ── Reduced motion check ──────────────────────────────────────────────────
  function checkReducedMotion() {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ── Entrance sequence ─────────────────────────────────────────────────────
  function runEntranceSequence() {
    if (prefersReducedMotion) {
      // Skip animation: make everything visible immediately
      document.querySelectorAll('.hero-entrance').forEach(el => {
        el.style.opacity    = '1';
        el.style.transform  = 'none';
      });
      return;
    }

    document.body.classList.add('entrance-ready');

    ENTRANCE_SEQUENCE.forEach(([selector, delay]) => {
      const el = document.querySelector(selector);
      if (!el) return;
      setTimeout(() => {
        el.classList.add('entered');
      }, delay);
    });
  }

  // ── Skills ticker ─────────────────────────────────────────────────────────
  function initTicker() {
    const items = document.querySelectorAll('.ticker-item');
    if (!items.length) return;

    // Show first item immediately
    items[0].classList.add('active');

    if (prefersReducedMotion) return;

    tickerInterval = setInterval(() => {
      const current = items[currentSkillIndex];
      const next    = items[(currentSkillIndex + 1) % items.length];

      // Exit current
      current.classList.remove('active');
      current.classList.add('exiting');

      // After exit transition, remove exiting class
      setTimeout(() => {
        current.classList.remove('exiting');
      }, 550);

      // Enter next
      currentSkillIndex = (currentSkillIndex + 1) % items.length;
      items[currentSkillIndex].classList.add('active');

    }, 2500);
  }

  // ── Countup animation ─────────────────────────────────────────────────────
  function animateCountup(el, target, suffix, duration) {
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    const startTime  = performance.now();
    const targetStr  = String(target);
    const isFloat    = targetStr.includes('.');
    const precision  = isFloat ? (targetStr.split('.')[1] || '').length : 0;

    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out-expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const current = eased * target;
      el.textContent = (isFloat ? current.toFixed(precision) : Math.round(current)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function initStats() {
    const stats = document.querySelectorAll('[data-count]');
    if (!stats.length) return;

    stats.forEach((el, i) => {
      const target   = parseFloat(el.getAttribute('data-count'));
      const suffix   = el.getAttribute('data-suffix') || '';
      const duration = 1200 + i * 150;

      // Delay to match entrance sequence
      setTimeout(() => {
        animateCountup(el, target, suffix, duration);
      }, 800 + i * 80);
    });
  }

  // ── Scroll indicator ──────────────────────────────────────────────────────
  function initScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;

    function check() {
      indicator.classList.toggle('hidden', window.scrollY > 80);
    }

    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  // ── Knowledge graph canvas ────────────────────────────────────────────────
  function initNeuralParallax() {
    (function initKnowledgeGraph() {
      const hero = document.getElementById('hero');
      if (!hero) return;

      const existing = document.getElementById('kg-canvas');
      if (existing) existing.remove();

      const canvas = document.createElement('canvas');
      canvas.id = 'kg-canvas';
      canvas.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: all;
        z-index: 1;
      `;
      hero.style.position = 'relative';
      hero.insertBefore(canvas, hero.firstChild);

      const heroInner = hero.querySelector('.hero-inner');
      if (heroInner) heroInner.style.position = 'relative', heroInner.style.zIndex = '2';

      const ctx = canvas.getContext('2d');
      const ROSE = '244,63,94';
      const DIM = '200,200,200';

      const NODES = [
        { label: 'Python',       group: 'ml',       years: 6, projects: 10 },
        { label: 'PyTorch',      group: 'ml',       years: 5, projects: 6  },
        { label: 'TensorFlow',   group: 'ml',       years: 4, projects: 4  },
        { label: 'HuggingFace',  group: 'ml',       years: 4, projects: 5  },
        { label: 'Scikit-learn', group: 'ml',       years: 5, projects: 4  },
        { label: 'LangChain',    group: 'llm',      years: 3, projects: 3  },
        { label: 'RAG',          group: 'llm',      years: 3, projects: 3  },
        { label: 'GPT-4o',       group: 'llm',      years: 3, projects: 2  },
        { label: 'ChromaDB',     group: 'llm',      years: 3, projects: 3  },
        { label: 'vLLM',         group: 'llm',      years: 3, projects: 1  },
        { label: 'OpenCV',       group: 'cv',       years: 5, projects: 5  },
        { label: 'CNNs',         group: 'cv',       years: 5, projects: 5  },
        { label: 'YOLO',         group: 'cv',       years: 3, projects: 2  },
        { label: 'ROS2',         group: 'robotics', years: 4, projects: 3  },
        { label: 'EKF',          group: 'robotics', years: 4, projects: 2  },
        { label: 'IMU',          group: 'robotics', years: 4, projects: 2  },
        { label: 'Kalman',       group: 'robotics', years: 4, projects: 2  },
        { label: 'Docker',       group: 'mlops',    years: 4, projects: 5  },
        { label: 'GCP',          group: 'mlops',    years: 3, projects: 3  },
        { label: 'FastAPI',      group: 'mlops',    years: 4, projects: 3  },
        { label: 'MLflow',       group: 'mlops',    years: 3, projects: 2  },
        { label: 'Flask',        group: 'mlops',    years: 4, projects: 4  },
      ];

      const CONNECTIONS = [
        ['PyTorch','HuggingFace'],['PyTorch','CNNs'],['TensorFlow','CNNs'],
        ['HuggingFace','LangChain'],['HuggingFace','RAG'],['LangChain','ChromaDB'],
        ['LangChain','GPT-4o'],['RAG','ChromaDB'],['RAG','GPT-4o'],
        ['vLLM','FastAPI'],['vLLM','Docker'],['OpenCV','CNNs'],
        ['OpenCV','ROS2'],['ROS2','EKF'],['ROS2','IMU'],['EKF','Kalman'],
        ['IMU','Kalman'],['Docker','GCP'],['Docker','FastAPI'],
        ['Flask','FastAPI'],['MLflow','Docker'],['Python','PyTorch'],
        ['Python','TensorFlow'],['Python','Flask'],['Python','FastAPI'],
        ['GCP','MLflow'],['Scikit-learn','Python'],
      ];

      function resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = hero.offsetWidth;
        const h = hero.offsetHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        initPositions();
      }

      function initPositions() {
        NODES.forEach(n => {
          if (!n.x) {
            n.x  = Math.random() * canvas.width;
            n.y  = Math.random() * canvas.height;
            n.vx = (Math.random() - 0.5) * 0.4;
            n.vy = (Math.random() - 0.5) * 0.4;
          }
          n.r = 5;
          n.highlighted = false;
          n.dimmed = false;
        });
      }

      let selectedNode = null;
      let hoveredNode = null;
      let mouse = { x: -999, y: -999 };

      canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        hoveredNode = getNodeAt(mouse.x, mouse.y);
        canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
      });

      canvas.addEventListener('click', e => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const clicked = getNodeAt(x, y);

        if (!clicked) {
          selectedNode = null;
          NODES.forEach(n => { n.highlighted = false; n.dimmed = false; });
          return;
        }

        if (clicked === selectedNode) {
          selectedNode = null;
          NODES.forEach(n => { n.highlighted = false; n.dimmed = false; });
          return;
        }

        selectedNode = clicked;
        const connected = new Set([clicked.label]);
        CONNECTIONS.forEach(([a, b]) => {
          if (a === clicked.label) connected.add(b);
          if (b === clicked.label) connected.add(a);
        });
        NODES.forEach(n => {
          n.highlighted = connected.has(n.label);
          n.dimmed = !connected.has(n.label);
        });
      });

      function getNodeAt(x, y) {
        return NODES.find(n => Math.hypot(n.x - x, n.y - y) < n.r + 14) || null;
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isDark = document.body.classList.contains('dark');
        const baseAlpha = isDark ? 0.12 : 0.08;

        CONNECTIONS.forEach(([a, b]) => {
          const na = NODES.find(n => n.label === a);
          const nb = NODES.find(n => n.label === b);
          if (!na || !nb) return;
          const isHighlighted = selectedNode && na.highlighted && nb.highlighted;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          if (isHighlighted) {
            ctx.strokeStyle = `rgba(${ROSE},0.6)`;
            ctx.lineWidth = 1.2;
          } else if (selectedNode) {
            ctx.strokeStyle = `rgba(${DIM},0.04)`;
            ctx.lineWidth = 0.5;
          } else {
            ctx.strokeStyle = `rgba(${ROSE},${baseAlpha + 0.06})`;
            ctx.lineWidth = 0.7;
          }
          ctx.stroke();
        });

        NODES.forEach(n => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 20 || n.x > canvas.width  - 20) n.vx *= -1;
          if (n.y < 20 || n.y > canvas.height - 20) n.vy *= -1;

          const hovered = Math.hypot(n.x - mouse.x, n.y - mouse.y) < n.r + 8;
          const r = hovered ? n.r + 3 : n.r;

          if (n.highlighted) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${ROSE},0.1)`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${ROSE},0.95)`;
            ctx.fill();
          } else if (n.dimmed) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${DIM},0.1)`;
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = selectedNode
              ? `rgba(${DIM},0.15)`
              : `rgba(${ROSE},${baseAlpha + 0.25})`;
            ctx.fill();
          }

          ctx.font = `500 11px 'Plus Jakarta Sans', sans-serif`;
          ctx.textAlign = 'center';
          if (n.highlighted) {
            ctx.fillStyle = `rgba(${ROSE},1)`;
          } else if (n.dimmed) {
            ctx.fillStyle = `rgba(${DIM},0.2)`;
          } else {
            ctx.fillStyle = isDark
              ? `rgba(255,255,255,${selectedNode ? 0.1 : 0.35})`
              : `rgba(80,80,80,${selectedNode ? 0.1 : 0.5})`;
          }
          ctx.fillText(n.label, n.x, n.y - r - 6);
        });

        if (hoveredNode) {
          const n = hoveredNode;
          const isDark = document.body.classList.contains('dark');
          const pad = 14;
          const line1 = n.label;
          const line2 = `${n.years} yrs · ${n.projects} projects`;

          ctx.font = `600 13px 'Plus Jakarta Sans', sans-serif`;
          const w1 = ctx.measureText(line1).width;
          ctx.font = `400 11px 'Plus Jakarta Sans', sans-serif`;
          const w2 = ctx.measureText(line2).width;

          const boxW = Math.max(w1, w2) + pad * 2;
          const boxH = 52;
          let tx = n.x + 16;
          let ty = n.y - boxH - 8;
          if (tx + boxW > canvas.width - 10) tx = n.x - boxW - 16;
          if (ty < 10) ty = n.y + 16;

          const bg = isDark ? '#1A1A1A' : '#FFFFFF';
          const borderCol = isDark ? 'rgba(244,63,94,0.35)' : 'rgba(244,63,94,0.25)';
          const textPrimary = isDark ? '#F0F0F0' : '#0A0A0A';
          const textMuted = isDark ? '#888888' : '#6B7280';

          ctx.save();
          ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)';
          ctx.shadowBlur = 16;
          ctx.shadowOffsetY = 4;
          ctx.beginPath();
          ctx.roundRect(tx, ty, boxW, boxH, 10);
          ctx.fillStyle = bg;
          ctx.fill();
          ctx.restore();

          ctx.beginPath();
          ctx.roundRect(tx, ty, boxW, boxH, 10);
          ctx.strokeStyle = borderCol;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.save();
          ctx.font = `600 13px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillStyle = textPrimary;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(line1, tx + pad, ty + 22);

          ctx.font = `400 11px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillStyle = textMuted;
          ctx.fillText(line2, tx + pad, ty + 38);
          ctx.restore();
        }

        requestAnimationFrame(draw);
      }

      resize();
      window.addEventListener('resize', resize);
      draw();
    })();
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    checkReducedMotion();
    runEntranceSequence();
    initTicker();
    initStats();
    initScrollIndicator();
    initNeuralParallax();

    // Listen for reduced motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
      if (e.matches && tickerInterval) {
        clearInterval(tickerInterval);
        tickerInterval = null;
      }
    });
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
