// Fix Creator Account Password
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCreatorPassword() {
  console.log('🔐 Fixing Creator Account Password...\n');
  
  try {
    // Check if creator account exists
    const { data: creatorData, error: creatorError } = await supabase
      .from('users')
      .select('id, username, email, role')
      .eq('username', 'creator')
      .single();
    
    if (creatorError) {
      console.log('❌ Creator account not found:', creatorError.message);
      
      // Create creator account if not exists
      console.log('📝 Creating new creator account...');
      
      const hashedPassword = await bcrypt.hash('creator123', 12);
      
      const { data: newCreator, error: createError } = await supabase
        .from('users')
        .insert([{
          username: 'creator',
          email: 'creator@businesscenter.com',
          password_hash: hashedPassword,
          role: 'creator',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Failed to create creator account:', createError.message);
        return;
      }
      
      console.log('✅ Creator account created successfully');
      console.log('📋 Creator Details:');
      console.log('   Username: creator');
      console.log('   Email: creator@businesscenter.com');
      console.log('   Password: creator123');
      console.log('   Role: creator');
      
    } else {
      console.log('✅ Creator account found:', creatorData);
      
      // Update password
      console.log('🔄 Updating creator password...');
      
      const hashedPassword = await bcrypt.hash('creator123', 12);
      
      const { data: updatedCreator, error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('username', 'creator')
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Failed to update password:', updateError.message);
        return;
      }
      
      console.log('✅ Creator password updated successfully');
      console.log('📋 Updated Creator Details:');
      console.log('   Username: creator');
      console.log('   Email: creator@businesscenter.com');
      console.log('   Password: creator123');
      console.log('   Role: creator');
    }
    
    // Test login by checking the account
    console.log('\n🧪 Testing creator account...');
    
    const { data: testCreator, error: testError } = await supabase
      .from('users')
      .select('id, username, email, role, is_active')
      .eq('username', 'creator')
      .eq('is_active', true)
      .single();
    
    if (testError) {
      console.error('❌ Creator account test failed:', testError.message);
    } else {
      console.log('✅ Creator account is active and accessible');
      console.log('📋 Final Creator Info:', testCreator);
    }
    
    console.log('\n🎉 Creator Account Setup Complete!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: creator@businesscenter.com');
    console.log('   Password: creator123');
    console.log('   Role: Creator (Super Admin)');
    
    console.log('\n📱 Test URLs:');
    console.log('   Login: http://localhost:3000');
    console.log('   Admin: http://localhost:3000/admin');
    console.log('   Dashboard: http://localhost:3000/dashboard');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Check if bcrypt is available
try {
  require.resolve('bcrypt');
} catch (e) {
  console.log('❌ bcrypt not installed. Installing...');
  console.log('Run: npm install bcrypt');
  process.exit(1);
}

// Run the fix
fixCreatorPassword().catch(console.error);
