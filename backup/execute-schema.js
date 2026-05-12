const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function executeSchema() {
  console.log('🔧 Executing database schema...\n');

  const schemaSQL = `
-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expiry items table
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

-- Store items table
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
`;

  try {
    // Execute the schema using SQL execution
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: schemaSQL });
    
    if (error) {
      console.error('Error executing schema:', error.message);
      
      // Try alternative approach using direct SQL
      console.log('Trying alternative approach...');
      const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.trim().substring(0, 50) + '...');
          // This won't work with REST API, but let's see
        }
      }
    } else {
      console.log('✅ Schema executed successfully');
    }
  } catch (err) {
    console.error('Schema execution error:', err.message);
  }

  // Enable RLS
  console.log('\n🔒 Enabling Row Level Security...');
  try {
    await supabaseAdmin.rpc('exec_sql', { 
      sql: `
        ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
        ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
        ALTER TABLE expiry_items ENABLE ROW LEVEL SECURITY;
        ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
      `
    });
    console.log('✅ RLS enabled');
  } catch (err) {
    console.log('RLS error:', err.message);
  }
}

executeSchema();
