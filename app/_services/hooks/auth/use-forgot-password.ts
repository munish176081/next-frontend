import { axios } from "@/_lib/axios";
import { useMutation } from "@tanstack/react-query";

async function forgotPassword(email: string) {
  const { data } = await axios.post("/auth/forgot-password", { email });

  return data;
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};
