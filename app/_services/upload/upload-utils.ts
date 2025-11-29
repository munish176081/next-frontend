import { axios } from "@/_lib/axios";
import { AxiosError } from "axios";

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
const DEFAULT_MAX_RETRIES = 5; // Increased retries for large files
const CHUNK_UPLOAD_TIMEOUT = 60000; // 60 seconds timeout per chunk
const DELAY_BETWEEN_CHUNKS = 100; // Small delay between chunks to avoid overwhelming server

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
    fileType: 'image' | 'breed-image' | 'breed-type-image' | 'video' | 'document'
  ): Promise<UploadResult> {
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    const chunkUrls: string[] = [];
    let uploadId: string | undefined;

    // Request initial upload URL
    const initialResponse = await this.requestUploadUrl(file, 0, totalChunks, fileType);
    uploadId = initialResponse.uploadId;

    // Upload all chunks with proper error handling
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);

      try {
        const uploadUrl = await this.requestChunkUploadUrl(
          file,
          chunkIndex,
          totalChunks,
          fileType,
          uploadId
        );

        // Upload chunk with timeout and retry logic
        const chunkUrl = await this.uploadChunkWithVerification(
          uploadUrl, 
          chunk, 
          file.type,
          chunkIndex,
          totalChunks
        );
        
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

        // Small delay between chunks to avoid overwhelming the server
        if (chunkIndex < totalChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHUNKS));
        }
      } catch (error) {
        console.error(`Failed to upload chunk ${chunkIndex + 1}/${totalChunks} for ${file.name}:`, error);
        throw new Error(
          `Failed to upload chunk ${chunkIndex + 1} of ${totalChunks} for ${file.name}. ` +
          `${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Complete the upload
    const finalResult = await this.completeUpload(
      uploadId!,
      file.name,
      file.size,
      chunkUrls
    );
    console.log(finalResult);

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
    fileType: 'image' | 'breed-image' | 'breed-type-image' | 'video' | 'document'
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
    fileType: 'image' | 'breed-image' | 'breed-type-image' | 'video' | 'document',
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

  /**
   * Upload a chunk with timeout, retry logic, and verification
   */
  private async uploadChunkWithVerification(
    uploadUrl: string,
    chunk: Blob,
    mimeType: string,
    chunkIndex: number,
    totalChunks: number,
    retryCount = 0
  ): Promise<string> {
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CHUNK_UPLOAD_TIMEOUT);

      try {
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: chunk,
          headers: {
            'Content-Type': mimeType,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Chunk upload failed: ${response.status} ${response.statusText}. ` +
            `Chunk ${chunkIndex + 1}/${totalChunks}`
          );
        }

        // Verify the chunk was uploaded correctly by checking response
        // Some storage services return 200/204 on success
        if (response.status !== 200 && response.status !== 204) {
          throw new Error(
            `Unexpected response status ${response.status} for chunk ${chunkIndex + 1}/${totalChunks}`
          );
        }

        return uploadUrl;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error(
            `Chunk upload timeout after ${CHUNK_UPLOAD_TIMEOUT}ms. ` +
            `Chunk ${chunkIndex + 1}/${totalChunks} may be too large or network is slow.`
          );
        }
        throw fetchError;
      }
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
        console.warn(
          `Retrying chunk ${chunkIndex + 1}/${totalChunks} upload ` +
          `(${retryCount + 1}/${this.maxRetries}) after ${delay}ms delay...`,
          error
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.uploadChunkWithVerification(
          uploadUrl, 
          chunk, 
          mimeType, 
          chunkIndex, 
          totalChunks, 
          retryCount + 1
        );
      }
      
      // Final failure
      throw new Error(
        `Failed to upload chunk ${chunkIndex + 1}/${totalChunks} after ${this.maxRetries} retries. ` +
        `${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Legacy method - kept for compatibility but uses new method internally
   */
  private async uploadChunk(
    uploadUrl: string,
    chunk: Blob,
    mimeType: string,
    retryCount = 0
  ): Promise<string> {
    return this.uploadChunkWithVerification(uploadUrl, chunk, mimeType, 0, 1, retryCount);
  }

  private async completeUpload(
    uploadId: string,
    fileName: string,
    totalSize: number,
    chunkUrls: string[]
  ) {
    // Verify we have the expected number of chunks
    const expectedChunks = Math.ceil(totalSize / this.chunkSize);
    if (chunkUrls.length !== expectedChunks) {
      throw new Error(
        `Chunk count mismatch: expected ${expectedChunks} chunks, got ${chunkUrls.length}. ` +
        `File may be incomplete.`
      );
    }

    try {
      const response = await axios.post('/uploads/complete', {
        uploadId,
        fileName,
        totalSize,
        chunkUrls,
      }, {
        timeout: 120000, // 2 minute timeout for large file completion
      });

      const result = response.data;

      // Verify the final URL is valid
      if (!result.finalUrl) {
        throw new Error('Backend did not return a final URL after upload completion');
      }

      return result;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          throw new Error(
            `Upload completion timed out. The file may still be processing. ` +
            `Please check the upload status.`
          );
        }
        const errorMessage = (error.response?.data as any)?.message || error.message;
        throw new Error(
          `Failed to complete upload: ${errorMessage}`
        );
      }
      throw new Error(
        `Failed to complete upload: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Utility function for simple file upload
export const uploadFile = async (
  file: File,
  fileType: 'image' | 'breed-image' | 'breed-type-image' | 'video' | 'document',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  const uploader = new ChunkedUploader({ onProgress });
  return uploader.uploadFile(file, fileType);
}; 