import { axios } from "@/_lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Routes } from "@/_config/routes";

async function logout() {
  const { data } = await axios.post("/auth/sign-out");
  return data;
}

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Remove all queries from the cache
      queryClient.removeQueries();
      
      // Clear all mutations
      queryClient.clear();
      
      // Reset the query client to ensure fresh state
      queryClient.resetQueries();
      
      // Set the current-user query to null to indicate no user
      queryClient.setQueryData(["current-user"], null);
      
      // Navigate to home page
      router.push(Routes.public.home);
      
      // Force a router refresh to ensure all components re-render
      setTimeout(() => {
        router.refresh();
      }, 100);
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
};
