const fs = require('fs');
const path = require('path');

// Read existing .env.local file
const envPath = path.join(__dirname, '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Add missing environment variables if they don't exist
const requiredVars = {
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qeGloZm10bm10cmNvdHlncnF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NzQ0NjQ2MiwiZXhwIjoyMDAzMDIyNDYyfQ.placeholder',
  'BOOTSTRAP_SECRET': 'bootstrap_secret_key_123'
};

for (const [key, value] of Object.entries(requiredVars)) {
  if (!envContent.includes(`${key}=`)) {
    envContent += `\n${key}=${value}`;
  }
}

// Write back to .env.local
fs.writeFileSync(envPath, envContent);
console.log('Environment variables added to .env.local');

// Now create the creator account
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createCreatorAccount() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'sirajkn.work@gmail.com',
      password: 'SirajZaira@126',
      email_confirm: true,
      user_metadata: {
        role: 'creator',
      },
    });

    if (error) {
      console.error('Error creating creator account:', error);
    } else {
      console.log('✅ Creator account created successfully!');
      console.log('Email: sirajkn.work@gmail.com');
      console.log('Password: SirajZaira@126');
      console.log('You can now login at http://localhost:3000/login');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

createCreatorAccount();
