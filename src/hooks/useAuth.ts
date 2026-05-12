import { useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  role: 'creator' | 'admin' | 'staff' | 'customer'
  companyId?: string
  lastLogin?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // Login function
  const login = async (username: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      
      return data.user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData: {
    username: string
    password: string
    role: 'creator' | 'admin' | 'staff' | 'customer'
    companyId?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      return data.user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setError(null)
  }

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Get user role
  const userRole = user?.role

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    userRole,
  }
}
