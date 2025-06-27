"use client";

import Section from "@/_components/common/section";
import { PuppiesSlider } from "./slider";

export const PupsForSale = () => {
  const listings = [
    {
      id: "1",
      title: "Mini Dachshund",
      location: "Melbourne, VIC",
      description:
        "A quirky, affectionate little Dachshund — ideal for small living spaces and big hearts.",
      price: 1200,
      rating: 4.9,
      reviews: 20,
      badge: "Litter Listing",
      image: "/images/banner/mini-dachshund.png",
    },
    {
      id: "2",
      title: "Border Collie",
      location: "Sydney, NSW",
      description:
        "Energetic and intelligent, ready to thrive with an active family who loves the outdoors.",
      price: 1100,
      rating: 4.7,
      reviews: 28,
      badge: "Semen Listing",
      image: "/images/banner/border-collie.png",
    },
    {
      id: "3",
      title: "Shih Tzu",
      location: "Brisbane, QLD",
      description:
        "A gentle, laid-back companion, perfect for those seeking a cuddly lap dog.",
      price: 900,
      rating: 4.8,
      reviews: 42,
      badge: "Litter Listing",
      image: "/images/banner/shih-tzu.png",
    },
    {
      id: "4",
      title: "Beagle",
      location: "Adelaide, SA",
      description:
        "Curious and playful, known for her charming personality and boundless energy.",
      price: 950,
      rating: 4.7,
      reviews: 18,
      badge: "Litter Listing",
      image: "/images/banner/beagle.png",
    },
  ];

  return (
    <Section
      title="New Pups4sale h"
      descriptionClassName="text-center font-normal text-[24px] leading-[34px] tracking-[-0.03em] text-[#171717] flex items-center justify-center"
      headerClassName="text-center font-medium text-[40px] leading-[21px] tracking-[-0.03em]"
      description="Explore our latest <strong>listings—fresh, adorable</strong> pups looking for their <strong>forever</strong> homes."
      className="mt-24  px-0 py-10 pb-8 backgroundBanner"
    >
      <div className="mt-10">
        <PuppiesSlider listings={listings} />
      </div>
    </Section>
  );
};
