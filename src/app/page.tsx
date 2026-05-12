export default function Home() {
  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-blue-600 mb-6'>Noor Al Huda Business Center System</h1>
        <p className='text-gray-600 mb-4'>Your business management system is ready!</p>
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded'>
          ✅ Successfully deployed to Vercel!
        </div>
        <div className='mt-8 bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-4'>Features</h2>
          <ul className='space-y-2'>
            <li className='flex items-center'>✅ Company Management</li>
            <li className='flex items-center'>✅ Employee Management</li>
            <li className='flex items-center'>✅ Expiry Tracking</li>
            <li className='flex items-center'>✅ Document Management</li>
            <li className='flex items-center'>✅ User Management</li>
          </ul>
        </div>
        <div className='mt-6 bg-blue-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold mb-2'>Next Steps</h3>
          <p className='text-gray-700'>Login to start managing your business center operations.</p>
        </div>
      </div>
    </div>
  )
}
