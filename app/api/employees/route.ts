import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    const companyId = url.searchParams.get('companyId')
    const rolesParam = url.searchParams.get('roles')
    const roles = rolesParam ? rolesParam.split(',').filter(Boolean) : undefined

    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()
    const pipeline: any[] = []

    if (email) {
      pipeline.push({ $match: { email } })
    }

    if (companyId) {
      pipeline.push({ $match: { company_id: companyId } })
    }

    if (roles?.length) {
      pipeline.push({ $match: { role: { $in: roles } } })
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
      { $sort: { created_at: -1 } }
    )

    const data = await db.collection('employees').aggregate(pipeline).toArray()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Employees API GET error:', error)
    return NextResponse.json({ error: 'Unable to fetch employees' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const incoming = await request.json()
    const { getDb } = await import('@/lib/mongodb')
    const { ObjectId } = await import('mongodb')
    const db = await getDb()
    const now = new Date().toISOString()
    const employee = {
      id: new ObjectId().toString(),
      created_at: now,
      updated_at: now,
      role: incoming.role || 'staff',
      ...incoming,
    }

    const result = await db.collection('employees').insertOne(employee)
    if (!result.insertedId) {
      throw new Error('Failed to create employee')
    }

    const created = await db.collection('employees').aggregate([
      { $match: { id: employee.id } },
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
    console.error('Employees API POST error:', error)
    return NextResponse.json({ error: 'Unable to create employee' }, { status: 500 })
  }
}
