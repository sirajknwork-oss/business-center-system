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

async function migrateEmployees() {
  console.log('🔄 Migrating employees from Supabase to MongoDB...')

  const { data, error } = await supabase.from('employees').select('*')
  if (error) {
    console.log('❌ Error fetching employees from Supabase:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️ No employees found in Supabase.')
    return
  }

  const mongoClient = new MongoClient(mongoUri as string)
  await mongoClient.connect()
  const db = mongoClient.db(mongoDbName)
  const employeesCollection = db.collection('employees')

  const documents = data.map((employee: any) => ({
    ...employee,
    id: employee.id ?? new ObjectId().toString(),
    created_at: employee.created_at ?? new Date().toISOString(),
    updated_at: employee.updated_at ?? new Date().toISOString(),
    role: employee.role ?? 'staff'
  }))

  const insertResult = await employeesCollection.insertMany(documents)
  console.log(`✅ Inserted ${insertResult.insertedCount} employees into MongoDB.`)

  await mongoClient.close()
}

migrateEmployees()
  .then(() => {
    console.log('🎉 Employees migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Employees migration failed:', error)
    process.exit(1)
  })