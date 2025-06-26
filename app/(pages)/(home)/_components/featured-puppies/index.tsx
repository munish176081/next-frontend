"use client";

import Section from "@/_components/common/section";
import { PuppiesSlider } from "./slider";

export const FeaturedPuppies = () => {
  const listings = [
    {
      title: "Golden Retriever",
      location: "Sydney, NSW",
      description:
        "A gentle and playful Golden Retriever pup, fully vaccinated and ready to join your family.",
      price: 1200,
      rating: 4.9,
      reviews: 20,
      listingType: "Litter Listing",
      image: "/images/comman/feature-puppy-1.png",
    },
    {
      title: "French Bulldog",
      location: "Melbourne, VIC",
      description:
        "An adorable Frenchie with a friendly personality—perfect for small spaces and big hearts.",
      price: 1500,
      rating: 4.7,
      reviews: 28,
      listingType: "Semen Listing",
      image: "/images/comman/feature-puppy-1.png",
    },
    {
      title: "Labrador Retriever",
      location: "Brisbane, QLD",
      description:
        "A sociable, energetic Lab pup, raised in a loving environment and eager for adventure.",
      price: 1000,
      rating: 4.8,
      reviews: 42,
      listingType: "Litter Listing",
      image: "/images/comman/feature-puppy-1.png",
    },
    {
      title: "Cavoodle",
      location: "Adelaide, SA",
      description:
        "An affectionate Cavoodle with a hypoallergenic coat, ideal for families seeking a cuddly companion.",
      price: 1800,
      rating: 4.7,
      reviews: 18,
      listingType: "Litter Listing",
      image: "/images/comman/feature-puppy-1.png",
    },
    {
      title: "Beagle",
      location: "Perth, WA",
      description:
        "A curious Beagle pup with a keen sense of smell, perfect for active families and outdoor adventures.",
      price: 1100,
      rating: 4.6,
      reviews: 30,
      listingType: "Semen Listing",
      image: "/images/comman/feature-puppy-1.png",
    },
    {
      title: "Pug",
      location: "Hobart, TAS",
      description:
        "A charming Pug with a playful spirit, ready to bring joy and laughter to your home.",
      price: 1300,
      rating: 4.5,
      reviews: 15,
      listingType: "Litter Listing",
      image: "/images/comman/feature-puppy-1.png",
    },
  ];
  return (
    <>
    <div className="flex relative -mx-6">
      <span className="flex w-96 h-96 absolute flex items-center overflow-hidden max-md:hidden"><img src="/images/vectors/horizontal_branding.svg" className="min-w-[804px] min-h-[1102px] -ml-[120px]" /></span>
      <section className="container flex flex-col relative px-8 py-24 relative z-10 max-md:py-8 max-md:px-6 max-md:pb-0">
        <div className="flex flex-col gap-4 items-center m-auto relative w-full">
          <h1 className="text-40 max-md:text-[32px] font-medium leading-none max-md:text-center">Discover Our Featured Puppies</h1>
          <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">Discover <strong className="font-semibold">Healthy, loving</strong> puppies ready to bring <strong className="font-semibold">joy</strong> and <span className="font-semibold relative">companionship <img className="absolute left-0 top-1 -z-10" src="/images/vectors/line-7.svg" /></span> into your home.</span>
          <div className="group/section relative w-full mt-4 max-md:mt-0 max-md:!-mx-4 max-md:w-[calc(100%+32px)]">
            {/* @ts-expect-error - PuppiesSlider component expects a different type than what we're providing */}
            <PuppiesSlider listings={listings} />
          </div>
        </div>
      </section>
    </div>
    </>
  );
};
