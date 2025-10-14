import { FieldConfig } from "../base-listing-form";

export const PUPPY_LITTER_LISTING_FIELD_CONFIG: FieldConfig = {
  layouts: {
    // Single row fields (full width)
    single: [
      'title', 'description', 'breed', 'location', 'registrationNumber', 'listingType',
      'listLitterOption', 'litterSize', 'litterPuppyDetails', 'individualPuppies', 'individualPuppiesLitter',
      'dnaResults', 'deliveryOptions', 'healthCertificates', 'badges'
    ],
    
    // Full width fields in two-column section
    full: [
      'title', 'description'
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
      'registrationNumber', 'listingType', 'listLitterOption', 'litterSize', 'litterPuppyDetails', 'individualPuppies', 'individualPuppiesLitter',
      'pricingOption', 'fixedPrice', 'minPrice', 'maxPrice', 'dnaResults', 'deliveryOptions'
    ],
    
    // Additional Information fields (optional dynamic fields)
    additional: [
      'healthCertificates', 'badges'
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
    health: ['dnaResults', 'healthCertificates'],
    puppyDetails: ['listLitterOption', 'litterSize', 'litterPuppyDetails', 'individualPuppies', 'individualPuppiesLitter'],
    litterDetails: ['listLitterOption', 'litterSize'],
    listingType: ['listingType']
  }
};

export default PUPPY_LITTER_LISTING_FIELD_CONFIG;
