import type { CheckIn, Habit } from './types'
import type { ApiHabit, ApiHabitLog } from './api'

function startDateToInput(isoOrDay: string): string {
  if (isoOrDay.includes('T')) return isoOrDay.slice(0, 10)
  return isoOrDay.slice(0, 10)
}

export function mapApiHabitToHabit(api: ApiHabit, checkIns: CheckIn[]): Habit {
  return {
    id: api.id,
    userId: api.userId,
    name: api.title,
    description: api.description ?? '',
    startDate: startDateToInput(api.startDate),
    createdAt: api.createdAt ?? new Date().toISOString(),
    isActive: api.isActive,
    checkIns,
  }
}

export function logsToCheckIns(habitId: string, logs: ApiHabitLog[]): CheckIn[] {
  return logs.map((log) => ({
    id: log.id,
    habitId,
    date: log.date,
    completed: log.status === 'completed',
  }))
}
