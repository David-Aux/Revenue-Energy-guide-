// ============================================================
// eg-admin-utils.js — Shared admin detection + generic modal helper
// ============================================================
// These were originally bundled inside monetization.js, but they're
// general-purpose platform utilities with no payment logic in them —
// the Admin Portal and the Help/About menu both depend on this file.
// ============================================================

// ── Current-user pointer (used for admin checks across the app) ──
function egSyncCurrentUser(user) {
  window._egCurrentUser = user || null;
}

// ── Admin check ────────────────────────────────────────────────
function egIsAdmin() {
  return !!(window._egCurrentUser && window._egCurrentUser.is_admin === true);
}

// ── Small fixed "Admin" badge shown in the corner while signed in
// as an admin account ─────────────────────────────────────────────
function egRenderAdminBadge() {
  let b = document.getElementById('eg-admin-badge');
  if (egIsAdmin()) {
    if (!b) {
      b = document.createElement('div');
      b.id = 'eg-admin-badge';
      b.textContent = '⚡ Admin';
      b.style.cssText = `
        position:fixed;bottom:12px;left:12px;z-index:9999;
        background:rgba(0,0,0,0.6);color:#facc15;
        font-size:11px;font-weight:700;padding:4px 8px;
        border-radius:6px;pointer-events:none;opacity:0.8;`;
      document.body.appendChild(b);
    }
  } else if (b) { b.remove(); }
}

// ── Generic bottom-sheet modal helper (used by the Help/About menu) ──
function egRemoveModal() {
  const m = document.getElementById('eg-modal');
  if (m) m.remove();
}

function egShowModal(innerHtml) {
  egRemoveModal();
  const m = document.createElement('div');
  m.id = 'eg-modal';
  m.style.cssText = `
    position:fixed;inset:0;z-index:2000;
    background:rgba(0,0,0,0.7);
    display:flex;align-items:flex-end;justify-content:center;padding:0;`;
  m.innerHTML = `
    <div style="background:#0b1118;border-radius:24px 24px 0 0;
                padding:32px 24px 40px;width:100%;max-width:480px;
                box-shadow:0 -8px 40px rgba(0,0,0,0.5);
                border-top:1px solid #243244;
                animation:egSlideUp 0.25s ease;">
      ${innerHtml}
    </div>`;
  m.addEventListener('click', e => { if (e.target === m) egRemoveModal(); });
  document.body.appendChild(m);
  if (!document.getElementById('eg-modal-style')) {
    const s = document.createElement('style');
    s.id = 'eg-modal-style';
    s.textContent = `@keyframes egSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`;
    document.head.appendChild(s);
  }
}
