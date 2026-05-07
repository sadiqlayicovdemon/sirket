import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://qdhygfewnlurjdvvzjkh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkaHlnZmV3bmx1cmpkdnZ6amtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQ5NTEsImV4cCI6MjA5MzcxMDk1MX0.huAMoMkgrrFjGiAn5sVQFS5qqPxsQ6Cw_91eA_hbWEQ';
export let supabase = null;

export function initSupabase() {
    if (SUPABASE_URL.includes('https://') === false || SUPABASE_ANON_KEY === '') {
        console.warn('Supabase konfiqurasiya olunmayıb. js/services/supabase.js faylında URL və ANON KEY əlavə edin.');
        return;
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase ilə əlaqə quruldu:', SUPABASE_URL);
    console.log('🔧 Supabase Kliyenti:', supabase ? 'Hazır' : 'Xəta');
    
    // Test connection after init
    testConnection().then(result => {
        if (result.ok) {
            console.log('✅ Supabase DATABASE əlaqəsi UĞURLU!');
        } else {
            console.warn('⚠️ Supabase database əlaqəsi yoxlanılır...', result.error);
        }
    });
}

export async function testConnection() {
    if (!supabase) {
        console.error('❌ Supabase başlatılmamış!');
        return { ok: false, error: 'Supabase təchiz edilib.' };
    }

    try {
        console.log('🔄 Supabase bağlantısı test ediliyor...');
        const { data, error } = await supabase.from('kassa_records').select('id').limit(1);
        
        if (error) {
            console.error('❌ Supabase xətası:', error.message);
            return { ok: false, data, error: error.message };
        }
        
        console.log('✅ Supabase əlaqəsi uğurludur!', data);
        return { ok: true, data, error: null };
    } catch (err) {
        console.error('❌ Test xətası:', err.message);
        return { ok: false, error: err.message };
    }
}

// Expose to window for testing
if (typeof window !== 'undefined') {
    window.testSupabaseConnection = testConnection;
    window.supabaseClient = () => supabase;
}
