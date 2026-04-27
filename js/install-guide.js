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
    el.innerHTML = ig_buildSVG(ig_s);
  }

  function ig_buildSVG(s){
    var V        = s.V;
    var kva      = s.inv.kva;
    var strings  = s.strings;
    var pps      = s.pps;
    var panels   = s.panels;
    var bat      = s.opts && s.opts[s.selBat||0];
    var batUnits = bat ? bat.units : 1;
    var batLabel = bat ? bat.label : (V+'V Battery');
    var pvCab    = s.conn.pv.cab.s  + 'mm²';
    var batCab   = s.conn.bat.cab.s + 'mm²';
    var acCab    = s.conn.ac.cab.s  + 'mm²';
    var pvBrk    = s.conn.pv.brk.a  + 'A MCB';
    var batBrk   = s.conn.bat.brk.a + 'A MCCB';
    var acBrk    = s.conn.ac.brk.a  + 'A MCB';
    var dcSpd    = s.spd ? s.spd.dc.uc+'V DC SPD' : 'DC SPD';
    var acSpd    = s.spd ? s.spd.ac.uc+'V AC SPD' : 'AC SPD';
    var showCombiner = (V===48 && strings > 4);

    // ── SVG canvas ────────────────────────────────────────────────────────
    var W = 360, H = 820;
    var svg = ['<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg"',
      ' style="width:100%;max-width:480px;display:block;margin:0 auto;font-family:sans-serif;background:#0f172a;border-radius:12px;">'].join('');

    // ── Colour palette ────────────────────────────────────────────────────
    var COL = {
      panel:'#f59e0b', panelFill:'#1c1505',
      inv:'#0ea5e9',   invFill:'#031623',
      bat:'#22c55e',   batFill:'#031a0a',
      ac:'#a78bfa',    acFill:'#160d2a',
      wire:'#64748b',  pvWire:'#f59e0b', batWire:'#22c55e', acWire:'#a78bfa',
      spd:'#f43f5e',   earth:'#84cc16',
      text:'#f1f5f9',  muted:'#64748b', label:'#cbd5e1',
      brk:'#fb923c',   combiner:'#38bdf8',
    };

    var out = [svg];
    function rect(x,y,w,h,fill,stroke,r){ out.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(r||6)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.5"/>'); }
    function line(x1,y1,x2,y2,col,sw,dash){ out.push('<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" stroke-width="'+(sw||2)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+' stroke-linecap="round"/>'); }
    function text(x,y,t,col,sz,anch,bold){ out.push('<text x="'+x+'" y="'+y+'" fill="'+(col||COL.text)+'" font-size="'+(sz||10)+'" text-anchor="'+(anch||'middle')+'"'+(bold?' font-weight="bold"':'')+'>'+t+'</text>'); }
    function badge(x,y,t,fill,tcol,w){ var bw=w||t.length*6+12; out.push('<rect x="'+(x-bw/2)+'" y="'+(y-9)+'" width="'+bw+'" height="16" rx="4" fill="'+fill+'"/>'); out.push('<text x="'+x+'" y="'+(y+3)+'" fill="'+(tcol||'#fff')+'" font-size="8" text-anchor="middle" font-weight="bold">'+t+'</text>'); }

    // ── ZONE A: PV Array (top) ─────────────────────────────────────────────
    var pvY = 20;
    text(W/2, pvY+8, '☀  PV ARRAY — '+panels+' × 550W  ('+strings+' strings × '+pps+' panels)', COL.panel, 9, 'middle', true);

    var maxShow   = Math.min(strings, 5);
    var strSpacig = Math.min(60, (W-40)/Math.max(maxShow,1));
    var strStartX = W/2 - (maxShow-1)*strSpacig/2;
    var panelH    = 28, panelW = 38;
    var strBottomY = pvY + 70;

    for(var si=0; si<maxShow; si++){
      var sx = strStartX + si*strSpacig;
      rect(sx-panelW/2, pvY+18, panelW, panelH, COL.panelFill, COL.panel, 4);
      text(sx, pvY+18+panelH/2+4, pps+'P', COL.panel, 8);
      if(si===0) text(sx-panelW/2-2, pvY+18+panelH/2+4, '+', '#ef4444', 9, 'end');
      if(si===0) text(sx+panelW/2+2, pvY+18+panelH/2+4, '−', '#3b82f6', 9, 'start');
      // string wire down
      line(sx, pvY+18+panelH, sx, strBottomY, COL.pvWire, 1.5);
    }
    if(strings > 5){
      text(strStartX+(maxShow-0.5)*strSpacig, pvY+34, '+'+( strings-5)+' more', COL.muted, 8);
    }

    // String label
    badge(W/2, strBottomY-4, pvCab, COL.pvWire, '#0f172a');

    // ── ZONE B: Combiner or direct to SPD ─────────────────────────────────
    var combY = strBottomY + 20;
    var invCentreX = W/2;

    if(showCombiner){
      var cw=100, ch=28;
      rect(invCentreX-cw/2, combY, cw, ch, COL.invFill, COL.combiner, 6);
      text(invCentreX, combY+ch/2+4, '⊕ String Combiner Box', COL.combiner, 8);
      // merge wires into combiner
      for(var si2=0; si2<maxShow; si2++){
        var sx2 = strStartX + si2*strSpacig;
        line(sx2, strBottomY, sx2, combY+5, COL.pvWire, 1.2);
        line(sx2, combY+5, invCentreX, combY+5, COL.pvWire, 1.2);
      }
      combY = combY + ch;
    } else {
      // merge all strings to centre line
      for(var si3=0; si3<maxShow; si3++){
        var sx3 = strStartX + si3*strSpacig;
        line(sx3, strBottomY, sx3, combY-5, COL.pvWire, 1.2);
        line(sx3, combY-5, invCentreX, combY-5, COL.pvWire, 1.2);
      }
      line(invCentreX, combY-5, invCentreX, combY, COL.pvWire, 1.5);
    }

    // ── DC SPD ────────────────────────────────────────────────────────────
    var spdY = combY + 14;
    var spdW = 80;
    rect(invCentreX-spdW/2, spdY, spdW, 22, '#2d0a14', COL.spd, 5);
    text(invCentreX, spdY+14, '⚡ '+dcSpd, COL.spd, 8);
    line(invCentreX, combY+4, invCentreX, spdY, COL.pvWire, 1.5);
    // earth line from SPD
    line(invCentreX+spdW/2, spdY+11, invCentreX+spdW/2+20, spdY+11, COL.earth, 1.2, '3,2');
    text(invCentreX+spdW/2+28, spdY+14, '⏚', COL.earth, 9);

    // ── PV MCB ────────────────────────────────────────────────────────────
    var mcbY = spdY + 32;
    var mcbW = 60, mcbH = 20;
    rect(invCentreX-mcbW/2, mcbY, mcbW, mcbH, '#1a0f00', COL.brk, 5);
    text(invCentreX, mcbY+mcbH/2+4, pvBrk+' DC', COL.brk, 8);
    line(invCentreX, spdY+22, invCentreX, mcbY, COL.pvWire, 1.5);

    // ── INVERTER ──────────────────────────────────────────────────────────
    var invY  = mcbY + 30;
    var invW  = 130, invH = 60;
    var invX  = invCentreX - invW/2;
    rect(invX, invY, invW, invH, COL.invFill, COL.inv, 8);
    text(invCentreX, invY+16, '⚙ HYBRID INVERTER', COL.inv, 8, 'middle', true);
    text(invCentreX, invY+30, kva+'kVA @ '+V+'V', COL.text, 11, 'middle', true);
    text(invCentreX, invY+46, 'MPPT Solar Charger', COL.muted, 8);
    // PV wire into inverter top
    line(invCentreX, mcbY+mcbH, invCentreX, invY, COL.pvWire, 1.5);

    // ── BATTERY BANK (right of inverter) ──────────────────────────────────
    var batX    = invX + invW + 28;
    var batY    = invY - 10;
    var batW    = 90, batH = 40;
    var batUnitsShow = Math.min(batUnits, 3);
    var batStackOff  = 7;

    for(var bi=batUnitsShow-1; bi>=0; bi--){
      rect(batX+bi*batStackOff, batY+bi*batStackOff, batW, batH, COL.batFill, COL.bat, 6);
    }
    text(batX+batW/2+(batUnitsShow-1)*batStackOff/2, batY+(batUnitsShow-1)*batStackOff+batH/2+4,
      batLabel.replace('LiFePO4','LFP').replace(' Pack','').substring(0,14), COL.bat, 8);
    if(batUnits>1) badge(batX+batW/2+(batUnitsShow-1)*batStackOff/2, batY-4, batUnits+'× parallel', COL.bat, '#0f172a', 70);

    // MCCB battery breaker
    var bmcbX = batX - 2, bmcbY = invY + invH/2 - 10, bmcbW = 22, bmcbH = 20;
    // wire from battery to MCCB to inverter
    line(batX, batY+batH/2+(batUnitsShow-1)*batStackOff/2, bmcbX+bmcbW, batY+batH/2+(batUnitsShow-1)*batStackOff/2, COL.batWire, 1.5);
    line(bmcbX+bmcbW, batY+batH/2+(batUnitsShow-1)*batStackOff/2, bmcbX+bmcbW, bmcbY+bmcbH/2, COL.batWire, 1.5);
    rect(bmcbX, bmcbY, bmcbW, bmcbH, '#1a0f00', COL.brk, 4);
    text(bmcbX+bmcbW/2, bmcbY+bmcbH/2+3, '🔲', COL.brk, 7);
    line(bmcbX, bmcbY+bmcbH/2, invX+invW, bmcbY+bmcbH/2, COL.batWire, 1.5);
    // cable labels
    badge(batX+batW/2+(batUnitsShow-1)*batStackOff/2, batY+batH+(batUnitsShow-1)*batStackOff+8, batCab, COL.batWire, '#0f172a');
    badge(bmcbX-22, bmcbY+bmcbH/2-6, batBrk, COL.brk, '#0f172a', 60);

    // ── AC OUTPUT (below inverter) ─────────────────────────────────────────
    var acTopY  = invY + invH;
    var acSpdY  = acTopY + 16;
    var coY     = acSpdY + 36;
    var loadY   = coY + 44;

    // AC SPD
    var aspdW = 80;
    rect(invCentreX-aspdW/2, acSpdY, aspdW, 22, '#2d0a14', COL.spd, 5);
    text(invCentreX, acSpdY+14, '⚡ '+acSpd, COL.spd, 8);
    line(invCentreX, acTopY, invCentreX, acSpdY, COL.acWire, 1.5);
    line(invCentreX-aspdW/2, acSpdY+11, invCentreX-aspdW/2-16, acSpdY+11, COL.earth, 1.2, '3,2');
    text(invCentreX-aspdW/2-24, acSpdY+14, '⏚', COL.earth, 9);

    // AC MCB
    var acMcbW=60, acMcbH=20;
    rect(invCentreX-acMcbW/2, acSpdY+26, acMcbW, acMcbH, '#1a0f00', COL.brk, 5);
    text(invCentreX, acSpdY+26+acMcbH/2+4, acBrk, COL.brk, 8);
    line(invCentreX, acSpdY+22, invCentreX, acSpdY+26, COL.acWire, 1.5);

    // Changeover switch
    var coW=110, coH=32;
    rect(invCentreX-coW/2, coY, coW, coH, COL.acFill, COL.ac, 6);
    text(invCentreX, coY+coH/2+4, '⇌ Changeover Switch', COL.ac, 9);
    line(invCentreX, acSpdY+26+acMcbH, invCentreX, coY, COL.acWire, 1.5);

    // Grid input (left of changeover)
    var gridX = invCentreX - coW/2 - 12;
    line(gridX, coY+coH/2, invCentreX-coW/2, coY+coH/2, COL.acWire, 1.5, '4,3');
    text(gridX-2, coY+coH/2-6, 'GRID', COL.muted, 8, 'end');
    text(gridX-2, coY+coH/2+8, 'INPUT', COL.muted, 8, 'end');

    // Load output
    var loadW=90, loadH=28;
    rect(invCentreX-loadW/2, loadY, loadW, loadH, '#0d1117', COL.ac, 6);
    text(invCentreX, loadY+loadH/2+4, '⚡ LOAD', COL.ac, 10, 'middle', true);
    line(invCentreX, coY+coH, invCentreX, loadY, COL.acWire, 1.5);
    badge(invCentreX, loadY-6, acCab, COL.acWire, '#0f172a');

    // ── EARTHING (bottom left) ─────────────────────────────────────────────
    var earthX = 28, earthY = loadY + 12;
    var earthRods = s.earth ? s.earth.rods : (kva<=5?1:kva<=15?2:3);
    text(earthX, earthY-4, '⏚ EARTHING', COL.earth, 8, 'start', true);
    for(var ri=0; ri<Math.min(earthRods,3); ri++){
      var ex = earthX + ri*18;
      line(ex+6, earthY+2, ex+6, earthY+28, COL.earth, 2);
      line(ex+2, earthY+28, ex+10, earthY+28, COL.earth, 2);
      line(ex+3, earthY+32, ex+9,  earthY+32, COL.earth, 1.5);
      line(ex+4, earthY+36, ex+8,  earthY+36, COL.earth, 1);
    }
    if(earthRods>3) text(earthX+60, earthY+20, '+'+( earthRods-3)+' more', COL.muted, 8, 'start');
    text(earthX, earthY+48, earthRods+' × 3m rod'+(earthRods>1?'s':''), COL.earth, 8, 'start');
    // earth line from inverter bottom-left
    line(invX, invY+invH/2, earthX+16, invY+invH/2, COL.earth, 1, '3,2');
    line(earthX+16, invY+invH/2, earthX+16, earthY+2, COL.earth, 1, '3,2');

    // ── LEGEND ────────────────────────────────────────────────────────────
    var legY = earthY + 58;
    text(8, legY, 'LEGEND', COL.muted, 7, 'start');
    [[COL.pvWire,'DC PV'],[COL.batWire,'DC Battery'],[COL.acWire,'AC Output'],[COL.earth,'Earth (PE)']].forEach(function(l,i){
      var lx=8+i*88;
      line(lx, legY+10, lx+18, legY+10, l[0], 2);
      text(lx+22, legY+13, l[1], COL.muted, 7, 'start');
    });

    out.push('</svg>');
    return out.join('\n');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LAYER 2 — SEQUENTIAL INSTALLATION CHECKLIST
  // ════════════════════════════════════════════════════════════════════════════

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
