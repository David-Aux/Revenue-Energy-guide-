    // ============================================
    // 🔥 SUPABASE CONFIGURATION
    // ============================================
    // CHANGE THESE TWO LINES WITH YOUR SUPABASE CREDENTIALS!
    // Find them in: Supabase Dashboard → Settings → API
    // ============================================
    
    const SUPABASE_URL = 'https://eixhuvxoolwkwliatmym.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeGh1dnhvb2x3a3dsaWF0bXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzE0NDIsImV4cCI6MjA4NzQ0NzQ0Mn0.D_2M3NDyvjHR3iVF19kGWd4E6umQDSab4ipjTfWr9SQ';
    
    // ============================================
    // Initialize Supabase Client (don't change below)
    // ============================================
    
    let supabaseClient = null;
    
    function initSupabase() {
      if (SUPABASE_URL === 'YOUR_PROJECT_URL_HERE' || SUPABASE_ANON_KEY === 'YOUR_ANON_KEY_HERE') {
        console.error('⚠️ SUPABASE NOT CONFIGURED!');
        console.error('Please add your Supabase URL and Key at the top of this file.');
        alert('Supabase not configured! Please add your credentials at the top of the HTML file.');
        return false;
      }
      
      try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        supabaseClient.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            const recoveryRole = localStorage.getItem('pendingPasswordResetRole') || 'vendor';
            setTimeout(() => {
              openPasswordResetScreen(recoveryRole);
              showToast('Enter your new password to complete the reset.', 'info');
            }, 0);
          }
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && typeof window.restoreEnergyGuideUserSession === 'function') {
            setTimeout(() => window.restoreEnergyGuideUserSession(session).catch(() => {}), 0);
          }
          if (event === 'SIGNED_OUT' && typeof window.onEnergyGuideSignedOut === 'function') {
            setTimeout(() => window.onEnergyGuideSignedOut(), 0);
          }
        });
        console.log('✅ Supabase initialized successfully!');
        return true;
      } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        alert('Failed to initialize Supabase. Check your credentials.');
        return false;
      }
    }
    
    // Initialize on load
    window.addEventListener('DOMContentLoaded', () => {
      if (!initSupabase()) {
        console.error('Supabase initialization failed. App may not work correctly.');
      } else {
        // Check for Google OAuth return
        handleGoogleAuthReturn();
        populateAllStateSelects();
        if (typeof window.restoreEnergyGuideUserSession === 'function') {
          setTimeout(() => window.restoreEnergyGuideUserSession().catch(() => {}), 150);
        }
      }
    });
