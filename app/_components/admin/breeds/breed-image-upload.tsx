"use client";

import { useState } from 'react';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Switch } from '@/_components/ui/switch';
import { FileUploader } from '@/_components/common/file-uploader';
import { Upload, Link, Image as ImageIcon } from 'lucide-react';

interface BreedImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function BreedImageUpload({ value, onChange, disabled, error }: BreedImageUploadProps) {
  const [useUpload, setUseUpload] = useState(!value || value === ''); // Default to upload mode if no existing image
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleUploadChange = (urls: string[]) => {
    setUploadedUrls(urls);
    if (urls.length > 0) {
      setUseUpload(true); // Switch to upload mode when image is uploaded
      onChange(urls[0]); // Use the first uploaded image
    }
  };

  const handleFileChange = (files: FileList) => {
    // This is required by FileUploader but we handle the actual upload in handleUploadChange
    // The FileUploader will call this and then handleUploadChange when upload completes
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleToggle = (checked: boolean) => {
    setUseUpload(checked);
    if (checked && uploadedUrls.length > 0) {
      onChange(uploadedUrls[0]);
    } else if (!checked) {
      onChange(value || '');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toggle between upload and URL */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              useUpload ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500'
            }`}>
              <div className={`p-1.5 rounded-md ${useUpload ? 'bg-blue-200' : 'bg-gray-200'}`}>
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">Upload Image</span>
            </div>
            
            <Switch
              checked={useUpload}
              onCheckedChange={handleToggle}
              disabled={disabled}
              className="data-[state=checked]:bg-blue-600"
            />
            
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              !useUpload ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500'
            }`}>
              <div className={`p-1.5 rounded-md ${!useUpload ? 'bg-blue-200' : 'bg-gray-200'}`}>
                <Link className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">Use URL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {useUpload ? (
        <div className="space-y-4">
          <FileUploader
            label="Upload Breed Image"
            description="Click or drag an image here to upload"
            accept="image/*"
            multiple={false}
            value={uploadedUrls}
            onChange={handleFileChange}
            onUrlsChange={handleUploadChange}
            maxCount={1}
            maxSize={5}
            error={error}
            fileType="breed-image"
          />
          
          {/* Show uploaded image preview */}
          {uploadedUrls.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <img
                src={uploadedUrls[0]}
                alt="Breed preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      ) : (
        /* URL Section */
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Link className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-purple-900">Image URL</span>
            </div>
            <Input
              value={value || ''}
              onChange={handleUrlChange}
              placeholder="https://example.com/breed-image.jpg"
              disabled={disabled}
              className={`border-2 border-purple-200 rounded-lg h-12 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors ${
                error ? 'border-red-500 focus:ring-red-500' : ''
              }`}
            />
            <p className="text-sm text-purple-600 mt-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              Enter the URL of the breed image. This will be displayed on the homepage.
            </p>
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Show URL image preview */}
          {value && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <img
                src={value}
                alt="Breed preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

    </div>
  );
}
