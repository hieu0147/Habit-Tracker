'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ListTodo, CheckCircle2, Flame, Plus, ChevronRight } from 'lucide-react'
import { useHabits } from '@/contexts/habits-context'
import { AppHeader } from '@/components/app-header'
import { DashboardSkeleton } from '@/components/loading-skeleton'
import { ErrorState } from '@/components/error-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from '@/components/ui/empty'

export default function DashboardPage() {
  const { 
    habits, 
    isLoading, 
    error, 
    reload, 
    toggleCheckIn, 
    getCurrentStreak,
    getCompletedTodayCount 
  } = useHabits()

  const today = new Date().toISOString().split('T')[0]
  const completedToday = getCompletedTodayCount()
  const activeHabits = useMemo(() => habits.filter(h => h.isActive), [habits])

  const totalStreak = useMemo(() => {
    if (activeHabits.length === 0) return 0
    const streaks = activeHabits.map(h => getCurrentStreak(h.id))
    return Math.max(...streaks, 0)
  }, [activeHabits, getCurrentStreak])

  const isCompletedToday = (habitId: string): boolean => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return false
    const checkIn = habit.checkIns.find(c => c.date === today)
    return checkIn?.completed ?? false
  }

  if (isLoading) {
    return (
      <>
        <AppHeader title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <DashboardSkeleton />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <AppHeader title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ErrorState message={error} onRetry={reload} />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng số Thói quen
                </CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeHabits.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Thói quen đang hoạt động
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Hoàn thành Hôm nay
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completedToday}/{activeHabits.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeHabits.length > 0 
                    ? `${Math.round((completedToday / activeHabits.length) * 100)}% tỷ lệ hoàn thành`
                    : 'Chưa có thói quen'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Chuỗi Tốt nhất
                </CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStreak}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalStreak === 1 ? 'ngày' : 'ngày'} liên tiếp
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Habits */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{"Thói quen Hôm nay"}</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/habits/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm Thói quen
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {activeHabits.length === 0 ? (
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ListTodo className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>Chưa có thói quen</EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button asChild>
                      <Link href="/habits/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo Thói Quen Đầu Tiên
                      </Link>
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeHabits.map((habit) => {
                    const completed = isCompletedToday(habit.id)
                    const streak = getCurrentStreak(habit.id)
                    
                    return (
                      <div
                        key={habit.id}
                        className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                          completed ? 'bg-success/5 border-success/20' : 'bg-card'
                        }`}
                      >
                        <Switch
                          checked={completed}
                          onCheckedChange={() => toggleCheckIn(habit.id, today)}
                          aria-label={`Đánh dấu ${habit.name} là ${completed ? 'chưa hoàn thành' : 'đã hoàn thành'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium truncate ${completed ? 'line-through text-muted-foreground' : ''}`}>
                              {habit.name}
                            </h3>
                            {streak > 0 && (
                              <Badge variant="secondary" className="shrink-0 gap-1">
                                <Flame className="h-3 w-3 text-orange-500" />
                                {streak}
                              </Badge>
                            )}
                          </div>
                          {habit.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {habit.description}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" asChild className="shrink-0">
                          <Link href={`/habits/${habit.id}`}>
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Xem chi tiết thói quen</span>
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
