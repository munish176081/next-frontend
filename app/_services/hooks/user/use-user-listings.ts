import { axios } from "@/_lib/axios";
import { UserListingType } from "@/_types/listing";
import { useQuery } from "@tanstack/react-query";

async function getUserListings(): Promise<UserListingType[]> {
  const { data } = await axios.get(`/users/listings`);

  return data;
}

export const useUserListings = () => {
  return useQuery({
    queryKey: ["current-user-listings"],
    queryFn: getUserListings,
  });
};
