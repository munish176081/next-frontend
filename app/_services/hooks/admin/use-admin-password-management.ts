import { axios } from "@/_lib/axios";
import { AdminPasswordUpdateType } from "@/_types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Set password for user
async function setUserPassword(passwordData: AdminPasswordUpdateType) {
  const { data } = await axios.post("/admin/set-password", passwordData);
  return data;
}

export const useSetUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setUserPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

// Create super admin with password
async function createSuperAdmin(adminData: AdminPasswordUpdateType) {
  const { data } = await axios.post("/admin/create-super-admin", adminData);
  return data;
}

export const useCreateSuperAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSuperAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
};

// Reset super admin password
async function resetSuperAdminPassword(passwordData: AdminPasswordUpdateType) {
  const { data } = await axios.post("/admin/reset-super-admin-password", {
    email: passwordData.email,
    newPassword: passwordData.password,
  });
  return data;
}

export const useResetSuperAdminPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetSuperAdminPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

// Seed super admin users
async function seedSuperAdmin() {
  const { data } = await axios.post("/admin/seed-super-admin");
  return data;
}

export const useSeedSuperAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seedSuperAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
}; 