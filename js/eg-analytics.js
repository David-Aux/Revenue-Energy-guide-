// ═══════════════════════════════════════════════════════════════════════════
// EnergyGuide — Analytics & Data Capture (eg-analytics.js)
// Load order: LAST — after calc-user.js, calc-vendor.js, calc-installer.js,
// calc-ci.js, platform.js, corporate.js, eg-post-calc-extras.js.
//
// WHAT THIS FILE DOES
//   • Tracks every calculation attempt (User/Installer/Vendor/C&I, in every
//     portal context including Agent) into `calculation_events`.
//   • Captures a low-friction email/WhatsApp for GUEST calculators so
//     non-converting visitors can still be followed up with.
//   • Marks a session as "converted" the moment a calc turns into a real
//     lead/quote-request/agent-submission, so the Admin Portal can show a
//     clean "calculated but never reached out" drop-off list.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO
//   • It never modifies any calculation engine. Every hook here is a
//     function WRAP (save reference, call through, observe the result) —
//     calc-user.js, calc-vendor.js, calc-installer.js, calc-ci.js are
//     completely untouched.
//   • All tracking is fire-and-forget try/catch — it can never break or
//     slow down the calculator itself.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ── Session ID — persists per-browser so a guest's calculation can be
  // linked to a later lead/quote-request without requiring login ─────────
  function egSessionId() {
    try {
      let sid = localStorage.getItem('eg_session_id');
      if (!sid) {
        sid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
            : 'eg-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        localStorage.setItem('eg_session_id', sid);
      }
      return sid;
    } catch (e) {
      return 'eg-nosession';
    }
  }
  window.egSessionId = egSessionId;

  function egIsGuest() {
    const signedIn = !!(typeof currentUser !== 'undefined' && currentUser && currentUser.id);
    if (signedIn) return false;
    // Gate-registered users already gave name/email/phone/password during
    // registration — don't ask them again via the guest-capture widget.
    const gateRegistered = (typeof egUserGateCompleted === 'function') && egUserGateCompleted();
    return !gateRegistered;
  }
  function egCurrentUserId() {
    return (typeof currentUser !== 'undefined' && currentUser && currentUser.id) ? currentUser.id : null;
  }

  // ── Pull a consistent sizing summary out of whatever shape a calc result
  // happens to be (residential flat object vs C&I `s` object) ────────────
  function egExtractSizingFields(r) {
    if (!r) return {};
    const invKva   = r.invKva || r.totalKva || 0;
    const dailyKwh = r.dailyKwh || 0;
    const panels   = r.numPanels || r.panelCount || r.panels || 0;
    const battKwh  = r.lithiumPackKwh || (r.bess && r.bess.totalKwh) || 0;
    const parts = [];
    if (invKva) parts.push(invKva + 'kVA');
    if (panels) parts.push(panels + ' panels');
    if (dailyKwh) parts.push(dailyKwh + 'kWh/day');
    if (battKwh) parts.push(battKwh + 'kWh battery');
    return { invKva, dailyKwh, panels, battKwh, summary: parts.join(' · ') };
  }

  // ── Core tracker — call this with a portal tag + the calc result ───────
  // portal: 'user' | 'installer' | 'vendor' | 'agent' |
  //         'ci-user' | 'ci-installer' | 'ci-vendor' | 'ci-agent'
  async function egTrackCalc(portal, resultObj) {
    try {
      if (!supabaseClient) return;
      const f = egExtractSizingFields(resultObj);
      const row = {
        portal,
        session_id: egSessionId(),
        user_id: egCurrentUserId(),
        is_guest: egIsGuest(),
        sizing_summary: f.summary || null,
        inverter_kva: f.invKva || null,
        daily_kwh: f.dailyKwh || null,
        panel_count: f.panels || null,
        battery_kwh: f.battKwh || null
      };
      const { data, error } = await supabaseClient.from('calculation_events').insert([row]).select('id').single();
      if (!error && data) window._egLastCalcEventId = data.id;
    } catch (e) {
      // Tracking must never break the calculator
    }
  }
  window.egTrackCalc = egTrackCalc;

  // ── Conversion marking — call this the moment a calc turns into a real
  // lead / quote-request / agent submission ───────────────────────────────
  async function egMarkConverted() {
    try {
      if (!supabaseClient) return;
      await supabaseClient.from('calculation_events')
        .update({ converted_to_lead: true })
        .eq('session_id', egSessionId())
        .eq('converted_to_lead', false);
    } catch (e) { /* silent */ }
  }
  window.egMarkConverted = egMarkConverted;

  // ── Guest contact capture widget — injected into a target <div> right
  // after a guest calculates. Optional, low-friction, two fields. ────────
  window.egRenderGuestCapture = function (targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    if (!egIsGuest() || !window._egLastCalcEventId) { el.innerHTML = ''; return; }
    el.innerHTML =
      '<div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);border-radius:12px;padding:14px 16px;margin:12px 0;">' +
      '<div style="font-size:13px;font-weight:700;color:#a5b4fc;margin-bottom:8px;">📧 Want a copy of this calculation?</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
      '<input type="email" id="egGuestEmail-' + targetId + '" placeholder="Email (optional)" style="flex:1;min-width:140px;padding:9px 10px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-size:13px;">' +
      '<input type="tel" id="egGuestPhone-' + targetId + '" placeholder="WhatsApp number (optional)" style="flex:1;min-width:140px;padding:9px 10px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-size:13px;">' +
      '</div>' +
      '<button onclick="egSubmitGuestCapture(\'' + targetId + '\')" style="width:100%;margin-top:8px;padding:10px;background:#6366f1;border:none;border-radius:8px;color:white;font-size:13px;font-weight:700;cursor:pointer;">Send me this</button>' +
      '</div>';
  };

  window.egSubmitGuestCapture = async function (targetId) {
    const email = (document.getElementById('egGuestEmail-' + targetId)?.value || '').trim();
    const phone = (document.getElementById('egGuestPhone-' + targetId)?.value || '').trim();
    if (!email && !phone) {
      if (typeof showToast === 'function') showToast('Enter an email or WhatsApp number first', 'error');
      return;
    }
    try {
      if (window._egLastCalcEventId && supabaseClient) {
        await supabaseClient.from('calculation_events')
          .update({ contact_email: email || null, contact_phone: phone || null })
          .eq('id', window._egLastCalcEventId);
      }
      const el = document.getElementById(targetId);
      if (el) el.innerHTML = '<div style="padding:12px;text-align:center;color:#22c55e;font-size:13px;">✓ Saved — we\'ll keep this on file for you.</div>';
    } catch (e) {
      if (typeof showToast === 'function') showToast('Could not save — please try again', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // WRAPPERS — observe calculation results without touching any engine
  // ─────────────────────────────────────────────────────────────────────

  // User + Vendor (both route through this shared bridge function) + Agent residential
  (function () {
    const _origReceive = window.receiveEmbeddedCalculation;
    window.receiveEmbeddedCalculation = function (mode, result, apps) {
      if (typeof _origReceive === 'function') _origReceive(mode, result, apps);
      try {
        const isAgent = mode === 'user' && window._egAgentModeActive === true;
        const portalTag = isAgent ? 'agent' : mode; // 'user' | 'vendor' | 'agent'
        egTrackCalc(portalTag, result);
        if (!isAgent) {
          setTimeout(function () {
            egRenderGuestCapture(mode === 'user' ? 'egGuestCapture-user' : 'egGuestCapture-vendor');
          }, 50);
        }
      } catch (e) { /* silent */ }
    };
  })();

  // Installer
  (function () {
    const _origCalc = window.l4i_calculate;
    if (typeof _origCalc === 'function') {
      window.l4i_calculate = function () {
        _origCalc.apply(this, arguments);
        try {
          if (typeof instCalculationResult !== 'undefined' && instCalculationResult) {
            egTrackCalc('installer', instCalculationResult);
            setTimeout(function () { egRenderGuestCapture('egGuestCapture-installer'); }, 50);
          }
        } catch (e) { /* silent */ }
      };
    }
  })();

  // C&I — context-aware via window._ciContext (user/installer/vendor/agent)
  (function () {
    const _origCalc = window.l4ci_calculate;
    if (typeof _origCalc === 'function') {
      window.l4ci_calculate = function () {
        _origCalc.apply(this, arguments);
        try {
          if (window.l4ci__lastResult) {
            const ctx = window._ciContext || 'user';
            egTrackCalc('ci-' + ctx, window.l4ci__lastResult);
            if (ctx === 'user') {
              setTimeout(function () { egRenderGuestCapture('ciActionsGuestCapture'); }, 50);
            }
          }
        } catch (e) { /* silent */ }
      };
    }
  })();

  // ─────────────────────────────────────────────────────────────────────
  // CONVERSION WRAPPERS — mark a session converted the moment a real
  // lead / quote-request goes out
  // ─────────────────────────────────────────────────────────────────────

  // C&I quote request (View Installers / View Vendors)
  (function () {
    const _origSubmit = window.ciSubmitQuoteRequest;
    if (typeof _origSubmit === 'function') {
      window.ciSubmitQuoteRequest = async function () {
        const ret = await _origSubmit.apply(this, arguments);
        try { egMarkConverted(); } catch (e) { /* silent */ }
        return ret;
      };
    }
  })();

})();
