"use client";

import Section from "@/_components/common/section";
import { PuppiesSlider } from "./slider";
import { useFeaturedListings } from "@/_services/hooks/listings/use-featured-listings";
import { formatListingType } from "@/_utils/listing";
import { ListingSummaryDto } from "@/_types/listing";

export const FeaturedPuppies = () => {
  const { data: featuredListings, isLoading, error } = useFeaturedListings(20);

  // Transform ListingSummaryDto to the format expected by ListingCard
  const transformedListings = featuredListings?.map((listing: ListingSummaryDto) => ({
    id: listing.id,
    title: listing.title,
    description: listing.description || `Beautiful ${listing.breed} - ${formatListingType(listing.type)}`,
    price: listing.price,
    location: listing.location,
    rating: 4.8, // Default rating since API doesn't provide this yet
    reviews: listing.favoriteCount || 15, // Use favoriteCount as a proxy for reviews
    listingType: formatListingType(listing.type),
    type: listing.type,
    image: listing.featuredImage || listing.metadata?.images?.[0] || "/images/placeholder.jpeg",
    favourite: false, // Will be handled by wishlist functionality
    age: listing.age,
    userId: listing.user?.id,
    fields: listing.fields || {},
    availability: listing.availability,
    breed: listing.breed,
    metadata: listing.metadata,
  })) || [];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex relative -mx-6">
        <span className="flex w-96 h-96 absolute flex items-center overflow-hidden max-md:hidden"><img src="/images/vectors/horizontal_branding.svg" className="min-w-[804px] min-h-[1102px] -ml-[120px]" /></span>
        <section className="container flex flex-col relative px-8 py-24 relative z-10 max-md:py-8 max-md:px-6 max-md:pb-0">
          <div className="flex flex-col gap-4 items-center m-auto relative w-full">
            <h1 className="text-40 max-md:text-[32px] font-medium leading-none max-md:text-center">Discover Our Featured Puppies</h1>
            <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">Discover <strong className="font-semibold">Healthy, loving</strong> puppies ready to bring <strong className="font-semibold">joy</strong> and <span className="font-semibold relative">companionship <img className="absolute left-0 top-1 -z-10" src="/images/vectors/line-7.svg" /></span> into your home.</span>
            <div className="group/section relative w-full mt-4 max-md:mt-0 max-md:!-mx-4 max-md:w-[calc(100%+32px)]">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading featured puppies...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show error state or empty state
  if (error || !transformedListings.length) {
    return null; // Don't show the section if there are no featured listings
  }

  return (
    <>
    <div className="flex relative -mx-6">
      <span className="flex w-96 h-96 absolute flex items-center overflow-hidden max-md:hidden"><img src="/images/vectors/horizontal_branding.svg" className="min-w-[804px] min-h-[1102px] -ml-[120px]" /></span>
      <section className="container flex flex-col relative px-8 py-24 relative z-10 max-md:py-8 max-md:px-6 max-md:pb-0">
        <div className="flex flex-col gap-4 items-center m-auto relative w-full">
          <h1 className="text-40 max-md:text-[32px] font-medium leading-none max-md:text-center">Discover Our Featured Puppies</h1>
          <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">Discover <strong className="font-semibold">Healthy, loving</strong> puppies ready to bring <strong className="font-semibold">joy</strong> and <span className="font-semibold relative">companionship <img className="absolute left-0 top-1 -z-10" src="/images/vectors/line-7.svg" /></span> into your home.</span>
          <div className="group/section relative w-full mt-4 max-md:mt-0 max-md:!-mx-4 max-md:w-[calc(100%+32px)]">
            <PuppiesSlider listings={transformedListings} />
          </div>
        </div>
      </section>
    </div>
    </>
  );
};
