import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const dbName = process.env.MONGODB_DB || process.env.MONGODB_DATABASE || 'business-center-system'

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

let cachedClient: MongoClient | null = null
let cachedDb: ReturnType<MongoClient['db']> | null = null
let useMockDb = false

// Simple in-memory mock database for development when MongoDB is unavailable
class MockDatabase {
  private collections: Map<string, any[]> = new Map()

  collection(name: string) {
    if (!this.collections.has(name)) {
      this.collections.set(name, [])
    }
    return {
      find: (query: any) => ({
        sort: () => ({
          toArray: async () => {
            let data = this.collections.get(name) || []
            // Simple filtering
            if (query && Object.keys(query).length > 0) {
              data = data.filter(item => {
                return Object.entries(query).every(([key, value]) => item[key] === value)
              })
            }
            return data
          }
        })
      }),
      findOne: async (query: any) => {
        const data = this.collections.get(name) || []
        return data.find(item => {
          return Object.entries(query).every(([key, value]) => item[key] === value)
        }) || null
      },
      insertOne: async (doc: any) => {
        const collection = this.collections.get(name) || []
        const newDoc = { ...doc, _id: Date.now().toString() }
        collection.push(newDoc)
        this.collections.set(name, collection)
        return { insertedId: newDoc._id }
      },
      findOneAndUpdate: async (filter: any, update: any) => {
        const collection = this.collections.get(name) || []
        const index = collection.findIndex(item => {
          return Object.entries(filter).every(([key, value]) => item[key] === value)
        })
        if (index !== -1) {
          const updated = { ...collection[index], ...update.$set }
          collection[index] = updated
          return { value: updated }
        }
        return { value: null }
      },
      deleteOne: async (filter: any) => {
        const collection = this.collections.get(name) || []
        const index = collection.findIndex(item => {
          return Object.entries(filter).every(([key, value]) => item[key] === value)
        })
        if (index !== -1) {
          collection.splice(index, 1)
          return { deletedCount: 1 }
        }
        return { deletedCount: 0 }
      },
      countDocuments: async () => {
        return (this.collections.get(name) || []).length
      }
    }
  }
}

let mockDb: MockDatabase | null = null

export function resetDatabaseConnection() {
  console.log('🔄 Resetting database connection state...')
  cachedClient = null
  cachedDb = null
  useMockDb = false
  mockDb = null
}

export async function getDb() {
  // If we're already using mock DB, continue using it
  if (useMockDb && mockDb) {
    return mockDb
  }

  // If we have a cached real DB, use it
  if (cachedDb && !useMockDb) {
    return cachedDb
  }

  // Try to connect to real MongoDB first
  if (!cachedClient && !useMockDb) {
    try {
      console.log('🔌 Attempting to connect to MongoDB...')
      cachedClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      })
      await cachedClient.connect()
      console.log('✅ Connected to MongoDB successfully')
      cachedDb = cachedClient.db(dbName)
      return cachedDb
    } catch (error) {
      console.warn('⚠️  MongoDB connection failed, falling back to mock database:', error instanceof Error ? error.message : String(error))
      useMockDb = true
    }
  }

  // Use mock database as fallback
  if (useMockDb) {
    if (!mockDb) {
      mockDb = new MockDatabase()
      console.log('🗄️  Using mock database for development')
    }
    return mockDb
  }

  throw new Error('Unable to connect to database')
}
