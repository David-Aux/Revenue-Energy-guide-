// ═══════════════════════════════════════════════════════════════════════════
// EnergyGuide — Post-Calculation Action Extras (eg-post-calc-extras.js)
// Load order: AFTER calc-ci.js, db.js, platform.js, corporate.js.
//
// WHAT THIS FILE DOES
//   • Lets the C&I calculator live inside the User / Installer / Vendor
//     portals (instead of the home screen), with portal-specific
//     post-calculation actions.
//   • Adds PDF / WhatsApp export + Save/Load for the C&I calculator (User).
//   • Adds a "Build Quote" (Installer) / "Build Offer" (Vendor) pricing
//     builder for C&I sizing results, with its own PDF/WhatsApp export.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO
//   • It never modifies the C&I sizing engine (calc-ci.js) or any other
//     calculator's math/business logic.
//   • It only READS window.l4ci__lastResult (already exposed by calc-ci.js)
//     and calls the existing public window.l4ci_calculate() to reproduce a
//     result on "Load" — it never recomputes sizing itself.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  function N(n) { return Number(n || 0).toLocaleString('en-NG'); }
  function esc(v) { return (typeof safeText === 'function') ? safeText(v) : String(v == null ? '' : v); }

  // ───────────────────────────────────────────────────────────────────────
  // 1. PORTAL CONTEXT + NAVIGATION
  // ───────────────────────────────────────────────────────────────────────
  window._ciContext = null; // 'user' | 'installer' | 'vendor'

  window.egOpenCICalculator = function (context) {
    window._ciContext = context || 'user';
    const note = document.getElementById('ci-handoff-note');
    if (note) note.style.display = 'none';
    if (typeof showScreen === 'function') showScreen('ci-calculator');
    ciApplyContextUI();
  };

  window.ciBackFromCalculator = function () {
    const ctx = window._ciContext;
    if (ctx === 'installer') { showScreen('installer-dashboard'); return; }
    if (ctx === 'vendor') { showScreen('vendor-dashboard'); return; }
    if (ctx === 'agent') { showScreen('corporate-agent-portal'); return; }
    if (typeof egShowUserDashboard === 'function') { egShowUserDashboard(); return; }
    showScreen('welcome');
  };

  window.ciApplyContextUI = function () {
    const ctx = window._ciContext || 'user';
    const panelIds = { user: 'ciActionsUser', installer: 'ciActionsInstaller', vendor: 'ciActionsVendor', agent: 'ciActionsAgent' };
    Object.keys(panelIds).forEach(function (k) {
      const el = document.getElementById(panelIds[k]);
      if (el) el.style.display = (k === ctx) ? 'block' : 'none';
    });
  };

  // ───────────────────────────────────────────────────────────────────────
  // 2. C&I RESULT HELPERS — read-only, mirrors calc-ci.js's BOM/labels
  //    purely for display purposes (no sizing math happens here).
  // ───────────────────────────────────────────────────────────────────────
  function ciBuildBOM(s) {
    const items = [];
    function add(item, spec, qty) { items.push({ item: item, spec: spec, qty: qty }); }
    add('3-Phase Hybrid Inverter', s.inv.unitKw + 'kW 3-Phase Unit @ 415V AC', s.units);
    add('Solar Panel', '550W Mono PERC', s.panels);
    add('HV LFP BESS Pack', s.bess.label, s.bess.units);
    add('String Combiner Box', '8-String DC Combiner w/ Fuses', s.combiners);
    add('DC Main MCCB', s.conn.pv.brk.a + 'A DC MCCB', 1);
    add('Battery DC MCCB', s.conn.bat.brk.a + 'A DC MCCB', 1);
    add('AC MCCB (Per Inverter Unit)', s.conn.ac.brk.a + 'A 3-Phase MCCB', s.units);
    add('AC Main MCCB (MDB)', s.conn.acMain.brk.a + 'A 3-Phase MCCB', 1);
    add('3-Phase MDB/SMDB', 'Main Distribution Board', 1);
    add('DC SPD', (s.dcSpd ? s.dcSpd.label : '1000V DC Type 1+2') + ' (PV Array)', 1);
    add('AC SPD', s.acSpd.label + ' (Inverter Output)', 1);
    add('PV DC Cable', s.conn.pv.cab.s + 'mm² Solar Cable', 1);
    add('Battery DC Cable', s.conn.bat.cab.s + 'mm² DC Cable', 1);
    add('AC Output Cable', s.conn.ac.cab.s + 'mm² 3-Core + Earth', 1);
    add('Earthing Rod', '3m × 16mm Copper-Bonded Steel', s.earth.rods);
    add('Energy Meter', 'Bidirectional 3-Phase kWh Meter', 1);
    add('Remote Monitoring', 'Cloud SCADA / EMS Controller', 1);
    if (s.nemsaFlag) add('NEMSA Notification', 'System ≥100kW — NEMSA/NERC filing required', 1);
    return items;
  }

  function ciSummaryLines(s) {
    return [
      'Inverter Stack: ' + s.units + ' × ' + s.inv.unitKw + 'kW (' + s.totalKw + 'kW / ' + s.totalKva + 'kVA, 3-Phase 415V)',
      'Solar Array: ' + N(s.panels) + ' panels — ' + s.arrKwp + 'kWp (' + s.strings + ' strings × ' + s.pps + ')',
      'Roof/Ground Area: ' + N(s.reqM2) + 'm² required of ' + N(s.availM2) + 'm² available',
      'BESS: ' + s.bess.units + ' × ' + s.bess.label + ' — ' + s.bess.totalKwh + 'kWh usable, ' + s.backupHrs + 'hrs backup @ ' + s.peakKw + 'kW',
      'PV DC Cable: ' + s.conn.pv.cab.s + 'mm² | Battery DC Cable: ' + s.conn.bat.cab.s + 'mm² | AC Cable: ' + s.conn.ac.cab.s + 'mm²',
      'Breakers: PV ' + s.conn.pv.brk.a + 'A | Battery ' + s.conn.bat.brk.a + 'A | AC/unit ' + s.conn.ac.brk.a + 'A | Main ' + s.conn.acMain.brk.a + 'A',
      'Earthing: ' + s.earth.rods + ' rod(s), ' + s.earth.rn + 'Ω' + (s.earth.warn ? ' (chemical compound recommended)' : ''),
      s.nemsaFlag ? 'NEMSA/NERC notification required (system ≥100kW).' : null
    ].filter(Boolean);
  }

  // ───────────────────────────────────────────────────────────────────────
  // 3. EXPORT — Download PDF / Share WhatsApp (raw C&I sizing spec)
  // ───────────────────────────────────────────────────────────────────────
  window.ciDownloadPDF = function () {
    const s = window.l4ci__lastResult;
    if (!s) { if (typeof showToast === 'function') showToast('Calculate a system first.', 'error'); return; }
    if (typeof window.jspdf === 'undefined') { if (typeof showToast === 'function') showToast('PDF library not available.', 'error'); return; }
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(18); doc.setFont(undefined, 'bold');
      doc.text('Energy Guide — C&I Solar Sizing', 14, y); y += 9;
      doc.setFontSize(10); doc.setFont(undefined, 'normal'); doc.setTextColor(100);
      doc.text('Commercial & Industrial · 3-Phase 415V', 14, y); y += 6;
      doc.text('Date: ' + new Date().toLocaleDateString(), 14, y); y += 10;
      doc.setDrawColor(220); doc.line(14, y, 196, y); y += 10;

      doc.setFontSize(13); doc.setTextColor(0); doc.setFont(undefined, 'bold');
      doc.text('System Summary', 14, y); y += 8;
      doc.setFontSize(10); doc.setFont(undefined, 'normal');
      ciSummaryLines(s).forEach(function (line) {
        const wrapped = doc.splitTextToSize('• ' + line, 178);
        wrapped.forEach(function (wl) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(wl, 16, y); y += 6;
        });
      });
      y += 6;

      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(13); doc.setFont(undefined, 'bold');
      doc.text('Bill of Materials', 14, y); y += 8;
      doc.setFontSize(9); doc.setFont(undefined, 'bold'); doc.setTextColor(80);
      doc.text('Item', 14, y); doc.text('Spec', 70, y); doc.text('Qty', 188, y, { align: 'right' }); y += 5;
      doc.setDrawColor(220); doc.line(14, y, 196, y); y += 5;
      doc.setFont(undefined, 'normal'); doc.setTextColor(30);
      ciBuildBOM(s).forEach(function (row) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(String(row.item), 14, y);
        const specLines = doc.splitTextToSize(String(row.spec), 100);
        doc.text(specLines[0] || '', 70, y);
        doc.text(String(row.qty), 188, y, { align: 'right' });
        y += 6;
      });

      y += 8;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(8); doc.setTextColor(140);
      doc.text('Pricing for C&I equipment is project-specific. Contact a verified vendor or installer for quotation.', 14, y); y += 5;
      doc.text('Generated via Energy Guide.', 14, y);

      doc.save('Energy-Guide-CI-Sizing-' + (s.totalKva || 'system') + 'kVA.pdf');
      if (typeof showToast === 'function') showToast('PDF downloaded', 'success');
    } catch (err) {
      if (typeof showToast === 'function') showToast('PDF export failed: ' + err.message, 'error');
    }
  };

  window.ciShareWhatsApp = function () {
    const s = window.l4ci__lastResult;
    if (!s) { if (typeof showToast === 'function') showToast('Calculate a system first.', 'error'); return; }
    const msg = [
      '*Energy Guide — C&I Solar Sizing*',
      ''
    ].concat(ciSummaryLines(s).map(function (l) { return '• ' + l; })).concat([
      '',
      '_Pricing is project-specific — contact a verified vendor/installer for a quote._',
      '_Prepared via Energy Guide_'
    ]).join('\n');
    if (typeof egOpenWhatsApp === 'function') egOpenWhatsApp(msg);
    else window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  };


  // ───────────────────────────────────────────────────────────────────────
  // 5. BUILD QUOTE (Installer) / BUILD OFFER (Vendor)
  // ───────────────────────────────────────────────────────────────────────
  window._cibKind = 'quote'; // 'quote' | 'offer'

  window.ciOpenBuilder = function (kind) {
    const s = window.l4ci__lastResult;
    if (!s) { if (typeof showToast === 'function') showToast('Calculate a system first.', 'error'); return; }
    window._cibKind = (kind === 'offer') ? 'offer' : 'quote';

    const titleEl = document.getElementById('cibTitle');
    const primaryBtn = document.getElementById('cibPrimaryBtn');
    if (titleEl) titleEl.textContent = (window._cibKind === 'offer') ? 'Build Offer' : 'Build Quote';
    if (primaryBtn) primaryBtn.innerHTML = '📄 Download PDF';

    const snap = document.getElementById('cibSnapshot');
    if (snap) {
      snap.innerHTML = ciSummaryLines(s).map(function (l) { return esc(l); }).join('<br>');
    }

    const rows = document.getElementById('cibBomRows');
    if (rows) {
      rows.innerHTML = ciBuildBOM(s).map(function (row, i) {
        const qty = (typeof row.qty === 'number') ? row.qty : 1;
        return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #1e2235;">' +
          '<div style="flex:1;">' +
          '<div style="font-size:12px;font-weight:600;color:#f0f2ff;">' + esc(row.item) + ' <span style="color:#687076;font-weight:400;">×' + esc(row.qty) + '</span></div>' +
          '<div style="font-size:10px;color:#687076;">' + esc(row.spec) + '</div>' +
          '</div>' +
          '<div style="width:120px;">' +
          '<input type="number" class="cib-price-input form-input" data-qty="' + qty + '" data-item="' + esc(row.item) + '" data-spec="' + esc(row.spec) + '" placeholder="₦/unit" oninput="cibRecalc()" style="width:100%;padding:8px;font-size:12px;">' +
          '</div></div>';
      }).join('');
    }

    ['cib-labour', 'cib-transport', 'cib-install', 'cib-discount'].forEach(function (id) {
      const el = document.getElementById(id); if (el) el.value = 0;
    });
    const noteEl = document.getElementById('cib-note'); if (noteEl) noteEl.value = '';
    const nameEl = document.getElementById('cib-client-name'); if (nameEl) nameEl.value = '';
    const phoneEl = document.getElementById('cib-client-phone'); if (phoneEl) phoneEl.value = '';

    cibRecalc();
    showScreen('ci-builder');
  };

  window.ciBackFromBuilder = function () { showScreen('ci-calculator'); };

  function cibLineItems() {
    return Array.from(document.querySelectorAll('.cib-price-input')).map(function (input) {
      const price = parseFloat(input.value) || 0;
      const qty = parseFloat(input.dataset.qty) || 1;
      return { item: input.dataset.item, spec: input.dataset.spec, qty: qty, price: price, total: price * qty };
    });
  }

  function cibTotals() {
    const items = cibLineItems();
    const subtotal = items.reduce(function (sum, r) { return sum + r.total; }, 0);
    const labour = parseFloat((document.getElementById('cib-labour') || {}).value) || 0;
    const transport = parseFloat((document.getElementById('cib-transport') || {}).value) || 0;
    const install = parseFloat((document.getElementById('cib-install') || {}).value) || 0;
    const discount = parseFloat((document.getElementById('cib-discount') || {}).value) || 0;
    const grandTotal = Math.max(0, subtotal + labour + transport + install - discount);
    return { items: items, subtotal: subtotal, labour: labour, transport: transport, install: install, discount: discount, grandTotal: grandTotal };
  }

  window.cibRecalc = function () {
    const t = cibTotals();
    const el = document.getElementById('cibGrandTotal');
    if (el) el.textContent = '₦' + N(t.grandTotal);
  };

  window.cibDownloadPDF = function () {
    if (typeof window.jspdf === 'undefined') { if (typeof showToast === 'function') showToast('PDF library not available.', 'error'); return; }
    const kindLabel = (window._cibKind === 'offer') ? 'Offer' : 'Quote';
    const t = cibTotals();
    const clientName = (document.getElementById('cib-client-name') || {}).value || '';
    const clientPhone = (document.getElementById('cib-client-phone') || {}).value || '';
    const note = (document.getElementById('cib-note') || {}).value || '';
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(18); doc.setFont(undefined, 'bold');
      doc.text('Energy Guide — C&I ' + kindLabel, 14, y); y += 9;
      doc.setFontSize(10); doc.setFont(undefined, 'normal'); doc.setTextColor(100);
      if (clientName) { doc.text('Client: ' + clientName + (clientPhone ? ' (' + clientPhone + ')' : ''), 14, y); y += 6; }
      doc.text('Date: ' + new Date().toLocaleDateString(), 14, y); y += 10;
      doc.setDrawColor(220); doc.line(14, y, 196, y); y += 10;

      doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.setTextColor(0);
      doc.text('Line Items', 14, y); y += 8;
      doc.setFontSize(9); doc.setFont(undefined, 'bold'); doc.setTextColor(80);
      doc.text('Item', 14, y); doc.text('Qty', 130, y, { align: 'right' }); doc.text('Unit Price', 160, y, { align: 'right' }); doc.text('Total', 196, y, { align: 'right' }); y += 5;
      doc.setDrawColor(220); doc.line(14, y, 196, y); y += 5;
      doc.setFont(undefined, 'normal'); doc.setTextColor(30);
      t.items.forEach(function (row) {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.text(String(row.item), 14, y);
        doc.text(String(row.qty), 130, y, { align: 'right' });
        doc.text('₦' + N(row.price), 160, y, { align: 'right' });
        doc.text('₦' + N(row.total), 196, y, { align: 'right' });
        y += 6;
      });

      y += 6; if (y > 250) { doc.addPage(); y = 20; }
      doc.setDrawColor(220); doc.line(120, y, 196, y); y += 7;
      doc.setFontSize(10);
      [['Subtotal', t.subtotal], ['Labour', t.labour], ['Transport', t.transport], ['Installation', t.install], ['Discount', -t.discount]].forEach(function (r) {
        if (!r[1]) return;
        doc.text(r[0], 150, y, { align: 'right' }); doc.text('₦' + N(r[1]), 196, y, { align: 'right' }); y += 6;
      });
      y += 2;
      doc.setFont(undefined, 'bold'); doc.setFontSize(13);
      doc.text('Grand Total', 150, y, { align: 'right' }); doc.text('₦' + N(t.grandTotal), 196, y, { align: 'right' }); y += 12;

      if (note) {
        doc.setFont(undefined, 'normal'); doc.setFontSize(10); doc.setTextColor(60);
        const noteLines = doc.splitTextToSize('Notes: ' + note, 178);
        noteLines.forEach(function (l) { if (y > 270) { doc.addPage(); y = 20; } doc.text(l, 14, y); y += 6; });
        y += 4;
      }
      doc.setFontSize(8); doc.setTextColor(140);
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text('Generated via Energy Guide. ' + kindLabel + ' valid for 14 days unless stated otherwise.', 14, y);

      doc.save('Energy-Guide-CI-' + kindLabel + '-' + Date.now() + '.pdf');
      if (typeof showToast === 'function') showToast('PDF downloaded', 'success');
    } catch (err) {
      if (typeof showToast === 'function') showToast('PDF export failed: ' + err.message, 'error');
    }
  };

  window.cibShareWhatsApp = function () {
    const kindLabel = (window._cibKind === 'offer') ? 'Offer' : 'Quote';
    const t = cibTotals();
    const clientName = (document.getElementById('cib-client-name') || {}).value || '';
    const note = (document.getElementById('cib-note') || {}).value || '';
    const lines = ['*Energy Guide — C&I ' + kindLabel + '*'];
    if (clientName) lines.push('Client: ' + clientName);
    lines.push('');
    t.items.filter(function (r) { return r.price > 0; }).forEach(function (r) {
      lines.push('• ' + r.item + ' ×' + r.qty + ' — ₦' + N(r.total));
    });
    if (t.labour) lines.push('• Labour: ₦' + N(t.labour));
    if (t.transport) lines.push('• Transport: ₦' + N(t.transport));
    if (t.install) lines.push('• Installation: ₦' + N(t.install));
    if (t.discount) lines.push('• Discount: −₦' + N(t.discount));
    lines.push('');
    lines.push('*Grand Total: ₦' + N(t.grandTotal) + '*');
    if (note) lines.push('📝 ' + note);
    lines.push('');
    lines.push('_' + kindLabel + ' prepared via Energy Guide_');
    const msg = lines.join('\n');
    if (typeof egOpenWhatsApp === 'function') egOpenWhatsApp(msg);
    else window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  };

})();
