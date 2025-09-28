import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadFile, UploadProgress, UploadResult } from '@/_services/upload/upload-utils';
import { toast } from '@/_hooks/use-toast';

interface UseSimpleUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

export const useSimpleUpload = (options: UseSimpleUploadOptions = {}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const handleProgress = (progress: UploadProgress) => {
    setUploadProgress(progress);
    options.onProgress?.(progress);
  };

  const mutation = useMutation({
    mutationFn: async ({ file, fileType }: { file: File; fileType: 'image' | 'breed-image' | 'breed-type-image' | 'video' | 'document' }) => {
      // Add timeout to prevent hanging
      const uploadPromise = uploadFile(file, fileType, handleProgress);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000);
      });
      
      return Promise.race([uploadPromise, timeoutPromise]);
    },
    onSuccess: (result) => {
      setUploadProgress(null);
      toast({
        title: 'Upload Successful',
        description: `${result.fileName} uploaded successfully!`,
      });
      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      setUploadProgress(null);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
      options.onError?.(error);
    },
  });

  return {
    uploadFile: mutation.mutate,
    isUploading: mutation.isPending,
    progress: uploadProgress,
    error: mutation.error,
    reset: mutation.reset,
  };
};
