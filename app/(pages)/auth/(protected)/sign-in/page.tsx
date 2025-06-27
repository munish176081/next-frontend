"use client";
import AuthSidePanel from "@/_components/auth/AuthSidePanel";
import { SigninForm } from "./_components/signin-form";
import { useSearchParams } from "next/navigation";
import { Routes } from "@/_config/routes";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

function SignIn() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  return (
    <section className="flex p-10 h-screen container items-center justify-center max-md:p-4 max-3xl:h-auto max-md:!h-screen">
      <div className="w-full bg-white rounded-max p-8 flex pl-0 h-full max-md:p-4 max-md:rounded-40 max-md:h-auto max-h-[900px] relative max-md:!h-full">
        <div className="absolute left-10 top-8 text-xs flex items-center bg-[#F3F3F3] p-0.5 rounded-full pr-2 gap-1 font-medium max-md:top-4 max-md:left-4"><span className="flex size-6 bg-black rounded-full items-center justify-center"><img src="/images/vectors/arrowLeftWhite.svg" /></span> Go Back</div>
        <div className="w-1/2 flex flex-col items-start text-xs px-10 h-full max-md:w-full max-md:px-0 my-auto max-md:pt-4">
          <div className="flex flex-col w-full my-auto">
            <span className="text-[33px] font-medium flex leading-normal mt-3">Log In</span>
            <SigninForm successRedirect={redirect || Routes.private.profile} />
          </div>
        </div>
        <AuthSidePanel
          title="Log In"
          subtitle="in now"
          smallText={<span><strong className="font-semibold">Resume</strong> your journey <strong className="font-semibold">today!</strong></span>}
          highlight="Log In"
        />
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignIn />
    </Suspense>
  );
}
