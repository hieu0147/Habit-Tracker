'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Trash2, Flame, Calendar, CheckCircle } from 'lucide-react'
import { useHabits } from '@/contexts/habits-context'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Field, FieldLabel, FieldGroup, FieldError, FieldDescription } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FormErrors {
  name?: string
  startDate?: string
}

export default function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { habits, isLoading: habitsLoading, updateHabit, deleteHabit, getHabitStats, getCurrentStreak } = useHabits()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const habit = habits.find(h => h.id === resolvedParams.id)
  const stats = habit ? getHabitStats(habit.id) : null
  const currentStreak = habit ? getCurrentStreak(habit.id) : 0

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description)
      setStartDate(habit.startDate)
      setIsActive(habit.isActive)
    }
  }, [habit])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Tên thói quen là bắt buộc'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Tên thói quen phải có ít nhất 2 ký tự'
    }

    if (!startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc'
    } else {
      const selectedDate = new Date(startDate + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate > today) {
        newErrors.startDate = 'Ngày bắt đầu không thể là trong tương lai'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await updateHabit(resolvedParams.id, {
        name: name.trim(),
        description: description.trim(),
        startDate,
        isActive,
      })
      router.push('/habits')
    } catch {
      setServerError('Cập nhật thói quen thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteHabit(resolvedParams.id)
    setIsDeleting(false)

    if (result.success) {
      router.push('/habits')
    } else {
      setServerError(result.error || 'Xóa thói quen thất bại')
      setDeleteDialogOpen(false)
    }
  }

  if (habitsLoading) {
    return (
      <>
        <AppHeader title="Chỉnh sửa Thói quen" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="bg-card border rounded-lg">
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!habit) {
    return (
      <>
        <AppHeader title="Không tìm thấy Thói quen" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy Thói quen</h2>
            <p className="text-muted-foreground mb-4">
              Thói quen bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Button asChild>
              <Link href="/habits">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại Thói quen
              </Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Chỉnh sửa Thói quen"/>
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
        

          <Dialog open={true} onOpenChange={(open) => !open && router.push('/habits')}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>Chỉnh sửa Thói quen</DialogTitle>
                  </div>
                  {!isActive && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Không hoạt động
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  {serverError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-2">
                    <FieldLabel htmlFor="name">Tên Thói quen *</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="ví dụ: Tập thể dục buổi sáng"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errors.name) setErrors({ ...errors, name: undefined })
                      }}
                      disabled={isLoading}
                    />
                    {errors.name && <FieldError>{errors.name}</FieldError>}
                  </div>

                  <div className="grid gap-2">
                    <FieldLabel htmlFor="description">Mô tả</FieldLabel>
                    <Textarea
                      id="description"
                      placeholder="Mô tả chi tiết thói quen của bạn..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <FieldLabel htmlFor="startDate">Ngày Bắt đầu *</FieldLabel>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        if (errors.startDate) setErrors({ ...errors, startDate: undefined })
                      }}
                      disabled={isLoading}
                      max={new Date().toLocaleDateString('en-CA')}
                    />
                    {errors.startDate && <FieldError>{errors.startDate}</FieldError>}
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      disabled={isLoading}
                    />
                    <div className="flex flex-col">
                      <FieldLabel htmlFor="isActive" className="cursor-pointer">Hoạt động</FieldLabel>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push('/habits')} disabled={isLoading}>
                    Hủy
                  </Button>
                  <div className="flex-1" />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Thói quen</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa &quot;{habit.name}&quot;? Hành động này không thể hoàn tác và tất cả dữ liệu theo dõi sẽ bị mất.
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
              onClick={handleDelete}
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
