'use client';

import React, { memo } from 'react';
import Badge from './badge';
import { getBadgeConfig } from '@/_config/badge-config';

interface BadgeDisplayProps {
  badges: string[];
  size?: 'sm' | 'md' | 'lg';
  layout?: 'grid' | 'inline' | 'compact';
  showLabels?: boolean;
  maxDisplay?: number;
  className?: string;
}

const BadgeDisplay = memo(({
  badges = [],
  size = 'md',
  layout = 'grid',
  showLabels = true,
  maxDisplay,
  className = ''
}: BadgeDisplayProps) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const hasMore = maxDisplay && badges.length > maxDisplay;

  const renderGridLayout = () => (
    <div className="flex flex-wrap gap-4">
      {displayBadges.map((badgeValue, index) => (
        <Badge
          key={`${badgeValue}-${index}`}
          value={badgeValue}
          size={size}
          variant="display"
          selected={true}
          showLabel={showLabels}
        />
      ))}
      {hasMore && (
        <div className={`${size === 'sm' ? 'w-16 h-16' : size === 'md' ? 'w-20 h-20' : 'w-24 h-24'} bg-gray-100 rounded-lg flex items-center justify-center`}>
          <span className="text-gray-500 text-xs font-medium">+{badges.length - maxDisplay}</span>
        </div>
      )}
    </div>
  );

  const renderInlineLayout = () => (
    <div className="flex flex-wrap gap-1 items-center">
      {displayBadges.map((badgeValue, index) => (
        <Badge
          key={`${badgeValue}-${index}`}
          value={badgeValue}
          size={size}
          variant="display"
          selected={true}
          showLabel={showLabels}
        />
      ))}
      {hasMore && (
        <span className="text-xs text-gray-500 font-medium">
          +{badges.length - maxDisplay} more
        </span>
      )}
    </div>
  );

  const renderCompactLayout = () => (
    <div className="flex flex-wrap gap-1">
      {displayBadges.map((badgeValue, index) => (
        <Badge
          key={`${badgeValue}-${index}`}
          value={badgeValue}
          size="sm"
          variant="compact"
          selected={true}
          showLabel={false}
        />
      ))}
      {hasMore && (
        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs text-gray-600 font-medium">+{badges.length - maxDisplay}</span>
        </div>
      )}
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'inline':
        return renderInlineLayout();
      case 'compact':
        return renderCompactLayout();
      case 'grid':
      default:
        return renderGridLayout();
    }
  };

  return (
    <div className={className}>
      {renderLayout()}
    </div>
  );
});

BadgeDisplay.displayName = 'BadgeDisplay';

export default BadgeDisplay; 