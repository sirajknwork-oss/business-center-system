const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupDatabaseData() {
  console.log('🔧 Setting up database data...\n');

  try {
    // Create companies
    console.log('📋 Creating companies...');
    const { data: companies, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert([
        { name: 'TechCorp Inc.', address: '123 Tech Street, Silicon Valley' },
        { name: 'DataFlow Solutions', address: '456 Data Ave, New York' },
        { name: 'CloudNine Systems', address: '789 Cloud Blvd, Austin' }
      ])
      .select();

    if (companyError) {
      console.error('Error creating companies:', companyError.message);
      return;
    }
    console.log('✅ Companies created:', companies.length);

    // Get TechCorp Inc. ID for admin user
    const techCorpId = companies.find(c => c.name === 'TechCorp Inc.')?.id;

    // Create admin user in auth system
    console.log('\n👤 Creating admin auth user...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@techcorp.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        company_id: techCorpId,
      },
    });

    if (authError) {
      console.error('Error creating admin auth user:', authError.message);
      return;
    }
    console.log('✅ Admin auth user created:', authUser.user.email);

    // Create employees
    console.log('\n👥 Creating employees...');
    const { data: employees, error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert([
        { 
          name: 'John Admin', 
          email: 'admin@techcorp.com', 
          role: 'admin', 
          company_id: techCorpId 
        },
        { 
          name: 'Jane Staff', 
          email: 'staff@techcorp.com', 
          role: 'staff', 
          company_id: techCorpId 
        },
        { 
          name: 'Bob Customer', 
          email: 'customer@techcorp.com', 
          role: 'customer', 
          company_id: techCorpId 
        }
      ])
      .select();

    if (employeeError) {
      console.error('Error creating employees:', employeeError.message);
      return;
    }
    console.log('✅ Employees created:', employees.length);

    // Create expiry items
    console.log('\n📅 Creating expiry items...');
    const { data: expiryItems, error: expiryError } = await supabaseAdmin
      .from('expiry_items')
      .insert([
        { 
          title: 'SSL Certificate', 
          description: 'Main website SSL certificate', 
          expires_at: '2026-12-31', 
          company_id: techCorpId 
        },
        { 
          title: 'Domain Registration', 
          description: 'techcorp.com domain', 
          expires_at: '2027-03-15', 
          company_id: techCorpId 
        },
        { 
          title: 'Software License', 
          description: 'Adobe Creative Suite', 
          expires_at: '2026-08-20', 
          company_id: techCorpId 
        }
      ])
      .select();

    if (expiryError) {
      console.error('Error creating expiry items:', expiryError.message);
      return;
    }
    console.log('✅ Expiry items created:', expiryItems.length);

    // Create store items
    console.log('\n🛍️ Creating store items...');
    const { data: storeItems, error: storeError } = await supabaseAdmin
      .from('store_items')
      .insert([
        { 
          name: 'A4 Paper', 
          description: 'Standard A4 printing paper', 
          price: 25.00, 
          stock_quantity: 100, 
          category: 'printing', 
          company_id: techCorpId 
        },
        { 
          name: 'Toner Cartridge', 
          description: 'Black toner cartridge for laser printers', 
          price: 150.00, 
          stock_quantity: 25, 
          category: 'printing', 
          company_id: techCorpId 
        },
        { 
          name: 'Office Chair', 
          description: 'Ergonomic office chair with armrests', 
          price: 299.99, 
          stock_quantity: 10, 
          category: 'office', 
          company_id: techCorpId 
        }
      ])
      .select();

    if (storeError) {
      console.error('Error creating store items:', storeError.message);
      return;
    }
    console.log('✅ Store items created:', storeItems.length);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Admin User Details:');
    console.log('Email: admin@techcorp.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('Company: TechCorp Inc.');

  } catch (err) {
    console.error('Setup error:', err.message);
  }
}

setupDatabaseData();
