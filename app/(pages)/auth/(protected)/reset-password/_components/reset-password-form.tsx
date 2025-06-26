"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/_components/ui/form-fields";
import { Button } from "@/_components/ui/button";
import { toast } from "@/_hooks/use-toast";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import {
  resetPasswordSchema,
  ResetPasswordType,
} from "@/_config/validate-schema";
import { useResetPassword } from "@/_services/hooks/auth/use-reset-password";
import { useRouter, useSearchParams } from "next/navigation";
import { Routes } from "@/_config/routes";

export default function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
  });
  const { mutate: resetPassword } = useResetPassword();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  function handleFormSubmit(data: ResetPasswordType) {
    if (!token || !userId) {
      toast({
        title: "Invalid token",
        variant: "destructive",
      });

      return;
    }

    resetPassword(
      { ...data, token, userId },
      {
        onSuccess: () => {
          toast({
            title: "Password reset successfully.",
            description: "You can now login with your new password.",
          });

          router.push(Routes.public.emailVerificationSucess);
        },
        onError: (error) => {
          const err = parseAxiosError(error);

          toast({
            title: err?.message ?? "Failed to reset password.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit((d) => handleFormSubmit(d))}>
      <Input
        unstyled
        type="password"
        label="Your New Password*"
        labelClassName="mt-4 mb-2 flex text-sm"
        inputClassName="text-sm placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-14 rounded-full border border-[#B5B5B5] max-md:h-12"
        error={errors?.password?.message}
        required
        placeholder="Enter your new password"
        {...register("password")}
      />

      <Input
        unstyled
        type="password"
        label="Confirm New Password*"
        labelClassName="mt-4 mb-2 flex text-sm"
        inputClassName="text-sm placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-14 rounded-full border border-[#B5B5B5] max-md:h-12"
        error={errors?.confirmPassword?.message}
        required
        placeholder="Re-enter your password"
        {...register("confirmPassword")}
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
