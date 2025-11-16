import { axios } from "@/_lib/axios";
import { useMutation } from "@tanstack/react-query";

async function requestVerifyEmailCodeByEmail(email: string) {
  const { data } = await axios.post("/auth/request-verify-email-code-by-email", { email });

  return data;
}

export const useRequestEmailVerifyByEmail = () => {
  return useMutation({
    mutationFn: requestVerifyEmailCodeByEmail,
  });
};

