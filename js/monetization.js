// ============================================================
// monetization.js — Energy Guide Revenue Layer
// ============================================================
// PAYMENT: ₦1,000 to unlock a lead contact
//   - Flutterwave inline popup (auto-unlock on success)
//   - Supabase Edge Function verifies payment server-side
// ============================================================

const FLW_PUBLIC_KEY = 'FLWPUBK-e01fa0da2edc7cbbdc5b06bc13223bfc-X';
const FLW_AMOUNT     = 1000;
const FLW_CURRENCY   = 'NGN';
const FLW_VERIFY_URL = 'https://eixhuvxoolwkwliatmym.supabase.co/functions/v1/swift-api';

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

function egGetName() {
  return (window._egCurrentUser && window._egCurrentUser.full_name)
    ? window._egCurrentUser.full_name
    : 'EnergyGuide User';
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

// ── Generate unique transaction reference ─────────────────────
function egGenTxRef(leadId) {
  const ts  = Date.now();
  const uid = window._egCurrentUser?.id?.slice(0, 8) || 'guest';
  const lid = (leadId || 'lead').toString().slice(0, 8);
  return `EG-${uid}-${lid}-${ts}`;
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

// ── Wallet spend path ─────────────────────────────────────────
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
      <button onclick="egLaunchFlutterwavePopup()"
        style="width:100%;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;
               border:none;border-radius:14px;padding:16px;font-size:16px;font-weight:800;
               cursor:pointer;box-shadow:0 4px 20px rgba(245,158,11,0.35);margin-bottom:12px;">
        💳 Pay ₦1,000 — Unlock Now
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

// ── Load Flutterwave inline script if not already loaded ───────
function egLoadFlwScript() {
  return new Promise((resolve) => {
    if (window.FlutterwaveCheckout) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.flutterwave.com/v3.js';
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

// ── Launch Flutterwave inline popup ───────────────────────────
async function egLaunchFlutterwavePopup() {
  egRemoveModal();

  const pending = window._egPendingUnlock;
  if (!pending) { showToast('Something went wrong. Please try again.', 'error'); return; }

  showToast('Opening payment...', 'info');

  await egLoadFlwScript();

  const txRef = egGenTxRef(pending.leadId);
  window._egPendingTxRef = txRef;

  FlutterwaveCheckout({
    public_key:   FLW_PUBLIC_KEY,
    tx_ref:       txRef,
    amount:       FLW_AMOUNT,
    currency:     FLW_CURRENCY,
    payment_options: 'card, banktransfer, ussd, mobilemoney',
    customer: {
      email: egGetEmail(),
      name:  egGetName(),
    },
    customizations: {
      title:       'EnergyGuide',
      description: 'Lead contact unlock — ₦1,000',
      logo:        'https://david-aux.github.io/Revenue-Energy-guide-/favicon.ico',
    },
    callback: async function(response) {
      // Called by Flutterwave when payment completes
      if (response.status === 'successful' || response.status === 'completed') {
        await egHandlePaymentSuccess(response, pending);
      } else {
        showToast('Payment was not completed. Please try again.', 'warning');
      }
    },
    onclose: function() {
      // User closed the popup without paying — do nothing
    }
  });
}

// ── Handle successful payment ──────────────────────────────────
async function egHandlePaymentSuccess(flwResponse, pending) {
  showToast('Payment received! Verifying...', 'info');

  try {
    // Call Supabase Edge Function to verify + record unlock
    const res = await fetch(FLW_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_id: flwResponse.transaction_id,
        tx_ref:         flwResponse.tx_ref,
        lead_id:        pending.leadId,
        role:           pending.role,
        profile_id:     window._egCurrentUser?.id || null,
        expected_amount: FLW_AMOUNT,
      })
    });

    const result = await res.json();

    if (result.success) {
      showToast('✅ Payment verified! Contact unlocked.', 'success');
      if (typeof pending.onUnlocked === 'function') pending.onUnlocked(pending.leadId);
      window._egPendingUnlock = null;
    } else {
      // Verification failed — fall back to manual confirmation
      showToast('Payment received but verification pending. Contact will be unlocked shortly.', 'warning');
      egShowManualFallbackModal(flwResponse);
    }

  } catch (err) {
    console.error('Verification error:', err);
    // Network error — still show fallback so user isn't stuck
    showToast('Payment received. We will verify and unlock shortly.', 'info');
    egShowManualFallbackModal(flwResponse);
  }
}

// ── Fallback modal (network issues during verification) ────────
function egShowManualFallbackModal(flwResponse) {
  egShowModal(`
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">✅</div>
      <div style="font-weight:800;font-size:18px;color:#f3f4f6;margin-bottom:10px;">
        Payment Received!
      </div>
      <div style="font-size:13px;color:#94a3b8;line-height:1.8;margin-bottom:16px;
                  text-align:left;background:#0f2a1a;border:1px solid #1f7a49;
                  border-radius:12px;padding:14px;">
        <strong style="color:#86efac;">Transaction ID:</strong>
        <span style="color:#f3f4f6;"> ${flwResponse.transaction_id || 'N/A'}</span><br><br>
        Auto-verification is taking longer than expected. Your contact will be unlocked 
        within a few minutes. If not, send your Transaction ID to:<br><br>
        📧 <strong style="color:#f3f4f6;">energyguideng@outlook.com</strong><br>
        💬 <strong style="color:#f3f4f6;">+2348142472213</strong>
      </div>
      <button onclick="egRemoveModal()"
        style="width:100%;background:#22C55E;color:#fff;border:none;border-radius:14px;
               padding:14px;font-size:15px;font-weight:700;cursor:pointer;">
        Got it
      </button>
    </div>
  `);
}

// ── Legacy aliases ─────────────────────────────────────────────
function egShowTopupModal(pendingLeadId, role, onUnlocked) {
  egShowPaymentModal(pendingLeadId, role, onUnlocked);
}
async function egPayWalletTopup() {
  egLaunchFlutterwavePopup();
}
function egLaunchPayment() {
  egLaunchFlutterwavePopup();
}
