import { FieldConfig } from "../base-listing-form";

export const SEMEN_LISTING_FIELD_CONFIG: FieldConfig = {
  layouts: {
    // Single row fields (full width)
    single: [
      'title', 'description', 'registrationNumber', 'badges', 'healthCertificateText'
    ],
    
    // Full width fields in two-column section
    full: [
      'deliveryOptions'
    ],
    
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
      'dateOfBirth', 'semenType', 'dogName', 'collectionDate', 'registrationNumber', 
      'puppyImages', 'semenImages', 'healthCertificates', 'deliveryOptions', 'dnaResults'
    ],
    
    // Additional Information fields
    additional: [
      'price', 'shippingDate', 'healthCertificateText', 'semenVideoUrls', 'sireName', 'badges'
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
    health: ['healthInfo', 'dnaResults', 'healthCertificates'],
    semenDetails: ['semenType', 'collectionDate', 'shippingDate'],
    pricing: ['price'],
    optional: ['sireName', 'semenVideoUrls', 'healthCertificateText']
  }
};
