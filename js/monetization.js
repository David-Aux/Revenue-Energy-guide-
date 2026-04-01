// ============================================================
// monetization.js — Energy Guide Revenue Layer
// Handles: Paystack payments, paywall gates, admin bypass,
//          wallet top-up, subscription checks, lead unlocks
// ============================================================

// ── Paystack Public Key ─────────────────────────────────────
// Replace with your live key before going live
const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// ── Pricing (in Naira) ──────────────────────────────────────
const EG_PRICES = {
  USER_BLUEPRINT:        1000,   // User unlocks full technical blueprint
  INSTALLER_PRO_MONTHLY: 3500,   // Installer Pro subscription/month
  INSTALLER_LEAD:        2000,   // Installer wallet spend per lead unlock
  INSTALLER_WALLET_TOPUP:10000,  // Default wallet top-up amount
  VENDOR_PRO_MONTHLY:    10000,  // Vendor Pro subscription/month
};

// ── Admin bypass flag ───────────────────────────────────────
// Set is_admin = true on your profile row in Supabase.
// This is NEVER settable from the app — only via Supabase dashboard.
function egIsAdmin() {
  return !!(window._egCurrentUser && window._egCurrentUser.is_admin === true);
}

// ── Expose current user to this module ─────────────────────
// Called from platform.js whenever currentUser changes
function egSetMonetizationUser(user) {
  window._egCurrentUser = user || null;
}

// ── Admin badge (subtle, only visible to you) ──────────────
function egRenderAdminBadge() {
  let badge = document.getElementById('eg-admin-badge');
  if (egIsAdmin()) {
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'eg-admin-badge';
      badge.textContent = '⚡ Admin';
      badge.style.cssText = `
        position: fixed; bottom: 12px; left: 12px; z-index: 9999;
        background: rgba(0,0,0,0.55); color: #facc15;
        font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
        padding: 4px 8px; border-radius: 6px; pointer-events: none;
        opacity: 0.75;
      `;
      document.body.appendChild(badge);
    }
  } else if (badge) {
    badge.remove();
  }
}

// ── Core Paystack launcher ──────────────────────────────────
// amount in Naira, metadata is plain object
function egLaunchPaystack({ email, amountNaira, metadata, onSuccess, onClose }) {
  if (typeof PaystackPop === 'undefined') {
    showToast('Payment gateway not loaded. Check your connection.', 'error');
    return;
  }
  const handler = PaystackPop.setup({
    key:       PAYSTACK_PUBLIC_KEY,
    email:     email,
    amount:    amountNaira * 100,          // Paystack uses kobo
    currency:  'NGN',
    metadata:  metadata || {},
    callback:  function(response) {
      if (typeof onSuccess === 'function') onSuccess(response);
    },
    onClose:   function() {
      if (typeof onClose === 'function') onClose();
    }
  });
  handler.openIframe();
}

// ── Helper: get user email for Paystack ────────────────────
function egGetPaymentEmail() {
  const user = window._egCurrentUser;
  if (user && user.email) return user.email;
  // Guest fallback — Paystack requires an email
  return 'guest@energyguide.ng';
}

// ============================================================
// 1. USER BLUEPRINT UNLOCK  (₦1,000)
// ============================================================

// Returns true if the current calculation is already unlocked
function egUserBlueprintUnlocked() {
  if (egIsAdmin()) return true;
  return !!(window._egCurrentUser && window._egCurrentUser._blueprintUnlocked);
}

// Call this after a successful user payment OR admin bypass
async function egGrantBlueprintAccess(calcId) {
  // Update in-memory flag
  if (window._egCurrentUser) window._egCurrentUser._blueprintUnlocked = true;

  // If logged in, persist to Supabase
  if (supabaseClient && window._egCurrentUser && window._egCurrentUser.id && calcId) {
    await supabaseClient
      .from('saved_calculations')
      .update({ is_unlocked: true, is_lead_available: true })
      .eq('id', calcId)
      .catch(e => console.warn('Blueprint unlock persist failed:', e));
  }

  egApplyBlueprintUnlock();
}

// Apply unlock — show technical specs, hide paywall prompts (both screens)
function egApplyBlueprintUnlock() {
  // Cost screen
  const specs = document.getElementById('eg-technical-specs');
  if (specs) specs.style.display = 'block';
  const costPrompt = document.getElementById('eg-cost-paywall-prompt');
  if (costPrompt) costPrompt.style.display = 'none';

  // Calculator screen
  const cableSection = document.getElementById('eg-cable-paywall-section');
  if (cableSection) cableSection.style.display = 'block';
  const cablePrompt = document.getElementById('eg-cable-paywall-prompt');
  if (cablePrompt) cablePrompt.style.display = 'none';
}

// Show paywall state — hide specs, show prompts
function egShowBlueprintPaywall(calcId) {
  if (egUserBlueprintUnlocked()) {
    egApplyBlueprintUnlock();
    return;
  }
  // Store calcId globally so both prompts can access it
  window._egCurrentCalcId = calcId || null;

  // Cost screen — hide specs, show prompt
  const specs = document.getElementById('eg-technical-specs');
  if (specs) specs.style.display = 'none';
  const costPrompt = document.getElementById('eg-cost-paywall-prompt');
  if (costPrompt) costPrompt.style.display = 'block';

  // Calculator screen — hide cables, show prompt
  const cableSection = document.getElementById('eg-cable-paywall-section');
  if (cableSection) cableSection.style.display = 'none';
  const cablePrompt = document.getElementById('eg-cable-paywall-prompt');
  if (cablePrompt) cablePrompt.style.display = 'block';
}

async function egPayForBlueprint(calcId) {
  // Admin bypass — skip Paystack entirely
  if (egIsAdmin()) {
    showToast('Admin bypass — blueprint unlocked.', 'success');
    await egGrantBlueprintAccess(calcId);
    return;
  }

  const email = egGetPaymentEmail();
  egLaunchPaystack({
    email,
    amountNaira: EG_PRICES.USER_BLUEPRINT,
    metadata: { type: 'user_blueprint', calc_id: calcId || '', user_id: window._egCurrentUser?.id || 'guest' },
    onSuccess: async function(response) {
      showToast('Payment confirmed! Unlocking your blueprint...', 'success');
      await egGrantBlueprintAccess(calcId);
    },
    onClose: function() {
      showToast('Payment cancelled.', 'info');
    }
  });
}

// ============================================================
// 2. INSTALLER PRO SUBSCRIPTION  (₦3,500/month)
// ============================================================

function egInstallerIsPro() {
  if (egIsAdmin()) return true;
  const user = window._egCurrentUser;
  if (!user) return false;
  if (user.subscription_plan === 'pro' || user.subscription_plan === 'lifetime_pro') {
    // Check expiry
    if (user.subscription_expires_at) {
      return new Date(user.subscription_expires_at) > new Date();
    }
    return true;
  }
  return false;
}

// Gate function — intercepts navigation to Pro-only installer screens
// Call this instead of showScreen() for gated screens
function egInstallerProGate(targetScreen) {
  if (egInstallerIsPro()) {
    showScreen(targetScreen);
    return;
  }
  egShowInstallerUpgradeModal(targetScreen);
}

function egShowInstallerUpgradeModal(intendedScreen) {
  egRemoveModal();
  const modal = document.createElement('div');
  modal.id = 'eg-upgrade-modal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:1000;
    background:rgba(0,0,0,0.55);
    display:flex;align-items:center;justify-content:center;
    padding:20px;
  `;
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:32px 24px;max-width:340px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
      <div style="font-size:40px;margin-bottom:12px;">🛠️</div>
      <div style="font-weight:800;font-size:18px;margin-bottom:8px;color:#111827;">Installer Pro Required</div>
      <div style="font-size:13px;color:#6b7280;margin-bottom:20px;line-height:1.6;">
        The <strong>Professional Calculator</strong> and <strong>Quote Builder</strong>
        are Pro features. Size systems, build branded PDF quotes and win more jobs.
      </div>
      <div style="background:#f0fdf4;border-radius:12px;padding:14px;margin-bottom:20px;">
        <div style="font-size:24px;font-weight:800;color:#16a34a;">₦3,500<span style="font-size:13px;font-weight:400;color:#6b7280;">/month</span></div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">Less than a week's data &amp; fuel</div>
      </div>
      <button onclick="egPayInstallerPro('${intendedScreen}')"
        style="width:100%;background:#22C55E;color:#fff;border:none;border-radius:12px;
               padding:14px;font-size:15px;font-weight:700;cursor:pointer;
               box-shadow:0 4px 14px rgba(34,197,94,0.4);margin-bottom:10px;">
        ✅ Go Pro — ₦3,500/month
      </button>
      <button onclick="egRemoveModal()"
        style="width:100%;background:transparent;border:1px solid #e5e7eb;border-radius:12px;
               padding:12px;font-size:14px;color:#6b7280;cursor:pointer;">
        Not now
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

async function egPayInstallerPro(intendedScreen) {
  // Admin bypass
  if (egIsAdmin()) {
    egRemoveModal();
    showToast('Admin bypass — Pro access granted.', 'success');
    if (window._egCurrentUser) {
      window._egCurrentUser.subscription_plan = 'pro';
      window._egCurrentUser.subscription_expires_at = new Date(Date.now() + 30*24*60*60*1000).toISOString();
    }
    if (intendedScreen) showScreen(intendedScreen);
    return;
  }

  egRemoveModal();
  const email = egGetPaymentEmail();
  egLaunchPaystack({
    email,
    amountNaira: EG_PRICES.INSTALLER_PRO_MONTHLY,
    metadata: { type: 'installer_pro', user_id: window._egCurrentUser?.id || '' },
    onSuccess: async function(response) {
      showToast('Pro activated! Welcome to Installer Pro.', 'success');
      await egActivateProSubscription('installer');
      if (intendedScreen) showScreen(intendedScreen);
    },
    onClose: function() {
      showToast('Payment cancelled.', 'info');
    }
  });
}

async function egActivateProSubscription(role) {
  if (!window._egCurrentUser) return;
  const expires = new Date(Date.now() + 30*24*60*60*1000).toISOString();
  window._egCurrentUser.subscription_plan         = 'pro';
  window._egCurrentUser.subscription_expires_at   = expires;

  if (supabaseClient && window._egCurrentUser.id) {
    await supabaseClient.from('profiles').update({
      subscription_plan:       'pro',
      subscription_expires_at: expires,
    }).eq('id', window._egCurrentUser.id)
    .catch(e => console.warn('Pro activation persist failed:', e));
  }
}

// ============================================================
// 3. INSTALLER WALLET + LEAD UNLOCK  (₦2,000/lead)
// ============================================================

function egInstallerWalletBalance() {
  return Number(window._egCurrentUser?.wallet_balance || 0);
}

// Called from job leads — unlock a specific lead's contact details
async function egUnlockLead(leadId, onUnlocked) {
  if (egIsAdmin()) {
    showToast('Admin bypass — lead unlocked.', 'success');
    if (typeof onUnlocked === 'function') onUnlocked(leadId);
    return;
  }

  const balance = egInstallerWalletBalance();
  if (balance >= EG_PRICES.INSTALLER_LEAD) {
    // Enough in wallet — spend directly
    await egSpendWalletForLead(leadId, onUnlocked);
  } else {
    // Need to top up first
    egShowWalletTopupModal(leadId, onUnlocked);
  }
}

async function egSpendWalletForLead(leadId, onUnlocked) {
  const newBalance = egInstallerWalletBalance() - EG_PRICES.INSTALLER_LEAD;

  // Optimistic UI update
  if (window._egCurrentUser) window._egCurrentUser.wallet_balance = newBalance;

  if (supabaseClient && window._egCurrentUser?.id) {
    // Deduct wallet
    await supabaseClient.from('profiles').update({
      wallet_balance: newBalance
    }).eq('id', window._egCurrentUser.id)
    .catch(e => console.warn('Wallet deduct failed:', e));

    // Record unlock
    await supabaseClient.from('lead_unlocks').insert([{
      installer_id: window._egCurrentUser.id,
      lead_id:      leadId,
      amount_paid:  EG_PRICES.INSTALLER_LEAD,
      unlocked_at:  new Date().toISOString(),
    }]).catch(e => console.warn('Lead unlock record failed:', e));
  }

  showToast(`Lead unlocked! ₦${EG_PRICES.INSTALLER_LEAD.toLocaleString()} deducted. Wallet: ₦${newBalance.toLocaleString()}`, 'success');
  if (typeof onUnlocked === 'function') onUnlocked(leadId);
}

function egShowWalletTopupModal(pendingLeadId, onUnlocked) {
  egRemoveModal();
  const balance = egInstallerWalletBalance();
  const modal = document.createElement('div');
  modal.id = 'eg-upgrade-modal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:1000;
    background:rgba(0,0,0,0.55);
    display:flex;align-items:center;justify-content:center;
    padding:20px;
  `;
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:32px 24px;max-width:340px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
      <div style="font-size:40px;margin-bottom:12px;">💼</div>
      <div style="font-weight:800;font-size:18px;margin-bottom:8px;color:#111827;">Top Up Your Wallet</div>
      <div style="font-size:13px;color:#6b7280;margin-bottom:6px;line-height:1.6;">
        Unlocking a lead costs <strong>₦${EG_PRICES.INSTALLER_LEAD.toLocaleString()}</strong>.<br>
        Your current balance: <strong style="color:${balance>0?'#16a34a':'#ef4444'}">₦${balance.toLocaleString()}</strong>
      </div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:20px;">
        Top up ₦10,000 → unlock up to 5 leads
      </div>
      <div style="background:#f0f9ff;border-radius:12px;padding:14px;margin-bottom:20px;">
        <div style="font-size:24px;font-weight:800;color:#0284c7;">₦10,000</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">= 5 verified leads · Spend ₦2,000 each</div>
      </div>
      <button onclick="egPayWalletTopup('${pendingLeadId}')"
        style="width:100%;background:#22C55E;color:#fff;border:none;border-radius:12px;
               padding:14px;font-size:15px;font-weight:700;cursor:pointer;
               box-shadow:0 4px 14px rgba(34,197,94,0.4);margin-bottom:10px;">
        💳 Top Up ₦10,000
      </button>
      <button onclick="egRemoveModal()"
        style="width:100%;background:transparent;border:1px solid #e5e7eb;border-radius:12px;
               padding:12px;font-size:14px;color:#6b7280;cursor:pointer;">
        Cancel
      </button>
    </div>
  `;
  // Store callback for after payment
  window._egPendingLeadUnlock = { leadId: pendingLeadId, onUnlocked };
  document.body.appendChild(modal);
}

async function egPayWalletTopup(pendingLeadId) {
  if (egIsAdmin()) {
    egRemoveModal();
    showToast('Admin bypass — wallet topped up.', 'success');
    if (window._egCurrentUser) window._egCurrentUser.wallet_balance = (egInstallerWalletBalance() + EG_PRICES.INSTALLER_WALLET_TOPUP);
    // Now spend for the pending lead
    const pending = window._egPendingLeadUnlock;
    if (pending) await egSpendWalletForLead(pending.leadId, pending.onUnlocked);
    window._egPendingLeadUnlock = null;
    return;
  }

  egRemoveModal();
  const email = egGetPaymentEmail();
  egLaunchPaystack({
    email,
    amountNaira: EG_PRICES.INSTALLER_WALLET_TOPUP,
    metadata: { type: 'installer_wallet_topup', user_id: window._egCurrentUser?.id || '' },
    onSuccess: async function(response) {
      // Credit wallet in Supabase
      const newBalance = egInstallerWalletBalance() + EG_PRICES.INSTALLER_WALLET_TOPUP;
      if (window._egCurrentUser) window._egCurrentUser.wallet_balance = newBalance;

      if (supabaseClient && window._egCurrentUser?.id) {
        await supabaseClient.from('profiles').update({
          wallet_balance: newBalance
        }).eq('id', window._egCurrentUser.id)
        .catch(e => console.warn('Wallet topup persist failed:', e));
      }

      showToast(`Wallet topped up! Balance: ₦${newBalance.toLocaleString()}`, 'success');

      // Now spend for the pending lead
      const pending = window._egPendingLeadUnlock;
      if (pending) await egSpendWalletForLead(pending.leadId, pending.onUnlocked);
      window._egPendingLeadUnlock = null;
    },
    onClose: function() {
      showToast('Top-up cancelled.', 'info');
    }
  });
}

// ============================================================
// 4. VENDOR PRO SUBSCRIPTION  (₦10,000/month)
// ============================================================

function egVendorIsPro() {
  if (egIsAdmin()) return true;
  const user = window._egCurrentUser;
  if (!user) return false;
  if (user.subscription_plan === 'pro' || user.subscription_plan === 'lifetime_pro') {
    if (user.subscription_expires_at) {
      return new Date(user.subscription_expires_at) > new Date();
    }
    return true;
  }
  return false;
}

function egVendorProGate(targetScreen) {
  if (egVendorIsPro()) {
    showScreen(targetScreen);
    return;
  }
  egShowVendorUpgradeModal(targetScreen);
}

function egShowVendorUpgradeModal(intendedScreen) {
  egRemoveModal();
  const modal = document.createElement('div');
  modal.id = 'eg-upgrade-modal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:1000;
    background:rgba(0,0,0,0.55);
    display:flex;align-items:center;justify-content:center;
    padding:20px;
  `;
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:32px 24px;max-width:340px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
      <div style="font-size:40px;margin-bottom:12px;">📦</div>
      <div style="font-weight:800;font-size:18px;margin-bottom:8px;color:#111827;">Vendor Pro Required</div>
      <div style="font-size:13px;color:#6b7280;margin-bottom:20px;line-height:1.6;">
        The <strong>Sales Calculator</strong> and <strong>Offer Builder</strong> are Pro features.
        Plus unlimited listings and featured placement — your products shown first after every calculation.
      </div>
      <div style="background:#fef3c7;border-radius:12px;padding:14px;margin-bottom:20px;">
        <div style="font-size:24px;font-weight:800;color:#d97706;">₦10,000<span style="font-size:13px;font-weight:400;color:#6b7280;">/month</span></div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">Targeted ads to active buyers — cheapest you'll find</div>
      </div>
      <button onclick="egPayVendorPro('${intendedScreen}')"
        style="width:100%;background:#F59E0B;color:#fff;border:none;border-radius:12px;
               padding:14px;font-size:15px;font-weight:700;cursor:pointer;
               box-shadow:0 4px 14px rgba(245,158,11,0.4);margin-bottom:10px;">
        ✅ Go Pro — ₦10,000/month
      </button>
      <button onclick="egRemoveModal()"
        style="width:100%;background:transparent;border:1px solid #e5e7eb;border-radius:12px;
               padding:12px;font-size:14px;color:#6b7280;cursor:pointer;">
        Not now
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

async function egPayVendorPro(intendedScreen) {
  if (egIsAdmin()) {
    egRemoveModal();
    showToast('Admin bypass — Vendor Pro access granted.', 'success');
    if (window._egCurrentUser) {
      window._egCurrentUser.subscription_plan = 'pro';
      window._egCurrentUser.subscription_expires_at = new Date(Date.now() + 30*24*60*60*1000).toISOString();
    }
    if (intendedScreen) showScreen(intendedScreen);
    return;
  }

  egRemoveModal();
  const email = egGetPaymentEmail();
  egLaunchPaystack({
    email,
    amountNaira: EG_PRICES.VENDOR_PRO_MONTHLY,
    metadata: { type: 'vendor_pro', user_id: window._egCurrentUser?.id || '' },
    onSuccess: async function(response) {
      showToast('Vendor Pro activated! Welcome.', 'success');
      await egActivateProSubscription('vendor');
      if (intendedScreen) showScreen(intendedScreen);
    },
    onClose: function() {
      showToast('Payment cancelled.', 'info');
    }
  });
}

// ============================================================
// 5. SHARED UTILITIES
// ============================================================

function egRemoveModal() {
  const m = document.getElementById('eg-upgrade-modal');
  if (m) m.remove();
}

// Close modal on backdrop click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('eg-upgrade-modal');
  if (modal && e.target === modal) egRemoveModal();
});
