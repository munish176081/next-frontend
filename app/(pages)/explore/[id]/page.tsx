"use client";
import React, { useRef, useState } from 'react';
import { ListingCard } from "@/_components/common/listing-card";
import { CtaBlock } from "../../(home)/_components/cta-block";
import ActionIcon from "@/_components/ui/action-icon";
import {
  Autoplay,
  Navigation,
  Swiper,
  SwiperSlide,
} from "@/_components/ui/slider";
import { FreeMode, Thumbs } from 'swiper/modules';
import { usePublicListing, useSimilarListings } from "@/_services/hooks/listings";
import { useParams } from "next/navigation";
import { formatListingType } from "@/_utils/listing";
import { ListingTypeEnum } from "@/_types/listing";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from "@/_services/hooks/user/use-user";
import { useGetListingById } from "@/_services/hooks/listings/use-get-listing-by-id";
import { chatApiService } from "@/_services/chat/chatApiService";
import { toast } from '@/_hooks/use-toast';

const ExploreDetail = () => {
  const params = useParams();
  const listingId = params.id as string;
  const router = useRouter();
  
  // Get current user
  const { data: currentUser } = useUser();
  
  // Fetch listing data
  const { data: listing, isLoading, error } = usePublicListing(listingId);

  // Debug logging
  console.log('Listing API Response:', listing);
  console.log('Listing ID:', listingId);
  console.log('Is Loading:', isLoading);
  console.log('Error:', error);

  // Fetch similar listings based on current listing
  const { data: similarListingsData } = useSimilarListings({
    breed: listing?.breed,
    type: listing?.type,
    category: listing?.category,
    excludeId: listingId,
    limit: 4,
  });

  // Transform similar listings data to match the expected format
  const similarListings = similarListingsData?.data?.map(listing => ({
    id: listing.id,
    title: listing.title,
    location: listing.location,
    description: `Beautiful ${listing.breed} - ${formatListingType(listing.type)}`, // Generate description from available data
    price: listing.price,
    rating: 4.5, // Default rating since it's not in the API
    reviews: Math.floor(Math.random() * 50) + 10, // Random reviews for now
    listingType: formatListingType(listing.type),
    image: listing.featuredImage || "/images/breed-by-type/1.png", // Use featured image or fallback
  })) || [];

  // Transform API data to match the design expectations
  const transformedListing = listing ? {
    title: listing.title || "Untitled Listing",
    breed: listing.breed || "Unknown Breed",
    location: listing.location || "Location not specified",
    price: (() => {
      if (typeof listing.price === 'number') return listing.price;
      if (typeof listing.price === 'string') {
        const parsed = parseFloat(listing.price);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    })(),
    description: listing.description || "No description available",
    listingType: formatListingType(listing.type),
    images: (() => {
      if (listing.metadata?.images && Array.isArray(listing.metadata.images) && listing.metadata.images.length > 0) {
        return listing.metadata.images;
      }
      // Fallback to default images if no images are provided
      return ["/images/vectors/detailSlide1.png", "/images/vectors/detailSlide2.png", "/images/vectors/detailSlide3.png"];
    })(),
    motherImages: listing.metadata?.motherImages || [],
    fatherImages: listing.metadata?.fatherImages || [],
    featuredImage: listing.metadata?.featuredImage ? listing.metadata.featuredImage : listing.metadata?.images?.[0],
    availability: listing.availability || 'available',
    user: listing.user,
    fields: listing.fields || {},
    motherInfo: listing.motherInfo,
    fatherInfo: listing.fatherInfo,
    viewCount: listing.viewCount || 0,
    favoriteCount: listing.favoriteCount || 0,
    createdAt: listing.createdAt || new Date(),
  } : null;

  // Debug logging for fields data
  console.log('Listing fields:', listing?.fields);
  console.log('Transformed fields:', transformedListing?.fields);
  console.log('Badges from fields:', transformedListing?.fields?.badges);
  console.log('DNA Results from fields:', transformedListing?.fields?.dnaResults);

  // Generate dog details from API data
  const dogDetails = transformedListing ? [
    { label: "Attribute", value: "Details", title: 'true' },
    { label: "Dog Name", value: transformedListing.fields?.dogName || transformedListing.title },
    { label: "Breed", value: transformedListing.breed },
    { label: "Age", value: transformedListing.fields?.age || "Age not specified" },
    { label: "Semen type", value: transformedListing.fields?.semenType || "Chilled(Static)" },
    { label: "Shipping Availability", value: transformedListing.fields?.shippingAvailable ? "Yes(Static)" : "No(Static)" },
    { label: "Collection Date", value: transformedListing.fields?.collectionDate || "1978-05-27(Static)" },
    { label: "ANKC Breeder Register", value: transformedListing.fields?.ankcBreederRegister || "Ex lorem dolorem aut(Static)" },
    { label: "Stud Fee", value: transformedListing.fields?.studFee || "3(Static)" },
    { label: "Location", value: transformedListing.location },
  ] : [];

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
    { name: "Product Quality", },
    { name: "Seller Services", },
    { name: "Product Price", },
    { name: "Shipment", },
    { name: "Match with Description", },
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
    <svg key="full-star" width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439" /></svg>
  );
  const halfStarSvg = (
    <svg key="half-star" width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="half-grad"><stop offset="50%" stopColor="#FFA439" /><stop offset="50%" stopColor="#E0E0E0" /></linearGradient></defs><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="url(#half-grad)" /></svg>
  );
  const emptyStarSvg = (
    <svg key="empty-star" width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#E0E0E0" /></svg>
  );
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state
  if (error || !transformedListing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Listing Not Found</h1>
          <p className="text-gray-600">The listing you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }
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
            <div className="absolute w-[220px] h-[195px] max-md:w-[100px] max-md:h-[100px] z-10 flex items-center justify-center top-0">
              <span className="bg-yellow-400 text-4xl font-semibold text-black -rotate-45 whitespace-nowrap px-20 h-16 flex items-center text-center w-min max-md:text-[18px] max-md:h-auto">
                {transformedListing.listingType}
              </span>
            </div>
            <Swiper className="w-full" loop={false} modules={[Autoplay, Navigation, FreeMode, Thumbs]} autoplay={{ delay: 2000 }} slidesPerView={1} spaceBetween={0} navigation={{ nextEl: ".swipperNextBtn", prevEl: ".swipperPrevBtn", }}
              thumbs={{ swiper: thumbsSwiper }}>
              {transformedListing.images && transformedListing.images.length > 0 ? (
                transformedListing.images.map((image: string, index: number) => (
                  <SwiperSlide key={index} className="group relative flex flex-col overflow-hidden">
                    <Image src={image} className="object-cover w-full h-[554px] max-md:h-[260px]" alt={`${transformedListing.title} - Image ${index + 1}`} width={100} height={100} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide className="group relative flex flex-col overflow-hidden">
                  <img src="/images/vectors/detailSlide1.png" className="object-cover w-full h-[554px] max-md:h-[260px]" alt="Default listing image" />
                </SwiperSlide>
              )}
            </Swiper>
            <ActionIcon rounded="full" className="bg-black !h-16 max-md:hidden !w-16 absolute top-0 bottom-0 m-auto z-10 left-4 swipperPrevBtn"><img className="-scale-x-100 max-w-3" src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
            <ActionIcon rounded="full" className="bg-black !h-16 max-md:hidden !w-16 absolute top-0 bottom-0 m-auto z-10 right-4 swipperNextBtn"><img className="max-w-3" src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
          </div>
          <Swiper onSwiper={setThumbsSwiper} spaceBetween={20} slidesPerView={3} freeMode={true} watchSlidesProgress={true} modules={[FreeMode, Navigation, Thumbs]} className="w-full mt-8 max-md:mt-4">
            {transformedListing.images && transformedListing.images.length > 0 ? (
              transformedListing.images.map((image: string, index: number) => (
                <SwiperSlide key={index} className="!border-4 border-transparent !rounded-3xl max-md:!rounded-lg !overflow-hidden cursor-pointer [&.swiper-slide-thumb-active]:border-CSecondary">
                  <Image className='w-full h-[238px] max-md:h-[100px] object-cover' src={image} alt={`${transformedListing.title} - Thumbnail ${index + 1}`} width={100} height={100} />
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide className="!border-4 border-transparent !rounded-3xl max-md:!rounded-lg !overflow-hidden cursor-pointer [&.swiper-slide-thumb-active]:border-CSecondary">
                <Image className='w-full h-[238px] max-md:h-[100px] object-cover' src="/images/vectors/detailSlide1.png" alt="Default listing thumbnail" width={100} height={100} />
              </SwiperSlide>
            )}
          </Swiper>
        </div>
        <div className="flex flex-col gap-3 max-md:gap-2">
          <span className="text-5xl font-medium max-md:text-3xl">{transformedListing.title}</span>
          <span className="text-[22px] text-[#9B9B9B] mt-3 max-md:text-base max-md:mt-1">({transformedListing.breed}-{new Date(transformedListing.createdAt).getFullYear()}-{String(transformedListing.viewCount).padStart(3, '0')})</span>
          <span className='max-md:text-xs'>{transformedListing.location}</span>
          <div className="flex gap-2 max-md:gap-1">
            <span className="h-10 border max-md:h-8 max-md:text-[11px] max-md:px-2 border-[#87D78E4D] bg-[#87D78E4D]/30 px-4 rounded-full flex items-center">
              {transformedListing.availability === 'available' ? 'Available' :
                transformedListing.availability === 'reserved' ? 'Reserved' :
                  transformedListing.availability === 'sold_out' ? 'Sold Out' : 'Draft'}
            </span>
            <span className="h-10 border max-md:h-8 max-md:text-[11px] max-md:px-2 border-black/20 px-4 rounded-full flex items-center gap-2 max-md:gap-1">
              <img className='max-md:w-4' src="/images/vectors/verified.png" />Pups4Sale Breeder Conditions Verified
            </span>
          </div>
          <span className="flex items-baseline gap-2">
            <text className="text-[32px] max-md:text-xl font-medium">
              ${typeof transformedListing.price === 'number' ? transformedListing.price.toFixed(2) : '0.00'}
            </text>
            <s className="text-[#717171] text-[22px] max-md:text-sm font-medium">
              ${typeof transformedListing.price === 'number' ? (transformedListing.price * 2.24).toFixed(2) : '0.00'}
            </s>
            <small className="text-[22px] font-medium max-md:text-sm">
              (Incl. Stud fee - ${transformedListing.fields?.studFee || '3'})
            </small>
          </span>
          <div className="border border-black/20 p-8 rounded-40 gap-4 flex flex-col mt-4 max-md:p-4 max-md:rounded-[20px] max-md:gap-2 max-md:mt-2">
            {/* Dynamic DNA Results Button */}
            {(() => {
              const dnaResults = transformedListing?.fields?.dnaResults;
              console.log('Rendering DNA Results section with:', dnaResults);

              if (dnaResults && Array.isArray(dnaResults) && dnaResults.length > 0) {
                return (
                  <button className="h-20 text-[18px] font-medium justify-center border border-black/20 px-4 rounded-full flex items-center gap-2 max-md:text-sm max-md:h-11">
                    <img className='max-md:w-4' src="/images/vectors/DNA.png" />
                    View DNA Results of Parents ({dnaResults.length} file{dnaResults.length !== 1 ? 's' : ''})
                  </button>
                );
              } else {
                return (
                  <button className="h-20 text-[18px] font-medium justify-center border border-black/20 px-4 rounded-full flex items-center gap-2 max-md:text-sm max-md:h-11 opacity-50 cursor-not-allowed">
                    <img className='max-md:w-4' src="/images/vectors/DNA.png" />
                    DNA Results Not Available
                  </button>
                );
              }
            })()}
            <span className="text-[34px] font-medium mt-3 max-md:text-xl">Schedule Meeting</span>
            <div className="flex gap-4 w-full max-md:gap-2 max-md:grid max-md:grid-cols-2">
              <div className="flex w-full relative">
                <span className="absolute h-16 max-md:h-10 w-14 max-md:w-10 flex items-center justify-center top-0 left-0">
                  <img className="max-md:w-4" src="/images/vectors/selectDate.png" />
                </span>
                <input
                  className="border relative max-md:text-xs z-10 max-md:pl-8 max-md:pr-2 bg-transparent border-black text-[#4B4A4A] rounded-full h-16 max-md:h-10 w-full px-6 pl-12"
                  type="date"
                  placeholder="Select Date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex w-full relative">
                <span className="absolute h-16 max-md:h-10 w-14 max-md:w-10 flex items-center justify-center top-0 left-0">
                  <img className="max-md:w-4" src="/images/vectors/selectTime.png" />
                </span>
                <input
                  className="border relative max-md:text-xs z-10 max-md:pl-8 max-md:pr-2 bg-transparent border-black text-[#4B4A4A] rounded-full h-16 max-md:h-10 w-full px-6 pl-12"
                  type="time"
                  placeholder="Select Time"
                  defaultValue={new Date().toTimeString().slice(0, 5)}
                />
              </div>
            </div>
            <button className="h-20 max-md:h-10 max-md:text-base w-full rounded-full bg-black text-white text-xl font-semibold flex items-center justify-center gap-2 mt-2">
              <img className='max-md:w-3' src="/images/vectors/scheduleMeeting.png" />Schedule meeting
            </button>
            <span className="flex justify-center text-xl font-medium max-md:text-base">Or</span>
                          <button
                onClick={async () => {
                  if (listing) {
                    try {
                      console.log('🚀 LIVE CHAT: Calling initiateChat API with listingId:', listing.id);
                      const result = await chatApiService.initiateChat(listing.id);
                      console.log('🚀 LIVE CHAT: API response:', result);
                      
                      const { conversationId } = result;
                      console.log('🚀 LIVE CHAT: Extracted conversationId:', conversationId);
                      
                      const redirectUrl = `/account/inbox?conversationId=${conversationId}`;
                      console.log('🚀 LIVE CHAT: Redirecting to:', redirectUrl);
                      
                      router.push(redirectUrl);
                    } catch (error) {
                      console.error('🚀 LIVE CHAT: Error occurred:', error);
                      toast({
                        title: "Error",
                        description: "Failed to start chat. Please try again.",
                        variant: "destructive",
                      });
                    }
                  } else {
                    console.error('🚀 LIVE CHAT: No listing found!');
                  }
                }}
                disabled={!!(currentUser && listing?.user?.id && currentUser.id === listing.user.id)}
                className={`h-20 max-md:h-10 max-md:text-base w-full rounded-full text-xl font-semibold flex items-center justify-center gap-2 transition-colors
                bg-black text-white hover:bg-gray-800 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              <img className='max-md:w-3' src="/images/vectors/liveChat.png" />
              Live Chat
            </button>
             
          </div>
        </div>
      </section >
      <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white flex gap-12 max-md:flex-col-reverse max-md:p-4 max-md:rounded-[20px] max-md:gap-3">
        <div className="flex w-1/2 max-md:w-full flex-col gap-5 max-md:gap-2">
          <span className="text-[40px] font-medium leading-tight max-md:text-[30px]">Detailed Description</span>
          <span className="text-2xl font-medium leading-tight max-md:text-base">About This {transformedListing.breed}</span>
          <span className="text-[21px] text-[#7E7E7E] leading-tight max-md:text-xs">{transformedListing.description}</span>
          <div className="flex p-2 rounded-full border border-black/20 text-lg gap-4 pr-8 items-center leading-snug max-md:text-xs max-md:gap-2 max-md:pr-2">
            <img className='max-md:w-16' src="/images/vectors/detailDescription1.png" />
            Your new pup comes with essentials like food, a blanket, and a few goodies—provided by the seller to help you get started right.
          </div>

          <div className="flex gap-8">
            {/* Dynamic Badges - Only show if they exist */}
            {(() => {
              const badges = transformedListing?.fields?.badges;
              console.log('Rendering badges section with:', badges);

              if (badges && Array.isArray(badges) && badges.length > 0) {
                return badges.map((badge, index) => (
                  <div key={index} className="text-center flex text-xs max-md:text-[8px] font-bold flex-col justify-center items-center gap-2">
                    <img src="/images/vectors/detailDescription2.png" className="max-w-max max-md:max-w-16" />
                    {badge}
                  </div>
                ));
              }
              return null;
            })()}
          </div>
        </div>
        <div className="flex w-1/2 max-md:w-full rounded-3xl overflow-hidden max-md:rounded-xl">
          <img className="w-full h-full object-cover" src={transformedListing.featuredImage} />
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
              <span className="w-full h-[350px] max-md:h-[170px] flex rounded-2xl overflow-hidden">
                <img className="w-full h-full object-cover" src={transformedListing.fatherImages[0] || "/images/vectors/dogParent1.jpg"} />
              </span>
              <span className="text-[22px] font-medium max-md:text-[18px]">Name: {transformedListing.fatherInfo?.name || "Maximus"}</span>
              <ul className="list-disc list-inside text-xs text-[#8A8585]">
                <li>Breed: {transformedListing.fatherInfo?.breed || "Purebred Golden Retriever"}</li>
                <li>Color: {transformedListing.fatherInfo?.color || "Cream"}</li>
                <li>Weight: {transformedListing.fatherInfo?.weight || "32 kg"}</li>
                <li>Temperament: {transformedListing.fatherInfo?.temperament || "Friendly, Calm"}</li>
                <li>Health Info: {transformedListing.fatherInfo?.healthInfo || "DNA Tested, Hip Scored"}</li>
              </ul>
            </div>
          </div>
          <div className="overflow-hidden flex flex-col gap-2 w-full">
            <span className="text-[32px] font-medium flex justify-center max-md:text-[22px]">Mother</span>
            <div className="p-6 border border-black/20 rounded-40 bg-white gap-2 flex flex-col max-md:p-4 max-md:rounded-[20px]">
              <span className="w-full h-[350px] max-md:h-[170px] flex rounded-2xl overflow-hidden">
                <img className="w-full h-full object-top object-cover" src={transformedListing.motherImages[0] || "/images/vectors/dogParent2.jpg"} />
              </span>
              <span className="text-[22px] font-medium max-md:text-[18px]">Name: {transformedListing.motherInfo?.name || "Bella"}</span>
              <ul className="list-disc list-inside text-xs text-[#8A8585]">
                <li>Breed: {transformedListing.motherInfo?.breed || "Purebred Golden Retriever"}</li>
                <li>Color: {transformedListing.motherInfo?.color || "Light Gold"}</li>
                <li>Weight: {transformedListing.motherInfo?.weight || "28 kg"}</li>
                <li>Temperament: {transformedListing.motherInfo?.temperament || "Nurturing, Playful"}</li>
                <li>Health Info: {transformedListing.motherInfo?.healthInfo || "DNA Tested, Elbow Scored"}</li>
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
                <span className={`w-1/3 max-md:w-1/2 text-center max-md:text-base max-md:text-left ${item.title ? 'max-md:text-xl' : ''}`}>{item.label}</span>
                <span className={`w-1/3 max-md:w-1/2 text-center max-md:text-base max-md:text-right ${item.title ? 'max-md:text-xl' : ''}`}>{item.value}</span>
              </div>
              <hr className="border-0 h-0.5 bg-gradient-to-r from-white/0 via-[#EFC951] to-white/0" />
            </>
          ))}
        </div>
      </section>
      <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white flex flex-col items-center bg-aboutOwner bg-no-repeat bg-center bg-container max-md:p-4 max-md:rounded-[20px]">
        <span className="text-[40px] font-medium relative max-md:text-[32px]">
          <img className="absolute -left-32 top-6 max-md:w-14 max-md:-left-14" src="/images/vectors/line-12.png" />About Owner
        </span>
        <div className="flex items-center gap-4 mt-2">
          {transformedListing.user?.imageUrl && (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#EFC951]">
              <img
                src={transformedListing.user.imageUrl}
                alt="Owner Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/vectors/profile.jpg";
                }}
              />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xl font-medium max-md:text-base text-center">
              {transformedListing.user?.name || "Owner Name Not Available"}
              <img className="absolute -bottom-2" src="/images/vectors/line-11.png" />
            </span>
            {transformedListing.user?.email && (
              <span className="text-lg text-[#5A5A5A] mt-1 max-md:text-sm">
                {transformedListing.user.email}
              </span>
            )}
          </div>
        </div>
        <span className="text-[21px] text-[#7E7E7E] mt-5 max-md:text-sm max-md:mt-3">
          Member since: {transformedListing.createdAt ?
            (() => {
              try {
                const date = new Date(transformedListing.createdAt);
                if (isNaN(date.getTime())) {
                  return 'Date not available';
                }
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              } catch (error) {
                return 'Date not available';
              }
            })() :
            'Date not available'
          }
        </span>
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
      <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white flex flex-col gap-8 max-md:gap-4 max-md:p-4 max-md:rounded-[20px]">
        <span className="text-[40px] font-medium m-auto">Reviews</span>
        <div className="flex border-2 border-dashed border-[#B8B8B8]/50 p-6 rounded-[20px] max-md:flex-col max-md:p-4 max-md:gap-4">
          <div className="flex w-3/12 items-center gap-2 max-md:w-full max-md:justify-center">
            <div className="relative w-24 h-24" style={{ '--rating': rating } as React.CSSProperties}>
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
                  <span className="flex gap-1 items-baseline">{item.rating}<svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439" /></svg></span>
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
              <span className="flex justify-between items-center">Rating <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.96004 4.57853L5.70004 1.31853C5.31504 0.933529 4.68504 0.933529 4.30004 1.31853L1.04004 4.57853" stroke="#0B0F0E" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
              {ratingData.map((item) => {
                return (
                  <label className="flex text-[#818B9C] items-center gap-1 cursor-pointer" key={item.rating}><span className="relative w-5 h-5 mr-2 flex items-center justify-center"><input className="w-full h-full border-2 appearance-none border-[#C4C8CC] rounded-none checked:bg-CSecondary checked:border-CSecondary peer" type="checkbox" /><svg className="absolute w-3 hidden peer-checked:flex" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg></span>{item.rating}<svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439" /></svg></label>
                );
              })}
            </div>
            <div className={`flex flex-col gap-3 mt-5 pt-5 border-t-2 border-dashed border-[#B8B8B8]/50 max-md:mt-4 ${showReviews ? '' : 'max-md:hidden'}`}>
              <span className="flex justify-between items-center">Review Topics <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.96004 4.57853L5.70004 1.31853C5.31504 0.933529 4.68504 0.933529 4.30004 1.31853L1.04004 4.57853" stroke="#0B0F0E" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
              {reviewTopics.map((item) => {
                return (
                  <label className="flex text-[#818B9C] items-center gap-1 cursor-pointer" key={item.name}><span className="relative w-5 h-5 mr-2 flex items-center justify-center"><input className="w-full h-full border-2 appearance-none border-[#C4C8CC] rounded-none checked:bg-CSecondary checked:border-CSecondary peer" type="checkbox" /><svg className="absolute w-3 hidden peer-checked:flex" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg></span>{item.name}</label>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="w-full border border-black/20 rounded-[20px] p-8 gap-6 flex flex-col shadow-review">
                <span className="w-11 h-11 rounded-full overflow-hidden"><img className="w-full h-full object-cover" src={testimonial.image} alt={testimonial.name} /></span>
                <span className="flex gap-1"><svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439"></path></svg><svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439"></path></svg><svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439"></path></svg><svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="half-grad"><stop offset="50%" stop-color="#FFA439"></stop><stop offset="50%" stop-color="#E0E0E0"></stop></linearGradient></defs><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="url(#half-grad)"></path></svg></span>
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
          {similarListingsData ? (
            similarListings.length > 0 ? (
              similarListings.map((listing) => (
                <ListingCard key={listing.id} listing={{ ...listing, favourite: true }} />
              ))
            ) : (
              <div className="w-full text-center py-8 text-gray-500">
                No similar listings found at the moment.
              </div>
            )
          ) : (
            <div className="w-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              Loading similar listings...
            </div>
          )}
        </div>
      </section>
      <CtaBlock />
    </>
  );
};

export default ExploreDetail;
