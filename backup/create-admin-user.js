const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');

    // First, get the company ID for TechCorp Inc.
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('name', 'TechCorp Inc.')
      .single();

    if (companyError || !companyData) {
      console.error('Error finding TechCorp Inc. company:', companyError?.message);
      return;
    }

    console.log('Found company ID:', companyData.id);

    // Create the auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@techcorp.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        company_id: companyData.id,
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Auth user created:', authUser.user.email);

    // Create the employee record
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        name: 'John Admin',
        email: 'admin@techcorp.com',
        role: 'admin',
        company_id: companyData.id,
      })
      .select('*')
      .single();

    if (employeeError) {
      console.error('Error creating employee record:', employeeError.message);
      // Clean up auth user if employee creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return;
    }

    console.log('✅ Employee record created:', employeeData.name);
    console.log('\n🎉 Admin user created successfully!');
    console.log('Email: admin@techcorp.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('Company: TechCorp Inc.');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

createAdminUser();
