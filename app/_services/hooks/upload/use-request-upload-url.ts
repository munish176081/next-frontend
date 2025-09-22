import { axios } from "@/_lib/axios";
import { useMutation } from "@tanstack/react-query";

interface RequestUploadUrlData {
  fileName: string;
  fileSize: number;
  mimeType: string;
  chunkIndex: number;
  totalChunks: number;
  fileType: 'image' | 'breed-image' | 'breed-type-image' | 'video' | 'document';
  uploadId?: string;
  metadata?: string;
}

async function requestUploadUrl(uploadData: RequestUploadUrlData) {
  const { data } = await axios.post("/uploads/request-url", uploadData);
  return data;
}

export const useRequestUploadUrl = () => {
  return useMutation({
    mutationFn: requestUploadUrl,
  });
}; 