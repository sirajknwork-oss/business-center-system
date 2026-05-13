const isBrowser = typeof window !== 'undefined'

export interface StoreItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
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

export async function getStoreItems(companyId?: string) {
  if (isBrowser) {
    const query = buildQuery({ companyId })
    return fetchApi(`/api/store${query}`) as Promise<StoreItem[]>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const query: any = {}
  if (companyId) {
    query.company_id = companyId
  }

  const data = await db
    .collection<StoreItem>('store_items')
    .find(query)
    .sort({ created_at: -1 })
    .toArray()

  return data
}

export async function getStoreItem(id: string) {
  if (isBrowser) {
    return fetchApi(`/api/store/${id}`) as Promise<StoreItem>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const result = await db.collection<StoreItem>('store_items').findOne({ id })

  if (!result) {
    throw new Error('Store item not found')
  }

  return result
}

export async function createStoreItem(data: {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category: string;
  company_id?: string;
}) {
  if (isBrowser) {
    return fetchApi('/api/store', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<StoreItem>
  }

  const { getDb } = await import('@/lib/mongodb')
  const { ObjectId } = await import('mongodb')
  const db = await getDb()
  const now = new Date().toISOString()

  const storeItem = {
    id: new ObjectId().toString(),
    created_at: now,
    updated_at: now,
    ...data,
  }

  const result = await db.collection('store_items').insertOne(storeItem)
  if (!result.insertedId) {
    throw new Error('Failed to create store item')
  }

  return storeItem as StoreItem
}

export async function updateStoreItem(id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  stock_quantity?: number;
  category?: string;
}) {
  if (isBrowser) {
    return fetchApi(`/api/store/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Promise<StoreItem>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const now = new Date().toISOString()
  const result = await db.collection('store_items').findOneAndUpdate(
    { id },
    { $set: { ...data, updated_at: now } },
    { returnDocument: 'after' }
  )

  if (!result || !result.value) {
    throw new Error('Store item not found')
  }

  return result.value as StoreItem
}

export async function deleteStoreItem(id: string) {
  if (isBrowser) {
    await fetchApi(`/api/store/${id}`, {
      method: 'DELETE',
    })
    return
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const result = await db.collection('store_items').deleteOne({ id })
  if (result.deletedCount === 0) {
    throw new Error('Store item not found')
  }
}

export async function getStoreCategories() {
  if (isBrowser) {
    return fetchApi('/api/store/categories') as Promise<string[]>
  }

  const { getDb } = await import('@/lib/mongodb')
  const db = await getDb()
  const data = await db
    .collection('store_items')
    .find({ category: { $ne: null } })
    .project({ category: 1 })
    .toArray()

  const categories = [...new Set(data.map(item => item.category).filter(Boolean))]
  return categories as string[]
}
