const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  try {
    console.log('Testing creator login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'sirajkn.work@gmail.com',
      password: 'SirajZaira@126'
    });

    if (error) {
      console.error('Login failed:', error.message);
      return;
    }

    console.log('✅ Login successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Role:', data.user.user_metadata?.role || 'Not set');
    
    // Check if user has creator privileges
    const isCreator = data.user.email === 'sirajkn.work@gmail.com' || 
                     data.user.user_metadata?.role === 'creator';
    
    console.log('Creator privileges:', isCreator ? '✅ Yes' : '❌ No');
    
    if (isCreator) {
      console.log('\n🎉 Creator account is ready!');
      console.log('You can now:');
      console.log('1. Go to http://localhost:3000/login');
      console.log('2. Enter email: sirajkn.work@gmail.com');
      console.log('3. Enter password: SirajZaira@126');
      console.log('4. Access the creator dashboard and all features');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testLogin();
