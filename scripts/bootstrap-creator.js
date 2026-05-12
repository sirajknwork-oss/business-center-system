#!/usr/bin/env node

/**
 * Bootstrap Script: Create Creator Account
 * 
 * This script creates the initial creator account in Supabase.
 * Run this once to set up the creator user account.
 * 
 * Usage:
 *   node scripts/bootstrap-creator.js
 */

const fs = require("fs");
const path = require("path");

// Load environment variables
const envPath = path.join(__dirname, "..", ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local file not found. Please create it first.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const bootstrapSecret = env.BOOTSTRAP_SECRET;
const creatorEmail = "sirajkn.work@gmail.com";
const creatorPassword = "SirajZaira@126";

if (!supabaseUrl || !bootstrapSecret) {
  console.error("❌ Missing required environment variables:");
  if (!supabaseUrl) console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  if (!bootstrapSecret) console.error("   - BOOTSTRAP_SECRET");
  console.error("\nPlease update .env.local with these values.");
  process.exit(1);
}

// Note: This script is meant to be run via `npm run bootstrap` after the dev server is running
console.log("📝 Creator Account Bootstrap Instructions");
console.log("=========================================\n");
console.log("To create the creator account, use one of these methods:\n");

console.log("1️⃣  Using cURL:");
console.log(`
curl -X POST http://localhost:3000/api/bootstrap/creator \\
  -H "Content-Type: application/json" \\
  -H "x-bootstrap-secret: ${bootstrapSecret}" \\
  -d '{
    "email": "${creatorEmail}",
    "password": "${creatorPassword}"
  }'
`);

console.log("\n2️⃣  Using the script below (save as test-bootstrap.sh):");
console.log(`
#!/bin/bash
curl -X POST http://localhost:3000/api/bootstrap/creator \\
  -H "Content-Type: application/json" \\
  -H "x-bootstrap-secret: ${bootstrapSecret}" \\
  -d '{
    "email": "${creatorEmail}",
    "password": "${creatorPassword}"
  }'
`);

console.log("\n3️⃣  Or make a POST request to:");
console.log(`   URL: http://localhost:3000/api/bootstrap/creator`);
console.log(`   Header: x-bootstrap-secret: ${bootstrapSecret}`);
console.log(`   Body: {`);
console.log(`     "email": "${creatorEmail}",`);
console.log(`     "password": "${creatorPassword}"`);
console.log(`   }`);

console.log("\n⚠️  Important:");
console.log("   • Start the dev server first: npm run dev");
console.log("   • Run this after the server is running");
console.log("   • Only run this once to create the creator account");
console.log("   • After creation, you can login with the credentials above");
