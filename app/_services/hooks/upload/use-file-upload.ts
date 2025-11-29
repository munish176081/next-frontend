import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadFile, UploadProgress, UploadResult } from '@/_services/upload/upload-utils';
import { toast } from '@/_hooks/use-toast';

interface UseFileUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper with exponential backoff
const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = DEFAULT_MAX_RETRIES,
  retryDelay: number = DEFAULT_RETRY_DELAY
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Calculate exponential backoff delay: 1s, 2s, 4s, etc.
      const delayMs = retryDelay * Math.pow(2, attempt);
      console.warn(`Upload attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`, lastError.message);
      
      await delay(delayMs);
    }
  }
  
  throw lastError!;
};

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY;

  const handleProgress = (progress: UploadProgress) => {
    setUploadProgress(progress);
    options.onProgress?.(progress);
  };

  const mutation = useMutation({
    mutationFn: async ({ file, fileType }: { file: File; fileType: 'image' | 'breed-image' | 'breed-type-image' | 'video' | 'document' }) => {
      // Wrap upload in retry logic with exponential backoff
      return retryWithBackoff(
        () => uploadFile(file, fileType, handleProgress),
        maxRetries,
        retryDelay
      );
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
        description: error.message || 'Failed to upload file after retries',
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