import type { User, Habit } from './types'

// Helper to get date string
const getDateString = (daysAgo: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    avatar: undefined,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    avatar: undefined,
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'user',
    status: 'blocked',
    avatar: undefined,
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'user',
    status: 'active',
    avatar: undefined,
  },
]

export const mockHabits: Habit[] = [
  {
    id: '1',
    userId: '1',
    name: 'Morning Exercise',
    description: 'Do 30 minutes of exercise every morning',
    startDate: getDateString(30),
    createdAt: getDateString(30),
    isActive: true,
    checkIns: [
      { id: '1-1', habitId: '1', date: getDateString(0), completed: true },
      { id: '1-2', habitId: '1', date: getDateString(1), completed: true },
      { id: '1-3', habitId: '1', date: getDateString(2), completed: true },
      { id: '1-4', habitId: '1', date: getDateString(3), completed: false },
      { id: '1-5', habitId: '1', date: getDateString(4), completed: true },
      { id: '1-6', habitId: '1', date: getDateString(5), completed: true },
      { id: '1-7', habitId: '1', date: getDateString(6), completed: true },
      { id: '1-8', habitId: '1', date: getDateString(7), completed: true },
      { id: '1-9', habitId: '1', date: getDateString(8), completed: true },
    ],
  },
  {
    id: '2',
    userId: '1',
    name: 'Read for 30 minutes',
    description: 'Read at least 30 minutes before bed',
    startDate: getDateString(14),
    createdAt: getDateString(14),
    isActive: true,
    checkIns: [
      { id: '2-1', habitId: '2', date: getDateString(0), completed: false },
      { id: '2-2', habitId: '2', date: getDateString(1), completed: true },
      { id: '2-3', habitId: '2', date: getDateString(2), completed: true },
      { id: '2-4', habitId: '2', date: getDateString(3), completed: true },
      { id: '2-5', habitId: '2', date: getDateString(4), completed: true },
      { id: '2-6', habitId: '2', date: getDateString(5), completed: true },
    ],
  },
  {
    id: '3',
    userId: '1',
    name: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day',
    startDate: getDateString(7),
    createdAt: getDateString(7),
    isActive: true,
    checkIns: [
      { id: '3-1', habitId: '3', date: getDateString(0), completed: true },
      { id: '3-2', habitId: '3', date: getDateString(1), completed: true },
      { id: '3-3', habitId: '3', date: getDateString(2), completed: false },
      { id: '3-4', habitId: '3', date: getDateString(3), completed: true },
    ],
  },
  {
    id: '4',
    userId: '1',
    name: 'Meditate',
    description: '10 minutes of mindfulness meditation',
    startDate: getDateString(21),
    createdAt: getDateString(21),
    isActive: true,
    checkIns: [],
  },
]

export const getStoredUsers = (): User[] => {
  if (typeof window === 'undefined') return mockUsers
  const stored = localStorage.getItem('habit-tracker-users')
  return stored ? JSON.parse(stored) : mockUsers
}

export const setStoredUsers = (users: User[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('habit-tracker-users', JSON.stringify(users))
  }
}

export const getStoredHabits = (): Habit[] => {
  if (typeof window === 'undefined') return mockHabits
  const stored = localStorage.getItem('habit-tracker-habits')
  return stored ? JSON.parse(stored) : mockHabits
}

export const setStoredHabits = (habits: Habit[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('habit-tracker-habits', JSON.stringify(habits))
  }
}
