import { SignInType } from "@/_config/validate-schema";
import { axios } from "@/_lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function login(loginData: SignInType) {
  const { data } = await axios.post("/auth/login", loginData);

  return data;
}

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
};
