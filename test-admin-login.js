const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // Try to login with the admin user from SQL schema
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@techcorp.com',
      password: 'password123' // You may need to set this password
    });

    if (error) {
      console.error('Admin login failed:', error.message);
      console.log('This might mean:');
      console.log('1. Admin user not created in auth system');
      console.log('2. Password is different');
      console.log('3. User needs to be created via creator dashboard');
      return;
    }

    console.log('✅ Admin login successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Role:', data.user.user_metadata?.role || 'Not set');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

async function checkEmployeesTable() {
  try {
    console.log('\nChecking employees table for admin users...');
    
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('role', 'admin');
    
    if (error) {
      console.error('Error checking employees:', error.message);
      return;
    }
    
    console.log('Admin users in employees table:', employees.length);
    employees.forEach(emp => {
      console.log(`- ${emp.name} (${emp.email}) - Role: ${emp.role}`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  }
}

async function main() {
  await checkEmployeesTable();
  await testAdminLogin();
}

main();
