import { FindPupiesForm } from "@/(pages)/(home)/_components/find-pupies-form";
import React from "react";
import { PuppyButton } from "./puppy-button";
import ReviewBadge from "./ReviewBadge";

const Hero: React.FC = () => {
  return (
    <>
    <section className="container rounded-max max-md:rounded-40 border border-black/20 bg-white flex flex-col items-center pt-8 mt-16 max-md:mt-4 max-md:px-4 max-md:py-6">
      <div className="flex flex-col items-end">
        <h1 className="text-64 font-medium leading-none max-md:text-[32px] text-center">Discover Your New <span className="relative">Best Friend<img alt="Decoration" className="absolute right-0 max-w-[105%] w-[105%]" src="images/comman/title-decoration.svg"></img></span></h1>
      </div>
      <span className="text-xl max-md:text-base text-center font-[300] mt-6">Quality puppies from <strong className="font-semibold">trusted</strong> breeders - where every <br className="max-md:hidden" /> puppy finds a <strong className="font-semibold">loving home.</strong></span>
      <PuppyButton iconSrc="/images/paws/paws-white-vertical.svg" altText="Paws icon" className="tracking-wide mt-6 max-md:w-full">Browse Puppies</PuppyButton> 
      <div className="flex relative w-full justify-center pt-4 mt-5 items-center max-md:flex-col">
        <img alt="Paws decoration" className="absolute left-24 -top-32 max-md:top-[20px] max-md:-left-[10px] max-md:max-w-[40px]" src="/images/home/paws-indigo.svg"></img>
        <img alt="Paws decoration" className="absolute right-24 -top-24 max-md:top-[80px] max-md:-right-[10px] max-md:max-w-[40px]" src="/images/home/paws-green.svg"></img>
        <img alt="Dog decoration" className="absolute top-6 ml-52 max-2xl:max-w-[49px] max-2xl:ml-58 max-2xl:top-4" src="/images/home/decoration-dog.svg"></img>
        <div className="relative w-full flex justify-center">
          <img alt="Main puppy" className="relative z-10 max-md:max-w-64" src="/images/home/banner-dog.svg"></img>
          <img alt="Background" className="absolute bottom-0 w-[550px] aspect-square object-bottom object-contain" src="/images/home/hiro_circular-background.svg"></img>
        </div>
        <FindPupiesForm />
        <div className="flex flex-col absolute left-8 mt-12 max-md:mt-4 max-md:static max-md:items-center">
          <span className="text-base mb-1">Our <i className="font-plafair italic">Happy</i> Pet Owners</span>
          <ReviewBadge />
          <div className="flex -space-x-4 mt-2">
            {Array.from({ length: 4 }, (_, i) => (<img key={i} src={`/images/avatars/avatar-${i + 1}.png`} alt={`User ${i + 1}`} className="w-20 h-20 max-md:w-16 max-md:h-16 border-4 border-white rounded-full" />))}
            <span className="w-20 h-20 max-md:w-16 max-md:h-16 border-4 border-white rounded-full bg-CAqua flex flex-col items-center justify-center text-lg max-md:text-sm font-semibold leading-tight max-md:leading-normal">+2k <small className="text-[10px] font-normal">Reviews</small></span>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Hero;
