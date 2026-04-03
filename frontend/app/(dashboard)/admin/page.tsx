'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, UserX, UserCheck, AlertTriangle, Users } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { apiFetch, ApiError, type ApiUser } from '@/lib/api'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'block' | 'unblock'>('block')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<ApiUser[]>([])

  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (authLoading || !user || user.role !== 'admin') return

    let cancelled = false
    async function load() {
      setIsUsersLoading(true)
      setError('')
      try {
        const res = await apiFetch<{ users: ApiUser[] }>('/api/admin/users', {
          auth: true,
        })
        if (!cancelled) setUsers(res.users)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof ApiError ? e.message : 'Không thể tải người dùng')
      } finally {
        if (!cancelled) setIsUsersLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [authLoading, user])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleActionClick = (userId: string, action: 'block' | 'unblock') => {
    // Prevent blocking self
    if (userId === user?.id) {
      setError('Bạn không thể chặn chính mình')
      return
    }

    setSelectedUser(userId)
    setActionType(action)
    setError('')
    setConfirmDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedUser) return

    setIsUpdating(true)
    setError('')
    try {
      const nextStatus = actionType === 'block' ? 'blocked' : 'active'
      await apiFetch(`/api/admin/users/${selectedUser}/status`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({ status: nextStatus }),
      })

      const res = await apiFetch<{ users: ApiUser[] }>('/api/admin/users', {
        auth: true,
      })
      setUsers(res.users)

      setConfirmDialogOpen(false)
      setSelectedUser(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không thể cập nhật người dùng')
    } finally {
      setIsUpdating(false)
    }
  }

  const selectedUserData = selectedUser ? users.find(u => u.id === selectedUser) : null

  if (authLoading || isUsersLoading) {
    return (
      <>
        <AppHeader title="Admin" /> 
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <>
        <AppHeader title="Truy cập bị từ chối" />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Card className="border-destructive/20">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Truy cập bị từ chối</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bạn không có quyền truy cập trang này.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Đi đến Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  const activeUsers = users.filter(u => u.status === 'active').length
  const blockedUsers = users.filter(u => u.status === 'blocked').length

  return (
    <>
      <AppHeader title="Admin" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex flex-col gap-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng số Người dùng</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <UserCheck className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Người dùng Hoạt động</p>
                    <p className="text-2xl font-bold">{activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <UserX className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Người dùng bị Chặn</p>
                    <p className="text-2xl font-bold">{blockedUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tất cả Người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {u.name}
                            {u.id === user.id && (
                              <span className="text-muted-foreground ml-1">(Bạn)</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                          {u.role === 'admin' ? 'Admin' : 'Người dùng'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={u.status === 'active' ? 'outline' : 'destructive'}
                          className={u.status === 'active' ? 'border-success/50 text-success' : ''}
                        >
                          {u.status === 'active' ? 'Hoạt động' : 'Bị chặn'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {u.id !== user.id && (
                          <>
                            {u.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleActionClick(u.id, 'block')}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Chặn
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleActionClick(u.id, 'unblock')}
                                className="text-success hover:text-success hover:bg-success/10"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Bỏ chặn
                              </Button>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'block' ? 'Chặn Người dùng' : 'Bỏ chặn Người dùng'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'block' 
                ? `Bạn có chắc chắn muốn chặn ${selectedUserData?.name}? Họ sẽ không thể truy cập tài khoản của mình nữa.`
                : `Bạn có chắc chắn muốn bỏ chặn ${selectedUserData?.name}? Họ sẽ có thể truy cập tài khoản của mình lại.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button 
              variant={actionType === 'block' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
              disabled={isUpdating}
            >
              {isUpdating ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {isUpdating 
                ? (actionType === 'block' ? 'Đang chặn...' : 'Đang bỏ chặn...')
                : (actionType === 'block' ? 'Chặn Người dùng' : 'Bỏ chặn Người dùng')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
