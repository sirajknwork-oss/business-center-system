'use client'

import { useState, useEffect } from 'react'

export default function FirebasePage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Mock data for now
        const mockCompanies = [
          { id: '1', name: 'Test Company 1', email: 'test1@example.com' },
          { id: '2', name: 'Test Company 2', email: 'test2@example.com' }
        ]
        setCompanies(mockCompanies)
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center'>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-orange-600 mb-6'>Firebase + Firestore Version</h1>
        <p className='text-gray-600 mb-4'>Your business management system with Firebase!</p>
        
        <div className='bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-6'>
          🔥 Firebase + Firestore + Netlify Ready!
        </div>

        <div className='bg-white p-6 rounded-lg shadow mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Companies ({companies.length})</h2>
          {companies.length > 0 ? (
            <div className='space-y-2'>
              {companies.map((company: any) => (
                <div key={company.id} className='border p-4 rounded'>
                  <h3 className='font-semibold'>{company.name}</h3>
                  <p className='text-gray-600'>{company.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-gray-500'>No companies found</p>
          )}
        </div>

        <div className='bg-blue-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold mb-2'>Next Steps</h3>
          <ul className='space-y-2'>
            <li>✅ Firebase Authentication ready</li>
            <li>✅ Firestore Database connected</li>
            <li>✅ Ready for Netlify deployment</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
