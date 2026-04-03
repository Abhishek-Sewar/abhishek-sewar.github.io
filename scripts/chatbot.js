(function () {
  'use strict';

  const API_URL = 'https://portfolio-chatbot-ten-lyart.vercel.app/api/chat';
  const WELCOME  = "Hi! I'm Abhishek's AI assistant. Ask me anything about his work, projects, or background!";
  const ROSE     = '#F43F5E';
  const FONT     = "'Plus Jakarta Sans', system-ui, sans-serif";

  // ── Styles ────────────────────────────────────────────────────────────────
  const css = `
    /* Force native cursor inside the entire widget */
    #ab-chat-overlay *, #ab-chat-btn {
      cursor: auto !important;
    }
    #ab-chat-overlay button, #ab-send-btn, #ab-close-btn, #ab-chat-btn {
      cursor: pointer !important;
    }
    #ab-input {
      cursor: text !important;
    }
    #ab-send-btn:disabled {
      cursor: not-allowed !important;
    }

    #ab-chat-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9998;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(244, 63, 94, 0.3);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(244, 63, 94, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(244, 63, 94, 0.2);
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    }
    #ab-chat-btn:hover {
      transform: scale(1.08);
      background: rgba(244, 63, 94, 0.45);
      box-shadow: 0 12px 40px rgba(244, 63, 94, 0.35);
    }
    #ab-chat-btn svg { pointer-events: none; }

    #ab-chat-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      padding: 24px;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(4px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s;
      cursor: auto !important;
    }
    #ab-chat-overlay.ab-open {
      opacity: 1;
      pointer-events: all;
    }

    #ab-chat-box {
      font-family: ${FONT};
      width: 380px;
      max-width: calc(100vw - 48px);
      height: 560px;
      max-height: calc(100vh - 48px);
      background: rgba(15, 15, 15, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.7);
      transform: translateY(20px) scale(0.97);
      transition: transform 0.22s;
      cursor: auto !important;
    }
    #ab-chat-overlay.ab-open #ab-chat-box {
      transform: translateY(0) scale(1);
    }

    #ab-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    #ab-chat-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ab-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${ROSE};
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ab-avatar svg { display: block; }
    #ab-chat-title {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      line-height: 1.2;
    }
    #ab-chat-subtitle {
      font-size: 11px;
      color: #6b7280;
      line-height: 1.2;
    }
    #ab-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: color 0.15s, background 0.15s;
    }
    #ab-close-btn:hover { color: #fff; background: rgba(255,255,255,0.07); }

    #ab-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: #2a2a2a transparent;
    }
    #ab-messages::-webkit-scrollbar { width: 4px; }
    #ab-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .ab-msg {
      display: flex;
      flex-direction: column;
      max-width: 88%;
      gap: 4px;
    }
    .ab-msg.ab-user { align-self: flex-end; align-items: flex-end; }
    .ab-msg.ab-bot  { align-self: flex-start; align-items: flex-start; }

    .ab-bubble {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.55;
      word-break: break-word;
    }
    .ab-msg.ab-user .ab-bubble {
      background: ${ROSE};
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .ab-msg.ab-bot .ab-bubble {
      background: rgba(255,255,255,0.06);
      color: #e5e7eb;
      border-bottom-left-radius: 4px;
    }

    /* Markdown inside bot bubbles */
    .ab-bubble p  { margin: 0 0 6px; }
    .ab-bubble p:last-child { margin-bottom: 0; }
    .ab-bubble strong { color: #fff; font-weight: 600; }
    .ab-bubble a  { color: ${ROSE}; text-decoration: underline; }
    .ab-bubble ul, .ab-bubble ol { margin: 4px 0 4px 18px; padding: 0; }
    .ab-bubble li { margin-bottom: 3px; }
    .ab-bubble code {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 12px;
      font-family: 'Fira Code', monospace;
    }

    /* Typing dots */
    .ab-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 14px;
    }
    .ab-typing span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #6b7280;
      animation: ab-bounce 1.2s infinite;
    }
    .ab-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ab-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ab-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30%            { transform: translateY(-5px); opacity: 1; }
    }

    #ab-input-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    #ab-input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: #e5e7eb;
      font-family: ${FONT};
      font-size: 13.5px;
      padding: 10px 14px;
      resize: none;
      outline: none;
      min-height: 40px;
      max-height: 120px;
      line-height: 1.5;
      transition: border-color 0.15s;
    }
    #ab-input::placeholder { color: #4b5563; }
    #ab-input:focus { border-color: ${ROSE}; }

    #ab-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: ${ROSE};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.15s, transform 0.15s;
    }
    #ab-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    #ab-send-btn:not(:disabled):hover { transform: scale(1.06); }
    #ab-send-btn svg { pointer-events: none; }

    #ab-hint {
      text-align: center;
      font-size: 10.5px;
      color: #374151;
      padding: 0 16px 10px;
      font-family: ${FONT};
    }
  `;

  // ── Minimal markdown renderer ─────────────────────────────────────────────
  function renderMarkdown(text) {
    return text
      // Escape HTML
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links [text](url)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
        '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
      // Plain URLs
      .replace(/(^|[\s])(https?:\/\/[^\s<]+)/g,
        '$1<a href="$2" target="_blank" rel="noreferrer">$2</a>')
      // Bullet points
      .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Numbered lists
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // Line breaks → paragraphs
      .split(/\n{2,}/).map(p => {
        p = p.trim();
        if (!p) return '';
        if (p.startsWith('<ul>') || p.startsWith('<ol>') || p.startsWith('<li>')) return p;
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
      }).join('');
  }

  // ── DOM builder ───────────────────────────────────────────────────────────
  function buildWidget() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Floating button
    const btn = document.createElement('button');
    btn.id = 'ab-chat-btn';
    btn.setAttribute('aria-label', 'Open chat');
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'ab-chat-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Abhishek AI Chat');

    overlay.innerHTML = `
      <div id="ab-chat-box">
        <div id="ab-chat-header">
          <div id="ab-chat-header-left">
            <div class="ab-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <div id="ab-chat-title">Abhishek's Assistant</div>
            </div>
          </div>
          <button id="ab-close-btn" aria-label="Close chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div id="ab-messages"></div>
        <div id="ab-input-row">
          <textarea id="ab-input" rows="1" placeholder="Ask me anything..." maxlength="500"></textarea>
          <button id="ab-send-btn" aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </button>
        </div>
        <div id="ab-hint">Press <kbd style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;padding:1px 5px;font-size:10px">Esc</kbd> to close &nbsp;·&nbsp; <kbd style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;padding:1px 5px;font-size:10px">/</kbd> or <kbd style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;padding:1px 5px;font-size:10px">⌘K</kbd> to open</div>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(overlay);

    return {
      btn,
      overlay,
      messages: overlay.querySelector('#ab-messages'),
      input:    overlay.querySelector('#ab-input'),
      sendBtn:  overlay.querySelector('#ab-send-btn'),
      closeBtn: overlay.querySelector('#ab-close-btn'),
    };
  }

  // ── Widget logic ──────────────────────────────────────────────────────────
  function init() {
    const { btn, overlay, messages, input, sendBtn, closeBtn } = buildWidget();
    let isOpen = false;
    let isBusy = false;
    let welcomed = false;
    let adminKey = null;

    function open() {
      if (isOpen) return;
      isOpen = true;
      overlay.classList.add('ab-open');
      if (!welcomed) {
        welcomed = true;
        appendMessage('bot', WELCOME);
      }
      setTimeout(() => input.focus(), 50);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove('ab-open');
    }

    function appendMessage(role, html, isHtml = false) {
      const wrap = document.createElement('div');
      wrap.className = `ab-msg ab-${role === 'user' ? 'user' : 'bot'}`;
      const bubble = document.createElement('div');
      bubble.className = 'ab-bubble';
      if (isHtml) {
        bubble.innerHTML = html;
      } else {
        bubble.textContent = html;
      }
      wrap.appendChild(bubble);
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
      return bubble;
    }

    function showTyping() {
      const wrap = document.createElement('div');
      wrap.className = 'ab-msg ab-bot';
      wrap.id = 'ab-typing-indicator';
      wrap.innerHTML = `<div class="ab-bubble ab-typing"><span></span><span></span><span></span></div>`;
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
    }

    function hideTyping() {
      const el = document.getElementById('ab-typing-indicator');
      if (el) el.remove();
    }

    async function send() {
      const text = input.value.trim();
      if (!text) return;

      // Hidden admin command — must be first, before any message or API call
      if (text.startsWith('/admin ')) {
        adminKey = text.slice(7).trim();
        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;
        appendMessage('bot', '🔓 Override accepted. Hey Abhishek, rate limits? Never heard of them.');
        return;
      }

      if (isBusy) return;

      isBusy = true;
      input.value = '';
      input.style.height = 'auto';
      sendBtn.disabled = true;

      appendMessage('user', text);
      showTyping();

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (adminKey) headers['x-admin-key'] = adminKey;

        const res = await fetch(API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        hideTyping();

        if (!res.ok || data.error) {
          appendMessage('bot', data.error || 'Something went wrong. Please try again.');
        } else {
          appendMessage('bot', renderMarkdown(data.reply), true);
        }
      } catch (err) {
        hideTyping();
        appendMessage('bot', 'Network error. Please check your connection and try again.');
      } finally {
        isBusy = false;
        sendBtn.disabled = false;
        input.focus();
      }
    }

    // Events
    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    sendBtn.addEventListener('click', send);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      sendBtn.disabled = !input.value.trim();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape → close
      if (e.key === 'Escape' && isOpen) {
        close();
        return;
      }
      // Cmd+K or Ctrl+K → toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? close() : open();
        return;
      }
      // "/" → open (only when not typing in an input/textarea)
      if (e.key === '/' && !isOpen) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !document.activeElement?.isContentEditable) {
          e.preventDefault();
          open();
        }
      }
    });

    // Initial send button state
    sendBtn.disabled = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
