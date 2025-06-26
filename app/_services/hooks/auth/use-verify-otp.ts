import { axios } from "@/_lib/axios";
import { useMutation } from "@tanstack/react-query";

async function verifyEmailOTP({ email, otp, userLoggedIn }: { email: string; otp: string, userLoggedIn: boolean }) {
  const { data } = await axios.post("/auth/verify-email-otp", { email, otp, userLoggedIn });
  return data;
}

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyEmailOTP,
  });
};
