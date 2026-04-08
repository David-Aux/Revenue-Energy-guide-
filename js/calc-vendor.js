  // ── APPLIANCE DATABASE ───────────────────────────────────────────────────
  let l4v_appliances = [];

  const l4v_default_hours_by_category = {
    lighting:6,electronics:6,fan:8,fridge:24,freezer:24,
    kitchen:1,heating:1,laundry:1,pump:1,air_conditioner:6,business:2
  };

  const l4v_default_appliances = [
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
  const l4v_INVERTER_DB = [
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

  const l4v_BATTERY_DB = {
    12:[{label:'12V 100Ah LiFePO4',ah:100,kwh:1.28},{label:'12V 200Ah LiFePO4',ah:200,kwh:2.56}],
    24:[{label:'24V 2.5kWh Pack',kwh:2.5},{label:'24V 3.0kWh Pack',kwh:3.0},{label:'24V 3.5kWh Pack',kwh:3.5}],
    48:[{label:'48V 5kWh Pack',kwh:5.0},{label:'48V 7.5kWh Pack',kwh:7.5},{label:'48V 9.6kWh Pack',kwh:9.6},
        {label:'48V 10kWh Pack',kwh:10.0},{label:'48V 15kWh Pack',kwh:15.0},{label:'48V 17.5kWh Pack',kwh:17.5},{label:'48V 20kWh Pack',kwh:20.0}],
  };

  const l4v_PANEL = {wattage:550,vmp:41.8,imp:12.2};

  const l4v_PC = {
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
    dcCab:[{s:2.5,a:22,p:650},{s:4,a:30,p:1100},{s:6,a:40,p:1800},{s:10,a:54,p:3200},{s:16,a:73,p:5500},{s:25,a:95,p:8500},{s:35,a:117,p:12000},{s:50,a:141,p:17000},{s:70,a:179,p:24000},{s:95,a:215,p:33000},{s:120,a:249,p:44000},{s:150,a:285,p:57000}],
    acCab:[{s:2.5,a:20,p:650},{s:4,a:27,p:1100},{s:6,a:35,p:1800},{s:10,a:48,p:3200},{s:16,a:65,p:5500},{s:25,a:84,p:8500},{s:35,a:103,p:12000},{s:50,a:125,p:17000}],
    dcMcb: [{a:6,p:3500},{a:10,p:3500},{a:16,p:3500},{a:20,p:3500},{a:25,p:3800},{a:32,p:4000},{a:40,p:4500},{a:50,p:5500},{a:63,p:6500}],
    dcMccb:[{a:63,p:18000},{a:80,p:22000},{a:100,p:27000},{a:125,p:32000},{a:140,p:38000},{a:160,p:44000},{a:200,p:58000},{a:250,p:75000},{a:300,p:95000},{a:400,p:130000}],
    acMcb: [{a:6,p:2500},{a:10,p:2500},{a:16,p:2500},{a:20,p:2500},{a:25,p:2800},{a:32,p:3000},{a:40,p:3500},{a:50,p:4000},{a:63,p:5000},{a:80,p:7500},{a:100,p:9500}],
  };

  // ── HELPERS ──────────────────────────────────────────────────────────────
  function l4v__cab(d,t,floor){var c=t.find(x=>x.a>=d)||t[t.length-1];return(floor&&c.s<6)?t.find(x=>x.s===6):c;}
  function l4v__brk(d,t){return t.find(x=>x.a>=d)||t[t.length-1];}
  function l4v__invP(k,v){var m=l4v_PC.inv.find(i=>i.kva===k&&i.v===v);return m?m.p:0;}
  function l4v__batP(v,k){var f=l4v_PC.bat[v]||[];var m=f.find(b=>b.kwh===k);return m?m.p:0;}
  function l4v__fmt(n){return '₦'+Number(n).toLocaleString('en-NG');}

  // ── ENGINE ───────────────────────────────────────────────────────────────
  var l4v__egS=null;

  function l4v__runEngine(apps){
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
    var inv=l4v_INVERTER_DB.find(i=>i.kva>=reqKva)||l4v_INVERTER_DB[l4v_INVERTER_DB.length-1];
    var fpV=inv.v, acA=(inv.kva*1000)/230;

    // Step 3 — Battery + voltage conflict
    var DOD=0.8,EFF=0.85,V=fpV;
    var rawAh=dw/(V*DOD*EFF);
    var reqV=rawAh<=200?12:rawAh<=400?24:48;
    var conflict=reqV>V;
    if(conflict){
      V=reqV;
      inv=l4v_INVERTER_DB.find(i=>i.v===V&&i.kva>=reqKva)||l4v_INVERTER_DB.filter(i=>i.v===V).pop();
      rawAh=dw/(V*DOD*EFF); acA=(inv.kva*1000)/230;
    }
    var reqKwh=rawAh*V/1000;

    // 48V pivot: if 24V would need 3+ packs, escalate to 48V for a cleaner single-pack system
    if(V===24){
      var _wu24=l4v_BATTERY_DB[24].map(function(p){return {kwh:p.kwh,units:Math.ceil(reqKwh/p.kwh)};}));
      _wu24.sort(function(a,b){return a.units-b.units||a.kwh-b.kwh;});
      if(_wu24[0]&&_wu24[0].units>=3){
        V=48;
        inv=l4v_INVERTER_DB.find(function(i){return i.v===48&&i.kva>=reqKva;})||l4v_INVERTER_DB.filter(function(i){return i.v===48;}).pop();
        rawAh=dw/(V*DOD*EFF); reqKwh=rawAh*V/1000; acA=(inv.kva*1000)/230;
      }
    }

    var fam=l4v_BATTERY_DB[V],opts=[];
    if(V===12){
      // Fewest units first — 1x200Ah beats 2x100Ah when rawAh <= 200
      var wu12=fam.map(function(m){return {label:m.label,ah:m.ah,kwh:m.kwh,units:Math.ceil(rawAh/m.ah)};});
      wu12.sort(function(a,b){return a.units-b.units||a.ah-b.ah;});
      var oA12=wu12[0],oB12=wu12.find(function(m){return m.units>oA12.units||(m.units===oA12.units&&m.ah>oA12.ah);});
      [oA12,oB12].filter(Boolean).forEach(function(m){var u=m.units,pe=l4v__batP(12,m.kwh);
        opts.push({label:m.label,units:u,totalKwh:+(u*m.kwh).toFixed(2),wiring:u+' unit'+(u>1?'s':'')+' in parallel',warn:u>4?'Exceeds 4-string limit':null,pe:pe,total:u*pe});});
    } else {
      // Sort by fewest units first, then smallest kWh — so 1x7.5kWh beats 2x5kWh
      var wu=fam.map(function(p){return {label:p.label,kwh:p.kwh,units:Math.ceil(reqKwh/p.kwh)};});
      wu.sort(function(a,b){return a.units-b.units||a.kwh-b.kwh;});
      var oA=wu[0], oB=wu.find(function(p){return p.units>oA.units||(p.units===oA.units&&p.kwh>oA.kwh);});
      [oA,oB].filter(Boolean).forEach(function(p){
        var pe=l4v__batP(V,p.kwh);
        opts.push({label:p.label,units:p.units,totalKwh:+(p.units*p.kwh).toFixed(2),wiring:p.units+' pack'+(p.units>1?'s':'')+' in parallel',warn:p.units>4?'Exceeds 4-string limit':null,pe:pe,total:p.units*pe});});
    }

    // Step 4 — Panels
    var PSH=5,LOSS=1.3,PR=0.75,PW=l4v_PANEL.wattage,Vmp=l4v_PANEL.vmp,Imp=l4v_PANEL.imp;
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
      pv:  {op:+pvOp.toFixed(1),d:+pvD.toFixed(1),cab:l4v__cab(pvD,l4v_PC.dcCab,true), brk:l4v__brk(Math.max(pvD,16), l4v_PC.dcMcb)},
      bat: {op:+bOp.toFixed(1), d:+bD.toFixed(1), cab:l4v__cab(bD, l4v_PC.dcCab,true), brk:l4v__brk(Math.max(bD,63),  l4v_PC.dcMccb)},
      ac:  {op:+acA.toFixed(1), d:+aD.toFixed(1), cab:l4v__cab(aD, l4v_PC.acCab,false),brk:l4v__brk(Math.max(aD,16),  l4v_PC.acMcb)},
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
    };
  }

  function l4v__buildBOM(s,bi){
    var bom=[],tot=0;
    function add(item,spec,qty,up){var lt=qty*up;bom.push({item:item,spec:spec,qty:qty,up:up,lt:lt});tot+=lt;}
    add('Inverter',s.inv.kva+'kVA Hybrid MPPT @ '+s.V+'V',1,l4v__invP(s.inv.kva,s.V));
    var b=s.opts[bi];if(b)add('Battery',b.label,b.units,b.pe);
    add('Solar Panel',l4v_PANEL.wattage+'W Mono PERC',s.panels,l4v_PC.panel);
    add('PV Cable DC',s.conn.pv.cab.s+'mm² DC ~20m',20,s.conn.pv.cab.p);
    add('Battery Cable DC',s.conn.bat.cab.s+'mm² DC ~2m',2,s.conn.bat.cab.p);
    add('AC Cable',s.conn.ac.cab.s+'mm² AC ~20m',20,s.conn.ac.cab.p);
    add('DC MCB PV',s.conn.pv.brk.a+'A DC MCB',1,s.conn.pv.brk.p);
    add('DC MCCB Battery',s.conn.bat.brk.a+'A DC MCCB',1,s.conn.bat.brk.p);
    add('AC MCB Changeover',s.conn.ac.brk.a+'A AC MCB',1,s.conn.ac.brk.p);
    add('AC MCB Grid',s.conn.ac.brk.a+'A AC MCB',1,s.conn.ac.brk.p);
    s.bom=bom; s.total=tot; return s;
  }

  function l4v__renderResults(s){
    function set(id,v){var el=document.getElementById(id);if(el)el.textContent=v;}
    function styleToggle(btn,active){
      if(!btn)return;
      btn.style.background=active?'var(--sun)':'var(--panel)';
      btn.style.borderColor=active?'var(--sun)':'var(--border)';
      btn.style.color=active?'#fff':'var(--text)';
      btn.style.boxShadow=active?'0 6px 18px rgba(0,0,0,0.08)':'none';
    }
    var N=n=>Number(n).toLocaleString('en-NG');
    l4v__applyPanelMode(s,s.activePanelMode||'A');
    var b0=s.opts[s.selBat||0]||s.opts[0]||{};
    // Simple cards
    set('l4v-s-inverter-kva',s.inv.kva+' kVA');
    set('l4v-s-inverter-model','Hybrid MPPT Inverter');
    set('l4v-s-inverter-voltage','Recommended size for quotation');
    set('l4v-s-panels-count',s.panels+' panels');
    set('l4v-s-panels-size',l4v_PANEL.wattage+'W Mono PERC');
    set('l4v-s-panels-total',N(s.arrW)+'W Array');
    set('l4v-s-battery-main',(b0.units||'-')+' x '+(b0.label||'-'));
    set('l4v-s-battery-config',(b0.label||'-'));
    set('l4v-s-battery-alt',(b0.totalKwh||'-')+' kWh total');
    set('l4v-s-panels-mode',(s.activePanelMode==='B'?'Full Recharge':'Load Sustain')+' • '+N(s.reqWActive||s.reqW)+'W required');
    // Load
    set('l4v-r-watts',N(s.tw)); set('l4v-r-kwh',(s.dw/1000).toFixed(2)); set('l4v-r-surge',N(Math.round(s.surge)));
    // Inverter
    set('l4v-r-voltage',s.V); set('l4v-r-kva',s.inv.kva);
    set('l4v-r-inv-model',s.inv.kva+'kVA @ '+s.V+'V'); set('l4v-r-ac-amps',s.acA.toFixed(1));
    // Conflict badge
    var badge=document.getElementById('l4v-r-conflict-badge'),ct=document.getElementById('l4v-r-conflict-text');
    if(badge&&ct){if(s.conflict){ct.textContent='Battery required '+s.V+'V but first-pass was '+s.fpV+'V. Inverter re-selected: '+s.inv.kva+'kVA @ '+s.V+'V.';badge.style.display='block';}else{badge.style.display='none';}}
    // Battery cards
    var bd=document.getElementById('l4v-r-battery-options');
    if(bd)bd.innerHTML=s.opts.map((o,i)=>'<div class="battery-card" id="ebo-'+i+'" style="cursor:pointer;border:2px solid '+(i===(s.selBat||0)?'var(--sun)':'var(--border)')+';transition:border-color 0.2s" onclick="l4v_egPickBat('+i+')">'+'<div class="btype">Option '+String.fromCharCode(65+i)+'</div>'+'<div class="bval" style="font-size:18px;">'+o.units+' ×</div>'+'<div style="font-size:11px;color:var(--sun);font-weight:700;margin:2px 0">'+o.label+'</div>'+'<div class="bunit">'+o.totalKwh+' kWh total</div>'+'<div style="font-size:11px;color:var(--muted);margin-top:4px">'+o.wiring+'</div>'+'<div style="font-size:12px;color:var(--sun);font-weight:700;margin-top:6px">'+l4v__fmt(o.total)+'</div>'+(o.warn?'<div style="font-size:10px;color:#ef4444;margin-top:4px">⚠ '+o.warn+'</div>':'')+'</div>').join('');
    // Solar
    set('l4v-r-pv-watts',N(s.reqWActive||s.reqW)); set('l4v-r-panels',s.panels); set('l4v-r-gen',s.gen);
    set('l4v-r-coverage',((s.gen/(s.dw/1000))*100).toFixed(0)+'%');
    var btnA=document.getElementById('l4v-panel-toggle-A'),btnB=document.getElementById('l4v-panel-toggle-B');
    styleToggle(btnA,(s.activePanelMode||'A')==='A'); styleToggle(btnB,(s.activePanelMode||'A')==='B');
    var sbd=document.getElementById('l4v-r-solar-breakdown');
    if(sbd)sbd.innerHTML='<strong>'+(s.activePanelMode==='B'?'Full Recharge':'Load Sustain')+'</strong> · <strong>'+s.strings+' string'+(s.strings>1?'s':'')+' × '+s.pps+' panels/string</strong> · Array: '+s.pvV+'V DC @ '+s.pvA+'A · '+s.expand+' expansion slot'+(s.expand!==1?'s':'')+' available';
    // Cables
    var cab=document.getElementById('l4v-r-cables');
    if(cab)cab.innerHTML=[['PV → Inverter (DC)',s.conn.pv],['Inverter → Battery (DC)',s.conn.bat],['Inverter → Changeover (AC)',s.conn.ac],['Grid → Inverter (AC)',s.conn.ac]].map(r=>'<tr><td class="conn-name">'+r[0]+'</td><td><span class="badge">'+r[1].cab.s+'mm²</span></td><td><span class="badge green">'+r[1].brk.a+'A</span></td></tr>').join('');
    // BOM
    l4v__renderBOM(s);
    // Show
    var res=document.getElementById('l4v-results'),ph=document.getElementById('l4v-placeholder');
    if(res)res.classList.add('visible'); if(ph)ph.style.display='none';
    var rp=document.querySelector('.right-panel');if(rp)rp.scrollTop=0;
    // Bridge to parent
    var _cr={invKva:s.inv.kva,numPanels:s.panels,lithiumPackKwh:b0.totalKwh||0,batUnits:b0.units||1,pvCable:s.conn.pv.cab.s,battCable:s.conn.bat.cab.s,acCable:s.conn.ac.cab.s,pvBreaker:s.conn.pv.brk.a,battBreaker:s.conn.bat.brk.a,acBreaker:s.conn.ac.brk.a};var _costs=egBuildCostBreakdown(_cr);var out={totalWatts:s.tw,dailyKwh:s.dw/1000,maxSurge:Math.round(s.surge),invKva:s.inv.kva,sysV:s.V,systemVoltage:s.V,lithiumPackKwh:b0.totalKwh||0,batUnits:b0.units||1,batLabel:b0.label||'',numPanels:s.panels,panelCount:s.panels,pvWatts:s.arrW,requiredPvWatts:s.reqWActive||s.reqW,panelMode:s.activePanelMode||'A',pvCable:s.conn.pv.cab.s,battCable:s.conn.bat.cab.s,acCable:s.conn.ac.cab.s,pvBreaker:s.conn.pv.brk.a,battBreaker:s.conn.bat.brk.a,acBreaker:s.conn.ac.brk.a,panelUnitPrice:_costs.panelUnitPrice,panelCost:_costs.panelCost,inverterCost:_costs.inverterCost,batteryUnitPrice:_costs.batteryUnitPrice,batteryCost:_costs.batteryCost,pvBreakerPrice:_costs.pvBreakerPrice,batteryBreakerPrice:_costs.batteryBreakerPrice,acBreakerPrice:_costs.acBreakerPrice,pvCablePerMeter:_costs.pvCablePerMeter,batteryCablePerMeter:_costs.batteryCablePerMeter,acCablePerMeter:_costs.acCablePerMeter,totalCost:_costs.totalCost};
    /* donor cleanup: removed parent receiveEmbeddedCalculation bridge */
  }

  function l4v__applyPanelMode(s,mode){
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
    s.arrW=panels*l4v_PANEL.wattage;
    s.pps=pps;
    s.strings=strings;
    s.pvV=+(pps*l4v_PANEL.vmp).toFixed(1);
    s.pvA=+(strings*l4v_PANEL.imp).toFixed(1);
    s.expand=(strings*pps)-panels;
    s.gen=+((panels*l4v_PANEL.wattage*(s.PSH||5)*(s.PR||0.75))/1000).toFixed(2);
    return s;
  }

  function l4v_egTogglePanel(mode){
    if(!l4v__egS)return;
    l4v__applyPanelMode(l4v__egS,mode);
    l4v__egS=l4v__buildBOM(l4v__egS,l4v__egS.selBat||0);
    l4v__renderResults(l4v__egS);
  }

  function l4v__renderBOM(s){
    var body=document.getElementById('l4v-r-bom-body'),tot=document.getElementById('l4v-r-bom-total');
    if(!body)return;
    body.innerHTML=s.bom.map((l,i)=>'<tr style="background:'+(i%2?'var(--panel,#f9fafb)':'transparent')+'"><td style="padding:9px 12px;font-size:12px">'+l.item+'<br><span style="color:var(--muted);font-size:10px">'+l.spec+'</span></td><td style="padding:9px 8px;text-align:center;font-size:12px">'+l.qty+'</td><td style="padding:9px 8px;text-align:right;font-size:12px;color:var(--muted)">'+l4v__fmt(l.up)+'</td><td style="padding:9px 8px;text-align:right;font-size:12px;font-weight:600;color:var(--sun)">'+l4v__fmt(l.lt)+'</td></tr>').join('');
    if(tot)tot.textContent=l4v__fmt(s.total);
  }

  function l4v_egPickBat(i){
    if(!l4v__egS)return;
    l4v__egS.selBat=i; l4v__egS=l4v__buildBOM(l4v__egS,i); l4v__renderBOM(l4v__egS);
    var b=l4v__egS.opts[i];
    if(b){function set(id,v){var el=document.getElementById(id);if(el)el.textContent=v;}set('l4v-s-battery-main',b.units+' × '+b.label);set('l4v-s-battery-config',b.wiring);set('l4v-s-battery-alt',b.totalKwh+' kWh total');}
    l4v__egS.opts.forEach((_,j)=>{var c=document.getElementById('l4v-ebo-'+j);if(c)c.style.borderColor=j===i?'var(--sun)':'var(--border)';});
  }

  // ── UI FUNCTIONS ─────────────────────────────────────────────────────────
  function l4v_getDefaultHours(cat){return l4v_default_hours_by_category[cat]||1;}
  function l4v_detectFridgeMode(name){var n=(name||'').toLowerCase();if(n.includes('freezer'))return'chest_freezer';if(n.includes('mini fridge'))return'inverter_fridge';if(n.includes('fridge')||n.includes('refrigerator'))return'normal_fridge';return'none';}
  function l4v_getAppliancePreset(name){var n=(name||'').toLowerCase().trim();return l4v_default_appliances.find(a=>a.name.toLowerCase()===n)||l4v_default_appliances.find(a=>n&&a.name.toLowerCase().includes(n));}
  function l4v_getFridgeDutyFactor(item){if(item.dutyCycle!=null)return item.dutyCycle;var m=l4v_detectFridgeMode(item.name);return m==='inverter_fridge'?0.35:m==='normal_fridge'?0.5:m==='chest_freezer'?0.6:1;}
  function l4v_resetForm(){['l4v-inp-name','l4v-inp-watts','l4v-inp-hours'].forEach(id=>{var el=document.getElementById(id);if(el)el.value='';});var q=document.getElementById('l4v-inp-qty');if(q)q.value='1';var m=document.getElementById('l4v-inp-fridge-mode');if(m)m.value='none';}
  function l4v_syncFormFromPreset(){var ne=document.getElementById('l4v-inp-name'),we=document.getElementById('l4v-inp-watts'),he=document.getElementById('l4v-inp-hours');var p=l4v_getAppliancePreset(ne&&ne.value);if(!p)return;if(we&&!we.value)we.value=p.watts;if(he&&!he.value)he.value=l4v_getDefaultHours(p.category);}

  function l4v_renderQuickAddChips(){
    var box=document.getElementById('l4v-preset-chips');if(!box)return;
    var co=['lighting','electronics','fan','fridge','freezer','kitchen','heating','laundry','pump','air_conditioner','business'];
    var cl={lighting:'Lighting',electronics:'Electronics',fan:'Fans',fridge:'Fridges',freezer:'Freezers',kitchen:'Kitchen',heating:'Heating',laundry:'Laundry',pump:'Pumps',air_conditioner:'Air Conditioners',business:'Business'};
    var g=l4v_default_appliances.reduce((acc,a)=>{var k=a.category||'other';if(!acc[k])acc[k]=[];acc[k].push(a);return acc;},{});
    var cats=co.filter(c=>g[c]&&g[c].length).concat(Object.keys(g).filter(c=>!co.includes(c)));
    box.innerHTML=cats.map(cat=>'<div class="preset-category" style="margin-bottom:12px"><div class="section-label" style="margin:0 0 6px;font-size:12px;opacity:.85">'+(cl[cat]||cat)+'</div><div class="l4v-preset-chips" style="margin-top:0">'+g[cat].map(a=>'<span class="chip" onclick="l4v_egQuickAdd(\''+a.name.replace(/'/g,"\'")+'\')">'+(a.emoji||'⚡')+' '+a.name+'</span>').join('')+'</div></div>').join('');
  }

  function l4v_renderApplianceSuggestions(){var list=document.getElementById('l4v-appliance-suggestions');if(!list)return;list.innerHTML=l4v_default_appliances.map(a=>'<option value="'+a.name+'"></option>').join('');}

  function l4v_addItem(item){item.id=Date.now()+Math.random();l4v_appliances.push(item);l4v_renderList();}

  function l4v_egQuickAdd(name){var p=l4v_getAppliancePreset(name);if(!p)return;l4v_addItem({name:p.name,watts:p.watts,qty:1,hours:l4v_getDefaultHours(p.category),inductive:p.inductive,dutyCycle:p.dutyCycle});l4v_resetForm();}

  // keep old name working too
  function l4v_quickAddPreset(name){l4v_egQuickAdd(name);}
  function l4v_quickAdd(name,watts,qty,hours,fm){var p=l4v_getAppliancePreset(name);var ind=p?p.inductive:false;var dc=p?p.dutyCycle:null;l4v_addItem({name:name,watts:watts,qty:qty,hours:hours,inductive:ind,dutyCycle:dc});l4v_resetForm();}

  function l4v_addAppliance(){
    l4v_syncFormFromPreset();
    var name=(document.getElementById('l4v-inp-name')||{}).value&&document.getElementById('l4v-inp-name').value.trim();
    var watts=parseFloat((document.getElementById('l4v-inp-watts')||{}).value);
    var qty=parseInt((document.getElementById('l4v-inp-qty')||{}).value);
    var hours=parseFloat((document.getElementById('l4v-inp-hours')||{}).value);
    if(!name){showToast('Please enter an appliance name.','error');return;}
    if(isNaN(watts)||watts<=0){showToast('Please enter valid watts.','error');return;}
    if(isNaN(qty)||qty<=0){showToast('Please enter a valid quantity.','error');return;}
    if(isNaN(hours)||hours<=0){showToast('Please enter valid hours per day.','error');return;}
    var p=l4v_getAppliancePreset(name);
    l4v_addItem({name:name,watts:watts,qty:qty,hours:hours,inductive:p?p.inductive:['fridge','freezer','ac','pump','motor','compressor','washing'].some(k=>name.toLowerCase().includes(k)),dutyCycle:p?p.dutyCycle:null});
    l4v_resetForm(); var ne=document.getElementById('l4v-inp-name');if(ne)ne.focus();
  }

  function l4v_removeAppliance(id){
    l4v_appliances=l4v_appliances.filter(a=>a.id!==id); l4v_renderList();
    if(!l4v_appliances.length){var res=document.getElementById('l4v-results');if(res)res.classList.remove('visible');var ph=document.getElementById('l4v-placeholder');if(ph)ph.style.display='flex';}
  }

  function l4v_renderList(){
    var list=document.getElementById('l4v-appliance-list');
    var c=document.getElementById('l4v-count');if(c)c.textContent=l4v_appliances.length;
    var btn=document.getElementById('l4v-calc-btn');if(btn)btn.disabled=!l4v_appliances.length;
    if(!list)return;
    if(!l4v_appliances.length){list.innerHTML='<div class="empty-state"><div class="icon">🏠</div><p>No l4v_appliances added yet.<br/>Use the form or chips above.</p></div>';return;}
    list.innerHTML=l4v_appliances.map(a=>{var effH=a.dutyCycle?24*a.dutyCycle:a.hours;var d=(a.watts*a.qty*effH/1000).toFixed(2);return '<div class="appliance-item"><div class="app-info"><div class="app-name">'+a.name+'</div><div class="app-details"><span>'+a.watts+'W</span> × <span>'+a.qty+'</span> · <span>'+(a.dutyCycle?'24h ('+Math.round(a.dutyCycle*100)+'% duty)':a.hours+'h/day')+'</span></div></div><div style="display:flex;align-items:center;gap:12px"><div class="app-daily"><strong>'+d+'</strong> kWh/day</div><button class="btn-remove" onclick="l4v_removeAppliance('+a.id+')">✕</button></div></div>';}).join('');
  }

  document.addEventListener('DOMContentLoaded',function(){l4v_renderQuickAddChips();l4v_renderApplianceSuggestions();var ne=document.getElementById('l4v-inp-name');if(ne){ne.addEventListener('change',l4v_syncFormFromPreset);ne.addEventListener('blur',l4v_syncFormFromPreset);}});

  function l4v_calculate(){if(!l4v_appliances.length)return;l4v__egS=l4v__runEngine(l4v_appliances);l4v__applyPanelMode(l4v__egS,'A');l4v__egS=l4v__buildBOM(l4v__egS,0);l4v__renderResults(l4v__egS);
    try {
      var b0 = (l4v__egS && l4v__egS.opts && l4v__egS.opts[l4v__egS.selBat || 0]) || {};
      var flat = {
        totalWatts: l4v__egS.tw,
        dailyKwh: +(l4v__egS.dw/1000).toFixed(2),
        maxSurge: Math.round(l4v__egS.surge),
        invKva: l4v__egS.inv.kva,
        invModel: `${l4v__egS.inv.kva}kVA ${l4v__egS.V}V Hybrid Inverter`,
        sysV: l4v__egS.V,
        systemVoltage: l4v__egS.V,
        acCurrent: l4v__egS.acA,
        lithiumPackKwh: b0.totalKwh || 0,
        batUnits: b0.units || 1,
        batLabel: b0.label || '',
        numPanels: l4v__egS.panels,
        panelCount: l4v__egS.panels,
        pvWatts: l4v__egS.arrW,
        requiredPvWatts: l4v__egS.reqWActive || l4v__egS.reqW,
        panelMode: l4v__egS.activePanelMode || 'A',
        pvCable: l4v__egS.conn.pv.cab.s,
        battCable: l4v__egS.conn.bat.cab.s,
        acCable: l4v__egS.conn.ac.cab.s,
        pvBreaker: l4v__egS.conn.pv.brk.a,
        battBreaker: l4v__egS.conn.bat.brk.a,
        acBreaker: l4v__egS.conn.ac.brk.a,
      };
      if (typeof egBuildCostBreakdown === 'function') Object.assign(flat, egBuildCostBreakdown(flat));
      handleVendorIframeResult(flat, l4v_appliances);
    } catch(e) { console.warn('L4 vendor calc bridge error:', e); }
}

  // Enter key
  document.addEventListener('keydown',function(e){if(e.key==='Enter'&&document.activeElement.closest('.add-form'))l4v_addAppliance();});

  // Called by showScreen when vendor-calculator becomes visible
  function vCalcInitChips(){ l4v_renderQuickAddChips(); l4v_renderApplianceSuggestions(); }

