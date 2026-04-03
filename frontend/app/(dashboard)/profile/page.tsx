'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Key, User, Mail, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { AppHeader } from '@/components/app-header'
import { ProfileSkeleton } from '@/components/loading-skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Field, FieldLabel, FieldGroup, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!currentPassword) {
      errors.currentPassword = 'Mật khẩu hiện tại là bắt buộc'
    }

    if (!newPassword) {
      errors.newPassword = 'Mật khẩu mới là bắt buộc'
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới của bạn'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu không khớp'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(false)

    if (!validatePasswordForm()) return

    setIsUpdating(true)
    // Simulate password change
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsUpdating(false)
    setPasswordSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    
    // Close dialog after success
    setTimeout(() => {
      setChangePasswordOpen(false)
      setPasswordSuccess(false)
    }, 1500)
  }

  if (isLoading || !user) {
    return (
      <>
        <AppHeader title="Hồ sơ" description="Quản lý tài khoản của bạn" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ProfileSkeleton />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Hồ sơ" description="Quản lý tài khoản của bạn" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex flex-col gap-6 max-w-full">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin Hồ sơ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Avatar and Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="relative">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl"></div>
                    
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-xl">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-28 w-28 ring-4 ring-primary/20 shadow-2xl mb-6 border-4 border-white">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground text-3xl font-bold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-3">
                          {user.name}
                        </h3>
                        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle & Right Columns - Details */}
                <div className="lg:col-span-2 space-y-8">
                  {/* User Details Card */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 shadow-lg">
                    <h4 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Thông tin chi tiết
                    </h4>
                    
                    <div className="space-y-6">
                      <div className="group flex items-center justify-between p-4 rounded-xl bg-white/70 border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">Họ và Tên</p>
                            <p className="text-sm text-slate-500">Tên đầy đủ của bạn</p>
                          </div>
                        </div>
                        <span className="font-bold text-lg text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{user.name}</span>
                      </div>

                      <div className="group flex items-center justify-between p-4 rounded-xl bg-white/70 border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 group-hover:from-green-100 group-hover:to-green-200 transition-all">
                            <Mail className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-green-700 transition-colors">Email</p>
                            <p className="text-sm text-slate-500">Địa chỉ email của bạn</p>
                          </div>
                        </div>
                        <span className="font-bold text-lg text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Card */}
                  <div className="flex justify-end">
                    <div className="space-y-4">
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="shrink-0 bg-red-600 hover:bg-red-700 hover:shadow-red-500/25 transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Đăng xuất
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi Mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu hiện tại và chọn mật khẩu mới
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword}>
            <FieldGroup>
              {passwordSuccess && (
                <Alert className="border-success/20 bg-success/5 text-success">
                  <AlertDescription>Đổi mật khẩu thành công!</AlertDescription>
                </Alert>
              )}

              <Field data-invalid={!!passwordErrors.currentPassword}>
                <FieldLabel htmlFor="currentPassword">Mật khẩu Hiện tại</FieldLabel>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    if (passwordErrors.currentPassword) {
                      setPasswordErrors({ ...passwordErrors, currentPassword: '' })
                    }
                  }}
                  disabled={isUpdating}
                />
                {passwordErrors.currentPassword && (
                  <FieldError>{passwordErrors.currentPassword}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!passwordErrors.newPassword}>
                <FieldLabel htmlFor="newPassword">Mật khẩu Mới</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Ít nhất 8 ký tự"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    if (passwordErrors.newPassword) {
                      setPasswordErrors({ ...passwordErrors, newPassword: '' })
                    }
                  }}
                  disabled={isUpdating}
                />
                {passwordErrors.newPassword && (
                  <FieldError>{passwordErrors.newPassword}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!passwordErrors.confirmPassword}>
                <FieldLabel htmlFor="confirmNewPassword">Xác nhận Mật khẩu Mới</FieldLabel>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors({ ...passwordErrors, confirmPassword: '' })
                    }
                  }}
                  disabled={isUpdating}
                />
                {passwordErrors.confirmPassword && (
                  <FieldError>{passwordErrors.confirmPassword}</FieldError>
                )}
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setChangePasswordOpen(false)}
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? <Spinner className="mr-2 h-4 w-4" /> : null}
                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật Mật khẩu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
