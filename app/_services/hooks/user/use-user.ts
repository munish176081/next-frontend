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
    staleTime: 0, // Always refetch when the query is invalidated
  });
};
