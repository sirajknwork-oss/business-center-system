const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminStorageTable() {
  console.log('🔧 Creating admin users storage table...\n');

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS admin_users_storage (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
      company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    ALTER TABLE admin_users_storage ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policies
    CREATE POLICY "Creators can do everything on admin_users_storage" ON admin_users_storage
      FOR ALL USING (
        (auth.jwt() ->> 'role')::text = 'creator'
      );
  `;

  try {
    // Try to execute the SQL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.log('SQL execution failed, tables may need to be created manually in Supabase dashboard');
      console.log('Please execute this SQL in Supabase SQL Editor:');
      console.log(createTableSQL);
    } else {
      console.log('✅ Admin users storage table created successfully');
    }
  } catch (err) {
    console.log('Error:', err.message);
    console.log('Please create the table manually in Supabase dashboard with the SQL above');
  }
}

createAdminStorageTable();
