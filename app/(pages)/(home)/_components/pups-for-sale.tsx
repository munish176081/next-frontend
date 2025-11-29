"use client";

import { PuppiesSlider } from "@/(pages)/(home)/_components/featured-puppies/slider";
import { useGetListings } from "@/_services/hooks/listings/use-get-listings";
import { ListingSummaryDto, ListingTypeEnum } from "@/_types/listing";
import { formatListingType } from "@/_utils/listing";

export const PupsForSale = () => {
  // Fetch latest listings (all types, excluding $128 featured subscriptions)
  const { data, isLoading, error } = useGetListings({
    limit: 8,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const listings =
    data?.data?.map((listing: ListingSummaryDto) => ({
      id: listing.id,
      title: listing.title,
      description:
        listing.description ||
        `Beautiful ${listing.breed || "puppy"} - ${formatListingType(listing.type)}`,
      price: listing.price,
      location: listing.location,
      rating: 4.8,
      reviews: listing.favoriteCount || 15,
      listingType: formatListingType(listing.type),
      type: listing.type,
      image:
        listing.featuredImage ||
        listing.metadata?.images?.[0] ||
        "/images/comman/feature-puppy-1.png",
      favourite: false,
      age: listing.age,
      userId: listing.user?.id,
      fields: listing.fields || {},
      availability: listing.availability,
      breed: listing.breed,
      metadata: listing.metadata,
    })) || [];

  // If loading, show the section with a spinner
  if (isLoading) {
    return (
      <div className="flex relative bg-white bg-pups4SaleDesktop bg-cover max-md:bg-contain bg-no-repeat bg-center mt-20 -mx-6 max-md:mt-10">
        <section className="container flex flex-col relative px-8 py-16 relative z-10 max-md:pt-10 max-md:pb-0 max-md:px-4">
          <div className="flex flex-col gap-4 items-center m-auto relative w-full">
            <h1 className="text-40 max-md:text-3xl font-medium leading-none">New Pups4sale</h1>
            <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">
              Explore our <strong className="font-semibold">latest listings—fresh, adorable</strong>{" "}
              pups looking for their{" "}
              <span className="font-semibold relative inline-flex items-center justify-center">
                forever
                <img
                  className="absolute -z-10 min-w-20 max-md:hidden"
                  src="/images/vectors/circle.svg"
                />
              </span>{" "}
              homes.
            </span>
            <div className="group/section relative w-full mt-4 max-md:mt-0 max-md:!-mx-4 max-md:w-[calc(100%+32px)]">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                <p className="mt-2 text-gray-600">Loading new puppies...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // If error or no listings, hide section
  if (error || !listings.length) {
    return null;
  }

  return (
    <div className="flex relative bg-white bg-pups4SaleDesktop bg-cover max-md:bg-contain bg-no-repeat bg-center mt-20 -mx-6 max-md:mt-10">
      <section className="container flex flex-col relative px-8 py-16 relative z-10 max-md:pt-10 max-md:pb-0 max-md:px-4">
        <div className="flex flex-col gap-4 items-center m-auto relative w-full">
          <h1 className="text-40 max-md:text-3xl font-medium leading-none">New Pups4sale</h1>
          <span className="text-xl max-md:text-base text-center font-[300] max-w-[900px] mt-2 w-full leading-normal">
            Explore our <strong className="font-semibold">latest listings—fresh, adorable</strong>{" "}
            pups looking for their{" "}
            <span className="font-semibold relative inline-flex items-center justify-center">
              forever
              <img
                className="absolute -z-10 min-w-20 max-md:hidden"
                src="/images/vectors/circle.svg"
              />
            </span>{" "}
            homes.
          </span>
          <div className="group/section relative w-full mt-4 max-md:mt-0 max-md:!-mx-4 max-md:w-[calc(100%+32px)]">
            <PuppiesSlider listings={listings} />
          </div>
        </div>
      </section>
    </div>
  );
};


