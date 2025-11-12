export const ListingCardSkeleton = () => {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white transition shadow-section p-6 h-full">
      {/* Heart icon skeleton */}
      <div className="w-7 h-7 rounded-full absolute right-8 top-8 bg-gray-200 animate-pulse" />
      
      {/* Image skeleton */}
      <div className="relative w-full h-56 bg-gray-200 overflow-hidden rounded-xl shimmer-effect" />
      
      {/* Content skeleton */}
      <div className="flex flex-col gap-2 mt-4 flex-1">
        <div className="flex-1">
          {/* Title skeleton - 2 lines */}
          <div className="h-7 bg-gray-200 rounded w-3/4 mb-2 shimmer-effect" />
          <div className="h-7 bg-gray-200 rounded w-1/2 mb-2 shimmer-effect" />
          
          {/* Location skeleton */}
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-2 shimmer-effect" />
          
          {/* Description skeleton */}
          <div className="h-4 bg-gray-200 rounded w-full mb-2 shimmer-effect" />
        </div>
        
        {/* Price and rating section */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col gap-1">
            {/* Price skeleton */}
            <div className="h-8 bg-gray-200 rounded w-24 mb-1 shimmer-effect" />
            <div className="h-4 bg-gray-200 rounded w-16 shimmer-effect" />
          </div>
          
          {/* Rating skeleton */}
          <div className="h-10 bg-gray-200 rounded-full w-20 shimmer-effect" />
        </div>
        
        {/* Button skeleton */}
        <div className="h-[50px] bg-gray-200 rounded-full w-full mt-2 shimmer-effect" />
      </div>
    </div>
  );
};

