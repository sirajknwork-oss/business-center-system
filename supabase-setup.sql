-- UAE Business Center System Database Setup
-- Run this in Supabase SQL Editor

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_code TEXT NOT NULL UNIQUE,
  cn_number TEXT,
  trade_license_number TEXT,
  establishment_card_number TEXT,
  vat_number TEXT,
  contact_person TEXT,
  mobile TEXT,
  email TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  employee_id TEXT UNIQUE,
  designation TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expiry Items Table
CREATE TABLE IF NOT EXISTS expiry_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  expires_at DATE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  assigned_companies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create Creator User
INSERT INTO users (email, name, password, role, status) 
VALUES ('sirajkn.work@gmail.com', 'System Administrator', 'SirajZaira@126', 'creator', 'active')
ON CONFLICT (email) DO NOTHING;

-- RLS Policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Creator can do everything" ON companies
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE 
    email = 'sirajkn.work@gmail.com' AND role = 'creator'
  ));

CREATE POLICY "Creator can do everything" ON employees
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE 
    email = 'sirajkn.work@gmail.com' AND role = 'creator'
  ));

CREATE POLICY "Creator can do everything" ON expiry_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE 
    email = 'sirajkn.work@gmail.com' AND role = 'creator'
  ));

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_expiry_items_expires_at ON expiry_items(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expiry_items_updated_at BEFORE UPDATE ON expiry_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
