    // ================================
    // COMPLETE JAVASCRIPT - ALL 3 PORTALS
    // ================================
    
    console.log('Energy Guide - Complete Platform v1.0 Loading...');
    
    // Component Databases
    const SOLAR_PANELS = [
      { model: "200W Mono", power_W: 200, Voc_V: 22.3, Vmp_V: 18.6, Isc_A: 8.6, Imp_A: 8.06, price_NGN: 37000 },
      { model: "330W Mono", power_W: 330, Voc_V: 53.57, Vmp_V: 46.39, Isc_A: 7.38, Imp_A: 7.13, price_NGN: 54000 },
      { model: "420W Mono", power_W: 420, Voc_V: 36.8, Vmp_V: 29.15, Isc_A: 10.91, Imp_A: 10.55, price_NGN: 76000 },
      { model: "500W Mono", power_W: 500, Voc_V: 49.15, Vmp_V: 41.15, Isc_A: 13.65, Imp_A: 12.76, price_NGN: 84000 },
      { model: "550W Mono", power_W: 550, Voc_V: 52.81, Vmp_V: 41.95, Isc_A: 14.46, Imp_A: 13.12, price_NGN: 95000 },
      { model: "600W Mono", power_W: 600, Voc_V: 52.81, Vmp_V: 44.66, Isc_A: 14.46, Imp_A: 13.44, price_NGN: 103000 },
      { model: "650W Mono", power_W: 650, Voc_V: 45.2, Vmp_V: 37.4, Isc_A: 18.46, Imp_A: 17.38, price_NGN: 112000 }
    ];
    
    const CABLES = [
      { size_mm2: 4, max_current_A: 35, price_per_meter_NGN: 2800 },
      { size_mm2: 6, max_current_A: 40, price_per_meter_NGN: 3500 },
      { size_mm2: 10, max_current_A: 65, price_per_meter_NGN: 4100 },
      { size_mm2: 16, max_current_A: 90, price_per_meter_NGN: 8000 },
      { size_mm2: 35, max_current_A: 115, price_per_meter_NGN: 15000 },
      { size_mm2: 50, max_current_A: 150, price_per_meter_NGN: 20000 },
      { size_mm2: 70, max_current_A: 200, price_per_meter_NGN: 28000 },
      { size_mm2: 95, max_current_A: 260, price_per_meter_NGN: 38000 }
    ];
    
    const BREAKERS_DC = [
      { rating_A: 16, voltage_V: 250, type: "DC", price_NGN: 9000 },
      { rating_A: 20, voltage_V: 250, type: "DC", price_NGN: 11000 },
      { rating_A: 25, voltage_V: 250, type: "DC", price_NGN: 11000 },
      { rating_A: 32, voltage_V: 500, type: "DC", price_NGN: 13500 },
      { rating_A: 40, voltage_V: 250, type: "DC", price_NGN: 15000 },
      { rating_A: 50, voltage_V: 250, type: "DC", price_NGN: 17000 },
      { rating_A: 63, voltage_V: 500, type: "DC", price_NGN: 20000 },
      { rating_A: 80, voltage_V: 500, type: "DC", price_NGN: 37500 },
      { rating_A: 100, voltage_V: 500, type: "DC", price_NGN: 42500 },
      { rating_A: 125, voltage_V: 500, type: "DC", price_NGN: 51540 },
      { rating_A: 160, voltage_V: 500, type: "DC", price_NGN: 75000 }
    ];
    
    const BREAKERS_AC = [
      { rating_A: 16, voltage_V: 400, type: "AC", price_NGN: 5000 },
      { rating_A: 20, voltage_V: 400, type: "AC", price_NGN: 5500 },
      { rating_A: 32, voltage_V: 400, type: "AC", price_NGN: 7000 },
      { rating_A: 40, voltage_V: 400, type: "AC", price_NGN: 8000 },
      { rating_A: 63, voltage_V: 400, type: "AC", price_NGN: 11500 },
      { rating_A: 80, voltage_V: 400, type: "AC", price_NGN: 32500 },
      { rating_A: 100, voltage_V: 400, type: "AC", price_NGN: 40000 }
    ];
    
    const SURGE_MULTIPLIERS = { 'light': 1.0, 'fan': 1.3, 'fridge': 3.0, 'pump': 4.0, 'motor': 5.0 };
    
    // ================================================================
    // NIGERIA STATE DROPDOWN SYSTEM
    // ================================================================

    const NIGERIA_STATES = [
      "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
      "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
      "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
      "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers",
      "Sokoto","Taraba","Yobe","Zamfara"
    ];

    function populateStateSelect(selectId, placeholder="Select State"){
      const select=document.getElementById(selectId);
      if(!select) return;
      select.innerHTML = `
        <option value="">${placeholder}</option>
        ${NIGERIA_STATES.map(s=>`<option value="${s}">${s}</option>`).join("")}
      `;
    }

    function populateAllStateSelects(){
      const stateSelects = [
        "leadState","regInstState","regVendorState",
        "regInstServiceState",
        "cipState","cvpState",
        "ipState","ipServiceState","vpState",
        "installerMarketplaceState","vendorMarketplaceState"
      ];
      stateSelects.forEach(id => populateStateSelect(id));
    }

    // Returns the state stored on the logged-in user's profile.
    // Used by installer and vendor lead queries for location matching.
    async function getCurrentUserPortalState(role) {
      try {
        // Prefer the in-memory currentUser object (already loaded on login)
        if (currentUser && currentUser.state) return currentUser.state;

        // Fall back to a fresh Supabase fetch if currentUser has no state yet
        if (!supabaseClient) return null;
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return null;
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('state')
          .eq('id', user.id)
          .maybeSingle();
        return (profile && profile.state) ? profile.state : null;
      } catch (e) {
        console.warn('getCurrentUserPortalState error:', e);
        return null;
      }
    }

    // ================================================================
    // PROFILE COMPLETENESS HELPERS
    // ================================================================

    // Uses only columns that already exist in the profiles table.
    // company_name is the existing "business name" column — full_name/business_name
    // are new optional columns added later via ALTER TABLE.
    function isInstallerProfileComplete(profile) {
      return !!(
        profile &&
        (profile.company_name || profile.business_name || profile.full_name) &&
        profile.phone &&
        profile.state &&
        profile.city
      );
    }

    function isVendorProfileComplete(profile) {
      return !!(
        profile &&
        (profile.company_name || profile.business_name || profile.full_name) &&
        profile.phone &&
        profile.state &&
        profile.city
      );
    }

    // Fetch full profile from Supabase for a given user ID
    async function fetchFullProfile(userId) {
      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('fetchFullProfile error:', e);
        return null;
      }
    }

    // Route to portal with profile completeness check.
    // Only Google OAuth users who have NEVER completed a profile hit the
    // completion screen. Email/password signups always have company_name,
    // phone, state, city from registration — they go straight to dashboard.
    async function routeToPortalWithCheck(role) {
      currentRole = role;
      if (!currentUser) { showScreen(role === 'installer' ? 'installer-login' : 'vendor-login'); return; }

      // Fetch fresh profile from DB to get latest data
      const profile = await fetchFullProfile(currentUser.id);
      if (profile) currentUser = { ...currentUser, ...profile };

      // Only intercept with completion screen when the user came via Google OAuth
      // (indicated by missing phone/state/city that email signup would have set).
      // If they have any of the core fields, send them straight to dashboard —
      // they can update via My Profile.
      const isGoogleUser = !!(currentUser.app_metadata && currentUser.app_metadata.provider === 'google')
        || !!(currentUser.identities && currentUser.identities.some && currentUser.identities.some(i => i.provider === 'google'));

      if (role === 'installer') {
        if (isGoogleUser && !isInstallerProfileComplete(currentUser)) {
          prefillCompleteInstallerProfile(currentUser);
          showScreen('complete-installer-profile');
        } else {
          showScreen('installer-dashboard');
        }
      } else if (role === 'vendor') {
        if (isGoogleUser && !isVendorProfileComplete(currentUser)) {
          prefillCompleteVendorProfile(currentUser);
          showScreen('complete-vendor-profile');
        } else {
          showScreen('vendor-dashboard');
        }
      } else {
        showScreen('user-calculator');
        if (typeof updateUserAccountUI === 'function') updateUserAccountUI();
      }
    }

    function prefillCompleteInstallerProfile(p) {
      if (!p) return;
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
      // full_name may not exist as a DB column yet — fall back to company_name
      set('cipFullName', p.full_name || p.company_name || '');
      set('cipBusiness', p.business_name || p.company_name || '');
      set('cipPhone', p.phone);
      set('cipState', p.state);
      set('cipCity', p.city);
      set('cipWhatsapp', p.whatsapp_number || '');
    }

    function prefillCompleteVendorProfile(p) {
      if (!p) return;
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
      set('cvpFullName', p.full_name || p.company_name || '');
      set('cvpBusiness', p.business_name || p.company_name || '');
      set('cvpPhone', p.phone);
      set('cvpState', p.state);
      set('cvpCity', p.city);
      set('cvpWhatsapp', p.whatsapp_number || '');
    }

    async function saveCompleteInstallerProfile() {
      // cipFullName maps to company_name (existing column).
      // We intentionally do NOT write full_name/business_name here because
      // those columns may not exist yet in the DB schema.
      const display_name = document.getElementById('cipFullName').value.trim();
      const business = document.getElementById('cipBusiness').value.trim();
      const phone = document.getElementById('cipPhone').value.trim();
      const state = document.getElementById('cipState').value;
      const city = document.getElementById('cipCity').value.trim();
      const service_area = city;

      ['cipFullName','cipBusiness','cipPhone','cipState','cipCity'].forEach(id => {
        const err = document.getElementById(id + 'Error');
        if (err) err.textContent = '';
      });

      let hasError = false;
      if (!display_name) { document.getElementById('cipFullNameError').textContent = 'Required'; hasError = true; }
      if (!business) { document.getElementById('cipBusinessError').textContent = 'Required'; hasError = true; }
      if (!phone) { document.getElementById('cipPhoneError').textContent = 'Required'; hasError = true; }
      if (!state) { document.getElementById('cipStateError').textContent = 'Required'; hasError = true; }
      if (!city) { document.getElementById('cipCityError').textContent = 'Required'; hasError = true; }
      if (hasError) return;

      showLoading(true, 'Saving profile...');
      try {
        // Only write columns confirmed to exist in profiles table
        const payload = {
          id: currentUser.id,
          company_name: business || display_name,
          phone, state, city, service_area,
          role: 'installer', is_installer: true
        };
        // Attempt to write extra columns — silently ignore if they don't exist yet
        const { error } = await supabaseClient.from('profiles').upsert([payload], { onConflict: 'id' });
        showLoading(false);
        if (error) throw error;
        currentUser = { ...currentUser, company_name: business || display_name, phone, state, city };
        showToast('Profile saved!', 'success');
        showScreen('installer-dashboard');
      } catch(e) {
        showLoading(false);
        showToast('Failed to save profile: ' + e.message, 'error');
      }
    }

    async function saveCompleteVendorProfile() {
      const display_name = document.getElementById('cvpFullName').value.trim();
      const business = document.getElementById('cvpBusiness').value.trim();
      const phone = document.getElementById('cvpPhone').value.trim();
      const state = document.getElementById('cvpState').value;
      const city = document.getElementById('cvpCity').value.trim();

      ['cvpFullName','cvpBusiness','cvpPhone','cvpState','cvpCity'].forEach(id => {
        const err = document.getElementById(id + 'Error');
        if (err) err.textContent = '';
      });

      let hasError = false;
      if (!display_name) { document.getElementById('cvpFullNameError').textContent = 'Required'; hasError = true; }
      if (!business) { document.getElementById('cvpBusinessError').textContent = 'Required'; hasError = true; }
      if (!phone) { document.getElementById('cvpPhoneError').textContent = 'Required'; hasError = true; }
      if (!state) { document.getElementById('cvpStateError').textContent = 'Required'; hasError = true; }
      if (!city) { document.getElementById('cvpCityError').textContent = 'Required'; hasError = true; }
      if (hasError) return;

      showLoading(true, 'Saving profile...');
      try {
        const payload = {
          id: currentUser.id,
          company_name: business || display_name,
          phone, state, city,
          role: 'vendor', is_vendor: true
        };
        const { error } = await supabaseClient.from('profiles').upsert([payload], { onConflict: 'id' });
        showLoading(false);
        if (error) throw error;
        currentUser = { ...currentUser, company_name: business || display_name, phone, state, city };
        showToast('Profile saved!', 'success');
        showScreen('vendor-dashboard');
      } catch(e) {
        showLoading(false);
        showToast('Failed to save profile: ' + e.message, 'error');
      }
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function displayValue(value, fallback = 'Not added yet') {
      const v = value == null ? '' : String(value).trim();
      return v ? escapeHtml(v) : `<span style="color:#687076;">${escapeHtml(fallback)}</span>`;
    }

    function yesNoBadge(value, yesLabel = 'Yes', noLabel = 'No') {
      const active = !!value;
      const bg = active ? '#ECFDF3' : '#F3F4F6';
      const color = active ? '#16A34A' : '#6B7280';
      return `<span style="display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:${bg};color:${color};font-size:12px;font-weight:600;">${active ? escapeHtml(yesLabel) : escapeHtml(noLabel)}</span>`;
    }

    function renderProfileField(label, value) {
      return `<div style="padding:12px 0;border-bottom:1px solid #f1f3f5;">
        <div style="font-size:12px;color:#687076;margin-bottom:4px;">${escapeHtml(label)}</div>
        <div style="font-size:15px;font-weight:500;color:#111827;">${value}</div>
      </div>`;
    }

    function renderDocumentSection(url, accentColor) {
      const safeUrl = url ? escapeHtml(url) : '';
      if (!url) {
        return `<div style="margin-top:12px;padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa;">
          <div style="font-size:13px;color:#687076;">No CAC document uploaded yet.</div>
        </div>`;
      }
      const fileName = decodeURIComponent(String(url).split('/').pop() || 'CAC document');
      return `<div style="margin-top:12px;padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa;">
        <div style="font-size:13px;font-weight:600;color:#111827;margin-bottom:4px;">${escapeHtml(fileName)}</div>
        <div style="font-size:12px;color:#687076;margin-bottom:10px;">Document uploaded and available for review.</div>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn" style="display:inline-flex;width:auto;background:${accentColor};">View Document</a>
      </div>`;
    }

    function renderInstallerProfileView(profile) {
      const content = document.getElementById('installerProfileViewContent');
      if (!content) return;
      if (!profile) {
        content.innerHTML = `<div class="info">Could not load your profile right now.</div>
          <button class="btn btn-success" onclick="showScreen('installer-profile')" style="margin-top:16px;">Edit Profile</button>`;
        return;
      }
      const name = profile.business_name || profile.company_name || profile.full_name || 'Installer Profile';
      const location = [profile.city, profile.state].filter(Boolean).join(', ');
      const coverage = [profile.service_city, profile.service_state].filter(Boolean).join(', ') || profile.service_area || profile.address;
      const systemRange = (profile.min_system_kva || profile.max_system_kva)
        ? `${escapeHtml(profile.min_system_kva || '?')} - ${escapeHtml(profile.max_system_kva || '?')} kVA`
        : '<span style="color:#687076;">Not added yet</span>';
      content.innerHTML = `
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:20px;padding:20px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
            <div>
              <div style="font-size:24px;font-weight:700;color:#111827;">${escapeHtml(name)}</div>
              <div style="font-size:14px;color:#687076;margin-top:4px;">${displayValue(location, 'Location not added')}</div>
            </div>
            <button class="btn btn-success" onclick="showScreen('installer-profile')" style="width:auto;">Edit Profile</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            ${yesNoBadge(profile.works_with_lithium, 'Lithium')}
            ${yesNoBadge(profile.works_with_tubular, 'Tubular')}
            ${profile.market_type ? `<span style="display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#F0FDF4;color:#166534;font-size:12px;font-weight:600;">${escapeHtml(profile.market_type)}</span>` : ''}
          </div>
          ${renderProfileField('Full Name', displayValue(profile.full_name || profile.company_name, 'Not added yet'))}
          ${renderProfileField('Business Name', displayValue(profile.business_name || profile.company_name, 'Not added yet'))}
          ${renderProfileField('Phone', displayValue(profile.phone))}
          ${renderProfileField('WhatsApp', displayValue(profile.whatsapp_number))}
          ${renderProfileField('Primary Location', displayValue(location, 'Not added yet'))}
          ${renderProfileField('Service Coverage', displayValue(coverage, 'Not added yet'))}
          ${renderProfileField('Years of Experience', displayValue(profile.years_experience))}
          ${renderProfileField('System Size Range', systemRange)}
          ${renderProfileField('Market Type', displayValue(profile.market_type))}
          ${renderProfileField('CAC Registration Number', displayValue(profile.cac_number))}
          ${renderProfileField('Business Description', displayValue(profile.business_description))}
          <div style="padding-top:12px;">
            <div style="font-size:12px;color:#687076;margin-bottom:6px;">CAC Document</div>
            ${renderDocumentSection(profile.cac_document_url, '#16A34A')}
          </div>
        </div>`;
    }

    function renderVendorProfileView(profile) {
      const content = document.getElementById('vendorProfileViewContent');
      if (!content) return;
      if (!profile) {
        content.innerHTML = `<div class="info">Could not load your profile right now.</div>
          <button class="btn btn-warning" onclick="showScreen('vendor-profile')" style="margin-top:16px;">Edit Profile</button>`;
        return;
      }
      const name = profile.business_name || profile.company_name || profile.full_name || 'Vendor Profile';
      const location = [profile.city, profile.state].filter(Boolean).join(', ');
      const categories = [
        profile.sells_panels ? 'Solar Panels' : '',
        profile.sells_inverters ? 'Inverters' : '',
        profile.sells_lithium ? 'Lithium Batteries' : '',
        profile.sells_tubular ? 'Tubular Batteries' : '',
        profile.sells_accessories ? 'Accessories' : ''
      ].filter(Boolean).join(', ');
      content.innerHTML = `
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:20px;padding:20px;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
            <div>
              <div style="font-size:24px;font-weight:700;color:#111827;">${escapeHtml(name)}</div>
              <div style="font-size:14px;color:#687076;margin-top:4px;">${displayValue(location, 'Location not added')}</div>
            </div>
            <button class="btn btn-warning" onclick="showScreen('vendor-profile')" style="width:auto;">Edit Profile</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            ${profile.offers_installation ? `<span style="display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#FFF7ED;color:#C2410C;font-size:12px;font-weight:600;">Offers installation: ${escapeHtml(profile.offers_installation)}</span>` : ''}
            ${categories ? `<span style="display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#FEF3C7;color:#92400E;font-size:12px;font-weight:600;">${escapeHtml(categories)}</span>` : ''}
          </div>
          ${renderProfileField('Full Name', displayValue(profile.full_name || profile.company_name, 'Not added yet'))}
          ${renderProfileField('Business Name', displayValue(profile.business_name || profile.company_name, 'Not added yet'))}
          ${renderProfileField('Phone', displayValue(profile.phone))}
          ${renderProfileField('WhatsApp', displayValue(profile.whatsapp_number))}
          ${renderProfileField('Primary Location', displayValue(location, 'Not added yet'))}
          ${renderProfileField('Shop / Business Address', displayValue(profile.shop_address || profile.address))}
          ${renderProfileField('Delivery Coverage', displayValue(profile.delivery_coverage))}
          ${renderProfileField('Product Categories', displayValue(categories))}
          ${renderProfileField('Brands Carried', displayValue(profile.brands_carried))}
          ${renderProfileField('CAC Registration Number', displayValue(profile.cac_number))}
          ${renderProfileField('Business Description', displayValue(profile.business_description))}
          <div style="padding-top:12px;">
            <div style="font-size:12px;color:#687076;margin-bottom:6px;">CAC Document</div>
            ${renderDocumentSection(profile.cac_document_url, '#D97706')}
          </div>
        </div>`;
    }

    async function loadInstallerProfileViewScreen() {
      showLoading(true, 'Loading profile...');
      const profile = await fetchFullProfile(currentUser && currentUser.id);
      showLoading(false);
      if (profile) currentUser = { ...currentUser, ...profile };
      renderInstallerProfileView(profile || currentUser || null);
      requestAnimationFrame(() => { forceResetScroll(); setTimeout(forceResetScroll, 40); setTimeout(forceResetScroll, 120); });
    }

    async function loadVendorProfileViewScreen() {
      showLoading(true, 'Loading profile...');
      const profile = await fetchFullProfile(currentUser && currentUser.id);
      showLoading(false);
      if (profile) currentUser = { ...currentUser, ...profile };
      renderVendorProfileView(profile || currentUser || null);
      requestAnimationFrame(() => { forceResetScroll(); setTimeout(forceResetScroll, 40); setTimeout(forceResetScroll, 120); });
    }

    // Load installer profile into edit screen
    async function loadInstallerProfileScreen() {
      const statusEl = document.getElementById('instProfileStatus');
      if (statusEl) { statusEl.style.display = 'none'; }
      showLoading(true, 'Loading profile...');
      const profile = await fetchFullProfile(currentUser && currentUser.id);
      showLoading(false);
      if (!profile) { showToast('Could not load profile', 'error'); return; }
      currentUser = { ...currentUser, ...profile };
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
      const chk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };
      set('ipFullName', profile.full_name || profile.company_name || '');
      set('ipBusiness', profile.business_name || profile.company_name || '');
      set('ipPhone', profile.phone);
      set('ipState', profile.state);
      set('ipCity', profile.city);
      set('ipServiceState', profile.service_state);
      set('ipServiceCity', profile.service_city);
      set('ipMinKva', profile.min_system_kva);
      set('ipMaxKva', profile.max_system_kva);
      chk('ipLithium', profile.works_with_lithium);
      chk('ipTubular', profile.works_with_tubular);
      set('ipMarket', profile.market_type);
      set('ipYears', profile.years_experience);
      set('ipWhatsapp', profile.whatsapp_number);
      set('ipCac', profile.cac_number);
      set('ipDesc', profile.business_description);
      const docStatus = document.getElementById('ipCacDocStatus');
      if (docStatus) docStatus.textContent = profile.cac_document_url ? '✅ Document on file' : '';
    }

    async function saveInstallerProfile() {
      showLoading(true, 'Saving...');
      try {
        const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
        const chk = id => { const el = document.getElementById(id); return el ? el.checked : false; };
        const cacFile = document.getElementById('ipCacDoc') && document.getElementById('ipCacDoc').files[0];
        let cac_document_url = currentUser.cac_document_url || null;
        if (cacFile) cac_document_url = await uploadCacDocument(cacFile, currentUser.id) || cac_document_url;

        const payload = {
          id:                 currentUser.id,
          role:               currentUser.role || 'installer',
          is_installer:       true,
          company_name:       get('ipBusiness') || get('ipFullName'),
          phone:              get('ipPhone'),
          state:              get('ipState'),
          city:               get('ipCity'),
          address:            get('ipServiceCity'),
          service_area:       get('ipServiceCity') || get('ipCity'),
          service_state:      get('ipServiceState'),
          service_city:       get('ipServiceCity'),
          min_system_kva:     parseFloat(get('ipMinKva')) || null,
          max_system_kva:     parseFloat(get('ipMaxKva')) || null,
          works_with_lithium: chk('ipLithium'),
          works_with_tubular: chk('ipTubular'),
          market_type:        get('ipMarket'),
          years_experience:   get('ipYears'),
          whatsapp_number:    get('ipWhatsapp'),
          cac_number:         get('ipCac'),
          cac_document_url,
          business_description: get('ipDesc'),
        };

        // Remove null/empty fields to avoid overwriting existing data with blanks
        const clean = Object.fromEntries(
          Object.entries(payload).filter(([k, v]) => v !== '' && v !== null && v !== undefined)
        );
        // Always keep id, role, flags even if empty
        clean.id           = payload.id;
        clean.role         = payload.role;
        clean.is_installer = true;

        const { error } = await supabaseClient.from('profiles').upsert([clean], { onConflict: 'id' });
        showLoading(false);
        if (error) throw error;

        currentUser = { ...currentUser, ...clean };
        const statusEl = document.getElementById('instProfileStatus');
        if (statusEl) { statusEl.textContent = '✅ Profile saved successfully!'; statusEl.className = 'success'; statusEl.style.display = 'block'; }
        showToast('Profile updated!', 'success');
        showScreen('installer-profile-view');
      } catch(e) {
        showLoading(false);
        console.error('saveInstallerProfile error:', e);
        // If it's a missing-column error, show the SQL hint
        if (e.message && (e.message.includes('column') || e.message.includes('does not exist'))) {
          showToast('Schema mismatch — run the ALTER TABLE SQL in Supabase. See README.', 'error');
        } else {
          showToast('Save failed: ' + e.message, 'error');
        }
      }
    }

    // Load vendor profile into edit screen
    async function loadVendorProfileScreen() {
      const statusEl = document.getElementById('vendorProfileStatus');
      if (statusEl) { statusEl.style.display = 'none'; }
      showLoading(true, 'Loading profile...');
      const profile = await fetchFullProfile(currentUser && currentUser.id);
      showLoading(false);
      if (!profile) { showToast('Could not load profile', 'error'); return; }
      currentUser = { ...currentUser, ...profile };
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
      const chk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };
      set('vpFullName', profile.full_name || profile.company_name || '');
      set('vpBusiness', profile.business_name || profile.company_name || '');
      set('vpPhone', profile.phone);
      set('vpState', profile.state);
      set('vpCity', profile.city);
      set('vpDelivery', profile.delivery_coverage);
      chk('vpPanels', profile.sells_panels);
      chk('vpInverters', profile.sells_inverters);
      chk('vpLithium', profile.sells_lithium);
      chk('vpTubular', profile.sells_tubular);
      chk('vpAccessories', profile.sells_accessories);
      set('vpOffersInstall', profile.offers_installation);
      set('vpAddress', profile.shop_address || profile.address);
      set('vpWhatsapp', profile.whatsapp_number);
      set('vpBrands', profile.brands_carried);
      set('vpCac', profile.cac_number);
      set('vpDesc', profile.business_description);
      const docStatus = document.getElementById('vpCacDocStatus');
      if (docStatus) docStatus.textContent = profile.cac_document_url ? '✅ Document on file' : '';
    }

    async function saveVendorProfile() {
      showLoading(true, 'Saving...');
      try {
        const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
        const chk = id => { const el = document.getElementById(id); return el ? el.checked : false; };
        const cacFile = document.getElementById('vpCacDoc') && document.getElementById('vpCacDoc').files[0];
        let cac_document_url = currentUser.cac_document_url || null;
        if (cacFile) cac_document_url = await uploadCacDocument(cacFile, currentUser.id) || cac_document_url;

        const payload = {
          id:                  currentUser.id,
          role:                currentUser.role || 'vendor',
          is_vendor:           true,
          company_name:        get('vpBusiness') || get('vpFullName'),
          phone:               get('vpPhone'),
          state:               get('vpState'),
          city:                get('vpCity'),
          address:             get('vpAddress'),
          delivery_coverage:   get('vpDelivery'),
          sells_panels:        chk('vpPanels'),
          sells_inverters:     chk('vpInverters'),
          sells_lithium:       chk('vpLithium'),
          sells_tubular:       chk('vpTubular'),
          sells_accessories:   chk('vpAccessories'),
          offers_installation: get('vpOffersInstall'),
          shop_address:        get('vpAddress'),
          whatsapp_number:     get('vpWhatsapp'),
          brands_carried:      get('vpBrands'),
          cac_number:          get('vpCac'),
          cac_document_url,
          business_description: get('vpDesc'),
        };

        // Remove null/empty strings to avoid blanking out existing data,
        // but keep boolean false values (unchecked checkboxes are intentional)
        const clean = Object.fromEntries(
          Object.entries(payload).filter(([k, v]) => {
            if (typeof v === 'boolean') return true;   // keep false checkboxes
            return v !== '' && v !== null && v !== undefined;
          })
        );
        clean.id       = payload.id;
        clean.role     = payload.role;
        clean.is_vendor = true;

        const { error } = await supabaseClient.from('profiles').upsert([clean], { onConflict: 'id' });
        showLoading(false);
        if (error) throw error;

        currentUser = { ...currentUser, ...clean };
        const statusEl = document.getElementById('vendorProfileStatus');
        if (statusEl) { statusEl.textContent = '✅ Profile saved successfully!'; statusEl.className = 'success'; statusEl.style.display = 'block'; }
        showToast('Profile updated!', 'success');
        showScreen('vendor-profile-view');
      } catch(e) {
        showLoading(false);
        console.error('saveVendorProfile error:', e);
        if (e.message && (e.message.includes('column') || e.message.includes('does not exist'))) {
          showToast('Schema mismatch — run the ALTER TABLE SQL in Supabase. See README.', 'error');
        } else {
          showToast('Save failed: ' + e.message, 'error');
        }
      }
    }

    // CAC document upload — tries Supabase Storage, falls back gracefully
    async function uploadCacDocument(file, userId) {
      try {
        if (!supabaseClient) return null;
        const ext = file.name.split('.').pop();
        const path = `cac-documents/${userId}/cac_${Date.now()}.${ext}`;
        const { error: upErr } = await supabaseClient.storage
          .from('documents')
          .upload(path, file, { upsert: true });
        if (upErr) { console.warn('CAC upload error:', upErr); return null; }
        const { data } = supabaseClient.storage.from('documents').getPublicUrl(path);
        return data && data.publicUrl ? data.publicUrl : null;
      } catch(e) {
        console.warn('CAC upload exception:', e);
        return null;
      }
    }

    // ================================================================
    // Global State
    let currentRole = null;
    let currentScreen = 'welcome';
    let screenHistory = [];
    let currentUser = null;
    
    // User Portal State
    let userAppliances = [];
    let userCalculationResult = null;
    let currentLeadTarget = null;
    let selectedInstallerId = null;
    let selectedVendorId = null;
    let selectedInstallerProfile = null;
    let selectedVendorProfile = null;
    let currentOpenedSavedSystemId = null;
    let isLoadingSavedSystem = false;

    function egGetFridgeDutyFactor(item) {
      const n = (item.name || '').toLowerCase();
      const isFridgeLike = ['fridge','refrigerator','freezer'].some(k => n.includes(k));
      if (!isFridgeLike) return 1;
      const mode = (item.fridgeMode || 'none').toLowerCase();
      if (mode === 'inverter_fridge') return 0.35;
      if (mode === 'chest_freezer') return 0.60;
      return 0.50;
    }

    const EG_INVERTER_PRICES = {
      1: 180000, 1.5: 240000, 2: 300000, 2.5: 350000,
      3: 400000, 3.5: 450000, 4: 500000, 5: 600000,
      6: 700000, 8: 900000, 10: 1200000, 12: 1500000,
      15: 1900000, 20: 2600000
    };
    const EG_LITHIUM_PRICES = {
      2.5: 650000, 3: 750000, 5: 1200000, 7.5: 1650000,
      10: 2000000, 15: 2450000, 20: 3950000
    };
    const EG_PANEL_PRICE_500W = 120000;
    const EG_TUBULAR_220AH_PRICE = 320000;
    const EG_AC_BREAKER_PRICES = {16:6000,20:6000,25:6500,32:7000,40:8000,50:9000,63:10000,80:14000,100:18000,125:25000,160:32000};
    const EG_PV_BREAKER_PRICES = {16:10000,20:10000,25:11000,32:12000,40:13000,50:14000,63:14000};
    const EG_BATTERY_BREAKER_PRICES = {63:15000,80:18000,100:30000,125:40000,160:50000,200:65000,250:80000};
    const EG_PV_CABLE_PRICES = {4:2800,6:3500,10:6000,16:7800};
    const EG_BATTERY_CABLE_PRICES = {10:6000,16:7800,25:10800,35:12000,50:13000,70:15000,95:16700};
    const EG_AC_CABLE_PRICES = {'2.5':1800,4:2800,6:3500,10:6000,16:7800};
    const EG_CABLE_LENGTHS = { pv: 10, battery: 3, ac: 10 };

    function egFormatMoney(value) {
      return `₦${Math.round(Number(value || 0)).toLocaleString()}`;
    }

    function egGetInverterPrice(invKva) {
      if (EG_INVERTER_PRICES[invKva] != null) return EG_INVERTER_PRICES[invKva];
      const keys = Object.keys(EG_INVERTER_PRICES).map(Number).sort((a,b) => a-b);
      for (const k of keys) if (k >= invKva) return EG_INVERTER_PRICES[k];
      return EG_INVERTER_PRICES[keys[keys.length - 1]];
    }

    function egGetLithiumPrice(kwh) {
      if (EG_LITHIUM_PRICES[kwh] != null) return EG_LITHIUM_PRICES[kwh];
      const keys = Object.keys(EG_LITHIUM_PRICES).map(Number).sort((a,b) => a-b);
      for (const k of keys) if (k >= kwh) return EG_LITHIUM_PRICES[k];
      return EG_LITHIUM_PRICES[keys[keys.length - 1]];
    }

    function egBuildCostBreakdown(result) {
      const panelUnitPrice = EG_PANEL_PRICE_500W;
      const panelCost = result.numPanels * panelUnitPrice;
      const inverterCost = egGetInverterPrice(result.invKva);
      const batteryUnitPrice = egGetLithiumPrice(result.lithiumPackKwh);
      const batteryCost = batteryUnitPrice;
      const tubularUnitPrice = EG_TUBULAR_220AH_PRICE;
      const tubularAltCost = result.leadTotalBatteries * tubularUnitPrice;
      const pvBreakerPrice = EG_PV_BREAKER_PRICES[result.pvBreaker] || 0;
      const batteryBreakerPrice = EG_BATTERY_BREAKER_PRICES[result.battBreaker] || 0;
      const acBreakerPrice = EG_AC_BREAKER_PRICES[result.acBreaker] || 0;
      const pvCablePerMeter = EG_PV_CABLE_PRICES[result.pvCable] || 0;
      const batteryCablePerMeter = EG_BATTERY_CABLE_PRICES[result.battCable] || 0;
      const acCablePerMeter = EG_AC_CABLE_PRICES[String(result.acCable)] || 0;
      const pvCableCost = pvCablePerMeter * EG_CABLE_LENGTHS.pv;
      const batteryCableCost = batteryCablePerMeter * EG_CABLE_LENGTHS.battery;
      const acCableCost = acCablePerMeter * EG_CABLE_LENGTHS.ac;
      const totalCost = panelCost + inverterCost + batteryCost;
      return {
        panelUnitPrice, panelCost, inverterCost,
        batteryUnitPrice, batteryCost,
        tubularUnitPrice, tubularAltCost,
        pvBreakerPrice, batteryBreakerPrice, acBreakerPrice,
        pvCablePerMeter, batteryCablePerMeter, acCablePerMeter,
        pvCableCost, batteryCableCost, acCableCost,
        totalCost
      };
    }

    function energyGuideCalculateFromFrame(apps, mode = 'user') {
      const AC_BREAKERS = [16,20,25,32,40,50,63,80,100,125,160];
      const PV_BREAKERS = [16,20,25,32,40,50,63];
      const BATTERY_BREAKERS = [63,80,100,125,160,200,250];
      function pickBreaker(requiredAmps, breakerList, minAmps) {
        const req = Math.max(requiredAmps, minAmps);
        for (const size of breakerList) if (size >= req) return size;
        return breakerList[breakerList.length - 1];
      }
      let totalWatts = 0, dailyWh = 0, maxExtraSurge = 0;
      const inductiveKeys = ['fridge','refrigerator','ac','air conditioner','pump','motor','compressor','freezer','washing machine'];
      for (const app of apps) {
        const watts = Math.max(0, Number(app.watts || app.power_W || 0));
        const qty = Math.max(0, Number(app.qty || app.quantity || 0));
        const hours = Math.max(0, Number(app.hours || app.hours_per_day || 0));
        const duty = egGetFridgeDutyFactor(app);
        const load = watts * qty;
        totalWatts += load;
        dailyWh += load * hours * duty;
        const nameLower = String(app.name || '').toLowerCase();
        const isInductive = inductiveKeys.some(k => nameLower.includes(k));
        if (isInductive) maxExtraSurge = Math.max(maxExtraSurge, load * 2.0);
      }
      const peakWatts = totalWatts + maxExtraSurge;
      const requiredKva = Math.max(totalWatts * 1.25, peakWatts) / 800.0;
      const sizes = [1, 1.5, 2, 2.5, 3, 3.5, 5, 7.5, 10, 12, 15];
      const invKva = sizes.find(s => s >= requiredKva) || 15;
      const sysV = invKva <= 1.5 ? 12 : invKva <= 3.5 ? 24 : 48;
      const dodLi = 0.8, dodLa = 0.5, effInv = 0.85;
      const battLa = dailyWh / (sysV * dodLa * effInv);
      const leadUnitAh = 220;
      const leadSeries = Math.max(1, Math.round(sysV / 12));
      const leadParallel = Math.max(1, Math.ceil(battLa / leadUnitAh));
      const leadTotalBatteries = leadSeries * leadParallel;
      const leadBankAh = leadParallel * leadUnitAh;
      const dailyLoadKwh = dailyWh / 1000;
      const batteryEnergyKwh = dailyLoadKwh / effInv;
      const lithiumNominalKwh = batteryEnergyKwh / dodLi;
      const stepKwh = 2.5;
      const lithiumPackKwh = Math.ceil(lithiumNominalKwh / stepKwh) * stepKwh;
      const altHalf = (lithiumPackKwh % 5 === 0 && lithiumPackKwh >= 5) ? `Alt: 2×${(lithiumPackKwh/2).toFixed(1).replace(/\.0$/, '')}kWh` : '';
      const alt25 = `Alt: ${Math.round(lithiumPackKwh/stepKwh)}×2.5kWh`;
      const psh = 5.0, systemEff = 0.7, pvMargin = 1.1;
      const pvWatts = (dailyWh / (psh * systemEff)) * pvMargin;
      const numPanels = Math.ceil(pvWatts / 500);
      const pvCurrent = (numPanels * 500) / 150;
      let pvCable = 4;
      if (pvCurrent > 20) pvCable = 6;
      if (pvCurrent > 32) pvCable = 10;
      if (pvCurrent > 45) pvCable = 16;
      const pvBreaker = pickBreaker(pvCurrent * 1.25, PV_BREAKERS, 16);
      const maxBatt = (invKva * 1000) / sysV;
      let battCable = 10;
      if (maxBatt > 40) battCable = 16;
      if (maxBatt > 60) battCable = 25;
      if (maxBatt > 85) battCable = 35;
      if (maxBatt > 110) battCable = 50;
      if (maxBatt > 140) battCable = 70;
      if (maxBatt > 180) battCable = 95;
      const battBreaker = pickBreaker(maxBatt * 1.25, BATTERY_BREAKERS, 63);
      const acCurrent = (invKva * 1000) / 230;
      let acCable = 2.5;
      if (acCurrent > 20) acCable = 4;
      if (acCurrent > 30) acCable = 6;
      if (acCurrent > 45) acCable = 10;
      if (acCurrent > 63) acCable = 16;
      const acBreaker = pickBreaker(acCurrent * 1.25, AC_BREAKERS, 16);
      const dailyGen = (numPanels * 500 * psh * 0.7) / 1000;
      const cost = egBuildCostBreakdown({ invKva, lithiumPackKwh, numPanels, leadTotalBatteries, pvBreaker, battBreaker, acBreaker, pvCable, battCable, acCable });
      return { totalWatts, dailyKwh: dailyWh / 1000, maxSurge: peakWatts, invKva, systemVoltage: sysV, sysV, acCurrent, leadUnitAh, leadSeries, leadParallel, leadTotalBatteries, leadBankAh, batteryEnergyKwh, lithiumNominalKwh, lithiumPackKwh, altHalf, alt25, pvWatts, panelCount: numPanels, numPanels, dailyGen, pvCable, pvBreaker, battCable, battBreaker, acCable, acBreaker, ...cost, appliances: apps };
    }

    function receiveEmbeddedCalculation(mode, result, apps) {
      if (mode === 'user') {
        handleUserCalcResult(result, apps);
      } else if (mode === 'vendor') {
        handleVendorIframeResult(result, apps);
      }
    }

    let vendorIframeResult = null;

    function handleVendorIframeResult(result, apps) {
      vendorIframeResult = { ...result, appliances: apps };
      // Just reveal the Build Offer button below the iframe — don't navigate away
      const btn = document.getElementById('vendorCalcBuildOfferBtn');
      if (btn) btn.style.display = 'block';
    }

    function clearSavedSystemMode() {
      currentOpenedSavedSystemId = null;
      updateSavedSystemActionUI();
    }

    function handleUserCalcResult(result, apps = []) {
      userCalculationResult = { ...result, appliances: apps };
      if (!isLoadingSavedSystem) currentOpenedSavedSystemId = null;
      selectedInstallerId = null;
      selectedVendorId = null;
      selectedInstallerProfile = null;
      selectedVendorProfile = null;


      const inverterText = `${result.invKva}kVA`;
      const panelText = `${result.numPanels}× 500W`;
      const batteryText = `${result.lithiumPackKwh.toFixed(1).replace(/\.0$/, '')}kWh Lithium`;
      const dailyText = `${result.dailyKwh.toFixed(2)}kWh`;
      const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
      set('userResInverter', inverterText);
      set('userResPanels', panelText);
      set('userResBatteries', batteryText);
      set('userResEnergy', dailyText);
      const detailsEl = document.getElementById('userSystemDetails');
      if (detailsEl) detailsEl.innerHTML = `<strong>Recommended:</strong> ${inverterText} hybrid inverter, ${panelText}, ${batteryText}.<br>Daily load: ${dailyText}. Running load: ${result.totalWatts.toLocaleString()}W. Peak surge: ${result.maxSurge.toLocaleString()}W.`;
      set('userTotalCost', egFormatMoney(result.totalCost));
      set('costPanels', egFormatMoney(result.panelCost));

      // ── Populate FREE cost range on cost screen ──────────
      const tierEl = document.getElementById('costFreeSystemTier');
      if (tierEl) tierEl.textContent = `${result.invKva}kVA System · ${result.numPanels} Panel(s) · ${result.lithiumPackKwh.toFixed(1).replace(/\.0$/,'')}kWh Battery`;
      const rangeEl = document.getElementById('costFreeRange');
      if (rangeEl) {
        const lo = Math.round(result.totalCost * 0.9 / 1000) * 1000;
        const hi = Math.round(result.totalCost * 1.15 / 1000) * 1000;
        rangeEl.textContent = `${egFormatMoney(lo)} – ${egFormatMoney(hi)}`;
      }
      set('costInverter', egFormatMoney(result.inverterCost));
      set('costBattery', egFormatMoney(result.batteryCost));
      const notesEl = document.getElementById('costNotes');
      if (notesEl) notesEl.innerHTML = `Final total covers only core equipment: panels, inverter and lithium battery. Recommended breaker prices and cable per-meter prices are shown separately and remain subject to installer site verification. Standard reference lengths shown: PV ${EG_CABLE_LENGTHS.pv}m, Battery ${EG_CABLE_LENGTHS.battery}m, AC ${EG_CABLE_LENGTHS.ac}m.`;
      const bodyEl = document.getElementById('costBreakdownBody');
      if (bodyEl) {
        const panelDetail = result.numPanels > 1
          ? `${egFormatMoney(result.panelUnitPrice)} × ${result.numPanels} panels = ${egFormatMoney(result.panelCost)}`
          : `1 panel @ ${egFormatMoney(result.panelUnitPrice)}`;
        const batteryDetail = `1 × ${result.lithiumPackKwh.toFixed(1).replace(/\.0$/, '')}kWh @ ${egFormatMoney(result.batteryUnitPrice)}`;
        bodyEl.innerHTML = `
          <tr><td>Solar Panels</td><td>${panelDetail}</td><td>${egFormatMoney(result.panelCost)}</td></tr>
          <tr><td>Hybrid Inverter</td><td>1 × ${result.invKva}kVA</td><td>${egFormatMoney(result.inverterCost)}</td></tr>
          <tr><td>Lithium Battery</td><td>${batteryDetail}</td><td>${egFormatMoney(result.batteryCost)}</td></tr>
          <tr><td><strong>Alternative Tubular Battery Option</strong></td><td>${egFormatMoney(result.tubularUnitPrice)} × ${result.leadTotalBatteries} batteries = ${egFormatMoney(result.tubularAltCost)}</td><td>${egFormatMoney(result.tubularAltCost)}</td></tr>
        `;
      }
      const refEl = document.getElementById('costReferenceBody');
      if (refEl) {
        refEl.innerHTML = `
          <tr><td>PV Breaker</td><td>${result.pvBreaker}A DC recommended</td><td>${egFormatMoney(result.pvBreakerPrice)}</td></tr>
          <tr><td>Battery Breaker</td><td>${result.battBreaker}A DC recommended</td><td>${egFormatMoney(result.batteryBreakerPrice)}</td></tr>
          <tr><td>AC Breaker</td><td>${result.acBreaker}A AC recommended</td><td>${egFormatMoney(result.acBreakerPrice)}</td></tr>
          <tr><td>PV Cable</td><td>${result.pvCable}mm² @ ${egFormatMoney(result.pvCablePerMeter)} per meter</td><td>${egFormatMoney(result.pvCablePerMeter)}/m</td></tr>
          <tr><td>Battery Cable</td><td>${result.battCable}mm² @ ${egFormatMoney(result.batteryCablePerMeter)} per meter</td><td>${egFormatMoney(result.batteryCablePerMeter)}/m</td></tr>
          <tr><td>AC Cable</td><td>${result.acCable}mm² @ ${egFormatMoney(result.acCablePerMeter)} per meter</td><td>${egFormatMoney(result.acCablePerMeter)}/m</td></tr>
        `;
      }
      const snapEl = document.getElementById('leadSystemSnapshot');
      if (snapEl) snapEl.innerHTML = `Inverter: <strong>${result.invKva}kVA</strong><br>Panels: <strong>${result.numPanels} × 500W</strong><br>Battery: <strong>${result.lithiumPackKwh.toFixed(1).replace(/\.0$/, '')}kWh Lithium</strong><br>Daily Energy: <strong>${result.dailyKwh.toFixed(2)}kWh</strong>`;
      currentOpenedSavedSystemId = null;
      const actionEl = document.getElementById('userPostCalcActions');
      if (actionEl) actionEl.style.display = 'block';
      updateSavedSystemActionUI();

      showScreen('user-calculator');
      showToast('Sizing complete! See your cost range and system details below.', 'success');
    }

    function safeText(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function marketplaceNormalizeState(value) {
      return String(value || '').trim().toLowerCase();
    }

    function splitMarketplaceCoverage(value) {
      return String(value || '')
        .split(/[,/;|]+|and/gi)
        .map(part => marketplaceNormalizeState(part))
        .filter(Boolean);
    }

    function getInstallerStateMatches(profile, state) {
      const target = marketplaceNormalizeState(state);
      if (!target) return false;
      const states = [
        profile.state,
        profile.service_state,
        profile.service_area,
        profile.address
      ]
        .flatMap(v => splitMarketplaceCoverage(v))
        .filter(Boolean);
      return states.includes(target) || states.includes('nationwide') || states.includes('all states');
    }

    function getMarketplaceUserState() {
      const leadStateEl = document.getElementById('leadState');
      if (leadStateEl && leadStateEl.value) return leadStateEl.value;
      const userStateEl = document.getElementById('userState');
      if (userStateEl && userStateEl.value) return userStateEl.value;
      try {
        const lastLead = JSON.parse(localStorage.getItem('energyGuide_lastLead') || 'null');
        if (lastLead && lastLead.state) return lastLead.state;
      } catch (e) {}
      return '';
    }

    function setMarketplaceStateFromContext(selectId) {
      const select = document.getElementById(selectId);
      if (!select) return '';
      const contextState = getMarketplaceUserState();
      if (contextState && !select.value) select.value = contextState;
      return select.value || '';
    }

    function getInstallerDisplayName(profile) {
      return profile.business_name || profile.company_name || profile.full_name || 'Installer';
    }

    function getVendorDisplayName(profile) {
      return profile.business_name || profile.company_name || profile.full_name || 'Vendor';
    }

    function getInstallerSystemSizeRange(profile) {
      const min = profile.min_system_kva;
      const max = profile.max_system_kva;
      if (min && max) return `${min}kVA - ${max}kVA`;
      if (max) return `Up to ${max}kVA`;
      if (min) return `${min}kVA and above`;
      return 'Not specified';
    }

    function getVendorCategories(profile) {
      const categories = [];
      if (profile.sells_panels) categories.push('Solar Panels');
      if (profile.sells_inverters) categories.push('Inverters');
      if (profile.sells_lithium) categories.push('Lithium Batteries');
      if (profile.sells_tubular) categories.push('Tubular Batteries');
      if (profile.sells_accessories) categories.push('Accessories');
      return categories.length ? categories.join(', ') : 'Not specified';
    }

    function getVendorCoverageMatches(profile, state) {
      const target = marketplaceNormalizeState(state);
      if (!target) return false;
      const states = [
        profile.state,
        profile.delivery_coverage,
        profile.address,
        profile.shop_address
      ]
        .flatMap(v => splitMarketplaceCoverage(v))
        .filter(Boolean);
      return states.includes(target) || states.includes('nationwide') || states.includes('all states');
    }

    function updateLeadSelectionSummary() {
      const summaryEl = document.getElementById('leadSelectedTargetSummary');
      if (!summaryEl) return;
      let html = '';
      if (currentLeadTarget === 'installer' && selectedInstallerProfile) {
        html = `Selected installer: <strong>${safeText(getInstallerDisplayName(selectedInstallerProfile))}</strong>${selectedInstallerProfile.city ? ' • ' + safeText(selectedInstallerProfile.city) : ''}${selectedInstallerProfile.state ? ', ' + safeText(selectedInstallerProfile.state) : ''}`;
      } else if (currentLeadTarget === 'vendor' && selectedVendorProfile) {
        html = `Selected vendor: <strong>${safeText(getVendorDisplayName(selectedVendorProfile))}</strong>${selectedVendorProfile.city ? ' • ' + safeText(selectedVendorProfile.city) : ''}${selectedVendorProfile.state ? ', ' + safeText(selectedVendorProfile.state) : ''}`;
      }
      summaryEl.style.display = html ? 'block' : 'none';
      summaryEl.innerHTML = html;
    }

    function toggleMarketplaceProfileDetails(type, profileId) {
      const el = document.getElementById(`${type}MarketplaceMore_${profileId}`);
      if (!el) return;
      const isOpen = el.style.display !== 'none';
      el.style.display = isOpen ? 'none' : 'block';
      // Load vendor products inline on first open
      if (!isOpen && type === 'vendor') egLoadVendorProductsInline(profileId);
    }

    async function egLoadVendorProductsInline(vendorId) {
      const container = document.getElementById(`vendorProductsInline_${vendorId}`);
      if (!container || container.dataset.loaded) return;
      container.dataset.loaded = 'true';
      container.innerHTML = '<div style="font-size:12px;color:#9ca3af;">Loading products...</div>';
      try {
        const { data, error } = await supabaseClient
          .from('vendor_products')
          .select('*')
          .eq('user_id', vendorId)
          .order('created_at', { ascending: false });
        if (error || !data || data.length === 0) {
          container.innerHTML = '<div style="font-size:12px;color:#9ca3af;font-style:italic;">No products listed yet.</div>';
          return;
        }
        container.innerHTML = data.map(p => `
          <div style="display:flex;justify-content:space-between;align-items:center;
                      padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <div>
              <div style="font-weight:600;">${safeText(p.name || 'Unnamed product')}</div>
              <div style="color:#6b7280;font-size:12px;">${safeText(p.category || '')}${p.brand ? ' · ' + safeText(p.brand) : ''}</div>
            </div>
            <div style="text-align:right;flex-shrink:0;margin-left:12px;">
              <div style="font-weight:700;color:#16a34a;">₦${Number(p.price||0).toLocaleString()}</div>
              <div style="font-size:11px;color:#9ca3af;">Qty: ${p.quantity||'—'}</div>
            </div>
          </div>`).join('');
      } catch(e) {
        container.innerHTML = '<div style="font-size:12px;color:#ef4444;">Could not load products.</div>';
      }
    }


    function renderInstallerMarketplaceCards(profiles) {
      return (profiles || []).map(profile => {
        const profileId = safeText(profile.id || Math.random().toString(36).slice(2));
        return `
            <div class="result-card" style="text-align:left; margin-bottom: 14px;">
              <div class="result-label">Business Name</div>
              <div class="result-value" style="font-size:22px; margin-bottom: 8px;">${safeText(getInstallerDisplayName(profile))}</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:14px; line-height:1.5;">
                <div><span style="color:#687076;">Installer Name</span><br><strong>${safeText(profile.full_name || getInstallerDisplayName(profile))}</strong></div>
                <div><span style="color:#687076;">Phone</span><br><strong>${safeText(profile.phone || profile.whatsapp_number || 'Not provided')}</strong></div>
                <div><span style="color:#687076;">State</span><br><strong>${safeText(profile.state || 'Not specified')}</strong></div>
                <div><span style="color:#687076;">City</span><br><strong>${safeText(profile.city || profile.service_city || 'Not specified')}</strong></div>
                <div><span style="color:#687076;">Years of Experience</span><br><strong>${safeText(profile.years_experience || 'Not specified')}</strong></div>
                <div><span style="color:#687076;">Project Type / Market Type</span><br><strong>${safeText(profile.market_type || 'Not specified')}</strong></div>
                <div><span style="color:#687076;">Works with Lithium</span><br><strong>${profile.works_with_lithium ? 'Yes' : 'No'}</strong></div>
                <div><span style="color:#687076;">Works with Tubular</span><br><strong>${profile.works_with_tubular ? 'Yes' : 'No'}</strong></div>
                <div style="grid-column:1 / -1;"><span style="color:#687076;">System Size Range</span><br><strong>${safeText(getInstallerSystemSizeRange(profile))}</strong></div>
              </div>
              <div id="installerMarketplaceMore_${profileId}" style="display:none; margin-top:12px; padding-top:12px; border-top:1px solid #e5e7eb; font-size:14px; line-height:1.6;">
                <div><strong>Service Coverage:</strong> ${safeText(profile.service_state || profile.state || 'Not specified')}${profile.service_city ? ' • ' + safeText(profile.service_city) : ''}</div>
                <div><strong>WhatsApp:</strong> ${safeText(profile.whatsapp_number || profile.phone || 'Not provided')}</div>
                <div><strong>Description:</strong> ${safeText(profile.business_description || 'No profile description yet.')}</div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px;">
                <button class="btn btn-outline" onclick="toggleMarketplaceProfileDetails('installer','${profileId}')">View Profile</button>
                <button class="btn btn-success" onclick="selectInstallerForQuote('${safeText(profile.id)}')">Request Quote</button>
              </div>
            </div>`;
      }).join('');
    }

    function renderVendorMarketplaceCards(profiles) {
      return (profiles || []).map(profile => {
        const profileId = safeText(profile.id || Math.random().toString(36).slice(2));
        return `
            <div class="result-card" style="text-align:left; margin-bottom: 14px;">
              <div class="result-label">Business Name</div>
              <div class="result-value" style="font-size:22px; margin-bottom: 8px;">${safeText(getVendorDisplayName(profile))}</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:14px; line-height:1.5;">
                <div><span style="color:#687076;">State</span><br><strong>${safeText(profile.state || 'Not specified')}</strong></div>
                <div><span style="color:#687076;">City</span><br><strong>${safeText(profile.city || 'Not specified')}</strong></div>
                <div><span style="color:#687076;">Product Categories</span><br><strong>${safeText(getVendorCategories(profile))}</strong></div>
                <div><span style="color:#687076;">Delivery Coverage</span><br><strong>${safeText(profile.delivery_coverage || profile.state || 'Not specified')}</strong></div>
                <div style="grid-column:1 / -1;"><span style="color:#687076;">Brands Carried</span><br><strong>${safeText(profile.brands_carried || 'Not specified')}</strong></div>
                <div style="grid-column:1 / -1;"><span style="color:#687076;">Phone</span><br><strong>${safeText(profile.phone || profile.whatsapp_number || 'Not provided')}</strong></div>
              </div>
              <div id="vendorMarketplaceMore_${profileId}" style="display:none; margin-top:12px; padding-top:12px; border-top:1px solid #e5e7eb; font-size:14px; line-height:1.6;">
                <div><strong>Offers Installation:</strong> ${safeText(profile.offers_installation || 'Not specified')}</div>
                <div><strong>Address:</strong> ${safeText(profile.shop_address || profile.address || 'Not provided')}</div>
                <div><strong>Description:</strong> ${safeText(profile.business_description || 'No product profile description yet.')}</div>
                <div style="margin-top:12px;">
                  <div style="font-weight:600;font-size:13px;margin-bottom:8px;color:#374151;">📦 Products Listed</div>
                  <div id="vendorProductsInline_${profileId}"></div>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px;">
                <button class="btn btn-outline" onclick="toggleMarketplaceProfileDetails('vendor','${profileId}')">View Products</button>
                <button class="btn btn-primary" onclick="selectVendorForOffer('${safeText(profile.id)}')">Request Offer</button>
              </div>
            </div>`;
      }).join('');
    }

    async function loadInstallerMarketplace() {
      const listEl = document.getElementById('installerMarketplaceList');
      const noticeEl = document.getElementById('installerMarketplaceNotice');
      const state = setMarketplaceStateFromContext('installerMarketplaceState');
      if (!listEl) return;
      if (!supabaseClient) {
        listEl.innerHTML = '<div class="info">Installer marketplace is unavailable right now.</div>';
        return;
      }
      if (!state) {
        if (noticeEl) noticeEl.textContent = 'Please complete your location details first. Select your state to browse nearby installers.';
        listEl.innerHTML = '<div class="info">Select your state above to view installers near you.</div>';
        return;
      }
      listEl.innerHTML = '<div class="info">Loading installers...</div>';
      if (noticeEl) noticeEl.textContent = `Showing installers for ${state}.`;
      try {
        const { data, error } = await supabaseClient.from('profiles').select('*');
        if (error) throw error;
        const installers = (data || []).filter(profile => (profile.role === 'installer' || profile.is_installer === true));
        const filtered = installers.filter(profile => getInstallerStateMatches(profile, state));
        if (filtered.length) {
          listEl.innerHTML = renderInstallerMarketplaceCards(filtered);
          return;
        }
        if (installers.length) {
          if (noticeEl) noticeEl.textContent = `No exact matches in ${state} yet. Showing other available installers for now.`;
          listEl.innerHTML = '<div class="info">No installers found in your state yet. Showing other available installers you can still contact.</div>' + renderInstallerMarketplaceCards(installers);
          return;
        }
        listEl.innerHTML = '<div class="info">No installers have joined the marketplace yet.</div>';
      } catch (error) {
        console.error('Failed to load installer marketplace:', error);
        listEl.innerHTML = '<div class="info" style="color:#b91c1c;">Failed to load installers right now.</div>';
      }
    }

    async function loadVendorMarketplace() {
      const listEl = document.getElementById('vendorMarketplaceList');
      const noticeEl = document.getElementById('vendorMarketplaceNotice');
      const state = setMarketplaceStateFromContext('vendorMarketplaceState');
      if (!listEl) return;
      if (!supabaseClient) {
        listEl.innerHTML = '<div class="info">Vendor marketplace is unavailable right now.</div>';
        return;
      }
      if (!state) {
        if (noticeEl) noticeEl.textContent = 'Please complete your location details first. Select your state to browse vendors.';
        listEl.innerHTML = '<div class="info">Select your state above to view vendors that can serve you.</div>';
        return;
      }
      listEl.innerHTML = '<div class="info">Loading vendors...</div>';
      if (noticeEl) noticeEl.textContent = `Showing vendors for ${state}.`;
      try {
        const { data, error } = await supabaseClient.from('profiles').select('*');
        if (error) throw error;
        const vendors = (data || []).filter(profile => (profile.role === 'vendor' || profile.is_vendor === true));
        const filtered = vendors.filter(profile => getVendorCoverageMatches(profile, state));
        if (filtered.length) {
          listEl.innerHTML = renderVendorMarketplaceCards(filtered);
          return;
        }
        if (vendors.length) {
          if (noticeEl) noticeEl.textContent = `No exact vendor matches for ${state} yet. Showing other available vendors for now.`;
          listEl.innerHTML = '<div class="info">No vendors found in your state yet. Showing other available vendors you can still contact.</div>' + renderVendorMarketplaceCards(vendors);
          return;
        }
        listEl.innerHTML = '<div class="info">No vendors have joined the marketplace yet.</div>';
      } catch (error) {
        console.error('Failed to load vendor marketplace:', error);
        listEl.innerHTML = '<div class="info" style="color:#b91c1c;">Failed to load vendors right now.</div>';
      }
    }

    function openInstallerMarketplace() {
      selectedInstallerId = null;
      selectedInstallerProfile = null;
      setMarketplaceStateFromContext('installerMarketplaceState');
      showScreen('installer-marketplace');
      loadInstallerMarketplace();
    }

    // Context-aware opener — tracks where we came from for back button
    function egOpenInstallerMarketplaceFrom(fromScreen) {
      window._egMarketplaceFrom = fromScreen || null;
      openInstallerMarketplace();
    }

    function openVendorMarketplace() {
      selectedVendorId = null;
      selectedVendorProfile = null;
      setMarketplaceStateFromContext('vendorMarketplaceState');
      showScreen('vendor-marketplace');
      loadVendorMarketplace();
    }

    // Context-aware opener — tracks where we came from for back button
    function egOpenVendorMarketplaceFrom(fromScreen) {
      window._egMarketplaceFrom = fromScreen || null;
      openVendorMarketplace();
    }

    // Smart back from marketplace — returns to wherever user came from
    function egMarketplaceBack(type) {
      const from = window._egMarketplaceFrom || null;
      window._egMarketplaceFrom = null;

      if (from === 'welcome') { showScreen('welcome'); return; }
      if (from === 'installer-dashboard') { showScreen('installer-dashboard'); return; }
      if (from === 'vendor-dashboard') { showScreen('vendor-dashboard'); return; }
      if (from === 'installer-results') { showScreen('installer-results'); return; }
      if (from === 'vendor-offer-builder') { showScreen('vendor-offer-builder'); return; }

      // Default fallbacks by portal role
      if (currentRole === 'installer') { showScreen('installer-dashboard'); return; }
      if (currentRole === 'vendor')    { showScreen('vendor-dashboard'); return; }

      // User portal or unknown — go back to calculator if calc exists
      if (userCalculationResult) { showScreen('user-calculator'); return; }
      showScreen('welcome');
    }

    async function selectInstallerForQuote(installerId) {
      selectedInstallerId = installerId;
      selectedVendorId = null;
      selectedVendorProfile = null;
      try {
        const { data } = await supabaseClient.from('profiles').select('*').eq('id', installerId).maybeSingle();
        if (data) selectedInstallerProfile = data;
      } catch (e) { console.warn('Failed to load selected installer profile:', e); }
      const marketplaceState = document.getElementById('installerMarketplaceState');
      const leadState = document.getElementById('leadState');
      if (marketplaceState && leadState && marketplaceState.value) leadState.value = marketplaceState.value;
      prepareLeadFlow('installer');
    }

    async function selectVendorForOffer(vendorId) {
      selectedVendorId = vendorId;
      selectedInstallerId = null;
      selectedInstallerProfile = null;
      try {
        const { data } = await supabaseClient.from('profiles').select('*').eq('id', vendorId).maybeSingle();
        if (data) selectedVendorProfile = data;
      } catch (e) { console.warn('Failed to load selected vendor profile:', e); }
      const marketplaceState = document.getElementById('vendorMarketplaceState');
      const leadState = document.getElementById('leadState');
      if (marketplaceState && leadState && marketplaceState.value) leadState.value = marketplaceState.value;
      prepareLeadFlow('vendor');
    }

    function goBackFromLeadForm() {
      if (currentLeadTarget === 'installer' && selectedInstallerId) {
        showScreen('installer-marketplace');
        return;
      }
      if (currentLeadTarget === 'vendor' && selectedVendorId) {
        showScreen('vendor-marketplace');
        return;
      }
      showScreen('user-calculator');
    }

    function openUserCostScreen() {
      if (!userCalculationResult) { showToast('Calculate a system first', 'error'); return; }
      showScreen('user-cost-breakdown');
      try { if (typeof egSetSharedCostActions === 'function') egSetSharedCostActions('user'); } catch(e) {}
    }

    async function submitLead() {
      // ── Validation ──────────────────────────────────────────────────────
      let valid = true;
      const clearErr = id => { const el = document.getElementById(id); if (el) el.textContent = ''; };
      const setErr   = (id, msg) => { const el = document.getElementById(id); if (el) el.textContent = msg; valid = false; };

      ['leadNameError','leadPhoneError','leadEmailError','leadStateError','leadCityError','leadProjectTypeError']
        .forEach(clearErr);

      const name        = (document.getElementById('leadName')?.value        || '').trim();
      const phone       = (document.getElementById('leadPhone')?.value       || '').trim();
      const email       = (document.getElementById('leadEmail')?.value       || '').trim();
      const state       = (document.getElementById('leadState')?.value       || '').trim();
      const city        = (document.getElementById('leadCity')?.value        || '').trim();
      const projectType = (document.getElementById('leadProjectType')?.value || '').trim();

      if (!name)        setErr('leadNameError',        'Name is required');
      if (!phone)       setErr('leadPhoneError',       'Phone is required');
      if (!email)       setErr('leadEmailError',       'Email is required');
      if (!state)       setErr('leadStateError',       'State is required');
      if (!city)        setErr('leadCityError',        'City / area is required');
      if (!projectType) setErr('leadProjectTypeError', 'Project type is required');

      if (!valid) { showToast('Please fill in all required fields', 'error'); return; }
      if (!userCalculationResult) { showToast('No system sizing found. Please calculate first.', 'error'); return; }

      const r              = userCalculationResult;
      const isVendorLead   = currentLeadTarget === 'vendor';
      const batteryPref    = document.getElementById('leadBatteryPreference')?.value || '';
      const budgetRange    = document.getElementById('leadBudgetRange')?.value        || '';
      const contactMethod  = document.getElementById('leadContactMethod')?.value     || 'phone';
      const vendorQuoteType= document.getElementById('leadVendorQuoteType')?.value   || 'full_system';
      const note           = document.getElementById('leadNote')?.value              || '';

      const authUserForLead = await getAuthUser().catch(() => null);

      const lead = {
        full_name:            name,
        phone,
        email,
        state,
        city,
        project_type:         projectType,
        battery_preference:   batteryPref   || null,
        budget_range:         isVendorLead ? null : (budgetRange || null),
        vendor_quote_type:    isVendorLead ? vendorQuoteType : null,
        contact_method:       contactMethod,
        note:                 note          || null,
        status:               isVendorLead ? 'vendor_requested' : 'installer_requested',
        claim_status:         'open',
        // Sizing snapshot from calculator
        inverter_kva:         r.invKva           || null,
        panel_count:          r.numPanels        || null,
        battery_kwh:          r.lithiumPackKwh   || null,
        daily_kwh:            r.dailyKwh         || null,
        total_cost:           r.totalCost        || null,
        // Targeted professional (if user selected one from marketplace)
        target_installer_id:  (!isVendorLead && selectedInstallerId) ? selectedInstallerId : null,
        target_vendor_id:     (isVendorLead  && selectedVendorId)    ? selectedVendorId    : null,
        created_at:           new Date().toISOString(),
        user_id:              authUserForLead ? authUserForLead.id : null,
      };

      showLoading(true, 'Submitting your request...');
      const result = await supabaseSubmitMarketplaceLead(lead);
      showLoading(false);

      if (!result.success) {
        showToast('Submission failed: ' + (result.error || 'Please try again.'), 'error');
        return;
      }

      // Remember state for next time
      try { localStorage.setItem('energyGuide_lastLead', JSON.stringify({ state })); } catch(e) {}

      showScreen('lead-success');
      updateLeadSuccessAccountUI();
    }

        function prepareLeadFlow(target) {
      if (!userCalculationResult) { showToast('Calculate a system first', 'error'); return; }
      currentLeadTarget = target;
      const titleEl = document.getElementById('leadFlowTitle');
      const subtitleEl = document.getElementById('leadFlowSubtitle');
      const successEl = document.getElementById('leadSuccessSubtitle');
      const budgetGroup = document.getElementById('leadBudgetGroup');
      const budgetLabel = document.getElementById('leadBudgetLabel');
      const vendorQuoteGroup = document.getElementById('leadVendorQuoteGroup');
      const noteLabel = document.getElementById('leadNoteLabel');
      const noteField = document.getElementById('leadNote');
      const batteryLabel = document.getElementById('leadBatteryLabel');
      const budgetField = document.getElementById('leadBudgetRange');
      const vendorQuoteField = document.getElementById('leadVendorQuoteType');
      if (target === 'vendor') {
        if (titleEl) titleEl.textContent = selectedVendorId ? 'Request Offer from Selected Vendor' : 'Continue Your Vendor Request';
        if (subtitleEl) subtitleEl.textContent = selectedVendorId ? 'Confirm a few details so this vendor can respond to your request.' : 'Confirm a few details so vendors can respond to your request.';
        if (successEl) successEl.textContent = selectedVendorId ? 'Your vendor request has been sent successfully.' : 'Your vendor request has been saved successfully.';
        if (budgetGroup) budgetGroup.style.display = 'none';
        if (budgetField) budgetField.value = '';
        if (vendorQuoteGroup) vendorQuoteGroup.style.display = 'block';
        if (batteryLabel) batteryLabel.textContent = 'Preferred Battery Type';
        if (noteLabel) noteLabel.textContent = 'Products / Brand Note';
        if (noteField) noteField.placeholder = 'Tell vendors any preferred brands, exact items, delivery note or special product request';
      } else {
        if (titleEl) titleEl.textContent = selectedInstallerId ? 'Request Quote from Selected Installer' : 'Continue Your Installer Request';
        if (subtitleEl) subtitleEl.textContent = selectedInstallerId ? 'Confirm a few details so this installer can review your quote request.' : 'Confirm a few details so installers can review your quote request.';
        if (successEl) successEl.textContent = selectedInstallerId ? 'Your installer request has been sent successfully.' : 'Your installer request has been saved successfully.';
        if (budgetGroup) budgetGroup.style.display = 'block';
        if (budgetLabel) budgetLabel.textContent = 'Budget Range';
        if (vendorQuoteGroup) vendorQuoteGroup.style.display = 'none';
        if (vendorQuoteField) vendorQuoteField.value = 'full_system';
        if (batteryLabel) batteryLabel.textContent = 'Battery Preference';
        if (noteLabel) noteLabel.textContent = 'Installation Note';
        if (noteField) noteField.placeholder = 'Any special note, installation preference, roof info, timing or access note';
      }
      const marketplaceState = target === 'vendor' ? setMarketplaceStateFromContext('vendorMarketplaceState') : setMarketplaceStateFromContext('installerMarketplaceState');
      const leadStateEl = document.getElementById('leadState');
      const leadCityEl = document.getElementById('leadCity');
      const selectedProfile = target === 'vendor' ? selectedVendorProfile : selectedInstallerProfile;
      if (leadStateEl && !leadStateEl.value) leadStateEl.value = marketplaceState || (selectedProfile && selectedProfile.state) || '';
      if (leadCityEl && !leadCityEl.value && selectedProfile && (selectedProfile.city || selectedProfile.service_city)) {
        leadCityEl.value = selectedProfile.city || selectedProfile.service_city || '';
      }
      updateLeadSelectionSummary();
      showScreen('submit-lead');
    }

    
    // Installer Portal State
    let instCalculationResult = null;
    
    // Vendor Portal State
    let vendorUploadedImage = null;
    let vendorCurrentProduct = null;
    
    // ================================
    // CORE UI FUNCTIONS
    // ================================
    
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      const icons = { success: '✓', error: '✗', info: 'ℹ', warning: '⚠' };
      toast.innerHTML = `<span style="font-size: 20px;">${icons[type]}</span><span>${message}</span>`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
    
    function showLoading(show = true, text = 'Processing...') {
      document.getElementById('loadingOverlay').classList.toggle('active', show);
      document.getElementById('loadingText').textContent = text;
    }
    
    function validateField(fieldId, errorId, validator, errorMsg) {
      const field = document.getElementById(fieldId);
      const errorDiv = document.getElementById(errorId);
      if (!field || !errorDiv) return true;
      
      if (!validator(field.value)) {
        field.classList.add('input-error');
        errorDiv.textContent = errorMsg;
        return false;
      } else {
        field.classList.remove('input-error');
        errorDiv.textContent = '';
        return true;
      }
    }
    
    // ================================
    // NAVIGATION
    // ================================
    
    function selectRole(role) {
      currentRole = role;
      const topBar = document.getElementById('topBar');
      topBar.className = 'top-bar ' + role;
      
      if (role === 'user') {
        if (typeof updateUserAccountUI === 'function') updateUserAccountUI();
        showScreen('user-calculator');
      } else if (role === 'installer') {
        showScreen('installer-login');
      } else if (role === 'vendor') {
        showScreen('vendor-login');
      }
    }
    
    function forceResetScroll() {
      const contentEl = document.querySelector('.content');
      const appEl = document.querySelector('.app-container');
      const activeScreen = document.querySelector('.screen.active');
      [contentEl, appEl, activeScreen, document.documentElement, document.body].forEach(el => {
        if (!el) return;
        try { el.scrollTop = 0; } catch(e) {}
        try { if (typeof el.scrollTo === 'function') el.scrollTo(0,0); } catch(e) {}
      });
      document.querySelectorAll('.left-panel, .right-panel').forEach(el => {
        try { el.scrollTop = 0; } catch(e) {}
        try { if (typeof el.scrollTo === 'function') el.scrollTo(0,0); } catch(e) {}
      });
      try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch(e) {}
    }

    function showScreen(screenId) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      if (currentScreen !== screenId) screenHistory.push(currentScreen);
      currentScreen = screenId;

      const activeEl = document.activeElement;
      if (activeEl && typeof activeEl.blur === 'function') activeEl.blur();

      const screen = document.getElementById(screenId);
      if (screen) screen.classList.add('active');

      // Hard reset every likely scroll container. Some portal flows come from the
      // long embedded calculators, so the browser can preserve the old scroll/focus
      // position unless we reset after layout has updated.
      const resetScrollPositions = () => {
        const contentEl = document.querySelector('.content');
        const appEl = document.querySelector('.app-container');
        if (contentEl) {
          contentEl.scrollTop = 0;
          if (typeof contentEl.scrollTo === 'function') contentEl.scrollTo(0, 0);
        }
        if (appEl) {
          appEl.scrollTop = 0;
          if (typeof appEl.scrollTo === 'function') appEl.scrollTo(0, 0);
        }
        if (screen) {
          screen.scrollTop = 0;
          if (typeof screen.scrollTo === 'function') screen.scrollTo(0, 0);
        }
        document.querySelectorAll('.right-panel, .left-panel').forEach(el => {
          el.scrollTop = 0;
          if (typeof el.scrollTo === 'function') el.scrollTo(0, 0);
        });
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };
      resetScrollPositions();
      requestAnimationFrame(() => {
        resetScrollPositions();
        setTimeout(resetScrollPositions, 0);
        setTimeout(resetScrollPositions, 60);
      });

      updateTopBar(screenId);
      
      // Load data when showing specific screens
      if (screenId === 'saved-calculations') renderSavedCalculations();
      if (screenId === 'installer-dashboard') updateInstallerDashboard();
      if (screenId === 'vendor-dashboard') updateVendorDashboard();
      if (screenId === 'vendor-catalog') renderVendorCatalog();
      if (screenId === 'job-leads') renderJobLeads();
      if (screenId === 'vendor-requests') renderVendorRequests();
      if (screenId === 'vendor-add-product' && !vendorCurrentProduct) resetVendorProductForm();
      if (screenId === 'vendor-calculator') { if (!vendorIframeResult) { const b = document.getElementById('vendorCalcBuildOfferBtn'); if(b) b.style.display='none'; } }
      const egViewBtn = document.getElementById('eg-view-results-btn');
      if (egViewBtn && screenId !== 'installer-calculator') egViewBtn.style.display = 'none';
      if (screenId === 'installer-profile-view') loadInstallerProfileViewScreen();
      if (screenId === 'vendor-profile-view') loadVendorProfileViewScreen();
      if (screenId === 'installer-profile') { loadInstallerProfileScreen(); requestAnimationFrame(() => { forceResetScroll(); setTimeout(forceResetScroll, 40); setTimeout(forceResetScroll, 120); }); }
      if (screenId === 'vendor-profile') { loadVendorProfileScreen(); requestAnimationFrame(() => { forceResetScroll(); setTimeout(forceResetScroll, 40); setTimeout(forceResetScroll, 120); }); }
      if (screenId === 'installer-marketplace') loadInstallerMarketplace();
      if (screenId === 'vendor-marketplace') loadVendorMarketplace();
    }
    
    function updateTopBar(screenId) {
      const topBar = document.getElementById('topBar');
      // Update role CSS class for correct portal colour
      topBar.classList.remove('user', 'installer', 'vendor');
      if (currentRole === 'installer') topBar.classList.add('installer');
      else if (currentRole === 'vendor') topBar.classList.add('vendor');
      else topBar.classList.add('user');

      const mainScreens = ['welcome', 'installer-dashboard', 'vendor-dashboard'];
      document.getElementById('backBtn').style.visibility = mainScreens.includes(screenId) ? 'hidden' : 'visible';

      const isAuthenticatedRole = currentRole === 'installer' || currentRole === 'vendor';
      const isPortalScreen =
        screenId.includes('dashboard') || screenId.includes('calculator') || screenId.includes('results') ||
        screenId.includes('saved') || screenId.includes('catalog') || screenId.includes('product') ||
        screenId.includes('leads') || screenId.includes('requests') || screenId.includes('profile') ||
        screenId.includes('marketplace') || screenId.includes('offer') || screenId.includes('quote');

      document.getElementById('logoutBtn').style.display = (isAuthenticatedRole && isPortalScreen) ? 'block' : 'none';
    }
    
    function goBack() {
      if (screenHistory.length > 0) {
        const prevScreen = screenHistory.pop();
        const screen = document.getElementById(prevScreen);
        if (!screen) {
          showScreen(currentRole === 'installer' ? 'installer-dashboard' : currentRole === 'vendor' ? 'vendor-dashboard' : 'welcome');
          return;
        }
        // Navigate directly — do NOT call showScreen() which would re-push currentScreen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
        currentScreen = prevScreen;
        updateTopBar(prevScreen);
        if (prevScreen === 'saved-calculations') renderSavedCalculations();
        if (prevScreen === 'installer-dashboard') updateInstallerDashboard();
        if (prevScreen === 'vendor-dashboard') updateVendorDashboard();
        if (prevScreen === 'vendor-catalog') renderVendorCatalog();
        if (prevScreen === 'job-leads') renderJobLeads();
        if (prevScreen === 'vendor-requests') renderVendorRequests();
        if (prevScreen === 'installer-marketplace') loadInstallerMarketplace();
        if (prevScreen === 'vendor-marketplace') loadVendorMarketplace();
      }
    }
    
    function logout() {
      // Sign out of Supabase session first (async, fire-and-forget is fine here)
      if (typeof supabaseSignOut === 'function') supabaseSignOut().catch(() => {});
      currentUser = null;
      currentRole = null;
      screenHistory = [];
      vendorIframeResult = null;
      instCalculationResult = null;
      localStorage.removeItem('energyGuide_currentUser');
      // Reset top bar to neutral before navigating
      const topBar = document.getElementById('topBar');
      if (topBar) { topBar.classList.remove('user', 'installer', 'vendor'); }
      if (typeof updateUserAccountUI === 'function') updateUserAccountUI();
      showScreen('welcome');
      showToast('Logged out successfully', 'info');
    }
    
    // ================================
    // USER PORTAL FUNCTIONS
    // ================================
    
    function detectSurgeType(name) {
      const lower = name.toLowerCase();
      if (lower.includes('fridge') || lower.includes('freezer') || lower.includes('refrigerator')) return 'fridge';
      if (lower.includes('pump') || lower.includes('ac') || lower.includes('air con')) return 'pump';
      if (lower.includes('motor') || lower.includes('compressor')) return 'motor';
      if (lower.includes('fan') || lower.includes('blower')) return 'fan';
      return 'light';
    }
    
    async function saveCalculation() {
      if (!instCalculationResult) { showToast('No calculation to save', 'error'); return; }
      showLoading(true, 'Saving...');
      try {
        await saveCalculationToCloud({ ...instCalculationResult, role: 'installer', timestamp: new Date().toISOString() });
        showLoading(false);
        showToast('Saved!', 'success');
        updateInstallerDashboard();
      } catch (error) {
        showLoading(false);
        console.error('saveCalculation error:', error);
        showToast('Save failed: ' + (error.message || 'unknown error'), 'error');
      }
    }
    
    function egFormatNumber(value) {
      return Number(value || 0).toLocaleString();
    }

    function egJoinLines(lines) {
      return (lines || []).filter(line => line !== null && line !== undefined && line !== '').join('\n');
    }

    function egOpenWhatsApp(text) {
      const encoded = encodeURIComponent(String(text || '').trim());
      if (!encoded) { showToast('Nothing to share yet.', 'error'); return; }
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
      const appUrl = `whatsapp://send?text=${encoded}`;
      const webUrl = `https://web.whatsapp.com/send?text=${encoded}`;
      const fallbackUrl = `https://wa.me/?text=${encoded}`;
      try {
        if (isMobile) {
          window.location.href = appUrl;
          setTimeout(() => {
            if (document.visibilityState === 'visible') {
              window.open(fallbackUrl, '_blank', 'noopener');
            }
          }, 900);
        } else {
          window.open(webUrl, '_blank', 'noopener');
        }
        showToast('Opening WhatsApp...', 'info');
      } catch (error) {
        window.open(fallbackUrl, '_blank', 'noopener');
        showToast('Opening WhatsApp...', 'info');
      }
    }

    function egSavePdf(doc, filename) {
      if (!doc || typeof doc.save !== 'function') {
        throw new Error('PDF engine is unavailable.');
      }
      doc.save(filename);
    }

    function exportPDF() {
      if (!instCalculationResult || !window.jspdf) { showToast('PDF library not loaded', 'error'); return; }
      
      showLoading(true, 'Generating PDF...');
      setTimeout(() => {
        try {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          const r = instCalculationResult;
          const N = egFormatNumber;
          const invKw = Math.ceil((r.requiredInverter || 0) / 1000);
          const batteryLabel = `${r.batteryCount || 0}× 5kWh ${r.batteryType || 'Lithium'}`;
          
          doc.setFontSize(22); doc.setTextColor(10, 126, 164);
          doc.text('Energy Guide', 105, 20, { align: 'center' });
          doc.setFontSize(16); doc.setTextColor(0);
          doc.text('Solar System Design Report', 105, 30, { align: 'center' });
          doc.setFontSize(10); doc.setTextColor(100);
          doc.text(new Date().toLocaleDateString('en-NG'), 105, 37, { align: 'center' });
          doc.setLineWidth(0.5); doc.setDrawColor(10, 126, 164);
          doc.line(20, 42, 190, 42);
          
          let y = 52;
          doc.setFontSize(14); doc.setTextColor(0);
          doc.text('Load Analysis', 20, y); y += 8;
          doc.setFontSize(10);
          doc.text(`Running Load: ${N(r.totalRunning)}W`, 25, y); y += 6;
          doc.text(`Daily Energy: ${N(r.dailyEnergy)}Wh`, 25, y); y += 6;
          doc.text(`Peak Surge: ${N(r.maxSurge)}W`, 25, y); y += 6;
          doc.text(`Recommended Inverter: ${invKw}kW`, 25, y); y += 12;
          
          doc.setFontSize(14);
          doc.text('Recommended Components', 20, y); y += 8;
          doc.setFontSize(10);
          doc.text(`Solar Panels: ${r.totalPanels}× ${((r.panel && r.panel.model) || 'Panel')}`, 25, y); y += 6;
          doc.text(`Battery Bank: ${batteryLabel}`, 25, y); y += 6;
          doc.text(`Charge Controller: ${r.useMPPT ? 'MPPT' : 'PWM'}`, 25, y); y += 6;
          doc.text(`System Voltage: ${r.systemVoltage || '—'}V`, 25, y); y += 6;
          if (r.actualPvPower) { doc.text(`Total PV Power: ${N(r.actualPvPower)}W`, 25, y); y += 6; }
          y += 6;

          doc.setFontSize(14);
          doc.text('Estimated Cost Breakdown', 20, y); y += 8;
          doc.setFontSize(10);
          const costRows = [
            ['Panels', r.costs && r.costs.panels ? r.costs.panels.cost : 0],
            ['Inverter', r.costs && r.costs.inverter ? r.costs.inverter.cost : 0],
            ['Batteries', r.costs && r.costs.batteries ? r.costs.batteries.cost : 0],
            ['Charge Controller', r.costs && r.costs.controller ? r.costs.controller.cost : 0],
            ['Cables', r.costs && r.costs.cables ? r.costs.cables.cost : 0],
            ['Installation', r.costs && r.costs.installation ? r.costs.installation.cost : 0],
            ['Miscellaneous', r.costs && r.costs.misc ? r.costs.misc.cost : 0],
          ];
          costRows.forEach(([label, value]) => {
            doc.text(label, 25, y);
            doc.text(`NGN ${N(value)}`, 170, y, { align: 'right' });
            y += 6;
          });
          y += 2;

          if ((r.breakers && r.breakers.length) || (r.cables && r.cables.length)) {
            doc.setFontSize(14);
            doc.text('Protection & Cable Reference', 20, y); y += 8;
            doc.setFontSize(10);
            (r.breakers || []).forEach((b, i) => {
              const labels = ['PV DC Breaker', 'Battery Breaker', 'AC Breaker'];
              doc.text(`${labels[i] || 'Breaker'}: ${b.rating_A || '—'}A ${b.type || ''}`.trim(), 25, y);
              y += 6;
            });
            (r.cables || []).forEach((c, i) => {
              const labels = ['PV Cable', 'Battery Cable', 'AC Cable'];
              const size = c.cable && c.cable.size_mm2 ? `${c.cable.size_mm2}mm²` : '—';
              doc.text(`${labels[i] || 'Cable'}: ${size} × ${c.length || 0}m`, 25, y);
              y += 6;
            });
            y += 2;
          }
          
          doc.setFontSize(14); doc.setTextColor(10, 126, 164);
          doc.text(`Estimated Total: NGN ${N(r.totalCost)}`, 25, y);
          
          doc.setFontSize(8); doc.setTextColor(150);
          doc.text('Generated by Energy Guide Platform', 105, 285, { align: 'center' });
          
          egSavePdf(doc, `solar-system-report-${Date.now()}.pdf`);
          showLoading(false);
          showToast('PDF downloaded!', 'success');
        } catch (error) {
          showLoading(false);
          showToast('PDF export failed: ' + error.message, 'error');
        }
      }, 300);
    }
    
    // ── INSTALLER QUOTE GENERATOR ──────────────────────────────────────────
    // ── INSTALLER QUOTE BUILDER ─────────────────────────────────────────────

    // Holds the active lead snapshot (if any) for the quote
    let iqbAttachedLead = null;

    // Build a minimal instCalculationResult-compatible object from a lead's sizing snapshot.
    // Used when opening the Quote Builder directly from a lead card (no iframe calc needed).
    function buildInstResultFromLead(lead) {
      const invKva  = parseFloat(lead.inverter_kva)  || 3;
      const panels  = parseInt(lead.panel_count)      || 6;
      const batKwh  = parseFloat(lead.battery_kwh)   || 5;
      const dailyKwh= parseFloat(lead.daily_kwh)     || (batKwh * 0.8);
      const batCount= Math.max(1, Math.ceil(batKwh / 5));
      const sysV    = invKva <= 3 ? 24 : 48;
      return {
        requiredInverter: invKva * 1000,
        totalRunning:     invKva * 700,
        dailyEnergy:      dailyKwh * 1000,
        maxSurge:         invKva * 1200,
        totalPanels:      panels,
        actualPvPower:    panels * 500,
        batteryCount:     batCount,
        systemVoltage:    sysV,
        useMPPT:          true,
        totalCost:        parseFloat(lead.total_cost) || 0,
        panel:            { model: '500W Mono', price_NGN: 76000 },
        cables:           [
          { segment: 'PV',      length: 10, current: invKva*20, cable: { size_mm2: '6', price_per_meter_NGN: 3500 }, vDrop: 1.2 },
          { segment: 'Battery', length: 3,  current: invKva*50, cable: { size_mm2: '25', price_per_meter_NGN: 8000 }, vDrop: 0.8 },
          { segment: 'AC',      length: 10, current: invKva*10, cable: { size_mm2: '4', price_per_meter_NGN: 4100 }, vDrop: 1.0 },
        ],
        breakers:         [
          { rating_A: Math.ceil(panels*10*1.25/10)*10, type: 'DC' },
          { rating_A: Math.ceil(invKva*50*1.25/10)*10, type: 'DC' },
          { rating_A: Math.ceil(invKva*10*1.25/10)*10, type: 'AC' },
        ],
        safetyChecks:     [{ type: 'success', msg: '✅ Loaded from lead snapshot — verify on site' }],
      };
    }

    function openInstViewCost() {
      if (!instCalculationResult) { showToast('No calculation result', 'error'); return; }
      currentRole = 'installer';
      const r = instCalculationResult || {};
      const N = v => Number(v || 0).toLocaleString();

      // Normalize installer result into the cost format used by the shared cost screen
      const normalized = Object.assign({}, r);
      if (typeof egBuildCostBreakdown === 'function') {
        Object.assign(normalized, egBuildCostBreakdown({
          invKva: normalized.invKva || Math.ceil((normalized.requiredInverter || 0) / 1000) || 0,
          lithiumPackKwh: normalized.lithiumPackKwh || normalized.batteryBankKwh || 0,
          numPanels: normalized.numPanels || normalized.totalPanels || normalized.panelCount || 0,
          leadTotalBatteries: normalized.leadTotalBatteries || 0,
          pvBreaker: normalized.pvBreaker || (normalized.breakers && normalized.breakers[0] ? normalized.breakers[0].rating_A : 0),
          battBreaker: normalized.battBreaker || (normalized.breakers && normalized.breakers[1] ? normalized.breakers[1].rating_A : 0),
          acBreaker: normalized.acBreaker || (normalized.breakers && normalized.breakers[2] ? normalized.breakers[2].rating_A : 0),
          pvCable: normalized.pvCable || (normalized.cables && normalized.cables[0] && normalized.cables[0].cable ? normalized.cables[0].cable.size_mm2 : 0),
          battCable: normalized.battCable || (normalized.cables && normalized.cables[1] && normalized.cables[1].cable ? normalized.cables[1].cable.size_mm2 : 0),
          acCable: normalized.acCable || (normalized.cables && normalized.cables[2] && normalized.cables[2].cable ? normalized.cables[2].cable.size_mm2 : 0)
        }));
      }
      const inv = normalized.invKva || Math.ceil((normalized.requiredInverter || 0) / 1000) || 0;
      const panelCost = normalized.panelCost || 0;
      const inverterCost = normalized.inverterCost || 0;
      const batteryCost = normalized.batteryCost || 0;
      const totalCost = normalized.totalCost || (panelCost + inverterCost + batteryCost);

      const totalEl = document.getElementById('userTotalCost');
      if (totalEl) totalEl.textContent = '₦' + N(totalCost);

      const pEl = document.getElementById('costPanels');
      const iEl = document.getElementById('costInverter');
      const bEl = document.getElementById('costBattery');
      if (pEl) pEl.textContent = '₦' + N(panelCost);
      if (iEl) iEl.textContent = '₦' + N(inverterCost);
      if (bEl) bEl.textContent = '₦' + N(batteryCost);

      const bodyEl = document.getElementById('costBreakdownBody');
      if (bodyEl) {
        const batteryLabel = normalized.batLabel
          ? `${normalized.batUnits || 1} × ${normalized.batLabel}`
          : `${normalized.batteryCount || 1} × ${normalized.batteryBankKwh || normalized.lithiumPackKwh || 0}kWh`;
        const rows = [
          ['Solar Panels', `${normalized.totalPanels || normalized.numPanels || normalized.panelCount || 0} panel(s) @ ₦${N(normalized.panelUnitPrice || 0)}`, panelCost],
          ['Hybrid Inverter', `${inv}kVA`, inverterCost],
          ['Lithium Battery', batteryLabel, batteryCost],
          ['Alternative Tubular Battery Option', `₦${N(normalized.tubularUnitPrice || 0)} × ${normalized.leadTotalBatteries || 0} batteries = ₦${N(normalized.tubularAltCost || 0)}`, normalized.tubularAltCost || 0]
        ];
        bodyEl.innerHTML = rows.map(([item, detail, cost]) =>
          `<tr><td>${item}</td><td style="font-size:12px;color:#9ca3af;">${detail}</td><td>₦${N(cost)}</td></tr>`
        ).join('');
      }

      const refEl = document.getElementById('costReferenceBody');
      if (refEl) {
        const rows = [
          ['PV Breaker', `${normalized.pvBreaker || 0}A DC recommended`, normalized.pvBreakerPrice || 0],
          ['Battery Breaker', `${normalized.battBreaker || 0}A DC recommended`, normalized.batteryBreakerPrice || 0],
          ['AC Breaker', `${normalized.acBreaker || 0}A AC recommended`, normalized.acBreakerPrice || 0],
          ['PV Cable', `${normalized.pvCable || 0}mm² @ ₦${N(normalized.pvCablePerMeter || 0)} per meter`, normalized.pvCablePerMeter || 0],
          ['Battery Cable', `${normalized.battCable || 0}mm² @ ₦${N(normalized.batteryCablePerMeter || 0)} per meter`, normalized.batteryCablePerMeter || 0],
          ['AC Cable', `${normalized.acCable || 0}mm² @ ₦${N(normalized.acCablePerMeter || 0)} per meter`, normalized.acCablePerMeter || 0]
        ];
        refEl.innerHTML = rows.map(([item, detail, cost]) =>
          `<tr><td>${item}</td><td style="font-size:12px;color:#9ca3af;">${detail}</td><td>₦${N(cost)}${item.includes('Cable') ? '/m' : ''}</td></tr>`
        ).join('');
      }

      const notesEl = document.getElementById('costNotes');
      if (notesEl) notesEl.textContent = 'Final total covers only core equipment: panels, inverter and lithium battery. Recommended breaker prices and cable per-meter prices are shown separately and remain subject to installer site verification.';

      showScreen('user-cost-breakdown');

      // In installer context, hide user-only marketplace actions on shared cost screen
      const installerVendorBtns = document.querySelectorAll('#user-cost-breakdown .btn-success, #user-cost-breakdown .btn-primary');
      installerVendorBtns.forEach(btn => { btn.style.display = 'none'; });

      const backBtns = document.querySelectorAll('#user-cost-breakdown .btn-secondary');
      backBtns.forEach(btn => {
        btn.style.display = 'block';
        btn.textContent = '← Back to Calculator';
        btn.onclick = () => showScreen('installer-calculator');
      });
    }

    function openInstallerQuoteBuilder() {
      if (!instCalculationResult) { showToast('No calculation result. Please calculate first.', 'error'); return; }
      iqbAttachedLead = null; // Walk-in by default; extend later to pass claimed lead
      populateQuoteBuilder();
      showScreen('installer-quote-builder');
      requestAnimationFrame(() => { forceResetScroll(); setTimeout(forceResetScroll, 40); setTimeout(forceResetScroll, 120); });
    }

    function backFromInstallerQuoteBuilder() {
      if (iqbAttachedLead) {
        showScreen('job-leads');
      } else {
        showScreen('installer-dashboard');
      }
    }

    // Open Quote Builder pre-filled from a claimed lead card (no iframe calc required)
    function openQuoteBuilderFromLead(leadJSON) {
      let lead;
      try { lead = JSON.parse(decodeURIComponent(leadJSON)); } catch(e) { showToast('Could not load lead data', 'error'); return; }
      instCalculationResult = buildInstResultFromLead(lead);
      iqbAttachedLead = lead;
      populateQuoteBuilder();
      showScreen('installer-quote-builder');
      requestAnimationFrame(() => { forceResetScroll(); setTimeout(forceResetScroll, 40); setTimeout(forceResetScroll, 120); });
    }

    function getIqbSnapshot() {
      if (iqbAttachedLead) {
        return {
          name: iqbAttachedLead.full_name || 'Walk-in client',
          phone: iqbAttachedLead.phone || 'Not provided',
          state: iqbAttachedLead.state || '—',
          city: iqbAttachedLead.city || '—',
          projectType: iqbAttachedLead.project_type || '—',
          leadStatus: iqbAttachedLead.status || 'Lead'
        };
      }
      const val = (id, fallback='') => {
        const el = document.getElementById(id);
        return el ? String(el.value || '').trim() || fallback : fallback;
      };
      return {
        name: val('iqb-walkin-name', 'Walk-in client'),
        phone: val('iqb-walkin-phone', 'Not provided'),
        state: val('iqb-walkin-state', '—'),
        city: val('iqb-walkin-city', '—'),
        projectType: val('iqb-walkin-project-type', '—'),
        leadStatus: 'Walk-in'
      };
    }

    function populateQuoteBuilder() {
      const r = instCalculationResult;
      const lead = iqbAttachedLead;
      const inverterKw = Math.ceil(r.requiredInverter / 1000);

      // ── Section A: Client snapshot ──────────────────────────────────────
      if (lead) {
        document.getElementById('iqb-client-card').innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;">
            <div><span style="color:#687076;">Client</span><br><strong>${lead.full_name || 'Walk-in client'}</strong></div>
            <div><span style="color:#687076;">Phone</span><br><strong>${lead.phone || 'Not provided'}</strong></div>
            <div><span style="color:#687076;">State</span><br><strong>${lead.state || '—'}</strong></div>
            <div><span style="color:#687076;">City / Area</span><br><strong>${lead.city || '—'}</strong></div>
            <div><span style="color:#687076;">Project Type</span><br><strong>${lead.project_type || '—'}</strong></div>
            <div><span style="color:#687076;">Date</span><br><strong>${new Date().toLocaleDateString('en-NG')}</strong></div>
            <div><span style="color:#687076;">Lead Status</span><br><strong>${lead.status || '—'}</strong></div>
          </div>`;
      } else {
        document.getElementById('iqb-client-card').innerHTML = `
          <div style="font-size:11px;color:#9ca3af;margin-bottom:12px;">Walk-in quote — editable before PDF/WhatsApp</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;">
            <div><label style="color:#687076;font-size:11px;display:block;margin-bottom:4px;">Client</label><input type="text" id="iqb-walkin-name" value="Walk-in customer" style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
            <div><label style="color:#687076;font-size:11px;display:block;margin-bottom:4px;">Phone</label><input type="text" id="iqb-walkin-phone" placeholder="Not provided" style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
            <div><label style="color:#687076;font-size:11px;display:block;margin-bottom:4px;">State</label><input type="text" id="iqb-walkin-state" placeholder="State" style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
            <div><label style="color:#687076;font-size:11px;display:block;margin-bottom:4px;">City / Area</label><input type="text" id="iqb-walkin-city" placeholder="City / Area" style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
            <div><label style="color:#687076;font-size:11px;display:block;margin-bottom:4px;">Project Type</label><input type="text" id="iqb-walkin-project-type" placeholder="Project Type" style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
            <div><label style="color:#687076;font-size:11px;display:block;margin-bottom:4px;">Date</label><input type="text" value="${new Date().toLocaleDateString('en-NG')}" readonly style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;background:#f9fafb;color:#6b7280;"></div>
            <div><label style="color:#687076;font-size:11px;display:block;margin-bottom:4px;">Lead Status</label><input type="text" value="Walk-in" readonly style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;background:#f9fafb;color:#6b7280;"></div>
          </div>`;
      }

      // ── Section B: EG Recommendation ───────────────────────────────────
      const pvBreaker   = r.breakers[0] ? r.breakers[0].rating_A + 'A ' + r.breakers[0].type : '—';
      const batBreaker  = r.breakers[1] ? r.breakers[1].rating_A + 'A ' + r.breakers[1].type : '—';
      const acBreaker   = r.breakers[2] ? r.breakers[2].rating_A + 'A ' + r.breakers[2].type : '—';
      const pvCableSize = r.cables[0] ? r.cables[0].cable.size_mm2 + 'mm²' : '—';
      const batCableSize= r.cables[1] ? r.cables[1].cable.size_mm2 + 'mm²' : '—';
      const acCableSize = r.cables[2] ? r.cables[2].cable.size_mm2 + 'mm²' : '—';

      document.getElementById('iqb-rec-card').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;">
          <div><span style="color:#687076;">Running Load</span><br><strong>${r.totalRunning.toFixed(0)}W</strong></div>
          <div><span style="color:#687076;">Daily Consumption</span><br><strong>${r.dailyEnergy.toFixed(0)}Wh</strong></div>
          <div><span style="color:#687076;">Peak Surge</span><br><strong>${r.maxSurge.toFixed(0)}W</strong></div>
          <div><span style="color:#687076;">Inverter</span><br><strong>${inverterKw}kW</strong></div>
          <div><span style="color:#687076;">System Voltage</span><br><strong>${r.systemVoltage}V</strong></div>
          <div><span style="color:#687076;">Battery</span><br><strong>${r.batteryCount}× 5kWh Lithium</strong></div>
          <div><span style="color:#687076;">Panel Count</span><br><strong>${r.totalPanels}× ${r.panel.model}</strong></div>
          <div><span style="color:#687076;">PV Array</span><br><strong>${r.actualPvPower}W</strong></div>
          <div><span style="color:#687076;">PV Breaker</span><br><strong>${pvBreaker}</strong></div>
          <div><span style="color:#687076;">Battery Breaker</span><br><strong>${batBreaker}</strong></div>
          <div><span style="color:#687076;">AC Breaker</span><br><strong>${acBreaker}</strong></div>
          <div><span style="color:#687076;">PV Cable</span><br><strong>${pvCableSize}</strong></div>
          <div><span style="color:#687076;">Battery Cable</span><br><strong>${batCableSize}</strong></div>
          <div><span style="color:#687076;">AC Cable</span><br><strong>${acCableSize}</strong></div>
        </div>`;

      // ── Section C defaults ──────────────────────────────────────────────
      const pvCablePpm  = Number(r.cables && r.cables[0] && r.cables[0].cable && r.cables[0].cable.price_per_meter_NGN) || 3500;
      const batCablePpm = Number(r.cables && r.cables[1] && r.cables[1].cable && r.cables[1].cable.price_per_meter_NGN) || 8000;
      const acCablePpm  = Number(r.cables && r.cables[2] && r.cables[2].cable && r.cables[2].cable.price_per_meter_NGN) || 4100;

      setVal('iqb-panel-qty',   r.totalPanels);
      setVal('iqb-panel-price', r.panel.price_NGN);
      setVal('iqb-inv-price',   inverterKw * 280000);
      setVal('iqb-bat-qty',     r.batteryCount);
      setVal('iqb-bat-price',   450000);
      setVal('iqb-pv-len',      EG_CABLE_LENGTHS.pv);
      setVal('iqb-bat-len',     EG_CABLE_LENGTHS.battery);
      setVal('iqb-ac-len',      EG_CABLE_LENGTHS.ac);
      setVal('iqb-labour',      0);
      setVal('iqb-transport',   0);
      setVal('iqb-mounting',    0);
      setVal('iqb-discount',    0);
      document.getElementById('iqb-note').value = '';

      // Store cable per-meter prices for recalc
      window._iqbCablePpm = { pv: pvCablePpm, bat: batCablePpm, ac: acCablePpm };
      window._iqbBreakerRef = `PV: ${pvBreaker} | Battery: ${batBreaker} | AC: ${acBreaker}`;

      recalcQuote();
    }

    function setVal(id, v) {
      const el = document.getElementById(id);
      if (el) el.value = v;
    }

    function getVal(id) {
      const el = document.getElementById(id);
      return el ? (parseFloat(el.value) || 0) : 0;
    }

    function recalcQuote() {
      if (!instCalculationResult) return;
      const r = instCalculationResult;
      const ppm = window._iqbCablePpm || { pv: 3500, bat: 8000, ac: 4100 };

      const panelQty    = getVal('iqb-panel-qty');
      const panelPrice  = getVal('iqb-panel-price');
      const invPrice    = getVal('iqb-inv-price');
      const batQty      = getVal('iqb-bat-qty');
      const batPrice    = getVal('iqb-bat-price');
      const pvLen       = getVal('iqb-pv-len');
      const batLen      = getVal('iqb-bat-len');
      const acLen       = getVal('iqb-ac-len');
      const labour      = getVal('iqb-labour');
      const transport   = getVal('iqb-transport');
      const mounting    = getVal('iqb-mounting');
      const discount    = getVal('iqb-discount');

      const panelTotal  = panelQty  * panelPrice;
      const invTotal    = invPrice;
      const batTotal    = batQty    * batPrice;
      const pvCableTotal  = pvLen  * ppm.pv;
      const batCableTotal = batLen * ppm.bat;
      const acCableTotal  = acLen  * ppm.ac;

      const subtotal = panelTotal + invTotal + batTotal + pvCableTotal + batCableTotal + acCableTotal + labour + transport + mounting;
      const finalTotal = Math.max(0, subtotal - discount);

      // Section D breakdown
      const rows = [
        ['Panels',              panelQty,  panelPrice, panelTotal ],
        ['Inverter',            1,          invPrice,  invTotal   ],
        ['Batteries',           batQty,     batPrice,  batTotal   ],
        ['PV Cable',            pvLen,      ppm.pv,    pvCableTotal,  '(₦/m)'],
        ['Battery Cable',       batLen,     ppm.bat,   batCableTotal, '(₦/m)'],
        ['AC Cable',            acLen,      ppm.ac,    acCableTotal,  '(₦/m)'],
        ['Labour',              null,       null,      labour     ],
        ['Transportation',      null,       null,      transport  ],
        ['Mounting/Accessories',null,       null,      mounting   ],
        ['Discount',            null,       null,      -discount, '', true],
      ];

      const safeNum = v => Number.isFinite(Number(v)) ? Number(v) : 0;
      const N = v => safeNum(v).toLocaleString();
      document.getElementById('iqb-breakdown').innerHTML = rows.map(([label, qty, unit, total, unitNote='', isDiscount=false]) => {
        const color = isDiscount ? 'color:#ef4444;' : '';
        const sign  = isDiscount ? '−' : '';
        const safeQty = qty === null ? null : safeNum(qty);
        const safeUnit = unit === null ? null : safeNum(unit);
        const safeTotal = safeNum(total);
        let right = '';
        if (safeQty !== null && safeUnit !== null) right = `₦${N(safeUnit)} ${unitNote} × ${safeQty} = <strong>${sign}₦${N(Math.abs(safeTotal))}</strong>`;
        else right = `<strong>${sign}₦${N(Math.abs(safeTotal))}</strong>`;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:13px;${color}">
          <span>${label}</span><span>${right}</span></div>`;
      }).join('');

      // Breaker reference
      document.getElementById('iqb-breaker-ref').innerHTML = window._iqbBreakerRef || '';

      // Section E summary
      const bizName = (currentUser && (currentUser.company_name || currentUser.business_name || currentUser.full_name)) || 'Your Business';
      const instName = (currentUser && currentUser.full_name) || '';
      const phone    = (currentUser && currentUser.phone) || '';
      const state    = (currentUser && currentUser.state) || '';

      document.getElementById('iqb-summary').innerHTML = `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;">
            <span>Subtotal</span><span>₦${N(subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px;color:#ef4444;">
            <span>Discount</span><span>− ₦${N(discount)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;border-top:1px solid #bbf7d0;padding-top:10px;">
            <span>Final Quoted Total</span><span style="color:#16a34a;">₦${N(finalTotal)}</span>
          </div>
        </div>
        <div style="font-size:13px;line-height:1.9;color:#374151;">
          <strong>${bizName}</strong><br>
          ${instName ? instName + '<br>' : ''}
          ${phone ? '📞 ' + phone + '<br>' : ''}
          ${state ? '📍 ' + state : ''}
        </div>`;

      // Store for PDF/WA
      window._iqbResult = { panelQty, panelPrice, panelTotal, invPrice, invTotal, batQty, batPrice, batTotal,
        pvLen, pvCableTotal, batLen, batCableTotal, acLen, acCableTotal, labour, transport, mounting,
        discount, subtotal, finalTotal, ppm, bizName, instName, phone, state };
    }

    function downloadQuoteBuilderPDF() {
      if (!instCalculationResult) { showToast('No calculation data', 'error'); return; }
      if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        showToast('PDF library not available', 'error'); return;
      }
      try {
        const { jsPDF } = window.jspdf || window;
        const doc = new jsPDF();
        const r   = instCalculationResult;
        const q   = window._iqbResult;
        const lead= iqbAttachedLead;
        const snap = getIqbSnapshot();
        const inv = Math.ceil(r.requiredInverter / 1000);
        const N   = v => Number(v).toLocaleString();
        const date= new Date().toLocaleDateString('en-NG');
        let y = 18;

        // Header
        doc.setFontSize(16); doc.setFont('helvetica','bold');
        doc.text('SOLAR INSTALLATION QUOTE', 105, y, {align:'center'}); y+=8;
        doc.setFontSize(10); doc.setFont('helvetica','normal');
        doc.text(q.bizName, 105, y, {align:'center'}); y+=5;
        if (q.phone) { doc.text('Tel: '+q.phone, 105, y, {align:'center'}); y+=5; }
        if (q.state) { doc.text('Location: '+q.state, 105, y, {align:'center'}); y+=5; }
        doc.text('Date: '+date, 105, y, {align:'center'}); y+=10;

        // Section A
        doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('CLIENT / JOB SNAPSHOT', 20, y); y+=7;
        doc.setFont('helvetica','normal'); doc.setFontSize(10);
        doc.text('Client: '+snap.name, 25, y); y+=5;
        doc.text('Phone: '+snap.phone, 25, y); y+=5;
        doc.text('State: '+snap.state+'  |  City: '+snap.city, 25, y); y+=5;
        doc.text('Project Type: '+snap.projectType, 25, y); y+=10;

        // Section B
        doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('ENERGY GUIDE RECOMMENDATION', 20, y); y+=7;
        doc.setFont('helvetica','normal'); doc.setFontSize(10);
        doc.text(`Inverter: ${inv}kW  |  System Voltage: ${r.systemVoltage}V`, 25, y); y+=5;
        doc.text(`Panels: ${r.totalPanels}× ${r.panel.model} = ${r.actualPvPower}W`, 25, y); y+=5;
        doc.text(`Batteries: ${r.batteryCount}× 5kWh Lithium`, 25, y); y+=5;
        if (r.breakers[0]) doc.text(`PV Breaker: ${r.breakers[0].rating_A}A ${r.breakers[0].type}`, 25, y);
        if (r.breakers[1]) doc.text(`  Battery Breaker: ${r.breakers[1].rating_A}A ${r.breakers[1].type}`, 100, y);
        y+=5;
        if (r.cables[0])   doc.text(`PV Cable: ${r.cables[0].cable.size_mm2}mm²  |  Battery: ${(r.cables[1]?r.cables[1].cable.size_mm2:'—')}mm²  |  AC: ${(r.cables[2]?r.cables[2].cable.size_mm2:'—')}mm²`, 25, y); y+=10;

        // Section C/D
        doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('INSTALLER FINAL QUOTE', 20, y); y+=7;
        doc.setFont('helvetica','normal'); doc.setFontSize(10);
        const dRows = [
          ['Panels', `${q.panelQty} × ₦${N(q.panelPrice)}`, `₦${N(q.panelTotal)}`],
          ['Inverter', '1 unit', `₦${N(q.invPrice)}`],
          ['Batteries', `${q.batQty} × ₦${N(q.batPrice)}`, `₦${N(q.batTotal)}`],
          ['PV Cable', `${q.pvLen}m × ₦${N(q.ppm.pv)}/m`, `₦${N(q.pvCableTotal)}`],
          ['Battery Cable', `${q.batLen}m × ₦${N(q.ppm.bat)}/m`, `₦${N(q.batCableTotal)}`],
          ['AC Cable', `${q.acLen}m × ₦${N(q.ppm.ac)}/m`, `₦${N(q.acCableTotal)}`],
          ['Labour', '', `₦${N(q.labour)}`],
          ['Transportation', '', `₦${N(q.transport)}`],
          ['Mounting/Accessories', '', `₦${N(q.mounting)}`],
        ];
        dRows.forEach(([l,m,v]) => {
          doc.text(l, 25, y); if(m) doc.text(m, 90, y); doc.text(v, 165, y, {align:'right'}); y+=5;
        });
        y+=3;
        doc.text('Discount', 25, y); doc.text(`− ₦${N(q.discount)}`, 165, y, {align:'right'}); y+=3;
        doc.setFont('helvetica','bold');
        doc.text('FINAL QUOTED TOTAL', 25, y); doc.text(`₦${N(q.finalTotal)}`, 165, y, {align:'right'}); y+=10;

        const note = document.getElementById('iqb-note') ? document.getElementById('iqb-note').value.trim() : '';
        if (note) {
          doc.setFont('helvetica','normal'); doc.setFontSize(10);
          doc.text('Note: '+note, 20, y); y+=8;
        }

        doc.setFont('helvetica','italic'); doc.setFontSize(9);
        doc.text('Final quantities and pricing are subject to site verification.', 20, y);

        const fname = `Quote_${q.bizName.replace(/\s+/g,'_')}_${Date.now()}.pdf`;
        egSavePdf(doc, fname);
        showToast('PDF downloaded!', 'success');
      } catch(e) {
        console.error('PDF error:', e);
        showToast('PDF generation failed: ' + e.message, 'error');
      }
    }

    function shareQuoteBuilderWhatsApp() {
      if (!instCalculationResult || !window._iqbResult) { showToast('No quote data', 'error'); return; }
      const r = instCalculationResult;
      const q = window._iqbResult;
      const N = egFormatNumber;
      const inv = Math.ceil((r.requiredInverter || 0) / 1000);
      const note = document.getElementById('iqb-note') ? document.getElementById('iqb-note').value.trim() : '';
      const cableTotal = (q.pvCableTotal || 0) + (q.batCableTotal || 0) + (q.acCableTotal || 0);
      const snap = getIqbSnapshot();

      const msg = egJoinLines([
        '🧾 *SOLAR INSTALLATION QUOTE*',
        `🏢 *${q.bizName}*`,
        q.phone ? '📞 ' + q.phone : '',
        q.state ? '📍 ' + q.state : '',
        snap.name ? '👤 Customer: ' + snap.name : '',
        snap.phone && snap.phone !== 'Not provided' ? '📞 Customer Phone: ' + snap.phone : '',
        (snap.state && snap.state !== '—') || (snap.city && snap.city !== '—') ? '📍 Customer Location: ' + snap.state + (snap.city && snap.city !== '—' ? ', ' + snap.city : '') : '',
        snap.projectType && snap.projectType !== '—' ? '🏗️ Project Type: ' + snap.projectType : '',
        '',
        '⚙️ *System Recommendation*',
        `• Inverter: ${inv}kW`,
        `• System Voltage: ${r.systemVoltage || '—'}V`,
        `• Panels: ${q.panelQty}× ${((r.panel && r.panel.model) || 'Panel')}`,
        `• Batteries: ${q.batQty}× 5kWh Lithium`,
        '',
        '💰 *Detailed Pricing*',
        `• Panels: ₦${N(q.panelTotal)}`,
        `• Inverter: ₦${N(q.invPrice)}`,
        `• Batteries: ₦${N(q.batTotal)}`,
        `• PV Cable: ₦${N(q.pvCableTotal)}`,
        `• Battery Cable: ₦${N(q.batCableTotal)}`,
        `• AC Cable: ₦${N(q.acCableTotal)}`,
        `• Total Cables: ₦${N(cableTotal)}`,
        q.labour ? `• Labour: ₦${N(q.labour)}` : '',
        q.transport ? `• Transport: ₦${N(q.transport)}` : '',
        q.mounting ? `• Mounting/Accessories: ₦${N(q.mounting)}` : '',
        q.discount ? `• Discount: − ₦${N(q.discount)}` : '',
        '',
        `*Final Total: ₦${N(q.finalTotal)}*`,
        note ? '' : null,
        note ? '📝 ' + note : null,
        '',
        '_Final quantities and pricing are subject to site verification._',
        '_Generated by Energy Guide_',
      ]);

      egOpenWhatsApp(msg);
    }

    // Keep old names as aliases so any stale references don't hard-crash
    function openInstallerQuoteScreen()      { openInstallerQuoteBuilder(); }
    function downloadInstallerQuotePDF()     { downloadQuoteBuilderPDF(); }
    function shareInstallerQuoteWhatsApp()   { shareQuoteBuilderWhatsApp(); }

    function instShareWhatsApp() {
      if (!instCalculationResult) return;
      const r = instCalculationResult;
      const N = egFormatNumber;
      const inv = Math.ceil((r.requiredInverter || 0) / 1000);
      const msg = egJoinLines([
        '☀️ *ENERGY GUIDE SOLAR SUMMARY*',
        `• Inverter: ${inv}kW`,
        `• System Voltage: ${r.systemVoltage || '—'}V`,
        `• Running Load: ${N(r.totalRunning)}W`,
        `• Daily Energy: ${N(r.dailyEnergy)}Wh`,
        `• Peak Surge: ${N(r.maxSurge)}W`,
        `• Solar Panels: ${r.totalPanels}× ${((r.panel && r.panel.model) || 'Panel')}`,
        `• Battery Bank: ${r.batteryCount || 0}× 5kWh ${r.batteryType || 'Lithium'}`,
        r.actualPvPower ? `• Total PV Power: ${N(r.actualPvPower)}W` : '',
        `• Estimated Total Cost: NGN ${N(r.totalCost)}`,
        '',
        '_Generated by Energy Guide_',
      ]);
      egOpenWhatsApp(msg);
    }
    
    async function instCopyToClipboard() {
      if (!instCalculationResult) return;
      const text = `SOLAR SYSTEM DESIGN\n\nInverter: ${Math.ceil(instCalculationResult.requiredInverter / 1000)}kW\nPanels: ${instCalculationResult.totalPanels}×\nBatteries: ${instCalculationResult.batteryCount}×\nCost: NGN ${instCalculationResult.totalCost.toLocaleString()}`;
      try {
        if (navigator.clipboard) await navigator.clipboard.writeText(text);
        else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        showToast('Copied!', 'success');
      } catch (e) {
        showToast('Copy failed', 'error');
      }
    }
    
    async function renderSavedCalculations() {
      const container = document.getElementById('savedCalcsList');
      if (!container) return;
      container.innerHTML = '<p style="color: #687076; text-align: center; padding: 40px;">Loading...</p>';
      try {
        const calcs = await getSavedCalculationsSafe();
        if (calcs.length === 0) {
          container.innerHTML = '<p style="color: #687076; text-align: center; padding: 40px;">No saved calculations</p>';
          return;
        }
        container.innerHTML = calcs.map(calc => `
          <div class="saved-calc-item">
            <div class="saved-calc-title">${Math.ceil((calc.requiredInverter || 0) / 1000)}kW System</div>
            <div class="saved-calc-date">${new Date(calc.timestamp).toLocaleString()}</div>
            <div class="saved-calc-actions">
              <button class="btn btn-secondary small-btn" onclick="loadCalculation('${calc._cloudId}')">Load</button>
              <button class="btn btn-danger small-btn" onclick="deleteCalc('${calc._cloudId}')">Delete</button>
            </div>
          </div>
        `).join('');
      } catch (err) {
        container.innerHTML = '<p style="color:#ef4444; text-align:center; padding:40px;">Failed to load calculations</p>';
      }
    }
    
    async function loadCalculation(cloudId) {
      showLoading(true, 'Loading...');
      try {
        const calcs = await getSavedCalculationsSafe();
        const calc = calcs.find(c => c._cloudId === cloudId);
        if (!calc) { showLoading(false); showToast('Calculation not found', 'error'); return; }

        instCalculationResult = calc;
        const inv2 = Math.ceil((calc.requiredInverter || 0) / 1000);
        const N2 = v => Number(v || 0).toLocaleString();
        const setEl2 = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setEl2('instResRunning',  (calc.totalRunning  || 0).toFixed(0) + ' W');
        setEl2('instResEnergy',   (calc.dailyEnergy   || 0).toFixed(0) + ' Wh');
        setEl2('instResSurge',    (calc.maxSurge      || 0).toFixed(0) + ' W');
        setEl2('instResInverter', inv2 + ' kW');
        setEl2('instTotalCost',   '₦' + N2(calc.totalCost));
        const compEl2 = document.getElementById('instComponents');
        if (compEl2) compEl2.innerHTML =
          `<strong>PV Array:</strong> ${calc.totalPanels || '-'} panels = ${N2(calc.actualPvPower)}W<br>` +
          `<strong>Batteries:</strong> ${calc.batteryCount || '-'}× 5kWh Lithium (${calc.systemVoltage || '-'}V)<br>` +
          `<strong>Controller:</strong> MPPT<br>` +
          `<strong>Inverter:</strong> ${inv2}kW`;
        currentRole = 'installer';
        showLoading(false);
        showScreen('installer-results');
        showToast('Calculation loaded!', 'success');
      } catch (err) {
        showLoading(false);
        showToast('Failed to load calculation', 'error');
      }
    }

    async function deleteCalc(cloudId) {
      if (!confirm('Delete this calculation?')) return;
      showLoading(true, 'Deleting...');
      try {
        await deleteCalculationFromCloud(cloudId);
        showLoading(false);
        showToast('Deleted', 'info');
        renderSavedCalculations();
        updateInstallerDashboard();
      } catch (err) {
        showLoading(false);
        showToast('Delete failed: ' + (err.message || 'unknown error'), 'error');
      }
    }

    
    
    // ================================================================
    // OPTIONAL USER ACCOUNT LAYER (guest-first)
    // ================================================================

    let userAuthMode = 'signup';
    let pendingUserAuthAction = null;

    function isSignedInEndUser() {
      return !!(currentUser && currentUser.id);
    }

    async function ensureSignedInEndUser(forceRefresh = false) {
      try {
        const authUser = (typeof getAuthUser === 'function')
          ? await getAuthUser().catch(() => null)
          : null;

        if (!(authUser && authUser.id)) return null;

        if (!forceRefresh && currentUser && String(currentUser.id) === String(authUser.id)) {
          return { authUser, profile: currentUser };
        }

        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profile) {
          egSyncUser({ ...authUser, ...profile });
        } else {
          egSyncUser({
            ...authUser,
            id: authUser.id,
            role: authUser.user_metadata?.role || 'user',
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || ''
          });
        }

        if (!currentRole || currentRole === 'user') currentRole = 'user';
        updateUserAccountUI();
        return { authUser, profile: profile || currentUser };
      } catch (e) {
        console.warn('ensureSignedInEndUser error:', e);
        return null;
      }
    }

    function updateUserAccountUI() {
      const bar = document.getElementById('userAccountBar');
      if (!bar) return;
      bar.style.display = 'block';

      const titleEl = document.getElementById('userAccountBarTitle');
      const textEl = document.getElementById('userAccountBarText');
      const signInBtn = document.getElementById('userSignInBtn');
      const createBtn = document.getElementById('userCreateAccountBtn');
      const savedBtn = document.getElementById('userSavedSystemsBtn');
      const signOutBtn = document.getElementById('userSignOutBtn');

      if (isSignedInEndUser()) {
        const name = currentUser.full_name || currentUser.company_name || currentUser.business_name || currentUser.email || 'Your account';
        bar.style.background = '#ecfdf3';
        bar.style.borderColor = '#bbf7d0';
        if (titleEl) titleEl.textContent = 'Signed in';
        if (textEl) textEl.textContent = `${name} • Save systems, track requests, and continue on another device.`;
        if (signInBtn) signInBtn.style.display = 'none';
        if (createBtn) createBtn.style.display = 'none';
        if (savedBtn) savedBtn.style.display = 'inline-flex';
        if (signOutBtn) signOutBtn.style.display = 'inline-flex';
      } else {
        bar.style.background = '#ffffff';
        bar.style.borderColor = '#dbe4ee';
        if (titleEl) titleEl.textContent = 'Guest mode';
        if (textEl) textEl.textContent = 'Create a free account to save your system and continue later.';
        if (signInBtn) signInBtn.style.display = 'inline-flex';
        if (createBtn) createBtn.style.display = 'inline-flex';
        if (savedBtn) savedBtn.style.display = 'none';
        if (signOutBtn) signOutBtn.style.display = 'none';
      }
      updateLeadSuccessAccountUI();
    }

    function switchUserAuthMode(mode) {
      userAuthMode = mode === 'signin' ? 'signin' : 'signup';
      const signupTab = document.getElementById('userAuthTabSignup');
      const signinTab = document.getElementById('userAuthTabSignin');
      const submitBtn = document.getElementById('userAuthSubmitBtn');
      const fullNameGroup = document.getElementById('userAuthFullNameGroup') || document.getElementById('userAuthFullName')?.closest('.form-group');

      if (signupTab && signinTab) {
        signupTab.className = userAuthMode === 'signup' ? 'btn btn-primary small-btn' : 'btn btn-outline small-btn';
        signinTab.className = userAuthMode === 'signin' ? 'btn btn-primary small-btn' : 'btn btn-outline small-btn';
      }
      if (submitBtn) submitBtn.textContent = userAuthMode === 'signup' ? 'Create Free Account' : 'Sign In';
      if (fullNameGroup) fullNameGroup.style.display = userAuthMode === 'signup' ? 'block' : 'none';
    }


    function updateLeadSuccessAccountUI() {
      const card = document.getElementById('leadSuccessAccountPrompt');
      const title = document.getElementById('leadSuccessAccountTitle');
      const text = document.getElementById('leadSuccessAccountText');
      const primaryBtn = document.getElementById('leadSuccessPrimaryBtn');
      const secondaryBtn = document.getElementById('leadSuccessSecondaryBtn');
      const homeBtn = document.getElementById('leadSuccessHomeBtn');

      if (!(card && title && text && primaryBtn && secondaryBtn && homeBtn)) return;

      if (isSignedInEndUser()) {
        card.style.display = 'block';
        title.textContent = 'Track saved activity';
        text.textContent = 'Your account is already connected. We will keep this request attached so you can follow it later.';
        primaryBtn.textContent = 'View My Saved Systems';
        primaryBtn.onclick = () => openUserSavedSystems();
        secondaryBtn.textContent = 'Back to Calculator';
        secondaryBtn.onclick = () => showScreen('user-calculator');
        homeBtn.textContent = '🏠 Back to Home';
      } else {
        card.style.display = 'block';
        title.textContent = 'Track your request';
        text.textContent = 'Create a free account to track this request later and continue on another device.';
        primaryBtn.textContent = 'Create Free Account';
        primaryBtn.onclick = () => openUserAuthModal('signup', 'track_lead');
        secondaryBtn.textContent = 'Sign In';
        secondaryBtn.onclick = () => openUserAuthModal('signin', 'track_lead');
        homeBtn.textContent = '🏠 Back to Home';
      }
    }

    function openUserAuthModal(mode = 'signup', context = 'save_system') {
      pendingUserAuthAction = context;
      const modal = document.getElementById('userAuthModal');
      const title = document.getElementById('userAuthModalTitle');
      const text = document.getElementById('userAuthModalText');
      if (!modal) return;

      if (context === 'track_lead') {
        if (title) title.textContent = 'Track your request';
        if (text) text.textContent = 'Create a free account to follow this request later and continue on another device.';
      } else if (context === 'save_unlock') {
        if (title) title.textContent = 'Save your purchase';
        if (text) text.textContent = 'Create a free account so your unlocked result stays attached to you.';
      } else {
        if (title) title.textContent = 'Save this system';
        if (text) text.textContent = 'Create a free account to keep this result and access it later.';
      }

      switchUserAuthMode(mode);
      modal.style.display = 'flex';
    }

    function closeUserAuthModal() {
      const modal = document.getElementById('userAuthModal');
      if (modal) modal.style.display = 'none';
    }

    async function restoreEnergyGuideUserSession(sessionArg = null) {
      try {
        const session = sessionArg || await supabaseGetSession();
        if (!(session && session.user)) {
          updateUserAccountUI();
          return;
        }

        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          egSyncUser({ ...session.user, ...profile });
          if (!currentRole || currentRole === 'user') currentRole = 'user';
          updateUserAccountUI();
        } else {
          egSyncUser({
            ...session.user,
            id: session.user.id,
            role: session.user.user_metadata?.role || 'user',
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
          });
          if (!currentRole || currentRole === 'user') currentRole = 'user';
          updateUserAccountUI();
        }
      } catch (e) {
        console.warn('restoreEnergyGuideUserSession error:', e);
        updateUserAccountUI();
      }
    }
    window.restoreEnergyGuideUserSession = restoreEnergyGuideUserSession;

    function onEnergyGuideSignedOut() {
      currentUser = null;
      if (currentRole === 'user') currentRole = null;
      updateUserAccountUI();
    }
    window.onEnergyGuideSignedOut = onEnergyGuideSignedOut;

    async function handleUserAuthSubmit() {
      const email = (document.getElementById('userAuthEmail')?.value || '').trim();
      const password = (document.getElementById('userAuthPassword')?.value || '').trim();
      const fullName = (document.getElementById('userAuthFullName')?.value || '').trim();

      if (!email || !password) {
        showToast('Email and password are required.', 'error');
        return;
      }
      if (userAuthMode === 'signup' && !fullName) {
        showToast('Please enter your full name.', 'error');
        return;
      }

      showLoading(true, userAuthMode === 'signup' ? 'Creating account...' : 'Signing in...');
      let result;
      if (userAuthMode === 'signup') {
        result = await supabaseSignUp(email, password, { role: 'user', full_name: fullName, phone: '', state: null, city: null });
      } else {
        result = await supabaseSignIn(email, password);
      }
      showLoading(false);

      if (!result.success) {
        showToast(result.error || 'Authentication failed', 'error');
        return;
      }

      if (userAuthMode === 'signup' && result.emailConfirmationRequired) {
        closeUserAuthModal();
        showToast('Account created. Check your email to confirm your account, then sign in.', 'success');
        return;
      }

      const authUser = result.user || await getAuthUser();
      let profile = result.profile || null;

      if (!profile && authUser) {
        const { data } = await supabaseClient.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
        profile = data || null;
      }

      currentUser = { ...(authUser || {}), ...(profile || {}), role: profile?.role || authUser?.user_metadata?.role || 'user', full_name: profile?.full_name || fullName || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || '' };
      currentRole = 'user';
      closeUserAuthModal();
      await ensureSignedInEndUser(true);
      updateUserAccountUI();
      onLoginSuccess().catch(e => console.warn('onLoginSuccess:', e));
      showToast(userAuthMode === 'signup' ? 'Account created successfully!' : 'Signed in successfully!', 'success');

      if (pendingUserAuthAction === 'save_system') {
        await saveCurrentSystemForUser(true);
      } else if (pendingUserAuthAction === 'track_lead') {
        await openUserSavedSystems();
      }
      pendingUserAuthAction = null;
    }

    async function handleUserSignOut() {
      showLoading(true, 'Signing out...');
      const result = await supabaseSignOut();
      showLoading(false);
      if (!result.success) {
        showToast(result.error || 'Sign out failed', 'error');
        return;
      }
      currentUser = null;
      currentOpenedSavedSystemId = null;
      updateUserAccountUI();
      updateSavedSystemActionUI();
      showToast('Signed out', 'info');
      showScreen('user-calculator');
    }

    async function saveCurrentSystemForUser(skipPrompt = false) {
      if (!userCalculationResult) {
        showToast('Calculate a system first.', 'error');
        return;
      }
      const userSession = await ensureSignedInEndUser();
      if (!userSession) {
        if (!skipPrompt) openUserAuthModal('signup', 'save_system');
        return;
      }

      showLoading(true, 'Saving system...');
      try {
        const title = `${userCalculationResult.invKva || '-'}kVA • ${userCalculationResult.numPanels || 0} panels • ${new Date().toLocaleDateString()}`;
        await saveCalculationToCloud({ ...userCalculationResult, role: 'user', title, timestamp: new Date().toISOString() });
        currentOpenedSavedSystemId = null;
        showLoading(false);
        updateUserAccountUI();
        updateSavedSystemActionUI();
        showToast('System saved to your account.', 'success');
      } catch (e) {
        showLoading(false);
        console.error('saveCurrentSystemForUser error:', e);
        showToast('Could not save this system right now.', 'error');
      }
    }


    function downloadSystemPDF() {
      if (!userCalculationResult) { showToast('No system to export', 'error'); return; }
      if (!window.jspdf || !window.jspdf.jsPDF) { showToast('PDF engine not loaded', 'error'); return; }

      showLoading(true, 'Generating PDF...');
      setTimeout(() => {
        try {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          const r = userCalculationResult;
          const M = v => '\u20a6' + Number(v || 0).toLocaleString('en-NG');
          const N = v => Number(v || 0).toLocaleString('en-NG');

          // ── Header ──────────────────────────────────────────────
          doc.setFontSize(22); doc.setTextColor(10, 126, 164);
          doc.text('Energy Guide', 105, 18, { align: 'center' });
          doc.setFontSize(14); doc.setTextColor(0);
          doc.text('Solar System Recommendation', 105, 27, { align: 'center' });
          doc.setFontSize(9); doc.setTextColor(120);
          doc.text(new Date().toLocaleDateString('en-NG', { dateStyle: 'long' }), 105, 34, { align: 'center' });
          doc.setLineWidth(0.5); doc.setDrawColor(10, 126, 164);
          doc.line(14, 38, 196, 38);

          // ── System Summary ───────────────────────────────────────
          let y = 46;
          doc.setFontSize(13); doc.setTextColor(10, 126, 164);
          doc.text('Recommended System', 14, y); y += 7;
          doc.setFontSize(10); doc.setTextColor(0);
          doc.text(`Inverter:       ${r.invKva || '-'}kVA Hybrid MPPT`, 18, y); y += 6;
          doc.text(`Solar Panels:   ${r.numPanels || 0} x 550W Mono PERC  (${N((r.numPanels||0)*550)}W array)`, 18, y); y += 6;
          doc.text(`Battery:        ${r.lithiumPackKwh ? r.lithiumPackKwh.toFixed(1).replace(/\.0$/,'') : 0}kWh Lithium Pack`, 18, y); y += 6;
          doc.text(`Running Load:   ${N(r.totalWatts)}W`, 18, y); y += 6;
          doc.text(`Peak Surge:     ${N(r.maxSurge)}W`, 18, y); y += 6;
          doc.text(`Daily Energy:   ${Number(r.dailyKwh || 0).toFixed(2)} kWh/day`, 18, y); y += 10;

          // ── Cost Breakdown ───────────────────────────────────────
          doc.setLineWidth(0.3); doc.setDrawColor(200);
          doc.line(14, y, 196, y); y += 6;
          doc.setFontSize(13); doc.setTextColor(10, 126, 164);
          doc.text('Estimated Cost Breakdown', 14, y); y += 7;
          doc.setFontSize(10); doc.setTextColor(0);

          const breakdownRows = [
            ['Solar Panels', `${N(r.panelUnitPrice)} x ${r.numPanels || 0} panels`, M(r.panelCost)],
            ['Hybrid Inverter', `1 x ${r.invKva || '-'}kVA`, M(r.inverterCost)],
            ['Lithium Battery', `1 x ${r.lithiumPackKwh ? r.lithiumPackKwh.toFixed(1).replace(/\.0$/,'') : 0}kWh`, M(r.batteryCost)],
          ];
          breakdownRows.forEach(([item, detail, cost]) => {
            doc.setFont(undefined, 'normal');
            doc.text(item, 18, y);
            doc.text(detail, 80, y);
            doc.text(cost, 196, y, { align: 'right' });
            y += 6;
          });
          // Tubular alt
          if (r.tubularAltCost >= 0) {
            doc.setTextColor(120);
            doc.text('Alt. Tubular Battery', 18, y);
            doc.text(`${N(r.tubularUnitPrice)} x ${r.leadTotalBatteries || 0} units`, 80, y);
            doc.text(M(r.tubularAltCost), 196, y, { align: 'right' });
            doc.setTextColor(0);
            y += 6;
          }
          y += 2;
          doc.setLineWidth(0.5); doc.setDrawColor(10, 126, 164);
          doc.line(14, y, 196, y); y += 6;
          doc.setFontSize(13); doc.setTextColor(10, 126, 164);
          doc.text('Final Estimated Cost', 14, y);
          doc.text(M(r.totalCost), 196, y, { align: 'right' });
          doc.setTextColor(0); y += 10;

          // ── Breakers & Cable Reference ───────────────────────────
          doc.setLineWidth(0.3); doc.setDrawColor(200);
          doc.line(14, y, 196, y); y += 6;
          doc.setFontSize(11); doc.setTextColor(80);
          doc.text('Breakers & Cable Reference (not included in total)', 14, y); y += 7;
          doc.setFontSize(9); doc.setTextColor(0);
          const refRows = [
            ['PV Breaker',      `${r.pvBreaker || '-'}A DC`,   M(r.pvBreakerPrice)],
            ['Battery Breaker', `${r.battBreaker || '-'}A DC`,  M(r.batteryBreakerPrice)],
            ['AC Breaker',      `${r.acBreaker || '-'}A AC`,   M(r.acBreakerPrice)],
            ['PV Cable',        `${r.pvCable || '-'}mm²`,      M(r.pvCablePerMeter) + '/m'],
            ['Battery Cable',   `${r.battCable || '-'}mm²`,    M(r.batteryCablePerMeter) + '/m'],
            ['AC Cable',        `${r.acCable || '-'}mm²`,      M(r.acCablePerMeter) + '/m'],
          ];
          refRows.forEach(([item, detail, price]) => {
            doc.text(item, 18, y);
            doc.text(detail, 80, y);
            doc.text(price, 196, y, { align: 'right' });
            y += 5;
          });
          y += 4;

          // ── Footer ───────────────────────────────────────────────
          doc.setFontSize(8); doc.setTextColor(150);
          doc.text('Prices are market estimates. Verify with your installer before purchase.', 14, y); y += 4;
          doc.text('Generated by Energy Guide Platform  •  energyguide.app', 105, 285, { align: 'center' });

          doc.save(`energy-guide-${Date.now()}.pdf`);
          showLoading(false);
          showToast('PDF downloaded!', 'success');
        } catch (e) {
          showLoading(false);
          console.error('downloadSystemPDF error:', e);
          showToast('Could not generate PDF: ' + e.message, 'error');
        }
      }, 300);
    }

    function shareSystemWhatsApp() {
      if (!userCalculationResult) { showToast('No system to share', 'error'); return; }
      const r = userCalculationResult;
      const M = v => '\u20a6' + Number(v || 0).toLocaleString('en-NG');
      const N = v => Number(v || 0).toLocaleString('en-NG');
      const kWh = r.lithiumPackKwh ? r.lithiumPackKwh.toFixed(1).replace(/\.0$/, '') : 0;

      const msg = [
        '\u2600\ufe0f *ENERGY GUIDE SOLAR RECOMMENDATION*',
        '',
        '*System Summary*',
        `• Inverter: ${r.invKva || '-'}kVA Hybrid MPPT`,
        `• Solar Panels: ${r.numPanels || 0} \u00d7 550W Mono PERC (${N((r.numPanels||0)*550)}W)`,
        `• Battery: ${kWh}kWh Lithium Pack`,
        `• Daily Energy: ${Number(r.dailyKwh || 0).toFixed(2)} kWh/day`,
        `• Running Load: ${N(r.totalWatts)}W  |  Peak Surge: ${N(r.maxSurge)}W`,
        '',
        '*Cost Breakdown*',
        `• Panels:   ${M(r.panelCost)}`,
        `• Inverter: ${M(r.inverterCost)}`,
        `• Battery:  ${M(r.batteryCost)}`,
        `• Alt. Tubular Battery (option): ${M(r.tubularAltCost)}`,
        '',
        `*Final Estimated Cost: ${M(r.totalCost)}*`,
        '',
        '*Breakers & Cable Reference*',
        `• PV Breaker: ${r.pvBreaker || '-'}A DC — ${M(r.pvBreakerPrice)}`,
        `• Battery Breaker: ${r.battBreaker || '-'}A DC — ${M(r.batteryBreakerPrice)}`,
        `• AC Breaker: ${r.acBreaker || '-'}A AC — ${M(r.acBreakerPrice)}`,
        `• PV Cable: ${r.pvCable || '-'}mm\u00b2 @ ${M(r.pvCablePerMeter)}/m`,
        `• Battery Cable: ${r.battCable || '-'}mm\u00b2 @ ${M(r.batteryCablePerMeter)}/m`,
        `• AC Cable: ${r.acCable || '-'}mm\u00b2 @ ${M(r.acCablePerMeter)}/m`,
        '',
        '_Prices are market estimates. Verify with installer._',
        '_Generated by Energy Guide_',
      ].join('\n');

      egOpenWhatsApp(msg);
    }


    function updateSavedSystemActionUI() {
      const hasSaved = !!currentOpenedSavedSystemId;
      const banner = document.getElementById('savedSystemLoadedBanner');
      if (banner) banner.style.display = hasSaved ? 'block' : 'none';
    }

    async function deleteCurrentlyOpenedSavedSystem() {
      if (!currentOpenedSavedSystemId) {
        showToast('No saved system loaded.', 'warning');
        return;
      }
      if (!confirm('Delete this saved system?')) return;
      showLoading(true, 'Deleting...');
      try {
        await deleteCalculationFromCloud(currentOpenedSavedSystemId);
        currentOpenedSavedSystemId = null;
        updateSavedSystemActionUI();
        showLoading(false);
        showToast('Saved system deleted.', 'info');
      } catch (e) {
        showLoading(false);
        console.error('deleteCurrentlyOpenedSavedSystem error:', e);
        showToast('Could not delete saved system.', 'error');
      }
    }


    function buildSavedSystemShareMessage(calc) {
      const payload = (calc && calc.payload && typeof calc.payload === 'object') ? calc.payload : {};
      const d = { ...(calc || {}), ...payload };
      const M = v => '\u20a6' + Number(v || 0).toLocaleString('en-NG');
      const N = v => Number(v || 0).toLocaleString('en-NG');
      const kWh = d.lithiumPackKwh ? Number(d.lithiumPackKwh).toFixed(1).replace(/\.0$/, '') : (d.battery_kwh || 0);
      const panels = d.numPanels || d.panel_count || 0;
      const inv = d.invKva || d.inverter_kva || '-';

      const lines = [
        '\u2600\ufe0f *ENERGY GUIDE SOLAR RECOMMENDATION*',
        '',
        '*System Summary*',
        `\u2022 Inverter: ${inv}kVA Hybrid MPPT`,
        `\u2022 Solar Panels: ${panels} \u00d7 550W Mono PERC (${N(panels * 550)}W)`,
        `\u2022 Battery: ${kWh}kWh Lithium Pack`,
        `\u2022 Daily Energy: ${Number(d.dailyKwh || d.daily_kwh || 0).toFixed(2)} kWh/day`,
        `\u2022 Running Load: ${N(d.totalWatts || d.running_watts)}W  |  Peak Surge: ${N(d.maxSurge || d.peak_surge)}W`,
      ];

      // Cost breakdown — only if saved with full cost data
      if (d.panelCost || d.inverterCost || d.batteryCost) {
        lines.push('', '*Cost Breakdown*',
          `\u2022 Panels:   ${M(d.panelCost)}`,
          `\u2022 Inverter: ${M(d.inverterCost)}`,
          `\u2022 Battery:  ${M(d.batteryCost)}`,
        );
        if (d.tubularAltCost >= 0) lines.push(`\u2022 Alt. Tubular Battery: ${M(d.tubularAltCost)}`);
      }

      const totalCost = d.totalCost || d.total_cost || 0;
      lines.push('', `*Final Estimated Cost: ${M(totalCost)}*`);

      // Breakers & cables — only if saved with full data
      if (d.pvBreaker || d.pvCable) {
        lines.push('', '*Breakers & Cable Reference*',
          `\u2022 PV Breaker: ${d.pvBreaker || '-'}A DC \u2014 ${M(d.pvBreakerPrice)}`,
          `\u2022 Battery Breaker: ${d.battBreaker || '-'}A DC \u2014 ${M(d.batteryBreakerPrice)}`,
          `\u2022 AC Breaker: ${d.acBreaker || '-'}A AC \u2014 ${M(d.acBreakerPrice)}`,
          `\u2022 PV Cable: ${d.pvCable || '-'}mm\u00b2 @ ${M(d.pvCablePerMeter)}/m`,
          `\u2022 Battery Cable: ${d.battCable || '-'}mm\u00b2 @ ${M(d.batteryCablePerMeter)}/m`,
          `\u2022 AC Cable: ${d.acCable || '-'}mm\u00b2 @ ${M(d.acCablePerMeter)}/m`,
        );
      }

      lines.push('', '_Prices are market estimates. Verify with installer._', '_Generated by Energy Guide_');
      return lines.join('\n');
    }

    function downloadSavedSystemPDF(cloudId) {
      getSavedCalculationsSafe().then(calcs => {
        const calc = (calcs || []).find(c => c._cloudId === cloudId);
        if (!calc) { showToast('Saved system not found', 'error'); return; }
        if (!window.jspdf || !window.jspdf.jsPDF) { showToast('PDF engine not loaded', 'error'); return; }

        showLoading(true, 'Generating PDF...');
        setTimeout(() => {
          try {
            const payload = (calc.payload && typeof calc.payload === 'object') ? calc.payload : {};
            const d = { ...(calc || {}), ...payload };
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const M = v => '\u20a6' + Number(v || 0).toLocaleString('en-NG');
            const N = v => Number(v || 0).toLocaleString('en-NG');
            const kWh = d.lithiumPackKwh ? Number(d.lithiumPackKwh).toFixed(1).replace(/\.0$/, '') : (d.battery_kwh || 0);
            const panels = d.numPanels || d.panel_count || 0;
            const inv = d.invKva || d.inverter_kva || '-';

            // ── Header ─────────────────────────────────────────────
            doc.setFontSize(22); doc.setTextColor(10, 126, 164);
            doc.text('Energy Guide', 105, 18, { align: 'center' });
            doc.setFontSize(14); doc.setTextColor(0);
            doc.text('Solar System Recommendation', 105, 27, { align: 'center' });
            doc.setFontSize(9); doc.setTextColor(120);
            const savedDate = calc.timestamp ? new Date(calc.timestamp).toLocaleDateString('en-NG', { dateStyle: 'long' }) : '';
            doc.text('Saved: ' + savedDate, 105, 34, { align: 'center' });
            doc.setLineWidth(0.5); doc.setDrawColor(10, 126, 164);
            doc.line(14, 38, 196, 38);

            // ── System Summary ──────────────────────────────────────
            let y = 46;
            doc.setFontSize(13); doc.setTextColor(10, 126, 164);
            doc.text('Recommended System', 14, y); y += 7;
            doc.setFontSize(10); doc.setTextColor(0);
            doc.text(`Inverter:       ${inv}kVA Hybrid MPPT`, 18, y); y += 6;
            doc.text(`Solar Panels:   ${panels} x 550W Mono PERC  (${N(panels * 550)}W array)`, 18, y); y += 6;
            doc.text(`Battery:        ${kWh}kWh Lithium Pack`, 18, y); y += 6;
            doc.text(`Running Load:   ${N(d.totalWatts || d.running_watts)}W`, 18, y); y += 6;
            doc.text(`Peak Surge:     ${N(d.maxSurge || d.peak_surge)}W`, 18, y); y += 6;
            doc.text(`Daily Energy:   ${Number(d.dailyKwh || d.daily_kwh || 0).toFixed(2)} kWh/day`, 18, y); y += 10;

            // ── Cost Breakdown ──────────────────────────────────────
            doc.setLineWidth(0.3); doc.setDrawColor(200);
            doc.line(14, y, 196, y); y += 6;
            doc.setFontSize(13); doc.setTextColor(10, 126, 164);
            doc.text('Estimated Cost Breakdown', 14, y); y += 7;
            doc.setFontSize(10); doc.setTextColor(0);

            if (d.panelCost || d.inverterCost || d.batteryCost) {
              [
                ['Solar Panels',    `${N(d.panelUnitPrice)} x ${panels} panels`, M(d.panelCost)],
                ['Hybrid Inverter', `1 x ${inv}kVA`,                             M(d.inverterCost)],
                ['Lithium Battery', `1 x ${kWh}kWh`,                             M(d.batteryCost)],
              ].forEach(([item, detail, cost]) => {
                doc.text(item, 18, y); doc.text(detail, 80, y); doc.text(cost, 196, y, { align: 'right' }); y += 6;
              });
              if (d.tubularAltCost >= 0) {
                doc.setTextColor(120);
                doc.text('Alt. Tubular Battery', 18, y);
                doc.text(`${N(d.tubularUnitPrice)} x ${d.leadTotalBatteries || 0} units`, 80, y);
                doc.text(M(d.tubularAltCost), 196, y, { align: 'right' });
                doc.setTextColor(0); y += 6;
              }
              y += 2;
            } else {
              doc.text('(Detailed cost breakdown not available for this saved system)', 18, y); y += 8;
            }

            doc.setLineWidth(0.5); doc.setDrawColor(10, 126, 164);
            doc.line(14, y, 196, y); y += 6;
            doc.setFontSize(13); doc.setTextColor(10, 126, 164);
            doc.text('Final Estimated Cost', 14, y);
            doc.text(M(d.totalCost || d.total_cost), 196, y, { align: 'right' });
            doc.setTextColor(0); y += 10;

            // ── Breakers & Cables ───────────────────────────────────
            if (d.pvBreaker || d.pvCable) {
              doc.setLineWidth(0.3); doc.setDrawColor(200);
              doc.line(14, y, 196, y); y += 6;
              doc.setFontSize(11); doc.setTextColor(80);
              doc.text('Breakers & Cable Reference (not included in total)', 14, y); y += 7;
              doc.setFontSize(9); doc.setTextColor(0);
              [
                ['PV Breaker',      `${d.pvBreaker || '-'}A DC`,   M(d.pvBreakerPrice)],
                ['Battery Breaker', `${d.battBreaker || '-'}A DC`,  M(d.batteryBreakerPrice)],
                ['AC Breaker',      `${d.acBreaker || '-'}A AC`,   M(d.acBreakerPrice)],
                ['PV Cable',        `${d.pvCable || '-'}mm²`,      M(d.pvCablePerMeter) + '/m'],
                ['Battery Cable',   `${d.battCable || '-'}mm²`,    M(d.batteryCablePerMeter) + '/m'],
                ['AC Cable',        `${d.acCable || '-'}mm²`,      M(d.acCablePerMeter) + '/m'],
              ].forEach(([item, detail, price]) => {
                doc.text(item, 18, y); doc.text(detail, 80, y); doc.text(price, 196, y, { align: 'right' }); y += 5;
              });
            }

            // ── Footer ──────────────────────────────────────────────
            doc.setFontSize(8); doc.setTextColor(150);
            doc.text('Prices are market estimates. Verify with your installer before purchase.', 14, y + 6);
            doc.text('Generated by Energy Guide Platform', 105, 285, { align: 'center' });

            doc.save(`energy-guide-${Date.now()}.pdf`);
            showLoading(false);
            showToast('PDF downloaded!', 'success');
          } catch(e) {
            showLoading(false);
            console.error('downloadSavedSystemPDF error:', e);
            showToast('Could not generate PDF: ' + e.message, 'error');
          }
        }, 300);
      }).catch(err => {
        showLoading(false);
        console.error('downloadSavedSystemPDF error:', err);
        showToast('Could not generate PDF', 'error');
      });
    }

    function shareSavedSystemWhatsApp(cloudId) {
      getSavedCalculationsSafe().then(calcs => {
        const calc = (calcs || []).find(c => c._cloudId === cloudId);
        if (!calc) throw new Error('Saved system not found');

        const message = buildSavedSystemShareMessage(calc);
        if (typeof egOpenWhatsApp === 'function') {
          egOpenWhatsApp(message);
        } else {
          const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
          window.open(url, '_blank', 'noopener');
        }
      }).catch(err => {
        console.error('shareSavedSystemWhatsApp error:', err);
        showToast('Could not share saved system', 'error');
      });
    }

    async function renderUserSavedSystems() {
      const container = document.getElementById('userSavedSystemsList');
      if (!container) return;

      const userSession = await ensureSignedInEndUser();
      if (!userSession) {
        container.innerHTML = '<div class="info">Create or sign in to a free account to save and view systems.</div>';
        return;
      }

      container.innerHTML = '<div class="info">Loading saved systems...</div>';
      try {
        const calcs = await getSavedCalculationsSafe();
        const userCalcs = (calcs || []).filter(calc => (calc.role || calc.payload?.role || 'installer') === 'user');
        if (!userCalcs.length) {
          container.innerHTML = '<div class="info">No saved systems yet. Run a calculation and save it to your account.</div>';
          return;
        }

        container.innerHTML = userCalcs.map(calc => `
          <div class="result-card" style="text-align:left; margin-bottom:12px;">
            <div class="result-value" style="font-size:18px;">${safeText(calc.title || `${calc.invKva || '-'}kVA System`)}</div>
            <div style="font-size:13px; color:#687076; margin-top:6px;">${calc.timestamp ? new Date(calc.timestamp).toLocaleString() : ''}</div>
            <div style="font-size:13px; color:#374151; margin-top:8px;">
              Inverter: <strong>${safeText(calc.invKva || '-')}kVA</strong> ·
              Panels: <strong>${safeText(calc.numPanels || 0)}</strong> ·
              Battery: <strong>${safeText((calc.lithiumPackKwh || calc.battery_kwh || '-'))}kWh</strong>
            </div>
            <div style="display:grid; gap:8px; grid-template-columns:1fr 1fr; margin-top:12px;">
              <button class="btn btn-primary small-btn" onclick="loadUserSavedCalculation('${calc._cloudId}')">Open</button>
              <button class="btn btn-secondary small-btn" onclick="downloadSavedSystemPDF('${calc._cloudId}')">PDF</button>
              <button class="btn btn-success small-btn" onclick="shareSavedSystemWhatsApp('${calc._cloudId}')">WhatsApp</button>
              <button class="btn btn-danger small-btn" onclick="deleteUserSavedCalculation('${calc._cloudId}')">Delete</button>
            </div>
          </div>
        `).join('');
      } catch (e) {
        console.error('renderUserSavedSystems error:', e);
        container.innerHTML = '<div class="info" style="color:#b91c1c;">Could not load your saved systems right now.</div>';
      }
    }

    async function openUserSavedSystems() {
      const userSession = await ensureSignedInEndUser();
      if (!userSession) {
        openUserAuthModal('signup', 'save_system');
        return;
      }
      showScreen('user-saved-systems');
      renderUserSavedSystems();
    }

    function loadUserSavedCalculation(cloudId) {
      showLoading(true, 'Loading saved system...');
      getSavedCalculationsSafe().then(calcs => {
        const calc = (calcs || []).find(c => c._cloudId === cloudId);
        if (!calc) throw new Error('Saved system not found');

        const payload = (calc.payload && typeof calc.payload === 'object') ? calc.payload : {};
        const restored = {
          ...calc,
          ...payload,
          _cloudId: calc._cloudId,
          title: calc.title || payload.title || '',
          timestamp: calc.timestamp || payload.timestamp || calc.created_at || ''
        };
        const restoredApps = restored.appliances || payload.appliances || [];

        isLoadingSavedSystem = true;
        if (typeof l4u_loadSavedAppliances === 'function') {
          l4u_loadSavedAppliances(restoredApps);
        }

        handleUserCalcResult(restored, restoredApps);
        userCalculationResult = { ...restored, appliances: restoredApps };
        currentOpenedSavedSystemId = cloudId;
        isLoadingSavedSystem = false;
        updateSavedSystemActionUI();
        showLoading(false);
        showScreen('user-calculator');
        requestAnimationFrame(() => {
          const actions = document.getElementById('userPostCalcActions');
          if (actions && typeof actions.scrollIntoView === 'function') {
            actions.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
        showToast('Saved system loaded into calculator.', 'success');
      }).catch(err => {
        isLoadingSavedSystem = false;
        showLoading(false);
        console.error('loadUserSavedCalculation error:', err);
        showToast('Could not open saved system.', 'error');
      });
    }

    async function deleteUserSavedCalculation(cloudId) {
      if (!confirm('Delete this saved system?')) return;
      showLoading(true, 'Deleting...');
      try {
        await deleteCalculationFromCloud(cloudId);
        if (currentOpenedSavedSystemId === cloudId) {
          currentOpenedSavedSystemId = null;
          updateSavedSystemActionUI();
        }
        showLoading(false);
        showToast('Saved system deleted.', 'info');
        renderUserSavedSystems();
      } catch (e) {
        showLoading(false);
        showToast('Could not delete saved system.', 'error');
      }
    }

    function promptTrackLeadAfterSubmit() {
      if (isSignedInEndUser()) {
        openUserSavedSystems();
      } else {
        openUserAuthModal('signup', 'track_lead');
      }
    }


// ================================================================
    // LEAD CLAIMING SYSTEM
    // ================================================================


    function formatBudgetRange(value) {
      const map = {
        under_1m: 'Under ₦1m',
        '1m_3m': '₦1m - ₦3m',
        '3m_5m': '₦3m - ₦5m',
        '5m_10m': '₦5m - ₦10m',
        above_10m: 'Above ₦10m'
      };
      return map[value] || value || '';
    }

    function formatLeadDate(value) {
      if (!value) return '';
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }

    function contactLeadPhone(phone) {
      if (!phone) {
        showToast('No phone number available for this lead', 'warning');
        return;
      }
      window.location.href = `tel:${phone}`;
    }

    function contactLeadEmail(email) {
      if (!email) {
        showToast('No email available for this lead', 'warning');
        return;
      }
      window.location.href = `mailto:${email}`;
    }

    async function getCurrentAuthUserId() {
      try {
        const { data, error } = await supabaseClient.auth.getUser();
        if (error || !data?.user) return null;
        return data.user.id;
      } catch (e) {
        return null;
      }
    }

    async function claimLead(leadId) {
      const userId = await getCurrentAuthUserId();
      if (!userId) { showToast('Not authenticated', 'error'); return; }

      const { data: existing, error: fetchErr } = await supabaseClient
        .from('leads')
        .select('id, claimed_by, claim_status')
        .eq('id', leadId)
        .maybeSingle();

      if (fetchErr || !existing) {
        showToast('Could not verify lead status. Please try again.', 'error');
        return;
      }

      const existingClaimedBy = String(existing.claimed_by || '');
      const me = String(userId || '');
      const alreadyClaimed = existingClaimedBy && existingClaimedBy !== me && existing.claim_status === 'claimed';

      if (alreadyClaimed) {
        showToast('This lead has already been claimed by another installer.', 'warning');
        await renderJobLeads();
        return;
      }

      if (existingClaimedBy === me && existing.claim_status === 'claimed') {
        showToast('You already claimed this lead.', 'info');
        await renderJobLeads();
        return;
      }

      const { error: updateErr } = await supabaseClient
        .from('leads')
        .update({
          claimed_by: userId,
          claimed_at: new Date().toISOString(),
          claim_status: 'claimed'
        })
        .eq('id', leadId);

      if (updateErr) {
        console.error('Claim error:', updateErr);
        showToast('Failed to claim lead: ' + updateErr.message, 'error');
        return;
      }

      const { data: verified } = await supabaseClient
        .from('leads')
        .select('id, claimed_by, claim_status')
        .eq('id', leadId)
        .maybeSingle();

      if (!verified || String(verified.claimed_by || '') !== me || verified.claim_status !== 'claimed') {
        showToast('Lead was updated, but refresh did not confirm the claim yet. Reloading...', 'warning');
      } else {
        showToast('Lead claimed! You can now contact the customer.', 'success');
      }

      await renderJobLeads();
      await updateInstallerDashboard();
    }

    async function renderJobLeads() {
      const container = document.getElementById('jobLeadsList');
      if (!container) return;

      if (!supabaseClient) {
        container.innerHTML = '<p style="color: #687076; text-align: center; padding: 40px;">Supabase not ready</p>';
        return;
      }

      if (!isInstallerProfileComplete(currentUser)) {
        container.innerHTML = `<div class="warning" style="text-align:center;padding:24px;">
          <div style="font-size:32px;margin-bottom:12px;">👤</div>
          <strong>Complete your profile to start receiving leads.</strong><br>
          <span style="font-size:13px;">Your name, business name, phone, state and city are required for location matching.</span><br>
          <button class="btn btn-success" onclick="showScreen('installer-profile')" style="margin-top:14px;max-width:240px;">Complete Profile →</button>
        </div>`;
        return;
      }

      container.innerHTML = '<p style="color: #687076; text-align: center; padding: 20px;">Loading job leads...</p>';

      const userId = await getCurrentAuthUserId();
      const me = String(userId || '');
      const installerState = await getCurrentUserPortalState('installer');

      let query = supabaseClient
        .from('leads')
        .select('*')
        .in('status', ['installer_requested', 'installer_contacted', 'closed']);

      if (installerState) query = query.eq('state', installerState);
      query = query.order('created_at', { ascending: false });

      const { data: allLeads, error } = await query;

      if (error) {
        console.error('Failed to load installer leads:', error);
        container.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 40px;">Failed to load job leads</p>';
        return;
      }

      const leads = (allLeads || []).filter(lead => {
        const claimedBy = String(lead.claimed_by || '');
        const isUnclaimed = !claimedBy || !lead.claim_status || lead.claim_status === 'open';
        const isMine = claimedBy === me;
        return isUnclaimed || isMine;
      });

      if (leads.length === 0) {
        container.innerHTML = `<p style="color: #687076; text-align: center; padding: 40px;">${installerState ? 'No available job leads in ' + installerState + ' yet.' : 'No job leads yet. Add your state to your account to enable location matching.'}</p>`;
        return;
      }

      // Load which leads this installer has already unlocked
      let installerUnlocked = new Set();
      if (me && supabaseClient) {
        const { data: unlocks } = await supabaseClient
          .from('lead_unlocks').select('lead_id').eq('profile_id', me);
        (unlocks || []).forEach(u => installerUnlocked.add(u.lead_id));
      }
      if (typeof egIsAdmin === 'function' && egIsAdmin()) {
        leads.forEach(l => installerUnlocked.add(l.id));
      }

      container.innerHTML = leads.map(lead => {
        const isUnlocked = installerUnlocked.has(lead.id);
        const isClosed = lead.status === 'closed' || lead.claim_status === 'closed';
        const phone = isUnlocked ? (lead.phone || '') : '';
        const email = isUnlocked ? (lead.email || '') : '';
        const location = [lead.city, lead.state].filter(Boolean).join(', ');
        const totalCost = Number(lead.total_cost || 0);
        const createdDate = formatLeadDate(lead.created_at);
        const leadEnc = encodeURIComponent(JSON.stringify(lead));

        let badgeClass = 'new';
        let badgeLabel = 'Open';
        if (isUnlocked && !isClosed) { badgeClass = 'contacted'; badgeLabel = 'Unlocked'; }
        if (lead.status === 'installer_contacted') { badgeClass = 'contacted'; badgeLabel = 'Contacted'; }
        if (isClosed) { badgeClass = 'closed'; badgeLabel = 'Closed'; }

        const snapshot = [
          lead.inverter_kva ? `<strong>${lead.inverter_kva}kVA</strong> inverter` : null,
          lead.panel_count  ? `<strong>${lead.panel_count}</strong> panel(s)` : null,
          lead.battery_kwh  ? `<strong>${lead.battery_kwh}kWh</strong> battery` : null,
          lead.daily_kwh    ? `<strong>${parseFloat(lead.daily_kwh).toFixed(1)}kWh</strong>/day` : null,
        ].filter(Boolean).join(' &nbsp;·&nbsp; ');

        const extras = [
          lead.budget_range       ? `Budget: <strong>${formatBudgetRange(lead.budget_range)}</strong>` : null,
          lead.battery_preference ? `Battery pref: <strong>${lead.battery_preference}</strong>` : null,
          lead.project_type       ? `Type: <strong>${lead.project_type}</strong>` : null,
        ].filter(Boolean).join(' &nbsp;·&nbsp; ');

        let buttons = '';
        if (isClosed) {
          buttons = `<span style="font-size:12px;color:#687076;">This lead is closed.</span>`;
        } else if (!isUnlocked) {
          buttons = `<button class="btn btn-success small-btn"
            onclick="egUnlockContact('${lead.id}','installer',function(){ renderJobLeads(); })">
            🔓 Unlock Contact — ₦2,000</button>`;
        } else {
          buttons = `
            <button class="btn btn-success small-btn" onclick="openQuoteBuilderFromLead('${leadEnc}')">📋 Build Quote</button>
            <button class="btn btn-outline small-btn" onclick="contactLeadPhone('${phone}')">📞 Call</button>
            <button class="btn btn-outline small-btn" onclick="contactLeadEmail('${email}')">✉️ Email</button>
            <button class="btn btn-secondary small-btn" onclick="updateLeadStatus('${lead.id}', 'installer_contacted')">✓ Mark Contacted</button>
            <button class="btn btn-danger small-btn" onclick="closeInstallerLead('${lead.id}')">✕ Mark Closed</button>`;
        }

        return `
        <div class="lead-card" style="${isMine ? 'border-color: #22C55E; border-width: 2px;' : ''}">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;gap:10px;align-items:center;">
            <strong>${lead.full_name || 'Customer'}</strong>
            <span class="lead-status ${badgeClass}">${badgeLabel}</span>
          </div>
          <div style="font-size:13px;color:#687076;margin-bottom:6px;">
            ${isUnlocked ? `${phone || 'No phone'}${email ? ' &nbsp;·&nbsp; ' + email : ''}` : '📵 Contact visible after unlock'}${location ? ' &nbsp;·&nbsp; ' + location : ''}
          </div>
          ${snapshot ? `<div style="font-size: 12px; color: #374151; margin-bottom: 6px;">${snapshot}</div>` : ''}
          ${extras ? `<div style="font-size: 12px; color: #687076; margin-bottom: 6px;">${extras}</div>` : ''}
          ${createdDate ? `<div style="font-size: 12px; color: #687076; margin-bottom: 6px;">Submitted: ${createdDate}</div>` : ''}
          ${lead.note ? `<div style="font-size: 12px; color: #687076; margin-bottom: 6px; font-style:italic;">"${lead.note}"</div>` : ''}
          ${totalCost ? `<div style="font-size: 12px; color: #687076; margin-bottom: 6px;">Est. budget: ₦${totalCost.toLocaleString()}</div>` : ''}
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;">
            ${buttons}
          </div>
        </div>`;
      }).join('');
    }

    function contactCustomer(phone) {
      contactLeadPhone(phone);
    }

    async function updateLeadStatus(id, status) {
      if (!supabaseClient) {
        showToast('Supabase not ready', 'error');
        return;
      }

      const { error } = await supabaseClient
        .from('leads')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Failed to update lead status:', error);
        showToast('Failed to update status', 'error');
        return;
      }

      if (status === 'vendor_responded') {
        await renderVendorRequests();
      } else {
        await renderJobLeads();
        await updateInstallerDashboard();
      }
      showToast('Status updated', 'success');
    }

    async function markVendorResponded(leadId) {
      if (!supabaseClient) { showToast('Supabase not ready', 'error'); return; }
      const { error } = await supabaseClient
        .from('leads')
        .update({ status: 'vendor_responded' })
        .eq('id', leadId);
      if (error) { showToast('Failed to update status', 'error'); return; }
      await renderVendorRequests();
      showToast('Marked as responded', 'success');
    }

    async function closeInstallerLead(leadId) {
      if (!supabaseClient) { showToast('Supabase not ready', 'error'); return; }
      const { error } = await supabaseClient
        .from('leads')
        .update({ status: 'closed', claim_status: 'closed' })
        .eq('id', leadId);
      if (error) {
        console.error('Failed to close lead:', error);
        showToast('Failed to close lead', 'error');
        return;
      }
      await renderJobLeads();
      await updateInstallerDashboard();
      showToast('Lead marked as closed', 'success');
    }
    
    // ================================
    // VENDOR PORTAL FUNCTIONS
    // ================================
    
    async function handleInstallerLogin() {
      const email    = document.getElementById('instLoginEmail').value.trim().toLowerCase();
      const password = document.getElementById('instLoginPassword').value;
      if (!email || !password) { showToast('Enter your email and password', 'error'); return; }

      showLoading(true, 'Signing in...');
      const result = await supabaseSignIn(email, password);
      showLoading(false);

      if (result.success && result.profile.role === 'installer') {
        currentUser = { ...result.user, ...result.profile };
        currentRole = 'installer';
        const displayName = result.profile.business_name || result.profile.company_name || result.profile.full_name || 'Installer';
        showToast('Welcome back, ' + displayName + '!', 'success');
        onLoginSuccess().catch(e => console.warn('onLoginSuccess:', e));
        await routeToPortalWithCheck('installer');
      } else if (result.success && result.profile.role !== 'installer') {
        showToast('This account is not an installer account. Please use the vendor portal.', 'error');
      } else {
        showToast(result.error || 'Invalid email or password', 'error');
      }
    }

        async function handleVendorLogin() {
      const email = document.getElementById('vendorLoginEmail').value.trim().toLowerCase();
      const password = document.getElementById('vendorLoginPassword').value;
      if (!email || !password) { showToast('Enter credentials', 'error'); return; }
      
      showLoading(true, 'Signing in...');
      
      const result = await supabaseSignIn(email, password);
      
      showLoading(false);
      
      if (result.success && result.profile.role === 'vendor') {
        currentUser = { ...result.user, ...result.profile };
        currentRole = 'vendor';
        const displayName = result.profile.business_name || result.profile.company_name || result.profile.full_name || 'Vendor';
        showToast('Welcome back, ' + displayName + '!', 'success');
        onLoginSuccess().catch(e => console.warn('onLoginSuccess:', e));
        await routeToPortalWithCheck('vendor');
      } else if (result.success && result.profile.role !== 'vendor') {
        showToast('Please use the installer portal', 'error');
      } else {
        showToast(result.error || 'Invalid email or password', 'error');
      }
    }
    
    async function updateInstallerDashboard() {
      // Saved calculations count — pull from cloud
      try {
        const calcs = await getSavedCalculationsSafe();
        const savedEl = document.getElementById('savedCalcsCount');
        if (savedEl) savedEl.textContent = calcs.length;
      } catch(e) {}

      // Job leads count (unclaimed + mine)
      const jobEl = document.getElementById('jobLeadsCount');
      if (!jobEl || !supabaseClient) return;
      try {
        const userId          = await getCurrentAuthUserId();
        const installerState  = await getCurrentUserPortalState('installer');
        let q = supabaseClient
          .from('leads')
          .select('id, claimed_by, claim_status')
          .in('status', ['installer_requested', 'installer_contacted', 'closed']);
        if (installerState) q = q.eq('state', installerState);
        const { data } = await q;
        const visible = (data || []).filter(lead => {
          const isUnclaimed = !lead.claimed_by || lead.claim_status === 'open';
          const isMine      = lead.claimed_by === userId;
          return isUnclaimed || isMine;
        });
        jobEl.textContent = visible.length;
      } catch(e) { console.warn('updateInstallerDashboard error', e); }
    }

    async function updateVendorDashboard() {
      // Product count — pull from cloud
      try {
        const products = await getVendorProductsSafe();
        const countEl = document.getElementById('vendorProductCount');
        if (countEl) countEl.textContent = products.length;
      } catch(e) {}

      const reqEl = document.getElementById('vendorRequestCount');
      if (reqEl && supabaseClient) {
        try {
          const vendorState = await getCurrentUserPortalState('vendor');
          let query = supabaseClient.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'vendor_requested');
          if (vendorState) query = query.eq('state', vendorState);
          const { count } = await query;
          reqEl.textContent = count || 0;
        } catch(e) {}
      }
    }

    
    async function renderVendorRequests() {
      const container = document.getElementById('vendorRequestsList');
      if (!container) return;

      if (!supabaseClient) {
        container.innerHTML = '<p style="color: #687076; text-align: center; padding: 40px;">Supabase not ready</p>';
        return;
      }

      // Gate: require complete profile before showing live requests
      if (!isVendorProfileComplete(currentUser)) {
        container.innerHTML = `<div class="warning" style="text-align:center;padding:24px;">
          <div style="font-size:32px;margin-bottom:12px;">👤</div>
          <strong>Complete your profile to start receiving requests.</strong><br>
          <span style="font-size:13px;">Your name, business name, phone, state and city are required for location matching.</span><br>
          <button class="btn btn-warning" onclick="showScreen('vendor-profile')" style="margin-top:14px;max-width:240px;">Complete Profile →</button>
        </div>`;
        return;
      }

      container.innerHTML = '<p style="color: #687076; text-align: center; padding: 20px;">Loading requests...</p>';

      const vendorState = await getCurrentUserPortalState('vendor');
      let query = supabaseClient
        .from('leads')
        .select('*')
        .in('status', ['vendor_requested', 'vendor_responded', 'closed']);
      if (vendorState) query = query.eq('state', vendorState);
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load vendor requests:', error);
        container.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 40px;">Failed to load vendor requests</p>';
        return;
      }

      if (!data || data.length === 0) {
        container.innerHTML = `<p style="color: #687076; text-align: center; padding: 40px;">${vendorState ? 'No vendor requests yet in ' + vendorState : 'No vendor requests yet. Add your state to your vendor account to enable location matching.'}</p>`;
        return;
      }

      // Load which requests this vendor has already unlocked
      const vendorUserId = await getCurrentAuthUserId().catch(() => null);
      let vendorUnlocked = new Set();
      if (vendorUserId && supabaseClient) {
        const { data: unlocks } = await supabaseClient
          .from('lead_unlocks')
          .select('lead_id')
          .eq('profile_id', vendorUserId);
        (unlocks || []).forEach(u => vendorUnlocked.add(u.lead_id));
      }
      if (typeof egIsAdmin === 'function' && egIsAdmin()) {
        (data || []).forEach(l => vendorUnlocked.add(l.id));
      }

      container.innerHTML = data.map(lead => {
        const isUnlocked = vendorUnlocked.has(lead.id);
        const phone      = isUnlocked ? (lead.phone || '') : '';
        const location   = [lead.city, lead.state].filter(Boolean).join(', ');
        const leadEnc    = encodeURIComponent(JSON.stringify(lead));

        // ── Badge ─────────────────────────────────────────────────────────
        let badgeClass, badgeLabel;
        if (lead.status === 'vendor_responded' || lead.status === 'contacted') {
          badgeClass = 'contacted'; badgeLabel = 'Responded';
        } else if (lead.status === 'closed') {
          badgeClass = 'closed'; badgeLabel = 'Closed';
        } else if (isUnlocked) {
          badgeClass = 'contacted'; badgeLabel = 'Unlocked';
        } else {
          badgeClass = 'new'; badgeLabel = 'New Request';
        }

        // ── Sizing snapshot ───────────────────────────────────────────────
        const snapshot = [
          lead.inverter_kva ? `<strong>${lead.inverter_kva}kVA</strong> inverter` : null,
          lead.panel_count  ? `<strong>${lead.panel_count}</strong> panel(s)` : null,
          lead.battery_kwh  ? `<strong>${lead.battery_kwh}kWh</strong> battery` : null,
          lead.daily_kwh    ? `<strong>${parseFloat(lead.daily_kwh).toFixed(1)}kWh</strong>/day` : null,
        ].filter(Boolean).join(' &nbsp;·&nbsp; ');

        // ── Extra vendor-specific fields ──────────────────────────────────
        const extras = [
          lead.battery_preference ? `Battery: <strong>${lead.battery_preference}</strong>` : null,
          lead.vendor_quote_type  ? `Quote for: <strong>${lead.vendor_quote_type}</strong>` : null,
          lead.project_type       ? `Type: <strong>${lead.project_type}</strong>` : null,
        ].filter(Boolean).join(' &nbsp;·&nbsp; ');

        // ── Buttons ───────────────────────────────────────────────────────
        const isClosed = lead.status === 'closed';
        let buttons;
        if (isClosed) {
          buttons = `<span style="font-size:12px;color:#687076;">This request is closed.</span>`;
        } else if (!isUnlocked) {
          buttons = `<button class="btn btn-warning small-btn"
            onclick="egUnlockContact('${lead.id}','vendor',function(){ renderVendorRequests(); })">
            🔓 Unlock Contact — ₦2,000</button>`;
        } else {
          buttons = `
            <button class="btn btn-warning small-btn" onclick="openOfferBuilderFromLead('${leadEnc}')">📦 Build Offer</button>
            <button class="btn btn-outline small-btn" onclick="contactCustomer('${phone}')">📞 Contact</button>
            <button class="btn btn-secondary small-btn" onclick="markVendorResponded('${lead.id}')">✓ Mark Responded</button>`;
        }

        return `
        <div class="lead-card">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;gap:10px;align-items:center;">
            <strong>${lead.full_name || 'Customer'}</strong>
            <span class="lead-status ${badgeClass}">${badgeLabel}</span>
          </div>
          <div style="font-size:13px;color:#687076;margin-bottom:6px;">
            ${isUnlocked ? (phone || 'No phone') : '📵 Contact visible after unlock'}
            ${location ? ' &nbsp;·&nbsp; ' + location : ''}
          </div>
          ${snapshot ? `<div style="font-size:12px;color:#374151;margin-bottom:6px;">${snapshot}</div>` : ''}
          ${extras   ? `<div style="font-size:12px;color:#687076;margin-bottom:6px;">${extras}</div>` : ''}
          ${lead.note ? `<div style="font-size:12px;color:#687076;margin-bottom:6px;font-style:italic;">"${lead.note}"</div>` : ''}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
            ${buttons}
          </div>
        </div>`;
      }).join('');
    }

    function handleVendorImageSelect(event) {
      const file = event.target.files[0];
      const errorDiv = document.getElementById('vendorImageError');
      if (!file) return;
      
      if (!file.type.match('image.*')) {
        errorDiv.textContent = 'Please select an image file';
        showToast('Please select an image', 'error');
        return;
      }
      
      if (file.size > 1024 * 1024) {
        errorDiv.textContent = 'Image must be less than 1MB';
        showToast('Image too large (max 1MB)', 'error');
        return;
      }
      
      errorDiv.textContent = '';
      
      const reader = new FileReader();
      reader.onload = function(e) {
        vendorUploadedImage = e.target.result;
        const preview = document.getElementById('vendorImagePreview');
        preview.src = vendorUploadedImage;
        preview.style.display = 'block';
        showToast('Image uploaded!', 'success');
      };
      reader.onerror = function() {
        showToast('Failed to read image', 'error');
      };
      reader.readAsDataURL(file);
    }
    
    async function saveVendorProduct() {
      const name        = document.getElementById('vendorProdName').value.trim();
      const type        = document.getElementById('vendorProdType').value;
      const power       = document.getElementById('vendorProdPower').value;
      const price       = document.getElementById('vendorProdPrice').value;
      const description = document.getElementById('vendorProdDesc').value.trim();

      let isValid = true;
      isValid = validateField('vendorProdName',  'vendorProdNameError',  v => v.length >= 3,       'Name required')  && isValid;
      isValid = validateField('vendorProdType',  'vendorProdTypeError',  v => v.length > 0,         'Type required')  && isValid;
      isValid = validateField('vendorProdPrice', 'vendorProdPriceError', v => parseFloat(v) > 0,   'Price required') && isValid;
      if (!isValid) { showToast('Please fix errors', 'error'); return; }

      showLoading(true, 'Saving...');
      try {
        const product = {
          vendorId:   currentUser ? currentUser.id   : 'demo',
          vendorName: currentUser ? currentUser.name : 'Solar Tech Ltd',
          name, type,
          power:       power ? parseFloat(power) : null,
          price:       parseFloat(price),
          description,
          image:       vendorUploadedImage || null,
          timestamp:   vendorCurrentProduct ? vendorCurrentProduct.timestamp : new Date().toISOString()
        };

        const existingCloudId = vendorCurrentProduct ? (vendorCurrentProduct._cloudId || vendorCurrentProduct.id) : null;
        await saveVendorProductToCloud(product, existingCloudId);

        showLoading(false);
        showToast(vendorCurrentProduct ? 'Product updated!' : 'Product added!', 'success');
        vendorCurrentProduct = null;
        showScreen('vendor-catalog');
      } catch (error) {
        showLoading(false);
        console.error('saveVendorProduct error:', error);
        showToast('Save failed: ' + (error.message || 'unknown error'), 'error');
      }
    }

    async function renderVendorCatalog() {
      const container = document.getElementById('vendorProductsList');
      if (!container) return;
      container.innerHTML = '<p style="color: #687076; text-align: center; padding: 40px;">Loading...</p>';

      try {
        const products = await getVendorProductsSafe();

        if (products.length === 0) {
          container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #687076;">
              <div style="font-size: 60px; margin-bottom: 16px;">📦</div>
              <h3>No products yet</h3>
              <button class="btn btn-warning" onclick="showScreen('vendor-add-product')" style="margin-top: 20px; max-width: 200px;">+ Add Product</button>
            </div>
          `;
          return;
        }

        const typeIcons  = { panel: '☀️', inverter: '⚡', battery: '🔋', controller: '🎛️', cable: '🔌', breaker: '🔒' };
        const typeLabels = { panel: 'Solar Panel', inverter: 'Inverter', battery: 'Battery', controller: 'Controller', cable: 'Cable', breaker: 'Breaker' };

        container.innerHTML = products.map(product => `
          <div class="product-card">
            ${product.image
              ? `<img src="${product.image}" class="product-image" alt="${product.name}">`
              : `<div class="product-image" style="display:flex;align-items:center;justify-content:center;font-size:32px;background:#fef3c7;">${typeIcons[product.type] || '📦'}</div>`
            }
            <div style="flex: 1;">
              <div style="font-weight:600;font-size:16px;margin-bottom:4px;">${product.name}</div>
              <div style="font-size:13px;color:#687076;margin-bottom:8px;">
                ${typeLabels[product.type] || product.type}${product.power ? ` • ${product.power}W` : ''}
              </div>
              <div style="font-size:18px;font-weight:700;color:#F59E0B;margin-bottom:12px;">
                ₦${Number(product.price).toLocaleString()}
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-outline small-btn" style="color:#F59E0B;border-color:#F59E0B;" onclick="editVendorProduct('${product._cloudId}')">Edit</button>
                <button class="btn btn-danger small-btn" onclick="deleteVendorProduct('${product._cloudId}')">Delete</button>
              </div>
            </div>
          </div>
        `).join('');
      } catch (err) {
        container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:40px;">Failed to load products</p>';
      }
    }

    async function editVendorProduct(cloudId) {
      showLoading(true, 'Loading...');
      try {
        const products = await getVendorProductsSafe();
        const product  = products.find(p => p._cloudId === cloudId);
        if (!product) { showLoading(false); showToast('Product not found', 'error'); return; }

        vendorCurrentProduct = product;

        document.getElementById('vendorFormTitle').textContent    = 'Edit Product';
        document.getElementById('vendorSaveBtn').innerHTML         = '💾 Update Product';
        document.getElementById('vendorProdName').value            = product.name;
        document.getElementById('vendorProdType').value            = product.type || '';
        document.getElementById('vendorProdPower').value           = product.power || '';
        document.getElementById('vendorProdPrice').value           = product.price;
        document.getElementById('vendorProdDesc').value            = product.description || '';

        if (product.image) {
          vendorUploadedImage = product.image;
          document.getElementById('vendorImagePreview').src          = product.image;
          document.getElementById('vendorImagePreview').style.display = 'block';
        } else {
          vendorUploadedImage = null;
          document.getElementById('vendorImagePreview').style.display = 'none';
        }

        showLoading(false);
        showScreen('vendor-add-product');
      } catch (err) {
        showLoading(false);
        showToast('Failed to load product', 'error');
      }
    }

    async function deleteVendorProduct(cloudId) {
      if (!confirm('Delete this product?')) return;
      showLoading(true, 'Deleting...');
      try {
        await deleteVendorProductFromCloud(cloudId);
        showLoading(false);
        showToast('Product deleted', 'info');
        renderVendorCatalog();
        updateVendorDashboard();
      } catch (error) {
        showLoading(false);
        console.error('deleteVendorProduct error:', error);
        showToast('Delete failed: ' + (error.message || 'unknown error'), 'error');
      }
    }

    function resetVendorProductForm() {
      vendorUploadedImage = null;
      
      document.getElementById('vendorFormTitle').textContent = 'Add Product';
      document.getElementById('vendorSaveBtn').innerHTML = '💾 Save Product';
      
      document.getElementById('vendorProdName').value = '';
      document.getElementById('vendorProdType').value = '';
      document.getElementById('vendorProdPower').value = '';
      document.getElementById('vendorProdPrice').value = '';
      document.getElementById('vendorProdDesc').value = '';
      document.getElementById('vendorImagePreview').style.display = 'none';
      
      document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
      document.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));
    }
    
    // ================================
    
    // ================================

    // ================================================================
// ================================================================
// SUPABASE INTEGRATION MODULE
// Replace localStorage authentication and data operations
// ================================================================

// ================================================================
// SUPABASE AUTH FUNCTIONS
// ================================================================


// Normalise a Nigerian state name to Title Case for consistent DB matching
function normalizeState(value) {
  if (!value) return null;
  return String(value).trim().replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function getAppRedirectUrl() {
  return window.location.origin + window.location.pathname;
}

function clearAuthHashFromUrl() {
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

let passwordRecoveryMode = false;

function profileHasPortalAccess(profile, requestedRole) {
  if (!profile) return false;
  if (requestedRole === 'vendor') return profile.is_vendor === true || profile.role === 'vendor';
  if (requestedRole === 'installer') return profile.is_installer === true || profile.role === 'installer';
  return false;
}

function buildPortalFlags(requestedRole, existingProfile = {}) {
  return {
    is_vendor: requestedRole === 'vendor' ? true : (existingProfile.is_vendor === true || existingProfile.role === 'vendor'),
    is_installer: requestedRole === 'installer' ? true : (existingProfile.is_installer === true || existingProfile.role === 'installer')
  };
}

async function grantPortalAccess(userId, requestedRole, existingProfile = {}) {
  const flags = buildPortalFlags(requestedRole, existingProfile);
  const payload = {
    id: userId,
    role: existingProfile.role || requestedRole,
    is_vendor: flags.is_vendor,
    is_installer: flags.is_installer
  };

  if (existingProfile.company_name !== undefined) payload.company_name = existingProfile.company_name;
  if (existingProfile.phone !== undefined) payload.phone = existingProfile.phone;
  if (existingProfile.address !== undefined) payload.address = existingProfile.address;
  if (existingProfile.service_area !== undefined) payload.service_area = existingProfile.service_area;
  if (existingProfile.state !== undefined) payload.state = normalizeState(existingProfile.state) || existingProfile.state;
  if (existingProfile.city !== undefined) payload.city = existingProfile.city;

  const { error } = await supabaseClient
    .from('profiles')
    .upsert([payload], { onConflict: 'id' });

  if (error) {
    console.error('Grant portal access error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, profile: { ...existingProfile, ...payload } };
}

function routeToPortal(role) {
  // Keep end-user flow lightweight — no dashboard redirect
  if (role === 'user') {
    currentRole = 'user';
    showScreen('user-calculator');
    if (typeof updateUserAccountUI === 'function') updateUserAccountUI();
    return;
  }
  // Use completeness check — sends to profile completion if needed
  routeToPortalWithCheck(role);
}

async function supabaseSignUp(email, password, userData) {
  try {
    const { data: authData, error: signUpError } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: userData,
        emailRedirectTo: getAppRedirectUrl()
      }
    });

    if (signUpError) throw signUpError;

    if (!authData || !authData.user) {
      throw new Error('Signup failed - no user returned');
    }

    const identities = authData.user.identities || [];
    if (identities.length === 0) {
      return {
        success: false,
        error: 'This email is already registered or awaiting confirmation. Try logging in or check your email for the confirmation message.'
      };
    }

    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert([{
        id: authData.user.id,
        role: userData.role,
        full_name: userData.full_name || null,
        company_name: userData.company_name || userData.business_name || null,
        business_name: userData.business_name || userData.company_name || null,
        phone: userData.phone,
        address: userData.address || null,
        shop_address: userData.shop_address || null,
        service_area: userData.service_area || null,
        state: normalizeState(userData.state) || null,
        city: userData.city || null,
        is_vendor: userData.role === 'vendor',
        is_installer: userData.role === 'installer'
      }], { onConflict: 'id' });

    if (profileError) {
      console.warn('Profile insert skipped/failed (will retry on login):', profileError);
    }

    return {
      success: true,
      user: authData.user,
      emailConfirmationRequired: !authData.session
    };
  } catch (error) {
    console.error('Supabase signup error:', error);
    return { success: false, error: error.message };
  }
}

async function supabaseSignIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) throw error;
    
    // Get user profile
    let profile = null;
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      // Try to create a minimal profile from user metadata (or pendingRole)
      const meta = data.user.user_metadata || {};
      const role = meta.role || localStorage.getItem('pendingRole') || null;
      const company_name = meta.company_name || meta.full_name || null;
      const phone = meta.phone || null;

      if (role) {
        const { error: insertErr } = await supabaseClient.from('profiles').insert([{
          id: data.user.id,
          role,
          company_name,
          phone,
          address: meta.address || null,
          service_area: meta.service_area || null,
          state: normalizeState(meta.state) || null,
          city: meta.city || null,
          is_vendor: role === 'vendor',
          is_installer: role === 'installer'
        }]);
        if (insertErr) throw insertErr;

        const { data: profileData2, error: profileError2 } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profileError2) throw profileError2;
        profile = profileData2;
      } else {
        throw profileError;
      }
    } else {
      profile = profileData;
    }

    return { 
      success: true, 
      user: data.user,
      profile: profile
    };
  } catch (error) {
    console.error('Supabase signin error:', error);
    return { success: false, error: error.message };
  }
}

async function supabaseSignOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Supabase signout error:', error);
    return { success: false, error: error.message };
  }
}

async function supabaseResetPassword(email) {
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: getAppRedirectUrl()
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Supabase password reset error:', error);
    return { success: false, error: error.message };
  }
}

async function supabaseUpdatePassword(newPassword) {
  try {
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Supabase update password error:', error);
    return { success: false, error: error.message };
  }
}

async function supabaseGetSession() {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

// ================================================================
// SUPABASE DATA FUNCTIONS
// ================================================================

// Products
async function supabaseGetProducts(vendorId) {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get products error:', error);
    return { success: false, error: error.message, data: [] };
  }
}

async function supabaseAddProduct(product) {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Add product error:', error);
    return { success: false, error: error.message };
  }
}

async function supabaseUpdateProduct(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Update product error:', error);
    return { success: false, error: error.message };
  }
}

async function supabaseDeleteProduct(id) {
  try {
    const { error } = await supabaseClient
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete product error:', error);
    return { success: false, error: error.message };
  }
}

// Calculations
async function supabaseGetCalculations(installerId) {
  try {
    const { data, error } = await supabaseClient
      .from('calculations')
      .select('*')
      .eq('installer_id', installerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get calculations error:', error);
    return { success: false, error: error.message, data: [] };
  }
}

async function supabaseSaveCalculation(calculation) {
  try {
    const { data, error } = await supabaseClient
      .from('calculations')
      .insert([calculation])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Save calculation error:', error);
    return { success: false, error: error.message };
  }
}

async function supabaseDeleteCalculation(id) {
  try {
    const { error } = await supabaseClient
      .from('calculations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete calculation error:', error);
    return { success: false, error: error.message };
  }
}

// Job Leads
async function supabaseGetJobLeads() {
  try {
    const { data, error } = await supabaseClient
      .from('job_leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get job leads error:', error);
    return { success: false, error: error.message, data: [] };
  }
}

async function supabaseSubmitJobLead(lead) {
  try {
    const { data, error } = await supabaseClient
      .from('job_leads')
      .insert([lead])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Submit job lead error:', error);
    return { success: false, error: error.message };
  }
}


async function supabaseSubmitMarketplaceLead(lead) {
  try {
    const { error } = await supabaseClient
      .from('leads')
      .insert([lead]);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Submit marketplace lead error:', error);
    return { success: false, error: error.message };
  }
}


    // AUTHENTICATION SYSTEM
    // ================================================================
    
    // Demo user block removed — Supabase auth only
    
    // Validation functions
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function isValidPassword(password) {
      return password && password.length >= 8;
    }
    
    function getSecurityQuestionText(key) {
      const questions = {
        'city': 'What city were you born in?',
        'school': 'What was your first school?',
        'pet': 'What was your first pet\'s name?',
        'mother': 'What is your mother\'s maiden name?'
      };
      return questions[key] || '';
    }
    

    function openPasswordResetScreen(role) {
      passwordRecoveryMode = true;

      if (role === 'installer') {
        showScreen('installer-forgot-password');
        document.getElementById('installerForgotStep1').style.display = 'none';
        document.getElementById('installerForgotStep2').style.display = 'none';
        document.getElementById('installerForgotStep3').style.display = 'block';
        document.getElementById('installerForgotNewPassword').value = '';
        document.getElementById('installerForgotConfirmPassword').value = '';
        document.getElementById('installerForgotNewPasswordError').textContent = '';
        document.getElementById('installerForgotConfirmPasswordError').textContent = '';
      } else {
        showScreen('vendor-forgot-password');
        document.getElementById('vendorForgotStep1').style.display = 'none';
        document.getElementById('vendorForgotStep2').style.display = 'none';
        document.getElementById('vendorForgotStep3').style.display = 'block';
        document.getElementById('vendorForgotNewPassword').value = '';
        document.getElementById('vendorForgotConfirmPassword').value = '';
        document.getElementById('vendorForgotNewPasswordError').textContent = '';
        document.getElementById('vendorForgotConfirmPasswordError').textContent = '';
      }
    }

    function completeLocalResetCleanup(role) {
      passwordRecoveryMode = false;
      localStorage.removeItem('pendingPasswordResetRole');
      clearAuthHashFromUrl();

      if (role === 'installer') {
        document.getElementById('installerForgotStep3').style.display = 'none';
        document.getElementById('installerForgotStep1').style.display = 'block';
        document.getElementById('installerForgotEmail').value = '';
        document.getElementById('installerForgotAnswer').value = '';
        document.getElementById('installerForgotNewPassword').value = '';
        document.getElementById('installerForgotConfirmPassword').value = '';
      } else {
        document.getElementById('vendorForgotStep3').style.display = 'none';
        document.getElementById('vendorForgotStep1').style.display = 'block';
        document.getElementById('vendorForgotEmail').value = '';
        document.getElementById('vendorForgotAnswer').value = '';
        document.getElementById('vendorForgotNewPassword').value = '';
        document.getElementById('vendorForgotConfirmPassword').value = '';
      }
    }

    // VENDOR REGISTRATION
    async function registerVendor() {
      document.querySelectorAll('#vendor-register .error-message').forEach(e => e.textContent = '');
      
      const fullName = document.getElementById('regVendorFullName').value.trim();
      const company = document.getElementById('regVendorCompany').value.trim();
      const email = document.getElementById('regVendorEmail').value.trim().toLowerCase();
      const phone = document.getElementById('regVendorPhone').value.trim();
      const state = document.getElementById('regVendorState').value;
      const city = document.getElementById('regVendorCity').value.trim();
      const address = document.getElementById('regVendorAddress').value.trim();
      const password = document.getElementById('regVendorPassword').value;
      const passwordConfirm = document.getElementById('regVendorPasswordConfirm').value;
      const securityQ = document.getElementById('regVendorSecurityQ').value;
      const securityA = document.getElementById('regVendorSecurityA').value.trim().toLowerCase();
      // Optional fields
      const delivery = document.getElementById('regVendorDelivery').value.trim();
      const sellsPanels = document.getElementById('regVendorPanels').checked;
      const sellsInverters = document.getElementById('regVendorInverters').checked;
      const sellsLithium = document.getElementById('regVendorLithium').checked;
      const sellsTubular = document.getElementById('regVendorTubular').checked;
      const sellsAccessories = document.getElementById('regVendorAccessories').checked;
      const offersInstall = document.getElementById('regVendorOffersInstall').value;
      const whatsapp = document.getElementById('regVendorWhatsapp').value.trim();
      const brands = document.getElementById('regVendorBrands').value.trim();
      const cac = document.getElementById('regVendorCac').value.trim();
      const desc = document.getElementById('regVendorDesc').value.trim();
      
      let hasError = false;
      
      if (!fullName) { document.getElementById('regVendorFullNameError').textContent = 'Full name required'; hasError = true; }
      if (!company) { document.getElementById('regVendorCompanyError').textContent = 'Business name required'; hasError = true; }
      if (!email) { document.getElementById('regVendorEmailError').textContent = 'Email required'; hasError = true; }
      else if (!isValidEmail(email)) { document.getElementById('regVendorEmailError').textContent = 'Invalid email'; hasError = true; }
      if (!phone) { document.getElementById('regVendorPhoneError').textContent = 'Phone required'; hasError = true; }
      if (!state) { document.getElementById('regVendorStateError').textContent = 'State required'; hasError = true; }
      if (!city) { document.getElementById('regVendorCityError').textContent = 'City / Area required'; hasError = true; }
      if (!password) { document.getElementById('regVendorPasswordError').textContent = 'Password required'; hasError = true; }
      else if (!isValidPassword(password)) { document.getElementById('regVendorPasswordError').textContent = 'Min 8 characters'; hasError = true; }
      if (password !== passwordConfirm) { document.getElementById('regVendorPasswordConfirmError').textContent = 'Passwords do not match'; hasError = true; }
      if (!securityQ) { document.getElementById('regVendorSecurityQError').textContent = 'Security question required'; hasError = true; }
      if (!securityA) { document.getElementById('regVendorSecurityAError').textContent = 'Security answer required'; hasError = true; }
      
      if (hasError) return;
      
      showLoading(true, 'Creating account...');
      
      const result = await supabaseSignUp(email, password, {
        role: 'vendor',
        full_name: fullName,
        company_name: company,
        business_name: company,
        phone: phone,
        state: state,
        city: city,
        shop_address: address,
        address: address,
        delivery_coverage: delivery,
        sells_panels: sellsPanels,
        sells_inverters: sellsInverters,
        sells_lithium: sellsLithium,
        sells_tubular: sellsTubular,
        sells_accessories: sellsAccessories,
        offers_installation: offersInstall,
        whatsapp_number: whatsapp,
        brands_carried: brands,
        cac_number: cac,
        business_description: desc,
        security_q: securityQ,
        security_a: securityA
      });
      
      showLoading(false);
      
      if (result.success) {
        if (result.emailConfirmationRequired) {
          showToast('Account created. Check your inbox or spam for the verification email before logging in.', 'success');
        } else {
          showToast('Account created successfully. You can log in now.', 'success');
        }
        currentUser = null;
        currentRole = null;
        showScreen('vendor-login');
      } else {
        showToast(result.error || 'Signup failed', 'error');
        if (result.error.includes('already')) {
          document.getElementById('regVendorEmailError').textContent = 'Email already registered';
        }
      }
    }
    
    // INSTALLER REGISTRATION
    async function registerInstaller() {
      document.querySelectorAll('#installer-register .error-message').forEach(e => e.textContent = '');
      
      const fullName = document.getElementById('regInstFullName').value.trim();
      const company = document.getElementById('regInstCompany').value.trim();
      const email = document.getElementById('regInstEmail').value.trim().toLowerCase();
      const phone = document.getElementById('regInstPhone').value.trim();
      const state = document.getElementById('regInstState').value;
      const area = document.getElementById('regInstArea').value.trim();
      const password = document.getElementById('regInstPassword').value;
      const passwordConfirm = document.getElementById('regInstPasswordConfirm').value;
      const securityQ = document.getElementById('regInstSecurityQ').value;
      const securityA = document.getElementById('regInstSecurityA').value.trim().toLowerCase();
      // Optional fields
      const serviceState = document.getElementById('regInstServiceState').value;
      const serviceCity = document.getElementById('regInstServiceCity').value.trim();
      const minKva = parseFloat(document.getElementById('regInstMinKva').value) || null;
      const maxKva = parseFloat(document.getElementById('regInstMaxKva').value) || null;
      const lithium = document.getElementById('regInstLithium').checked;
      const tubular = document.getElementById('regInstTubular').checked;
      const market = document.getElementById('regInstMarket').value;
      const years = document.getElementById('regInstYears').value;
      const whatsapp = document.getElementById('regInstWhatsapp').value.trim();
      const cac = document.getElementById('regInstCac').value.trim();
      const desc = document.getElementById('regInstDesc').value.trim();
      
      let hasError = false;
      
      if (!fullName) { document.getElementById('regInstFullNameError').textContent = 'Full name required'; hasError = true; }
      if (!company) { document.getElementById('regInstCompanyError').textContent = 'Business name required'; hasError = true; }
      if (!email) { document.getElementById('regInstEmailError').textContent = 'Email required'; hasError = true; }
      else if (!isValidEmail(email)) { document.getElementById('regInstEmailError').textContent = 'Invalid email'; hasError = true; }
      if (!phone) { document.getElementById('regInstPhoneError').textContent = 'Phone required'; hasError = true; }
      if (!state) { document.getElementById('regInstStateError').textContent = 'State required'; hasError = true; }
      if (!area) { document.getElementById('regInstAreaError').textContent = 'City / Area required'; hasError = true; }
      if (!password) { document.getElementById('regInstPasswordError').textContent = 'Password required'; hasError = true; }
      else if (!isValidPassword(password)) { document.getElementById('regInstPasswordError').textContent = 'Min 8 characters'; hasError = true; }
      if (password !== passwordConfirm) { document.getElementById('regInstPasswordConfirmError').textContent = 'Passwords do not match'; hasError = true; }
      if (!securityQ) { document.getElementById('regInstSecurityQError').textContent = 'Security question required'; hasError = true; }
      if (!securityA) { document.getElementById('regInstSecurityAError').textContent = 'Security answer required'; hasError = true; }
      
      if (hasError) return;
      
      showLoading(true, 'Creating account...');
      
      const result = await supabaseSignUp(email, password, {
        role: 'installer',
        full_name: fullName,
        company_name: company,
        business_name: company,
        phone: phone,
        state: state,
        city: area,
        service_area: area,
        service_state: serviceState,
        service_city: serviceCity,
        min_system_kva: minKva,
        max_system_kva: maxKva,
        works_with_lithium: lithium,
        works_with_tubular: tubular,
        market_type: market,
        years_experience: years,
        whatsapp_number: whatsapp,
        cac_number: cac,
        business_description: desc,
        security_q: securityQ,
        security_a: securityA
      });
      
      showLoading(false);
      
      if (result.success) {
        if (result.emailConfirmationRequired) {
          showToast('Account created. Check your inbox or spam for the verification email before logging in.', 'success');
        } else {
          showToast('Account created successfully. You can log in now.', 'success');
        }
        currentUser = null;
        currentRole = null;
        showScreen('installer-login');
      } else {
        showToast(result.error || 'Signup failed', 'error');
        if (result.error.includes('already')) {
          document.getElementById('regInstEmailError').textContent = 'Email already registered';
        }
      }
    }
    
    // VENDOR FORGOT PASSWORD
    let vendorResetUser = null;
    
    function vendorForgotStep1() {
      const email = document.getElementById('vendorForgotEmail').value.trim().toLowerCase();
      document.getElementById('vendorForgotEmailError').textContent = '';

      if (!email) {
        document.getElementById('vendorForgotEmailError').textContent = 'Email is required';
        return;
      }

      localStorage.setItem('pendingPasswordResetRole', 'vendor');
      showLoading(true, 'Sending reset link...');
      supabaseResetPassword(email).then((res) => {
        showLoading(false);
        if (res.success) {
          showToast('Reset link sent. Check your email.', 'success');
        } else {
          showToast(res.error || 'Could not send reset link', 'error');
        }
      });
    }

    function vendorForgotStep2() {
      const answer = document.getElementById('vendorForgotAnswer').value.trim().toLowerCase();
      document.getElementById('vendorForgotAnswerError').textContent = '';
      
      if (!answer) {
        document.getElementById('vendorForgotAnswerError').textContent = 'Answer required';
        return;
      }
      
      if (answer !== vendorResetUser.securityA) {
        document.getElementById('vendorForgotAnswerError').textContent = 'Incorrect answer';
        return;
      }
      
      document.getElementById('vendorForgotStep2').style.display = 'none';
      document.getElementById('vendorForgotStep3').style.display = 'block';
    }
    
    async function vendorForgotStep3() {
      const newPassword = document.getElementById('vendorForgotNewPassword').value;
      const confirmPassword = document.getElementById('vendorForgotConfirmPassword').value;

      document.getElementById('vendorForgotNewPasswordError').textContent = '';
      document.getElementById('vendorForgotConfirmPasswordError').textContent = '';

      if (!isValidPassword(newPassword)) {
        document.getElementById('vendorForgotNewPasswordError').textContent = 'Min 8 characters';
        return;
      }

      if (newPassword !== confirmPassword) {
        document.getElementById('vendorForgotConfirmPasswordError').textContent = 'Passwords do not match';
        return;
      }

      if (passwordRecoveryMode) {
        showLoading(true, 'Updating password...');
        const result = await supabaseUpdatePassword(newPassword);
        showLoading(false);

        if (!result.success) {
          showToast(result.error || 'Could not update password', 'error');
          return;
        }

        await supabaseSignOut();
        completeLocalResetCleanup('vendor');
        showToast('Password updated successfully. Please log in with your new password.', 'success');
        showScreen('vendor-login');
        return;
      }

      showToast('Use the reset email link to open password recovery first.', 'error');
    }

    // INSTALLER FORGOT PASSWORD
    let installerResetUser = null;
    
    function installerForgotStep1() {
      const email = document.getElementById('installerForgotEmail').value.trim().toLowerCase();
      document.getElementById('installerForgotEmailError').textContent = '';

      if (!email) {
        document.getElementById('installerForgotEmailError').textContent = 'Email is required';
        return;
      }

      localStorage.setItem('pendingPasswordResetRole', 'installer');
      showLoading(true, 'Sending reset link...');
      supabaseResetPassword(email).then((res) => {
        showLoading(false);
        if (res.success) {
          showToast('Reset link sent. Check your email.', 'success');
        } else {
          showToast(res.error || 'Could not send reset link', 'error');
        }
      });
    }

    function installerForgotStep2() {
      const answer = document.getElementById('installerForgotAnswer').value.trim().toLowerCase();
      document.getElementById('installerForgotAnswerError').textContent = '';
      
      if (!answer) {
        document.getElementById('installerForgotAnswerError').textContent = 'Answer required';
        return;
      }
      
      if (answer !== installerResetUser.securityA) {
        document.getElementById('installerForgotAnswerError').textContent = 'Incorrect answer';
        return;
      }
      
      document.getElementById('installerForgotStep2').style.display = 'none';
      document.getElementById('installerForgotStep3').style.display = 'block';
    }
    
    async function installerForgotStep3() {
      const newPassword = document.getElementById('installerForgotNewPassword').value;
      const confirmPassword = document.getElementById('installerForgotConfirmPassword').value;

      document.getElementById('installerForgotNewPasswordError').textContent = '';
      document.getElementById('installerForgotConfirmPasswordError').textContent = '';

      if (!isValidPassword(newPassword)) {
        document.getElementById('installerForgotNewPasswordError').textContent = 'Min 8 characters';
        return;
      }

      if (newPassword !== confirmPassword) {
        document.getElementById('installerForgotConfirmPasswordError').textContent = 'Passwords do not match';
        return;
      }

      if (passwordRecoveryMode) {
        showLoading(true, 'Updating password...');
        const result = await supabaseUpdatePassword(newPassword);
        showLoading(false);

        if (!result.success) {
          showToast(result.error || 'Could not update password', 'error');
          return;
        }

        await supabaseSignOut();
        completeLocalResetCleanup('installer');
        showToast('Password updated successfully. Please log in with your new password.', 'success');
        showScreen('installer-login');
        return;
      }

      showToast('Use the reset email link to open password recovery first.', 'error');
    }

    // ================================================================
    // PASSWORD VISIBILITY TOGGLE
    // ================================================================
    
    function togglePasswordVisibility(inputId, iconId) {
      const input = document.getElementById(inputId);
      const icon = document.getElementById(iconId);
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈'; // Hide icon
      } else {
        input.type = 'password';
        icon.textContent = '👁️'; // Show icon
      }
    }
    
    // ================================================================
    // GOOGLE SIGN-IN INTEGRATION
    // ================================================================
    
    async function signInWithGoogle(role) {
      try {
        // Google OAuth requires a real web origin (http/https). If you opened the HTML as file:// it will fail.
        if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
          showToast('Google sign-in needs a web link (http/https). Please open via Live Server or a hosted link.', 'error');
          return { success: false, error: 'Invalid origin for OAuth' };
        }

        showLoading(true, 'Opening Google sign-in...');

        // Store the role for after Google redirects back
        localStorage.setItem('pendingRole', role);

        const redirectTo = window.location.origin + window.location.pathname;

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo }
        });

        showLoading(false);

        if (error) throw error;

        return { success: true, data };
      } catch (error) {
        showLoading(false);
        console.error('Google sign-in error:', error);
        showToast('Google sign-in failed: ' + error.message, 'error');
        return { success: false, error: error.message };
      }
    }

    async function handleGoogleAuthReturn() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash || '';
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);

        const hasHashTokens = hashParams.has('access_token') && hashParams.has('refresh_token');
        const hasAuthCode = searchParams.has('code');
        const isRecovery = searchParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery';
        const hasOtpExpired = searchParams.get('error_code') === 'otp_expired' || hashParams.get('error_code') === 'otp_expired';

        if (!(hasHashTokens || hasAuthCode || isRecovery || hasOtpExpired)) {
          return;
        }

        if (hasOtpExpired) {
          const recoveryRole = localStorage.getItem('pendingPasswordResetRole') || 'vendor';
          showToast('That reset link has expired. Request a new password reset email and use it immediately.', 'error');
          openPasswordResetScreen(recoveryRole);
          clearAuthHashFromUrl();
          return;
        }

        showLoading(true, isRecovery ? 'Opening password reset...' : 'Signing you in...');

        let session = null;

        if (hasHashTokens) {
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');
          const { data, error } = await supabaseClient.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
          session = data.session;
        } else if (hasAuthCode && supabaseClient.auth.exchangeCodeForSession) {
          const { data, error } = await supabaseClient.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
          session = data.session;
        } else {
          session = await supabaseGetSession();
        }

        if (!(session && session.user)) {
          showLoading(false);
          clearAuthHashFromUrl();
          return;
        }

        currentUser = session.user;

        if (isRecovery) {
          const recoveryRole = localStorage.getItem('pendingPasswordResetRole') || 'vendor';
          showLoading(false);
          openPasswordResetScreen(recoveryRole);
          showToast('Enter your new password to complete the reset.', 'info');
          clearAuthHashFromUrl();
          return;
        }

        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        const requestedRole = localStorage.getItem('pendingRole') || profile?.role || 'user';
        let resolvedRole = requestedRole;
        let activeProfile = profile;

        if (!profile || profileError) {
          const userName = session.user.user_metadata?.full_name ||
                           session.user.user_metadata?.name ||
                           session.user.user_metadata?.company_name ||
                           session.user.email.split('@')[0];

          const flags = buildPortalFlags(requestedRole, {});
          const profilePayload = {
            id: session.user.id,
            role: requestedRole,
            company_name: userName,
            phone: '',
            address: requestedRole === 'vendor' ? '' : null,
            service_area: requestedRole === 'installer' ? '' : null,
            is_vendor: flags.is_vendor,
            is_installer: flags.is_installer
          };

          const { error: insertError } = await supabaseClient
            .from('profiles')
            .upsert([profilePayload], { onConflict: 'id' });

          if (insertError) {
            showLoading(false);
            console.error('Profile creation error:', insertError);
            showToast('Google login succeeded, but profile creation failed.', 'error');
            clearAuthHashFromUrl();
            return;
          }

          activeProfile = profilePayload;
        } else if (!profileHasPortalAccess(profile, requestedRole)) {
          const grant = await grantPortalAccess(session.user.id, requestedRole, profile);
          if (!grant.success) {
            showLoading(false);
            showToast(grant.error || 'Could not add portal access', 'error');
            clearAuthHashFromUrl();
            return;
          }
          activeProfile = grant.profile;
          showToast((requestedRole === 'vendor' ? 'Vendor' : 'Installer') + ' access added to this account.', 'success');
        }

        resolvedRole = requestedRole;
        egSyncUser({ ...session.user, ...(activeProfile || {}) });
        currentRole = resolvedRole;
        localStorage.removeItem('pendingRole');
        clearAuthHashFromUrl();
        showLoading(false);

        onLoginSuccess().catch(e => console.warn('onLoginSuccess:', e));
        routeToPortal(resolvedRole);
        if (resolvedRole === 'user' && typeof updateUserAccountUI === 'function') updateUserAccountUI();
        showToast('Welcome back!', 'success');
      } catch (error) {
        showLoading(false);
        console.error('Google auth return error:', error);
        showToast('Authentication redirect could not be completed. Please try again.', 'error');
      }
    }

    // INITIALIZATION
    // ================================
    
    // Initialize app
    // Calculator initialisation handled by iframes — stub functions are no-ops
    
    // Check for saved session (DISABLED - always start at welcome screen)
    // To enable auto-login, uncomment the code below:
    /*
    const savedUser = localStorage.getItem('energyGuide_currentUser');
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        currentRole = currentUser.role;
        if (currentRole === 'installer') showScreen('installer-dashboard');
        else if (currentRole === 'vendor') showScreen('vendor-dashboard');
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }
    */
    
    document.addEventListener('DOMContentLoaded', () => {
      normalizeScreenPlacement();
      setTimeout(() => { normalizeScreenPlacement(); }, 0);
      setTimeout(() => { normalizeScreenPlacement(); }, 120);
      setTimeout(() => { if (typeof updateUserAccountUI === 'function') updateUserAccountUI(); }, 50);
    });


    function normalizeScreenPlacement() {
      try {
        const app = document.querySelector('.app-container');
        const content = app && app.querySelector('.content');
        if (!app || !content) return;

        // Move any misplaced screens back inside the main content wrapper.
        const allScreens = Array.from(document.querySelectorAll('.screen'));
        allScreens.forEach(screen => {
          if (!content.contains(screen)) {
            content.appendChild(screen);
          }
        });

        // User post-calc actions belong inside the user calculator screen.
        const userCalc = document.getElementById('user-calculator');
        const userActions = document.getElementById('userPostCalcActions');
        if (userCalc && userActions && !userCalc.contains(userActions)) {
          const anchor = userCalc.querySelector('.container') || userCalc.lastElementChild;
          if (anchor && anchor.parentNode === userCalc) anchor.insertAdjacentElement('afterend', userActions);
          else userCalc.appendChild(userActions);
        }

        // Vendor build-offer button belongs inside vendor calculator screen.
        const vendorCalc = document.getElementById('vendor-calculator');
        const vendorBuildBtn = document.getElementById('vendorCalcBuildOfferBtn');
        if (vendorCalc && vendorBuildBtn && !vendorCalc.contains(vendorBuildBtn)) {
          const anchor = vendorCalc.querySelector('.container') || vendorCalc.lastElementChild;
          if (anchor && anchor.parentNode === vendorCalc) anchor.insertAdjacentElement('afterend', vendorBuildBtn);
          else vendorCalc.appendChild(vendorBuildBtn);
        }

        // Installer post-calc actions belong inside installer calculator screen.
        const instCalc = document.getElementById('installer-calculator');
        const instActions = document.getElementById('eg-view-results-btn');
        if (instCalc && instActions && !instCalc.contains(instActions)) {
          const anchor = instCalc.querySelector('.container') || instCalc.lastElementChild;
          if (anchor && anchor.parentNode === instCalc) anchor.insertAdjacentElement('afterend', instActions);
          else instCalc.appendChild(instActions);
        }
      } catch (e) {
        console.warn('normalizeScreenPlacement failed:', e);
      }
    }

    // Welcome message
    setTimeout(() => {
      if (currentScreen === 'welcome') {
        showToast('Welcome to Energy Guide Platform!', 'info');
      }
    }, 1000);
    
    console.log('Energy Guide Platform v1.0 - All 3 Portals Loaded Successfully! 🎉');

    // ── Listen for installer iframe calculation results ───────────────────
    // postMessage listener removed — calculators inlined

    // ================================================================
    // VENDOR OFFER BUILDER
    // ================================================================

    let vobAttachedLead = null;

    function openVendorOfferBuilder() {
      if (!vendorIframeResult) {
        showToast('Please run a calculation first.', 'error');
        return;
      }
      vobAttachedLead = null;
      vobPopulate(vendorIframeResult);
      showScreen('vendor-offer-builder');
      requestAnimationFrame(() => { forceResetScroll(); setTimeout(forceResetScroll, 40); setTimeout(forceResetScroll, 120); });
    }

    function backFromVendorOfferBuilder() {
      if (vobAttachedLead) {
        showScreen('vendor-requests');
      } else {
        showScreen('vendor-dashboard');
      }
    }

    // Open Vendor Offer Builder pre-filled from a vendor lead card (no iframe calc required)
    function openOfferBuilderFromLead(leadJSON) {
      let lead;
      try { lead = JSON.parse(decodeURIComponent(leadJSON)); } catch(e) { showToast('Could not load lead data', 'error'); return; }
      // Build a vendorIframeResult-compatible object from lead snapshot fields
      const invKva  = parseFloat(lead.inverter_kva) || 3;
      const panels  = parseInt(lead.panel_count)     || 6;
      const batKwh  = parseFloat(lead.battery_kwh)  || 5;
      const dailyKwh= parseFloat(lead.daily_kwh)    || (batKwh * 0.8);
      const sysV    = invKva <= 3 ? 24 : 48;
      const pvW     = panels * 500;
      const synth = {
        invKva,
        sysV,
        numPanels:       panels,
        pvWatts:         pvW,
        lithiumPackKwh:  batKwh,
        dailyKwh,
        totalWatts:      invKva * 700,
        maxSurge:        invKva * 1200,
        pvBreaker:       Math.ceil(panels * 10 * 1.25 / 10) * 10,
        battBreaker:     Math.ceil(invKva  * 50 * 1.25 / 10) * 10,
        acBreaker:       Math.ceil(invKva  * 10 * 1.25 / 10) * 10,
        pvCable:  '6',
        battCable:'25',
        acCable:  '4',
        leadTotalBatteries: Math.max(1, Math.ceil(batKwh / 5)),
        tubularTotalBatteries: Math.max(1, Math.ceil(batKwh / 1.5)),
      };
      vendorIframeResult = synth;
      vobAttachedLead = lead;
      vobPopulate(synth);
      showScreen('vendor-offer-builder');
      requestAnimationFrame(() => { forceResetScroll(); setTimeout(forceResetScroll, 40); setTimeout(forceResetScroll, 120); });
    }

    function vobPopulate(r) {
      const lead = vobAttachedLead;
      const N = v => Number(v || 0).toLocaleString();
      const date = new Date().toLocaleDateString('en-NG');

      // iframe result uses: invKva, sysV, lithiumPackKwh, numPanels, pvWatts,
      // pvBreaker, battBreaker, acBreaker, pvCable, battCable, acCable, totalWatts, dailyKwh, maxSurge
      const invKva   = r.invKva;
      const sysV     = r.sysV;
      const batKwh   = r.lithiumPackKwh;
      const batCount = Math.max(1, Math.ceil(batKwh / 2.5));
      const panels   = r.numPanels;
      const pvW      = Math.ceil(r.pvWatts);

      // ── Section A: Customer snapshot ──────────────────────────────────
      const custName  = (lead && lead.full_name)  || 'Walk-in customer';
      const custPhone = (lead && lead.phone)      || 'Not provided';
      const custState = (lead && lead.state) || '—';
      const custCity  = (lead && lead.city)  || '—';
      const projType  = (lead && lead.project_type) || '—';
      const leadStat  = (lead && lead.status) || 'Walk-in';

      if (lead) {
        document.getElementById('vob-client-card').innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;">
            <div><span style="color:#6b7280;font-size:11px;">Customer Name</span><br><strong>${custName}</strong></div>
            <div><span style="color:#6b7280;font-size:11px;">Phone</span><br><strong>${custPhone}</strong></div>
            <div><span style="color:#6b7280;font-size:11px;">State</span><br><strong>${custState}</strong></div>
            <div><span style="color:#6b7280;font-size:11px;">City / Area</span><br><strong>${custCity}</strong></div>
            <div><span style="color:#6b7280;font-size:11px;">Project Type</span><br><strong>${projType}</strong></div>
            <div><span style="color:#6b7280;font-size:11px;">Date</span><br><strong>${date}</strong></div>
            <div><span style="color:#6b7280;font-size:11px;">Lead Status</span><br><strong>${leadStat}</strong></div>
          </div>`;
      } else {
        document.getElementById('vob-client-card').innerHTML = `
          <div style="font-size:11px;color:#9ca3af;margin-bottom:12px;">Walk-in offer — editable before PDF/WhatsApp</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;">
            <div><label style="color:#6b7280;font-size:11px;display:block;margin-bottom:4px;">Customer Name</label><input type="text" id="vob-walkin-name" value="Walk-in customer" style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
            <div><label style="color:#6b7280;font-size:11px;display:block;margin-bottom:4px;">Phone</label><input type="text" id="vob-walkin-phone" placeholder="Not provided" style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
            <div><label style="color:#6b7280;font-size:11px;display:block;margin-bottom:4px;">State</label><input type="text" id="vob-walkin-state" placeholder="State" style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
            <div><label style="color:#6b7280;font-size:11px;display:block;margin-bottom:4px;">City / Area</label><input type="text" id="vob-walkin-city" placeholder="City / Area" style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
            <div><label style="color:#6b7280;font-size:11px;display:block;margin-bottom:4px;">Project Type</label><input type="text" id="vob-walkin-project-type" placeholder="Project Type" style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
            <div><label style="color:#6b7280;font-size:11px;display:block;margin-bottom:4px;">Date</label><input type="text" value="${date}" readonly style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;background:#f9fafb;color:#6b7280;"></div>
            <div><label style="color:#6b7280;font-size:11px;display:block;margin-bottom:4px;">Lead Status</label><input type="text" value="Walk-in" readonly style="width:100%;padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;box-sizing:border-box;background:#f9fafb;color:#6b7280;"></div>
          </div>`;
      }

      // ── Section B: Recommendation (read-only) — use iframe result field names ─
      // iframe returns: totalWatts, dailyKwh, maxSurge, invKva, sysV, lithiumPackKwh,
      //                 numPanels, pvWatts, pvBreaker, battBreaker, acBreaker, pvCable, battCable, acCable
      const pvBreaker   = r.pvBreaker;
      const battBreaker = r.battBreaker;
      const acBreaker   = r.acBreaker;
      const pvCable     = r.pvCable;
      const battCable   = r.battCable;
      const acCable     = r.acCable;

      document.getElementById('vob-rec-card').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;font-size:13px;line-height:2;">
          <div><span style="color:#374151;font-size:11px;">Total Running Load</span><br><strong>${N(r.totalWatts)} W</strong></div>
          <div><span style="color:#374151;font-size:11px;">Daily Consumption</span><br><strong>${r.dailyKwh.toFixed(2)} kWh</strong></div>
          <div><span style="color:#374151;font-size:11px;">Peak Surge Load</span><br><strong>${N(r.maxSurge)} W</strong></div>
          <div><span style="color:#374151;font-size:11px;">Recommended Inverter</span><br><strong>${invKva} kVA</strong></div>
          <div><span style="color:#374151;font-size:11px;">System Voltage</span><br><strong>${sysV} V</strong></div>
          <div><span style="color:#374151;font-size:11px;">Recommended Battery</span><br><strong>${batKwh.toFixed(1)} kWh Lithium</strong></div>
          <div><span style="color:#374151;font-size:11px;">Panel Count</span><br><strong>${panels} × 500W panels</strong></div>
          <div><span style="color:#374151;font-size:11px;">Recommended PV Watts</span><br><strong>${N(pvW)} W</strong></div>
          <div><span style="color:#374151;font-size:11px;">PV Breaker</span><br><strong>${pvBreaker}A DC</strong></div>
          <div><span style="color:#374151;font-size:11px;">Battery Breaker</span><br><strong>${battBreaker}A DC</strong></div>
          <div><span style="color:#374151;font-size:11px;">AC Breaker</span><br><strong>${acBreaker}A AC</strong></div>
          <div><span style="color:#374151;font-size:11px;">PV Cable Size</span><br><strong>${pvCable} mm²</strong></div>
          <div><span style="color:#374151;font-size:11px;">Battery Cable Size</span><br><strong>${battCable} mm²</strong></div>
          <div><span style="color:#374151;font-size:11px;">AC Cable Size</span><br><strong>${acCable} mm²</strong></div>
        </div>`;

      // Store for recalc and PDF
      window._vobMeta = { invKva, sysV, batKwh, batCount, panels, pvW, pvBreaker, battBreaker, acBreaker, pvCable, battCable, acCable };

      // ── Section C defaults — use EG price tables ─────────────────────
      const panelUnitPrice = EG_PANEL_PRICE_500W || 84000;
      const invPrice       = egGetInverterPrice ? egGetInverterPrice(invKva) : invKva * 280000;
      const batUnitPrice   = egGetLithiumPrice  ? egGetLithiumPrice(2.5) : 650000;

      const setV = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      setV('vob-panel-qty',   panels);
      setV('vob-panel-price', panelUnitPrice);
      setV('vob-panel-brand', '');
      setV('vob-inv-qty',     1);
      setV('vob-inv-price',   invPrice);
      setV('vob-inv-brand',   '');
      setV('vob-bat-qty',     batCount);
      setV('vob-bat-price',   batUnitPrice);
      setV('vob-bat-brand',   '');
      setV('vob-bos',         0);
      setV('vob-delivery',    0);
      setV('vob-discount',    0);
      document.getElementById('vob-warranty').value    = '';
      document.getElementById('vob-availability').value= '';
      document.getElementById('vob-note').value        = '';

      vobRecalc();
    }

    function vobGetNum(id) { const el = document.getElementById(id); return el ? (parseFloat(el.value) || 0) : 0; }
    function vobGetStr(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }

    function vobRecalc() {
      if (!vendorIframeResult) return;
      const N = v => Number(v || 0).toLocaleString();
      const meta = window._vobMeta || {};

      const panelQty   = vobGetNum('vob-panel-qty');
      const panelPrice = vobGetNum('vob-panel-price');
      const invQty     = vobGetNum('vob-inv-qty');
      const invPrice   = vobGetNum('vob-inv-price');
      const batQty     = vobGetNum('vob-bat-qty');
      const batPrice   = vobGetNum('vob-bat-price');
      const bos        = vobGetNum('vob-bos');
      const delivery   = vobGetNum('vob-delivery');
      const discount   = vobGetNum('vob-discount');

      const panelLabel = vobGetStr('vob-panel-brand') || 'Solar Panel';
      const invLabel   = vobGetStr('vob-inv-brand')   || 'Inverter';
      const batLabel   = vobGetStr('vob-bat-brand')   || 'Battery';

      const panelTotal = panelQty  * panelPrice;
      const invTotal   = invQty    * invPrice;
      const batTotal   = batQty    * batPrice;
      const subtotal   = panelTotal + invTotal + batTotal + bos + delivery;
      const finalTotal = Math.max(0, subtotal - discount);

      // ── Section D breakdown ────────────────────────────────────────────
      const rows = [
        { label: panelLabel, qty: panelQty, unit: panelPrice, total: panelTotal, discount: false },
        { label: invLabel,   qty: invQty,   unit: invPrice,   total: invTotal,   discount: false },
        { label: batLabel,   qty: batQty,   unit: batPrice,   total: batTotal,   discount: false },
        { label: 'Accessories / BOS', qty: null, unit: null,  total: bos,        discount: false },
        { label: 'Delivery Fee',      qty: null, unit: null,  total: delivery,   discount: false },
        { label: 'Discount',          qty: null, unit: null,  total: discount,   discount: true  },
      ];

      const bdEl = document.getElementById('vob-breakdown');
      if (bdEl) {
        bdEl.innerHTML = rows.map(row => {
          const color = row.discount ? 'color:#ef4444;' : '';
          const sign  = row.discount ? '−' : '';
          const right = (row.qty !== null && row.unit !== null)
            ? `₦${N(row.unit)} × ${row.qty} = <strong>${sign}₦${N(row.total)}</strong>`
            : `<strong>${sign}₦${N(row.total)}</strong>`;
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;${color}">
            <span>${row.label}</span><span>${right}</span></div>`;
        }).join('');
      }

      // Breaker reference line
      const refEl = document.getElementById('vob-ref-breakers');
      if (refEl && meta.pvBreaker && meta.pvBreaker !== '—') {
        refEl.innerHTML = `PV Breaker: ${meta.pvBreaker}A DC &nbsp;|&nbsp; Battery Breaker: ${meta.battBreaker}A DC &nbsp;|&nbsp; AC Breaker: ${meta.acBreaker}A AC<br>` +
          `PV Cable: ${meta.pvCable}mm² &nbsp;|&nbsp; Battery Cable: ${meta.battCable}mm² &nbsp;|&nbsp; AC Cable: ${meta.acCable}mm²`;
      }

      // ── Section E summary ──────────────────────────────────────────────
      const bizName  = (currentUser && (currentUser.company_name || currentUser.business_name || currentUser.full_name)) || 'Your Business';
      const vendName = (currentUser && currentUser.full_name) || '';
      const phone    = (currentUser && currentUser.phone) || '';
      const state    = (currentUser && currentUser.state) || '';

      const sumEl = document.getElementById('vob-summary');
      if (sumEl) {
        sumEl.innerHTML = `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;">
              <span>Subtotal</span><span>₦${N(subtotal)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px;color:#ef4444;">
              <span>Discount</span><span>− ₦${N(discount)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;border-top:1px solid #bbf7d0;padding-top:10px;">
              <span>Final Vendor Offer</span><span style="color:#16a34a;">₦${N(finalTotal)}</span>
            </div>
          </div>
          <div style="font-size:13px;line-height:1.9;color:#374151;">
            <strong>${bizName}</strong><br>
            ${vendName ? vendName + '<br>' : ''}
            ${phone ? '📞 ' + phone + '<br>' : ''}
            ${state ? '📍 ' + state : ''}
          </div>`;
      }

      // Cache result
      window._vobResult = {
        panelLabel, panelQty, panelPrice, panelTotal,
        invLabel, invQty, invPrice, invTotal,
        batLabel, batQty, batPrice, batTotal,
        bos, delivery, discount, subtotal, finalTotal,
        warranty:     vobGetStr('vob-warranty'),
        availability: vobGetStr('vob-availability'),
        note:         vobGetStr('vob-note'),
        bizName, vendName, phone, state, meta
      };
    }

    function getVobSnapshot() {
      const lead = (typeof vobAttachedLead !== 'undefined') ? vobAttachedLead : null;
      return {
        name:        (lead && lead.full_name)     || 'Walk-in customer',
        phone:       (lead && lead.phone)         || '—',
        state:       (lead && lead.state)         || '—',
        city:        (lead && lead.city)          || '—',
        projectType: (lead && lead.project_type)  || '—',
        leadStatus:  (lead && lead.status)        || 'Walk-in',
      };
    }

        function vobDownloadPDF() {
      if (!vendorIframeResult || !window._vobResult) { showToast('Please calculate first.', 'error'); return; }
      const jsPDFLib = (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF)
                     || (typeof window.jsPDF !== 'undefined' && window.jsPDF);
      if (!jsPDFLib) { showToast('PDF library not available in this app.', 'error'); return; }
      try {
        const doc = new jsPDFLib();
        const r   = vendorIframeResult;
        const q   = window._vobResult;
        const meta= q.meta || {};
        const N   = v => Number(v || 0).toLocaleString();
        const date= new Date().toLocaleDateString('en-NG');
        let y = 18;
        const L = (txt, x, yy, opts) => doc.text(String(txt), x, yy, opts || {});
        const line = () => { doc.setDrawColor(220,220,220); doc.line(15, y, 195, y); y += 5; };

        doc.setFontSize(17); doc.setFont('helvetica','bold');
        L('SOLAR PRODUCT OFFER', 105, y, {align:'center'}); y += 8;
        doc.setFontSize(10); doc.setFont('helvetica','normal');
        L(q.bizName, 105, y, {align:'center'}); y += 5;
        if (q.phone) { L('Tel: ' + q.phone, 105, y, {align:'center'}); y += 5; }
        if (q.state) { L('Location: ' + q.state, 105, y, {align:'center'}); y += 5; }
        L('Date: ' + date, 105, y, {align:'center'}); y += 8;
        line();

        doc.setFont('helvetica','bold'); doc.setFontSize(11);
        L('A — CUSTOMER / REQUEST SNAPSHOT', 15, y); y += 7;
        doc.setFont('helvetica','normal'); doc.setFontSize(10);
        const snap = getVobSnapshot();
        L('Customer: ' + snap.name, 20, y); y += 5;
        L('Phone: '   + snap.phone, 20, y); y += 5;
        L('State: '   + snap.state + '   City: ' + snap.city, 20, y); y += 5;
        L('Project Type: ' + snap.projectType + '   Status: ' + snap.leadStatus, 20, y); y += 8;
        line();

        doc.setFont('helvetica','bold'); doc.setFontSize(11);
        L('B — ENERGY GUIDE RECOMMENDATION', 15, y); y += 7;
        doc.setFont('helvetica','normal'); doc.setFontSize(10);
        L('Inverter: ' + q.meta.invKva + 'kVA  |  System Voltage: ' + q.meta.sysV + 'V  |  Panels: ' + q.meta.panels + ' panels (' + N(q.meta.pvW) + 'W)', 20, y); y += 5;
        L('Battery: ' + q.meta.batKwh + 'kWh Lithium  |  Daily Energy: ' + ((r.dailyKwh * 1000)/1000).toFixed(2) + 'kWh', 20, y); y += 5;
        if (meta.pvBreaker && meta.pvBreaker !== '—') {
          L('Breakers (ref): PV ' + meta.pvBreaker + 'A DC | Batt ' + meta.battBreaker + 'A DC | AC ' + meta.acBreaker + 'A AC', 20, y); y += 5;
          L('Cables (ref): PV ' + meta.pvCable + 'mm² | Batt ' + meta.battCable + 'mm² | AC ' + meta.acCable + 'mm²', 20, y); y += 5;
        }
        y += 3; line();

        doc.setFont('helvetica','bold'); doc.setFontSize(11);
        L('C/D — VENDOR PRODUCT OFFER & BREAKDOWN', 15, y); y += 7;
        doc.setFont('helvetica','normal'); doc.setFontSize(10);
        const dRows = [
          [q.panelLabel, q.panelQty + ' x N' + N(q.panelPrice), 'N' + N(q.panelTotal)],
          [q.invLabel,   q.invQty   + ' x N' + N(q.invPrice),   'N' + N(q.invTotal)],
          [q.batLabel,   q.batQty   + ' x N' + N(q.batPrice),   'N' + N(q.batTotal)],
          ['Accessories/BOS', '', 'N' + N(q.bos)],
          ['Delivery Fee',    '', 'N' + N(q.delivery)],
          ['Discount',        '', '- N' + N(q.discount)],
        ];
        dRows.forEach(([label, mid, right]) => {
          L(label, 20, y); if (mid) L(mid, 90, y); L(right, 190, y, {align:'right'}); y += 5;
        });
        y += 3; line();

        doc.setFont('helvetica','bold'); doc.setFontSize(12);
        L('FINAL VENDOR OFFER TOTAL', 20, y);
        L('N' + N(q.finalTotal), 190, y, {align:'right'}); y += 10;

        doc.setFont('helvetica','normal'); doc.setFontSize(10);
        if (q.warranty)     { L('Warranty: '     + q.warranty,     20, y); y += 5; }
        if (q.availability) { L('Availability: ' + q.availability, 20, y); y += 5; }
        if (q.note)         { L('Note: '         + q.note,         20, y); y += 5; }
        y += 4;

        doc.setFont('helvetica','italic'); doc.setFontSize(9);
        L('Product availability, compatibility, and final pricing are subject to confirmation.', 15, y); y += 5;
        L('Recommendation by Energy Guide', 15, y);

        egSavePdf(doc, 'VendorOffer_' + q.bizName.replace(/\s+/g,'_') + '_' + Date.now() + '.pdf');
        showToast('PDF downloaded!', 'success');
      } catch(e) {
        console.error('VOB PDF error:', e);
        showToast('PDF failed: ' + e.message, 'error');
      }
    }

    function vobShareWhatsApp() {
      if (!vendorIframeResult || !window._vobResult) { showToast('Please calculate first.', 'error'); return; }
      const q = window._vobResult;
      const N = egFormatNumber;
      const snap = getVobSnapshot();
      const msg = egJoinLines([
        '📦 *SOLAR PRODUCT OFFER*',
        '*' + q.bizName + '*',
        q.phone ? '📞 ' + q.phone : null,
        q.state ? '📍 ' + q.state : null,
        snap.name ? '👤 Customer: ' + snap.name : null,
        snap.phone && snap.phone !== 'Not provided' ? '📞 Customer Phone: ' + snap.phone : null,
        (snap.state && snap.state !== '—') || (snap.city && snap.city !== '—') ? '📍 Customer Location: ' + snap.state + (snap.city && snap.city !== '—' ? ', ' + snap.city : '') : null,
        snap.projectType && snap.projectType !== '—' ? '🏗️ Project Type: ' + snap.projectType : null,
        '',
        '⚙️ *Products*',
        '• ' + q.panelLabel + ': ' + q.panelQty + ' units — ₦' + N(q.panelTotal),
        '• ' + q.invLabel   + ': ' + q.invQty   + ' unit — ₦'  + N(q.invTotal),
        '• ' + q.batLabel   + ': ' + q.batQty   + ' units — ₦' + N(q.batTotal),
        q.bos      ? '• Accessories/BOS: ₦' + N(q.bos)      : null,
        q.delivery ? '• Delivery: ₦'        + N(q.delivery) : null,
        q.discount ? '• Discount: − ₦'      + N(q.discount) : null,
        '',
        '*Final Vendor Offer: ₦' + N(q.finalTotal) + '*',
        q.warranty     ? '🛡 Warranty: '     + q.warranty     : null,
        q.availability ? '📦 Availability: ' + q.availability : null,
        q.note         ? '📝 '               + q.note         : null,
        '',
        '_Product availability and pricing subject to confirmation._',
        '_Recommendation by Energy Guide_',
      ]);
      egOpenWhatsApp(msg);
    }


