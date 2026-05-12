// Create Creator Account Using Supabase Auth
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Initialize Supabase client with service role key (for admin operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createCreatorAccount() {
  console.log('🔐 Creating Creator Account using Supabase Auth...\n');
  
  try {
    // Step 1: Create user in Supabase Auth
    console.log('📝 Creating user in Supabase Auth...');
    
    const creatorEmail = 'creator@businesscenter.com';
    const creatorPassword = 'creator123';
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: creatorEmail,
      password: creatorPassword,
      email_confirm: true,
      user_metadata: {
        username: 'creator',
        role: 'creator',
        full_name: 'System Creator'
      }
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Creator account already exists in Auth');
        console.log('🔄 Updating metadata...');
        
        // Get existing user
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error('❌ Failed to list users:', listError.message);
          return;
        }
        
        const existingCreator = users.find(user => user.email === creatorEmail);
        
        if (existingCreator) {
          // Update user metadata
          const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingCreator.id,
            {
              user_metadata: {
                username: 'creator',
                role: 'creator',
                full_name: 'System Creator'
              }
            }
          );
          
          if (updateError) {
            console.error('❌ Failed to update user metadata:', updateError.message);
            return;
          }
          
          console.log('✅ Creator metadata updated');
          console.log('📋 Creator Auth ID:', existingCreator.id);
        }
      } else {
        console.error('❌ Failed to create auth user:', authError.message);
        return;
      }
    } else {
      console.log('✅ Creator account created in Supabase Auth');
      console.log('📋 Creator Auth ID:', authData.user.id);
      console.log('📋 Creator Email:', authData.user.email);
    }
    
    // Step 2: Try to create corresponding record in users table (if table exists)
    console.log('\n🔄 Attempting to create record in users table...');
    
    try {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .upsert([{
          id: authData?.user?.id || null, // Will be null if user already existed
          username: 'creator',
          email: creatorEmail,
          role: 'creator',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (userError) {
        console.log('⚠️ Users table not accessible:', userError.message);
        console.log('📝 This is expected if tables are not created yet');
        console.log('🔧 Creator will work with Auth only for now');
      } else {
        console.log('✅ Creator record created in users table');
      }
    } catch (tableError) {
      console.log('⚠️ Users table not found:', tableError.message);
      console.log('📝 Creator will work with Auth only');
    }
    
    // Step 3: Test login
    console.log('\n🧪 Testing Creator Login...');
    
    const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: creatorEmail,
      password: creatorPassword
    });
    
    if (signInError) {
      console.error('❌ Login test failed:', signInError.message);
    } else {
      console.log('✅ Creator login successful!');
      console.log('📋 User ID:', signInData.user.id);
      console.log('📋 Email:', signInData.user.email);
      console.log('📋 Role:', signInData.user.user_metadata.role);
    }
    
    console.log('\n🎉 Creator Account Setup Complete!');
    console.log('\n🔐 Final Login Credentials:');
    console.log('   Email: creator@businesscenter.com');
    console.log('   Password: creator123');
    console.log('   Role: Creator (Super Admin)');
    
    console.log('\n📱 Next Steps:');
    console.log('1. Restart development server: npm run dev');
    console.log('2. Go to: http://localhost:3000');
    console.log('3. Login with creator@businesscenter.com / creator123');
    console.log('4. Test admin access: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the creator creation
createCreatorAccount().catch(console.error);
