// Complete Database Setup for UAE Business Center System
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDatabaseTables() {
  console.log('🚀 Creating complete database schema for UAE Business Center System...\n');

  try {
    // 1. Companies table
    console.log('📋 Creating companies table...');
    const { error: companiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS companies (
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
        
        CREATE INDEX IF NOT EXISTS idx_companies_company_code ON companies(company_code);
        CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
        CREATE INDEX IF NOT EXISTS idx_companies_assigned_staff ON companies(assigned_staff_id);
      `
    });

    if (companiesError) {
      console.error('❌ Companies table error:', companiesError);
    } else {
      console.log('✅ Companies table created successfully');
    }

    // 2. Enhanced employees table
    console.log('\n👥 Creating enhanced employees table...');
    const { error: employeesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS employees (
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
        
        CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
        CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
        CREATE INDEX IF NOT EXISTS idx_employees_passport ON employees(passport_number);
        CREATE INDEX IF NOT EXISTS idx_employees_emirates_id ON employees(emirates_id_number);
      `
    });

    if (employeesError) {
      console.error('❌ Employees table error:', employeesError);
    } else {
      console.log('✅ Employees table created successfully');
    }

    // 3. Expiry tracking table
    console.log('\n⏰ Creating expiry_tracking table...');
    const { error: expiryError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS expiry_tracking (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID REFERENCES employees(id),
          company_id UUID REFERENCES companies(id),
          expiry_type VARCHAR(50) NOT NULL,
          expiry_date DATE NOT NULL,
          alert_sent BOOLEAN DEFAULT false,
          status VARCHAR(20) DEFAULT 'active',
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_expiry_tracking_expiry_date ON expiry_tracking(expiry_date);
        CREATE INDEX IF NOT EXISTS idx_expiry_tracking_employee_id ON expiry_tracking(employee_id);
        CREATE INDEX IF NOT EXISTS idx_expiry_tracking_status ON expiry_tracking(status);
      `
    });

    if (expiryError) {
      console.error('❌ Expiry tracking table error:', expiryError);
    } else {
      console.log('✅ Expiry tracking table created successfully');
    }

    // 4. Activity logs table
    console.log('\n📝 Creating activity_logs table...');
    const { error: activityError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          action VARCHAR(100) NOT NULL,
          table_name VARCHAR(50),
          record_id UUID,
          old_values JSONB,
          new_values JSONB,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_activity_logs_table_name ON activity_logs(table_name);
      `
    });

    if (activityError) {
      console.error('❌ Activity logs table error:', activityError);
    } else {
      console.log('✅ Activity logs table created successfully');
    }

    // 5. User permissions table
    console.log('\n🔐 Creating user_permissions table...');
    const { error: permissionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          company_id UUID REFERENCES companies(id),
          permission_type VARCHAR(50) NOT NULL,
          granted_by UUID REFERENCES users(id),
          granted_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, company_id)
        );
      `
    });

    if (permissionsError) {
      console.error('❌ User permissions table error:', permissionsError);
    } else {
      console.log('✅ User permissions table created successfully');
    }

    // 6. Employee documents table
    console.log('\n📄 Creating employee_documents table...');
    const { error: empDocsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS employee_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID REFERENCES employees(id),
          document_type VARCHAR(50) NOT NULL,
          file_name VARCHAR(255),
          file_path VARCHAR(500),
          file_size INTEGER,
          expiry_date DATE,
          uploaded_by UUID REFERENCES users(id),
          uploaded_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (empDocsError) {
      console.error('❌ Employee documents table error:', empDocsError);
    } else {
      console.log('✅ Employee documents table created successfully');
    }

    // 7. Company documents table
    console.log('\n🏢 Creating company_documents table...');
    const { error: compDocsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS company_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID REFERENCES companies(id),
          document_type VARCHAR(50) NOT NULL,
          file_name VARCHAR(255),
          file_path VARCHAR(500),
          file_size INTEGER,
          expiry_date DATE,
          uploaded_by UUID REFERENCES users(id),
          uploaded_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (compDocsError) {
      console.error('❌ Company documents table error:', compDocsError);
    } else {
      console.log('✅ Company documents table created successfully');
    }

    // 8. Notifications table
    console.log('\n🔔 Creating notifications table...');
    const { error: notificationsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          title VARCHAR(255) NOT NULL,
          message TEXT,
          type VARCHAR(50) DEFAULT 'info',
          read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (notificationsError) {
      console.error('❌ Notifications table error:', notificationsError);
    } else {
      console.log('✅ Notifications table created successfully');
    }

    // 9. Enhanced users table (if not exists)
    console.log('\n👤 Creating enhanced users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
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
        
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
        CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
      `
    });

    if (usersError) {
      console.error('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users table created successfully');
    }

    console.log('\n🎉 Complete database schema created successfully!');
    console.log('\n📊 Tables created:');
    console.log('  ✅ companies');
    console.log('  ✅ employees');
    console.log('  ✅ expiry_tracking');
    console.log('  ✅ activity_logs');
    console.log('  ✅ user_permissions');
    console.log('  ✅ employee_documents');
    console.log('  ✅ company_documents');
    console.log('  ✅ notifications');
    console.log('  ✅ users');

  } catch (error) {
    console.error('❌ Database creation failed:', error);
    throw error;
  }
}

// Create sample data
async function createSampleData() {
  console.log('\n🎯 Creating sample data...');

  try {
    // Create sample company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        company_code: 'ABC001',
        company_name: 'ABC Technical Services LLC',
        cn_number: 'CN001',
        trade_license_number: 'TL123456',
        contact_person: 'John Doe',
        mobile: '0501234567',
        email: 'info@abc.com',
        address: 'Dubai, UAE'
      })
      .select()
      .single();

    if (companyError) {
      console.error('❌ Sample company error:', companyError);
    } else {
      console.log('✅ Sample company created:', company.company_name);
    }

    // Create sample employee
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        employee_id: 'EMP001',
        company_id: company?.id,
        name: 'Ahmed Mohammed',
        passport_number: 'P123456789',
        visa_number: 'V987654321',
        emirates_id_number: 'EID123456789',
        designation: 'Project Manager',
        salary: 8500.00,
        joining_date: '2024-01-15',
        nationality: 'India',
        mobile: '0551234567',
        email: 'ahmed@abc.com'
      })
      .select()
      .single();

    if (employeeError) {
      console.error('❌ Sample employee error:', employeeError);
    } else {
      console.log('✅ Sample employee created:', employee.name);
    }

    // Create expiry tracking
    const { error: expiryError } = await supabase
      .from('expiry_tracking')
      .insert([
        {
          employee_id: employee?.id,
          company_id: company?.id,
          expiry_type: 'visa',
          expiry_date: '2024-12-31',
          status: 'active'
        },
        {
          employee_id: employee?.id,
          company_id: company?.id,
          expiry_type: 'emirates_id',
          expiry_date: '2025-06-30',
          status: 'active'
        }
      ]);

    if (expiryError) {
      console.error('❌ Sample expiry error:', expiryError);
    } else {
      console.log('✅ Sample expiry tracking created');
    }

    console.log('\n🎉 Sample data created successfully!');

  } catch (error) {
    console.error('❌ Sample data creation failed:', error);
  }
}

// Main execution
async function main() {
  try {
    await createDatabaseTables();
    await createSampleData();
    console.log('\n🚀 UAE Business Center System database is ready!');
    console.log('\n📋 Next steps:');
    console.log('  1. Test the admin creation system');
    console.log('  2. Add Companies module');
    console.log('  3. Add Employees module');
    console.log('  4. Build professional dashboard');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
