# MongoDB Migration Plan

## Summary

This project currently uses Supabase for production authentication and data access, while some legacy/test code under `src/` uses Firebase/Firestore.

The cleanest migration path is:
- keep production auth as-is for now (Supabase Auth)
- migrate application data from Supabase tables to MongoDB collections
- change the active `modules/*` backend data access layer to MongoDB
- preserve the existing frontend and app flows as much as possible

This avoids a full auth migration and reduces risk.

---

## Current production data architecture

Active production code uses:
- `lib/supabaseClient.ts` for Supabase queries and auth
- `modules/auth/authClient.ts` for sign-in, sign-up, session handling, and profile lookup
- `modules/*/*Client.ts` for table-based CRUD on collections such as `companies`, `employees`, `expiry_items`, `store_items`, and `admin_users_storage`

Legacy/test code in `src/` and `backup/` may use Firebase/Firestore or other Supabase scripts, but it is not part of the current production build.

---

## Recommended migration approach

### Option A (recommended): MongoDB for app data, keep Supabase Auth

- Use MongoDB for all application collections and persisted data.
- Continue using Supabase Auth for user sign-in/sign-up and session management.
- Store user profile details in MongoDB collections if needed, but keep auth tokens with Supabase.

This is the lowest-risk path because it avoids changing auth flows while still migrating data storage.

### Option B: Full MongoDB + custom auth

- Migrate user accounts and session management from Supabase Auth to MongoDB + NextAuth/custom JWT.
- This is a larger rewrite and should only be done after Option A is stable.

---

## Collections mapping

Based on active modules, the likely Mongo collections and table mappings are:

- `companies` → `companies`
- `employees` → `employees`
- `expiry_items` → `expiry_items`
- `store_items` → `store_items`
- `admin_users_storage` → `admin_users_storage`
- `profiles` → `profiles` (used for user metadata)

If you also want Teams/Users/Customers data, map them similarly to Mongo documents.

---

## Step 1: Prepare MongoDB cluster

1. Create a MongoDB Atlas cluster or AWS DocumentDB cluster.
2. Create a database name such as `business-center-system`.
3. Create a MongoDB user, network access rules, and a connection string.
4. Store the connection string in a secure environment variable, e.g.:
   - `MONGODB_URI`
   - `MONGODB_DB`

---

## Step 2: Add MongoDB client helper

Create a new file `lib/mongodb.ts` with the Node driver setup, for example:

```ts
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
const options = { }

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

client = new MongoClient(uri, options)
clientPromise = client.connect()

export default clientPromise
```

Then add a helper that returns collection objects.

---

## Step 3: Replace Supabase CRUD with MongoDB queries

For each active module currently using `supabase.from(...).select(...)`:

1. Replace `lib/supabaseClient.ts` usage with `lib/mongodb.ts` if the module is purely data-related.
2. Update `.from('companies').select('*')` to `db.collection('companies').find({}).toArray()`.
3. Update `.insert(data).single()` to `db.collection('companies').insertOne(data)`.
4. Update `.update(data).eq('id', id)` to `db.collection('companies').updateOne({ _id: new ObjectId(id) }, { $set: data })`.
5. Update `.delete().eq('id', id)` to `db.collection('companies').deleteOne({ _id: new ObjectId(id) })`.

Also convert Supabase query filters like:
- `query.eq('company_id', companyId)` → `{ company_id: companyId }`
- `.select('role, company_id, name')` → projection `{ projection: { role: 1, company_id: 1, name: 1 } }`

---

## Step 4: Handle IDs and metadata

Supabase uses UUID-style IDs or integer ids. MongoDB uses `_id` ObjectId by default.

Options:
- Keep `_id` as Mongo ObjectId and map Supabase row IDs into a separate field like `legacy_id`.
- Or insert imported documents with `_id: new ObjectId()` and store any legacy `id` values separately.

For updated documents, convert the current string `id` into an ObjectId in code, e.g. `new ObjectId(id)`.

---

## Step 5: Decide auth/profile storage

### If keeping Supabase Auth

- Keep `supabase.auth.signInWithPassword` and `supabase.auth.signUp` as-is.
- Migrate profile lookup in `modules/auth/authClient.ts` from Supabase `profiles` table to MongoDB `profiles` collection.
- Store any extra user metadata such as `role`, `company_id`, `name` in MongoDB.

### If moving auth to MongoDB later

- Replace `signInWithEmail`/`signUpWithEmail` with a custom user collection.
- Use hashed passwords (`bcrypt`) and JWT or NextAuth.
- Migrate user sessions to local storage or server cookie sessions.

---

## Step 6: Data migration strategy

The safest migration path is:

1. Export current Supabase/Postgres tables to JSON.
2. Import the JSON into MongoDB collections.
3. Create a one-time migration script in `scripts/` or `backup/`.
4. Run the script locally once and verify the MongoDB data.

A simple script can use:
- Supabase JS client to fetch existing rows from each table
- MongoDB Node driver to insert into collections

Example flow:
- `const companies = await supabase.from('companies').select('*')`
- `await mongoDb.collection('companies').insertMany(companies)`

---

## Step 7: Test incrementally

1. Convert one module first, e.g. `modules/companies/companiesClient.ts`.
2. Run the app and verify the companies page still works.
3. Convert `employees`, `expiry`, `store`, and `admin_users_storage` next.
4. Convert `profiles` and auth profile resolution last.
5. Run end-to-end tests or manually click through the main app flows.

---

## Step 8: Update environment and deployment

Add these environment variables in AWS/AWS Amplify:
- `MONGODB_URI`
- `MONGODB_DB`
- keep existing Supabase env vars if you keep auth there
- keep `JWT_SECRET`, `SESSION_SECRET` if you add auth/session logic

If you keep Supabase Auth, the app still needs:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Notes and risks

- The current active app is not using the `src/` Firestore code in production. Do not migrate that legacy folder unless you want it to become production code.
- A full auth migration is larger and should be postponed until the data layer is stable.
- MongoDB schema design should reflect your business objects, but for a first cut you can keep the same shape as your Supabase rows.

---

## Recommended next work items

1. Create `lib/mongodb.ts` and `lib/mongoHelpers.ts`.
2. Update `modules/*Client.ts` modules one-by-one.
3. Build a data migration script to move Supabase rows to Mongo.
4. Test the app with a MongoDB-connected development environment.
5. If successful, update AWS Amplify config to include `MONGODB_URI` and `MONGODB_DB`.

If you want, I can now implement the first migration step by creating the MongoDB client and converting one module such as `companiesClient.ts`. 