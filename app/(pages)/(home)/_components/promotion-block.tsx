import { Routes } from "@/_config/routes";
import Image from "next/image";
import Link from "next/link";

export const PromotionBlock = () => {
  return (
    <>
    <section className="container rounded-max max-md:rounded-40 border border-black/20 bg-white flex flex-col relative promotion-banner h-[470px] max-md:h-auto overflow-hidden">
      <div className="flex justify-between max-md:flex-col max-md:items-center max-md:gap-4">
        <div className="flex flex-col justify-center gap-8 pl-20 max-md:pl-0 max-md:gap-4 max-md:items-center">
          <h1 className="text-5xl font-medium leading-none max-md:text-2xl max-md:mt-8">Your Care, <span className="relative">Our Value<img className="absolute right-0 -bottom-2.5" src="/images/vectors/OurValuesVector.svg"></img></span></h1>
          <div className="flex gap-20 mt-6 max-md:mt-1 max-md:gap-6">
            <span className="flex text-center flex-col items-center text-[#B8B6B6] font-light text-2xl max-md:text-xs gap-4 max-md:gap-0"><strong className="text-40 max-md:text-lg text-black font-semibold">5M+</strong>Trusted by</span>
            <span className="flex text-center flex-col items-center text-[#B8B6B6] font-light text-2xl max-md:text-xs gap-4 max-md:gap-0"><strong className="text-40 max-md:text-lg text-black font-semibold">1 in 8</strong>Dogs in Australia come<br/>from Pups4Sale</span>
            <span className="flex text-center flex-col items-center text-[#B8B6B6] font-light text-2xl max-md:text-xs gap-4 max-md:gap-0"><strong className="text-40 max-md:text-lg text-black font-semibold">20+</strong>Est.</span>
          </div>
          <Link href={Routes.public.explore} className="w-44 max-md:w-60 flex rounded-full bg-black py-3 text-base font-semibold text-white transition hover:bg-gray-800 justify-center">View Listing</Link>
        </div>
        <img className="relative z-10 max-md:w-[400px] max-md:max-w-none" src="/images/banner/girl-with-dog.png" alt="Girl with dog"/>
      </div>
      <img src="/images/banner/green-banner.png" alt="" className="absolute max-md:hidden top-0 right-0"/>
      <img src="/images/banner/yellow-banner.png" alt="" className="absolute max-md:hidden bottom-0 right-0 z-20"/>
      <img src="/images/vectors/pupuforsalelightgreenbg.svg" alt="" className="hidden max-md:flex absolute bottom-16"/>
      <img src="/images/vectors/pupyforsaleyellowlinemobile.svg" alt="" className="hidden max-md:flex absolute bottom-0 z-10"/>
    </section>
    </>
  );
};
