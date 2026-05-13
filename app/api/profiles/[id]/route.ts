import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()
    const result = await db.collection('profiles').findOne({ id: params.id })

    if (!result) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Profiles API GET by id error:', error)
    return NextResponse.json({ error: 'Unable to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const incoming = await request.json()
    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()
    const now = new Date().toISOString()

    const result = await db.collection('profiles').findOneAndUpdate(
      { id: params.id },
      { $set: { ...incoming, updated_at: now } },
      { returnDocument: 'after' }
    )

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(result.value)
  } catch (error) {
    console.error('Profiles API PATCH error:', error)
    return NextResponse.json({ error: 'Unable to update profile' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()
    const result = await db.collection('profiles').deleteOne({ id: params.id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profiles API DELETE error:', error)
    return NextResponse.json({ error: 'Unable to delete profile' }, { status: 500 })
  }
}
