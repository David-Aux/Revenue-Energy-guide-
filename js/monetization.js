// ============================================================
// monetization.js — Energy Guide Revenue Layer v2
// ============================================================
// PAYWALL MODEL:
//   FREE:    System tier, component counts, cost RANGE, browse marketplace
//   ₦1,000:  Exact cost, full breakdown, cables/breakers, PDF, WhatsApp,
//             save system, submit lead to installer or vendor
//
// INSTALLER PRO: ₦3,500/month — calculator + quote builder
// INSTALLER LEAD: ₦2,000/wallet — unlock contact details per lead
//
// VENDOR PRO:  ₦10,000/month — sales calculator + offer builder
// VENDOR LEAD: ₦2,000/wallet — unlock contact details per request
// ============================================================

// ── Config ──────────────────────────────────────────────────
const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

const EG_PRICES = {
  USER_BLUEPRINT:         1000,
  INSTALLER_PRO_MONTHLY:  3500,
  INSTALLER_LEAD:         2000,
  VENDOR_PRO_MONTHLY:    10000,
  VENDOR_LEAD:            2000,
  WALLET_TOPUP:          10000,
};

// ── Admin bypass ─────────────────────────────────────────────
// Set is_admin = TRUE on your profiles row in Supabase.
// Never settable from the app — only via Supabase dashboard directly.
function egIsAdmin() {
  return !!(window._egCurrentUser && window._egCurrentUser.is_admin === true);
}

// ── Sync user to this module ─────────────────────────────────
// Called from platform.js egSyncUser() on every login/profile load
function egSetMonetizationUser(user) {
  window._egCurrentUser = user || null;
}

// ── Admin badge ──────────────────────────────────────────────
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

// ── Paystack launcher ─────────────────────────────────────────
function egLaunchPaystack({ email, amountNaira, metadata, onSuccess, onClose }) {
  if (typeof PaystackPop === 'undefined') {
    showToast('Payment gateway not loaded. Check your connection and refresh.', 'error');
    return;
  }
  PaystackPop.setup({
    key:      PAYSTACK_PUBLIC_KEY,
    email:    email || 'guest@energyguide.ng',
    amount:   amountNaira * 100,
    currency: 'NGN',
    metadata: metadata || {},
    callback: response => { if (typeof onSuccess === 'function') onSuccess(response); },
    onClose:  ()       => { if (typeof onClose  === 'function') onClose(); }
  }).openIframe();
}

function egGetEmail() {
  return (window._egCurrentUser && window._egCurrentUser.email)
    ? window._egCurrentUser.email
    : 'guest@energyguide.ng';
}

// ============================================================
// ── MODAL HELPERS ────────────────────────────────────────────
// ============================================================
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
    background:rgba(0,0,0,0.6);
    display:flex;align-items:flex-end;justify-content:center;
    padding:0;`;
  m.innerHTML = `
    <div style="background:#fff;border-radius:24px 24px 0 0;
                padding:32px 24px 40px;width:100%;max-width:480px;
                box-shadow:0 -8px 40px rgba(0,0,0,0.2);
                animation:egSlideUp 0.25s ease;">
      ${innerHtml}
    </div>`;
  // Close on backdrop click
  m.addEventListener('click', e => { if (e.target === m) egRemoveModal(); });
  document.body.appendChild(m);

  // Add slide-up animation if not already
  if (!document.getElementById('eg-modal-style')) {
    const s = document.createElement('style');
    s.id = 'eg-modal-style';
    s.textContent = `@keyframes egSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`;
    document.head.appendChild(s);
  }
}

// ============================================================
// 1. USER BLUEPRINT UNLOCK  (₦1,000)
// ============================================================

// In-memory unlock state for this session
let _egBlueprintUnlocked = false;

function egBlueprintIsUnlocked() {
  if (egIsAdmin()) return true;
  return _egBlueprintUnlocked;
}

// Unlock — update UI immediately, persist to Supabase in background
async function egGrantBlueprintAccess(calcId) {
  _egBlueprintUnlocked = true;
  egApplyBlueprintUI();

  // Persist to Supabase if we have a saved calculation id
  if (supabaseClient && calcId) {
    supabaseClient.from('saved_calculations')
      .update({ is_unlocked: true, is_lead_available: true })
      .eq('id', calcId)
      .then(({ error }) => { if (error) console.warn('Blueprint persist failed:', error); });
  }
}

// Apply UI state — call whenever screen changes
function egApplyBlueprintUI() {
  const unlocked = egBlueprintIsUnlocked();

  // ── Cost screen ───────────────────────────────────────────
  // What the cost screen shows free: system tier + cost RANGE text
  // What it reveals after unlock: exact totals, component breakdown, cables, actions
  const costLocked   = document.getElementById('eg-cost-locked');
  const costUnlocked = document.getElementById('eg-cost-unlocked');
  if (costLocked)   costLocked.style.display   = unlocked ? 'none'  : 'block';
  if (costUnlocked) costUnlocked.style.display = unlocked ? 'block' : 'none';

  // ── Calculator cables section ─────────────────────────────
  const cablesLocked   = document.getElementById('eg-cables-locked');
  const cablesUnlocked = document.getElementById('eg-cables-unlocked');
  if (cablesLocked)   cablesLocked.style.display   = unlocked ? 'none'  : 'block';
  if (cablesUnlocked) cablesUnlocked.style.display = unlocked ? 'block' : 'none';

  // ── Post-calc action buttons ──────────────────────────────
  // "View Cost & Export" changes label/behaviour depending on lock state
  const costBtn = document.getElementById('eg-post-calc-cost-btn');
  if (costBtn) {
    if (unlocked) {
      costBtn.textContent = '💰 View Full Cost & Export';
      costBtn.onclick = () => openUserCostScreen();
    } else {
      costBtn.textContent = '🔒 Unlock Full Report — ₦1,000';
      costBtn.onclick = () => egShowBlueprintPaywall();
    }
  }
}

// Show the paywall bottom sheet
function egShowBlueprintPaywall(calcId) {
  if (egBlueprintIsUnlocked()) { egApplyBlueprintUI(); return; }
  window._egCurrentCalcId = calcId || window._egCurrentCalcId || null;

  egShowModal(`
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🔒</div>
      <div style="font-weight:800;font-size:20px;color:#111827;margin-bottom:8px;">
        Unlock Your Full Blueprint
      </div>
      <div style="font-size:14px;color:#6b7280;line-height:1.6;margin-bottom:20px;">
        One payment unlocks everything:<br>
        <strong>Exact cost · Component breakdown · Cable sizes (mm²)<br>
        Breaker ratings (A) · PDF export · WhatsApp share<br>
        Connect with installers &amp; vendors</strong>
      </div>
      <div style="background:#f0fdf4;border-radius:14px;padding:16px;margin-bottom:20px;">
        <div style="font-size:28px;font-weight:800;color:#16a34a;">₦1,000</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">
          One-time · Saved to your account forever
        </div>
      </div>
      <button onclick="egPayForBlueprint()"
        style="width:100%;background:#F59E0B;color:#fff;border:none;border-radius:14px;
               padding:16px;font-size:16px;font-weight:800;cursor:pointer;
               box-shadow:0 4px 16px rgba(245,158,11,0.4);margin-bottom:12px;">
        🔓 Unlock for ₦1,000
      </button>
      <div style="font-size:12px;color:#9ca3af;">
        Secured by Paystack · Bank transfer &amp; card accepted
      </div>
      <button onclick="egRemoveModal()"
        style="margin-top:16px;background:none;border:none;
               color:#9ca3af;font-size:13px;cursor:pointer;">
        Not now
      </button>
    </div>
  `);
}

async function egPayForBlueprint() {
  const calcId = window._egCurrentCalcId || null;

  // Admin bypass
  if (egIsAdmin()) {
    egRemoveModal();
    showToast('Admin bypass — blueprint unlocked.', 'success');
    await egGrantBlueprintAccess(calcId);
    // Open cost screen if we came from there
    openUserCostScreen();
    return;
  }

  egRemoveModal();
  egLaunchPaystack({
    email: egGetEmail(),
    amountNaira: EG_PRICES.USER_BLUEPRINT,
    metadata: {
      type: 'user_blueprint',
      calc_id: calcId || '',
      user_id: window._egCurrentUser?.id || 'guest'
    },
    onSuccess: async () => {
      showToast('Payment confirmed! Unlocking your blueprint...', 'success');
      await egGrantBlueprintAccess(calcId);
      openUserCostScreen();
    },
    onClose: () => showToast('Payment cancelled.', 'info')
  });
}

// Reset unlock state on new calculation
function egResetBlueprintForNewCalc() {
  _egBlueprintUnlocked = false;
  window._egCurrentCalcId = null;
}

// ============================================================
// 2. INSTALLER PRO  (₦3,500/month)
// ============================================================

function egInstallerIsPro() {
  if (egIsAdmin()) return true;
  const u = window._egCurrentUser;
  if (!u) return false;
  if (u.subscription_plan === 'pro' || u.subscription_plan === 'lifetime_pro') {
    if (u.subscription_expires_at) return new Date(u.subscription_expires_at) > new Date();
    return true;
  }
  return false;
}

function egInstallerProGate(targetScreen) {
  if (egInstallerIsPro()) { showScreen(targetScreen); return; }
  egShowInstallerProModal(targetScreen);
}

function egShowInstallerProModal(targetScreen) {
  egShowModal(`
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🛠️</div>
      <div style="font-weight:800;font-size:20px;color:#111827;margin-bottom:8px;">
        Installer Pro Required
      </div>
      <div style="font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:20px;">
        The <strong>Professional Calculator</strong> and <strong>Quote Builder</strong>
        are Pro features. Size systems faster and send branded PDF quotes to clients.
      </div>
      <div style="background:#f0fdf4;border-radius:14px;padding:16px;margin-bottom:20px;">
        <div style="font-size:28px;font-weight:800;color:#16a34a;">
          ₦3,500<span style="font-size:14px;font-weight:400;color:#6b7280;">/month</span>
        </div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">
          Less than a week of data &amp; fuel
        </div>
      </div>
      <button onclick="egPayInstallerPro('${targetScreen}')"
        style="width:100%;background:#22C55E;color:#fff;border:none;border-radius:14px;
               padding:16px;font-size:16px;font-weight:800;cursor:pointer;
               box-shadow:0 4px 16px rgba(34,197,94,0.4);margin-bottom:12px;">
        ✅ Go Pro — ₦3,500/month
      </button>
      <button onclick="egRemoveModal()"
        style="width:100%;background:none;border:1px solid #e5e7eb;border-radius:12px;
               padding:12px;font-size:14px;color:#6b7280;cursor:pointer;">
        Not now
      </button>
    </div>
  `);
}

async function egPayInstallerPro(targetScreen) {
  if (egIsAdmin()) {
    egRemoveModal();
    showToast('Admin bypass — Installer Pro activated.', 'success');
    _egSetProLocally();
    if (targetScreen) showScreen(targetScreen);
    return;
  }
  egRemoveModal();
  egLaunchPaystack({
    email: egGetEmail(),
    amountNaira: EG_PRICES.INSTALLER_PRO_MONTHLY,
    metadata: { type: 'installer_pro', user_id: window._egCurrentUser?.id || '' },
    onSuccess: async () => {
      showToast('Installer Pro activated!', 'success');
      await _egActivatePro();
      if (targetScreen) showScreen(targetScreen);
    },
    onClose: () => showToast('Payment cancelled.', 'info')
  });
}

// ============================================================
// 3. VENDOR PRO  (₦10,000/month)
// ============================================================

function egVendorIsPro() {
  if (egIsAdmin()) return true;
  const u = window._egCurrentUser;
  if (!u) return false;
  if (u.subscription_plan === 'pro' || u.subscription_plan === 'lifetime_pro') {
    if (u.subscription_expires_at) return new Date(u.subscription_expires_at) > new Date();
    return true;
  }
  return false;
}

function egVendorProGate(targetScreen) {
  if (egVendorIsPro()) { showScreen(targetScreen); return; }
  egShowVendorProModal(targetScreen);
}

function egShowVendorProModal(targetScreen) {
  egShowModal(`
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">📦</div>
      <div style="font-weight:800;font-size:20px;color:#111827;margin-bottom:8px;">
        Vendor Pro Required
      </div>
      <div style="font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:20px;">
        The <strong>Sales Calculator</strong> and <strong>Offer Builder</strong> are Pro features.
        Plus unlimited listings and featured placement — your products shown first after every calculation.
      </div>
      <div style="background:#fef3c7;border-radius:14px;padding:16px;margin-bottom:20px;">
        <div style="font-size:28px;font-weight:800;color:#d97706;">
          ₦10,000<span style="font-size:14px;font-weight:400;color:#6b7280;">/month</span>
        </div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">
          Targeted ads to active buyers
        </div>
      </div>
      <button onclick="egPayVendorPro('${targetScreen}')"
        style="width:100%;background:#F59E0B;color:#fff;border:none;border-radius:14px;
               padding:16px;font-size:16px;font-weight:800;cursor:pointer;
               box-shadow:0 4px 16px rgba(245,158,11,0.4);margin-bottom:12px;">
        ✅ Go Pro — ₦10,000/month
      </button>
      <button onclick="egRemoveModal()"
        style="width:100%;background:none;border:1px solid #e5e7eb;border-radius:12px;
               padding:12px;font-size:14px;color:#6b7280;cursor:pointer;">
        Not now
      </button>
    </div>
  `);
}

async function egPayVendorPro(targetScreen) {
  if (egIsAdmin()) {
    egRemoveModal();
    showToast('Admin bypass — Vendor Pro activated.', 'success');
    _egSetProLocally();
    if (targetScreen) showScreen(targetScreen);
    return;
  }
  egRemoveModal();
  egLaunchPaystack({
    email: egGetEmail(),
    amountNaira: EG_PRICES.VENDOR_PRO_MONTHLY,
    metadata: { type: 'vendor_pro', user_id: window._egCurrentUser?.id || '' },
    onSuccess: async () => {
      showToast('Vendor Pro activated!', 'success');
      await _egActivatePro();
      if (targetScreen) showScreen(targetScreen);
    },
    onClose: () => showToast('Payment cancelled.', 'info')
  });
}

// ============================================================
// 4. INSTALLER + VENDOR WALLET & LEAD UNLOCK  (₦2,000/lead)
// ============================================================

function egWalletBalance() {
  return Number(window._egCurrentUser?.wallet_balance || 0);
}

// Entry point — called from lead/request cards
async function egUnlockContact(leadId, role, onUnlocked) {
  if (egIsAdmin()) {
    showToast('Admin bypass — contact unlocked.', 'success');
    if (typeof onUnlocked === 'function') onUnlocked(leadId);
    return;
  }
  const price = role === 'vendor' ? EG_PRICES.VENDOR_LEAD : EG_PRICES.INSTALLER_LEAD;
  if (egWalletBalance() >= price) {
    await _egSpendWallet(leadId, role, price, onUnlocked);
  } else {
    egShowTopupModal(leadId, role, price, onUnlocked);
  }
}

async function _egSpendWallet(leadId, role, price, onUnlocked) {
  const newBalance = egWalletBalance() - price;
  if (window._egCurrentUser) window._egCurrentUser.wallet_balance = newBalance;

  if (supabaseClient && window._egCurrentUser?.id) {
    await supabaseClient.from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', window._egCurrentUser.id)
      .then(({ error }) => { if (error) console.warn('Wallet deduct failed:', error); });

    await supabaseClient.from('lead_unlocks').insert([{
      profile_id:  window._egCurrentUser.id,
      lead_id:     leadId,
      role:        role,
      amount_paid: price,
      unlocked_at: new Date().toISOString()
    }]).then(({ error }) => { if (error) console.warn('Lead unlock record failed:', error); });
  }

  showToast(`Contact unlocked! ₦${price.toLocaleString()} spent. Wallet: ₦${newBalance.toLocaleString()}`, 'success');
  if (typeof onUnlocked === 'function') onUnlocked(leadId);
}

function egShowTopupModal(pendingLeadId, role, price, onUnlocked) {
  window._egPendingUnlock = { leadId: pendingLeadId, role, price, onUnlocked };
  const balance = egWalletBalance();
  egShowModal(`
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">💼</div>
      <div style="font-weight:800;font-size:20px;color:#111827;margin-bottom:8px;">
        Top Up Your Wallet
      </div>
      <div style="font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:8px;">
        Unlocking a contact costs <strong>₦${price.toLocaleString()}</strong>.<br>
        Your balance: <strong style="color:${balance>0?'#16a34a':'#ef4444'}">
          ₦${balance.toLocaleString()}
        </strong>
      </div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:20px;">
        Top up ₦10,000 → unlock up to 5 contacts
      </div>
      <div style="background:#f0f9ff;border-radius:14px;padding:16px;margin-bottom:20px;">
        <div style="font-size:28px;font-weight:800;color:#0284c7;">₦10,000</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">= 5 verified contacts at ₦2,000 each</div>
      </div>
      <button onclick="egPayWalletTopup()"
        style="width:100%;background:#22C55E;color:#fff;border:none;border-radius:14px;
               padding:16px;font-size:16px;font-weight:800;cursor:pointer;
               box-shadow:0 4px 16px rgba(34,197,94,0.4);margin-bottom:12px;">
        💳 Top Up ₦10,000
      </button>
      <button onclick="egRemoveModal()"
        style="width:100%;background:none;border:1px solid #e5e7eb;border-radius:12px;
               padding:12px;font-size:14px;color:#6b7280;cursor:pointer;">
        Cancel
      </button>
    </div>
  `);
}

async function egPayWalletTopup() {
  const pending = window._egPendingUnlock;
  if (egIsAdmin()) {
    egRemoveModal();
    if (window._egCurrentUser)
      window._egCurrentUser.wallet_balance = egWalletBalance() + EG_PRICES.WALLET_TOPUP;
    showToast('Admin bypass — wallet topped up.', 'success');
    if (pending) await _egSpendWallet(pending.leadId, pending.role, pending.price, pending.onUnlocked);
    window._egPendingUnlock = null;
    return;
  }
  egRemoveModal();
  egLaunchPaystack({
    email: egGetEmail(),
    amountNaira: EG_PRICES.WALLET_TOPUP,
    metadata: { type: 'wallet_topup', user_id: window._egCurrentUser?.id || '' },
    onSuccess: async () => {
      const newBal = egWalletBalance() + EG_PRICES.WALLET_TOPUP;
      if (window._egCurrentUser) window._egCurrentUser.wallet_balance = newBal;
      if (supabaseClient && window._egCurrentUser?.id) {
        await supabaseClient.from('profiles')
          .update({ wallet_balance: newBal })
          .eq('id', window._egCurrentUser.id);
      }
      showToast(`Wallet topped up! Balance: ₦${newBal.toLocaleString()}`, 'success');
      if (pending) await _egSpendWallet(pending.leadId, pending.role, pending.price, pending.onUnlocked);
      window._egPendingUnlock = null;
    },
    onClose: () => showToast('Top-up cancelled.', 'info')
  });
}

// ============================================================
// 5. PRO HELPERS (shared installer + vendor)
// ============================================================

function _egSetProLocally() {
  if (!window._egCurrentUser) return;
  window._egCurrentUser.subscription_plan = 'pro';
  window._egCurrentUser.subscription_expires_at =
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

async function _egActivatePro() {
  _egSetProLocally();
  if (!supabaseClient || !window._egCurrentUser?.id) return;
  await supabaseClient.from('profiles').update({
    subscription_plan:       'pro',
    subscription_expires_at: window._egCurrentUser.subscription_expires_at,
  }).eq('id', window._egCurrentUser.id)
    .then(({ error }) => { if (error) console.warn('Pro activation failed:', error); });
}
