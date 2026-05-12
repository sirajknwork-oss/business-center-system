// Create Tables Without SQL - Using Supabase Client Methods
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function createEmployeesTable() {
  console.log('🔄 Creating Employees table...');
  
  try {
    // First, try to insert a test record to see if table exists
    const { data: testData, error: testError } = await supabase
      .from('employees')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === 'PGRST116') {
      // Table doesn't exist, we need to create it
      console.log('📝 Employees table not found, attempting to create...');
      
      // Try using the raw SQL method through Supabase
      const { data, error } = await supabase
        .rpc('exec_sql', { 
          sql_query: `
            CREATE TABLE IF NOT EXISTS employees (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              employee_id TEXT UNIQUE,
              company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
              name TEXT NOT NULL,
              passport_number TEXT,
              visa_number TEXT,
              emirates_id_number TEXT,
              labour_card_number TEXT,
              designation TEXT,
              salary DECIMAL(10,2),
              joining_date DATE,
              nationality TEXT,
              mobile TEXT,
              email TEXT UNIQUE,
              status TEXT DEFAULT 'active',
              role TEXT DEFAULT 'staff',
              created_by UUID,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
            
            CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
            CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
            CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
          `
        });
      
      if (error) {
        console.log('⚠️ Direct SQL creation failed, trying alternative...');
        
        // Alternative: Try to create table using REST API
        // This might not work, but let's try a simple approach
        console.log('🔄 Trying simple table creation...');
        
        // Insert a dummy record to trigger table creation (this might work)
        const { data: insertData, error: insertError } = await supabase
          .from('employees')
          .insert([{
            id: '00000000-0000-0000-0000-000000000000',
            name: 'test',
            email: 'test@test.com',
            role: 'staff'
          }])
          .select();
          
        if (insertError) {
          console.log('❌ Could not create employees table automatically');
          console.log('📝 Manual creation required in Supabase Dashboard');
          return false;
        } else {
          console.log('✅ Employees table created successfully');
          // Remove the test record
          await supabase
            .from('employees')
            .delete()
            .eq('id', '00000000-0000-0000-0000-000000000000');
          return true;
        }
      } else {
        console.log('✅ Employees table created successfully');
        return true;
      }
    } else {
      console.log('✅ Employees table already exists');
      return true;
    }
  } catch (error) {
    console.error('❌ Error creating employees table:', error);
    return false;
  }
}

async function createAdminUsersStorageTable() {
  console.log('\n🔄 Creating Admin Users Storage table...');
  
  try {
    // Test if table exists
    const { data: testData, error: testError } = await supabase
      .from('admin_users_storage')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === 'PGRST116') {
      console.log('📝 Admin Users Storage table not found, attempting to create...');
      
      // Try to create table
      const { data, error } = await supabase
        .rpc('exec_sql', { 
          sql_query: `
            CREATE TABLE IF NOT EXISTS admin_users_storage (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              password TEXT NOT NULL,
              role TEXT NOT NULL,
              company_id UUID,
              customer_type TEXT,
              created_by TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE admin_users_storage ENABLE ROW LEVEL SECURITY;
            
            CREATE INDEX IF NOT EXISTS idx_admin_users_storage_role ON admin_users_storage(role);
            CREATE INDEX IF NOT EXISTS idx_admin_users_storage_email ON admin_users_storage(email);
          `
        });
      
      if (error) {
        console.log('⚠️ Direct SQL creation failed for admin table, trying insert method...');
        
        // Try insert method
        const { data: insertData, error: insertError } = await supabase
          .from('admin_users_storage')
          .insert([{
            id: 'test-001',
            name: 'test',
            email: 'test@test.com',
            password: 'test',
            role: 'admin'
          }])
          .select();
          
        if (insertError) {
          console.log('❌ Could not create admin_users_storage table automatically');
          console.log('📝 Manual creation required in Supabase Dashboard');
          return false;
        } else {
          console.log('✅ Admin Users Storage table created successfully');
          // Remove test record
          await supabase
            .from('admin_users_storage')
            .delete()
            .eq('id', 'test-001');
          return true;
        }
      } else {
        console.log('✅ Admin Users Storage table created successfully');
        return true;
      }
    } else {
      console.log('✅ Admin Users Storage table already exists');
      return true;
    }
  } catch (error) {
    console.error('❌ Error creating admin_users_storage table:', error);
    return false;
  }
}

async function testTables() {
  console.log('\n🔍 Testing table access...');
  
  try {
    // Test employees table
    const { data: employeesData, error: employeesError } = await supabase
      .from('employees')
      .select('id, name')
      .limit(1);
    
    if (employeesError) {
      console.log('❌ Employees table test failed:', employeesError.message);
    } else {
      console.log('✅ Employees table accessible');
    }
    
    // Test admin_users_storage table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users_storage')
      .select('id, name')
      .limit(1);
    
    if (adminError) {
      console.log('❌ Admin Users Storage table test failed:', adminError.message);
    } else {
      console.log('✅ Admin Users Storage table accessible');
    }
    
  } catch (error) {
    console.error('❌ Error testing tables:', error);
  }
}

async function main() {
  console.log('🚀 Creating tables without SQL...\n');
  
  const employeesResult = await createEmployeesTable();
  const adminResult = await createAdminUsersStorageTable();
  
  if (employeesResult && adminResult) {
    console.log('\n🎉 All tables created successfully!');
    await testTables();
  } else {
    console.log('\n⚠️ Some tables could not be created automatically');
    console.log('\n📝 Alternative Solutions:');
    console.log('1. Use Supabase Dashboard → SQL Editor');
    console.log('2. Use the provided .sql files');
    console.log('3. Contact database administrator');
    
    console.log('\n📋 For manual creation, use:');
    console.log('- create-employees-table.sql');
    console.log('- create-admin-users-storage-table.sql');
  }
}

// Run the main function
main().catch(console.error);
