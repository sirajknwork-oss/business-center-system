const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing creator login...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  try {
    console.log('\nAttempting sign in with:');
    console.log('Email: sirajkn.work@gmail.com');
    console.log('Password: SirajZaira@126');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'sirajkn.work@gmail.com',
      password: 'SirajZaira@126'
    });

    if (error) {
      console.error('\n❌ Sign in failed:');
      console.error('Status:', error.status);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      return;
    }

    if (data && data.session) {
      console.log('\n✅ Sign in successful!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Email confirmed:', data.user.email_confirmed_at);
      console.log('Session token:', data.session.access_token?.substring(0, 20) + '...');
    } else {
      console.log('\n⚠️ Sign in returned no session');
      console.log('Data:', data);
    }
    
  } catch (err) {
    console.error('\n❌ Exception:', err.message);
  }
}

testLogin();
