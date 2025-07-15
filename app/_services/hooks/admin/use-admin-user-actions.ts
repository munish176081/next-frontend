import { axios } from "@/_lib/axios";
import { AdminUserType, AdminStatusUpdateType, AdminRoleUpdateType } from "@/_types/user";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

// Update user status
async function updateUserStatus(userId: string, status: AdminStatusUpdateType) {
  const { data } = await axios.patch(`/admin/users/${userId}/status`, status);
  return data;
}

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AdminStatusUpdateType }) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
};

// Update user role
async function updateUserRole(userId: string, role: AdminRoleUpdateType) {
  const { data } = await axios.patch(`/admin/users/${userId}/role`, role);
  return data;
}

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AdminRoleUpdateType }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
};

// Delete user
async function deleteUser(userId: string) {
  const { data } = await axios.delete(`/admin/users/${userId}`);
  return data;
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
};

// Get specific user
async function getUser(userId: string): Promise<AdminUserType> {
  const { data } = await axios.get(`/admin/users/${userId}`);
  return data;
}

export const useAdminUser = (userId: string) => {
  return useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });
}; 