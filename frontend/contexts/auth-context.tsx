'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@/lib/types'
import { mockUsers, getStoredUsers, setStoredUsers } from '@/lib/mock-data'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  users: User[]
  updateUser: (userId: string, updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load stored users
    const storedUsers = getStoredUsers()
    setUsers(storedUsers)

    // Check for logged in user
    const storedUser = localStorage.getItem('habit-tracker-current-user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      // Check if user still exists and is not blocked
      const currentUser = storedUsers.find(u => u.id === parsedUser.id)
      if (currentUser && currentUser.status !== 'blocked') {
        setUser(currentUser)
      } else {
        localStorage.removeItem('habit-tracker-current-user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' }
    }

    if (foundUser.status === 'blocked') {
      return { success: false, error: 'Your account has been blocked. Please contact support.' }
    }

    // Simulate password check (in a real app, this would be server-side)
    // For demo, any password works
    setUser(foundUser)
    localStorage.setItem('habit-tracker-current-user', JSON.stringify(foundUser))
    
    return { success: true }
  }, [users])

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check for duplicate email
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' }
    }

    // Password validation (simulated)
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'user',
      status: 'active',
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    setStoredUsers(updatedUsers)
    setUser(newUser)
    localStorage.setItem('habit-tracker-current-user', JSON.stringify(newUser))
    
    return { success: true }
  }, [users])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('habit-tracker-current-user')
  }, [])

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    )
    setUsers(updatedUsers)
    setStoredUsers(updatedUsers)

    // If updating current user, update the state
    if (user?.id === userId) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('habit-tracker-current-user', JSON.stringify(updatedUser))
    }
  }, [users, user])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, users, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
