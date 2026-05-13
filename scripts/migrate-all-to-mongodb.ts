import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { ObjectId, MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const mongoUri = process.env.MONGODB_URI
const mongoDbName = process.env.MONGODB_DB || 'business-center-system'

if (!supabaseUrl || !supabaseKey || !mongoUri) {
  throw new Error('Required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MONGODB_URI')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateAllData() {
  console.log('🚀 Starting complete Supabase to MongoDB migration...\n')

  const mongoClient = new MongoClient(mongoUri as string, {
    tls: false,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 5,
  })
  await mongoClient.connect()
  const db = mongoClient.db(mongoDbName)

  // First, let's check what tables exist in Supabase
  console.log('🔍 Checking Supabase tables...')
  try {
    // Try to query information_schema for table names
    const { data: tableData, error: tableError } = await supabase.rpc('sql', {
      query: "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    })
    
    if (tableError) {
      console.log('❌ Could not query pg_tables:', tableError.message)
      // Try a different approach - just try to select from each table
      const testTables = ['companies', 'employees', 'expiry_items', 'store_items', 'admin_users_storage', 'profiles', 'users']
      for (const tableName of testTables) {
        try {
          const { data, error } = await supabase.from(tableName).select('count').limit(1)
          if (!error) {
            console.log(`✅ Table '${tableName}' exists`)
          } else {
            console.log(`❌ Table '${tableName}' not accessible:`, error.message)
          }
        } catch (err) {
          console.log(`❌ Error checking table '${tableName}':`, err)
        }
      }
    } else {
      console.log('📋 Available tables:', tableData?.map(t => t.tablename))
    }
  } catch (err) {
    console.log('❌ Error checking Supabase tables:', err)
  }

  // Migration collections mapping
  const migrations = [
    { name: 'companies', supabaseTable: 'companies', mongoCollection: 'companies' },
    { name: 'employees', supabaseTable: 'employees', mongoCollection: 'employees' },
    { name: 'expiry_items', supabaseTable: 'expiry_items', mongoCollection: 'expiry_items' },
    { name: 'store_items', supabaseTable: 'store_items', mongoCollection: 'store_items' },
    { name: 'admin_users_storage', supabaseTable: 'admin_users_storage', mongoCollection: 'admin_users_storage' },
    { name: 'profiles', supabaseTable: 'profiles', mongoCollection: 'profiles' }
  ]

  for (const migration of migrations) {
    try {
      console.log(`🔄 Migrating ${migration.name}...`)

      const { data, error } = await supabase.from(migration.supabaseTable).select('*')
      if (error) {
        console.log(`❌ Error fetching ${migration.name} from Supabase:`, error.message)
        continue
      }

      if (!data || data.length === 0) {
        console.log(`ℹ️ No ${migration.name} found in Supabase.`)
        continue
      }

      const collection = db.collection(migration.mongoCollection)

      const documents = data.map((item: any) => ({
        ...item,
        id: item.id ?? new ObjectId().toString(),
        created_at: item.created_at ?? new Date().toISOString(),
        updated_at: item.updated_at ?? new Date().toISOString(),
        // Set defaults for specific fields
        ...(migration.name === 'employees' && { role: item.role ?? 'staff' }),
        ...(migration.name === 'admin_users_storage' && { role: item.role ?? 'staff' })
      }))

      const insertResult = await collection.insertMany(documents)
      console.log(`✅ Inserted ${insertResult.insertedCount} ${migration.name} into MongoDB.`)

    } catch (error) {
      console.error(`❌ Failed to migrate ${migration.name}:`, error)
    }
  }

  await mongoClient.close()
  console.log('\n🎉 Complete migration finished!')
}

migrateAllData()
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })