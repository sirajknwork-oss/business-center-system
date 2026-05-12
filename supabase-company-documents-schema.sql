-- Add company document expiry tracking
-- This extends the existing expiry_items table to include document type

-- Add document_type column to expiry_items table
ALTER TABLE expiry_items ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'general';

-- Add document_category column for better organization
ALTER TABLE expiry_items ADD COLUMN IF NOT EXISTS document_category TEXT;

-- Add employee_id column to track which employee's document (if applicable)
ALTER TABLE expiry_items ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE CASCADE;

-- Add document_status column
ALTER TABLE expiry_items ADD COLUMN IF NOT EXISTS document_status TEXT DEFAULT 'active';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_expiry_items_document_type ON expiry_items(document_type);
CREATE INDEX IF NOT EXISTS idx_expiry_items_document_category ON expiry_items(document_category);
CREATE INDEX IF NOT EXISTS idx_expiry_items_employee_id ON expiry_items(employee_id);

-- Update RLS Policies to handle document types
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

-- Insert sample company document expiry items
INSERT INTO expiry_items (title, description, expires_at, company_id, document_type, document_category, created_by) VALUES
('Trade License', 'Company trade license renewal', '2026-12-31', (SELECT id FROM companies WHERE name = 'TechCorp Inc.' LIMIT 1), 'license', 'legal', (SELECT id FROM auth.users WHERE email = 'admin@techcorp.com' LIMIT 1)),
('Business Registration', 'Annual business registration renewal', '2027-01-15', (SELECT id FROM companies WHERE name = 'TechCorp Inc.' LIMIT 1), 'registration', 'legal', (SELECT id FROM auth.users WHERE email = 'admin@techcorp.com' LIMIT 1)),
('Insurance Policy', 'Company liability insurance', '2026-09-30', (SELECT id FROM companies WHERE name = 'TechCorp Inc.' LIMIT 1), 'insurance', 'financial', (SELECT id FROM auth.users WHERE email = 'admin@techcorp.com' LIMIT 1)),
('Employee Work Permit', 'John Doe work permit renewal', '2026-11-20', (SELECT id FROM companies WHERE name = 'TechCorp Inc.' LIMIT 1), 'permit', 'employee', (SELECT id FROM employees WHERE email = 'staff@techcorp.com' LIMIT 1)),
('Office Lease Agreement', 'Office space lease renewal', '2027-06-01', (SELECT id FROM companies WHERE name = 'TechCorp Inc.' LIMIT 1), 'lease', 'property', (SELECT id FROM auth.users WHERE email = 'admin@techcorp.com' LIMIT 1));
