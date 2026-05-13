import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const companyId = url.searchParams.get('companyId')
    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()

    const query: any = {}
    if (companyId) {
      query.company_id = companyId
    }

    const data = await db
      .collection('store_items')
      .find(query)
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Store API GET error:', error)
    return NextResponse.json({ error: 'Unable to fetch store items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const incoming = await request.json()
    const { getDb } = await import('@/lib/mongodb')
    const { ObjectId } = await import('mongodb')
    const db = await getDb()
    const now = new Date().toISOString()

    const storeItem = {
      id: new ObjectId().toString(),
      created_at: now,
      updated_at: now,
      ...incoming,
    }

    const insertResult = await db.collection('store_items').insertOne(storeItem)
    if (!insertResult.insertedId) {
      throw new Error('Failed to create store item')
    }

    return NextResponse.json(storeItem)
  } catch (error) {
    console.error('Store API POST error:', error)
    return NextResponse.json({ error: 'Unable to create store item' }, { status: 500 })
  }
}
