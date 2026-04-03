(function(){
  const _showScreen = window.showScreen;
  window.showScreen = function(screenId){
    document.body.classList.remove('screen-vendor-calculator');
    if (screenId === 'vendor-calculator') document.body.classList.add('screen-vendor-calculator');
    const out = _showScreen.apply(this, arguments);
    const stray = document.getElementById('vendorCalcBuildOfferBtn');
    if (stray && screenId !== 'vendor-calculator') stray.style.display = 'none';
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


  function egSetSharedCostActions(role){
    const root = document.getElementById('user-cost-breakdown');
    if (!root) return;
    const installerBtn = root.querySelector('button[onclick*="openInstallerMarketplace"]');
    const vendorBtn = root.querySelector('button[onclick*="openVendorMarketplace"]');
    const isInstaller = role === 'installer';
    if (installerBtn) installerBtn.style.display = isInstaller ? 'none' : 'block';
    if (vendorBtn) vendorBtn.style.display = isInstaller ? 'none' : 'block';
  }

  window.openInstViewCost = function(){
    if (!window.instCalculationResult) { if (window.showToast) showToast('No calculation result', 'error'); return; }
    try {
      currentRole = 'installer';
      const r0 = window.instCalculationResult || {};
      const N = v => Number(v || 0).toLocaleString();

      // Rebuild a reliable installer cost object from any available installer calculation shape
      const normalized = Object.assign({}, r0);
      const invKva = Number(normalized.invKva || Math.max(1, Math.ceil((Number(normalized.requiredInverter)||0) / 1000)) || 0);
      const numPanels = Number(normalized.numPanels || normalized.totalPanels || normalized.panelCount || 0);
      const lithiumPackKwh = Number(normalized.lithiumPackKwh || normalized.batteryBankKwh || normalized.batteryEnergyKwh || 0);
      const leadTotalBatteries = Number(normalized.leadTotalBatteries || ((String(normalized.batteryType||'').toLowerCase().includes('tub')) ? (normalized.batteryCount || 0) : 0) || 0);
      const pvBreaker = Number(normalized.pvBreaker || (normalized.breakers && normalized.breakers[0] ? normalized.breakers[0].rating_A : 0) || 0);
      const battBreaker = Number(normalized.battBreaker || (normalized.breakers && normalized.breakers[1] ? normalized.breakers[1].rating_A : 0) || 0);
      const acBreaker = Number(normalized.acBreaker || (normalized.breakers && normalized.breakers[2] ? normalized.breakers[2].rating_A : 0) || 0);
      const pvCable = normalized.pvCable || (normalized.cables && normalized.cables[0] && normalized.cables[0].cable ? normalized.cables[0].cable.size_mm2 : 0) || 0;
      const battCable = normalized.battCable || (normalized.cables && normalized.cables[1] && normalized.cables[1].cable ? normalized.cables[1].cable.size_mm2 : 0) || 0;
      const acCable = normalized.acCable || (normalized.cables && normalized.cables[2] && normalized.cables[2].cable ? normalized.cables[2].cable.size_mm2 : 0) || 0;

      let breakdown = {};
      if (typeof egBuildCostBreakdown === 'function') {
        breakdown = egBuildCostBreakdown({
          invKva,
          lithiumPackKwh,
          numPanels,
          leadTotalBatteries,
          pvBreaker,
          battBreaker,
          acBreaker,
          pvCable,
          battCable,
          acCable
        }) || {};
      }
      Object.assign(normalized, breakdown);
      if (!normalized.panelCost && normalized.costs && normalized.costs.panels) normalized.panelCost = Number(normalized.costs.panels.cost || 0);
      if (!normalized.inverterCost && normalized.costs && normalized.costs.inverter) normalized.inverterCost = Number(normalized.costs.inverter.cost || 0);
      if (!normalized.batteryCost && normalized.costs && normalized.costs.batteries) normalized.batteryCost = Number(normalized.costs.batteries.cost || 0);
      normalized.totalCost = Number(normalized.totalCost || (normalized.panelCost||0) + (normalized.inverterCost||0) + (normalized.batteryCost||0));
      // persist the repaired object back so quote builder can use it too
      window.instCalculationResult = normalized;
      try { if (typeof instCalculationResult !== 'undefined') instCalculationResult = normalized; } catch(e) {}

      const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      setText('userTotalCost', '₦' + N(normalized.totalCost));
      setText('costPanels', '₦' + N(normalized.panelCost));
      setText('costInverter', '₦' + N(normalized.inverterCost));
      setText('costBattery', '₦' + N(normalized.batteryCost));

      const bodyEl = document.getElementById('costBreakdownBody');
      if (bodyEl) {
        const batteryLabel = normalized.batLabel
          ? `${normalized.batUnits || normalized.batteryCount || 1} × ${normalized.batLabel}`
          : (String(normalized.batteryType||'').toLowerCase().includes('tub')
              ? `${leadTotalBatteries || normalized.batteryCount || 0} × 220Ah Tubular Battery`
              : `${normalized.batteryCount || 1} × ${(normalized.batteryBankKwh || normalized.lithiumPackKwh || 0)}kWh Lithium Battery`);
        const rows = [
          ['Solar Panels', `${numPanels} panel(s) @ ₦${N(normalized.panelUnitPrice || 0)}`, normalized.panelCost || 0],
          ['Hybrid Inverter', `${invKva}kVA`, normalized.inverterCost || 0],
          ['Battery', batteryLabel, normalized.batteryCost || 0],
          ['Alternative Tubular Battery Option', `₦${N(normalized.tubularUnitPrice || 0)} × ${leadTotalBatteries || 0} batteries = ₦${N(normalized.tubularAltCost || 0)}`, normalized.tubularAltCost || 0]
        ];
        bodyEl.innerHTML = rows.map(([item, detail, cost]) => `<tr><td>${item}</td><td style="font-size:12px;color:#9ca3af;">${detail}</td><td>₦${N(cost)}</td></tr>`).join('');
      }

      const refEl = document.getElementById('costReferenceBody');
      if (refEl) {
        const rows = [
          ['PV Breaker', `${pvBreaker}A DC recommended`, normalized.pvBreakerPrice || 0],
          ['Battery Breaker', `${battBreaker}A DC recommended`, normalized.batteryBreakerPrice || 0],
          ['AC Breaker', `${acBreaker}A AC recommended`, normalized.acBreakerPrice || 0],
          ['PV Cable', `₦${N(normalized.pvCablePerMeter || 0)} (/m) × 10 = ₦${N(normalized.pvCableCost || 0)}`, normalized.pvCableCost || 0],
          ['Battery Cable', `₦${N(normalized.batteryCablePerMeter || 0)} (/m) × 3 = ₦${N(normalized.batteryCableCost || 0)}`, normalized.batteryCableCost || 0],
          ['AC Cable', `₦${N(normalized.acCablePerMeter || 0)} (/m) × 10 = ₦${N(normalized.acCableCost || 0)}`, normalized.acCableCost || 0]
        ];
        refEl.innerHTML = rows.map(([item, detail, price]) => `<tr><td>${item}</td><td style="font-size:12px;color:#9ca3af;">${detail}</td><td>₦${N(price)}</td></tr>`).join('');
      }

      const notesEl = document.getElementById('costNotes');
      if (notesEl) notesEl.textContent = 'Final total covers core equipment only. Breakers and cable prices are shown separately and remain subject to installer site verification.';

      showScreen('user-cost-breakdown');
      // Hide user-only actions reliably in installer mode
      const installerMarketBtn = document.querySelector('#user-cost-breakdown button[onclick*="openInstallerMarketplace"]');
      const vendorMarketBtn = document.querySelector('#user-cost-breakdown button[onclick*="openVendorMarketplace"]');
      if (installerMarketBtn) { installerMarketBtn.style.display = 'none'; installerMarketBtn.hidden = true; }
      if (vendorMarketBtn) { vendorMarketBtn.style.display = 'none'; vendorMarketBtn.hidden = true; }
      document.querySelectorAll('#user-cost-breakdown button').forEach(btn => {
        const t = (btn.textContent || '').toLowerCase();
        if (t.includes('installers near me') || t.includes('view vendors')) { btn.style.display = 'none'; btn.hidden = true; }
        if (t.includes('back')) {
          btn.style.display = 'block';
          btn.hidden = false;
          btn.textContent = '← Back to Calculator';
          btn.onclick = () => { showScreen('installer-calculator'); forceTop('installer-calculator'); };
        }
      });
      egSetSharedCostActions('installer');
      forceTop('user-cost-breakdown');
      requestAnimationFrame(()=>{ egSetSharedCostActions('installer'); forceTop('user-cost-breakdown'); });
      setTimeout(()=>{
        document.querySelectorAll('#user-cost-breakdown button').forEach(btn => {
          const t = (btn.textContent || '').toLowerCase();
          if (t.includes('installers near me') || t.includes('view vendors')) btn.style.display = 'none';
        });
        egSetSharedCostActions('installer');
        forceTop('user-cost-breakdown');
      }, 50);
    } catch(e) {
      console.error('openInstViewCost error', e);
      if (window.showToast) showToast('Could not open installer cost view', 'error');
    }
  };
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
