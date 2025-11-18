"use client";

import { useState, useEffect } from 'react';
import { UploadCloud, X, Check } from 'lucide-react';
import { useFileUpload } from '@/_services/hooks/upload/use-file-upload';
import { useDeleteUpload } from '@/_services/hooks/upload/use-delete-upload';
import { useBulkDeleteUpload } from '@/_services/hooks/upload/use-bulk-delete-upload';
import { Button } from '@/_components/ui/button';
import { Checkbox } from '@/_components/ui/checkbox';

interface EnhancedImageUploadProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  error?: string;
  minCount?: number;
  maxCount?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
}

export function EnhancedImageUpload({
  label,
  value = [],
  onChange,
  error,
  minCount = 3,
  maxCount = 10,
  maxSize = 30,
  accept = 'image/*',
  className = '',
}: EnhancedImageUploadProps) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(value);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Initialize uploaded URLs from value
  useEffect(() => {
    setUploadedUrls(value);
  }, [value]);

  const { uploadFile, isUploading } = useFileUpload({
    onSuccess: (result) => {
      const newUrls = [...uploadedUrls, result.finalUrl];
      setUploadedUrls(newUrls);
      onChange(newUrls);
      
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

    // Check file count limit
    if (uploadedUrls.length + files.length > maxCount) {
      alert(`Maximum ${maxCount} files allowed`);
      return;
    }

    // Check file size
    Array.from(files).forEach(file => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB`);
        return;
      }
    });
    
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
      const fileType = accept.includes('image/*') ? 'image' : 
                      accept.includes('video/*') ? 'video' : 'document';
      uploadFile({ file, fileType });
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedFiles(new Set(uploadedUrls));
    } else {
      setSelectedFiles(new Set());
    }
  };

  const handleSelectFile = (url: string, checked: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (checked) {
      newSelected.add(url);
    } else {
      newSelected.delete(url);
    }
    setSelectedFiles(newSelected);
    setSelectAll(newSelected.size === uploadedUrls.length);
  };

  const handleBulkDelete = () => {
    const urlsToDelete = Array.from(selectedFiles);
    if (urlsToDelete.length === 0) return;

    bulkDeleteUpload(
      { fileUrls: urlsToDelete },
      {
        onSuccess: (data) => {
          if (data.success) {
            console.log('Selected files deleted successfully:', data.message);
          } else {
            console.error('Some files failed to delete:', data.message);
          }
          // Remove deleted files from local state
          const newUrls = uploadedUrls.filter(url => !urlsToDelete.includes(url));
          setUploadedUrls(newUrls);
          onChange(newUrls);
          setSelectedFiles(new Set());
          setSelectAll(false);
        },
        onError: (error) => {
          console.error('Bulk delete failed:', error);
        }
      }
    );
  };

  const handleDeleteSingle = (url: string) => {
    deleteUpload(
      { fileUrl: url },
      {
        onSuccess: (data) => {
          if (data.success) {
            const newUrls = uploadedUrls.filter(u => u !== url);
            setUploadedUrls(newUrls);
            onChange(newUrls);
            setSelectedFiles(prev => {
              const newSet = new Set(prev);
              newSet.delete(url);
              return newSet;
            });
          } else {
            console.error('Delete failed:', data.message);
          }
        },
        onError: (error) => {
          console.error('Failed to delete file:', error);
        }
      }
    );
  };

  const isValidationError = uploadedUrls.length < minCount;
  const validationMessage = uploadedUrls.length < minCount 
    ? `Minimum ${minCount} image${minCount > 1 ? 's' : ''} required`
    : '';

  return (
    <div className={`block mb-4 ${className}`}>
      {label && (
        <span className="block text-base font-bold leading-7 mb-2">
          {label}
        </span>
      )}

      <label className="cursor-pointer">
        <div className={`border rounded-md flex flex-col items-center justify-center h-60 ${
          isUploading ? 'opacity-50 pointer-events-none' : ''
        } ${error || isValidationError ? 'border-red-500' : 'border-gray-300'}`}>
          <UploadCloud size={40} />
          <span className="mt-4 text-xl md:text-2xl font-medium">
            Click or drag images here to upload
          </span>
          {isUploading && (
            <span className="mt-2 text-sm text-blue-600">
              Uploading...
            </span>
          )}
          <div className="mt-2 text-sm text-gray-600 text-center">
            <div>Minimum {minCount} image{minCount > 1 ? 's' : ''} required</div>
            <div>Maximum {maxCount} image{maxCount > 1 ? 's' : ''} allowed</div>
            <div>Max size: {maxSize}MB per image</div>
          </div>

          <input
            className="hidden"
            type="file"
            accept={accept}
            multiple
            onChange={handleFileChange}
          />
        </div>
      </label>
      
      {/* Error message */}
      {(error || isValidationError) && (
        <div className="mt-2 text-sm text-red-600">
          {error || validationMessage}
        </div>
      )}
      
      {/* Show uploaded files list with checkboxes */}
      {uploadedUrls.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                disabled={isBulkDeleting}
              />
              <p className="text-sm font-medium text-gray-700">
                Select All ({uploadedUrls.length} images)
              </p>
            </div>
            {selectedFiles.size > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="text-xs"
              >
                {isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedFiles.size})`}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  
                  {/* Checkbox overlay */}
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedFiles.has(url)}
                      onCheckedChange={(checked) => handleSelectFile(url, checked as boolean)}
                      disabled={isDeleting}
                    />
                  </div>
                  
                  {/* Delete button overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSingle(url)}
                      disabled={isDeleting}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedFiles.has(url) && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Check className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                </div>
                
                <div className="mt-1 text-xs text-gray-600 truncate">
                  {fileNames[index] || `Image ${index + 1}`}
                </div>
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
}
