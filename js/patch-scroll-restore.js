(function(){
  try { if (history && "scrollRestoration" in history) history.scrollRestoration = "manual"; } catch(e) {}
  function safeTop(){
    try {
      const nodes=[window, document.scrollingElement, document.documentElement, document.body, document.querySelector('.content'), document.querySelector('.app-container'), document.querySelector('.screen.active'), document.querySelector('.right-panel'), document.querySelector('.left-panel')];
      nodes.forEach(n=>{
        try {
          if (!n) return;
          if (n===window) { window.scrollTo(0,0); }
          else { n.scrollTop=0; if (typeof n.scrollTo==='function') n.scrollTo({top:0,left:0,behavior:'auto'}); }
        } catch(e) {}
      });
    } catch(e) {}
  }
  const origShowScreen = window.showScreen;
  if (typeof origShowScreen === 'function') {
    window.showScreen = function(screenId){
      const out = origShowScreen.apply(this, arguments);
      safeTop();
      requestAnimationFrame(()=>{ safeTop(); setTimeout(safeTop,50); setTimeout(safeTop,180); setTimeout(safeTop,400); });
      return out;
    };
  }
  ['loadInstallerProfileViewScreen','loadVendorProfileViewScreen','loadInstallerProfileScreen','loadVendorProfileScreen','openInstallerQuoteBuilder','openVendorOfferBuilder'].forEach(name=>{
    const fn = window[name];
    if (typeof fn === 'function') {
      window[name] = async function(){
        const out = await fn.apply(this, arguments);
        safeTop();
        requestAnimationFrame(()=>{ safeTop(); setTimeout(safeTop,50); setTimeout(safeTop,180); setTimeout(safeTop,400); });
        return out;
      };
    }
  });
})();
