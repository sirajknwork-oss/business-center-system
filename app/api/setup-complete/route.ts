import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST() {
  try {
    console.log('🔧 Setting up complete database infrastructure...');

    // Create all necessary tables with proper schema
    const createTablesSQL = `
      -- Create companies table
      CREATE TABLE IF NOT EXISTS companies (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        ded_number TEXT,
        username TEXT,
        password TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create employees table
      CREATE TABLE IF NOT EXISTS employees (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create admin_users_storage table
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

      -- Enable Row Level Security
      ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
      ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
      ALTER TABLE admin_users_storage ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies for admin_users_storage
      CREATE POLICY IF NOT EXISTS "Creators can do everything on admin_users_storage" ON admin_users_storage
        FOR ALL USING (
          (auth.jwt() ->> 'role')::text = 'creator'
        );

      -- Create sample data
      INSERT INTO companies (id, code, name, ded_number, username, password) VALUES 
        (gen_random_uuid(), 'TECH001', 'TechCorp Inc.', 'DED-12345', 'techcorp', 'password123');

      INSERT INTO employees (id, name, email, role, company_id) VALUES 
        (gen_random_uuid(), 'John Admin', 'admin@techcorp.com', 'admin', (SELECT id FROM companies WHERE code = 'TECH001'));
    `;

    // Execute SQL using direct approach
    const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: createTablesSQL 
    });

    if (sqlError) {
      console.log('❌ SQL execution failed:', sqlError);
      return NextResponse.json(
        { error: "Failed to execute SQL", details: sqlError.message }, 
        { status: 500 }
      );
    }

    console.log('✅ Database infrastructure setup complete!');
    
    return NextResponse.json({ 
      success: true, 
      message: "Complete database setup successful" 
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
