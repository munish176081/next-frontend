"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import Image from 'next/image';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  files: string[];
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  files,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [imageSrcs, setImageSrcs] = useState<Record<string, string>>({});

  const getFileType = (url: string): 'image' | 'pdf' => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) {
      return 'image';
    }
    return 'pdf';
  };

  const getFileName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || 'file';
      return decodeURIComponent(fileName);
    } catch {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'file';
    }
  };

  const getShortFileName = (fileName: string, maxLength: number = 40): string => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 3);
    return `${truncated}...${extension}`;
  };

  const getProxyUrl = (url: string): string => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : '';
    return `${baseUrl}/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  const handleImageError = (fileUrl: string) => {
    // If image fails to load, try proxy URL
    if (!failedImages.has(fileUrl)) {
      setFailedImages(prev => new Set(prev).add(fileUrl));
      const proxyUrl = getProxyUrl(fileUrl);
      setImageSrcs(prev => ({ ...prev, [fileUrl]: proxyUrl }));
    }
  };

  const getImageSrc = (fileUrl: string): string => {
    // If image failed before, use proxy URL
    if (failedImages.has(fileUrl) || imageSrcs[fileUrl]) {
      return imageSrcs[fileUrl] || getProxyUrl(fileUrl);
    }
    // Otherwise, use original URL (Next.js Image will use custom loader)
    return fileUrl;
  };

  const handleView = (fileUrl: string) => {
    const fileType = getFileType(fileUrl);
    setPreviewType(fileType);
    setPreviewUrl(fileUrl);
  };

  const handleDownload = (fileUrl: string) => {
    const fileName = getFileName(fileUrl);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-40 max-md:rounded-[20px]">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/10">
            <DialogTitle className="text-2xl font-medium text-left">{title}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-3">
              {files.map((fileUrl, index) => {
                const fileType = getFileType(fileUrl);
                const fileName = getFileName(fileUrl);
                const shortFileName = getShortFileName(fileName);
                const isImage = fileType === 'image';
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border border-black/20 rounded-2xl hover:border-black/40 hover:bg-gray-50/50 transition-all group"
                  >
                    <div className="flex-shrink-0">
                      {isImage ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-black/10 bg-gray-100 relative">
                          {failedImages.has(fileUrl) ? (
                            // Fallback to regular img tag if Next.js Image fails
                            <img
                              src={getImageSrc(fileUrl)}
                              alt={fileName}
                              className="w-full h-full object-cover"
                              onError={() => {
                                // If proxy also fails, show placeholder
                                setImageSrcs(prev => ({ ...prev, [fileUrl]: '/images/vectors/detailSlide1.png' }));
                              }}
                            />
                          ) : (
                            <Image
                              src={fileUrl}
                              alt={fileName}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(fileUrl)}
                              unoptimized={fileUrl.includes('cdn.pups4sale.com.au')}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-red-50 border border-red-100">
                          <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-gray-900 truncate" title={fileName}>
                        {shortFileName}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {fileType === 'image' ? 'Image File' : 'PDF Document'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleView(fileUrl)}
                        className="p-2.5 rounded-full hover:bg-gray-200 transition-colors border border-black/10 hover:border-black/20"
                        title="View file"
                      >
                        <svg
                          className="w-5 h-5 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDownload(fileUrl)}
                        className="p-2.5 rounded-full hover:bg-gray-200 transition-colors border border-black/10 hover:border-black/20"
                        title="Download file"
                      >
                        <svg
                          className="w-5 h-5 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {previewUrl && (
        <Dialog open={!!previewUrl} onOpenChange={closePreview}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 rounded-40 max-md:rounded-[20px]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/10">
              <DialogTitle className="text-xl font-medium text-left truncate pr-8">
                {getFileName(previewUrl)}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto p-6">
              {previewType === 'image' && previewUrl ? (
                <div className="relative w-full flex justify-center bg-gray-50 rounded-2xl p-4">
                  {failedImages.has(previewUrl) ? (
                    <img
                      src={getImageSrc(previewUrl)}
                      alt={getFileName(previewUrl)}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      onError={() => {
                        setImageSrcs(prev => ({ ...prev, [previewUrl]: '/images/vectors/detailSlide1.png' }));
                      }}
                    />
                  ) : (
                    <Image
                      src={previewUrl}
                      alt={getFileName(previewUrl)}
                      width={1200}
                      height={800}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      onError={() => handleImageError(previewUrl)}
                      unoptimized={previewUrl.includes('cdn.pups4sale.com.au')}
                    />
                  )}
                </div>
              ) : previewType === 'pdf' && previewUrl ? (
                <div className="w-full h-[75vh] rounded-2xl overflow-hidden border border-black/10 bg-gray-50">
                  <iframe
                    src={previewUrl.includes('cdn.pups4sale.com.au') ? getProxyUrl(previewUrl) : previewUrl}
                    className="w-full h-full"
                    title={getFileName(previewUrl)}
                  />
                </div>
              ) : null}
            </div>
            
            <div className="px-6 pb-6 pt-4 border-t border-black/10 flex justify-end">
              <button
                onClick={() => handleDownload(previewUrl)}
                className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
