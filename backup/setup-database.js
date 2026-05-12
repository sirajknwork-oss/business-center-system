const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupDatabase() {
  console.log('🔧 Setting up database schema...\n');

  try {
    // Check if companies table exists
    console.log('📋 Checking if companies table exists...');
    const { data: companiesCheck, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .limit(1);

    if (companiesError && companiesError.code === 'PGRST116') {
      console.log('❌ Companies table does not exist. Creating...');
      const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS companies (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            code TEXT UNIQUE,
            name TEXT NOT NULL,
            ded_number TEXT,
            username TEXT,
            password TEXT,
            address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
        `
      });
      if (createError) {
        console.error('Error creating companies table:', createError.message);
      } else {
        console.log('✅ Companies table created successfully');
      }
    } else if (companiesError) {
      console.error('Error checking companies table:', companiesError.message);
    } else {
      console.log('✅ Companies table already exists');
    }

    // Check if employees table exists
    console.log('\n📋 Checking if employees table exists...');
    const { data: employeesCheck, error: employeesError } = await supabaseAdmin
      .from('employees')
      .select('id')
      .limit(1);

    if (employeesError && employeesError.code === 'PGRST116') {
      console.log('❌ Employees table does not exist. Creating...');
      const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS employees (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
            role TEXT DEFAULT 'staff',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
        `
      });
      if (createError) {
        console.error('Error creating employees table:', createError.message);
      } else {
        console.log('✅ Employees table created successfully');
      }
    } else if (employeesError) {
      console.error('Error checking employees table:', employeesError.message);
    } else {
      console.log('✅ Employees table already exists');
    }

    // Check if expiry_items table exists
    console.log('\n📋 Checking if expiry_items table exists...');
    const { data: expiryCheck, error: expiryError } = await supabaseAdmin
      .from('expiry_items')
      .select('id')
      .limit(1);

    if (expiryError && expiryError.code === 'PGRST116') {
      console.log('❌ Expiry items table does not exist. Creating...');
      const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS expiry_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            expires_at DATE NOT NULL,
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
            created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          ALTER TABLE expiry_items ENABLE ROW LEVEL SECURITY;
        `
      });
      if (createError) {
        console.error('Error creating expiry_items table:', createError.message);
      } else {
        console.log('✅ Expiry items table created successfully');
      }
    } else if (expiryError) {
      console.error('Error checking expiry_items table:', expiryError.message);
    } else {
      console.log('✅ Expiry items table already exists');
    }

    // Check if store_items table exists
    console.log('\n📋 Checking if store_items table exists...');
    const { data: storeCheck, error: storeError } = await supabaseAdmin
      .from('store_items')
      .select('id')
      .limit(1);

    if (storeError && storeError.code === 'PGRST116') {
      console.log('❌ Store items table does not exist. Creating...');
      const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS store_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            stock_quantity INTEGER NOT NULL DEFAULT 0,
            category TEXT NOT NULL DEFAULT 'general',
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
        `
      });
      if (createError) {
        console.error('Error creating store_items table:', createError.message);
      } else {
        console.log('✅ Store items table created successfully');
      }
    } else if (storeError) {
      console.error('Error checking store_items table:', storeError.message);
    } else {
      console.log('✅ Store items table already exists');
    }

    console.log('\n✅ Database setup completed!');

  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  }
}

setupDatabase();
