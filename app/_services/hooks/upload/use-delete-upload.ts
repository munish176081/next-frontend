import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

interface DeleteUploadResponse {
  success: boolean;
  message?: string;
}

interface DeleteUploadParams {
  fileUrl: string;
}

export const useDeleteUpload = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteUploadResponse, Error, DeleteUploadParams>({
    mutationFn: async ({ fileUrl }: DeleteUploadParams) => {
      const response = await axios.post('/uploads/debug/test-delete', {
        fileUrl,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch uploads
        queryClient.invalidateQueries({ queryKey: ['uploads'] });
      }
    },
    onError: (error) => {
      console.error('Failed to delete upload:', error);
    },
  });
}; 