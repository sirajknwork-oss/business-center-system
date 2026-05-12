import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface User {
  id?: string
  username: string
  password: string
  role: 'creator' | 'admin' | 'staff' | 'customer'
  companyId?: string
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

export class AuthService {
  // Register new user
  static async register(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
    try {
      const usersRef = collection(db, 'users')
      const docRef = await addDoc(usersRef, {
        ...userData,
        createdAt: new Date(),
        isActive: true
      })
      
      return {
        id: docRef.id,
        ...userData,
        createdAt: new Date(),
        isActive: true
      }
    } catch (error) {
      throw new Error('Failed to register user')
    }
  }

  // Login user
  static async login(username: string, password: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('username', '==', username), where('password', '==', password))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }
      
      const userDoc = querySnapshot.docs[0]
      const userData = userDoc.data() as User
      
      // Update last login
      await updateDoc(doc(db, 'users', userDoc.id), {
        lastLogin: new Date()
      })
      
      return {
        id: userDoc.id,
        ...userData
      }
    } catch (error) {
      throw new Error('Login failed')
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('id', '==', userId))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }
      
      const userDoc = querySnapshot.docs[0]
      return {
        id: userDoc.id,
        ...userDoc.data() as User
      }
    } catch (error) {
      throw new Error('Failed to get user')
    }
  }

  // Get all users (for admin)
  static async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users')
      const querySnapshot = await getDocs(usersRef)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as User
      }))
    } catch (error) {
      throw new Error('Failed to get users')
    }
  }

  // Update user
  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), updates)
    } catch (error) {
      throw new Error('Failed to update user')
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId))
    } catch (error) {
      throw new Error('Failed to delete user')
    }
  }

  // Check if user exists
  static async userExists(username: string): Promise<boolean> {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('username', '==', username))
      const querySnapshot = await getDocs(q)
      
      return !querySnapshot.empty
    } catch (error) {
      throw new Error('Failed to check user existence')
    }
  }
}
