# Quick Fix: Schema Cache Issue

## Problem
Tables exist but Supabase schema cache doesn't recognize them.

## Solution 1: Restart Development Server
1. Stop current server (Ctrl+C in terminal)
2. Run: `npm run dev`
3. Test the system again

## Solution 2: Clear Browser Cache
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Clear site data
4. Refresh page

## Solution 3: Test Direct Access
Try accessing these URLs directly after restart:
- http://localhost:3000/admin
- http://localhost:3000/companies  
- http://localhost:3000/employees

## Solution 4: Manual Database Check
If restart doesn't work:
1. Go to Supabase Dashboard
2. SQL Editor
3. Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
4. Check if 'employees' and 'admin_users_storage' are listed

## Most Likely Fix
Usually, restarting the development server resolves schema cache issues in Supabase.
