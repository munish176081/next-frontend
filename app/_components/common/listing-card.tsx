import { Routes } from "@/_config/routes";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PuppyButton } from "../ui/puppy-button";
import { Heading, Text } from "../ui/typegraphy";

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
  };
}

export const ListingCard = ({ listing }: ListingCardProps) => {
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
  } = listing;
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white transition shadow-section p-6">
      {(favourite) && (
        <label className="w-7 h-7 bg-CPrimary rounded-full absolute right-8 top-8 overflow-hidden flex items-center justify-center z-10 cursor-pointer">
          <input type="checkbox" className="absolute w-full h-full rounded-full opacity-0 peer" />
          <img className="w-4 peer-checked:hidden" src="/images/vectors/favorite.svg" />
          <img className="w-4 hidden peer-checked:flex" src="/images/vectors/favorite_Fill.svg" />
        </label>
      )}
      <Link href={`${Routes.private.account}/listings/${listing.id}`} className="relative w-full h-56 bg-gray-100 overflow-hidden rounded-xl">
        <Image src={image || "/images/placeholder.png"} alt={title || "Listing Image"} fill className="object-cover rounded-md"/>
        {(listingType || badge) && (
          <div className="absolute w-20 h-20 z-10 flex items-center justify-center">
             {/* top-6 -left-7 */}
            <span className="bg-yellow-400 text-sm font-semibold text-black -rotate-45 whitespace-nowrap px-10 block text-center w-min">
              {listingType || badge}
            </span>
          </div>
        )}
      </Link>
      <Link href={`${Routes.private.account}/listings/${listing.id}`} className="flex flex-col gap-2 mt-4">
        <Heading tag="h4" className="text-2xl font-semibold">{title}</Heading>
        {location && <Text className="text-base text-[#736E6E]">{location}</Text>}
        {description && (<Text className="text-base text-[#A6A4A4]">{description}</Text>)}
        <div className="flex items-center justify-between mt-2">
          {price && <Text className="text-2xl">${price}</Text>}
          <div className="flex items-center gap-1 text-base">{rating && <span>{rating}</span>}<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{reviews !== undefined && <span>({reviews})</span>}</div>
        </div>
        <PuppyButton className="w-full h-[50px] mt-2" iconSrc="/images/paws/paws-white-vertical.svg" altText="Paws icon">View Listing</PuppyButton>
      </Link>
    </div>
  );
};
