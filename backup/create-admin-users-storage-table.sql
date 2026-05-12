-- Create Admin Users Storage Table

-- Drop existing table if it exists (for fresh start)
DROP TABLE IF EXISTS admin_users_storage CASCADE;

-- Create new admin_users_storage table with all required fields
CREATE TABLE admin_users_storage (
  id TEXT PRIMARY KEY, -- Using TEXT for manual ID generation
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL, -- Note: In production, use proper hashing
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  customer_type TEXT CHECK (customer_type IN ('company', 'individual')),
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users_storage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin Users Storage
CREATE POLICY "Creators can do everything on admin_users_storage" ON admin_users_storage
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text = 'creator'
  );

CREATE POLICY "Admins can view admin_users_storage" ON admin_users_storage
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text IN ('admin', 'creator')
  );

-- Create indexes for better performance
CREATE INDEX idx_admin_users_storage_role ON admin_users_storage(role);
CREATE INDEX idx_admin_users_storage_email ON admin_users_storage(email);
CREATE INDEX idx_admin_users_storage_company_id ON admin_users_storage(company_id);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_users_storage_updated_at 
    BEFORE UPDATE ON admin_users_storage 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO admin_users_storage (id, name, email, password, role, customer_type) VALUES
('1', 'System Admin', 'admin@businesscenter.com', 'admin123', 'admin', NULL),
('2', 'John Staff', 'staff@businesscenter.com', 'staff123', 'staff', NULL),
('3', 'Customer Company', 'customer@company.com', 'customer123', 'customer', 'company'),
('4', 'Customer Individual', 'customer@individual.com', 'customer123', 'customer', 'individual');
