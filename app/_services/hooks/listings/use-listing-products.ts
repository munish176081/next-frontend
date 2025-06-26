import { axios } from "@/_lib/axios";
import { ListingProductType, ListingTypeEnum } from "@/_types/listing";
import { useQuery } from "@tanstack/react-query";

async function getListingProducts(
  type: ListingTypeEnum
): Promise<ListingProductType> {
  const { data } = await axios.get(`/listings/${type}/products`);

  return data;
}

export const useListingProducts = (type: ListingTypeEnum) => {
  return useQuery({
    queryKey: ["listing-products", type],
    queryFn: () => getListingProducts(type),
  });
};
