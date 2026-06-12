// ================================================================
// ENERGY GUIDE — USER GATE MODULE
// user-gate.js
// ================================================================

(function () {
  'use strict';

  const GATE_KEY = 'eg_user_gate_done';
  const DATA_KEY = 'eg_user_gate_data';

  function getSupabase() {
    return (typeof supabaseClient !== 'undefined' && supabaseClient)
      ? supabaseClient : window.supabaseClient || null;
  }

  function goToDashboard(name) {
    try {
      const greetEl = document.getElementById('userDashboardGreetingName');
      if (greetEl && name) greetEl.textContent = name.split(' ')[0];
    } catch(e) {}
    if (typeof egShowUserDashboard === 'function') {
      egShowUserDashboard();
    } else if (typeof showScreen === 'function') {
      showScreen('user-calculator');
    }
  }

  // ── Register (new user) ────────────────────────────────────────
  window.userGateRegister = async function () {
    const name     = (document.getElementById('ugFullName')?.value  || '').trim();
    const email    = (document.getElementById('ugEmail')?.value     || '').trim();
    const phone    = (document.getElementById('ugPhone')?.value     || '').trim();
    const password = (document.getElementById('ugPassword')?.value  || '').trim();
    const state    = (document.getElementById('ugState')?.value     || '');

    // Clear errors
    ['ugFullNameError','ugEmailError','ugPhoneError','ugPasswordError','ugStateError'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });

    // Validate
    let valid = true;
    if (name.length < 2)     { const el = document.getElementById('ugFullNameError');  if(el) el.textContent = 'Please enter your name'; valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { const el = document.getElementById('ugEmailError'); if(el) el.textContent = 'Valid email required'; valid = false; }
    if (phone.length < 7)    { const el = document.getElementById('ugPhoneError');     if(el) el.textContent = 'Valid phone number required'; valid = false; }
    if (password.length < 8) { const el = document.getElementById('ugPasswordError'); if(el) el.textContent = 'Password must be at least 8 characters'; valid = false; }
    if (!state)              { const el = document.getElementById('ugStateError');     if(el) el.textContent = 'Please select your state'; valid = false; }
    if (!valid) return;

    if (typeof showLoading === 'function') showLoading(true, 'Setting up your account...');

    const sb = getSupabase();

    if (sb) {
      try {
        // 1. Create Supabase Auth account — stores password securely
        const { data: authData, error: authError } = await sb.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, phone, state } }
        });

        if (authError) {
          if (typeof showLoading === 'function') showLoading(false);
          const emailErrEl = document.getElementById('ugEmailError');
          if (emailErrEl) emailErrEl.textContent = authError.message || 'Registration failed. Try a different email.';
          return;
        }

        // 2. Save profile row for lead matching (non-blocking)
        try {
          await sb.from('user_gate_registrations').insert([{
            full_name: name, email, phone, state,
            registered_at: new Date().toISOString(),
            calc_completed: false,
            lead_submitted: false,
          }]);
        } catch (e) {
          console.warn('Profile row save error:', e.message);
        }

      } catch (e) {
        console.warn('Auth signUp error:', e.message);
        // Fall through — don't block user
      }
    }

    // 3. Cache locally so app works immediately
    try {
      localStorage.setItem(GATE_KEY, '1');
      localStorage.setItem(DATA_KEY, JSON.stringify({ name, email, phone, state }));
    } catch (e) {}

    if (typeof showLoading === 'function') showLoading(false);
    goToDashboard(name);
  };

  // ── Sign In (returning user — password verified via Supabase Auth) ─
  window.userGateReturningLogin = async function () {
    const identifier = (document.getElementById('ugReturnIdentifier')?.value || '').trim();
    const password   = (document.getElementById('ugReturnPassword')?.value   || '').trim();
    const idErrEl    = document.getElementById('ugReturnError');
    const pwErrEl    = document.getElementById('ugReturnPasswordError');
    if (idErrEl) idErrEl.textContent = '';
    if (pwErrEl) pwErrEl.textContent = '';

    // Validate inputs
    let valid = true;
    if (identifier.length < 5) { if (idErrEl) idErrEl.textContent = 'Please enter your email or phone number'; valid = false; }
    if (password.length < 1)   { if (pwErrEl) pwErrEl.textContent = 'Please enter your password'; valid = false; }
    if (!valid) return;

    if (typeof showLoading === 'function') showLoading(true, 'Signing you in...');

    const sb = getSupabase();

    // ── Path A: no Supabase available — graceful fallback ──────────
    if (!sb) {
      try {
        localStorage.setItem(GATE_KEY, '1');
        localStorage.setItem(DATA_KEY, JSON.stringify({ name: '', email: identifier, phone: identifier, state: '' }));
      } catch(e) {}
      if (typeof showLoading === 'function') showLoading(false);
      goToDashboard('');
      return;
    }

    try {
      const isEmail = identifier.includes('@');
      let emailToUse = identifier;

      // ── Phone login: look up the email registered with that phone ──
      if (!isEmail) {
        const { data: rows, error: lookupErr } = await sb
          .from('user_gate_registrations')
          .select('email, full_name, phone, state')
          .eq('phone', identifier)
          .limit(1);

        if (lookupErr || !rows || rows.length === 0) {
          if (typeof showLoading === 'function') showLoading(false);
          if (idErrEl) idErrEl.textContent = 'No account found with that phone number.';
          return;
        }
        emailToUse = rows[0].email;
      }

      // ── Authenticate with email + password via Supabase Auth ──────
      const { data: authData, error: authError } = await sb.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (typeof showLoading === 'function') showLoading(false);

      if (authError) {
        // Wrong password or unconfirmed account
        if (pwErrEl) pwErrEl.textContent = 'Incorrect password. Please try again.';
        return;
      }

      // ── Success — restore profile from DB or Auth metadata ────────
      const meta = authData?.user?.user_metadata || {};
      const name  = meta.full_name || '';
      const phone = meta.phone     || identifier;
      const state = meta.state     || '';

      try {
        localStorage.setItem(GATE_KEY, '1');
        localStorage.setItem(DATA_KEY, JSON.stringify({
          name, email: emailToUse, phone, state
        }));
      } catch(e) {}

      if (typeof showToast === 'function') showToast('Welcome back' + (name ? ', ' + name.split(' ')[0] : '') + '!', 'success');
      goToDashboard(name);

    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      console.warn('Sign-in error:', err.message);
      if (pwErrEl) pwErrEl.textContent = 'Something went wrong. Please try again.';
    }
  };

  // ── Toggle between register and returning user forms ───────────
  window.ugShowReturning = function () {
    document.getElementById('ugRegisterForm').style.display  = 'none';
    document.getElementById('ugReturningForm').style.display = '';
    const t1 = document.getElementById('ugTabCreate'), t2 = document.getElementById('ugTabLogin');
    if (t1) { t1.style.background='transparent'; t1.style.color='#64748b'; t1.style.fontWeight='600'; }
    if (t2) { t2.style.background='#f59e0b'; t2.style.color='#111'; t2.style.fontWeight='700'; }
  };
  window.ugShowRegister = function () {
    document.getElementById('ugRegisterForm').style.display  = '';
    document.getElementById('ugReturningForm').style.display = 'none';
    const t1 = document.getElementById('ugTabCreate'), t2 = document.getElementById('ugTabLogin');
    if (t1) { t1.style.background='#f59e0b'; t1.style.color='#111'; t1.style.fontWeight='700'; }
    if (t2) { t2.style.background='transparent'; t2.style.color='#64748b'; t2.style.fontWeight='600'; }
  };

  // ── Mark calc completed ────────────────────────────────────────
  window.egUserGateMarkCalcDone = async function () {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const sb   = getSupabase();
      if (!sb || !data.email) return;
      await sb.from('user_gate_registrations')
        .update({ calc_completed: true })
        .eq('email', data.email);
    } catch (e) {}
  };

  // ── Mark lead submitted ────────────────────────────────────────
  window.egUserGateMarkLeadDone = async function () {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const sb   = getSupabase();
      if (!sb || !data.email) return;
      await sb.from('user_gate_registrations')
        .update({ lead_submitted: true })
        .eq('email', data.email);
    } catch (e) {}
  };

  // ── Prefill lead form with known user data ─────────────────────
  window.egUserGatePrefill = function () {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const nameEl  = document.getElementById('leadName') || document.getElementById('leadFullName');
      const emailEl = document.getElementById('leadEmail');
      const phoneEl = document.getElementById('leadPhone');
      if (nameEl  && !nameEl.value)  nameEl.value  = data.name  || '';
      if (emailEl && !emailEl.value) emailEl.value = data.email || '';
      if (phoneEl && !phoneEl.value) phoneEl.value = data.phone || '';
    } catch (e) {}
  };

})();
