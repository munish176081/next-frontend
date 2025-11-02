import { axios } from "@/_lib/axios";
import { AdminUserListType } from "@/_types/user";
import { useQuery } from "@tanstack/react-query";

interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "user" | "admin" | "super_admin";
}

async function getAdminUsers(params: AdminUsersParams = {}): Promise<AdminUserListType> {
  const { page = 1, limit = 20, search, role } = params;
  
  // Build query parameters - use main endpoint that handles both search and role
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search && search.trim()) {
    queryParams.append('search', search.trim());
  }
  
  if (role) {
    queryParams.append('role', role);
  }
  
  const { data } = await axios.get(`/admin/users?${queryParams.toString()}`);
  return data;
}

export const useAdminUsers = (params: AdminUsersParams = {}) => {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => getAdminUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}; 