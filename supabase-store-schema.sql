-- Store items table
CREATE TABLE store_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_items
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

-- Insert sample store items
INSERT INTO store_items (name, description, price, stock_quantity, category, company_id) VALUES
  ('A4 Paper', 'Standard A4 printing paper', 25.00, 100, 'printing', (SELECT id FROM companies WHERE name = 'TechCorp Inc.')),
  ('Toner Cartridge', 'Black toner cartridge for laser printers', 150.00, 25, 'printing', (SELECT id FROM companies WHERE name = 'TechCorp Inc.')),
  ('Office Chair', 'Ergonomic office chair with armrests', 299.99, 10, 'office', (SELECT id FROM companies WHERE name = 'TechCorp Inc.')),
  ('Laptop Stand', 'Adjustable laptop stand for better ergonomics', 45.00, 15, 'electronics', (SELECT id FROM companies WHERE name = 'TechCorp Inc.')),
  ('Pen Set', 'Assorted color pens and markers', 12.50, 50, 'stationery', (SELECT id FROM companies WHERE name = 'TechCorp Inc.')),
  ('USB Cable', 'High-speed USB 3.0 cable', 8.99, 30, 'electronics', (SELECT id FROM companies WHERE name = 'TechCorp Inc.'));
