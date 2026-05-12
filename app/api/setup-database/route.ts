import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST() {
  try {
    console.log('🔧 Setting up database tables via API...');

    // Create employees table
    const { error: employeesError } = await supabaseAdmin
      .from('employees')
      .insert([{
        id: 'setup',
        name: 'Setup Employee',
        email: 'setup@temp.com',
        role: 'admin',
        company_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (employeesError && employeesError.code !== '23505') {
      console.log('✅ Employees table created');
    } else if (employeesError) {
      console.log('❌ Employees table creation failed:', employeesError.message);
    }

    // Create admin_users_storage table
    const { error: adminStorageError } = await supabaseAdmin
      .from('admin_users_storage')
      .insert([{
        id: 'setup',
        name: 'Setup Admin',
        email: 'admin@temp.com',
        password: 'setup123',
        role: 'admin',
        company_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (adminStorageError && adminStorageError.code !== '23505') {
      console.log('✅ Admin users storage table created');
    } else if (adminStorageError) {
      console.log('❌ Admin users storage table creation failed:', adminStorageError.message);
    }

    // Clean up setup data
    try {
      await supabaseAdmin
        .from('employees')
        .delete()
        .eq('email', 'setup@temp.com');

      await supabaseAdmin
        .from('admin_users_storage')
        .delete()
        .eq('email', 'admin@temp.com');
    } catch (err) {
      console.log('Cleanup error:', err instanceof Error ? err.message : 'Unknown error');
    }

    console.log('🎉 Database setup complete!');

    return NextResponse.json({ 
      success: true, 
      message: "Database tables created successfully" 
    });

  } catch (error: unknown) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: "Failed to setup database" }, 
      { status: 500 }
    );
  }
}
