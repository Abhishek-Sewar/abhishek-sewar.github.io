(function () {
  const style = document.createElement('style');
  style.textContent = `
    * { cursor: none !important; }
    a, button, .btn, .proj-card, .filter-btn, .nav-logo,
    .contact-link, .spec-card, .tag { cursor: pointer !important; }
    #cursor {
      position: fixed;
      top: 0;
      left: 0;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #0A0A0A;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: opacity 0.08s ease, transform 0.15s ease, width 0.15s ease, height 0.15s ease, background 0.15s ease;
    }
    #cursor.on-link {
      width: 8px;
      height: 8px;
      background: #F43F5E;
    }
    #cursor.on-dark {
      background: #ffffff;
    }
    #cursor.clicked {
      transform: translate(-50%, -50%) scale(0.5);
    }
    .ripple {
      position: fixed;
      border-radius: 50%;
      border: 1px solid rgba(244,63,94,0.4);
      pointer-events: none;
      z-index: 9998;
      animation: ripple-out 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
    }
    @keyframes ripple-out {
      0%   { width: 0px;  height: 0px;  opacity: 0.5; transform: translate(-50%,-50%); }
      100% { width: 44px; height: 44px; opacity: 0;   transform: translate(-50%,-50%); }
    }
  `;
  document.head.appendChild(style);

  const cursor = document.createElement('div');
  cursor.id = 'cursor';
  document.body.appendChild(cursor);

  let mx = 0, my = 0, cx = 0, cy = 0;
  let onLink = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  const clickableSelectors = 'a, button, .btn, .proj-card, .filter-btn, .nav-logo, .contact-link, .spec-card, .tag';

  document.addEventListener('mousemove', e => {
    const isClickable = e.target.closest('a, button, .btn, .proj-card, .proj-card *, .filter-btn, .nav-logo, .contact-link, .spec-card, .spec-card *, .tag, .tl-card, .edu-card');
    if (isClickable) {
      if (cursor.style.opacity !== '0') {
        cursor.style.opacity = '0';
        document.body.style.cursor = 'pointer';
      }
    } else {
      if (cursor.style.opacity !== '1') {
        cursor.style.opacity = '1';
        document.body.style.cursor = 'none';
      }
    }
  });

  document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('clicked'));

  document.addEventListener('click', e => {
    const ring = document.createElement('div');
    ring.className = 'ripple';
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
    document.body.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove());
  });

  function updateDark() {
    if (cursor.classList.contains('on-link')) {
      cursor.style.background = '#F43F5E';
      return;
    }
    const isDarkMode = document.body.classList.contains('dark');
    const over = document.elementFromPoint(mx, my);
    const el = over ? (over.closest('#contact-wrap, footer') || over.closest('section') || over) : document.body;
    const bg = window.getComputedStyle(el).backgroundColor;
    const rgb = bg.match(/\d+/g);
    if (!rgb) { cursor.style.background = isDarkMode ? '#FFFFFF' : '#0A0A0A'; return; }
    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
    cursor.style.background = brightness > 128 ? '#0A0A0A' : '#FFFFFF';
  }

  window.addEventListener('mouseleave', () => cursor.style.opacity = '0');
  window.addEventListener('mouseenter', () => cursor.style.opacity = '1');

  function tick() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    updateDark();
    requestAnimationFrame(tick);
  }
  tick();
})();
