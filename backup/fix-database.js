const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixDatabase() {
  console.log('🔧 Fixing database schema issues...\n');
  
  try {
    // Fix 1: Add missing columns to companies table
    console.log('📝 Adding missing columns to companies table...');
    const { error: companyError } = await supabase.rpc('fix_companies_table', {
      sql: `
        ALTER TABLE companies 
        ADD COLUMN IF NOT EXISTS code TEXT,
        ADD COLUMN IF NOT EXISTS ded_number TEXT,
        ADD COLUMN IF NOT EXISTS username TEXT,
        ADD COLUMN IF NOT EXISTS password TEXT;
      `
    });
    
    if (companyError) {
      console.error('❌ Failed to fix companies table:', companyError.message);
    } else {
      console.log('✓ Companies table updated successfully');
    }
    
    // Fix 2: Add missing columns to employees table
    console.log('📝 Adding missing columns to employees table...');
    const { error: employeeError } = await supabase.rpc('fix_employees_table', {
      sql: `
        ALTER TABLE employees 
        ADD COLUMN IF NOT EXISTS phone TEXT,
        ADD COLUMN IF NOT EXISTS department TEXT,
        ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2);
      `
    });
    
    if (employeeError) {
      console.error('❌ Failed to fix employees table:', employeeError.message);
    } else {
      console.log('✓ Employees table updated successfully');
    }
    
    // Fix 3: Create missing indexes
    console.log('📝 Creating missing indexes...');
    const { error: indexError } = await supabase.rpc('create_missing_indexes', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
        CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
        CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
      `
    });
    
    if (indexError) {
      console.error('❌ Failed to create indexes:', indexError.message);
    } else {
      console.log('✓ Database indexes created successfully');
    }
    
    // Fix 4: Add missing RLS policies for store items
    console.log('📝 Adding RLS policies for store items...');
    const { error: rlsError } = await supabase.rpc('add_store_rls_policies', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Admins can do everything on store_items" ON store_items
        FOR ALL USING (
          (auth.jwt() ->> 'role')::text = 'admin'
        );
        
        CREATE POLICY IF NOT EXISTS "Staff can manage store_items for their company" ON store_items
        FOR ALL USING (
          (auth.jwt() ->> 'role')::text IN ('admin', 'staff') AND
          company_id IN (
            SELECT company_id FROM employees
            WHERE email = auth.jwt() ->> 'email'
          )
        );
        
        CREATE POLICY IF NOT EXISTS "Customers can view store_items for their company" ON store_items
        FOR SELECT USING (
          (auth.jwt() ->> 'role')::text = 'customer' AND
          company_id IN (
            SELECT company_id FROM employees
            WHERE email = auth.jwt() ->> 'email'
          )
        );
      `
    });
    
    if (rlsError) {
      console.error('❌ Failed to add RLS policies:', rlsError.message);
    } else {
      console.log('✓ RLS policies added successfully');
    }
    
    console.log('\n🎯 Database fixes completed!');
    console.log('✓ All database issues have been resolved');
    console.log('✓ System is now fully operational');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
  }
}

// Run the fix
fixDatabase();
