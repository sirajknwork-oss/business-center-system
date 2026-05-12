const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCreatorAccount() {
  try {
    console.log('Attempting to create creator account...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'sirajkn.work@gmail.com',
      password: 'SirajZaira@126',
      options: {
        data: {
          role: 'creator'
        }
      }
    });

    if (error) {
      console.error('Signup error:', error.message);
      
      // Try to sign in instead (account might already exist)
      console.log('Trying to sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'sirajkn.work@gmail.com',
        password: 'SirajZaira@126'
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError.message);
        return;
      }
      
      console.log('✅ Successfully signed in to existing account!');
      console.log('Email: sirajkn.work@gmail.com');
      console.log('Password: SirajZaira@126');
      console.log('You can now login at http://localhost:3000/login');
      return;
    }

    console.log('✅ Creator account created successfully!');
    console.log('Email: sirajkn.work@gmail.com');
    console.log('Password: SirajZaira@126');
    console.log('Please check your email for verification, then login at http://localhost:3000/login');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

createCreatorAccount();
