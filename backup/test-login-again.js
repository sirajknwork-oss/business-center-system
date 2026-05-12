const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLoginAgain() {
  try {
    console.log('Testing login again...');
    
    // First try to sign out any existing session
    await supabase.auth.signOut();
    
    // Now try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'sirajkn.work@gmail.com',
      password: 'SirajZaira@126'
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      console.error('Error details:', error);
      return;
    }

    console.log('✅ Login successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Role:', data.user.user_metadata?.role || 'Not set');
    console.log('Session active:', !!data.session);
    
    // Test if session is valid
    if (data.session) {
      console.log('✅ Session is valid');
      console.log('Access token exists:', !!data.session.access_token);
      console.log('Expires at:', new Date(data.session.expires_at * 1000));
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testLoginAgain();
