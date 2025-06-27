"use client";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

function NotFound() {
  return (
    <>
      <section className="border border-black/20 rounded-max p-8 bg-notFound bg-cover container flex flex-col items-center relative max-md:p-4 max-md:rounded-[20px]">
        <img src="/images/vectors/404.png" alt="404" />
        <div className="relative -mt-[272px] max-md:-mt-12 bg-[FAFAFA] backdrop-blur-lg p-8 pt-0 h-[360px] max-md:h-auto border border-black/20 rounded-40 w-full flex-col flex items-center max-md:p-4 max-md:rounded-[20px]">
          <img className="absolute z-10 -top-52 max-md:w-20 max-md:-top-16 mt-0.5 mx-auto left-0 right-0" src="/images/vectors/404Dog.png" alt="404Dog" />
          <img className="absolute max-md:hidden" src="/images/vectors/haflRound.png" alt="haflRound" />
          <div className="relative flex flex-col z-10 items-center justify-center h-full gap-4">
            <span className="text-5xl font-medium max-md:text-xl text-center">Oops! Lost your paw-th? 🐾</span>
            <span className="w-full max-w-[512px] text-2xl text-[#505050] text-center max-md:text-sm">Looks like the page you're sniffing around for doesn't exist.</span>
            <div className="flex h-16 max-md:h-12 rounded-full border border-black/20 text-xl max-md:text-sm p-2 max-md:pl-1 text-white gap-3 items-center pr-6 cursor-pointer bg-black"><span className="h-12 w-12 max-md:h-10 max-md:w-10 bg-white rounded-full items-center justify-center flex"><img src="/images/vectors/backArrow.svg" /></span>Return to home</div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NotFound />
    </Suspense>
  );
}
