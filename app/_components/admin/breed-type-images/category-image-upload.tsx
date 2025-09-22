"use client";

import { useState } from 'react';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Switch } from '@/_components/ui/switch';
import { FileUploader } from '@/_components/common/file-uploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { Upload, Link, Image as ImageIcon, X } from 'lucide-react';

interface CategoryImageUploadProps {
  category: string;
  onUpload: (imageUrl: string, title?: string, description?: string) => void;
  disabled?: boolean;
}

export function CategoryImageUpload({ category, onUpload, disabled }: CategoryImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [useUpload, setUseUpload] = useState(true);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleUploadChange = (urls: string[]) => {
    setUploadedUrls(urls);
    if (urls.length > 0) {
      setImageUrl(urls[0]);
    }
  };

  const handleSubmit = () => {
    if (imageUrl.trim()) {
      onUpload(
        imageUrl.trim(),
        title.trim() || undefined,
        description.trim() || undefined
      );
      // Reset form
      setImageUrl('');
      setTitle('');
      setDescription('');
      setUploadedUrls([]);
      setUseUpload(false);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setImageUrl('');
    setTitle('');
    setDescription('');
    setUploadedUrls([]);
    setUseUpload(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={disabled}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="w-4 h-4 mr-1" />
          Add Image
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle>Upload Image for {category.charAt(0).toUpperCase() + category.slice(1)} Category</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 w-full max-w-full overflow-hidden">
          {/* Toggle between upload and URL */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Upload Image</span>
              </div>
              <Switch
                checked={useUpload}
                onCheckedChange={setUseUpload}
                disabled={disabled}
              />
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                <span className="text-sm font-medium">Use URL</span>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          {useUpload ? (
            <div className="space-y-4">
              <FileUploader
                label="Upload Category Image"
                description="Click or drag an image here to upload"
                accept="image/*"
                multiple={false}
                value={uploadedUrls}
                onChange={() => {}} // Required by FileUploader
                onUrlsChange={handleUploadChange}
                maxCount={1}
                maxSize={5}
              />
              
              {/* Show uploaded image preview */}
              {uploadedUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="relative inline-block">
                    <img
                      src={uploadedUrls[0]}
                      alt="Category preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* URL Section */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/category-image.jpg"
                  disabled={disabled}
                  className="border-2 border-purple-200 rounded-lg h-12 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors w-full max-w-full"
                  style={{ wordBreak: 'break-all', overflow: 'hidden' }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the URL of the category image.
                </p>
              </div>

              {/* Show URL image preview */}
              {imageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="relative inline-block">
                    <img
                      src={imageUrl}
                      alt="Category preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Title and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (Optional)
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${category.charAt(0).toUpperCase() + category.slice(1)} Category`}
                disabled={disabled}
                className="border border-gray-300 rounded-md h-10 focus:ring-2 focus:ring-blue-500 w-full max-w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Image for ${category} breed category`}
                disabled={disabled}
                className="border border-gray-300 rounded-md h-10 focus:ring-2 focus:ring-blue-500 w-full max-w-full"
              />
            </div>
          </div>

          {/* Current image display */}
          {imageUrl && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Selected Image:</span>
              </div>
              <p className="text-xs text-blue-600 mt-1 truncate">{imageUrl}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || !imageUrl.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
