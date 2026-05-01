// ============================================================
// db.js — Supabase Data Layer
// Handles: saved_calculations, vendor_products
// Replaces: energyGuide_calculations, energyGuide_vendorProducts localStorage keys
// localStorage keys that intentionally remain local (UX-only):
//   pendingRole, pendingPasswordResetRole, energyGuide_lastLead
// ============================================================

// ── Helpers ────────────────────────────────────────────────

async function _dbGetUserId() {
  if (!supabaseClient) throw new Error('Supabase not initialised');
  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data?.user) throw new Error('Not signed in');
  return data.user.id;
}

function _dbCacheSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

function _dbCacheGet(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
}

// ============================================================
// SAVED CALCULATIONS
// Table: saved_calculations
// ============================================================

async function saveCalculationToCloud(calcObj) {
  const userId = await _dbGetUserId();
  const row = {
    user_id: userId,
    role: calcObj.role || 'installer',
    title: calcObj.title || null,
    payload: calcObj
  };
  const { data, error } = await supabaseClient
    .from('saved_calculations')
    .insert([row])
    .select()
    .single();
  if (error) throw error;
  // Bust cache
  localStorage.removeItem('energyGuide_calculations_cache');
  return data;
}

async function loadCalculationsFromCloud() {
  if (!supabaseClient) return _dbCacheGet('energyGuide_calculations_cache') || [];
  const { data, error } = await supabaseClient
    .from('saved_calculations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const calcs = (data || []).map(r => ({ _cloudId: r.id, ...r.payload, timestamp: r.created_at }));
  _dbCacheSet('energyGuide_calculations_cache', calcs);
  return calcs;
}

async function deleteCalculationFromCloud(cloudId) {
  if (!supabaseClient) throw new Error('Supabase not initialised');
  const { error } = await supabaseClient
    .from('saved_calculations')
    .delete()
    .eq('id', cloudId);
  if (error) throw error;
  localStorage.removeItem('energyGuide_calculations_cache');
}

// Safe wrapper — falls back to local cache if cloud fails
async function getSavedCalculationsSafe() {
  try {
    return await loadCalculationsFromCloud();
  } catch (err) {
    console.warn('Cloud load failed, using cache:', err);
    return _dbCacheGet('energyGuide_calculations_cache') || [];
  }
}

// ============================================================
// ONE-TIME MIGRATION: localStorage → Supabase (calculations)
// Runs once per browser. Safe to call on every login.
// ============================================================

async function migrateLocalCalculationsOnce() {
  if (localStorage.getItem('energyGuide_calcs_migrated_v1') === 'yes') return;
  const local = JSON.parse(localStorage.getItem('energyGuide_calculations') || '[]');
  if (!local.length) { localStorage.setItem('energyGuide_calcs_migrated_v1', 'yes'); return; }

  console.log(`Migrating ${local.length} local calculation(s) to Supabase...`);
  let migrated = 0;
  for (const calc of local) {
    try {
      await saveCalculationToCloud(calc);
      migrated++;
    } catch (e) {
      console.warn('Failed to migrate calc:', e);
    }
  }
  console.log(`Migrated ${migrated}/${local.length} calculations.`);
  localStorage.setItem('energyGuide_calcs_migrated_v1', 'yes');
  // Keep old key as backup for 30 days, then it'll be forgotten naturally
}

// ============================================================
// VENDOR PRODUCTS
// Table: vendor_products
// ============================================================

async function saveVendorProductToCloud(product, existingCloudId = null) {
  const userId = await _dbGetUserId();
  const row = {
    user_id: userId,
    name: product.name,
    category: product.type || product.category || null,
    brand: product.brand || null,
    model: product.model || null,
    power_watts: product.power ? Number(product.power) : null,
    price: Number(product.price || 0),
    quantity: Number(product.quantity || 0),
    description: product.description || null,
    image_url: product.image || product.image_url || null,
    payload: product
  };

  if (existingCloudId) {
    // UPDATE
    const { data, error } = await supabaseClient
      .from('vendor_products')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('id', existingCloudId)
      .select()
      .single();
    if (error) throw error;
    localStorage.removeItem('energyGuide_vendorProducts_cache');
    return data;
  } else {
    // INSERT
    const { data, error } = await supabaseClient
      .from('vendor_products')
      .insert([row])
      .select()
      .single();
    if (error) throw error;
    localStorage.removeItem('energyGuide_vendorProducts_cache');
    return data;
  }
}

async function loadVendorProductsFromCloud() {
  if (!supabaseClient) return _dbCacheGet('energyGuide_vendorProducts_cache') || [];
  const { data, error } = await supabaseClient
    .from('vendor_products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Merge cloud row fields back into payload shape so existing render code works
  const products = (data || []).map(r => ({
    _cloudId: r.id,
    id: r.id,                  // use cloud id as canonical id
    name: r.name,
    type: r.category,
    power: r.power_watts,
    price: r.price,
    description: r.description,
    image: r.image_url,
    timestamp: r.created_at,
    vendorId: r.user_id,
    ...r.payload               // overlay any extra fields stored in payload
  }));
  _dbCacheSet('energyGuide_vendorProducts_cache', products);
  return products;
}

async function deleteVendorProductFromCloud(cloudId) {
  if (!supabaseClient) throw new Error('Supabase not initialised');
  const { error } = await supabaseClient
    .from('vendor_products')
    .delete()
    .eq('id', cloudId);
  if (error) throw error;
  localStorage.removeItem('energyGuide_vendorProducts_cache');
}

async function getVendorProductsSafe() {
  try {
    return await loadVendorProductsFromCloud();
  } catch (err) {
    console.warn('Cloud load failed, using cache:', err);
    return _dbCacheGet('energyGuide_vendorProducts_cache') || [];
  }
}

// ============================================================
// ONE-TIME MIGRATION: localStorage → Supabase (vendor products)
// ============================================================

async function migrateLocalVendorProductsOnce() {
  if (localStorage.getItem('energyGuide_products_migrated_v1') === 'yes') return;
  const local = JSON.parse(localStorage.getItem('energyGuide_vendorProducts') || '[]');
  if (!local.length) { localStorage.setItem('energyGuide_products_migrated_v1', 'yes'); return; }

  console.log(`Migrating ${local.length} local vendor product(s) to Supabase...`);
  let migrated = 0;
  for (const product of local) {
    try {
      await saveVendorProductToCloud(product);
      migrated++;
    } catch (e) {
      console.warn('Failed to migrate product:', e);
    }
  }
  console.log(`Migrated ${migrated}/${local.length} products.`);
  localStorage.setItem('energyGuide_products_migrated_v1', 'yes');
}

// ============================================================
// POST-LOGIN HOOK — call this after any successful login
// Runs migrations and primes caches
// ============================================================

async function onLoginSuccess() {
  try {
    await migrateLocalCalculationsOnce();
    await migrateLocalVendorProductsOnce();
    // Prime caches in background (don't block UI)
    getSavedCalculationsSafe().catch(() => {});
    getVendorProductsSafe().catch(() => {});
  } catch (e) {
    console.warn('onLoginSuccess migration error:', e);
  }
}

// ============================================================
// AUTH IDENTITY — stop using energyGuide_currentUser as truth
// ============================================================

async function getAuthUser() {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data?.user) return null;
    return data.user;
  } catch (e) {
    return null;
  }
}

async function getAuthProfile(userId) {
  if (!supabaseClient || !userId) return null;
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  } catch (e) {
    return null;
  }
}
