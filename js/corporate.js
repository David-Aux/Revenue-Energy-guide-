// ================================================================
// ENERGY GUIDE — CORPORATE PARTNER MODULE
// corporate.js — loaded after platform.js
// Option C: Agent uses the REAL user-calculator screen directly.
// No duplicate HTML. No ID conflicts.
// ================================================================

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────
  let corpSession     = null;
  let agentPortalCode = null;
  let agentInfo       = null;
  let agentCalcResult = null;
  let agentLastApps   = [];

  // ── Supabase helper ────────────────────────────────────────────
  function getSupabase() {
    return (typeof supabaseClient !== 'undefined' && supabaseClient)
      ? supabaseClient : window.supabaseClient || null;
  }

  // ── Helpers: show/hide agent mode on user-calculator ──────────
  function enterAgentCalcMode() {
    // Public flag — lets eg-analytics.js tag calculation events as 'agent'
    // instead of 'user' without needing access to the private agentInfo var.
    window._egAgentModeActive = true;
    // Hide everything that's for regular users
    ['userGuestBanner','userCalcBackBar','userCalcGuestBackBtn','userPostCalcActions'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // Show agent banner
    const banner     = document.getElementById('agentCalcBanner');
    const bannerText = document.getElementById('agentCalcBannerText');
    if (banner)     banner.style.display = '';
    if (bannerText && agentInfo) {
      bannerText.textContent = 'Agent: ' + agentInfo.name + ' (#' + agentInfo.code + ') — ' + (agentInfo.city ? agentInfo.city + ', ' : '') + agentInfo.state;
    }
    // Only hide agent submit panel if no result exists yet; preserve it if calc already ran
    const agentPost = document.getElementById('agentPostCalcActions');
    if (agentPost && !agentCalcResult) agentPost.style.display = 'none';
  }

  function exitAgentCalcMode() {
    window._egAgentModeActive = false;
    // Hide agent-specific elements
    const banner  = document.getElementById('agentCalcBanner');
    const agentPost = document.getElementById('agentPostCalcActions');
    if (banner)    banner.style.display    = 'none';
    if (agentPost) agentPost.style.display = 'none';
  }


  // ── URL param: ?agent=CODE ─────────────────────────────────────
  function checkAgentUrl() {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('agent');
    if (code) {
      agentPortalCode = code.toUpperCase();
      setTimeout(() => launchAgentPortal(agentPortalCode), 700);
    }
  }

  async function launchAgentPortal(code) {
    const sb = getSupabase();
    let companyName = code;
    if (sb) {
      try {
        const { data } = await sb.from('corporate_partners').select('company_name').eq('company_code', code).single();
        if (data) companyName = data.company_name;
      } catch (e) {}
    }
    agentPortalCode = code;
    const nameEl = document.getElementById('agentPortalCompanyName');
    if (nameEl) nameEl.textContent = companyName + ' — Agent Portal';
    resetAgentSession();
    if (typeof showScreen === 'function') showScreen('corporate-agent-portal');
  }

  function resetAgentSession() {
    agentInfo       = null;
    agentCalcResult = null;
    agentLastApps   = [];
    ['agentCode','agentName','agentPhone','agentCity'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const st = document.getElementById('agentState');
    if (st) st.value = '';
    const infoBar = document.getElementById('agentInfoBar');
    if (infoBar) infoBar.style.display = 'none';
    document.getElementById('agentStep1').style.display = '';
    exitAgentCalcMode();
    if (typeof l4u_resetCalculatorSession === 'function') l4u_resetCalculatorSession();
  }

  // ── Corporate Auth ─────────────────────────────────────────────
  window.corporateLogin = async function () {
    const email    = (document.getElementById('corpLoginEmail')?.value    || '').trim();
    const password = (document.getElementById('corpLoginPassword')?.value || '').trim();
    const emailErr = document.getElementById('corpLoginEmailError');
    const passErr  = document.getElementById('corpLoginPasswordError');
    if (emailErr) emailErr.textContent = '';
    if (passErr)  passErr.textContent  = '';
    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { if (emailErr) emailErr.textContent = 'Valid email required'; valid = false; }
    if (!password) { if (passErr) passErr.textContent = 'Password required'; valid = false; }
    if (!valid) return;

    if (typeof showLoading === 'function') showLoading(true, 'Logging in...');
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }
    try {
      const { data: authData, error: authErr } = await sb.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;
      const { data: corpData, error: corpErr } = await sb.from('corporate_partners').select('*').eq('user_id', authData.user.id).single();
      if (corpErr || !corpData) throw new Error('No corporate account found for this email.');
      corpSession = { ...corpData, email };
      if (typeof showLoading === 'function') showLoading(false);
      openCorporateDashboard();
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast(err.message || 'Login failed', 'error');
    }
  };

  window.corporateForgotPassword = async function () {
    const email  = (document.getElementById('corpForgotEmail')?.value || '').trim();
    const errEl  = document.getElementById('corpForgotEmailError');
    if (errEl) errEl.textContent = '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errEl) errEl.textContent = 'Valid email required';
      return;
    }
    if (typeof showLoading === 'function') showLoading(true, 'Sending reset link...');
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }
    try {
      // Tag this reset as belonging to the corporate portal so the recovery
      // handler in platform.js routes the user back here (not to the
      // consumer/vendor reset screen) once they click the email link.
      localStorage.setItem('pendingPasswordResetRole', 'corporate');
      // Use the same generic redirect URL every other portal uses — role
      // routing happens via the localStorage flag above, not a URL param.
      const redirectUrl = (typeof getAppRedirectUrl === 'function') ? getAppRedirectUrl() : window.location.origin + window.location.pathname;
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      if (error) throw error;
      if (typeof showLoading === 'function') showLoading(false);
      const step1 = document.getElementById('corpForgotStep1');
      const ok    = document.getElementById('corpForgotSuccess');
      if (step1) step1.style.display = 'none';
      if (ok)    ok.style.display    = '';
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      localStorage.removeItem('pendingPasswordResetRole');
      if (errEl) errEl.textContent = err.message || 'Failed to send reset link. Try again.';
    }
  };

  // Step 3 — sets the new password once the partner has clicked the email
  // link and platform.js has routed them back to this screen's step 3.
  window.corporateForgotStep3 = async function () {
    const newPassword     = document.getElementById('corpForgotNewPassword')?.value || '';
    const confirmPassword = document.getElementById('corpForgotConfirmPassword')?.value || '';
    const newPwdErr  = document.getElementById('corpForgotNewPasswordError');
    const confirmErr = document.getElementById('corpForgotConfirmPasswordError');
    if (newPwdErr)  newPwdErr.textContent  = '';
    if (confirmErr) confirmErr.textContent = '';

    if (!newPassword || newPassword.length < 8) {
      if (newPwdErr) newPwdErr.textContent = 'Minimum 8 characters required';
      return;
    }
    if (newPassword !== confirmPassword) {
      if (confirmErr) confirmErr.textContent = 'Passwords do not match';
      return;
    }
    if (typeof passwordRecoveryMode !== 'undefined' && !passwordRecoveryMode) {
      if (typeof showToast === 'function') showToast('Session expired. Please request a new reset link.', 'error');
      return;
    }

    if (typeof showLoading === 'function') showLoading(true, 'Updating password...');
    const result = (typeof supabaseUpdatePassword === 'function')
      ? await supabaseUpdatePassword(newPassword)
      : { success: false, error: 'Update function unavailable' };
    if (typeof showLoading === 'function') showLoading(false);

    if (!result.success) {
      if (typeof showToast === 'function') showToast(result.error || 'Could not update password. Try requesting a new link.', 'error');
      return;
    }

    if (typeof supabaseSignOut === 'function') await supabaseSignOut();
    if (typeof passwordRecoveryMode !== 'undefined') passwordRecoveryMode = false;
    localStorage.removeItem('pendingPasswordResetRole');
    if (typeof clearAuthHashFromUrl === 'function') clearAuthHashFromUrl();
    if (typeof showToast === 'function') showToast('Password updated! Please sign in with your new password.', 'success');

    // Reset the screen back to step 1 for next time, then return to login
    const s1 = document.getElementById('corpForgotStep1');
    const s3 = document.getElementById('corpForgotStep3');
    const ok = document.getElementById('corpForgotSuccess');
    if (s3) s3.style.display = 'none';
    if (ok) ok.style.display = 'none';
    if (s1) s1.style.display = '';
    const emailEl = document.getElementById('corpForgotEmail');
    if (emailEl) emailEl.value = '';
    const newPwdEl = document.getElementById('corpForgotNewPassword');
    const confirmPwdEl = document.getElementById('corpForgotConfirmPassword');
    if (newPwdEl) newPwdEl.value = '';
    if (confirmPwdEl) confirmPwdEl.value = '';

    showScreen('corporate-login');
  };


  window.corporateRegister = async function () {
    const company  = (document.getElementById('corpRegCompany')?.value   || '').trim();
    const rawCode  = (document.getElementById('corpRegCode')?.value       || '').trim().toUpperCase();
    const contact  = (document.getElementById('corpRegContact')?.value    || '').trim();
    let   phone    = (document.getElementById('corpRegPhone')?.value      || '').trim();
    const email    = (document.getElementById('corpRegEmail')?.value      || '').trim();
    const password = (document.getElementById('corpRegPassword')?.value   || '').trim();
    const industry = (document.getElementById('corpRegIndustry')?.value   || '');
    const consented = !!document.getElementById('corpRegConsent')?.checked;

    const phoneCheck = (typeof validateNigerianPhone === 'function') ? validateNigerianPhone(phone) : { valid: phone.length >= 7, normalized: phone };
    const errs = {
      corpRegCompanyError:  company.length  < 2 ? 'Company name required'  : '',
      corpRegCodeError:     rawCode.length  < 2 ? 'Company code required'  : '',
      corpRegContactError:  contact.length  < 2 ? 'Contact name required'  : '',
      corpRegPhoneError:    !phone ? 'Phone number required' : (!phoneCheck.valid ? 'Enter a valid Nigerian number, e.g. 080XXXXXXXX' : ''),
      corpRegEmailError:    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Valid email required' : '',
      corpRegPasswordError: password.length < 8 ? 'Min 8 characters'       : '',
      corpRegConsentError:  !consented ? 'Please agree to the Privacy Policy to continue' : ''
    };
    let valid = true;
    Object.entries(errs).forEach(([id, msg]) => { const el = document.getElementById(id); if (el) el.textContent = msg; if (msg) valid = false; });
    if (!valid) return;

    if (phoneCheck.valid && phoneCheck.normalized) phone = phoneCheck.normalized;
    const consentTimestamp = new Date().toISOString();

    if (typeof showLoading === 'function') showLoading(true, 'Creating account...');
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }
    try {
      const { data: authData, error: authErr } = await sb.auth.signUp({ email, password });
      if (authErr) throw authErr;

      // Supabase signals "email already has an account" by returning a user
      // with an empty identities array, instead of an error (anti-enumeration).
      const identities = (authData && authData.user && authData.user.identities) || [];
      if (authData.user && identities.length === 0) {
        // Email already has an account — try to add Corporate Partner access to it.
        // Suppress auto-route-to-portal while we sign in to check/merge, so a
        // pre-existing Installer/Vendor profile doesn't hijack navigation.
        window._egSuppressAutoRoute = true;
        if (typeof showLoading === 'function') showLoading(true, 'Adding corporate access...');
        try {
        const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
        if (signInErr || !signInData || !signInData.user) {
          if (typeof showLoading === 'function') showLoading(false);
          const errEl = document.getElementById('corpRegEmailError');
          if (errEl) errEl.textContent = 'Email registered — enter its existing password above';
          if (typeof showToast === 'function') showToast('This email already has an account. Enter its existing password above to add Corporate Partner access, or <a href="javascript:void(0)" onclick="showScreen(\'corporate-forgot-password\')" style="color:#fff;text-decoration:underline;font-weight:700;">reset your password</a>.', 'error');
          return;
        }
        const { data: existingCorp } = await sb.from('corporate_partners').select('*').eq('user_id', signInData.user.id).maybeSingle();
        if (existingCorp) {
          if (typeof showLoading === 'function') showLoading(false);
          if (typeof showToast === 'function') showToast('You already have a Corporate Partner account. Use Sign In below.', 'info');
          if (typeof showScreen === 'function') showScreen('corporate-login');
          return;
        }
        const { error: insErr2 } = await sb.from('corporate_partners').insert([{
          user_id: signInData.user.id, company_name: company, company_code: rawCode,
          contact_name: contact, phone, email, industry, privacy_consent_at: consentTimestamp
        }]);
        if (insErr2) throw insErr2;
        if (typeof showLoading === 'function') showLoading(false);
        // Corporate Partner access requires no admin approval — straight to dashboard.
        corpSession = { user_id: signInData.user.id, company_name: company, company_code: rawCode, contact_name: contact, phone, email, industry };
        if (typeof showToast === 'function') showToast('Corporate Partner access added!', 'success');
        openCorporateDashboard();
        return;
        } finally {
          window._egSuppressAutoRoute = false;
        }
      }

      // Brand new account
      const { error: insErr } = await sb.from('corporate_partners').insert([{
        user_id: authData.user.id, company_name: company, company_code: rawCode,
        contact_name: contact, phone, email, industry, privacy_consent_at: consentTimestamp
      }]);
      if (insErr) throw insErr;
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Account created! Check your email to verify, then log in.', 'success');
      if (typeof showScreen === 'function') showScreen('corporate-login');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast(err.message || 'Registration failed', 'error');
    }
  };

  // ── Corporate Logout ───────────────────────────────────────────
  window.corporateLogout = function () {
    corpSession = null;
    if (typeof logout === 'function') logout();
    else if (typeof showScreen === 'function') showScreen('welcome');
  };

  // ── Corporate Dashboard ────────────────────────────────────────
  async function openCorporateDashboard() {
    if (!corpSession) return;
    const t = document.getElementById('corpDashTitle');
    const s = document.getElementById('corpDashSubtitle');
    if (t) t.textContent = corpSession.company_name + ' Dashboard';
    if (s) s.textContent = 'Code: ' + corpSession.company_code;
    const linkEl = document.getElementById('corpAgentLink');
    if (linkEl) linkEl.textContent = window.location.href.split('?')[0] + '?agent=' + corpSession.company_code;
    if (typeof showScreen === 'function') showScreen('corporate-dashboard');
    await loadCorpStats();
  }

  async function loadCorpStats() {
    if (!corpSession) return;
    const sb = getSupabase();
    if (!sb) return;
    try {
      const { data, error } = await sb
        .from('agent_submissions')
        .select('state, master_agent_code, super_agent_code')
        .eq('company_code', corpSession.company_code);
      if (error) throw error;

      const totalEl  = document.getElementById('corpStatTotal');
      const statesEl = document.getElementById('corpStatStates');
      const states   = [...new Set(data.map(r => r.state).filter(Boolean))];
      if (totalEl)  totalEl.textContent  = data.length;
      if (statesEl) statesEl.textContent = states.length;

      const breakdownEl = document.getElementById('corpStateBreakdown');
      const countEl     = document.getElementById('corpStateCount');
      if (countEl) countEl.textContent = states.length + ' State' + (states.length !== 1 ? 's' : '');

      if (!breakdownEl) return;

      if (data.length === 0) {
        breakdownEl.innerHTML = '<div style="text-align:center;padding:20px 0;"><div style="font-size:28px;opacity:0.3;">🗺</div><div style="font-size:13px;color:#4b5472;margin-top:8px;">No submissions yet. Share the agent link to get started.</div></div>';
        return;
      }

      // Check if any submissions have hierarchy codes
      const hasHierarchy = data.some(r => r.master_agent_code || r.super_agent_code);

      if (hasHierarchy) {
        // Build hierarchy tree: master → super → count
        const tree = {};
        data.forEach(r => {
          const master = r.master_agent_code || '(No Master Code)';
          const sup    = r.super_agent_code  || '(No Super Code)';
          if (!tree[master]) tree[master] = {};
          if (!tree[master][sup]) tree[master][sup] = 0;
          tree[master][sup]++;
        });

        const masterEntries = Object.entries(tree).sort((a, b) => {
          const aTotal = Object.values(a[1]).reduce((s, n) => s + n, 0);
          const bTotal = Object.values(b[1]).reduce((s, n) => s + n, 0);
          return bTotal - aTotal;
        });

        breakdownEl.innerHTML = masterEntries.map(([master, supers]) => {
          const masterTotal = Object.values(supers).reduce((s, n) => s + n, 0);
          const superRows = Object.entries(supers)
            .sort((a, b) => b[1] - a[1])
            .map(([sup, count]) => `
              <div style="display:flex;align-items:center;gap:8px;padding:7px 0 7px 16px;border-bottom:1px solid #1e2235;">
                <div style="width:5px;height:5px;border-radius:50%;background:#22d97a;flex-shrink:0;"></div>
                <div style="flex:1;font-size:12px;color:#a5adcf;">Supervisor: ${sup}</div>
                <div style="font-size:12px;font-weight:600;color:#22d97a;">${count} agent${count > 1 ? 's' : ''}</div>
              </div>`).join('');

          return `
            <div style="margin-bottom:10px;border:1px solid #2a2f4a;border-radius:10px;overflow:hidden;">
              <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:#1e2235;">
                <div style="width:8px;height:8px;border-radius:50%;background:#7c5cfc;box-shadow:0 0 6px #7c5cfc;flex-shrink:0;"></div>
                <div style="flex:1;font-size:13px;font-weight:700;color:#f0f2ff;">Network Head: ${master}</div>
                <div style="font-size:12px;font-weight:600;color:#a78bfa;">${masterTotal} total</div>
              </div>
              ${superRows}
            </div>`;
        }).join('');

      } else {
        // Fallback: plain state breakdown (no hierarchy codes used yet)
        const breakdown = {};
        data.forEach(r => { if (r.state) breakdown[r.state] = (breakdown[r.state] || 0) + 1; });
        const sorted   = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
        const maxCount = sorted.length > 0 ? sorted[0][1] : 1;
        breakdownEl.innerHTML = sorted.map(([state, count]) => {
          const pct = Math.round((count / maxCount) * 100);
          return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #1e2235;">
            <div style="width:7px;height:7px;border-radius:50%;background:#7c5cfc;box-shadow:0 0 6px #7c5cfc;flex-shrink:0;"></div>
            <div style="flex:1;font-size:13px;font-weight:500;color:#f0f2ff;">${state}</div>
            <div style="width:64px;height:4px;background:#1e2235;border-radius:4px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#7c5cfc,#22d97a);border-radius:4px;"></div>
            </div>
            <div style="font-family:'DM Mono',monospace;font-size:12px;font-weight:500;color:#a78bfa;min-width:24px;text-align:right;">${count}</div>
          </div>`;
        }).join('');
      }
    } catch (err) { console.warn('Corp stats error:', err.message); }
  }

  async function loadCorpSubmissions() {
    if (!corpSession) return;
    const sb     = getSupabase();
    const listEl = document.getElementById('corpSubmissionsList');
    if (!listEl) return;
    listEl.innerHTML = '<em style="color:#687076;">Loading...</em>';
    try {
      const { data, error } = await sb.from('agent_submissions').select('*').eq('company_code', corpSession.company_code).order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) { listEl.innerHTML = '<div style="text-align:center;padding:32px 0;"><div style="font-size:32px;opacity:0.3;">📋</div><div style="font-size:13px;color:#4b5472;margin-top:8px;">No agent submissions yet.</div></div>'; return; }
      listEl.innerHTML = data.map(sub => {
        const typeMap = { agent: '👤 Field Rep', super_agent: '⭐ Supervisor', master_agent: '🔷 Network Head' };
        const typeBadge = typeMap[sub.agent_type] || '👤 Agent';
        return `
        <div style="background:#141720;border:1px solid #1e2235;border-radius:14px;padding:16px;margin-bottom:10px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
            <div>
              <div style="font-size:14px;font-weight:700;color:#f0f2ff;margin-bottom:2px;">${sub.agent_name||'Agent'}</div>
              <div style="font-family:'DM Mono',monospace;font-size:10px;color:#4b5472;letter-spacing:0.06em;">Code: #${sub.agent_code}</div>
            </div>
            <span style="font-size:10px;font-weight:600;background:rgba(124,92,252,0.1);border:1px solid rgba(124,92,252,0.2);color:#a78bfa;padding:3px 9px;border-radius:20px;text-transform:uppercase;letter-spacing:0.04em;flex-shrink:0;">${sub.state||'—'}</span>
          </div>
          <div style="background:#0f1117;border:1px solid #1e2235;border-radius:8px;padding:8px 12px;margin-bottom:10px;display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
            <div style="font-size:11px;color:#f0f2ff;">${typeBadge}</div>
            ${sub.super_agent_code  ? `<div style="font-size:11px;color:#22d97a;">⭐ Super: <strong>${sub.super_agent_code}</strong></div>`  : ''}
            ${sub.master_agent_code ? `<div style="font-size:11px;color:#a78bfa;">🔷 Master: <strong>${sub.master_agent_code}</strong></div>` : ''}
          </div>
          <div style="display:flex;gap:14px;margin-bottom:10px;">
            <div style="font-size:11px;color:#8892a4;">📍 ${sub.city||'—'}</div>
            <div style="font-size:11px;color:#8892a4;">📞 ${sub.phone||'—'}</div>
          </div>
          <div style="background:#0f1117;border:1px solid #1e2235;border-radius:8px;padding:9px 12px;font-family:'DM Mono',monospace;font-size:10px;color:#8892a4;line-height:1.5;margin-bottom:8px;">${sub.sizing_summary||'—'}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
            <div style="font-size:10px;color:#4b5472;">${sub.created_at ? new Date(sub.created_at).toLocaleString('en-NG') : ''}</div>
            ${sub.receipt_status === 'received'
              ? `<div style="display:flex;align-items:center;gap:8px;">
                   <span style="font-size:10px;font-weight:600;background:rgba(5,150,105,0.15);border:1px solid rgba(5,150,105,0.3);color:#34d399;padding:3px 9px;border-radius:20px;">✅ Received</span>
                   ${sub.receipt_photo_url
                     ? `<button onclick="viewReceiptPhoto('${sub.receipt_photo_url}','${sub.agent_name||'Agent'}','${sub.receipt_confirmed_at||''}','${(sub.receipt_notes||'').replace(/'/g,'’')}')"\
                          style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(14,165,233,0.1);border:1px solid rgba(14,165,233,0.3);border-radius:20px;color:#38bdf8;font-size:10px;font-weight:600;cursor:pointer;">\
                          📷 View Photo\
                        </button>`
                     : ''}
                 </div>`
              : `<span style="font-size:10px;font-weight:600;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);color:#fbbf24;padding:3px 9px;border-radius:20px;">⏳ Pending</span>`
            }
          </div>
          ${sub.receipt_status === 'received' && sub.receipt_notes ? `<div style="margin-top:6px;padding:8px 12px;background:rgba(5,150,105,0.07);border:1px solid rgba(5,150,105,0.15);border-radius:8px;font-size:11px;color:#a7f3d0;"><span style="color:#6ee7b7;font-weight:600;">Note: </span>${sub.receipt_notes}</div>` : ''}
          ${sub.receipt_status === 'received' && sub.receipt_confirmed_at ? `<div style="font-size:10px;color:#4b5472;margin-top:4px;">Confirmed: ${new Date(sub.receipt_confirmed_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</div>` : ''}
        </div>`;
      }).join('');
    } catch (err) { listEl.innerHTML = '<em style="color:#ef4444;">Failed to load: ' + err.message + '</em>'; }
  }

  // ── Shared agent report builders (Excel + PDF) ───────────────────
  // Used by corporateDownloadReport/PDF, superAgentDownloadReport/PDF,
  // masterAgentDownloadReport/PDF. Pure functions — read-only on the
  // raw agent_submissions rows, never touch session/auth state.
  function egCorpBuildReportRow(r) {
    // sizing_json may come back as a parsed object (Supabase jsonb) or a raw string
    let s = r.sizing_json || {};
    if (typeof s === 'string') { try { s = JSON.parse(s); } catch (e) { s = {}; } }

    const isCi = !!(r.system_type === 'ci' || s.totalKva || s.arrKwp);

    // hasSizing: true if any meaningful sizing key is present (residential OR C&I)
    const hasSizing = !!(
      s.invKva || s.numPanels || s.dailyKwh ||   // residential
      s.totalKva || s.panels || s.arrKwp          // C&I
    );

    // --- Residential fields ---
    const battKwh = s.lithiumPackKwh ? Number(s.lithiumPackKwh) : 0;

    // --- C&I field extraction ---
    // C&I sizing_json shape: { totalKva, units, inv:{unitKw}, panels, arrKwp,
    //   bess:{units, label, totalKwh}, dailyKwh, peakKw, backupHrs, sysV? }
    const ciInvKva   = s.totalKva  || '';
    const ciPanels   = s.panels    || '';   // C&I uses s.panels directly
    const ciArrW     = s.arrKwp    ? Math.round(s.arrKwp * 1000) : '';
    const ciBatLabel = s.bess      ? (s.bess.label || '') : '';
    const ciBatUnits = s.bess      ? (s.bess.units || '') : '';
    const ciBatKwh   = s.bess      ? (s.bess.totalKwh || 0) : 0;
    const ciPeakW    = s.peakKw    ? Math.round(s.peakKw * 1000) : '';
    const ciSysV     = s.sysV      || '';   // C&I may store sysV too

    return {
      agentType:  r.agent_type || 'agent',
      masterCode: r.master_agent_code || '',
      superCode:  r.super_agent_code  || '',
      agentCode:  r.agent_code || '',
      agentName:  r.agent_name || '',
      phone:      r.phone || '',
      state:      r.state || '',
      city:       r.city || '',
      status:     hasSizing ? 'Submitted' : 'Not yet submitted',
      submitted:  r.created_at ? new Date(r.created_at).toLocaleDateString('en-NG') : '',
      invKva:     isCi ? ciInvKva   : (s.invKva || ''),
      sysV:       isCi ? ciSysV     : (s.sysV || s.systemVoltage || ''),
      panels:     isCi ? ciPanels   : (s.numPanels || s.panels || ''),
      pvWatts:    isCi ? ciArrW     : (s.pvWatts ? Math.round(s.pvWatts) : ''),
      panelWp:    isCi ? (s.arrKwp && s.panels ? Math.round((s.arrKwp * 1000) / s.panels) : '')
                       : (s.pvWatts && (s.numPanels || s.panels) ? Math.round(s.pvWatts / (s.numPanels || s.panels)) : ''),
      batLabel:   isCi ? ciBatLabel : (s.batLabel || ''),
      batUnits:   isCi ? ciBatUnits : (s.multiPack ? '' : (s.batUnits || '')),
      batKwh:     isCi ? (ciBatKwh  ? Number(ciBatKwh).toFixed(1) : '')
                       : (battKwh   ? battKwh.toFixed(1) : ''),
      dailyKwh:   s.dailyKwh ? Number(s.dailyKwh).toFixed(2) : '',
      peakW:      isCi ? ciPeakW    : (s.maxSurge ? Math.round(s.maxSurge) : '')
    };
  }

  function egCorpDownloadExcel(rows, filenameBase) {
    if (typeof XLSX === 'undefined') {
      if (typeof showToast === 'function') showToast('Excel library not available — check your connection and try again', 'error');
      return;
    }
    const headers = ['Agent Type','Network Head Code','Supervisor Code','Agent Code','Agent Name','Phone','State','City',
      'Status','Submission Date','Inverter (kVA)','System Voltage (V)','Panels (qty)','Panel Wattage (W)','Array Size (W)',
      'Battery Type','Battery Units','Battery Capacity (kWh)','Daily Load (kWh)','Peak Load (W)'];
    const aoa = [headers].concat(rows.map(r => [
      r.agentType, r.masterCode, r.superCode, r.agentCode, r.agentName, r.phone, r.state, r.city,
      r.status, r.submitted, r.invKva, r.sysV, r.panels, r.panelWp, r.pvWatts, r.batLabel, r.batUnits, r.batKwh, r.dailyKwh, r.peakW
    ]));
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = headers.map(h => ({ wch: Math.max(12, h.length + 2) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agents');
    XLSX.writeFile(wb, filenameBase + '_' + new Date().toISOString().slice(0, 10) + '.xlsx');
  }

  function egCorpDownloadPDF(rows, filenameBase, title) {
    if (typeof window.jspdf === 'undefined') {
      if (typeof showToast === 'function') showToast('PDF library not available — check your connection and try again', 'error');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageH = doc.internal.pageSize.getHeight();
    const pageW = doc.internal.pageSize.getWidth();
    const bottomMargin = 18;
    let y = 20;

    function ensureSpace(needed) {
      if (y + needed > pageH - bottomMargin) { doc.addPage(); y = 20; }
    }

    doc.setFontSize(17); doc.setFont(undefined, 'bold'); doc.setTextColor(20);
    doc.text(title || 'Energy Guide — Agent Sizing Report', 14, y); y += 7;
    doc.setFontSize(9); doc.setFont(undefined, 'normal'); doc.setTextColor(140);
    doc.text('Generated ' + new Date().toLocaleDateString('en-NG') + '  ·  ' + rows.length + ' agent' + (rows.length === 1 ? '' : 's'), 14, y);
    y += 10;

    const byState = {};
    const states = [];
    rows.forEach(r => {
      const st = r.state || 'Unspecified';
      if (!byState[st]) { byState[st] = []; states.push(st); }
      byState[st].push(r);
    });
    states.sort();

    states.forEach(st => {
      const list = byState[st];
      ensureSpace(14);
      doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.setTextColor(30);
      doc.text(st + '  —  ' + list.length + ' site' + (list.length === 1 ? '' : 's'), 14, y);
      y += 4;
      doc.setDrawColor(210); doc.line(14, y, pageW - 14, y);
      y += 8;

      list.forEach(r => {
        ensureSpace(38);
        doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.setTextColor(0);
        doc.text((r.agentName || 'Unnamed Agent') + '  (' + (r.agentCode || '—') + ')', 14, y);
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.setTextColor(r.status === 'Submitted' ? 5 : 180, r.status === 'Submitted' ? 130 : 120, r.status === 'Submitted' ? 70 : 30);
        doc.text(r.status, pageW - 14, y, { align: 'right' });
        y += 6;

        doc.setTextColor(110); doc.setFontSize(9);
        doc.text('Supervisor: ' + (r.superCode || '—') + '   |   Network Head: ' + (r.masterCode || '—'), 14, y); y += 5.5;
        doc.text('Location: ' + (r.city ? r.city + ', ' : '') + r.state + '    Phone: ' + (r.phone || '—'), 14, y); y += 7;

        if (r.status === 'Submitted') {
          doc.setTextColor(0); doc.setFontSize(9.5); doc.setFont(undefined, 'bold');
          doc.text('Recommended System', 14, y); y += 5.5;
          doc.setFont(undefined, 'normal'); doc.setTextColor(50);
          const lines = [
            'Inverter: ' + (r.invKva || '-') + ' kVA    Voltage: ' + (r.sysV || '-') + 'V',
            'Panels: ' + (r.panels || '-') + 'x' + (r.panelWp ? ' ' + r.panelWp + 'W' : '') + (r.pvWatts ? '  (=' + (r.pvWatts / 1000).toFixed(1) + ' kWp array)' : ''),
            'Battery: ' + (r.batUnits ? r.batUnits + 'x ' : '') + (r.batLabel || '-') + (r.batKwh ? '  (=' + r.batKwh + ' kWh)' : ''),
            'Daily Load: ' + (r.dailyKwh || '-') + ' kWh    Peak Load: ' + (r.peakW || '-') + 'W'
          ];
          lines.forEach(line => { ensureSpace(6); doc.text('- ' + line, 16, y); y += 5.5; });
        } else {
          doc.setTextColor(150); doc.setFontSize(9);
          doc.text('No sizing submitted yet.', 16, y); y += 5.5;
        }

        doc.setTextColor(150); doc.setFontSize(8);
        doc.text('Submitted: ' + (r.submitted || '—'), 14, y); y += 4;
        doc.setDrawColor(235); doc.line(14, y, pageW - 14, y);
        y += 8;
      });
      y += 4;
    });

    doc.save(filenameBase + '_' + new Date().toISOString().slice(0, 10) + '.pdf');
  }

  window.corporateDownloadReport = async function () {
    if (!corpSession) return;
    const sb = getSupabase();
    if (typeof showLoading === 'function') showLoading(true, 'Preparing report...');
    try {
      const { data, error } = await sb.from('agent_submissions').select('*').eq('company_code', corpSession.company_code).order('state', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        if (typeof showLoading === 'function') showLoading(false);
        if (typeof showToast === 'function') showToast('No submissions to export yet', 'error');
        return;
      }
      egCorpDownloadExcel(data.map(egCorpBuildReportRow), corpSession.company_code + '_agents');
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Report downloaded!', 'success');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Export failed: ' + err.message, 'error');
    }
  };

  window.corporateDownloadPDF = async function () {
    if (!corpSession) return;
    const sb = getSupabase();
    if (typeof showLoading === 'function') showLoading(true, 'Preparing report...');
    try {
      const { data, error } = await sb.from('agent_submissions').select('*').eq('company_code', corpSession.company_code).order('state', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        if (typeof showLoading === 'function') showLoading(false);
        if (typeof showToast === 'function') showToast('No submissions to export yet', 'error');
        return;
      }
      egCorpDownloadPDF(data.map(egCorpBuildReportRow), corpSession.company_code + '_agents', 'Energy Guide — ' + corpSession.company_code + ' Agent Sizing Report');
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Report downloaded!', 'success');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Export failed: ' + err.message, 'error');
    }
  };

  window.corporateCopyLink = function () {
    const linkEl = document.getElementById('corpAgentLink');
    if (!linkEl) return;
    navigator.clipboard.writeText(linkEl.textContent)
      .then(() => { if (typeof showToast === 'function') showToast('Link copied!', 'success'); })
      .catch(() => { if (typeof showToast === 'function') showToast('Copy failed — copy manually', 'error'); });
  };

  // ── Supervisor & Network Head Sessions ───────────────────────
  let superAgentSession = null; // { code, company_code, master_agent_code }
  let masterAgentSession = null; // { code, company_code }

  // ── Supervisor Login ──────────────────────────────────────────
  window.superAgentLogin = async function () {
    const companyCode = (document.getElementById('saCompanyCode')?.value || '').trim().toUpperCase();
    const saCode      = (document.getElementById('saCode')?.value       || '').trim().toUpperCase();
    const compErr     = document.getElementById('saCompanyCodeError');
    const codeErr     = document.getElementById('saCodeError');
    if (compErr) compErr.textContent = '';
    if (codeErr) codeErr.textContent = '';

    let valid = true;
    if (!companyCode || companyCode.length < 2) { if (compErr) compErr.textContent = 'Company code required'; valid = false; }
    if (!saCode      || saCode.length      < 2) { if (codeErr) codeErr.textContent = 'Your super agent code required'; valid = false; }
    if (!valid) return;

    if (typeof showLoading === 'function') showLoading(true, 'Verifying...');
    let sb = getSupabase();
    if (!sb) { await new Promise(r => setTimeout(r, 800)); sb = getSupabase(); }
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); if (codeErr) codeErr.textContent = 'App not ready. Try again.'; return; }
    try {
      const { data, error } = await sb
        .from('agent_registry')
        .select('*')
        .eq('agent_code',    saCode)
        .eq('company_code',  companyCode)
        .eq('agent_type',    'super_agent')
        .single();

      if (error || !data) throw new Error('Super agent code not found for this company. Check with your manager.');

      superAgentSession = {
        code:              data.agent_code,
        company_code:      data.company_code,
        master_agent_code: data.master_agent_code || null,
      };
      if (typeof showLoading === 'function') showLoading(false);
      openSuperAgentDashboard();
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast(err.message || 'Login failed', 'error');
    }
  };

  function openSuperAgentDashboard() {
    if (!superAgentSession) return;
    const title    = document.getElementById('saDashTitle');
    const subtitle = document.getElementById('saDashSubtitle');
    if (title)    title.textContent    = 'My Team';
    if (subtitle) subtitle.textContent = 'Code: ' + superAgentSession.code;
    if (typeof showScreen === 'function') showScreen('super-agent-dashboard');
    loadSuperAgentStats();
  }

  async function loadSuperAgentStats() {
    if (!superAgentSession) return;
    const sb = getSupabase();
    if (!sb) return;
    try {
      const { data, error } = await sb
        .from('agent_submissions')
        .select('*')
        .eq('company_code',     superAgentSession.company_code)
        .eq('super_agent_code', superAgentSession.code);
      if (error) throw error;

      const totalEl  = document.getElementById('saStatTotal');
      const agentsEl = document.getElementById('saStatAgents');
      const countEl  = document.getElementById('saAgentCount');
      const breakEl  = document.getElementById('saAgentBreakdown');
      const delivEl  = document.getElementById('saDeliveryStatus');

      const agents = [...new Set(data.map(r => r.agent_code).filter(Boolean))];
      if (totalEl)  totalEl.textContent  = data.length;
      if (agentsEl) agentsEl.textContent = agents.length;
      if (countEl)  countEl.textContent  = agents.length + ' Agent' + (agents.length !== 1 ? 's' : '');
      if (delivEl)  delivEl.innerHTML    = buildDeliveryStatus(data);

      if (!breakEl) return;
      if (data.length === 0) {
        breakEl.innerHTML = '<div style="text-align:center;padding:20px 0;"><div style="font-size:28px;opacity:0.3;">👥</div><div style="font-size:13px;color:#4b5472;margin-top:8px;">No submissions yet from your Field Reps.</div></div>';
        return;
      }

      const breakdown = {};
      const nameMap   = {};
      data.forEach(r => {
        if (r.agent_code) {
          breakdown[r.agent_code] = (breakdown[r.agent_code] || 0) + 1;
          nameMap[r.agent_code]   = r.agent_name || r.agent_code;
        }
      });
      const sorted   = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
      const maxCount = sorted.length > 0 ? sorted[0][1] : 1;
      breakEl.innerHTML = sorted.map(([code, count]) => {
        const pct = Math.round((count / maxCount) * 100);
        return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #1e2235;">
          <div style="width:7px;height:7px;border-radius:50%;background:#0ea5e9;box-shadow:0 0 6px #0ea5e9;flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#f0f2ff;">${nameMap[code]}</div>
            <div style="font-family:'DM Mono',monospace;font-size:10px;color:#4b5472;">#${code}</div>
          </div>
          <div style="width:60px;height:4px;background:#1e2235;border-radius:4px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#0ea5e9,#22d97a);border-radius:4px;"></div>
          </div>
          <div style="font-family:'DM Mono',monospace;font-size:12px;font-weight:600;color:#38bdf8;min-width:20px;text-align:right;">${count}</div>
        </div>`;
      }).join('');
    } catch (err) { console.warn('Super agent stats error:', err.message); }
  }

  async function loadSuperAgentSubmissions() {
    if (!superAgentSession) return;
    const sb    = getSupabase();
    const listEl = document.getElementById('saSubmissionsList');
    if (!listEl) return;
    listEl.innerHTML = '<em style="color:#687076;">Loading...</em>';
    try {
      const { data, error } = await sb
        .from('agent_submissions')
        .select('*')
        .eq('company_code',     superAgentSession.company_code)
        .eq('super_agent_code', superAgentSession.code)
        .order('created_at', { ascending: false });
      if (error) throw error;
      listEl.innerHTML = data.length === 0
        ? '<div style="text-align:center;padding:32px 0;"><div style="font-size:32px;opacity:0.3;">📋</div><div style="font-size:13px;color:#4b5472;margin-top:8px;">No submissions yet from your team.</div></div>'
        : data.map(sub => buildSubmissionCard(sub)).join('');
    } catch (err) { listEl.innerHTML = '<em style="color:#ef4444;">Failed to load: ' + err.message + '</em>'; }
  }

  window.superAgentDownloadReport = async function () {
    if (!superAgentSession) return;
    const sb = getSupabase();
    if (typeof showLoading === 'function') showLoading(true, 'Preparing report...');
    try {
      const { data, error } = await sb
        .from('agent_submissions')
        .select('*')
        .eq('company_code',     superAgentSession.company_code)
        .eq('super_agent_code', superAgentSession.code)
        .order('agent_code', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        if (typeof showLoading === 'function') showLoading(false);
        if (typeof showToast === 'function') showToast('No submissions to export yet', 'error');
        return;
      }
      egCorpDownloadExcel(data.map(egCorpBuildReportRow), superAgentSession.code + '_team');
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Report downloaded!', 'success');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Export failed: ' + err.message, 'error');
    }
  };

  window.superAgentDownloadPDF = async function () {
    if (!superAgentSession) return;
    const sb = getSupabase();
    if (typeof showLoading === 'function') showLoading(true, 'Preparing report...');
    try {
      const { data, error } = await sb
        .from('agent_submissions')
        .select('*')
        .eq('company_code',     superAgentSession.company_code)
        .eq('super_agent_code', superAgentSession.code)
        .order('agent_code', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        if (typeof showLoading === 'function') showLoading(false);
        if (typeof showToast === 'function') showToast('No submissions to export yet', 'error');
        return;
      }
      egCorpDownloadPDF(data.map(egCorpBuildReportRow), superAgentSession.code + '_team', 'Energy Guide — ' + superAgentSession.code + ' Team Sizing Report');
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Report downloaded!', 'success');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Export failed: ' + err.message, 'error');
    }
  };

  window.superAgentLogout = function () {
    superAgentSession = null;
    if (typeof showScreen === 'function') showScreen('agent-code-entry');
  };

  // ── Network Head Login ─────────────────────────────────────────
  window.masterAgentLogin = async function () {
    const companyCode = (document.getElementById('maCompanyCode')?.value || '').trim().toUpperCase();
    const maCode      = (document.getElementById('maCode')?.value       || '').trim().toUpperCase();
    const compErr     = document.getElementById('maCompanyCodeError');
    const codeErr     = document.getElementById('maCodeError');
    if (compErr) compErr.textContent = '';
    if (codeErr) codeErr.textContent = '';

    let valid = true;
    if (!companyCode || companyCode.length < 2) { if (compErr) compErr.textContent = 'Company code required'; valid = false; }
    if (!maCode      || maCode.length      < 2) { if (codeErr) codeErr.textContent = 'Your master agent code required'; valid = false; }
    if (!valid) return;

    if (typeof showLoading === 'function') showLoading(true, 'Verifying...');
    let sb = getSupabase();
    if (!sb) { await new Promise(r => setTimeout(r, 800)); sb = getSupabase(); }
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); if (codeErr) codeErr.textContent = 'App not ready. Try again.'; return; }
    try {
      const { data, error } = await sb
        .from('agent_registry')
        .select('*')
        .eq('agent_code',   maCode)
        .eq('company_code', companyCode)
        .eq('agent_type',   'master_agent')
        .single();

      if (error || !data) throw new Error('Master agent code not found for this company. Check with your manager.');

      masterAgentSession = { code: data.agent_code, company_code: data.company_code };
      if (typeof showLoading === 'function') showLoading(false);
      openMasterAgentDashboard();
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast(err.message || 'Login failed', 'error');
    }
  };

  function openMasterAgentDashboard() {
    if (!masterAgentSession) return;
    const title    = document.getElementById('maDashTitle');
    const subtitle = document.getElementById('maDashSubtitle');
    if (title)    title.textContent    = 'My Region';
    if (subtitle) subtitle.textContent = 'Code: ' + masterAgentSession.code;
    if (typeof showScreen === 'function') showScreen('master-agent-dashboard');
    loadMasterAgentStats();
  }

  async function loadMasterAgentStats() {
    if (!masterAgentSession) return;
    const sb = getSupabase();
    if (!sb) return;
    try {
      const { data, error } = await sb
        .from('agent_submissions')
        .select('*')
        .eq('company_code',       masterAgentSession.company_code)
        .eq('master_agent_code',  masterAgentSession.code);
      if (error) throw error;

      const totalEl  = document.getElementById('maStatTotal');
      const supersEl = document.getElementById('maStatSupers');
      const agentsEl = document.getElementById('maStatAgents');
      const countEl  = document.getElementById('maSuperCount');
      const breakEl  = document.getElementById('maSuperBreakdown');
      const delivEl  = document.getElementById('maDeliveryStatus');

      const supers = [...new Set(data.map(r => r.super_agent_code).filter(Boolean))];
      const agents = [...new Set(data.map(r => r.agent_code).filter(Boolean))];
      if (totalEl)  totalEl.textContent  = data.length;
      if (supersEl) supersEl.textContent = supers.length;
      if (agentsEl) agentsEl.textContent = agents.length;
      if (countEl)  countEl.textContent  = supers.length + ' Super' + (supers.length !== 1 ? 's' : '');
      if (delivEl)  delivEl.innerHTML    = buildDeliveryStatus(data);

      if (!breakEl) return;
      if (data.length === 0) {
        breakEl.innerHTML = '<div style="text-align:center;padding:20px 0;"><div style="font-size:28px;opacity:0.3;">🗺</div><div style="font-size:13px;color:#4b5472;margin-top:8px;">No submissions in your region yet.</div></div>';
        return;
      }

      // Build super agent → agent count tree
      const tree = {};
      data.forEach(r => {
        const sup   = r.super_agent_code || '(No Super Code)';
        const agent = r.agent_code       || '?';
        if (!tree[sup]) tree[sup] = {};
        tree[sup][agent] = (tree[sup][agent] || 0) + 1;
      });

      const superEntries = Object.entries(tree).sort((a, b) => {
        const aT = Object.values(a[1]).reduce((s, n) => s + n, 0);
        const bT = Object.values(b[1]).reduce((s, n) => s + n, 0);
        return bT - aT;
      });

      breakEl.innerHTML = superEntries.map(([sup, agentMap]) => {
        const supTotal   = Object.values(agentMap).reduce((s, n) => s + n, 0);
        const agentCount = Object.keys(agentMap).length;
        const agentRows  = Object.entries(agentMap)
          .sort((a, b) => b[1] - a[1])
          .map(([code, count]) => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0 6px 16px;border-bottom:1px solid #1e2235;">
              <div style="width:5px;height:5px;border-radius:50%;background:#22d97a;flex-shrink:0;"></div>
              <div style="flex:1;font-size:12px;color:#a5adcf;">Agent: <strong>${code}</strong></div>
              <div style="font-size:12px;font-weight:600;color:#22d97a;">${count}</div>
            </div>`).join('');

        return `
          <div style="margin-bottom:10px;border:1px solid #2a2f4a;border-radius:10px;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:#1e2235;">
              <div style="width:8px;height:8px;border-radius:50%;background:#0ea5e9;box-shadow:0 0 6px #0ea5e9;flex-shrink:0;"></div>
              <div style="flex:1;font-size:13px;font-weight:700;color:#f0f2ff;">Supervisor: ${sup}</div>
              <div style="font-size:11px;color:#38bdf8;">${agentCount} agent${agentCount !== 1 ? 's' : ''}</div>
              <div style="font-size:12px;font-weight:700;color:#c084fc;margin-left:8px;">${supTotal} total</div>
            </div>
            ${agentRows}
          </div>`;
      }).join('');
    } catch (err) { console.warn('Master agent stats error:', err.message); }
  }

  async function loadMasterAgentSubmissions() {
    if (!masterAgentSession) return;
    const sb    = getSupabase();
    const listEl = document.getElementById('maSubmissionsList');
    if (!listEl) return;
    listEl.innerHTML = '<em style="color:#687076;">Loading...</em>';
    try {
      const { data, error } = await sb
        .from('agent_submissions')
        .select('*')
        .eq('company_code',      masterAgentSession.company_code)
        .eq('master_agent_code', masterAgentSession.code)
        .order('created_at', { ascending: false });
      if (error) throw error;
      listEl.innerHTML = data.length === 0
        ? '<div style="text-align:center;padding:32px 0;"><div style="font-size:32px;opacity:0.3;">📋</div><div style="font-size:13px;color:#4b5472;margin-top:8px;">No submissions in your region yet.</div></div>'
        : data.map(sub => buildSubmissionCard(sub)).join('');
    } catch (err) { listEl.innerHTML = '<em style="color:#ef4444;">Failed to load: ' + err.message + '</em>'; }
  }

  window.masterAgentDownloadReport = async function () {
    if (!masterAgentSession) return;
    const sb = getSupabase();
    if (typeof showLoading === 'function') showLoading(true, 'Preparing report...');
    try {
      const { data, error } = await sb
        .from('agent_submissions')
        .select('*')
        .eq('company_code',      masterAgentSession.company_code)
        .eq('master_agent_code', masterAgentSession.code)
        .order('super_agent_code', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        if (typeof showLoading === 'function') showLoading(false);
        if (typeof showToast === 'function') showToast('No submissions to export yet', 'error');
        return;
      }
      egCorpDownloadExcel(data.map(egCorpBuildReportRow), masterAgentSession.code + '_region');
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Report downloaded!', 'success');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Export failed: ' + err.message, 'error');
    }
  };

  window.masterAgentDownloadPDF = async function () {
    if (!masterAgentSession) return;
    const sb = getSupabase();
    if (typeof showLoading === 'function') showLoading(true, 'Preparing report...');
    try {
      const { data, error } = await sb
        .from('agent_submissions')
        .select('*')
        .eq('company_code',      masterAgentSession.company_code)
        .eq('master_agent_code', masterAgentSession.code)
        .order('super_agent_code', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        if (typeof showLoading === 'function') showLoading(false);
        if (typeof showToast === 'function') showToast('No submissions to export yet', 'error');
        return;
      }
      egCorpDownloadPDF(data.map(egCorpBuildReportRow), masterAgentSession.code + '_region', 'Energy Guide — ' + masterAgentSession.code + ' Region Sizing Report');
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Report downloaded!', 'success');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Export failed: ' + err.message, 'error');
    }
  };

  window.masterAgentLogout = function () {
    masterAgentSession = null;
    if (typeof showScreen === 'function') showScreen('agent-code-entry');
  };

  // ── Shared helpers ─────────────────────────────────────────────
  function buildSubmissionCard(sub) {
    const typeMap   = { agent: '👤 Field Rep', super_agent: '⭐ Supervisor', master_agent: '🔷 Network Head' };
    const typeBadge = typeMap[sub.agent_type] || '👤 Agent';
    return `
    <div style="background:#141720;border:1px solid #1e2235;border-radius:14px;padding:16px;margin-bottom:10px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
        <div>
          <div style="font-size:14px;font-weight:700;color:#f0f2ff;margin-bottom:2px;">${sub.agent_name||'Agent'}</div>
          <div style="font-family:'DM Mono',monospace;font-size:10px;color:#4b5472;letter-spacing:0.06em;">Code: #${sub.agent_code}</div>
        </div>
        <span style="font-size:10px;font-weight:600;background:rgba(124,92,252,0.1);border:1px solid rgba(124,92,252,0.2);color:#a78bfa;padding:3px 9px;border-radius:20px;text-transform:uppercase;letter-spacing:0.04em;flex-shrink:0;">${sub.state||'—'}</span>
      </div>
      <div style="background:#0f1117;border:1px solid #1e2235;border-radius:8px;padding:8px 12px;margin-bottom:10px;display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
        <div style="font-size:11px;color:#f0f2ff;">${typeBadge}</div>
        ${sub.super_agent_code  ? `<div style="font-size:11px;color:#38bdf8;">⭐ Reports to: <strong>${sub.super_agent_code}</strong></div>`  : ''}
        ${sub.master_agent_code ? `<div style="font-size:11px;color:#c084fc;">🔷 Master: <strong>${sub.master_agent_code}</strong></div>` : ''}
      </div>
      <div style="display:flex;gap:14px;margin-bottom:10px;">
        <div style="font-size:11px;color:#8892a4;">📍 ${sub.city||'—'}</div>
        <div style="font-size:11px;color:#8892a4;">📞 ${sub.phone||'—'}</div>
      </div>
      <div style="background:#0f1117;border:1px solid #1e2235;border-radius:8px;padding:9px 12px;font-family:'DM Mono',monospace;font-size:10px;color:#8892a4;line-height:1.5;margin-bottom:8px;">${sub.sizing_summary||'—'}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
        <div style="font-size:10px;color:#4b5472;">${sub.created_at ? new Date(sub.created_at).toLocaleString('en-NG') : ''}</div>
        ${sub.receipt_status === 'received'
          ? `<div style="display:flex;align-items:center;gap:8px;">
               <span style="font-size:10px;font-weight:600;background:rgba(5,150,105,0.15);border:1px solid rgba(5,150,105,0.3);color:#34d399;padding:3px 9px;border-radius:20px;">✅ Received</span>
               ${sub.receipt_photo_url
                 ? `<button onclick="viewReceiptPhoto('${sub.receipt_photo_url}','${sub.agent_name||'Agent'}','${sub.receipt_confirmed_at||''}','${(sub.receipt_notes||'').replace(/'/g,'’')}')"\
                      style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(14,165,233,0.1);border:1px solid rgba(14,165,233,0.3);border-radius:20px;color:#38bdf8;font-size:10px;font-weight:600;cursor:pointer;">\
                      📷 View Photo\
                    </button>`
                 : ''}
             </div>`
          : `<span style="font-size:10px;font-weight:600;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);color:#fbbf24;padding:3px 9px;border-radius:20px;">⏳ Pending</span>`
        }
      </div>
      ${sub.receipt_status === 'received' && sub.receipt_notes ? `<div style="margin-top:6px;padding:8px 12px;background:rgba(5,150,105,0.07);border:1px solid rgba(5,150,105,0.15);border-radius:8px;font-size:11px;color:#a7f3d0;"><span style="color:#6ee7b7;font-weight:600;">Note: </span>${sub.receipt_notes}</div>` : ''}
      ${sub.receipt_status === 'received' && sub.receipt_confirmed_at ? `<div style="font-size:10px;color:#4b5472;margin-top:4px;">Confirmed: ${new Date(sub.receipt_confirmed_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</div>` : ''}
    </div>`;
  }

  function downloadCSV(data, filenameSuffix) {
    const headers = ['Agent Type','Network Head Code','Supervisor Code','Agent Code','Agent Name','Phone','State','City','Inverter (kVA)','Panels','Daily Load (kWh)','Submission Date'];
    const rows = data.map(r => {
      let s = r.sizing_json || {};
      if (typeof s === 'string') { try { s = JSON.parse(s); } catch (e) { s = {}; } }
      const isCi = !!(r.system_type === 'ci' || s.totalKva || s.arrKwp);
      const invKva  = isCi ? (s.totalKva || '')           : (s.invKva || '');
      const panels  = isCi ? (s.panels   || '')           : (s.numPanels || s.panels || '');
      const daily   = s.dailyKwh ? Number(s.dailyKwh).toFixed(2) : '';
      return [r.agent_type||'agent', r.master_agent_code||'', r.super_agent_code||'', r.agent_code||'', r.agent_name||'', r.phone||'', r.state||'', r.city||'',
        invKva, panels, daily,
        r.created_at ? new Date(r.created_at).toLocaleDateString('en-NG') : ''
      ].map(v => '"' + String(v).replace(/"/g,'""') + '"');
    });
    const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = filenameSuffix + '_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  window.agentEnterWithCode = async function () {
    const code   = (document.getElementById('agentEntryCode')?.value || '').trim().toUpperCase();
    const errEl  = document.getElementById('agentEntryCodeError');
    const nameEl = document.getElementById('agentEntryCompanyName');
    if (errEl)  errEl.textContent  = '';
    if (nameEl) nameEl.textContent = '';
    if (!code || code.length < 2) { if (errEl) errEl.textContent = 'Please enter your company code'; return; }

    if (typeof showLoading === 'function') showLoading(true, 'Looking up company...');

    // Retry getting supabase in case it hasn't initialised yet
    let sb = getSupabase();
    if (!sb) {
      await new Promise(r => setTimeout(r, 800));
      sb = getSupabase();
    }

    if (!sb) {
      if (typeof showLoading === 'function') showLoading(false);
      if (errEl) errEl.textContent = 'App not ready yet. Please wait a moment and try again.';
      return;
    }

    try {
      const { data, error } = await sb
        .from('corporate_partners')
        .select('company_name')
        .eq('company_code', code)
        .single();

      if (typeof showLoading === 'function') showLoading(false);

      if (error || !data) {
        if (errEl) errEl.textContent = 'Company code not found. Check with your manager.';
        return;
      }

      agentPortalCode = code;
      const portalNameEl = document.getElementById('agentPortalCompanyName');
      if (portalNameEl) portalNameEl.textContent = data.company_name + ' — Agent Portal';
      resetAgentSession();
      if (typeof showScreen === 'function') showScreen('corporate-agent-portal');

    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (errEl) errEl.textContent = 'Error: ' + (err.message || 'Could not verify code. Try again.');
    }
  };

  // Photo preview for agent personal dashboard
  window.apdPreviewPhoto = function (input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const img     = document.getElementById('apdPhotoPreviewImg');
      const preview = document.getElementById('apdPhotoPreview');
      if (img)     img.src            = e.target.result;
      if (preview) preview.style.display = '';
    };
    reader.readAsDataURL(file);
  };

  // ── Agent Personal Dashboard — checks existing submission ──────
  window.agentCheckMySubmission = async function () {
    const companyCode = (document.getElementById('agentCheckCompanyCode')?.value || '').trim().toUpperCase();
    const code        = (document.getElementById('agentCheckCode')?.value        || '').trim().toUpperCase();
    const companyErr  = document.getElementById('agentCheckCompanyError');
    const codeErr     = document.getElementById('agentCheckCodeError');
    if (companyErr) companyErr.textContent = '';
    if (codeErr)    codeErr.textContent    = '';

    let valid = true;
    if (!companyCode) { if (companyErr) companyErr.textContent = 'Company code required'; valid = false; }
    if (!code)        { if (codeErr)    codeErr.textContent    = 'Agent code required';   valid = false; }
    if (!valid) return;

    if (typeof showLoading === 'function') showLoading(true, 'Loading your submission...');
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }

    try {
      const { data, error } = await sb
        .from('agent_submissions')
        .select('*')
        .eq('agent_code',   code)
        .eq('company_code', companyCode)
        .order('created_at', { ascending: false })
        .limit(1);

      if (typeof showLoading === 'function') showLoading(false);

      if (error || !data || data.length === 0) {
        if (codeErr) codeErr.textContent = 'No submission found. Size your shop first using the Field Rep flow.';
        return;
      }

      renderAgentPersonalDashboard(data[0]);
      if (typeof showScreen === 'function') showScreen('agent-personal-dashboard');

    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (codeErr) codeErr.textContent = 'Could not load. Check your connection.';
    }
  };

  function renderAgentPersonalDashboard(sub) {
    const nameEl    = document.getElementById('apdAgentName');
    const codeEl    = document.getElementById('apdAgentCode');
    const locEl     = document.getElementById('apdLocation');
    const systemEl  = document.getElementById('apdSystem');
    const dateEl    = document.getElementById('apdDate');
    const statusEl  = document.getElementById('apdStatus');
    const receiptEl = document.getElementById('apdReceiptSection');
    const photoEl   = document.getElementById('apdReceiptPhoto');

    if (nameEl)   nameEl.textContent   = sub.agent_name || 'Agent';
    if (codeEl)   codeEl.textContent   = '#' + sub.agent_code;
    if (locEl)    locEl.textContent    = (sub.city ? sub.city + ', ' : '') + (sub.state || '');
    if (systemEl) systemEl.textContent = sub.sizing_summary || '—';
    if (dateEl)   dateEl.textContent   = sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

    // Store submission id for receipt confirmation
    window._currentAgentSubId = sub.id;
    window._currentAgentCode  = sub.agent_code;

    if (sub.receipt_status === 'received') {
      if (statusEl) statusEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;background:rgba(5,150,105,0.1);border:1px solid rgba(5,150,105,0.3);border-radius:10px;padding:12px 14px;">
          <div style="font-size:20px;">✅</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#34d399;">Equipment Received</div>
            <div style="font-size:11px;color:#8892a4;margin-top:2px;">${sub.receipt_confirmed_at ? 'Confirmed: ' + new Date(sub.receipt_confirmed_at).toLocaleDateString('en-NG') : ''}</div>
          </div>
        </div>`;
      if (receiptEl) receiptEl.style.display = 'none';
      if (photoEl && sub.receipt_photo_url) {
        photoEl.style.display = '';
        photoEl.querySelector('img')?.setAttribute('src', sub.receipt_photo_url);
      }
    } else {
      if (statusEl) statusEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:12px 14px;">
          <div style="font-size:20px;">⏳</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#fbbf24;">Awaiting Supply</div>
            <div style="font-size:11px;color:#8892a4;margin-top:2px;">Your company will supply your equipment soon</div>
          </div>
        </div>`;
      if (receiptEl) receiptEl.style.display = '';
      if (photoEl)   photoEl.style.display   = 'none';
    }
  }

  window.agentSubmitReceipt = async function () {
    const photoFile = document.getElementById('apdReceiptPhotoInput')?.files[0];
    const notes     = (document.getElementById('apdReceiptNotes')?.value || '').trim();
    const photoErr  = document.getElementById('apdReceiptPhotoError');
    if (photoErr) photoErr.textContent = '';

    if (!photoFile) { if (photoErr) photoErr.textContent = 'Please upload a photo of the equipment'; return; }
    if (!window._currentAgentSubId) { if (typeof showToast === 'function') showToast('Session expired. Please start again.', 'error'); return; }

    if (typeof showLoading === 'function') showLoading(true, 'Uploading confirmation...');
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }

    try {
      // Upload photo
      const fileExt  = photoFile.name.split('.').pop();
      const fileName = `receipts/${window._currentAgentCode}_${Date.now()}.${fileExt}`;
      let   photoUrl = null;

      const { data: uploadData, error: uploadErr } = await sb.storage
        .from('agent-receipts')
        .upload(fileName, photoFile, { upsert: true });

      if (!uploadErr && uploadData) {
        const { data: urlData } = sb.storage.from('agent-receipts').getPublicUrl(fileName);
        photoUrl = urlData?.publicUrl || null;
      }

      // Update submission
      const { error: updateErr } = await sb
        .from('agent_submissions')
        .update({
          receipt_status:       'received',
          receipt_photo_url:    photoUrl,
          receipt_notes:        notes,
          receipt_confirmed_at: new Date().toISOString()
        })
        .eq('id', window._currentAgentSubId);

      if (updateErr) throw updateErr;

      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showScreen  === 'function') showScreen('agent-receipt-success');

    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast   === 'function') showToast('Confirmation failed: ' + err.message, 'error');
    }
  };

  function setupAgentCodeLivePreview() {
    const input = document.getElementById('agentEntryCode');
    if (!input || input._corpListenerAttached) return;
    input._corpListenerAttached = true;
    let timer;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      const nameEl = document.getElementById('agentEntryCompanyName');
      const errEl  = document.getElementById('agentEntryCodeError');
      if (nameEl) nameEl.textContent = '';
      if (errEl)  errEl.textContent  = '';
      const code = input.value.trim().toUpperCase();
      if (code.length < 3) return;
      timer = setTimeout(async () => {
        const sb = getSupabase();
        if (!sb) return;
        try {
          const { data } = await sb.from('corporate_partners').select('company_name').eq('company_code', code).single();
          if (data && nameEl) nameEl.textContent = '✓ ' + data.company_name;
        } catch (e) {}
      }, 600);
    });
  }

  // ── Live code lookup as agent types ───────────────────────────
  let _agentLookupTimer = null;
  let _agentRegistryData = null; // { code, agent_type, super_agent_code, master_agent_code, company_code }

  window.agentCodeLookup = async function () {
    const code = (document.getElementById('agentCode')?.value || '').trim().toUpperCase();
    const displayEl   = document.getElementById('agentHierarchyDisplay');
    const notFoundEl  = document.getElementById('agentCodeNotFound');
    const typeLabel   = document.getElementById('agentTypeLabel');
    const chainEl     = document.getElementById('agentHierarchyChain');

    if (displayEl)  displayEl.style.display  = 'none';
    if (notFoundEl) notFoundEl.style.display = 'none';
    _agentRegistryData = null;

    if (code.length < 2) return;

    clearTimeout(_agentLookupTimer);
    _agentLookupTimer = setTimeout(async () => {
      const sb = getSupabase();
      if (!sb) return;
      try {
        const { data, error } = await sb
          .from('agent_registry')
          .select('*')
          .eq('agent_code', code)
          .eq('company_code', agentPortalCode || '')
          .single();

        if (error || !data) {
          if (notFoundEl) notFoundEl.style.display = '';
          return;
        }

        _agentRegistryData = data;

        // Build hierarchy display
        const typeMap = { agent: '👤 Field Rep', super_agent: '⭐ Supervisor', master_agent: '🔷 Network Head' };
        if (typeLabel) typeLabel.textContent = typeMap[data.agent_type] || data.agent_type;

        let chain = '';
        if (data.agent_type === 'agent') {
          chain = `Reports to Supervisor: <strong>${data.super_agent_code || '—'}</strong><br/>Under Network Head: <strong>${data.master_agent_code || '—'}</strong>`;
        } else if (data.agent_type === 'super_agent') {
          chain = `Reports to Network Head: <strong>${data.master_agent_code || '—'}</strong>`;
        } else if (data.agent_type === 'master_agent') {
          chain = `Top level — no one above you`;
        }
        if (chainEl) chainEl.innerHTML = chain;
        if (displayEl) displayEl.style.display = '';

      } catch(e) {
        if (notFoundEl) notFoundEl.style.display = '';
      }
    }, 600);
  };

  // ── Agent Portal Step 1: Details → navigate to real calculator ─
  window.agentGoToCalculator = async function () {
    const code  = (document.getElementById('agentCode')?.value  || '').trim().toUpperCase();
    const name  = (document.getElementById('agentName')?.value  || '').trim();
    let   phone = (document.getElementById('agentPhone')?.value || '').trim();
    const state = (document.getElementById('agentState')?.value || '');
    const city  = (document.getElementById('agentCity')?.value  || '').trim();
    const consented = !!document.getElementById('agentConsent')?.checked;

    const phoneCheck = (typeof validateNigerianPhone === 'function') ? validateNigerianPhone(phone) : { valid: phone.length >= 7, normalized: phone };

    let valid = true;
    [['agentCodeError',    !code,                'Agent code required'],
     ['agentNameError',    name.length < 2,       'Name required'],
     ['agentStateError',   !state,                'Please select your state'],
     ['agentConsentError', !consented,            'Please agree to the Privacy Policy to continue']
    ].forEach(([id, fail, msg]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = fail ? msg : '';
      if (fail) valid = false;
    });

    // Phone gets its own check since it has two possible error messages
    // (missing vs. wrong format) — handled separately from the array above.
    const phoneErrEl = document.getElementById('agentPhoneError');
    if (!phone) {
      if (phoneErrEl) phoneErrEl.textContent = 'Phone required';
      valid = false;
    } else if (!phoneCheck.valid) {
      if (phoneErrEl) phoneErrEl.textContent = 'Enter a valid Nigerian number, e.g. 080XXXXXXXX';
      valid = false;
    } else if (phoneErrEl) {
      phoneErrEl.textContent = '';
    }

    if (!valid) return;

    if (phoneCheck.valid && phoneCheck.normalized) phone = phoneCheck.normalized;
    const privacyConsentAt = new Date().toISOString();

    // If registry data not yet loaded (race condition), force lookup now before proceeding
    if (!_agentRegistryData && agentPortalCode && code) {
      const sb = getSupabase();
      if (sb) {
        try {
          if (typeof showLoading === 'function') showLoading(true, 'Verifying code...');
          const { data } = await sb
            .from('agent_registry')
            .select('*')
            .eq('agent_code', code)
            .eq('company_code', agentPortalCode)
            .single();
          if (data) _agentRegistryData = data;
          if (typeof showLoading === 'function') showLoading(false);
        } catch(e) {
          if (typeof showLoading === 'function') showLoading(false);
          // Not found — proceed without registry data (bare agent)
        }
      }
    }

    // Use registry data if available, fallback to bare code
    const superCode  = _agentRegistryData?.super_agent_code  || null;
    const masterCode = _agentRegistryData?.master_agent_code || null;
    const agentType  = _agentRegistryData?.agent_type        || 'agent';

    agentInfo = { code, superCode, masterCode, agentType, name, phone, state, city, privacyConsentAt };

    // Update info bar on agent portal
    const infoBar  = document.getElementById('agentInfoBar');
    const infoText = document.getElementById('agentInfoText');
    if (infoText) infoText.textContent = `${agentType === 'master_agent' ? 'Network Head' : agentType === 'super_agent' ? 'Supervisor' : 'Agent'}: ${name} (#${code}) — ${city ? city + ', ' : ''}${state}`;
    if (infoBar)  infoBar.style.display = '';

    // Reset calc
    if (typeof l4u_resetCalculatorSession === 'function') l4u_resetCalculatorSession();
    agentCalcResult = null;
    agentLastApps   = [];

    // Navigate to real user-calculator in agent mode
    if (typeof showScreen === 'function') showScreen('user-calculator');
  };

  window.agentChangeDetails = function () {
    // Return to agent portal step 1
    exitAgentCalcMode();
    if (typeof showScreen === 'function') showScreen('corporate-agent-portal');
  };

  window.agentBackToStep1 = function () {
    exitAgentCalcMode();
    if (typeof showScreen === 'function') showScreen('corporate-agent-portal');
  };

  window.agentStartOver = function () {
    resetAgentSession();
    if (typeof showScreen === 'function') showScreen('corporate-agent-portal');
  };

  // ── Intercept receiveEmbeddedCalculation ──────────────────────
  const _origReceiveCalc = window.receiveEmbeddedCalculation;
  window.receiveEmbeddedCalculation = function (mode, result, apps) {
    if (typeof _origReceiveCalc === 'function') _origReceiveCalc(mode, result, apps);
    if (mode === 'user' && agentInfo) {
      agentCalcResult = result;
      agentLastApps   = apps || [];
      // Show agent submit after enterAgentCalcMode's 50ms timeout has cleared.
      // enterAgentCalcMode is triggered by showScreen('user-calculator') inside
      // the original handler; it runs at +50ms and would re-hide the panel if
      // we set display here synchronously. Waiting 80ms ensures we win the race.
      setTimeout(function () {
        const userActions  = document.getElementById('userPostCalcActions');
        const agentActions = document.getElementById('agentPostCalcActions');
        if (userActions)  userActions.style.display  = 'none';
        if (agentActions) agentActions.style.display = '';
      }, 80);
    }
  };

  // ── Agent Submit ───────────────────────────────────────────────
  window.agentConfirmSubmit = async function () {
    if (!agentInfo)       { if (typeof showToast === 'function') showToast('Please fill in your details first', 'error'); return; }
    if (!agentCalcResult) { if (typeof showToast === 'function') showToast('Please calculate your system first', 'error'); return; }

    const r            = agentCalcResult;
    const invKva       = r.invKva   || 0;
    const panels       = r.numPanels || r.panels || 0;
    const dailyKwh     = r.dailyKwh  || 0;
    const sysV         = r.sysV || r.systemVoltage || 0;
    const batLabel     = r.batLabel  || '';
    const batUnits     = r.batUnits  || '';
    const sizingSummary = `Inverter: ${invKva}kVA | Panels: ${panels}× | Battery: ${batUnits ? batUnits + '× ' : ''}${batLabel} | Daily: ${typeof dailyKwh.toFixed === 'function' ? dailyKwh.toFixed(2) : dailyKwh}kWh | ${sysV}V`;

    if (typeof showLoading === 'function') showLoading(true, 'Submitting...');
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }
    try {
      // ── Duplicate guard: prevent same agent submitting twice for same company ──
      const { data: existing } = await sb
        .from('agent_submissions')
        .select('id')
        .eq('agent_code',   agentInfo.code)
        .eq('company_code', agentPortalCode || 'UNKNOWN')
        .limit(1);
      if (existing && existing.length > 0) {
        if (typeof showLoading === 'function') showLoading(false);
        if (typeof showToast === 'function') showToast('You already have a submission for this company. Check "My Submission" to view or confirm receipt.', 'error');
        return;
      }

      const { error } = await sb.from('agent_submissions').insert([{
        company_code:      agentPortalCode || 'UNKNOWN',
        agent_code:        agentInfo.code,
        agent_type:        agentInfo.agentType  || 'agent',
        super_agent_code:  agentInfo.superCode  || null,
        master_agent_code: agentInfo.masterCode || null,
        agent_name:        agentInfo.name,
        phone:             agentInfo.phone,
        state:             agentInfo.state,
        city:              agentInfo.city,
        appliances_json:   JSON.stringify(agentLastApps),
        sizing_json:       JSON.stringify(agentCalcResult),
        sizing_summary:    sizingSummary,
        privacy_consent_at: agentInfo.privacyConsentAt || null,
      }]);
      if (error) throw error;
      if (typeof showLoading === 'function') showLoading(false);
      exitAgentCalcMode();
      // Data capture: this calculation session converted to a real submission
      if (typeof egMarkConverted === 'function') egMarkConverted();
      const successEl = document.getElementById('agentSuccessSummary');
      if (successEl) {
        successEl.innerHTML = `
          <div style="margin-bottom:6px;"><strong>Agent:</strong> ${agentInfo.name} (#${agentInfo.code})</div>
          <div style="margin-bottom:6px;"><strong>Location:</strong> ${agentInfo.city ? agentInfo.city + ', ' : ''}${agentInfo.state}</div>
          <div><strong>System:</strong> ${sizingSummary}</div>`;
      }
      // Store where the "Done" button should return to
      // (agent-code-entry for Field Reps; their own dashboard for Supervisors/Network Heads)
      window._agentSuccessReturnScreen = _saReturnScreen || 'agent-code-entry';
      _saReturnScreen = null; // consume
      if (typeof showScreen === 'function') showScreen('corporate-agent-success');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Submission failed: ' + err.message, 'error');
    }
  };

  // ── Return from success screen ─────────────────────────────────
  window.agentSuccessDone = function () {
    const dest = window._agentSuccessReturnScreen || 'agent-code-entry';
    window._agentSuccessReturnScreen = null;
    if (typeof showScreen === 'function') showScreen(dest);
  };

  // ── Agent: export current sizing to PDF / WhatsApp ──────────────
  // Pure post-calc actions — reads agentCalcResult only, never touches
  // the calculation engine or agentConfirmSubmit's submission logic.
  function agentBuildSummaryLines() {
    const r = agentCalcResult;
    if (!r) return null;
    const invKva   = r.invKva    || 0;
    const panels   = r.numPanels || r.panels || 0;
    const dailyKwh = r.dailyKwh  || 0;
    const sysV     = r.sysV || r.systemVoltage || 0;
    const batLabel = r.batLabel  || '';
    const batUnits = r.batUnits  || '';
    return {
      invKva, panels, dailyKwh, sysV, batLabel, batUnits,
      lines: [
        'Inverter: ' + invKva + ' kVA',
        'Panels: ' + panels + '×',
        'Battery: ' + (batUnits ? batUnits + '× ' : '') + (batLabel || 'N/A'),
        'Daily Energy: ' + (typeof dailyKwh.toFixed === 'function' ? dailyKwh.toFixed(2) : dailyKwh) + ' kWh',
        'System Voltage: ' + sysV + 'V'
      ]
    };
  }

  window.agentDownloadPDF = function () {
    const summary = agentBuildSummaryLines();
    if (!summary) { if (typeof showToast === 'function') showToast('Please calculate a system first', 'error'); return; }
    if (typeof window.jspdf === 'undefined') { if (typeof showToast === 'function') showToast('PDF library not available', 'error'); return; }
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(18); doc.setFont(undefined, 'bold');
      doc.text('Energy Guide — System Sizing', 14, y); y += 10;
      doc.setFontSize(10); doc.setFont(undefined, 'normal'); doc.setTextColor(100);
      doc.text('Prepared by Agent: ' + (agentInfo ? agentInfo.name + ' (#' + agentInfo.code + ')' : '—'), 14, y); y += 6;
      if (agentInfo) { doc.text('Location: ' + (agentInfo.city ? agentInfo.city + ', ' : '') + agentInfo.state, 14, y); y += 6; }
      doc.text('Date: ' + new Date().toLocaleDateString(), 14, y); y += 12;
      doc.setDrawColor(220); doc.line(14, y, 196, y); y += 10;
      doc.setFontSize(13); doc.setTextColor(0); doc.setFont(undefined, 'bold');
      doc.text('Recommended System', 14, y); y += 8;
      doc.setFontSize(11); doc.setFont(undefined, 'normal');
      summary.lines.forEach(function (line) { doc.text('- ' + line, 16, y); y += 7; });
      y += 8;
      doc.setFontSize(9); doc.setTextColor(140);
      doc.text('Generated via Energy Guide. Figures are estimates pending company review.', 14, y);
      doc.save('Energy-Guide-Agent-Sizing-' + (agentInfo ? agentInfo.code : 'system') + '.pdf');
      if (typeof showToast === 'function') showToast('PDF downloaded', 'success');
    } catch (err) {
      if (typeof showToast === 'function') showToast('PDF export failed: ' + err.message, 'error');
    }
  };

  window.agentShareWhatsApp = function () {
    const summary = agentBuildSummaryLines();
    if (!summary) { if (typeof showToast === 'function') showToast('Please calculate a system first', 'error'); return; }
    const msg = [
      '*Energy Guide — System Sizing*',
      agentInfo ? 'Agent: ' + agentInfo.name + ' (#' + agentInfo.code + ')' : null,
      agentInfo ? 'Location: ' + (agentInfo.city ? agentInfo.city + ', ' : '') + agentInfo.state : null,
      '',
    ].concat(summary.lines).concat([
      '',
      '_Prepared via Energy Guide_'
    ]).filter(Boolean).join('\n');
    if (typeof egOpenWhatsApp === 'function') egOpenWhatsApp(msg);
    else window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  };

  // ── C&I: Agent flagging a site as Commercial/Industrial ─────────
  // Mirrors agentGoToCalculator() exactly, but routes to the C&I
  // calculator instead of the residential one. Does not touch
  // agentGoToCalculator or any residential logic.
  window.agentGoToCICalculator = async function () {
    const code  = (document.getElementById('agentCode')?.value  || '').trim().toUpperCase();
    const name  = (document.getElementById('agentName')?.value  || '').trim();
    let   phone = (document.getElementById('agentPhone')?.value || '').trim();
    const state = (document.getElementById('agentState')?.value || '');
    const city  = (document.getElementById('agentCity')?.value  || '').trim();
    const consented = !!document.getElementById('agentConsent')?.checked;

    const phoneCheck = (typeof validateNigerianPhone === 'function') ? validateNigerianPhone(phone) : { valid: phone.length >= 7, normalized: phone };

    let valid = true;
    [['agentCodeError',    !code,                'Agent code required'],
     ['agentNameError',    name.length < 2,       'Name required'],
     ['agentStateError',   !state,                'Please select your state'],
     ['agentConsentError', !consented,            'Please agree to the Privacy Policy to continue']
    ].forEach(([id, fail, msg]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = fail ? msg : '';
      if (fail) valid = false;
    });

    const phoneErrEl = document.getElementById('agentPhoneError');
    if (!phone) {
      if (phoneErrEl) phoneErrEl.textContent = 'Phone required';
      valid = false;
    } else if (!phoneCheck.valid) {
      if (phoneErrEl) phoneErrEl.textContent = 'Enter a valid Nigerian number, e.g. 080XXXXXXXX';
      valid = false;
    } else if (phoneErrEl) {
      phoneErrEl.textContent = '';
    }

    if (!valid) return;

    if (phoneCheck.valid && phoneCheck.normalized) phone = phoneCheck.normalized;
    const privacyConsentAt = new Date().toISOString();

    if (!_agentRegistryData && agentPortalCode && code) {
      const sb = getSupabase();
      if (sb) {
        try {
          if (typeof showLoading === 'function') showLoading(true, 'Verifying code...');
          const { data } = await sb
            .from('agent_registry')
            .select('*')
            .eq('agent_code', code)
            .eq('company_code', agentPortalCode)
            .single();
          if (data) _agentRegistryData = data;
          if (typeof showLoading === 'function') showLoading(false);
        } catch (e) {
          if (typeof showLoading === 'function') showLoading(false);
        }
      }
    }

    const superCode  = _agentRegistryData?.super_agent_code  || null;
    const masterCode = _agentRegistryData?.master_agent_code || null;
    const agentType  = _agentRegistryData?.agent_type        || 'agent';

    agentInfo = { code, superCode, masterCode, agentType, name, phone, state, city, privacyConsentAt };

    const infoBar  = document.getElementById('agentInfoBar');
    const infoText = document.getElementById('agentInfoText');
    if (infoText) infoText.textContent = `${agentType === 'master_agent' ? 'Network Head' : agentType === 'super_agent' ? 'Supervisor' : 'Agent'}: ${name} (#${code}) — ${city ? city + ', ' : ''}${state}`;
    if (infoBar)  infoBar.style.display = '';

    window._ciContext = 'agent';
    if (typeof showScreen === 'function') showScreen('ci-calculator');
    if (typeof ciApplyContextUI === 'function') ciApplyContextUI();
  };

  // ── C&I: Agent submits a commercial/industrial sizing to their company ──
  // Reuses the exact same agent_submissions table + duplicate-guard rule
  // as agentConfirmSubmit(), tagged with system_type:'ci'. Requires a
  // one-time DB migration adding a nullable `system_type` text column to
  // agent_submissions (defaults to 'residential' for existing rows).
  function ciAgentSummaryLines(s) {
    return [
      'Inverter Stack: ' + s.units + '×' + s.inv.unitKw + 'kW (' + s.totalKva + 'kVA, 3-Phase)',
      'Panels: ' + s.panels + '× (' + s.arrKwp + 'kWp)',
      'BESS: ' + s.bess.units + '×' + s.bess.label + ' — ' + s.bess.totalKwh + 'kWh',
      'Daily load: ' + s.dailyKwh + 'kWh | Backup: ' + s.backupHrs + 'hrs @ ' + s.peakKw + 'kW'
    ];
  }

  window.ciAgentConfirmSubmit = async function () {
    if (!agentInfo) { if (typeof showToast === 'function') showToast('Please fill in your details first', 'error'); return; }
    const s = window.l4ci__lastResult;
    if (!s) { if (typeof showToast === 'function') showToast('Please calculate a system first', 'error'); return; }

    const sizingSummary = '🏭 C&I | ' + ciAgentSummaryLines(s).join(' | ');

    if (typeof showLoading === 'function') showLoading(true, 'Submitting...');
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }
    try {
      // Same duplicate guard as residential: one submission per agent per company
      const { data: existing } = await sb
        .from('agent_submissions')
        .select('id')
        .eq('agent_code',   agentInfo.code)
        .eq('company_code', agentPortalCode || 'UNKNOWN')
        .limit(1);
      if (existing && existing.length > 0) {
        if (typeof showLoading === 'function') showLoading(false);
        if (typeof showToast === 'function') showToast('You already have a submission for this company. Check "My Submission" to view or confirm receipt.', 'error');
        return;
      }

      const { error } = await sb.from('agent_submissions').insert([{
        company_code:      agentPortalCode || 'UNKNOWN',
        agent_code:        agentInfo.code,
        agent_type:        agentInfo.agentType  || 'agent',
        super_agent_code:  agentInfo.superCode  || null,
        master_agent_code: agentInfo.masterCode || null,
        agent_name:        agentInfo.name,
        phone:             agentInfo.phone,
        state:             agentInfo.state,
        city:              agentInfo.city,
        appliances_json:   JSON.stringify([]),
        sizing_json:       JSON.stringify(s),
        sizing_summary:    sizingSummary,
        system_type:       'ci',
        privacy_consent_at: agentInfo.privacyConsentAt || null,
      }]);
      if (error) throw error;
      if (typeof showLoading === 'function') showLoading(false);
      // Data capture: this calculation session converted to a real submission
      if (typeof egMarkConverted === 'function') egMarkConverted();
      const successEl = document.getElementById('agentSuccessSummary');
      if (successEl) {
        successEl.innerHTML = `
          <div style="margin-bottom:6px;"><strong>Agent:</strong> ${agentInfo.name} (#${agentInfo.code})</div>
          <div style="margin-bottom:6px;"><strong>Location:</strong> ${agentInfo.city ? agentInfo.city + ', ' : ''}${agentInfo.state}</div>
          <div style="margin-bottom:6px;"><strong>Site Type:</strong> 🏭 Commercial / Industrial</div>
          <div><strong>System:</strong> ${sizingSummary.replace('🏭 C&I | ', '')}</div>`;
      }
      window._agentSuccessReturnScreen = _saReturnScreen || 'agent-code-entry';
      _saReturnScreen = null;
      if (typeof showScreen === 'function') showScreen('corporate-agent-success');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Submission failed: ' + (err.message || 'unknown error'), 'error');
    }
  };

  // ── Hook showScreen ────────────────────────────────────────────
  const _origShowScreen = window.showScreen;
  window.showScreen = function (screenId) {
    if (typeof _origShowScreen === 'function') _origShowScreen(screenId);

    if (screenId === 'user-calculator') {
      if (agentInfo) {
        setTimeout(enterAgentCalcMode, 50);
      } else {
        exitAgentCalcMode();
      }
    }

    // C&I calculator opened while an agent session is active (either via the
    // manual "Commercial/Industrial site" shortcut or the oversize-banner
    // auto-handoff from user-calculator) — flag the C&I post-calc panel to
    // show the agent's "Submit to My Company" actions instead of the
    // marketplace ones.
    if (screenId === 'ci-calculator' && agentInfo) {
      window._ciContext = 'agent';
      if (typeof ciApplyContextUI === 'function') ciApplyContextUI();
    }

    // When leaving user-calculator while in agent mode via top bar Back,
    // intercept and go to agent portal instead of user dashboard
    if (screenId === 'user-dashboard' && agentInfo) {
      // Agent tapped Back from calculator — go back to their portal
      setTimeout(() => {
        if (typeof _origShowScreen === 'function') _origShowScreen('corporate-agent-portal');
      }, 10);
      return;
    }

    if (screenId === 'corporate-submissions')                    loadCorpSubmissions();
    if (screenId === 'corporate-dashboard' && corpSession)       loadCorpStats();
    if (screenId === 'super-agent-dashboard' && superAgentSession) loadSuperAgentStats();
    if (screenId === 'super-agent-submissions')                  loadSuperAgentSubmissions();
    if (screenId === 'master-agent-dashboard' && masterAgentSession) loadMasterAgentStats();
    if (screenId === 'master-agent-submissions')                 loadMasterAgentSubmissions();
    if (screenId === 'agent-code-entry')                         setupAgentCodeLivePreview();
    if (screenId !== 'user-calculator' && screenId !== 'corporate-agent-portal' && screenId !== 'corporate-agent-success') {
      if (!corpSession) exitAgentCalcMode();
    }
  };


  // ── Size My Shop — Supervisor ─────────────────────────────────
  window.superAgentSizeMyShop = function () {
    if (!superAgentSession) return;
    // Tag agentInfo so submission goes under their own code
    agentPortalCode = superAgentSession.company_code;
    _agentRegistryData = {
      agent_code:        superAgentSession.code,
      agent_type:        'super_agent',
      super_agent_code:  superAgentSession.code,
      master_agent_code: superAgentSession.master_agent_code || null,
      company_code:      superAgentSession.company_code
    };
    agentInfo = {
      code:        superAgentSession.code,
      superCode:   superAgentSession.code,
      masterCode:  superAgentSession.master_agent_code || null,
      agentType:   'super_agent',
      name:        superAgentSession.code,
      phone:       '',
      state:       '',
      city:        ''
    };
    _saReturnScreen = 'super-agent-dashboard';
    if (typeof showScreen === 'function') showScreen('corporate-agent-portal');
  };

  // ── Size My Shop — Network Head ────────────────────────────────
  window.masterAgentSizeMyShop = function () {
    if (!masterAgentSession) return;
    agentPortalCode = masterAgentSession.company_code;
    _agentRegistryData = {
      agent_code:        masterAgentSession.code,
      agent_type:        'master_agent',
      super_agent_code:  null,
      master_agent_code: masterAgentSession.code,
      company_code:      masterAgentSession.company_code
    };
    agentInfo = {
      code:        masterAgentSession.code,
      superCode:   null,
      masterCode:  masterAgentSession.code,
      agentType:   'master_agent',
      name:        masterAgentSession.code,
      phone:       '',
      state:       '',
      city:        ''
    };
    _saReturnScreen = 'master-agent-dashboard';
    if (typeof showScreen === 'function') showScreen('corporate-agent-portal');
  };

  // Track where to return after sizing
  let _saReturnScreen = null;

  function buildDeliveryStatus(data) {
    if (!data || data.length === 0) {
      return '<div style="font-size:13px;color:#4b5472;text-align:center;padding:12px 0;">No submissions yet.</div>';
    }
    const total     = data.length;
    const confirmed = data.filter(r => r.receipt_status === 'received').length;
    const pending   = total - confirmed;
    const pct       = total > 0 ? Math.round((confirmed / total) * 100) : 0;

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="text-align:center;flex:1;">
          <div style="font-size:22px;font-weight:800;color:#22d97a;">${confirmed}</div>
          <div style="font-size:10px;color:#4b5472;margin-top:2px;">✅ Confirmed</div>
        </div>
        <div style="text-align:center;flex:1;">
          <div style="font-size:22px;font-weight:800;color:#f59e0b;">${pending}</div>
          <div style="font-size:10px;color:#4b5472;margin-top:2px;">⏳ Pending</div>
        </div>
        <div style="text-align:center;flex:1;">
          <div style="font-size:22px;font-weight:800;color:#a78bfa;">${pct}%</div>
          <div style="font-size:10px;color:#4b5472;margin-top:2px;">Confirmed</div>
        </div>
      </div>
      <div style="background:#1e2235;border-radius:6px;height:8px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#059669,#22d97a);border-radius:6px;transition:width 0.5s;"></div>
      </div>`;
  }

  // ── Receipt Confirmation ────────────────────────────────────────
  // Photo preview
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'receiptPhoto') return;
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      const img     = document.getElementById('receiptPhotoImg');
      const preview = document.getElementById('receiptPhotoPreview');
      if (img)     img.src           = ev.target.result;
      if (preview) preview.style.display = '';
    };
    reader.readAsDataURL(file);
  });

  // NOTE: Receipt confirmation is handled by agentSubmitReceipt() via the
  // Agent Personal Dashboard (agent-personal-dashboard screen), which correctly
  // targets a specific submission by ID (window._currentAgentSubId).
  // The former agentConfirmReceiptSubmit() was removed — it referenced HTML IDs
  // that don't exist and used a broad agent_code+company_code match that would
  // have bulk-updated ALL submissions for an agent instead of just the latest.

  // ── Receipt Photo Viewer ───────────────────────────────────────
  window.viewReceiptPhoto = function (url, agentName, confirmedAt, notes) {
    const modal     = document.getElementById('receiptPhotoModal');
    const img       = document.getElementById('receiptPhotoModalImg');
    const label     = document.getElementById('receiptPhotoModalLabel');
    const dateEl    = document.getElementById('receiptPhotoModalDate');
    const notesBox  = document.getElementById('receiptPhotoModalNotes');
    const notesText = document.getElementById('receiptPhotoModalNotesText');

    if (!modal || !img) return;

    img.src = url;
    if (label)  label.textContent  = agentName + ' — Receipt Photo';
    if (dateEl) dateEl.textContent = confirmedAt
      ? 'Confirmed: ' + new Date(confirmedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';

    if (notesBox && notesText) {
      const trimmed = (notes || '').trim();
      if (trimmed) {
        notesText.textContent  = trimmed;
        notesBox.style.display = '';
      } else {
        notesBox.style.display = 'none';
      }
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeReceiptPhotoModal = function () {
    const modal = document.getElementById('receiptPhotoModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  // Close modal on background tap
  document.addEventListener('click', function (e) {
    const modal = document.getElementById('receiptPhotoModal');
    if (e.target === modal) window.closeReceiptPhotoModal();
  });

  // ── Session Restore: auto-reopen corp dashboard on page reload ──
  async function tryRestoreCorpSession() {
    const sb = getSupabase();
    if (!sb) return;
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session || !session.user) return;
      // Only restore if we're on a neutral screen (welcome/splash) and corpSession is unset
      if (corpSession) return;
      const { data, error } = await sb
        .from('corporate_partners')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      if (error || !data) return;
      corpSession = { ...data, email: session.user.email };
      openCorporateDashboard();
    } catch(e) { /* not a corp user or session expired — ignore */ }
  }

  // ── Init ───────────────────────────────────────────────────────
  function initCorporate() {
    checkAgentUrl();
    // Only attempt session restore if no other role portal is active
    // (platform.js handles user/installer/vendor; this covers corp partners)
    setTimeout(tryRestoreCorpSession, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCorporate);
  } else {
    initCorporate();
  }

})();
