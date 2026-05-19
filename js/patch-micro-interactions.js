/**
 * Energy Guide — Micro-interactions & Phase 3 UX
 * Pure enhancement layer. No core logic touched.
 */
(function () {
  'use strict';

  /* ── 1. Ripple effect on all buttons and action-cards ─────────── */
  function createRipple(e) {
    const el = e.currentTarget;
    const existing = el.querySelector('.eg-ripple');
    if (existing) existing.remove();

    const rect   = el.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = (e.clientX || rect.left + rect.width / 2)  - rect.left - size / 2;
    const y      = (e.clientY || rect.top  + rect.height / 2) - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'eg-ripple';
    ripple.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:${size}px; height:${size}px;
      left:${x}px; top:${y}px;
      background:rgba(255,255,255,0.12);
      transform:scale(0); animation:egRippleAnim 0.5s ease-out forwards;
      z-index:10;
    `;
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 520);
  }

  /* Inject ripple keyframe once */
  if (!document.getElementById('eg-ripple-style')) {
    const s = document.createElement('style');
    s.id = 'eg-ripple-style';
    s.textContent = `
      @keyframes egRippleAnim {
        to { transform:scale(1); opacity:0; }
      }
      /* Card press feel */
      .action-card { cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent; }
      .btn         { user-select:none; -webkit-tap-highlight-color:transparent; }

      /* Skeleton loader pulse */
      @keyframes egSkeleton {
        0%,100% { opacity:0.4; }
        50%      { opacity:0.8; }
      }
      .eg-skeleton {
        background: linear-gradient(90deg,#1e2d42 25%,#243347 50%,#1e2d42 75%);
        background-size:200% 100%;
        animation: egSkeleton 1.4s ease-in-out infinite;
        border-radius:8px;
      }

      /* Toast slide-up — only applies to .eg-toast class to avoid conflicts */
      @keyframes egToastIn {
        from { transform:translateY(20px) scale(0.95); opacity:0; }
        to   { transform:translateY(0)    scale(1);    opacity:1; }
      }
      .eg-toast { animation:egToastIn 0.25s cubic-bezier(0.4,0,0.2,1) !important; }

      /* Button press */
      .btn:active { transform:scale(0.97) !important; transition:transform 0.08s !important; }

      /* Lead card hover shimmer */
      .lead-card { transition:border-color 0.2s, box-shadow 0.2s !important; }
      .lead-card:active {
        border-color:rgba(255,255,255,0.12) !important;
        box-shadow:0 4px 20px rgba(0,0,0,0.3) !important;
      }

      /* Screen transitions removed — iframes go blank with opacity:0 animations.
         The app uses display:block/none for screen switching which is reliable. */

      /* Input focus ring glow */
      input:focus, select:focus, textarea:focus {
        transform:translateY(-1px);
        transition:transform 0.15s, border-color 0.15s, box-shadow 0.15s !important;
      }

      /* Stat card number pop — removed opacity animation to prevent blank content */
      .stat-card [id$="Count"] {
        display:inline-block;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── 2. Attach ripple to buttons and cards ───────────────────── */
  function attachRipples() {
    document.querySelectorAll('.btn:not([data-eg-ripple]), .action-card:not([data-eg-ripple])').forEach(el => {
      el.setAttribute('data-eg-ripple', '1');
      el.addEventListener('pointerdown', createRipple, { passive: true });
    });
  }

  /* ── 3. Pull-to-refresh feel — visual bounce only (no reload) ── */
  let _ptStartY = 0, _ptEl = null, _ptActive = false;

  function onTouchStart(e) {
    const el = e.target.closest('.screen.active');
    if (!el) return;
    const atTop = el.scrollTop <= 0;
    if (!atTop) return;
    _ptStartY = e.touches[0].clientY;
    _ptEl     = el;
    _ptActive = true;
  }

  function onTouchMove(e) {
    if (!_ptActive || !_ptEl) return;
    const dy = e.touches[0].clientY - _ptStartY;
    if (dy < 8) return;
    const pull = Math.min(dy * 0.35, 48);
    _ptEl.style.transform = `translateY(${pull}px)`;
    _ptEl.style.transition = 'none';
  }

  function onTouchEnd() {
    if (!_ptActive || !_ptEl) return;
    _ptEl.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
    _ptEl.style.transform  = 'translateY(0)';
    _ptActive = false;
    _ptEl     = null;
  }

  document.addEventListener('touchstart', onTouchStart, { passive:true });
  document.addEventListener('touchmove',  onTouchMove,  { passive:true });
  document.addEventListener('touchend',   onTouchEnd,   { passive:true });

  /* ── 4. Long-press haptic on action cards (where supported) ───── */
  function onLongPress(el, callback) {
    let timer;
    el.addEventListener('pointerdown', () => {
      timer = setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(18);
        callback();
      }, 400);
    }, { passive:true });
    el.addEventListener('pointerup',    () => clearTimeout(timer), { passive:true });
    el.addEventListener('pointerleave', () => clearTimeout(timer), { passive:true });
  }

  /* ── 5. Toast upgrade — add progress bar ────────────────────── */
  const _origShowToast = window.showToast;
  if (typeof _origShowToast === 'function') {
    window.showToast = function(msg, type, duration) {
      _origShowToast(msg, type, duration);
      // Add progress bar to the latest toast
      requestAnimationFrame(() => {
        const toast = document.querySelector('.toast:last-child, #toast:last-child, [class*="toast"]:last-child');
        if (!toast || toast.querySelector('.eg-toast-bar')) return;
        const dur = duration || 3500;
        const bar = document.createElement('div');
        bar.className = 'eg-toast-bar';
        bar.style.cssText = `
          position:absolute; bottom:0; left:0; height:2px;
          background:rgba(255,255,255,0.4); border-radius:0 0 8px 8px;
          width:100%;
          animation:egToastBar ${dur}ms linear forwards;
        `;
        const style = document.createElement('style');
        style.textContent = `@keyframes egToastBar { to { width:0%; } }`;
        toast.style.position = 'relative';
        toast.style.overflow = 'hidden';
        toast.appendChild(style);
        toast.appendChild(bar);
      });
    };
  }

  /* ── 6. MutationObserver — attach ripples to new elements ───── */
  const observer = new MutationObserver(() => attachRipples());
  observer.observe(document.body, { childList:true, subtree:true });

  /* ── Init ────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachRipples);
  } else {
    attachRipples();
  }

})();
