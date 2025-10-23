import { ListingTypeEnum } from "@/_types/listing";

export interface ParentFieldValidation {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  minCount?: number;
  maxCount?: number;
  pattern?: string;
}

export interface ParentField {
  name: string;
  type: 'text' | 'textarea' | 'file' | 'select' | 'radio';
  label: string;
  placeholder?: string;
  validation: ParentFieldValidation;
  options?: { value: string; label: string }[];
  uploadConfig?: {
    category: 'mother' | 'father' | 'stud' | 'bitch';
    customLabel: string;
    icon: string;
    className: string;
    accept?: string;
  };
}

export interface ParentFieldConfig {
  required: boolean;
  listingTypes: Record<ListingTypeEnum, { required: boolean }>;
  fields: {
    mother: ParentField[];
    father: ParentField[];
    stud: ParentField[];
    bitch: ParentField[];
  };
  // TODO: Cross-field validation (commented for client confirmation)
  // crossFieldValidation?: {
  //   differentBreeds?: boolean;
  //   sameHealthStandards?: boolean;
  // };
  
  // TODO: Conditional validation (commented for client confirmation)
  // conditionalValidation?: {
  //   healthInfoRequiredIfDNATested?: boolean;
  //   weightRequiredIfOverAge?: number;
  // };
}

export const PARENT_FIELD_CONFIG: ParentFieldConfig = {
  required: true,
  listingTypes: {
    [ListingTypeEnum.SEMEN_LISTING]: { required: true, parentType: 'father' },
    [ListingTypeEnum.PUPPY_LISTING]: { required: true },
    [ListingTypeEnum.PUPPY_LITTER_LISTING]: { required: true },
    [ListingTypeEnum.STUD_LISTING]: { required: true },
    [ListingTypeEnum.FUTURE_LISTING]: { required: true },
    [ListingTypeEnum.WANTED_LISTING]: { required: false },
    [ListingTypeEnum.OTHER_SERVICES]: { required: false },
  },
  fields: {
    mother: [
      {
        name: "motherName",
        type: "text",
        label: "Name",
        placeholder: "Enter mother's name",
        validation: { required: true, minLength: 2, maxLength: 50 }
      },
      {
        name: "motherBreed",
        type: "select",
        label: "Breed",
        placeholder: "Select mother's breed",
        validation: { required: true }
      },
      {
        name: "motherColor",
        type: "text",
        label: "Color",
        placeholder: "Enter mother's color",
        validation: { required: false, maxLength: 50 }
      },
      {
        name: "motherWeight",
        type: "text",
        label: "Weight",
        placeholder: "e.g., 28kg",
        validation: { required: false, maxLength: 20 }
      },
      {
        name: "motherTemperament",
        type: "textarea",
        label: "Temperament",
        placeholder: "Describe mother's temperament",
        validation: { required: false, maxLength: 200 }
      },
      {
        name: "motherHealthInfo",
        type: "textarea",
        label: "Health Information",
        placeholder: "e.g., DNA Tested, Hip Scored, Vaccinated",
        validation: { required: false, maxLength: 300 }
      },
      {
        name: "motherImages",
        type: "file",
        label: "Photos",
        validation: { required: true, minCount: 1, maxCount: 5 },
        uploadConfig: {
          category: "mother",
          customLabel: "Mother's Photos",
          icon: "👩‍🦰",
          className: "mother-upload",
          accept: "image/*"
        }
      },
      {
        name: "motherVideos",
        type: "file",
        label: "Videos",
        validation: { required: false, maxCount: 2 },
        uploadConfig: {
          category: "mother",
          customLabel: "Mother's Videos",
          icon: "👩‍🦰",
          className: "mother-upload",
          accept: "video/*"
        }
      }
    ],
    father: [
      {
        name: "fatherName",
        type: "text",
        label: "Name",
        placeholder: "Enter father's name",
        validation: { required: true, minLength: 2, maxLength: 50 }
      },
      {
        name: "fatherBreed",
        type: "select",
        label: "Breed",
        placeholder: "Select father's breed",
        validation: { required: true }
      },
      {
        name: "fatherColor",
        type: "text",
        label: "Color",
        placeholder: "Enter father's color",
        validation: { required: false, maxLength: 50 }
      },
      {
        name: "fatherWeight",
        type: "text",
        label: "Weight",
        placeholder: "e.g., 32kg",
        validation: { required: false, maxLength: 20 }
      },
      {
        name: "fatherTemperament",
        type: "textarea",
        label: "Temperament",
        placeholder: "Describe father's temperament",
        validation: { required: false, maxLength: 200 }
      },
      {
        name: "fatherHealthInfo",
        type: "textarea",
        label: "Health Information",
        placeholder: "e.g., DNA Tested, Hip Scored, Vaccinated",
        validation: { required: false, maxLength: 300 }
      },
      {
        name: "fatherImages",
        type: "file",
        label: "Photos",
        validation: { required: true, minCount: 1, maxCount: 5 },
        uploadConfig: {
          category: "father",
          customLabel: "Father's Photos",
          icon: "👨‍🦰",
          className: "father-upload",
          accept: "image/*"
        }
      },
      {
        name: "fatherVideos",
        type: "file",
        label: "Videos",
        validation: { required: false, maxCount: 2 },
        uploadConfig: {
          category: "father",
          customLabel: "Father's Videos",
          icon: "👨‍🦰",
          className: "father-upload",
          accept: "video/*"
        }
      }
    ],
    stud: [
      {
        name: "studName",
        type: "text",
        label: "Name",
        placeholder: "Enter stud's name",
        validation: { required: true, minLength: 2, maxLength: 50 }
      },
      {
        name: "studBreed",
        type: "select",
        label: "Breed",
        placeholder: "Select stud's breed",
        validation: { required: true }
      },
      {
        name: "studColor",
        type: "text",
        label: "Color",
        placeholder: "Enter stud's color",
        validation: { required: false, maxLength: 50 }
      },
      {
        name: "studWeight",
        type: "text",
        label: "Weight",
        placeholder: "e.g., 32kg",
        validation: { required: false, maxLength: 20 }
      },
      {
        name: "studTemperament",
        type: "textarea",
        label: "Temperament",
        placeholder: "Describe stud's temperament",
        validation: { required: false, maxLength: 200 }
      },
      {
        name: "studHealthInfo",
        type: "textarea",
        label: "Health Information",
        placeholder: "e.g., DNA Tested, Hip Scored, Vaccinated",
        validation: { required: false, maxLength: 300 }
      },
      {
        name: "studImages",
        type: "file",
        label: "Photos",
        validation: { required: true, minCount: 1, maxCount: 5 },
        uploadConfig: {
          category: "stud",
          customLabel: "Stud's Photos",
          icon: "🐕",
          className: "stud-upload",
          accept: "image/*"
        }
      },
      {
        name: "studVideos",
        type: "file",
        label: "Videos",
        validation: { required: false, maxCount: 2 },
        uploadConfig: {
          category: "stud",
          customLabel: "Stud's Videos",
          icon: "🐕",
          className: "stud-upload",
          accept: "video/*"
        }
      }
    ],
    bitch: [
      {
        name: "bitchName",
        type: "text",
        label: "Name",
        placeholder: "Enter bitch's name",
        validation: { required: true, minLength: 2, maxLength: 50 }
      },
      {
        name: "bitchBreed",
        type: "select",
        label: "Breed",
        placeholder: "Select bitch's breed",
        validation: { required: true }
      },
      {
        name: "bitchColor",
        type: "text",
        label: "Color",
        placeholder: "Enter bitch's color",
        validation: { required: false, maxLength: 50 }
      },
      {
        name: "bitchWeight",
        type: "text",
        label: "Weight",
        placeholder: "e.g., 28kg",
        validation: { required: false, maxLength: 20 }
      },
      {
        name: "bitchTemperament",
        type: "textarea",
        label: "Temperament",
        placeholder: "Describe bitch's temperament",
        validation: { required: false, maxLength: 200 }
      },
      {
        name: "bitchHealthInfo",
        type: "textarea",
        label: "Health Information",
        placeholder: "e.g., DNA Tested, Hip Scored, Vaccinated",
        validation: { required: false, maxLength: 300 }
      },
      {
        name: "bitchImages",
        type: "file",
        label: "Photos",
        validation: { required: true, minCount: 1, maxCount: 5 },
        uploadConfig: {
          category: "bitch",
          customLabel: "Bitch's Photos",
          icon: "🐕",
          className: "bitch-upload",
          accept: "image/*"
        }
      },
      {
        name: "bitchVideos",
        type: "file",
        label: "Videos",
        validation: { required: false, maxCount: 2 },
        uploadConfig: {
          category: "bitch",
          customLabel: "Bitch's Videos",
          icon: "🐕",
          className: "bitch-upload",
          accept: "video/*"
        }
      }
    ]
  }
};

// Helper functions for field management
export const getParentFields = (parentType: 'mother' | 'father' | 'stud' | 'bitch'): ParentField[] => {
  return PARENT_FIELD_CONFIG.fields[parentType];
};

export const isParentInfoRequired = (listingType: ListingTypeEnum): boolean => {
  return PARENT_FIELD_CONFIG.listingTypes[listingType]?.required ?? PARENT_FIELD_CONFIG.required;
};

export const getParentFieldByName = (parentType: 'mother' | 'father' | 'stud' | 'bitch', fieldName: string): ParentField | undefined => {
  return PARENT_FIELD_CONFIG.fields[parentType].find(field => field.name === fieldName);
};

export const validateParentField = (field: ParentField, value: any): string | null => {
  const { validation } = field;
  
  // Required validation
  if (validation.required) {
    if (field.type === 'file') {
      const files = Array.isArray(value) ? value : [];
      if (files.length === 0) {
        return `${field.label} is required`;
      }
    } else if (field.type === 'radio') {
      if (!value || value.toString().trim() === '') {
        return `${field.label} is required`;
      }
    } else if (!value || value.toString().trim() === '') {
      return `${field.label} is required`;
    }
  }
  
  // Length validation for text fields
  if (field.type !== 'file' && value) {
    const length = value.toString().length;
    if (validation.minLength && length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }
    if (validation.maxLength && length > validation.maxLength) {
      return `${field.label} must be at most ${validation.maxLength} characters`;
    }
  }
  
  // File count validation
  if (field.type === 'file' && value) {
    const files = Array.isArray(value) ? value : [];
    if (validation.minCount && files.length < validation.minCount) {
      return `Please upload at least ${validation.minCount} ${field.label.toLowerCase()}`;
    }
    if (validation.maxCount && files.length > validation.maxCount) {
      return `Please upload at most ${validation.maxCount} ${field.label.toLowerCase()}`;
    }
  }
  
  return null;
}; 