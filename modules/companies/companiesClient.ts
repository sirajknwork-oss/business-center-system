export interface Company {
  id: string;
  company_code?: string;
  company_name: string;
  cn_number?: string;
  trade_license_number?: string;
  establishment_card_number?: string;
  vat_number?: string;
  contact_person?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
  assigned_staff_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

const isBrowser = typeof window !== 'undefined'

function normalizeCompany(doc: any): Company {
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

export async function getCompanies(companyId?: string) {
  if (isBrowser) {
    const path = companyId ? `/api/companies/${companyId}` : '/api/companies'
    return fetchApi(path) as Promise<Company[]>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const query: any = {}

  if (companyId) {
    query.id = companyId
  }

  const data = await db
    .collection('companies')
    .find(query)
    .sort({ created_at: -1 })
    .toArray()

  return data.map(normalizeCompany)
}

export async function getCompany(id: string) {
  if (isBrowser) {
    return fetchApi(`/api/companies/${id}`) as Promise<Company>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const result = await db.collection('companies').findOne({ id })
  if (!result) {
    throw new Error('Company not found')
  }
  return normalizeCompany(result)
}

export async function createCompany(data: Record<string, any>) {
  if (isBrowser) {
    return fetchApi('/api/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<Company>
  }

  const { getDb } = await import('@/lib/mongodb')
  const { ObjectId } = await import('mongodb')
  const db = await getDb()
  const now = new Date().toISOString()
  const company = {
    id: new ObjectId().toString(),
    created_at: now,
    updated_at: now,
    ...data,
  }

  const insertResult = await db.collection('companies').insertOne(company)
  if (!insertResult.insertedId) {
    throw new Error('Failed to create company')
  }

  return normalizeCompany(company)
}

export async function updateCompany(id: string, data: Record<string, any>) {
  if (isBrowser) {
    return fetchApi(`/api/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Promise<Company>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const now = new Date().toISOString()

  const result = await db.collection('companies').findOneAndUpdate(
    { id },
    {
      $set: {
        ...data,
        updated_at: now,
      },
    },
    { returnDocument: 'after' }
  )

  if (!result || !result.value) {
    throw new Error('Company not found')
  }

  return normalizeCompany(result.value)
}

export async function deleteCompany(id: string) {
  if (isBrowser) {
    return fetchApi(`/api/companies/${id}`, {
      method: 'DELETE',
    })
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const result = await db.collection('companies').deleteOne({ id })
  if (result.deletedCount === 0) {
    throw new Error('Company not found')
  }
}
