import { ResetPasswordType } from "@/_config/validate-schema";
import { axios } from "@/_lib/axios";
import { useMutation } from "@tanstack/react-query";

async function resetPassword(
  resetPasswordData: ResetPasswordType & { token: string; userId: string }
) {
  const { data } = await axios.patch("/auth/reset-password", resetPasswordData);

  return data;
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  });
};
