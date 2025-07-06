import { axios } from "@/_lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteUpload(uploadId: string) {
  await axios.delete(`/uploads/${uploadId}`);
}

export const useDeleteUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUpload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-uploads"] });
    },
  });
}; 