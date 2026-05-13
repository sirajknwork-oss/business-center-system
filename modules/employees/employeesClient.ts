export interface Employee {
  id: string;
  employee_id?: string;
  company_id?: string;
  name: string;
  passport_number?: string;
  visa_number?: string;
  emirates_id_number?: string;
  labour_card_number?: string;
  designation?: string;
  salary?: number;
  joining_date?: string;
  nationality?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_mobile?: string;
  emergency_contact_relation?: string;
  status?: string;
  passport_expiry_date?: string;
  visa_expiry_date?: string;
  emirates_id_issue_date?: string;
  emirates_id_expiry_date?: string;
  labour_card_expiry_date?: string;
  insurance?: string;
  insurance_expiry_date?: string;
  iloe_expiry_date?: string;
  date_of_birth?: string;
  role: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  companies?: { id: string; name: string; email?: string };
  [key: string]: any;
}

const isBrowser = typeof window !== 'undefined'

function normalizeEmployee(doc: any): Employee {
  return {
    ...doc,
    id: String(doc.id ?? doc._id?.toString()),
  }
}

async function fetchApi(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || 'API request failed')
  }

  return response.json()
}

function buildQuery(params: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (!value) return
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v))
    } else {
      searchParams.append(key, value)
    }
  })
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export async function getEmployees(companyId?: string) {
  if (isBrowser) {
    const query = buildQuery({ companyId })
    return fetchApi(`/api/employees${query}`) as Promise<Employee[]>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const pipeline: any[] = []

  if (companyId) {
    pipeline.push({ $match: { company_id: companyId } })
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
  return data.map(normalizeEmployee)
}

export async function getEmployeesByRoles(roles: string[], companyId?: string) {
  if (isBrowser) {
    const query = buildQuery({ roles, companyId })
    return fetchApi(`/api/employees${query}`) as Promise<Employee[]>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const pipeline: any[] = []

  pipeline.push({ $match: { role: { $in: roles } } })

  if (companyId) {
    pipeline.push({ $match: { company_id: companyId } })
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
  return data.map(normalizeEmployee)
}

export async function getEmployeeByEmail(email: string) {
  if (isBrowser) {
    const query = buildQuery({ email })
    const data = (await fetchApi(`/api/employees${query}`)) as Employee[]
    return data[0] ?? null
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const pipeline: any[] = [
    { $match: { email } },
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
  ]

  const data = await db.collection('employees').aggregate(pipeline).toArray()
  return data.map(normalizeEmployee)[0] ?? null
}

export async function getEmployee(id: string) {
  if (isBrowser) {
    return fetchApi(`/api/employees/${id}`) as Promise<Employee>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const pipeline: any[] = [
    { $match: { id } },
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
  ]

  const data = await db.collection('employees').aggregate(pipeline).toArray()
  if (!data[0]) {
    throw new Error('Employee not found')
  }
  return normalizeEmployee(data[0])
}

export async function createEmployee(data: Record<string, any>) {
  if (isBrowser) {
    return fetchApi('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<Employee>
  }

  const { getDb } = await import('@/lib/mongodb')
  const { ObjectId } = await import('mongodb')
  const db = await getDb()
  const now = new Date().toISOString()
  const employee = {
    id: new ObjectId().toString(),
    created_at: now,
    updated_at: now,
    role: data.role || 'staff',
    ...data,
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

  return normalizeEmployee(created[0])
}

export async function updateEmployee(id: string, data: Record<string, any>) {
  if (isBrowser) {
    return fetchApi(`/api/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Promise<Employee>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const now = new Date().toISOString()
  const result = await db.collection('employees').findOneAndUpdate(
    { id },
    { $set: { ...data, updated_at: now } },
    { returnDocument: 'after' }
  )

  if (!result || !result.value) {
    throw new Error('Employee not found')
  }

  const updated = await db.collection('employees').aggregate([
    { $match: { id } },
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

  return normalizeEmployee(updated[0])
}

export async function deleteEmployee(id: string) {
  if (isBrowser) {
    return fetchApi(`/api/employees/${id}`, {
      method: 'DELETE',
    })
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const result = await db.collection('employees').deleteOne({ id })
  if (result.deletedCount === 0) {
    throw new Error('Employee not found')
  }
}
