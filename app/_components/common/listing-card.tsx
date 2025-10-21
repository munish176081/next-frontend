import { Routes } from "@/_config/routes";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PuppyButton } from "../ui/puppy-button";
import { Heading, Text } from "../ui/typegraphy";
import { useWishlist } from "@/_contexts/wishlist-context";
import { useState } from "react";
import { getPricingInfo, getPricingDisplayProps } from "@/_utils/pricing";
import { ListingTypeEnum } from "@/_types/listing";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    location?: string;
    rating?: number;
    reviews?: number;
    badge?: string;
    listingType?: string;
    type?: string; // Add type field for enum comparison
    favourite?: boolean;
    age?: string;
    userId?: string; // Add userId to check if it's user's own listing
    fields?: Record<string, any>; // Add fields for pricing options
  };
  currentUserId?: string; // Add current user ID
}

export const ListingCard = ({ listing, currentUserId }: ListingCardProps) => {
  const {
    title,
    location,
    description,
    price,
    rating,
    badge,
    reviews,
    listingType,
    type,
    image,
    favourite,
    age,
    userId,
    fields,
  } = listing;

  // Check if this is an Other Services listing
  const isOtherServices = type === ListingTypeEnum.OTHER_SERVICES;
  
  // For Other Services, use startingPrice from fields if available, otherwise fall back to main price
  const effectivePrice = isOtherServices && fields?.startingPrice 
    ? parseFloat(fields.startingPrice) 
    : price;
  
  // Get pricing information
  const pricingInfo = getPricingInfo(fields || {}, effectivePrice);
  const pricingProps = getPricingDisplayProps(pricingInfo);

  const { isWishlisted, toggleWishlist, state } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);

  // Check if this is the user's own listing
  const isOwnListing = currentUserId && userId && currentUserId === userId;
  console.log(isOwnListing, userId, currentUserId, "IS OWN LISTING")
  // Show heart for all listings except when it's confirmed to be own listing
  const shouldShowHeart = !isOwnListing;
  const isWishlistedItem = isWishlisted(listing.id);


  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent action if it's own listing or already toggling
    if (isOwnListing || isToggling) {
      console.log('Wishlist toggle prevented:', { isOwnListing, isToggling });
      return;
    }

    // If user is not logged in, show login message
    if (!currentUserId) {
      console.log('User not logged in, showing login message');
      // The wishlist context will handle showing the login message
    }

    setIsToggling(true);
    try {
      await toggleWishlist(listing.id);
    } finally {
      setIsToggling(false);
    }
  };
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white transition shadow-section p-6 h-full">
      {/* Wishlist Heart Icon - Show for all listings except own listings */}
      {shouldShowHeart && (
        <button
          onClick={handleWishlistToggle}
          disabled={isToggling}
          className={`w-7 h-7 rounded-full absolute right-8 top-8 overflow-hidden flex items-center justify-center z-10 transition-all duration-300 bg-CPrimary cursor-pointer hover:scale-110 active:scale-95 ${isToggling ? 'animate-pulse' : ''}`}
          title={isWishlistedItem ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isToggling ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <img 
                className={`w-4 transition-opacity duration-300 ${isWishlistedItem ? 'opacity-0' : 'opacity-100'}`} 
                src="/images/vectors/favorite.svg" 
                alt="Add to wishlist"
              />
              <img 
                className={`w-4 absolute transition-opacity duration-300 ${isWishlistedItem ? 'opacity-100' : 'opacity-0'}`} 
                src="/images/vectors/favorite_Fill.svg" 
                alt="Remove from wishlist"
              />
            </>
          )}
        </button>
      )}
      <Link href={`/explore/${listing.id}`} className="relative w-full h-56 bg-gray-100 overflow-hidden rounded-xl">
        <Image src={image || "/images/placeholder.png"} alt={title || "Listing Image"} fill className="object-cover rounded-md"/>
        {(listingType || badge) && (
          <div className="absolute w-20 h-20 z-10 flex items-center justify-center">
             {/* top-6 -left-7 */}
            <span className="bg-yellow-400 text-sm font-semibold text-black -rotate-45 whitespace-nowrap px-10 block text-center w-min">
              {listingType || badge} listing
            </span>
          </div>
        )}
      </Link>
      <Link href={`/explore/${listing.id}`} className="flex flex-col gap-2 mt-4 flex-1">
        <div className="flex-1">
          <Heading tag="h4" className="text-2xl font-semibold">{title}</Heading>
          {location && <Text className="text-base text-[#736E6E]">{location}</Text>}
          {/* {age && <Text className="text-base text-[#736E6E]">Age: {age}</Text>} */}
          {description && (<Text className="text-base text-[#A6A4A4]">{description.length > 40 ? description.substring(0, 40) + "..." : description}</Text>)}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col gap-1">
            {pricingProps.isPriceOnRequest ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-gradient-to-r from-CPrimary/10 to-CPrimary/5 rounded-full border border-CPrimary/20">
                  <Text className="text-lg font-semibold text-CPrimary">Price on Request</Text>
                </div>
              </div>
            ) : pricingProps.hasPriceRange ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  {isOtherServices && (
                    <Text className="text-lg text-gray-500 font-medium">From</Text>
                  )}
                  <Text className="text-2xl font-normal text-gray-900">
                    ${pricingProps.minPrice?.toLocaleString()}
                  </Text>
                  <Text className="text-lg text-gray-500 font-medium">-</Text>
                  <Text className="text-2xl font-normal text-gray-900">
                    ${pricingProps.maxPrice?.toLocaleString()}
                  </Text>
                </div>
                <Text className="text-sm text-gray-500 font-medium">
                  {isOtherServices ? 'Starting Price (minimum cost)' : 'Price Range'}
                </Text>
              </div>
            ) : pricingProps.hasFixedPrice ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  {isOtherServices && (
                    <Text className="text-lg text-gray-500 font-medium">From</Text>
                  )}
                  <Text className="text-2xl font-normal text-gray-900">
                    ${pricingProps.price?.toLocaleString()}
                  </Text>
                </div>
                <Text className="text-sm text-gray-500 font-medium">
                  {isOtherServices ? 'Starting Price (minimum cost)' : 'Fixed Price'}
                </Text>
              </div>
            ) : pricingProps.hasBasicPrice ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  {isOtherServices && (
                    <Text className="text-lg text-gray-500 font-medium">From</Text>
                  )}
                  <Text className="text-2xl font-normal text-gray-900">
                    ${pricingProps.price?.toLocaleString()}
                  </Text>
                </div>
                <Text className="text-sm text-gray-500 font-medium">
                  {isOtherServices ? 'Starting Price (minimum cost)' : 'Price'}
                </Text>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  {isOtherServices && (
                    <Text className="text-lg text-gray-500 font-medium">From</Text>
                  )}
                  <Text className="text-2xl font-normal text-gray-900">
                    ${effectivePrice?.toLocaleString() || '0'}
                  </Text>
                </div>
                <Text className="text-sm text-gray-500 font-medium">
                  {isOtherServices ? 'Starting Price (minimum cost)' : 'Price'}
                </Text>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-base bg-gray-50 px-3 py-2 rounded-full">
            {rating && <span className="font-semibold text-gray-700">{rating}</span>}
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {reviews !== undefined && <span className="text-gray-600">({reviews})</span>}
          </div>
        </div>
        <PuppyButton className="w-full h-[50px] mt-2" iconSrc="/images/paws/paws-white-vertical.svg" altText="Paws icon">View Listing</PuppyButton>
      </Link>
    </div>
  );
};
