const isBrowser = typeof window !== 'undefined'

export interface AdminUserStorage {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'staff' | 'customer';
  company_id?: string;
  customer_type?: 'company' | 'individual';
  created_by?: string;
  created_at: string;
  updated_at: string;
  companies?: { id: string; name: string } | null;
  [key: string]: any;
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

function buildQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (!value) return
    searchParams.append(key, value)
  })
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export async function getAdminUsers(): Promise<AdminUserStorage[]> {
  if (isBrowser) {
    return fetchApi('/api/admin-users') as Promise<AdminUserStorage[]>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const data = await db.collection<AdminUserStorage>('admin_users_storage').aggregate([
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
  ]).toArray() as AdminUserStorage[]

  return data
}

export async function createAdminUser(userData: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'staff' | 'customer';
  company_id?: string;
}): Promise<AdminUserStorage> {
  if (isBrowser) {
    return fetchApi('/api/admin-users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }) as Promise<AdminUserStorage>
  }

  const { getDb } = await import('@/lib/mongodb')
  const { ObjectId } = await import('mongodb')
  const db = await getDb()
  const now = new Date().toISOString()
  const user = {
    id: new ObjectId().toString(),
    created_at: now,
    updated_at: now,
    ...userData,
  }

  const insertResult = await db.collection('admin_users_storage').insertOne(user)
  if (!insertResult.insertedId) {
    throw new Error('Failed to create admin user')
  }

  const [created] = await db.collection<AdminUserStorage>('admin_users_storage').aggregate([
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
  ]).toArray() as AdminUserStorage[]

  return created
}

export async function deleteAdminUser(id: string): Promise<void> {
  if (isBrowser) {
    await fetchApi(`/api/admin-users/${id}`, {
      method: 'DELETE',
    })
    return
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const result = await db.collection('admin_users_storage').deleteOne({ id })
  if (result.deletedCount === 0) {
    throw new Error('Admin user not found')
  }
}

export async function updateAdminUser(
  id: string,
  userData: Partial<AdminUserStorage>
): Promise<AdminUserStorage> {
  if (isBrowser) {
    return fetchApi(`/api/admin-users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }) as Promise<AdminUserStorage>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const result = await db.collection<AdminUserStorage>('admin_users_storage').findOneAndUpdate(
    { id },
    { $set: { ...userData, updated_at: new Date().toISOString() } },
    { returnDocument: 'after' }
  )

  if (!result || !result.value) {
    throw new Error('Admin user not found')
  }

  const [updated] = await db.collection<AdminUserStorage>('admin_users_storage').aggregate([
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
  ]).toArray() as AdminUserStorage[]

  return updated
}
