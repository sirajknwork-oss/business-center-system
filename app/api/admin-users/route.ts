import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()

    const data = await db.collection('admin_users_storage').aggregate([
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: 'id',
          as: 'companies',
        },
      },
      {
        $set: {
          companies: { $arrayElemAt: ['$companies', 0] },
        },
      },
      { $sort: { created_at: -1 } },
    ]).toArray()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin users API GET error:', error)
    return NextResponse.json({ error: 'Unable to fetch admin users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const incoming = await request.json()
    const { getDb } = await import('@/lib/mongodb')
    const { ObjectId } = await import('mongodb')
    const db = await getDb()
    const now = new Date().toISOString()

    const user = {
      id: new ObjectId().toString(),
      created_at: now,
      updated_at: now,
      ...incoming,
    }

    const insertResult = await db.collection('admin_users_storage').insertOne(user)
    if (!insertResult.insertedId) {
      throw new Error('Failed to create admin user')
    }

    const created = await db.collection('admin_users_storage').aggregate([
      { $match: { id: user.id } },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: 'id',
          as: 'companies',
        },
      },
      {
        $set: {
          companies: { $arrayElemAt: ['$companies', 0] },
        },
      },
    ]).toArray()

    return NextResponse.json(created[0])
  } catch (error) {
    console.error('Admin users API POST error:', error)
    return NextResponse.json({ error: 'Unable to create admin user' }, { status: 500 })
  }
}
