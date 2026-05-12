-- Fix companies table - add missing columns
CREATE OR REPLACE FUNCTION fix_companies_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER supabase_admin
AS $$
BEGIN
  ALTER TABLE companies 
    ADD COLUMN IF NOT EXISTS code TEXT,
    ADD COLUMN IF NOT EXISTS ded_number TEXT,
    ADD COLUMN IF NOT EXISTS username TEXT,
    ADD COLUMN IF NOT EXISTS password TEXT;
END;
$$;

-- Fix employees table - add missing columns  
CREATE OR REPLACE FUNCTION fix_employees_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER supabase_admin
AS $$
BEGIN
  ALTER TABLE employees 
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS department TEXT,
    ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2);
END;
$$;

-- Create missing indexes
CREATE OR REPLACE FUNCTION create_missing_indexes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER supabase_admin
AS $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
  CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
  CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
END;
$$;

-- Add RLS policies for store items
CREATE OR REPLACE FUNCTION add_store_rls_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER supabase_admin
AS $$
BEGIN
  DROP POLICY IF EXISTS "Admins can do everything on store_items" ON store_items;
  DROP POLICY IF EXISTS "Staff can manage store_items for their company" ON store_items;
  DROP POLICY IF EXISTS "Customers can view store_items for their company" ON store_items;
  
  CREATE POLICY "Admins can do everything on store_items" ON store_items
    FOR ALL USING (
      (auth.jwt() ->> 'role')::text = 'admin'
    );
        
  CREATE POLICY "Staff can manage store_items for their company" ON store_items
    FOR ALL USING (
      (auth.jwt() ->> 'role')::text IN ('admin', 'staff') AND
      company_id IN (
        SELECT company_id FROM employees
        WHERE email = auth.jwt() ->> 'email'
      )
    );
        
  CREATE POLICY "Customers can view store_items for their company" ON store_items
    FOR SELECT USING (
      (auth.jwt() ->> 'role')::text = 'customer' AND
      company_id IN (
        SELECT company_id FROM employees
        WHERE email = auth.jwt() ->> 'email'
      )
    );
END;
$$;
