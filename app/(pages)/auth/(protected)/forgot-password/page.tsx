'use client';
import { Suspense } from "react";
import ForgotPasswordForm from "./_components/forgot-password-form";
import AuthSidePanel from "@/_components/auth/AuthSidePanel";
import { LogoIcon } from "@/_components/icons";

export const dynamic = 'force-dynamic';

function ForgotPassword() {
  return (
    <>
      <section className="flex p-10 h-screen container items-center justify-center max-md:p-4 max-3xl:h-auto max-md:!h-screen">
        <div className="w-full bg-white rounded-max p-8 flex pl-0 h-full max-md:p-4 max-md:rounded-40 max-md:h-auto max-h-[900px] relative max-md:!h-full">
          <div className="absolute left-10 top-8 text-xs flex items-center bg-[#F3F3F3] p-0.5 rounded-full pr-2 gap-1 font-medium max-md:top-4 max-md:left-4"><span className="flex size-6 bg-black rounded-full items-center justify-center"><img src="/images/vectors/arrowLeftWhite.svg" /></span> Go Back</div>
          <div className="w-1/2 h-full flex flex-col items-start text-xs px-10 h-full max-md:w-full max-md:px-0 my-auto max-md:pt-4">
            <div className="flex flex-col w-full my-auto">
              <span className="w-[70px] h-[70px] rounded-full bg-[#F3F3F3] flex items-center justify-center"><img src="/images/vectors/fingerPrint.svg" /></span>
              <span className="text-[33px] font-medium flex leading-normal mt-3">Forget password</span>
              <ForgotPasswordForm />
            </div>
            <div className="flex h-7 gap-4 w-1/2 items-center justify-center absolute bottom-8 left-0 max-md:w-full max-md:bottom-4">
              <span className="w-3.5 h-3.5 bg-[#878484] rounded-full"></span>
              <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
              <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
              <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
            </div>
          </div>
          <AuthSidePanel
            title="Start"
            subtitle="your journey today!"
            smallText={<span><strong className="font-semibold">today!</strong></span>}
            highlight="Start"
          />
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ForgotPassword />
    </Suspense>
  );
}
