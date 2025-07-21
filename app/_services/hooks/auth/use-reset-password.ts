import { axios } from "@/_lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function resetPassword({
  userId,
  token,
  password,
  confirmPassword,
}: {
  userId: string;
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const { data } = await axios.post("/auth/reset-password", {
    userId,
    token,
    password,
    confirmPassword,
  });

  return data;
}

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
};
