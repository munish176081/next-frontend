"use client";
import React, { useRef, useState } from 'react';
import { ListingCard } from "@/_components/common/listing-card";
import { CtaBlock } from "../(home)/_components/cta-block";
import ActionIcon from "@/_components/ui/action-icon";
import {
  Autoplay,
  Navigation,
  Swiper,
  SwiperSlide,
} from "@/_components/ui/slider";
import { FreeMode, Thumbs } from 'swiper/modules';

const exploreDetail = () => {
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
  ];
  const dogDetails = [
    { label: "Attribute", value: "Details", title: 'true' },
    { label: "Dog Name", value: "Alika Flores" },
    { label: "Breed", value: "Golden Retriever" },
    { label: "Age", value: "Adult" },
    { label: "Semen type", value: "Chilled" },
    { label: "Shipping Availability", value: "Yes" },
    { label: "Collection Date", value: "1978-05-27" },
    { label: "ANKC Breeder Register", value: "Ex lorem dolorem aut" },
    { label: "Stud Fee", value: "3" },
    { label: "Location", value: "Klostergade 12, 3230 Græsted, Denmark" },
  ];
  const testimonials = [
  {
    image: "/images/vectors/profile.jpg",
    message:
      "Im absolutely in love with @gather_place. It's the first video calling software built for people who meet to get work done. Feeling whole lot productive.",
    name: "Andrew Jones",
    title: "Product Developer at Webflow",
  },
  {
    image: "/images/vectors/profile.jpg",
    message:
      "@gather_place is the best. We've moved all of our meetings to this new platform and it's made them all better and efficient.",
    name: "Adam Smith",
    title: "Web Designer at Spotify",
  },
  {
    image: "/images/vectors/profile.jpg",
    message:
      "@gather_place amazing concept. It really brings me joy 💜 Bring a sense of play to your software and consider how it impacts the humans using it. Best way to build.",
    name: "Lauren White",
    title: "Product Manager at Zapier",
  },
  {
    image: "/images/vectors/profile.jpg",
    message:
      "It works really wonders in the hybrid culture. No echo and seamless integration with the current workflow. Love this application.",
    name: "Beth Wilson",
    title: "Product Manager at LinkedIn",
  },
  {
    image: "/images/vectors/profile.jpg",
    message:
      "Absolutely in love with @gather_place. It's the first video calling software built for people who meet to get work done.",
    name: "Mike Warren",
    title: "Product Manager at Zapier",
  },
  {
    image: "/images/vectors/profile.jpg",
    message:
      "Absolutely in love with @gather_place. It's the first video calling software built for people who meet to get work done.",
    name: "Mike Warren",
    title: "Product Manager at Zapier",
  },
];

  const reviewTopics = [
  { name: "Product Quality",},
  { name: "Seller Services",},
  { name: "Product Price",},
  { name: "Shipment",},
  { name: "Match with Description",},
];
  const ratingData = [
  { rating: 5.0, count: 2823 },
  { rating: 4.0, count: 1238 },
  { rating: 3.0, count: 4 },
  { rating: 2.0, count: 0 },
  { rating: 1.0, count: 0 },
];
const [showReviews, setShowReviews] = useState(false);
const total = ratingData.reduce((sum, item) => sum + item.count, 0);
const ratingSum = ratingData.reduce((sum, item) => sum + item.rating * item.count, 0);
const rating = total > 0 ? ratingSum / total : 0;

const percentage = (rating / 5) * 100;
const dashOffset = 314 - (314 * percentage) / 100;
const fullStars = Math.floor(rating);
const halfStar = rating % 1 >= 0.5;
const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
const fullStarSvg = (
  <svg key={Math.random()} width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439"/></svg>
);
const halfStarSvg = (
  <svg key="half" width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="half-grad"><stop offset="50%" stopColor="#FFA439" /><stop offset="50%" stopColor="#E0E0E0" /></linearGradient></defs><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="url(#half-grad)"/></svg>
);
const emptyStarSvg = (
  <svg key={Math.random()} width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#E0E0E0"/></svg>
);
const [thumbsSwiper, setThumbsSwiper] = useState(null);
  return (
    <>
    <section className="container relative overflow-hidden p-8 rounded-40 bg-white grid grid-cols-2 gap-8 items-start max-md:grid-cols-1 max-md:p-4 max-md:rounded-[20px]">
      <div className="flex flex-col">
        <div className="flex flex-col relative border border-black/20 rounded-40 overflow-hidden max-md:rounded-[20px]">
          <label className="w-20 h-20 max-md:w-12 max-md:h-12 bg-CPrimary rounded-full absolute right-4 top-4 overflow-hidden flex items-center justify-center z-10 cursor-pointer">
            <input type="checkbox" className="absolute w-full h-full rounded-full opacity-0 peer cursor-pointer" />
            <img className="w-11 max-md:w-6 peer-checked:hidden" src="/images/vectors/favorite.svg" />
            <img className="w-11 max-md:w-6 hidden peer-checked:flex" src="/images/vectors/favorite_Fill.svg" />
          </label>
          <div className="absolute w-[220px] h-[195px] max-md:w-[100px] max-md:h-[100px] z-10 flex items-center justify-center top-0"><span className="bg-yellow-400 text-4xl font-semibold text-black -rotate-45 whitespace-nowrap px-20 h-16 flex items-center text-center w-min max-md:text-[18px] max-md:h-auto">Litter Listing</span></div>
          <Swiper className="w-full" loop={false} modules={[Autoplay, Navigation]} autoplay={{ delay: 2000 }} slidesPerView={1} spaceBetween={0} navigation={{nextEl: ".swipperNextBtn", prevEl: ".swipperPrevBtn",}} 
          thumbs={{ swiper: thumbsSwiper }} modules={[FreeMode, Navigation, Thumbs]}>
            <SwiperSlide className="group relative flex flex-col overflow-hidden">
              <img src='/images/vectors/detailSlide1.png' className="object-cover w-full h-[554px] max-md:h-[260px]"/>
            </SwiperSlide>
            <SwiperSlide className="group relative flex flex-col overflow-hidden">
              <img src='/images/vectors/detailSlide2.png' className="object-cover w-full h-[554px] max-md:h-[260px]"/>
            </SwiperSlide>
            <SwiperSlide className="group relative flex flex-col overflow-hidden">
              <img src='/images/vectors/detailSlide3.png' className="object-cover w-full h-[554px] max-md:h-[260px]"/>
            </SwiperSlide>
          </Swiper>
          <ActionIcon rounded="full" className="bg-black !h-16 max-md:hidden !w-16 absolute top-0 bottom-0 m-auto z-10 left-4 swipperPrevBtn"><img className="-scale-x-100 max-w-3" src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
          <ActionIcon rounded="full" className="bg-black !h-16 max-md:hidden !w-16 absolute top-0 bottom-0 m-auto z-10 right-4 swipperNextBtn"><img className="max-w-3" src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
        </div>
        <Swiper onSwiper={setThumbsSwiper} spaceBetween={20} slidesPerView={3} freeMode={true} watchSlidesProgress={true} modules={[FreeMode, Navigation, Thumbs]} className="w-full mt-8 max-md:mt-4">
          <SwiperSlide className="!border-4 border-transparent !rounded-3xl max-md:!rounded-lg !overflow-hidden cursor-pointer [&.swiper-slide-thumb-active]:border-CSecondary"><img className="w-full h-[238px] max-md:h-[100px] object-cover" src="/images/vectors/detailSlide1.png" /></SwiperSlide>
          <SwiperSlide className="!border-4 border-transparent !rounded-3xl max-md:!rounded-lg !overflow-hidden cursor-pointer [&.swiper-slide-thumb-active]:border-CSecondary"><img className="w-full h-[238px] max-md:h-[100px] object-cover" src="/images/vectors/detailSlide2.png" /></SwiperSlide>
          <SwiperSlide className="!border-4 border-transparent !rounded-3xl max-md:!rounded-lg !overflow-hidden cursor-pointer [&.swiper-slide-thumb-active]:border-CSecondary"><img className="w-full h-[238px] max-md:h-[100px] object-cover" src="/images/vectors/detailSlide3.png" /></SwiperSlide>
        </Swiper>
      </div>
      <div className="flex flex-col gap-3 max-md:gap-2">
        <span className="text-5xl font-medium max-md:text-3xl">Golden Retriever Puppy</span>
        <span className="text-[22px] text-[#9B9B9B] mt-3 max-md:text-base max-md:mt-1">(GR-2025-001)</span>
        <span className='max-md:text-xs'>Klostergade 12, 3230 Græsted, Denmark</span>
        <div className="flex gap-2 max-md:gap-1">
          <span className="h-10 border max-md:h-8 max-md:text-[11px] max-md:px-2 border-[#87D78E4D] bg-[#87D78E4D]/30 px-4 rounded-full flex items-center">Available</span>
          <span className="h-10 border max-md:h-8 max-md:text-[11px] max-md:px-2 border-black/20 px-4 rounded-full flex items-center gap-2 max-md:gap-1"><img className='max-md:w-4' src="/images/vectors/verified.png" />Pups4Sale Breeder Conditions Verified</span>
        </div>
        <span className="flex items-baseline gap-2"><text className="text-[32px] max-md:text-xl font-medium">$1200.00</text> <s className="text-[#717171] text-[22px] max-md:text-sm font-medium">$2690.00</s><small className="text-[22px] font-medium max-md:text-sm">(Incl. Stud fee - $3)</small></span>
        <div className="border border-black/20 p-8 rounded-40 gap-4 flex flex-col mt-4 max-md:p-4 max-md:rounded-[20px] max-md:gap-2 max-md:mt-2">
          <button className="h-20 text-[18px] font-medium justify-center border border-black/20 px-4 rounded-full flex items-center gap-2 max-md:text-sm max-md:h-11"><img className='max-md:w-4' src="/images/vectors/DNA.png" />View DNA Results of Parents</button>
          <span className="text-[34px] font-medium mt-3 max-md:text-xl">Schedule Meeting</span>
          <div className="flex gap-4 w-full max-md:gap-2 max-md:grid max-md:grid-cols-2">
            <div className="flex w-full relative">
              <span className="absolute h-16 max-md:h-10 w-14 max-md:w-10 flex items-center justify-center top-0 left-0"><img className="max-md:w-4" src="/images/vectors/selectDate.png" /></span>
              <input className="border relative max-md:text-xs z-10 max-md:pl-8 max-md:pr-2 bg-transparent border-black text-[#4B4A4A] rounded-full h-16 max-md:h-10 w-full px-6 pl-12" type="date" placeholder="Select Date" />
            </div>
            <div className="flex w-full relative">
              <span className="absolute h-16 max-md:h-10 w-14 max-md:w-10 flex items-center justify-center top-0 left-0"><img className="max-md:w-4" src="/images/vectors/selectTime.png" /></span>
              <input className="border relative max-md:text-xs z-10 max-md:pl-8 max-md:pr-2 bg-transparent border-black text-[#4B4A4A] rounded-full h-16 max-md:h-10 w-full px-6 pl-12" type="time" placeholder="Select Time" />
            </div>
          </div>
          <button className="h-20 max-md:h-10 max-md:text-base w-full rounded-full bg-black text-white text-xl font-semibold flex items-center justify-center gap-2 mt-2"><img className='max-md:w-3' src="/images/vectors/scheduleMeeting.png" />Schedule meeting</button>
          <span className="flex justify-center text-xl font-medium max-md:text-base">Or</span>
          <button className="h-20 max-md:h-10 max-md:text-base w-full rounded-full bg-black text-white text-xl font-semibold flex items-center justify-center gap-2"><img className='max-md:w-3' src="/images/vectors/liveChat.png" />Live Chat</button>
        </div>
      </div>
    </section>
    <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white flex gap-12 max-md:flex-col-reverse max-md:p-4 max-md:rounded-[20px] max-md:gap-3">
      <div className="flex w-1/2 max-md:w-full flex-col gap-5 max-md:gap-2">
        <span className="text-[40px] font-medium leading-tight max-md:text-[30px]">Detailed Description</span>
        <span className="text-2xl font-medium leading-tight max-md:text-base">About This Puppy</span>
        <span className="text-[21px] text-[#7E7E7E] leading-tight max-md:text-xs">Meet your new best friend! This playful Golden Retriever puppy is raised in a loving home, fully vaccinated, and ready to become a cherished member of your family.</span>
        <ul className="text-[21px] text-[#3F3E3E] list-disc list-inside leading-tight max-md:text-xs">
          <li>Ideal for families</li>
          <li>Socialized with children and other pets</li>
          <li>Raised with expert care and training</li>
        </ul>
        <div className="flex p-2 rounded-full border border-black/20 text-lg gap-4 pr-8 items-center leading-snug max-md:text-xs max-md:gap-2 max-md:pr-2">
          <img className='max-md:w-16' src="/images/vectors/detailDescription1.png" />
          Your new pup comes with essentials like food, a blanket, and a few goodies—provided by the seller to help you get started right.
        </div>
        <div className="flex gap-8">
          <div className="flex text-xs max-md:text-[8px] font-bold flex-col justify-center items-center gap-2"><img src="/images/vectors/detailDescription2.png" className="max-w-max max-md:max-w-16" />Purebred Certified</div>
          <div className="flex text-xs max-md:text-[8px] font-bold flex-col justify-center items-center gap-2"><img src="/images/vectors/detailDescription3.png" className="max-w-max max-md:max-w-16" />DNA tested</div>
        </div>
      </div>
      <div className="flex w-1/2 max-md:w-full rounded-3xl overflow-hidden max-md:rounded-xl">
        <img className="w-full h-full object-cover" src="/images/vectors/detailDescription.png" />
      </div>
    </section>
    <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white max-md:p-4">
      <img className="mix-blend-multiply absolute top-0 left-0" src="/images/vectors/parentLeft.png" />
      <img className="mix-blend-multiply absolute top-0 right-0 max-md:bottom-0 max-md:top-auto" src="/images/vectors/parentRight.png" />
      <span className="text-[40px] font-medium flex justify-center w-full max-md:text-[32px]">Puppy Parents</span>
      <div className="flex gap-6 relative z-10 mt-8 max-md:flex-col max-md:gap-4 max-md:mt-4">
        <div className="overflow-hidden flex flex-col gap-2 w-full">
          <span className="text-[32px] font-medium flex justify-center max-md:text-[22px]">Father</span>
          <div className="p-6 border border-black/20 rounded-40 bg-white gap-2 flex flex-col max-md:p-4 max-md:rounded-[20px]">
            <span className="w-full h-[350px] max-md:h-[170px] flex rounded-2xl overflow-hidden"><img className="w-full h-full object-cover" src="/images/vectors/dogParent1.jpg" /></span>
            <span className="text-[22px] font-medium max-md:text-[18px]">Name: Maximus</span>
            <ul className="list-disc list-inside text-xs text-[#8A8585]">
              <li>Breed: Purebred Golden Retriever</li>
              <li>Color: Cream</li>
              <li>Weight: 32 kg</li>
              <li>Temperament: Friendly, Calm</li>
              <li>Health Info: DNA Tested, Hip Scored</li>
            </ul>
          </div>
        </div>
        <div className="overflow-hidden flex flex-col gap-2 w-full">
          <span className="text-[32px] font-medium flex justify-center max-md:text-[22px]">Mother</span>
          <div className="p-6 border border-black/20 rounded-40 bg-white gap-2 flex flex-col max-md:p-4 max-md:rounded-[20px]">
            <span className="w-full h-[350px] max-md:h-[170px] flex rounded-2xl overflow-hidden"><img className="w-full h-full object-top object-cover" src="/images/vectors/dogParent2.jpg" /></span>
            <span className="text-[22px] font-medium max-md:text-[18px]">Name: Bella</span>
            <ul className="list-disc list-inside text-xs text-[#8A8585]">
              <li>Breed: Purebred Golden Retriever</li>
              <li>Color: Light Gold</li>
              <li>Weight: 28 kg</li>
              <li>Temperament: Nurturing, Playful</li>
              <li>Health Info: DNA Tested, Elbow Scored</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <section className="relative">
      <img className="mix-blend-multiply absolute bottom-0 max-md:max-w-52 max-md:top-0 max-md:my-auto max-md:-ml-4" src="/images/vectors/gradientLeft.png" />
      <img className="mix-blend-multiply absolute right-0 top-0 max-md:hidden" src="/images/vectors/gradientRight.png" />
      <div className="container relative z-10">
        <span className="text-[40px] font-semibold flex justify-center w-full max-md:text-[32px]">Puppy Details</span>
        {dogDetails.map((item, index) => (
          <>
            <div key={index} className={`flex justify-center py-3 text-[32px] ${item.title ? 'font-semibold' : ''}`}>
              <span className={`w-1/3 max-md:w-1/2 max-md:text-base ${item.title ? 'max-md:text-xl' : ''}`}>{item.label}</span>
              <span className={`w-1/3 max-md:w-1/2 max-md:text-base max-md:text-right ${item.title ? 'max-md:text-xl' : ''}`}>{item.value}</span>
            </div>
            <hr className="border-0 h-0.5 bg-gradient-to-r from-white/0 via-[#EFC951] to-white/0" />
          </>
        ))}
      </div>
    </section>
    <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white flex flex-col items-center bg-aboutOwner bg-no-repeat bg-center bg-container max-md:p-4 max-md:rounded-[20px]">
    <span className="text-[40px] font-medium relative max-md:text-[32px]"><img className="absolute -left-32 top-6 max-md:w-14 max-md:-left-14" src="/images/vectors/line-12.png" />About Owner</span>
    <span className="text-xl font-medium relative mt-2 max-md:text-base max-md:mt-1">Yasir Khattak <img className="absolute -bottom-2" src="/images/vectors/line-11.png" /></span>
    <span className="text-[21px] text-[#7E7E7E] mt-5 max-md:text-sm max-md:mt-3">Member since: 2024-09-06</span>
    <div className="flex gap-4 h-[350px] max-md:h-auto w-full mt-7 max-md:flex-wrap max-md:mt-4">
      <div className="w-2/12 max-md:w-[calc(100%/2-8px)] flex flex-col gap-4">
        <span className="overflow-hidden flex w-full h-full rounded-2xl"><img src="/images/vectors/dog1.png" className="w-full h-full object-cover" /></span>
        <span className="overflow-hidden flex w-full h-full rounded-2xl"><img src="/images/vectors/dog2.png" className="w-full h-full object-cover" /></span>
      </div>
      <div className="overflow-hidden w-2/12 max-md:w-[calc(100%/2-8px)] rounded-2xl"><img src="/images/vectors/dog3.png" className="w-full h-full object-cover" /></div>
      <div className="overflow-hidden w-5/12 max-md:w-full rounded-2xl"><img src="/images/vectors/dog4.png" className="w-full h-full object-cover" /></div>
      <div className="overflow-hidden w-3/12 max-md:w-full rounded-2xl"><img src="/images/vectors/dog5.png" className="w-full h-full object-cover" /></div>
    </div>
    </section>
    <section className="flex flex-col gap-6 container">
      <span className="text-[40px] font-medium max-md:text-[32px] flex gap-4 max-md:items-center max-md:gap-2">Yasir's Previous Listings <img className='max-md:w-20 rotate-45' src="/images/vectors/arrow.png" alt="" /></span>
      <div className="flex gap-6 max-md:flex-col">
        {listings.map((listing, index) => (
            <ListingCard key={index} listing={{ ...listing, favourite: true }} />
        ))}
      </div>
    </section>
    <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white flex flex-col gap-8 max-md:gap-4 max-md:p-4 max-md:rounded-[20px]">
      <span className="text-[40px] font-medium m-auto">Reviews</span>
      <div className="flex border-2 border-dashed border-[#B8B8B8]/50 p-6 rounded-[20px] max-md:flex-col max-md:p-4 max-md:gap-4">
        <div className="flex w-3/12 items-center gap-2 max-md:w-full max-md:justify-center">
          <div className="relative w-24 h-24" style={{ '--rating': rating }}>
            <svg className="w-full h-full transform -rotate-45" viewBox="0 0 120 120"><circle className="text-[#E4E9EE]" strokeWidth="4" stroke="currentColor" fill="transparent" r="50" cx="60" cy="60" /><circle className="text-[#FFA439]" strokeWidth="4" stroke="currentColor" fill="transparent" r="50" cx="60" cy="60" strokeDasharray="314" strokeDashoffset={dashOffset} style={{ transition: 'stroke-dashoffset 0.5s ease' }} /></svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-800">{rating.toFixed(1)}</div>
          </div>
          <div className="flex flex-col text-[13px] gap-2">
            <span className="flex gap-1">
              {Array.from({ length: fullStars }, (_, i) => (
                <React.Fragment key={`full-${i}`}>{fullStarSvg}</React.Fragment>
              ))}
              {halfStar && halfStarSvg}
              {Array.from({ length: emptyStars }, (_, i) => (
                <React.Fragment key={`empty-${i}`}>{emptyStarSvg}</React.Fragment>
              ))}
            </span>
            from {total.toLocaleString()} reviews
          </div>
        </div>
        <div className="flex w-9/12 flex-col gap-4 max-md:w-full">
          {ratingData.map((item) => {
            const percent = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div key={item.rating} className="flex items-center gap-4 w-full">
                <span className="flex gap-1 items-baseline">{item.rating}<svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439"/></svg></span>
                <span className="bg-[#E4E9EE] h-[8px] w-full rounded-full flex overflow-hidden"><span className="bg-[#292929] h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></span></span>
                <span className="min-w-16">{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-8 items-start max-md:flex-col max-md:gap-4">
        <div className="w-[300px] min-w-[300px] p-6 border-2 border-dashed border-[#B8B8B8]/50 rounded-[20px] bg-white flex flex-col max-md:w-full max-md:p-4">
          <span className="text-2xl font-semibold flex justify-between items-center max-md:text-[18px]">Review Filter <img onClick={() => setShowReviews(!showReviews)} className={`hidden max-md:flex w-8 ${showReviews ? 'rotate-0' : 'rotate-90'}`} src='/images/vectors/reviewFilter.png' /></span>
          <div className={`flex flex-col gap-3 mt-5 pt-5 border-t-2 border-dashed border-[#B8B8B8]/50 max-md:mt-4 ${showReviews ? '' : 'max-md:hidden'}`}>
            <span className="flex justify-between items-center">Rating <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.96004 4.57853L5.70004 1.31853C5.31504 0.933529 4.68504 0.933529 4.30004 1.31853L1.04004 4.57853" stroke="#0B0F0E" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            {ratingData.map((item) => {
              return (
                <label className="flex text-[#818B9C] items-center gap-1 cursor-pointer" key={item.rating}><span className="relative w-5 h-5 mr-2 flex items-center justify-center"><input className="w-full h-full border-2 appearance-none border-[#C4C8CC] rounded-none checked:bg-CSecondary checked:border-CSecondary peer" type="checkbox" /><svg className="absolute w-3 hidden peer-checked:flex" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg></span>{item.rating}<svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439"/></svg></label>
              );
            })}
          </div>
          <div className={`flex flex-col gap-3 mt-5 pt-5 border-t-2 border-dashed border-[#B8B8B8]/50 max-md:mt-4 ${showReviews ? '' : 'max-md:hidden'}`}>
            <span className="flex justify-between items-center">Review Topics <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.96004 4.57853L5.70004 1.31853C5.31504 0.933529 4.68504 0.933529 4.30004 1.31853L1.04004 4.57853" stroke="#0B0F0E" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            {reviewTopics.map((item) => {
              return (
                <label className="flex text-[#818B9C] items-center gap-1 cursor-pointer" key={item.name}><span className="relative w-5 h-5 mr-2 flex items-center justify-center"><input className="w-full h-full border-2 appearance-none border-[#C4C8CC] rounded-none checked:bg-CSecondary checked:border-CSecondary peer" type="checkbox" /><svg className="absolute w-3 hidden peer-checked:flex" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg></span>{item.name}</label>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="w-full border border-black/20 rounded-[20px] p-8 gap-6 flex flex-col shadow-review">
              <span className="w-11 h-11 rounded-full overflow-hidden"><img className="w-full h-full object-cover" src={testimonial.image} alt={testimonial.name}/></span>
              <span className="flex gap-1"><svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439"></path></svg><svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439"></path></svg><svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439"></path></svg><svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439"></path></svg><svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="half-grad"><stop offset="50%" stop-color="#FFA439"></stop><stop offset="50%" stop-color="#E0E0E0"></stop></linearGradient></defs><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="url(#half-grad)"></path></svg></span>
              <span className="text-[13px]">{testimonial.message}</span>
              <span className="text-[13px] text-[#3D3D3D]">{testimonial.name} <br />{testimonial.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
    <section className="flex flex-col gap-6 container">
      <span className="text-[40px] font-medium max-md:text-[32px]">Similar listings you may like</span>
      <div className="flex gap-6 max-md:flex-col">
        {listings.map((listing, index) => (
            <ListingCard key={index} listing={{ ...listing, favourite: true }} />
        ))}
      </div>
    </section>
    <CtaBlock />
    </>
  );
};

export default exploreDetail;
