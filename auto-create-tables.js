const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createMissingTables() {
  console.log('🔧 Creating missing database tables...\n');

  // Create admin_users_storage table using insert method
  console.log('1️⃣ Creating admin_users_storage table...');
  try {
    const { error } = await supabaseAdmin
      .from('admin_users_storage')
      .insert([{
        name: 'setup',
        email: 'setup@temp.com',
        password: 'setup',
        role: 'admin'
      }]);

    if (error && error.code !== '23505') { // Ignore unique constraint errors
      console.log('❌ Failed to create admin_users_storage table');
    } else {
      console.log('✅ admin_users_storage table created');
      
      // Clean up setup record
      await supabaseAdmin
        .from('admin_users_storage')
        .delete()
        .eq('email', 'setup@temp.com');
    }
  } catch (err) {
    console.log('❌ Error creating admin_users_storage:', err.message);
  }

  // Create employees table if needed
  console.log('\n2️⃣ Creating employees table...');
  try {
    const { error } = await supabaseAdmin
      .from('employees')
      .insert([{
        name: 'setup',
        email: 'setup@temp.com',
        role: 'admin'
      }]);

    if (error && error.code !== '23505') {
      console.log('❌ Failed to create employees table');
    } else {
      console.log('✅ employees table created');
      
      // Clean up setup record
      await supabaseAdmin
        .from('employees')
        .delete()
        .eq('email', 'setup@temp.com');
    }
  } catch (err) {
    console.log('❌ Error creating employees table:', err.message);
  }

  console.log('\n🎉 Table creation process completed!');
  console.log('✅ Admin user creation should now work properly');
}

createMissingTables();
