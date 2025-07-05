"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Routes } from "@/_config/routes";
import { Input } from "@/_components/ui/form-fields/input";
import { LoadingButton } from "@/_components/ui/loading-button";
import { toast } from "@/_hooks/use-toast";
import { useLogin } from "@/_services/hooks/auth/use-login";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { useRouter } from "next/navigation";
import { loginInfoSchema, SignInType } from "@/_config/validate-schema";

export function SigninEmailForm({
  successRedirect,
}: {
  successRedirect?: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    formState: { errors },
  } = useForm<SignInType>({
    resolver: zodResolver(loginInfoSchema),
  });
  const { mutate: login, isPending } = useLogin();
  const router = useRouter();

  async function handleFormSubmit(data: SignInType) {
    await login(data, {
      onSuccess: () => {
        reset();
        router.push(successRedirect ?? Routes.private.profile);
        // router.refresh();
      },
      onError: (error:any) => {
        const err = parseAxiosError(error);
        resetField("password");

        toast({
          title: "Error",
          description: err?.message ?? "Something went wrong",
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
        error={errors?.usernameOrEmail?.message}
        required
        placeholder="Enter your Email (test-deploy)"
        {...register("usernameOrEmail")}
      />

      <Input
        unstyled
        type="password"
        label="Your Password*"
        labelClassName="mt-4 mb-2 flex text-sm"
        inputClassName="text-sm placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-14 rounded-full border border-[#B5B5B5] mb-2 max-md:h-12"
        error={errors?.password?.message}
        required
        placeholder="Enter your Password"
        {...register("password")}
      />

      <Link
        href={Routes.auth.forgotPassword}
        className="underline font-semibold text-xs py-2 max-md:ml-auto mt-4"
      >
        Forget Password
      </Link>

      <LoadingButton
        loading={isPending}
        type="submit"
        className="w-full h-16 bg-black text-white text-lg rounded-full mt-7 max-md:h-12 max-md:text-base"
      >
        Proceed
      </LoadingButton>
    </form>
  );
}
