(function() {

// ── eg-user-calc inlined (egU) ──
let egU_appliances = [];

  // ==========================================
  // DATABASE: INVERTERS BY VOLTAGE
  // ==========================================
  const INVERTER_DATABASE = {
    12: [
      { model: '1kVA Hybrid Inverter (12V)', kva: 1, voltage: 12 },
      { model: '1.5kVA Hybrid Inverter (12V)', kva: 1.5, voltage: 12 },
      { model: '2kVA Hybrid Inverter (12V)', kva: 2, voltage: 12 }
    ],
    24: [
      { model: '3kVA Hybrid Inverter (24V)', kva: 3, voltage: 24 },
      { model: '3.5kVA Hybrid Inverter (24V)', kva: 3.5, voltage: 24 },
      { model: '4kVA Hybrid Inverter (24V)', kva: 4, voltage: 24 },
      { model: '5kVA Hybrid Inverter (24V)', kva: 5, voltage: 24 },
      { model: '6kVA Hybrid Inverter (24V)', kva: 6, voltage: 24 }
    ],
    48: [
      { model: '8kVA Hybrid Inverter (48V)', kva: 8, voltage: 48 },
      { model: '10kVA Hybrid Inverter (48V)', kva: 10, voltage: 48 },
      { model: '12kVA Hybrid Inverter (48V)', kva: 12, voltage: 48 },
      { model: '15kVA Hybrid Inverter (48V)', kva: 15, voltage: 48 },
      { model: '20kVA Hybrid Inverter (48V)', kva: 20, voltage: 48 }
    ]
  };

  // ==========================================
  // DATABASE: LITHIUM BATTERIES BY VOLTAGE
  // ==========================================
  const LITHIUM_PRODUCTS = {
    12: [],
    24: [
      { label: '2.5kWh Lithium', kwh: 2.5, nominalVoltage: 25.6, systemVoltage: 24 },
      { label: '3kWh Lithium', kwh: 3.0, nominalVoltage: 25.6, systemVoltage: 24 }
    ],
    48: [
      { label: '5kWh Lithium', kwh: 5.0, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '7.5kWh Lithium', kwh: 7.5, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '10kWh Lithium', kwh: 10.0, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '15kWh Lithium', kwh: 15.0, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '20kWh Lithium', kwh: 20.0, nominalVoltage: 51.2, systemVoltage: 48 }
    ]
  };

  // ==========================================
  // DATABASE: LEAD-ACID CONFIGURATION
  // ==========================================
  const LEAD_ACID_CONFIG = {
    12: { unitAh: 220, series: 1 },
    24: { unitAh: 220, series: 2 },
    48: { unitAh: 220, series: 4 }
  };

  // ==========================================
  // MARKET ASSUMPTIONS
  // ==========================================
  const PANEL_500W = {
    watts: 500,
    vmp: 41.0,
    voc: 49.5,
    imp: 12.2,
    isc: 13.1
  };

  // ==========================================
  // BREAKER DATABASES
  // ==========================================
  const AC_BREAKERS = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160];
  const PV_BREAKERS = [16, 20, 25, 32, 40, 50, 63];
  const BATTERY_BREAKERS = [63, 80, 100, 125, 160, 200, 250];

  function egU_pickBreaker(requiredAmps, breakerList, minAmps) {
    const req = Math.max(requiredAmps, minAmps);
    for (const size of breakerList) {
      if (size >= req) return size;
    }
    return breakerList[breakerList.length - 1];
  }

  function egU_pickCableSize(designCurrent, table) {
    for (const entry of table) {
      if (designCurrent <= entry.maxAmps) return entry.size;
    }
    return table[table.length - 1].size;
  }

  function egU_estimatePvStrings(numPanels) {
    // Conservative market assumption: 2 modules in series per string for sizing.
    // This keeps PV current estimates from being unrealistically low.
    const panelsPerString = Math.min(2, Math.max(1, numPanels));
    const parallelStrings = Math.ceil(numPanels / panelsPerString);
    return { panelsPerString, parallelStrings };
  }

  function egU_getFridgeDutyFactor(item) {
    const egU_n = (item.name || '').toLowerCase();
    const isFridgeLike = ['fridge', 'refrigerator', 'freezer'].some(k => egU_n.includes(k));
    if (!isFridgeLike) return 1;
    const egU_mode = (item.fridgeMode || 'none').toLowerCase();
    if (egU_mode === 'inverter_fridge') return 0.35;
    if (egU_mode === 'chest_freezer') return 0.60;
    return 0.50;
  }

  function egU_addItem(item) {
    item.id = Date.now() + Math.random();
    egU_appliances.push(item);
    egU_renderList();
  }

  function egU_quickAdd(name, watts, qty, hours) {
    const egU_mode = /freezer/i.test(name) ? 'chest_freezer' : (/fridge|refrigerator/i.test(name) ? 'normal_fridge' : 'none');
    egU_addItem({name, watts, qty, hours, fridgeMode: egU_mode});
    document.getElementById('inp-name').value = '';
    document.getElementById('inp-watts').value = '';
    document.getElementById('inp-qty').value = '1';
    document.getElementById('inp-hours').value = '';
    document.getElementById('inp-fridge-egU_mode').value = 'none';
  }

  function egU_addAppliance() {
    const name = document.getElementById('inp-name').value.trim();
    const watts = parseFloat(document.getElementById('inp-watts').value);
    const qty = parseInt(document.getElementById('inp-qty').value);
    const hours = parseFloat(document.getElementById('inp-hours').value);
    const fridgeMode = document.getElementById('inp-fridge-egU_mode').value;

    if (!name) { alert('Please enter an appliance name.'); return; }
    if (isNaN(watts) || watts <= 0) { alert('Please enter valid watts.'); return; }
    if (isNaN(qty) || qty <= 0) { alert('Please enter a valid quantity.'); return; }
    if (isNaN(hours) || hours <= 0) { alert('Please enter valid hours per day.'); return; }

    egU_addItem({name, watts, qty, hours, fridgeMode});
    document.getElementById('inp-name').value = '';
    document.getElementById('inp-watts').value = '';
    document.getElementById('inp-qty').value = '1';
    document.getElementById('inp-hours').value = '';
    document.getElementById('inp-fridge-egU_mode').value = 'none';
    document.getElementById('inp-name').focus();
  }

  function egU_removeAppliance(id) {
    egU_appliances = egU_appliances.filter(a => a.id !== id);
    egU_renderList();
    if (egU_appliances.length === 0) {
      document.getElementById('results').classList.remove('visible');
      document.getElementById('placeholder').style.display = 'flex';
    }
  }

  function egU_renderList() {
    const list = document.getElementById('appliance-list');
    document.getElementById('count').textContent = egU_appliances.length;
    document.getElementById('calc-btn').disabled = egU_appliances.length === 0;

    if (egU_appliances.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="icon">🏠</div><p>No egU_appliances added yet.<br/>Use the form or quick-add chips above.</p></div>`;
      return;
    }

    list.innerHTML = egU_appliances.map(a => {
      const duty = egU_getFridgeDutyFactor(a);
      const egU_daily = (a.watts * a.qty * a.hours * duty / 1000).toFixed(2);
      const dutyText = duty !== 1 ? ` · <span>${Math.round(duty*100)}% duty</span>` : '';
      return `
        <div class="appliance-item">
          <div class="app-info">
            <div class="app-name">${a.name}</div>
            <div class="app-details">
              <span>${a.watts}W</span> × <span>${a.qty}</span> unit${a.qty > 1 ? 's' : ''} · <span>${a.hours}h/day</span>${dutyText}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="app-egU_daily">
              <strong>${egU_daily}</strong>
              kWh/day
            </div>
            <button class="btn-remove" onclick="egU_removeAppliance(${a.id})">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // VOLTAGE SELECTION LOGIC
  // ==========================================
  function egU_selectSystemVoltage(requiredKva) {
    if (requiredKva <= 2) return 12;
    if (requiredKva <= 6) return 24;
    return 48;
  }

  // ==========================================
  // INVERTER SELECTION
  // ==========================================
  function egU_selectInverter(requiredKva, voltage) {
    const models = INVERTER_DATABASE[voltage];
    if (!models) {
      throw new Error(`No egU_inverter models available for ${voltage}V systems`);
    }
    const suitable = models.filter(m => m.kva >= requiredKva);
    if (suitable.length === 0) {
      throw new Error(`No ${voltage}V egU_inverter available for ${requiredKva.toFixed(1)} kVA. Max available: ${models[models.length - 1].kva} kVA`);
    }
    return suitable[0];
  }

  // ==========================================
  // BATTERY SIZING
  // ==========================================
  function egU_sizeBattery(dailyEnergyWh, voltage) {
    const dailyLoadKwh = dailyEnergyWh / 1000;
    const batteryEnergyKwh = dailyLoadKwh / 0.85;
    const lithiumRequiredKwh = batteryEnergyKwh / 0.8;

    const lithiumProducts = LITHIUM_PRODUCTS[voltage] || [];
    let egU_lithiumRecommended = null;
    let egU_lithiumAltOptions = [];

    if (lithiumProducts.length > 0) {
      const lithiumOptions = lithiumProducts.map(product => {
        const quantity = Math.ceil(lithiumRequiredKwh / product.kwh);
        return {
          ...product,
          quantity,
          totalKwh: quantity * product.kwh,
          oversizeKwh: (quantity * product.kwh) - lithiumRequiredKwh
        };
      }).sort((a, b) => {
        if (a.totalKwh !== b.totalKwh) return a.totalKwh - b.totalKwh;
        return a.quantity - b.quantity;
      });

      egU_lithiumRecommended = lithiumOptions[0];
      egU_lithiumAltOptions = lithiumOptions.slice(1, 4);
    }

    return {
      voltage: voltage,
      lithium: egU_lithiumRecommended ? {
        available: true,
        requiredKwh: lithiumRequiredKwh,
        kwhNominal: egU_lithiumRecommended.totalKwh,
        quantity: egU_lithiumRecommended.quantity,
        unitKwh: egU_lithiumRecommended.kwh,
        unitLabel: egU_lithiumRecommended.label,
        nominalVoltage: egU_lithiumRecommended.nominalVoltage,
        systemVoltage: egU_lithiumRecommended.systemVoltage,
        altOptions: egU_lithiumAltOptions,
        configText: `${egU_lithiumRecommended.quantity} × ${egU_lithiumRecommended.label} (${egU_lithiumRecommended.systemVoltage}V class, ${egU_lithiumRecommended.nominalVoltage}V nominal)`
      } : {
        available: false,
        requiredKwh: lithiumRequiredKwh,
        kwhNominal: 0,
        quantity: 0,
        unitKwh: 0,
        unitLabel: '',
        nominalVoltage: 0,
        systemVoltage: voltage,
        altOptions: [],
        configText: `No standard lithium pack configured for ${voltage}V systems`
      }
    };
  }

  // ==========================================
  // SOLAR PANEL SIZING (CORRECTED v3.0)
  // ==========================================
  function egU_calculateSolarPanels(dailyWh, battery, rechargeStrategy = 'daily_full') {
    let egU_totalEnergyNeeded = dailyWh;
    let egU_rechargeEnergyWh = 0;
    const lithiumUsableWh = battery.lithium.available ? (battery.lithium.kwhNominal * 1000 * 0.8) : 0;

    // Use the same storage basis as the displayed premium recommendation when available.
    const storageBasis = battery.lithium.available ? 'lithium' : 'lead-acid';
    const usableCapacityWh = storageBasis === 'lithium' ? lithiumUsableWh : leadUsableWh;

    if (rechargeStrategy === 'daily_full') {
      egU_rechargeEnergyWh = usableCapacityWh;
      egU_totalEnergyNeeded += egU_rechargeEnergyWh;
    }
    else if (rechargeStrategy === 'partial_recharge') {
      egU_rechargeEnergyWh = usableCapacityWh * 0.5;
      egU_totalEnergyNeeded += egU_rechargeEnergyWh;
    }

    const systemEff = 0.75;
    const psh = 5.0;
    const pvMargin = 1.1;

    const egU_pvWatts = (egU_totalEnergyNeeded / (psh * systemEff)) * pvMargin;
    const numPanels = Math.ceil(egU_pvWatts / PANEL_500W.watts);

    const egU_dailyGenKwh = (numPanels * PANEL_500W.watts * psh * systemEff) / 1000;
    const egU_coverage = (egU_dailyGenKwh * 1000) / egU_totalEnergyNeeded * 100;

    return {
      egU_totalEnergyNeeded,
      egU_rechargeEnergyWh,
      usableCapacityWh,
      leadUsableWh,
      lithiumUsableWh,
      storageBasis,
      egU_pvWatts,
      numPanels,
      egU_dailyGenKwh,
      egU_coverage,
      rechargeStrategy
    };
  }

  // ==========================================
  // VOLTAGE COMPATIBILITY VALIDATION
  // ==========================================
  function egU_validateVoltageCompatibility(inverterVoltage, batteryVoltage) {
    if (inverterVoltage !== batteryVoltage) {
      throw new Error(
        `VOLTAGE MISMATCH: Inverter is ${inverterVoltage}V but battery is ${batteryVoltage}V. ` +
        `They MUST match for the system to work!`
      );
    }
    return true;
  }

  // ==========================================
  // MAIN CALCULATION ENGINE
  // ==========================================
  function egU_calculateEngine(apps, rechargeStrategy = 'daily_full') {
    let egU_totalWatts = 0, dailyWh = 0, maxExtraSurge = 0;
    const inductiveKeys = ['fridge', 'refrigerator', 'ac', 'air conditioner', 'pump', 'motor', 'compressor', 'freezer', 'washing machine'];

    for (const app of apps) {
      const watts = Math.max(0, app.watts);
      const qty = Math.max(0, app.qty);
      const hours = Math.max(0, app.hours);
      const duty = egU_getFridgeDutyFactor(app);
      const load = watts * qty;
      egU_totalWatts += load;
      dailyWh += load * hours * duty;
      
      const nameLower = app.name.toLowerCase();
      const isInductive = inductiveKeys.some(k => nameLower.includes(k));
      if (isInductive) {
        const surgeMult = 3.0;
        const extra = load * (surgeMult - 1.0);
        if (extra > maxExtraSurge) maxExtraSurge = extra;
      }
    }

    const peakWatts = egU_totalWatts + maxExtraSurge;

    // Inverter Selection
    const minInvWatts = egU_totalWatts * 1.25;
    const invRequiredW = Math.max(minInvWatts, peakWatts);
    const requiredKva = invRequiredW / 800.0;
    
    let egU_sysV = egU_selectSystemVoltage(requiredKva);
    let egU_inverter = egU_selectInverter(requiredKva, egU_sysV);

    // Canonical voltage mapping for Energy Guide v1:
    // 12V handles up to 2kVA, 24V handles 3kVA-6kVA, and 48V handles 8kVA+.
    // This keeps each egU_inverter size in one voltage class only.
    if (egU_sysV === 12 && egU_inverter.kva > 2) {
      egU_sysV = 24;
      egU_inverter = egU_selectInverter(requiredKva, egU_sysV);
    }

    const invKva = egU_inverter.kva;
    const invModel = egU_inverter.model;

    // Battery Sizing
    const battery = egU_sizeBattery(dailyWh, egU_sysV);
    egU_validateVoltageCompatibility(egU_sysV, battery.voltage);

    // Solar Sizing (CORRECTED)
    const solar = egU_calculateSolarPanels(dailyWh, battery, rechargeStrategy);

    // Cables & Breakers
    const pvStrings = egU_estimatePvStrings(solar.numPanels);
    const pvCurrent = pvStrings.parallelStrings * PANEL_500W.isc;
    const pvDesignCurrent = pvCurrent * 1.25;
    const pvCable = egU_pickCableSize(pvDesignCurrent, [
      { size: 4, maxAmps: 30 },
      { size: 6, maxAmps: 40 },
      { size: 10, maxAmps: 55 },
      { size: 16, maxAmps: 75 }
    ]);
    const pvBreaker = egU_pickBreaker(pvDesignCurrent, PV_BREAKERS, 16);

    const egU_maxBatt = (invKva * 1000) / egU_sysV;
    const battDesignCurrent = egU_maxBatt * 1.25;
    const battCable = egU_pickCableSize(battDesignCurrent, [
      { size: 16, maxAmps: 70 },
      { size: 25, maxAmps: 100 },
      { size: 35, maxAmps: 125 },
      { size: 50, maxAmps: 150 },
      { size: 70, maxAmps: 200 },
      { size: 95, maxAmps: 260 }
    ]);
    const battBreaker = egU_pickBreaker(battDesignCurrent, BATTERY_BREAKERS, 63);

    const egU_acCurrent = (invKva * 1000) / 230;
    const acDesignCurrent = egU_acCurrent * 1.25;
    const acCable = egU_pickCableSize(acDesignCurrent, [
      { size: 2.5, maxAmps: 20 },
      { size: 4, maxAmps: 28 },
      { size: 6, maxAmps: 36 },
      { size: 10, maxAmps: 50 },
      { size: 16, maxAmps: 68 }
    ]);
    const acBreaker = egU_pickBreaker(acDesignCurrent, AC_BREAKERS, 16);

    return {
      egU_totalWatts, dailyKwh: dailyWh / 1000, maxSurge: peakWatts,
      invKva, invModel, egU_sysV, egU_acCurrent,
      battery: battery,
      solar: solar,
      pvCable, pvBreaker, pvCurrent, pvStrings,
      battCable, battBreaker, battCurrent: egU_maxBatt,
      acCable, acBreaker
    };
  }

  function egU_calculate() {
    if (egU_appliances.length === 0) return;
    
    const rechargeStrategy = document.querySelector('input[name="recharge-strategy"]:checked').value;
    
    try {
      const r = egU_calculateEngine(egU_appliances, rechargeStrategy);
      
      document.getElementById('error-alert').style.display = 'none';

      // Load
      document.getElementById('r-watts').textContent = r.egU_totalWatts.toLocaleString();
      document.getElementById('r-kwh').textContent = r.dailyKwh.toFixed(2);
      document.getElementById('r-surge').textContent = r.maxSurge.toLocaleString();

      // Inverter & Voltage
      document.getElementById('r-voltage').textContent = r.egU_sysV;
      document.getElementById('r-kva').textContent = r.invKva;
      document.getElementById('r-inv-model').textContent = r.invModel;
      document.getElementById('r-ac-amps').textContent = r.egU_acCurrent.toFixed(1);

      // Battery
      const lithAlt = r.battery.lithium.altOptions.length > 0
        ? `Alt: ${r.battery.lithium.altOptions.map(opt => `${opt.quantity} × ${opt.label} = ${opt.totalKwh.toFixed(1).replace(/\.0$/, '')}kWh`).join(' • ')}`
        : '';

      if (r.battery.lithium.available) {
        document.getElementById('r-lithium').textContent = `${r.battery.lithium.kwhNominal.toFixed(1).replace(/\.0$/, '')}`;
        document.getElementById('r-lithium-alt').textContent = lithAlt;
        document.getElementById('r-lithium-config').textContent = `${r.battery.lithium.configText} · 80% DoD`;
      } else {
        document.getElementById('r-lithium').textContent = 'N/A';
        document.getElementById('r-lithium-alt').textContent = '';
        document.getElementById('r-lithium-config').textContent = r.battery.lithium.configText;
      }

      document.getElementById('r-batt-config').textContent =
        `${r.battery.lithium.available ? `✅ Lithium: ${r.battery.lithium.quantity} × ${r.battery.lithium.unitLabel} = ${r.battery.lithium.kwhNominal.toFixed(1).replace(/\.0$/, '')}kWh (${r.battery.lithium.systemVoltage}V class)` : `⚠️ Lithium: ${r.battery.lithium.configText}`}
` +;

      // Solar (CORRECTED)
      document.getElementById('r-pv-watts').textContent = Math.ceil(r.solar.egU_pvWatts).toLocaleString();
      document.getElementById('r-panels').textContent = r.solar.numPanels;
      document.getElementById('r-gen').textContent = r.solar.egU_dailyGenKwh.toFixed(2);
      document.getElementById('r-egU_coverage').textContent = r.solar.egU_coverage.toFixed(0);

      // Solar Breakdown (NEW)
      const strategyName = {
        'daily_full': 'Daily Full Recharge',
        'partial_recharge': 'Partial Recharge',
        'load_only': 'Load Only'
      }[r.solar.rechargeStrategy];

      const storageLabel = 'Lithium';
      const breakdownText = `
        <strong>Strategy:</strong> ${strategyName}<br/>
        <strong>Daily Load:</strong> ${r.dailyKwh.toFixed(2)} kWh<br/>
        <strong>Recharge Basis:</strong> ${storageLabel}<br/>
        <strong>Battery Recharge:</strong> ${(r.solar.egU_rechargeEnergyWh / 1000).toFixed(2)} kWh (${r.solar.usableCapacityWh / 1000 > 0 ? Math.round((r.solar.egU_rechargeEnergyWh / r.solar.usableCapacityWh) * 100) : 0}% of usable ${storageLabel.toLowerCase()} storage)<br/>
        <strong>Total Energy Needed:</strong> ${(r.solar.egU_totalEnergyNeeded / 1000).toFixed(2)} kWh<br/>
        <strong>System Efficiency:</strong> 75% (MPPT + Battery + Wiring)<br/>
        <strong>Peak Sun Hours:</strong> 5 hours<br/>
      `;
      document.getElementById('r-solar-breakdown').innerHTML = breakdownText;


      // Simplified summary
      document.getElementById('s-egU_inverter-kva').textContent = `${r.invKva}kVA`;
      document.getElementById('s-egU_inverter-model').textContent = r.invModel;
      document.getElementById('s-egU_inverter-voltage').textContent = `${r.egU_sysV}V system`;

      document.getElementById('s-panels-count').textContent = `${r.solar.numPanels} × 500W`;
      document.getElementById('s-panels-size').textContent = 'Solar Panels';
      document.getElementById('s-panels-total').textContent = `Total PV: ${(r.solar.numPanels * 500 / 1000).toFixed(1).replace(/\.0$/, '')}kW`;

      if (r.battery.lithium.available) {
        document.getElementById('s-battery-main').textContent = `${r.battery.lithium.quantity} × ${r.battery.lithium.unitLabel}`;
        document.getElementById('s-battery-config').textContent = `${r.battery.lithium.systemVoltage}V lithium option`;
        // tubular alt removed
      } else {
        // tubular alt removed
      }

      // Cables
      const cables = [
        ['PV Panels → Inverter (DC)', `${r.pvCable} mm²`, `${r.pvBreaker}A DC`],
        ['Inverter → Battery (DC)', `${r.battCable} mm²`, `${r.battBreaker}A DC`],
        ['Inverter → AC Load', `${r.acCable} mm²`, `${r.acBreaker}A AC`],
        ['Inverter → Grid Input', `${r.acCable} mm²`, `${r.acBreaker}A AC`],
      ];
      document.getElementById('r-cables').innerHTML = cables.map(([conn, cable, breaker]) => `
        <tr>
          <td class="conn-name">${conn}</td>
          <td><span class="badge">${cable}</span></td>
          <td><span class="badge green">${breaker}</span></td>
        </tr>
      `).join('');

      // Show results
      document.getElementById('placeholder').style.display = 'none';
      document.getElementById('results').classList.add('visible');
      document.querySelector('.right-panel').scrollTop = 0;

      // ── EnergyGuide parent bridge ──────────────────────────────────────────
      try {
          // Flatten new result shape → legacy flat shape the parent expects
          const flat = {
            egU_totalWatts:       r.egU_totalWatts,
            dailyKwh:         r.dailyKwh,
            maxSurge:         r.maxSurge,
            invKva:           r.invKva,
            invModel:         r.invModel,
            egU_sysV:             r.egU_sysV,
            systemVoltage:    r.egU_sysV,
            egU_acCurrent:        r.egU_acCurrent,
            // batteries – flat fields
            numPanels:        r.solar.numPanels,
            egU_pvWatts:          r.solar.egU_pvWatts,
            dailyGen:         r.solar.egU_dailyGenKwh,
            lithiumPackKwh:   r.battery.lithium.available ? r.battery.lithium.kwhNominal : 0
            // cables & breakers
            pvCable:          r.pvCable,
            pvBreaker:        r.pvBreaker,
            battCable:        r.battCable,
            battBreaker:      r.battBreaker,
            acCable:          r.acCable,
            acBreaker:        r.acBreaker,
          };
          if (receiveEmbeddedCalculation) {
            // Enrich flat with cost data from parent
            if (typeof egBuildCostBreakdown === 'function') {
              const cost = egBuildCostBreakdown(flat);
              Object.assign(flat, cost);
            }
            receiveEmbeddedCalculation('user', flat, egU_appliances);
          }
        } catch(e) { console.warn('EG calc error:', e); }
      
    } catch (error) {
      const errorAlert = document.getElementById('error-alert');
      errorAlert.innerHTML = `
        <strong>⚠️ ${error.message}</strong>
        <p style="margin-top:8px;">Please adjust your egU_appliances or contact a solar installer for custom sizing.</p>
      `;
      errorAlert.style.display = 'block';
      document.getElementById('placeholder').style.display = 'none';
      document.getElementById('results').classList.add('visible');
      document.querySelector('.right-panel').scrollTop = 0;
    }
  }

  // Enter key support
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement.closest('.add-form')) {
      egU_addAppliance();
    }
  });

// ── eg-vend-calc inlined (egV) ──
let egV_appliances = [];

  // ==========================================
  // DATABASE: INVERTERS BY VOLTAGE
  // ==========================================
  const egV_INVERTER_DATABASE = {
    12: [
      { model: '1kVA Hybrid Inverter (12V)', kva: 1, voltage: 12 },
      { model: '1.5kVA Hybrid Inverter (12V)', kva: 1.5, voltage: 12 },
      { model: '2kVA Hybrid Inverter (12V)', kva: 2, voltage: 12 }
    ],
    24: [
      { model: '3kVA Hybrid Inverter (24V)', kva: 3, voltage: 24 },
      { model: '3.5kVA Hybrid Inverter (24V)', kva: 3.5, voltage: 24 },
      { model: '4kVA Hybrid Inverter (24V)', kva: 4, voltage: 24 },
      { model: '5kVA Hybrid Inverter (24V)', kva: 5, voltage: 24 },
      { model: '6kVA Hybrid Inverter (24V)', kva: 6, voltage: 24 }
    ],
    48: [
      { model: '8kVA Hybrid Inverter (48V)', kva: 8, voltage: 48 },
      { model: '10kVA Hybrid Inverter (48V)', kva: 10, voltage: 48 },
      { model: '12kVA Hybrid Inverter (48V)', kva: 12, voltage: 48 },
      { model: '15kVA Hybrid Inverter (48V)', kva: 15, voltage: 48 },
      { model: '20kVA Hybrid Inverter (48V)', kva: 20, voltage: 48 }
    ]
  };

  // ==========================================
  // DATABASE: LITHIUM BATTERIES BY VOLTAGE
  // ==========================================
  const egV_LITHIUM_PRODUCTS = {
    12: [],
    24: [
      { label: '2.5kWh Lithium', kwh: 2.5, nominalVoltage: 25.6, systemVoltage: 24 },
      { label: '3kWh Lithium', kwh: 3.0, nominalVoltage: 25.6, systemVoltage: 24 }
    ],
    48: [
      { label: '5kWh Lithium', kwh: 5.0, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '7.5kWh Lithium', kwh: 7.5, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '10kWh Lithium', kwh: 10.0, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '15kWh Lithium', kwh: 15.0, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '20kWh Lithium', kwh: 20.0, nominalVoltage: 51.2, systemVoltage: 48 }
    ]
  };

  // ==========================================
  // DATABASE: LEAD-ACID CONFIGURATION
  // ==========================================
  const egV_LEAD_ACID_CONFIG = {
    12: { unitAh: 220, series: 1 },
    24: { unitAh: 220, series: 2 },
    48: { unitAh: 220, series: 4 }
  };

  // ==========================================
  // MARKET ASSUMPTIONS
  // ==========================================
  const egV_PANEL_500W = {
    watts: 500,
    vmp: 41.0,
    voc: 49.5,
    imp: 12.2,
    isc: 13.1
  };

  // ==========================================
  // BREAKER DATABASES
  // ==========================================
  const egV_AC_BREAKERS = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160];
  const egV_PV_BREAKERS = [16, 20, 25, 32, 40, 50, 63];
  const egV_BATTERY_BREAKERS = [63, 80, 100, 125, 160, 200, 250];

  function egV_pickBreaker(requiredAmps, breakerList, minAmps) {
    const req = Math.max(requiredAmps, minAmps);
    for (const size of breakerList) {
      if (size >= req) return size;
    }
    return breakerList[breakerList.length - 1];
  }

  function egV_pickCableSize(designCurrent, table) {
    for (const entry of table) {
      if (designCurrent <= entry.maxAmps) return entry.size;
    }
    return table[table.length - 1].size;
  }

  function egV_estimatePvStrings(numPanels) {
    // Conservative market assumption: 2 modules in series per string for sizing.
    // This keeps PV current estimates from being unrealistically low.
    const panelsPerString = Math.min(2, Math.max(1, numPanels));
    const parallelStrings = Math.ceil(numPanels / panelsPerString);
    return { panelsPerString, parallelStrings };
  }

  function egV_getFridgeDutyFactor(item) {
    const egV_n = (item.name || '').toLowerCase();
    const isFridgeLike = ['fridge', 'refrigerator', 'freezer'].some(k => egV_n.includes(k));
    if (!isFridgeLike) return 1;
    const egV_mode = (item.fridgeMode || 'none').toLowerCase();
    if (egV_mode === 'inverter_fridge') return 0.35;
    if (egV_mode === 'chest_freezer') return 0.60;
    return 0.50;
  }

  function egV_addItem(item) {
    item.id = Date.now() + Math.random();
    egV_appliances.push(item);
    egV_renderList();
  }

  function egV_quickAdd(name, watts, qty, hours) {
    const egV_mode = /freezer/i.test(name) ? 'chest_freezer' : (/fridge|refrigerator/i.test(name) ? 'normal_fridge' : 'none');
    egV_addItem({name, watts, qty, hours, fridgeMode: egV_mode});
    document.getElementById('inp-name').value = '';
    document.getElementById('inp-watts').value = '';
    document.getElementById('inp-qty').value = '1';
    document.getElementById('inp-hours').value = '';
    document.getElementById('inp-fridge-egV_mode').value = 'none';
  }

  function egV_addAppliance() {
    const name = document.getElementById('inp-name').value.trim();
    const watts = parseFloat(document.getElementById('inp-watts').value);
    const qty = parseInt(document.getElementById('inp-qty').value);
    const hours = parseFloat(document.getElementById('inp-hours').value);
    const fridgeMode = document.getElementById('inp-fridge-egV_mode').value;

    if (!name) { alert('Please enter an appliance name.'); return; }
    if (isNaN(watts) || watts <= 0) { alert('Please enter valid watts.'); return; }
    if (isNaN(qty) || qty <= 0) { alert('Please enter a valid quantity.'); return; }
    if (isNaN(hours) || hours <= 0) { alert('Please enter valid hours per day.'); return; }

    egV_addItem({name, watts, qty, hours, fridgeMode});
    document.getElementById('inp-name').value = '';
    document.getElementById('inp-watts').value = '';
    document.getElementById('inp-qty').value = '1';
    document.getElementById('inp-hours').value = '';
    document.getElementById('inp-fridge-egV_mode').value = 'none';
    document.getElementById('inp-name').focus();
  }

  function egV_removeAppliance(id) {
    egV_appliances = egV_appliances.filter(a => a.id !== id);
    egV_renderList();
    if (egV_appliances.length === 0) {
      document.getElementById('results').classList.remove('visible');
      document.getElementById('placeholder').style.display = 'flex';
    }
  }

  function egV_renderList() {
    const list = document.getElementById('appliance-list');
    document.getElementById('count').textContent = egV_appliances.length;
    document.getElementById('calc-btn').disabled = egV_appliances.length === 0;

    if (egV_appliances.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="icon">🏠</div><p>No egV_appliances added yet.<br/>Use the form or quick-add chips above.</p></div>`;
      return;
    }

    list.innerHTML = egV_appliances.map(a => {
      const duty = egV_getFridgeDutyFactor(a);
      const egV_daily = (a.watts * a.qty * a.hours * duty / 1000).toFixed(2);
      const dutyText = duty !== 1 ? ` · <span>${Math.round(duty*100)}% duty</span>` : '';
      return `
        <div class="appliance-item">
          <div class="app-info">
            <div class="app-name">${a.name}</div>
            <div class="app-details">
              <span>${a.watts}W</span> × <span>${a.qty}</span> unit${a.qty > 1 ? 's' : ''} · <span>${a.hours}h/day</span>${dutyText}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="app-egV_daily">
              <strong>${egV_daily}</strong>
              kWh/day
            </div>
            <button class="btn-remove" onclick="egV_removeAppliance(${a.id})">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // VOLTAGE SELECTION LOGIC
  // ==========================================
  function egV_selectSystemVoltage(requiredKva) {
    if (requiredKva <= 2) return 12;
    if (requiredKva <= 6) return 24;
    return 48;
  }

  // ==========================================
  // INVERTER SELECTION
  // ==========================================
  function egV_selectInverter(requiredKva, voltage) {
    const models = egV_INVERTER_DATABASE[voltage];
    if (!models) {
      throw new Error(`No egV_inverter models available for ${voltage}V systems`);
    }
    const suitable = models.filter(m => m.kva >= requiredKva);
    if (suitable.length === 0) {
      throw new Error(`No ${voltage}V egV_inverter available for ${requiredKva.toFixed(1)} kVA. Max available: ${models[models.length - 1].kva} kVA`);
    }
    return suitable[0];
  }

  // ==========================================
  // BATTERY SIZING
  // ==========================================
  function egV_sizeBattery(dailyEnergyWh, voltage) {
    const dailyLoadKwh = dailyEnergyWh / 1000;
    const batteryEnergyKwh = dailyLoadKwh / 0.85;
    const lithiumRequiredKwh = batteryEnergyKwh / 0.8;

    const lithiumProducts = egV_LITHIUM_PRODUCTS[voltage] || [];
    let egV_lithiumRecommended = null;
    let egV_lithiumAltOptions = [];

    if (lithiumProducts.length > 0) {
      const lithiumOptions = lithiumProducts.map(product => {
        const quantity = Math.ceil(lithiumRequiredKwh / product.kwh);
        return {
          ...product,
          quantity,
          totalKwh: quantity * product.kwh,
          oversizeKwh: (quantity * product.kwh) - lithiumRequiredKwh
        };
      }).sort((a, b) => {
        if (a.totalKwh !== b.totalKwh) return a.totalKwh - b.totalKwh;
        return a.quantity - b.quantity;
      });

      egV_lithiumRecommended = lithiumOptions[0];
      egV_lithiumAltOptions = lithiumOptions.slice(1, 4);
    }

    return {
      voltage: voltage,
      lithium: egV_lithiumRecommended ? {
        available: true,
        requiredKwh: lithiumRequiredKwh,
        kwhNominal: egV_lithiumRecommended.totalKwh,
        quantity: egV_lithiumRecommended.quantity,
        unitKwh: egV_lithiumRecommended.kwh,
        unitLabel: egV_lithiumRecommended.label,
        nominalVoltage: egV_lithiumRecommended.nominalVoltage,
        systemVoltage: egV_lithiumRecommended.systemVoltage,
        altOptions: egV_lithiumAltOptions,
        configText: `${egV_lithiumRecommended.quantity} × ${egV_lithiumRecommended.label} (${egV_lithiumRecommended.systemVoltage}V class, ${egV_lithiumRecommended.nominalVoltage}V nominal)`
      } : {
        available: false,
        requiredKwh: lithiumRequiredKwh,
        kwhNominal: 0,
        quantity: 0,
        unitKwh: 0,
        unitLabel: '',
        nominalVoltage: 0,
        systemVoltage: voltage,
        altOptions: [],
        configText: `No standard lithium pack configured for ${voltage}V systems`
      }
    };
  }

  // ==========================================
  // SOLAR PANEL SIZING (CORRECTED v3.0)
  // ==========================================
  function egV_calculateSolarPanels(dailyWh, battery, rechargeStrategy = 'daily_full') {
    let egV_totalEnergyNeeded = dailyWh;
    let egV_rechargeEnergyWh = 0;
    const lithiumUsableWh = battery.lithium.available ? (battery.lithium.kwhNominal * 1000 * 0.8) : 0;

    // Use the same storage basis as the displayed premium recommendation when available.
    const storageBasis = battery.lithium.available ? 'lithium' : 'lead-acid';
    const usableCapacityWh = storageBasis === 'lithium' ? lithiumUsableWh : leadUsableWh;

    if (rechargeStrategy === 'daily_full') {
      egV_rechargeEnergyWh = usableCapacityWh;
      egV_totalEnergyNeeded += egV_rechargeEnergyWh;
    }
    else if (rechargeStrategy === 'partial_recharge') {
      egV_rechargeEnergyWh = usableCapacityWh * 0.5;
      egV_totalEnergyNeeded += egV_rechargeEnergyWh;
    }

    const systemEff = 0.75;
    const psh = 5.0;
    const pvMargin = 1.1;

    const egV_pvWatts = (egV_totalEnergyNeeded / (psh * systemEff)) * pvMargin;
    const numPanels = Math.ceil(egV_pvWatts / egV_PANEL_500W.watts);

    const egV_dailyGenKwh = (numPanels * egV_PANEL_500W.watts * psh * systemEff) / 1000;
    const egV_coverage = (egV_dailyGenKwh * 1000) / egV_totalEnergyNeeded * 100;

    return {
      egV_totalEnergyNeeded,
      egV_rechargeEnergyWh,
      usableCapacityWh,
      leadUsableWh,
      lithiumUsableWh,
      storageBasis,
      egV_pvWatts,
      numPanels,
      egV_dailyGenKwh,
      egV_coverage,
      rechargeStrategy
    };
  }

  // ==========================================
  // VOLTAGE COMPATIBILITY VALIDATION
  // ==========================================
  function egV_validateVoltageCompatibility(inverterVoltage, batteryVoltage) {
    if (inverterVoltage !== batteryVoltage) {
      throw new Error(
        `VOLTAGE MISMATCH: Inverter is ${inverterVoltage}V but battery is ${batteryVoltage}V. ` +
        `They MUST match for the system to work!`
      );
    }
    return true;
  }

  // ==========================================
  // MAIN CALCULATION ENGINE
  // ==========================================
  function egV_calculateEngine(apps, rechargeStrategy = 'daily_full') {
    let egV_totalWatts = 0, dailyWh = 0, maxExtraSurge = 0;
    const inductiveKeys = ['fridge', 'refrigerator', 'ac', 'air conditioner', 'pump', 'motor', 'compressor', 'freezer', 'washing machine'];

    for (const app of apps) {
      const watts = Math.max(0, app.watts);
      const qty = Math.max(0, app.qty);
      const hours = Math.max(0, app.hours);
      const duty = egV_getFridgeDutyFactor(app);
      const load = watts * qty;
      egV_totalWatts += load;
      dailyWh += load * hours * duty;
      
      const nameLower = app.name.toLowerCase();
      const isInductive = inductiveKeys.some(k => nameLower.includes(k));
      if (isInductive) {
        const surgeMult = 3.0;
        const extra = load * (surgeMult - 1.0);
        if (extra > maxExtraSurge) maxExtraSurge = extra;
      }
    }

    const peakWatts = egV_totalWatts + maxExtraSurge;

    // Inverter Selection
    const minInvWatts = egV_totalWatts * 1.25;
    const invRequiredW = Math.max(minInvWatts, peakWatts);
    const requiredKva = invRequiredW / 800.0;
    
    let egV_sysV = egV_selectSystemVoltage(requiredKva);
    let egV_inverter = egV_selectInverter(requiredKva, egV_sysV);

    // Canonical voltage mapping for Energy Guide v1:
    // 12V handles up to 2kVA, 24V handles 3kVA-6kVA, and 48V handles 8kVA+.
    // This keeps each egV_inverter size in one voltage class only.
    if (egV_sysV === 12 && egV_inverter.kva > 2) {
      egV_sysV = 24;
      egV_inverter = egV_selectInverter(requiredKva, egV_sysV);
    }

    const invKva = egV_inverter.kva;
    const invModel = egV_inverter.model;

    // Battery Sizing
    const battery = egV_sizeBattery(dailyWh, egV_sysV);
    egV_validateVoltageCompatibility(egV_sysV, battery.voltage);

    // Solar Sizing (CORRECTED)
    const solar = egV_calculateSolarPanels(dailyWh, battery, rechargeStrategy);

    // Cables & Breakers
    const pvStrings = egV_estimatePvStrings(solar.numPanels);
    const pvCurrent = pvStrings.parallelStrings * egV_PANEL_500W.isc;
    const pvDesignCurrent = pvCurrent * 1.25;
    const pvCable = egV_pickCableSize(pvDesignCurrent, [
      { size: 4, maxAmps: 30 },
      { size: 6, maxAmps: 40 },
      { size: 10, maxAmps: 55 },
      { size: 16, maxAmps: 75 }
    ]);
    const pvBreaker = egV_pickBreaker(pvDesignCurrent, egV_PV_BREAKERS, 16);

    const egV_maxBatt = (invKva * 1000) / egV_sysV;
    const battDesignCurrent = egV_maxBatt * 1.25;
    const battCable = egV_pickCableSize(battDesignCurrent, [
      { size: 16, maxAmps: 70 },
      { size: 25, maxAmps: 100 },
      { size: 35, maxAmps: 125 },
      { size: 50, maxAmps: 150 },
      { size: 70, maxAmps: 200 },
      { size: 95, maxAmps: 260 }
    ]);
    const battBreaker = egV_pickBreaker(battDesignCurrent, egV_BATTERY_BREAKERS, 63);

    const egV_acCurrent = (invKva * 1000) / 230;
    const acDesignCurrent = egV_acCurrent * 1.25;
    const acCable = egV_pickCableSize(acDesignCurrent, [
      { size: 2.5, maxAmps: 20 },
      { size: 4, maxAmps: 28 },
      { size: 6, maxAmps: 36 },
      { size: 10, maxAmps: 50 },
      { size: 16, maxAmps: 68 }
    ]);
    const acBreaker = egV_pickBreaker(acDesignCurrent, egV_AC_BREAKERS, 16);

    return {
      egV_totalWatts, dailyKwh: dailyWh / 1000, maxSurge: peakWatts,
      invKva, invModel, egV_sysV, egV_acCurrent,
      battery: battery,
      solar: solar,
      pvCable, pvBreaker, pvCurrent, pvStrings,
      battCable, battBreaker, battCurrent: egV_maxBatt,
      acCable, acBreaker
    };
  }

  function egV_calculate() {
    if (egV_appliances.length === 0) return;
    
    const rechargeStrategy = document.querySelector('input[name="recharge-strategy"]:checked').value;
    
    try {
      const r = egV_calculateEngine(egV_appliances, rechargeStrategy);
      
      document.getElementById('error-alert').style.display = 'none';

      // Load
      document.getElementById('r-watts').textContent = r.egV_totalWatts.toLocaleString();
      document.getElementById('r-kwh').textContent = r.dailyKwh.toFixed(2);
      document.getElementById('r-surge').textContent = r.maxSurge.toLocaleString();

      // Inverter & Voltage
      document.getElementById('r-voltage').textContent = r.egV_sysV;
      document.getElementById('r-kva').textContent = r.invKva;
      document.getElementById('r-inv-model').textContent = r.invModel;
      document.getElementById('r-ac-amps').textContent = r.egV_acCurrent.toFixed(1);

      // Battery
      const lithAlt = r.battery.lithium.altOptions.length > 0
        ? `Alt: ${r.battery.lithium.altOptions.map(opt => `${opt.quantity} × ${opt.label} = ${opt.totalKwh.toFixed(1).replace(/\.0$/, '')}kWh`).join(' • ')}`
        : '';

      if (r.battery.lithium.available) {
        document.getElementById('r-lithium').textContent = `${r.battery.lithium.kwhNominal.toFixed(1).replace(/\.0$/, '')}`;
        document.getElementById('r-lithium-alt').textContent = lithAlt;
        document.getElementById('r-lithium-config').textContent = `${r.battery.lithium.configText} · 80% DoD`;
      } else {
        document.getElementById('r-lithium').textContent = 'N/A';
        document.getElementById('r-lithium-alt').textContent = '';
        document.getElementById('r-lithium-config').textContent = r.battery.lithium.configText;
      }

      document.getElementById('r-batt-config').textContent =
        `${r.battery.lithium.available ? `✅ Lithium: ${r.battery.lithium.quantity} × ${r.battery.lithium.unitLabel} = ${r.battery.lithium.kwhNominal.toFixed(1).replace(/\.0$/, '')}kWh (${r.battery.lithium.systemVoltage}V class)` : `⚠️ Lithium: ${r.battery.lithium.configText}`}
` +;

      // Solar (CORRECTED)
      document.getElementById('r-pv-watts').textContent = Math.ceil(r.solar.egV_pvWatts).toLocaleString();
      document.getElementById('r-panels').textContent = r.solar.numPanels;
      document.getElementById('r-gen').textContent = r.solar.egV_dailyGenKwh.toFixed(2);
      document.getElementById('r-egV_coverage').textContent = r.solar.egV_coverage.toFixed(0);

      // Solar Breakdown (NEW)
      const strategyName = {
        'daily_full': 'Daily Full Recharge',
        'partial_recharge': 'Partial Recharge',
        'load_only': 'Load Only'
      }[r.solar.rechargeStrategy];

      const storageLabel = 'Lithium';
      const breakdownText = `
        <strong>Strategy:</strong> ${strategyName}<br/>
        <strong>Daily Load:</strong> ${r.dailyKwh.toFixed(2)} kWh<br/>
        <strong>Recharge Basis:</strong> ${storageLabel}<br/>
        <strong>Battery Recharge:</strong> ${(r.solar.egV_rechargeEnergyWh / 1000).toFixed(2)} kWh (${r.solar.usableCapacityWh / 1000 > 0 ? Math.round((r.solar.egV_rechargeEnergyWh / r.solar.usableCapacityWh) * 100) : 0}% of usable ${storageLabel.toLowerCase()} storage)<br/>
        <strong>Total Energy Needed:</strong> ${(r.solar.egV_totalEnergyNeeded / 1000).toFixed(2)} kWh<br/>
        <strong>System Efficiency:</strong> 75% (MPPT + Battery + Wiring)<br/>
        <strong>Peak Sun Hours:</strong> 5 hours<br/>
      `;
      document.getElementById('r-solar-breakdown').innerHTML = breakdownText;


      // Simplified summary
      document.getElementById('s-egV_inverter-kva').textContent = `${r.invKva}kVA`;
      document.getElementById('s-egV_inverter-model').textContent = r.invModel;
      document.getElementById('s-egV_inverter-voltage').textContent = `${r.egV_sysV}V system`;

      document.getElementById('s-panels-count').textContent = `${r.solar.numPanels} × 500W`;
      document.getElementById('s-panels-size').textContent = 'Solar Panels';
      document.getElementById('s-panels-total').textContent = `Total PV: ${(r.solar.numPanels * 500 / 1000).toFixed(1).replace(/\.0$/, '')}kW`;

      if (r.battery.lithium.available) {
        document.getElementById('s-battery-main').textContent = `${r.battery.lithium.quantity} × ${r.battery.lithium.unitLabel}`;
        document.getElementById('s-battery-config').textContent = `${r.battery.lithium.systemVoltage}V lithium option`;
        // tubular alt removed
      } else {
        // tubular alt removed
      }

      // Cables
      const cables = [
        ['PV Panels → Inverter (DC)', `${r.pvCable} mm²`, `${r.pvBreaker}A DC`],
        ['Inverter → Battery (DC)', `${r.battCable} mm²`, `${r.battBreaker}A DC`],
        ['Inverter → AC Load', `${r.acCable} mm²`, `${r.acBreaker}A AC`],
        ['Inverter → Grid Input', `${r.acCable} mm²`, `${r.acBreaker}A AC`],
      ];
      document.getElementById('r-cables').innerHTML = cables.map(([conn, cable, breaker]) => `
        <tr>
          <td class="conn-name">${conn}</td>
          <td><span class="badge">${cable}</span></td>
          <td><span class="badge green">${breaker}</span></td>
        </tr>
      `).join('');

      // Show results
      document.getElementById('placeholder').style.display = 'none';
      document.getElementById('results').classList.add('visible');
      document.querySelector('.right-panel').scrollTop = 0;

      // ── EnergyGuide parent bridge ──────────────────────────────────────────
      try {
          const flat = {
            egV_totalWatts:         r.egV_totalWatts,
            dailyKwh:           r.dailyKwh,
            maxSurge:           r.maxSurge,
            invKva:             r.invKva,
            invModel:           r.invModel,
            egV_sysV:               r.egV_sysV,
            systemVoltage:      r.egV_sysV,
            egV_acCurrent:          r.egV_acCurrent,
            numPanels:          r.solar.numPanels,
            egV_pvWatts:            r.solar.egV_pvWatts,
            dailyGen:           r.solar.egV_dailyGenKwh,
            lithiumPackKwh:     r.battery.lithium.available ? r.battery.lithium.kwhNominal : 0
            pvCable:            r.pvCable,
            pvBreaker:          r.pvBreaker,
            battCable:          r.battCable,
            battBreaker:        r.battBreaker,
            acCable:            r.acCable,
            acBreaker:          r.acBreaker,
          };
          if (receiveEmbeddedCalculation) {
            if (typeof egBuildCostBreakdown === 'function') {
              const cost = egBuildCostBreakdown(flat);
              Object.assign(flat, cost);
            }
            receiveEmbeddedCalculation('vendor', flat, egV_appliances);
          }
        } catch(e) { console.warn('EG calc error:', e); }
      
    } catch (error) {
      const errorAlert = document.getElementById('error-alert');
      errorAlert.innerHTML = `
        <strong>⚠️ ${error.message}</strong>
        <p style="margin-top:8px;">Please adjust your egV_appliances or contact a solar installer for custom sizing.</p>
      `;
      errorAlert.style.display = 'block';
      document.getElementById('placeholder').style.display = 'none';
      document.getElementById('results').classList.add('visible');
      document.querySelector('.right-panel').scrollTop = 0;
    }
  }

  // Enter key support
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement.closest('.add-form')) {
      egV_addAppliance();
    }
  });

// ── eg-inst-calc inlined (egI) ──
let egI_appliances = [];

  // ==========================================
  // DATABASE: INVERTERS BY VOLTAGE
  // ==========================================
  const egI_INVERTER_DATABASE = {
    12: [
      { model: '1kVA Hybrid Inverter (12V)', kva: 1, voltage: 12 },
      { model: '1.5kVA Hybrid Inverter (12V)', kva: 1.5, voltage: 12 },
      { model: '2kVA Hybrid Inverter (12V)', kva: 2, voltage: 12 }
    ],
    24: [
      { model: '3kVA Hybrid Inverter (24V)', kva: 3, voltage: 24 },
      { model: '3.5kVA Hybrid Inverter (24V)', kva: 3.5, voltage: 24 },
      { model: '4kVA Hybrid Inverter (24V)', kva: 4, voltage: 24 },
      { model: '5kVA Hybrid Inverter (24V)', kva: 5, voltage: 24 },
      { model: '6kVA Hybrid Inverter (24V)', kva: 6, voltage: 24 }
    ],
    48: [
      { model: '8kVA Hybrid Inverter (48V)', kva: 8, voltage: 48 },
      { model: '10kVA Hybrid Inverter (48V)', kva: 10, voltage: 48 },
      { model: '12kVA Hybrid Inverter (48V)', kva: 12, voltage: 48 },
      { model: '15kVA Hybrid Inverter (48V)', kva: 15, voltage: 48 },
      { model: '20kVA Hybrid Inverter (48V)', kva: 20, voltage: 48 }
    ]
  };

  // ==========================================
  // DATABASE: LITHIUM BATTERIES BY VOLTAGE
  // ==========================================
  const egI_LITHIUM_PRODUCTS = {
    12: [],
    24: [
      { label: '2.5kWh Lithium', kwh: 2.5, nominalVoltage: 25.6, systemVoltage: 24 },
      { label: '3kWh Lithium', kwh: 3.0, nominalVoltage: 25.6, systemVoltage: 24 }
    ],
    48: [
      { label: '5kWh Lithium', kwh: 5.0, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '7.5kWh Lithium', kwh: 7.5, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '10kWh Lithium', kwh: 10.0, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '15kWh Lithium', kwh: 15.0, nominalVoltage: 51.2, systemVoltage: 48 },
      { label: '20kWh Lithium', kwh: 20.0, nominalVoltage: 51.2, systemVoltage: 48 }
    ]
  };

  // ==========================================
  // DATABASE: LEAD-ACID CONFIGURATION
  // ==========================================
  const egI_LEAD_ACID_CONFIG = {
    12: { unitAh: 220, series: 1 },
    24: { unitAh: 220, series: 2 },
    48: { unitAh: 220, series: 4 }
  };

  // ==========================================
  // MARKET ASSUMPTIONS
  // ==========================================
  const egI_PANEL_500W = {
    watts: 500,
    vmp: 41.0,
    voc: 49.5,
    imp: 12.2,
    isc: 13.1
  };

  // ==========================================
  // BREAKER DATABASES
  // ==========================================
  const egI_AC_BREAKERS = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160];
  const egI_PV_BREAKERS = [16, 20, 25, 32, 40, 50, 63];
  const egI_BATTERY_BREAKERS = [63, 80, 100, 125, 160, 200, 250];

  function egI_pickBreaker(requiredAmps, breakerList, minAmps) {
    const req = Math.max(requiredAmps, minAmps);
    for (const size of breakerList) {
      if (size >= req) return size;
    }
    return breakerList[breakerList.length - 1];
  }

  function egI_pickCableSize(designCurrent, table) {
    for (const entry of table) {
      if (designCurrent <= entry.maxAmps) return entry.size;
    }
    return table[table.length - 1].size;
  }

  function egI_estimatePvStrings(numPanels) {
    // Conservative market assumption: 2 modules in series per string for sizing.
    // This keeps PV current estimates from being unrealistically low.
    const panelsPerString = Math.min(2, Math.max(1, numPanels));
    const parallelStrings = Math.ceil(numPanels / panelsPerString);
    return { panelsPerString, parallelStrings };
  }

  function egI_getFridgeDutyFactor(item) {
    const egI_n = (item.name || '').toLowerCase();
    const isFridgeLike = ['fridge', 'refrigerator', 'freezer'].some(k => egI_n.includes(k));
    if (!isFridgeLike) return 1;
    const egI_mode = (item.fridgeMode || 'none').toLowerCase();
    if (egI_mode === 'inverter_fridge') return 0.35;
    if (egI_mode === 'chest_freezer') return 0.60;
    return 0.50;
  }

  function egI_addItem(item) {
    item.id = Date.now() + Math.random();
    egI_appliances.push(item);
    egI_renderList();
  }

  function egI_quickAdd(name, watts, qty, hours) {
    const egI_mode = /freezer/i.test(name) ? 'chest_freezer' : (/fridge|refrigerator/i.test(name) ? 'normal_fridge' : 'none');
    egI_addItem({name, watts, qty, hours, fridgeMode: egI_mode});
    document.getElementById('inp-name').value = '';
    document.getElementById('inp-watts').value = '';
    document.getElementById('inp-qty').value = '1';
    document.getElementById('inp-hours').value = '';
    document.getElementById('inp-fridge-egI_mode').value = 'none';
  }

  function egI_addAppliance() {
    const name = document.getElementById('inp-name').value.trim();
    const watts = parseFloat(document.getElementById('inp-watts').value);
    const qty = parseInt(document.getElementById('inp-qty').value);
    const hours = parseFloat(document.getElementById('inp-hours').value);
    const fridgeMode = document.getElementById('inp-fridge-egI_mode').value;

    if (!name) { alert('Please enter an appliance name.'); return; }
    if (isNaN(watts) || watts <= 0) { alert('Please enter valid watts.'); return; }
    if (isNaN(qty) || qty <= 0) { alert('Please enter a valid quantity.'); return; }
    if (isNaN(hours) || hours <= 0) { alert('Please enter valid hours per day.'); return; }

    egI_addItem({name, watts, qty, hours, fridgeMode});
    document.getElementById('inp-name').value = '';
    document.getElementById('inp-watts').value = '';
    document.getElementById('inp-qty').value = '1';
    document.getElementById('inp-hours').value = '';
    document.getElementById('inp-fridge-egI_mode').value = 'none';
    document.getElementById('inp-name').focus();
  }

  function egI_removeAppliance(id) {
    egI_appliances = egI_appliances.filter(a => a.id !== id);
    egI_renderList();
    if (egI_appliances.length === 0) {
      document.getElementById('results').classList.remove('visible');
      document.getElementById('placeholder').style.display = 'flex';
    }
  }

  function egI_renderList() {
    const list = document.getElementById('appliance-list');
    document.getElementById('count').textContent = egI_appliances.length;
    document.getElementById('calc-btn').disabled = egI_appliances.length === 0;

    if (egI_appliances.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="icon">🏠</div><p>No egI_appliances added yet.<br/>Use the form or quick-add chips above.</p></div>`;
      return;
    }

    list.innerHTML = egI_appliances.map(a => {
      const duty = egI_getFridgeDutyFactor(a);
      const egI_daily = (a.watts * a.qty * a.hours * duty / 1000).toFixed(2);
      const dutyText = duty !== 1 ? ` · <span>${Math.round(duty*100)}% duty</span>` : '';
      return `
        <div class="appliance-item">
          <div class="app-info">
            <div class="app-name">${a.name}</div>
            <div class="app-details">
              <span>${a.watts}W</span> × <span>${a.qty}</span> unit${a.qty > 1 ? 's' : ''} · <span>${a.hours}h/day</span>${dutyText}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="app-egI_daily">
              <strong>${egI_daily}</strong>
              kWh/day
            </div>
            <button class="btn-remove" onclick="egI_removeAppliance(${a.id})">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // VOLTAGE SELECTION LOGIC
  // ==========================================
  function egI_selectSystemVoltage(requiredKva) {
    if (requiredKva <= 2) return 12;
    if (requiredKva <= 6) return 24;
    return 48;
  }

  // ==========================================
  // INVERTER SELECTION
  // ==========================================
  function egI_selectInverter(requiredKva, voltage) {
    const models = egI_INVERTER_DATABASE[voltage];
    if (!models) {
      throw new Error(`No egI_inverter models available for ${voltage}V systems`);
    }
    const suitable = models.filter(m => m.kva >= requiredKva);
    if (suitable.length === 0) {
      throw new Error(`No ${voltage}V egI_inverter available for ${requiredKva.toFixed(1)} kVA. Max available: ${models[models.length - 1].kva} kVA`);
    }
    return suitable[0];
  }

  // ==========================================
  // BATTERY SIZING
  // ==========================================
  function egI_sizeBattery(dailyEnergyWh, voltage) {
    const dailyLoadKwh = dailyEnergyWh / 1000;
    const batteryEnergyKwh = dailyLoadKwh / 0.85;
    const lithiumRequiredKwh = batteryEnergyKwh / 0.8;

    const lithiumProducts = egI_LITHIUM_PRODUCTS[voltage] || [];
    let egI_lithiumRecommended = null;
    let egI_lithiumAltOptions = [];

    if (lithiumProducts.length > 0) {
      const lithiumOptions = lithiumProducts.map(product => {
        const quantity = Math.ceil(lithiumRequiredKwh / product.kwh);
        return {
          ...product,
          quantity,
          totalKwh: quantity * product.kwh,
          oversizeKwh: (quantity * product.kwh) - lithiumRequiredKwh
        };
      }).sort((a, b) => {
        if (a.totalKwh !== b.totalKwh) return a.totalKwh - b.totalKwh;
        return a.quantity - b.quantity;
      });

      egI_lithiumRecommended = lithiumOptions[0];
      egI_lithiumAltOptions = lithiumOptions.slice(1, 4);
    }

    return {
      voltage: voltage,
      lithium: egI_lithiumRecommended ? {
        available: true,
        requiredKwh: lithiumRequiredKwh,
        kwhNominal: egI_lithiumRecommended.totalKwh,
        quantity: egI_lithiumRecommended.quantity,
        unitKwh: egI_lithiumRecommended.kwh,
        unitLabel: egI_lithiumRecommended.label,
        nominalVoltage: egI_lithiumRecommended.nominalVoltage,
        systemVoltage: egI_lithiumRecommended.systemVoltage,
        altOptions: egI_lithiumAltOptions,
        configText: `${egI_lithiumRecommended.quantity} × ${egI_lithiumRecommended.label} (${egI_lithiumRecommended.systemVoltage}V class, ${egI_lithiumRecommended.nominalVoltage}V nominal)`
      } : {
        available: false,
        requiredKwh: lithiumRequiredKwh,
        kwhNominal: 0,
        quantity: 0,
        unitKwh: 0,
        unitLabel: '',
        nominalVoltage: 0,
        systemVoltage: voltage,
        altOptions: [],
        configText: `No standard lithium pack configured for ${voltage}V systems`
      }
    };
  }

  // ==========================================
  // SOLAR PANEL SIZING (CORRECTED v3.0)
  // ==========================================
  function egI_calculateSolarPanels(dailyWh, battery, rechargeStrategy = 'daily_full') {
    let egI_totalEnergyNeeded = dailyWh;
    let egI_rechargeEnergyWh = 0;
    const lithiumUsableWh = battery.lithium.available ? (battery.lithium.kwhNominal * 1000 * 0.8) : 0;

    // Use the same storage basis as the displayed premium recommendation when available.
    const storageBasis = battery.lithium.available ? 'lithium' : 'lead-acid';
    const usableCapacityWh = storageBasis === 'lithium' ? lithiumUsableWh : leadUsableWh;

    if (rechargeStrategy === 'daily_full') {
      egI_rechargeEnergyWh = usableCapacityWh;
      egI_totalEnergyNeeded += egI_rechargeEnergyWh;
    }
    else if (rechargeStrategy === 'partial_recharge') {
      egI_rechargeEnergyWh = usableCapacityWh * 0.5;
      egI_totalEnergyNeeded += egI_rechargeEnergyWh;
    }

    const systemEff = 0.75;
    const psh = 5.0;
    const pvMargin = 1.1;

    const egI_pvWatts = (egI_totalEnergyNeeded / (psh * systemEff)) * pvMargin;
    const numPanels = Math.ceil(egI_pvWatts / egI_PANEL_500W.watts);

    const egI_dailyGenKwh = (numPanels * egI_PANEL_500W.watts * psh * systemEff) / 1000;
    const egI_coverage = (egI_dailyGenKwh * 1000) / egI_totalEnergyNeeded * 100;

    return {
      egI_totalEnergyNeeded,
      egI_rechargeEnergyWh,
      usableCapacityWh,
      leadUsableWh,
      lithiumUsableWh,
      storageBasis,
      egI_pvWatts,
      numPanels,
      egI_dailyGenKwh,
      egI_coverage,
      rechargeStrategy
    };
  }

  // ==========================================
  // VOLTAGE COMPATIBILITY VALIDATION
  // ==========================================
  function egI_validateVoltageCompatibility(inverterVoltage, batteryVoltage) {
    if (inverterVoltage !== batteryVoltage) {
      throw new Error(
        `VOLTAGE MISMATCH: Inverter is ${inverterVoltage}V but battery is ${batteryVoltage}V. ` +
        `They MUST match for the system to work!`
      );
    }
    return true;
  }

  // ==========================================
  // MAIN CALCULATION ENGINE
  // ==========================================
  function egI_calculateEngine(apps, rechargeStrategy = 'daily_full') {
    let egI_totalWatts = 0, dailyWh = 0, maxExtraSurge = 0;
    const inductiveKeys = ['fridge', 'refrigerator', 'ac', 'air conditioner', 'pump', 'motor', 'compressor', 'freezer', 'washing machine'];

    for (const app of apps) {
      const watts = Math.max(0, app.watts);
      const qty = Math.max(0, app.qty);
      const hours = Math.max(0, app.hours);
      const duty = egI_getFridgeDutyFactor(app);
      const load = watts * qty;
      egI_totalWatts += load;
      dailyWh += load * hours * duty;
      
      const nameLower = app.name.toLowerCase();
      const isInductive = inductiveKeys.some(k => nameLower.includes(k));
      if (isInductive) {
        const surgeMult = 3.0;
        const extra = load * (surgeMult - 1.0);
        if (extra > maxExtraSurge) maxExtraSurge = extra;
      }
    }

    const peakWatts = egI_totalWatts + maxExtraSurge;

    // Inverter Selection
    const minInvWatts = egI_totalWatts * 1.25;
    const invRequiredW = Math.max(minInvWatts, peakWatts);
    const requiredKva = invRequiredW / 800.0;
    
    let egI_sysV = egI_selectSystemVoltage(requiredKva);
    let egI_inverter = egI_selectInverter(requiredKva, egI_sysV);

    // Canonical voltage mapping for Energy Guide v1:
    // 12V handles up to 2kVA, 24V handles 3kVA-6kVA, and 48V handles 8kVA+.
    // This keeps each egI_inverter size in one voltage class only.
    if (egI_sysV === 12 && egI_inverter.kva > 2) {
      egI_sysV = 24;
      egI_inverter = egI_selectInverter(requiredKva, egI_sysV);
    }

    const invKva = egI_inverter.kva;
    const invModel = egI_inverter.model;

    // Battery Sizing
    const battery = egI_sizeBattery(dailyWh, egI_sysV);
    egI_validateVoltageCompatibility(egI_sysV, battery.voltage);

    // Solar Sizing (CORRECTED)
    const solar = egI_calculateSolarPanels(dailyWh, battery, rechargeStrategy);

    // Cables & Breakers
    const pvStrings = egI_estimatePvStrings(solar.numPanels);
    const pvCurrent = pvStrings.parallelStrings * egI_PANEL_500W.isc;
    const pvDesignCurrent = pvCurrent * 1.25;
    const pvCable = egI_pickCableSize(pvDesignCurrent, [
      { size: 4, maxAmps: 30 },
      { size: 6, maxAmps: 40 },
      { size: 10, maxAmps: 55 },
      { size: 16, maxAmps: 75 }
    ]);
    const pvBreaker = egI_pickBreaker(pvDesignCurrent, egI_PV_BREAKERS, 16);

    const egI_maxBatt = (invKva * 1000) / egI_sysV;
    const battDesignCurrent = egI_maxBatt * 1.25;
    const battCable = egI_pickCableSize(battDesignCurrent, [
      { size: 16, maxAmps: 70 },
      { size: 25, maxAmps: 100 },
      { size: 35, maxAmps: 125 },
      { size: 50, maxAmps: 150 },
      { size: 70, maxAmps: 200 },
      { size: 95, maxAmps: 260 }
    ]);
    const battBreaker = egI_pickBreaker(battDesignCurrent, egI_BATTERY_BREAKERS, 63);

    const egI_acCurrent = (invKva * 1000) / 230;
    const acDesignCurrent = egI_acCurrent * 1.25;
    const acCable = egI_pickCableSize(acDesignCurrent, [
      { size: 2.5, maxAmps: 20 },
      { size: 4, maxAmps: 28 },
      { size: 6, maxAmps: 36 },
      { size: 10, maxAmps: 50 },
      { size: 16, maxAmps: 68 }
    ]);
    const acBreaker = egI_pickBreaker(acDesignCurrent, egI_AC_BREAKERS, 16);

    return {
      egI_totalWatts, dailyKwh: dailyWh / 1000, maxSurge: peakWatts,
      invKva, invModel, egI_sysV, egI_acCurrent,
      battery: battery,
      solar: solar,
      pvCable, pvBreaker, pvCurrent, pvStrings,
      battCable, battBreaker, battCurrent: egI_maxBatt,
      acCable, acBreaker
    };
  }

  function egI_calculate() {
    if (egI_appliances.length === 0) return;
    
    const rechargeStrategy = document.querySelector('input[name="recharge-strategy"]:checked').value;
    
    try {
      const r = egI_calculateEngine(egI_appliances, rechargeStrategy);
      
      document.getElementById('error-alert').style.display = 'none';

      // Load
      document.getElementById('r-watts').textContent = r.egI_totalWatts.toLocaleString();
      document.getElementById('r-kwh').textContent = r.dailyKwh.toFixed(2);
      document.getElementById('r-surge').textContent = r.maxSurge.toLocaleString();

      // Inverter & Voltage
      document.getElementById('r-voltage').textContent = r.egI_sysV;
      document.getElementById('r-kva').textContent = r.invKva;
      document.getElementById('r-inv-model').textContent = r.invModel;
      document.getElementById('r-ac-amps').textContent = r.egI_acCurrent.toFixed(1);

      // Battery
      const lithAlt = r.battery.lithium.altOptions.length > 0
        ? `Alt: ${r.battery.lithium.altOptions.map(opt => `${opt.quantity} × ${opt.label} = ${opt.totalKwh.toFixed(1).replace(/\.0$/, '')}kWh`).join(' • ')}`
        : '';

      if (r.battery.lithium.available) {
        document.getElementById('r-lithium').textContent = `${r.battery.lithium.kwhNominal.toFixed(1).replace(/\.0$/, '')}`;
        document.getElementById('r-lithium-alt').textContent = lithAlt;
        document.getElementById('r-lithium-config').textContent = `${r.battery.lithium.configText} · 80% DoD`;
      } else {
        document.getElementById('r-lithium').textContent = 'N/A';
        document.getElementById('r-lithium-alt').textContent = '';
        document.getElementById('r-lithium-config').textContent = r.battery.lithium.configText;
      }

      document.getElementById('r-batt-config').textContent =
        `${r.battery.lithium.available ? `✅ Lithium: ${r.battery.lithium.quantity} × ${r.battery.lithium.unitLabel} = ${r.battery.lithium.kwhNominal.toFixed(1).replace(/\.0$/, '')}kWh (${r.battery.lithium.systemVoltage}V class)` : `⚠️ Lithium: ${r.battery.lithium.configText}`}
` +;

      // Solar (CORRECTED)
      document.getElementById('r-pv-watts').textContent = Math.ceil(r.solar.egI_pvWatts).toLocaleString();
      document.getElementById('r-panels').textContent = r.solar.numPanels;
      document.getElementById('r-gen').textContent = r.solar.egI_dailyGenKwh.toFixed(2);
      document.getElementById('r-egI_coverage').textContent = r.solar.egI_coverage.toFixed(0);

      // Solar Breakdown (NEW)
      const strategyName = {
        'daily_full': 'Daily Full Recharge',
        'partial_recharge': 'Partial Recharge',
        'load_only': 'Load Only'
      }[r.solar.rechargeStrategy];

      const storageLabel = 'Lithium';
      const breakdownText = `
        <strong>Strategy:</strong> ${strategyName}<br/>
        <strong>Daily Load:</strong> ${r.dailyKwh.toFixed(2)} kWh<br/>
        <strong>Recharge Basis:</strong> ${storageLabel}<br/>
        <strong>Battery Recharge:</strong> ${(r.solar.egI_rechargeEnergyWh / 1000).toFixed(2)} kWh (${r.solar.usableCapacityWh / 1000 > 0 ? Math.round((r.solar.egI_rechargeEnergyWh / r.solar.usableCapacityWh) * 100) : 0}% of usable ${storageLabel.toLowerCase()} storage)<br/>
        <strong>Total Energy Needed:</strong> ${(r.solar.egI_totalEnergyNeeded / 1000).toFixed(2)} kWh<br/>
        <strong>System Efficiency:</strong> 75% (MPPT + Battery + Wiring)<br/>
        <strong>Peak Sun Hours:</strong> 5 hours<br/>
      `;
      document.getElementById('r-solar-breakdown').innerHTML = breakdownText;

      // Cables
      const cables = [
        ['PV Panels → Inverter (DC)', `${r.pvCable} mm²`, `${r.pvBreaker}A DC`],
        ['Inverter → Battery (DC)', `${r.battCable} mm²`, `${r.battBreaker}A DC`],
        ['Inverter → AC Load', `${r.acCable} mm²`, `${r.acBreaker}A AC`],
        ['Inverter → Grid Input', `${r.acCable} mm²`, `${r.acBreaker}A AC`],
      ];
      document.getElementById('r-cables').innerHTML = cables.map(([conn, cable, breaker]) => `
        <tr>
          <td class="conn-name">${conn}</td>
          <td><span class="badge">${cable}</span></td>
          <td><span class="badge green">${breaker}</span></td>
        </tr>
      `).join('');

      // Show results
      document.getElementById('placeholder').style.display = 'none';
      document.getElementById('results').classList.add('visible');
      document.querySelector('.right-panel').scrollTop = 0;

      // ── EnergyGuide parent bridge ──────────────────────────────────────────
      try {
          const numPanels   = r.solar.numPanels;
          const lithiumKwh  = r.battery.lithium.available ? r.battery.lithium.kwhNominal : 0;
          const battCount   = r.battery.lithium.available
            ? r.battery.lithium.quantity;
          const flat = {
            totalWatts: r.egI_totalWatts,
            dailyKwh: r.dailyKwh,
            maxSurge: r.maxSurge,
            invKva: r.invKva,
            invModel: r.invModel,
            systemVoltage: r.egI_sysV,
            sysV: r.egI_sysV,
            acCurrent: r.egI_acCurrent,
            numPanels: numPanels,
            totalPanels: numPanels,
            pvWatts: r.solar.egI_pvWatts,
            actualPvPower: numPanels * 500,
            dailyGen: r.solar.egI_dailyGenKwh,
            lithiumPackKwh: lithiumKwh,
            batteryBankKwh: lithiumKwh,
            batteryCount: battCount,
            batUnits: battCount,
            batLabel: r.battery.lithium.unitLabel || (r.battery.lithium.kwh + 'kWh Lithium'),
            batteryType: 'Lithium'
            pvCable: r.pvCable,
            pvBreaker: r.pvBreaker,
            battCable: r.battCable,
            battBreaker: r.battBreaker,
            acCable: r.acCable,
            acBreaker: r.acBreaker,
            panelWatts: 500
          };
          if (typeof egBuildCostBreakdown === 'function') {
            Object.assign(flat, egBuildCostBreakdown(flat));
          }
          receiveEmbeddedCalculation('installer', flat, egI_appliances);
        } catch(e) { console.warn('EG calc error:', e); }

      // ── Show "View Full Report" button in parent ───────────────────────────
      const egViewBtn = document.getElementById('eg-view-results-btn');
      if (egViewBtn) egViewBtn.style.display = 'block';
      
    } catch (error) {
      const errorAlert = document.getElementById('error-alert');
      errorAlert.innerHTML = `
        <strong>⚠️ ${error.message}</strong>
        <p style="margin-top:8px;">Please adjust your egI_appliances or contact a solar installer for custom sizing.</p>
      `;
      errorAlert.style.display = 'block';
      document.getElementById('placeholder').style.display = 'none';
      document.getElementById('results').classList.add('visible');
      document.querySelector('.right-panel').scrollTop = 0;
    }
  }

  // Enter key support
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement.closest('.add-form')) {
      egI_addAppliance();
    }
  });


})();
