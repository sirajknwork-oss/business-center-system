const https = require('https');
const querystring = require('querystring');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Parse URL
const url = new URL(supabaseUrl);

const sqlStatements = [
  `CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    ded_number TEXT,
    username TEXT,
    password TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS public.expiry_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    expires_at DATE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS public.store_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'general',
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  `ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.expiry_items ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;`
];

async function runSQL(statement) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: statement });

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'apikey': supabaseServiceRoleKey
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function migrate() {
  console.log('🔧 Running database schema migrations...\n');

  for (let i = 0; i < sqlStatements.length; i++) {
    const statement = sqlStatements[i];
    const shortDesc = statement.split('\n')[0].substring(0, 50);
    
    try {
      console.log(`Executing: ${shortDesc}...`);
      const result = await runSQL(statement);
      console.log(`✅ Success (Status: ${result.status})`);
    } catch (error) {
      console.log(`⚠️ Error: ${error.message}`);
    }
  }

  console.log('\n✅ Schema migration completed!');
  console.log('Note: Check Supabase dashboard to verify tables were created.');
}

migrate();
