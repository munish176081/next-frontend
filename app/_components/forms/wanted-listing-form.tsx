"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DynamicFormField from "@/_components/common/dynamic-form-field";
import { ListingField, getCommonFields, getContactFields, getDynamicFields } from "@/_config/listing-types";
import { useCreateListing } from "@/_services/hooks/listings/use-create-listing";
import { useUpdateListing } from "@/_services/hooks/listings/use-update-listing";
import { CreateListingDto, UpdateListingDto, ListingTypeEnum, ListingCategoryEnum } from "@/_types/listing";
import { toast } from "@/_hooks/use-toast";
import { LoadingButton } from "@/_components/ui/loading-button";
import { WANTED_LISTING_FIELD_CONFIG } from "./field-configs/wanted-listing-config";
import BaseListingForm, { BaseFormProps } from "./base-listing-form";
import { scrollToFirstError } from "@/_utils/scroll-to-error";

interface WantedListingFormProps extends BaseFormProps {}

export default function WantedListingForm({
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
  setBreedId
}: WantedListingFormProps) {
  const router = useRouter();
  const createListingMutation = useCreateListing();
  const updateListingMutation = useUpdateListing();
  
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, string[]>>({});

  // Use the base form functionality
  const baseForm = BaseListingForm({
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
    fieldConfig: WANTED_LISTING_FIELD_CONFIG
  });

  const handleFieldChange = (name: string, value: any, breedId?: string) => {
    baseForm.handleFieldChange(name, value, breedId);
  };

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) {
      return;
    }

    const validationResult = baseForm.validateForm();
    if (!validationResult.isValid) {
      toast({
        title: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      // Use requestAnimationFrame to ensure DOM is updated with error states
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToFirstError(validationResult.errors);
        }, 50);
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Separate form data by category
      const commonFields = getCommonFields(selectedListingType);
      const contactFields = getContactFields(selectedListingType);
      const dynamicFields = getDynamicFields(selectedListingType);

      // Extract common fields (go to dedicated DB columns)
      const commonData: Record<string, any> = {};
      commonFields.forEach(field => {
        if (formData[field.name] !== undefined && formData[field.name] !== '') {
          commonData[field.name] = formData[field.name];
        }
      });

      // Special handling for wanted listings - use breedWanted as title
      if (selectedListingType.id === 'WANTED_LISTING') {
        commonData.title = formData.breedWanted || 'Wanted Puppy';
      }

      // Extract contact info (goes to metadata.contactInfo)
      const contactInfo: Record<string, any> = {};
      contactFields.forEach(field => {
        if (formData[field.name] !== undefined && formData[field.name] !== '') {
          contactInfo[field.name.replace('contact', '').toLowerCase()] = formData[field.name];
        }
      });

      // Extract dynamic fields (go to fields JSON)
      const dynamicData: Record<string, any> = {};
      dynamicFields.forEach(field => {
        if (formData[field.name] !== undefined && formData[field.name] !== '') {
          dynamicData[field.name] = formData[field.name];
        }
      });
      
      // Always include hideAddress (from location field toggle)
      // Default to false if not set
      dynamicData.hideAddress = formData.hideAddress === true;

      if (editId) {
        // Update existing listing
        const updateData: UpdateListingDto = {
          title: commonData.title,
          description: commonData.description,
          breed: commonData.breedWanted,
          breedId: breedId,
          location: commonData.location,
          fields: dynamicData,
          contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
          tags: baseForm.extractTags(commonData, dynamicData),
        };

        await updateListingMutation.mutateAsync({
          id: editId,
          data: updateData
        });
        
        // Mark as submitted to prevent further clicks
        setIsSubmitted(true);

        // Delete pending files from R2 after successful form submission
        const deleteResult = await baseForm.deleteAllPendingFiles();
        if (!deleteResult.success) {
          console.warn('Some pending files could not be deleted:', deleteResult.message);
        }

        // Navigate to explore detail page
        router.push(`/explore/${editId}`);
      } else {
        // Create new listing
        const listingData: CreateListingDto = {
          title: commonData.title,
          description: commonData.description,
          type: selectedListingType.id as ListingTypeEnum,
          category: baseForm.getCategoryFromType(selectedListingType.id as ListingTypeEnum),
          breed: commonData.breedWanted,
          breedId: breedId,
          location: commonData.location,
          fields: dynamicData,
          contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
          tags: baseForm.extractTags(commonData, dynamicData),
          isFeatured: false,
          isPremium: false,
        };

        const createdListing = await createListingMutation.mutateAsync(listingData);

        // Mark as submitted to prevent further clicks
        setIsSubmitted(true);

        // Delete pending files from R2 after successful form submission
        const deleteResult = await baseForm.deleteAllPendingFiles();
        if (!deleteResult.success) {
          console.warn('Some pending files could not be deleted:', deleteResult.message);
        }

        // Navigate to explore detail page
        router.push(`/explore/${createdListing.id}`);
      }

    } catch (error) {
      console.error('Error submitting listing:', error);
      setIsSubmitting(false);
    }
  };

  // Get categorized fields
  const commonFields = getCommonFields(selectedListingType);
  const contactFields = getContactFields(selectedListingType);
  const dynamicRequiredFields = selectedListingType.requiredFields.filter((field: ListingField) => field.fieldCategory === 'dynamic');
  const dynamicOptionalFields = selectedListingType.optionalFields.filter((field: ListingField) => field.fieldCategory === 'dynamic');

  return (
    <div className="w-full">
      {/* Basic Information */}
      {commonFields.length > 0 && baseForm.renderFieldGroup(commonFields, 'Basic Information', 'basic')}

      {/* Required Information */}
      {dynamicRequiredFields.length > 0 && baseForm.renderFieldGroup(dynamicRequiredFields, 'Required Information', 'required')}

      {/* Additional Information */}
      {dynamicOptionalFields.length > 0 && baseForm.renderFieldGroup(dynamicOptionalFields, 'Additional Information', 'additional')}

      {/* Contact Details Section */}
      {contactFields.length > 0 && baseForm.renderFieldGroup(contactFields, 'Contact Details', 'contact')}

      <LoadingButton
        className="w-full h-20 bg-black text-white text-[22px] rounded-full mt-7 max-md:h-12 max-md:text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={isSubmitting || isSubmitted}
        loading={isSubmitting}
      >
        Submit
      </LoadingButton>
    </div>
  );
}
