// Fix Database Tables - Create Employees and Admin Users Storage tables
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(sql, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Error executing ${description}:`, error);
      return false;
    }
    
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (err) {
    console.error(`❌ Exception in ${description}:`, err);
    return false;
  }
}

async function createTablesDirectly() {
  console.log('🚀 Starting database table creation...\n');
  
  try {
    // Create Employees table
    console.log('📋 Creating Employees table...');
    
    const employeesSQL = `
      -- Drop existing table if it exists
      DROP TABLE IF EXISTS employees CASCADE;
      
      -- Create new employees table with UAE fields
      CREATE TABLE employees (
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
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
        role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'customer')),
        created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable Row Level Security
      ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
      
      -- Create indexes
      CREATE INDEX idx_employees_company_id ON employees(company_id);
      CREATE INDEX idx_employees_role ON employees(role);
      CREATE INDEX idx_employees_status ON employees(status);
      CREATE INDEX idx_employees_email ON employees(email);
      CREATE INDEX idx_employees_employee_id ON employees(employee_id);
    `;
    
    const { error: employeesError } = await supabase
      .from('employees')
      .select('id')
      .limit(1);
      
    if (employeesError && employeesError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('📝 Employees table not found, creating...');
      
      // Try direct SQL execution (might not work without admin functions)
      try {
        const { data, error } = await supabase
          .rpc('exec_sql', { sql_query: employeesSQL });
          
        if (error) {
          console.log('⚠️ Direct SQL execution failed, trying alternative approach...');
        } else {
          console.log('✅ Employees table created successfully');
        }
      } catch (err) {
        console.log('⚠️ RPC method not available, table creation skipped');
      }
    } else {
      console.log('✅ Employees table already exists');
    }
    
    // Create Admin Users Storage table
    console.log('\n📋 Creating Admin Users Storage table...');
    
    const adminUsersSQL = `
      -- Drop existing table if it exists
      DROP TABLE IF EXISTS admin_users_storage CASCADE;
      
      -- Create new admin_users_storage table
      CREATE TABLE admin_users_storage (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
        company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
        customer_type TEXT CHECK (customer_type IN ('company', 'individual')),
        created_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable Row Level Security
      ALTER TABLE admin_users_storage ENABLE ROW LEVEL SECURITY;
      
      -- Create indexes
      CREATE INDEX idx_admin_users_storage_role ON admin_users_storage(role);
      CREATE INDEX idx_admin_users_storage_email ON admin_users_storage(email);
      CREATE INDEX idx_admin_users_storage_company_id ON admin_users_storage(company_id);
    `;
    
    const { error: adminError } = await supabase
      .from('admin_users_storage')
      .select('id')
      .limit(1);
      
    if (adminError && adminError.code === 'PGRST116') {
      console.log('📝 Admin Users Storage table not found, creating...');
      
      try {
        const { data, error } = await supabase
          .rpc('exec_sql', { sql_query: adminUsersSQL });
          
        if (error) {
          console.log('⚠️ Direct SQL execution failed for admin table');
        } else {
          console.log('✅ Admin Users Storage table created successfully');
        }
      } catch (err) {
        console.log('⚠️ RPC method not available for admin table');
      }
    } else {
      console.log('✅ Admin Users Storage table already exists');
    }
    
    // Test table access
    console.log('\n🔍 Testing table access...');
    
    try {
      const { data: employeesData, error: employeesTestError } = await supabase
        .from('employees')
        .select('id, name')
        .limit(1);
        
      if (employeesTestError) {
        console.log('❌ Employees table access failed:', employeesTestError.message);
      } else {
        console.log('✅ Employees table accessible');
      }
    } catch (err) {
      console.log('❌ Employees table test failed:', err.message);
    }
    
    try {
      const { data: adminData, error: adminTestError } = await supabase
        .from('admin_users_storage')
        .select('id, name')
        .limit(1);
        
      if (adminTestError) {
        console.log('❌ Admin Users Storage table access failed:', adminTestError.message);
      } else {
        console.log('✅ Admin Users Storage table accessible');
      }
    } catch (err) {
      console.log('❌ Admin Users Storage table test failed:', err.message);
    }
    
    console.log('\n🎉 Database table creation process completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. If tables were created successfully, restart your development server');
    console.log('2. Test the admin management system');
    console.log('3. If tables still don\'t exist, run the SQL files manually in Supabase Dashboard');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
createTablesDirectly().catch(console.error);
