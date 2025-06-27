"use client";

import { ListingCard } from "@/_components/common/listing-card";
import ActionIcon from "@/_components/ui/action-icon";
import {
  Autoplay,
  Navigation,
  Swiper,
  SwiperSlide,
} from "@/_components/ui/slider";

export interface SimpleListing {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  location?: string;
  rating?: number;
  reviews?: number;
  listingType?: string;
}

export const PuppiesSlider = ({
  listings,
}: {
  listings: SimpleListing[];
}) => {
  return (
    <>
      <Swiper
        loop={false}
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 2000 }}
        slidesPerView={1}
        spaceBetween={12}
        navigation={{
          nextEl: ".swipperNextBtn",
          prevEl: ".swipperPrevBtn",
        }}
        breakpoints={{
          768: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          840: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1280: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
        }}
      >
        {listings.map((listing, index: number) => (
          <SwiperSlide key={index}  className="!py-6 max-md:px-6">
            <ListingCard listing={listing} />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="flex gap-4 mt-8 justify-center">
        <ActionIcon rounded="full" className="bg-black !h-24 max-md:hidden !w-24 swipperPrevBtn"><img className="-scale-x-100" src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
        <ActionIcon rounded="full" className="bg-black !h-24 max-md:hidden !w-24 swipperNextBtn"><img src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
      </div>
    </>
  );
};
