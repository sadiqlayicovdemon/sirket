import { AuthState } from './state/auth.js';
import { Router } from './router.js';
import { initSupabase } from './services/supabase.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    AuthState.checkAuth();
    Router.init();
});
