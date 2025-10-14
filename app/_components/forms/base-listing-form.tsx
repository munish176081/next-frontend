"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DynamicFormField from "@/_components/common/dynamic-form-field";
import { ListingField, ListingType } from "@/_config/listing-types";
import { isParentInfoRequired, getParentFields } from "@/_config/parent-fields";
import { useCreateListing } from "@/_services/hooks/listings/use-create-listing";
import { useUpdateListing } from "@/_services/hooks/listings/use-update-listing";
import { useDeletePendingFiles } from "@/_services/hooks/upload/use-delete-pending-files";
import { CreateListingDto, UpdateListingDto, ListingTypeEnum, ListingCategoryEnum } from "@/_types/listing";
import { toast } from "@/_hooks/use-toast";
import { LoadingButton } from "@/_components/ui/loading-button";

export interface BaseFormProps {
  selectedListingType: ListingType;
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  isSubmitted: boolean;
  setIsSubmitted: (submitted: boolean) => void;
  editId?: string | null;
  existingListing?: any;
  breedId?: string;
  setBreedId: (id: string | undefined) => void;
}

export interface FieldConfig {
  layouts: {
    single: string[];
    full: string[];
    pricing: string[];
    fileTypes: string[];
    textareaTypes: string[];
  };
  ordering: {
    basic: string[];
    required: string[];
    additional: string[];
    contact: string[];
    parent: string[];
  };
  groups: {
    [key: string]: string[];
  };
}

export const DEFAULT_FIELD_CONFIG: FieldConfig = {
  layouts: {
    single: [
      'title', 'description', 'serviceTitle', 'registrationNumber', 
      'badges', 'serviceCategory', 'serviceDescription'
    ],
    full: [
      'microchipNumber', 'deliveryOptions'
    ],
    pricing: [
      'pricingOption', 'fixedPrice', 'minPrice', 'maxPrice'
    ],
    fileTypes: ['file'],
    textareaTypes: ['textarea']
  },
  ordering: {
    basic: [
      'title', 'description', 'breed', 'breedWanted', 'location'
    ],
    required: [
      'pricingOption', 'fixedPrice', 'minPrice', 'maxPrice', 'deliveryOptions',
      'microchipNumber', 'registrationNumber', 'badges', 'dnaResults'
    ],
    additional: [
      'age', 'gender', 'color', 'weight', 'price', 'fee', 'temperament', 
      'healthInfo', 'vaccinationStatus', 'serviceTitle', 'serviceCategory', 'serviceDescription'
    ],
    contact: [
      'contactName', 'contactEmail', 'contactPhone', 'contactLocation'
    ],
    parent: [
      'name', 'breed', 'color', 'weight', 'temperament', 'healthInfo',
      'images', 'videos'
    ]
  },
  groups: {
    pricing: ['pricingOption', 'fixedPrice', 'minPrice', 'maxPrice'],
    identification: ['microchipNumber', 'registrationNumber', 'badges'],
    health: ['healthInfo', 'vaccinationStatus', 'dnaResults'],
    service: ['serviceTitle', 'serviceCategory', 'serviceDescription']
  }
};

export interface BaseListingFormProps extends BaseFormProps {
  fieldConfig?: FieldConfig;
  customFieldOrder?: {
    basic?: string[];
    required?: string[];
    additional?: string[];
    contact?: string[];
    parent?: string[];
  };
}

export default function BaseListingForm({
  selectedListingType,
  formData,
  setFormData,
  errors,
  setErrors,
  isSubmitting,
  setIsSubmitting,
  isSubmitted,
  setIsSubmitted,
  editId,
  existingListing,
  breedId,
  setBreedId,
  fieldConfig = DEFAULT_FIELD_CONFIG,
  customFieldOrder
}: BaseListingFormProps) {
  const router = useRouter();
  const createListingMutation = useCreateListing();
  const updateListingMutation = useUpdateListing();
  const deletePendingFilesMutation = useDeletePendingFiles();
  
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, string[]>>({});
  const [showMotherSection, setShowMotherSection] = useState(false);
  const [showFatherSection, setShowFatherSection] = useState(false);
  const [showStudSection, setShowStudSection] = useState(false);

  // Helper function to get dynamic labels based on gender selection
  const getDynamicLabel = (fieldName: string, defaultLabel: string) => {
    if (fieldName === 'fee') {
      const currentGender = formData.gender || 'stud';
      return currentGender === 'bitch' 
        ? 'Price for Bitch Service' 
        : 'Price for Stud Service';
    }
    return defaultLabel;
  };

  const handleFieldChange = (name: string, value: any, breedId?: string) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, [name]: value }));
    const newErrors = { ...errors };
    newErrors[name] = '';
    setErrors(newErrors);
    
    if (name === 'breed' && breedId) {
      setBreedId(breedId);
    }
  };

  const handlePendingDeletions = (fieldName: string, pendingUrls: string[]) => {
    setPendingDeletions(prev => ({
      ...prev,
      [fieldName]: pendingUrls
    }));
  };

  const deleteAllPendingFiles = async () => {
    const allPendingUrls = Object.values(pendingDeletions).flat();
    
    if (allPendingUrls.length === 0) {
      return { success: true, message: 'No files to delete' };
    }

    try {
      const result = await deletePendingFilesMutation.mutateAsync({
        fileUrls: allPendingUrls
      });
      return result;
    } catch (error) {
      console.error('Failed to delete pending files:', error);
      return { success: false, message: 'Failed to delete some files' };
    }
  };

  const shouldDisplayField = (field: ListingField): boolean => {
    if (!field.conditional) return true;
    
    const { field: conditionalField, value: conditionalValue } = field.conditional;
    const fieldValue = formData[conditionalField];
    
    return fieldValue === conditionalValue;
  };

  const getFieldLayout = (field: ListingField): 'single' | 'double' | 'full' | 'pricing-group' => {
    if (fieldConfig.layouts.single.includes(field.name)) return 'single';
    if (fieldConfig.layouts.full.includes(field.name)) return 'full';
    if (fieldConfig.layouts.pricing.includes(field.name)) return 'pricing-group';
    
    if (fieldConfig.layouts.fileTypes.includes(field.type)) return 'single';
    if (fieldConfig.layouts.textareaTypes.includes(field.type)) return 'single';
    
    return 'double';
  };

  const getFieldOrder = (fields: ListingField[], category: 'basic' | 'required' | 'additional' | 'contact' | 'parent' = 'basic'): ListingField[] => {
    const fieldOrder = customFieldOrder?.[category] || fieldConfig.ordering[category] || fieldConfig.ordering.basic || [];

    return fields.sort((a, b) => {
      const aIndex = fieldOrder.indexOf(a.name);
      const bIndex = fieldOrder.indexOf(b.name);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return 0;
    });
  };

  const renderFieldGroup = (fields: ListingField[], title: string, category: 'basic' | 'required' | 'additional' | 'contact' | 'parent' = 'basic') => {
    if (fields.length === 0) return null;

    const visibleFields = getFieldOrder(fields.filter(shouldDisplayField), category);

    const fieldGroups = {
      single: visibleFields.filter(field => getFieldLayout(field) === 'single'),
      double: visibleFields.filter(field => getFieldLayout(field) === 'double'),
      full: visibleFields.filter(field => getFieldLayout(field) === 'full'),
      pricing: visibleFields.filter(field => getFieldLayout(field) === 'pricing-group')
    };

    return (
      <div className="w-full">
        <h2 className="text-[32px] font-medium mt-8 max-md:text-[28px] max-md:mt-10">{title}</h2>

        {/* Single row fields */}
        {fieldGroups.single.length > 0 && (
          <div className="grid grid-cols-1 gap-6 w-full max-md:gap-4">
            {fieldGroups.single.map((field) => (
              <DynamicFormField
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleFieldChange}
                error={errors[field.name]}
                layout="single"
                onPendingDeletionsChange={handlePendingDeletions}
                getDynamicLabel={getDynamicLabel}
              />
            ))}
          </div>
        )}

        {/* Two column fields */}
        {(fieldGroups.double.length > 0 || fieldGroups.full.length > 0 || fieldGroups.pricing.length > 0) && (
          <div className="grid grid-cols-2 gap-6 w-full max-md:grid-cols-1 max-md:gap-4">
            {/* Regular two-column fields */}
            {fieldGroups.double.map((field) => (
              <DynamicFormField
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleFieldChange}
                error={errors[field.name]}
                layout="double"
                getDynamicLabel={getDynamicLabel}
              />
            ))}
            
            {/* Pricing group fields */}
            {fieldGroups.pricing.length > 0 && (
              <>
                {/* Pricing Option - Full Width */}
                {fieldGroups.pricing.filter(field => field.name === 'pricingOption').map((field) => (
                  <div key={field.name} className="col-span-2">
                    <DynamicFormField
                      field={field}
                      value={formData[field.name]}
                      onChange={handleFieldChange}
                      error={errors[field.name]}
                      layout="single"
                      getDynamicLabel={getDynamicLabel}
                    />
                  </div>
                ))}
                
                {/* Fixed Price - Full Width */}
                {fieldGroups.pricing.filter(field => field.name === 'fixedPrice').map((field) => (
                  <div key={field.name} className="col-span-2">
                    <DynamicFormField
                      field={field}
                      value={formData[field.name]}
                      onChange={handleFieldChange}
                      error={errors[field.name]}
                      layout="single"
                      getDynamicLabel={getDynamicLabel}
                    />
                  </div>
                ))}
                
                {/* Min/Max Price - Side by Side with Highlight */}
                {fieldGroups.pricing.filter(field => field.name === 'minPrice' || field.name === 'maxPrice').length > 0 && (
                  <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-6 w-full max-md:grid-cols-1 max-md:gap-4">
                      {fieldGroups.pricing.filter(field => field.name === 'minPrice' || field.name === 'maxPrice').map((field) => (
                        <DynamicFormField
                          key={field.name}
                          field={field}
                          value={formData[field.name]}
                          onChange={handleFieldChange}
                          error={errors[field.name]}
                          layout="double"
                          getDynamicLabel={getDynamicLabel}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Full width fields */}
            {fieldGroups.full.map((field) => (
              <div key={field.name} className="col-span-2">
                <DynamicFormField
                  field={field}
                  value={formData[field.name]}
                  onChange={handleFieldChange}
                  error={errors[field.name]}
                  layout="single"
                  getDynamicLabel={getDynamicLabel}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const isParentSectionComplete = (parentType: 'mother' | 'father' | 'stud' | 'bitch'): boolean => {
    const fields = getParentFields(parentType);
    return !fields.some(field => {
      if (field.validation.required) {
        const value = formData[field.name];
        if (field.type === 'file') {
          return !Array.isArray(value) || value.length === 0;
        }
        return !value || value.toString().trim() === '';
      }
      return false;
    });
  };

  const validateForm = (): boolean => {
    if (!selectedListingType) return false;

    const newErrors: Record<string, string> = {};

    // Validate required fields
    selectedListingType.requiredFields.forEach((field: ListingField) => {
      if (!shouldDisplayField(field)) return;
      
      const value = formData[field.name];

      if (field.required) {
        if (field.type === 'checkbox') {
          if (!Array.isArray(value) || value.length === 0) {
            newErrors[field.name] = `${field.label} is required`;
          }
        } else if (field.type === 'file') {
          const urls = Array.isArray(value) ? value : [];
          if (field.fileConfig?.minCount && urls.length < field.fileConfig.minCount) {
            newErrors[field.name] = `Please upload at least ${field.fileConfig.minCount} ${field.fileConfig.accept?.includes('image/*') ? 'photo(s)' : 'file(s)'}`;
          }
        } else if (!value || value.toString().trim() === '') {
          newErrors[field.name] = `${field.label} is required`;
        }
      }

      if (field.type === 'number' && value) {
        const numValue = parseFloat(value);
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          newErrors[field.name] = `${field.label} must be at most ${field.validation.max}`;
        }
      }

      if (field.type === 'file' && !field.required && value && field.fileConfig?.minCount) {
        const urls = Array.isArray(value) ? value : [];
        if (urls.length > 0 && urls.length < field.fileConfig.minCount) {
          newErrors[field.name] = `Please upload at least ${field.fileConfig.minCount} ${field.fileConfig.accept?.includes('image/*') ? 'photo(s)' : 'file(s)'}`;
        }
      }
    });

    // Validate parent fields if required
    if (selectedListingType && isParentInfoRequired(selectedListingType.id as ListingTypeEnum)) {
      const motherFields = getParentFields('mother');
      const fatherFields = getParentFields('father');
      
      const fieldsToValidate = [...motherFields, ...fatherFields];
      if (selectedListingType?.id === ListingTypeEnum.STUD_LISTING) {
        const studFields = getParentFields('stud');
        fieldsToValidate.push(...studFields);
      }

      fieldsToValidate.forEach(field => {
        const value = formData[field.name];

        if (field.validation.required) {
          if (field.type === 'file') {
            const urls = Array.isArray(value) ? value : [];
            if (field.validation.minCount && urls.length < field.validation.minCount) {
              newErrors[field.name] = `Please upload at least ${field.validation.minCount} ${field.label.toLowerCase()}`;
            }
          } else if (!value || value.toString().trim() === '') {
            newErrors[field.name] = `${field.label} is required`;
          }
        }

        if (field.type !== 'file' && value) {
          const length = value.toString().length;
          if (field.validation.minLength && length < field.validation.minLength) {
            newErrors[field.name] = `${field.label} must be at least ${field.validation.minLength} characters`;
          }
          if (field.validation.maxLength && length > field.validation.maxLength) {
            newErrors[field.name] = `${field.label} must be at most ${field.validation.maxLength} characters`;
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCategoryFromType = (type: ListingTypeEnum): ListingCategoryEnum => {
    const categoryMap: Record<ListingTypeEnum, ListingCategoryEnum> = {
      [ListingTypeEnum.SEMEN_LISTING]: ListingCategoryEnum.BREEDING,
      [ListingTypeEnum.PUPPY_LISTING]: ListingCategoryEnum.PUPPY,
      [ListingTypeEnum.PUPPY_LITTER_LISTING]: ListingCategoryEnum.PUPPY,
      [ListingTypeEnum.STUD_LISTING]: ListingCategoryEnum.BREEDING,
      [ListingTypeEnum.FUTURE_LISTING]: ListingCategoryEnum.PUPPY,
      [ListingTypeEnum.WANTED_LISTING]: ListingCategoryEnum.WANTED,
      [ListingTypeEnum.OTHER_SERVICES]: ListingCategoryEnum.SERVICE,
    };
    return categoryMap[type];
  };

  const extractTags = (commonData: Record<string, any>, dynamicData: Record<string, any>): string[] => {
    const tags: string[] = [];

    if (commonData.breed) {
      tags.push(commonData.breed.toLowerCase());
    }

    if (selectedListingType) {
      tags.push(selectedListingType.id.toLowerCase());
    }

    if (commonData.location) {
      tags.push(commonData.location.toLowerCase());
    }

    return tags;
  };

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) {
      return;
    }

    if (!validateForm()) {
      toast({
        title: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // This will be implemented by the specific form components
      // The base form provides the validation and structure
      // Specific forms will handle their own submission logic
      
    } catch (error) {
      console.error('Error submitting listing:', error);
      setIsSubmitting(false);
    }
  };

  return {
    handleFieldChange,
    handlePendingDeletions,
    deleteAllPendingFiles,
    shouldDisplayField,
    getFieldLayout,
    getFieldOrder,
    renderFieldGroup,
    isParentSectionComplete,
    validateForm,
    getCategoryFromType,
    extractTags,
    handleSubmit,
    getDynamicLabel,
    showMotherSection,
    setShowMotherSection,
    showFatherSection,
    setShowFatherSection,
    showStudSection,
    setShowStudSection,
    pendingDeletions,
    setPendingDeletions
  };
}
