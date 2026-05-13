import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { ObjectId, MongoClient } from 'mongodb'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const mongoUri = process.env.MONGODB_URI
const mongoDbName = process.env.MONGODB_DB || 'business-center-system'

if (!supabaseUrl || !supabaseKey || !mongoUri) {
  throw new Error('Required environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, MONGODB_URI')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateAdminUsers() {
  console.log('🔄 Migrating admin users from Supabase to MongoDB...')

  const { data, error } = await supabase.from('admin_users_storage').select('*')
  if (error) {
    console.log('❌ Error fetching admin users from Supabase:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️ No admin users found in Supabase.')
    return
  }

  const mongoClient = new MongoClient(mongoUri as string)
  await mongoClient.connect()
  const db = mongoClient.db(mongoDbName)
  const adminUsersCollection = db.collection('admin_users_storage')

  const documents = data.map((user: any) => ({
    ...user,
    id: user.id ?? new ObjectId().toString(),
    created_at: user.created_at ?? new Date().toISOString(),
    updated_at: user.updated_at ?? new Date().toISOString(),
    role: user.role ?? 'staff'
  }))

  const insertResult = await adminUsersCollection.insertMany(documents)
  console.log(`✅ Inserted ${insertResult.insertedCount} admin users into MongoDB.`)

  await mongoClient.close()
}

migrateAdminUsers()
  .then(() => {
    console.log('🎉 Admin users migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Admin users migration failed:', error)
    process.exit(1)
  })