'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Habit, CheckIn, HabitStats } from '@/lib/types'
import { mockHabits, getStoredHabits, setStoredHabits } from '@/lib/mock-data'
import { useAuth } from './auth-context'

interface HabitsContextType {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  simulateError: boolean
  setSimulateError: (value: boolean) => void
  addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'checkIns' | 'isActive'>) => Promise<void>
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>
  deleteHabit: (habitId: string) => Promise<{ success: boolean; error?: string }>
  toggleCheckIn: (habitId: string, date: string) => void
  getHabitStats: (habitId: string) => HabitStats
  getTodayHabits: () => Habit[]
  getCompletedTodayCount: () => number
  getCurrentStreak: (habitId: string) => number
  reload: () => void
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined)

const getTodayString = () => new Date().toISOString().split('T')[0]

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [allHabits, setAllHabits] = useState<Habit[]>(mockHabits)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [simulateError, setSimulateError] = useState(false)

  const loadHabits = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (simulateError) {
      setError('Failed to load habits. Please try again.')
      setIsLoading(false)
      return
    }

    const stored = getStoredHabits()
    setAllHabits(stored)
    setIsLoading(false)
  }, [simulateError])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  // Filter habits for current user
  const habits = useMemo(() => {
    if (!user) return []
    return allHabits.filter(h => h.userId === user.id)
  }, [allHabits, user])

  const addHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'checkIns' | 'isActive'>) => {
    if (!user) return

    await new Promise(resolve => setTimeout(resolve, 500))

    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      isActive: true,
      checkIns: [],
    }

    const updated = [...allHabits, newHabit]
    setAllHabits(updated)
    setStoredHabits(updated)
  }, [allHabits, user])

  const updateHabit = useCallback(async (habitId: string, updates: Partial<Habit>) => {
    await new Promise(resolve => setTimeout(resolve, 500))

    const updated = allHabits.map(h => 
      h.id === habitId ? { ...h, ...updates } : h
    )
    setAllHabits(updated)
    setStoredHabits(updated)
  }, [allHabits])

  const deleteHabit = useCallback(async (habitId: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    const habit = allHabits.find(h => h.id === habitId)
    if (!habit) {
      return { success: false, error: 'Habit not found' }
    }

    const updated = allHabits.filter(h => h.id !== habitId)
    setAllHabits(updated)
    setStoredHabits(updated)
    return { success: true }
  }, [allHabits])

  const toggleCheckIn = useCallback((habitId: string, date: string) => {
    const habit = allHabits.find(h => h.id === habitId)
    if (!habit || !habit.isActive) return

    const existingCheckIn = habit.checkIns.find(c => c.date === date)
    
    let updatedCheckIns: CheckIn[]
    if (existingCheckIn) {
      // Toggle existing check-in
      updatedCheckIns = habit.checkIns.map(c => 
        c.date === date ? { ...c, completed: !c.completed } : c
      )
    } else {
      // Create new check-in
      updatedCheckIns = [
        ...habit.checkIns,
        {
          id: `${habitId}-${Date.now()}`,
          habitId,
          date,
          completed: true,
        },
      ]
    }

    const updated = allHabits.map(h => 
      h.id === habitId ? { ...h, checkIns: updatedCheckIns } : h
    )
    setAllHabits(updated)
    setStoredHabits(updated)
  }, [allHabits])

  const getCurrentStreak = useCallback((habitId: string): number => {
    const habit = allHabits.find(h => h.id === habitId)
    if (!habit) return 0

    const sortedCheckIns = [...habit.checkIns]
      .filter(c => c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (sortedCheckIns.length === 0) return 0

    let streak = 0
    const today = new Date()
    let checkDate = new Date(today)

    // Check if today or yesterday has a check-in to start the streak
    const todayStr = getTodayString()
    const yesterdayStr = new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0]
    
    const hasTodayCheckIn = sortedCheckIns.some(c => c.date === todayStr)
    const hasYesterdayCheckIn = sortedCheckIns.some(c => c.date === yesterdayStr)

    if (!hasTodayCheckIn && !hasYesterdayCheckIn) return 0

    if (hasTodayCheckIn) {
      checkDate = new Date()
    } else {
      checkDate = new Date()
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0]
      const hasCheckIn = sortedCheckIns.some(c => c.date === dateStr)
      
      if (hasCheckIn) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }, [allHabits])

  const getHabitStats = useCallback((habitId: string): HabitStats => {
    const habit = allHabits.find(h => h.id === habitId)
    if (!habit) {
      return { currentStreak: 0, longestStreak: 0, completionRate: 0, totalCheckIns: 0, totalDays: 0 }
    }

    const completedCheckIns = habit.checkIns.filter(c => c.completed)
    const totalCheckIns = completedCheckIns.length
    
    // Calculate days since start
    const startDate = new Date(habit.startDate)
    const today = new Date()
    const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const completionRate = totalDays > 0 ? Math.round((totalCheckIns / totalDays) * 100) : 0

    // Calculate longest streak
    const sortedDates = completedCheckIns
      .map(c => c.date)
      .sort()

    let longestStreak = 0
    let tempStreak = 0
    let prevDate: Date | null = null

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr)
      if (prevDate) {
        const diff = Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      } else {
        tempStreak = 1
      }
      prevDate = date
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      currentStreak: getCurrentStreak(habitId),
      longestStreak,
      completionRate,
      totalCheckIns,
      totalDays,
    }
  }, [allHabits, getCurrentStreak])

  const getTodayHabits = useCallback(() => {
    return habits.filter(h => h.isActive)
  }, [habits])

  const getCompletedTodayCount = useCallback(() => {
    const today = getTodayString()
    return habits.filter(h => {
      const todayCheckIn = h.checkIns.find(c => c.date === today)
      return todayCheckIn?.completed
    }).length
  }, [habits])

  const reload = useCallback(() => {
    loadHabits()
  }, [loadHabits])

  return (
    <HabitsContext.Provider value={{
      habits,
      isLoading,
      error,
      simulateError,
      setSimulateError,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCheckIn,
      getHabitStats,
      getTodayHabits,
      getCompletedTodayCount,
      getCurrentStreak,
      reload,
    }}>
      {children}
    </HabitsContext.Provider>
  )
}

export function useHabits() {
  const context = useContext(HabitsContext)
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider')
  }
  return context
}
