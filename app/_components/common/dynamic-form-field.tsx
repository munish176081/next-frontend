"use client";
import { useState, useRef, useEffect } from 'react';
import { ListingField } from '@/_config/listing-types';
import { useFileUpload } from '@/_services/hooks/upload/use-file-upload';
import { useDeleteUpload } from '@/_services/hooks/upload/use-delete-upload';
import { useBulkDeleteUpload } from '@/_services/hooks/upload/use-bulk-delete-upload';
import LocationField from './location-field';

interface DynamicFormFieldProps {
  field: ListingField;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  layout?: 'single' | 'double';
}

export default function DynamicFormField({ field, value, onChange, error, layout = 'single' }: DynamicFormFieldProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize uploaded URLs from value (for edit mode)
  useEffect(() => {
    if (Array.isArray(value)) {
      setUploadedUrls(value);
    }
  }, [value]);

    const { uploadFile, isUploading } = useFileUpload({
    onSuccess: (result) => {
      const newUrls = [...uploadedUrls, result.finalUrl];
      setUploadedUrls(newUrls);
      onChange(field.name, newUrls);
      
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange(field.name, e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file sizes
    const validFiles = files.filter(file => {
      if (field.fileConfig?.maxSize) {
        return file.size <= field.fileConfig.maxSize * 1024 * 1024; // Convert MB to bytes
      }
      return true;
    });

    // Add new file names to existing ones and mark them as uploading
    const newFileNames = validFiles.map(file => file.name);
    setFileNames(prev => [...prev, ...newFileNames]);
    setUploadingFiles(prev => {
      const newSet = new Set(prev);
      newFileNames.forEach(name => newSet.add(name));
      return newSet;
    });

    // Upload each file
    validFiles.forEach(file => {
      const fileType = field.fileConfig?.accept?.includes('image/*') ? 'image' :
        field.fileConfig?.accept?.includes('video/*') ? 'video' : 'document';
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
        return (
          <div className="relative">
            {/* Main Upload Box */}
            <div className={`border-2 border-black/20 rounded-40 p-4 relative h-[300px] items-center justify-center flex flex-col ${errorClasses} ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                  {field.fileConfig?.minCount && ` - Min ${field.fileConfig.minCount} file(s)`}
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
                  <p className="text-sm font-medium text-gray-700">
                    Uploaded files ({uploadedUrls.length})
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
                            setFileNames([]);
                            setUploadingFiles(new Set());
                            onChange(field.name, []);
                          },
                          onError: (error) => {
                            console.error('Bulk delete failed:', error);
                            // Still clear local state even if backend fails
                            setUploadedUrls([]);
                            setFileNames([]);
                            setUploadingFiles(new Set());
                            onChange(field.name, []);
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
                  {uploadedUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center min-w-0 flex-1">
                        {field.fileConfig?.accept?.includes('image/*') ? (
                          <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg> */}
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {fileNames[index] || `File ${index + 1}`}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 truncate">{url.split('/').pop()?.substring(0, 20)}...</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
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
                            // Delete from backend first
                            deleteUpload(
                              { fileUrl: url },
                              {
                                onSuccess: (data) => {
                                  if (data.success) {
                                    // Then update local state
                                    const newUrls = uploadedUrls.filter((_, i) => i !== index);
                                    setUploadedUrls(newUrls);
                                    onChange(field.name, newUrls);
                                    setFileNames(prev => prev.filter((_, i) => i !== index));
                                  } else {
                                    console.error('Delete failed:', data.message);
                                    // Still remove from local state even if backend delete fails
                                    const newUrls = uploadedUrls.filter((_, i) => i !== index);
                                    setUploadedUrls(newUrls);
                                    onChange(field.name, newUrls);
                                    setFileNames(prev => prev.filter((_, i) => i !== index));
                                  }
                                },
                                onError: (error) => {
                                  console.error('Failed to delete file:', error);
                                  // Still remove from local state even if backend delete fails
                                  const newUrls = uploadedUrls.filter((_, i) => i !== index);
                                  setUploadedUrls(newUrls);
                                  onChange(field.name, newUrls);
                                  setFileNames(prev => prev.filter((_, i) => i !== index));
                                }
                              }
                            );
                          }}
                          disabled={isDeleting}
                          className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove file"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
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