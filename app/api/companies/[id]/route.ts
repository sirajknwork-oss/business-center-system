import { NextResponse } from 'next/server'
import { getCompany, updateCompany, deleteCompany } from '@/modules/companies/companiesClient'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const company = await getCompany(params.id)
    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const company = await updateCompany(params.id, data)
    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update company' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteCompany(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete company' }, { status: 500 })
  }
}
