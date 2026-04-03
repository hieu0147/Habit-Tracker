'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Trash2, Flame, Calendar, CheckCircle } from 'lucide-react'
import { useHabits } from '@/contexts/habits-context'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      newErrors.name = 'Habit name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Habit name must be at least 2 characters'
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required'
    } else {
      const selectedDate = new Date(startDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate > today) {
        newErrors.startDate = 'Start date cannot be in the future'
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
      setServerError('Failed to update habit. Please try again.')
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
      setServerError(result.error || 'Failed to delete habit')
      setDeleteDialogOpen(false)
    }
  }

  if (habitsLoading) {
    return (
      <>
        <AppHeader title="Edit Habit" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-8 w-32 mb-4" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    )
  }

  if (!habit) {
    return (
      <>
        <AppHeader title="Habit Not Found" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Habit Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The habit you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/habits">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Habits
              </Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Edit Habit" description={habit.name} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/habits">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Habits
            </Link>
          </Button>

          {/* Stats Card */}
          {stats && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-2xl font-bold">{currentStreak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Current Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{stats.longestStreak}</div>
                    <p className="text-xs text-muted-foreground">Longest Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-2xl font-bold">{stats.completionRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold">{stats.totalCheckIns}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Total Check-ins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Habit</CardTitle>
                  <CardDescription>
                    Update your habit details
                  </CardDescription>
                </div>
                {!isActive && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Inactive
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  {serverError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                  )}

                  <Field data-invalid={!!errors.name}>
                    <FieldLabel htmlFor="name">Habit Name *</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., Morning Exercise"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errors.name) setErrors({ ...errors, name: undefined })
                      }}
                      disabled={isLoading}
                    />
                    {errors.name && <FieldError>{errors.name}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      placeholder="Describe your habit in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isLoading}
                      rows={3}
                    />
                    <FieldDescription>
                      Optional. Add details to help you stay focused.
                    </FieldDescription>
                  </Field>

                  <Field data-invalid={!!errors.startDate}>
                    <FieldLabel htmlFor="startDate">Start Date *</FieldLabel>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        if (errors.startDate) setErrors({ ...errors, startDate: undefined })
                      }}
                      disabled={isLoading}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {errors.startDate && <FieldError>{errors.startDate}</FieldError>}
                  </Field>

                  <Field orientation="horizontal">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      disabled={isLoading}
                    />
                    <div className="flex flex-col">
                      <FieldLabel htmlFor="isActive" className="cursor-pointer">Active</FieldLabel>
                      <FieldDescription>
                        Inactive habits won&apos;t appear in daily check-ins
                      </FieldDescription>
                    </div>
                  </Field>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" asChild disabled={isLoading}>
                      <Link href="/habits">Cancel</Link>
                    </Button>
                    <div className="flex-1" />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{habit.name}&quot;? This action cannot be undone and all tracking data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
