"use client";

import Section from "@/_components/common/section";
import ActionIcon from "@/_components/ui/action-icon";
import {
  Autoplay,
  Navigation,
  Swiper,
  SwiperSlide,
} from "@/_components/ui/slider";
import { TESTIMONIALS } from "@/_config/data";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";

interface TestimonialItem {
  image: string;
  name: string;
  location: string;
  breed: string;
  text: string;
}

interface TestimonialProps {
  testimonials?: TestimonialItem[];
}

const TestimonialCard = ({
  testimonial,
  isActive,
}: {
  testimonial: TestimonialItem;
  isActive: boolean;
}) => (
  <>
    <div className="flex bg-white rounded-3xl shadow-section p-8 relative flex-col gap-8 max-md:p-4 max-md:gap-4">
      <img className="absolute min-w-[86px] min-h-[59px] max-md:min-w-[60px] max-md:min-h-[40px] max-md:left-2 top-0 left-4 z-10" src="/images/vectors/Frame.svg" />
      <div className="relative w-full h-64 max-md:h-44 overflow-hidden rounded-3xl">
        <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
      </div>
      <span className="font-medium max-md:text-xs">{testimonial.text}</span>
      <span className="text-sm text-[#67646A] flex flex-col font-normal max-md:text-xs">{testimonial.name}, {testimonial.location} <small>{testimonial.breed}</small></span>
    </div>
  </>
);

export const Testimonial = ({
  testimonials = TESTIMONIALS,
}: TestimonialProps) => {
  const [activeIndex, setActiveIndex] = useState(1); // Start with center card active
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <>
      <section className="py-24 z-10 -mx-6 max-md:-mx-4 max-md:p-4 max-md:mt-12">
        <div className="container flex flex-col relative ">
          <div className="flex flex-col gap-4 items-center m-auto relative w-full">
            <h1 className="text-40 font-medium leading-none max-md:text-3xl">Testimonials</h1>
            <span className="text-xl text-center font-[300] max-w-[900px] mt-2 w-full leading-normal max-md:text-base"> Real stories from <strong className="font-semibold">pet parents</strong> who found their <strong className="font-semibold">perfect companion</strong>. Discover the <strong className="font-semibold">love and trust</strong> that make <strong className="font-semibold">Pups4Sale</strong> a family of <span className="relative"><strong className="font-semibold">happy</strong> adopters. <img className="absolute right-0 -bottom-4 min-w-40 max-md:hidden" src="/images/vectors/line-6.svg"/></span></span>
            <div className="relative w-full mt-4 max-md:mt-0 max-md:-mx-4 max-md:w-[calc(100%+32px)]">
              <Swiper loop={true} centeredSlides={true} modules={[Autoplay, Navigation]} autoplay={{ delay: 5000 }} navigation={{nextEl: ".swipperNextBtn", prevEl: ".swipperPrevBtn",}} breakpoints={{320: {slidesPerView: 1, spaceBetween: 10,centeredSlides: false,}, 1300: {slidesPerView: 4, spaceBetween: 10, centeredSlides: true,},}} onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)} className="max-md:!px-20">
                {testimonials.map((testimonial, idx) => (
                  <SwiperSlide key={`testimonial-${idx}`} className={`h-auto py-4 md:py-8 transition-opacity duration-300 max-md:!scale-100 ${ idx === activeIndex ? "opacity-100 scale-100" : "opacity-50 scale-90" }`} >
                    <TestimonialCard testimonial={testimonial} isActive={idx === activeIndex}/>
                  </SwiperSlide>
                ))}
              </Swiper>
              <ActionIcon rounded="full" className="bg-black !h-24 !w-24 absolute max-md:hidden top-0 bottom-0 m-auto z-10 left-6 swipperPrevBtn"><img className="-scale-x-100" src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
              <ActionIcon rounded="full" className="bg-black !h-24 !w-24 absolute max-md:hidden top-0 bottom-0 m-auto z-10 right-6 swipperNextBtn"><img src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
