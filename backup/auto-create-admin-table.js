const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminTable() {
  console.log('🔧 Creating admin_users_storage table automatically...\n');

  try {
    // Method 1: Try using raw SQL via POST to Supabase REST API
    const sql = `
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
      
      CREATE POLICY IF NOT EXISTS "Creators can do everything on admin_users_storage" ON admin_users_storage
        FOR ALL USING (
          (auth.jwt() ->> 'role')::text = 'creator'
        );
    `;

    // Try to execute via direct REST API call
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'apikey': supabaseServiceRoleKey,
      },
      body: JSON.stringify({ sql })
    });

    if (response.ok) {
      console.log('✅ Table created successfully via REST API');
      return true;
    } else {
      console.log('❌ REST API failed:', await response.text());
    }

    // Method 2: Try using Supabase SQL API
    const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'apikey': supabaseServiceRoleKey,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query: sql })
    });

    if (sqlResponse.ok) {
      console.log('✅ Table created successfully via SQL API');
      return true;
    } else {
      console.log('❌ SQL API failed:', await sqlResponse.text());
    }

    // Method 3: Try individual table operations
    console.log('🔄 Trying individual table operations...');
    
    // First try to create a test record to see if table exists
    const testData = {
      name: 'Test Admin',
      email: 'test@example.com',
      password: 'test123',
      role: 'admin'
    };

    const { data, error } = await supabaseAdmin
      .from('admin_users_storage')
      .insert([testData])
      .select();

    if (error && error.code === 'PGRST116') {
      console.log('❌ Table does not exist. Manual creation required.');
      console.log('\n📋 Please execute this SQL in Supabase dashboard:');
      console.log('File: create-admin-table-sql.sql');
      return false;
    } else if (error) {
      console.log('❌ Other error:', error.message);
      return false;
    } else {
      console.log('✅ Table exists and is working');
      
      // Clean up test data
      await supabaseAdmin
        .from('admin_users_storage')
        .delete()
        .eq('email', 'test@example.com');
      
      return true;
    }

  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function verifyTable() {
  console.log('\n🔍 Verifying table creation...');
  
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users_storage')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Table verification failed:', error.message);
      return false;
    } else {
      console.log('✅ Table verified and working');
      return true;
    }
  } catch (err) {
    console.log('❌ Verification error:', err.message);
    return false;
  }
}

async function main() {
  const created = await createAdminTable();
  
  if (created) {
    const verified = await verifyTable();
    if (verified) {
      console.log('\n🎉 admin_users_storage table is ready!');
      console.log('✅ Admin user creation will now work properly');
    }
  } else {
    console.log('\n⚠️  Automatic creation failed.');
    console.log('Please manually create the table using create-admin-table-sql.sql');
  }
}

main();
