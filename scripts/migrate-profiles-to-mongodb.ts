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

async function migrateProfiles() {
  console.log('🔄 Migrating profiles from Supabase to MongoDB...')

  const { data, error } = await supabase.from('profiles').select('*')
  if (error) {
    console.log('❌ Error fetching profiles from Supabase:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️ No profiles found in Supabase.')
    return
  }

  const mongoClient = new MongoClient(mongoUri as string)
  await mongoClient.connect()
  const db = mongoClient.db(mongoDbName)
  const profilesCollection = db.collection('profiles')

  const documents = data.map((profile: any) => ({
    ...profile,
    id: profile.id ?? new ObjectId().toString(),
    created_at: profile.created_at ?? new Date().toISOString(),
    updated_at: profile.updated_at ?? new Date().toISOString()
  }))

  const insertResult = await profilesCollection.insertMany(documents)
  console.log(`✅ Inserted ${insertResult.insertedCount} profiles into MongoDB.`)

  await mongoClient.close()
}

migrateProfiles()
  .then(() => {
    console.log('🎉 Profiles migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Profiles migration failed:', error)
    process.exit(1)
  })