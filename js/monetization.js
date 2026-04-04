// ============================================================
// monetization.js — Energy Guide Revenue Layer
// ============================================================
// ONLY PAYMENT: ₦1,000 to unlock a lead contact
//   - Applies to both installers and vendors
//   - Wallet-based: top up ₦10,000, spend ₦1,000 per contact
// Everything else is free.
// ============================================================

// Flutterwave payment link — ₦1,000 per lead unlock
const FLUTTERWAVE_PAYMENT_LINK = 'https://flutterwave.com/pay/gxi31osfxk0r';

const EG_PRICES = {
  LEAD_UNLOCK:   1000,   // cost to unlock one contact (installer or vendor)
  WALLET_TOPUP: 10000,   // default top-up amount
};

// ── Admin bypass ─────────────────────────────────────────────
// Set is_admin = TRUE on your profiles row in Supabase dashboard.
// Never settable from the app.
function egIsAdmin() {
  return !!(window._egCurrentUser && window._egCurrentUser.is_admin === true);
}

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

// ── Flutterwave launcher ──────────────────────────────────────
// Opens the Flutterwave payment link in a new tab.
// After payment, the installer/vendor sends a screenshot to confirm,
// then admin manually credits their wallet in Supabase.
function egLaunchFlutterwave() {
  window.open(FLUTTERWAVE_PAYMENT_LINK, '_blank');
}

function egGetEmail() {
  return (window._egCurrentUser && window._egCurrentUser.email)
    ? window._egCurrentUser.email
    : 'guest@energyguide.ng';
}

// ── Modal helper ──────────────────────────────────────────────
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
    display:flex;align-items:flex-end;justify-content:center;padding:0;`;
  m.innerHTML = `
    <div style="background:#fff;border-radius:24px 24px 0 0;
                padding:32px 24px 40px;width:100%;max-width:480px;
                box-shadow:0 -8px 40px rgba(0,0,0,0.2);
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

// ============================================================
// LEAD / CONTACT UNLOCK  (₦1,000 per contact)
// Used by both installer job leads and vendor matched requests
// ============================================================

function egWalletBalance() {
  return Number(window._egCurrentUser?.wallet_balance || 0);
}

// Main entry point — call from lead/request cards
// role: 'installer' or 'vendor'
// onUnlocked: callback(leadId) called after successful unlock
async function egUnlockContact(leadId, role, onUnlocked) {
  if (egIsAdmin()) {
    showToast('Admin bypass — contact unlocked.', 'success');
    if (typeof onUnlocked === 'function') onUnlocked(leadId);
    return;
  }

  if (egWalletBalance() >= EG_PRICES.LEAD_UNLOCK) {
    await _egSpendWallet(leadId, role, onUnlocked);
  } else {
    egShowTopupModal(leadId, role, onUnlocked);
  }
}

async function _egSpendWallet(leadId, role, onUnlocked) {
  const newBalance = egWalletBalance() - EG_PRICES.LEAD_UNLOCK;
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
      amount_paid: EG_PRICES.LEAD_UNLOCK,
      unlocked_at: new Date().toISOString()
    }]).then(({ error }) => { if (error) console.warn('Lead unlock record failed:', error); });
  }

  showToast(
    `Contact unlocked! ₦${EG_PRICES.LEAD_UNLOCK.toLocaleString()} spent. ` +
    `Wallet: ₦${newBalance.toLocaleString()}`,
    'success'
  );
  if (typeof onUnlocked === 'function') onUnlocked(leadId);
}

function egShowTopupModal(pendingLeadId, role, onUnlocked) {
  window._egPendingUnlock = { leadId: pendingLeadId, role, onUnlocked };
  const balance = egWalletBalance();

  egShowModal(`
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">💼</div>
      <div style="font-weight:800;font-size:20px;color:#111827;margin-bottom:8px;">
        Top Up Your Wallet
      </div>
      <div style="font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:8px;">
        Unlocking a contact costs <strong>₦${EG_PRICES.LEAD_UNLOCK.toLocaleString()}</strong>.<br>
        Your balance:
        <strong style="color:${balance > 0 ? '#16a34a' : '#ef4444'}">
          ₦${balance.toLocaleString()}
        </strong>
      </div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:20px;">
        Top up ₦10,000 → unlock up to 10 contacts
      </div>
      <div style="background:#f0f9ff;border-radius:14px;padding:16px;margin-bottom:20px;">
        <div style="font-size:28px;font-weight:800;color:#0284c7;">₦10,000</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">
          = 10 verified contacts at ₦1,000 each
        </div>
      </div>
      <button onclick="egPayWalletTopup()"
        style="width:100%;background:#22C55E;color:#fff;border:none;border-radius:14px;
               padding:16px;font-size:16px;font-weight:800;cursor:pointer;
               box-shadow:0 4px 16px rgba(34,197,94,0.4);margin-bottom:12px;">
        💳 Pay ₦1,000 via Flutterwave
      </button>
      <div style="font-size:11px;color:#9ca3af;margin-bottom:12px;">
        Secured by Flutterwave · Card, bank transfer &amp; USSD accepted
      </div>
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
    if (pending) await _egSpendWallet(pending.leadId, pending.role, pending.onUnlocked);
    window._egPendingUnlock = null;
    return;
  }

  // Open Flutterwave payment link and show confirmation instructions
  egRemoveModal();
  egLaunchFlutterwave();

  // Show instructions modal after a short delay (link has opened in new tab)
  setTimeout(() => {
    egShowModal(`
      <div style="text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">✅</div>
        <div style="font-weight:800;font-size:18px;color:#111827;margin-bottom:10px;">
          Payment Page Opened
        </div>
        <div style="font-size:13px;color:#6b7280;line-height:1.7;margin-bottom:16px;text-align:left;background:#f0fdf4;border-radius:12px;padding:14px;">
          <strong style="color:#16a34a;">After paying ₦1,000:</strong><br>
          1. Take a screenshot of your payment receipt<br>
          2. Send it to <strong>davidapribo@gmail.com</strong> or WhatsApp <strong>+2348142472213</strong><br>
          3. Your wallet will be credited within a few hours and you can unlock the contact
        </div>
        <button onclick="egRemoveModal()"
          style="width:100%;background:#22C55E;color:#fff;border:none;border-radius:14px;
                 padding:14px;font-size:15px;font-weight:700;cursor:pointer;">
          Got it
        </button>
      </div>
    `);
  }, 600);
}
