'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useHabits } from '@/contexts/habits-context'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldGroup, FieldError, FieldDescription } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FormErrors {
  name?: string
  startDate?: string
}

export default function NewHabitPage() {
  const router = useRouter()
  const { addHabit } = useHabits()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')

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
      await addHabit({
        name: name.trim(),
        description: description.trim(),
        startDate,
      })
      router.push('/habits')
    } catch {
      setServerError('Failed to create habit. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AppHeader title="Add Habit" description="Create a new habit to track" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/habits">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Habits
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Create New Habit</CardTitle>
              <CardDescription>
                Define a habit you want to build. Be specific and realistic.
              </CardDescription>
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
                    <FieldDescription>
                      When did you start or want to start this habit?
                    </FieldDescription>
                  </Field>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                      {isLoading ? 'Creating...' : 'Create Habit'}
                    </Button>
                    <Button type="button" variant="outline" asChild disabled={isLoading}>
                      <Link href="/habits">Cancel</Link>
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
