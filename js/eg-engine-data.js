// ── ENERGY GUIDE SHARED ENGINE DATA ──────────────────────────────────────
// Single source of truth for inverter and battery databases.
// All three calculators (user, vendor, installer) reference these arrays.
// No prices — sizing and voltage only.
// Updated June 2026 — verified against Nigerian market (Jumia, Jiji, Zit, StellarMart)

const EG_INVERTERS = [
  // 12V systems
  { kva:1.0,  v:12, maxPvW:1200,  mpptMin:30,  mpptMax:115, maxPvA:20  },
  { kva:1.5,  v:12, maxPvW:2000,  mpptMin:30,  mpptMax:115, maxPvA:25  },
  // 24V systems
  { kva:2.0,  v:24, maxPvW:2500,  mpptMin:60,  mpptMax:145, maxPvA:25  },
  { kva:2.5,  v:24, maxPvW:3000,  mpptMin:60,  mpptMax:145, maxPvA:25  },
  { kva:3.0,  v:24, maxPvW:3500,  mpptMin:60,  mpptMax:145, maxPvA:30  },
  { kva:3.5,  v:24, maxPvW:4000,  mpptMin:60,  mpptMax:145, maxPvA:30  },
  { kva:4.0,  v:24, maxPvW:5000,  mpptMin:60,  mpptMax:145, maxPvA:40  }, // Felicity/Cworth confirmed
  // 48V systems — 5kVA always 48V (industry standard, 208A at 24V too high)
  { kva:5.0,  v:48, maxPvW:6500,  mpptMin:120, mpptMax:430, maxPvA:50  },
  { kva:6.0,  v:48, maxPvW:8000,  mpptMin:120, mpptMax:430, maxPvA:65  }, // Blue Carbon confirmed
  { kva:7.5,  v:48, maxPvW:9000,  mpptMin:120, mpptMax:450, maxPvA:80  },
  { kva:8.0,  v:48, maxPvW:10000, mpptMin:150, mpptMax:450, maxPvA:90  }, // Felicity confirmed
  { kva:10.0, v:48, maxPvW:12000, mpptMin:150, mpptMax:450, maxPvA:100 },
  { kva:12.0, v:48, maxPvW:15000, mpptMin:150, mpptMax:500, maxPvA:120 },
  { kva:15.0, v:48, maxPvW:18000, mpptMin:150, mpptMax:500, maxPvA:150 },
  { kva:20.0, v:48, maxPvW:25000, mpptMin:150, mpptMax:550, maxPvA:180 },
];

const EG_BATTERIES = {
  // 12V family — for 1kVA and 1.5kVA inverters
  12: [
    { label:'12V 100Ah LiFePO4',  ah:100, kwh:1.28 },
    { label:'12V 200Ah LiFePO4',  ah:200, kwh:2.56 },
    { label:'12V 300Ah LiFePO4',  ah:300, kwh:3.84 },
    { label:'12V 4kWh LiFePO4',   ah:310, kwh:4.00 }, // Haisic 4kWh confirmed on Jumia
  ],
  // 24V family — for 2kVA–4kVA inverters
  // Ceiling: 7.68kWh (SMS/Hzsolar 300Ah) — verified Nigerian market
  24: [
    { label:'24V 2.5kWh LiFePO4', kwh:2.56 },
    { label:'24V 3.8kWh LiFePO4', kwh:3.84 }, // Felicity 150Ah
    { label:'24V 4.2kWh LiFePO4', kwh:4.20 }, // Hyper Power 165Ah confirmed
    { label:'24V 5kWh LiFePO4',   kwh:5.12 }, // Felicity 200Ah confirmed
    { label:'24V 7.5kWh LiFePO4', kwh:7.68 }, // SMS 300Ah confirmed
  ],
  // 48V family — for 5kVA and above
  48: [
    { label:'48V 2.5kWh LiFePO4',  kwh:2.56  },
    { label:'48V 5kWh LiFePO4',    kwh:5.12  }, // Felicity/Deye/Sako confirmed
    { label:'48V 7.2kWh LiFePO4',  kwh:7.20  }, // Felicity 150Ah confirmed
    { label:'48V 8.7kWh LiFePO4',  kwh:8.70  }, // Felicity 8.7kWh confirmed
    { label:'48V 10kWh LiFePO4',   kwh:10.24 }, // Most popular — widely confirmed
    { label:'48V 12.5kWh LiFePO4', kwh:12.50 }, // Felicity confirmed
    { label:'48V 15kWh LiFePO4',   kwh:15.00 }, // Haisic/Felicity confirmed
    { label:'48V 17.5kWh LiFePO4', kwh:17.50 }, // Felicity 350Ah confirmed
    { label:'48V 20kWh LiFePO4',   kwh:20.00 }, // Cworth LBF-48400C confirmed
    { label:'48V 25kWh LiFePO4',   kwh:25.00 }, // Rack/stacked — available on order
    { label:'48V 30kWh LiFePO4',   kwh:30.00 }, // Rack/stacked — available on order
  ],
};
