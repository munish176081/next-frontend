import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

interface DeletePendingFilesParams {
  fileUrls: string[];
}

interface DeletePendingFilesResponse {
  success: boolean;
  message: string;
  deletedFiles?: string[];
  failedFiles?: string[];
}

export const useDeletePendingFiles = () => {
  const queryClient = useQueryClient();

  return useMutation<DeletePendingFilesResponse, Error, DeletePendingFilesParams>({
    mutationFn: async ({ fileUrls }: DeletePendingFilesParams) => {
      if (fileUrls.length === 0) {
        return {
          success: true,
          message: 'No files to delete',
          deletedFiles: [],
          failedFiles: []
        };
      }

      try {
        const response = await axios.post('/uploads/bulk-delete', {
          fileUrls,
        });
        return response.data;
      } catch (error) {
        console.error('Failed to delete pending files:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Pending files deleted successfully:', data);
      // Optionally invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
    },
    onError: (error) => {
      console.error('Failed to delete pending files:', error);
    }
  });
}; 