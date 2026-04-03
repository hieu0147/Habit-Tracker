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
      errors.currentPassword = 'Current password is required'
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required'
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
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
        <AppHeader title="Profile" description="Manage your account" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ProfileSkeleton />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Profile" description="Manage your account" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex flex-col gap-6 max-w-2xl">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Separator className="mb-6" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Name</span>
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email</span>
                  </div>
                  <span className="font-medium">{user.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Role</span>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">
                      Update your password to keep your account secure
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
                    <Key className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">Log Out</p>
                    <p className="text-sm text-muted-foreground">
                      Sign out of your account on this device
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
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
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword}>
            <FieldGroup>
              {passwordSuccess && (
                <Alert className="border-success/20 bg-success/5 text-success">
                  <AlertDescription>Password changed successfully!</AlertDescription>
                </Alert>
              )}

              <Field data-invalid={!!passwordErrors.currentPassword}>
                <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
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
                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="At least 8 characters"
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
                <FieldLabel htmlFor="confirmNewPassword">Confirm New Password</FieldLabel>
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
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? <Spinner className="mr-2 h-4 w-4" /> : null}
                {isUpdating ? 'Updating...' : 'Update Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
