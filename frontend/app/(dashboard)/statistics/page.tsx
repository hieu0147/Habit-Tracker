'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Flame, Target, Calendar, TrendingUp, BarChart3, Plus } from 'lucide-react'
import { useHabits } from '@/contexts/habits-context'
import { AppHeader } from '@/components/app-header'
import { StatisticsSkeleton } from '@/components/loading-skeleton'
import { ErrorState } from '@/components/error-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from '@/components/ui/empty'

export default function StatisticsPage() {
  const { habits, isLoading, error, reload, getHabitStats, getCurrentStreak } = useHabits()

  const stats = useMemo(() => {
    if (habits.length === 0) return null

    const allStats = habits.map(h => ({
      habit: h,
      stats: getHabitStats(h.id),
      currentStreak: getCurrentStreak(h.id),
    }))

    const totalCheckIns = allStats.reduce((sum, s) => sum + s.stats.totalCheckIns, 0)
    const avgCompletionRate = Math.round(
      allStats.reduce((sum, s) => sum + s.stats.completionRate, 0) / habits.length
    )
    const bestStreak = Math.max(...allStats.map(s => s.stats.longestStreak), 0)
    const currentBestStreak = Math.max(...allStats.map(s => s.currentStreak), 0)

    // Get best performing habit
    const bestHabit = allStats.reduce((best, current) => 
      current.stats.completionRate > (best?.stats.completionRate || 0) ? current : best
    , allStats[0])

    // Get habits sorted by completion rate
    const habitsByPerformance = [...allStats].sort(
      (a, b) => b.stats.completionRate - a.stats.completionRate
    )

    return {
      totalHabits: habits.length,
      totalCheckIns,
      avgCompletionRate,
      bestStreak,
      currentBestStreak,
      bestHabit,
      habitsByPerformance,
    }
  }, [habits, getHabitStats, getCurrentStreak])

  if (isLoading) {
    return (
      <>
        <AppHeader title="Thống kê"/>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <StatisticsSkeleton />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <AppHeader title="Thống kê" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ErrorState message={error} onRetry={reload} />
        </main>
      </>
    )
  }

  if (!stats || habits.length === 0) {
    return (
      <>
        <AppHeader title="Thống kê" />    
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Empty className="border min-h-[400px]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart3 className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Chưa có thống kê</EmptyTitle>
              <EmptyDescription>
                Bắt đầu theo dõi thói quen để xem thống kê và tiến trình theo thời gian.
              </EmptyDescription>
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
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Thống kê" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex flex-col gap-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng số Thói quen</p>
                    <p className="text-2xl font-bold">{stats.totalHabits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <Calendar className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng số Check-in</p>
                    <p className="text-2xl font-bold">{stats.totalCheckIns}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chuỗi Tốt nhất Hiện tại</p>
                    <p className="text-2xl font-bold">{stats.currentBestStreak} ngày</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                    <TrendingUp className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tỷ lệ Hoàn thành Average</p>
                    <p className="text-2xl font-bold">{stats.avgCompletionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Habit Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất Thói quen</CardTitle>
              <CardDescription>
                Xem hiệu suất của từng thói quen theo thời gian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {stats.habitsByPerformance.map(({ habit, stats: habitStats, currentStreak }) => (
                  <div key={habit.id} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link 
                          href={`/habits/${habit.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {habit.name}
                        </Link>
                        {currentStreak > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            {currentStreak}
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {habitStats.completionRate}%
                      </span>
                    </div>
                    <Progress value={habitStats.completionRate} className="h-2" />
                    <div className="flex gap-6 text-xs text-muted-foreground">
                      <span>{habitStats.totalCheckIns} lần check-in</span>
                      <span>Chuỗi tốt nhất: {habitStats.longestStreak} ngày</span>
                      <span>Đang theo dõi {habitStats.totalDays} ngày</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Best Performer */}
          {stats.bestHabit && stats.bestHabit.stats.completionRate > 0 && (
            <Card className="border-success/20 bg-success/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-success">Thói quen Hiệu suất Cao nhất</p>
                    <p className="text-lg font-semibold">{stats.bestHabit.habit.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Tỷ lệ hoàn thành {stats.bestHabit.stats.completionRate}% với {stats.bestHabit.stats.totalCheckIns} lần check-in tổng cộng
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/habits/${stats.bestHabit.habit.id}`}>
                      Xem Chi tiết
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
