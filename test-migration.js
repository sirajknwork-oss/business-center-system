const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function migrateDatabase() {
  console.log('🔧 Running database migrations...\n');

  try {
    // Test 1: Try to create a test company
    console.log('Test 1: Attempting to insert into companies table...');
    const { error: companiesError } = await supabaseAdmin
      .from('companies')
      .insert({ name: 'Test Company', code: 'TEST-001' })
      .select()
      .single();

    if (companiesError) {
      console.log('❌ Companies table error:', companiesError.code, companiesError.message);
      if (companiesError.code === 'PGRST116') {
        console.log('Table does not exist. Creating via admin API...');
        // Try creating the table via admin endpoint
        const { error: createError } = await supabaseAdmin.admin.sql(`
          CREATE TABLE IF NOT EXISTS public.companies (
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
        `);
        if (createError) {
          console.log('Create error:', createError);
        }
      }
    } else {
      console.log('✅ Companies table exists and works');
    }

    // Test 2: Try to create a test employee
    console.log('\nTest 2: Attempting to insert into employees table...');
    const { error: employeesError } = await supabaseAdmin
      .from('employees')
      .insert({ name: 'Test Employee', email: 'test@test.com', role: 'staff' })
      .select()
      .single();

    if (employeesError) {
      console.log('❌ Employees table error:', employeesError.code, employeesError.message);
    } else {
      console.log('✅ Employees table exists and works');
    }

    // Test 3: Try to create a test expiry item
    console.log('\nTest 3: Attempting to insert into expiry_items table...');
    const { error: expiryError } = await supabaseAdmin
      .from('expiry_items')
      .insert({ title: 'Test Item', expires_at: '2026-12-31' })
      .select()
      .single();

    if (expiryError) {
      console.log('❌ Expiry items table error:', expiryError.code, expiryError.message);
    } else {
      console.log('✅ Expiry items table exists and works');
    }

    // Test 4: Try to create a test store item
    console.log('\nTest 4: Attempting to insert into store_items table...');
    const { error: storeError } = await supabaseAdmin
      .from('store_items')
      .insert({ name: 'Test Item', price: 10.00, stock_quantity: 5 })
      .select()
      .single();

    if (storeError) {
      console.log('❌ Store items table error:', storeError.code, storeError.message);
    } else {
      console.log('✅ Store items table exists and works');
    }

    console.log('\n✅ Migration test completed!');
    console.log('\nIf any tables are missing, you need to create them in Supabase dashboard.');
    console.log('Go to SQL Editor in Supabase and run the schema SQL files.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

migrateDatabase();
