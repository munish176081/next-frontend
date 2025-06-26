import { SignUpType } from "@/_config/validate-schema";
import { axios } from "@/_lib/axios";
import { useMutation } from "@tanstack/react-query";

async function signup(signUpData: Omit<SignUpType, "acceptPolicy">) {
  const { data } = await axios.post("/auth/sign-up", signUpData);

  return data;
}

export const useSignup = () => {
  return useMutation({
    mutationFn: signup,
  });
};
