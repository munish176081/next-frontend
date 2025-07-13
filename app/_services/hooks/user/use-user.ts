import { axios } from "@/_lib/axios";
import { UserType } from "@/_types/user";
import { useQuery } from "@tanstack/react-query";

async function getUser(): Promise<UserType | null> {
  try {
    const { data } = await axios.get("/users/me");
    return data;
  } catch (error) {
    // If the request fails (e.g., user not authenticated), return null
    return null;
  }
}

export const useUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getUser,
    retry: false, // Don't retry if the request fails
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
};
