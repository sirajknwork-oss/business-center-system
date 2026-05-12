'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, error } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await login(username, password)
      router.push('/dashboard')
    } catch (error) {
      // Error is handled by useAuth hook
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-xl p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Noor Al Huda Business Center
          </h1>
          <p className='text-gray-600'>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
              {error}
            </div>
          )}

          <div>
            <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-2'>
              Username
            </label>
            <input
              id='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition'
              placeholder='Enter your username'
              required
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
              Password
            </label>
            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition'
                placeholder='Enter your password'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Don't have an account?{' '}
            <a href='/signup' className='text-blue-600 hover:text-blue-700 font-medium'>
              Contact your admin
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
