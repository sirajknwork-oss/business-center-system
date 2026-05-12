# Manual Table Creation Instructions

## Issue
Database tables exist but are not accessible due to schema cache issues.

## Solution: Manual Table Creation in Supabase Dashboard

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project
3. Go to "SQL Editor" from the left menu

### Step 2: Create/Update Employees Table
Copy and run this SQL:

```sql
-- Drop existing table if it exists
DROP TABLE IF EXISTS employees CASCADE;

-- Create new employees table with UAE fields
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  passport_number TEXT,
  visa_number TEXT,
  emirates_id_number TEXT,
  labour_card_number TEXT,
  designation TEXT,
  salary DECIMAL(10,2),
  joining_date DATE,
  nationality TEXT,
  mobile TEXT,
  email TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'customer')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
```

### Step 3: Create/Update Admin Users Storage Table
Copy and run this SQL:

```sql
-- Drop existing table if it exists
DROP TABLE IF EXISTS admin_users_storage CASCADE;

-- Create new admin_users_storage table
CREATE TABLE admin_users_storage (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  customer_type TEXT CHECK (customer_type IN ('company', 'individual')),
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users_storage ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_admin_users_storage_role ON admin_users_storage(role);
CREATE INDEX idx_admin_users_storage_email ON admin_users_storage(email);
CREATE INDEX idx_admin_users_storage_company_id ON admin_users_storage(company_id);
```

### Step 4: Test the Tables
After running the SQL, test by running these queries:

```sql
-- Test employees table
SELECT COUNT(*) FROM employees;

-- Test admin_users_storage table  
SELECT COUNT(*) FROM admin_users_storage;
```

### Step 5: Restart Development Server
After tables are created successfully:
1. Stop your development server (Ctrl+C)
2. Run: `npm run dev`
3. Test the admin management system

### Alternative: Check Existing Tables
If tables already exist, just check their structure:

```sql
-- Check employees table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;

-- Check admin_users_storage table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admin_users_storage' 
ORDER BY ordinal_position;
```

## Common Issues & Solutions

1. **Permission Denied**: Make sure you're using the service role key or have admin access
2. **Table Not Found**: The table might not exist, run the creation SQL
3. **Schema Cache**: Restart the development server after table creation
4. **RLS Policies**: If you get permission errors, check Row Level Security policies

## Next Steps After Manual Creation

1. Test admin user creation
2. Test edit/update/delete functionality
3. Verify employee module works
4. Test company module integration
