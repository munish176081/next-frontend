"use client";
import { useState } from "react";
import { ListingCard } from "@/_components/common/listing-card";
import { Text } from "@/_components/ui/typegraphy";
import { useSearchListings } from "@/_services/hooks/listings";
import {
  extractFilterDataFromSeach,
  ListingFilter,
} from "./_components/listing-filter";
import { useSearchParams, useRouter } from "next/navigation";
import { formatListingType } from "@/_utils/listing";
import { ListingTypeEnum } from "@/_types/listing";

const ExploreListings = () => {
  const params = useSearchParams();
  const router = useRouter();
  const filterData = extractFilterDataFromSeach(params);
  const [searchQuery, setSearchQuery] = useState(filterData.search || "");
  const [currentPage, setCurrentPage] = useState(filterData.page || 1);
  const [showFilterBtn, setShowFilterBtn] = useState(false);
  
  // Transform filter data to match the API expectations
  const searchParams = {
    search: searchQuery || "", // Default search term
    type: filterData.types?.[0] as ListingTypeEnum,
    location: filterData.address,
    page: currentPage,
    limit: 12, // Show 12 items per page (3 columns * 4 rows)
    ...(filterData.minPrice && { minPrice: Number(filterData.minPrice) }),
    ...(filterData.maxPrice && { maxPrice: Number(filterData.maxPrice) }),
    ...(filterData.breed && { breed: filterData.breed }),
  };

  const { data: listingsResponse, isPending } = useSearchListings(searchParams);
  
  // Transform API data to match ListingCard expectations
  const transformedListings = listingsResponse?.data?.map((listing) => ({
    id: listing.id,
    title: listing.title,
    description: listing.metadata?.description || "A wonderful puppy looking for a loving home.",
    price: listing.price,
    location: listing.location,
    rating: 4.8, // Default rating since API doesn't provide this yet
    reviews: 15, // Default reviews since API doesn't provide this yet
    listingType: formatListingType(listing.type),
    image: listing.featuredImage || "/images/comman/feature-puppy-1.png",
    favourite: false, // Will be handled by wishlist functionality
  })) || [];

  const totalPages = listingsResponse?.totalPages || 1;
  const totalItems = listingsResponse?.total || 0;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams(params);
      newParams.set("search", searchQuery.trim());
      newParams.set("page", "1"); // Reset to first page on new search
      router.push(`/explore?${newParams.toString()}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(params);
    newParams.set("page", page.toString());
    router.push(`/explore?${newParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
    <section className="container flex gap-6 items-start py-16 max-md:py-4 max-md:gap-4 max-2xl:px-4">
      <ListingFilter showFilterBtn={showFilterBtn} setShowFilterBtn={setShowFilterBtn} />
      <div className="flex flex-wrap gap-6 max-md:gap-4">
        <div className="flex w-full gap-6 max-md:flex-wrap max-md:gap-4">
          <div className="flex h-16 rounded-full border border-black/20 text-xl p-2 bg-white items-center w-full">
            <input 
              className="w-full h-full text-base placeholder:text-[#A8A8A8] text-black border-none outline-none bg-transparent px-4 py-0" 
              placeholder="Search Puppies" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <span 
              className="h-12 w-12 min-w-12 bg-black rounded-full items-center justify-center flex cursor-pointer"
              onClick={handleSearch}
            >
              <img className="w-5" src="/images/vectors/search.svg" />
            </span>
          </div>
          <div className="flex h-16 rounded-full border border-black/20 text-xl p-2 bg-white gap-3 items-center pr-6 cursor-pointer max-md:hidden">
            <span className="h-12 w-12 bg-black rounded-full items-center justify-center flex">
              <img className="w-5" src="/images/vectors/favorite.svg" />
            </span>
            Wishlist
          </div>
          <select className="flex h-16 max-md:w-[calc(100%/2-8px)] max-md:text-base max-md rounded-full min-w-32 px-4 border border-black/20 appearance-none bg-selectArrow bg-no-repeat bg-[90%] outline-none text-xl">
            <option>Sort by</option>
          </select>
          <div className="max-md:flex max-md:w-[calc(100%/2-8px)] max-md:text-base max-md h-16 rounded-full border border-black/20 text-xl p-2 bg-white gap-3 items-center pr-6 cursor-pointer hidden justify-center" onClick={() => setShowFilterBtn(true)}>
            <img className="w-5" src="/images/vectors/filter.png" /> Filter
          </div>
        </div>
        
        {isPending ? (
          <span className="flex items-center gap-2 text-[#736E6E] w-full justify-center mt-6">
            Loading <img src="/images/vectors/pawsIndigo.svg" />
          </span>
        ) : transformedListings.length > 0 ? (
          transformedListings.map((listing) => (
            <div key={listing.id} className="w-[calc(100%/3-16px)] max-md:w-full">
              <ListingCard listing={{ ...listing, favourite: true }} />
            </div>
          ))
        ) : (
          <div className="w-full text-center py-8">
            <Text className="text-[#736E6E] text-lg">No listings found. Try adjusting your search criteria.</Text>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex rounded-full border border-black/20 text-xl p-2 bg-white items-center m-auto mt-6">
            <span 
              className="w-10 max-md:w-8 max-md:h-8 max-md:text-sm h-10 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            >
              <img src="/images/vectors/arrowLeftBlack.svg" />
            </span>
            {Array.from({ length: Math.min(8, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <a 
                  key={pageNum} 
                  href="#" 
                  className={`w-10 max-md:w-8 max-md:h-8 max-md:text-sm h-10 rounded-full flex items-center justify-center hover:bg-CPrimary ${
                    pageNum === currentPage ? 'bg-CPrimary text-white' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNum);
                  }}
                >
                  {pageNum}
                </a>
              );
            })}
            <span 
              className="w-10 max-md:w-8 max-md:h-8 max-md:text-sm h-10 rounded-full flex items-center justify-center cursor-pointer -scale-100"
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            >
              <img src="/images/vectors/arrowLeftBlack.svg" />
            </span>
          </div>
        )}
      </div>
    </section>
      <section className="rounded-40 container max-2xl:w-auto max-md:mb-0 mb-10 py-8 overflow-hidden border border-black/20 bg-white flex flex-col relative justify-center max-md:py-4 max-2xl:mx-4">
        <div className="backdrop-blur-2xl bg-[#FAFAFA]/50 border border-black/20 rounded-3xl p-8 absolute max-md:static max-md:w-auto max-md:mx-4 max-md:p-4 max-md:gap-3 max-md:mb-4 top-4 z-20 m-auto right-4 flex flex-col gap-5 h-[calc(100%-32px)] w-[540px]">
          <span className="text-3xl max-md:text-[20px] max-md:leading-tight font-medium">Subscribe and get exclusive deals & offer</span>
          <span className="max-md:text-xs">Subbscribe to our email & get updates right  your inbox</span>
          <input type="text" placeholder="Full Name" className="text-base placeholder:text-[#4B4A4A] bg-transparent font-normal outline-none px-6 w-full h-[70px] rounded-full border border-black max-md:h-12" />
          <input type="text" placeholder="Email" className="text-base placeholder:text-[#4B4A4A] bg-transparent font-normal outline-none px-6 w-full h-[70px] rounded-full border border-black max-md:h-12" />
          <button className="h-20 max-md:h-12 max-md:text-base w-full rounded-full bg-black text-white text-xl font-semibold mt-auto">Subscribe</button>
        </div>
        <div className="max-md:h-[300px] w-full max-md:flex max-md:justify-center">
          <img className="h-full max-w-max" src="/images/cta-block/background.png" />
        </div>
      </section>
    </>
  );
};

export default ExploreListings;
