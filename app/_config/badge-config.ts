export interface BadgeConfig {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: string;
  iconAlt?: string;
  color: {
    primary: string;
    secondary: string;
    text: string;
  };
}

export const BADGE_CONFIGS: BadgeConfig[] = [
  {
    id: 'vet-checked',
    label: 'Vet Checked',
    value: 'Vet Checked',
    description: 'Health verified by veterinarian',
    icon: '/images/vectors/detailDescription3.png',
    iconAlt: '/images/vectors/detailDescription3.png',
    color: {
      primary: '#10B981', // Green
      secondary: '#D1FAE5',
      text: '#065F46'
    }
  },
  {
    id: 'microchip-verified',
    label: 'Microchip Number Verified',
    value: 'Microchip Number Verified',
    description: 'Microchip details confirmed',
    icon: '/images/vectors/detailDescription3.png',
    iconAlt: '/images/vectors/detailDescription3.png',
    color: {
      primary: '#3B82F6', // Blue
      secondary: '#DBEAFE',
      text: '#1E40AF'
    }
  },
  {
    id: 'purebred-certified',
    label: 'Purebred Certified',
    value: 'Purebred Certified',
    description: 'Breed authenticity confirmed',
    icon: '/images/vectors/detailDescription3.png',
    iconAlt: '/images/vectors/detailDescription3.png',
    color: {
      primary: '#8B5CF6', // Purple
      secondary: '#EDE9FE',
      text: '#5B21B6'
    }
  },
  {
    id: 'flea-treated',
    label: 'Flea & Tick Treated',
    value: 'Flea & Tick Treated',
    description: 'Protected against parasites',
    icon: '/images/vectors/detailDescription3.png',
    iconAlt: '/images/vectors/detailDescription3.png',
    color: {
      primary: '#F59E0B', // Amber
      secondary: '#FEF3C7',
      text: '#92400E'
    }
  },
  {
    id: 'worming-treated',
    label: 'Worming Treated',
    value: 'Worming Treated',
    description: 'Deworming treatment completed',
    icon: '/images/vectors/detailDescription3.png',
    iconAlt: '/images/vectors/detailDescription3.png',
    color: {
      primary: '#EF4444', // Red
      secondary: '#FEE2E2',
      text: '#991B1B'
    }
  },
  {
    id: 'breeder-verified',
    label: 'Breeder Conditions Verified',
    value: 'Breeder Conditions Verified',
    description: 'Breeding environment inspected',
    icon: '/images/vectors/detailDescription3.png',
    iconAlt: '/images/vectors/detailDescription3.png',
    color: {
      primary: '#06B6D4', // Cyan
      secondary: '#CFFAFE',
      text: '#0E7490'
    }
  }
];

// Helper function to get badge config by value
export const getBadgeConfig = (value: string): BadgeConfig | undefined => {
  return BADGE_CONFIGS.find(badge => badge.value === value);
};



// Helper function to get all badge values
export const getAllBadgeValues = (): string[] => {
  return BADGE_CONFIGS.map(badge => badge.value);
};

// Helper function to get badge configs for form options
export const getBadgeFormOptions = (): { value: string; label: string }[] => {
  return BADGE_CONFIGS.map(badge => ({
    value: badge.value,
    label: badge.label
  }));
}; 