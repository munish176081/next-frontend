import { ListingField } from '@/_config/listing-types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateField = (field: ListingField, value: any): string | null => {
  // Required field validation
  if (field.required) {
    if (field.type === 'checkbox') {
      if (!Array.isArray(value) || value.length === 0) {
        return `${field.label} is required`;
      }
    } else if (!value || value.toString().trim() === '') {
      return `${field.label} is required`;
    }
  }

  // Type-specific validation
  switch (field.type) {
    case 'number':
      if (value && !isNaN(parseFloat(value))) {
        const numValue = parseFloat(value);
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          return `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          return `${field.label} must be at most ${field.validation.max}`;
        }
      }
      break;

    case 'file':
      if (field.fileConfig?.minCount) {
        // For optional fields, only validate minCount if files are actually provided
        const files = Array.isArray(value) ? value : (typeof value === 'string' && value.trim() !== '' ? [value] : []);
        // Only validate minCount if field is required OR if files are provided
        if (field.required && files.length < field.fileConfig.minCount) {
          return `Please upload at least ${field.fileConfig.minCount} file(s)`;
        } else if (!field.required && files.length > 0 && files.length < field.fileConfig.minCount) {
          return `Please upload at least ${field.fileConfig.minCount} file(s)`;
        }
      }
      if (field.fileConfig?.maxSize) {
        const files = Array.isArray(value) ? value : [];
        const oversizedFiles = files.filter((file: File) => 
          file.size > field.fileConfig!.maxSize! * 1024 * 1024
        );
        if (oversizedFiles.length > 0) {
          return `Some files exceed the maximum size of ${field.fileConfig.maxSize}MB`;
        }
      }
      break;

    case 'url':
      if (value && !isValidUrl(value)) {
        return `${field.label} must be a valid URL`;
      }
      break;

    case 'date':
      if (value && !isValidDate(value)) {
        return `${field.label} must be a valid date`;
      }
      // For dateOfBirth fields (non-stud listings), prevent future dates
      // Note: Stud listings now use 'age' field (number) instead of 'dateOfBirth'
      if (value && field.name === 'dateOfBirth') {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to end of today
        if (selectedDate > today) {
          return `${field.label} cannot be in the future`;
        }
      }
      // For expectedDateOfBirth fields, prevent past dates (only allow future dates)
      const futureDateFields = ['expectedDateOfBirth'];
      if (value && futureDateFields.includes(field.name)) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
        if (selectedDate < today) {
          return `${field.label} cannot be in the past`;
        }
      }

      // collectionDate → cannot be in the future
      const futureNotAllowed = ['collectionDate','puppyDateOfBirth'];
      const selectedDate = new Date(value);
      const today = new Date();
      if (futureNotAllowed.includes(field.name) && selectedDate > today) {
        return `${field.label} cannot be in the future`;
      }
      break;
  }

  return null;
};

export const validateForm = (fields: ListingField[], formData: Record<string, any>): ValidationError[] => {
  const errors: ValidationError[] = [];

  fields.forEach(field => {
    const error = validateField(field, formData[field.name]);
    if (error) {
      errors.push({
        field: field.name,
        message: error
      });
    }
  });

  return errors;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const formatFormData = (formData: Record<string, any>): Record<string, any> => {
  const formatted: Record<string, any> = {};

  Object.entries(formData).forEach(([key, value]) => {
    // Remove empty strings and null values
    if (value !== '' && value !== null && value !== undefined) {
      // Convert arrays with single items to single values for better UX
      if (Array.isArray(value) && value.length === 1) {
        formatted[key] = value[0];
      } else {
        formatted[key] = value;
      }
    }
  });

  return formatted;
};

export const getFieldValue = (field: ListingField, formData: Record<string, any>): any => {
  const value = formData[field.name];
  
  // Return default values for empty fields
  if (value === '' || value === null || value === undefined) {
    if (field.type === 'checkbox') {
      return [];
    }
    if (field.type === 'number') {
      return '';
    }
    return '';
  }

  return value;
}; 