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

  window.corporateRegister = async function () {
    const company  = (document.getElementById('corpRegCompany')?.value   || '').trim();
    const rawCode  = (document.getElementById('corpRegCode')?.value       || '').trim().toUpperCase();
    const contact  = (document.getElementById('corpRegContact')?.value    || '').trim();
    const email    = (document.getElementById('corpRegEmail')?.value      || '').trim();
    const password = (document.getElementById('corpRegPassword')?.value   || '').trim();
    const industry = (document.getElementById('corpRegIndustry')?.value   || '');
    const errs = {
      corpRegCompanyError:  company.length  < 2 ? 'Company name required'  : '',
      corpRegCodeError:     rawCode.length  < 2 ? 'Company code required'  : '',
      corpRegContactError:  contact.length  < 2 ? 'Contact name required'  : '',
      corpRegEmailError:    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Valid email required' : '',
      corpRegPasswordError: password.length < 8 ? 'Min 8 characters'       : ''
    };
    let valid = true;
    Object.entries(errs).forEach(([id, msg]) => { const el = document.getElementById(id); if (el) el.textContent = msg; if (msg) valid = false; });
    if (!valid) return;

    if (typeof showLoading === 'function') showLoading(true, 'Creating account...');
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }
    try {
      const { data: authData, error: authErr } = await sb.auth.signUp({ email, password });
      if (authErr) throw authErr;
      const { error: insErr } = await sb.from('corporate_partners').insert([{
        user_id: authData.user.id, company_name: company, company_code: rawCode,
        contact_name: contact, email, industry
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
                <div style="flex:1;font-size:12px;color:#a5adcf;">Super: ${sup}</div>
                <div style="font-size:12px;font-weight:600;color:#22d97a;">${count} agent${count > 1 ? 's' : ''}</div>
              </div>`).join('');

          return `
            <div style="margin-bottom:10px;border:1px solid #2a2f4a;border-radius:10px;overflow:hidden;">
              <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:#1e2235;">
                <div style="width:8px;height:8px;border-radius:50%;background:#7c5cfc;box-shadow:0 0 6px #7c5cfc;flex-shrink:0;"></div>
                <div style="flex:1;font-size:13px;font-weight:700;color:#f0f2ff;">Master: ${master}</div>
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
        const typeMap = { agent: '👤 Agent', super_agent: '⭐ Super Agent', master_agent: '🔷 Master Agent' };
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
          <div style="font-size:10px;color:#4b5472;">${sub.created_at ? new Date(sub.created_at).toLocaleString('en-NG') : ''}</div>
        </div>`;
      }).join('');
    } catch (err) { listEl.innerHTML = '<em style="color:#ef4444;">Failed to load: ' + err.message + '</em>'; }
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
      const headers = ['Agent Type','Master Agent Code','Super Agent Code','Agent Code','Agent Name','Phone','State','City','Inverter (kVA)','Panels','Daily Load (kWh)','Submission Date'];
      const rows = data.map(r => {
        const s = r.sizing_json || {};
        return [r.agent_type||'agent', r.master_agent_code||'', r.super_agent_code||'', r.agent_code||'', r.agent_name||'', r.phone||'', r.state||'', r.city||'',
          s.invKva||'', s.numPanels||'', s.dailyKwh ? Number(s.dailyKwh).toFixed(2) : '',
          r.created_at ? new Date(r.created_at).toLocaleDateString('en-NG') : ''
        ].map(v => '"' + String(v).replace(/"/g,'""') + '"');
      });
      const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = corpSession.company_code + '_agents_' + new Date().toISOString().slice(0,10) + '.csv';
      a.click(); URL.revokeObjectURL(url);
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

  // ── Super Agent & Master Agent Sessions ───────────────────────
  let superAgentSession = null; // { code, company_code, master_agent_code }
  let masterAgentSession = null; // { code, company_code }

  // ── Super Agent Login ──────────────────────────────────────────
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
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }
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
      const procEl   = document.getElementById('saProcurementSummary');
      const delivEl  = document.getElementById('saDeliveryStatus');

      const agents = [...new Set(data.map(r => r.agent_code).filter(Boolean))];
      if (totalEl)  totalEl.textContent  = data.length;
      if (agentsEl) agentsEl.textContent = agents.length;
      if (countEl)  countEl.textContent  = agents.length + ' Agent' + (agents.length !== 1 ? 's' : '');
      if (procEl)   procEl.innerHTML     = buildProcurementSummary(data);
      if (delivEl)  delivEl.innerHTML    = buildDeliveryStatus(data);

      if (!breakEl) return;
      if (data.length === 0) {
        breakEl.innerHTML = '<div style="text-align:center;padding:20px 0;"><div style="font-size:28px;opacity:0.3;">👥</div><div style="font-size:13px;color:#4b5472;margin-top:8px;">No submissions yet from your field agents.</div></div>';
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
      downloadCSV(data, superAgentSession.code + '_team');
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

  // ── Master Agent Login ─────────────────────────────────────────
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
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }
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
      const procEl   = document.getElementById('maProcurementSummary');
      const delivEl  = document.getElementById('maDeliveryStatus');

      const supers = [...new Set(data.map(r => r.super_agent_code).filter(Boolean))];
      const agents = [...new Set(data.map(r => r.agent_code).filter(Boolean))];
      if (totalEl)  totalEl.textContent  = data.length;
      if (supersEl) supersEl.textContent = supers.length;
      if (agentsEl) agentsEl.textContent = agents.length;
      if (countEl)  countEl.textContent  = supers.length + ' Super' + (supers.length !== 1 ? 's' : '');
      if (procEl)   procEl.innerHTML     = buildProcurementSummary(data);
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
              <div style="flex:1;font-size:13px;font-weight:700;color:#f0f2ff;">Super: ${sup}</div>
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
      downloadCSV(data, masterAgentSession.code + '_region');
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
    const typeMap   = { agent: '👤 Agent', super_agent: '⭐ Super Agent', master_agent: '🔷 Master Agent' };
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
        ${sub.super_agent_code  ? `<div style="font-size:11px;color:#38bdf8;">⭐ Super: <strong>${sub.super_agent_code}</strong></div>`  : ''}
        ${sub.master_agent_code ? `<div style="font-size:11px;color:#c084fc;">🔷 Master: <strong>${sub.master_agent_code}</strong></div>` : ''}
      </div>
      <div style="display:flex;gap:14px;margin-bottom:10px;">
        <div style="font-size:11px;color:#8892a4;">📍 ${sub.city||'—'}</div>
        <div style="font-size:11px;color:#8892a4;">📞 ${sub.phone||'—'}</div>
      </div>
      <div style="background:#0f1117;border:1px solid #1e2235;border-radius:8px;padding:9px 12px;font-family:'DM Mono',monospace;font-size:10px;color:#8892a4;line-height:1.5;margin-bottom:8px;">${sub.sizing_summary||'—'}</div>
      <div style="font-size:10px;color:#4b5472;">${sub.created_at ? new Date(sub.created_at).toLocaleString('en-NG') : ''}</div>
    </div>`;
  }

  function downloadCSV(data, filenameSuffix) {
    const headers = ['Agent Type','Master Agent Code','Super Agent Code','Agent Code','Agent Name','Phone','State','City','Inverter (kVA)','Panels','Daily Load (kWh)','Submission Date'];
    const rows = data.map(r => {
      const s = r.sizing_json || {};
      return [r.agent_type||'agent', r.master_agent_code||'', r.super_agent_code||'', r.agent_code||'', r.agent_name||'', r.phone||'', r.state||'', r.city||'',
        s.invKva||'', s.numPanels||'', s.dailyKwh ? Number(s.dailyKwh).toFixed(2) : '',
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
    const sb = getSupabase();
    try {
      let companyName = null;
      if (sb) {
        const { data } = await sb.from('corporate_partners').select('company_name').eq('company_code', code).single();
        if (data) companyName = data.company_name;
      }
      if (typeof showLoading === 'function') showLoading(false);
      if (!companyName) { if (errEl) errEl.textContent = 'Company code not found. Check with your manager.'; return; }
      agentPortalCode = code;
      const portalNameEl = document.getElementById('agentPortalCompanyName');
      if (portalNameEl) portalNameEl.textContent = companyName + ' — Agent Portal';
      resetAgentSession();
      if (typeof showScreen === 'function') showScreen('corporate-agent-portal');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (errEl) errEl.textContent = 'Could not verify code. Check your connection and try again.';
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
        const typeMap = { agent: '👤 Agent', super_agent: '⭐ Super Agent', master_agent: '🔷 Master Agent' };
        if (typeLabel) typeLabel.textContent = typeMap[data.agent_type] || data.agent_type;

        let chain = '';
        if (data.agent_type === 'agent') {
          chain = `Reports to Super Agent: <strong>${data.super_agent_code || '—'}</strong><br/>Under Master Agent: <strong>${data.master_agent_code || '—'}</strong>`;
        } else if (data.agent_type === 'super_agent') {
          chain = `Reports to Master Agent: <strong>${data.master_agent_code || '—'}</strong>`;
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
  window.agentGoToCalculator = function () {
    const code  = (document.getElementById('agentCode')?.value  || '').trim().toUpperCase();
    const name  = (document.getElementById('agentName')?.value  || '').trim();
    const phone = (document.getElementById('agentPhone')?.value || '').trim();
    const state = (document.getElementById('agentState')?.value || '');
    const city  = (document.getElementById('agentCity')?.value  || '').trim();

    let valid = true;
    [['agentCodeError',  !code,           'Agent code required'],
     ['agentNameError',  name.length < 2, 'Name required'],
     ['agentPhoneError', phone.length < 7,'Phone required'],
     ['agentStateError', !state,          'Please select your state']
    ].forEach(([id, fail, msg]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = fail ? msg : '';
      if (fail) valid = false;
    });
    if (!valid) return;

    // Use registry data if available, fallback to bare code
    const superCode  = _agentRegistryData?.super_agent_code  || null;
    const masterCode = _agentRegistryData?.master_agent_code || null;
    const agentType  = _agentRegistryData?.agent_type        || 'agent';

    agentInfo = { code, superCode, masterCode, agentType, name, phone, state, city };

    // Update info bar on agent portal
    const infoBar  = document.getElementById('agentInfoBar');
    const infoText = document.getElementById('agentInfoText');
    if (infoText) infoText.textContent = `${agentType === 'master_agent' ? 'Master Agent' : agentType === 'super_agent' ? 'Super Agent' : 'Agent'}: ${name} (#${code}) — ${city ? city + ', ' : ''}${state}`;
    if (infoBar)  infoBar.style.display = '';

    // Reset calc
    if (typeof l4u_resetCalculatorSession === 'function') l4u_resetCalculatorSession();
    agentCalcResult = null;
    agentLastApps   = [];

    // Navigate to real user-calculator in agent mode
    if (typeof showScreen === 'function') showScreen('user-calculator');
    // enterAgentCalcMode is called from our showScreen hook below
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
      }]);
      if (error) throw error;
      if (typeof showLoading === 'function') showLoading(false);
      exitAgentCalcMode();
      const successEl = document.getElementById('agentSuccessSummary');
      if (successEl) {
        successEl.innerHTML = `
          <div style="margin-bottom:6px;"><strong>Agent:</strong> ${agentInfo.name} (#${agentInfo.code})</div>
          <div style="margin-bottom:6px;"><strong>Location:</strong> ${agentInfo.city ? agentInfo.city + ', ' : ''}${agentInfo.state}</div>
          <div><strong>System:</strong> ${sizingSummary}</div>`;
      }
      if (typeof showScreen === 'function') showScreen('corporate-agent-success');
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast === 'function') showToast('Submission failed: ' + err.message, 'error');
    }
  };

  // ── Hook showScreen ────────────────────────────────────────────
  const _origShowScreen = window.showScreen;
  window.showScreen = function (screenId) {
    if (typeof _origShowScreen === 'function') _origShowScreen(screenId);

    if (screenId === 'user-calculator') {
      if (agentInfo) {
        // Small delay so platform.js finishes its own showScreen logic first
        setTimeout(enterAgentCalcMode, 50);
      } else {
        exitAgentCalcMode();
      }
    }
    if (screenId === 'corporate-submissions')              loadCorpSubmissions();
    if (screenId === 'corporate-dashboard' && corpSession) loadCorpStats();
    if (screenId === 'agent-code-entry')                   setupAgentCodeLivePreview();
    // When leaving agent portal to anywhere other than user-calculator, clean up
    if (screenId !== 'user-calculator' && screenId !== 'corporate-agent-portal' && screenId !== 'corporate-agent-success') {
      if (!corpSession) exitAgentCalcMode(); // only if not corporate user
    }
  };

  // ── Size My Shop — Super Agent ─────────────────────────────────
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

  // ── Size My Shop — Master Agent ────────────────────────────────
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

  // ── Procurement Summary Helper ─────────────────────────────────
  const INVERTER_PRICES = {
    '1-3':  450000,
    '3-5':  750000,
    '5-10': 1200000,
    '10+':  2000000
  };

  function buildProcurementSummary(data) {
    if (!data || data.length === 0) {
      return '<div style="text-align:center;padding:16px 0;font-size:13px;color:#4b5472;">No submissions yet.</div>';
    }

    let totalPanels = 0, totalBatteries = 0, totalInverters = data.length;
    let confirmed = 0, pending = 0;
    const brackets = { '1-3': 0, '3-5': 0, '5-10': 0, '10+': 0 };

    data.forEach(r => {
      const s = r.sizing_json || {};
      totalPanels    += parseInt(s.numPanels || 0);
      totalBatteries += parseInt(s.numBattStrings || s.strings || 0);

      const kva = parseFloat(s.invKva || 0);
      if (kva <= 3)       brackets['1-3']++;
      else if (kva <= 5)  brackets['3-5']++;
      else if (kva <= 10) brackets['5-10']++;
      else                brackets['10+']++;

      if (r.receipt_status === 'received') confirmed++;
      else pending++;
    });

    let totalBudget = 0;
    Object.entries(brackets).forEach(([b, count]) => {
      totalBudget += count * (INVERTER_PRICES[b] || 0);
    });

    const bracketRows = Object.entries(brackets)
      .filter(([, count]) => count > 0)
      .map(([b, count]) => {
        const price = INVERTER_PRICES[b];
        const subtotal = count * price;
        return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e2235;font-size:12px;">
          <span style="color:#a5adcf;">${b} kVA systems</span>
          <span style="color:#f0f2ff;font-weight:600;">${count} shops</span>
          <span style="color:#22d97a;">₦${(subtotal/1000000).toFixed(1)}M</span>
        </div>`;
      }).join('');

    return `
      <div style="margin-bottom:14px;">
        <div style="font-size:11px;font-weight:600;color:#4b5472;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">By Inverter Size</div>
        ${bracketRows}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
        <div style="background:#0f1117;border:1px solid #1e2235;border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:18px;font-weight:700;color:#38bdf8;">${totalInverters}</div>
          <div style="font-size:10px;color:#4b5472;margin-top:2px;">Inverters</div>
        </div>
        <div style="background:#0f1117;border:1px solid #1e2235;border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:18px;font-weight:700;color:#f59e0b;">${totalPanels}</div>
          <div style="font-size:10px;color:#4b5472;margin-top:2px;">Panels (400W)</div>
        </div>
        <div style="background:#0f1117;border:1px solid #1e2235;border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:18px;font-weight:700;color:#a78bfa;">${totalBatteries}</div>
          <div style="font-size:10px;color:#4b5472;margin-top:2px;">Batteries</div>
        </div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(34,217,122,0.08),#0f1117);border:1px solid rgba(34,217,122,0.2);border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:11px;color:#4b5472;margin-bottom:4px;">ESTIMATED TOTAL BUDGET</div>
        <div style="font-size:22px;font-weight:800;color:#22d97a;">₦${(totalBudget/1000000).toFixed(1)}M</div>
      </div>`;
  }

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

  window.agentConfirmReceiptSubmit = async function () {
    const agentCode = (document.getElementById('receiptAgentCode')?.value || '').trim().toUpperCase();
    const photoFile = document.getElementById('receiptPhoto')?.files[0];
    const notes     = (document.getElementById('receiptNotes')?.value || '').trim();

    const codeErr  = document.getElementById('receiptAgentCodeError');
    const photoErr = document.getElementById('receiptPhotoError');
    if (codeErr)  codeErr.textContent  = '';
    if (photoErr) photoErr.textContent = '';

    let valid = true;
    if (!agentCode) { if (codeErr)  codeErr.textContent  = 'Agent code required'; valid = false; }
    if (!photoFile) { if (photoErr) photoErr.textContent = 'Please upload a photo'; valid = false; }
    if (!valid) return;

    if (typeof showLoading === 'function') showLoading(true, 'Uploading confirmation...');
    const sb = getSupabase();
    if (!sb) { if (typeof showLoading === 'function') showLoading(false); return; }

    try {
      // Upload photo to Supabase Storage
      const fileExt  = photoFile.name.split('.').pop();
      const fileName = `receipts/${agentCode}_${Date.now()}.${fileExt}`;
      let photoUrl   = null;

      const { data: uploadData, error: uploadErr } = await sb.storage
        .from('agent-receipts')
        .upload(fileName, photoFile, { upsert: true });

      if (!uploadErr && uploadData) {
        const { data: urlData } = sb.storage
          .from('agent-receipts')
          .getPublicUrl(fileName);
        photoUrl = urlData?.publicUrl || null;
      }

      // Update the submission record
      const { error: updateErr } = await sb
        .from('agent_submissions')
        .update({
          receipt_status:    'received',
          receipt_photo_url: photoUrl,
          receipt_notes:     notes,
          receipt_confirmed_at: new Date().toISOString()
        })
        .eq('agent_code', agentCode)
        .eq('company_code', agentPortalCode || '');

      if (updateErr) throw updateErr;

      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showScreen  === 'function') showScreen('agent-receipt-success');

    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast   === 'function') showToast('Confirmation failed: ' + err.message, 'error');
    }
  };

  // ── Init ───────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAgentUrl);
  } else {
    checkAgentUrl();
  }

})();
