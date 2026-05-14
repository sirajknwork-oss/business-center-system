import { NextResponse } from 'next/server'
import { getCompanies, createCompany } from '@/modules/companies/companiesClient'

export async function GET() {
  try {
    const companies = await getCompanies()
    return NextResponse.json(companies)
  } catch (error) {
    console.error('Companies API GET error:', error)
    const message = error instanceof Error ? error.message : String(error)
    
    // Check for common database connection issues
    if (message.includes('Authentication failed') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
      return NextResponse.json({
        error: 'Database connection failed. Please check your MongoDB configuration.',
        details: process.env.NODE_ENV === 'development' ? message : 'Contact administrator'
      }, { status: 500 })
    }
    
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'production' ? 'Unable to fetch companies' : message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const company = await createCompany(data)
    return NextResponse.json(company)
  } catch (error) {
    console.error('Companies API POST error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'production' ? 'Unable to create company' : message },
      { status: 500 }
    )
  }
}
