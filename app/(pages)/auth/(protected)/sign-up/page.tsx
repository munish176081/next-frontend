'use client';
import { Suspense } from "react";
import AuthSidePanel from "@/_components/auth/AuthSidePanel";
import SignUpForm from "./_components/signup-form";
import GoBackButton from "@/_components/common/go-back-button";

export const dynamic = 'force-dynamic';

function Signup() {
  return (
    <>
      <section className="flex p-10 h-screen container items-center justify-center max-md:p-4 max-3xl:h-auto">
        <div className="w-full bg-white rounded-max p-8 flex pl-0 h-full max-md:p-4 max-md:rounded-40 max-md:h-auto max-h-[900px]">
          <div className="w-1/2  flex flex-col items-start text-xs px-10 h-full max-md:w-full max-md:px-0">
            <GoBackButton />
            <div className="flex flex-col w-full my-auto">
              <span className="text-[33px] font-medium flex leading-normal mt-3">Sign Up</span>
              <SignUpForm />
            </div>
          </div>
          <AuthSidePanel
            title="Sign up"
            subtitle="in seconds"
            smallText={<span><strong className="font-semibold">start</strong> your journey <strong className="font-semibold">today!</strong></span>}
            highlight="Sign up"
          />
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Signup />
    </Suspense>
  );
}