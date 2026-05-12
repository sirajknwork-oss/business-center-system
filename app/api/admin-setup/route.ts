import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    // Create admin_users_storage table
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
      
      CREATE POLICY IF NOT EXISTS "Creators can do everything on admin_users_storage" ON admin_users_storage
        FOR ALL USING (
          (auth.jwt() ->> 'role')::text = 'creator'
        );
    `;

    // Execute SQL using direct SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query: createTableSQL })
    });

    if (!response.ok) {
      // Try alternative approach
      const { error } = await supabaseAdmin
        .from('admin_users_storage')
        .select('count')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, try to create it via insert
        const { error: insertError } = await supabaseAdmin
          .from('admin_users_storage')
          .insert([{
            name: 'Setup Admin',
            email: 'setup@temp.com',
            password: 'setup123',
            role: 'admin'
          }]);
        
        if (insertError) {
          return NextResponse.json(
            { error: "Failed to create table", details: insertError.message },
            { status: 500 }
          );
        }
        
        // Clean up setup record
        await supabaseAdmin
          .from('admin_users_storage')
          .delete()
          .eq('email', 'setup@temp.com');
      }
    }

    // Test table creation
    const { error } = await supabaseAdmin
      .from('admin_users_storage')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: "Table creation failed", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "admin_users_storage table created successfully" 
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
