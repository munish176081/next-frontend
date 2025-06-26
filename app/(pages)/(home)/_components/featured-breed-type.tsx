"use client";

import Section from "@/_components/common/section";
import { PawsIconIndigo } from "@/_components/icons/paws-icon-indigo";
import { PuppyButton } from "@/_components/ui/puppy-button";
import {
  Autoplay,
  Navigation,
  Swiper,
  SwiperSlide,
} from "@/_components/ui/slider";
import { FEATURED_BREEDS_BY_TYPE } from "@/_config/data";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const FeaturedBreedsByType = () => {
  const { filters, breeds } = FEATURED_BREEDS_BY_TYPE[0];
  const [selectedFilter, setSelectedFilter] = useState(filters[0].id);

  const filteredBreeds = breeds.filter(
    (breed) => breed.type === selectedFilter
  );

  return (
    <>
    <section className="container rounded-max border border-black/20 bg-white flex flex-col relative p-8 shadow-section mt-16 max-md:mt-8 max-md:px-4 max-md:pt-6 max-md:pb-0 max-md:rounded-40">
      <div className="flex flex-col gap-4 items-center m-auto relative w-full">
        <PawsIconIndigo className="w-16 h-16 max-md:max-w-5 max-md:max-h-5"/>
        <h1 className="text-40 max-md:text-[32px] font-medium leading-none text-center">Browse by Breed Type</h1>
        <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">Meet our <strong className="font-semibold">adorable stars</strong>—each one nurtured in a <strong className="font-semibold">loving</strong> environment and ready for their forever home. Explore our <strong className="font-semibold">featured listings</strong> to find the <span className="relative font-semibold">perfect match <img className="absolute left-0 -bottom-2.5" src="/images/vectors/BroswByBreTypeLine.svg"/></span> for your family.</span>
        <PuppyButton iconSrc="/images/paws/paws-white-vertical.svg" altText="Paws icon" className="tracking-wide max-md:w-full max-md:order-2 max-md:-mt-4 max-md:mb-4">Browse Listing</PuppyButton> 
        <div className="flex relative h-48 w-full items-center -mt-8 max-md:mt-0 max-md:h-auto">
          <div className="flex relative z-10 bg-white p-2 rounded-full w-full shadow-section max-2xl:overflow-x-auto">
            {filters.map((filter, index) => (
              <button key={filter.id} onClick={() => setSelectedFilter(filter.id)} className={`rounded-full font-semibold whitespace-nowrap px-8 max-md:px-6 leading-tight flex items-center text-base justify-center gap-2 h-12 max-md:h-10 max-md:text-xs max-md:w-auto ${selectedFilter === filter.id ? "bg-CPrimary" : ""}`}>{index === filters.length - 1 && filter.label === "Companion/Designer Breeds" ? (<>Companion/<br className="max-md:hidden" />Designer Breeds</>): filter.label} <img className="w-4 h-4" src="/images/paws/image.png" /></button>
            ))}
          </div>
          <img className="absolute top-0 left-0 -ml-8 min-w-[calc(100%+64px)] max-md:hidden" src="/images/comman/watermark.png" alt="yellow-bg" />
          <img src="/images/vectors/browsebybreadmob.svg" className="absolute -bottom-16 left-0 -mx-4 max-w-[calc(100%+32px)] max-md:flex hidden" alt="yellow-bg" />
        </div>
        <div className="group/section relative w-full max-md:w-[calc(100%+32px)] -mt-16 max-md:mt-0 max-md:overflow-hidden max-md:-mx-4 max-md:px-4">
          <Swiper loop={false} autoplay={{ delay: 2000 }} spaceBetween={16} navigation={{nextEl: ".swipperNextBtn", prevEl: ".swipperPrevBtn",}} breakpoints={{768: { slidesPerView: 1, spaceBetween: 10 }, 840: { slidesPerView: 2, spaceBetween: 10 }, 1100: { slidesPerView: 4, spaceBetween: 10 },}} className="!px-8 !pt-12 !pb-12 max-md:!pb-4 max-md:!pt-0 !-mx-8">
            {filteredBreeds.map(({ slug, thumbnail, name, description, location }, index) => (
                <SwiperSlide key={`breed-${index}`} className="">
                  <Link href={slug} className="group flex w-full flex-col rounded-3xl bg-white p-4 transition-all shadow-CCard hover:shadow-CCardHover max-md:hover:shadow-CCard">
                    <div className="relative flex h-48 group-hover:h-60 max-md:group-hover:h-48 w-full overflow-hidden items-center justify-center rounded-2xl transition-all max-w-full self-center"><img className="w-full h-full object-cover" src={thumbnail} alt={name} /></div>
                    <h3 className="!text-2xl font-medium mt-3">{name}</h3>
                    <span className="text-gray-500 min-h-10 mt-1 text-sm">{description}</span>
                    <PuppyButton className="w-full text-sm md:text-base mt-3" iconSrc="/images/paws/paws-white-vertical.svg" altText="Paws icon">{location}</PuppyButton>
                  </Link>
                </SwiperSlide>
              )
            )}
          </Swiper>
        </div>
      </div>
    </section>
    </>
  );
};
