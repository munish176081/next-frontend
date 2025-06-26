"use client";

import ActionIcon from "@/_components/ui/action-icon";
import { Swiper, SwiperSlide } from "@/_components/ui/slider";
import { SERVICES } from "@/_config/data";
import Link from "next/link";
import { useRef } from "react";
import SwiperCore from "swiper";

export const Services = () => {
  const swiperRef = useRef<SwiperCore>();

  const handlePrev = () => {
    if (swiperRef.current) swiperRef.current.slidePrev();
  };

  const handleNext = () => {
    if (swiperRef.current) swiperRef.current.slideNext();
  };

  return (
    <div className="bg-white mt-20 max-md:mt-8 -mx-6">
      <section className="container flex flex-col relative p-8 pt-16 max-md:px-6 max-md:pt-8">
        <div className="flex flex-col gap-4 items-center m-auto relative w-full">
          <div className="flex w-full justify-between items-end">
            <div className="flex flex-col">
              <h1 className="text-40 max-md:text-[32px] font-medium leading-none max-md:text-center">
                Explore Our Services
              </h1>
              <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">
                Find <strong className="font-semibold">everything</strong> you
                need to{" "}
                <strong className="font-semibold">care for, breed,</strong> and
                enjoy life with your{" "}
                <span className="relative font-semibold">
                  canine companion
                  <img
                    className="absolute right-0 -bottom-4 min-w-44 max-md:min-w-24"
                    src="/images/vectors/line-6.svg"
                  />
                </span>
              </span>
            </div>
            <div className="flex gap-4">
              <ActionIcon
                rounded="full"
                className="bg-black !h-24 !w-24 max-md:hidden"
                onClick={handlePrev}
              >
                <img
                  className="-scale-x-100"
                  src="/images/vectors/nextPrevArrow.svg"
                />
              </ActionIcon>
              <ActionIcon
                rounded="full"
                className="bg-black !h-24 !w-24 max-md:hidden"
                onClick={handleNext}
              >
                <img src="/images/vectors/nextPrevArrow.svg" />
              </ActionIcon>
            </div>
          </div>
          <div className="group/section relative w-full max-md:w-[calc(100%+32px)] -mt-10 max-md:mt-0 max-md:overflow-hidden max-md:-mx-4 max-md:px-4">
            <Swiper
              loop={false}
              autoplay={{ delay: 2000 }}
              spaceBetween={16}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              breakpoints={{
                768: { slidesPerView: 4, spaceBetween: 10 },
                840: { slidesPerView: 2, spaceBetween: 10 },
                1100: { slidesPerView: 3, spaceBetween: 10 },
              }}
              className="!px-8 !pt-12 !pb-12 max-md:!pb-4 !-mx-8 max-md:!pt-4"
            >
              {SERVICES.map((svc, index: number) => (
                <SwiperSlide key={index}>
                  <Link
                    href={svc.link}
                    className="group flex w-full flex-col rounded-3xl bg-white p-6 transition-all shadow-CCard hover:shadow-CCardHover max-md:hover:shadow-CCard gap-1"
                  >
                    <img
                      src={svc?.icon}
                      alt={`${svc.title} icon`}
                      className="w-12 h-12 mt-4 mb-2"
                    />
                    <h3 className="!text-2xl font-medium">{svc.title}</h3>
                    <span className="text-gray-500 min-h-10 text-sm max-w-[70%] flex">
                      {svc.description}
                    </span>
                    <div className="relative mt-4 flex h-60 w-full overflow-hidden items-center justify-center rounded-2xl transition-all max-w-full self-center">
                      <img
                        className="w-full h-full object-cover"
                        src={svc?.image}
                        alt={svc.title}
                      />
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </div>
  );
};
