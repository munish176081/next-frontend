"use client";

import { PuppiesSlider } from "@/(pages)/(home)/_components/featured-puppies/slider";
import Section from "@/_components/common/section";
import { FEATURED_BREEDS_BY_TYPE } from "@/_config/data"; // Use only FEATURED_BREEDS_BY_TYPE
import { useState } from "react";

export const PupsForSale = () => {
  // Pull out filters and breeds separately
  const { filters, breeds } = FEATURED_BREEDS_BY_TYPE[0];

  const [selectedFilter, setSelectedFilter] = useState(filters[0].id); // Default to first filter

  const filteredBreeds = breeds.filter(
    (breed) => breed.type === selectedFilter
  );

  const listings = [
    {
      title: "French Bulldog",
      location: "View Puppy",
      description:
        "A gentle and playful Golden Retriever pup, fully vaccinated and ready to join your family.",
      price: 1200,
      rating: 4.9,
      reviews: 20,
      listingType: "Litter Listing",
      image: "/images/breed-by-type/1.png",
    },
    {
      title: "Funny Toy Poodle",
      location: "Melbourne, VIC",
      description:
        "An adorable Frenchie with a friendly personality—perfect for small spaces and big hearts.",
      price: 1500,
      rating: 4.7,
      reviews: 28,
      listingType: "Semen Listing",
      image: "/images/breed-by-type/2.png",
    },
    {
      title: "Maltese",
      location: "Brisbane, QLD",
      description:
        "A sociable, energetic Lab pup, raised in a loving environment and eager for adventure.",
      price: 1000,
      rating: 4.8,
      reviews: 42,
      listingType: "Litter Listing",
      image: "/images/breed-by-type/4.png",
    },
    {
      title: "Shih Tzu",
      location: "Adelaide, SA",
      description:
        "An affectionate Cavoodle with a hypoallergenic coat, ideal for families seeking a cuddly companion.",
      price: 1800,
      rating: 4.7,
      reviews: 18,
      listingType: "Litter Listing",
      image: "/images/breed-by-type/image.png",
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
  ];

  return (
    <>
    <div className="flex relative bg-white bg-pups4SaleDesktop bg-cover max-md:bg-contain bg-no-repeat bg-center mt-20 -mx-6 max-md:mt-10">
      <section className="container flex flex-col relative px-8 py-16 relative z-10 max-md:pt-10 max-md:pb-0 max-md:px-4">
        <div className="flex flex-col gap-4 items-center m-auto relative w-full">
          <h1 className="text-40 max-md:text-3xl font-medium leading-none">New Pups4sale</h1>
          <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">Explore our <strong className="font-semibold">latest listings—fresh, adorable</strong> pups looking for their <span className="font-semibold relative inline-flex items-center justify-center">forever <img className="absolute -z-10 min-w-20 max-md:hidden" src="/images/vectors/circle.svg" /></span> homes.</span>
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
