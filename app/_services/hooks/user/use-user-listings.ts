import { axios } from "@/_lib/axios";
import { ListingSummaryDto } from "@/_types/listing";
import { useQuery } from "@tanstack/react-query";

async function getUserListings(): Promise<ListingSummaryDto[]> {
  const { data } = await axios.get(`/users/listings`);

  return data;
}

export const useUserListings = () => {
  return useQuery({
    queryKey: ["current-user-listings"],
    queryFn: getUserListings,
  });
};
