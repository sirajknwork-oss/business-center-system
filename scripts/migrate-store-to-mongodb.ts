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

async function migrateStoreItems() {
  console.log('🔄 Migrating store items from Supabase to MongoDB...')

  const { data, error } = await supabase.from('store_items').select('*')
  if (error) {
    console.log('❌ Error fetching store items from Supabase:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️ No store items found in Supabase.')
    return
  }

  const mongoClient = new MongoClient(mongoUri as string)
  await mongoClient.connect()
  const db = mongoClient.db(mongoDbName)
  const storeCollection = db.collection('store_items')

  const documents = data.map((item: any) => ({
    ...item,
    id: item.id ?? new ObjectId().toString(),
    created_at: item.created_at ?? new Date().toISOString(),
    updated_at: item.updated_at ?? new Date().toISOString()
  }))

  const insertResult = await storeCollection.insertMany(documents)
  console.log(`✅ Inserted ${insertResult.insertedCount} store items into MongoDB.`)

  await mongoClient.close()
}

migrateStoreItems()
  .then(() => {
    console.log('🎉 Store items migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Store items migration failed:', error)
    process.exit(1)
  })