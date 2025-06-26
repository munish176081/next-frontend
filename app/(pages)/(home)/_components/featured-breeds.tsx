"use client";

import { PawsIconIndigo } from "@/_components/icons/paws-icon-indigo";
import ActionIcon from "@/_components/ui/action-icon";
import { PuppyButton } from "@/_components/ui/puppy-button";
import { FEATURED_BREEDS } from "@/_config/data";
import Link from "next/link";
import { useRef } from "react";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

export const FeaturedBreeds = () => {
  const swiperRef = useRef<SwiperCore | null>(null);

  return (
    <>
      <section className="container rounded-max border border-black/20 bg-white flex flex-col relative p-8 mt-16 max-md:mt-4 max-md:px-4 max-md:pt-6 max-md:pb-0 max-md:rounded-40">
        <div className="flex flex-col gap-4 items-center m-auto relative w-full">
          <PawsIconIndigo className="w-16 h-16 max-md:max-w-5 max-md:max-h-5" />
          <h1 className="text-40 max-md:text-[32px] font-medium leading-none">
            Browse by Breed
          </h1>
          <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">
            Find your <strong className="font-semibold">perfect puppy</strong>{" "}
            by exploring different{" "}
            <strong className="font-semibold">breeds</strong>.{" "}
            <span className="relative">
              Click on a breed{" "}
              <img
                className="absolute left-0 -bottom-2.5"
                src="/images/vectors/line_yellowWordb.svg"
              />
            </span>{" "}
            to view available <strong className="font-semibold">puppies</strong>{" "}
            and bring home your{" "}
            <strong className="font-semibold">new best friend!</strong>
          </span>
          <ActionIcon
            rounded="full"
            className="bg-black !h-24 !w-24 absolute z-10 bottom-0 max-md:hidden left-0"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <img
              className="-scale-x-100"
              src="/images/vectors/nextPrevArrow.svg"
              alt="Prev"
            />
          </ActionIcon>
          <ActionIcon
            rounded="full"
            className="bg-black !h-24 !w-24 absolute z-10 bottom-0 max-md:hidden right-0"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <img src="/images/vectors/nextPrevArrow.svg" alt="Next" />
          </ActionIcon>
        </div>
        <div className="group/section relative w-full max-md:w-auto max-md:overflow-hidden max-md:-mx-4 max-md:px-4">
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            loop={false}
            autoplay={{ delay: 2000 }}
            spaceBetween={16}
            breakpoints={{
              768: { slidesPerView: 1, spaceBetween: 10 },
              840: { slidesPerView: 2, spaceBetween: 10 },
              1100: { slidesPerView: 4, spaceBetween: 10 },
            }}
            className="!px-8 !pt-12 !pb-12 max-md:!pb-4 !-mx-8"
          >
            {FEATURED_BREEDS.map(
              (
                { slug, thumbnail, name, description, location },
                index: number
              ) => (
                <SwiperSlide key={`breed-${index}`} className="">
                  <Link
                    href={slug}
                    className="group flex w-full flex-col rounded-3xl bg-white p-4 transition-all shadow-CCard hover:shadow-CCardHover max-md:hover:shadow-CCard"
                  >
                    <div className="relative flex h-48 group-hover:h-60 max-md:group-hover:h-48 w-full overflow-hidden items-center justify-center rounded-2xl transition-all max-w-full self-center">
                      <img
                        className="w-full h-full object-cover"
                        src={thumbnail}
                        alt={name}
                      />
                    </div>
                    <h3 className="!text-2xl font-medium mt-3">{name}</h3>
                    <span className="text-gray-500 min-h-10 mt-1 text-sm">
                      {description}
                    </span>
                    <PuppyButton
                      className="w-full text-sm md:text-base mt-3"
                      iconSrc="/images/paws/paws-white-vertical.svg"
                      altText="Paws icon"
                    >
                      {location}
                    </PuppyButton>
                  </Link>
                </SwiperSlide>
              )
            )}
          </Swiper>
        </div>
        <img
          src="/images/vectors/VectorArrowup.svg"
          className="hidden max-md:flex max-w-24 absolute -bottom-6 z-10 right-0"
          alt="Arrow Up"
        />
      </section>
    </>
  );
};
