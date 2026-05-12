-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_items ENABLE ROW LEVEL SECURITY;

-- Companies table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expiry items table
CREATE TABLE expiry_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  expires_at DATE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for companies
CREATE POLICY "Admins can do everything on companies" ON companies
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Staff can view companies" ON companies
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text IN ('admin', 'staff')
  );

CREATE POLICY "Customers can view their own company" ON companies
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text = 'customer'
    AND id IN (
      SELECT company_id FROM employees
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- RLS Policies for employees
CREATE POLICY "Admins can do everything on employees" ON employees
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Staff can view and manage employees" ON employees
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text IN ('admin', 'staff')
  );

CREATE POLICY "Customers can view employees in their company" ON employees
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text = 'customer'
    AND company_id IN (
      SELECT company_id FROM employees
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- RLS Policies for expiry_items
CREATE POLICY "Admins can do everything on expiry_items" ON expiry_items
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Staff can view and manage expiry_items" ON expiry_items
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text IN ('admin', 'staff')
  );

CREATE POLICY "Customers can view expiry_items for their company" ON expiry_items
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text = 'customer'
    AND company_id IN (
      SELECT company_id FROM employees
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Insert some sample data
INSERT INTO companies (name, address) VALUES
  ('TechCorp Inc.', '123 Tech Street, Silicon Valley'),
  ('DataFlow Solutions', '456 Data Ave, New York'),
  ('CloudNine Systems', '789 Cloud Blvd, Austin');

INSERT INTO employees (name, email, company_id, role) VALUES
  ('John Admin', 'admin@techcorp.com', (SELECT id FROM companies WHERE name = 'TechCorp Inc.'), 'admin'),
  ('Jane Staff', 'staff@techcorp.com', (SELECT id FROM companies WHERE name = 'TechCorp Inc.'), 'staff'),
  ('Bob Customer', 'customer@techcorp.com', (SELECT id FROM companies WHERE name = 'TechCorp Inc.'), 'customer');

INSERT INTO expiry_items (title, description, expires_at, company_id) VALUES
  ('SSL Certificate', 'Main website SSL certificate', '2026-12-31', (SELECT id FROM companies WHERE name = 'TechCorp Inc.')),
  ('Domain Registration', 'techcorp.com domain', '2027-03-15', (SELECT id FROM companies WHERE name = 'TechCorp Inc.')),
  ('Software License', 'Adobe Creative Suite', '2026-08-20', (SELECT id FROM companies WHERE name = 'TechCorp Inc.'));
