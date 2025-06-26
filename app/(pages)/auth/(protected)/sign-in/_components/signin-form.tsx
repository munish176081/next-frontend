import SocialLogin from "@/_components/auth/social-login";
import { SigninEmailForm } from "./signin-email-form";
import { cn } from "@/_lib/utils";
import Link from "next/link";
import { Routes } from "@/_config/routes";

export function SigninForm({
  className,
  successRedirect,
}: {
  className?: string;
  successRedirect?: string;
}) {
  return (
    <div
      className={cn(
        className
      )}
    >
      <SigninEmailForm successRedirect={successRedirect} />

      <div className="relative mb-8 mt-7 text-center before:absolute before:left-0 before:top-1/2 before:h-[1px] before:w-full before:bg-gray-200">
        <span className="relative z-10 m-auto inline-flex bg-white px-5">
          Or
        </span>
      </div>

      <SocialLogin type="signin" />

      <p className="text-[#999999] text-lg font-medium flex items-center w-full justify-center text-center mt-4 me-2">
        Don't Have an Account? &nbsp; 
        <Link
          href={`${Routes.auth.signUp}${successRedirect ? `?successRedirect=${successRedirect}` : ""
            }`}
          className="text-black underline decoration-[3px] underline-offset-[3px] decoration-CSecondary"
        >
         Sign Up
        </Link>
      </p>
    </div>
  );
}
