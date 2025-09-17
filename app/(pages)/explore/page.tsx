"use client";
import { useState, useEffect } from "react";
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
import { useWishlist } from "@/_contexts/wishlist-context";
import { WishlistItem } from "@/_types/wishlist";
import { useUser } from "@/_services/hooks/user/use-user";

const ExploreListings = () => {
  const params = useSearchParams();
  const router = useRouter();
  const filterData = extractFilterDataFromSeach(params);
  const [searchQuery, setSearchQuery] = useState(filterData.search || "");
  const [currentPage, setCurrentPage] = useState(filterData.page || 1);
  const [showFilterBtn, setShowFilterBtn] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  
  const { state, toggleFilter, loadWishlist, loadWishlistStatus } = useWishlist();
  const { data: currentUser } = useUser();
  
  // Transform filter data to match the API expectations
  const searchParams = {
    query: searchQuery || "", // API expects 'query' not 'search'
    types: filterData.types as ListingTypeEnum[], // Send all selected types
    location: filterData.address || filterData.location, // Use address if available, fallback to location
    page: currentPage,
    limit: 12, // Show 12 items per page (3 columns * 4 rows)
    ...(filterData.minPrice && { minPrice: Number(filterData.minPrice) }),
    ...(filterData.maxPrice && { maxPrice: Number(filterData.maxPrice) }),
    ...(filterData.breed && { breed: filterData.breed }),
    // Handle price types - send all selected price types
    ...(filterData.priceTypes && filterData.priceTypes.length > 0 && { 
      priceTypes: filterData.priceTypes as ('price_on_request' | 'price_range' | 'price_available')[]
    }),
  };

  const { data: listingsResponse, isPending } = useSearchListings(searchParams);
  
  // Load wishlist status for all listings when not in wishlist filter mode
  useEffect(() => {
    if (!state.filterActive && listingsResponse?.data) {
      const listingIds = listingsResponse.data.map(listing => listing.id);
      loadWishlistStatus(listingIds);
    }
  }, [listingsResponse?.data, state.filterActive, loadWishlistStatus]);

  // Load wishlist items when filter is active
  useEffect(() => {
    if (state.filterActive) {
      loadWishlist(1).then(setWishlistItems);
    }
  }, [state.filterActive, loadWishlist]);

  // Transform API data to match ListingCard expectations
  const transformedListings = listingsResponse?.data?.map((listing) => ({
    id: listing.id,
    title: listing.title,
    description: listing?.description || "A wonderful puppy looking for a loving home.",
    price: listing.price,
    location: listing.location,
    rating: 4.8, // Default rating since API doesn't provide this yet
    reviews: 15, // Default reviews since API doesn't provide this yet
    listingType: formatListingType(listing.type),
    image: listing.featuredImage || "/images/comman/feature-puppy-1.png",
    favourite: false, // Will be handled by wishlist functionality
    age: listing.age, // Include calculated age from backend
    userId: listing.user?.id, // Add userId for own listing check
    fields: listing.fields || {}, // Add fields for pricing options
  })) || [];

  // Transform wishlist items to match ListingCard expectations
  const transformedWishlistItems = wishlistItems.map((item) => ({
    id: item.listing.id,
    title: item.listing.title,
    description: "A wonderful puppy looking for a loving home.",
    price: item.listing.price,
    location: item.listing.location,
    rating: 4.8,
    reviews: 15,
    listingType: "Puppy", // Default since we don't have type in wishlist response
    image: item.listing.imageUrl || "/images/comman/feature-puppy-1.png",
    favourite: true,
    age: "", // Not available in wishlist response
    userId: "", // Not available in wishlist response
    fields: item.listing.fields || {}, // Add fields for pricing options
  }));

  // Get the listings to display based on filter state
  const displayListings = state.filterActive ? transformedWishlistItems : transformedListings;

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
      <div className="flex-1 min-w-0">
        <div className="flex w-full gap-6 max-md:flex-wrap max-md:gap-4">
          <div className="flex h-16 rounded-full border border-black/20 text-xl p-2 bg-white items-center w-full">
            <input 
              className={`w-full h-full text-base placeholder:text-[#A8A8A8] text-black border-none outline-none bg-transparent px-4 py-0 ${
                isPending ? 'cursor-not-allowed opacity-60' : ''
              }`}
              placeholder="Search Puppies" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isPending}
            />
            <span 
              className={`h-12 w-12 min-w-12 rounded-full items-center justify-center flex cursor-pointer transition-colors ${
                isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
              }`}
              onClick={isPending ? undefined : handleSearch}
            >
              <img className="w-5" src="/images/vectors/search.svg" />
            </span>
          </div>
          <div 
            className={`flex h-16 rounded-full border text-xl p-2 gap-3 items-center pr-6 cursor-pointer max-md:hidden transition-all duration-300 ${
              state.filterActive 
                ? 'border-CPrimary bg-CPrimary/10 text-CPrimary' 
                : 'border-black/20 bg-white hover:bg-gray-50'
            }`}
            onClick={toggleFilter}
          >
            <span className={`h-12 w-12 rounded-full items-center justify-center flex transition-colors duration-300 ${
              state.filterActive ? 'bg-CPrimary' : 'bg-black'
            }`}>
              <img className="w-5" src="/images/vectors/favorite.svg" />
            </span>
            Wishlist
            {/* {state.isLoading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
            )} */}
          </div>
          <select className="flex h-16 max-md:w-[calc(100%/2-8px)] max-md:text-base max-md rounded-full min-w-32 px-4 border border-black/20 appearance-none bg-selectArrow bg-no-repeat bg-[90%] outline-none text-xl">
            <option>Sort by</option>
          </select>
          <div className="max-md:flex max-md:w-[calc(100%/2-8px)] max-md:text-base max-md h-16 rounded-full border border-black/20 text-xl p-2 bg-white gap-3 items-center pr-6 cursor-pointer hidden justify-center" onClick={() => setShowFilterBtn(true)}>
            <img className="w-5" src="/images/vectors/filter.png" /> Filter
          </div>
        </div>
        
        <div className="w-full mt-6">
          {isPending || state.isLoading ? (
            <span className="flex items-center gap-2 text-[#736E6E] w-full justify-center">
              Loading <img src="/images/vectors/pawsIndigo.svg" />
            </span>
          ) : displayListings.length > 0 ? (
            <div className="grid grid-cols-3 max-md:grid-cols-1 gap-6 max-md:gap-4 items-stretch">
              {displayListings.map((listing) => (
                <div key={listing.id} className="w-full">
                  <ListingCard 
                    listing={listing} 
                    currentUserId={currentUser?.id}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-8">
              <Text className="text-[#736E6E] text-lg">
                {state.filterActive 
                  ? "No items in your wishlist. Add some listings to see them here!" 
                  : "No listings found. Try adjusting your search criteria."
                }
              </Text>
            </div>
          )}
        </div>
        
        {!state.filterActive && totalPages > 1 && (
          <div className="flex rounded-full border border-black/20 text-xl p-2 bg-white items-center justify-center mt-6">
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
        
        {state.filterActive && state.pagination.hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => loadWishlist(state.pagination.page + 1).then(newItems => 
                setWishlistItems(prev => [...prev, ...newItems])
              )}
              className="px-6 py-3 bg-CPrimary text-white rounded-full hover:bg-CPrimary/90 transition-colors"
            >
              Load More Wishlist Items
            </button>
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
