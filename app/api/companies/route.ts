import { NextResponse } from 'next/server'
import { getCompanies, createCompany } from '@/modules/companies/companiesClient'

export async function GET() {
  try {
    const companies = await getCompanies()
    return NextResponse.json(companies)
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch companies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const company = await createCompany(data)
    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create company' }, { status: 500 })
  }
}
