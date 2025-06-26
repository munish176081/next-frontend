import { axios } from "@/_lib/axios";
import { ListingTypeEnum, ListingType } from "@/_types/listing";
import { useQuery } from "@tanstack/react-query";

interface SearchListingQuery {
  types?: ListingTypeEnum[];
  breed?: string;
  lat?: string;
  lng?: string;
  minPrice?: string;
  maxPrice?: string;
}

async function searchListings(
  search: SearchListingQuery
): Promise<ListingType[]> {
  const { data } = await axios.get(`/listings/search`, {
    params: {
      types: search.types,
      breed: search.breed,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      ...(search.lat &&
        search.lng && {
          location: {
            lat: search.lat,
            lng: search.lng,
          },
        }),
    },
  });

  return data;
}

export const useSearchListings = (search: SearchListingQuery = {}) => {
  return useQuery({
    queryKey: [
      "search-listings",
      search?.types,
      search?.breed,
      search?.lat,
      search?.lng,
      search?.minPrice,
      search?.maxPrice,
    ],
    queryFn: () => searchListings(search),
  });
};
