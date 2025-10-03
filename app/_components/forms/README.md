# Modular Listing Forms System

This directory contains a modular form system that makes it extremely easy to manage field ordering and layout for different types of listings.

## Structure

```
forms/
├── base-listing-form.tsx          # Base form component with shared functionality
├── listing-form-factory.tsx       # Factory to switch between form types
├── field-configs/                 # Field configuration files for each listing type
│   ├── puppy-listing-config.ts
│   ├── future-listing-config.ts
│   ├── stud-listing-config.ts
│   ├── semen-listing-config.ts
│   ├── wanted-listing-config.ts
│   └── services-listing-config.ts
├── puppy-listing-form.tsx         # Puppy listing form component
├── future-listing-form.tsx        # Future listing form component
├── stud-listing-form.tsx          # Stud listing form component
├── semen-listing-form.tsx         # Semen listing form component
├── wanted-listing-form.tsx        # Wanted listing form component
├── services-listing-form.tsx      # Services listing form component
└── README.md                      # This documentation
```

## How to Reorder Fields

### 1. Edit Field Configuration Files

Each listing type has its own configuration file in the `field-configs/` directory. Fields are organized into three main sections:

```typescript
// In field-configs/puppy-listing-config.ts
ordering: {
  // Basic Information fields (common fields)
  basic: [
    'title', 'description', 'breed', 'location'
  ],
  
  // Required Information fields (required dynamic fields)
  required: [
    'pricingOption', 'puppyImages', 'dnaResults', 'dateOfBirth', 
    'puppyGender', 'vaccinationStatus', 'fixedPrice', 
    'deliveryOptions', 'microchipNumber', 'registrationNumber'
  ],
  
  // Additional Information fields (optional dynamic fields)
  additional: [
    'minPrice', 'maxPrice', 'puppyVideoUrls', 'healthCertificates',
    'litterSize', 'sireName', 'damName', 'badges'
  ],
  
  // Contact fields
  contact: [
    'contactName', 'contactEmail', 'contactPhone', 'contactLocation'
  ]
}
```

**To move a field:**
- Simply change the order within the appropriate section array
- Example: To move `dateOfBirth` before `puppyGender` in Required Information, just swap their positions

### 2. Change Field Layout

Fields can be displayed in different layouts by modifying the `layouts` configuration:

```typescript
layouts: {
  single: ['title', 'description', 'registrationNumber', 'badges'],
  full: ['deliveryOptions'],
  pricing: ['pricingOption', 'fixedPrice', 'minPrice', 'maxPrice'],
  fileTypes: ['file'],
  textareaTypes: ['textarea']
}
```

**Layout Types:**
- `single`: Full width fields
- `double`: Half width fields (default)
- `full`: Full width in two-column section
- `pricing`: Special pricing group with highlighting
- `fileTypes`: File fields (always single row)
- `textareaTypes`: Textarea fields (always single row)

### 3. Group Related Fields

Use the `groups` configuration to group related fields:

```typescript
groups: {
  pricing: ['pricingOption', 'fixedPrice', 'minPrice', 'maxPrice'],
  identification: ['microchipNumber', 'registrationNumber', 'badges'],
  health: ['healthInfo', 'vaccinationStatus', 'dnaResults'],
  puppyDetails: ['dateOfBirth', 'puppyGender', 'vaccinationStatus']
}
```

## Examples

### Example 1: Move Age Field Before Breed
```typescript
// Before
common: ['title', 'description', 'breed', 'age', 'gender']

// After  
common: ['title', 'description', 'age', 'breed', 'gender']
```

### Example 2: Make Location Full Width
```typescript
// Before
layouts: {
  single: ['title', 'description'],
  // location is in double by default
}

// After
layouts: {
  single: ['title', 'description', 'location'],
  // location moved to single
}
```

### Example 3: Add New Field to Pricing Group
```typescript
// Before
pricing: ['pricingOption', 'fixedPrice', 'minPrice', 'maxPrice']

// After
pricing: ['pricingOption', 'fixedPrice', 'minPrice', 'maxPrice', 'discountCode']
```

## Benefits

1. **Easy Field Reordering**: Simply change array order in config files
2. **Consistent Layout**: All forms use the same base component
3. **Type Safety**: TypeScript ensures field names are valid
4. **Maintainable**: Each listing type has its own isolated configuration
5. **Flexible**: Easy to add new field types or modify existing ones
6. **Reusable**: Base form component handles common functionality

## Adding New Listing Types

1. Create a new field configuration file in `field-configs/`
2. Create a new form component that extends the base form
3. Add the new form to the factory in `listing-form-factory.tsx`
4. Update the listing types configuration

## Field Categories

Fields are categorized by their data destination:

- **common**: Goes to dedicated DB columns (title, description, breed, etc.)
- **contact**: Goes to metadata.contactInfo
- **media**: Goes to metadata arrays (images, videos, documents)
- **dynamic**: Goes to fields JSON

This categorization ensures data is stored in the correct location in the database.
