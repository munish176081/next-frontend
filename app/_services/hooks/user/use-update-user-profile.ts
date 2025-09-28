import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/_lib/axios";
import { UserType } from "@/_types/user";
import { UpdateUserProfileType } from "@/_config/validate-schema";

async function updateUserProfile(data: UpdateUserProfileType): Promise<UserType> {
  const { data: response } = await axios.put("/users/me", data);
  return response;
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      // Update the current user query cache
      queryClient.setQueryData(["current-user"], updatedUser);
      
      // Invalidate and refetch user data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
};
