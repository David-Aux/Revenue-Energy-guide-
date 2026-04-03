(function(){
  const topSensitiveScreens = new Set(['installer-profile-view','vendor-profile-view','installer-profile','vendor-profile','installer-quote-builder','vendor-offer-builder']);
  function hardScrollTop(screenId){
    try {
      const el = document.getElementById(screenId);
      if (el) {
                el.scrollTop = 0;
        if (typeof el.scrollTo === 'function') el.scrollTo({top:0,left:0,behavior:'auto'});
      }
      [document.scrollingElement, document.documentElement, document.body, document.getElementById('app'), document.querySelector('.content'), document.querySelector('.app-content'), document.querySelector('.main-content'), document.querySelector('.right-panel'), document.querySelector('.left-panel')].forEach(n=>{
        try { if (n) { n.scrollTop = 0; if (typeof n.scrollTo === 'function') n.scrollTo({top:0,left:0,behavior:'auto'}); } } catch(e){}
      });
      try { window.scrollTo({top:0,left:0,behavior:'auto'}); } catch(e){}
    } catch(e){}
  }
  function darkenScreen(screenId){
    const root = document.getElementById(screenId);
    if (!root) return;
    root.style.background = '#020817';
    root.style.color = '#e5e7eb';
    const candidates = root.querySelectorAll('div, section, article, table, th, td, label, p, h1, h2, h3, h4, span, button, input, select, textarea');
    candidates.forEach(el=>{
      const styleAttr = (el.getAttribute('style')||'').toLowerCase();
      if (/background\s*:\s*(#fff|white|#fafafa|#f9fafb|#f3f4f6|#f0fdf4|#ecfdf3|#fef3c7|#fff7ed)/.test(styleAttr)) {
        el.style.background = (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') ? '#08111f' : '#071326';
        el.style.color = '#e5e7eb';
        if (el.tagName !== 'TH' && el.tagName !== 'TD') el.style.borderColor = 'rgba(148,163,184,.22)';
      }
      if (/color\s*:\s*(#111827|#374151|#4b5563|#687076|#6b7280|#9ca3af)/.test(styleAttr)) {
        el.style.color = '#e5e7eb';
      }
    });
    if (screenId === 'installer-profile-view' || screenId === 'vendor-profile-view') {
      const holder = root.querySelector('#installerProfileViewContent > div, #vendorProfileViewContent > div');
      if (holder) {
        holder.style.background = '#071326';
        holder.style.color = '#e5e7eb';
        holder.style.borderColor = 'rgba(96,165,250,.18)';
      }
    }
  }
  function refreshProblemScreens(screenId){
    darkenScreen(screenId);
    hardScrollTop(screenId);
    setTimeout(()=>{ darkenScreen(screenId); hardScrollTop(screenId); }, 60);
    setTimeout(()=>{ darkenScreen(screenId); hardScrollTop(screenId); }, 180);
    setTimeout(()=>{ darkenScreen(screenId); hardScrollTop(screenId); }, 320);
  }
  if (typeof showScreen === 'function') {
    const _origShowScreen = showScreen;
    showScreen = function(screenId){
      const rv = _origShowScreen(screenId);
      if (topSensitiveScreens.has(screenId)) refreshProblemScreens(screenId);
      return rv;
    };
    window.showScreen = showScreen;
  }
  if (typeof loadInstallerProfileViewScreen === 'function') {
    const _f = loadInstallerProfileViewScreen;
    loadInstallerProfileViewScreen = async function(){
      const rv = await _f.apply(this, arguments);
      refreshProblemScreens('installer-profile-view');
      return rv;
    };
  }
  if (typeof loadVendorProfileViewScreen === 'function') {
    const _f = loadVendorProfileViewScreen;
    loadVendorProfileViewScreen = async function(){
      const rv = await _f.apply(this, arguments);
      refreshProblemScreens('vendor-profile-view');
      return rv;
    };
  }
  if (typeof loadInstallerProfileScreen === 'function') {
    const _f = loadInstallerProfileScreen;
    loadInstallerProfileScreen = async function(){
      const rv = await _f.apply(this, arguments);
      refreshProblemScreens('installer-profile');
      return rv;
    };
  }
  if (typeof loadVendorProfileScreen === 'function') {
    const _f = loadVendorProfileScreen;
    loadVendorProfileScreen = async function(){
      const rv = await _f.apply(this, arguments);
      refreshProblemScreens('vendor-profile');
      return rv;
    };
  }
  if (typeof populateQuoteBuilder === 'function') {
    const _f = populateQuoteBuilder;
    populateQuoteBuilder = function(){
      const rv = _f.apply(this, arguments);
      refreshProblemScreens('installer-quote-builder');
      return rv;
    };
  }
  if (typeof vobPopulate === 'function') {
    const _f = vobPopulate;
    vobPopulate = function(){
      const rv = _f.apply(this, arguments);
      refreshProblemScreens('vendor-offer-builder');
      return rv;
    };
  }
})();
