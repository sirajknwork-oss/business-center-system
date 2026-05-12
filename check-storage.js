const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkStorage() {
  console.log('🔍 Checking database storage...\n');
  
  // Check connection
  console.log('📡 Testing database connection...');
  try {
    const { data, error } = await supabaseAdmin.from('_').select('*').limit(1);
    console.log('Connection test result:', error ? error.message : 'Connected');
  } catch (err) {
    console.log('Connection error:', err.message);
  }
  
  // List all tables
  console.log('\n📋 Checking available tables...');
  try {
    const { data: tables, error } = await supabaseAdmin.rpc('get_tables');
    if (error) {
      console.log('Error getting tables:', error.message);
    } else {
      console.log('Available tables:', tables);
    }
  } catch (err) {
    console.log('Cannot list tables:', err.message);
  }
  
  // Check specific tables
  const tablesToCheck = ['companies', 'employees', 'expiry_items', 'store_items'];
  
  for (const table of tablesToCheck) {
    console.log(`\n📊 Checking ${table} table...`);
    try {
      const { data, error, count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} records found`);
        
        // Get actual data if records exist
        if (count > 0) {
          const { data: records } = await supabaseAdmin
            .from(table)
            .select('*')
            .limit(5);
          console.log(`Sample data:`, records);
        }
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  // Check auth users
  console.log('\n👥 Checking auth users...');
  try {
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      console.log('Error listing users:', error.message);
    } else {
      console.log(`Found ${users.users.length} auth users`);
      users.users.forEach(user => {
        console.log(`- ${user.email} (Role: ${user.user_metadata?.role || 'Not set'})`);
      });
    }
  } catch (err) {
    console.log('Error checking auth users:', err.message);
  }
}

checkStorage();
