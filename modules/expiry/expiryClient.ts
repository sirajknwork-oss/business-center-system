export interface ExpiryItem {
  id: string;
  title: string;
  description?: string;
  expires_at: string;
  company_id?: string;
  employee_id?: string;
  document_type?: string;
  document_category?: string;
  document_status?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  companies?: { id: string; name: string } | null;
  employees?: { id: string; name: string; email?: string } | null;
  [key: string]: any;
}

const isBrowser = typeof window !== 'undefined'

function normalizeExpiryItem(doc: any): ExpiryItem {
  return {
    ...doc,
    id: String(doc.id ?? doc._id?.toString()),
  }
}

function buildQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (!value) return
    searchParams.append(key, value)
  })
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
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

export async function getExpiryItems(companyId?: string, documentType?: string, documentCategory?: string) {
  if (isBrowser) {
    const query = buildQuery({ companyId, documentType, documentCategory })
    return fetchApi(`/api/expiry${query}`) as Promise<ExpiryItem[]>
  }

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
  return data.map(normalizeExpiryItem)
}

export async function getExpiryItem(id: string) {
  if (isBrowser) {
    return fetchApi(`/api/expiry/${id}`) as Promise<ExpiryItem>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const data = await db.collection('expiry_items').aggregate([
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
    throw new Error('Expiry item not found')
  }

  return normalizeExpiryItem(data[0])
}

export async function createExpiryItem(data: { 
  title: string; 
  description?: string; 
  expires_at: string; 
  company_id?: string;
  employee_id?: string;
  document_type?: string;
  document_category?: string;
  document_status?: string;
}) {
  if (isBrowser) {
    return fetchApi('/api/expiry', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<ExpiryItem>
  }

  const { getDb } = await import('@/lib/mongodb')
  const { ObjectId } = await import('mongodb')
  const db = await getDb()
  const now = new Date().toISOString()
  const expiryItem = {
    id: new ObjectId().toString(),
    created_at: now,
    updated_at: now,
    ...data,
  }

  const result = await db.collection('expiry_items').insertOne(expiryItem)
  if (!result.insertedId) {
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

  return normalizeExpiryItem(created[0])
}

export async function updateExpiryItem(id: string, data: { 
  title?: string; 
  description?: string; 
  expires_at?: string; 
  company_id?: string;
  employee_id?: string;
  document_type?: string;
  document_category?: string;
  document_status?: string;
}) {
  if (isBrowser) {
    return fetchApi(`/api/expiry/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Promise<ExpiryItem>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const now = new Date().toISOString()
  const result = await db.collection('expiry_items').findOneAndUpdate(
    { id },
    { $set: { ...data, updated_at: now } },
    { returnDocument: 'after' }
  )

  if (!result || !result.value) {
    throw new Error('Expiry item not found')
  }

  const updated = await db.collection('expiry_items').aggregate([
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

  return normalizeExpiryItem(updated[0])
}

export async function deleteExpiryItem(id: string) {
  if (isBrowser) {
    return fetchApi(`/api/expiry/${id}`, {
      method: 'DELETE',
    })
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const result = await db.collection('expiry_items').deleteOne({ id })
  if (result.deletedCount === 0) {
    throw new Error('Expiry item not found')
  }
}
