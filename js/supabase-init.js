// EG-VERSION: v304-fix
    // ============================================
    // 🔥 SUPABASE CONFIGURATION
    // ============================================
    
    const SUPABASE_URL = 'https://eixhuvxoolwkwliatmym.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeGh1dnhvb2x3a3dsaWF0bXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzE0NDIsImV4cCI6MjA4NzQ0NzQ0Mn0.D_2M3NDyvjHR3iVF19kGWd4E6umQDSab4ipjTfWr9SQ';
    
    let supabaseClient = null;
    
    function initSupabase() {
      try {
        // Use implicit flow (required for Google OAuth on GitHub Pages)
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            flowType: 'implicit',
            detectSessionInUrl: true,
            persistSession: true
          }
        });
        supabaseClient.auth.onAuthStateChange((event, session) => {
          try {
            if (event === 'PASSWORD_RECOVERY') {
              const recoveryRole = localStorage.getItem('pendingPasswordResetRole') || 'vendor';
              setTimeout(() => {
                if (typeof openPasswordResetScreen === 'function') openPasswordResetScreen(recoveryRole);
                if (typeof showToast === 'function') showToast('Enter your new password to complete the reset.', 'info');
              }, 0);
            }
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && typeof window.restoreEnergyGuideUserSession === 'function') {
              setTimeout(() => window.restoreEnergyGuideUserSession(session).catch(() => {}), 0);
            }
            if (event === 'SIGNED_OUT' && typeof window.onEnergyGuideSignedOut === 'function') {
              setTimeout(() => window.onEnergyGuideSignedOut(), 0);
            }
          } catch(authErr) {
            console.warn('Auth state change error (non-fatal):', authErr);
          }
        });
        console.log('✅ Supabase initialized successfully!');
        return true;
      } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        // DO NOT alert — let the app continue working without Supabase
        return false;
      }
    }
    
    // Initialize on load — failures are non-fatal, app continues
    window.addEventListener('DOMContentLoaded', () => {
      try {
        if (initSupabase()) {
          try { handleGoogleAuthReturn(); } catch(e) { console.warn('handleGoogleAuthReturn error:', e); }
          try { populateAllStateSelects(); } catch(e) { console.warn('populateAllStateSelects error:', e); }
          if (typeof window.restoreEnergyGuideUserSession === 'function') {
            setTimeout(() => window.restoreEnergyGuideUserSession().catch(() => {}), 150);
          }
        } else {
          // Still populate state selects even without Supabase
          try { populateAllStateSelects(); } catch(e) {}
        }
      } catch(e) {
        console.error('DOMContentLoaded init error:', e);
        // Always try to populate state selects
        try { populateAllStateSelects(); } catch(e2) {}
      }
    });
