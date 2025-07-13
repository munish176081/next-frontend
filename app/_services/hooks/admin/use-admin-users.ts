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
  const { page = 1, limit = 10, search, role } = params;
  
  let url = `/admin/users?page=${page}&limit=${limit}`;
  
  if (search) {
    url = `/admin/users/search?q=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
  } else if (role) {
    url = `/admin/users/role/${role}?page=${page}&limit=${limit}`;
  }
  
  const { data } = await axios.get(url);
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