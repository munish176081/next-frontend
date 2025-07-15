import { axios } from "@/_lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function verifyEmailOTP({ email, otp, userLoggedIn }: { email: string; otp: string, userLoggedIn: boolean }) {
  const { data } = await axios.post("/auth/verify-email-otp", { email, otp, userLoggedIn });
  return data;
}

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyEmailOTP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
};
