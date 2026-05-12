const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createTablesDirectly() {
  console.log('🔧 Creating tables directly...\n');

  try {
    // Since we can't execute DDL via REST API, let's create the data directly
    // The tables might already exist in the Supabase dashboard
    
    console.log('📋 Creating companies data...');
    const { data: companies, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert([
        { name: 'TechCorp Inc.', address: '123 Tech Street, Silicon Valley' },
        { name: 'DataFlow Solutions', address: '456 Data Ave, New York' },
        { name: 'CloudNine Systems', address: '789 Cloud Blvd, Austin' }
      ])
      .select();

    if (companyError) {
      console.log('Companies error:', companyError.message);
      if (companyError.message.includes('relation') || companyError.message.includes('table')) {
        console.log('❌ Tables do not exist. Please create them manually in Supabase dashboard.');
        console.log('Go to your Supabase project > SQL Editor > New Query');
        console.log('Execute the contents of supabase-schema.sql and supabase-store-schema.sql');
        return;
      }
    } else {
      console.log('✅ Companies created:', companies.length);
      const techCorpId = companies.find(c => c.name === 'TechCorp Inc.')?.id;
      
      // Create admin user
      console.log('\n👤 Creating admin user...');
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
        console.log('Auth user error:', authError.message);
      } else {
        console.log('✅ Admin auth user created:', authUser.user.email);
      }

      // Create employee record
      console.log('\n👥 Creating employee records...');
      const { data: employees, error: employeeError } = await supabaseAdmin
        .from('employees')
        .insert([
          { name: 'John Admin', email: 'admin@techcorp.com', role: 'admin', company_id: techCorpId },
          { name: 'Jane Staff', email: 'staff@techcorp.com', role: 'staff', company_id: techCorpId },
          { name: 'Bob Customer', email: 'customer@techcorp.com', role: 'customer', company_id: techCorpId }
        ])
        .select();

      if (employeeError) {
        console.log('Employees error:', employeeError.message);
      } else {
        console.log('✅ Employees created:', employees.length);
      }

      console.log('\n🎉 Database setup completed!');
      console.log('\n📋 Admin User Details:');
      console.log('Email: admin@techcorp.com');
      console.log('Password: admin123');
      console.log('Role: admin');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

createTablesDirectly();
