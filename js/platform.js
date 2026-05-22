// EG-VERSION: v304-fix
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
        "cipState","cipServiceState","cvpState",
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

      // Profile completeness check runs for ALL portal users (Google OAuth and email alike).
      // Email signups always have phone/state/city from the registration form so they
      // pass through immediately. Google OAuth users who skipped the form are forced to
      // complete their profile BEFORE reaching pending-review — so you see real details.
      if (role === 'installer') {
        const instStatus = currentUser.installer_status || currentUser.status;
        if (!isInstallerProfileComplete(currentUser)) {
          // Missing core fields — force profile completion form first
          prefillCompleteInstallerProfile(currentUser);
          showScreen('complete-installer-profile');
        } else if (instStatus === 'rejected') {
          showScreen('application-rejected');
        } else {
          // Pending OR approved — both go straight to dashboard.
          // Pending installers have full dashboard access but won't appear
          // in marketplace search results until approved.
          showScreen('installer-dashboard');
          // Show pending banner only if not yet approved
          const _instBanner = document.getElementById('installerPendingBanner');
          if (_instBanner) {
            const _s = currentUser.installer_status || currentUser.status;
            _instBanner.style.display = (_s === 'pending' || !_s) ? 'block' : 'none';
          }
        }
      } else if (role === 'vendor') {
        const vendStatus = currentUser.vendor_status || currentUser.status;
        if (!isVendorProfileComplete(currentUser)) {
          // Missing core fields — force profile completion form first
          prefillCompleteVendorProfile(currentUser);
          showScreen('complete-vendor-profile');
        } else if (vendStatus === 'rejected') {
          showScreen('application-rejected');
        } else {
          // Pending OR approved — both go straight to dashboard.
          // Pending vendors have full dashboard access but won't appear
          // in marketplace search results until approved.
          showScreen('vendor-dashboard');
          // Show pending banner only if not yet approved
          const _vendBanner = document.getElementById('vendorPendingBanner');
          if (_vendBanner) {
            const _vs = currentUser.vendor_status || currentUser.status;
            _vendBanner.style.display = (_vs === 'pending' || !_vs) ? 'block' : 'none';
          }
        }
      } else {
        // role === 'user' safety fallback
        if (typeof updateUserAccountUI === 'function') updateUserAccountUI();
        if (typeof isSignedInEndUser === 'function' && isSignedInEndUser()) {
          if (typeof egShowUserDashboard === 'function') { egShowUserDashboard(); }
        } else {
          showScreen('user-calculator');
        }
      }
    }

    function prefillCompleteInstallerProfile(p) {
      if (!p) return;
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
      set('cipFullName',    p.full_name || p.company_name || '');
      set('cipBusiness',    p.business_name || p.company_name || '');
      set('cipPhone',       p.phone || '');
      set('cipState',       p.state || '');
      set('cipCity',        p.city || '');
      set('cipWhatsapp',    p.whatsapp_number || '');
      set('cipServiceState', p.service_state || p.state || '');
      set('cipServiceCity',  p.service_area || p.city || '');
      set('cipMinKva',      p.min_kva || '');
      set('cipMaxKva',      p.max_kva || '');
      set('cipYears',       p.years_experience || '');
      set('cipMarket',      p.market_type || '');
      set('cipCac',         p.cac_number || '');
      set('cipDesc',        p.business_description || '');
      const cb = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };
      cb('cipLithium', p.battery_lithium);
      cb('cipTubular',  p.battery_tubular);
    }

    function prefillCompleteVendorProfile(p) {
      if (!p) return;
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
      set('cvpFullName',  p.full_name || p.company_name || '');
      set('cvpBusiness',  p.business_name || p.company_name || '');
      set('cvpPhone',     p.phone || '');
      set('cvpState',     p.state || '');
      set('cvpCity',      p.city || '');
      set('cvpWhatsapp',  p.whatsapp_number || '');
      set('cvpDelivery',  p.delivery_coverage || '');
      set('cvpAddress',   p.shop_address || p.address || '');
      set('cvpBrands',    p.brands_carried || '');
      set('cvpCac',       p.cac_number || '');
      set('cvpDesc',      p.business_description || '');
      set('cvpOffersInstall', p.offers_installation || '');
      const cb = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };
      cb('cvpPanels',    p.product_panels);
      cb('cvpInverters', p.product_inverters);
      cb('cvpLithium',   p.product_lithium);
      cb('cvpTubular',   p.product_tubular);
      cb('cvpAccessories', p.product_accessories);
    }

    async function saveCompleteInstallerProfile() {
      const display_name   = document.getElementById('cipFullName').value.trim();
      const business       = document.getElementById('cipBusiness').value.trim();
      const phone          = document.getElementById('cipPhone').value.trim();
      const state          = document.getElementById('cipState').value;
      const city           = document.getElementById('cipCity').value.trim();
      const whatsapp       = document.getElementById('cipWhatsapp')?.value.trim() || '';
      const service_state  = document.getElementById('cipServiceState')?.value || '';
      const service_city   = document.getElementById('cipServiceCity')?.value.trim() || '';
      const min_kva        = document.getElementById('cipMinKva')?.value || '';
      const max_kva        = document.getElementById('cipMaxKva')?.value || '';
      const years          = document.getElementById('cipYears')?.value || '';
      const market         = document.getElementById('cipMarket')?.value || '';
      const lithium        = document.getElementById('cipLithium')?.checked || false;
      const tubular        = document.getElementById('cipTubular')?.checked || false;
      const cac_number     = document.getElementById('cipCac')?.value.trim() || '';
      const description    = document.getElementById('cipDesc')?.value.trim() || '';
      const cacDocFile     = document.getElementById('cipCacDoc')?.files?.[0] || null;

      // Clear previous errors — only required fields
      ['cipFullName','cipBusiness','cipPhone','cipState','cipCity'].forEach(id => {
        const err = document.getElementById(id + 'Error');
        if (err) err.textContent = '';
      });

      // Only name, business, phone, state, city are required
      // All other fields (experience, market, battery, CAC, description) are optional
      let hasError = false;
      if (!display_name) { document.getElementById('cipFullNameError').textContent = 'Required'; hasError = true; }
      if (!business)     { document.getElementById('cipBusinessError').textContent = 'Required'; hasError = true; }
      if (!phone)        { document.getElementById('cipPhoneError').textContent = 'Required'; hasError = true; }
      if (!state)        { document.getElementById('cipStateError').textContent = 'Required'; hasError = true; }
      if (!city)         { document.getElementById('cipCityError').textContent = 'Required'; hasError = true; }
      if (hasError) return;

      showLoading(true, 'Saving profile...');
      try {
        // Upload CAC doc if provided — skip silently if no file or storage unavailable
        let cac_doc_url = null;
        if (cacDocFile && supabaseClient.storage) {
          try {
            const ext = cacDocFile.name.split('.').pop();
            const path = currentUser.id + '/cac-installer.' + ext;
            const { data: upData, error: upErr } = await supabaseClient.storage
              .from('profile-docs').upload(path, cacDocFile, { upsert: true });
            if (!upErr && upData) {
              const { data: urlData } = supabaseClient.storage.from('profile-docs').getPublicUrl(path);
              cac_doc_url = urlData?.publicUrl || null;
            }
            const statusEl = document.getElementById('cipCacDocStatus');
            if (statusEl) statusEl.textContent = upErr ? 'Document upload failed (profile saved without it)' : '✅ Document uploaded';
          } catch(uploadErr) {
            console.warn('CAC upload failed, continuing without it:', uploadErr);
          }
        }

        // Build payload — only include cac_doc_url if we actually got one
        const payload = {
          id: currentUser.id,
          full_name: display_name,
          company_name: business || display_name,
          business_name: business,
          phone,
          ...(whatsapp ? { whatsapp_number: whatsapp } : {}),
          state, city,
          ...(service_city ? { service_area: service_city } : { service_area: city }),
          ...(service_state ? { service_state } : {}),
          ...(min_kva ? { min_kva: parseFloat(min_kva) } : {}),
          ...(max_kva ? { max_kva: parseFloat(max_kva) } : {}),
          ...(years ? { years_experience: years } : {}),
          ...(market ? { market_type: market } : {}),
          battery_lithium: lithium,
          battery_tubular: tubular,
          ...(cac_number ? { cac_number } : {}),
          ...(cac_doc_url ? { cac_doc_url } : {}),
          ...(description ? { business_description: description } : {}),
          role: 'installer', is_installer: true,
          status: 'pending', installer_status: 'pending'
        };

        const { error } = await supabaseClient.from('profiles').upsert([payload], { onConflict: 'id' });
        showLoading(false);
        if (error) throw error;
        currentUser = { ...currentUser, ...payload };
        egSendApplicationNotification('installer', business || display_name, phone, state);
        showToast('Profile saved!', 'success');
        showScreen('installer-dashboard');
      } catch(e) {
        showLoading(false);
        showToast('Failed to save profile: ' + e.message, 'error');
      }
    }

    async function saveCompleteVendorProfile() {
      const display_name    = document.getElementById('cvpFullName').value.trim();
      const business        = document.getElementById('cvpBusiness').value.trim();
      const phone           = document.getElementById('cvpPhone').value.trim();
      const state           = document.getElementById('cvpState').value;
      const city            = document.getElementById('cvpCity').value.trim();
      const whatsapp        = document.getElementById('cvpWhatsapp')?.value.trim() || '';
      const delivery        = document.getElementById('cvpDelivery')?.value.trim() || '';
      const address         = document.getElementById('cvpAddress')?.value.trim() || '';
      const brands          = document.getElementById('cvpBrands')?.value.trim() || '';
      const cac_number      = document.getElementById('cvpCac')?.value.trim() || '';
      const description     = document.getElementById('cvpDesc')?.value.trim() || '';
      const offersInstall   = document.getElementById('cvpOffersInstall')?.value || '';
      const panels          = document.getElementById('cvpPanels')?.checked || false;
      const inverters       = document.getElementById('cvpInverters')?.checked || false;
      const lithium         = document.getElementById('cvpLithium')?.checked || false;
      const tubular         = document.getElementById('cvpTubular')?.checked || false;
      const accessories     = document.getElementById('cvpAccessories')?.checked || false;
      const cacDocFile      = document.getElementById('cvpCacDoc')?.files?.[0] || null;

      // Clear previous errors — only required fields
      ['cvpFullName','cvpBusiness','cvpPhone','cvpState','cvpCity'].forEach(id => {
        const err = document.getElementById(id + 'Error');
        if (err) err.textContent = '';
      });

      // Only name, business, phone, state, city are required
      // Delivery, products, CAC, description are all optional
      let hasError = false;
      if (!display_name) { document.getElementById('cvpFullNameError').textContent = 'Required'; hasError = true; }
      if (!business)     { document.getElementById('cvpBusinessError').textContent = 'Required'; hasError = true; }
      if (!phone)        { document.getElementById('cvpPhoneError').textContent = 'Required'; hasError = true; }
      if (!state)        { document.getElementById('cvpStateError').textContent = 'Required'; hasError = true; }
      if (!city)         { document.getElementById('cvpCityError').textContent = 'Required'; hasError = true; }
      if (hasError) return;

      showLoading(true, 'Saving profile...');
      try {
        // Upload CAC doc if provided — skip silently if no file or storage unavailable
        let cac_doc_url = null;
        if (cacDocFile && supabaseClient.storage) {
          try {
            const ext = cacDocFile.name.split('.').pop();
            const path = currentUser.id + '/cac-vendor.' + ext;
            const { data: upData, error: upErr } = await supabaseClient.storage
              .from('profile-docs').upload(path, cacDocFile, { upsert: true });
            if (!upErr && upData) {
              const { data: urlData } = supabaseClient.storage.from('profile-docs').getPublicUrl(path);
              cac_doc_url = urlData?.publicUrl || null;
            }
            const statusEl = document.getElementById('cvpCacDocStatus');
            if (statusEl) statusEl.textContent = upErr ? 'Document upload failed (profile saved without it)' : '✅ Document uploaded';
          } catch(uploadErr) {
            console.warn('CAC upload failed, continuing without it:', uploadErr);
          }
        }

        // Build payload — only include optional fields when they have values
        const payload = {
          id: currentUser.id,
          full_name: display_name,
          company_name: business || display_name,
          business_name: business,
          phone,
          ...(whatsapp ? { whatsapp_number: whatsapp } : {}),
          state, city,
          ...(delivery ? { delivery_coverage: delivery } : {}),
          ...(address ? { shop_address: address } : {}),
          ...(brands ? { brands_carried: brands } : {}),
          ...(cac_number ? { cac_number } : {}),
          ...(cac_doc_url ? { cac_doc_url } : {}),
          ...(description ? { business_description: description } : {}),
          ...(offersInstall ? { offers_installation: offersInstall } : {}),
          product_panels: panels,
          product_inverters: inverters,
          product_lithium: lithium,
          product_tubular: tubular,
          product_accessories: accessories,
          role: 'vendor', is_vendor: true,
          status: 'pending', vendor_status: 'pending'
        };

        const { error } = await supabaseClient.from('profiles').upsert([payload], { onConflict: 'id' });
        showLoading(false);
        if (error) throw error;
        currentUser = { ...currentUser, ...payload };
        egSendApplicationNotification('vendor', business || display_name, phone, state);
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
        // Preserve existing status — only set pending if not yet set
        if (!currentUser.status) clean.status = 'pending';

        const { error } = await supabaseClient.from('profiles').upsert([clean], { onConflict: 'id' });
        showLoading(false);
        if (error) throw error;

        currentUser = { ...currentUser, ...clean };
        // If first time submitting full profile, show pending screen
        if (!currentUser.status || currentUser.status === 'pending') {
          egSendApplicationNotification('installer', clean.company_name || currentUser.company_name, clean.phone || currentUser.phone, clean.state || currentUser.state);
          if (!currentUser._profileAlreadySubmitted) {
            currentUser._profileAlreadySubmitted = true;
          }
        }
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
        if (!currentUser.status) clean.status = 'pending';

        const { error } = await supabaseClient.from('profiles').upsert([clean], { onConflict: 'id' });
        showLoading(false);
        if (error) throw error;

        currentUser = { ...currentUser, ...clean };
        if (!currentUser.status || currentUser.status === 'pending') {
          egSendApplicationNotification('vendor', clean.company_name || currentUser.company_name, clean.phone || currentUser.phone, clean.state || currentUser.state);
        }
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

    // ── Sync currentUser to monetization layer ──────────────
    function egSyncUser(user) {
      currentUser = user;
      if (typeof egSetMonetizationUser === 'function') egSetMonetizationUser(user);
      if (typeof egRenderAdminBadge     === 'function') egRenderAdminBadge();
      // Show admin menu item if admin
      const adminMenuItem = document.getElementById('egAdminMenuItem');
      if (adminMenuItem) adminMenuItem.style.display = (user && user.is_admin) ? 'flex' : 'none';
    }

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

    // Vendor Portal State
    let vendorCurrentProduct = null;
    let vendorUploadedImage = null;

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
      1: 170000, 1.5: 200000, 2: 230000, 2.5: 270000,
      3: 280000, 3.5: 290000, 5: 400000, 7.5: 700000,
      10: 1200000, 12: 1500000, 15: 2000000, 20: 2800000
    };
    const EG_LITHIUM_PRICES = {
      2.5: 450000, 3: 470000, 5: 900000, 7.5: 1350000,
      10: 1600000, 15: 1800000, 20: 2800000
    };
    const EG_PANEL_PRICE_500W = 120000; // 550W Mono PERC panel

    const EG_AC_BREAKER_PRICES = {16:6000,20:6000,25:6500,32:7000,40:8000,50:9000,63:10000,80:14000,100:18000,125:25000,160:32000};
    const EG_PV_BREAKER_PRICES = {16:10000,20:10000,25:11000,32:12000,40:13000,50:14000,63:14000};
    // DC MCCB (battery breaker) — covers all sizes calc-installer can produce up to 400A
    const EG_BATTERY_BREAKER_PRICES = {63:18000,80:22000,100:27000,125:32000,140:38000,160:44000,200:58000,250:75000,300:95000,400:130000};
    // DC PV cable (single-core TUV solar cable) — per meter, all sizes dcCab can select
    const EG_PV_CABLE_PRICES = {'2.5':1300,4:2800,6:3500,10:6000,16:7800,25:11000,35:13000,50:16000,70:22000,95:30000,120:38000,150:48000};
    // Battery cable (flexible DC — same sizing as PV cable)
    const EG_BATTERY_CABLE_PRICES = {'2.5':1300,4:2800,6:3500,10:6000,16:7800,25:11000,35:13000,50:16000,70:22000,95:30000,120:38000,150:48000};
    // AC cable (single-core PVC) — per meter, all sizes acCab can select
    const EG_AC_CABLE_PRICES = {'2.5':1800,4:2800,6:3500,10:6000,16:7800,25:11000,35:13000,50:16000};
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

    // ── PARALLEL BATTERY STRING HELPER ────────────────────────────────────
    // Called by all three calc iframes and platform display code.
    // Returns the number of parallel strings needed, the cable size per string,
    // and the correct per-string breaker rating when a single 150mm² cable
    // (rated 285A) is insufficient for the battery current.
    function egBattParallel(maxBattA) {
      const SINGLE_MAX_A = 285; // 150mm² ampacity
      const CABLE_SIZE   = 150;
      const MCCB_LIST    = [63,80,100,125,140,160,200,250,300,400];
      const numStrings   = Math.max(1, Math.ceil(maxBattA / SINGLE_MAX_A));
      const perStringA   = maxBattA / numStrings;
      const brkNeed      = perStringA * 1.25;
      const breakerPerString = MCCB_LIST.find(b => b >= brkNeed) || MCCB_LIST[MCCB_LIST.length - 1];
      return { numStrings, cableSize: CABLE_SIZE, breakerPerString };
    }
    window.egBattParallel = egBattParallel;
    // ─────────────────────────────────────────────────────────────────────

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
      const dodLi = 0.8, effInv = 0.85;
      const dailyLoadKwh = dailyWh / 1000;
      const batteryEnergyKwh = dailyLoadKwh / effInv;
      const lithiumNominalKwh = batteryEnergyKwh / dodLi;
      const stepKwh = 2.5;
      const lithiumPackKwh = Math.ceil(lithiumNominalKwh / stepKwh) * stepKwh;
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
      if (maxBatt > 40)  battCable = 16;
      if (maxBatt > 60)  battCable = 25;
      if (maxBatt > 85)  battCable = 35;
      if (maxBatt > 110) battCable = 50;
      if (maxBatt > 140) battCable = 70;
      if (maxBatt > 180) battCable = 95;
      if (maxBatt > 215) battCable = 120;
      if (maxBatt > 249) battCable = 150;
      const battBreaker = pickBreaker(maxBatt * 1.25, BATTERY_BREAKERS, 63);
      const bp = egBattParallel(maxBatt);
      const numBattStrings    = bp.numStrings;
      const battStringBreaker = bp.breakerPerString;
      const battStringCable   = bp.cableSize;
      const acCurrent = (invKva * 1000) / 230;
      let acCable = 2.5;
      if (acCurrent > 20) acCable = 4;
      if (acCurrent > 30) acCable = 6;
      if (acCurrent > 45) acCable = 10;
      if (acCurrent > 63) acCable = 16;
      const acBreaker = pickBreaker(acCurrent * 1.25, AC_BREAKERS, 16);
      const dailyGen = (numPanels * 500 * psh * 0.7) / 1000;
      return { totalWatts, dailyKwh: dailyWh / 1000, maxSurge: peakWatts, invKva, systemVoltage: sysV, sysV, acCurrent, batteryEnergyKwh, lithiumNominalKwh, lithiumPackKwh, pvWatts, panelCount: numPanels, numPanels, dailyGen, pvCable, pvBreaker, battCable, battBreaker, acCable, acBreaker, numBattStrings, battStringBreaker, battStringCable, totalCost:0, appliances: apps };
    }

    // ── CALCULATION EVENT TRACKER ──────────────────────────────
    // Fire-and-forget — never blocks the UI
    async function trackCalculationEvent(portal) {
      try {
        if (!supabaseClient) return;
        const { data: { user } } = await supabaseClient.auth.getUser().catch(() => ({ data: { user: null } }));
        await supabaseClient.from('calculation_events').insert([{
          portal,
          user_id: user ? user.id : null,
          is_guest: !user
        }]);
      } catch (e) {
        // Silent fail — tracking must never break the app
      }
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
      trackCalculationEvent('vendor');
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
      trackCalculationEvent('consumer');
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
        const _batUnits = result.batUnits || 1;
        const _packKwh = _batUnits > 1 ? (result.lithiumPackKwh / _batUnits) : result.lithiumPackKwh;
        const batteryDetail = `${_batUnits} × ${_packKwh.toFixed(1).replace(/\.0$/, '')}kWh @ ${egFormatMoney(result.batteryUnitPrice)}`;
        bodyEl.innerHTML = `
          <tr><td>Solar Panels</td><td>${panelDetail}</td><td>${egFormatMoney(result.panelCost)}</td></tr>
          <tr><td>Hybrid Inverter</td><td>1 × ${result.invKva}kVA</td><td>${egFormatMoney(result.inverterCost)}</td></tr>
          <tr><td>Lithium Battery</td><td>${batteryDetail}</td><td>${egFormatMoney(result.batteryCost)}</td></tr>

        `;
      }
      const refEl = document.getElementById('costReferenceBody');
      if (refEl) {
        const _nbs  = result.numBattStrings || 1;
        const _bsb  = result.battStringBreaker || result.battBreaker;
        const _bsc  = result.battStringCable   || result.battCable;
        const _brkLabel = _nbs > 1 ? `${_nbs}× ${_bsb}A DC MCCB (parallel strings)` : `${_bsb}A DC recommended`;
        const _cabLabel = _nbs > 1 ? `${_nbs}× ${_bsc}mm² (parallel run) @ ${egFormatMoney(result.batteryCablePerMeter)}/m` : `${_bsc}mm² @ ${egFormatMoney(result.batteryCablePerMeter)} per meter`;
        refEl.innerHTML = `
          <tr><td>PV Breaker</td><td>${result.pvBreaker}A DC recommended</td><td>${egFormatMoney(result.pvBreakerPrice)}</td></tr>
          <tr><td>Battery Breaker</td><td>${_brkLabel}</td><td>${egFormatMoney(result.batteryBreakerPrice)}</td></tr>
          <tr><td>AC Breaker</td><td>${result.acBreaker}A AC recommended</td><td>${egFormatMoney(result.acBreakerPrice)}</td></tr>
          <tr><td>PV Cable</td><td>${result.pvCable}mm² @ ${egFormatMoney(result.pvCablePerMeter)} per meter</td><td>${egFormatMoney(result.pvCablePerMeter)}/m</td></tr>
          <tr><td>Battery Cable</td><td>${_cabLabel}</td><td>${egFormatMoney(result.batteryCablePerMeter)}/m</td></tr>
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

      // Block safeTop resets while we scroll results into view.
      // patch-scroll-restore fires up to 400ms after showScreen, so we hold
      // the flag until 480ms then do the scroll at 450ms.
      window._egCalcScrollPending = true;
      setTimeout(function(){
        window._egCalcScrollPending = false;
      }, 480);
      setTimeout(function(){
        var res = document.getElementById('l4u-results');
        if (!res) return;
        var rp = document.querySelector('#user-calculator .right-panel');
        if (rp && rp.scrollHeight > rp.clientHeight) {
          // right-panel is independently scrollable
          rp.scrollTo({ top: res.offsetTop - 16, behavior: 'smooth' });
        } else {
          // page-level scroll (desktop with overflow:hidden container)
          var rect = res.getBoundingClientRect();
          window.scrollTo({ top: window.pageYOffset + rect.top - 80, behavior: 'smooth' });
        }
      }, 450);
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
        container.innerHTML = data.map(p => {
          const product = { type: p.category, spec: (p.payload && p.payload.spec) || {}, power: p.power_watts };
          if (!product.spec.specPower && p.power_watts) product.spec.specPower = String(p.power_watts);
          const specLabel = formatVendorSpecLabel(product);
          const escapedName  = (p.name  || 'Unnamed product').replace(/'/g, "\\'");
          const escapedPrice = Number(p.price || 0);
          return `
          <div style="padding:10px 0;border-bottom:1px solid #1e2d42;font-size:13px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div style="flex:1;">
                <div style="font-weight:600;color:#f1f5f9;">${safeText(p.name || 'Unnamed product')}</div>
                <div style="color:#6b7280;font-size:12px;">${safeText(p.category || '')}${specLabel ? ' · ' + safeText(specLabel) : ''}${p.brand ? ' · ' + safeText(p.brand) : ''}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:12px;">
                <div style="font-weight:700;color:#16a34a;">₦${Number(p.price||0).toLocaleString()}</div>
                <div style="font-size:11px;color:#9ca3af;">Qty: ${p.quantity||'—'}</div>
              </div>
            </div>
            <button onclick="selectVendorProductForOffer('${safeText(vendorId)}','${safeText(p.id)}','${escapedName}',${escapedPrice})"
              style="margin-top:8px;width:100%;padding:8px;background:linear-gradient(135deg,#F59E0B,#D97706);
                     border:none;border-radius:7px;color:white;font-size:12px;font-weight:700;cursor:pointer;">
              Request Offer for this product
            </button>
          </div>`;
        }).join('');
      } catch(e) {
        container.innerHTML = '<div style="font-size:12px;color:#ef4444;">Could not load products.</div>';
      }
    }


    function renderInstallerMarketplaceCards(profiles) {
      return (profiles || []).map(profile => {
        const profileId = safeText(profile.id || Math.random().toString(36).slice(2));
        return `
          <div style="background:#0f1722;border:1px solid #1e2d42;border-radius:12px;padding:16px;margin-bottom:12px;text-align:left;">
            <div style="font-size:11px;color:#7dd3fc;letter-spacing:0.08em;font-weight:700;margin-bottom:4px;">INSTALLER</div>
            <div style="font-size:20px;font-weight:700;color:#f1f5f9;margin-bottom:12px;">${safeText(getInstallerDisplayName(profile))}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;margin-bottom:12px;">
              <div><div style="color:#64748b;font-size:11px;margin-bottom:2px;">Name</div><div style="color:#e2e8f0;font-weight:600;">${safeText(profile.full_name || getInstallerDisplayName(profile))}</div></div>
              <div><div style="color:#64748b;font-size:11px;margin-bottom:2px;">State</div><div style="color:#e2e8f0;font-weight:600;">${safeText(profile.state || 'Not specified')}</div></div>
              <div><div style="color:#64748b;font-size:11px;margin-bottom:2px;">City</div><div style="color:#e2e8f0;font-weight:600;">${safeText(profile.city || profile.service_city || 'Not specified')}</div></div>
              <div><div style="color:#64748b;font-size:11px;margin-bottom:2px;">Experience</div><div style="color:#e2e8f0;font-weight:600;">${safeText(profile.years_experience || 'Not specified')}</div></div>
              <div><div style="color:#64748b;font-size:11px;margin-bottom:2px;">Market Type</div><div style="color:#e2e8f0;font-weight:600;">${safeText(profile.market_type || 'Not specified')}</div></div>
              <div><div style="color:#64748b;font-size:11px;margin-bottom:2px;">Lithium</div><div style="color:#e2e8f0;font-weight:600;">${profile.works_with_lithium ? '✓ Yes' : 'No'}</div></div>
              <div style="grid-column:1/-1;"><div style="color:#64748b;font-size:11px;margin-bottom:2px;">System Size Range</div><div style="color:#e2e8f0;font-weight:600;">${safeText(getInstallerSystemSizeRange(profile))}</div></div>
            </div>
            <div id="installerMarketplaceMore_${profileId}" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid #1e2d42;font-size:13px;color:#cbd5e1;line-height:1.6;">
              <div><strong>Coverage:</strong> ${safeText(profile.service_state || profile.state || 'Not specified')}${profile.service_city ? ' · ' + safeText(profile.service_city) : ''}</div>
              <div style="margin-top:6px;"><strong>About:</strong> ${safeText(profile.business_description || 'No description yet.')}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;">
              <button onclick="toggleMarketplaceProfileDetails('installer','${profileId}')"
                style="padding:10px;background:transparent;border:1.5px solid #334155;border-radius:8px;color:#94a3b8;font-size:13px;font-weight:600;cursor:pointer;">
                View Profile
              </button>
              <button onclick="selectInstallerForQuote('${safeText(profile.id)}')"
                style="padding:10px;background:linear-gradient(135deg,#22C55E,#16A34A);border:none;border-radius:8px;color:white;font-size:13px;font-weight:700;cursor:pointer;">
                Request Quote
              </button>
            </div>
          </div>`;
      }).join('');
    }

    function renderVendorMarketplaceCards(profiles) {
      return (profiles || []).map(profile => {
        const profileId = safeText(profile.id || Math.random().toString(36).slice(2));
        return `
          <div style="background:#0f1722;border:1px solid #1e2d42;border-radius:12px;padding:16px;margin-bottom:12px;text-align:left;">
            <div style="font-size:11px;color:#fbbf24;letter-spacing:0.08em;font-weight:700;margin-bottom:4px;">VENDOR</div>
            <div style="font-size:20px;font-weight:700;color:#f1f5f9;margin-bottom:12px;">${safeText(getVendorDisplayName(profile))}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;margin-bottom:12px;">
              <div><div style="color:#64748b;font-size:11px;margin-bottom:2px;">State</div><div style="color:#e2e8f0;font-weight:600;">${safeText(profile.state || 'Not specified')}</div></div>
              <div><div style="color:#64748b;font-size:11px;margin-bottom:2px;">City</div><div style="color:#e2e8f0;font-weight:600;">${safeText(profile.city || 'Not specified')}</div></div>
              <div><div style="color:#64748b;font-size:11px;margin-bottom:2px;">Products</div><div style="color:#e2e8f0;font-weight:600;">${safeText(getVendorCategories(profile))}</div></div>
              <div><div style="color:#64748b;font-size:11px;margin-bottom:2px;">Delivery</div><div style="color:#e2e8f0;font-weight:600;">${safeText(profile.delivery_coverage || profile.state || 'Not specified')}</div></div>
              <div style="grid-column:1/-1;"><div style="color:#64748b;font-size:11px;margin-bottom:2px;">Brands</div><div style="color:#e2e8f0;font-weight:600;">${safeText(profile.brands_carried || 'Not specified')}</div></div>
            </div>
            <div id="vendorMarketplaceMore_${profileId}" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid #1e2d42;font-size:13px;color:#cbd5e1;line-height:1.6;">
              <div><strong>Offers Installation:</strong> ${safeText(profile.offers_installation || 'Not specified')}</div>
              <div style="margin-top:4px;"><strong>Address:</strong> ${safeText(profile.shop_address || profile.address || 'Not provided')}</div>
              <div style="margin-top:4px;"><strong>About:</strong> ${safeText(profile.business_description || 'No description yet.')}</div>
              <div style="margin-top:10px;">
                <div style="font-weight:700;font-size:12px;color:#fbbf24;margin-bottom:6px;">📦 Products Listed</div>
                <div id="vendorProductsInline_${profileId}"></div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;">
              <button onclick="toggleMarketplaceProfileDetails('vendor','${profileId}')"
                style="padding:10px;background:transparent;border:1.5px solid #334155;border-radius:8px;color:#94a3b8;font-size:13px;font-weight:600;cursor:pointer;">
                View Products
              </button>
              <button onclick="selectVendorForOffer('${safeText(profile.id)}')"
                style="padding:10px;background:linear-gradient(135deg,#F59E0B,#D97706);border:none;border-radius:8px;color:white;font-size:13px;font-weight:700;cursor:pointer;">
                Request Offer
              </button>
            </div>
          </div>`;
      }).join('');
    }


    // EnergyGuide Team fallback card — shown when no installers are onboarded in a state yet
    function egTeamInstallerCard(state) {
      const stateName = state ? state + ' State' : 'Nigeria';
      const waMsg = encodeURIComponent('Hello EnergyGuide Team, I need a solar installation in ' + stateName + '. Please assist.');
      const mailSubject = encodeURIComponent('Solar Installation Request – ' + stateName);
      const mailBody = encodeURIComponent('Hello EnergyGuide Team,\n\nI am interested in a solar installation in ' + stateName + '. Please get in touch with me.\n\nThank you.');
      const waLink = 'https://wa.me/2348142472213?text=' + waMsg;
      const mailLink = 'mailto:energyguideng@outlook.com?subject=' + mailSubject + '&body=' + mailBody;
      return `
        <div class="result-card" style="text-align:left; margin-bottom:14px; border-left:4px solid #22C55E; padding:20px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
            <div style="width:44px; height:44px; background:linear-gradient(135deg,#0a7ea4,#0969a0); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0;">⚡</div>
            <div>
              <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#9ca3af; margin-bottom:2px;">Verified Partner</div>
              <div style="font-size:18px; font-weight:700; color:#f3f4f6; line-height:1.2;">EnergyGuide Installation Team</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
            <span style="background:#0f2a1a; color:#22C55E; font-size:12px; font-weight:600; padding:4px 10px; border-radius:20px; border:1px solid #22C55E;">✓ Available in ${stateName}</span>
          </div>
          <div style="border-top:1px solid #1f2937; padding-top:14px; margin-bottom:14px;">
            <div style="font-size:13px; color:#9ca3af; margin-bottom:10px; line-height:1.6;">
              We are currently onboarding local installers in your state. In the meantime, our team is ready to assist you directly with your solar installation needs.
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px; font-size:14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="width:32px; height:32px; background:#111827; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0;">📞</span>
              <div><div style="color:#9ca3af; font-size:11px; margin-bottom:1px;">Phone / WhatsApp</div><strong style="color:#f3f4f6;">+234 814 247 2213</strong></div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="width:32px; height:32px; background:#111827; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0;">✉️</span>
              <div><div style="color:#9ca3af; font-size:11px; margin-bottom:1px;">Email</div><strong style="color:#f3f4f6;">energyguideng@outlook.com</strong></div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px;">
            <a href="${mailLink}" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;font-size:14px;padding:11px;background:transparent;border:1.5px solid #334155;border-radius:8px;color:#94a3b8;font-weight:600;">✉️ Email Us</a>
            <a href="${waLink}" target="_blank" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;font-size:14px;padding:11px;background:linear-gradient(135deg,#22C55E,#16A34A);border:none;border-radius:8px;color:white;font-weight:700;">💬 WhatsApp</a>
          </div>
        </div>`;
    }

    // EnergyGuide Team fallback for vendors
    function egTeamVendorCard(state) {
      const stateName = state ? state + ' State' : 'Nigeria';
      const waMsg = encodeURIComponent('Hello EnergyGuide Team, I am looking to purchase solar equipment for ' + stateName + '. Please assist.');
      const mailSubject = encodeURIComponent('Solar Equipment Enquiry – ' + stateName);
      const mailBody = encodeURIComponent('Hello EnergyGuide Team,\n\nI am interested in purchasing solar equipment for ' + stateName + '. Please get in touch with me.\n\nThank you.');
      const waLink = 'https://wa.me/2348142472213?text=' + waMsg;
      const mailLink = 'mailto:energyguideng@outlook.com?subject=' + mailSubject + '&body=' + mailBody;
      return `
        <div class="result-card" style="text-align:left; margin-bottom:14px; border-left:4px solid #F59E0B; padding:20px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
            <div style="width:44px; height:44px; background:linear-gradient(135deg,#d97706,#b45309); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0;">🏪</div>
            <div>
              <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#9ca3af; margin-bottom:2px;">Verified Partner</div>
              <div style="font-size:18px; font-weight:700; color:#f3f4f6; line-height:1.2;">EnergyGuide Equipment Team</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
            <span style="background:#3d2a00; color:#F59E0B; font-size:12px; font-weight:600; padding:4px 10px; border-radius:20px; border:1px solid #F59E0B;">✓ Serving ${stateName}</span>
          </div>
          <div style="border-top:1px solid #1f2937; padding-top:14px; margin-bottom:14px;">
            <div style="font-size:13px; color:#9ca3af; margin-bottom:10px; line-height:1.6;">
              We are onboarding local vendors in your state. In the meantime, our team can help you source quality solar equipment and get you the best deals available.
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px; font-size:14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="width:32px; height:32px; background:#111827; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0;">📞</span>
              <div><div style="color:#9ca3af; font-size:11px; margin-bottom:1px;">Phone / WhatsApp</div><strong style="color:#f3f4f6;">+234 814 247 2213</strong></div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="width:32px; height:32px; background:#111827; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0;">✉️</span>
              <div><div style="color:#9ca3af; font-size:11px; margin-bottom:1px;">Email</div><strong style="color:#f3f4f6;">energyguideng@outlook.com</strong></div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px;">
            <a href="${mailLink}" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;font-size:14px;padding:11px;background:transparent;border:1.5px solid #334155;border-radius:8px;color:#94a3b8;font-weight:600;">✉️ Email Us</a>
            <a href="${waLink}" target="_blank" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;font-size:14px;padding:11px;background:linear-gradient(135deg,#F59E0B,#D97706);border:none;border-radius:8px;color:white;font-weight:700;">💬 WhatsApp</a>
          </div>
        </div>`;
    }


    // ================================================================
    // VETTING SYSTEM — Application notifications & admin approval
    // ================================================================

    async function egSendApplicationNotification(role, businessName, phone, state) {
      // Notify EnergyGuide team via email link (opens mail app)
      // In a future version this can be replaced with a Supabase Edge Function email
      try {
        const subject = encodeURIComponent('New ' + (role === 'installer' ? 'Installer' : 'Vendor') + ' Application — ' + (businessName || 'Unknown'));
        const body = encodeURIComponent(
          'A new ' + role + ' has submitted an application on EnergyGuide.\n\n' +
          'Business: ' + (businessName || 'Not provided') + '\n' +
          'Phone: ' + (phone || 'Not provided') + '\n' +
          'State: ' + (state || 'Not provided') + '\n\n' +
          'Log in to Supabase to review and approve:\n' +
          'https://supabase.com/dashboard/project/eixhuvxoolwkwliatmym/editor\n\n' +
          'To approve, run:\n' +
          "UPDATE profiles SET status = 'approved' WHERE phone = '" + (phone || '') + "';\n\n" +
          'EnergyGuide Platform'
        );
        // Store notification locally so admin sees it on next login
        console.log('[EG] New application submitted:', role, businessName, phone, state);
      } catch(e) {
        console.warn('Notification error:', e);
      }
    }

    // Admin: approve a profile directly from the app
    async function egAdminApproveProfile(profileId, role) {
      if (!egIsAdmin()) { showToast('Admin access required', 'error'); return; }
      if (!supabaseClient) { showToast('Supabase not ready', 'error'); return; }
      showLoading(true, 'Approving...');
      // Update the portal-specific status column AND the legacy status field
      const statusUpdate = { status: 'approved' };
      if (role === 'installer') statusUpdate.installer_status = 'approved';
      if (role === 'vendor') statusUpdate.vendor_status = 'approved';
      const { error } = await supabaseClient
        .from('profiles')
        .update(statusUpdate)
        .eq('id', profileId);
      showLoading(false);
      if (error) { showToast('Failed to approve: ' + error.message, 'error'); return; }
      showToast('✅ Application approved! They can now access the platform.', 'success');
      // Reload admin panel if open
      if (typeof egLoadAdminPanel === 'function') egLoadAdminPanel();
    }

    async function egAdminRejectProfile(profileId, role) {
      if (!egIsAdmin()) { showToast('Admin access required', 'error'); return; }
      if (!supabaseClient) { showToast('Supabase not ready', 'error'); return; }
      showLoading(true, 'Rejecting...');
      const { error } = await supabaseClient
        .from('profiles')
        .update(Object.assign({ status: 'rejected' },
          role === 'installer' ? { installer_status: 'rejected' } : {},
          role === 'vendor'    ? { vendor_status: 'rejected' }    : {}
        ))
        .eq('id', profileId);
      showLoading(false);
      if (error) { showToast('Failed to reject: ' + error.message, 'error'); return; }
      showToast('Application rejected.', 'info');
      if (typeof egLoadAdminPanel === 'function') egLoadAdminPanel();
    }

    // ── Admin panel state ────────────────────────────────────────
    let _egAdminTab  = 'pending';   // 'pending' | 'approved' | 'rejected'
    let _egAdminRole = 'all';       // 'all' | 'installer' | 'vendor'

    function egAdminSetTab(tab) {
      _egAdminTab = tab;
      // update tab button styles
      ['pending','approved','rejected'].forEach(t => {
        const btn = document.getElementById('egAdminTab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (!btn) return;
        const active = t === tab;
        const colors = { pending: '#f59e0b', approved: '#22C55E', rejected: '#ef4444' };
        btn.style.background      = active ? colors[t] : 'transparent';
        btn.style.color           = active ? '#fff' : '#94a3b8';
        btn.style.border          = active ? 'none' : '2px solid #243244';
      });
      egLoadAdminPanel();
    }

    function egAdminSetRole(role) {
      _egAdminRole = role;
      ['all','installer','vendor'].forEach(r => {
        const btn = document.getElementById('egAdminRole' + r.charAt(0).toUpperCase() + r.slice(1));
        if (!btn) return;
        const active = r === role;
        const roleColors = { all: '#334155', installer: '#22C55E', vendor: '#f59e0b' };
        btn.style.background = active ? roleColors[r] : 'transparent';
        btn.style.color      = active ? '#fff' : roleColors[r];
        btn.style.border     = active ? 'none' : '2px solid ' + roleColors[r];
      });
      egLoadAdminPanel();
    }

    // Admin panel: load applications by current tab + role filter
    async function egLoadAdminPanel() {
      const el = document.getElementById('egAdminPanelList');
      if (!el) return;
      if (!egIsAdmin()) { el.innerHTML = '<div class="info">Admin access required.</div>'; return; }
      el.innerHTML = '<div class="info">Loading...</div>';

      let query = supabaseClient
        .from('profiles')
        .select('id, company_name, full_name, email, phone, whatsapp_number, state, city, role, status, installer_status, vendor_status, created_at')
        .order('created_at', { ascending: false });

      // Status filter — use the right column per role
      if (_egAdminRole === 'installer') {
        query = query.eq('installer_status', _egAdminTab);
      } else if (_egAdminRole === 'vendor') {
        query = query.eq('vendor_status', _egAdminTab);
      } else {
        // "all" — match rows where either portal status matches
        query = query.eq('status', _egAdminTab);
      }

      // Role filter
      if (_egAdminRole !== 'all') query = query.eq('role', _egAdminRole);

      const { data, error } = await query;

      if (error) {
        el.innerHTML = '<div class="info" style="color:#ef4444;">⚠️ Error loading: ' + escapeHtml(error.message) + '</div>';
        return;
      }
      if (!data || data.length === 0) {
        const emptyMsg = { pending: '✅ No pending applications.', approved: 'No approved profiles yet.', rejected: 'No rejected applications.' };
        const emptyColor = { pending: '#22C55E', approved: '#94a3b8', rejected: '#94a3b8' };
        el.innerHTML = '<div class="info" style="color:' + (emptyColor[_egAdminTab]||'#94a3b8') + ';">' + (emptyMsg[_egAdminTab]||'Nothing here.') + '</div>';
        return;
      }

      el.innerHTML = data.map(p => {
        const name       = escapeHtml(p.company_name || p.full_name || 'Unknown');
        const roleColor  = p.role === 'installer' ? '#22C55E' : '#F59E0B';
        const statusVal  = p.role === 'installer' ? (p.installer_status || p.status) : (p.vendor_status || p.status);
        const statusColor = { pending: '#f59e0b', approved: '#22C55E', rejected: '#ef4444' }[statusVal] || '#94a3b8';
        const date       = p.created_at ? new Date(p.created_at).toLocaleDateString('en-NG') : '';
        const location   = escapeHtml([p.city, p.state].filter(Boolean).join(', ') || 'No location');
        const phone      = escapeHtml(p.phone || 'No phone');
        const whatsapp   = escapeHtml(p.whatsapp_number || p.phone || 'N/A');
        const email      = escapeHtml(p.email || '');

        const _pid  = escapeHtml(p.id);
        const _role = escapeHtml(p.role || '');
        const actionBtns = statusVal === 'approved'
          ? `<button class="btn btn-danger" style="width:100%;" onclick="egAdminRejectProfile('${_pid}','${_role}')">❌ Revoke Access</button>`
          : statusVal === 'rejected'
          ? `<button class="btn btn-success" style="width:100%;" onclick="egAdminApproveProfile('${_pid}','${_role}')">✅ Approve</button>`
          : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
               <button class="btn btn-success" onclick="egAdminApproveProfile('${_pid}','${_role}')">✅ Approve</button>
               <button class="btn btn-danger" onclick="egAdminRejectProfile('${_pid}','${_role}')">❌ Reject</button>
             </div>`;

        return '<div class="result-card" style="text-align:left;margin-bottom:14px;border-left:4px solid ' + roleColor + ';padding:16px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;flex-wrap:wrap;gap:8px;">' +
            '<div>' +
              '<div style="font-size:16px;font-weight:700;color:#f3f4f6;">' + name + '</div>' +
              '<div style="font-size:12px;margin-top:4px;">' +
                '<span style="background:' + roleColor + '22;color:' + roleColor + ';padding:2px 8px;border-radius:10px;font-weight:600;">' + escapeHtml(p.role||'unknown') + '</span>' +
                '&nbsp;' +
                '<span style="background:' + statusColor + '22;color:' + statusColor + ';padding:2px 8px;border-radius:10px;font-weight:600;">' + escapeHtml(statusVal||'') + '</span>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:11px;color:#9ca3af;">' + date + '</div>' +
          '</div>' +
          '<div style="font-size:13px;color:#9ca3af;line-height:2.2;margin-bottom:14px;">' +
            '📞 ' + phone + '<br>' +
            '💬 ' + whatsapp + '<br>' +
            (email ? '✉️ ' + email + '<br>' : '') +
            '📍 ' + location +
          '</div>' +
          actionBtns +
        '</div>';
      }).join('');
    }

    async function loadInstallerMarketplace() {
      const listEl = document.getElementById('installerMarketplaceList');
      const noticeEl = document.getElementById('installerMarketplaceNotice');
      const state = setMarketplaceStateFromContext('installerMarketplaceState');
      if (!listEl) return;
      if (!supabaseClient) {
        listEl.innerHTML = '<div style="color:#94a3b8;font-size:14px;padding:14px;background:#0f1722;border:1px solid #1e2d42;border-radius:8px;text-align:center;">⚠️ Installer marketplace is unavailable right now. Please try again later.</div>';
        return;
      }
      if (!state) {
        if (noticeEl) noticeEl.textContent = 'Please complete your location details first. Select your state to browse nearby installers.';
        listEl.innerHTML = '<div style="color:#94a3b8;font-size:14px;padding:14px;background:#0f1722;border:1px solid #1e2d42;border-radius:8px;text-align:center;">☝️ Select your state above to view installers near you.</div>';
        return;
      }
      listEl.innerHTML = '<div style="color:#94a3b8;font-size:14px;padding:14px;background:#0f1722;border:1px solid #1e2d42;border-radius:8px;text-align:center;">⏳ Loading installers...</div>';
      if (noticeEl) noticeEl.textContent = `Showing installers for ${state}.`;
      try {
        const { data, error } = await supabaseClient.from('profiles').select('*')
          .or('installer_status.eq.approved,and(status.eq.approved,is_installer.eq.true)');
        if (error) throw error;
        const installers = (data || []).filter(profile =>
          (profile.role === 'installer' || profile.is_installer === true) &&
          (profile.installer_status === 'approved' || profile.status === 'approved')
        );
        const filtered = installers.filter(profile => getInstallerStateMatches(profile, state));
        if (filtered.length) {
          // Real installers found in this state — show them
          listEl.innerHTML = renderInstallerMarketplaceCards(filtered);
          return;
        }
        // No installers in this state (whether or not others exist elsewhere)
        // Always show EnergyGuide Team fallback — never spill other states
        if (noticeEl) noticeEl.textContent = `Showing available installer for ${state}.`;
        listEl.innerHTML = egTeamInstallerCard(state);
      } catch (error) {
        console.error('Failed to load installer marketplace:', error);
        listEl.innerHTML = egTeamInstallerCard(state);
      }
    }

    async function loadVendorMarketplace() {
      const listEl = document.getElementById('vendorMarketplaceList');
      const noticeEl = document.getElementById('vendorMarketplaceNotice');
      const state = setMarketplaceStateFromContext('vendorMarketplaceState');
      if (!listEl) return;
      if (!supabaseClient) {
        listEl.innerHTML = '<div style="color:#94a3b8;font-size:14px;padding:14px;background:#0f1722;border:1px solid #1e2d42;border-radius:8px;text-align:center;">⚠️ Vendor marketplace is unavailable right now. Please try again later.</div>';
        return;
      }
      if (!state) {
        if (noticeEl) noticeEl.textContent = 'Please complete your location details first. Select your state to browse vendors.';
        listEl.innerHTML = '<div style="color:#94a3b8;font-size:14px;padding:14px;background:#0f1722;border:1px solid #1e2d42;border-radius:8px;text-align:center;">☝️ Select your state above to view vendors near you.</div>';
        return;
      }
      listEl.innerHTML = '<div style="color:#94a3b8;font-size:14px;padding:14px;background:#0f1722;border:1px solid #1e2d42;border-radius:8px;text-align:center;">⏳ Loading vendors...</div>';
      if (noticeEl) noticeEl.textContent = `Showing vendors for ${state}.`;
      try {
        const { data, error } = await supabaseClient.from('profiles').select('*')
          .or('vendor_status.eq.approved,and(status.eq.approved,is_vendor.eq.true)');
        if (error) throw error;
        const vendors = (data || []).filter(profile =>
          (profile.role === 'vendor' || profile.is_vendor === true) &&
          (profile.vendor_status === 'approved' || profile.status === 'approved')
        );
        const filtered = vendors.filter(profile => getVendorCoverageMatches(profile, state));
        if (filtered.length) {
          // Real vendors found in this state — show them
          listEl.innerHTML = renderVendorMarketplaceCards(filtered);
          return;
        }
        // No vendors in this state — show EnergyGuide Team fallback, never spill other states
        if (noticeEl) noticeEl.textContent = `Showing available vendor for ${state}.`;
        listEl.innerHTML = egTeamVendorCard(state);
      } catch (error) {
        console.error('Failed to load vendor marketplace:', error);
        listEl.innerHTML = egTeamVendorCard(state);
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
      if (!egRequireUserAuth('Create a free account to view installers near you and request a quote.')) return;
      window._egMarketplaceFrom = fromScreen || null;
      openInstallerMarketplace();
    }

    function openVendorMarketplace() {
      selectedVendorId = null;
      selectedVendorProfile = null;
      window._egPreselectedProduct = null;
      setMarketplaceStateFromContext('vendorMarketplaceState');
      showScreen('vendor-marketplace');
      loadVendorMarketplace();
    }

    // Context-aware opener — tracks where we came from for back button
    function egOpenVendorMarketplaceFrom(fromScreen) {
      if (!egRequireUserAuth('Create a free account to browse vendors and get equipment offers.')) return;
      window._egMarketplaceFrom = fromScreen || null;
      openVendorMarketplace();
    }

    // ── Auth gate for user-portal actions ───────────────────────────────
    // Call before any action that requires a registered user.
    // Shows a smooth sign-up prompt and returns false if not logged in.
    // Pass a message describing what they unlock by signing up.
    function egRequireUserAuth(message) {
      if (currentUser && currentUser.id) return true; // logged in — proceed

      // Build the prompt overlay
      const existing = document.getElementById('egAuthGateOverlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'egAuthGateOverlay';
      overlay.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.75);
        display:flex; align-items:center; justify-content:center;
        z-index:9999; padding:24px;
      `;

      overlay.innerHTML = `
        <div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:20px;
                    padding:32px 24px;max-width:360px;width:100%;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🔒</div>
          <h2 style="font-size:20px;font-weight:700;color:#f3f4f6;margin-bottom:8px;">
            Free Account Required
          </h2>
          <p style="font-size:14px;color:#94a3b8;margin-bottom:24px;line-height:1.6;">
            ${message || 'Create a free account to access this feature.'}
          </p>
          <button onclick="document.getElementById('egAuthGateOverlay').remove(); openUserAuthModal('signup');"
            style="width:100%;padding:14px;background:linear-gradient(135deg,#22C55E,#16A34A);
                   border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:700;
                   cursor:pointer;margin-bottom:12px;">
            ✨ Create Free Account
          </button>
          <button onclick="document.getElementById('egAuthGateOverlay').remove(); openUserAuthModal('signin');"
            style="width:100%;padding:12px;background:transparent;border:1px solid #334155;
                   border-radius:12px;color:#94a3b8;font-size:14px;cursor:pointer;margin-bottom:12px;">
            Already have an account? Sign in
          </button>
          <button onclick="document.getElementById('egAuthGateOverlay').remove();"
            style="background:none;border:none;color:#687076;font-size:13px;cursor:pointer;">
            Maybe later
          </button>
        </div>
      `;

      // Close on backdrop click
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.remove();
      });

      document.body.appendChild(overlay);
      return false; // not logged in — action blocked
    }

    // Smart back from marketplace — returns to wherever user came from
    function egMarketplaceBack(type) {
      const from = window._egMarketplaceFrom || null;
      window._egMarketplaceFrom = null;

      if (from === 'welcome') { showScreen('welcome'); return; }
      if (from === 'installer-dashboard') { showScreen('installer-dashboard'); return; }
      if (from === 'vendor-dashboard') { showScreen('vendor-dashboard'); return; }
      if (from === 'user-dashboard') { showScreen('user-dashboard'); return; }
      if (from === 'installer-results') { showScreen('installer-results'); return; }
      if (from === 'vendor-offer-builder') { showScreen('vendor-offer-builder'); return; }
      if (from === 'ci-calculator') { showScreen('ci-calculator'); return; }

      // Default fallbacks by portal role
      if (currentRole === 'installer') { showScreen('installer-dashboard'); return; }
      if (currentRole === 'vendor')    { showScreen('vendor-dashboard'); return; }

      // User portal or unknown — go to dashboard if logged in, calculator if not
      if (isSignedInEndUser()) { if (typeof egShowUserDashboard === 'function') { egShowUserDashboard(); return; } }
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
      window._egPreselectedProduct = null; // no single-product pre-selection
      try {
        const { data } = await supabaseClient.from('profiles').select('*').eq('id', vendorId).maybeSingle();
        if (data) selectedVendorProfile = data;
      } catch (e) { console.warn('Failed to load selected vendor profile:', e); }
      const marketplaceState = document.getElementById('vendorMarketplaceState');
      const leadState = document.getElementById('leadState');
      if (marketplaceState && leadState && marketplaceState.value) leadState.value = marketplaceState.value;
      prepareLeadFlow('vendor');
    }

    async function selectVendorProductForOffer(vendorId, productId, productName, productPrice) {
      selectedVendorId = vendorId;
      selectedInstallerId = null;
      selectedInstallerProfile = null;
      window._egPreselectedProduct = { id: productId, name: productName, price: Number(productPrice) };
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

    // ================================================================
    // LEAD FLOW — prepareLeadFlow + submitLead
    // ================================================================

    function prepareLeadFlow(target) {
      currentLeadTarget = target; // 'vendor' | 'installer'

      const isVendor = target === 'vendor';

      // Titles
      const titleEl    = document.getElementById('leadFlowTitle');
      const subtitleEl = document.getElementById('leadFlowSubtitle');
      if (titleEl)    titleEl.textContent    = isVendor ? 'Request a Vendor Offer'  : 'Get Matched Installers';
      if (subtitleEl) subtitleEl.textContent = isVendor
        ? (window._egPreselectedProduct
            ? `Requesting offer for: ${window._egPreselectedProduct.name}`
            : 'Choose the products you want quoted and leave your contact')
        : 'Tell us a few details so we can match you properly';

      // Show/hide installer-only vs vendor-only sections
      const installerFields = document.getElementById('leadInstallerFields');
      const vendorFields    = document.getElementById('leadVendorFields');
      if (installerFields) installerFields.style.display = isVendor ? 'none' : 'block';
      if (vendorFields)    vendorFields.style.display    = isVendor ? 'block' : 'none';

      // Reset project type required validation for vendor flow (field is hidden)
      const ptEl = document.getElementById('leadProjectType');
      if (ptEl) ptEl.value = isVendor ? 'vendor_request' : '';

      // Show selected vendor/installer name summary
      updateLeadSelectionSummary();

      // Load vendor products as checkboxes
      window._egVendorHasNoProducts = false; // reset flag before loading
      if (isVendor && selectedVendorId) {
        egLoadLeadProductCheckboxes(selectedVendorId);
      }

      // Prefill contact info from signed-in user
      if (currentUser) {
        const nameEl  = document.getElementById('leadName');
        const phoneEl = document.getElementById('leadPhone');
        const emailEl = document.getElementById('leadEmail');
        const stateEl = document.getElementById('leadState');
        const cityEl  = document.getElementById('leadCity');
        if (nameEl  && !nameEl.value)  nameEl.value  = currentUser.full_name  || currentUser.name  || '';
        if (phoneEl && !phoneEl.value) phoneEl.value = currentUser.phone  || '';
        if (emailEl && !emailEl.value) emailEl.value = currentUser.email  || '';
        if (stateEl && !stateEl.value && currentUser.state) stateEl.value = currentUser.state;
        if (cityEl  && !cityEl.value)  cityEl.value  = currentUser.city   || '';
      }

      // Clear previous errors
      document.querySelectorAll('#submit-lead .error-message').forEach(e => e.textContent = '');
      document.querySelectorAll('#submit-lead .input-error').forEach(e => e.classList.remove('input-error'));

      showScreen('submit-lead');
    }

    async function egLoadLeadProductCheckboxes(vendorId) {
      const container = document.getElementById('leadVendorProductList');
      if (!container) return;

      // If a specific product was pre-selected (via per-product Request Offer button),
      // show it as a locked selection — no checkbox needed.
      if (window._egPreselectedProduct) {
        const p = window._egPreselectedProduct;
        window._egVendorHasNoProducts = false;
        container.innerHTML = `
          <div style="background:#1a2535;border:1.5px solid #F59E0B;border-radius:10px;padding:12px;">
            <div style="font-size:11px;color:#F59E0B;font-weight:700;margin-bottom:6px;letter-spacing:0.06em;">SELECTED PRODUCT</div>
            <div style="font-weight:600;font-size:14px;color:#f1f5f9;">${safeText(p.name)}</div>
            <div style="font-size:13px;font-weight:700;color:#F59E0B;margin-top:4px;">₦${Number(p.price).toLocaleString()}</div>
          </div>`;
        return;
      }

      container.innerHTML = '<div style="color:#9ca3af;font-size:13px;">Loading products...</div>';
      try {
        const { data, error } = await supabaseClient
          .from('vendor_products')
          .select('*')
          .eq('user_id', vendorId)
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          window._egVendorHasNoProducts = true;
          container.innerHTML = '<div style="background:#1a2535;border:1.5px solid #334155;border-radius:10px;padding:14px;">' +
            '<div style="color:#94a3b8;font-size:13px;font-style:italic;margin-bottom:6px;">No products listed by this vendor yet.</div>' +
            '<div style="color:#f1f5f9;font-size:13px;">Your <strong>sizing snapshot</strong> will be included with this request — the vendor will quote based on your calculated system.</div>' +
            '</div>';
          return;
        }
        window._egVendorHasNoProducts = false;

        container.innerHTML = data.map(p => {
          const product  = { type: p.category, spec: (p.payload && p.payload.spec) || {}, power: p.power_watts };
          if (!product.spec.specPower && p.power_watts) product.spec.specPower = String(p.power_watts);
          const specLabel = formatVendorSpecLabel(product);
          const subtitle  = [p.category, specLabel].filter(Boolean).join(' · ');
          return `
            <label style="display:flex;align-items:flex-start;gap:12px;background:#1a2535;
                          border:1.5px solid #334155;border-radius:10px;padding:12px;cursor:pointer;">
              <input type="checkbox" name="leadProduct" value="${p.id}"
                data-name="${safeText(p.name)}" data-price="${p.price}"
                style="margin-top:3px;width:18px;height:18px;accent-color:#F59E0B;flex-shrink:0;"/>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:14px;color:#f1f5f9;">${safeText(p.name)}</div>
                ${subtitle ? `<div style="font-size:12px;color:#94a3b8;margin-top:2px;">${safeText(subtitle)}</div>` : ''}
                <div style="font-size:13px;font-weight:700;color:#F59E0B;margin-top:4px;">₦${Number(p.price||0).toLocaleString()}</div>
              </div>
            </label>`;
        }).join('');
      } catch(e) {
        container.innerHTML = '<div style="color:#ef4444;font-size:13px;">Could not load products.</div>';
      }
    }

    async function submitLead() {
      const isVendor = currentLeadTarget === 'vendor';

      // Collect values
      const name        = document.getElementById('leadName')?.value.trim()       || '';
      const phone       = document.getElementById('leadPhone')?.value.trim()      || '';
      const email       = document.getElementById('leadEmail')?.value.trim()      || '';
      const state       = document.getElementById('leadState')?.value             || '';
      const city        = document.getElementById('leadCity')?.value.trim()       || '';
      const contact     = document.getElementById('leadContactMethod')?.value     || '';
      const note        = document.getElementById('leadNote')?.value.trim()       || '';
      const snapshot    = document.getElementById('leadSystemSnapshot')?.innerHTML || '';

      // Installer-only
      const projectType = !isVendor ? (document.getElementById('leadProjectType')?.value  || '') : 'vendor_request';
      const budget      = !isVendor ? (document.getElementById('leadBudgetRange')?.value   || '') : '';
      const battery     = !isVendor ? (document.getElementById('leadBatteryPreference')?.value || '') : '';

      // Vendor-only — collect checked products
      let selectedProducts = [];
      if (isVendor) {
        // If a product was pre-selected via per-product Request Offer, use it directly
        if (window._egPreselectedProduct) {
          selectedProducts = [window._egPreselectedProduct];
        } else {
          document.querySelectorAll('input[name="leadProduct"]:checked').forEach(cb => {
            selectedProducts.push({ id: cb.value, name: cb.dataset.name, price: Number(cb.dataset.price) });
          });
        }
      }

      // Validate
      let isValid = true;
      isValid = validateField('leadName',  'leadNameError',  v => v.length >= 2,   'Name required')        && isValid;
      isValid = validateField('leadPhone', 'leadPhoneError', v => v.length >= 7,   'Phone required')       && isValid;
      isValid = validateField('leadEmail', 'leadEmailError', v => isValidEmail(v), 'Valid email required') && isValid;
      isValid = validateField('leadState', 'leadStateError', v => v.length > 0,    'State required')       && isValid;

      if (!isVendor) {
        isValid = validateField('leadProjectType', 'leadProjectTypeError', v => v.length > 0, 'Project type required') && isValid;
      }

      if (isVendor && selectedProducts.length === 0 && !window._egVendorHasNoProducts) {
        const errEl = document.getElementById('leadVendorProductError');
        if (errEl) errEl.textContent = 'Please select at least one product to quote';
        isValid = false;
      } else {
        const errEl = document.getElementById('leadVendorProductError');
        if (errEl) errEl.textContent = '';
      }

      if (!isValid) { showToast('Please fix the errors above', 'error'); return; }

      showLoading(true, 'Submitting...');
      try {
        // Build a human-readable note that includes extra context
        let fullNote = note;
        if (isVendor && selectedProducts.length > 0) {
          const productLines = selectedProducts.map(p => `• ${p.name} — ₦${Number(p.price).toLocaleString()}`).join('\n');
          fullNote = `[Requested products]\n${productLines}${note ? '\n\n' + note : ''}`;
        }
        // Always include sizing snapshot for vendor leads (especially when no products listed)
        const snap = document.getElementById('leadSystemSnapshot')?.innerText || '';
        if (snap && snap !== 'No calculation yet.') {
          fullNote = (fullNote ? fullNote + '\n\n' : '') + '[System sizing]\n' + snap;
        }
        if (!isVendor) {
          // already included above for vendor; for installer just ensure it's there too
        }

        const lead = {
          full_name:          name,
          phone,
          email,
          state,
          city,
          project_type:       isVendor ? 'vendor_request' : projectType,
          budget_range:       isVendor ? null : budget,
          ...(isVendor ? {} : { battery_preference: battery }),
          contact_method:     contact,
          note:               fullNote || null,
          status:             isVendor ? 'vendor_requested' : 'open',
          vendor_quote_type:  isVendor ? (selectedProducts.map(p => p.name).join(', ') || null) : null,
        };

        const result = await supabaseSubmitMarketplaceLead(lead);
        showLoading(false);

        if (result.success) {
          showToast('Request submitted successfully!', 'success');
          showScreen('lead-success');
        } else {
          showToast('Submission failed: ' + (result.error || 'unknown error'), 'error');
        }
      } catch (err) {
        showLoading(false);
        console.error('submitLead error:', err);
        showToast('Submission failed: ' + (err.message || 'unknown error'), 'error');
      }
    }

    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      const icons = { success: '✓', error: '✗', info: 'ℹ', warning: '⚠' };
      toast.innerHTML = `<span style="font-size: 20px;">${icons[type]}</span><span>${message}</span>`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
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
        if (isSignedInEndUser()) {
          egShowUserDashboard();
        } else {
          showScreen('user-calculator');
        }
      } else if (role === 'ci') {
        showScreen('ci-calculator');
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
      if (screenId === 'admin-panel') { if (egIsAdmin()) egLoadAdminPanel(); }
      if (screenId === 'vendor-marketplace') loadVendorMarketplace();
    }
    window.showScreen = showScreen; // expose globally so patch-show-screen.js can wrap it
    
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
          doc.text('Equipment Reference', 20, y); y += 8;
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

    function openInstallerQuoteBuilder() {
      if (!instCalculationResult) { showToast('No calculation result. Please calculate first.', 'error'); return; }
      iqbAttachedLead = null; // Walk-in by default; extend later to pass claimed lead
      populateQuoteBuilder();
      showScreen('installer-quote-builder');
      requestAnimationFrame(() => { forceResetScroll(); setTimeout(forceResetScroll, 40); setTimeout(forceResetScroll, 120); });
    }

    function openInstQuoteAndDownloadPDF() {
      if (!instCalculationResult) { showToast('No calculation result. Please calculate first.', 'error'); return; }
      iqbAttachedLead = null;
      populateQuoteBuilder();
      showScreen('installer-quote-builder');
      requestAnimationFrame(() => {
        forceResetScroll();
        setTimeout(forceResetScroll, 40);
        setTimeout(forceResetScroll, 120);
        setTimeout(downloadQuoteBuilderPDF, 300);
      });
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
          ['Panels', `${q.panelQty} x NGN ${N(q.panelPrice)}`, `NGN ${N(q.panelTotal)}`],
          ['Inverter', '1 unit', `NGN ${N(q.invPrice)}`],
          ['Batteries', `${q.batQty} x NGN ${N(q.batPrice)}`, `NGN ${N(q.batTotal)}`],
          ['PV Cable', `${q.pvLen}m x NGN ${N(q.ppm.pv)}/m`, `NGN ${N(q.pvCableTotal)}`],
          ['Battery Cable', `${q.batLen}m x NGN ${N(q.ppm.bat)}/m`, `NGN ${N(q.batCableTotal)}`],
          ['AC Cable', `${q.acLen}m x NGN ${N(q.ppm.ac)}/m`, `NGN ${N(q.acCableTotal)}`],
          ['Labour', '', `NGN ${N(q.labour)}`],
          ['Transportation', '', `NGN ${N(q.transport)}`],
          ['Mounting/Accessories', '', `NGN ${N(q.mounting)}`],
        ];
        dRows.forEach(([l,m,v]) => {
          doc.text(l, 25, y); if(m) doc.text(m, 90, y); doc.text(v, 165, y, {align:'right'}); y+=5;
        });
        y+=3;
        doc.text('Discount', 25, y); doc.text(`- NGN ${N(q.discount)}`, 165, y, {align:'right'}); y+=3;
        doc.setFont('helvetica','bold');
        doc.text('FINAL QUOTED TOTAL', 25, y); doc.text(`NGN ${N(q.finalTotal)}`, 165, y, {align:'right'}); y+=10;

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
      const bomLines = (r.bom || []).map(row => '  • ' + row.item + ' (' + row.spec + ')  ×' + row.qty);
      const msg = egJoinLines([
        '☀️ *ENERGY GUIDE — SYSTEM SPECIFICATION*',
        '• Inverter: ' + inv + 'kVA Hybrid MPPT @ ' + (r.systemVoltage||'—') + 'V DC',
        '• Running Load: ' + N(r.totalRunning) + 'W',
        '• Daily Energy: ' + N(r.dailyEnergy) + 'Wh',
        '• Peak Surge: ' + N(r.maxSurge) + 'W',
        '• Solar Panels: ' + r.totalPanels + '× ' + ((r.panel && r.panel.model) || 'Panel'),
        '• Battery Bank: ' + (r.batteryCount || 0) + '× 5kWh ' + (r.batteryType || 'Lithium'),
        r.actualPvPower ? '• Total PV Power: ' + N(r.actualPvPower) + 'W' : '',
        '',
        '*Bill of Quantities*',
      ].concat(bomLines).concat([
        '',
        '_Contact an installer or vendor on Energy Guide for an exact quote._',
        '_Generated by Energy Guide_',
      ]));
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
        const allCalcs = await loadCalculationsFromCloud();
        // Only show installer-role calcs on the installer saved-calculations screen
        const calcs = (allCalcs || []).filter(c => {
          const role = c.role || c.payload?.role || 'installer';
          return role === 'installer';
        });
        if (!calcs || calcs.length === 0) {
          container.innerHTML = '<p style="color: #687076; text-align: center; padding: 40px;">No saved calculations</p>';
          return;
        }
        container.innerHTML = calcs.map(function(calc) {
          var kva   = calc.invKva || null;
          var kw    = calc.requiredInverter ? Math.ceil(calc.requiredInverter / 1000) : null;
          var title = kva ? (kva + 'kVA System') : kw ? (kw + 'kW System') : (calc.title || 'Saved System');
          var panels = calc.numPanels || calc.totalPanels || '--';
          var batKwh = calc.lithiumPackKwh || calc.batteryBankKwh || '--';
          var dateStr = calc.timestamp ? new Date(calc.timestamp).toLocaleString() : '--';
          var cloudId = calc._cloudId || '';
          return '<div class="saved-calc-item">' +
            '<div class="saved-calc-title">' + title + '</div>' +
            '<div style="font-size:12px;color:#6b7280;margin:2px 0 8px;">' + panels + ' panels &middot; ' + batKwh + 'kWh battery</div>' +
            '<div class="saved-calc-date">' + dateStr + '</div>' +
            '<div class="saved-calc-actions">' +
            '<button class="btn btn-secondary small-btn" onclick="loadCalculation(\'' + cloudId + '\')">Load</button>' +
            '<button class="btn btn-danger small-btn" onclick="deleteCalc(\'' + cloudId + '\')">Delete</button>' +
            '</div></div>';
        }).join('');
      } catch (err) {
        console.error('renderSavedCalculations error:', err);
        container.innerHTML = '<p style="color:#ef4444; text-align:center; padding:40px;">Failed to load calculations.</p>';
      }
    }
    
    async function loadCalculation(cloudId) {
      showLoading(true, 'Loading...');
      try {
        // Always fetch fresh so we get latest data
        const calcs = await loadCalculationsFromCloud();
        const calc = calcs.find(c => c._cloudId === cloudId);
        if (!calc) { showLoading(false); showToast('Calculation not found', 'error'); return; }

        instCalculationResult = calc;

        // Field names — calc engine uses invKva/totalWatts/dailyKwh
        // Compatibility fields totalRunning/dailyEnergy/requiredInverter also stored
        const invKva     = calc.invKva    || 0;
        const invKw      = invKva || (calc.requiredInverter ? Math.ceil(calc.requiredInverter / 1000) : 0);
        const running    = calc.totalWatts    || calc.totalRunning  || 0;
        const energy     = calc.dailyKwh
                           ? (calc.dailyKwh * 1000)
                           : (calc.dailyEnergy || 0);
        const surge      = calc.maxSurge  || 0;
        const panels     = calc.numPanels || calc.totalPanels  || 0;
        const pvW        = calc.pvWatts   || calc.actualPvPower || 0;
        const batUnits   = calc.batUnits  || calc.batteryCount || 1;
        const batKwh     = calc.lithiumPackKwh || calc.batteryBankKwh || 5;
        const sysV       = calc.systemVoltage  || calc.sysV || '—';

        const N2 = v => Number(v || 0).toLocaleString();
        const setEl2 = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

        setEl2('instResRunning',  N2(running)  + ' W');
        setEl2('instResEnergy',   N2(energy.toFixed ? energy.toFixed(0) : energy) + ' Wh');
        setEl2('instResSurge',    N2(surge)    + ' W');
        setEl2('instResInverter', invKva ? invKva + ' kVA' : invKw + ' kW');
        setEl2('instTotalCost',   '₦' + N2(calc.totalCost));

        const compEl2 = document.getElementById('instComponents');
        if (compEl2) compEl2.innerHTML =
          '<strong>PV Array:</strong> ' + panels + ' panels = ' + N2(pvW) + 'W<br>' +
          '<strong>Batteries:</strong> ' + batUnits + '× ' + batKwh + 'kWh Lithium (' + sysV + 'V)<br>' +
          '<strong>Controller:</strong> MPPT<br>' +
          '<strong>Inverter:</strong> ' + (invKva ? invKva + 'kVA' : invKw + 'kW');

        currentRole = 'installer';
        showLoading(false);
        showScreen('installer-results');
        showToast('Calculation loaded!', 'success');
      } catch (err) {
        console.error('loadCalculation error:', err);
        showLoading(false);
        showToast('Failed to load calculation', 'error');
      }
    }

    async function deleteCalc(cloudId) {
      if (!cloudId) { showToast('Cannot delete: missing ID', 'error'); return; }
      if (!confirm('Delete this calculation?')) return;
      showLoading(true, 'Deleting...');
      try {
        await deleteCalculationFromCloud(cloudId);
        // Force clear cache so re-fetch is fresh from Supabase
        try { localStorage.removeItem('energyGuide_calculations_cache'); } catch(e) {}
        // Verify deletion actually succeeded
        const remaining = await loadCalculationsFromCloud();
        const stillExists = (remaining || []).some(c => c._cloudId === cloudId);
        showLoading(false);
        if (stillExists) {
          showToast('Delete failed — item still exists. Try logging out and back in, then retry.', 'error');
        } else {
          showToast('Deleted', 'info');
        }
        await renderSavedCalculations();
        updateInstallerDashboard();
      } catch (err) {
        showLoading(false);
        console.error('deleteCalc error:', err);
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
      if (bar) bar.style.display = 'none'; // kept hidden; IDs inside still referenced by old code

      const guestBanner   = document.getElementById('userGuestBanner');
      const calcBackBar   = document.getElementById('userCalcBackBar');
      const guestBackBtn  = document.getElementById('userCalcGuestBackBtn');

      if (isSignedInEndUser()) {
        if (guestBanner)  guestBanner.style.display  = 'none';
        if (calcBackBar)  calcBackBar.style.display   = 'block';
        if (guestBackBtn) guestBackBtn.style.display  = 'none';
      } else {
        if (guestBanner)  guestBanner.style.display  = 'block';
        if (calcBackBar)  calcBackBar.style.display   = 'none';
        if (guestBackBtn) guestBackBtn.style.display  = 'block';
      }
    }

    // ── User Dashboard helper ─────────────────────────────────────────────
    // Populates the greeting name and navigates to the user dashboard screen.
    function egShowUserDashboard() {
      const greetEl = document.getElementById('userDashboardGreetingName');
      if (greetEl && currentUser) {
        const name = currentUser.full_name || currentUser.company_name || currentUser.business_name || currentUser.email || 'there';
        greetEl.textContent = name.split(' ')[0]; // first name only
      }
      showScreen('user-dashboard');
    }

    function switchUserAuthMode(mode) {
      userAuthMode = mode === 'signin' ? 'signin' : 'signup';
      const signupTab = document.getElementById('userAuthTabSignup');
      const signinTab = document.getElementById('userAuthTabSignin');
      const submitBtn = document.getElementById('userAuthSubmitBtn');
      const fullNameGroup = document.getElementById('userAuthFullNameGroup') || document.getElementById('userAuthFullName')?.closest('.form-group');
      const forgotLink  = document.getElementById('userAuthForgotLink');

      if (signupTab && signinTab) {
        signupTab.className = userAuthMode === 'signup' ? 'btn btn-primary small-btn' : 'btn btn-outline small-btn';
        signinTab.className = userAuthMode === 'signin' ? 'btn btn-primary small-btn' : 'btn btn-outline small-btn';
      }
      if (submitBtn) submitBtn.textContent = userAuthMode === 'signup' ? 'Create Free Account' : 'Sign In';
      if (fullNameGroup) fullNameGroup.style.display = userAuthMode === 'signup' ? 'block' : 'none';
      if (forgotLink)   forgotLink.style.display   = userAuthMode === 'signin'  ? 'block' : 'none';
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
        result = await supabaseSignUp(email, password, { role: 'user', full_name: fullName, phone: null, state: null, city: null });
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
        // Show persistent modal — user must tap OK, can't miss it
        const _overlay = document.createElement('div');
        _overlay.id = 'emailConfirmOverlay';
        _overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;';
        _overlay.innerHTML = `
          <div style="background:var(--card,#1a2332);border:1px solid var(--border,#2a3a4a);border-radius:16px;padding:32px 24px;max-width:360px;width:100%;text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">📧</div>
            <h2 style="color:var(--text,#fff);font-size:20px;margin:0 0 12px;">Check Your Email</h2>
            <p style="color:var(--muted,#8899aa);font-size:15px;line-height:1.6;margin:0 0 24px;">
              We sent a confirmation link to your email address.<br><br>
              <strong style="color:var(--text,#fff);">Open your email and tap the confirmation link</strong> to activate your account, then come back here to sign in.
            </p>
            <button onclick="document.getElementById('emailConfirmOverlay').remove()" style="background:var(--sun,#f59e0b);color:#000;border:none;border-radius:8px;padding:14px 32px;font-size:16px;font-weight:700;cursor:pointer;width:100%;">Got it</button>
          </div>`;
        document.body.appendChild(_overlay);
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
      } else {
        // No pending action — take them to their dashboard
        egShowUserDashboard();
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
      if (!egRequireUserAuth('Create a free account to save your system and access it anytime.')) return;
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
      if (!egRequireUserAuth('Create a free account to download your full PDF report.')) return;
      if (!userCalculationResult) { showToast('No system to export', 'error'); return; }
      if (!window.jspdf || !window.jspdf.jsPDF) { showToast('PDF engine not loaded', 'error'); return; }
      showLoading(true, 'Generating PDF...');
      setTimeout(() => {
        try {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          const r = userCalculationResult;
          const N = v => Number(v || 0).toLocaleString('en-NG');
          const kWh = r.lithiumPackKwh ? Number(r.lithiumPackKwh).toFixed(1).replace(/\.0$/,'') : 0;

          // ── Determine source path ─────────────────────────────────────────
          // iframe calc (calc-user.js) populates r.bom fully.
          // platform.js built-in calc leaves r.bom empty but sets flat cable/breaker fields.
          const iframePath = r.bom && r.bom.length > 0;

          // Build BOM for flat-field path only
          let bom = iframePath ? r.bom : [];
          if (!iframePath) {
            const addB = (item, spec, qty) => bom.push({ item, spec, qty });
            addB('Inverter',      (r.invKva||'-') + 'kVA Hybrid MPPT @ ' + (r.sysV||'-') + 'V', 1);
            addB('Battery',       kWh + 'kWh LiFePO4 Pack', 1);
            addB('Solar Panel',   '550W Mono PERC', r.numPanels || 1);
            if (r.pvCable)     addB('PV Cable DC',       r.pvCable   + 'mm2 DC ~20m',  20);
            if (r.battCable)   addB('Battery Cable DC',  r.battCable + 'mm2 DC ~2m',   2);
            if (r.acCable)     addB('AC Cable',          r.acCable   + 'mm2 AC ~20m',  20);
            if (r.pvBreaker)   addB('DC MCB PV',         r.pvBreaker   + 'A DC MCB',   1);
            if (r.battBreaker) addB('DC MCCB Battery',   r.battBreaker + 'A DC MCCB',  1);
            if (r.acBreaker)   addB('AC MCB Changeover', r.acBreaker   + 'A AC MCB',   1);
            if (r.acBreaker)   addB('AC MCB Grid',       r.acBreaker   + 'A AC MCB',   1);
          }

          // ── Header ────────────────────────────────────────────────────────
          doc.setFontSize(22); doc.setTextColor(10, 126, 164);
          doc.text('Energy Guide', 105, 18, { align: 'center' });
          doc.setFontSize(14); doc.setTextColor(0);
          doc.text('System Specification Report', 105, 27, { align: 'center' });
          doc.setFontSize(9); doc.setTextColor(120);
          doc.text(new Date().toLocaleDateString('en-NG', { dateStyle: 'long' }), 105, 34, { align: 'center' });
          doc.setLineWidth(0.5); doc.setDrawColor(10, 126, 164);
          doc.line(14, 38, 196, 38);
          let y = 46;

          // ── Recommended System ────────────────────────────────────────────
          doc.setFontSize(13); doc.setTextColor(10, 126, 164);
          doc.text('Recommended System', 14, y); y += 7;
          doc.setFontSize(10); doc.setTextColor(0);
          doc.text('Inverter:       ' + (r.invKva||'-') + 'kVA Hybrid MPPT @ ' + (r.sysV||'-') + 'V DC', 18, y); y += 6;
          doc.text('Solar Panels:   ' + (r.numPanels||0) + ' x 550W Mono PERC  (' + N((r.numPanels||0)*550) + 'W array)', 18, y); y += 6;
          doc.text('Battery:        ' + kWh + 'kWh LiFePO4 Pack', 18, y); y += 6;
          doc.text('Running Load:   ' + N(r.totalWatts) + 'W', 18, y); y += 6;
          doc.text('Peak Surge:     ' + N(r.maxSurge) + 'W', 18, y); y += 6;
          doc.text('Daily Energy:   ' + Number(r.dailyKwh||0).toFixed(2) + ' kWh/day', 18, y); y += 10;

          // ── Load Analysis ─────────────────────────────────────────────────
          const apps = r.appliances || [];
          if (apps.length) {
            doc.setLineWidth(0.3); doc.setDrawColor(200);
            doc.line(14, y, 196, y); y += 6;
            doc.setFontSize(13); doc.setTextColor(10, 126, 164);
            doc.text('Load Analysis', 14, y); y += 7;
            doc.setFontSize(9); doc.setTextColor(0);
            doc.setFillColor(240,245,255); doc.rect(14, y-4, 182, 6, 'F');
            doc.setFont(undefined,'bold');
            doc.text('Appliance', 18, y); doc.text('Watts', 100, y); doc.text('Hrs/day', 135, y); doc.text('kWh/day', 170, y);
            doc.setFont(undefined,'normal'); y += 2;
            apps.forEach(function(a, i) {
              if (y > 260) { doc.addPage(); y = 20; }
              if (i % 2 === 0) { doc.setFillColor(248,250,252); doc.rect(14, y-3, 182, 6, 'F'); }
              const qty   = Number(a.qty  || a.quantity || 1);
              const watts = Number(a.watts || a.wattage || 0);
              const hrs   = Number(a.hours || a.hrs || 0);
              const kwh   = ((watts * qty * hrs) / 1000);
              const label = (a.name || a.label || 'Appliance') + (qty > 1 ? ' x' + qty : '');
              doc.setTextColor(0);   doc.text(label,              18,  y, { maxWidth: 78 });
              doc.setTextColor(80);  doc.text(N(watts * qty) + 'W', 100, y);
              doc.setTextColor(80);  doc.text(String(hrs) + 'h',   135, y);
              doc.setTextColor(0);   doc.text(kwh.toFixed(2),      170, y);
              y += 6;
            });
            y += 4;
          }

          // ── Cables & Breakers (flat-field path only — iframe BOM has them) ─
          if (!iframePath && (r.pvCable || r.battCable || r.acCable)) {
            doc.setLineWidth(0.3); doc.setDrawColor(200);
            doc.line(14, y, 196, y); y += 6;
            doc.setFontSize(13); doc.setTextColor(10, 126, 164);
            doc.text('Cables & Breakers', 14, y); y += 7;
            doc.setFontSize(10); doc.setTextColor(0);
            const connRows = [
              ['PV -> Inverter (DC)',      r.pvCable   ? r.pvCable   + 'mm2 cable' : '-', r.pvBreaker   ? r.pvBreaker   + 'A MCB'  : '-'],
              ['Battery -> Inverter (DC)', r.battCable ? r.battCable + 'mm2 cable' : '-', r.battBreaker ? r.battBreaker + 'A MCCB' : '-'],
              ['Inverter -> AC Output',    r.acCable   ? r.acCable   + 'mm2 cable' : '-', r.acBreaker   ? r.acBreaker   + 'A MCB'  : '-'],
              ['Grid -> Inverter (AC)',    r.acCable   ? r.acCable   + 'mm2 cable' : '-', r.acBreaker   ? r.acBreaker   + 'A MCB'  : '-'],
            ];
            doc.setFillColor(240,245,255); doc.rect(14, y-4, 182, 6, 'F');
            doc.setFont(undefined,'bold');
            doc.text('Connection', 18, y); doc.text('Cable', 95, y); doc.text('Breaker', 145, y);
            doc.setFont(undefined,'normal'); y += 2;
            connRows.forEach(function(row, i) {
              if (y > 260) { doc.addPage(); y = 20; }
              if (i % 2 === 0) { doc.setFillColor(248,250,252); doc.rect(14, y-3, 182, 6, 'F'); }
              doc.setTextColor(0);  doc.text(row[0], 18,  y, { maxWidth: 72 });
              doc.setTextColor(80); doc.text(row[1], 95,  y, { maxWidth: 45 });
              doc.setTextColor(0);  doc.text(row[2], 145, y, { maxWidth: 45 });
              y += 6;
            });
            y += 4;
          }

          // ── SPD section (flat-field path only) ────────────────────────────
          if (!iframePath) {
            const spdBom = bom.filter(b => b.item && b.item.includes('SPD'));
            if (spdBom.length) {
              doc.setLineWidth(0.3); doc.setDrawColor(200);
              doc.line(14, y, 196, y); y += 6;
              doc.setFontSize(13); doc.setTextColor(10, 126, 164);
              doc.text('Surge Protection (SPD)', 14, y); y += 7;
              doc.setFontSize(10); doc.setTextColor(0);
              spdBom.forEach(function(row) {
                if (y > 260) { doc.addPage(); y = 20; }
                doc.text('* ' + row.item + ': ' + row.spec, 18, y); y += 6;
              });
              y += 2;
            }
          }

          // ── Earthing section (flat-field path only) ───────────────────────
          if (!iframePath) {
            const earthBom = bom.filter(b => b.item && b.item.toLowerCase().includes('earth'));
            if (earthBom.length) {
              doc.setLineWidth(0.3); doc.setDrawColor(200);
              doc.line(14, y, 196, y); y += 6;
              doc.setFontSize(13); doc.setTextColor(10, 126, 164);
              doc.text('Earthing System', 14, y); y += 7;
              doc.setFontSize(10); doc.setTextColor(0);
              earthBom.forEach(function(row) {
                if (y > 260) { doc.addPage(); y = 20; }
                doc.text('* ' + row.item + ' (' + row.spec + ')  x' + row.qty, 18, y); y += 6;
              });
              y += 2;
            }
          }

          // ── Bill of Quantities ────────────────────────────────────────────
          doc.setLineWidth(0.3); doc.setDrawColor(200);
          doc.line(14, y, 196, y); y += 6;
          doc.setFontSize(13); doc.setTextColor(10, 126, 164);
          doc.text('Bill of Quantities', 14, y); y += 7;
          doc.setFontSize(9); doc.setTextColor(0);
          doc.setFillColor(240,245,255); doc.rect(14, y-4, 182, 6, 'F');
          doc.setFont(undefined,'bold');
          doc.text('Item', 18, y); doc.text('Specification', 80, y); doc.text('Qty', 190, y, { align: 'right' });
          doc.setFont(undefined,'normal'); y += 2;
          bom.forEach(function(row, i) {
            if (y > 260) { doc.addPage(); y = 20; }
            if (i % 2 === 0) { doc.setFillColor(248,250,252); doc.rect(14, y-3, 182, 6, 'F'); }
            doc.setTextColor(0);   doc.text(row.item||'',            18,  y, { maxWidth: 58 });
            doc.setTextColor(100); doc.text(row.spec||'',            80,  y, { maxWidth: 100 });
            doc.setTextColor(0);   doc.text(String(row.qty||''),    190,  y, { align: 'right' });
            y += 6;
          });
          y += 4;

          // ── Disclaimer & footer ───────────────────────────────────────────
          doc.setFontSize(8); doc.setTextColor(130);
          const disc = 'Pricing is not included in this report. Contact an installer or vendor through Energy Guide for an exact quote.';
          const dlines = doc.splitTextToSize(disc, 182);
          doc.text(dlines, 14, y);
          doc.setFontSize(8); doc.setTextColor(150);
          doc.text('Generated by Energy Guide Platform  |  energyguide.app', 105, 285, { align: 'center' });

          doc.save('energy-guide-spec-' + Date.now() + '.pdf');
          showLoading(false); showToast('PDF downloaded!', 'success');
        } catch(e) {
          showLoading(false);
          console.error('downloadSystemPDF error:', e);
          showToast('Could not generate PDF: ' + e.message, 'error');
        }
      }, 300);
    }

        function shareSystemWhatsApp() {
      if (!userCalculationResult) { showToast('No system to share', 'error'); return; }
      const r = userCalculationResult;
      const N  = v => Number(v || 0).toLocaleString('en-NG');
      const kWh = r.lithiumPackKwh ? Number(r.lithiumPackKwh).toFixed(1).replace(/\.0$/, '') : '0';
      const bom = r.bom || [];

      // ── Header ───────────────────────────────────────────────────────────
      const lines = [
        '\u2600\ufe0f *ENERGY GUIDE \u2014 SYSTEM SPECIFICATION*',
        '',
        '*\ud83d\udcca System Summary*',
        '\u2022 Inverter: ' + (r.invKva || '-') + 'kVA Hybrid MPPT @ ' + (r.sysV || r.systemVoltage || '-') + 'V DC',
        '\u2022 Solar Panels: ' + (r.numPanels || 0) + ' \u00d7 550W Mono PERC (' + N((r.numPanels||0)*550) + 'W array)',
        '\u2022 Battery: ' + kWh + 'kWh LiFePO4 Pack' + (r.batUnits > 1 ? ' (' + r.batUnits + ' units)' : ''),
        '\u2022 Daily Energy: ' + Number(r.dailyKwh || 0).toFixed(2) + ' kWh/day',
        '\u2022 Running Load: ' + N(r.totalWatts) + 'W  |  Peak Surge: ' + N(r.maxSurge) + 'W',
      ];

      // ── Load Analysis ─────────────────────────────────────────────────────
      const apps = r.appliances || [];
      if (apps.length) {
        lines.push('', '*\ud83d\udcdd Load Analysis*');
        apps.forEach(function(a) {
          const dc = (a.dutyCycle != null && a.dutyCycle < 1) ? ' (' + Math.round(a.dutyCycle * 100) + '% duty)' : '';
          const wh = ((a.watts||0) * (a.qty||1) * (a.hours||0) * (a.dutyCycle != null ? a.dutyCycle : 1)).toFixed(0);
          lines.push('\u2022 ' + (a.qty||1) + '\u00d7 ' + (a.name||'Appliance') + ' \u2014 ' + N(a.watts) + 'W \u00d7 ' + (a.hours||0) + 'h/day' + dc + ' = ' + N(wh) + 'Wh');
        });
        if (r.conflictNote) {
          lines.push('\u26a0\ufe0f Note: ' + r.conflictNote);
        }
      }

      // ── PV Array ──────────────────────────────────────────────────────────
      if (r.pvStrings && r.pvPanelsPerString) {
        lines.push('', '*\u2600\ufe0f PV Array*');
        lines.push('\u2022 Configuration: ' + r.pvStrings + ' string(s) \u00d7 ' + r.pvPanelsPerString + ' panel(s)');
        if (r.pvVoc) lines.push('\u2022 Array Voc: ' + Number(r.pvVoc).toFixed(1) + 'V  |  Isc: ' + Number(r.pvIsc||0).toFixed(1) + 'A');
      }

      // ── Cables & Breakers ─────────────────────────────────────────────────
      const hasFlatConn = r.pvCable || r.battCable || r.acCable;
      if (hasFlatConn) {
        lines.push('', '*\ud83d\udd0c Cables & Breakers*');
        if (r.pvCable)   lines.push('\u2022 PV \u2192 Inverter (DC): ' + r.pvCable + 'mm\u00b2 cable | ' + (r.pvBreaker||'?') + 'A DC MCB');
        if (r.battCable) {
          const bNS = r.numBattStrings || 1;
          const brkA = r.battStringBreaker || r.battBreaker || '?';
          const cabS = r.battStringCable  || r.battCable;
          if (bNS > 1) {
            lines.push('\u2022 Battery \u2192 Inverter (DC): ' + bNS + '\u00d7 ' + cabS + 'mm\u00b2 (parallel) | ' + bNS + '\u00d7 ' + brkA + 'A MCCB');
          } else {
            lines.push('\u2022 Battery \u2192 Inverter (DC): ' + cabS + 'mm\u00b2 cable | ' + brkA + 'A MCCB');
          }
        }
        if (r.acCable)   lines.push('\u2022 Inverter \u2192 Changeover (AC): ' + r.acCable + 'mm\u00b2 cable | ' + (r.acBreaker||'?') + 'A AC MCB');
        lines.push('\u2022 Grid \u2192 Inverter (AC): ' + (r.acCable||'?') + 'mm\u00b2 cable | ' + (r.acBreaker||'?') + 'A AC MCB');
      } else {
        // fall back to BOM cable rows
        const bomCables = bom.filter(b => b.item && (b.item.includes('Cable') || b.item.includes('MCB') || b.item.includes('MCCB')));
        if (bomCables.length) {
          lines.push('', '*\ud83d\udd0c Cables & Breakers*');
          bomCables.forEach(b => lines.push('\u2022 ' + b.item + ': ' + b.spec + ' \u00d7' + b.qty));
        }
      }

      // ── Surge Protection (SPD) ────────────────────────────────────────────
      const spdBom = bom.filter(b => b.item && b.item.includes('SPD'));
      if (spdBom.length) {
        lines.push('', '*\u26a1 Surge Protection (SPD)*');
        spdBom.forEach(s => lines.push('\u2022 ' + s.item + ': ' + s.spec));
      } else if (r.spd) {
        lines.push('', '*\u26a1 Surge Protection (SPD)*');
        if (r.spd.dc) lines.push('\u2022 DC SPD (PV Side): ' + r.spd.dc.uc + 'V DC Type 2 SPD');
        if (r.spd.ac) lines.push('\u2022 AC SPD (Output): ' + r.spd.ac.uc + 'V AC Type 2 SPD');
      }

      // ── Earthing System ───────────────────────────────────────────────────
      const earthBom = bom.filter(b => b.item && b.item.toLowerCase().includes('earth'));
      if (earthBom.length) {
        lines.push('', '*\ud83c\udf0d Earthing System*');
        earthBom.forEach(e => lines.push('\u2022 ' + e.item + ' (' + e.spec + ') \u00d7' + e.qty));
        if (r.earth && r.earth.warn) {
          lines.push('\u26a0\ufe0f High resistivity soil (\u03c1=' + r.earth.rho + '\u03a9\u00b7m) \u2014 ' + r.earth.rods + ' rod(s) achieve ' + Number(r.earth.rn).toFixed(2) + '\u03a9. Consider bentonite/salt-charcoal backfill.');
        }
      } else if (r.earth) {
        lines.push('', '*\ud83c\udf0d Earthing System*');
        lines.push('\u2022 ' + r.earth.rods + ' \u00d7 3m\u00d716mm Copper-Bonded Rod | Achieved: ' + Number(r.earth.rn).toFixed(2) + '\u03a9');
        lines.push('\u2022 Conductor: ' + r.earth.condS + 'mm\u00b2 Bare Copper (~5m/rod)');
        if (r.earth.warn) lines.push('\u26a0\ufe0f Above 5\u03a9 target \u2014 use chemical earthing compound.');
      }

      // ── Full Bill of Quantities ───────────────────────────────────────────
      if (bom.length) {
        lines.push('', '*\ud83d\uddcb Bill of Quantities*');
        bom.forEach(row => lines.push('  \u2022 ' + row.item + ' (' + row.spec + ')  \u00d7' + row.qty));
      }

      lines.push(
        '',
        '_Contact an installer or vendor on Energy Guide for an exact quote._',
        '_Generated by Energy Guide_'
      );

      egOpenWhatsApp(lines.join('\n'));
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
      const M = v => 'NGN ' + Number(v || 0).toLocaleString('en-NG');
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
      }

      const totalCost = d.totalCost || d.total_cost || 0;
      lines.push('', '_Contact a professional through Energy Guide for an exact quote._');

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
            const M = v => 'NGN ' + Number(v || 0).toLocaleString('en-NG');
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
            doc.text('Equipment Reference', 14, y); y += 7;
            doc.setFontSize(10); doc.setTextColor(0);

            if (d.panelCost || d.inverterCost || d.batteryCost) {
              [
                ['Solar Panels',    `${N(d.panelUnitPrice)} x ${panels} panels`, M(d.panelCost)],
                ['Hybrid Inverter', `1 x ${inv}kVA`,                             M(d.inverterCost)],
                ['Lithium Battery', `1 x ${kWh}kWh`,                             M(d.batteryCost)],
              ].forEach(([item, detail, cost]) => {
                doc.text(item, 18, y); doc.text(detail, 80, y); doc.text(cost, 196, y, { align: 'right' }); y += 6;
              });
              y += 2;
            } else {
              doc.text('(Detailed cost breakdown not available for this saved system)', 18, y); y += 8;
            }

            doc.setLineWidth(0.5); doc.setDrawColor(10, 126, 164);
            doc.line(14, y, 196, y); y += 6;
            doc.setFontSize(13); doc.setTextColor(10, 126, 164);
            doc.text('Contact installer for quote', 14, y);
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

      try {
        const userId = await getCurrentAuthUserId();
        const me = String(userId || '');
        const installerState = await getCurrentUserPortalState('installer');

        // Fetch leads with a 12-second race timeout
        const leadsPromise = (async () => {
          let query = supabaseClient
            .from('leads')
            .select('*')
            .in('status', ['installer_requested', 'installer_contacted', 'closed', 'open', 'new']);
          if (installerState) query = query.eq('state', installerState);
          query = query.order('created_at', { ascending: false });
          return query;
        })();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 12000)
        );

        const { data: allLeads, error } = await Promise.race([leadsPromise, timeoutPromise]);

        if (error) throw error;

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
        // Wrapped in its own try/catch — if lead_unlocks table doesn't exist yet, don't crash
        let installerUnlocked = new Set();
        try {
          if (me && supabaseClient) {
            const { data: unlocks } = await supabaseClient
              .from('lead_unlocks').select('lead_id').eq('profile_id', me);
            (unlocks || []).forEach(u => installerUnlocked.add(u.lead_id));
          }
        } catch (unlockErr) {
          console.warn('lead_unlocks fetch failed (table may not exist yet):', unlockErr);
        }
        if (typeof egIsAdmin === 'function' && egIsAdmin()) {
          leads.forEach(l => installerUnlocked.add(l.id));
        }

        // Build the lead cards — each lead in its own try/catch so one bad record
        // doesn't crash the whole list
        const cardHtml = leads.map(lead => {
          try {
        const isUnlocked = installerUnlocked.has(lead.id);
        const isClosed = lead.status === 'closed' || lead.claim_status === 'closed';
        const phone = lead.phone || '';
        const email = lead.email || '';
        const location = [lead.city, lead.state].filter(Boolean).join(', ');
        const totalCost = Number(lead.total_cost || 0);
        const createdDate = formatLeadDate(lead.created_at);
        // Safe encode — strip any characters that break onclick attributes
        const leadEnc = encodeURIComponent(JSON.stringify(lead)).replace(/'/g, '%27');

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
        } else {
          buttons = `
            <button class="btn btn-success small-btn" onclick="openQuoteBuilderFromLead('${leadEnc}')">📋 Build Quote</button>
            <button class="btn btn-outline small-btn" onclick="contactLeadPhone('${phone}')">📞 Call</button>
            <button class="btn btn-outline small-btn" onclick="contactLeadEmail('${email}')">✉️ Email</button>
            `;
        }

        const isMine = String(lead.claimed_by || '') === me;
        return `
        <div class="lead-card" style="${isMine ? 'border-color: #22C55E; border-width: 2px;' : ''}">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;gap:10px;align-items:center;">
            <strong>${lead.full_name || 'Customer'}</strong>
            <span class="lead-status ${badgeClass}">${badgeLabel}</span>
          </div>
          <div style="font-size:13px;color:#687076;margin-bottom:6px;">
            ${phone || 'No phone'}${email ? ' &nbsp;·&nbsp; ' + email : ''}${location ? ' &nbsp;·&nbsp; ' + location : ''}
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
          } catch (cardErr) {
            console.warn('Error rendering lead card:', cardErr, lead);
            return '<div class="lead-card"><p style="color:#ef4444;font-size:13px;">Could not display this lead.</p></div>';
          }
        }).join('');

        container.innerHTML = cardHtml;

      } catch (err) {
        console.error('renderJobLeads error:', err);
        if (err.message === 'timeout') {
          container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:40px;">Loading timed out — check your connection and try again.</p>';
        } else {
          container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:40px;">Failed to load job leads: ' + (err.message || 'unknown error') + '</p>';
        }
      }
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

      const instProfile = result.profile || {};
      const isInstaller = instProfile.role === 'installer' || instProfile.is_installer === true;
      const isVendorOnly = !isInstaller && (instProfile.role === 'vendor' || instProfile.is_vendor === true);

      if (result.success && isInstaller) {
        currentUser = { ...result.user, ...instProfile };
        currentRole = 'installer';
        const displayName = instProfile.business_name || instProfile.company_name || instProfile.full_name || 'Installer';
        const instStatus = instProfile.installer_status || instProfile.status;
        if (instStatus === 'rejected') {
          showToast('Your installer application was not approved. Contact support for more info.', 'error');
        } else {
          showToast('Welcome back, ' + displayName + '!', 'success');
        }
        onLoginSuccess().catch(e => console.warn('onLoginSuccess:', e));
        await routeToPortalWithCheck('installer');
      } else if (result.success && isVendorOnly) {
        // Has vendor account but not installer — offer to add installer role
        showToast('This email has a vendor account. Log into the Vendor Portal, or register here to add installer access.', 'info');
      } else if (result.success && !isInstaller) {
        showToast('No installer account found for this email. Please register first.', 'error');
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
      
      const vendProfile = result.profile || {};
      const isVendor = vendProfile.role === 'vendor' || vendProfile.is_vendor === true;
      const isInstallerOnly = !isVendor && (vendProfile.role === 'installer' || vendProfile.is_installer === true);

      if (result.success && isVendor) {
        currentUser = { ...result.user, ...vendProfile };
        currentRole = 'vendor';
        const displayName = vendProfile.business_name || vendProfile.company_name || vendProfile.full_name || 'Vendor';
        const vendStatus = vendProfile.vendor_status || vendProfile.status;
        if (vendStatus === 'rejected') {
          showToast('Your vendor application was not approved. Contact support for more info.', 'error');
        } else {
          showToast('Welcome back, ' + displayName + '!', 'success');
        }
        onLoginSuccess().catch(e => console.warn('onLoginSuccess:', e));
        await routeToPortalWithCheck('vendor');
      } else if (result.success && isInstallerOnly) {
        // Has installer account but not vendor — offer to add vendor role
        showToast('This email has an installer account. Log into the Installer Portal, or register here to add vendor access.', 'info');
      } else if (result.success && !isVendor) {
        showToast('No vendor account found for this email. Please register first.', 'error');
      } else {
        showToast(result.error || 'Invalid email or password', 'error');
      }
    }
    
    // ── Animated stat counter ────────────────────────────────────
    function egAnimateCount(el, target, duration = 600) {
      if (!el) return;
      const start = parseInt(el.textContent) || 0;
      if (start === target) return;
      const diff = target - start;
      const startTime = performance.now();
      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(start + diff * ease);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // ── Populate greeting name from currentUser ───────────────────
    function egUpdateDashboardGreeting() {
      const name = currentUser?.company_name || currentUser?.full_name || currentUser?.business_name || null;
      if (!name) return;
      // Extract first word/name only
      const firstName = name.split(' ')[0];
      const instEl = document.getElementById('installerGreetingName');
      const vendEl = document.getElementById('vendorGreetingName');
      if (instEl && currentRole === 'installer') instEl.textContent = firstName;
      if (vendEl && currentRole === 'vendor') vendEl.textContent = firstName;
    }

    async function updateInstallerDashboard() {
      // Saved calculations count — only installer-role calcs (matches what the list shows)
      egUpdateDashboardGreeting();
      try {
        const allCalcs = await getSavedCalculationsSafe();
        const installerCalcs = (allCalcs || []).filter(c => {
          const role = c.role || c.payload?.role || 'installer';
          return role === 'installer';
        });
        const savedEl = document.getElementById('savedCalcsCount');
        if (savedEl) egAnimateCount(savedEl, installerCalcs.length);
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
        egAnimateCount(jobEl, visible.length);
      } catch(e) { console.warn('updateInstallerDashboard error', e); }
    }

    async function updateVendorDashboard() {
      egUpdateDashboardGreeting();
      // Product count — pull from cloud
      try {
        const products = await getVendorProductsSafe();
        const countEl = document.getElementById('vendorProductCount');
        if (countEl) egAnimateCount(countEl, products.length);
      } catch(e) {}

      const reqEl = document.getElementById('vendorRequestCount');
      if (reqEl && supabaseClient) {
        try {
          const vendorState = await getCurrentUserPortalState('vendor');
          let query = supabaseClient.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'vendor_requested');
          if (vendorState) query = query.eq('state', vendorState);
          const { count } = await query;
          egAnimateCount(reqEl, count || 0);
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
        const phone      = lead.phone || '';
        const email      = lead.email || '';
        const location   = [lead.address, lead.city, lead.state].filter(Boolean).join(', ');
        const leadEnc    = encodeURIComponent(JSON.stringify(lead));

        // ── Badge ─────────────────────────────────────────────────────────
        let badgeClass, badgeLabel;
        if (lead.status === 'vendor_responded' || lead.status === 'contacted') {
          badgeClass = 'contacted'; badgeLabel = 'Responded';
        } else if (lead.status === 'closed') {
          badgeClass = 'closed'; badgeLabel = 'Closed';
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
          lead.budget_range       ? `Budget: <strong>${lead.budget_range}</strong>` : null,
          lead.timeline           ? `Timeline: <strong>${lead.timeline}</strong>` : null,
        ].filter(Boolean).join(' &nbsp;·&nbsp; ');

        // ── Contact details row ───────────────────────────────────────────
        const contactDetails = [
          phone ? `📞 ${phone}` : null,
          email ? `✉️ ${email}` : null,
        ].filter(Boolean).join(' &nbsp;·&nbsp; ');

        // ── Buttons ───────────────────────────────────────────────────────
        const isClosed = lead.status === 'closed';
        let buttons;
        if (isClosed) {
          buttons = `<span style="font-size:12px;color:#687076;">This request is closed.</span>`;
        } else {
          buttons = `
            <button class="btn btn-warning small-btn" onclick="openOfferBuilderFromLead('${leadEnc}')">📦 Build Offer</button>
            <button class="btn btn-outline small-btn" onclick="contactCustomer('${phone}')">📞 Contact</button>
            ${email ? `<button class="btn btn-outline small-btn" onclick="window.location.href='mailto:${email}'">✉️ Email</button>` : ''}`;
        }

        return `
        <div class="lead-card">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;gap:10px;align-items:center;">
            <strong>${lead.full_name || 'Customer'}</strong>
            <span class="lead-status ${badgeClass}">${badgeLabel}</span>
          </div>
          <div style="font-size:13px;color:#687076;margin-bottom:4px;">
            ${contactDetails || 'No contact info'}
          </div>
          ${location ? `<div style="font-size:13px;color:#687076;margin-bottom:6px;">📍 ${location}</div>` : ''}
          ${snapshot ? `<div style="font-size:12px;color:#374151;margin-bottom:6px;">${snapshot}</div>` : ''}
          ${extras   ? `<div style="font-size:12px;color:#687076;margin-bottom:6px;">${extras}</div>` : ''}
          ${lead.note ? `<div style="font-size:12px;color:#687076;margin-bottom:6px;font-style:italic;">"${lead.note}"</div>` : ''}
          <div style="font-size:11px;color:#9ca3af;margin-bottom:8px;">
            Submitted: ${lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—'}
          </div>
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
    
    // ================================================================
    // DYNAMIC SPEC FIELDS — config per product type
    // ================================================================
    const VENDOR_SPEC_CONFIG = {
      panel: {
        fields: [
          { id: 'specPower', label: 'Wattage', type: 'number', placeholder: '500', units: ['W'], required: false }
        ]
      },
      inverter: {
        fields: [
          { id: 'specPower', label: 'Rating', type: 'number', placeholder: '3.5', units: ['W','kW','kVA'], required: false }
        ]
      },
      battery: {
        fields: [
          { id: 'specCapacity', label: 'Capacity', type: 'number', placeholder: '200', units: ['Ah','kWh'], required: false },
          { id: 'specVoltage',  label: 'Voltage',  type: 'select', options: ['','12V','24V','36V','48V'], required: false }
        ]
      },
      controller: {
        fields: [
          { id: 'specCurrent', label: 'Current (A)', type: 'number', placeholder: '60', units: ['A'], required: false },
          { id: 'specVoltage', label: 'Voltage',     type: 'select', options: ['','12V','24V','36V','48V'], required: false }
        ]
      },
      cable: {
        fields: [
          { id: 'specSize', label: 'Size', type: 'number', placeholder: '6', units: ['mm²','AWG'], required: false }
        ]
      },
      breaker: {
        fields: [
          { id: 'specCurrent', label: 'Current (A)', type: 'number', placeholder: '63', units: ['A'], required: false },
          { id: 'specVoltage', label: 'Voltage (V)', type: 'number', placeholder: '230', units: ['V'], required: false },
          { id: 'specAcDc',    label: 'Type',        type: 'select', options: ['','AC','DC','AC/DC'], required: false }
        ]
      }
    };

    function renderVendorSpecFields(prefill) {
      const type      = document.getElementById('vendorProdType').value;
      const container = document.getElementById('vendorSpecFields');
      if (!container) return;

      const config = VENDOR_SPEC_CONFIG[type];
      if (!config) { container.innerHTML = ''; return; }

      container.innerHTML = config.fields.map(f => {
        const savedVal = prefill ? (prefill[f.id] || '') : '';
        const savedUnit = prefill ? (prefill[f.id + 'Unit'] || '') : '';

        if (f.type === 'select') {
          const opts = f.options.map(o =>
            `<option value="${o}" ${o === savedVal ? 'selected' : ''}>${o || 'Select...'}</option>`
          ).join('');
          return `
            <div class="form-group">
              <label>${f.label}</label>
              <select id="${f.id}">${opts}</select>
            </div>`;
        }

        // number field — with optional unit selector
        const unitSelector = f.units && f.units.length > 1
          ? `<select id="${f.id}Unit" style="width:80px;padding:10px 6px;border-radius:0 8px 8px 0;border:1.5px solid #334155;border-left:none;background:#1a2535;color:#f1f5f9;font-size:14px;">
               ${f.units.map(u => `<option value="${u}" ${u === savedUnit ? 'selected' : ''}>${u}</option>`).join('')}
             </select>`
          : (f.units && f.units.length === 1
              ? `<span style="padding:10px 10px;border-radius:0 8px 8px 0;border:1.5px solid #334155;border-left:none;background:#1a2535;color:#94a3b8;font-size:14px;white-space:nowrap;">${f.units[0]}</span>`
              : '');

        const inputStyle = f.units && f.units.length >= 1
          ? 'border-radius:8px 0 0 8px;border-right:none;flex:1;'
          : 'flex:1;';

        return `
          <div class="form-group">
            <label>${f.label}</label>
            <div style="display:flex;align-items:stretch;">
              <input id="${f.id}" type="number" placeholder="${f.placeholder}"
                value="${savedVal}"
                style="${inputStyle}padding:10px 12px;border:1.5px solid #334155;background:#1a2535;color:#f1f5f9;font-size:14px;width:100%;box-sizing:border-box;"/>
              ${unitSelector}
            </div>
          </div>`;
      }).join('');
    }

    function getVendorSpecFromForm(type) {
      const config = VENDOR_SPEC_CONFIG[type];
      if (!config) return {};
      const spec = {};
      config.fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (!el) return;
        spec[f.id] = el.value;
        const unitEl = document.getElementById(f.id + 'Unit');
        if (unitEl) spec[f.id + 'Unit'] = unitEl.value;
      });
      return spec;
    }

    function formatVendorSpecLabel(product) {
      const type   = product.type;
      const spec   = product.spec || {};
      const config = VENDOR_SPEC_CONFIG[type];
      if (!config) return '';
      return config.fields.map(f => {
        const val = spec[f.id];
        if (!val) return null;
        const unit = spec[f.id + 'Unit'] || (f.units && f.units[0]) || '';
        return `${val}${unit}`;
      }).filter(Boolean).join(' / ');
    }

    async function saveVendorProduct() {
      const name        = document.getElementById('vendorProdName').value.trim();
      const type        = document.getElementById('vendorProdType').value;
      const price       = document.getElementById('vendorProdPrice').value;
      const description = document.getElementById('vendorProdDesc').value.trim();

      let isValid = true;
      isValid = validateField('vendorProdName',  'vendorProdNameError',  v => v.length >= 3,     'Name required')  && isValid;
      isValid = validateField('vendorProdType',  'vendorProdTypeError',  v => v.length > 0,       'Type required')  && isValid;
      isValid = validateField('vendorProdPrice', 'vendorProdPriceError', v => parseFloat(v) > 0, 'Price required') && isValid;
      if (!isValid) { showToast('Please fix errors', 'error'); return; }

      const spec = getVendorSpecFromForm(type);

      // Derive power_watts for DB index (panels, inverters)
      let powerWatts = null;
      if (spec.specPower) {
        const val  = parseFloat(spec.specPower);
        const unit = spec.specPowerUnit || 'W';
        if (unit === 'kW' || unit === 'kVA') powerWatts = val * 1000;
        else powerWatts = val;
      }

      showLoading(true, 'Saving...');
      try {
        const product = {
          vendorId:   currentUser ? currentUser.id   : 'demo',
          vendorName: currentUser ? currentUser.name : 'Solar Tech Ltd',
          name, type, spec,
          power:       powerWatts,
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

        container.innerHTML = products.map(product => {
          const specLabel = formatVendorSpecLabel(product);
          return `
          <div class="product-card">
            ${product.image
              ? `<img src="${product.image}" class="product-image" alt="${product.name}">`
              : `<div class="product-image" style="display:flex;align-items:center;justify-content:center;font-size:32px;background:#fef3c7;">${typeIcons[product.type] || '📦'}</div>`
            }
            <div style="flex: 1;">
              <div style="font-weight:600;font-size:16px;margin-bottom:4px;">${product.name}</div>
              <div style="font-size:13px;color:#687076;margin-bottom:8px;">
                ${typeLabels[product.type] || product.type}${specLabel ? ` • ${specLabel}` : ''}
              </div>
              <div style="font-size:18px;font-weight:700;color:#F59E0B;margin-bottom:12px;">
                ₦${Number(product.price).toLocaleString()}
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-outline small-btn" style="color:#F59E0B;border-color:#F59E0B;" onclick="editVendorProduct('${product._cloudId}')">Edit</button>
                <button class="btn btn-danger small-btn" onclick="deleteVendorProduct('${product._cloudId}')">Delete</button>
              </div>
            </div>
          </div>`;
        }).join('');
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
        document.getElementById('vendorProdPrice').value           = product.price;
        document.getElementById('vendorProdDesc').value            = product.description || '';

        // Render spec fields for this type, then prefill from saved spec
        // Support both new spec object and legacy power field
        const savedSpec = product.spec || {};
        if (!savedSpec.specPower && product.power) savedSpec.specPower = String(product.power);
        renderVendorSpecFields(savedSpec);

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

      document.getElementById('vendorProdName').value  = '';
      document.getElementById('vendorProdType').value  = '';
      document.getElementById('vendorProdPrice').value = '';
      document.getElementById('vendorProdDesc').value  = '';
      document.getElementById('vendorSpecFields').innerHTML = '';
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
// Global role sanitizer — profiles CHECK constraint only allows 'installer' | 'vendor'
function sanitizePortalRole(role) {
  if (role === 'installer' || role === 'vendor') return role;
  return null;
}

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
    role: sanitizePortalRole(existingProfile.role || requestedRole),
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
  // End-user flow: logged-in goes to dashboard, session-restore goes to calculator
  if (role === 'user') {
    currentRole = 'user';
    if (typeof updateUserAccountUI === 'function') updateUserAccountUI();
    if (typeof isSignedInEndUser === 'function' && isSignedInEndUser()) {
      if (typeof egShowUserDashboard === 'function') egShowUserDashboard();
    } else {
      showScreen('user-calculator');
    }
    return;
  }
  // Use completeness check — sends to profile completion if needed
  routeToPortalWithCheck(role);
}

// Sanitize role for profiles table — CHECK constraint only allows 'installer' | 'vendor'
    // Consumer/user accounts don't get a profiles row at all (or get role omitted).
    function sanitizePortalRole(role) {
      if (role === 'installer' || role === 'vendor') return role;
      return null; // Don't write 'user' or unknown values into profiles
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
        error: 'already_registered'
      };
    }

    const _safeRole = sanitizePortalRole(userData.role);
    const { error: profileError } = _safeRole ? await supabaseClient
      .from('profiles')
      .upsert([{
        id: authData.user.id,
        role: _safeRole,
        full_name: userData.full_name || null,
        company_name: userData.company_name || userData.business_name || null,
        business_name: userData.business_name || userData.company_name || null,
        phone: userData.phone || null,
        address: userData.address || null,
        shop_address: userData.shop_address || null,
        service_area: userData.service_area || null,
        state: normalizeState(userData.state) || null,
        city: userData.city || null,
        is_vendor: userData.role === 'vendor',
        is_installer: userData.role === 'installer',
        status: (userData.role === 'installer' || userData.role === 'vendor') ? 'pending' : null,
        installer_status: userData.role === 'installer' ? 'pending' : null,
        vendor_status: userData.role === 'vendor' ? 'pending' : null,
        // Installer-specific fields
        whatsapp_number: userData.whatsapp_number || null,
        cac_number: userData.cac_number || null,
        business_description: userData.business_description || null,
        years_experience: userData.years_experience || null,
        min_system_kva: userData.min_system_kva || null,
        max_system_kva: userData.max_system_kva || null,
        works_with_lithium: userData.works_with_lithium || false,
        market_type: userData.market_type || null,
        service_state: userData.service_state || null,
        service_city: userData.service_city || null,
        // Vendor-specific fields
        delivery_coverage: userData.delivery_coverage || null,
        sells_panels: userData.sells_panels || false,
        sells_inverters: userData.sells_inverters || false,
        sells_lithium: userData.sells_lithium || false,
        sells_accessories: userData.sells_accessories || false,
        offers_installation: userData.offers_installation || null,
        brands_carried: userData.brands_carried || null
      }], { onConflict: 'id' }) : { error: null };

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

      const safeRole = sanitizePortalRole(role);
      if (safeRole) {
        const { error: insertErr } = await supabaseClient.from('profiles').insert([{
          id: data.user.id,
          role: safeRole,
          company_name,
          phone,
          address: meta.address || null,
          service_area: meta.service_area || null,
          state: normalizeState(meta.state) || null,
          city: meta.city || null,
          is_vendor: safeRole === 'vendor',
          is_installer: safeRole === 'installer',
          status: 'pending'
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
        // No valid portal role — user may be a consumer or role is indeterminate.
        // Don't throw: let them log in; routeToPortalWithCheck will handle routing.
        console.warn('supabaseSignIn: no profile and no valid role — continuing without profile write');
        profile = { id: data.user.id, role: null };
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

      if (role === 'user') {
        showScreen('user-forgot-password');
        const s1 = document.getElementById('userForgotStep1');
        const s3 = document.getElementById('userForgotStep3');
        const newPwd = document.getElementById('userForgotNewPassword');
        const confirmPwd = document.getElementById('userForgotConfirmPassword');
        const newPwdErr = document.getElementById('userForgotNewPasswordError');
        const confirmErr = document.getElementById('userForgotConfirmPasswordError');
        if (s1) s1.style.display = 'none';
        if (s3) s3.style.display = 'block';
        if (newPwd) newPwd.value = '';
        if (confirmPwd) confirmPwd.value = '';
        if (newPwdErr) newPwdErr.textContent = '';
        if (confirmErr) confirmErr.textContent = '';
      } else if (role === 'installer') {
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

      if (role === 'user') {
        const s3 = document.getElementById('userForgotStep3');
        const s1 = document.getElementById('userForgotStep1');
        if (s3) s3.style.display = 'none';
        if (s1) { s1.style.display = 'block'; s1.innerHTML = s1.innerHTML; } // reset to original
        const emailEl = document.getElementById('userForgotEmail');
        const newPwd = document.getElementById('userForgotNewPassword');
        const confirmPwd = document.getElementById('userForgotConfirmPassword');
        if (emailEl) emailEl.value = '';
        if (newPwd) newPwd.value = '';
        if (confirmPwd) confirmPwd.value = '';
      } else if (role === 'installer') {
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
        currentUser = { ...(result.user || {}), role: 'vendor', company_name: company, full_name: fullName, phone, state, city, status: 'pending', vendor_status: 'pending' };
        currentRole = 'vendor';
        egSendApplicationNotification('vendor', company || fullName, phone, state);
        showScreen('pending-review');
      } else {
        const isExisting = result.error && (result.error.includes('already') || result.error.includes('confirmation') || result.error === 'already_registered');
        if (isExisting) {
          // Email exists — try to add vendor role to their existing account
          showLoading(true, 'Adding vendor access...');
          try {
            const { data: { user: existingUser } } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (existingUser) {
              const { data: existingProfile } = await supabaseClient.from('profiles').select('*').eq('id', existingUser.id).maybeSingle();
              if (existingProfile && existingProfile.is_vendor) {
                showLoading(false);
                document.getElementById('regVendorEmailError').textContent = 'Already registered as vendor — please log in';
                showToast('You already have a vendor account. Use Sign In below.', 'info');
              } else {
                // Add vendor role to existing account
                await supabaseClient.from('profiles').upsert([{
                  id: existingUser.id,
                  is_vendor: true,
                  vendor_status: 'pending',
                  // Preserve existing role — only update role to vendor if they have no role yet
                  role: (existingProfile && existingProfile.role) ? existingProfile.role : 'vendor'
                }], { onConflict: 'id' });
                showLoading(false);
                currentUser = { ...existingUser, ...(existingProfile || {}), is_vendor: true, vendor_status: 'pending' };
                currentRole = 'vendor';
                egSendApplicationNotification('vendor', company || fullName, phone, state);
                showToast('Application submitted!', 'success');
                showScreen('pending-review');
              }
            } else {
              showLoading(false);
              document.getElementById('regVendorEmailError').textContent = 'Email registered — check password and use Sign In';
              showToast('Email already registered. Use Sign In with correct password.', 'info');
            }
          } catch(addErr) {
            showLoading(false);
            document.getElementById('regVendorEmailError').textContent = 'Email registered — please use Sign In below';
            showToast('Email already registered. Please log in instead.', 'info');
          }
        } else {
          showToast(result.error || 'Signup failed', 'error');
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
        currentUser = { ...(result.user || {}), role: 'installer', company_name: company, full_name: fullName, phone, state, city: area, status: 'pending', installer_status: 'pending' };
        currentRole = 'installer';
        egSendApplicationNotification('installer', company || fullName, phone, state);
        showScreen('pending-review');
      } else {
        const isExisting = result.error && (result.error.includes('already') || result.error.includes('confirmation') || result.error === 'already_registered');
        if (isExisting) {
          // Email exists — try to add installer role to their existing account
          showLoading(true, 'Adding installer access...');
          try {
            const { data: { user: existingUser } } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (existingUser) {
              const { data: existingProfile } = await supabaseClient.from('profiles').select('*').eq('id', existingUser.id).maybeSingle();
              if (existingProfile && existingProfile.is_installer) {
                showLoading(false);
                document.getElementById('regInstEmailError').textContent = 'Already registered as installer — please log in';
                showToast('You already have an installer account. Use Sign In below.', 'info');
              } else {
                // Add installer role to existing account
                await supabaseClient.from('profiles').upsert([{
                  id: existingUser.id,
                  is_installer: true,
                  installer_status: 'pending',
                  // Preserve existing role — only update role to installer if they have no role yet
                  role: (existingProfile && existingProfile.role) ? existingProfile.role : 'installer'
                }], { onConflict: 'id' });
                showLoading(false);
                currentUser = { ...existingUser, ...(existingProfile || {}), is_installer: true, installer_status: 'pending' };
                currentRole = 'installer';
                egSendApplicationNotification('installer', company || fullName, phone, state);
                showToast('Application submitted!', 'success');
                showScreen('pending-review');
              }
            } else {
              showLoading(false);
              document.getElementById('regInstEmailError').textContent = 'Email registered — check password and use Sign In';
              showToast('Email already registered. Use Sign In with correct password.', 'info');
            }
          } catch(addErr) {
            showLoading(false);
            document.getElementById('regInstEmailError').textContent = 'Email registered — please use Sign In below';
            showToast('Email already registered. Please log in instead.', 'info');
          }
        } else {
          showToast(result.error || 'Signup failed', 'error');
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
    // USER FORGOT PASSWORD
    // ================================================================

    function openUserForgotPassword() {
      closeUserAuthModal();
      // Reset the screen to step 1
      const s1 = document.getElementById('userForgotStep1');
      const s3 = document.getElementById('userForgotStep3');
      const emailEl = document.getElementById('userForgotEmail');
      const errEl = document.getElementById('userForgotEmailError');
      if (s1) s1.style.display = 'block';
      if (s3) s3.style.display = 'none';
      if (emailEl) emailEl.value = '';
      if (errEl) errEl.textContent = '';
      showScreen('user-forgot-password');
    }

    function closeUserForgotPassword() {
      // Return to sign-in modal
      openUserAuthModal('signin');
    }

    function userForgotStep1() {
      const email = (document.getElementById('userForgotEmail')?.value || '').trim().toLowerCase();
      const errEl = document.getElementById('userForgotEmailError');
      if (errEl) errEl.textContent = '';

      if (!email) {
        if (errEl) errEl.textContent = 'Email is required';
        return;
      }

      localStorage.setItem('pendingPasswordResetRole', 'user');
      showLoading(true, 'Sending reset link...');
      supabaseResetPassword(email).then((res) => {
        showLoading(false);
        if (res.success) {
          showToast('Reset link sent! Check your email inbox.', 'success');
          // Show confirmation message in UI
          const s1 = document.getElementById('userForgotStep1');
          if (s1) s1.innerHTML = `
            <div class="success" style="margin-bottom:16px;">
              📧 A reset link has been sent to <strong>${email}</strong>.<br><br>
              Open it on this device and your new password form will appear here automatically.
            </div>
            <button class="btn btn-outline" onclick="openUserAuthModal('signin')" style="width:100%;">Back to Sign In</button>
          `;
        } else {
          showToast(res.error || 'Could not send reset link. Check the email address.', 'error');
        }
      });
    }

    async function userForgotStep3() {
      const newPassword = document.getElementById('userForgotNewPassword')?.value || '';
      const confirmPassword = document.getElementById('userForgotConfirmPassword')?.value || '';
      const newPwdErr = document.getElementById('userForgotNewPasswordError');
      const confirmErr = document.getElementById('userForgotConfirmPasswordError');

      if (newPwdErr) newPwdErr.textContent = '';
      if (confirmErr) confirmErr.textContent = '';

      if (!isValidPassword(newPassword)) {
        if (newPwdErr) newPwdErr.textContent = 'Minimum 8 characters required';
        return;
      }
      if (newPassword !== confirmPassword) {
        if (confirmErr) confirmErr.textContent = 'Passwords do not match';
        return;
      }

      if (!passwordRecoveryMode) {
        showToast('Session expired. Please request a new reset link.', 'error');
        return;
      }

      showLoading(true, 'Updating password...');
      const result = await supabaseUpdatePassword(newPassword);
      showLoading(false);

      if (!result.success) {
        showToast(result.error || 'Could not update password. Try requesting a new link.', 'error');
        return;
      }

      await supabaseSignOut();
      passwordRecoveryMode = false;
      localStorage.removeItem('pendingPasswordResetRole');
      clearAuthHashFromUrl();
      showToast('Password updated! Please sign in with your new password.', 'success');
      // Open modal in sign-in mode so they can log in immediately
      currentRole = 'user';
      showScreen('user-calculator');
      setTimeout(() => openUserAuthModal('signin'), 400);
    }
    
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

        // Write role to localStorage with timestamp.
        // NOTE: Do NOT add role as a query param to redirectTo — Supabase PKCE
        // replaces the entire query string with ?code= on return, so it would be lost.
        // localStorage IS reliably available when the redirect page loads on Android
        // (it's a single navigation: your page → Google → back to your page with ?code=).
        const _rolePayload = JSON.stringify({ role, ts: Date.now() });
        try { localStorage.setItem('egPendingRole', _rolePayload); } catch(e) {}
        try { sessionStorage.setItem('egPendingRole', _rolePayload); } catch(e) {}

        // Clean redirectTo — no extra query params (Supabase would strip them anyway)
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
        const isEmailConfirmation = searchParams.get('type') === 'signup' || hashParams.get('type') === 'signup';
        const hasOtpExpired = searchParams.get('error_code') === 'otp_expired' || hashParams.get('error_code') === 'otp_expired';
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description') || '';

        if (!(hasHashTokens || hasAuthCode || isRecovery || isEmailConfirmation || hasOtpExpired)) {
          return;
        }

        if (hasOtpExpired) {
          clearAuthHashFromUrl();
          // If this was a signup/email confirmation link that expired, route to login — not password reset
          if (isEmailConfirmation || (!isRecovery && !localStorage.getItem('pendingPasswordResetRole'))) {
            const pendingRole = localStorage.getItem('pendingRole') || 'user';
            showToast('That confirmation link has expired. Please log in — your account is already created.', 'info');
            const loginScreen = pendingRole === 'installer' ? 'installer-login'
                              : pendingRole === 'vendor'    ? 'vendor-login'
                              : 'welcome';
            showScreen(loginScreen);
          } else {
            const recoveryRole = localStorage.getItem('pendingPasswordResetRole') || 'user';
            showToast('That reset link has expired. Request a new password reset email and use it immediately.', 'error');
            openPasswordResetScreen(recoveryRole);
          }
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
          if (error) {
            // Code already used (clicked link twice) — try to get existing session
            const existingSession = await supabaseGetSession();
            if (existingSession && existingSession.user) {
              session = existingSession;
            } else {
              showLoading(false);
              clearAuthHashFromUrl();
              const pendingRole = localStorage.getItem('pendingRole') || 'user';
              showToast('This link has already been used. Please log in with your email and password.', 'info');
              const loginScreen = pendingRole === 'installer' ? 'installer-login'
                                : pendingRole === 'vendor'    ? 'vendor-login'
                                : 'welcome';
              showScreen(loginScreen);
              return;
            }
          } else {
            session = data.session;
          }
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
          const recoveryRole = localStorage.getItem('pendingPasswordResetRole') || 'user';
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

        // ── Role resolution ───────────────────────────────────────────────────
        // Priority order:
        // 1. localStorage egPendingRole (written just before OAuth redirect, survives single redirect)
        // 2. sessionStorage egPendingRole (same-tab backup)
        // 3. Legacy localStorage pendingRole
        // 4. user_metadata.role (email signup path)
        // 5. existing profile.role (returning user who already has a profile)
        // 6. 'user' fallback
        //
        // We do NOT use URL query params because Supabase PKCE replaces the entire
        // query string with ?code= on return — any ?egpr= we added is gone.

        function _readStoredRole(storage) {
          try {
            const raw = storage.getItem('egPendingRole');
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            // Expire after 15 minutes to avoid stale roles across sessions
            if (Date.now() - parsed.ts > 15 * 60 * 1000) { storage.removeItem('egPendingRole'); return null; }
            return parsed.role || null;
          } catch(e) { return null; }
        }

        const _lsRole = _readStoredRole(localStorage) || localStorage.getItem('pendingRole');
        const _ssRole = _readStoredRole(sessionStorage);

        const _rawRole = _lsRole
                      || _ssRole
                      || session.user.user_metadata?.role
                      || profile?.role
                      || 'user';

        // Only clean up egPendingRole once we have a confirmed non-user role,
        // so it survives if the page reloads a second time during the auth flow.
        if (_rawRole !== 'user') {
          try { localStorage.removeItem('egPendingRole'); } catch(e) {}
          try { sessionStorage.removeItem('egPendingRole'); } catch(e) {}
        }
        // 'user' is not a valid profiles role for portal accounts — if the URL path or
        // referrer hints at an installer/vendor portal, default to the safer option.
        // We detect this from the error URL path (GitHub Pages path contains portal slug).
        const _path = window.location.pathname || '';
        const _isPortalPath = _path.includes('installer') || _path.includes('vendor');
        const requestedRole = (_rawRole === 'user' && _isPortalPath) ? 'installer' : _rawRole;
        let resolvedRole = requestedRole;
        let activeProfile = profile;

        // Profile missing — this happens when:
        // (a) email confirmation redirect fires and the initial signup profile insert
        //     failed due to RLS (not yet authenticated), OR
        // (b) first-time Google OAuth user with no profile yet.
        // Now that we have a valid session, RLS allows the upsert.
        if (!profile || profileError) {
          const meta = session.user.user_metadata || {};
          const userName = meta.full_name || meta.name || meta.company_name || session.user.email.split('@')[0];
          const flags = buildPortalFlags(requestedRole, {});

          // For email-confirmed users, pull all fields stored in user_metadata at signup time
          const profilePayload = {
            id: session.user.id,
            role: sanitizePortalRole(requestedRole),
            full_name: meta.full_name || null,
            company_name: meta.company_name || meta.business_name || userName,
            business_name: meta.business_name || meta.company_name || null,
            phone: meta.phone || null,
            address: meta.address || meta.shop_address || null,
            shop_address: meta.shop_address || null,
            service_area: meta.service_area || null,
            state: normalizeState(meta.state) || null,
            city: meta.city || null,
            whatsapp_number: meta.whatsapp_number || null,
            cac_number: meta.cac_number || null,
            business_description: meta.business_description || null,
            is_vendor: flags.is_vendor,
            is_installer: flags.is_installer,
            status: (requestedRole === 'installer' || requestedRole === 'vendor') ? 'pending' : null
          };
          // Safety: if role sanitized to null, don't upsert — this isn't a portal account
          if (!profilePayload.role) { activeProfile = null; }

          const { error: insertError } = await supabaseClient
            .from('profiles')
            .upsert([profilePayload], { onConflict: 'id' });

          if (insertError) {
            showLoading(false);
            console.error('Profile creation error:', insertError);
            // Profile upsert failed — user is authenticated but profile may be incomplete.
            // Still route through the completeness check so Google OAuth users are forced
            // to fill their details rather than landing on the wrong screen.
            egSyncUser({ ...session.user, role: requestedRole });
            currentRole = resolvedRole;
            localStorage.removeItem('pendingRole');
            clearAuthHashFromUrl();
            showLoading(false);
            // Use routeToPortalWithCheck so incomplete profiles hit the form, not the dashboard
            routeToPortal(resolvedRole);
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
        if (isEmailConfirmation) {
          showToast('Email confirmed! You are now logged in.', 'success');
        } else {
          showToast('Welcome back!', 'success');
        }
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
        // Welcome toast removed
      }
    }, 1000);
    
    // ================================================================
    // HAMBURGER MENU
    // ================================================================

    function egToggleMenu() {
      const d = document.getElementById('egMenuDropdown');
      if (!d) return;
      const isOpen = d.style.display !== 'none';
      d.style.display = isOpen ? 'none' : 'block';
    }

    function egCloseMenu() {
      const d = document.getElementById('egMenuDropdown');
      if (d) d.style.display = 'none';
    }

    // Close when clicking anywhere outside the menu
    document.addEventListener('click', function(e) {
      const btn  = document.getElementById('egMenuBtn');
      const drop = document.getElementById('egMenuDropdown');
      if (!drop || drop.style.display === 'none') return;
      if (btn && btn.contains(e.target)) return;   // let the toggle handle it
      if (drop && drop.contains(e.target)) return; // click inside menu — keep open
      egCloseMenu();
    });

    function egMenuAction(action) {
  if (action === 'admin') { egToggleMenu(); showScreen('admin-panel'); return; }
      egCloseMenu();
      if (action === 'apk') {
        egShowMenuModal(
          '📲',
          'Download APK',
          'The Energy Guide Android app is coming soon.<br><br>' +
          'For now, you can add this page to your home screen:<br><br>' +
          '1. Open this site in Chrome<br>' +
          '2. Tap the menu (⋮) → <strong>Add to Home screen</strong><br>' +
          '3. It will work like an app!',
          null
        );
      } else if (action === 'contact') {
        egShowMenuModal(
          '✉️',
          'Contact Us',
          'Have a question or need support? Reach us at:<br><br>' +
          '<strong style="color:#f59e0b;">energyguideng@outlook.com</strong><br><br>' +
          'Or WhatsApp us on:<br>' +
          '<strong style="color:#f59e0b;">+234 814 247 2213</strong>',
          { label: '💬 WhatsApp Us', url: 'https://wa.me/2348142472213?text=Hi%2C%20I%20need%20help%20with%20Energy%20Guide' }
        );
      } else if (action === 'about') {
        egShowMenuModal(
          '⚡',
          'About Energy Guide',
          '<strong>Energy Guide</strong> is Nigeria&#39;s first end-to-end solar system sizing platform.<br><br>' +
          'We help homeowners, installers, and vendors make smarter solar decisions — ' +
          'with accurate calculations tailored to Nigerian market standards.<br><br>' +
          '<span style="color:#94a3b8;font-size:12px;">Version 1.0 · Built for Nigeria 🇳🇬</span>',
          null
        );
      }
    }

    function egShowMenuModal(icon, title, body, cta) {
      // Reuse the egShowModal from monetization if available, else build our own
      const inner = `
        <div style="text-align:center;">
          <div style="font-size:44px;margin-bottom:12px;">${icon}</div>
          <div style="font-weight:800;font-size:20px;color:#f3f4f6;margin-bottom:14px;">${title}</div>
          <div style="font-size:14px;color:#94a3b8;line-height:1.8;margin-bottom:20px;text-align:left;">
            ${body}
          </div>
          ${cta ? `<a href="${cta.url}" target="_blank"
            style="display:block;width:100%;background:linear-gradient(135deg,#22C55E,#16A34A);
                   color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;
                   font-weight:700;cursor:pointer;text-decoration:none;text-align:center;
                   margin-bottom:12px;box-sizing:border-box;">${cta.label}</a>` : ''}
          <button onclick="egRemoveModal()"
            style="width:100%;background:transparent;border:1px solid #243244;border-radius:12px;
                   padding:12px;font-size:14px;color:#94a3b8;cursor:pointer;">
            Close
          </button>
        </div>`;
      if (typeof egShowModal === 'function') {
        egShowModal(inner);
      }
    }

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
          <div><span style="color:#374151;font-size:11px;">Battery Breaker</span><br><strong>${r.numBattStrings > 1 ? r.numBattStrings+'× '+r.battStringBreaker+'A DC (parallel)' : (r.battStringBreaker||battBreaker)+'A DC'}</strong></div>
          <div><span style="color:#374151;font-size:11px;">AC Breaker</span><br><strong>${acBreaker}A AC</strong></div>
          <div><span style="color:#374151;font-size:11px;">PV Cable Size</span><br><strong>${pvCable} mm²</strong></div>
          <div><span style="color:#374151;font-size:11px;">Battery Cable Size</span><br><strong>${r.numBattStrings > 1 ? r.numBattStrings+'× '+r.battStringCable+'mm² (parallel)' : (r.battStringCable||battCable)+' mm²'}</strong></div>
          <div><span style="color:#374151;font-size:11px;">AC Cable Size</span><br><strong>${acCable} mm²</strong></div>
        </div>`;

      // Store for recalc and PDF
      window._vobMeta = { invKva, sysV, batKwh, batCount, panels, pvW, pvBreaker, battBreaker, acBreaker, pvCable, battCable, acCable, numBattStrings: r.numBattStrings||1, battStringBreaker: r.battStringBreaker||battBreaker, battStringCable: r.battStringCable||battCable };

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
        const _vnbs = meta.numBattStrings || 1;
        const _vbsb = meta.battStringBreaker || meta.battBreaker;
        const _vbsc = meta.battStringCable   || meta.battCable;
        const _vBrkStr = _vnbs > 1 ? `Battery: ${_vnbs}× ${_vbsb}A DC (parallel)` : `Battery Breaker: ${_vbsb}A DC`;
        const _vCabStr = _vnbs > 1 ? `Battery: ${_vnbs}× ${_vbsc}mm² (parallel)` : `Battery Cable: ${_vbsc}mm²`;
        refEl.innerHTML = `PV Breaker: ${meta.pvBreaker}A DC &nbsp;|&nbsp; ${_vBrkStr} &nbsp;|&nbsp; AC Breaker: ${meta.acBreaker}A AC<br>` +
          `PV Cable: ${meta.pvCable}mm² &nbsp;|&nbsp; ${_vCabStr} &nbsp;|&nbsp; AC Cable: ${meta.acCable}mm²`;
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
          const _pnbs = meta.numBattStrings || 1;
          const _pbsb = meta.battStringBreaker || meta.battBreaker;
          const _pbsc = meta.battStringCable   || meta.battCable;
          const _pBrkStr = _pnbs > 1 ? `Batt ${_pnbs}× ${_pbsb}A DC (par.)` : `Batt ${_pbsb}A DC`;
          const _pCabStr = _pnbs > 1 ? `Batt ${_pnbs}× ${_pbsc}mm² (par.)` : `Batt ${_pbsc}mm²`;
          L('Breakers (ref): PV ' + meta.pvBreaker + 'A DC | ' + _pBrkStr + ' | AC ' + meta.acBreaker + 'A AC', 20, y); y += 5;
          L('Cables (ref): PV ' + meta.pvCable + 'mm² | ' + _pCabStr + ' | AC ' + meta.acCable + 'mm²', 20, y); y += 5;
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



    // ── User portal action wrappers (called from HTML buttons) ──────────
    function egSaveCalc() {
      if (typeof saveCurrentSystemForUser === 'function') {
        saveCurrentSystemForUser();
      } else {
        showToast('Save not available. Please sign in first.', 'warning');
      }
    }

    function egDownloadPDF() {
      if (typeof downloadSystemPDF === 'function') {
        downloadSystemPDF();
      } else if (typeof exportPDF === 'function') {
        exportPDF();
      } else {
        showToast('PDF export not available.', 'warning');
      }
    }

    function egShareWhatsApp() {
      if (typeof shareSystemWhatsApp === 'function') {
        shareSystemWhatsApp();
      } else if (typeof instShareWhatsApp === 'function') {
        instShareWhatsApp();
      } else {
        showToast('WhatsApp share not available.', 'warning');
      }
    }
