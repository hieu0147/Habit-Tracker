import { clearToken, getToken } from './auth-token'

export function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(
    /\/$/,
    '',
  )
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type FetchOptions = RequestInit & { auth?: boolean; skipJson?: boolean }

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = false, skipJson = false, ...init } = options
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, { ...init, headers })

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  let data: unknown = {}
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = { message: text }
    }
  }

  if (res.status === 401 && auth) {
    clearToken()
  }

  if (!res.ok) {
    const message =
      typeof (data as { message?: string })?.message === 'string'
        ? (data as { message: string }).message
        : res.statusText || 'Request failed'
    throw new ApiError(res.status, message, data)
  }

  if (skipJson) {
    return undefined as T
  }

  return data as T
}

export type ApiUser = {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  status: 'active' | 'blocked'
  createdAt?: string
  updatedAt?: string
}

export type ApiHabit = {
  id: string
  userId: string
  title: string
  description: string
  startDate: string
  isActive: boolean
  color?: string
  targetPerDay?: number
  createdAt?: string
  updatedAt?: string
}

export type ApiHabitLog = {
  id: string
  habitId: string
  userId: string
  date: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export type ApiHabitStreak = {
  habitId: string
  today: string
  currentStreak: number
  longestStreak: number
  totalCompletedDays: number
  weeklyCompletionRate: number
  monthlyCompletionRate: number
}

export type ApiDashboardHabitRow = {
  habit: ApiHabit
  completedToday: boolean
  currentStreak: number
  longestStreak: number
  totalCompletedDays: number
  weeklyCompletionRate: number
  monthlyCompletionRate: number
}

export type ApiDashboardResponse = {
  today: string
  totalHabits: number
  completedToday: number
  habits: ApiDashboardHabitRow[]
  atRisk: Array<{
    habit: ApiHabit
    currentStreak: number
  }>
}
