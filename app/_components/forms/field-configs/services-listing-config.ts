import { FieldConfig } from "../base-listing-form";

export const SERVICES_LISTING_FIELD_CONFIG: FieldConfig = {
  layouts: {
    // Single row fields (full width)
    single: [
      'title', 'description', 'serviceImages', 'websiteUrl', 'pricing', 'operatingHours'
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
      'title', 'serviceCategory', 'location', 'description'
    ],
    
    // Required Information fields
    required: [
      'serviceImages'
    ],
    
    // Additional Information fields
    additional: [
      'websiteUrl', 'pricing', 'operatingHours', 'businessABN'
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
    serviceDetails: ['title', 'serviceCategory', 'description'],
    business: ['websiteUrl', 'pricing', 'operatingHours', 'businessABN'],
    contact: ['contactName', 'contactEmail', 'contactPhone'],
    media: ['serviceImages']
  }
};
