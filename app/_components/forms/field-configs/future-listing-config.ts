import { FieldConfig } from "../base-listing-form";

export const FUTURE_LISTING_FIELD_CONFIG: FieldConfig = {
  layouts: {
    // Single row fields (full width)
    single: [
      'title', 'description', 'registrationNumber', 'badges'
    ],
    
    // Full width fields in two-column section
    full: [],
    
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
    // Basic Information fields
    basic: [
      'title', 'description', 'breed', 'location'
    ],
    
    // Required Information fields
    required: [
      'pricingOption', 'fixedPrice', 'minPrice', 'maxPrice', 'expectedDateOfBirth', 
      'estimatedAvailabilityDate', 'registrationNumber', 'puppyImages'
    ],
    
    // Additional Information fields
    additional: [
      'sireName', 'damName', 'healthCertificates', 'expectedTraits', 
      'priorLitterResults', 'depositInfo', 'dnaResults', 'badges'
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
    identification: ['registrationNumber', 'badges'],
    health: ['healthInfo', 'dnaResults'],
    futureDetails: ['expectedDateOfBirth', 'estimatedAvailabilityDate'],
    optional: ['sireName', 'damName', 'expectedTraits', 'priorLitterResults', 'depositInfo']
  }
};
