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

async function migrateCompanies() {
  const { data, error } = await supabase.from('companies').select('*')
  if (error) throw error
  if (!data || data.length === 0) {
    console.log('No companies were found in Supabase.')
    return
  }

  const mongoClient = new MongoClient(mongoUri as string)
  await mongoClient.connect()
  const db = mongoClient.db(mongoDbName)
  const companiesCollection = db.collection('companies')

  const documents = data.map((company: any) => ({
    ...company,
    id: company.id ?? new ObjectId().toString(),
    created_at: company.created_at ?? new Date().toISOString(),
    updated_at: company.updated_at ?? new Date().toISOString(),
  }))

  const insertResult = await companiesCollection.insertMany(documents)
  console.log(`Inserted ${insertResult.insertedCount} companies into MongoDB.`)

  await mongoClient.close()
}

migrateCompanies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
