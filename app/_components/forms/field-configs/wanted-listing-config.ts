import { FieldConfig } from "../base-listing-form";

export const WANTED_LISTING_FIELD_CONFIG: FieldConfig = {
  layouts: {
    // Single row fields (full width)
    single: [
      'breedWanted', 'specificColor', 'messageToBreeders'
    ],
    
    // Full width fields in two-column section
    full: [],
    
    // Pricing group fields (special handling)
    pricing: [],
    
    // File fields (always single row)
    fileTypes: ['file'],
    
    // Textarea fields (always single row)
    textareaTypes: ['textarea']
  },

  // Field ordering - easily reorder by changing this array
  ordering: {
    // Basic Information fields
    basic: [
      'breedWanted', 'location'
    ],
    
    // Required Information fields
    required: [
      'preferredGender', 'budget', 'agePreference', 'readyToPurchase'
    ],
    
    // Additional Information fields
    additional: [
      'images', 'specificColor', 'messageToBreeders'
    ],
    
    // Contact fields order
    contact: [
      'contactName', 'contactEmail', 'contactPhone'
    ],
    
    // Parent fields order
    parent: [
      'name', 'breed', 'color', 'weight', 'temperament', 'healthInfo',
      'images', 'videos'
    ]
  },

  // Field grouping for special sections
  groups: {
    wantedDetails: ['breedWanted', 'preferredGender', 'budget', 'agePreference', 'readyToPurchase'],
    preferences: ['specificColor', 'messageToBreeders'],
    contact: ['contactName', 'contactEmail', 'contactPhone']
  }
};
