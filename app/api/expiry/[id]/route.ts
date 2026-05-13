import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()
    const data = await db.collection('expiry_items').aggregate([
      { $match: { id: params.id } },
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
      {
        $lookup: {
          from: 'employees',
          localField: 'employee_id',
          foreignField: 'id',
          as: 'employees',
        },
      },
      {
        $set: {
          employees: { $arrayElemAt: ['$employees', 0] },
        },
      },
    ]).toArray()

    if (!data[0]) {
      return NextResponse.json({ error: 'Expiry item not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Expiry API GET by id error:', error)
    return NextResponse.json({ error: 'Unable to fetch expiry item' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const incoming = await request.json()
    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()
    const now = new Date().toISOString()

    const result = await db.collection('expiry_items').findOneAndUpdate(
      { id: params.id },
      { $set: { ...incoming, updated_at: now } },
      { returnDocument: 'after' }
    )

    if (!result || !result.value) {
      return NextResponse.json({ error: 'Expiry item not found' }, { status: 404 })
    }

    const updated = await db.collection('expiry_items').aggregate([
      { $match: { id: params.id } },
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
      {
        $lookup: {
          from: 'employees',
          localField: 'employee_id',
          foreignField: 'id',
          as: 'employees',
        },
      },
      {
        $set: {
          employees: { $arrayElemAt: ['$employees', 0] },
        },
      },
    ]).toArray()

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Expiry API PATCH error:', error)
    return NextResponse.json({ error: 'Unable to update expiry item' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()
    const result = await db.collection('expiry_items').deleteOne({ id: params.id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Expiry item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Expiry API DELETE error:', error)
    return NextResponse.json({ error: 'Unable to delete expiry item' }, { status: 500 })
  }
}
