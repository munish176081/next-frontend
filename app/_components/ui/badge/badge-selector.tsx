'use client';

import React, { useCallback, memo } from 'react';
import Badge from './badge';
import { BADGE_CONFIGS } from '@/_config/badge-config';

interface BadgeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  size?: 'sm' | 'md' | 'lg';
  showCategories?: boolean;
  maxSelection?: number;
  className?: string;
}

const BadgeSelector = memo(({
  value = [],
  onChange,
  size = 'sm',
  showCategories = false,
  maxSelection,
  className = ''
}: BadgeSelectorProps) => {
  const handleBadgeClick = (badgeValue: string) => {
    console.log('Badge clicked:', badgeValue);
    console.log('Current selected badges:', value);
    
    const newSelectedBadges = value.includes(badgeValue)
      ? value.filter(badge => badge !== badgeValue)
      : [...value, badgeValue];
    
    console.log('New selected badges:', newSelectedBadges);
    console.log('Calling onChange with:', newSelectedBadges);
    
    onChange(newSelectedBadges);
  };

  const isSelected = useCallback((badgeValue: string) => value.includes(badgeValue), [value]);

  return (
    <div className={className}>
      {/* Selection Summary - More compact */}
      {maxSelection && (
        <div className="mb-3 p-2 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-700">
            Select up to {maxSelection} badge{maxSelection !== 1 ? 's' : ''}. 
            Selected: {value.length}/{maxSelection}
          </p>
        </div>
      )}
      
      {/* Standalone Badges - No grid container */}
      <div className="flex flex-wrap gap-4">
        {BADGE_CONFIGS.map((badge) => (
          <Badge
            key={badge.id}
            value={badge.value}
            size={size}
            variant="selectable"
            selected={isSelected(badge.value)}
            onClick={() => handleBadgeClick(badge.value)}
            showLabel={true}
          />
        ))}
      </div>
      
      {/* No Badges Message */}
      {BADGE_CONFIGS.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No badges available</p>
        </div>
      )}
    </div>
  );
});

BadgeSelector.displayName = 'BadgeSelector';

export default BadgeSelector; 