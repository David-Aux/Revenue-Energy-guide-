// ============================================================
// monetization.js — Energy Guide Revenue Layer
// ============================================================
// ONLY PAYMENT: ₦1,000 to unlock a lead contact
//   - Applies to both installers and vendors
//   - Payment via Flutterwave payment link (manual confirmation)
// Everything else is free.
// ============================================================

const FLW_PAYMENT_URL = 'https://flutterwave.com/pay/gxi31osfxk0r';

const EG_PRICES = {
  LEAD_UNLOCK:  1000,
  WALLET_TOPUP: 1000,
};

// ── Admin bypass ─────────────────────────────────────────────
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

function egGetEmail() {
  return (window._egCurrentUser && window._egCurrentUser.email)
    ? window._egCurrentUser.email
    : 'guest@energyguide.ng';
}

// ── Wallet ────────────────────────────────────────────────────
function egWalletBalance() {
  return Number(window._egCurrentUser?.wallet_balance || 0);
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

// ── Main unlock entry point ───────────────────────────────────
async function egUnlockContact(leadId, role, onUnlocked) {
  if (egIsAdmin()) {
    showToast('Admin bypass — contact unlocked.', 'success');
    if (typeof onUnlocked === 'function') onUnlocked(leadId);
    return;
  }

  if (egWalletBalance() >= EG_PRICES.LEAD_UNLOCK) {
    await _egSpendWallet(leadId, role, onUnlocked);
  } else {
    egShowPaymentModal(leadId, role, onUnlocked);
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
    `Contact unlocked! ₦${EG_PRICES.LEAD_UNLOCK.toLocaleString()} spent. Wallet: ₦${newBalance.toLocaleString()}`,
    'success'
  );
  if (typeof onUnlocked === 'function') onUnlocked(leadId);
}

// ── Payment modal ─────────────────────────────────────────────
function egShowPaymentModal(pendingLeadId, role, onUnlocked) {
  window._egPendingUnlock = { leadId: pendingLeadId, role, onUnlocked };

  egShowModal(`
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🔓</div>
      <div style="font-weight:800;font-size:20px;color:#f3f4f6;margin-bottom:8px;">
        Unlock This Contact
      </div>
      <div style="font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:20px;">
        Pay <strong style="color:#f59e0b;">₦1,000</strong> to see the customer's
        phone number and email. Secured by Flutterwave.
      </div>
      <div style="background:#0f1722;border:1px solid #243244;border-radius:14px;
                  padding:16px;margin-bottom:20px;text-align:left;">
        <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;text-transform:uppercase;
                    letter-spacing:1px;">You get:</div>
        <div style="color:#f3f4f6;font-size:14px;line-height:2.2;">
          📞 Customer phone number<br>
          ✉️ Customer email address<br>
          📋 Ability to build &amp; send a quote
        </div>
      </div>
      <button onclick="egLaunchPayment()"
        style="width:100%;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;
               border:none;border-radius:14px;padding:16px;font-size:16px;font-weight:800;
               cursor:pointer;box-shadow:0 4px 20px rgba(245,158,11,0.35);margin-bottom:12px;">
        💳 Pay ₦1,000 with Flutterwave
      </button>
      <div style="font-size:11px;color:#64748b;margin-bottom:16px;">
        Card · Bank transfer · USSD · Mobile money accepted
      </div>
      <button onclick="egRemoveModal()"
        style="width:100%;background:transparent;border:1px solid #243244;border-radius:12px;
               padding:12px;font-size:14px;color:#94a3b8;cursor:pointer;">
        Cancel
      </button>
    </div>
  `);
}

// ── Launch payment link + show receipt instructions ───────────
function egLaunchPayment() {
  egRemoveModal();
  window.open(FLW_PAYMENT_URL, '_blank');

  setTimeout(() => {
    egShowModal(`
      <div style="text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">✅</div>
        <div style="font-weight:800;font-size:18px;color:#f3f4f6;margin-bottom:10px;">
          Payment Page Opened
        </div>
        <div style="font-size:13px;color:#94a3b8;line-height:1.8;margin-bottom:16px;
                    text-align:left;background:#0f2a1a;border:1px solid #1f7a49;
                    border-radius:12px;padding:14px;">
          <strong style="color:#86efac;">After paying ₦1,000:</strong><br><br>
          1️⃣ Screenshot your Flutterwave receipt<br>
          2️⃣ Send to <strong style="color:#f3f4f6;">energyguideng@outlook.com</strong><br>
          &nbsp;&nbsp;&nbsp;&nbsp;or WhatsApp <strong style="color:#f3f4f6;">+2348142472213</strong><br>
          3️⃣ Contact unlocked within a few hours
        </div>
        <button onclick="egRemoveModal()"
          style="width:100%;background:#22C55E;color:#fff;border:none;border-radius:14px;
                 padding:14px;font-size:15px;font-weight:700;cursor:pointer;">
          Got it — I'll send the receipt
        </button>
      </div>
    `);
  }, 500);
}

// Legacy aliases so nothing in platform.js breaks
function egShowTopupModal(pendingLeadId, role, onUnlocked) {
  egShowPaymentModal(pendingLeadId, role, onUnlocked);
}
async function egPayWalletTopup() {
  egLaunchPayment();
}
