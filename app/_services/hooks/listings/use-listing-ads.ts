import { axios } from "@/_lib/axios";
import { ListingAdType, ListingTypeEnum } from "@/_types/listing";
import { useQuery } from "@tanstack/react-query";

async function getListingAds(type: ListingTypeEnum): Promise<ListingAdType[]> {
  const { data } = await axios.get(`/listing-ads?listingType=${type}`);

  return data;
}

export const useListingAds = (type: ListingTypeEnum) => {
  return useQuery({
    queryKey: ["listing-ads", type],
    queryFn: () => getListingAds(type),
  });
};
