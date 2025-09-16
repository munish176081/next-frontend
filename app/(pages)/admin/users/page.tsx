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
import { Select } from "@/_components/ui/select";
import { Badge } from "@/_components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Search, Edit, Trash2, UserCheck, UserX, Crown, Shield, User } from "lucide-react";

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

  const handleFilterChange = (key: string, value: string | number) => {
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
                    <label className="block text-sm font-medium mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by name or email..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <Select
                      value={filters.role}
                      onValueChange={(value) => handleFilterChange('role', value)}
                    >
                      <option value="">All Roles</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Items per page</label>
                    <Select
                      value={filters.limit.toString()}
                      onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
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
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">User</th>
                            <th className="text-left py-3 px-4 font-medium">Role</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Joined</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-500">
                                Loading users...
                              </td>
                            </tr>
                          ) : error ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-red-500">
                                Error loading users: {error.message}
                              </td>
                            </tr>
                          ) : !data?.users || data.users.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-500">
                                No users found
                              </td>
                            </tr>
                          ) : (
                            data.users.map((user: AdminUserType) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(user.role || 'user')}
                                  <span className="capitalize">{user.role || 'user'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {getStatusBadge(user.status)}
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {/* Status Actions */}
                                  <Select
                                    value={user.status}
                                    onValueChange={(value) => handleStatusUpdate(user.id, value as any)}
                                    disabled={updateStatus.isPending}
                                  >
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="not_verified">Unverified</option>
                                  </Select>

                                  {/* Role Actions */}
                                  <Select
                                    value={user.role || 'user'}
                                    onValueChange={(value) => handleRoleUpdate(user.id, value as any)}
                                    disabled={updateRole.isPending}
                                  >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                  </Select>

                                  {/* Delete Action */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(user.id, user.name)}
                                    disabled={deleteUser.isPending}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {((data.page - 1) * data.limit) + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} users
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(data.page - 1)}
                            disabled={data.page <= 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm">
                            Page {data.page} of {data.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(data.page + 1)}
                            disabled={data.page >= data.totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}

                    {data?.users.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No users found matching your criteria.</p>
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