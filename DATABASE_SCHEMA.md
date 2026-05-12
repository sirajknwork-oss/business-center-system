# UAE Business Center System - Complete Database Schema

## Core Tables

### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('creator', 'admin', 'staff', 'customer')),
  company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES users(id),
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. companies
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_code VARCHAR(10) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  cn_number VARCHAR(50) UNIQUE NOT NULL,
  trade_license_number VARCHAR(100),
  establishment_card_number VARCHAR(100),
  vat_number VARCHAR(50),
  contact_person VARCHAR(255),
  mobile VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  status VARCHAR(20) DEFAULT 'active',
  assigned_staff_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. employees
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  passport_number VARCHAR(100),
  visa_number VARCHAR(100),
  emirates_id_number VARCHAR(100),
  labour_card_number VARCHAR(100),
  designation VARCHAR(255),
  salary DECIMAL(10,2),
  joining_date DATE,
  nationality VARCHAR(100),
  mobile VARCHAR(20),
  email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. expiry_tracking
```sql
CREATE TABLE expiry_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  company_id UUID REFERENCES companies(id),
  expiry_type VARCHAR(50) NOT NULL, -- 'visa', 'emirates_id', 'passport', 'labour_card', 'insurance'
  expiry_date DATE NOT NULL,
  alert_sent BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. employee_documents
```sql
CREATE TABLE employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  document_type VARCHAR(50) NOT NULL, -- 'passport', 'visa', 'emirates_id', 'insurance', etc.
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  expiry_date DATE,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### 6. company_documents
```sql
CREATE TABLE company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  document_type VARCHAR(50) NOT NULL, -- 'trade_license', 'establishment_card', 'moa', 'tenancy_contract'
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  expiry_date DATE,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### 7. activity_logs
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'login', 'logout'
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 8. user_permissions
```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  permission_type VARCHAR(50) NOT NULL, -- 'full_access', 'read_only', 'employee_management'
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);
```

### 9. notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Indexes for Performance

```sql
-- Users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_company_id ON users(company_id);

-- Companies
CREATE INDEX idx_companies_company_code ON companies(company_code);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_assigned_staff ON companies(assigned_staff_id);

-- Employees
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_passport ON employees(passport_number);
CREATE INDEX idx_employees_emirates_id ON employees(emirates_id_number);

-- Expiry Tracking
CREATE INDEX idx_expiry_tracking_expiry_date ON expiry_tracking(expiry_date);
CREATE INDEX idx_expiry_tracking_employee_id ON expiry_tracking(employee_id);
CREATE INDEX idx_expiry_tracking_status ON expiry_tracking(status);

-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_table_name ON activity_logs(table_name);
```

## Security Policies (RLS - Row Level Security)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Example RLS Policies
-- Users can only see their own data unless they are creator/admin
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (id = auth.uid() OR 
                   auth.jwt() ->> 'role' IN ('creator', 'admin'));

-- Staff can only see assigned companies
CREATE POLICY "Staff view assigned companies" ON companies
  FOR SELECT USING (assigned_staff_id = auth.uid() OR 
                   auth.jwt() ->> 'role' IN ('creator', 'admin'));
```

## Initial Data

### Creator User (Manual Creation)
```sql
INSERT INTO users (
  id, 
  username, 
  password_hash, 
  role, 
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'creator',
  '$2b$10$hashed_password_here',
  'creator',
  gen_random_uuid(),
  NOW(),
  NOW()
);
```

## Views for Common Queries

### Employee Master View (Creator View)
```sql
CREATE VIEW employee_master_view AS
SELECT 
  e.employee_id,
  e.name,
  e.passport_number,
  e.visa_number,
  e.emirates_id_number,
  e.labour_card_number,
  e.designation,
  e.salary,
  e.joining_date,
  e.nationality,
  e.mobile,
  e.status,
  c.company_code,
  c.company_name,
  c.cn_number,
  array_agg(
    json_build_object(
      'type', et.expiry_type,
      'date', et.expiry_date,
      'status', et.status
    )
  ) as expiries
FROM employees e
JOIN companies c ON e.company_id = c.id
LEFT JOIN expiry_tracking et ON e.id = et.employee_id
GROUP BY e.id, c.id;
```
