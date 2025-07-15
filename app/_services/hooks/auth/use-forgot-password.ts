import { axios } from "@/_lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function forgotPassword(email: string) {
  const { data } = await axios.post("/auth/forgot-password", { email });

  return data;
}

export const useForgotPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
};
