'use client';
import ResetPasswordForm from "./_components/reset-password-form";
import AuthSidePanel from "@/_components/auth/AuthSidePanel";
import { LogoIcon } from "@/_components/icons";
import { Suspense } from "react";
import GoBackButton from "@/_components/common/go-back-button";

export const dynamic = 'force-dynamic';

function ResetPassword() {
  return (
    <section className="flex p-10 h-screen container items-center justify-center max-md:p-4 max-3xl:h-auto max-md:!h-screen">
      <div className="w-full bg-white rounded-max p-8 flex pl-0 h-full max-md:p-4 max-md:rounded-40  max-h-[900px] relative max-md:!h-full">
        <div className="absolute left-10 top-8 max-md:top-4 max-md:left-4">
          <GoBackButton />
        </div>
        <div className="w-1/2  flex flex-col items-start text-xs px-10 h-full max-md:w-full max-md:px-0 my-auto max-md:pt-4">
            <div className="flex flex-col w-full my-auto">
            <span className="w-[70px] h-[70px] rounded-full bg-[#F3F3F3] flex items-center justify-center"><img src="/images/vectors/newPassword.svg" /></span>
            <span className="text-[33px] font-medium flex leading-normal mt-3">Set new Password</span>
            <ResetPasswordForm />
          </div>
          <div className="flex h-7 gap-4 w-1/2 items-center justify-center absolute bottom-8 left-0 max-md:w-full max-md:bottom-4">
            <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
            <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
            <span className="w-3.5 h-3.5 bg-[#878484] rounded-full"></span>
            <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
          </div>
        </div>
        <AuthSidePanel
          title="Start"
          subtitle="your journey"
          smallText={<span><strong className="font-semibold">today!</strong></span>}
          highlight="journey"
        />
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
