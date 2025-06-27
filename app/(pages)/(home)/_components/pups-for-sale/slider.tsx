"use client";

import {
  Swiper,
  SwiperSlide,
  Navigation,
  Autoplay,
} from "@/_components/ui/slider";
import { ListingCard } from "@/_components/common/listing-card";
import ActionIcon from "@/_components/ui/action-icon";

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
        modules={[ Autoplay, Navigation]}
        autoplay={{ delay: 2000 }}
        slidesPerView={4}
        spaceBetween={12}
        navigation={{
          nextEl: ".destination-button-next",
          prevEl: ".destination-button-prev",
        }}
        breakpoints={{
          0: {
            slidesPerView: 1.2,
          },
          480: {
            slidesPerView: 1.6,
          },
          580: {
            slidesPerView: 1.6,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2.5,
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
          <SwiperSlide key={index}>
            <ListingCard listing={listing} />

          </SwiperSlide>

        ))}
      </Swiper>
      <div className="flex gap-4 mt-8 justify-center">
        <ActionIcon
          rounded="full"
          className="bg-black text-white h-[92px] w-[92px] destination-button-prev visible   left-[15px] -top-[8.5rem] z-10 flex"
        >
          <svg width="18" height="30" viewBox="0 0 18 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 28.4828L2.02299 15.2414L16 2" stroke="white" strokeWidth="2.68635" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </ActionIcon>

        <ActionIcon
          rounded="full"
          className="bg-black text-white h-[92px] w-[92px] destination-button-next visible   right-[15px] -top-[8.5rem] z-10 flex"
        >
          <svg width="18" height="30" viewBox="0 0 18 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.78906 1.75845L15.7661 14.9998L1.78906 28.2412" stroke="white" strokeWidth="2.68635" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

        </ActionIcon>
      </div>

    </>
  );
};
