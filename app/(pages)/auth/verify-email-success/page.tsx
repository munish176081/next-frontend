"use client";
import { LogoIcon } from "@/_components/icons";
import Link from "next/link";
import { Routes } from "@/_config/routes";
import { Suspense } from "react";
import { LoadingButton } from "@/_components/ui/loading-button";
import GoBackButton from "@/_components/common/go-back-button";

export const dynamic = 'force-dynamic';

function VerifyEmailSuccess() {
  return (
    <section className="flex p-10 h-screen container items-center justify-center max-md:p-4 max-3xl:h-auto max-md:!h-screen">
      <div className="w-full bg-white rounded-max p-8 flex pl-0 h-full max-md:p-4 max-md:rounded-40 max-md:h-auto max-h-[900px] relative max-md:!h-full">
        <div className="absolute left-10 top-8 max-md:top-4 max-md:left-4">
          <GoBackButton />
        </div>
        <div className="w-1/2 h-full flex flex-col items-start text-xs px-10 h-full max-md:w-full max-md:px-0 my-auto max-md:pt-4">
          <div className="flex flex-col w-full my-auto">
            <span className="w-[70px] h-[70px] rounded-full bg-[#F3F3F3] flex items-center justify-center"><img src="/images/vectors/successCheck.png" /></span>
            <span className="text-[33px] font-medium flex leading-normal mt-3">You're All Set!</span>
            <span className="text-[#9C9C9C] text-sm mt-2">Your password has been reset successfully.<br /><text className="text-black font-medium">Welcome back</text>—your account is now <text className="text-black font-medium">more secure than ever.</text></span>
            <Link href={Routes.auth.signIn}>
              <LoadingButton className="w-full h-16 bg-black text-white text-lg rounded-full mt-7 max-md:h-12 max-md:text-base">
                Log In Securely
              </LoadingButton>
            </Link>
          </div>
          <div className="flex h-7 gap-4 w-1/2 items-center justify-center absolute bottom-8 left-0 max-md:w-full max-md:bottom-4">
            <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
            <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
            <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
            <span className="w-3.5 h-3.5 bg-[#878484] rounded-full"></span>
          </div>
        </div>
        <div className="w-1/2 min-h-full bg-[#F5F5F5] rounded-40 flex flex-col items-center py-8 min-h-[810px] max-md:hidden">
          <span className="w-44 flex"><LogoIcon width="100%" height="100%" /></span>
          <span className="text-[45px] mt-8 relative">
            <img alt="Paws decoration" className="absolute -left-14 -top-7 w-[68px] h-[63px]" src="/images/home/paws-indigo.svg"></img>
            <img alt="Paws decoration" className="absolute -right-10 -top-8 w-[51px] h-[48px]" src="/images/home/paws-green.svg"></img>
            Welcome to <strong className="font-semibold">Pups4Sale</strong>
          </span>
          <span className="text-lg mt-1">Join the <strong className="font-semibold">largest community</strong> of responsible <strong className="font-semibold">pet lovers.</strong></span>
          <img className="mt-6" src="/images/vectors/signUp.png" />
          <div className="flex flex-col w-full items-start px-8 gap-4">
            <span className="text-[17px] font-medium px-6 py-1 border border-[#00000033] bg-[#F0EBF4] rounded-full">Find your perfect furry companion</span>
            <span className="text-[17px] font-medium px-6 py-1 border border-[#00000033] bg-[#E7F5F7] rounded-full ml-auto">Connect with trusted breeders & adopters</span>
            <span className="text-[17px] font-medium px-6 py-1 border border-[#00000033] bg-[#FCF4DC] rounded-full">List puppies safely and easily</span>
          </div>
          <span className="text-5xl font-normal text-center mt-auto"><strong className="font-semibold">Start</strong>&nbsp;your&nbsp;<strong className="relative font-semibold">journey<img className="absolute right-0 -bottom-1 w-full" src="/images/vectors/line-8.svg" /></strong>&nbsp;today!</span>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailSuccess />
    </Suspense>
  );
}
