-- Complete UAE Business Center System Setup
-- Tables + Sample Data for 3 Companies, 1 Staff, 1 Admin with Edit/Update/Delete options

-- =====================================
-- 1. CREATE TABLES
-- =====================================

-- Companies Table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_code TEXT UNIQUE,
  company_name TEXT NOT NULL,
  cn_number TEXT,
  trade_license_number TEXT,
  establishment_card_number TEXT,
  vat_number TEXT,
  contact_person TEXT,
  mobile TEXT,
  email TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  assigned_staff_id UUID,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Employees Table
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
  status TEXT DEFAULT 'active',
  role TEXT DEFAULT 'staff',
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Admin Users Storage Table
CREATE TABLE admin_users_storage (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  customer_type TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_users_storage ENABLE ROW LEVEL SECURITY;

-- =====================================
-- 2. INSERT SAMPLE DATA
-- =====================================

-- Insert Sample Companies (3 companies with C-11000, C-11001, C-11002)
INSERT INTO companies (
  company_code, 
  company_name, 
  cn_number, 
  trade_license_number, 
  establishment_card_number, 
  vat_number, 
  contact_person, 
  mobile, 
  email, 
  address, 
  status
) VALUES
(
  'C-11000',
  'Al Falah Business Center',
  'CN-2023-11000',
  'TL-2023-DXB-11000',
  'EC-2023-11000',
  'VAT-10011000',
  'Mohammed Ali',
  '+971501100001',
  'info@alfalah.com',
  'Deira, Dubai, UAE',
  'active'
),
(
  'C-11001', 
  'Gulf Star Typing Services',
  'CN-2023-11001',
  'TL-2023-DXB-11001',
  'EC-2023-11001',
  'VAT-10011001',
  'Ahmed Hassan',
  '+971501100002',
  'contact@gulfstar.com',
  'Bur Dubai, Dubai, UAE',
  'active'
),
(
  'C-11002',
  'Emirates Business Solutions',
  'CN-2023-11002',
  'TL-2023-DXB-11002',
  'EC-2023-11002',
  'VAT-10011002',
  'Saeed Khalid',
  '+971501100003',
  'info@emiratesbs.com',
  'Al Quoz, Dubai, UAE',
  'active'
);

-- Insert Sample Admin User (for admin_users_storage table)
INSERT INTO admin_users_storage (
  id,
  name,
  email,
  password,
  role,
  created_at,
  updated_at
) VALUES
(
  'admin-001',
  'System Administrator',
  'admin@businesscenter.com',
  'admin123',
  'admin',
  NOW(),
  NOW()
);

-- Insert Sample Staff Employee (for employees table)
INSERT INTO employees (
  employee_id,
  company_id,
  name,
  passport_number,
  visa_number,
  emirates_id_number,
  labour_card_number,
  designation,
  salary,
  joining_date,
  nationality,
  mobile,
  email,
  status,
  role,
  created_at,
  updated_at
) VALUES
(
  'EMP-001',
  (SELECT id FROM companies WHERE company_code = 'C-11000'),
  'Rashid Ahmed',
  'P123456789',
  'V987654321',
  'EID-789456123',
  'LC-2023-001',
  'Office Manager',
  8500.00,
  '2023-01-15',
  'India',
  '+971525551234',
  'rashid@alfalah.com',
  'active',
  'staff',
  NOW(),
  NOW()
);

-- Insert Sample Customer Users (for admin_users_storage table)
INSERT INTO admin_users_storage (
  id,
  name,
  email,
  password,
  role,
  company_id,
  customer_type,
  created_at,
  updated_at
) VALUES
(
  'customer-001',
  'Al Falah Customer',
  'customer@alfalah.com',
  'customer123',
  'customer',
  (SELECT id FROM companies WHERE company_code = 'C-11000'),
  'company',
  NOW(),
  NOW()
),
(
  'customer-002',
  'Ahmed Individual',
  'ahmed.individual@gmail.com',
  'customer123',
  'customer',
  NULL,
  'individual',
  NOW(),
  NOW()
);

-- =====================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================

CREATE INDEX idx_companies_company_code ON companies(company_code);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_admin_users_storage_role ON admin_users_storage(role);
CREATE INDEX idx_admin_users_storage_email ON admin_users_storage(email);

-- =====================================
-- 4. VERIFICATION QUERIES
-- =====================================

-- Verify data insertion
SELECT 
  'Companies' as table_name, 
  COUNT(*) as record_count 
FROM companies
UNION ALL
SELECT 
  'Employees' as table_name, 
  COUNT(*) as record_count 
FROM employees
UNION ALL
SELECT 
  'Admin Users Storage' as table_name, 
  COUNT(*) as record_count 
FROM admin_users_storage;

-- Display sample data
SELECT 
  c.company_code,
  c.company_name,
  c.contact_person,
  c.mobile,
  COUNT(e.id) as employee_count
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.company_code, c.company_name, c.contact_person, c.mobile
ORDER BY c.company_code;

-- Display admin users
SELECT 
  id,
  name,
  email,
  role,
  company_id,
  customer_type,
  created_at
FROM admin_users_storage
ORDER BY role, name;
