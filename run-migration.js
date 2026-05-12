const http = require('http');
require('dotenv').config({ path: '.env.local' });

const bootstrapSecret = process.env.BOOTSTRAP_SECRET;

async function runMigration() {
  console.log('🔧 Running database migrations via API...\n');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/bootstrap/migrate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bootstrap-secret': bootstrapSecret,
        'Content-Length': 0
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          console.log(JSON.stringify(response, null, 2));
          
          if (response.results) {
            const failures = response.results.filter(r => r.status !== 'success');
            if (failures.length === 0) {
              console.log('\n✅ All migrations completed successfully!');
            } else {
              console.log(`\n⚠️ ${failures.length} migrations had issues`);
            }
          }
        } catch (err) {
          console.log('Response:', body);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('Error:', err.message);
      reject(err);
    });

    req.end();
  });
}

runMigration().catch(console.error);
