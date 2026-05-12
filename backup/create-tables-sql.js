const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createTablesDirectly() {
  console.log('🔧 Creating database tables directly...\n');

  try {
    // Create companies table
    console.log('📝 Creating companies table...');
    let { error } = await supabaseAdmin
      .from('companies')
      .insert({
        name: '__test_companies_table__'
      });

    if (error && error.code === 'PGRST116') {
      console.log('Table does not exist, need to create via SQL');
      // Table doesn't exist, will create via insert after table exists
    }

    // Instead, try to use the admin API to execute raw SQL
    console.log('📝 Attempting to create tables via SQL...');

    const sqlStatements = [
      `
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
      `,
      `
      CREATE TABLE IF NOT EXISTS employees (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'staff',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      `,
      `
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
      `,
      `
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
      `
    ];

    for (const sql of sqlStatements) {
      try {
        // Use fetch to call the Supabase SQL API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceRoleKey}`,
            'apikey': supabaseServiceRoleKey,
          },
          body: JSON.stringify({ sql: sql.trim() })
        });

        if (!response.ok) {
          const text = await response.text();
          console.log('Response:', response.status, text);
        } else {
          console.log('✅ SQL executed successfully');
        }
      } catch (err) {
        console.log('⚠️ SQL execution attempt failed (this might be expected):', err.message);
      }
    }

    console.log('\n✅ Database table creation process completed!');
    console.log('Note: Tables may have been created. You can verify in Supabase dashboard.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTablesDirectly();
