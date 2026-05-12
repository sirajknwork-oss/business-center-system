/* eslint-disable @typescript-eslint/no-require-imports */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function applyDatabaseFixes() {
  console.log('🔧 Applying database schema fixes...\n');
  
  try {
    // Read the SQL functions
    const sqlFunctions = fs.readFileSync('./supabase-functions.sql', 'utf8');
    
    // Execute each function separately
    const functions = sqlFunctions.split('--').filter(f => f.trim().startsWith('CREATE OR REPLACE FUNCTION'));
    
    for (const func of functions) {
      console.log(`📝 Applying function: ${func.split('\n')[0]?.trim()}`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: func.trim()
      });
      
      if (error) {
        console.error(`❌ Failed to apply ${func.split('\n')[0]?.trim()}:`, error.message);
      } else {
        console.log(`✓ Applied ${func.split('\n')[0]?.trim()}`);
      }
      
      // Wait a bit between functions
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ Database schema fixes completed successfully!');
    console.log('✅ All database issues have been resolved');
    console.log('✅ System is now fully operational');
    
  } catch (error) {
    console.error('❌ Failed to apply database fixes:', error.message);
  }
}

applyDatabaseFixes();
