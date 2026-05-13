# AWS Amplify Deployment Guide

This project is now prepared for AWS Amplify deployment from GitHub.

## What was changed
- Removed `output: 'export'` from `next.config.ts` so the Next.js app can run server-side features and API routes.
- Added `amplify.yml` for AWS Amplify build configuration.
- Added a GitHub Actions workflow at `.github/workflows/ci-build.yml` to verify `npm ci` and `npm run build` on every push or pull request to `main`.

## How to deploy in AWS Amplify

1. Open the AWS Amplify console.
2. Create a new app and connect your GitHub repository:
   - Repository: `sirajknwork-oss/business-center-system`
   - Branch: `main`
3. When Amplify asks for a build setting, it will use the `amplify.yml` file from this repo.
4. In Amplify App settings, add environment variables for production.

### Required environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)
- `JWT_SECRET`
- `SESSION_SECRET`
- `SENDGRID_API_KEY` (optional if email is used)
- `SMTP_HOST` (optional)
- `SMTP_PORT` (optional)
- `SMTP_USER` (optional)
- `SMTP_PASS` (optional)

### MongoDB environment variables (for migration)
- `MONGODB_URI`
- `MONGODB_DB`

> Keep `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `SESSION_SECRET`, `MONGODB_URI`, and SMTP credentials private.

## Connecting your GoDaddy domain

1. In Amplify, go to the App > Domain management.
2. Add your custom domain (for example, `yourdomain.com`).
3. Amplify will show DNS records to add in GoDaddy.
4. In GoDaddy DNS management, add the records shown by Amplify.
   - Most commonly a `CNAME` for `www` and either an `A` record or additional CNAME entries for the root domain.
5. Wait for DNS propagation; Amplify will verify the domain and issue HTTPS automatically.

## GitHub updates

- The GitHub Actions workflow will run on pushes and PRs to `main`.
- If you want a fully automated AWS deployment later, connect the repo in Amplify and enable branch deploys.

## Notes

- This change does not migrate your database to MongoDB. The current app still uses Supabase/Firebase backends as before.
- If you want to migrate data to MongoDB later, that will require a separate migration plan and code changes across the backend data layer.
