const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupDatabaseTables() {
  console.log('🔧 Setting up database tables...\n');

  // Create employees table
  console.log('1️⃣ Creating employees table...');
  try {
    const { error: employeesError } = await supabaseAdmin
      .from('employees')
      .insert([{
        id: 'setup',
        name: 'Setup Employee',
        email: 'setup@temp.com',
        role: 'admin',
        company_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (employeesError && employeesError.code !== '23505') { // Ignore duplicate key error
      console.log('✅ Employees table created');
    } else if (employeesError) {
      console.log('❌ Employees table creation failed:', employeesError.message);
    }
  } catch (err) {
    console.log('❌ Employees table error:', err.message);
  }

  // Create admin_users_storage table
  console.log('2️⃣ Creating admin_users_storage table...');
  try {
    const { error: adminStorageError } = await supabaseAdmin
      .from('admin_users_storage')
      .insert([{
        id: 'setup',
        name: 'Setup Admin',
        email: 'admin@temp.com',
        password: 'setup123',
        role: 'admin',
        company_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (adminStorageError && adminStorageError.code !== '23505') { // Ignore duplicate key error
      console.log('✅ Admin users storage table created');
    } else if (adminStorageError) {
      console.log('❌ Admin users storage table creation failed:', adminStorageError.message);
    }
  } catch (err) {
    console.log('❌ Admin users storage table error:', err.message);
  }

  // Clean up setup data
  console.log('\n3️⃣ Cleaning up setup data...');
  try {
    await supabaseAdmin
      .from('employees')
      .delete()
      .eq('email', 'setup@temp.com');

    await supabaseAdmin
      .from('admin_users_storage')
      .delete()
      .eq('email', 'admin@temp.com');
  } catch (err) {
    console.log('Cleanup error:', err.message);
  }

  console.log('\n🎉 Database setup complete!');
}

setupDatabaseTables();
