import { Routes } from "@/_config/routes";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PuppyButton } from "../ui/puppy-button";
import { Heading, Text } from "../ui/typegraphy";
import { useWishlist } from "@/_contexts/wishlist-context";
import { useState } from "react";

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
    favourite?: boolean;
    age?: string;
    userId?: string; // Add userId to check if it's user's own listing
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
    image,
    favourite,
    age,
    userId,
  } = listing;

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
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white transition shadow-section p-6">
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
      <Link href={`/explore/${listing.id}`} className="flex flex-col gap-2 mt-4">
        <Heading tag="h4" className="text-2xl font-semibold">{title}</Heading>
        {location && <Text className="text-base text-[#736E6E]">{location}</Text>}
        {/* {age && <Text className="text-base text-[#736E6E]">Age: {age}</Text>} */}
        {description && (<Text className="text-base text-[#A6A4A4]">{description.length > 40 ? description.substring(0, 40) + "..." : description}</Text>)}
        <div className="flex items-center justify-between mt-2">
          {price && <Text className="text-2xl">${price}</Text>}
          <div className="flex items-center gap-1 text-base">{rating && <span>{rating}</span>}<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{reviews !== undefined && <span>({reviews})</span>}</div>
        </div>
        <PuppyButton className="w-full h-[50px] mt-2" iconSrc="/images/paws/paws-white-vertical.svg" altText="Paws icon">View Listing</PuppyButton>
      </Link>
    </div>
  );
};
