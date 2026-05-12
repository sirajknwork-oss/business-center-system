// Check Database Data Directly - Bypass Schema Cache
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTablesAndData() {
  console.log('🔍 Checking database tables and data...\n');
  
  try {
    // Check companies table
    console.log('📋 Checking Companies table...');
    try {
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, company_name')
        .limit(5);
      
      if (companiesError) {
        console.log('❌ Companies table error:', companiesError.message);
      } else {
        console.log('✅ Companies table accessible');
        console.log(`📊 Found ${companiesData?.length || 0} companies`);
        if (companiesData && companiesData.length > 0) {
          console.log('📝 Sample company:', companiesData[0]);
        }
      }
    } catch (err) {
      console.log('❌ Companies table exception:', err.message);
    }
    
    // Check employees table with different approaches
    console.log('\n📋 Checking Employees table...');
    
    // Method 1: Direct query
    try {
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, email, role')
        .limit(5);
      
      if (employeesError) {
        console.log('❌ Employees table error:', employeesError.message);
      } else {
        console.log('✅ Employees table accessible');
        console.log(`📊 Found ${employeesData?.length || 0} employees`);
        if (employeesData && employeesData.length > 0) {
          console.log('📝 Sample employee:', employeesData[0]);
        }
      }
    } catch (err) {
      console.log('❌ Employees table exception:', err.message);
    }
    
    // Method 2: Try with service role bypass
    try {
      console.log('🔄 Trying service role bypass...');
      const { data: serviceData, error: serviceError } = await supabase
        .rpc('get_all_employees');
      
      if (serviceError) {
        console.log('⚠️ Service role bypass failed:', serviceError.message);
      } else {
        console.log('✅ Service role bypass worked');
        console.log(`📊 Found ${serviceData?.length || 0} employees via RPC`);
      }
    } catch (err) {
      console.log('⚠️ RPC method not available:', err.message);
    }
    
    // Check admin_users_storage table
    console.log('\n📋 Checking Admin Users Storage table...');
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users_storage')
        .select('id, name, email, role')
        .limit(5);
      
      if (adminError) {
        console.log('❌ Admin Users Storage table error:', adminError.message);
      } else {
        console.log('✅ Admin Users Storage table accessible');
        console.log(`📊 Found ${adminData?.length || 0} admin users`);
        if (adminData && adminData.length > 0) {
          console.log('📝 Sample admin user:', adminData[0]);
        }
      }
    } catch (err) {
      console.log('❌ Admin Users Storage table exception:', err.message);
    }
    
    // Check if tables exist using information_schema
    console.log('\n🔍 Checking table existence via information_schema...');
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .in('tablename', ['companies', 'employees', 'admin_users_storage']);
      
      if (schemaError) {
        console.log('❌ Schema check failed:', schemaError.message);
      } else {
        console.log('✅ Schema check successful');
        console.log('📋 Found tables:', schemaData?.map(t => t.tablename) || []);
      }
    } catch (err) {
      console.log('❌ Schema check exception:', err.message);
    }
    
    // Try to insert test data to verify table functionality
    console.log('\n🧪 Testing table functionality...');
    
    // Test admin_users_storage insert
    try {
      const testUser = {
        id: `test-${Date.now()}`,
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'test123',
        role: 'admin'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('admin_users_storage')
        .insert([testUser])
        .select();
      
      if (insertError) {
        console.log('❌ Insert test failed:', insertError.message);
      } else {
        console.log('✅ Insert test successful');
        console.log('📝 Inserted test user:', insertData[0]);
        
        // Clean up test data
        await supabase
          .from('admin_users_storage')
          .delete()
          .eq('id', testUser.id);
        
        console.log('🧹 Test data cleaned up');
      }
    } catch (err) {
      console.log('❌ Insert test exception:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkTablesAndData().then(() => {
  console.log('\n🎉 Database check completed!');
  console.log('\n📝 Summary:');
  console.log('- If tables are accessible but UI shows no data, it\'s a UI issue');
  console.log('- If tables are not accessible, manual creation is needed');
  console.log('- If insert test works, tables are functional');
}).catch(console.error);
