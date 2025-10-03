import { FieldConfig } from "../base-listing-form";

export const STUD_LISTING_FIELD_CONFIG: FieldConfig = {
  layouts: {
    // Single row fields (full width)
    single: [
      'title', 'description', 'registrationNumber', 'badges', 'provenLitters'
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
      'title', 'description', 'breed', 'location'
    ],
    
    // Required Information fields
    required: [
      'dogName', 'dateOfBirth', 'price', 'fee', 'registrationNumber', 'dogImages', 'dnaResults'
    ],
    
    // Additional Information fields
    additional: [
      'provenLitters', 'videoUrls', 'sireName', 'damName', 'healthCertificates', 'badges'
    ],
    
    // Contact fields order
    contact: [
      'contactName', 'contactEmail', 'contactPhone', 'contactLocation'
    ],
    
    // Parent fields order
    parent: [
      'name', 'breed', 'color', 'weight', 'temperament', 'healthInfo',
      'images', 'videos'
    ]
  },

  // Field grouping for special sections
  groups: {
    identification: ['registrationNumber', 'badges'],
    health: ['healthInfo', 'dnaResults'],
    studDetails: ['dogName', 'dateOfBirth', 'price', 'fee'],
    optional: ['provenLitters', 'videoUrls', 'sireName', 'damName', 'healthCertificates']
  }
};
