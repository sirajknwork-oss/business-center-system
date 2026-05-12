-- Create/Update Employees Table with UAE Business Center Fields

-- Drop existing table if it exists (for fresh start)
DROP TABLE IF EXISTS employees CASCADE;

-- Create new employees table with UAE fields
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE, -- Employee ID like EMP001
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

-- RLS Policies for Employees
CREATE POLICY "Creators can do everything on employees" ON employees
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text = 'creator'
  );

CREATE POLICY "Admins can view and manage employees" ON employees
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text IN ('admin', 'creator')
  );

CREATE POLICY "Staff can view employees in their company" ON employees
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text IN ('admin', 'staff', 'creator')
  );

CREATE POLICY "Customers can view their own employee record" ON employees
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text = 'customer' AND 
    auth.uid() = (SELECT created_by FROM employees WHERE id = employees.id)
  );

-- Create indexes for better performance
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO employees (employee_id, name, email, role, status) VALUES
('EMP001', 'John Doe', 'john@example.com', 'admin', 'active'),
('EMP002', 'Jane Smith', 'jane@example.com', 'staff', 'active'),
('EMP003', 'Mike Wilson', 'mike@example.com', 'staff', 'active');
