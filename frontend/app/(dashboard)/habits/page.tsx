'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Flame, Calendar, ListTodo } from 'lucide-react'
import { useHabits } from '@/contexts/habits-context'
import { AppHeader } from '@/components/app-header'
import { HabitListSkeleton } from '@/components/loading-skeleton'
import { ErrorState } from '@/components/error-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from '@/components/ui/empty'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

export default function HabitsPage() {
  const { habits, isLoading, error, reload, toggleCheckIn, deleteHabit, getCurrentStreak } = useHabits()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const isCompletedToday = (habitId: string): boolean => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return false
    const checkIn = habit.checkIns.find(c => c.date === today)
    return checkIn?.completed ?? false
  }

  const handleDeleteClick = (habitId: string) => {
    setHabitToDelete(habitId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!habitToDelete) return
    
    setIsDeleting(true)
    await deleteHabit(habitToDelete)
    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setHabitToDelete(null)
  }

  const habitToDeleteName = habitToDelete 
    ? habits.find(h => h.id === habitToDelete)?.name 
    : ''

  if (isLoading) {
    return (
      <>
        <AppHeader title="Thói quen" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <HabitListSkeleton />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <AppHeader title="Thói quen" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ErrorState message={error} onRetry={reload} />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Thói quen" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex flex-col gap-6">
          {/* Header Actions */}
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/habits/new">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Thói quen
              </Link>
            </Button>
          </div>

          {/* Habits List */}
          {habits.length === 0 ? (
            <Empty className="border min-h-100">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListTodo className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>Chưa có thói quen nào</EmptyTitle>
                <EmptyDescription>
                  Tạo thói quen đầu tiên của bạn để bắt đầu xây dựng thói quen tốt hơn và theo dõi tiến trình.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link href="/habits/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo Thói quen Đầu tiên
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="flex flex-col gap-4">
              {habits.map((habit) => {
                const completed = isCompletedToday(habit.id)
                const streak = getCurrentStreak(habit.id)

                return (
                  <Card key={habit.id} className={completed ? 'border-success/20' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Switch
                          checked={completed}
                          onCheckedChange={() => toggleCheckIn(habit.id, today)}
                          disabled={!habit.isActive}
                          className="mt-1"
                          aria-label={`Mark ${habit.name} as ${completed ? 'incomplete' : 'complete'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-semibold ${completed ? 'line-through text-muted-foreground' : ''}`}>
                              {habit.name}
                            </h3>
                            {streak > 0 && (
                              <Badge variant="secondary" className="gap-1">
                                <Flame className="h-3 w-3 text-orange-500" />
                                {streak} ngày liên tiếp
                              </Badge>
                            )}
                            {!habit.isActive && (
                              <Badge variant="outline" className="text-muted-foreground">
                                Không hoạt động
                              </Badge>
                            )}
                          </div>
                          {habit.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {habit.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Bắt đầu {new Date(habit.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/habits/${habit.id}`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Chỉnh sửa {habit.name}</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClick(habit.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa {habit.name}</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Thói quen</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa &quot;{habitToDeleteName}&quot;? Hành động này không thể hoàn tác và tất cả dữ liệu theo dõi sẽ bị mất.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
