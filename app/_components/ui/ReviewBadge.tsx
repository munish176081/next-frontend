import React from 'react';

interface ReviewBadgeProps {}

const ReviewBadge: React.FC<ReviewBadgeProps> = () => {
  return (
    <div className="flex items-center gap-0.5">
      <span className="text-[17.33px]">4.9</span>
      <div className="w-6 h-6">
        <img 
          src="/images/comman/star.svg" 
          alt="Star rating" 
          className="w-[19.5px] h-[18.63px] object-contain "
        />
      </div>
    </div>
  );
};

export default ReviewBadge;