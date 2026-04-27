// ─────────────────────────────────────────────────────────────────────────────
// EnergyGuide — Commercial & Industrial Solar Sizing Engine  (calc-ci.js)
// Namespace: l4ci_   Portal prefix: ci
// 3-Phase 415V AC | LFP BESS | Parallel inverter stacks
// ─────────────────────────────────────────────────────────────────────────────
(function(){

  // ── Panel Spec ─────────────────────────────────────────────────────────────
  const CI_PANEL = {wattage:550, vmp:41.8, imp:12.2, voc:49.5, area:2.8}; // m² per panel

  // ── Inverter Stack DB (3-phase 48V DC bus, 415V AC output) ─────────────────
  // unitKw: single unit rated kW
  // maxUnits: max parallel units (most manufacturers allow up to 6)
  const CI_INVERTER_DB = [
    {unitKw:50,  unitKva:55.5, dcVoltage:48, maxUnits:6, mpptMin:150, mpptMax:800, maxPvA:200},
    {unitKw:100, unitKva:111,  dcVoltage:48, maxUnits:6, mpptMin:200, mpptMax:800, maxPvA:400},
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
    var reqPvW  = (dailyKwh * LOSS) / PSH;          // W needed from array
    var panels  = Math.ceil((reqPvW * 1000) / (CI_PANEL.wattage * PR * 1000 / 1000));
    // recalc simpler
    panels      = Math.ceil((dailyKwh * LOSS * 1000) / (CI_PANEL.wattage * PSH * PR / 1000) / 1000);
    // clean formula
    var reqKwp  = (dailyKwh / (PSH * PR));           // kWp required
    panels      = Math.ceil(reqKwp * 1000 / CI_PANEL.wattage);
    var arrKwp  = +(panels * CI_PANEL.wattage / 1000).toFixed(1);

    // Panels per string: C&I uses 4 panels/string (same 48V bus)
    var pps     = 4;
    var strings = Math.ceil(panels / pps);
    var pvV     = +(pps * CI_PANEL.vmp).toFixed(1);
    var pvA     = +(strings * CI_PANEL.imp).toFixed(1);

    // Area check
    var reqM2   = +(panels * CI_PANEL.area).toFixed(0);
    var areaOk  = availM2 >= reqM2;

    // String combiner boxes: 1 per 8 strings
    var combiners = Math.ceil(strings / 8);

    // ── Step 4: Cables & Breakers ───────────────────────────────────────────
    // 3-phase AC current per inverter unit
    var acAperUnit = (inv.unitKva * 1000) / (Math.sqrt(3) * 415);
    var acATotal   = acAperUnit * units;
    var acD        = acATotal * 1.25;

    // DC PV current (per combiner output to inverter)
    var pvOpPerCombi = (strings / combiners) * CI_PANEL.imp;
    var pvD          = pvOpPerCombi * 1.25;

    // Battery DC current — HV LFP BESS connects at high voltage (307V or 614V)
    // Use selected BESS nominal voltage for cable/breaker sizing
    var bessNomV     = CI_BESS_DB.find(function(p){return p.kwh===bess.kwh;}).nomV || 307;
    var batOpPerUnit = (inv.unitKw * 1000) / bessNomV;
    var batD         = batOpPerUnit * 1.25;

    var pvCab  = ci__cab(pvD,  CI_PC.dcCab);
    var pvBrk  = ci__brk(Math.max(pvD, 63), CI_PC.dcMccb);
    var batCab = ci__cab(batD, CI_PC.dcCab);
    var batBrk = ci__brk(Math.max(batD, 63), CI_PC.dcMccb);
    var acCab  = ci__cab(acD,  CI_PC.acCab);
    var acBrk  = ci__brk(Math.max(acD, 63), CI_PC.acMccb);

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
      acAperUnit:+acAperUnit.toFixed(1), acATotal:+acATotal.toFixed(1), acD:+acD.toFixed(1),
      pvD:+pvD.toFixed(1), batOpPerUnit:+batOpPerUnit.toFixed(1), batD:+batD.toFixed(1),
      // cables & breakers
      conn:{
        pv:  {cab:pvCab,  brk:pvBrk},
        bat: {cab:batCab, brk:batBrk},
        ac:  {cab:acCab,  brk:acBrk},
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
    add('3-Phase Hybrid Inverter',    s.inv.unitKw+'kW 3-Phase Unit @ 415V AC',   s.units);
    add('Solar Panel',                CI_PANEL.wattage+'W Mono PERC',              s.panels);
    add('HV LFP BESS Pack',           s.bess.label,                                s.bess.units);
    add('String Combiner Box',        '8-String DC Combiner w/ Fuses',             s.combiners);
    add('DC Main MCCB',               s.conn.pv.brk.a+'A DC MCCB',                1);
    add('Battery DC MCCB',            s.conn.bat.brk.a+'A DC MCCB',               1);
    add('AC MCCB (3-Phase Output)',   s.conn.ac.brk.a+'A 3-Phase MCCB',           s.units);
    add('3-Phase MDB/SMDB',           'Main Distribution Board',                   1);
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
    set('ci-r-ac-cab',   s.conn.ac.cab.s+'mm²');
    set('ci-r-ac-brk',   s.conn.ac.brk.a+'A AC MCCB');

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
    if(!peakKw||!dailyKwh||!backupHrs||!availM2||peakKw<30){
      if(errEl) errEl.style.display='block';
      if(errEl) errEl.textContent = peakKw<30
        ? 'Minimum peak demand for C&I is 30kW. For smaller systems use the Solar Calculator.'
        : 'Please fill in all required fields.';
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

})();
