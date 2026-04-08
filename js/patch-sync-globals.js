(function(){
  function syncGlobals(){
    try { if (typeof userCalculationResult !== 'undefined') window.userCalculationResult = userCalculationResult; } catch(e) {}
    try { if (typeof instCalculationResult !== 'undefined') window.instCalculationResult = instCalculationResult; } catch(e) {}
    try { if (typeof vendorIframeResult !== 'undefined') window.vendorIframeResult = vendorIframeResult; } catch(e) {}
  }

  function normalizeInstallerResult(result, apps){
    const r = Object.assign({}, result || {});
    const invKva = Number(r.invKva || 0);
    const requiredInverter = Number(r.requiredInverter || Math.round(invKva * 1000) || 0);
    const panelCount = Number(r.totalPanels || r.panelCount || r.numPanels || 0);
    const panelWatts = Number((r.panel && r.panel.watts) || r.panelWatts || 550);
    const batteryCount = Number(r.batteryCount || r.batUnits || 1);
    const batteryBankKwh = Number(r.batteryBankKwh || r.lithiumPackKwh || r.batteryEnergyKwh || 0);
    const pvCable = r.pvCable || 6;
    const battCable = r.battCable || 35;
    const acCable = r.acCable || 2.5;
    const pvBreaker = r.pvBreaker || 16;
    const battBreaker = r.battBreaker || 125;
    const acBreaker = r.acBreaker || 16;
    let builtCosts = null;
    if (typeof egBuildCostBreakdown === 'function') {
      builtCosts = egBuildCostBreakdown({
        invKva: Math.max(1, Math.ceil(requiredInverter / 1000)),
        lithiumPackKwh: batteryBankKwh,
        numPanels: panelCount,
        pvCable,
        battCable,
        acCable,
        pvBreaker,
        battBreaker,
        acBreaker
      }) || null;
    }
    const out = {
      ...r,
      appliances: Array.isArray(apps) ? apps : (Array.isArray(r.appliances) ? r.appliances : []),
      totalRunning: Number(r.totalRunning || r.totalWatts || 0),
      dailyEnergy: Number(r.dailyEnergy || ((Number(r.dailyKwh || 0)) * 1000) || 0),
      requiredInverter,
      totalPanels: panelCount,
      actualPvPower: Number(r.actualPvPower || r.pvWatts || panelCount * panelWatts || 0),
      batteryCount,
      batteryType: r.batteryType || 'Lithium',
      batteryBankKwh,
      panel: r.panel || { model: `${panelWatts}W Solar Panel`, watts: panelWatts },
      panelUnitPrice: Number(r.panelUnitPrice || (builtCosts && builtCosts.panelUnitPrice) || 130000),
      panelCost: Number(r.panelCost || (builtCosts && builtCosts.panelCost) || 0),
      inverterCost: Number(r.inverterCost || (builtCosts && builtCosts.inverterCost) || 0),
      batteryUnitPrice: Number(r.batteryUnitPrice || (builtCosts && builtCosts.batteryUnitPrice) || 0),
      batteryCost: Number(r.batteryCost || (builtCosts && builtCosts.batteryCost) || 0),
      pvBreakerPrice: Number(r.pvBreakerPrice || (builtCosts && builtCosts.pvBreakerPrice) || 0),
      batteryBreakerPrice: Number(r.batteryBreakerPrice || (builtCosts && builtCosts.batteryBreakerPrice) || 0),
      acBreakerPrice: Number(r.acBreakerPrice || (builtCosts && builtCosts.acBreakerPrice) || 0),
      pvCablePerMeter: Number(r.pvCablePerMeter || (builtCosts && builtCosts.pvCablePerMeter) || 0),
      batteryCablePerMeter: Number(r.batteryCablePerMeter || (builtCosts && builtCosts.batteryCablePerMeter) || 0),
      acCablePerMeter: Number(r.acCablePerMeter || (builtCosts && builtCosts.acCablePerMeter) || 0),
      pvCableCost: Number(r.pvCableCost || (builtCosts && builtCosts.pvCableCost) || 0),
      batteryCableCost: Number(r.batteryCableCost || (builtCosts && builtCosts.batteryCableCost) || 0),
      acCableCost: Number(r.acCableCost || (builtCosts && builtCosts.acCableCost) || 0),

      totalCost: Number(r.totalCost || (builtCosts && builtCosts.totalCost) || 0),
      costs: r.costs || {
        panels: { cost: Number(r.panelCost || (builtCosts && builtCosts.panelCost) || (r.panelUnitPrice || 130000) * panelCount) },
        inverter: { cost: Number(r.inverterCost || (builtCosts && builtCosts.inverterCost) || 0) },
        batteries: { cost: Number(r.batteryCost || (builtCosts && builtCosts.batteryCost) || 0) },
        controller: { cost: Number(r.controllerCost || 0) },
        cables: { cost: Number(r.cablesCost || 0) },
        installation: { cost: Number(r.installationCost || 0) },
        misc: { cost: Number(r.miscCost || 0) },
      },
      cables: Array.isArray(r.cables) ? r.cables : [
        { name: 'PV Cable', cable: { size_mm2: pvCable }, length: 10, cost: 0 },
        { name: 'Battery Cable', cable: { size_mm2: battCable }, length: 3, cost: 0 },
        { name: 'AC Cable', cable: { size_mm2: acCable }, length: 10, cost: 0 }
      ],
      breakers: Array.isArray(r.breakers) ? r.breakers : [
        { name: 'PV Breaker', rating_A: pvBreaker, type: 'DC', price_NGN: 0 },
        { name: 'Battery Breaker', rating_A: battBreaker, type: 'DC', price_NGN: 0 },
        { name: 'AC Breaker', rating_A: acBreaker, type: 'AC', price_NGN: 0 }
      ]
    };
    return out;
  }

  if (typeof handleUserCalcResult === 'function') {
    const _origHandleUser = handleUserCalcResult;
    handleUserCalcResult = function(result, apps){
      const rv = _origHandleUser(result, apps);
      syncGlobals();
      return rv;
    };
  }

  if (typeof handleVendorIframeResult === 'function') {
    const _origHandleVendor = handleVendorIframeResult;
    handleVendorIframeResult = function(result, apps){
      const rv = _origHandleVendor(result, apps);
      syncGlobals();
      const btn = document.getElementById('vendorCalcBuildOfferBtn');
      if (btn && window.vendorIframeResult) btn.style.display = 'block';
      return rv;
    };
  }

  if (typeof receiveEmbeddedCalculation === 'function') {
    receiveEmbeddedCalculation = function(mode, result, apps) {
      if (mode === 'user') {
        if (typeof handleUserCalcResult === 'function') handleUserCalcResult(result, apps);
      } else if (mode === 'vendor') {
        if (typeof handleVendorIframeResult === 'function') handleVendorIframeResult(result, apps);
      } else if (mode === 'installer') {
        instCalculationResult = normalizeInstallerResult(result, apps);
        window.instCalculationResult = instCalculationResult;
        const btn = document.getElementById('eg-view-results-btn');
        if (btn) btn.style.display = 'block';
      }
      syncGlobals();
    };
  }

  if (typeof openInstViewCost === 'function') {
    const _origOpenInstViewCost = openInstViewCost;
    openInstViewCost = function(){
      syncGlobals();
      if (!window.instCalculationResult && typeof instCalculationResult !== 'undefined' && instCalculationResult) {
        window.instCalculationResult = instCalculationResult;
      }
      return _origOpenInstViewCost();
    };
    window.openInstViewCost = openInstViewCost;
  }

  if (typeof openInstallerQuoteBuilder === 'function') {
    const _origOpenInstallerQuoteBuilder = openInstallerQuoteBuilder;
    openInstallerQuoteBuilder = function(){
      syncGlobals();
      if (!window.instCalculationResult && typeof instCalculationResult !== 'undefined' && instCalculationResult) {
        window.instCalculationResult = instCalculationResult;
      }
      return _origOpenInstallerQuoteBuilder();
    };
    window.openInstallerQuoteBuilder = openInstallerQuoteBuilder;
  }

  if (typeof openVendorOfferBuilder === 'function') {
    const _origOpenVendorOfferBuilder = openVendorOfferBuilder;
    openVendorOfferBuilder = function(){
      syncGlobals();
      if (!window.vendorIframeResult && typeof vendorIframeResult !== 'undefined' && vendorIframeResult) {
        window.vendorIframeResult = vendorIframeResult;
      }
      return _origOpenVendorOfferBuilder();
    };
    window.openVendorOfferBuilder = openVendorOfferBuilder;
  }

  document.addEventListener('click', function(){ setTimeout(syncGlobals, 0); }, true);
  document.addEventListener('DOMContentLoaded', syncGlobals);
  setTimeout(syncGlobals, 0);
})();
