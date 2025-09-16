import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { toast } from '@/_hooks/use-toast';

export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
}

export function useImportBreeds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ImportResult> => {
      const response = await axios.post('/breeds/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${data.imported} breeds`,
        });
        // Invalidate breeds query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['admin', 'breeds'] });
      } else {
        toast({
          title: 'Import Failed',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Import Failed',
        description: error.response?.data?.message || 'Failed to import breeds',
        variant: 'destructive',
      });
    },
  });
}
