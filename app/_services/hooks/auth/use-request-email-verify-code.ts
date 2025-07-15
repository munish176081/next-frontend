import { axios } from "@/_lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function requestVerifyEmailCode() {
  const { data } = await axios.post("/auth/request-verify-email-code");

  return data;
}

export const useRequestEmailVerifyCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestVerifyEmailCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
};
