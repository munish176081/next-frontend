import { axios } from "@/_lib/axios";

export interface UploadProgress {
  chunkIndex: number;
  totalChunks: number;
  progress: number;
  fileName: string;
}

export interface UploadResult {
  uploadId: string;
  finalUrl: string;
  fileName: string;
  totalSize: number;
}

export interface ChunkedUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  chunkSize?: number;
  maxRetries?: number;
}

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const DEFAULT_MAX_RETRIES = 3;

export class ChunkedUploader {
  private chunkSize: number;
  private maxRetries: number;
  private onProgress?: (progress: UploadProgress) => void;

  constructor(options: ChunkedUploadOptions = {}) {
    this.chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
    this.maxRetries = options.maxRetries || DEFAULT_MAX_RETRIES;
    this.onProgress = options.onProgress;
  }

  async uploadFile(
    file: File,
    fileType: 'image' | 'video' | 'document'
  ): Promise<UploadResult> {
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    const chunkUrls: string[] = [];
    let uploadId: string | undefined;

    // Request initial upload URL
    const initialResponse = await this.requestUploadUrl(file, 0, totalChunks, fileType);
    uploadId = initialResponse.uploadId;

    // Upload all chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);

      const uploadUrl = await this.requestChunkUploadUrl(
        file,
        chunkIndex,
        totalChunks,
        fileType,
        uploadId
      );

      const chunkUrl = await this.uploadChunk(uploadUrl, chunk, file.type);
      chunkUrls.push(chunkUrl);

      // Report progress
      if (this.onProgress) {
        this.onProgress({
          chunkIndex: chunkIndex + 1,
          totalChunks,
          progress: ((chunkIndex + 1) / totalChunks) * 100,
          fileName: file.name,
        });
      }
    }

    // Complete the upload
    const finalResult = await this.completeUpload(
      uploadId!,
      file.name,
      file.size,
      chunkUrls
    );

    return {
      uploadId: uploadId!,
      finalUrl: finalResult.finalUrl,
      fileName: file.name,
      totalSize: file.size,
    };
  }

  private async requestUploadUrl(
    file: File,
    chunkIndex: number,
    totalChunks: number,
    fileType: 'image' | 'video' | 'document'
  ) {
    const response = await axios.post('/uploads/request-url', {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      chunkIndex,
      totalChunks,
      fileType,
    });

    return response.data;
  }

  private async requestChunkUploadUrl(
    file: File,
    chunkIndex: number,
    totalChunks: number,
    fileType: 'image' | 'video' | 'document',
    uploadId?: string
  ) {
    const response = await axios.post('/uploads/request-url', {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      chunkIndex,
      totalChunks,
      fileType,
      uploadId,
    });
    console.log(response.data.uploadUrl);
    return response.data.uploadUrl;
  }

  private async uploadChunk(
    uploadUrl: string,
    chunk: Blob,
    mimeType: string,
    retryCount = 0
  ): Promise<string> {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: chunk,
        headers: {
          'Content-Type': mimeType,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return uploadUrl;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(`Retrying chunk upload (${retryCount + 1}/${this.maxRetries})`);
        return this.uploadChunk(uploadUrl, chunk, mimeType, retryCount + 1);
      }
      throw error;
    }
  }

  private async completeUpload(
    uploadId: string,
    fileName: string,
    totalSize: number,
    chunkUrls: string[]
  ) {
    const response = await axios.post('/uploads/complete', {
      uploadId,
      fileName,
      totalSize,
      chunkUrls,
    });

    return response.data;
  }
}

// Utility function for simple file upload
export const uploadFile = async (
  file: File,
  fileType: 'image' | 'video' | 'document',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  const uploader = new ChunkedUploader({ onProgress });
  return uploader.uploadFile(file, fileType);
}; 