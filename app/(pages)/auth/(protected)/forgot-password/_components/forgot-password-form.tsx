"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/_components/ui/form-fields";
import { Button } from "@/_components/ui/button";
import { useForgotPassword } from "@/_services/hooks/auth/use-forgot-password";
import { toast } from "@/_hooks/use-toast";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import {
  forgotPasswordSchema,
  ForgotPasswordType,
} from "@/_config/validate-schema";
import { useRouter } from "next/navigation";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordType>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const { mutate: forgotPassword } = useForgotPassword();

  function handleFormSubmit(data: ForgotPasswordType) {
    forgotPassword(data.email, {
      onSuccess: () => {
        reset();
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}&type=password-reset`);
        toast({
          title:
            "If an account with that email exists, you will receive a password reset email shortly.",
        });
      },
      onError: (error) => {
        const err = parseAxiosError(error);

        toast({
          title: err?.message ?? "Failed to submit forgot password request.",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit((d) => handleFormSubmit(d))}>
      <Input
        unstyled
        type="text"
        label="Your Email*"
        labelClassName="mt-4 mb-2 flex text-sm"
        inputClassName="text-sm placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-14 rounded-full border border-[#B5B5B5] max-md:h-12"
        error={errors?.email?.message}
        required
        placeholder="Enter your Email"
        {...register("email")}
      />

      <Button
        unstyled
        type="submit"
        className="w-full h-16 bg-black text-white text-lg rounded-full mt-7 max-md:h-12 max-md:text-base"
      >
        Reset Password
      </Button>
    </form>
  );
}