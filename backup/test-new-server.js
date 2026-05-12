const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewServer() {
  try {
    console.log('Testing login with new server configuration...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'sirajkn.work@gmail.com',
      password: 'SirajZaira@126'
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      return;
    }

    console.log('✅ Login successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Role:', data.user.user_metadata?.role || 'Not set');
    console.log('Session active:', !!data.session);
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testNewServer();
