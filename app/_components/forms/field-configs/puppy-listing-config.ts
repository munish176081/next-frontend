import { FieldConfig } from "../base-listing-form";

export const PUPPY_LISTING_FIELD_CONFIG: FieldConfig = {
  layouts: {
    // Single row fields (full width)
    single: [
      'title', 'description', 'registrationNumber', 'badges', 'microchipNumber'
    ],
    
    // Full width fields in two-column section
    full: [
      'deliveryOptions'
    ],
    
    // Pricing group fields (special handling)
    pricing: [
      'pricingOption', 'fixedPrice', 'minPrice', 'maxPrice'
    ],
    
    // File fields (always single row)
    fileTypes: ['file'],
    
    // Textarea fields (always single row)
    textareaTypes: ['textarea']
  },

  // Field ordering - easily reorder by changing this array
  ordering: {
    // Basic Information fields (common fields)
    basic: [
      'title', 'description', 'breed', 'location'
    ],
    
    // Required Information fields (required dynamic fields)
    required: [
      'pricingOption', 'fixedPrice', 'minPrice', 'maxPrice', 'puppyImages', 
      'dnaResults', 'dateOfBirth', 'puppyGender', 'vaccinationStatus', 
      'deliveryOptions', 'microchipNumber', 'registrationNumber'
    ],
    
    // Additional Information fields (optional dynamic fields)
    additional: [
      'puppyVideoUrls', 'healthCertificates', 'litterSize', 'sireName', 'damName', 'badges'
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
    pricing: ['pricingOption', 'fixedPrice', 'minPrice', 'maxPrice'],
    identification: ['microchipNumber', 'registrationNumber', 'badges'],
    health: ['healthInfo', 'vaccinationStatus', 'dnaResults'],
    puppyDetails: ['dateOfBirth', 'puppyGender', 'vaccinationStatus']
  }
};
