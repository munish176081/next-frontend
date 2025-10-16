"use client";

import { useState, useRef } from "react";
import { useSimpleUpload } from "@/_services/hooks/upload/use-simple-upload";
import { Button } from "@/_components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { toast } from "@/_hooks/use-toast";

interface ProfileImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function ProfileImageUpload({ 
  value, 
  onChange, 
  disabled = false, 
  error ,
  className = '',
}: ProfileImageUploadProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading } = useSimpleUpload({
    onSuccess: (result) => {
      onChange(result.finalUrl);
      toast({
        title: "Success",
        description: "Profile image uploaded successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    uploadFile({ file, fileType: 'image' });
  };

  const handleRemoveImage = () => {
    onChange("");
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 `}>
      <div
        className={`relative group cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <div className="relative">
          <img
            src={value || "/images/placeholder.jpeg"}
            alt="Profile"
            className={`${className} rounded-lg object-cover border-4 border-gray-200 hover:border-gray-300 transition-colors`}
          />
          
          {/* Overlay on hover */}
          {isHovered && !disabled && !isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Remove button */}
          {value && !disabled && !isUploading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {value ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG, GIF up to 5MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
