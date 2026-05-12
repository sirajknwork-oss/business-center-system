const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying database setup...\n');

  // Test 1: Check if employees table exists
  console.log('1️⃣ Testing employees table...');
  try {
    const { data, error } = await supabaseAdmin
      .from('employees')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Employees table error:', error.message);
    } else {
      console.log('✅ Employees table exists, records:', data);
    }
  } catch (err) {
    console.log('❌ Employees table test error:', err.message);
  }

  // Test 2: Check if admin_users_storage table exists
  console.log('2️⃣ Testing admin_users_storage table...');
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users_storage')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Admin users storage table error:', error.message);
    } else {
      console.log('✅ Admin users storage table exists, records:', data);
    }
  } catch (err) {
    console.log('❌ Admin users storage table test error:', err.message);
  }

  // Test 3: Try creating a test admin user
  console.log('3️⃣ Testing admin user creation...');
  try {
    const testUser = {
      name: 'Test Admin',
      email: 'testadmin@verify.com',
      password: 'test123',
      role: 'admin',
      company_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('admin_users_storage')
      .insert([testUser])
      .select()
      .single();

    if (error) {
      console.log('❌ Admin user creation test failed:', error.message);
    } else {
      console.log('✅ Admin user creation test successful:', data.name);
      
      // Clean up test user
      await supabaseAdmin
        .from('admin_users_storage')
        .delete()
        .eq('email', 'testadmin@verify.com');
    }
  } catch (err) {
    console.log('❌ Admin user creation test error:', err.message);
  }

  console.log('\n📋 Database Verification Summary:');
  console.log('   - Employees table: ' + (data ? '✅ Exists' : '❌ Missing'));
  console.log('   - Admin users storage table: ' + (data ? '✅ Exists' : '❌ Missing'));
  console.log('   - Admin user creation: ' + (data ? '✅ Working' : '❌ Failed'));

  if (data) {
    console.log('\n🎉 Database setup is complete and working!');
    console.log('   All tables exist and are functional');
    console.log('   Admin creation should work properly now');
  } else {
    console.log('\n⚠️ Database setup still has issues');
    console.log('   Tables may not be properly created');
    console.log('   Need to check Supabase dashboard');
  }
}

verifyDatabaseSetup();
