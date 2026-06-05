(function(){
  const _showScreen = window.showScreen;
  window.showScreen = function(screenId){
    document.body.classList.remove('screen-vendor-calculator');
    if (screenId === 'vendor-calculator') document.body.classList.add('screen-vendor-calculator');
    const out = _showScreen.apply(this, arguments);
    const stray = document.getElementById('vendorCalcBuildOfferBtn');
    if (stray && screenId !== 'vendor-calculator') stray.style.display = 'none';
    // Re-init quick-add chips each time a calc screen is opened
    if (screenId === 'installer-calculator') {
      requestAnimationFrame(function(){
        if (typeof l4i_renderQuickAddChips === 'function') l4i_renderQuickAddChips();
        if (typeof l4i_renderApplianceSuggestions === 'function') l4i_renderApplianceSuggestions();
      });
    }
    if (screenId === 'vendor-calculator') {
      requestAnimationFrame(function(){
        if (typeof l4v_renderQuickAddChips === 'function') l4v_renderQuickAddChips();
        if (typeof l4v_renderApplianceSuggestions === 'function') l4v_renderApplianceSuggestions();
      });
    }
    if (screenId === 'user-calculator') {
      requestAnimationFrame(function(){
        if (typeof l4u_renderQuickAddChips === 'function') l4u_renderQuickAddChips();
        if (typeof l4u_renderApplianceSuggestions === 'function') l4u_renderApplianceSuggestions();
      });
    }
    return out;
  };

  function forceTop(screenId){
    try {
      const screen = document.getElementById(screenId);
      if (screen) {
        screen.scrollTop = 0;
        if (typeof screen.scrollTo === 'function') screen.scrollTo(0,0);
      }
      const app = document.getElementById('app');
      if (app) { app.scrollTop = 0; if (typeof app.scrollTo === 'function') app.scrollTo(0,0); }
      const content = document.querySelector('.app-content, .content, .main-content');
      if (content) { content.scrollTop = 0; if (typeof content.scrollTo === 'function') content.scrollTo(0,0); }
      const rp = document.querySelector('.right-panel');
      if (rp) { rp.scrollTop = 0; if (typeof rp.scrollTo === 'function') rp.scrollTo(0,0); }
      window.scrollTo(0,0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch(e) {}
  }


  window.openInstallerQuoteBuilder = function(){
    if (!window.instCalculationResult) { if (window.showToast) showToast('No calculation result. Please calculate first.', 'error'); return; }
    try {
      window.iqbAttachedLead = null;
      if (typeof populateQuoteBuilder === 'function') populateQuoteBuilder();
      showScreen('installer-quote-builder');
      requestAnimationFrame(() => { forceResetScroll(); setTimeout(forceResetScroll, 40); setTimeout(forceResetScroll, 120); });
      forceTop('installer-quote-builder');
      requestAnimationFrame(()=>forceTop('installer-quote-builder'));
      setTimeout(()=>forceTop('installer-quote-builder'), 40);
    } catch(e) {
      console.error('openInstallerQuoteBuilder error', e);
      if (window.showToast) showToast('Could not open quote builder', 'error');
    }
  };

  window.openVendorOfferBuilder = function(){
    if (!window.vendorIframeResult) {
      if (window.showToast) showToast('Please run a calculation first.', 'error');
      return;
    }
    try {
      window.vobAttachedLead = null;
      if (typeof vobPopulate === 'function') vobPopulate(window.vendorIframeResult);
      showScreen('vendor-offer-builder');
      const stray = document.getElementById('vendorCalcBuildOfferBtn');
      if (stray) stray.style.display = 'none';
      forceTop('vendor-offer-builder');
      requestAnimationFrame(()=>forceTop('vendor-offer-builder'));
      setTimeout(()=>forceTop('vendor-offer-builder'), 40);
    } catch(e) {
      console.error('openVendorOfferBuilder error', e);
      if (window.showToast) showToast('Could not open build offer screen', 'error');
    }
  };
})();
