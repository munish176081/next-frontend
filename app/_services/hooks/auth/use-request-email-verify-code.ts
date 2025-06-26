import { axios } from "@/_lib/axios";
import { useMutation } from "@tanstack/react-query";

async function requestVerifyEmailCode() {
  const { data } = await axios.post("/auth/request-verify-email-code");

  return data;
}

export const useRequestEmailVerifyCode = () => {
  return useMutation({
    mutationFn: requestVerifyEmailCode,
  });
};
