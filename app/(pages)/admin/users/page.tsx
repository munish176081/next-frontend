"use client";

import { useState } from 'react';
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { AdminGuard } from "@/_components/common/admin-guard";
import { VerificationGuard } from "@/_components/common/verification-guard";
import { UserManagementCard } from "@/_components/admin/user-management/user-management-card";
import { 
  useAdminUsers, 
  useUpdateUserStatus, 
  useUpdateUserRole, 
  useDeleteUser
} from "@/_services/hooks/admin";
import { AdminUserType } from "@/_types/user";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/_components/ui/select";
import { Badge } from "@/_components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Search, Trash2, UserCheck, UserX, Crown, Shield, User, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu";

export default function UserManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    role: undefined as 'user' | 'admin' | 'super_admin' | undefined,
  });

  const { data, isLoading, error } = useAdminUsers(filters);
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'suspended' | 'not_verified') => {
    await updateStatus.mutateAsync({ userId, status: { status: newStatus } });
  };

  const handleRoleUpdate = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    // We need to get the user's email for the role update
    const user = data?.users.find(u => u.id === userId);
    if (user) {
      await updateRole.mutateAsync({ userId, role: { email: user.email, role: newRole } });
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      await deleteUser.mutateAsync(userId);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-purple-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'not_verified':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Unverified</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <VerificationGuard>
        <AdminGuard>
          <DashboardLayout title="User Management" showTimeFilter={false}>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-red-500">
                  <p>Failed to load users</p>
                  <p className="text-sm">{error.message}</p>
                </div>
              </CardContent>
            </Card>
          </DashboardLayout>
        </AdminGuard>
      </VerificationGuard>
    );
  }

  return (
    <VerificationGuard>
      <AdminGuard>
        <DashboardLayout title="User Management" showTimeFilter={false}>
          <div className="space-y-6">
            {/* User Statistics Card */}
            <UserManagementCard />

            {/* User Management Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Users</CardTitle>
                  <div className="text-sm text-gray-500">
                    {data?.total ? `${data.total} total users` : 'Loading...'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by name or email..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 h-12 rounded-full border-gray-200 focus:border-CPrimary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Role</label>
                    <Select
                      value={filters.role || "all"}
                      onValueChange={(value) => handleFilterChange('role', value === "all" ? undefined : value as 'user' | 'admin' | 'super_admin')}
                    >
                      <SelectTrigger className="h-12 rounded-full">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Items per page</label>
                    <Select
                      value={filters.limit.toString()}
                      onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                    >
                      <SelectTrigger className="h-12 rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Users Table */}
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading users...</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">User</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Role</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Joined</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {isLoading ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-gray-500">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-CPrimary"></div>
                                  <span>Loading users...</span>
                                </div>
                              </td>
                            </tr>
                          ) : error ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-red-500">
                                <div className="flex flex-col items-center gap-2">
                                  <UserX className="w-8 h-8" />
                                  <span>Error loading users: {String(error)}</span>
                                </div>
                              </td>
                            </tr>
                          ) : !data?.users || data.users.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-gray-500">
                                <div className="flex flex-col items-center gap-2">
                                  <User className="w-8 h-8 text-gray-400" />
                                  <span>No users found</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            data.users.map((user: AdminUserType) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6">
                                <div>
                                  <div className="font-medium text-gray-900">{user.name || user.username || 'N/A'}</div>
                                  <div className="text-sm text-gray-500 mt-0.5">{user.email}</div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(user.role || 'user')}
                                  <span className="capitalize text-sm text-gray-700">{user.role || 'user'}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                {getStatusBadge(user.status)}
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-sm text-gray-600">
                                  {new Date(user.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: '2-digit', 
                                    day: '2-digit' 
                                  })}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusUpdate(user.id, 'active')}
                                      disabled={updateStatus.isPending || user.status === 'active'}
                                    >
                                      <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                                      Set Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusUpdate(user.id, 'suspended')}
                                      disabled={updateStatus.isPending || user.status === 'suspended'}
                                    >
                                      <UserX className="mr-2 h-4 w-4 text-red-600" />
                                      Suspend
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusUpdate(user.id, 'not_verified')}
                                      disabled={updateStatus.isPending || user.status === 'not_verified'}
                                    >
                                      <User className="mr-2 h-4 w-4 text-yellow-600" />
                                      Set Unverified
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Role</DropdownMenuLabel>
                                    <DropdownMenuItem 
                                      onClick={() => handleRoleUpdate(user.id, 'user')}
                                      disabled={updateRole.isPending || user.role === 'user'}
                                    >
                                      <User className="mr-2 h-4 w-4" />
                                      Set as User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleRoleUpdate(user.id, 'admin')}
                                      disabled={updateRole.isPending || user.role === 'admin'}
                                    >
                                      <Shield className="mr-2 h-4 w-4 text-blue-600" />
                                      Set as Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleRoleUpdate(user.id, 'super_admin')}
                                      disabled={updateRole.isPending || user.role === 'super_admin'}
                                    >
                                      <Crown className="mr-2 h-4 w-4 text-purple-600" />
                                      Set as Super Admin
                                    </DropdownMenuItem>
                                    {/* <DropdownMenuSeparator /> */}
                                    {/* <DropdownMenuItem 
                                      onClick={() => handleDelete(user.id, user.name || user.username || 'User')}
                                      disabled={deleteUser.isPending}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete User
                                    </DropdownMenuItem> */}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {data && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          Showing <span className="font-medium text-gray-900">{((data.page || 1) - 1) * (data.limit || 20) + 1}</span> to{' '}
                          <span className="font-medium text-gray-900">{Math.min((data.page || 1) * (data.limit || 20), data.total || 0)}</span> of{' '}
                          <span className="font-medium text-gray-900">{data.total || 0}</span> users
                        </div>
                        {(data.totalPages || 0) > 1 && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange((data.page || 1) - 1)}
                              disabled={(data.page || 1) <= 1 || isLoading}
                              className="h-9 px-4 rounded-full"
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Previous
                            </Button>
                            <div className="flex items-center gap-1 px-3">
                              {Array.from({ length: Math.min(5, data.totalPages || 1) }, (_, i) => {
                                let pageNum;
                                const totalPages = data.totalPages || 1;
                                const currentPage = data.page || 1;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={(data.page || 1) === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    disabled={isLoading}
                                    className={`h-9 w-9 rounded-full ${(data.page || 1) === pageNum ? 'bg-CPrimary hover:bg-CPrimary/90 text-white' : ''}`}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange((data.page || 1) + 1)}
                              disabled={(data.page || 1) >= (data.totalPages || 1) || isLoading}
                              className="h-9 px-4 rounded-full"
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AdminGuard>
    </VerificationGuard>
  );
} 