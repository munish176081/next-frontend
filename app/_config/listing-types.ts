import { getBadgeFormOptions } from './badge-config';

export interface ListingField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'textarea' | 'file' | 'checkbox' | 'radio' | 'url' | 'location' | 'repeater';
  required: boolean;
  placeholder?: string;
  options?: ({ value: string; label: string } | string)[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  fileConfig?: {
    accept?: string;
    maxSize?: number; // in MB
    maxCount?: number;
    minCount?: number;
    multiple?: boolean;
  };
  repeaterConfig?: {
    subFieldType: 'text' | 'number' | 'date' | 'select';
    subFieldPlaceholder?: string;
    subFieldOptions?: ({ value: string; label: string } | string)[];
    minItems?: number;
    maxItems?: number;
    addButtonText?: string;
    removeButtonText?: string;
  };
  layout?: 'single' | 'double'; // single = full width, double = half width
  fieldCategory?: 'common' | 'contact' | 'media' | 'dynamic'; // New field to categorize where data goes
  conditional?: {
    field: string;
    value: string;
  };
}

export interface ListingType {
  id: string;
  title: string;
  description: string;
  price?: string;
  image: string;
  requiredFields: ListingField[];
  optionalFields: ListingField[];
  category: 'breeding' | 'puppy' | 'service' | 'wanted';
}

// Common fields that go to dedicated DB columns
const COMMON_FIELDS = {
  title: {
    name: 'title',
    label: 'Listing Title',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter listing title',
    fieldCategory: 'common' as const
  },
  description: {
    name: 'description',
    label: 'Description',
    type: 'textarea' as const,
    required: false,
    placeholder: 'Enter description',
    fieldCategory: 'common' as const
  },
  breed: {
    name: 'breed',
    label: 'Breed',
    type: 'select' as const,
    required: true,
    // options removed - now using dynamic breed data from backend API
    fieldCategory: 'common' as const
  },
  price: {
    name: 'price',
    label: 'Price',
    type: 'number' as const,
    required: false,
    placeholder: 'Enter price',
    validation: { min: 0 },
    fieldCategory: 'common' as const
  },
  location: {
    name: 'location',
    label: 'Location',
    type: 'location' as const,
    required: false,
    placeholder: 'Enter Australian location',
    fieldCategory: 'common' as const
  },
  fee: {
    name: 'fee',
    label: 'Price for Stud Service',
    type: 'number' as const,
    required: false,
    placeholder: 'Enter fee amount',
    validation: { min: 0 },
    fieldCategory: 'common' as const
  }
};

// Gender field for stud listings
export const GENDER_FIELD: ListingField = {
  name: 'gender',
  label: 'Stud or Bitch?',
  type: 'radio',
  required: true,
  options: [
    { value: 'stud', label: 'Stud' },
    { value: 'bitch', label: 'Bitch' }
  ],
  fieldCategory: 'dynamic',
  layout: 'single'
};

// Contact fields that go to metadata.contactInfo
const CONTACT_FIELDS = {
  contactName: {
    name: 'contactName',
    label: 'Contact Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter contact name',
    fieldCategory: 'contact' as const
  },
  contactEmail: {
    name: 'contactEmail',
    label: 'Contact Email',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter contact email',
    fieldCategory: 'contact' as const
  },
  contactPhone: {
    name: 'contactPhone',
    label: 'Contact Phone',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter contact phone',
    fieldCategory: 'contact' as const
  },
  contactLocation: {
    name: 'contactLocation',
    label: 'Contact Location',
    type: 'location' as const,
    required: false,
    placeholder: 'Enter Australian contact location',
    fieldCategory: 'contact' as const
  }
};

// Media fields that go to metadata arrays
const MEDIA_FIELDS = {
  images: {
    name: 'images',
    label: 'Images',
    type: 'file' as const,
    required: false,
    fileConfig: {
      multiple: true,
      accept: 'image/*',
      maxSize: 15,
      minCount: 1,
      maxCount: 5
    },
    fieldCategory: 'media' as const
  },
  videos: {
    name: 'videos',
    label: 'Videos',
    type: 'file' as const,
    required: false,
    fileConfig: {
      multiple: true,
      accept: 'video/*',
      maxSize: 500,
      minCount: 1,
      maxCount: 5
    },
    fieldCategory: 'media' as const
  },
  documents: {
    name: 'documents',
    label: 'Documents',
    type: 'file' as const,
    required: false,
    fileConfig: {
      multiple: true,
      accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf',
      maxSize: 25,
      minCount: 1,
      maxCount: 5
    },
    fieldCategory: 'media' as const
  }
};


// 1 puppy listing
// 2 future litter listings
// 3 stud or bitch listings
// 4 semen listings
// 5 wanted puppy listings
// 6 other services listings

export const LISTING_TYPES: ListingType[] = [
  {
    id: 'PUPPY_LISTING',
    title: 'Puppy Listings',
    description: 'For advertising individual puppies or full litters available now.',
    price: '$49 listing fee + add-ons',
    image: '/images/vectors/startListing1.jpg',
    category: 'puppy',
    requiredFields: [
      COMMON_FIELDS.title,
      COMMON_FIELDS.breed,
      {
        name: 'pricingOption',
        label: 'Pricing Option',
        type: 'radio',
        required: true,
        options: [
          { value: 'fixedPrice', label: 'Fixed Price' },
          { value: 'displayPriceRange', label: 'Display price range' },
          { value: 'priceOnRequest', label: 'Price on Request' }
         
        ],
        fieldCategory: 'dynamic'
      },
      {
        name: 'puppyImages',
        label: 'Upload Puppy Images',
        type: 'file',
        required: true,
        fileConfig: {
          multiple: true,
          accept: 'image/*',
          maxSize: 5,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      {
        name: 'dnaResults',
        label: 'Upload DNA Results',
        type: 'file',
        required: true,
        fileConfig: {
          multiple: true,
          accept: '.pdf,.doc,.docx',
          maxSize: 10,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      {
        name: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        required: true,
        fieldCategory: 'dynamic'
      },
      {
        name: 'puppyGender',
        label: 'Puppy Gender(s)',
        type: 'select',
        required: true,
        options: ['Select Gender', 'Male', 'Female', 'Both Available'],
        fieldCategory: 'dynamic'
      },
      {
        name: 'vaccinationStatus',
        label: 'Vaccination Status',
        type: 'select',
        required: true,
        options: ['Select Status', 'Fully Vaccinated', 'Partially Vaccinated', 'Not Vaccinated'],
        fieldCategory: 'dynamic'
      },
      {
        name: 'fixedPrice',
        label: 'Fixed Price',
        type: 'number',
        required: true,
        placeholder: 'Enter fixed price',
        validation: { min: 0 },
        fieldCategory: 'dynamic',
        conditional: {
          field: 'pricingOption',
          value: 'fixedPrice'
        }
      },
      {
        name: 'minPrice',
        label: 'Minimum Price',
        type: 'number',
        required: true,
        placeholder: 'Enter minimum price',
        validation: { min: 0 },
        fieldCategory: 'dynamic',
        conditional: {
          field: 'pricingOption',
          value: 'displayPriceRange'
        }
      },
      {
        name: 'maxPrice',
        label: 'Maximum Price',
        type: 'number',
        required: true,
        placeholder: 'Enter maximum price',
        validation: { min: 0 },
        fieldCategory: 'dynamic',
        conditional: {
          field: 'pricingOption',
          value: 'displayPriceRange'
        }
      },
      {
        name: 'deliveryOptions',
        label: 'Pickup / Delivery Available (Select All That Apply)',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'Pickup', label: 'Pickup' },
          { value: 'Road Transport', label: 'Road Transport' },
          { value: 'Air Transport', label: 'Air Transport' }
        ],
        fieldCategory: 'dynamic'
      },
      {
        name: 'microchipNumber',
        label: 'Microchip Number(s)',
        type: 'repeater',
        required: true,
        fieldCategory: 'dynamic',
        layout: 'single',
        repeaterConfig: {
          subFieldType: 'text',
          subFieldPlaceholder: 'Enter microchip number',
          minItems: 1,
          maxItems: 10,
          addButtonText: 'Add Microchip Number',
          removeButtonText: 'Remove'
        }
      },
      // {
      //   name: 'registrationNumber',
      //   label: 'ANKC / State Breeder Registration Number',
      //   type: 'text',
      //   required: true,
      //   placeholder: 'Enter registration number',
      //   fieldCategory: 'dynamic'
      // }
    ],
    optionalFields: [
      COMMON_FIELDS.description,
      COMMON_FIELDS.location,
      {
        name: 'puppyVideoUrls',
        label: 'Puppy Video URL',
        type: 'url',
        required: false,
        placeholder: 'Enter video URL',
        fieldCategory: 'dynamic'
      },
      {
        name: 'healthCertificates',
        label: 'Health Certificates',
        type: 'file',
        required: false,
        fileConfig: {
          multiple: true,
          accept: 'image/*,.pdf',
          maxSize: 5,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      {
        name: 'litterSize',
        label: 'Litter Size',
        type: 'number',
        required: false,
        placeholder: 'Enter litter size',
        validation: { min: 1 },
        fieldCategory: 'dynamic'
      },
      // {
      //   name: 'sireName',
      //   label: 'Sire Name',
      //   type: 'text',
      //   required: false,
      //   placeholder: 'Enter sire (father) name',
      //   fieldCategory: 'dynamic'
      // },
      // {
      //   name: 'damName',
      //   label: 'Dame Name',
      //   type: 'text',
      //   required: false,
      //   placeholder: 'Enter dame (mother) name',
      //   fieldCategory: 'dynamic'
      // },
      {
        name: 'badges',
        label: 'Select Badges',
        type: 'checkbox',
        required: false,
        options: getBadgeFormOptions(),
        fieldCategory: 'dynamic',
        layout: 'single'
      }
    ]
  },
  {
    id: 'FUTURE_LISTING',
    title: 'Future Listings',
    description: 'For advertising planned or upcoming litters.',
    price: 'Free',
    image: '/images/breeds/future.png',
    category: 'puppy',
    requiredFields: [
      COMMON_FIELDS.title,
      COMMON_FIELDS.breed,
      {
        name: 'expectedDateOfBirth',
        label: 'Expected Date of Birth',
        type: 'date',
        required: true,
        fieldCategory: 'dynamic'
      },
      {
        name: 'estimatedAvailabilityDate',
        label: 'Estimated Availability Date',
        type: 'date',
        required: true,
        fieldCategory: 'dynamic'
      },
      {
        name: 'registrationNumber',
        label: 'ANKC / State Breeder Registration Number',
        type: 'text',
        required: true,
        placeholder: 'Enter registration number',
        fieldCategory: 'dynamic'
      },
      {
        name: 'puppyImages',
        label: 'Upload Images of Past Litters',
        type: 'file',
        required: true,
        fileConfig: {
          multiple: true,
          accept: 'image/*',
          maxSize: 5,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      {
        name: 'pricingOption',
        label: 'Pricing Option',
        type: 'radio',
        required: true,
        options: [
          { value: 'fixedPrice', label: 'Fixed Price' },
          { value: 'displayPriceRange', label: 'Display price range' },
          { value: 'priceOnRequest', label: 'Price on Request' }
          
        ],
        fieldCategory: 'dynamic'
      },
      {
        name: 'fixedPrice',
        label: 'Fixed Price',
        type: 'number',
        required: true,
        placeholder: 'Enter fixed price',
        validation: { min: 0 },
        fieldCategory: 'dynamic',
        conditional: {
          field: 'pricingOption',
          value: 'fixedPrice'
        }
      },
      {
        name: 'minPrice',
        label: 'Minimum Price',
        type: 'number',
        required: true,
        placeholder: 'Enter minimum price',
        validation: { min: 0 },
        fieldCategory: 'dynamic',
        conditional: {
          field: 'pricingOption',
          value: 'displayPriceRange'
        }
      },
      {
        name: 'maxPrice',
        label: 'Maximum Price',
        type: 'number',
        required: true,
        placeholder: 'Enter maximum price',
        validation: { min: 0 },
        fieldCategory: 'dynamic',
        conditional: {
          field: 'pricingOption',
          value: 'displayPriceRange'
        }
      },
      // {
      //   name: 'parentImages',
      //   label: 'Upload Parent Images',
      //   type: 'file',
      //   required: true,
      //   fileConfig: {
      //     multiple: true,
      //     accept: 'image/*',
      //     maxSize: 5,
      //     minCount: 2
      //   },
      //   fieldCategory: 'dynamic'
      // }
    ],
    optionalFields: [
      
      COMMON_FIELDS.description,
      COMMON_FIELDS.location,
      // {
      //   name: 'sireName',
      //   label: 'Sire Name',
      //   type: 'text',
      //   required: false,
      //   placeholder: 'Enter sire (father) name',
      //   fieldCategory: 'dynamic'
      // },
      // {
      //   name: 'damName',
      //   label: 'Dame Name',
      //   type: 'text',
      //   required: false,
      //   placeholder: 'Enter dame (mother) name',
      //   fieldCategory: 'dynamic'
      // },
      {
        name: 'healthCertificates',
        label: 'Health Certificates',
        type: 'file',
        required: false,
        fileConfig: {
          multiple: true,
          accept: 'image/*,.pdf',
          maxSize: 5,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      {
        name: 'expectedTraits',
        label: 'Description of Expected Traits or Colours',
        type: 'textarea',
        required: false,
        placeholder: 'Enter expected traits and colors',
        fieldCategory: 'dynamic'
      },
      {
        name: 'priorLitterResults',
        label: 'Prior Litter Results',
        type: 'textarea',
        required: false,
        placeholder: 'Enter prior litter results',
        fieldCategory: 'dynamic'
      },
      {
        name: 'depositInfo',
        label: 'Reservation Deposit Info & Amount',
        type: 'textarea',
        required: false,
        placeholder: 'Enter deposit information and amount',
        fieldCategory: 'dynamic'
      },
      {
        name: 'dnaResults',
        label: 'Upload DNA Results',
        type: 'file',
        required: false,
        fileConfig: {
          multiple: true,
          accept: '.pdf,.doc,.docx',
          maxSize: 10,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      {
        name: 'badges',
        label: 'Select Badges',
        type: 'checkbox',
        required: false,
        options: getBadgeFormOptions(),
        fieldCategory: 'dynamic'
      }
    ]
  },
  {
    id: 'STUD_LISTING',
    title: 'Stud or Bitch Listings',
    description: 'For advertising dogs available for natural mating (Stud = Male, Bitch = Female).',
    price: '$39/mo',
    image: '/images/breeds/stud.png',
    category: 'breeding',
    
    requiredFields: [
      COMMON_FIELDS.title,
      COMMON_FIELDS.breed,
      {
        name: 'dogName',
        label: 'Dog Name',
        type: 'text',
        required: true,
        placeholder: 'Enter dog name',
        fieldCategory: 'dynamic'
      },
      {
        name: 'dateOfBirth',
        label: 'Date of Birth or Age',
        type: 'date',
        required: true,
        fieldCategory: 'dynamic'
      },
      COMMON_FIELDS.location,
      // COMMON_FIELDS.price,
      COMMON_FIELDS.fee,
      {
        name: 'registrationNumber',
        label: 'ANKC / State Breeder Registration Number',
        type: 'text',
        required: true,
        placeholder: 'Enter registration number',
        fieldCategory: 'dynamic'
      },
      {
        name: 'dogImages',
        label: 'Upload Dog Images & Videos',
        type: 'file',
        required: true,
        fileConfig: {
          multiple: true,
          accept: 'image/*,video/*',
          maxSize: 10,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      
      {
        name: 'dnaResults',
        label: 'Upload DNA Results',
        type: 'file',
        required: false,
        fileConfig: {
          multiple: true,
          accept: '.pdf,.doc,.docx',
          maxSize: 10,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      }
    ],
    optionalFields: [
      COMMON_FIELDS.description,
      {
        name: 'healthCertificates',
        label: 'Health Certificates',
        type: 'file',
        required: false,
        fileConfig: {
          multiple: true,
          accept: 'image/*,.pdf',
          maxSize: 5,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      {
        name: 'provenLitters',
        label: 'Proven Litters / Results',
        type: 'textarea',
        required: false,
        placeholder: 'Enter proven litters and results',
        fieldCategory: 'dynamic'
      },
      {
        name: 'videoUrls',
        label: 'Video URL',
        type: 'url',
        required: false,
        placeholder: 'Enter video URL',
        fieldCategory: 'dynamic'
      },
      {
        name: 'sireName',
        label: 'Sire Name',
        type: 'text',
        required: false,
        placeholder: 'Enter sire (father) name',
        fieldCategory: 'dynamic'
      },
      {
        name: 'damName',
        label: 'Dame Name',
        type: 'text',
        required: false,
        placeholder: 'Enter dame (mother) name',
        fieldCategory: 'dynamic'
      },
      {
        name: 'badges',
        label: 'Select Badges',
        type: 'checkbox',
        required: false,
        options: getBadgeFormOptions(),
        fieldCategory: 'dynamic',
        layout: 'single'
      }
    ]
  },
  {
    id: 'SEMEN_LISTING',
    title: 'Semen Listings',
    description: 'For listing available semen for breeding purposes.',
    price: '$19/mo',
    image: '/images/breeds/semen.png',
    category: 'breeding',
    requiredFields: [
      COMMON_FIELDS.title,
      COMMON_FIELDS.breed,
      {
        name: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        required: true,
        fieldCategory: 'dynamic'
      },
      {
        name: 'semenType',
        label: 'Semen Type',
        type: 'select',
        required: true,
        options: ['Select Type', 'Fresh', 'Chilled', 'Frozen'],
        fieldCategory: 'dynamic'
      },
      {
        name: 'dogName',
        label: 'Dog Name',
        type: 'text',
        required: true,
        placeholder: 'Enter dog name',
        fieldCategory: 'dynamic'
      },
      {
        name: 'collectionDate',
        label: 'Collection Date',
        type: 'date',
        required: true,
        fieldCategory: 'dynamic'
      },
      {
        name: 'registrationNumber',
        label: 'ANKC / State Breeder Registration Number',
        type: 'text',
        required: true,
        placeholder: 'Enter registration number',
        fieldCategory: 'dynamic'
      },
      {
        name: 'puppyImages',
        label: 'Upload Images of Stud',
        type: 'file',
        required: true,
        fileConfig: {
          multiple: true,
          accept: 'image/*',
          maxSize: 5,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      {
        name: 'semenImages',
        label: 'Upload Semen Images/Documents of Analysis',
        type: 'file',
        required: true,
        fileConfig: {
          multiple: true,
          accept: 'image/*,.pdf',
          maxSize: 5,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      {
        name: 'healthCertificates',
        label: 'Upload Health Certificates',
        type: 'file',
        required: true,
        fileConfig: {
          multiple: true,
          accept: 'image/*,.pdf',
          maxSize: 5,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      },
      {
        name: 'deliveryOptions',
        label: 'Pickup / Delivery Available (Select All That Apply)',
        type: 'checkbox',
        required: true,
        options: [
          { value: 'Pickup', label: 'Pickup' },
          { value: 'Road Transport', label: 'Road Transport' },
          { value: 'Air Transport', label: 'Air Transport' }
        ],
        fieldCategory: 'dynamic'
      },
      {
        name: 'dnaResults',
        label: 'Upload DNA Results',
        type: 'file',
        required: false,
        fileConfig: {
          multiple: true,
          accept: '.pdf,.doc,.docx',
          maxSize: 10,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      }
    ],
    optionalFields: [
      COMMON_FIELDS.description,
      COMMON_FIELDS.location,
     {
        name: 'price',
        label: 'Price Per Straw/Dose',
        type: 'number' as const,
        required: false,
        placeholder: 'Price Per Straw/Dose',
        validation: { min: 0 },
        fieldCategory: 'common' as const
      },  
      {
        name: 'shippingDate',
        label: 'Shipping Availability Date',
        type: 'date',
        required: false,
        fieldCategory: 'dynamic'
      },
      {
        name: 'healthCertificateText',
        label: 'Health Certificate (text)',
        type: 'textarea',
        required: false,
        placeholder: 'Enter health certificate details',
        fieldCategory: 'dynamic'
      },
      {
        name: 'semenVideoUrls',
        label: 'Semen Video URL',
        type: 'url',
        required: false,
        placeholder: 'Enter video URL',
        fieldCategory: 'dynamic'
      },
      {
        name: 'sireName',
        label: 'Sire Name',
        type: 'text',
        required: false,
        placeholder: 'Enter sire (father) name',
        fieldCategory: 'dynamic'
      },
      {
        name: 'badges',
        label: 'Select Badges',
        type: 'checkbox',
        required: false,
        options: getBadgeFormOptions(),
        fieldCategory: 'dynamic',
        layout: 'single'
      }
    ]
  },
  {
    id: 'WANTED_LISTING',
    title: 'Wanted Puppy Listings',
    description: 'For buyers seeking specific puppies or breeds.',
    price: 'Free',
    image: '/images/breeds/wanted.png',
    category: 'wanted',
    requiredFields: [
      {
        name: 'breedWanted',
        label: 'Breed Wanted',
        type: 'select',
        required: true,
        // options removed - now using dynamic breed data from backend API
        fieldCategory: 'common'
      },
      
      {
        name: 'preferredGender',
        label: 'Preferred Gender',
        type: 'select',
        required: true,
        options: ['Select Gender', 'Male', 'Female', 'No Preference'],
        fieldCategory: 'dynamic'
      },
      {
        name: 'budget',
        label: 'Budget',
        type: 'select',
        required: true,
        options: ['Select Budget', '$500 - $1,000', '$1,000 - $2,000', '$2,000 - $5,000', '$5,000+'],
        fieldCategory: 'dynamic'
      },
      COMMON_FIELDS.location,
      {
        name: 'agePreference',
        label: 'Age Preference',
        type: 'select',
        required: true,
        options: ['Select Age', 'Puppy (8-12 weeks)', 'Young (3-12 months)', 'Adult (1-7years)', 'Senior (7+ years)', 'No Preference'],
        fieldCategory: 'dynamic'
      },
      {
        name: 'readyToPurchase',
        label: 'When Ready to Purchase',
        type: 'select',
        required: true,
        options: ['Select Timeline', 'Immediately', 'Within 1 month', 'Within 3 months', 'Within 6 months', 'No rush'],
        fieldCategory: 'dynamic'
      },
      CONTACT_FIELDS.contactName,
      CONTACT_FIELDS.contactEmail,
      CONTACT_FIELDS.contactPhone
    ],
    optionalFields: [
      {
        name: 'specificColor',
        label: 'Specific Colour / Temperament',
        type: 'textarea',
        required: false,
        placeholder: 'Enter specific color and temperament preferences',
        fieldCategory: 'dynamic'
      },
      {
        name: 'messageToBreeders',
        label: 'Message to Breeders',
        type: 'textarea',
        required: false,
        placeholder: 'Enter message to breeders',
        fieldCategory: 'dynamic'
      }
    ]
  },
  {
    id: 'OTHER_SERVICES',
    title: 'Other Services Listings',
    description: 'For services like grooming, training, transport, etc.',
    price: '$19/mo',
    image: '/images/breeds/full-litter.png',
    category: 'service',
    requiredFields: [
      {
        name: 'title',
        label: 'Service Title',
        type: 'text',
        required: true,
        placeholder: 'Enter service title',
        fieldCategory: 'common'
      },
      {
        name: 'serviceCategory',
        label: 'Service Category',
        type: 'select',
        required: true,
        options: ['Select Category', 'Dog Walking',
          'Pet Sitting',
          'Grooming',
          'Training',
          'Veterinary',
          'Transport'],
        fieldCategory: 'common'
      },
      COMMON_FIELDS.location,
      COMMON_FIELDS.description,
      CONTACT_FIELDS.contactName,
      CONTACT_FIELDS.contactEmail,
      CONTACT_FIELDS.contactPhone,
      {
        name: 'serviceImages',
        label: 'Upload Images',
        type: 'file',
        required: true,
        fileConfig: {
          multiple: true,
          accept: 'image/*',
          maxSize: 5,
          minCount: 1,
          maxCount: 5
        },
        fieldCategory: 'dynamic'
      }
    ],
    optionalFields: [
      {
        name: 'websiteUrl',
        label: 'Website / Booking URL',
        type: 'url',
        required: false,
        placeholder: 'Enter website or booking URL',
        fieldCategory: 'dynamic'
      },
      // {
      //   name: 'pricing',
      //   label: 'Pricing',
      //   type: 'textarea',
      //   required: false,
      //   placeholder: 'Enter pricing information',
      //   fieldCategory: 'dynamic'
      // },
      {
        name: 'businessABN',
        label: 'Business ABN',
        type: 'text',
        required: false,
        placeholder: 'Enter business ABN',
        fieldCategory: 'dynamic'
      },
      // {
      //   name: 'operatingHours',
      //   label: 'Operating Hours',
      //   type: 'textarea',
      //   required: false,
      //   placeholder: 'Enter operating hours',
      //   fieldCategory: 'dynamic'
      // }
    ]
  }
];

export const getListingTypeById = (id: string): ListingType | undefined => {
  return LISTING_TYPES.find(type => type.id === id);
};

// URL shortening system for cleaner URLs
const LISTING_TYPE_SHORT_CODES: Record<string, string> = {
  'SEMEN_LISTING': 'semen',
  'PUPPY_LISTING': 'puppy', 
  'STUD_LISTING': 'stud',
  'FUTURE_LISTING': 'future',
  'WANTED_LISTING': 'wanted',
  'OTHER_SERVICES': 'services'
};

const SHORT_CODE_TO_ID: Record<string, string> = Object.entries(LISTING_TYPE_SHORT_CODES).reduce((acc, [id, code]) => {
  acc[code] = id;
  return acc;
}, {} as Record<string, string>);

// Helper functions to convert between short codes and full IDs
export const getShortCodeFromId = (id: string): string => {
  return LISTING_TYPE_SHORT_CODES[id] || id;
};

export const getIdFromShortCode = (shortCode: string): string => {
  return SHORT_CODE_TO_ID[shortCode] || shortCode;
};

// Get listing type by short code (backward compatible)
export const getListingTypeByShortCode = (shortCode: string): ListingType | undefined => {
  const fullId = getIdFromShortCode(shortCode);
  console.log(`Converting short code "${shortCode}" to full ID "${fullId}"`);
  return getListingTypeById(fullId);
};

// Debug function to show all available mappings
export const debugListingTypeMappings = () => {
  console.log('Available listing type mappings:');
  Object.entries(LISTING_TYPE_SHORT_CODES).forEach(([id, code]) => {
    console.log(`${id} -> ${code}`);
  });
};

export const getAllFields = (listingType: ListingType): ListingField[] => {
  return [...listingType.requiredFields, ...listingType.optionalFields];
};

// Helper functions to categorize fields
export const getCommonFields = (listingType: ListingType): ListingField[] => {
  return getAllFields(listingType).filter(field => field.fieldCategory === 'common');
};

export const getContactFields = (listingType: ListingType): ListingField[] => {
  return getAllFields(listingType).filter(field => field.fieldCategory === 'contact');
};

export const getMediaFields = (listingType: ListingType): ListingField[] => {
  return getAllFields(listingType).filter(field => field.fieldCategory === 'media');
};

export const getDynamicFields = (listingType: ListingType): ListingField[] => {
  return getAllFields(listingType).filter(field => field.fieldCategory === 'dynamic');
}; 