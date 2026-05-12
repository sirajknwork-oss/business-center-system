# Creator Account Setup Guide

## Issue: Invalid Login Credentials

The creator account needs to be created in Supabase before you can login.

## Prerequisites

Before creating the account, you need to:

1. **Get your Supabase Service Role Key**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to **Settings** → **API**
   - Copy the **Service Role Key** (under the "service_role" section)

2. **Update .env.local**
   
   Edit `d:\saas\business-center-system\.env.local`:
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://mjxihfmtnmtrcotygrqu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4SKdHge5LqXNAfP0hqXN0A_iDuhcQCi
   SUPABASE_SERVICE_ROLE_KEY=<paste_your_service_role_key_here>
   BOOTSTRAP_SECRET=bootstrap_secret_key_123
   ```

## Creating the Creator Account

### Step 1: Start the Dev Server
```bash
npm run dev
```

### Step 2: Create the Creator Account

Once the dev server is running, use one of these methods:

#### Option A: Using PowerShell (Windows)
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-bootstrap-secret" = "bootstrap_secret_key_123"
}

$body = @{
    "email" = "sirajkn.work@gmail.com"
    "password" = "SirajZaira@126"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/bootstrap/creator" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

#### Option B: Using cURL (Command Line)
```bash
curl -X POST http://localhost:3000/api/bootstrap/creator \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-secret: bootstrap_secret_key_123" \
  -d '{
    "email": "sirajkn.work@gmail.com",
    "password": "SirajZaira@126"
  }'
```

#### Option C: Using any HTTP Client (Postman, Thunder Client, etc.)
- **URL:** `http://localhost:3000/api/bootstrap/creator`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `x-bootstrap-secret: bootstrap_secret_key_123`
- **Body (JSON):**
  ```json
  {
    "email": "sirajkn.work@gmail.com",
    "password": "SirajZaira@126"
  }
  ```

### Step 3: Verify Success

You should receive a response like:
```json
{
  "success": true,
  "message": "Creator account created successfully",
  "user": {
    "id": "user-id-here",
    "email": "sirajkn.work@gmail.com"
  }
}
```

### Step 4: Login

1. Go to http://localhost:3000/login
2. Enter credentials:
   - **Email:** `sirajkn.work@gmail.com`
   - **Password:** `SirajZaira@126`
3. You should now be logged in as Creator

## Creator Features

After logging in, you can access:

- **Creator Dashboard** at `/admin` - Manage admins, staff, companies, and expiry items
- **Admin Panel** - Create and manage admin accounts
- **Staff Panel** - Create and manage staff accounts
- **Company Panel** - Create and manage company records
- **Expiry Overview** - View items expiring in the next 30 days

## Troubleshooting

### "Unauthorized" Error
- Check that `x-bootstrap-secret` header matches `BOOTSTRAP_SECRET` in `.env.local`
- Make sure you're using the exact secret value

### "Missing email or password" Error
- Verify the JSON body includes both `email` and `password` fields
- Check that values are strings, not null or undefined

### Server Not Running
- Make sure `npm run dev` is running before attempting to create the account
- The API endpoint must be accessible at `http://localhost:3000`

### Service Role Key Issues
- Verify the key is copied correctly from Supabase (no extra spaces)
- Make sure it's the Service Role key, not the Anon key
- The key should start with `eyJ...` 

## Security Notes

- The `BOOTSTRAP_SECRET` is just a simple string check. In production, consider using more robust authentication
- Only run the bootstrap script once to create the creator account
- Keep the `SUPABASE_SERVICE_ROLE_KEY` private and never commit it to version control
