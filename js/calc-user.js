  // ── APPLIANCE DATABASE ───────────────────────────────────────────────────
  let l4u_appliances = [];

  const l4u_default_hours_by_category = {
    lighting:6,electronics:6,fan:8,fridge:24,freezer:24,
    kitchen:1,heating:1,laundry:1,pump:1,air_conditioner:6,business:2
  };

  const l4u_default_appliances = [
    {name:'LED Bulb',           watts:15,  category:'lighting',       emoji:'💡',inductive:false,dutyCycle:null},
    {name:'Energy Bulb',        watts:18,  category:'lighting',       emoji:'💡',inductive:false,dutyCycle:null},
    {name:'Tube Light',         watts:40,  category:'lighting',       emoji:'💡',inductive:false,dutyCycle:null},
    {name:'TV 32 inch',         watts:60,  category:'electronics',    emoji:'📺',inductive:false,dutyCycle:null},
    {name:'TV 43 inch',         watts:90,  category:'electronics',    emoji:'📺',inductive:false,dutyCycle:null},
    {name:'TV 55 inch',         watts:120, category:'electronics',    emoji:'📺',inductive:false,dutyCycle:null},
    {name:'Decoder',            watts:25,  category:'electronics',    emoji:'📡',inductive:false,dutyCycle:null},
    {name:'WiFi Router',        watts:15,  category:'electronics',    emoji:'📶',inductive:false,dutyCycle:null},
    {name:'Laptop',             watts:65,  category:'electronics',    emoji:'💻',inductive:false,dutyCycle:null},
    {name:'Desktop Computer',   watts:200, category:'electronics',    emoji:'🖥️',inductive:false,dutyCycle:null},
    {name:'Printer',            watts:100, category:'electronics',    emoji:'🖨️',inductive:false,dutyCycle:null},
    {name:'Phone Charger',      watts:10,  category:'electronics',    emoji:'🔌',inductive:false,dutyCycle:null},
    {name:'Standing Fan',       watts:65,  category:'fan',            emoji:'🌀',inductive:false,dutyCycle:null},
    {name:'Ceiling Fan',        watts:75,  category:'fan',            emoji:'🌀',inductive:false,dutyCycle:null},
    {name:'Table Fan',          watts:45,  category:'fan',            emoji:'🌀',inductive:false,dutyCycle:null},
    {name:'Mini Fridge',        watts:100, category:'fridge',         emoji:'🧊',inductive:true, dutyCycle:0.35},
    {name:'Single Door Fridge', watts:150, category:'fridge',         emoji:'🧊',inductive:true, dutyCycle:0.50},
    {name:'Double Door Fridge', watts:200, category:'fridge',         emoji:'🧊',inductive:true, dutyCycle:0.50},
    {name:'Chest Freezer',      watts:180, category:'freezer',        emoji:'❄️',inductive:true, dutyCycle:0.60},
    {name:'Large Freezer',      watts:250, category:'freezer',        emoji:'❄️',inductive:true, dutyCycle:0.60},
    {name:'Display Freezer',    watts:350, category:'freezer',        emoji:'❄️',inductive:true, dutyCycle:0.60},
    {name:'Blender',            watts:300, category:'kitchen',        emoji:'🥤',inductive:false,dutyCycle:null},
    {name:'Microwave',          watts:1200,category:'kitchen',        emoji:'🍽️',inductive:false,dutyCycle:null},
    {name:'Electric Kettle',    watts:1500,category:'kitchen',        emoji:'☕',inductive:false,dutyCycle:null},
    {name:'Pressing Iron',      watts:1000,category:'heating',        emoji:'🧺',inductive:false,dutyCycle:null},
    {name:'Washing Machine',    watts:500, category:'laundry',        emoji:'🫧',inductive:true, dutyCycle:null},
    {name:'Water Pump',         watts:750, category:'pump',           emoji:'🚰',inductive:true, dutyCycle:null},
    {name:'Borehole Pump',      watts:1500,category:'pump',           emoji:'🚿',inductive:true, dutyCycle:null},
    {name:'1HP AC',             watts:900, category:'air_conditioner',emoji:'❄️',inductive:true, dutyCycle:null},
    {name:'1.5HP AC',           watts:1200,category:'air_conditioner',emoji:'❄️',inductive:true, dutyCycle:null},
    {name:'2HP AC',             watts:1800,category:'air_conditioner',emoji:'❄️',inductive:true, dutyCycle:null},
    {name:'Sachet Water Sealer',watts:500, category:'business',       emoji:'🏪',inductive:false,dutyCycle:null},
  ];

  // ── DATABASES ────────────────────────────────────────────────────────────
  const l4u_INVERTER_DB = [
    {kva:1,   v:12,maxPvW:1200, mpptMin:30, mpptMax:115,maxPvA:20 },
    {kva:1.5, v:12,maxPvW:2000, mpptMin:30, mpptMax:115,maxPvA:25 },
    {kva:2,   v:24,maxPvW:2500, mpptMin:60, mpptMax:145,maxPvA:25 },
    {kva:2.5, v:24,maxPvW:3000, mpptMin:60, mpptMax:145,maxPvA:25 },
    {kva:3,   v:24,maxPvW:3500, mpptMin:60, mpptMax:145,maxPvA:30 },
    {kva:3.5, v:24,maxPvW:4000, mpptMin:60, mpptMax:145,maxPvA:30 },
    {kva:5,   v:48,maxPvW:6500, mpptMin:120,mpptMax:430,maxPvA:50 },
    {kva:7.5, v:48,maxPvW:9000, mpptMin:120,mpptMax:450,maxPvA:80 },
    {kva:10,  v:48,maxPvW:12000,mpptMin:150,mpptMax:450,maxPvA:100},
    {kva:12,  v:48,maxPvW:15000,mpptMin:150,mpptMax:500,maxPvA:120},
    {kva:15,  v:48,maxPvW:18000,mpptMin:150,mpptMax:500,maxPvA:150},
    {kva:20,  v:48,maxPvW:25000,mpptMin:150,mpptMax:550,maxPvA:180},
  ];

  const l4u_BATTERY_DB = {
    12:[{label:'12V 100Ah LiFePO4',ah:100,kwh:1.28},{label:'12V 200Ah LiFePO4',ah:200,kwh:2.56}],
    24:[{label:'24V 2.5kWh Pack',kwh:2.5},{label:'24V 3.0kWh Pack',kwh:3.0},{label:'24V 3.5kWh Pack',kwh:3.5}],
    48:[{label:'48V 5kWh Pack',kwh:5.0},{label:'48V 7.5kWh Pack',kwh:7.5},{label:'48V 9.6kWh Pack',kwh:9.6},
        {label:'48V 10kWh Pack',kwh:10.0},{label:'48V 15kWh Pack',kwh:15.0},{label:'48V 17.5kWh Pack',kwh:17.5},{label:'48V 20kWh Pack',kwh:20.0}],
  };

  const l4u_PANEL = {wattage:550,vmp:41.8,imp:12.2};

  const l4u_PC = {
    inv:[
      {kva:1,v:12,p:180000},{kva:1.5,v:12,p:260000},{kva:2,v:24,p:320000},{kva:2.5,v:24,p:390000},
      {kva:3,v:24,p:450000},{kva:3.5,v:24,p:520000},{kva:5,v:48,p:580000},{kva:7.5,v:48,p:850000},
      {kva:10,v:48,p:1350000},{kva:12,v:48,p:1750000},{kva:15,v:48,p:2300000},{kva:20,v:48,p:3200000},
    ],
    bat:{
      12:[{kwh:1.28,p:230000},{kwh:2.56,p:390000}],
      24:[{kwh:2.5,p:480000},{kwh:3.0,p:570000},{kwh:3.5,p:650000}],
      48:[{kwh:5.0,p:1050000},{kwh:7.5,p:1400000},{kwh:9.6,p:1750000},{kwh:10.0,p:1850000},{kwh:15.0,p:2700000},{kwh:17.5,p:3100000},{kwh:20.0,p:3600000}],
    },
    panel:130000,
    dcCab:[{s:2.5,a:22,p:1300},{s:4,a:30,p:2800},{s:6,a:40,p:3500},{s:10,a:54,p:6000},{s:16,a:73,p:7800},{s:25,a:95,p:11000},{s:35,a:117,p:13000},{s:50,a:141,p:16000},{s:70,a:179,p:22000},{s:95,a:215,p:30000},{s:120,a:249,p:38000},{s:150,a:285,p:48000}],
    acCab:[{s:2.5,a:20,p:1800},{s:4,a:27,p:2800},{s:6,a:35,p:3500},{s:10,a:48,p:6000},{s:16,a:65,p:7800},{s:25,a:84,p:11000},{s:35,a:103,p:13000},{s:50,a:125,p:16000}],
    dcMcb: [{a:6,p:3500},{a:10,p:3500},{a:16,p:3500},{a:20,p:3500},{a:25,p:3800},{a:32,p:4000},{a:40,p:4500},{a:50,p:5500},{a:63,p:6500}],
    dcMccb:[{a:63,p:18000},{a:80,p:22000},{a:100,p:27000},{a:125,p:32000},{a:140,p:38000},{a:160,p:44000},{a:200,p:58000},{a:250,p:75000},{a:300,p:95000},{a:400,p:130000}],
    acMcb: [{a:6,p:2500},{a:10,p:2500},{a:16,p:2500},{a:20,p:2500},{a:25,p:2800},{a:32,p:3000},{a:40,p:3500},{a:50,p:4000},{a:63,p:5000},{a:80,p:7500},{a:100,p:9500}],
    dcSpd:[{uc:75,p:8500},{uc:150,p:12000},{uc:250,p:15000},{uc:500,p:22000}],
    acSpd:{uc:275,p:12000},
    earthRod:{p:8500}, earthCond:{p:3500}, earthPit:{p:3500},
    soil:[
      {id:'wet',   label:'Wet / Clay / Swampy', rho:50,  note:'Lagos coastal, Niger Delta, Port Harcourt'},
      {id:'loam',  label:'Loam / Mixed',         rho:100, note:'Most urban Nigeria'},
      {id:'sandy', label:'Sandy / Laterite',     rho:300, note:'Abuja, North Central'},
      {id:'rocky', label:'Rocky / Dry Sandy',    rho:600, note:'Northern Nigeria, Jos Plateau'},
    ],
  };

  // ── HELPERS ──────────────────────────────────────────────────────────────
  function l4u__cab(d,t,floor){var c=t.find(x=>x.a>=d)||t[t.length-1];return(floor&&c.s<6)?t.find(x=>x.s===6):c;}
  function l4u__brk(d,t){return t.find(x=>x.a>=d)||t[t.length-1];}
  function l4u__invP(k,v){var m=l4u_PC.inv.find(i=>i.kva===k&&i.v===v);return m?m.p:0;}
  function l4u__batP(v,k){var f=l4u_PC.bat[v]||[];var m=f.find(b=>b.kwh===k);return m?m.p:0;}
  function l4u__fmt(n){return '₦'+Number(n).toLocaleString('en-NG');}

  function l4u__calcSPD(pps){
    var stringVoc=pps*41.8*1.2, minUc=stringVoc*1.1;
    var dcSpd=l4u_PC.dcSpd.find(function(s){return s.uc>=minUc;})||l4u_PC.dcSpd[l4u_PC.dcSpd.length-1];
    return {dc:{uc:dcSpd.uc,p:dcSpd.p},ac:{uc:l4u_PC.acSpd.uc,p:l4u_PC.acSpd.p}};
  }
  var l4u__ROD_L=3.0,l4u__ROD_D=0.016,l4u__LAMBDA={1:1.0,2:1.16,3:1.29,4:1.36};
  function l4u__calcEarth(soilId,acCabS,kva){
    var soil=l4u_PC.soil.find(function(s){return s.id===soilId;})||l4u_PC.soil[1];
    var rho=soil.rho,n=kva<=5?1:kva<=15?2:3;
    var r1=(rho/(2*Math.PI*l4u__ROD_L))*(Math.log((8*l4u__ROD_L)/l4u__ROD_D)-1);
    var rn=+((r1*(l4u__LAMBDA[n]||1.36))/n).toFixed(2);
    var condS=acCabS<=16?acCabS:Math.max(16,Math.ceil(acCabS/2));
    return {soil:soil.label,rho:rho,rods:n,rn:rn,warn:rn>5.0,condS:condS,condRun:5,
      rodCost:n*l4u_PC.earthRod.p,condCost:n*5*l4u_PC.earthCond.p,pitCost:n*l4u_PC.earthPit.p,
      total:n*l4u_PC.earthRod.p+n*5*l4u_PC.earthCond.p+n*l4u_PC.earthPit.p};
  }

  // ── ENGINE ───────────────────────────────────────────────────────────────
  var l4u__egS=null;

  function l4u__runEngine(apps){
    // Step 1 — Load
    var tw=0,dw=0,ws={load:0,surge:0};
    apps.forEach(function(a){
      var load=a.watts*a.qty; tw+=load;
      dw+=load*(a.dutyCycle?24*a.dutyCycle:a.hours);
      if(a.inductive){var s=load*3;if(s>ws.surge)ws={load:load,surge:s};}
    });
    var surge=(tw-ws.load)+ws.surge;

    // Step 2 — Inverter
    var reqKva=Math.max((tw*1.25)/800, surge/1600);
    var inv=l4u_INVERTER_DB.find(i=>i.kva>=reqKva)||l4u_INVERTER_DB[l4u_INVERTER_DB.length-1];
    var fpV=inv.v, acA=(inv.kva*1000)/230;

    // Step 3 — Battery + voltage conflict
    var DOD=0.8,EFF=0.85,V=fpV;
    var rawAh=dw/(V*DOD*EFF);
    var reqV=rawAh<=200?12:rawAh<=400?24:48;
    var conflict=reqV>V;
    if(conflict){
      V=reqV;
      inv=l4u_INVERTER_DB.find(i=>i.v===V&&i.kva>=reqKva)||l4u_INVERTER_DB.filter(i=>i.v===V).pop();
      rawAh=dw/(V*DOD*EFF); acA=(inv.kva*1000)/230;
    }
    var reqKwh=rawAh*V/1000;
    var fam=l4u_BATTERY_DB[V],opts=[];
    if(V===12){
      // Fewest units first — 1x200Ah beats 2x100Ah when rawAh <= 200
      var wu12=fam.map(function(m){return {label:m.label,ah:m.ah,kwh:m.kwh,units:Math.ceil(rawAh/m.ah)};});
      wu12.sort(function(a,b){return a.units-b.units||a.ah-b.ah;});
      var oA12=wu12[0],oB12=wu12.find(function(m){return m.units>oA12.units||(m.units===oA12.units&&m.ah>oA12.ah);});
      [oA12,oB12].filter(Boolean).forEach(function(m){var u=m.units,pe=l4u__batP(12,m.kwh);
        opts.push({label:m.label,units:u,totalKwh:+(u*m.kwh).toFixed(2),wiring:u+' unit'+(u>1?'s':'')+' in parallel',warn:u>4?'Exceeds 4-string limit':null,pe:pe,total:u*pe});});
    } else {
      // Sort by fewest units first, then smallest kWh — so 1x7.5kWh beats 2x5kWh
      var wu=fam.map(function(p){return {label:p.label,kwh:p.kwh,units:Math.ceil(reqKwh/p.kwh)};});
      wu.sort(function(a,b){return a.units-b.units||a.kwh-b.kwh;});
      var oA=wu[0], oB=wu.find(function(p){return p.units>oA.units||(p.units===oA.units&&p.kwh>oA.kwh);});
      [oA,oB].filter(Boolean).forEach(function(p){
        var pe=l4u__batP(V,p.kwh);
        opts.push({label:p.label,units:p.units,totalKwh:+(p.units*p.kwh).toFixed(2),wiring:p.units+' pack'+(p.units>1?'s':'')+' in parallel',warn:p.units>4?'Exceeds 4-string limit':null,pe:pe,total:p.units*pe});});
    }

    // Step 4 — Panels
    var PSH=5,LOSS=1.3,PR=0.75,PW=l4u_PANEL.wattage,Vmp=l4u_PANEL.vmp,Imp=l4u_PANEL.imp;
    var reqWA=(dw*LOSS)/PSH, panelCountA=Math.ceil(reqWA/PW);
    if((panelCountA*PW*PSH*PR)/1000<dw/1000)panelCountA++;
    // Option B: load + recharge battery from empty in 1 day
    // Uses Option A battery (opts[0]) totalKwh always
    var bat0Kwh=(opts[0]||{}).totalKwh||0;
    var fullRechargeWh=dw+(bat0Kwh*1000*0.80);
    var reqWB=fullRechargeWh/(PSH*PR), panelCountB=Math.ceil(reqWB/PW);
    var reqW=reqWA, panels=panelCountA;
    var pps=V===12?1:V===24?2:4;
    var strings=Math.ceil(panels/pps);

    // Step 5 — Cables
    var pvOp=strings*Imp, pvD=pvOp*1.25;
    var bOp=(inv.kva*1000)/V, bD=bOp*1.25;
    var aD=acA*1.25;
    var conn={
      pv:  {op:+pvOp.toFixed(1),d:+pvD.toFixed(1),cab:l4u__cab(pvD,l4u_PC.dcCab,true), brk:l4u__brk(Math.max(pvD,16), l4u_PC.dcMcb)},
      bat: {op:+bOp.toFixed(1), d:+bD.toFixed(1), cab:l4u__cab(bD, l4u_PC.dcCab,true), brk:l4u__brk(Math.max(bD,63),  l4u_PC.dcMccb)},
      ac:  {op:+acA.toFixed(1), d:+aD.toFixed(1), cab:l4u__cab(aD, l4u_PC.acCab,false),brk:l4u__brk(Math.max(aD,16),  l4u_PC.acMcb)},
    };
    // Parallel battery string override
    if (typeof egBattParallel === 'function') {
      var _bp = egBattParallel(bOp);
      if (_bp.numStrings > 1) {
        var _bpCab = l4u_PC.dcCab.find(function(c){return c.s===_bp.cableSize;})||l4u_PC.dcCab[l4u_PC.dcCab.length-1];
        var _bpBrk = l4u_PC.dcMccb.find(function(b){return b.a===_bp.breakerPerString;})||l4u_PC.dcMccb[l4u_PC.dcMccb.length-1];
        conn.bat.cab = _bpCab;
        conn.bat.brk = _bpBrk;
        conn.bat.numStrings = _bp.numStrings;
      }
    }

    return {
      apps:apps, tw:tw, dw:dw, surge:surge,
      inv:inv, fpV:fpV, V:V, acA:acA, conflict:conflict, reqKva:reqKva,
      rawAh:rawAh, reqKwh:reqKwh, opts:opts, selBat:0,
      reqW:+reqW.toFixed(0), reqWA:+reqWA.toFixed(0), reqWB:+reqWB.toFixed(0),
      panels:panels, panelCountA:panelCountA, panelCountB:panelCountB, activePanelMode:'A', arrW:panels*PW,
      pps:pps, strings:strings, PSH:PSH, PR:PR,
      pvV:+(pps*Vmp).toFixed(1), pvA:+(strings*Imp).toFixed(1),
      expand:(strings*pps)-panels, gen:+((panels*PW*PSH*PR)/1000).toFixed(2),
      conn:conn, bom:[], total:0,
      spd:l4u__calcSPD(pps),
      earth:null,
    };
  }

  // ── BUDGET RANGE ─────────────────────────────────────────────────────────
  var l4u__RANGE_F = {
    inverter: {lo:0.75, hi:1.40},
    battery:  {lo:0.85, hi:1.30},
    panel:    {lo:0.90, hi:1.20},
    cable:    {lo:0.90, hi:1.15},
    breaker:  {lo:0.90, hi:1.15},
    spd:      {lo:0.90, hi:1.10},
    earth:    {lo:0.90, hi:1.10},
  };
  function l4u__calcBudgetRange(s, bi) {
    var b = s.opts[bi] || s.opts[0] || {};
    var invRef  = l4u__invP(s.inv.kva, s.V);
    var batRef  = (b.pe || 0) * (b.units || 1);
    var panRef  = s.panels * l4u_PC.panel;
    var _bNS    = s.conn.bat.numStrings || 1;
    var cabRef  = 20*s.conn.pv.cab.p + 2*_bNS*s.conn.bat.cab.p + 20*s.conn.ac.cab.p;
    var brkRef  = s.conn.pv.brk.p + _bNS*s.conn.bat.brk.p + 2*s.conn.ac.brk.p;
    var spdRef  = s.spd ? (s.spd.dc.p + s.spd.ac.p) : 0;
    var earRef  = s.earth ? s.earth.total : 0;
    var F = l4u__RANGE_F;
    var lo = invRef*F.inverter.lo + batRef*F.battery.lo + panRef*F.panel.lo
           + cabRef*F.cable.lo + brkRef*F.breaker.lo + spdRef*F.spd.lo + earRef*F.earth.lo;
    var hi = invRef*F.inverter.hi + batRef*F.battery.hi + panRef*F.panel.hi
           + cabRef*F.cable.hi + brkRef*F.breaker.hi + spdRef*F.spd.hi + earRef*F.earth.hi;
    return {min: Math.round(lo/1000)*1000, max: Math.round(hi/1000)*1000};
  }

  function l4u__buildBOM(s,bi){
    var bom=[];
    function add(item,spec,qty){bom.push({item:item,spec:spec,qty:qty});}
    add('Inverter',s.inv.kva+'kVA Hybrid MPPT @ '+s.V+'V',1);
    var b=s.opts[bi];if(b)add('Battery',b.label,b.units);
    add('Solar Panel',l4u_PANEL.wattage+'W Mono PERC',s.panels);
    add('PV Cable DC',s.conn.pv.cab.s+'mm² DC ~20m',20);
    var _bNS=s.conn.bat.numStrings||1;
    var _bCabLabel=_bNS>1?(_bNS+'× '+s.conn.bat.cab.s+'mm² DC (parallel run)'):s.conn.bat.cab.s+'mm² DC ~2m';
    add('Battery Cable DC',_bCabLabel,2*_bNS);
    add('AC Cable',s.conn.ac.cab.s+'mm² AC ~20m',20);
    add('DC MCB PV',s.conn.pv.brk.a+'A DC MCB',1);
    var _bBrkLabel=_bNS>1?(_bNS+'× '+s.conn.bat.brk.a+'A DC MCCB (one per string)'):s.conn.bat.brk.a+'A DC MCCB';
    add('DC MCCB Battery',_bBrkLabel,_bNS);
    add('AC MCB Changeover',s.conn.ac.brk.a+'A AC MCB',1);
    add('AC MCB Grid',s.conn.ac.brk.a+'A AC MCB',1);
    if(s.spd){
      add('DC SPD (PV Side)',s.spd.dc.uc+'V DC Type 2 SPD',1);
      add('AC SPD (Output)',s.spd.ac.uc+'V AC Type 2 SPD',1);
    }
    if(s.earth){
      add('Earthing Rod','3m × 16mm Copper-Bonded Rod',s.earth.rods);
      add('Earthing Conductor',s.earth.condS+'mm² Bare Copper ~5m/rod',s.earth.rods*5);
      add('Earth Pit Cover','PVC Earth Pit Cover',s.earth.rods);
    }
    s.bom=bom;
    s.total=0;
    return s;
  }

  function l4u__renderResults(s){
    function set(id,v){var el=document.getElementById(id);if(el)el.textContent=v;}
    function styleToggle(btn,active){
      if(!btn)return;
      btn.style.background=active?'var(--sun)':'var(--panel)';
      btn.style.borderColor=active?'var(--sun)':'var(--border)';
      btn.style.color=active?'#fff':'var(--text)';
      btn.style.boxShadow=active?'0 6px 18px rgba(0,0,0,0.08)':'none';
    }
    var N=n=>Number(n).toLocaleString('en-NG');
    l4u__applyPanelMode(s,'B');
    var b0=s.opts[s.selBat||0]||s.opts[0]||{};
    // Simple cards
    set('l4u-s-inverter-kva',s.inv.kva+' kVA');
    set('l4u-s-inverter-model','Hybrid MPPT Inverter');
    set('l4u-s-inverter-voltage','Recommended size for your load');
    set('l4u-s-panels-count',s.panels+' panels');
    set('l4u-s-panels-size',l4u_PANEL.wattage+'W Mono PERC');
    set('l4u-s-panels-total',N(s.arrW)+'W Array');
    set('l4u-s-battery-main',(b0.units||'-')+' x '+(b0.label||'-'));
    set('l4u-s-battery-config',(b0.label||'-'));
    set('l4u-s-battery-alt',(b0.totalKwh||'-')+' kWh total');
    set('l4u-s-panels-mode','Full Recharge • '+N(s.reqWActive||s.reqW)+'W required');
    // Load
    set('l4u-r-watts',N(s.tw)); set('l4u-r-kwh',(s.dw/1000).toFixed(2)); set('l4u-r-surge',N(Math.round(s.surge)));
    // Inverter
    set('l4u-r-voltage',s.V); set('l4u-r-kva',s.inv.kva);
    set('l4u-r-inv-model',s.inv.kva+'kVA @ '+s.V+'V'); set('l4u-r-ac-amps',s.acA.toFixed(1));
    // Conflict badge
    var badge=document.getElementById('l4u-r-conflict-badge'),ct=document.getElementById('l4u-r-conflict-text');
    if(badge&&ct){if(s.conflict){ct.textContent='Battery required '+s.V+'V but first-pass was '+s.fpV+'V. Inverter re-selected: '+s.inv.kva+'kVA @ '+s.V+'V.';badge.style.display='block';}else{badge.style.display='none';}}
    // Battery cards
    var bd=document.getElementById('l4u-r-battery-options');
    if(bd)bd.innerHTML=s.opts.map((o,i)=>'<div class="battery-card" id="ebo-'+i+'" style="cursor:pointer;border:2px solid '+(i===(s.selBat||0)?'var(--sun)':'var(--border)')+';transition:border-color 0.2s" onclick="l4u_egPickBat('+i+')">'+'<div class="btype">Option '+String.fromCharCode(65+i)+'</div>'+'<div class="bval" style="font-size:18px;">'+o.units+' ×</div>'+'<div style="font-size:11px;color:var(--sun);font-weight:700;margin:2px 0">'+o.label+'</div>'+'<div class="bunit">'+o.totalKwh+' kWh total</div>'+'<div style="font-size:11px;color:var(--muted);margin-top:4px">'+o.wiring+'</div>'+'<div style="font-size:12px;color:var(--sun);font-weight:700;margin-top:6px">'+l4u__fmt(o.total)+'</div>'+(o.warn?'<div style="font-size:10px;color:#ef4444;margin-top:4px">⚠ '+o.warn+'</div>':'')+'</div>').join('');
    // Solar
    set('l4u-r-pv-watts',N(s.reqWActive||s.reqW)); set('l4u-r-panels',s.panels); set('l4u-r-gen',s.gen);
    set('l4u-r-coverage',((s.gen/(s.dw/1000))*100).toFixed(0)+'%');
    var btnA=document.getElementById('l4u-panel-toggle-A'),btnB=document.getElementById('l4u-panel-toggle-B');
    if(btnA)btnA.style.display='none'; if(btnB)btnB.style.display='none';
    var sbd=document.getElementById('l4u-r-solar-breakdown');
    if(sbd)sbd.innerHTML='<strong>Full Recharge</strong> · <strong>'+s.strings+' string'+(s.strings>1?'s':'')+' × '+s.pps+' panels/string</strong> · Array: '+s.pvV+'V DC @ '+s.pvA+'A · '+s.expand+' expansion slot'+(s.expand!==1?'s':'')+' available';
    // Cables
    var cab=document.getElementById('l4u-r-cables');
    if(cab)cab.innerHTML=[['PV → Inverter (DC)',s.conn.pv],['Inverter → Battery (DC)',s.conn.bat],['Inverter → Changeover (AC)',s.conn.ac],['Grid → Inverter (AC)',s.conn.ac]].map(r=>'<tr><td class="conn-name">'+r[0]+'</td><td style="text-align:center"><span class="badge">'+r[1].cab.s+'mm²</span></td><td style="text-align:center"><span class="badge green">'+r[1].brk.a+'A</span></td></tr>').join('');
    // SPD
    l4u__renderSPD(s);
    // Earthing
    l4u__renderSoilSelector();
    l4u__renderEarth(s);
    // BOM
    l4u__renderBOM(s);
    // Show
    var res=document.getElementById('l4u-results'),ph=document.getElementById('l4u-placeholder');
    if(res)res.classList.add('visible'); if(ph)ph.style.display='none';

    // Bridge to parent
    var out={totalWatts:s.tw,dailyKwh:s.dw/1000,maxSurge:Math.round(s.surge),invKva:s.inv.kva,sysV:s.V,systemVoltage:s.V,lithiumPackKwh:b0.totalKwh||0,batUnits:b0.units||1,batLabel:b0.label||'',numPanels:s.panels,panelCount:s.panels,pvWatts:s.arrW,requiredPvWatts:s.reqWActive||s.reqW,panelMode:s.activePanelMode||'A',pvCable:s.conn.pv.cab.s,battCable:s.conn.bat.cab.s,acCable:s.conn.ac.cab.s,pvBreaker:s.conn.pv.brk.a,battBreaker:s.conn.bat.brk.a,acBreaker:s.conn.ac.brk.a,totalCost:0,bom:s.bom||[],tubularUnitPrice:0,tubularAltCost:0,leadTotalBatteries:0};
    /* donor cleanup: removed parent receiveEmbeddedCalculation bridge */
  }

  function l4u__applyPanelMode(s,mode){
    if(!s)return s;
    var m=mode==='B'?'B':'A';
    s.activePanelMode=m;
    var panels=m==='B'?(s.panelCountB||s.panelCountA||s.panels):(s.panelCountA||s.panels);
    var req=m==='B'?(s.reqWB||s.reqWA||s.reqW):(s.reqWA||s.reqW);
    var pps=s.V===12?1:s.V===24?2:4;
    var strings=Math.ceil(panels/pps);
    s.panels=panels;
    s.reqW=+req;
    s.reqWActive=+req;
    s.arrW=panels*l4u_PANEL.wattage;
    s.pps=pps;
    s.strings=strings;
    s.pvV=+(pps*l4u_PANEL.vmp).toFixed(1);
    s.pvA=+(strings*l4u_PANEL.imp).toFixed(1);
    s.expand=(strings*pps)-panels;
    s.gen=+((panels*l4u_PANEL.wattage*(s.PSH||5)*(s.PR||0.75))/1000).toFixed(2);
    return s;
  }

  function l4u_egTogglePanel(mode){
    if(!l4u__egS)return;
    l4u__applyPanelMode(l4u__egS,mode);
    l4u__egS=l4u__buildBOM(l4u__egS,l4u__egS.selBat||0);
    l4u__renderResults(l4u__egS);
  }

  function l4u__renderSPD(s){
    var el=document.getElementById('l4u-r-spd');
    if(!el||!s.spd)return;
    var dc=s.spd.dc,ac=s.spd.ac;
    el.innerHTML=
      '<table style="width:100%;border-collapse:collapse;font-size:12px;">'+
        '<thead><tr style="color:var(--muted,#94a3b8);font-size:11px;">'+
          '<th style="text-align:left;padding:6px 4px;font-weight:600;">Location</th>'+
          '<th style="text-align:center;padding:6px 4px;font-weight:600;">Rating</th>'+
          '<th style="text-align:center;padding:6px 4px;font-weight:600;">Type</th>'+
        '</tr></thead>'+
        '<tbody>'+
          '<tr style="border-top:1px solid var(--border,#334155);">'+
            '<td style="padding:9px 4px;font-size:11px;color:var(--muted,#94a3b8);">PV → Inverter (DC)</td>'+
            '<td style="padding:9px 4px;text-align:center;"><span style="background:#1e3a5f;color:#93c5fd;padding:3px 8px;border-radius:5px;font-size:11px;font-weight:600;">'+dc.uc+'V DC</span></td>'+
            '<td style="padding:9px 4px;text-align:center;font-size:11px;color:var(--muted,#94a3b8);">Type 2</td>'+
          '</tr>'+
          '<tr style="border-top:1px solid var(--border,#334155);">'+
            '<td style="padding:9px 4px;font-size:11px;color:var(--muted,#94a3b8);">Inverter Output (AC)</td>'+
            '<td style="padding:9px 4px;text-align:center;"><span style="background:#1e3a5f;color:#93c5fd;padding:3px 8px;border-radius:5px;font-size:11px;font-weight:600;">'+ac.uc+'V AC</span></td>'+
            '<td style="padding:9px 4px;text-align:center;font-size:11px;color:var(--muted,#94a3b8);">Type 2</td>'+
          '</tr>'+
        '</tbody>'+
      '</table>';
  }

  function l4u__renderSoilSelector(){
    var el=document.getElementById('l4u-r-soil-selector');
    if(!el)return;
    el.innerHTML='<label style="font-size:12px;color:var(--muted);display:block;margin-bottom:6px">Select your soil type to calculate earthing system:</label>'+
      '<select id="l4u-soil-select" onchange="l4u__onSoilChange(this.value)" style="width:100%;padding:10px 12px;border:1px solid var(--border,#334155);border-radius:8px;font-size:13px;background:var(--panel,#0f172a);color:var(--text,#f1f5f9)">'+
        '<option value="">— Choose soil type —</option>'+
        l4u_PC.soil.map(function(s){return '<option value="'+s.id+'">'+s.label+' ('+s.note+')</option>';}).join('')+
      '</select>';
  }

  function l4u__onSoilChange(soilId){
    if(!l4u__egS||!soilId)return;
    l4u__egS.earth=l4u__calcEarth(soilId,l4u__egS.conn.ac.cab.s,l4u__egS.inv.kva);
    l4u__egS=l4u__buildBOM(l4u__egS,l4u__egS.selBat||0);
    l4u__renderBOM(l4u__egS);
    l4u__renderEarth(l4u__egS);
  }

  function l4u__renderEarth(s){
    var el=document.getElementById('l4u-r-earth');
    if(!el)return;
    if(!s.earth){
      el.innerHTML='<div style="font-size:12px;color:var(--muted);padding:8px 0">Select soil type above to calculate your earthing system.</div>';
      return;
    }
    var e=s.earth;
    var warnHtml=e.warn
      ?'<div style="background:#fff7ed;border:1px solid #fb923c;border-radius:8px;padding:10px 12px;margin-top:10px;font-size:12px;color:#9a3412;line-height:1.5">'+
          '⚠️ <strong>High resistivity soil ('+e.rho+' Ω·m).</strong> '+e.rods+' rods achieve '+e.rn+'Ω — above 5Ω target. '+
          'Consider chemical earthing compound (bentonite/salt-charcoal backfill) around each rod.</div>'
      :'';
    el.innerHTML=
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">'+
        '<div style="background:var(--panel,#1e293b);border-radius:8px;padding:12px">'+
          '<div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Rod Specification</div>'+
          '<div style="font-size:16px;font-weight:700;color:var(--sun)">'+e.rods+' × Rod'+(e.rods>1?'s':'')+' Required</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-top:2px">3.0m × 16mm Copper-Bonded Steel</div>'+
          '<div style="font-size:11px;color:var(--muted)">Spacing: 6m minimum</div>'+
        '</div>'+
        '<div style="background:var(--panel,#1e293b);border-radius:8px;padding:12px">'+
          '<div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Achieved Resistance</div>'+
          '<div style="font-size:16px;font-weight:700;color:'+(e.warn?'#f59e0b':'#22c55e')+'">'+e.rn+' Ω</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-top:2px">'+e.soil+' (ρ='+e.rho+' Ω·m)</div>'+
          '<div style="font-size:11px;color:var(--muted)">Target: ≤ 5Ω (BS 7430)</div>'+
        '</div>'+
      '</div>'+
      '<div style="background:var(--panel,#1e293b);border-radius:8px;padding:12px;margin-top:10px">'+
        '<div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Earthing Conductor</div>'+
        '<div style="font-size:13px;font-weight:600">'+e.condS+'mm² Bare Copper</div>'+
        '<div style="font-size:11px;color:var(--muted);margin-top:2px">'+e.condRun+'m run per rod pit | IEC 60364-5-54</div>'+
      '</div>'+
      warnHtml;
  }

  function l4u__renderBOM(s){
    var body=document.getElementById('l4u-r-bom-body'),tot=document.getElementById('l4u-r-bom-total');
    if(!body)return;
    body.innerHTML=s.bom.map((l,i)=>'<tr style="background:'+(i%2?'var(--panel,#f9fafb)':'transparent')+'"><td style="padding:9px 12px;font-size:12px">'+l.item+'<br><span style="color:var(--muted);font-size:10px">'+l.spec+'</span></td><td style="padding:9px 8px;text-align:center;font-size:12px">'+l.qty+'</td></tr>').join('');
    if(tot)tot.style.display='none';
  }

  function l4u_egPickBat(i){
    if(!l4u__egS)return;
    l4u__egS.selBat=i; l4u__egS=l4u__buildBOM(l4u__egS,i); l4u__renderBOM(l4u__egS);
    var b=l4u__egS.opts[i];
    if(b){function set(id,v){var el=document.getElementById(id);if(el)el.textContent=v;}set('l4u-s-battery-main',b.units+' × '+b.label);set('l4u-s-battery-config',b.wiring);set('l4u-s-battery-alt',b.totalKwh+' kWh total');}
    l4u__egS.opts.forEach((_,j)=>{var c=document.getElementById('l4u-ebo-'+j);if(c)c.style.borderColor=j===i?'var(--sun)':'var(--border)';});
  }

  // ── UI FUNCTIONS ─────────────────────────────────────────────────────────
  function l4u_getDefaultHours(cat){return l4u_default_hours_by_category[cat]||1;}
  function l4u_detectFridgeMode(name){var n=(name||'').toLowerCase();if(n.includes('freezer'))return'chest_freezer';if(n.includes('mini fridge'))return'inverter_fridge';if(n.includes('fridge')||n.includes('refrigerator'))return'normal_fridge';return'none';}
  function l4u_getAppliancePreset(name){var n=(name||'').toLowerCase().trim();return l4u_default_appliances.find(a=>a.name.toLowerCase()===n)||l4u_default_appliances.find(a=>n&&a.name.toLowerCase().includes(n));}
  function l4u_getFridgeDutyFactor(item){if(item.dutyCycle!=null)return item.dutyCycle;var m=l4u_detectFridgeMode(item.name);return m==='inverter_fridge'?0.35:m==='normal_fridge'?0.5:m==='chest_freezer'?0.6:1;}
  function l4u_resetForm(){['l4u-inp-name','l4u-inp-watts','l4u-inp-hours'].forEach(id=>{var el=document.getElementById(id);if(el)el.value='';});var q=document.getElementById('l4u-inp-qty');if(q)q.value='1';var m=document.getElementById('l4u-inp-fridge-mode');if(m)m.value='none';}
  function l4u_syncFormFromPreset(){var ne=document.getElementById('l4u-inp-name'),we=document.getElementById('l4u-inp-watts'),he=document.getElementById('l4u-inp-hours');var p=l4u_getAppliancePreset(ne&&ne.value);if(!p)return;if(we&&!we.value)we.value=p.watts;if(he&&!he.value)he.value=l4u_getDefaultHours(p.category);}

  function l4u_renderQuickAddChips(){
    var box=document.getElementById('l4u-preset-chips');if(!box)return;
    var co=['lighting','electronics','fan','fridge','freezer','kitchen','heating','laundry','pump','air_conditioner','business'];
    var cl={lighting:'Lighting',electronics:'Electronics',fan:'Fans',fridge:'Fridges',freezer:'Freezers',kitchen:'Kitchen',heating:'Heating',laundry:'Laundry',pump:'Pumps',air_conditioner:'Air Conditioners',business:'Business'};
    var g=l4u_default_appliances.reduce((acc,a)=>{var k=a.category||'other';if(!acc[k])acc[k]=[];acc[k].push(a);return acc;},{});
    var cats=co.filter(c=>g[c]&&g[c].length).concat(Object.keys(g).filter(c=>!co.includes(c)));
    box.innerHTML=cats.map(cat=>'<div class="preset-category" style="margin-bottom:12px"><div class="section-label" style="margin:0 0 6px;font-size:12px;opacity:.85">'+(cl[cat]||cat)+'</div><div class="l4u-preset-chips" style="margin-top:0">'+g[cat].map(a=>'<span class="chip" onclick="l4u_egQuickAdd(\''+a.name.replace(/'/g,"\'")+'\')">'+(a.emoji||'⚡')+' '+a.name+'</span>').join('')+'</div></div>').join('');
  }

  function l4u_renderApplianceSuggestions(){var list=document.getElementById('l4u-appliance-suggestions');if(!list)return;list.innerHTML=l4u_default_appliances.map(a=>'<option value="'+a.name+'"></option>').join('');}

  function l4u_addItem(item){item.id=Date.now()+Math.random();l4u_appliances.push(item);l4u_renderList();}

  function l4u_egQuickAdd(name){
    var p=l4u_getAppliancePreset(name);if(!p)return;
    // Remove any existing stepper modal
    var old=document.getElementById('l4u-qty-modal');if(old)old.remove();
    // Build modal
    var defaultHrs=l4u_getDefaultHours(p.category);
    var modal=document.createElement('div');
    modal.id='l4u-qty-modal';
    modal.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,0.55);backdrop-filter:blur(3px);';
    modal.innerHTML=
      '<div style="background:#1e293b;border:1px solid #334155;border-radius:18px;padding:24px 20px;width:100%;max-width:320px;box-shadow:0 20px 60px rgba(0,0,0,.5);">'+
        '<div style="font-size:22px;text-align:center;margin-bottom:6px;">'+(p.emoji||'⚡')+'</div>'+
        '<div style="font-weight:700;font-size:15px;color:#f1f5f9;text-align:center;margin-bottom:2px;">'+p.name+'</div>'+
        '<div style="font-size:12px;color:#64748b;text-align:center;margin-bottom:20px;">'+p.watts+'W · '+defaultHrs+'h/day default</div>'+
        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#94a3b8;margin-bottom:8px;">Quantity</div>'+
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">'+
          '<button id="l4u-qty-minus" style="width:44px;height:44px;border-radius:12px;border:1px solid #334155;background:#0f172a;color:#f1f5f9;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:300;flex-shrink:0;" onclick="l4u_qtyStep(-1)">−</button>'+
          '<input id="l4u-qty-val" type="number" min="1" max="99" value="1" style="flex:1;text-align:center;font-size:26px;font-weight:700;color:#f1f5f9;background:#0f172a;border:1px solid #475569;border-radius:12px;padding:10px 0;width:0;">'+
          '<button id="l4u-qty-plus" style="width:44px;height:44px;border-radius:12px;border:1px solid #334155;background:#0f172a;color:#f1f5f9;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:300;flex-shrink:0;" onclick="l4u_qtyStep(1)">+</button>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'+
          '<button onclick="l4u_qtyCancel()" style="padding:13px;border-radius:12px;border:1px solid #334155;background:transparent;color:#94a3b8;font-size:14px;font-weight:600;cursor:pointer;">Cancel</button>'+
          '<button onclick="l4u_qtyConfirm(\''+p.name.replace(/'/g,"\\'")+'\')" style="padding:13px;border-radius:12px;border:none;background:#f59e0b;color:#0f172a;font-size:14px;font-weight:700;cursor:pointer;">+ Add</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(modal);
    // Close on backdrop click
    modal.addEventListener('click',function(e){if(e.target===modal)l4u_qtyCancel();});
    // Focus input
    setTimeout(function(){var inp=document.getElementById('l4u-qty-val');if(inp){inp.focus();inp.select();}},50);
  }

  function l4u_qtyStep(delta){
    var inp=document.getElementById('l4u-qty-val');if(!inp)return;
    var v=Math.max(1,Math.min(99,(parseInt(inp.value)||1)+delta));
    inp.value=v;
  }

  function l4u_qtyCancel(){
    var m=document.getElementById('l4u-qty-modal');if(m){m.style.opacity='0';m.style.transition='opacity .15s';setTimeout(function(){m.remove();},150);}
  }

  function l4u_qtyConfirm(name){
    var inp=document.getElementById('l4u-qty-val');
    var qty=Math.max(1,Math.min(99,parseInt((inp&&inp.value)||1)||1));
    var p=l4u_getAppliancePreset(name);if(!p)return;
    l4u_qtyCancel();
    var newId=Date.now()+Math.random();
    l4u_appliances.push({id:newId,name:p.name,watts:p.watts,qty:qty,hours:l4u_getDefaultHours(p.category),inductive:p.inductive,dutyCycle:p.dutyCycle});
    l4u_renderList();
    // Flash highlight the newly added item
    setTimeout(function(){
      var list=document.getElementById('l4u-appliance-list');if(!list)return;
      var items=list.querySelectorAll('.appliance-item');
      var last=items[items.length-1];if(!last)return;
      last.scrollIntoView({behavior:'smooth',block:'nearest'});
      last.style.transition='background .1s';
      last.style.background='rgba(245,158,11,0.25)';
      setTimeout(function(){last.style.background='';},700);
    },80);
    l4u_resetForm();
  }

  // keep old names working
  function l4u_quickAddPreset(name){l4u_egQuickAdd(name);}
  function l4u_quickAdd(name,watts,qty,hours,fm){var p=l4u_getAppliancePreset(name);var ind=p?p.inductive:false;var dc=p?p.dutyCycle:null;l4u_addItem({name:name,watts:watts,qty:qty,hours:hours,inductive:ind,dutyCycle:dc});l4u_resetForm();}

  function l4u_addAppliance(){
    l4u_syncFormFromPreset();
    var name=(document.getElementById('l4u-inp-name')||{}).value&&document.getElementById('l4u-inp-name').value.trim();
    var watts=parseFloat((document.getElementById('l4u-inp-watts')||{}).value);
    var qty=parseInt((document.getElementById('l4u-inp-qty')||{}).value);
    var hours=parseFloat((document.getElementById('l4u-inp-hours')||{}).value);
    if(!name){showToast('Please enter an appliance name.','error');return;}
    if(isNaN(watts)||watts<=0){showToast('Please enter valid watts.','error');return;}
    if(isNaN(qty)||qty<=0){showToast('Please enter a valid quantity.','error');return;}
    if(isNaN(hours)||hours<=0){showToast('Please enter valid hours per day.','error');return;}
    var p=l4u_getAppliancePreset(name);
    l4u_addItem({name:name,watts:watts,qty:qty,hours:hours,inductive:p?p.inductive:['fridge','freezer','ac','pump','motor','compressor','washing'].some(k=>name.toLowerCase().includes(k)),dutyCycle:p?p.dutyCycle:null});
    l4u_resetForm(); var ne=document.getElementById('l4u-inp-name');if(ne)ne.focus();
  }

  function l4u_removeAppliance(id){
    l4u_appliances=l4u_appliances.filter(a=>a.id!==id); l4u_renderList();
    if(!l4u_appliances.length){var res=document.getElementById('l4u-results');if(res)res.classList.remove('visible');var ph=document.getElementById('l4u-placeholder');if(ph)ph.style.display='flex';}
  }

  function l4u_renderList(){
    var list=document.getElementById('l4u-appliance-list');
    var c=document.getElementById('l4u-count');if(c)c.textContent=l4u_appliances.length;
    var btn=document.getElementById('l4u-calc-btn');if(btn)btn.disabled=!l4u_appliances.length;
    if(!list)return;
    if(!l4u_appliances.length){list.innerHTML='<div class="empty-state"><div class="icon">🏠</div><p>No appliances added yet.<br/>Use the form or quick-add chips above.</p></div>';return;}
    list.innerHTML=l4u_appliances.map(a=>{var effH=a.dutyCycle?24*a.dutyCycle:a.hours;var d=(a.watts*a.qty*effH/1000).toFixed(2);return '<div class="appliance-item"><div class="app-info"><div class="app-name">'+a.name+'</div><div class="app-details"><span>'+a.watts+'W</span> × <span>'+a.qty+'</span> · <span>'+(a.dutyCycle?'24h ('+Math.round(a.dutyCycle*100)+'% duty)':a.hours+'h/day')+'</span></div></div><div style="display:flex;align-items:center;gap:12px"><div class="app-daily"><strong>'+d+'</strong> kWh/day</div><button class="btn-remove" onclick="l4u_removeAppliance('+a.id+')">✕</button></div></div>';}).join('');
  }


  function l4u_resetSavedSessionUI(){
    var res=document.getElementById('l4u-results');
    var ph=document.getElementById('l4u-placeholder');
    if(res) res.classList.remove('visible');
    if(ph) ph.style.display='flex';
    var rp=document.querySelector('.right-panel'); if(rp) rp.scrollTop=0;
  }

  function l4u_resetCalculatorSession(){
    l4u_appliances = [];
    l4u__egS = null;
    l4u_resetForm();
    l4u_renderList();
    l4u_resetSavedSessionUI();
  }

  function l4u_loadSavedAppliances(apps){
    l4u_resetCalculatorSession();
    (apps || []).forEach(function(a){
      l4u_addItem({
        name: a.name || '',
        watts: Number(a.watts || 0),
        qty: Number(a.qty || 1),
        hours: Number(a.hours || 0),
        inductive: !!a.inductive,
        dutyCycle: a.dutyCycle == null ? null : Number(a.dutyCycle)
      });
    });
    if (l4u_appliances.length) l4u_calculate();
  }

  document.addEventListener('DOMContentLoaded',function(){l4u_renderQuickAddChips();l4u_renderApplianceSuggestions();var ne=document.getElementById('l4u-inp-name');if(ne){ne.addEventListener('change',l4u_syncFormFromPreset);ne.addEventListener('blur',l4u_syncFormFromPreset);}});

  function l4u_calculate(){if(!l4u_appliances.length)return;
    try { if (typeof clearSavedSystemMode === 'function' && !(typeof isLoadingSavedSystem !== 'undefined' && isLoadingSavedSystem)) clearSavedSystemMode(); } catch(e){}
    l4u__egS=l4u__runEngine(l4u_appliances);l4u__applyPanelMode(l4u__egS,'B');l4u__egS=l4u__buildBOM(l4u__egS,0);l4u__renderResults(l4u__egS);
    try {
      var b0 = (l4u__egS && l4u__egS.opts && l4u__egS.opts[l4u__egS.selBat || 0]) || {};
      var flat = {
        totalWatts: l4u__egS.tw,
        dailyKwh: +(l4u__egS.dw/1000).toFixed(2),
        maxSurge: Math.round(l4u__egS.surge),
        invKva: l4u__egS.inv.kva,
        invModel: `${l4u__egS.inv.kva}kVA ${l4u__egS.V}V Hybrid Inverter`,
        sysV: l4u__egS.V,
        systemVoltage: l4u__egS.V,
        acCurrent: l4u__egS.acA,
        lithiumPackKwh: b0.totalKwh || 0,
        batUnits: b0.units || 1,
        batLabel: b0.label || '',
        numPanels: l4u__egS.panels,
        panelCount: l4u__egS.panels,
        pvWatts: l4u__egS.arrW,
        requiredPvWatts: l4u__egS.reqWActive || l4u__egS.reqW,
        panelMode: l4u__egS.activePanelMode || 'A',
        pvCable: l4u__egS.conn.pv.cab.s,
        battCable: l4u__egS.conn.bat.cab.s,
        acCable: l4u__egS.conn.ac.cab.s,
        pvBreaker: l4u__egS.conn.pv.brk.a,
        battBreaker: l4u__egS.conn.bat.brk.a,
        acBreaker: l4u__egS.conn.ac.brk.a,
        leadTotalBatteries: 0,
        // ── Extended fields for WhatsApp / PDF export ──────────────────────
        bom:           l4u__egS.bom  || [],
        spd:           l4u__egS.spd  || null,
        earth:         l4u__egS.earth || null,
        numBattStrings: l4u__egS.conn && l4u__egS.conn.bat ? (l4u__egS.conn.bat.numStrings || 1) : 1,
        battStringBreaker: l4u__egS.conn && l4u__egS.conn.bat ? (l4u__egS.conn.bat.brk.a || null) : null,
        battStringCable:   l4u__egS.conn && l4u__egS.conn.bat ? (l4u__egS.conn.bat.cab.s || null) : null,
        pvStrings:     l4u__egS.strings || 1,
        pvPanelsPerString: l4u__egS.pps || 1,
        pvVoc:         l4u__egS.pvV || 0,
        pvIsc:         l4u__egS.pvA || 0,
        conflictNote:  l4u__egS.conflict || null,
      };
      if (typeof egBuildCostBreakdown === 'function') Object.assign(flat, egBuildCostBreakdown(flat));
      receiveEmbeddedCalculation('user', flat, l4u_appliances);
    } catch(e) { console.warn('L4 user calc bridge error:', e); }
}

  function openInstallerLaunch4Results() {
    if (!instCalculationResult) {
      if (typeof showToast === 'function') showToast('No calculation result. Please calculate first.', 'error');
      return;
    }
    const r = instCalculationResult;
    const N = v => Number(v || 0).toLocaleString();
    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const inverterKw = r.invKva || Math.ceil((r.requiredInverter || 0) / 1000) || 0;
    setEl('instResRunning', `${Math.round(r.totalRunning || r.totalWatts || 0)} W`);
    setEl('instResEnergy', `${Math.round(r.dailyEnergy || ((r.dailyKwh || 0) * 1000))} Wh`);
    setEl('instResSurge', `${Math.round(r.maxSurge || 0)} W`);
    setEl('instResInverter', `${inverterKw} kW`);
    setEl('instTotalCost', `₦${N(r.totalCost || 0)}`);
    const compEl = document.getElementById('instComponents');
    if (compEl) {
      const pvPower = r.actualPvPower || r.pvWatts || 0;
      const battInfo = r.batLabel ? `${r.batUnits || 1}× ${r.batLabel}` : `${r.batteryCount || 1}× ${(r.batteryBankKwh || r.lithiumPackKwh || 0)}kWh ${r.batteryType || 'Battery'}`;
      compEl.innerHTML =
        `<strong>PV Array:</strong> ${r.totalPanels || r.numPanels || 0} panels = ${N(pvPower)}W<br>` +
        `<strong>Batteries:</strong> ${battInfo} (${r.systemVoltage || r.sysV || '-'}V)<br>` +
        `<strong>Controller:</strong> MPPT<br>` +
        `<strong>Inverter:</strong> ${inverterKw}kW`;
    }
    const egViewBtn = document.getElementById('eg-view-results-btn');
    if (egViewBtn) egViewBtn.style.display = 'block';
  }

  // Enter key
  document.addEventListener('keydown',function(e){if(e.key==='Enter'&&document.activeElement.closest('.add-form'))l4u_addAppliance();});

