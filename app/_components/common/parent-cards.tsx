"use client";

import { ParentInfo } from "@/_types/listing";

interface ParentCardsProps {
  motherInfo?: ParentInfo;
  fatherInfo?: ParentInfo;
  motherImages?: string[];
  fatherImages?: string[];
  motherVideos?: string[];
  fatherVideos?: string[];
}

export default function ParentCards({
  motherInfo,
  fatherInfo,
  motherImages = [],
  fatherImages = [],
  motherVideos = [],
  fatherVideos = []
}: ParentCardsProps) {
  const hasMotherInfo = motherInfo && Object.values(motherInfo).some(v => v);
  const hasFatherInfo = fatherInfo && Object.values(fatherInfo).some(v => v);

  if (!hasMotherInfo && !hasFatherInfo) {
    return null;
  }

  const renderParentCard = (
    parentType: 'mother' | 'father',
    info?: ParentInfo,
    images: string[] = [],
    videos: string[] = []
  ) => {
    if (!info || !Object.values(info).some(v => v)) {
      return null;
    }

    const isMother = parentType === 'mother';
    const icon = !isMother ? (<svg
      className="w-6 h-6 text-blue-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d="M12 15c3 0 5-2 5-5v-2h-2v2c0 2-1 3-3 3s-3-1-3-3v-2H7v2c0 3 2 5 5 5z" />
      <path d="M12 15v4m-2 0h4" />
      <circle cx="12" cy="8" r="3" />
    </svg>) : (<svg
      className="w-6 h-6 text-pink-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d="M12 15c3 0 5-2 5-5v-2h-2v2c0 2-1 3-3 3s-3-1-3-3v-2H7v2c0 3 2 5 5 5z" />
      <circle cx="12" cy="8" r="3" />
      <circle cx="12" cy="18" r="1.5" />
    </svg>);
    const bgColor = isMother ? 'bg-pink-50 border-pink-200' : 'bg-blue-50 border-blue-200';
    const textColor = isMother ? 'text-pink-800' : 'text-blue-800';
    const accentColor = isMother ? 'text-pink-600' : 'text-blue-600';

    return (
      <div className={`flex-1 p-4 rounded-lg border ${bgColor}`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className={`font-semibold ${textColor}`}>
            {isMother ? 'Mother' : 'Father'} Information
          </h3>
        </div>

        {/* Info Grid */}
        <div className="space-y-2 mb-4">
          {info.name && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${accentColor}`}>Name:</span>
              <span className="text-sm text-gray-700">{info.name}</span>
            </div>
          )}

          {info.breed && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${accentColor}`}>Breed:</span>
              <span className="text-sm text-gray-700">{info.breed}</span>
            </div>
          )}

          {info.color && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${accentColor}`}>Color:</span>
              <span className="text-sm text-gray-700">{info.color}</span>
            </div>
          )}

          {info.weight && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${accentColor}`}>Weight:</span>
              <span className="text-sm text-gray-700">{info.weight}</span>
            </div>
          )}

          {info.temperament && (
            <div className="flex items-start gap-2">
              <span className={`text-sm font-medium ${accentColor} mt-0.5`}>Temperament:</span>
              <span className="text-sm text-gray-700">{info.temperament}</span>
            </div>
          )}

          {info.healthInfo && (
            <div className="flex items-start gap-2">
              <span className={`text-sm font-medium ${accentColor} mt-0.5`}>Health:</span>
              <span className="text-sm text-gray-700">{info.healthInfo}</span>
            </div>
          )}
        </div>

        {/* Media Preview */}
        {(images.length > 0 || videos.length > 0) && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium ${accentColor}`}>
                {images.length > 0 && `${images.length} photo${images.length > 1 ? 's' : ''}`}
                {images.length > 0 && videos.length > 0 && ' • '}
                {videos.length > 0 && `${videos.length} video${videos.length > 1 ? 's' : ''}`}
              </span>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.slice(0, 3).map((image, index) => (
                  <div key={index} className="flex-shrink-0">
                    <img
                      src={image}
                      alt={`${parentType} photo ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(image, '_blank')}
                    />
                  </div>
                ))}
                {images.length > 3 && (
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">+{images.length - 3}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Parent Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderParentCard('mother', motherInfo, motherImages, motherVideos)}
        {renderParentCard('father', fatherInfo, fatherImages, fatherVideos)}
      </div>

      {!hasMotherInfo && !hasFatherInfo && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-2xl">👨‍👩‍👧‍👦</span>
          <p className="mt-2">No parent information available</p>
        </div>
      )}
    </div>
  );
} 