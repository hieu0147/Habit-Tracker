'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { Habit, CheckIn, HabitStats } from '@/lib/types'
import { apiFetch, ApiError, type ApiHabit, type ApiHabitLog, type ApiDashboardResponse, type ApiHabitStreak, type ApiDashboardHabitRow } from '@/lib/api'
import { mapApiHabitToHabit, logsToCheckIns } from '@/lib/habit-mapper'
import { useAuth } from './auth-context'

interface HabitsContextType {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  addHabit: (
    habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'checkIns' | 'isActive'>,
  ) => Promise<void>
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>
  deleteHabit: (habitId: string) => Promise<{ success: boolean; error?: string }>
  toggleCheckIn: (habitId: string, date: string) => Promise<void>
  getHabitStats: (habitId: string) => HabitStats
  getTodayHabits: () => Habit[]
  getCompletedTodayCount: () => number
  getCurrentStreak: (habitId: string) => number
  reload: () => void
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined)

const getTodayString = () => new Date().toISOString().split('T')[0]

function prevUtcDay(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

function getCurrentStreakForHabit(checkIns: CheckIn[], today: string): number {
  const completed = new Set(
    checkIns.filter((c) => c.completed).map((c) => c.date),
  )
  let count = 0
  let d = today
  while (completed.has(d)) {
    count++
    d = prevUtcDay(d)
  }
  return count
}

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [allHabits, setAllHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statsByHabitId, setStatsByHabitId] = useState<Record<string, HabitStats>>({})

  const loadHabits = useCallback(async () => {
    if (!user) {
      setAllHabits([])
      setIsLoading(false)
      setError(null)
      setStatsByHabitId({})
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const { habits: apiHabits } = await apiFetch<{ habits: ApiHabit[] }>(
        '/api/habits',
        { auth: true },
      )
      const withLogs = await Promise.all(
        apiHabits.map(async (h) => {
          const { logs } = await apiFetch<{ logs: ApiHabitLog[] }>(
            `/api/habits/${h.id}/logs`,
            { auth: true },
          )
          const checkIns = logsToCheckIns(h.id, logs)
          return mapApiHabitToHabit(h, checkIns)
        }),
      )
      setAllHabits(withLogs)

      // Fetch streak metrics from backend to keep UI consistent.
      // - /api/dashboard covers active habits
      // - /api/habits/:id/streak covers inactive + fallback
      const today = getTodayString()
      let dashboard: ApiDashboardResponse | null = null
      try {
        dashboard = await apiFetch<ApiDashboardResponse>('/api/dashboard', {
          auth: true,
        })
      } catch {
        dashboard = null
      }

      const dashboardRowByHabitId = new Map<string, ApiDashboardHabitRow>()
      if (dashboard) {
        for (const row of dashboard.habits) {
          dashboardRowByHabitId.set(row.habit.id, row)
        }
      }

      const toHabitStats = (
        src: Pick<
          ApiHabitStreak | ApiDashboardHabitRow,
          'currentStreak' | 'longestStreak' | 'totalCompletedDays' | 'monthlyCompletionRate'
        >,
        habitStartDate: string,
      ): HabitStats => {
        const startDate = new Date(`${habitStartDate}T00:00:00.000Z`)
        const todayDt = new Date(`${today}T00:00:00.000Z`)
        const totalDays =
          Math.floor(
            (todayDt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          ) + 1

        const completionRate = Math.max(
          0,
          Math.min(100, Math.round(src.monthlyCompletionRate * 100)),
        )

        return {
          currentStreak: src.currentStreak,
          longestStreak: src.longestStreak,
          completionRate,
          totalCheckIns: src.totalCompletedDays,
          totalDays: Math.max(1, totalDays),
        }
      }

      const habitRows = await Promise.all(
        withLogs.map(async (h) => {
          const row = dashboardRowByHabitId.get(h.id)
          if (row) {
            return [
              h.id,
              toHabitStats(row, h.startDate),
            ] as const
          }

          const streak = await apiFetch<ApiHabitStreak>(
            `/api/habits/${h.id}/streak`,
            { auth: true },
          )
          return [h.id, toHabitStats(streak, h.startDate)] as const
        }),
      )

      setStatsByHabitId(Object.fromEntries(habitRows))
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Failed to load habits. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadHabits()
  }, [loadHabits])

  const habits = useMemo(() => {
    if (!user) return []
    return allHabits.filter((h) => h.userId === user.id)
  }, [allHabits, user])

  const addHabit = useCallback(
    async (
      habitData: Omit<
        Habit,
        'id' | 'userId' | 'createdAt' | 'checkIns' | 'isActive'
      >,
    ) => {
      if (!user) return
      await apiFetch<{ habit: ApiHabit }>('/api/habits', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          title: habitData.name,
          description: habitData.description,
          startDate: new Date(
            `${habitData.startDate}T12:00:00.000Z`,
          ).toISOString(),
        }),
      })
      await loadHabits()
    },
    [user, loadHabits],
  )

  const updateHabit = useCallback(
    async (habitId: string, updates: Partial<Habit>) => {
      const body: Record<string, unknown> = {}
      if (updates.name !== undefined) body.title = updates.name
      if (updates.description !== undefined) body.description = updates.description
      if (updates.startDate !== undefined) {
        body.startDate = new Date(
          `${updates.startDate}T12:00:00.000Z`,
        ).toISOString()
      }
      if (updates.isActive !== undefined) body.isActive = updates.isActive

      await apiFetch<{ habit: ApiHabit }>(`/api/habits/${habitId}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(body),
      })
      await loadHabits()
    },
    [loadHabits],
  )

  const deleteHabit = useCallback(
    async (habitId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        await apiFetch(`/api/habits/${habitId}`, {
          method: 'DELETE',
          auth: true,
        })
        await loadHabits()
        return { success: true }
      } catch (e) {
        return {
          success: false,
          error: e instanceof ApiError ? e.message : 'Failed to delete habit',
        }
      }
    },
    [loadHabits],
  )

  const toggleCheckIn = useCallback(
    async (habitId: string, date: string) => {
      const habit = allHabits.find((h) => h.id === habitId)
      if (!habit || !habit.isActive) return

      const existing = habit.checkIns.find(
        (c) => c.date === date && c.completed,
      )

      if (existing) {
        await apiFetch(
          `/api/habits/${habitId}/check-in?date=${encodeURIComponent(date)}`,
          { method: 'DELETE', auth: true },
        )
      } else {
        await apiFetch(`/api/habits/${habitId}/check-in`, {
          method: 'POST',
          auth: true,
          body: JSON.stringify({ date }),
        })
      }
      await loadHabits()
    },
    [allHabits, loadHabits],
  )

  const getCurrentStreak = useCallback(
    (habitId: string): number => {
      const cached = statsByHabitId[habitId]
      if (cached) return cached.currentStreak
      const habit = allHabits.find((h) => h.id === habitId)
      if (!habit) return 0
      return getCurrentStreakForHabit(habit.checkIns, getTodayString())
    },
    [allHabits, statsByHabitId],
  )

  const getHabitStats = useCallback(
    (habitId: string): HabitStats => {
      const cached = statsByHabitId[habitId]
      if (cached) return cached
      const habit = allHabits.find((h) => h.id === habitId)
      if (!habit) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          completionRate: 0,
          totalCheckIns: 0,
          totalDays: 0,
        }
      }

      const completedCheckIns = habit.checkIns.filter((c) => c.completed)
      const totalCheckIns = completedCheckIns.length

      const startDate = new Date(`${habit.startDate}T00:00:00.000Z`)
      const today = new Date(`${getTodayString()}T00:00:00.000Z`)
      const totalDays =
        Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1

      const completionRate =
        totalDays > 0
          ? Math.min(100, Math.round((totalCheckIns / totalDays) * 100))
          : 0

      const sortedDates = [
        ...new Set(completedCheckIns.map((c) => c.date)),
      ].sort()

      let longestStreak = 0
      let run = 0
      let prev: string | null = null

      for (const dateStr of sortedDates) {
        if (prev === null) {
          run = 1
        } else {
          const prevD = new Date(`${prev}T00:00:00.000Z`)
          const curD = new Date(`${dateStr}T00:00:00.000Z`)
          const diff = Math.round(
            (curD.getTime() - prevD.getTime()) / (1000 * 60 * 60 * 24),
          )
          if (diff === 1) run++
          else run = 1
        }
        longestStreak = Math.max(longestStreak, run)
        prev = dateStr
      }

      return {
        currentStreak: getCurrentStreakForHabit(habit.checkIns, getTodayString()),
        longestStreak,
        completionRate,
        totalCheckIns,
        totalDays: Math.max(1, totalDays),
      }
    },
    [allHabits, statsByHabitId],
  )

  const getTodayHabits = useCallback(() => {
    return habits.filter((h) => h.isActive)
  }, [habits])

  const getCompletedTodayCount = useCallback(() => {
    const today = getTodayString()
    return habits.filter((h) => {
      const todayCheckIn = h.checkIns.find((c) => c.date === today)
      return todayCheckIn?.completed
    }).length
  }, [habits])

  const reload = useCallback(() => {
    void loadHabits()
  }, [loadHabits])

  return (
    <HabitsContext.Provider
      value={{
        habits,
        isLoading,
        error,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleCheckIn,
        getHabitStats,
        getTodayHabits,
        getCompletedTodayCount,
        getCurrentStreak,
        reload,
      }}
    >
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
