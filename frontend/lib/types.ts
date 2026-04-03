export type UserRole = 'user' | 'admin'

export type UserStatus = 'active' | 'blocked'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  avatar?: string
}

export interface Habit {
  id: string
  userId: string
  name: string
  description: string
  startDate: string
  createdAt: string
  isActive: boolean
  checkIns: CheckIn[]
}

export interface CheckIn {
  id: string
  habitId: string
  date: string
  completed: boolean
}

export interface HabitStats {
  currentStreak: number
  longestStreak: number
  completionRate: number
  totalCheckIns: number
  totalDays: number
}
