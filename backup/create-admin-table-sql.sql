-- Admin Users Storage Table
CREATE TABLE IF NOT EXISTS admin_users_storage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_users_storage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Creators can do everything on admin_users_storage" ON admin_users_storage
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text = 'creator'
  );
