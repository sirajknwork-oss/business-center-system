import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const dbName = process.env.MONGODB_DB || process.env.MONGODB_DATABASE || 'business-center-system'

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

let cachedClient: MongoClient | null = null
let cachedDb: ReturnType<MongoClient['db']> | null = null

export async function getDb() {
  if (cachedDb) {
    return cachedDb
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
  }

  cachedDb = cachedClient.db(dbName)
  return cachedDb
}
