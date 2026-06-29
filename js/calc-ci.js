// ─────────────────────────────────────────────────────────────────────────────
// EnergyGuide — Commercial & Industrial Solar Sizing Engine  (calc-ci.js)
// Namespace: l4ci_   Portal prefix: ci
// 3-Phase 415V AC | LFP BESS | Parallel inverter stacks
// ─────────────────────────────────────────────────────────────────────────────
(function(){

  // ── Panel Spec ─────────────────────────────────────────────────────────────
  const CI_PANEL = {wattage:550, vmp:41.8, imp:12.2, voc:49.5, area:2.3}; // m² per panel (550W mono PERC ~2.3m²)

  // ── Inverter Stack DB (3-phase, HV DC bus, 415V AC output) ──────────────────
  // unitKw: single unit rated kW
  // maxUnits: max parallel units (most manufacturers allow up to 6)
  // dcVoltage: HV DC bus voltage (these units use 500–800V DC, NOT 48V — separate from BESS)
  const CI_INVERTER_DB = [
    {unitKw:50,  unitKva:55.5, dcVoltage:600, maxUnits:6, mpptMin:150, mpptMax:800, maxPvA:200},
    {unitKw:100, unitKva:111,  dcVoltage:800, maxUnits:6, mpptMin:200, mpptMax:800, maxPvA:400},
  ];

  // ── BESS DB (High-Voltage LFP containerised packs) ─────────────────────────
  const CI_BESS_DB = [
    {label:'100kWh HV LFP Pack',  kwh:100,  nomV:307},
    {label:'215kWh HV LFP Pack',  kwh:215,  nomV:614},
  ];

  // ── Protection Tables ───────────────────────────────────────────────────────
  const CI_PC = {
    // DC cable (mm² → ampacity)
    dcCab:[{s:6,a:40},{s:10,a:54},{s:16,a:73},{s:25,a:95},{s:35,a:117},{s:50,a:141},
           {s:70,a:179},{s:95,a:215},{s:120,a:249},{s:150,a:285},{s:185,a:324},{s:240,a:380}],
    // AC cable 3-phase (mm² → ampacity)
    acCab:[{s:6,a:32},{s:10,a:44},{s:16,a:60},{s:25,a:78},{s:35,a:96},{s:50,a:118},
           {s:70,a:150},{s:95,a:182},{s:120,a:210},{s:150,a:240},{s:185,a:272},{s:240,a:320}],
    // DC MCCB
    dcMccb:[{a:63},{a:100},{a:160},{a:200},{a:250},{a:315},{a:400},{a:500},{a:630},{a:800},{a:1000},{a:1250},{a:1600}],
    // AC MCCB 3-phase
    acMccb:[{a:63},{a:100},{a:125},{a:160},{a:200},{a:250},{a:315},{a:400},{a:500},{a:630},{a:800},{a:1000}],
    // DC SPD classes for C&I (HV strings)
    dcSpd:[{uc:600,label:'600V DC Type 1+2'},{uc:1000,label:'1000V DC Type 1+2'}],
    // AC SPD fixed for 3-phase 415V
    acSpd:{uc:440, label:'440V AC 3-Phase Type 1+2'},
    // Earthing rods (practical count by kW)
    earthRodCount: function(kw){ return kw<=100?3:kw<=250?4:5; },
  };

  // ── Helper Functions ────────────────────────────────────────────────────────
  function ci__cab(d, t){
    return t.find(function(x){return x.a >= d;}) || t[t.length-1];
  }
  function ci__brk(d, t){
    return t.find(function(x){return x.a >= d;}) || t[t.length-1];
  }
  function ci__fmt(n){
    return Number(n).toLocaleString('en-NG');
  }

  // ── Core Engine ─────────────────────────────────────────────────────────────
  function l4ci__runEngine(inputs){
    var peakKw    = inputs.peakKw;       // peak demand kW
    var dailyKwh  = inputs.dailyKwh;     // daily energy consumption kWh
    var backupHrs = inputs.backupHrs;    // battery backup hours required
    var availM2   = inputs.availM2;      // available roof/ground area m²
    var soilId    = inputs.soilId || 'loam';

    var PF   = 0.9;   // power factor C&I
    var DoD  = 0.90;  // HV LFP depth of discharge
    var RTE  = 0.92;  // round-trip efficiency
    var PSH  = 5.0;   // peak sun hours Nigeria
    var PR   = 0.80;  // performance ratio (slightly lower for C&I large arrays)
    var LOSS = 1.30;  // cable/mismatch losses

    // ── Step 1: Inverter Sizing ─────────────────────────────────────────────
    var reqKva  = (peakKw / PF) * 1.25;  // 25% safety margin
    var inv     = null;
    var units   = 0;

    // Try 50kW units first, then 100kW, then mix
    for(var ui=0; ui<CI_INVERTER_DB.length; ui++){
      var iv = CI_INVERTER_DB[ui];
      var n  = Math.ceil(reqKva / iv.unitKva);
      if(n <= iv.maxUnits){
        inv   = iv;
        units = n;
        break;
      }
    }
    // If neither fits within maxUnits, use 100kW and flag oversize
    if(!inv){
      inv   = CI_INVERTER_DB[1];
      units = Math.min(Math.ceil(reqKva / inv.unitKva), inv.maxUnits);
    }

    var totalKva = +(units * inv.unitKva).toFixed(1);
    var totalKw  = +(units * inv.unitKw).toFixed(1);
    var oversize = reqKva > totalKva; // flag if stack is undersized

    // ── Step 2: Battery Sizing ──────────────────────────────────────────────
    var reqBessKwh = (peakKw * backupHrs) / (DoD * RTE);
    // Choose smallest pack that works, prefer fewest units
    var bessOpts = CI_BESS_DB.map(function(p){
      return {label:p.label, kwh:p.kwh, units:Math.ceil(reqBessKwh/p.kwh),
              totalKwh: Math.ceil(reqBessKwh/p.kwh)*p.kwh};
    }).sort(function(a,b){return a.units - b.units || a.kwh - b.kwh;});
    var bess = bessOpts[0];

    // ── Step 3: Solar Array Sizing ──────────────────────────────────────────
    // C&I uses HV strings — target 500–700V Vmp to suit 200–800V MPPT window.
    // With 550W panels (Vmp 41.8V): 14 panels/string → 585V Vmp, 693V Voc (safe under 800V limit)
    var reqKwp  = dailyKwh / (PSH * PR);           // kWp required
    var panels  = Math.ceil(reqKwp * 1000 / CI_PANEL.wattage);
    var arrKwp  = +(panels * CI_PANEL.wattage / 1000).toFixed(1);

    var pps     = 14; // panels per string — gives 585V Vmp, 693V Voc (within HV MPPT range)
    var strings = Math.ceil(panels / pps);
    var pvV     = +(pps * CI_PANEL.vmp).toFixed(1);  // string Vmp
    var pvA     = +(strings * CI_PANEL.imp).toFixed(1); // total array current

    // Area check
    var reqM2   = +(panels * CI_PANEL.area).toFixed(0);
    var areaOk  = availM2 >= reqM2;

    // String combiner boxes: 1 per 8 strings
    var combiners = Math.ceil(strings / 8);

    // ── Step 4: Cables & Breakers ───────────────────────────────────────────
    // 3-phase AC current per inverter unit (for per-unit output MCCB)
    var acAperUnit  = (inv.unitKva * 1000) / (Math.sqrt(3) * 415);
    var acATotal    = acAperUnit * units;  // total AC output current (for main MDB breaker)
    var acDperUnit  = acAperUnit * 1.25;   // design current per unit
    var acDtotal    = acATotal   * 1.25;   // design current for main MDB

    // DC PV current (per combiner output to inverter)
    var pvOpPerCombi = (strings / combiners) * CI_PANEL.imp;
    var pvD          = pvOpPerCombi * 1.25;

    // Battery DC current — sized on TOTAL system power through the BESS bank
    // All inverter units share one battery bus; cable/breaker must handle full discharge current
    var bessNomV     = CI_BESS_DB.find(function(p){return p.kwh===bess.kwh;}).nomV || 307;
    var batOpTotal   = (totalKw * 1000) / bessNomV;  // total DC current from BESS bank
    var batD         = batOpTotal * 1.25;

    var pvCab  = ci__cab(pvD,       CI_PC.dcCab);
    var pvBrk  = ci__brk(Math.max(pvD, 63),   CI_PC.dcMccb);
    var batCab = ci__cab(batD,      CI_PC.dcCab);
    var batBrk = ci__brk(Math.max(batD, 63),  CI_PC.dcMccb);
    var acCabUnit = ci__cab(acDperUnit, CI_PC.acCab);  // per-unit AC cable
    var acBrkUnit = ci__brk(Math.max(acDperUnit, 63), CI_PC.acMccb);  // per-unit MCCB
    var acBrkMain = ci__brk(Math.max(acDtotal,   63), CI_PC.acMccb);  // main MDB MCCB

    // ── Step 5: SPD ─────────────────────────────────────────────────────────
    // DC SPD: string Voc × 1.1, use 1000V class for C&I (strings can be up to 800V)
    var stringVoc = pps * CI_PANEL.voc;
    var minDcUc   = stringVoc * 1.1;
    var dcSpd     = CI_PC.dcSpd.find(function(s){return s.uc >= minDcUc;}) || CI_PC.dcSpd[CI_PC.dcSpd.length-1];
    var acSpd     = CI_PC.acSpd;

    // ── Step 6: Earthing ────────────────────────────────────────────────────
    var rodCount = CI_PC.earthRodCount(totalKw);
    var SOIL_RHO = {wet:50, loam:100, sandy:300, rocky:600};
    var rho      = SOIL_RHO[soilId] || 100;
    var ROD_L    = 3.0, ROD_D = 0.016;
    var r1       = (rho/(2*Math.PI*ROD_L)) * (Math.log((8*ROD_L)/ROD_D) - 1);
    var LAMBDA   = {1:1.0,2:1.16,3:1.29,4:1.36,5:1.42};
    var lam      = LAMBDA[Math.min(rodCount,5)] || 1.42;
    var rn       = +((r1*lam)/rodCount).toFixed(2);

    // ── Step 7: NEMSA flag ──────────────────────────────────────────────────
    var nemsaFlag = totalKw >= 100;

    // ── Return full state ───────────────────────────────────────────────────
    return {
      // inputs
      peakKw:peakKw, dailyKwh:dailyKwh, backupHrs:backupHrs,
      availM2:availM2, soilId:soilId,
      // inverter
      inv:inv, units:units, totalKva:totalKva, totalKw:totalKw,
      reqKva:+reqKva.toFixed(1), oversize:oversize,
      // bess
      bess:bess, bessOpts:bessOpts, reqBessKwh:+reqBessKwh.toFixed(1),
      // solar
      panels:panels, arrKwp:arrKwp, strings:strings, pps:pps,
      pvV:pvV, pvA:pvA, reqM2:reqM2, areaOk:areaOk, combiners:combiners,
      // currents
      acAperUnit:+acAperUnit.toFixed(1), acATotal:+acATotal.toFixed(1),
      acDperUnit:+acDperUnit.toFixed(1), acDtotal:+acDtotal.toFixed(1),
      pvD:+pvD.toFixed(1), batOpTotal:+batOpTotal.toFixed(1), batD:+batD.toFixed(1),
      bessNomV:bessNomV,
      // cables & breakers
      conn:{
        pv:  {cab:pvCab,     brk:pvBrk},
        bat: {cab:batCab,    brk:batBrk},
        ac:  {cab:acCabUnit, brk:acBrkUnit},  // per-unit
        acMain: {brk:acBrkMain},               // main MDB
      },
      // spd & earth
      dcSpd:dcSpd, acSpd:acSpd, stringVoc:+stringVoc.toFixed(1), minDcUc:+minDcUc.toFixed(1),
      earth:{rods:rodCount, rn:rn, rho:rho, warn:rn>5},
      // flags
      nemsaFlag:nemsaFlag,
    };
  }

  // ── BOM Builder ────────────────────────────────────────────────────────────
  function l4ci__buildBOM(s){
    var items = [];
    function add(item, spec, qty){
      items.push({item:item, spec:spec, qty:qty, price:'Quote Required'});
    }
    add('3-Phase Hybrid Inverter',    s.inv.unitKw+'kW 3-Phase Unit @ 415V AC',        s.units);
    add('Solar Panel',                CI_PANEL.wattage+'W Mono PERC',                   s.panels);
    add('HV LFP BESS Pack',           s.bess.label,                                     s.bess.units);
    add('String Combiner Box',        '8-String DC Combiner w/ Fuses',                  s.combiners);
    add('DC Main MCCB',               s.conn.pv.brk.a+'A DC MCCB',                     1);
    add('Battery DC MCCB',            s.conn.bat.brk.a+'A DC MCCB',                    1);
    add('AC MCCB (Per Inverter Unit)', s.conn.ac.brk.a+'A 3-Phase MCCB',               s.units);
    add('AC Main MCCB (MDB)',          s.conn.acMain.brk.a+'A 3-Phase MCCB',           1);
    add('3-Phase MDB/SMDB',           'Main Distribution Board',                        1);
    add('DC SPD',                     dcSpdLabel(s)+' (PV Array)',                 1);
    add('AC SPD',                     s.acSpd.label+' (Inverter Output)',           1);
    add('PV DC Cable',                s.conn.pv.cab.s+'mm² Solar Cable',           1);
    add('Battery DC Cable',           s.conn.bat.cab.s+'mm² DC Cable',             1);
    add('AC Output Cable',            s.conn.ac.cab.s+'mm² 3-Core + Earth',        1);
    add('Earthing Rod',               '3m × 16mm Copper-Bonded Steel',             s.earth.rods);
    add('Energy Meter',               'Bidirectional 3-Phase kWh Meter',           1);
    add('Remote Monitoring',          'Cloud SCADA / EMS Controller',              1);
    if(s.nemsaFlag){
      add('NEMSA Notification',       'System ≥100kW — NEMSA/NERC filing required','—');
    }
    return items;
  }

  function dcSpdLabel(s){
    return s.dcSpd ? s.dcSpd.label : '1000V DC Type 1+2';
  }

  // ── Render Results ─────────────────────────────────────────────────────────
  function l4ci__renderResults(s){
    function set(id,v){var el=document.getElementById(id);if(el)el.innerHTML=v;}
    var N=function(n){return Number(n).toLocaleString('en-NG');};

    // Inverter
    set('ci-r-inv-units',    s.units+' × '+s.inv.unitKw+'kW');
    set('ci-r-inv-total',    s.totalKw+'kW / '+s.totalKva+'kVA');
    set('ci-r-inv-phase',    '3-Phase 415V AC Output');
    // Oversize flag
    var oversizeEl = document.getElementById('ci-r-oversize-flag');
    if (oversizeEl) oversizeEl.style.display = s.oversize ? 'block' : 'none';

    // Solar
    set('ci-r-panels',       N(s.panels)+' panels');
    set('ci-r-kwp',          s.arrKwp+' kWp Array');
    set('ci-r-strings',      s.strings+' strings × '+s.pps+' panels');
    set('ci-r-area-req',     N(s.reqM2)+'m² required');

    // Area flag
    var areaEl = document.getElementById('ci-r-area-flag');
    if(areaEl){
      if(s.areaOk){
        areaEl.innerHTML='<span style="color:#22c55e">✅ Fits in available '+N(s.availM2)+'m²</span>';
      } else {
        areaEl.innerHTML='<span style="color:#ef4444">⚠️ Need '+N(s.reqM2)+'m² — only '+N(s.availM2)+'m² available. Reduce array or use ground mount.</span>';
      }
    }

    // BESS
    set('ci-r-bess-units',   s.bess.units+' × '+s.bess.label);
    set('ci-r-bess-total',   s.bess.totalKwh+'kWh usable storage');
    set('ci-r-bess-backup',  s.backupHrs+'hrs backup @ '+s.peakKw+'kW load');

    // Cables & Breakers
    set('ci-r-pv-cab',   s.conn.pv.cab.s+'mm²');
    set('ci-r-pv-brk',   s.conn.pv.brk.a+'A DC MCCB');
    set('ci-r-bat-cab',  s.conn.bat.cab.s+'mm²');
    set('ci-r-bat-brk',  s.conn.bat.brk.a+'A DC MCCB');
    set('ci-r-ac-cab',   s.conn.ac.cab.s+'mm² (per inverter unit)');
    set('ci-r-ac-brk',   s.conn.ac.brk.a+'A per unit / '+s.conn.acMain.brk.a+'A main MDB');

    // SPD
    set('ci-r-dc-spd', s.dcSpd.label+'<br><small style="color:var(--muted)">String Voc: '+s.stringVoc+'V | Min Uc: '+s.minDcUc+'V</small>');
    set('ci-r-ac-spd', s.acSpd.label);

    // Earthing
    set('ci-r-earth-rods',  s.earth.rods+' × Rod'+(s.earth.rods>1?'s':'')+' Required');
    set('ci-r-earth-res',   s.earth.rn+'Ω'+(s.earth.warn?' ⚠ — add chemical compound':'  ✅'));

    // Combiner boxes
    set('ci-r-combiners', s.combiners+' × String Combiner Box (8-string)');

    // NEMSA flag
    var nf = document.getElementById('ci-r-nemsa-flag');
    if(nf) nf.style.display = s.nemsaFlag ? 'block' : 'none';

    // BOM
    var bom = l4ci__buildBOM(s);
    var tbody = document.getElementById('ci-r-bom-body');
    if(tbody){
      tbody.innerHTML = bom.map(function(row, i){
        return '<tr style="background:'+(i%2?'var(--panel,#1e293b)':'transparent')+'">'+
          '<td style="padding:10px 12px;font-size:12px">'+row.item+'<br>'+
          '<span style="color:var(--muted);font-size:10px">'+row.spec+'</span></td>'+
          '<td style="padding:10px 8px;text-align:center;font-size:12px">'+row.qty+'</td>'+
          '<td style="padding:10px 8px;text-align:right;font-size:12px;color:#f59e0b;font-weight:600">'+row.price+'</td>'+
          '</tr>';
      }).join('');
    }

    // Show results
    var res = document.getElementById('ci-results');
    var ph  = document.getElementById('ci-placeholder');
    if(res) res.style.display = 'block';
    if(ph)  ph.style.display  = 'none';
    l4ci__renderBessAlts(s);
  }

  // ── Calculate (called from HTML button) ────────────────────────────────────
  window.l4ci_calculate = function(){
    // Validate
    var peakKw   = parseFloat(document.getElementById('ci-inp-peak-kw').value);
    var dailyKwh = parseFloat(document.getElementById('ci-inp-daily-kwh').value);
    var backupHrs= parseFloat(document.getElementById('ci-inp-backup-hrs').value);
    var availM2  = parseFloat(document.getElementById('ci-inp-area').value);
    var soilId   = document.getElementById('ci-inp-soil').value || 'loam';

    var errEl = document.getElementById('ci-error');
    var errMsg = '';
    if(!peakKw||!dailyKwh||!backupHrs||!availM2){
      errMsg = 'Please fill in all required fields.';
    } else if(peakKw < 30){
      errMsg = 'Minimum peak demand for C&I is 30kW. For smaller systems use the Solar Calculator.';
    } else if(peakKw > 600){
      errMsg = 'Peak demand above 600kW exceeds the scope of this tool. Please contact an Energy Guide C&I engineer for a custom design.';
    }
    if(errMsg){
      if(errEl){ errEl.style.display='block'; errEl.textContent=errMsg; }
      return;
    }
    if(errEl) errEl.style.display='none';

    var s = l4ci__runEngine({peakKw:peakKw, dailyKwh:dailyKwh,
      backupHrs:backupHrs, availM2:availM2, soilId:soilId});
    window.l4ci__lastResult = s;
    l4ci__renderResults(s);

    // Scroll to results
    var res = document.getElementById('ci-results');
    if(res) setTimeout(function(){res.scrollIntoView({behavior:'smooth'});}, 100);
  };

  // ── Hours Quick-Select Helper ──────────────────────────────────────────────
  window.l4ci_setHrs = function(h){
    var el = document.getElementById('ci-inp-backup-hrs');
    if(el) el.value = h;
    document.querySelectorAll('.ci-hrs-chip').forEach(function(btn){
      btn.style.background    = btn.textContent.trim() === h+' hrs' ? '#0ea5e9' : 'transparent';
      btn.style.color         = btn.textContent.trim() === h+' hrs' ? 'white'   : 'var(--text,#f1f5f9)';
      btn.style.borderColor   = btn.textContent.trim() === h+' hrs' ? '#0ea5e9' : 'var(--border,#334155)';
    });
  };

  // ── BESS Alternatives Renderer ─────────────────────────────────────────────
  function l4ci__renderBessAlts(s){
    var el = document.getElementById('ci-r-bess-alts');
    if(!el) return;
    el.innerHTML = s.bessOpts.map(function(opt, i){
      var active = opt.kwh === s.bess.kwh && opt.units === s.bess.units;
      return '<div class="ci-bess-card" onclick="l4ci_pickBess('+i+')" style="'+
        'padding:12px 14px;border:2px solid '+(active?'#f59e0b':'var(--border,#334155)')+';'+
        'border-radius:10px;cursor:pointer;background:'+(active?'rgba(245,158,11,0.08)':'transparent')+';'+
        'display:flex;justify-content:space-between;align-items:center;">'+
        '<div>'+
          '<div style="font-size:13px;font-weight:700;color:#f1f5f9;">'+opt.units+' × '+opt.label+'</div>'+
          '<div style="font-size:11px;color:var(--muted,#64748b);margin-top:2px;">'+opt.totalKwh+'kWh total</div>'+
        '</div>'+
        (active?'<span style="color:#f59e0b;font-size:12px;font-weight:700;">SELECTED</span>':'')+
      '</div>';
    }).join('');
  }


  window.l4ci_pickBess = function(idx){
    if(!window.l4ci__lastResult) return;
    var s = window.l4ci__lastResult;
    s.bess = s.bessOpts[idx];
    document.querySelectorAll('.ci-bess-card').forEach(function(c,i){
      c.style.borderColor = i===idx ? 'var(--sun,#f59e0b)' : 'var(--border,#334155)';
    });
    l4ci__renderResults(s);
  };

  // ── Handoff receiver ────────────────────────────────────────────────────────
  // Fired by egCIHandoff() in platform.js when user taps "Open C&I Calculator →"
  // from an oversize banner. Reads stashed load data, pre-fills the form, auto-runs.
  document.addEventListener('eg:ci-handoff', function() {
    try {
      var raw = sessionStorage.getItem('eg_ci_handoff');
      if (!raw) return;
      var data = JSON.parse(raw);
      sessionStorage.removeItem('eg_ci_handoff'); // consume once

      var pkEl  = document.getElementById('ci-inp-peak-kw');
      var dkEl  = document.getElementById('ci-inp-daily-kwh');
      var bkEl  = document.getElementById('ci-inp-backup-hrs');
      var arEl  = document.getElementById('ci-inp-area');

      if (pkEl && data.peakKw)   { pkEl.value  = data.peakKw; }
      if (dkEl && data.dailyKwh) { dkEl.value  = data.dailyKwh; }
      // Leave backup hours and area as defaults — user should review those
      // Briefly highlight the pre-filled fields so user knows what came across
      [pkEl, dkEl].forEach(function(el) {
        if (!el) return;
        el.style.transition = 'border-color 0.3s';
        el.style.borderColor = '#6366f1';
        setTimeout(function(){ el.style.borderColor = ''; }, 2000);
      });

      // Scroll to top of C&I form so user sees the pre-filled values
      var screen = document.getElementById('ci-calculator');
      if (screen) { screen.scrollTop = 0; }

      // Show a small handoff note above the calculate button
      var note = document.getElementById('ci-handoff-note');
      if (note) {
        note.style.display = 'block';
        setTimeout(function(){ note.style.display = 'none'; }, 4000);
      }
    } catch(e) {}
  });


// ── C&I Quote Request Flow ──────────────────────────────────────────────────

  // Open the quote request screen, pre-filling the sizing snapshot
  window.ciOpenQuoteRequest = function(type) {
    if (!window.l4ci__lastResult) {
      if (typeof showToast === 'function') showToast('Please calculate your system first', 'error');
      return;
    }

    // Store type so the quote form knows which marketplace was selected
    window._ciQuoteType = type;

    // Route through the marketplace browse screen first so the user
    // can see and select an installer/vendor before the quote form opens.
    // The marketplace opener sets a "from" context so back-button works.
    if (type === 'installer') {
      if (typeof egOpenInstallerMarketplaceFrom === 'function') {
        egOpenInstallerMarketplaceFrom('ci-calculator');
      } else if (typeof openInstallerMarketplace === 'function') {
        openInstallerMarketplace();
      }
    } else {
      if (typeof egOpenVendorMarketplaceFrom === 'function') {
        egOpenVendorMarketplaceFrom('ci-calculator');
      } else if (typeof openVendorMarketplace === 'function') {
        openVendorMarketplace();
      }
    }
  };

  // Called from the marketplace profile card "Request C&I Quote" button —
  // opens the quote form pre-filled with the selected installer/vendor.
  window.ciOpenQuoteForm = function(type) {
    var s = window.l4ci__lastResult;
    if (!s) { if (typeof showToast === 'function') showToast('Please calculate your system first', 'error'); return; }

    window._ciQuoteType = type || window._ciQuoteType || 'installer';

    var titleEl = document.getElementById('ciQuoteTitle');
    if (titleEl) titleEl.textContent = window._ciQuoteType === 'vendor' ? 'Request Equipment Quote' : 'Request Installation Quote';

    var snapEl = document.getElementById('ciQuoteSnapshot');
    if (snapEl) {
      snapEl.innerHTML =
        '<strong>' + s.units + ' × ' + s.inv.unitKw + 'kW</strong> 3-Phase Inverter Stack (' + s.totalKva + 'kVA)<br>' +
        '<strong>' + s.panels + ' × 550W</strong> Mono PERC Panels (' + s.arrKwp + 'kWp)<br>' +
        '<strong>' + s.bess.units + ' × ' + s.bess.label + '</strong> (' + s.bess.totalKwh + 'kWh BESS)<br>' +
        'Daily load: <strong>' + s.dailyKwh + 'kWh</strong> · Backup: <strong>' + s.backupHrs + 'hrs</strong>';
    }

    if (typeof currentUser !== 'undefined' && currentUser) {
      var n = document.getElementById('ciQuoteName');
      var p = document.getElementById('ciQuotePhone');
      var e = document.getElementById('ciQuoteEmail');
      var st = document.getElementById('ciQuoteState');
      var c = document.getElementById('ciQuoteCity');
      if (n && !n.value) n.value = currentUser.full_name || currentUser.name || '';
      if (p && !p.value) p.value = currentUser.phone || '';
      if (e && !e.value) e.value = currentUser.email || '';
      if (st && !st.value && currentUser.state) st.value = currentUser.state;
      if (c && !c.value) c.value = currentUser.city || '';
    }

    ['ciQuoteNameError','ciQuotePhoneError','ciQuoteEmailError','ciQuoteStateError'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.textContent = '';
    });

    if (typeof showScreen === 'function') showScreen('ci-quote-request');
  };

  // Submit the C&I quote request as a lead
  window.ciSubmitQuoteRequest = async function() {
    var name     = (document.getElementById('ciQuoteName')?.value    || '').trim();
    var phone    = (document.getElementById('ciQuotePhone')?.value   || '').trim();
    var email    = (document.getElementById('ciQuoteEmail')?.value   || '').trim();
    var state    = (document.getElementById('ciQuoteState')?.value   || '');
    var city     = (document.getElementById('ciQuoteCity')?.value    || '').trim();
    var facility = (document.getElementById('ciQuoteFacilityType')?.value || '');
    var power    = (document.getElementById('ciQuotePowerSource')?.value  || '');
    var contact  = (document.getElementById('ciQuoteContact')?.value || 'phone');
    var note     = (document.getElementById('ciQuoteNote')?.value    || '').trim();
    var type     = window._ciQuoteType || 'installer';

    // Validate
    var valid = true;
    function ciErr(id, msg) {
      var el = document.getElementById(id);
      if (el) el.textContent = msg;
      valid = false;
    }
    function ciClear(id) { var el = document.getElementById(id); if (el) el.textContent = ''; }

    ciClear('ciQuoteNameError'); ciClear('ciQuotePhoneError');
    ciClear('ciQuoteEmailError'); ciClear('ciQuoteStateError');

    if (name.length < 2)                                  ciErr('ciQuoteNameError',  'Name required');
    if (phone.length < 7)                                 ciErr('ciQuotePhoneError', 'Phone required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))       ciErr('ciQuoteEmailError', 'Valid email required');
    if (!state)                                           ciErr('ciQuoteStateError', 'State required');
    if (!valid) return;

    if (typeof showLoading === 'function') showLoading(true, 'Submitting request...');

    // Build detailed note
    var s = window.l4ci__lastResult;
    var systemDesc = s
      ? (s.units + '×' + s.inv.unitKw + 'kW 3-Ph Inverter | ' + s.panels + '×550W Panels | ' +
         s.bess.units + '×' + s.bess.label + ' | ' + s.dailyKwh + 'kWh/day | ' + s.backupHrs + 'hrs backup')
      : 'See attached sizing';

    var facilityLabel = facility ? (' | Facility: ' + facility) : '';
    var powerLabel    = power    ? (' | Existing power: ' + power) : '';
    var fullNote = '[C&I ' + (type === 'vendor' ? 'Equipment' : 'Installation') + ' Quote Request]\n' +
      'System: ' + systemDesc + facilityLabel + powerLabel +
      (note ? '\n\nNotes: ' + note : '');

    try {
      var sb = (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : window.supabaseClient;
      if (!sb) throw new Error('App not ready. Please try again.');

      var lead = {
        full_name:      name,
        phone:          phone,
        email:          email,
        state:          state,
        city:           city,
        project_type:   type === 'vendor' ? 'vendor_request' : 'business',
        contact_method: contact,
        note:           fullNote,
        status:         type === 'vendor' ? 'vendor_requested' : 'open',
      };

      var result;
      if (typeof supabaseSubmitMarketplaceLead === 'function') {
        result = await supabaseSubmitMarketplaceLead(lead);
      } else {
        // Fallback: direct insert
        var { error } = await sb.from('marketplace_leads').insert([lead]);
        result = error ? { success: false, error: error.message } : { success: true };
      }

      if (typeof showLoading === 'function') showLoading(false);

      if (result && result.success) {
        // Populate success screen
        var sumEl = document.getElementById('ciQuoteSuccessSummary');
        if (sumEl) {
          sumEl.innerHTML =
            '<div style="margin-bottom:6px;"><strong style="color:#f0f2ff;">Contact:</strong> ' + name + ' · ' + phone + '</div>' +
            '<div style="margin-bottom:6px;"><strong style="color:#f0f2ff;">Location:</strong> ' + (city ? city + ', ' : '') + state + '</div>' +
            '<div><strong style="color:#f0f2ff;">System:</strong> ' + systemDesc + '</div>';
        }
        if (typeof showScreen === 'function') showScreen('ci-quote-success');
        if (typeof showToast  === 'function') showToast('Quote request submitted!', 'success');
      } else {
        if (typeof showToast === 'function') showToast('Submission failed: ' + (result && result.error || 'unknown error'), 'error');
      }
    } catch (err) {
      if (typeof showLoading === 'function') showLoading(false);
      if (typeof showToast   === 'function') showToast('Error: ' + (err.message || 'submission failed'), 'error');
    }
  };


})();
