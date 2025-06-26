"use client";

import Section from "@/_components/common/section";
import { PuppyButton } from "@/_components/ui/puppy-button";
import Image from "next/image";

const breeders = [
  {
    name: "Happy Tails Kennel",
    image: "/images/trusted-breeder/1.png",
    location: "Melbourne, VIC",
    experience: "15+ years of Experience",
    breeds: "Labradors & Golden Retrievers",
  },
  {
    name: "Sunshine Breeders",
    image: "/images/trusted-breeder/2.png",
    location: "Melbourne, VIC",
    experience: "15+ years of Experience",
    breeds: "Labradors & Golden Retrievers",
  },
  {
    name: "Golden Paws",
    image: "/images/trusted-breeder/3.png",
    location: "Melbourne, VIC",
    experience: "15+ years of Experience",
    breeds: "Labradors & Golden Retrievers",
  },
  {
    name: "Puppy Paradise",
    image: "/images/trusted-breeder/4.png",
    location: "Melbourne, VIC",
    experience: "15+ years of Experience",
    breeds: "Labradors & Golden Retrievers",
  },
];

export const TrustedBreeder = () => {
  return (
    <>
    <section className="container flex flex-col pt-8 max-md:pt-4">
      <span className="text-3xl font-medium leading-none max-md:text-2xl max-md:text-center">Trusted Breeders</span>
      <div className="flex flex-wrap gap-8 mt-8 max-md:flex-col max-md:gap-4 max-md:mt-4">
        {breeders.map((breeder) => (
          <div key={breeder.name} className="flex bg-white rounded-2xl overflow-hidden p-6 gap-8 w-[calc(50%-16px)] max-md:w-full max-md:p-4 max-md:gap-4">
            <div className="w-64 h-64 min-w-64 min-h-64 max-md:w-32 max-md:h-32 max-md:min-w-32 max-md:min-h-32"><img src={breeder.image} alt={breeder.name} className="w-full h-full object-cover" /></div>
            <div className="flex flex-col w-full">
              <span className="text-4xl font-semibold max-md:text-lg">{breeder.name}</span>
              <span className="text-[22px] text-[#7D7D7D] font-normal my-auto max-md:text-xs">{breeder.location}<br />{breeder.experience}<br />{breeder.breeds}</span>
              <PuppyButton className="w-full max-md:h-8 max-md:text-xs" iconSrc="/images/paws/paws-white-vertical.svg" altText="Paws icon">View Listing</PuppyButton>
            </div>
          </div>
        ))}
      </div>
    </section>
    </>
  );
};
