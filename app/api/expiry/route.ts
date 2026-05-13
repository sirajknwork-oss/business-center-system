import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const companyId = url.searchParams.get('companyId')
    const documentType = url.searchParams.get('documentType')
    const documentCategory = url.searchParams.get('documentCategory')

    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()

    const pipeline: any[] = []

    const match: Record<string, any> = {}
    if (companyId) match.company_id = companyId
    if (documentType) match.document_type = documentType
    if (documentCategory) match.document_category = documentCategory
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match })
    }

    pipeline.push(
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
      { $sort: { expires_at: 1 } }
    )

    const data = await db.collection('expiry_items').aggregate(pipeline).toArray()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Expiry API GET error:', error)
    return NextResponse.json({ error: 'Unable to fetch expiry items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const incoming = await request.json()
    const { getDb } = await import('@/lib/mongodb')
    const { ObjectId } = await import('mongodb')
    const db = await getDb()
    const now = new Date().toISOString()

    const expiryItem = {
      id: new ObjectId().toString(),
      created_at: now,
      updated_at: now,
      ...incoming,
    }

    const insertResult = await db.collection('expiry_items').insertOne(expiryItem)
    if (!insertResult.insertedId) {
      throw new Error('Failed to create expiry item')
    }

    const created = await db.collection('expiry_items').aggregate([
      { $match: { id: expiryItem.id } },
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

    return NextResponse.json(created[0])
  } catch (error) {
    console.error('Expiry API POST error:', error)
    return NextResponse.json({ error: 'Unable to create expiry item' }, { status: 500 })
  }
}
