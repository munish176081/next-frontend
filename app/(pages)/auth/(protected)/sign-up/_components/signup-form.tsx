"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Checkbox } from "@/_components/ui/form-fields";
import { Button } from "@/_components/ui/button";
import { Routes } from "@/_config/routes";
import { toast } from "@/_hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignup } from "@/_services/hooks/auth/use-signup";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { signUpSchema, SignUpType } from "@/_config/validate-schema";
import SocialLogin from "@/_components/auth/social-login";

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpType>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
  });
  const searchParams = useSearchParams();
  const successRedirect = searchParams.get("successRedirect");
  const router = useRouter();
  const { mutate: signup } = useSignup();

  async function handleFormSubmit(data: SignUpType) {
    const { acceptPolicy, ...signupBody } = data;

    if (!acceptPolicy) {
      toast({
        title: "Error",
        description: "You must accept the terms of service and privacy policy.",
        variant: "destructive",
      });
      return;
    }

    await signup(signupBody, {
      onSuccess: () => {
        reset();
        toast({
          title: "Welcome to pups4sale!",
          description: "You have successfully signed up.",
        });

        router.push(successRedirect ?? Routes.private.profile);
      },
      onError: (error) => {
        const err = parseAxiosError(error);

        toast({
          title: "Error",
          description: err?.message ?? "Something went wrong",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <div>
      <form noValidate onSubmit={handleSubmit((d) => handleFormSubmit(d))}>
        <Input
          unstyled
          type="text"
          label="Your Name*"
          labelClassName="mt-4 mb-2 flex text-sm"
          inputClassName="text-sm placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-14 rounded-full border border-[#B5B5B5] max-md:h-12"
          error={errors?.username?.message}
          required
          placeholder="Enter your Name"
          {...register("username")}
        />

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

        <Input
          unstyled
          type="password"
          label="Your Password*"
          labelClassName="mt-4 mb-2 flex text-sm"
          inputClassName="text-sm placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-14 rounded-full border border-[#B5B5B5] max-md:h-12"
          error={errors?.password?.message}
          required
          placeholder="Create your Password"
          {...register("password")}
        />

        <Input
          unstyled
          type="password"
          label="Confirm Password*"
          labelClassName="mt-4 mb-2 flex text-sm"
          inputClassName="text-sm placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-14 rounded-full border border-[#B5B5B5] max-md:h-12"
          error={errors?.confirmPassword?.message}
          required
          placeholder="Re-enter your Password"
          {...register("confirmPassword")}
        />

        <Checkbox
          label={
            <>
              <span className="font-normal">I've read and agree with </span>
              <Link href={Routes.public.terms} className="underline">
                Terms of Service and our Privacy Policy.
              </Link>
            </>
          }
          size="DEFAULT"
          checked
          className="mb-7 hidden"
          labelClassName="ml-3"
          containerClassName="!items-start"
          inputClassName="!text-gray-dark"
          error={errors?.acceptPolicy?.message}
          {...register("acceptPolicy")}
        />
        <Button
          unstyled
          type="submit"
          className="w-full h-16 bg-black text-white text-lg rounded-full mt-7 max-md:h-12 max-md:text-base"
        >
          Create Account
        </Button>
      </form>
      <div className="relative mb-8 mt-7 text-center before:absolute before:left-0 before:top-1/2 before:h-[1px] before:w-full before:bg-gray-200">
        <span className="relative z-10 m-auto inline-flex bg-white px-5">
          Or
        </span>
      </div>

      <SocialLogin type="signup" />

      <p className="text-[#999999] text-lg font-medium flex items-center w-full justify-center text-center mt-4 me-2">
        Already Have an Account? &nbsp;
        <Link
          href={`${Routes.auth.signIn}${successRedirect ? `?successRedirect=${successRedirect}` : ""
            }`}
          className="text-black underline decoration-[3px] underline-offset-[3px] decoration-CSecondary"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
