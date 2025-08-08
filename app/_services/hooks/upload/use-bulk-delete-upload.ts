import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

interface BulkDeleteUploadResponse {
  success: boolean;
  message?: string;
  results?: {
    success: string[];
    failed: { url: string; error: string }[];
  };
}

interface BulkDeleteUploadParams {
  fileUrls: string[];
}

export const useBulkDeleteUpload = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkDeleteUploadResponse, Error, BulkDeleteUploadParams>({
    mutationFn: async ({ fileUrls }: BulkDeleteUploadParams) => {
      const response = await axios.post('/uploads/bulk-delete', {
        fileUrls,
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
      console.error('Failed to bulk delete uploads:', error);
    },
  });
}; 