import { axios } from "@/_lib/axios";
import { useMutation } from "@tanstack/react-query";

interface CompleteUploadData {
  uploadId: string;
  fileName: string;
  totalSize: number;
  chunkUrls: string[];
  finalUrl?: string;
  metadata?: string;
}

async function completeUpload(uploadData: CompleteUploadData) {
  const { data } = await axios.post("/uploads/complete", uploadData);
  return data;
}

export const useCompleteUpload = () => {
  return useMutation({
    mutationFn: completeUpload,
  });
}; 