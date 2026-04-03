'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useHabits } from '@/contexts/habits-context'
import { AppHeader } from '@/components/app-header'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')

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
      await addHabit({
        name: name.trim(),
        description: description.trim(),
        startDate,
      })
      router.push('/habits')
    } catch {
      setServerError('Tạo thói quen thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AppHeader title="Thêm Thói quen" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <Dialog open={true} onOpenChange={(open) => !open && router.push('/habits')}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo Thói quen Mới</DialogTitle>
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
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    {isLoading ? 'Đang tạo...' : 'Tạo Thói quen'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push('/habits')} disabled={isLoading}>
                    Hủy
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  )
}
