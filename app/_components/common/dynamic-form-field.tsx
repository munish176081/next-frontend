"use client";
import { useState, useRef, useEffect } from 'react';
import { ListingField } from '@/_config/listing-types';
import { useFileUpload } from '@/_services/hooks/upload/use-file-upload';
import { useDeleteUpload } from '@/_services/hooks/upload/use-delete-upload';
import { useBulkDeleteUpload } from '@/_services/hooks/upload/use-bulk-delete-upload';
import LocationField from './location-field';
import { FileValidator } from '@/_utils/file-validation';
import { toast } from '@/_hooks/use-toast';

interface DynamicFormFieldProps {
  field: ListingField;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  layout?: 'single' | 'double';
  category?: 'mother' | 'father';
  onPendingDeletionsChange?: (fieldName: string, pendingUrls: string[]) => void;
}

export default function DynamicFormField({ field, value, onChange, error, layout = 'single', category, onPendingDeletionsChange }: DynamicFormFieldProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]); // Track files marked for deletion
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to determine file type from URL
  const getFileTypeFromUrl = (url: string): 'image' | 'video' | 'pdf' | 'document' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension || '')) {
      return 'image';
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp', 'ogg', 'm4v'].includes(extension || '')) {
      return 'video';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    return 'document';
  };

  // Helper function to get file icon based on type
  const getFileIcon = (fileType: 'image' | 'video' | 'pdf' | 'document') => {
    switch (fileType) {
      case 'image':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'document':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // Helper function to get background color based on file type
  const getFileTypeBgColor = (fileType: 'image' | 'video' | 'pdf' | 'document') => {
    switch (fileType) {
      case 'image':
        return 'bg-blue-100';
      case 'video':
        return 'bg-red-100';
      case 'pdf':
        return 'bg-red-50';
      case 'document':
        return 'bg-blue-100';
    }
  };

  // Initialize uploaded URLs from value (for edit mode)
  useEffect(() => {
    if (Array.isArray(value)) {
      setUploadedUrls(value);
      setPendingDeletions([]); // Reset pending deletions when value changes
    }
  }, [value]);

  // Helper function to get current active files (excluding pending deletions)
  const getActiveFiles = () => {
    return uploadedUrls.filter(url => !pendingDeletions.includes(url));
  };

  // Helper function to mark file for deletion
  const markForDeletion = (url: string) => {
    setPendingDeletions(prev => [...prev, url]);
    // Update parent form with active files only
    const activeFiles = uploadedUrls.filter(u => u !== url);
    onChange(field.name, activeFiles);
    // Notify parent component about pending deletions
    if (onPendingDeletionsChange) {
      onPendingDeletionsChange(field.name, [...pendingDeletions, url]);
    }
  };

  // Helper function to undo deletion
  const undoDeletion = (url: string) => {
    setPendingDeletions(prev => prev.filter(u => u !== url));
    // Update parent form with all files (including restored one)
    const allFiles = [...uploadedUrls.filter(u => !pendingDeletions.includes(u)), url];
    onChange(field.name, allFiles);
    // Notify parent component about updated pending deletions
    if (onPendingDeletionsChange) {
      onPendingDeletionsChange(field.name, pendingDeletions.filter(u => u !== url));
    }
  };

    const { uploadFile, isUploading } = useFileUpload({
    onSuccess: (result) => {
      console.log('Upload success for:', result.fileName, 'URL:', result.finalUrl);
      
      // Use functional state updates to avoid race conditions
      setUploadedUrls(prevUrls => {
        const newUrls = [...prevUrls, result.finalUrl];
        console.log('Updated URLs:', newUrls);
        
        // Validate count requirements AFTER upload is complete (using active files)
        const activeFiles = newUrls.filter(url => !pendingDeletions.includes(url));
        if (field.fileConfig?.minCount && activeFiles.length < field.fileConfig.minCount) {
          const errorMessage = `At least ${field.fileConfig.minCount} file(s) are required`;
          setFileValidationErrors([errorMessage]);
        } else if (field.fileConfig?.maxCount && activeFiles.length > field.fileConfig.maxCount) {
          const errorMessage = `Maximum ${field.fileConfig.maxCount} file(s) are allowed`;
          setFileValidationErrors([errorMessage]);
        } else {
          // Clear validation errors if count is now valid
          setFileValidationErrors([]);
        }
        
        // Update parent component with active URLs only
        onChange(field.name, activeFiles);
        return newUrls;
      });
      
      // Remove the file from uploading set
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(result.fileName);
        console.log('Removed from uploading:', result.fileName, 'Remaining:', Array.from(newSet));
        return newSet;
      });
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      // Note: We can't easily identify which specific file failed in this callback
      // The error handling is done at the hook level with toast notifications
    }
  });

  const { mutate: deleteUpload, isPending: isDeleting } = useDeleteUpload();
  const { mutate: bulkDeleteUpload, isPending: isBulkDeleting } = useBulkDeleteUpload();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange(field.name, e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Clear previous validation errors when new files are selected
    setFileValidationErrors([]);

    // Create a custom validation config based on the field's accept types
    let validationConfig = FileValidator.getPresetConfig('document'); // Start with document as base
    
    // Parse the accept string to determine allowed file types
    const acceptTypes = field.fileConfig?.accept?.split(',').map(type => type.trim()) || [];
    const allowedTypes: string[] = [];
    
    acceptTypes.forEach(type => {
      if (type === 'image/*') {
        allowedTypes.push('image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml');
      } else if (type === 'video/*') {
        allowedTypes.push('video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv', 'video/3gp', 'video/ogg', 'video/m4v');
      } else if (type === '.pdf') {
        allowedTypes.push('application/pdf');
      } else if (type.startsWith('.')) {
        // Handle other file extensions
        const extension = type.toLowerCase();
        if (extension === '.doc' || extension === '.docx') {
          allowedTypes.push('application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        } else if (extension === '.xls' || extension === '.xlsx') {
          allowedTypes.push('application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        } else if (extension === '.ppt' || extension === '.pptx') {
          allowedTypes.push('application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        } else if (extension === '.txt') {
          allowedTypes.push('text/plain');
        } else if (extension === '.csv') {
          allowedTypes.push('text/csv');
        } else if (extension === '.rtf') {
          allowedTypes.push('application/rtf');
        }
      } else {
        // Direct MIME type
        allowedTypes.push(type);
      }
    });
    
    // Update validation config with allowed types
    validationConfig.allowedTypes = allowedTypes;
    
    // Override with field-specific config
    if (field.fileConfig?.maxSize) {
      validationConfig.maxSize = field.fileConfig.maxSize;
    }
    if (field.fileConfig?.maxCount) {
      validationConfig.maxCount = field.fileConfig.maxCount;
    }
    
    // Handle minimum count intelligently for mixed file types
    if (field.fileConfig?.minCount) {
      // If the field accepts both images and videos, adjust minCount based on file types
      const acceptsImages = field.fileConfig.accept?.includes('image/*');
      const acceptsVideos = field.fileConfig.accept?.includes('video/*');
      
      if (acceptsImages && acceptsVideos) {
        // For mixed file types, check if we're uploading videos
        const hasVideos = files.some(file => file.type.startsWith('video/'));
        const hasImages = files.some(file => file.type.startsWith('image/'));
        
        if (hasVideos && !hasImages) {
          // If only videos are being uploaded, reduce minCount to 1
          validationConfig.minCount = 1;
        } else if (hasImages && !hasVideos) {
          // If only images are being uploaded, use original minCount
          validationConfig.minCount = field.fileConfig.minCount;
        } else {
          // If both types are being uploaded, use original minCount
          validationConfig.minCount = field.fileConfig.minCount;
        }
      } else {
        // For single file type, use original minCount
        validationConfig.minCount = field.fileConfig.minCount;
      }
    }

    // Only validate file types and sizes immediately, NOT count requirements
    const immediateValidation = FileValidator.validateFiles(files, {
      ...validationConfig,
      minCount: undefined, // Don't validate count immediately
      maxCount: undefined  // Don't validate count immediately
    });
    
    // Check for immediate validation errors (file type, size, etc.)
    const immediateErrors = immediateValidation.errors.filter(error => 
      !error.includes('At least') && 
      !error.includes('file(s) are required') &&
      !error.includes('Maximum')
    );
    
    if (immediateErrors.length > 0) {
      console.error('File validation errors:', immediateErrors);
      setFileValidationErrors(immediateErrors);
      
      immediateErrors.forEach(error => {
        try {
          toast({
            title: "File Upload Error",
            description: error,
            variant: "destructive",
          });
        } catch (toastError) {
          alert(`File Upload Error: ${error}`);
        }
      });
      return;
    }

    // Clear validation errors for immediate issues
    setFileValidationErrors([]);

    // Add new file names to existing ones and mark them as uploading
    const newFileNames = files.map(file => file.name);
    console.log('Processing files:', newFileNames);
    
    setFileNames(prev => {
      const updated = [...prev, ...newFileNames];
      console.log('Updated file names:', updated);
      return updated;
    });
    
    setUploadingFiles(prev => {
      const newSet = new Set(prev);
      newFileNames.forEach(name => newSet.add(name));
      console.log('Added to uploading set:', Array.from(newSet));
      return newSet;
    });

    // Upload each file
    files.forEach((file, index) => {
      console.log(`Uploading file ${index + 1}/${files.length}:`, file.name);
      const fileType = FileValidator.getFileType(file);
      uploadFile({ file, fileType });
    });

    // Clear the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCheckboxChange = (option: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter(v => v !== option)
      : [...currentValues, option];
    onChange(field.name, newValues);
  };

  const renderField = () => {
    const baseClasses = "text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12";
    const errorClasses = error ? "border-red-500" : "";
    const textareaClasses = "text-base max-md:text-xs max-md:p-4 max-md:rounded-2xl placeholder:text-[#4B4A4A8C] font-normal outline-none p-6 w-full h-60 rounded-40 border border-[#B5B5B5]";

    switch (field.type) {
      case 'location':
        return (
          <LocationField
            value={value || ''}
            onChange={(newValue) => onChange(field.name, newValue)}
            placeholder={field.placeholder}
            error={error}
            required={field.required}
            label={field.label}
          />
        );

      case 'text':
      case 'url':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={handleInputChange}
            className={`${baseClasses} ${errorClasses}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={handleInputChange}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`${baseClasses} ${errorClasses}`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={handleInputChange}
            className={`${baseClasses} ${errorClasses}`}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={handleInputChange}
            className={`${baseClasses} ${errorClasses} appearance-none bg-selectArrow2 bg-no-repeat bg-[95%]`}
          >
            {field.options?.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const firstOption = field.options?.[0];
              const firstOptionValue = typeof firstOption === 'string' ? firstOption : firstOption?.value;
              return (
                <option key={index} value={optionValue === firstOptionValue ? '' : optionValue}>
                  {optionLabel}
              </option>
              );
            })}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            value={value || ''}
            onChange={handleInputChange}
            className={`${textareaClasses} ${errorClasses}`}
          />
        );

      case 'file':
        const getCategoryStyles = () => {
          if (category === 'mother') {
            return 'border-pink-300 bg-pink-50';
          } else if (category === 'father') {
            return 'border-blue-300 bg-blue-50';
          }
          return 'border-black/20';
        };

        const getCategoryIcon = () => {
          if (category === 'mother') {
            return '👩‍🦰';
          } else if (category === 'father') {
            return '👨‍🦰';
          }
          return null;
        };

        return (
          <div className="relative">
            {/* Category Badge */}
            <div className={`border-2 rounded-40 p-4 relative h-[300px] items-center justify-center flex flex-col ${getCategoryStyles()} ${errorClasses} ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                ref={fileInputRef}
                type="file"
                multiple={field.fileConfig?.multiple !== false}
                accept={field.fileConfig?.accept}
                onChange={handleFileChange}
                className="absolute top-0 left-0 w-full h-full cursor-pointer opacity-0"
              />
              <img className="w-24" src="/images/vectors/uploadImage.png" alt="" />
              <span className="text-[22px] font-medium text-black text-center flex flex-col">
                {field.label}
                <small className="text-sm font-normal text-[#4B4A4A8C]">
                  {field.fileConfig?.maxSize && `(Max size: ${field.fileConfig.maxSize} MB)`}
                  {field.fileConfig?.minCount && (() => {
                    const acceptsImages = field.fileConfig.accept?.includes('image/*');
                    const acceptsVideos = field.fileConfig.accept?.includes('video/*');
                    
                    if (acceptsImages && acceptsVideos) {
                      return ` - Min ${field.fileConfig.minCount} image(s) or 1 video`;
                    } else {
                      return ` - Min ${field.fileConfig.minCount} file(s)`;
                    }
                  })()}
                </small>
                {isUploading && (
                  <small className="text-sm font-normal text-blue-600 mt-2">
                    Uploading...
                  </small>
                )}
                {field.fileConfig?.minCount && uploadedUrls.length < field.fileConfig.minCount && (
                  <small className="text-sm font-normal text-orange-600 mt-1">
                    {field.fileConfig.minCount - uploadedUrls.length} more file{field.fileConfig.minCount - uploadedUrls.length > 1 ? 's' : ''} needed
                  </small>
                )}
              </span>
            </div>

            {/* Uploaded Files Section - Now outside the main box */}
            {uploadedUrls.length > 0 && (
              <div className="mt-4 w-full border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-700">
                      Uploaded files ({getActiveFiles().length}/{uploadedUrls.length})
                    </p>
                    {pendingDeletions.length > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {pendingDeletions.length} marked for deletion
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Use bulk delete for better performance - only delete active files
                      const activeFiles = getActiveFiles();
                      if (activeFiles.length === 0) {
                        toast({
                          title: "No Files to Delete",
                          description: "All files are already marked for deletion.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      bulkDeleteUpload(
                        { fileUrls: activeFiles },
                        {
                          onSuccess: (data) => {
                            if (data.success) {
                              console.log('All active files marked for deletion successfully:', data.message);
                              // Mark all active files for deletion (soft delete)
                              setPendingDeletions(prev => [...prev, ...activeFiles]);
                              // Notify parent component about pending deletions
                              if (onPendingDeletionsChange) {
                                onPendingDeletionsChange(field.name, [...pendingDeletions, ...activeFiles]);
                              }
                              setFileNames([]);
                              setUploadingFiles(new Set());
                              
                              // Validate count requirements AFTER bulk deletion
                              if (field.fileConfig?.minCount && 0 < field.fileConfig.minCount) {
                                const errorMessage = `At least ${field.fileConfig.minCount} file(s) are required`;
                                setFileValidationErrors([errorMessage]);
                              } else {
                                // Clear validation errors if count is now valid
                                setFileValidationErrors([]);
                              }
                              
                              onChange(field.name, []);
                            } else {
                              console.error('Some files failed to mark for deletion:', data.message);
                              toast({
                                title: "Bulk Delete Failed",
                                description: "Some files could not be marked for deletion. Please try again.",
                                variant: "destructive",
                              });
                            }
                          },
                          onError: (error) => {
                            console.error('Bulk delete failed:', error);
                            // Show error but don't mark for deletion
                            toast({
                              title: "Bulk Delete Failed",
                              description: "Failed to mark files for deletion. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }
                      );
                    }}
                    disabled={isBulkDeleting}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Clear all files"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {isBulkDeleting ? 'Clearing...' : 'Clear All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uploadedUrls.map((url, index) => {
                    const fileType = getFileTypeFromUrl(url);
                    const fileName = fileNames[index] || url.split('/').pop() || `File ${index + 1}`;
                    const isMarkedForDeletion = pendingDeletions.includes(url);
                    
                    return (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isMarkedForDeletion 
                          ? 'bg-red-50 border-red-200 opacity-60' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}>
                        <div className="flex items-center min-w-0 flex-1">
                          <div className={`w-12 h-12 ${getFileTypeBgColor(fileType)} rounded-lg flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden cursor-pointer`} onClick={() => window.open(url, '_blank')}>
                            {fileType === 'image' ? (
                              <img src={url} alt="Preview" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                            ) : fileType === 'video' ? (
                              <div className="relative w-full h-full flex items-center justify-center group cursor-pointer" onClick={() => window.open(url, '_blank')}>
                                <video 
                                  src={url} 
                                  className="w-full h-full object-cover rounded"
                                  onLoadedMetadata={(e) => {
                                    // Optional: Add video duration or other metadata
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all">
                                  <div className="bg-white bg-opacity-90 rounded-full p-2 group-hover:scale-110 transition-transform">
                                  <svg fill="#000000" height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60" xmlSpace="preserve"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M45.563,29.174l-22-15c-0.307-0.208-0.703-0.231-1.031-0.058C22.205,14.289,22,14.629,22,15v30 c0,0.371,0.205,0.711,0.533,0.884C22.679,45.962,22.84,46,23,46c0.197,0,0.394-0.059,0.563-0.174l22-15 C45.836,30.64,46,30.331,46,30S45.836,29.36,45.563,29.174z M24,43.107V16.893L43.225,30L24,43.107z"></path> <path d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30 S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z"></path> </g> </g></svg>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              getFileIcon(fileType)
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <p className={`text-sm font-medium truncate ${
                                isMarkedForDeletion ? 'text-red-600 line-through' : 'text-gray-700'
                              }`}>
                                {fileName}
                              </p>
                              {isMarkedForDeletion && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                  Deleted
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs capitalize ${
                                isMarkedForDeletion ? 'text-red-500' : 'text-gray-500'
                              }`}>
                                {fileType}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className={`text-xs truncate ${
                                isMarkedForDeletion ? 'text-red-500' : 'text-gray-500'
                              }`} title={fileName}>
                                {fileName.length > 20 ? `${fileName.substring(0, 20)}...` : fileName}
                              </span>
                            </div>
                          </div>
                        </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {!isMarkedForDeletion && (
                          <>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                              title="Open in new tab"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                // Mark file for deletion (soft delete)
                                markForDeletion(url);
                              }}
                              disabled={isDeleting}
                              className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mark for deletion"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                        {isMarkedForDeletion && (
                          <button
                            type="button"
                            onClick={() => {
                              // Undo deletion
                              undoDeletion(url);
                            }}
                            className="text-red-600 hover:text-green-600 p-1 rounded-full hover:bg-green-50 transition-colors"
                            title="Undo deletion"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* File Validation Errors */}
            {fileValidationErrors.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 mb-1">File Upload Errors</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {fileValidationErrors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-1">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Uploading Files Section - Also outside the main box */}
            {uploadingFiles.size > 0 && (
              <div className="mt-3 text-sm text-gray-600 w-full">
                <p className="font-medium mb-1">Uploading files:</p>
                <ul className="space-y-1">
                  {Array.from(uploadingFiles).map((name, index) => (
                    <li key={index} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 animate-pulse mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate max-w-xs">{name}</span>
                    </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex justify-start gap-3">
            {field.options?.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
              <label key={index} className="relative overflow-hidden w-full">
                <input
                  type="checkbox"
                    checked={Array.isArray(value) && value.includes(optionValue)}
                    onChange={() => handleCheckboxChange(optionValue)}
                  className="absolute w-full h-full opacity-0 peer cursor-pointer"
                />
                <span className="h-[70px] px-5 gap-1 rounded-full flex items-center border border-black justify-center peer-checked:bg-black peer-checked:text-white">
                    {optionLabel}
                </span>
              </label>
              );
            })}
          </div>
        );

      case 'radio':
        return (
          <div className="flex justify-start gap-3">
            {field.options?.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
              <label key={index} className="relative overflow-hidden w-full">
                <input
                  type="radio"
                  name={field.name}
                    value={optionValue}
                    checked={value === optionValue}
                  onChange={handleInputChange}
                  className="absolute w-full h-full opacity-0 peer cursor-pointer"
                />
                <span className="h-[70px] px-5 gap-1 rounded-full flex items-center border border-black justify-center peer-checked:bg-black peer-checked:text-white">
                    {optionLabel}
                </span>
              </label>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  const containerClasses = layout === 'double' ? 'flex flex-col w-full' : 'flex flex-col w-full';

  return (
    <div className={containerClasses}>
      <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && (
        <span className="text-red-500 text-sm mt-1">{error}</span>
      )}
    </div>
  );
} 