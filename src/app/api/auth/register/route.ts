import { NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'

export async function POST(request: Request) {
  try {
    const { username, password, role, companyId } = await request.json()

    // Validate input
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const userExists = await AuthService.userExists(username)
    if (userExists) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await AuthService.register({
      username,
      password,
      role,
      companyId
    })

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          companyId: newUser.companyId
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
