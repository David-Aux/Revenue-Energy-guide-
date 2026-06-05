// ─────────────────────────────────────────────────────────────────────────────
// EnergyGuide — Installation Guide  (install-guide.js)
// Layer 1: Dynamic SVG Wiring Diagram
// Layer 2: Sequential Installation Checklist (Supabase-backed progress)
// Reads from l4i__egS (installer engine state)
// ─────────────────────────────────────────────────────────────────────────────
(function(){

  // ── State ──────────────────────────────────────────────────────────────────
  var ig_s       = null;   // snapshot of l4i__egS at guide-open time
  var ig_checks  = {};     // { phaseIdx: { stepIdx: true/false } }
  var ig_tab     = 'diagram'; // 'diagram' | 'checklist'

  // ── Entry Point ────────────────────────────────────────────────────────────
  window.ig_open = function(){
    if(typeof l4i__egS === 'undefined' || !l4i__egS || !l4i__egS.inv){
      alert('Please run the calculator first to generate a system design.'); return;
    }
    ig_s = l4i__egS;
    ig_checks = {};
    ig_tab = 'diagram';
    ig_loadProgress();
    showScreen('install-guide');
    ig_renderTab();
  };

  // ── Tab Switcher ───────────────────────────────────────────────────────────
  window.ig_switchTab = function(tab){
    ig_tab = tab;
    ig_renderTab();
    ['diagram','checklist'].forEach(function(t){
      var btn = document.getElementById('ig-tab-'+t);
      if(btn){
        btn.style.background  = t===tab ? 'var(--sun,#f59e0b)' : 'transparent';
        btn.style.color       = t===tab ? '#0f172a'            : 'var(--muted,#94a3b8)';
        btn.style.borderColor = t===tab ? 'var(--sun,#f59e0b)' : 'var(--border,#334155)';
        btn.style.fontWeight  = t===tab ? '700'                : '400';
      }
    });
  };

  function ig_renderTab(){
    var d = document.getElementById('ig-pane-diagram');
    var c = document.getElementById('ig-pane-checklist');
    if(d) d.style.display = ig_tab==='diagram'   ? 'block' : 'none';
    if(c) c.style.display = ig_tab==='checklist' ? 'block' : 'none';
    if(ig_tab==='diagram')   ig_renderDiagram();
    if(ig_tab==='checklist') ig_renderChecklist();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LAYER 1 — DYNAMIC SVG WIRING DIAGRAM
  // ════════════════════════════════════════════════════════════════════════════

  function ig_renderDiagram(){
    var el = document.getElementById('ig-diagram-canvas');
    if(!el || !ig_s) return;
    el.innerHTML = ig_buildDiagram(ig_s);
  }

  function ig_buildDiagram(s){
    var V        = s.V;
    var kva      = s.inv.kva;
    var strings  = s.strings;
    var pps      = s.pps;
    var panels   = s.panels;
    var bat      = s.opts && s.opts[s.selBat||0];
    var batUnits = bat ? bat.units : 1;
    var batLabel = bat ? bat.label.replace(' Pack','') : V+'V Battery';
    var pvCab    = s.conn.pv.cab.s  + 'mm²';
    var batCab   = s.conn.bat.cab.s + 'mm²';
    var acCab    = s.conn.ac.cab.s  + 'mm²';
    var pvBrk    = s.conn.pv.brk.a  + 'A DC MCB';
    var batBrk   = s.conn.bat.brk.a + 'A DC MCCB';
    var acBrk    = s.conn.ac.brk.a  + 'A AC MCB';
    var dcSpdV   = s.spd ? s.spd.dc.uc+'V' : '250V';
    var acSpdV   = s.spd ? s.spd.ac.uc+'V' : '275V';
    var earthRods= s.earth ? s.earth.rods : (kva<=5?1:kva<=15?2:3);
    var hasCombi = V===48 && strings > 4;
    var strLabel = strings+' string'+(strings>1?'s':'')+' × '+pps+' panels';

    // ── Helper: block builder ───────────────────────────────────────────
    function block(icon, title, subtitle, color, bgColor, extra){
      return '<div style="border:2px solid '+color+';border-radius:12px;background:'+bgColor+';padding:14px 16px;margin-bottom:4px;'+(extra||'')+'">'
        +'<div style="font-size:10px;color:'+color+';text-transform:uppercase;letter-spacing:.8px;font-weight:700;margin-bottom:4px;">'+icon+' '+title+'</div>'
        +'<div style="font-size:16px;font-weight:800;color:#f1f5f9;line-height:1.3;">'+subtitle+'</div>'
        +'</div>';
    }

    function connector(label, color, direction){
      // Arrow connector with cable label
      var isDown = direction !== 'up';
      return '<div style="display:flex;flex-direction:column;align-items:center;margin:0;padding:2px 0;">'
        +'<div style="width:2px;height:12px;background:'+color+';"></div>'
        +'<div style="background:'+color+';color:#0f172a;font-size:10px;font-weight:800;padding:3px 10px;border-radius:10px;white-space:nowrap;">'+label+'</div>'
        +'<div style="width:2px;height:12px;background:'+color+';"></div>'
        +'<div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid '+color+';margin-top:-1px;"></div>'
        +'</div>';
    }

    function spacer(){ return '<div style="height:4px;"></div>'; }

    function sideNote(left, right){
      return '<div style="display:flex;gap:8px;margin-bottom:4px;">'
        +'<div style="flex:1;background:rgba(248,113,113,0.1);border:1px solid #f87171;border-radius:8px;padding:8px 10px;font-size:11px;color:#fca5a5;font-weight:600;text-align:center;">'+left+'</div>'
        +'<div style="flex:1;background:rgba(52,211,153,0.1);border:1px solid #34d399;border-radius:8px;padding:8px 10px;font-size:11px;color:#6ee7b7;font-weight:600;text-align:center;">'+right+'</div>'
        +'</div>';
    }

    var COL = {
      pv:'#f59e0b', bat:'#22c55e', ac:'#a78bfa',
      spd:'#f43f5e', brk:'#fb923c', inv:'#38bdf8',
      earth:'#84cc16', combiner:'#67e8f9',
    };

    var html = '<div style="font-family:sans-serif;color:#f1f5f9;padding:4px 0;">';

    // ── System header ───────────────────────────────────────────────────
    html += '<div style="background:rgba(56,189,248,0.08);border:1px solid #38bdf8;border-radius:12px;padding:12px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">'
      +'<div><div style="font-size:11px;color:#38bdf8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;">System</div>'
      +'<div style="font-size:18px;font-weight:800;">'+kva+'kVA @ '+V+'V</div></div>'
      +'<div style="text-align:right;"><div style="font-size:11px;color:#94a3b8;">'+panels+' panels · '+batUnits+'× battery</div>'
      +'<div style="font-size:11px;color:#94a3b8;">'+strings+' string'+(strings>1?'s':'')+' · '+pps+' panels/string</div></div>'
      +'</div>';

    // ── FLOW: top to bottom ─────────────────────────────────────────────

    // 1. PV Array
    html += block('☀', 'PV Array', panels+' × 550W Panels', COL.pv, 'rgba(245,158,11,0.08)');
    html += '<div style="font-size:11px;color:#94a3b8;text-align:center;margin:2px 0 4px;">'+strLabel+'</div>';
    html += connector(pvCab+' DC Cable', COL.pv);

    // 2. Combiner (conditional)
    if(hasCombi){
      html += block('⊕', 'String Combiner Box', strings+'-String DC Combiner', COL.combiner, 'rgba(103,232,249,0.08)');
      html += connector(pvCab+' DC Cable', COL.pv);
    }

    // 3. DC SPD
    html += block('⚡', 'DC Surge Protection', dcSpdV+' DC Type 2 SPD', COL.spd, 'rgba(244,63,94,0.08)');
    html += '<div style="font-size:10px;color:#94a3b8;text-align:center;margin:2px 0 4px;">Wired in parallel — diverts surges to earth ⏚</div>';
    html += connector(pvCab+' DC Cable', COL.pv);

    // 4. PV Breaker
    html += block('🔲', 'PV DC Breaker', pvBrk, COL.brk, 'rgba(251,146,60,0.08)');
    html += connector('Into Inverter PV Input', COL.pv);

    // 5. Inverter (centre — highlighted)
    html += '<div style="border:2px solid '+COL.inv+';border-radius:14px;background:rgba(56,189,248,0.08);padding:16px;margin-bottom:4px;">'
      +'<div style="font-size:10px;color:'+COL.inv+';text-transform:uppercase;letter-spacing:.8px;font-weight:700;margin-bottom:6px;">⚙ Hybrid Inverter</div>'
      +'<div style="font-size:24px;font-weight:900;color:#f1f5f9;margin-bottom:4px;">'+kva+'kVA @ '+V+'V</div>'
      +'<div style="font-size:12px;color:#94a3b8;">MPPT Solar Charger · Hybrid Inverter</div>'
      // Battery connection shown inline
      +'<div style="margin-top:12px;border-top:1px solid rgba(56,189,248,0.2);padding-top:10px;">'
      +'<div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">BATTERY CONNECTION (DC side)</div>'
      +sideNote('← '+batBrk, batCab+' Cable →')
      +'<div style="border:1px solid '+COL.bat+';border-radius:10px;background:rgba(34,197,94,0.08);padding:10px;text-align:center;">'
      +'<div style="font-size:10px;color:'+COL.bat+';font-weight:700;text-transform:uppercase;margin-bottom:2px;">🔋 Battery Bank</div>'
      +'<div style="font-size:15px;font-weight:800;color:#f1f5f9;">'+batUnits+' × '+batLabel+'</div>'
      +(batUnits>1?'<div style="font-size:10px;color:#94a3b8;margin-top:2px;">All units in parallel</div>':'')
      +'</div>'
      +'</div>'
      +'</div>';

    html += connector('AC Output', COL.ac);

    // 6. AC SPD
    html += block('⚡', 'AC Surge Protection', acSpdV+' AC Type 2 SPD', COL.spd, 'rgba(244,63,94,0.08)');
    html += '<div style="font-size:10px;color:#94a3b8;text-align:center;margin:2px 0 4px;">Wired in parallel — protects loads from AC surges</div>';
    html += connector('AC Output', COL.ac);

    // 7. AC Breaker
    html += block('🔲', 'AC Output Breaker', acBrk, COL.brk, 'rgba(251,146,60,0.08)');
    html += connector(acCab+' AC Cable', COL.ac);

    // 8. Changeover
    html += '<div style="border:2px solid '+COL.ac+';border-radius:12px;background:rgba(167,139,250,0.08);padding:14px 16px;margin-bottom:4px;">'
      +'<div style="font-size:10px;color:'+COL.ac+';text-transform:uppercase;letter-spacing:.8px;font-weight:700;margin-bottom:6px;">⇌ Changeover Switch</div>'
      +'<div style="display:flex;gap:8px;margin-bottom:4px;">'
      +'<div style="flex:1;text-align:center;border:1px solid #475569;border-radius:8px;padding:8px;font-size:11px;color:#94a3b8;">Solar / Battery<br><span style="color:'+COL.ac+';font-weight:700;">INPUT A</span></div>'
      +'<div style="flex:1;text-align:center;border:1px solid #475569;border-radius:8px;padding:8px;font-size:11px;color:#94a3b8;">Grid / Mains<br><span style="color:#64748b;font-weight:700;">INPUT B</span></div>'
      +'</div></div>';
    html += connector(acCab+' to Load', COL.ac);

    // 9. Load
    html += '<div style="border:2px solid #475569;border-radius:12px;background:rgba(71,85,105,0.3);padding:14px 16px;margin-bottom:14px;text-align:center;">'
      +'<div style="font-size:20px;margin-bottom:4px;">🏠</div>'
      +'<div style="font-size:16px;font-weight:800;color:#f1f5f9;">Your Loads</div>'
      +'<div style="font-size:11px;color:#94a3b8;margin-top:2px;">Distribution board / appliances</div>'
      +'</div>';

    // 10. Earthing (separate section below)
    html += '<div style="border:2px solid '+COL.earth+';border-radius:12px;background:rgba(132,204,22,0.06);padding:14px 16px;">'
      +'<div style="font-size:10px;color:'+COL.earth+';text-transform:uppercase;letter-spacing:.8px;font-weight:700;margin-bottom:8px;">⏚ Earthing System</div>'
      +'<div style="display:grid;grid-template-columns:repeat('+Math.min(earthRods,4)+',1fr);gap:8px;margin-bottom:8px;">'
      + Array(Math.min(earthRods,4)).fill(0).map(function(_,i){
          return '<div style="text-align:center;border:1px solid '+COL.earth+';border-radius:8px;padding:8px;font-size:10px;color:'+COL.earth+';">Rod '+(i+1)+'<br>3m×16mm</div>';
        }).join('')
      +'</div>'
      +(earthRods>4?'<div style="font-size:11px;color:#94a3b8;text-align:center;margin-bottom:6px;">+'+( earthRods-4)+' more rod'+(earthRods-4>1?'s':'')+'</div>':'')
      +'<div style="font-size:11px;color:#94a3b8;line-height:1.6;">'
      +'Bond: Inverter chassis · Battery negative · Panel frames · SPD earth terminals'
      +'</div>'
      +'</div>';

    html += '</div>';
    return html;
  }
  function ig_buildPhases(s){
    var V        = s.V;
    var kva      = s.inv.kva;
    var strings  = s.strings;
    var pps      = s.pps;
    var panels   = s.panels;
    var bat      = s.opts && s.opts[s.selBat||0];
    var batUnits = bat ? bat.units : 1;
    var batLabel = bat ? bat.label : V+'V Battery';
    var pvCab    = s.conn.pv.cab.s  + 'mm²';
    var batCab   = s.conn.bat.cab.s + 'mm²';
    var acCab    = s.conn.ac.cab.s  + 'mm²';
    var pvBrk    = s.conn.pv.brk.a  + 'A DC MCB';
    var batBrk   = s.conn.bat.brk.a + 'A DC MCCB';
    var acBrk    = s.conn.ac.brk.a  + 'A AC MCB';
    var dcSpd    = s.spd ? s.spd.dc.uc+'V DC Type 2 SPD' : 'DC SPD';
    var acSpd    = s.spd ? s.spd.ac.uc+'V AC Type 2 SPD' : 'AC SPD';
    var earthRods= s.earth ? s.earth.rods : (kva<=5?1:kva<=15?2:3);
    var earthCond= s.earth ? s.earth.condS+'mm²' : '6mm²';
    var highRho  = s.earth && s.earth.warn;
    var hasCombi = V===48 && strings > 4;
    var soil     = s.earth ? s.earth.soil : null;

    var phases = [];

    // ── Phase 1: Site Preparation ──────────────────────────────────────────
    phases.push({ icon:'📋', title:'Phase 1 — Site Preparation', steps:[
      'Survey and confirm mounting location for '+panels+' panels ('+strings+' string'+( strings>1?'s':'')+' × '+pps+' panels each)',
      'Confirm roof/ground can support panel weight — '+panels+' × 550W panels ≈ '+(panels*12)+'kg dead load',
      'Locate inverter position — must be shaded, ventilated, min 20cm clearance all sides',
      'Identify battery location — flat, ventilated, away from heat sources and direct sunlight',
      'Mark cable routes: PV DC route ('+pvCab+' cable), battery route ('+batCab+'), AC route ('+acCab+')',
      'Confirm earthing pit locations — '+earthRods+' pit'+(earthRods>1?'s':'')+', spaced minimum 6m apart',
      'Switch OFF all existing AC mains breakers at the distribution board',
      'Confirm all tools and materials on site against BOM before starting work',
    ]});

    // ── Phase 2: Mounting & Mechanical ────────────────────────────────────
    phases.push({ icon:'🔩', title:'Phase 2 — Mounting & Mechanical', steps:[
      'Install panel mounting rails — confirm level with spirit level before fixing',
      'Mount inverter on wall bracket — verify fixing is into solid masonry or stud',
      'Install battery rack/shelf — confirm level and rated for '+(batUnits * 30)+'kg minimum',
      'Mount all circuit breakers and MCCB enclosure at planned location',
      'Feed all conduit/trunking before pulling cables — check bend radius on DC cables',
      'Label all conduit runs at both ends before pulling cables',
    ]});

    // ── Phase 3: DC Wiring — PV Side ──────────────────────────────────────
    var pvSteps = [
      'Pull '+pvCab+' DC cable from panel array to inverter PV input',
      'Fit MC4 connectors on all panel string tails — verify polarity before mating',
      'Connect strings: each string is '+pps+' panels in series. Measure string Voc before connecting — expected ≈ '+(pps*49.5).toFixed(0)+'V DC',
    ];
    if(hasCombi){
      pvSteps.push('Wire each string into the string combiner box — one string per input terminal');
      pvSteps.push('Install string fuses in combiner box — one per string positive terminal');
      pvSteps.push('Connect combiner box output to '+pvBrk+' input using '+pvCab+' cable');
    } else {
      pvSteps.push('Connect string positive and negative tails directly to '+pvBrk+' input');
    }
    pvSteps.push('Install '+dcSpd+' in parallel across DC bus — connect earth terminal to PE bar');
    pvSteps.push('Wire '+pvBrk+' output to inverter PV input terminals — LEAVE BREAKER OPEN');
    pvSteps.push('Double-check all DC polarity: RED/positive to PV+ terminal, BLACK/negative to PV− terminal');
    phases.push({ icon:'🔆', title:'Phase 3 — DC Wiring (PV Side)', steps: pvSteps });

    // ── Phase 4: DC Wiring — Battery Side ─────────────────────────────────
    var batSteps = [
      'Confirm battery voltage matches system: '+V+'V DC nominal',
    ];
    if(batUnits > 1){
      batSteps.push('Connect '+batUnits+' batteries in parallel — verify polarity on EACH battery before linking');
      batSteps.push('Use equal-length battery cables for parallel connection to ensure balanced current sharing');
      batSteps.push('Connect parallel bus bar positive to '+batBrk+' input — LEAVE MCCB OPEN');
    } else {
      batSteps.push('Connect battery positive terminal to '+batBrk+' input using '+batCab+' cable — LEAVE MCCB OPEN');
    }
    batSteps.push('Connect '+batBrk+' output to inverter battery terminals using '+batCab+' cable');
    batSteps.push('Connect battery negative terminal directly to inverter BAT− terminal');
    batSteps.push('Double-check polarity at inverter battery input before closing MCCB');
    phases.push({ icon:'🔋', title:'Phase 4 — DC Wiring (Battery Side)', steps: batSteps });

    // ── Phase 5: AC Wiring ─────────────────────────────────────────────────
    phases.push({ icon:'⚡', title:'Phase 5 — AC Wiring', steps:[
      'Wire inverter AC output to '+acBrk+' using '+acCab+' cable (L, N, PE)',
      'Wire '+acBrk+' output to changeover switch SOLAR input terminal',
      'Wire grid/mains supply to changeover switch GRID input terminal',
      'Wire changeover switch OUTPUT to distribution board main input',
      'Install '+acSpd+' across L-N and L-PE at the distribution board',
      'Connect all neutral conductors to neutral bar',
      'Connect all earth/PE conductors to earth bar — do NOT connect earth bar to neutral bar (TT system)',
      'Label all AC breakers clearly at distribution board',
    ]});

    // ── Phase 6: Earthing & SPD ────────────────────────────────────────────
    var earthSteps = [
      'Drive '+earthRods+' earthing rod'+(earthRods>1?'s':'')+' into ground — each rod is 3.0m × 16mm copper-bonded steel',
      'Use a rod driver — do not damage copper bonding by hitting rod head directly',
    ];
    if(earthRods > 1) earthSteps.push('Space rods minimum 6m apart (2 × rod length) to minimise mutual resistance');
    if(highRho) earthSteps.push('⚠️ High resistivity soil — pack bentonite compound or salt-charcoal mixture around each rod before backfilling to reduce resistance');
    earthSteps.push('Clamp '+earthCond+' bare copper conductor to top of each rod using approved earth clamp');
    earthSteps.push('Run '+earthCond+' conductor from each rod back to earth bar in distribution board');
    earthSteps.push('Bond inverter chassis earth terminal to earth bar');
    earthSteps.push('Bond battery negative bus bar to earth bar (single point earth)');
    earthSteps.push('Bond panel mounting frames to earth bar using '+earthCond+' cable');
    earthSteps.push('Verify all earth connections are tight — use torque wrench where specified');
    phases.push({ icon:'⏚', title:'Phase 6 — Earthing & Bonding', steps: earthSteps });

    // ── Phase 7: Pre-Commissioning Checks ────────────────────────────────
    phases.push({ icon:'🔍', title:'Phase 7 — Pre-Commissioning Checks', steps:[
      'ALL breakers and MCCBs are OPEN (off) — verify before energising anything',
      'Visual inspection: no bare conductors visible, all terminals tight, no cable damage',
      'Megger test: insulation resistance on DC PV cables — minimum 1MΩ between each conductor and earth',
      'Verify PV string polarity with multimeter — measure Voc across string terminals, confirm positive is on PV+ side',
      'Verify battery polarity with multimeter before closing battery MCCB',
      'Confirm AC phase and neutral are correctly terminated at changeover switch',
      'Confirm all SPD earth connections are secure',
      'Confirm earthing conductor continuity from rods to earth bar with multimeter (<1Ω)',
    ]});

    // ── Phase 8: Commissioning ─────────────────────────────────────────────
    phases.push({ icon:'✅', title:'Phase 8 — Commissioning', steps:[
      'Close battery MCCB first — inverter should power on and show battery voltage',
      'Check inverter display shows correct battery voltage: approximately '+V+'V DC',
      'Close PV DC MCB — inverter should detect PV input and begin MPPT',
      'Verify PV input voltage on inverter display — expected ≈ '+(pps*41.8).toFixed(0)+'V per string',
      'Switch changeover to SOLAR output — verify AC output voltage is 220–240V AC',
      'Connect loads gradually — check AC output voltage remains stable under load',
      'Verify battery charging current is shown on inverter display',
      'Set inverter parameters: battery type (LiFePO4), charge voltage, low-voltage cutoff for '+V+'V system',
      'Record all measured values: PV Voc, battery voltage, AC output voltage, earth resistance',
      'Label installation date, installer name, and system spec on inverter with permanent marker or label',
    ]});

    return phases;
  }

  function ig_renderChecklist(){
    var el = document.getElementById('ig-checklist-body');
    if(!el || !ig_s) return;

    var phases   = ig_buildPhases(ig_s);
    var totalDone= 0, totalSteps = 0;

    // Count completed phases to know what to unlock
    var phaseComplete = phases.map(function(_,pi){
      var steps = phases[pi].steps;
      return steps.every(function(_,si){ return ig_checks[pi] && ig_checks[pi][si]; });
    });

    var html = '';
    phases.forEach(function(phase, pi){
      var prevComplete = pi===0 || phaseComplete[pi-1];
      var locked       = !prevComplete;
      var myComplete   = phaseComplete[pi];
      var doneCount    = phase.steps.filter(function(_,si){ return ig_checks[pi] && ig_checks[pi][si]; }).length;
      totalDone  += doneCount;
      totalSteps += phase.steps.length;

      html += '<div style="margin-bottom:14px;opacity:'+(locked?'0.4':'1')+';transition:opacity .3s">';
      // Phase header
      html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;'+
        'background:'+(myComplete?'rgba(34,197,94,0.12)':locked?'var(--panel,#1e293b)':'var(--card,#1e293b)')+';'+
        'border:1px solid '+(myComplete?'#22c55e':locked?'var(--border,#334155)':'var(--border,#334155)')+';'+
        'border-radius:10px;cursor:'+(locked?'default':'pointer')+';" '+
        (locked?'':' onclick="ig_togglePhase('+pi+')"')+' id="ig-ph-hdr-'+pi+'">';
      html += '<span style="font-size:20px">'+phase.icon+'</span>';
      html += '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:'+(locked?'var(--muted,#64748b)':'var(--text,#f1f5f9)')+'">'+phase.title+'</div>';
      html += '<div style="font-size:11px;color:var(--muted,#64748b);margin-top:2px">'+doneCount+' / '+phase.steps.length+' steps</div></div>';
      html += '<span style="font-size:16px">'+(locked?'🔒':myComplete?'✅':'▾')+'</span>';
      html += '</div>';

      // Steps
      html += '<div id="ig-ph-steps-'+pi+'" style="display:'+(locked||(!myComplete&&pi>0&&doneCount===0)?'none':'block')+'">';
      phase.steps.forEach(function(step, si){
        var done = ig_checks[pi] && ig_checks[pi][si];
        html += '<div onclick="'+(locked?'':'ig_toggleStep('+pi+','+si+')')+'" style="'+
          'display:flex;align-items:flex-start;gap:10px;padding:10px 14px;'+
          'background:'+(done?'rgba(34,197,94,0.06)':'transparent')+';'+
          'border-left:3px solid '+(done?'#22c55e':'var(--border,#334155)')+';'+
          'margin-left:8px;cursor:'+(locked?'default':'pointer')+';'+
          'transition:background .2s">';
        html += '<div style="width:20px;height:20px;border-radius:50%;border:2px solid '+
          (done?'#22c55e':'var(--border,#475569)')+';background:'+(done?'#22c55e':'transparent')+
          ';display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">'+
          (done?'<span style="color:#fff;font-size:10px;font-weight:bold">✓</span>':'')+
          '</div>';
        html += '<div style="font-size:12px;line-height:1.6;color:'+(done?'var(--muted,#64748b)':'var(--text,#f1f5f9)')+';'+
          (done?'text-decoration:line-through;':'')+'" >'+(si+1)+'. '+step+'</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';
    });

    // Progress bar
    var pct = totalSteps>0 ? Math.round((totalDone/totalSteps)*100) : 0;
    var progressHtml = '<div style="margin-bottom:16px;">'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">'+
      '<span style="font-size:12px;color:var(--muted,#94a3b8)">Overall Progress</span>'+
      '<span style="font-size:12px;font-weight:700;color:var(--sun,#f59e0b)">'+pct+'% ('+totalDone+'/'+totalSteps+')</span></div>'+
      '<div style="height:8px;background:var(--border,#334155);border-radius:4px;">'+
      '<div style="height:8px;background:'+(pct===100?'#22c55e':'var(--sun,#f59e0b)')+';border-radius:4px;width:'+pct+'%;transition:width .4s"></div>'+
      '</div></div>';

    el.innerHTML = progressHtml + html;
  }

  window.ig_toggleStep = function(pi, si){
    if(!ig_checks[pi]) ig_checks[pi]={};
    ig_checks[pi][si] = !ig_checks[pi][si];
    ig_saveProgress();
    ig_renderChecklist();
  };

  window.ig_togglePhase = function(pi){
    var el = document.getElementById('ig-ph-steps-'+pi);
    if(el) el.style.display = el.style.display==='none'?'block':'none';
  };

  // ── Progress persistence (Supabase) ───────────────────────────────────────
  function ig_progressKey(){
    return 'ig_progress_'+(ig_s ? ig_s.inv.kva+'_'+ig_s.V+'_'+ig_s.panels : 'x');
  }

  function ig_saveProgress(){
    try{
      // Local storage as fallback for offline/quick save
      localStorage.setItem(ig_progressKey(), JSON.stringify(ig_checks));
    }catch(e){}
    // Supabase save (if user logged in)
    try{
      if(typeof supabase !== 'undefined' && typeof egCurrentUser !== 'undefined' && egCurrentUser){
        supabase.from('installer_guide_progress').upsert({
          installer_id: egCurrentUser.id,
          progress_key: ig_progressKey(),
          checks: JSON.stringify(ig_checks),
          updated_at: new Date().toISOString(),
        },{ onConflict:'installer_id,progress_key' });
      }
    }catch(e){}
  }

  function ig_loadProgress(){
    ig_checks = {};
    try{
      var saved = localStorage.getItem(ig_progressKey());
      if(saved) ig_checks = JSON.parse(saved);
    }catch(e){}
    // Supabase load (async — will re-render when loaded)
    try{
      if(typeof supabase !== 'undefined' && typeof egCurrentUser !== 'undefined' && egCurrentUser){
        supabase.from('installer_guide_progress')
          .select('checks')
          .eq('installer_id', egCurrentUser.id)
          .eq('progress_key', ig_progressKey())
          .single()
          .then(function(res){
            if(res.data && res.data.checks){
              ig_checks = JSON.parse(res.data.checks);
              if(ig_tab==='checklist') ig_renderChecklist();
            }
          });
      }
    }catch(e){}
  }

  window.ig_resetProgress = function(){
    if(!confirm('Reset all checklist progress for this system?')) return;
    ig_checks = {};
    ig_saveProgress();
    ig_renderChecklist();
  };

})();
