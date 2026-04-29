  // ── APPLIANCE DATABASE ───────────────────────────────────────────────────
  let l4i_appliances = [];

  const l4i_default_hours_by_category = {
    lighting:6,electronics:6,fan:8,fridge:24,freezer:24,
    kitchen:1,heating:1,laundry:1,pump:1,air_conditioner:6,business:2
  };

  const l4i_default_appliances = [
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
  const l4i_INVERTER_DB = [
    {kva:1,   v:12,maxPvW:1200, mpptMin:30, mpptMax:115,maxPvA:20 },
    {kva:1.5, v:12,maxPvW:2000, mpptMin:30, mpptMax:115,maxPvA:25 },
    {kva:2,   v:24,maxPvW:2500, mpptMin:60, mpptMax:145,maxPvA:25 },
    {kva:2.5, v:24,maxPvW:3000, mpptMin:60, mpptMax:145,maxPvA:25 },
    {kva:3,   v:24,maxPvW:3500, mpptMin:60, mpptMax:145,maxPvA:30 },
    {kva:3.5, v:24,maxPvW:4000, mpptMin:60, mpptMax:145,maxPvA:30 },
    {kva:4,   v:24,maxPvW:6000, mpptMin:60, mpptMax:500,maxPvA:120},
    {kva:5,   v:48,maxPvW:6500, mpptMin:120,mpptMax:430,maxPvA:50 },
    {kva:7.5, v:48,maxPvW:9000, mpptMin:120,mpptMax:450,maxPvA:80 },
    {kva:10,  v:48,maxPvW:12000,mpptMin:150,mpptMax:450,maxPvA:100},
    {kva:12,  v:48,maxPvW:15000,mpptMin:150,mpptMax:500,maxPvA:120},
    {kva:15,  v:48,maxPvW:18000,mpptMin:150,mpptMax:500,maxPvA:150},
    {kva:20,  v:48,maxPvW:25000,mpptMin:150,mpptMax:550,maxPvA:180},
    {kva:25,  v:48,maxPvW:30000,mpptMin:150,mpptMax:550,maxPvA:200},
    {kva:30,  v:48,maxPvW:36000,mpptMin:150,mpptMax:550,maxPvA:230},
  ];

  const l4i_BATTERY_DB = {
    12:[{label:'12V 100Ah LiFePO4',ah:100,kwh:1.28},{label:'12V 200Ah LiFePO4',ah:200,kwh:2.56}],
    24:[{label:'24V 2.5kWh Pack',kwh:2.5},{label:'24V 3.0kWh Pack',kwh:3.0},{label:'24V 3.5kWh Pack',kwh:3.5},{label:'24V 5kWh Pack',kwh:5.0}],
    48:[{label:'48V 5kWh Pack',kwh:5.0},{label:'48V 7.5kWh Pack',kwh:7.5},{label:'48V 9.6kWh Pack',kwh:9.6},
        {label:'48V 10kWh Pack',kwh:10.0},{label:'48V 15kWh Pack',kwh:15.0},{label:'48V 17.5kWh Pack',kwh:17.5},{label:'48V 20kWh Pack',kwh:20.0},
        {label:'48V 25kWh Pack',kwh:25.0},{label:'48V 30kWh Pack',kwh:30.0}],
  };

  const l4i_PANEL = {wattage:550,vmp:41.8,imp:12.2,voc:49.5};

  const l4i_PC = {
    inv:[
      {kva:1,v:12,p:170000},{kva:1.5,v:12,p:200000},{kva:2,v:24,p:230000},{kva:2.5,v:24,p:270000},
      {kva:3,v:24,p:280000},{kva:3.5,v:24,p:290000},{kva:4,v:24,p:330000},{kva:5,v:48,p:400000},{kva:7.5,v:48,p:700000},
      {kva:10,v:48,p:1200000},{kva:12,v:48,p:1500000},{kva:15,v:48,p:2000000},{kva:20,v:48,p:2800000},{kva:25,v:48,p:3500000},{kva:30,v:48,p:4500000},
    ],
    bat:{
      12:[{kwh:1.28,p:230000},{kwh:2.56,p:390000}],
      24:[{kwh:2.5,p:450000},{kwh:3.0,p:470000},{kwh:3.5,p:580000},{kwh:5.0,p:890000}],
      48:[{kwh:5.0,p:900000},{kwh:7.5,p:1350000},{kwh:9.6,p:1600000},{kwh:10.0,p:1600000},{kwh:15.0,p:1800000},{kwh:17.5,p:2300000},{kwh:20.0,p:2800000},{kwh:25.0,p:3500000},{kwh:30.0,p:4200000}],
    },
    panel:120000,
    dcCab:[{s:2.5,a:22,p:650},{s:4,a:30,p:1100},{s:6,a:40,p:1800},{s:10,a:54,p:3200},{s:16,a:73,p:5500},{s:25,a:95,p:8500},{s:35,a:117,p:12000},{s:50,a:141,p:17000},{s:70,a:179,p:24000},{s:95,a:215,p:33000},{s:120,a:249,p:44000},{s:150,a:285,p:57000}],
    acCab:[{s:2.5,a:20,p:650},{s:4,a:27,p:1100},{s:6,a:35,p:1800},{s:10,a:48,p:3200},{s:16,a:65,p:5500},{s:25,a:84,p:8500},{s:35,a:103,p:12000},{s:50,a:125,p:17000}],
    dcMcb: [{a:6,p:3500},{a:10,p:3500},{a:16,p:3500},{a:20,p:3500},{a:25,p:3800},{a:32,p:4000},{a:40,p:4500},{a:50,p:5500},{a:63,p:6500}],
    dcMccb:[{a:63,p:18000},{a:80,p:22000},{a:100,p:27000},{a:125,p:32000},{a:140,p:38000},{a:160,p:44000},{a:200,p:58000},{a:250,p:75000},{a:300,p:95000},{a:400,p:130000},{a:500,p:180000},{a:630,p:220000},{a:800,p:290000}],
    acMcb: [{a:6,p:2500},{a:10,p:2500},{a:16,p:2500},{a:20,p:2500},{a:25,p:2800},{a:32,p:3000},{a:40,p:3500},{a:50,p:4000},{a:63,p:5000},{a:80,p:7500},{a:100,p:9500},{a:125,p:12000},{a:160,p:18000},{a:200,p:25000}],
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
  function l4i__cab(d,t,floor){var c=t.find(x=>x.a>=d)||t[t.length-1];return(floor&&c.s<6)?t.find(x=>x.s===6):c;}
  function l4i__brk(d,t){return t.find(x=>x.a>=d)||t[t.length-1];}
  function l4i__invP(k,v){var m=l4i_PC.inv.find(i=>i.kva===k&&i.v===v);return m?m.p:0;}
  function l4i__batP(v,k){var f=l4i_PC.bat[v]||[];var m=f.find(b=>b.kwh===k);return m?m.p:0;}
  function l4i__fmt(n){return '₦'+Number(n).toLocaleString('en-NG');}

  function l4i__calcSPD(pps){
    var sv=pps*l4i_PANEL.voc, mu=sv*1.1;
    var dc=l4i_PC.dcSpd.find(function(s){return s.uc>=mu;})||l4i_PC.dcSpd[l4i_PC.dcSpd.length-1];
    return {dc:{uc:dc.uc,p:dc.p,stringVoc:+sv.toFixed(1),minUc:+mu.toFixed(1)},ac:{uc:l4i_PC.acSpd.uc,p:l4i_PC.acSpd.p}};
  }

  var l4i__ROD_L=3.0, l4i__ROD_D=0.016;
  var l4i__LAMBDA={1:1.0,2:1.16,3:1.29,4:1.36};
  function l4i__calcEarth(soilId, acCabS, kva){
    var soil=l4i_PC.soil.find(function(s){return s.id===soilId;})||l4i_PC.soil[1];
    var rho=soil.rho;
    var n=kva<=5?1:kva<=15?2:3;
    var r1=(rho/(2*Math.PI*l4i__ROD_L))*(Math.log((8*l4i__ROD_L)/l4i__ROD_D)-1);
    var lam=l4i__LAMBDA[n]||1.36;
    var rn=+((r1*lam)/n).toFixed(2);
    var condS=acCabS<=16?acCabS:Math.max(16,Math.ceil(acCabS/2));
    return {soil:soil.label,rho:rho,rods:n,rn:rn,warn:rn>5,condS:condS,
      rodCost:n*l4i_PC.earthRod.p, condCost:n*5*l4i_PC.earthCond.p, pitCost:n*l4i_PC.earthPit.p};
  }

  function l4i__onSoilChange(soilId){
    if(!l4i__egS||!soilId)return;
    l4i__egS.earth=l4i__calcEarth(soilId,l4i__egS.conn.ac.cab.s,l4i__egS.inv.kva);
    l4i__egS=l4i__buildBOM(l4i__egS,l4i__egS.selBat||0);
    l4i__renderBOM(l4i__egS);
    l4i__renderEarth(l4i__egS);
  }

  // ── ENGINE ───────────────────────────────────────────────────────────────
  var l4i__egS=null;

  function l4i__runEngine(apps){
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
    var inv=l4i_INVERTER_DB.find(i=>i.kva>=reqKva)||l4i_INVERTER_DB[l4i_INVERTER_DB.length-1];
    var fpV=inv.v, acA=(inv.kva*1000)/230;

    // Step 3 — Battery + voltage conflict
    var DOD=0.8,EFF=0.85,V=fpV;
    var rawAh=dw/(V*DOD*EFF);
    var reqV=rawAh<=200?12:rawAh<=400?24:48;
    var conflict=reqV>V;
    if(conflict){
      V=reqV;
      inv=l4i_INVERTER_DB.find(i=>i.v===V&&i.kva>=reqKva)||l4i_INVERTER_DB.filter(i=>i.v===V).pop();
      rawAh=dw/(V*DOD*EFF); acA=(inv.kva*1000)/230;
    }
    var reqKwh=rawAh*V/1000;

    // 48V pivot: if 24V would need 3+ packs, escalate to 48V for a cleaner single-pack system
    if(V===24){
      var _wu24=l4i_BATTERY_DB[24].map(function(p){return {kwh:p.kwh,units:Math.ceil(reqKwh/p.kwh)};});
      _wu24.sort(function(a,b){return a.units-b.units||a.kwh-b.kwh;});
      if(_wu24[0]&&_wu24[0].units>=3){
        V=48;
        inv=l4i_INVERTER_DB.find(function(i){return i.v===48&&i.kva>=reqKva;})||l4i_INVERTER_DB.filter(function(i){return i.v===48;}).pop();
        rawAh=dw/(V*DOD*EFF); reqKwh=rawAh*V/1000; acA=(inv.kva*1000)/230;
      }
    }

    var fam=l4i_BATTERY_DB[V],opts=[];
    if(V===12){
      // Fewest units first — 1x200Ah beats 2x100Ah when rawAh <= 200
      var wu12=fam.map(function(m){return {label:m.label,ah:m.ah,kwh:m.kwh,units:Math.ceil(rawAh/m.ah)};});
      wu12.sort(function(a,b){return a.units-b.units||a.ah-b.ah;});
      var oA12=wu12[0],oB12=wu12.find(function(m){return m.units>oA12.units||(m.units===oA12.units&&m.ah>oA12.ah);});
      [oA12,oB12].filter(Boolean).forEach(function(m){var u=m.units,pe=l4i__batP(12,m.kwh);
        opts.push({label:m.label,units:u,totalKwh:+(u*m.kwh).toFixed(2),wiring:u+' unit'+(u>1?'s':'')+' in parallel',warn:u>4?'Exceeds 4-string limit':null,pe:pe,total:u*pe});});
    } else {
      // Sort by fewest units first, then smallest kWh — so 1x7.5kWh beats 2x5kWh
      var wu=fam.map(function(p){return {label:p.label,kwh:p.kwh,units:Math.ceil(reqKwh/p.kwh)};});
      wu.sort(function(a,b){return a.units-b.units||a.kwh-b.kwh;});
      var oA=wu[0], oB=wu.find(function(p){return p.units>oA.units||(p.units===oA.units&&p.kwh>oA.kwh);});
      [oA,oB].filter(Boolean).forEach(function(p){
        var pe=l4i__batP(V,p.kwh);
        opts.push({label:p.label,units:p.units,totalKwh:+(p.units*p.kwh).toFixed(2),wiring:p.units+' pack'+(p.units>1?'s':'')+' in parallel',warn:p.units>4?'Exceeds 4-string limit':null,pe:pe,total:p.units*pe});});
    }

    // Step 4 — Panels
    var PSH=5,LOSS=1.3,PR=0.75,PW=l4i_PANEL.wattage,Vmp=l4i_PANEL.vmp,Imp=l4i_PANEL.imp;
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
      pv:  {op:+pvOp.toFixed(1),d:+pvD.toFixed(1),cab:l4i__cab(pvD,l4i_PC.dcCab,true), brk:l4i__brk(Math.max(pvD,16), l4i_PC.dcMcb)},
      bat: {op:+bOp.toFixed(1), d:+bD.toFixed(1), cab:l4i__cab(bD, l4i_PC.dcCab,true), brk:l4i__brk(Math.max(bD,63),  l4i_PC.dcMccb)},
      ac:  {op:+acA.toFixed(1), d:+aD.toFixed(1), cab:l4i__cab(aD, l4i_PC.acCab,false),brk:l4i__brk(Math.max(aD,16),  l4i_PC.acMcb)},
    };

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
      spd: l4i__calcSPD(pps),
      earth: null,
    };
  }

  function l4i__buildBOM(s,bi){
    var bom=[],tot=0;
    function add(item,spec,qty,up){var lt=qty*up;bom.push({item:item,spec:spec,qty:qty,up:up,lt:lt});tot+=lt;}
    add('Inverter',s.inv.kva+'kVA Hybrid MPPT @ '+s.V+'V',1,l4i__invP(s.inv.kva,s.V));
    var b=s.opts[bi];if(b)add('Battery',b.label,b.units,b.pe);
    add('Solar Panel',l4i_PANEL.wattage+'W Mono PERC',s.panels,l4i_PC.panel);
    add('PV Cable DC',s.conn.pv.cab.s+'mm² DC ~20m',20,s.conn.pv.cab.p);
    add('Battery Cable DC',s.conn.bat.cab.s+'mm² DC ~2m',2,s.conn.bat.cab.p);
    add('AC Cable',s.conn.ac.cab.s+'mm² AC ~20m',20,s.conn.ac.cab.p);
    add('DC MCB PV',s.conn.pv.brk.a+'A DC MCB',1,s.conn.pv.brk.p);
    add('DC MCCB Battery',s.conn.bat.brk.a+'A DC MCCB',1,s.conn.bat.brk.p);
    add('AC MCB Changeover',s.conn.ac.brk.a+'A AC MCB',1,s.conn.ac.brk.p);
    add('AC MCB Grid',s.conn.ac.brk.a+'A AC MCB',1,s.conn.ac.brk.p);
    if(s.spd){
      add('DC SPD (PV Side)',s.spd.dc.uc+'V DC Type 2 SPD',1,s.spd.dc.p);
      add('AC SPD (Output)',s.spd.ac.uc+'V AC Type 2 SPD',1,s.spd.ac.p);
    }
    if(s.earth){
      add('Earthing Rod','3m × 16mm Copper-Bonded Rod',s.earth.rods,l4i_PC.earthRod.p);
      add('Earthing Conductor',s.earth.condS+'mm² Bare Copper ~5m/rod',s.earth.rods*5,l4i_PC.earthCond.p);
      add('Earth Pit Cover','PVC Earth Pit Cover',s.earth.rods,l4i_PC.earthPit.p);
    }
    s.bom=bom; s.total=tot; return s;
  }

  function l4i__renderResults(s){
    function set(id,v){var el=document.getElementById(id);if(el)el.textContent=v;}
    function styleToggle(btn,active){
      if(!btn)return;
      btn.style.background=active?'var(--sun)':'var(--panel)';
      btn.style.borderColor=active?'var(--sun)':'var(--border)';
      btn.style.color=active?'#fff':'var(--text)';
      btn.style.boxShadow=active?'0 6px 18px rgba(0,0,0,0.08)':'none';
    }
    var N=n=>Number(n).toLocaleString('en-NG');
    l4i__applyPanelMode(s,s.activePanelMode||'A');
    var b0=s.opts[s.selBat||0]||s.opts[0]||{};
    // Simple cards
    set('s-inverter-kva',s.inv.kva+' kVA');
    set('s-inverter-model','Hybrid MPPT Inverter');
    set('s-inverter-voltage',s.V+'V DC System');
    set('s-panels-count',s.panels+' panels');
    set('s-panels-size',l4i_PANEL.wattage+'W Mono PERC');
    set('s-panels-total',N(s.arrW)+'W Array');
    set('s-battery-main',(b0.units||'-')+' x '+(b0.label||'-'));
    set('s-battery-config',b0.wiring||'-');
    set('s-battery-alt',(b0.totalKwh||'-')+' kWh total');
    // Load
    set('l4i-r-watts',N(s.tw)); set('l4i-r-kwh',(s.dw/1000).toFixed(2)); set('l4i-r-surge',N(Math.round(s.surge)));
    // Inverter
    set('l4i-r-voltage',s.V); set('l4i-r-kva',s.inv.kva);
    set('l4i-r-inv-model',s.inv.kva+'kVA @ '+s.V+'V'); set('l4i-r-ac-amps',s.acA.toFixed(1));
    // Conflict badge
    var badge=document.getElementById('l4i-r-conflict-badge'),ct=document.getElementById('l4i-r-conflict-text');
    if(badge&&ct){if(s.conflict){ct.textContent='Battery required '+s.V+'V but first-pass was '+s.fpV+'V. Inverter re-selected: '+s.inv.kva+'kVA @ '+s.V+'V.';badge.style.display='block';}else{badge.style.display='none';}}
    // Battery cards
    var bd=document.getElementById('l4i-r-battery-options');
    if(bd)bd.innerHTML=s.opts.map((o,i)=>'<div class="battery-card" id="ebo-'+i+'" style="cursor:pointer;border:2px solid '+(i===(s.selBat||0)?'var(--sun)':'var(--border)')+';transition:border-color 0.2s" onclick="l4i_egPickBat('+i+')">'+'<div class="btype">Option '+String.fromCharCode(65+i)+'</div>'+'<div class="bval" style="font-size:18px;">'+o.units+' ×</div>'+'<div style="font-size:11px;color:var(--sun);font-weight:700;margin:2px 0">'+o.label+'</div>'+'<div class="bunit">'+o.totalKwh+' kWh total</div>'+'<div style="font-size:11px;color:var(--muted);margin-top:4px">'+o.wiring+'</div>'+'<div style="font-size:12px;color:var(--sun);font-weight:700;margin-top:6px">'+l4i__fmt(o.total)+'</div>'+(o.warn?'<div style="font-size:10px;color:#ef4444;margin-top:4px">⚠ '+o.warn+'</div>':'')+'</div>').join('');
    // Solar
    set('l4i-r-pv-watts',N(s.reqWActive||s.reqW)); set('l4i-r-panels',s.panels); set('l4i-r-gen',s.gen);
    set('l4i-r-coverage',((s.gen/(s.dw/1000))*100).toFixed(0)+'%');
    var btnA=document.getElementById('l4i-panel-toggle-A'),btnB=document.getElementById('l4i-panel-toggle-B');
    styleToggle(btnA,(s.activePanelMode||'A')==='A'); styleToggle(btnB,(s.activePanelMode||'A')==='B');
    var sbd=document.getElementById('l4i-r-solar-breakdown');
    if(sbd)sbd.innerHTML='<strong>'+(s.activePanelMode==='B'?'Full Recharge':'Load Sustain')+'</strong> · <strong>'+s.strings+' string'+(s.strings>1?'s':'')+' × '+s.pps+' panels/string</strong> · Array: '+s.pvV+'V DC @ '+s.pvA+'A · '+s.expand+' expansion slot'+(s.expand!==1?'s':'')+' available';
    // Cables
    var cab=document.getElementById('l4i-r-cables');
    if(cab)cab.innerHTML=[['PV → Inverter (DC)',s.conn.pv],['Inverter → Battery (DC)',s.conn.bat],['Inverter → Changeover (AC)',s.conn.ac],['Grid → Inverter (AC)',s.conn.ac]].map(r=>'<tr><td class="conn-name">'+r[0]+'</td><td><span class="badge">'+r[1].cab.s+'mm²</span></td><td><span class="badge green">'+r[1].brk.a+'A</span></td></tr>').join('');
    // Quick-reference summary at top
    l4i__renderQuickSummary(s);
    // SPD
    l4i__renderSPD(s);
    // Earthing
    l4i__renderSoilSelector();
    l4i__renderEarth(s);
    // BOM
    l4i__renderBOM(s);
    // Show
    var res=document.getElementById('l4i-results'),ph=document.getElementById('l4i-placeholder');
    if(res)res.classList.add('visible'); if(ph)ph.style.display='none';
    var rp=document.querySelector('.right-panel');if(rp)rp.scrollTop=0;
    // Bridge to parent
    var _cr={invKva:s.inv.kva,numPanels:s.panels,lithiumPackKwh:b0.totalKwh||0,batUnits:b0.units||1,pvCable:s.conn.pv.cab.s,battCable:s.conn.bat.cab.s,acCable:s.conn.ac.cab.s,pvBreaker:s.conn.pv.brk.a,battBreaker:s.conn.bat.brk.a,acBreaker:s.conn.ac.brk.a};var _costs=egBuildCostBreakdown(_cr);var out={totalWatts:s.tw,dailyKwh:s.dw/1000,maxSurge:Math.round(s.surge),invKva:s.inv.kva,sysV:s.V,systemVoltage:s.V,lithiumPackKwh:b0.totalKwh||0,batUnits:b0.units||1,batLabel:b0.label||'',numPanels:s.panels,panelCount:s.panels,pvWatts:s.arrW,requiredPvWatts:s.reqWActive||s.reqW,panelMode:s.activePanelMode||'A',pvCable:s.conn.pv.cab.s,battCable:s.conn.bat.cab.s,acCable:s.conn.ac.cab.s,pvBreaker:s.conn.pv.brk.a,battBreaker:s.conn.bat.brk.a,acBreaker:s.conn.ac.brk.a,panelUnitPrice:_costs.panelUnitPrice,panelCost:_costs.panelCost,inverterCost:_costs.inverterCost,batteryUnitPrice:_costs.batteryUnitPrice,batteryCost:_costs.batteryCost,pvBreakerPrice:_costs.pvBreakerPrice,batteryBreakerPrice:_costs.batteryBreakerPrice,acBreakerPrice:_costs.acBreakerPrice,pvCablePerMeter:_costs.pvCablePerMeter,batteryCablePerMeter:_costs.batteryCablePerMeter,acCablePerMeter:_costs.acCablePerMeter,totalCost:_costs.totalCost};
    /* donor cleanup: removed parent receiveEmbeddedCalculation bridge */
  }

  function l4i__applyPanelMode(s,mode){
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
    s.arrW=panels*l4i_PANEL.wattage;
    s.pps=pps;
    s.strings=strings;
    s.pvV=+(pps*l4i_PANEL.vmp).toFixed(1);
    s.pvA=+(strings*l4i_PANEL.imp).toFixed(1);
    s.expand=(strings*pps)-panels;
    s.gen=+((panels*l4i_PANEL.wattage*(s.PSH||5)*(s.PR||0.75))/1000).toFixed(2);
    return s;
  }

  function l4i_egTogglePanel(mode){
    if(!l4i__egS)return;
    l4i__applyPanelMode(l4i__egS,mode);
    l4i__egS=l4i__buildBOM(l4i__egS,l4i__egS.selBat||0);
    l4i__renderResults(l4i__egS);
  }

  function l4i__renderQuickSummary(s){
    var el=document.getElementById('l4i-r-quick-summary');
    if(!el)return;
    var b0=s.opts&&s.opts[s.selBat||0]||{};
    var priceLow =Math.round(s.total*0.85/1000)*1000;
    var priceHigh=Math.round(s.total*1.15/1000)*1000;
    function fmtM(n){return n>=1000000?'₦'+(n/1000000).toFixed(1)+'M':'₦'+Number(n).toLocaleString('en-NG');}
    var rows=[
      ['Inverter',   s.inv.kva+'kVA @ '+s.V+'V'],
      ['Battery',    (b0.units||1)+'× '+(b0.label||'—')],
      ['Panels',     s.panels+' × 550W ('+s.strings+' string'+(s.strings>1?'s':'')+')'],
      ['PV Cable',   s.conn.pv.cab.s+'mm² | MCB '+s.conn.pv.brk.a+'A'],
      ['Bat Cable',  s.conn.bat.cab.s+'mm² | MCCB '+s.conn.bat.brk.a+'A'],
      ['AC Cable',   s.conn.ac.cab.s+'mm² | MCB '+s.conn.ac.brk.a+'A'],
      ['Est. Cost',  fmtM(priceLow)+' – '+fmtM(priceHigh)],
    ];
    el.innerHTML='<div style="border:1px solid var(--border,#334155);border-radius:12px;overflow:hidden;margin-bottom:14px;">'
      +'<div style="background:rgba(56,189,248,0.08);padding:10px 14px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#38bdf8;font-weight:700;">⚡ System Quick Reference</div>'
      +rows.map(function(r,i){
        return '<div style="display:flex;justify-content:space-between;padding:9px 14px;font-size:12px;border-top:1px solid var(--border,#334155);background:'+(i%2===0?'transparent':'rgba(255,255,255,0.02)')+'">'
          +'<span style="color:var(--muted,#94a3b8);font-weight:600;">'+r[0]+'</span>'
          +'<span style="color:var(--text,#f1f5f9);font-weight:'+(r[0]==='Est. Cost'?'800':'400')+';color:'+(r[0]==='Est. Cost'?'var(--sun,#f59e0b)':'var(--text,#f1f5f9)')+'">'+r[1]+'</span>'
          +'</div>';
      }).join('')
      +'</div>';
  }

  function l4i__renderBOM(s){
    var body=document.getElementById('l4i-r-bom-body'),tot=document.getElementById('l4i-r-bom-total');
    if(!body)return;
    body.innerHTML=s.bom.map((l,i)=>'<tr style="background:'+(i%2?'var(--panel,#f9fafb)':'transparent')+'"><td style="padding:9px 12px;font-size:12px">'+l.item+'<br><span style="color:var(--muted);font-size:10px">'+l.spec+'</span></td><td style="padding:9px 8px;text-align:center;font-size:12px">'+l.qty+'</td><td style="padding:9px 8px;text-align:right;font-size:12px;color:var(--muted)">'+l4i__fmt(l.up)+'</td><td style="padding:9px 8px;text-align:right;font-size:12px;font-weight:600;color:var(--sun)">'+l4i__fmt(l.lt)+'</td></tr>').join('');
    if(tot){
      var priceLow=Math.round(s.total*0.85/1000)*1000;
      var priceHigh=Math.round(s.total*1.15/1000)*1000;
      function fmtM(n){return n>=1000000?'₦'+(n/1000000).toFixed(1)+'M':'₦'+Number(n).toLocaleString('en-NG');}
      tot.innerHTML=fmtM(priceLow)+' – '+fmtM(priceHigh);
    }
  }

  function l4i__renderSPD(s){
    var el=document.getElementById('l4i-r-spd');
    if(!el||!s.spd)return;
    var dc=s.spd.dc, ac=s.spd.ac;
    el.innerHTML=
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px">'+
        '<div style="background:var(--panel,#f9fafb);border-radius:8px;padding:12px">'+
          '<div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">DC Side (PV → Inverter)</div>'+
          '<div style="font-size:16px;font-weight:700;color:var(--sun)">'+dc.uc+'V DC SPD</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-top:2px">Type 2 | String Voc: '+dc.stringVoc+'V</div>'+
          '<div style="font-size:11px;color:var(--muted)">Min Uc required: '+dc.minUc+'V</div>'+
        '</div>'+
        '<div style="background:var(--panel,#f9fafb);border-radius:8px;padding:12px">'+
          '<div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">AC Side (Output)</div>'+
          '<div style="font-size:16px;font-weight:700;color:var(--sun)">'+ac.uc+'V AC SPD</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-top:2px">Type 2 | 230V AC system</div>'+
        '</div>'+
      '</div>';
  }

  function l4i__renderSoilSelector(){
    var el=document.getElementById('l4i-r-soil-selector');
    if(!el)return;
    el.innerHTML='<label style="font-size:12px;color:var(--muted);display:block;margin-bottom:6px">Select soil type to calculate earthing:</label>'+
      '<select onchange="l4i__onSoilChange(this.value)" style="width:100%;padding:10px 12px;border:1px solid var(--border,#e5e7eb);border-radius:8px;font-size:13px;background:var(--bg,#fff);color:var(--text,#111)">'+
        '<option value="">— Choose soil type —</option>'+
        l4i_PC.soil.map(function(s){return '<option value="'+s.id+'">'+s.label+' ('+s.note+')</option>';}).join('')+
      '</select>';
  }

  function l4i__renderEarth(s){
    var el=document.getElementById('l4i-r-earth');
    if(!el)return;
    if(!s.earth){el.innerHTML='<div style="font-size:12px;color:var(--muted);padding:8px 0">Select soil type above to calculate earthing.</div>';return;}
    var e=s.earth;
    var warnHtml=e.warn?'<div style="background:#fff7ed;border:1px solid #fb923c;border-radius:8px;padding:10px;margin-top:8px;font-size:12px;color:#9a3412">⚠️ High resistivity soil ('+e.rho+' Ω·m). '+e.rods+' rods achieve '+e.rn+'Ω. Add bentonite/salt-charcoal compound around each rod.</div>':'';
    el.innerHTML=
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px">'+
        '<div style="background:var(--panel,#f9fafb);border-radius:8px;padding:12px">'+
          '<div style="font-size:10px;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Rod Specification</div>'+
          '<div style="font-size:16px;font-weight:700;color:var(--sun)">'+e.rods+' × Rod'+(e.rods>1?'s':'')+' Required</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-top:2px">3.0m × 16mm Copper-Bonded | Spacing: 6m min</div>'+
        '</div>'+
        '<div style="background:var(--panel,#f9fafb);border-radius:8px;padding:12px">'+
          '<div style="font-size:10px;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Achieved Resistance</div>'+
          '<div style="font-size:16px;font-weight:700;color:'+(e.warn?'#f59e0b':'#22c55e')+'">'+e.rn+' Ω</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-top:2px">Soil: '+e.soil+' (ρ='+e.rho+' Ω·m) | Target ≤5Ω</div>'+
        '</div>'+
      '</div>'+
      warnHtml;
  }

  function l4i_egPickBat(i){
    if(!l4i__egS)return;
    l4i__egS.selBat=i; l4i__egS=l4i__buildBOM(l4i__egS,i); l4i__renderBOM(l4i__egS);
    var b=l4i__egS.opts[i];
    if(b){function set(id,v){var el=document.getElementById(id);if(el)el.textContent=v;}set('s-battery-main',b.units+' × '+b.label);set('s-battery-config',b.wiring);set('s-battery-alt',b.totalKwh+' kWh total');}
    l4i__egS.opts.forEach((_,j)=>{var c=document.getElementById('l4i-ebo-'+j);if(c)c.style.borderColor=j===i?'var(--sun)':'var(--border)';});
  }

  // ── UI FUNCTIONS ─────────────────────────────────────────────────────────
  function l4i_getDefaultHours(cat){return l4i_default_hours_by_category[cat]||1;}
  function l4i_detectFridgeMode(name){var n=(name||'').toLowerCase();if(n.includes('freezer'))return'chest_freezer';if(n.includes('mini fridge'))return'inverter_fridge';if(n.includes('fridge')||n.includes('refrigerator'))return'normal_fridge';return'none';}
  function l4i_getAppliancePreset(name){var n=(name||'').toLowerCase().trim();return l4i_default_appliances.find(a=>a.name.toLowerCase()===n)||l4i_default_appliances.find(a=>n&&a.name.toLowerCase().includes(n));}
  function l4i_getFridgeDutyFactor(item){if(item.dutyCycle!=null)return item.dutyCycle;var m=l4i_detectFridgeMode(item.name);return m==='inverter_fridge'?0.35:m==='normal_fridge'?0.5:m==='chest_freezer'?0.6:1;}
  function l4i_resetForm(){['l4i-inp-name','l4i-inp-watts','l4i-inp-hours'].forEach(id=>{var el=document.getElementById(id);if(el)el.value='';});var q=document.getElementById('l4i-inp-qty');if(q)q.value='1';var m=document.getElementById('l4i-inp-fridge-mode');if(m)m.value='none';}
  function l4i_syncFormFromPreset(){var ne=document.getElementById('l4i-inp-name'),we=document.getElementById('l4i-inp-watts'),he=document.getElementById('l4i-inp-hours');var p=l4i_getAppliancePreset(ne&&ne.value);if(!p)return;if(we&&!we.value)we.value=p.watts;if(he&&!he.value)he.value=l4i_getDefaultHours(p.category);}

  function l4i_renderQuickAddChips(){
    var box=document.getElementById('l4i-preset-chips');if(!box)return;
    var co=['lighting','electronics','fan','fridge','freezer','kitchen','heating','laundry','pump','air_conditioner','business'];
    var cl={lighting:'Lighting',electronics:'Electronics',fan:'Fans',fridge:'Fridges',freezer:'Freezers',kitchen:'Kitchen',heating:'Heating',laundry:'Laundry',pump:'Pumps',air_conditioner:'Air Conditioners',business:'Business'};
    var g=l4i_default_appliances.reduce((acc,a)=>{var k=a.category||'other';if(!acc[k])acc[k]=[];acc[k].push(a);return acc;},{});
    var cats=co.filter(c=>g[c]&&g[c].length).concat(Object.keys(g).filter(c=>!co.includes(c)));
    box.innerHTML=cats.map(cat=>'<div class="preset-category" style="margin-bottom:12px"><div class="section-label" style="margin:0 0 6px;font-size:12px;opacity:.85">'+(cl[cat]||cat)+'</div><div class="l4i-preset-chips" style="margin-top:0">'+g[cat].map(a=>'<span class="chip" onclick="l4i_egQuickAdd(\''+a.name.replace(/'/g,"\'")+'\')">'+(a.emoji||'⚡')+' '+a.name+'</span>').join('')+'</div></div>').join('');
  }

  function l4i_renderApplianceSuggestions(){var list=document.getElementById('l4i-appliance-suggestions');if(!list)return;list.innerHTML=l4i_default_appliances.map(a=>'<option value="'+a.name+'"></option>').join('');}

  function l4i_addItem(item){item.id=Date.now()+Math.random();l4i_appliances.push(item);l4i_renderList();}

  function l4i_egQuickAdd(name){var p=l4i_getAppliancePreset(name);if(!p)return;l4i_addItem({name:p.name,watts:p.watts,qty:1,hours:l4i_getDefaultHours(p.category),inductive:p.inductive,dutyCycle:p.dutyCycle});l4i_resetForm();}

  // keep old name working too
  function l4i_quickAddPreset(name){l4i_egQuickAdd(name);}
  function l4i_quickAdd(name,watts,qty,hours,fm){var p=l4i_getAppliancePreset(name);var ind=p?p.inductive:false;var dc=p?p.dutyCycle:null;l4i_addItem({name:name,watts:watts,qty:qty,hours:hours,inductive:ind,dutyCycle:dc});l4i_resetForm();}

  function l4i_addAppliance(){
    l4i_syncFormFromPreset();
    var name=(document.getElementById('l4i-inp-name')||{}).value&&document.getElementById('l4i-inp-name').value.trim();
    var watts=parseFloat((document.getElementById('l4i-inp-watts')||{}).value);
    var qty=parseInt((document.getElementById('l4i-inp-qty')||{}).value);
    var hours=parseFloat((document.getElementById('l4i-inp-hours')||{}).value);
    if(!name){showToast('Please enter an appliance name.','error');return;}
    if(isNaN(watts)||watts<=0){showToast('Please enter valid watts.','error');return;}
    if(isNaN(qty)||qty<=0){showToast('Please enter a valid quantity.','error');return;}
    if(isNaN(hours)||hours<=0){showToast('Please enter valid hours per day.','error');return;}
    var p=l4i_getAppliancePreset(name);
    l4i_addItem({name:name,watts:watts,qty:qty,hours:hours,inductive:p?p.inductive:['fridge','freezer','ac','pump','motor','compressor','washing'].some(k=>name.toLowerCase().includes(k)),dutyCycle:p?p.dutyCycle:null});
    l4i_resetForm(); var ne=document.getElementById('l4i-inp-name');if(ne)ne.focus();
  }

  function l4i_removeAppliance(id){
    l4i_appliances=l4i_appliances.filter(a=>a.id!==id); l4i_renderList();
    if(!l4i_appliances.length){var res=document.getElementById('l4i-results');if(res)res.classList.remove('visible');var ph=document.getElementById('l4i-placeholder');if(ph)ph.style.display='flex';}
  }

  function l4i_renderList(){
    var list=document.getElementById('l4i-appliance-list');
    var c=document.getElementById('l4i-count');if(c)c.textContent=l4i_appliances.length;
    var btn=document.getElementById('l4i-calc-btn');if(btn)btn.disabled=!l4i_appliances.length;
    if(!list)return;
    if(!l4i_appliances.length){list.innerHTML='<div class="empty-state"><div class="icon">🏠</div><p>No l4i_appliances added yet.<br/>Use the form or chips above.</p></div>';return;}
    list.innerHTML=l4i_appliances.map(a=>{var effH=a.dutyCycle?24*a.dutyCycle:a.hours;var d=(a.watts*a.qty*effH/1000).toFixed(2);return '<div class="appliance-item"><div class="app-info"><div class="app-name">'+a.name+'</div><div class="app-details"><span>'+a.watts+'W</span> × <span>'+a.qty+'</span> · <span>'+(a.dutyCycle?'24h ('+Math.round(a.dutyCycle*100)+'% duty)':a.hours+'h/day')+'</span></div></div><div style="display:flex;align-items:center;gap:12px"><div class="app-daily"><strong>'+d+'</strong> kWh/day</div><button class="btn-remove" onclick="l4i_removeAppliance('+a.id+')">✕</button></div></div>';}).join('');
  }

  document.addEventListener('DOMContentLoaded',function(){l4i_renderQuickAddChips();l4i_renderApplianceSuggestions();var ne=document.getElementById('l4i-inp-name');if(ne){ne.addEventListener('change',l4i_syncFormFromPreset);ne.addEventListener('blur',l4i_syncFormFromPreset);}});

  function l4i_calculate(){if(!l4i_appliances.length)return;l4i__egS=l4i__runEngine(l4i_appliances);l4i__applyPanelMode(l4i__egS,'A');l4i__egS=l4i__buildBOM(l4i__egS,0);l4i__renderResults(l4i__egS);
    try {
      var b0 = (l4i__egS && l4i__egS.opts && l4i__egS.opts[l4i__egS.selBat || 0]) || {};
      var _cr={invKva:l4i__egS.inv.kva,numPanels:l4i__egS.panels,lithiumPackKwh:b0.totalKwh||0,batUnits:b0.units||1,pvCable:l4i__egS.conn.pv.cab.s,battCable:l4i__egS.conn.bat.cab.s,acCable:l4i__egS.conn.ac.cab.s,pvBreaker:l4i__egS.conn.pv.brk.a,battBreaker:l4i__egS.conn.bat.brk.a,acBreaker:l4i__egS.conn.ac.brk.a};
      var _costs=(typeof egBuildCostBreakdown==='function'? egBuildCostBreakdown(_cr):{})||{};
      const inverterWatts = Math.round((l4i__egS.inv && l4i__egS.inv.kva ? l4i__egS.inv.kva * 1000 : 0));
      const panelModelText = `${Math.round((l4i__egS.panelW || 550))}W Solar Panel`;
      instCalculationResult = {
        // Launch 4 bridge fields
        totalWatts: l4i__egS.tw,
        dailyKwh: +(l4i__egS.dw/1000).toFixed(2),
        maxSurge: Math.round(l4i__egS.surge),
        invKva: l4i__egS.inv.kva,
        invModel: `${l4i__egS.inv.kva}kVA ${l4i__egS.V}V Hybrid Inverter`,
        sysV: l4i__egS.V,
        systemVoltage: l4i__egS.V,
        acCurrent: l4i__egS.acA,
        lithiumPackKwh: b0.totalKwh || 0,
        batUnits: b0.units || 1,
        batLabel: b0.label || '',
        numPanels: l4i__egS.panels,
        panelCount: l4i__egS.panels,
        pvWatts: l4i__egS.arrW,
        requiredPvWatts: l4i__egS.reqWActive || l4i__egS.reqW,
        panelMode: l4i__egS.activePanelMode || 'A',
        pvCable: l4i__egS.conn.pv.cab.s,
        battCable: l4i__egS.conn.bat.cab.s,
        acCable: l4i__egS.conn.ac.cab.s,
        pvBreaker: l4i__egS.conn.pv.brk.a,
        battBreaker: l4i__egS.conn.bat.brk.a,
        acBreaker: l4i__egS.conn.ac.brk.a,
        panelUnitPrice: _costs.panelUnitPrice || (typeof EG_PANEL_PRICE_550W !== 'undefined' ? EG_PANEL_PRICE_550W : ((typeof EG_PANEL_PRICE_500W !== 'undefined' ? EG_PANEL_PRICE_500W : 130000))),
        panelCost: Number(_costs.panelCost || 0),
        inverterCost: Number(_costs.inverterCost || 0),
        batteryUnitPrice: Number(_costs.batteryUnitPrice || 0),
        batteryCost: Number(_costs.batteryCost || 0),
        pvBreakerPrice: Number(_costs.pvBreakerPrice || 0),
        batteryBreakerPrice: Number(_costs.batteryBreakerPrice || 0),
        acBreakerPrice: Number(_costs.acBreakerPrice || 0),
        pvCablePerMeter: Number(_costs.pvCablePerMeter || 0),
        batteryCablePerMeter: Number(_costs.batteryCablePerMeter || 0),
        acCablePerMeter: Number(_costs.acCablePerMeter || 0),
        pvCableCost: Number(_costs.pvCableCost || 0),
        batteryCableCost: Number(_costs.batteryCableCost || 0),
        acCableCost: Number(_costs.acCableCost || 0),
        totalCost: Number(_costs.totalCost || l4i__egS.total || 0),
        appliances: l4i_appliances.slice(),

        // Version 13 installer downstream compatibility fields
        totalRunning: l4i__egS.tw || 0,
        dailyEnergy: l4i__egS.dw || 0,
        requiredInverter: inverterWatts,
        totalPanels: l4i__egS.panels || 0,
        actualPvPower: l4i__egS.arrW || 0,
        batteryCount: b0.units || 1,
        batteryBankKwh: b0.totalKwh || 0,
        panel: { model: panelModelText, watts: Math.round((l4i__egS.panelW || 550)) },
        cables: [
          { name: 'PV Cable', cable: { size_mm2: l4i__egS.conn.pv.cab.s || '—' } },
          { name: 'Battery Cable', cable: { size_mm2: l4i__egS.conn.bat.cab.s || '—' } },
          { name: 'AC Cable', cable: { size_mm2: l4i__egS.conn.ac.cab.s || '—' } }
        ],
        breakers: [
          { name: 'PV Breaker', rating_A: l4i__egS.conn.pv.brk.a || 0, type: 'DC' },
          { name: 'Battery Breaker', rating_A: l4i__egS.conn.bat.brk.a || 0, type: 'DC' },
          { name: 'AC Breaker', rating_A: l4i__egS.conn.ac.brk.a || 0, type: 'AC' }
        ]
      };
      var egViewBtn = document.getElementById('eg-view-results-btn');
      if (egViewBtn) egViewBtn.style.display = 'block';
      // Track calculation event — fire-and-forget
      if (typeof trackCalculationEvent === 'function') trackCalculationEvent('installer');
    } catch(e) { console.warn('L4 installer calc bridge error:', e); }
}

  // Enter key
  document.addEventListener('keydown',function(e){if(e.key==='Enter'&&document.activeElement.closest('.add-form'))l4i_addAppliance();});

  // Called by showScreen when installer-calculator becomes visible
  function instCalcInitChips(){ l4i_renderQuickAddChips(); l4i_renderApplianceSuggestions(); }

