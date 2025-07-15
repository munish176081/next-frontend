export interface UserType {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  username: string;
  createdAt: string;
  status: "active" | "suspended" | "not_verified";
  // New admin fields (optional for backward compatibility)
  role?: "user" | "admin" | "super_admin";
  isSuperAdmin?: boolean;
  permissions?: Record<string, any>;
}

// Admin-specific types
export interface AdminUserType extends UserType {
  role: "user" | "admin" | "super_admin";
  isSuperAdmin: boolean;
  permissions?: Record<string, any>;
  updatedAt?: string;
  externalAccounts?: any[];
}

export interface AdminStatsType {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  unverifiedUsers: number;
  superAdmins: number;
  admins: number;
  regularUsers: number;
}

export interface AdminUserListType {
  users: AdminUserType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminPasswordUpdateType {
  email: string;
  password: string;
}

export interface AdminRoleUpdateType {
  email: string;
  role: "user" | "admin" | "super_admin";
}

export interface AdminStatusUpdateType {
  status: "active" | "suspended" | "not_verified";
}
