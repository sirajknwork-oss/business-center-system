import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const email = url.searchParams.get('email')

    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()

    const query: any = {}
    if (id) query.id = id
    if (email) query.email = email

    const data = await db.collection('profiles').find(query).toArray()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Profiles API GET error:', error)
    return NextResponse.json({ error: 'Unable to fetch profiles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const incoming = await request.json()
    const { getDb } = await import('@/lib/mongodb')
    const { ObjectId } = await import('mongodb')
    const db = await getDb()
    const now = new Date().toISOString()

    const profile = {
      id: new ObjectId().toString(),
      created_at: now,
      updated_at: now,
      ...incoming,
    }

    const insertResult = await db.collection('profiles').insertOne(profile)
    if (!insertResult.insertedId) {
      throw new Error('Failed to create profile')
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profiles API POST error:', error)
    return NextResponse.json({ error: 'Unable to create profile' }, { status: 500 })
  }
}
