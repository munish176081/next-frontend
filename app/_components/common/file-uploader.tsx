import { UploadCloud } from "lucide-react";
import { Text } from "@/_components/ui/typegraphy";
import { useFileUpload } from "@/_services/hooks/upload/use-file-upload";
import { useDeleteUpload } from "@/_services/hooks/upload/use-delete-upload";
import { useBulkDeleteUpload } from "@/_services/hooks/upload/use-bulk-delete-upload";
import { useState, useEffect } from "react";

interface FileUploaderProps {
  label?: string;
  description?: string;
  onChange: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  value?: string[]; // Array of uploaded URLs
  onUrlsChange?: (urls: string[]) => void; // Callback for URL changes
  minCount?: number; // Minimum required files
  maxCount?: number; // Maximum allowed files
  maxSize?: number; // Maximum file size in MB
  error?: string; // Validation error message
}

export const FileUploader = ({
  label,
  description,
  onChange,
  accept,
  multiple = false,
  value = [],
  onUrlsChange,
  minCount,
  maxCount,
  maxSize,
  error,
}: FileUploaderProps) => {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(value);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  
  // Initialize uploaded URLs from value
  useEffect(() => {
    setUploadedUrls(value);
  }, [value]);
  
  const { uploadFile, isUploading } = useFileUpload({
    onSuccess: (result) => {
      const newUrls = [...uploadedUrls, result.finalUrl];
      setUploadedUrls(newUrls);
      onUrlsChange?.(newUrls);
      
      // Remove the file from uploading set
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(result.fileName);
        return newSet;
      });
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    }
  });

  const { mutate: deleteUpload, isPending: isDeleting } = useDeleteUpload();
  const { mutate: bulkDeleteUpload, isPending: isBulkDeleting } = useBulkDeleteUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Call the original onChange for backward compatibility
    onChange(files);
    
    // Add files to uploading set
    const newFileNames = Array.from(files).map(file => file.name);
    setFileNames(prev => [...prev, ...newFileNames]);
    setUploadingFiles(prev => {
      const newSet = new Set(prev);
      newFileNames.forEach(name => newSet.add(name));
      return newSet;
    });
    
    // Upload files and get URLs
    Array.from(files).forEach(file => {
      const fileType = accept?.includes('image/*') ? 'image' : 
                      accept?.includes('video/*') ? 'video' : 'document';
      uploadFile({ file, fileType });
    });
  };

  return (
    <div className="block mb-4">
      {label && (
        <span className="block text-base font-bold leading-7 mb-2">
          {label}
        </span>
      )}

      <label className="cursor-pointer">
        <div className={`border rounded-md flex flex-col items-center justify-center h-60 ${isUploading ? 'opacity-50 pointer-events-none' : ''} ${error ? 'border-red-500' : ''}`}>
          <UploadCloud size={40} />
          <Text className="mt-4 text-xl md:text-2xl font-medium">
            {description || "Click or drag images here to upload"}
          </Text>
          {isUploading && (
            <Text className="mt-2 text-sm text-blue-600">
              Uploading...
            </Text>
          )}
          {minCount && (
            <Text className="mt-2 text-sm text-gray-600">
              Minimum {minCount} file{minCount > 1 ? 's' : ''} required
            </Text>
          )}
          {maxSize && (
            <Text className="mt-1 text-sm text-gray-600">
              Max size: {maxSize}MB
            </Text>
          )}

          <input
            className="hidden"
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
          />
        </div>
      </label>
      
      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {/* Show uploaded files list */}
      {uploadedUrls.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">
              Uploaded files ({uploadedUrls.length}):
            </p>
            <button
              type="button"
              onClick={() => {
                // Use bulk delete for better performance
                bulkDeleteUpload(
                  { fileUrls: uploadedUrls },
                  {
                    onSuccess: (data) => {
                      if (data.success) {
                        console.log('All files deleted successfully:', data.message);
                      } else {
                        console.error('Some files failed to delete:', data.message);
                      }
                      // Clear local state regardless of backend result
                      setUploadedUrls([]);
                      onUrlsChange?.([]);
                      setFileNames([]);
                      setUploadingFiles(new Set());
                    },
                    onError: (error) => {
                      console.error('Bulk delete failed:', error);
                      // Still clear local state even if backend fails
                      setUploadedUrls([]);
                      onUrlsChange?.([]);
                      setFileNames([]);
                      setUploadingFiles(new Set());
                    }
                  }
                );
              }}
              disabled={isBulkDeleting}
              className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear all files"
            >
              {isBulkDeleting ? 'Clearing...' : 'Clear All'}
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">
                    {fileNames[index] || `File ${index + 1}`}
                  </p>
                  {accept?.includes('image/*') && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View in new tab
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Delete from backend first
                    deleteUpload(
                      { fileUrl: url },
                      {
                        onSuccess: (data) => {
                          if (data.success) {
                            // Then update local state
                            const newUrls = uploadedUrls.filter((_, i) => i !== index);
                            setUploadedUrls(newUrls);
                            onUrlsChange?.(newUrls);
                            setFileNames(prev => prev.filter((_, i) => i !== index));
                          } else {
                            console.error('Delete failed:', data.message);
                            // Still remove from local state even if backend delete fails
                            const newUrls = uploadedUrls.filter((_, i) => i !== index);
                            setUploadedUrls(newUrls);
                            onUrlsChange?.(newUrls);
                            setFileNames(prev => prev.filter((_, i) => i !== index));
                          }
                        },
                        onError: (error) => {
                          console.error('Failed to delete file:', error);
                          // Still remove from local state even if backend delete fails
                          const newUrls = uploadedUrls.filter((_, i) => i !== index);
                          setUploadedUrls(newUrls);
                          onUrlsChange?.(newUrls);
                          setFileNames(prev => prev.filter((_, i) => i !== index));
                        }
                      }
                    );
                  }}
                  disabled={isDeleting}
                  className="ml-2 text-red-500 hover:text-red-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Show selected file names that are still uploading */}
      {uploadingFiles.size > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <p>Selected files (uploading...):</p>
          <ul className="list-disc list-inside">
            {Array.from(uploadingFiles).map((name, index) => (
              <li key={index} className="text-blue-600">{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
