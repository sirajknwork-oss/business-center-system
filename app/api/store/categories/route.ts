import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { getDb } = await import('@/lib/mongodb')
    const db = await getDb()

    const data = await db
      .collection('store_items')
      .find({ category: { $ne: null } })
      .project({ category: 1 })
      .toArray()

    const categories = [...new Set(data.map(item => item.category).filter(Boolean))]
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Store categories API GET error:', error)
    return NextResponse.json({ error: 'Unable to fetch store categories' }, { status: 500 })
  }
}
