'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from '@/lib/types'
import { apiFetch, ApiError, type ApiUser } from '@/lib/api'
import { clearToken, getToken, setToken } from '@/lib/auth-token'

function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  users: User[]
  updateUser: (userId: string, updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function init() {
      const token = getToken()
      if (!token) {
        if (!cancelled) setIsLoading(false)
        return
      }
      try {
        const { user: me } = await apiFetch<{ user: ApiUser }>('/api/auth/me', {
          auth: true,
        })
        if (!cancelled) setUser(mapApiUser(me))
      } catch {
        clearToken()
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void init()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await apiFetch<{ token: string; user: ApiUser }>(
          '/api/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          },
        )
        setToken(res.token)
        setUser(mapApiUser(res.user))
        return { success: true }
      } catch (e) {
        const msg =
          e instanceof ApiError ? e.message : 'Login failed'
        return { success: false, error: msg }
      }
    },
    [],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const res = await apiFetch<{ token: string; user: ApiUser }>(
          '/api/auth/register',
          {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
          },
        )
        setToken(res.token)
        setUser(mapApiUser(res.user))
        return { success: true }
      } catch (e) {
        const msg =
          e instanceof ApiError ? e.message : 'Registration failed'
        return { success: false, error: msg }
      }
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    clearToken()
  }, [])

  const updateUser = useCallback(
    (_userId: string, _updates: Partial<User>) => {
      // Profile update API not implemented on backend
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        users: [],
        updateUser,
      }}
    >
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
