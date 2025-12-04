"use client";
import { useState, Suspense } from "react";
import { ListingCard } from "@/_components/common/listing-card";
import { Text } from "@/_components/ui/typegraphy";
import { useSearchListings } from "@/_services/hooks/listings";
import {
  extractFilterDataFromSeach,
  ListingFilter,
} from "./_components/listing-filter";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/_services/hooks/user/use-user";
import SubscribeBox from "@/_components/SubscribeBox";

export const dynamic = 'force-dynamic';

function ExploreListings() {
  const { data: currentUser } = useUser();
  const listings1 = [
    {
      title: "Golden Retriever",
      id:'123',
      location: "Sydney, NSW",
      description: "A gentle and playful Golden Retriever pup, fully vaccinated and ready to join your family.",
      price: 1200,
      rating: 4.9,
      reviews: 20,
      listingType: "Litter Listing",
      image: "/images/comman/feature-puppy-1.png",
    },
    {
      title: "French Bulldog",
      id:'123',
      location: "Melbourne, VIC",
      description: "An adorable Frenchie with a friendly personality—perfect for small spaces and big hearts.",
      price: 1500,
      rating: 4.7,
      reviews: 28,
      listingType: "Semen Listing",
      image: "/images/comman/feature-puppy-2.png",
    },
    {
      title: "Labrador Retriever",
      id:'123',
      location: "Brisbane, QLD",
      description: "A sociable, energetic Lab pup, raised in a loving environment and eager for adventure.",
      price: 1000,
      rating: 4.8,
      reviews: 42,
      listingType: "Litter Listing",
      image: "/images/comman/feature-puppy-3.png",
    },
    {
      title: "Cavoodle",
      id:'123',
      location: "Adelaide, SA",
      description: "An affectionate Cavoodle with a hypoallergenic coat, ideal for families seeking a cuddly.",
      price: 1800,
      rating: 4.7,
      reviews: 18,
      listingType: "Litter Listing",
      image: "/images/comman/feature-puppy-4.png",
    },
    {
      title: "Beagle",
      id:'123',
      location: "Perth, WA",
      description: "A curious Beagle pup with a keen sense of smell, perfect for active families and outdoor adventures.",
      price: 1100,
      rating: 4.6,
      reviews: 30,
      listingType: "Semen Listing",
      image: "/images/comman/feature-puppy-5.png",
    },
    {
      title: "Pug",
      id:'123',
      location: "Hobart, TAS",
      description: "A curious Beagle pup with a keen sense of smell, perfect for active families and outdoor adventures.",
      price: 1300,
      rating: 4.5,
      reviews: 15,
      listingType: "Litter Listing",
      image: "/images/comman/feature-puppy-6.png",
    },
    {
      title: "Golden Retriever",
      id:'123',
      location: "Sydney, NSW",
      description: "A gentle and playful Golden Retriever pup, fully vaccinated and ready to join your family.",
      price: 1200,
      rating: 4.9,
      reviews: 20,
      listingType: "Litter Listing",
      image: "/images/comman/feature-puppy-7.png",
    },
    {
      title: "French Bulldog",
      id:'123',
      location: "Melbourne, VIC",
      description: "An adorable Frenchie with a friendly personality—perfect for small spaces and big hearts.",
      price: 1500,
      rating: 4.7,
      reviews: 28,
      listingType: "Semen Listing",
      image: "/images/comman/feature-puppy-8.png",
    },
  ]
  const params = useSearchParams();
  const filterData = extractFilterDataFromSeach(params);
  // const { data: listings = [], isPending } = useSearchListings(filterData);
  const [showFilterBtn, setShowFilterBtn] = useState(false);
  return (
    <>
    <section className="container flex gap-6 items-start py-16 max-md:py-4 max-md:gap-4 max-2xl:px-4">
      <div className="flex flex-wrap gap-6 max-md:gap-4">
        <div className="flex w-full gap-6 max-md:flex-wrap max-md:gap-4">
          <div className="flex h-16 rounded-full border border-black/20 text-xl p-2 bg-white items-center w-full">
            <input className="w-full h-full text-base placeholder:text-[#A8A8A8] text-black border-none outline-none bg-transparent px-4 py-0" placeholder="Search Puppies" />
            <span className="h-12 w-12 min-w-12 bg-black rounded-full items-center justify-center flex cursor-pointer"><img className="w-5" src="/images/vectors/search.svg" /></span>
          </div>
          <div className="flex h-16 rounded-full border border-black/20 text-xl p-2 text-white gap-3 items-center pr-6 cursor-pointer max-md:w-[calc(100%/2-8px)] bg-black"><span className="h-12 w-12 bg-white rounded-full items-center justify-center flex"><img className="w-5 invert" src="/images/vectors/favorite.svg" /></span>Wishlist</div>
          <select className="flex h-16 max-md:w-[calc(100%/2-8px)] max-md:text-base max-md rounded-full min-w-32 px-4 border border-black/20 appearance-none bg-selectArrow bg-no-repeat bg-[90%] outline-none text-xl">
            <option>Sort by</option>
          </select>
        </div>
        {listings1.map((listing) => (
          <div className="w-[calc(100%/4-20px)] max-md:w-full">
            <ListingCard 
              key={listing.id} 
              listing={{ ...listing, favourite: true }} 
              currentUserId={currentUser?.id}
            />
          </div>
        ))}
        <span className="flex items-center gap-2 text-[#736E6E] w-full justify-center mt-6">Loading <img src="/images/vectors/pawsIndigo.svg" /></span>
        <div className="flex rounded-full border border-black/20 text-xl p-2 bg-white items-center m-auto mt-6">
          <span className="w-10 max-md:w-8 max-md:h-8 max-md:text-sm h-10 rounded-full flex items-center justify-center cursor-pointer"><img src="/images/vectors/arrowLeftBlack.svg" /></span>
          {Array.from({ length: 8 }, (_, i) => (i + 1).toString()).map((num) => (
            <a key={num} href="#" className="w-10 max-md:w-8 max-md:h-8 max-md:text-sm h-10 rounded-full flex items-center justify-center hover:bg-CPrimary">{num}</a>
          ))}
          <span className="w-10 max-md:w-8 max-md:h-8 max-md:text-sm h-10 rounded-full flex items-center justify-center cursor-pointer -scale-100"><img src="/images/vectors/arrowLeftBlack.svg" /></span>
        </div>
      </div>
    </section>
      <SubscribeBox />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ExploreListings />
    </Suspense>
  );
}
