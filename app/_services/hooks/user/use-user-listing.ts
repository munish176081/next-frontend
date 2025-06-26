import { axios } from "@/_lib/axios";
import { UserListingType } from "@/_types/listing";
import { useQuery } from "@tanstack/react-query";

async function getUserListing(
  listingId: string
): Promise<UserListingType | null> {
  const { data } = await axios.get(`/users/listings/${listingId}`);

  return data;
}

export const useUserListing = (listingId: string) => {
  return useQuery({
    queryKey: ["current-user-listing", listingId],
    queryFn: () => getUserListing(listingId),
  });
};
