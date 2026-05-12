-- CORRECT DATABASE ARCHITECTURE
-- UAE Business Center Management System
-- Proper separation of concerns

-- =====================================
-- 1. USERS TABLE (for login accounts)
-- =====================================
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL, -- Cannot be changed after creation
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Properly hashed passwords
  role TEXT NOT NULL CHECK (role IN ('creator', 'admin', 'staff', 'customer')),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- For admin/staff assignment
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 2. COMPANIES TABLE (business center clients)
-- =====================================
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  cn_number TEXT,
  trade_license_number TEXT,
  establishment_card_number TEXT,
  vat_number TEXT,
  contact_person TEXT,
  mobile TEXT,
  email TEXT,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 3. EMPLOYEES TABLE (company staff & visa holders)
-- =====================================
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to user account
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
  email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 4. ACTIVITY LOGS TABLE (audit trail)
-- =====================================
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 5. EXPIRY TRACKING TABLE
-- =====================================
CREATE TABLE expiry_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT,
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'renewed')),
  alert_sent BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =====================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_tracking ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Creators can manage all users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'creator');

CREATE POLICY "Admins can view assigned users" ON users
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'creator') OR
    auth.uid() = id
  );

CREATE POLICY "Staff can view their own record" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Customers can update their profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Companies table policies
CREATE POLICY "Creators can manage all companies" ON companies
  FOR ALL USING (auth.jwt() ->> 'role' = 'creator');

CREATE POLICY "Admins can manage assigned companies" ON companies
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('admin', 'creator') OR
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Staff can view assigned companies" ON companies
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'staff', 'creator') OR
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Customers can view their company" ON companies
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'customer' AND
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Employees table policies
CREATE POLICY "Creators can manage all employees" ON employees
  FOR ALL USING (auth.jwt() ->> 'role' = 'creator');

CREATE POLICY "Admins can manage company employees" ON employees
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('admin', 'creator') OR
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Staff can view company employees" ON employees
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'staff', 'creator') OR
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Activity logs policies (only creators can view)
CREATE POLICY "Only creators can view activity logs" ON activity_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'creator');

-- Expiry tracking policies
CREATE POLICY "Creators can manage all expiry tracking" ON expiry_tracking
  FOR ALL USING (auth.jwt() ->> 'role' = 'creator');

CREATE POLICY "Admins can manage company expiry tracking" ON expiry_tracking
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('admin', 'creator') OR
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Staff can view company expiry tracking" ON expiry_tracking
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'staff', 'creator') OR
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- =====================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_username ON users(username);

CREATE INDEX idx_companies_company_code ON companies(company_code);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_created_by ON companies(created_by);

CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_status ON employees(status);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

CREATE INDEX idx_expiry_tracking_company_id ON expiry_tracking(company_id);
CREATE INDEX idx_expiry_tracking_employee_id ON expiry_tracking(employee_id);
CREATE INDEX idx_expiry_tracking_expiry_date ON expiry_tracking(expiry_date);

-- =====================================
-- 8. TRIGGERS FOR UPDATED_AT
-- =====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expiry_tracking_updated_at 
    BEFORE UPDATE ON expiry_tracking 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- 9. SAMPLE DATA (proper relationships)
-- =====================================

-- Insert Creator User (manually created, no registration)
INSERT INTO users (
  username,
  email,
  password_hash,
  role,
  created_at,
  updated_at
) VALUES (
  'creator',
  'creator@businesscenter.com',
  '$2b$12$hashedpasswordexample', -- Use proper hashing in production
  'creator',
  NOW(),
  NOW()
);

-- Insert Sample Companies
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
  status,
  created_by
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
  'active',
  (SELECT id FROM users WHERE username = 'creator')
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
  'active',
  (SELECT id FROM users WHERE username = 'creator')
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
  'active',
  (SELECT id FROM users WHERE username = 'creator')
);

-- Insert Admin User
INSERT INTO users (
  username,
  email,
  password_hash,
  role,
  company_id,
  created_by,
  created_at,
  updated_at
) VALUES
(
  'admin001',
  'admin@alfalah.com',
  '$2b$12$hashedpasswordexample',
  'admin',
  (SELECT id FROM companies WHERE company_code = 'C-11000'),
  (SELECT id FROM users WHERE username = 'creator'),
  NOW(),
  NOW()
);

-- Insert Staff User
INSERT INTO users (
  username,
  email,
  password_hash,
  role,
  company_id,
  created_by,
  created_at,
  updated_at
) VALUES
(
  'staff001',
  'rashid@alfalah.com',
  '$2b$12$hashedpasswordexample',
  'staff',
  (SELECT id FROM companies WHERE company_code = 'C-11000'),
  (SELECT id FROM users WHERE username = 'creator'),
  NOW(),
  NOW()
);

-- Insert Employee Record (linked to staff user)
INSERT INTO employees (
  employee_id,
  company_id,
  user_id,
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
  created_by,
  created_at,
  updated_at
) VALUES
(
  'EMP-001',
  (SELECT id FROM companies WHERE company_code = 'C-11000'),
  (SELECT id FROM users WHERE username = 'staff001'),
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
  (SELECT id FROM users WHERE username = 'creator'),
  NOW(),
  NOW()
);

-- Insert Customer User
INSERT INTO users (
  username,
  email,
  password_hash,
  role,
  company_id,
  created_by,
  created_at,
  updated_at
) VALUES
(
  'customer001',
  'customer@alfalah.com',
  '$2b$12$hashedpasswordexample',
  'customer',
  (SELECT id FROM companies WHERE company_code = 'C-11000'),
  (SELECT id FROM users WHERE username = 'creator'),
  NOW(),
  NOW()
);

-- =====================================
-- 10. VERIFICATION QUERIES
-- =====================================

-- Check proper relationships
SELECT 
  u.username,
  u.email,
  u.role,
  c.company_name,
  e.employee_id,
  e.name as employee_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN employees e ON u.id = e.user_id
ORDER BY u.role, u.created_at;

-- Check company assignments
SELECT 
  c.company_code,
  c.company_name,
  COUNT(u.id) as assigned_users,
  COUNT(e.id) as employees
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.company_code, c.company_name
ORDER BY c.company_code;
