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
import { SERVICES_LISTING_FIELD_CONFIG } from "./field-configs/services-listing-config";
import BaseListingForm, { BaseFormProps } from "./base-listing-form";
import { scrollToFirstError } from "@/_utils/scroll-to-error";
import { ListingPaymentModal } from "@/_components/payments/listing-payment-modal";

interface ServicesListingFormProps extends BaseFormProps {}

export default function ServicesListingForm({
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
}: ServicesListingFormProps) {
  const router = useRouter();
  const createListingMutation = useCreateListing();
  const updateListingMutation = useUpdateListing();
  
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, string[]>>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
    fieldConfig: SERVICES_LISTING_FIELD_CONFIG
  });

  const handleFieldChange = (name: string, value: any, breedId?: string) => {
    baseForm.handleFieldChange(name, value, breedId);
  };

  // Extract listing data for payment modal
  const getListingPreviewData = () => {
    const commonFields = getCommonFields(selectedListingType);
    const commonData: Record<string, any> = {};
    commonFields.forEach(field => {
      if (formData[field.name] !== undefined && formData[field.name] !== '') {
        commonData[field.name] = formData[field.name];
      }
    });

    // Get first image
    const allImages: string[] = [];
    const dynamicFields = getDynamicFields(selectedListingType);
    dynamicFields.forEach(field => {
      if (field.type === 'file' && formData[field.name]) {
        const files = Array.isArray(formData[field.name]) ? formData[field.name] : [];
        if (field.fileConfig?.accept?.includes('image/*')) {
          allImages.push(...files);
        }
      }
    });

    return {
      title: commonData.title || '',
      breed: commonData.breed || '',
      location: commonData.location || '',
      image: allImages[0] || undefined,
    };
  };

  // Actual listing creation function (called after payment)
  const createListingAfterPayment = async (isFeatured: boolean) => {
    setIsSubmitting(true);

    try {
      // Separate form data by category
      const commonFields = getCommonFields(selectedListingType);
      const contactFields = getContactFields(selectedListingType);
      const mediaFields = getDynamicFields(selectedListingType).filter(field => field.type === 'file');
      const dynamicFields = getDynamicFields(selectedListingType);

      // Extract common fields (go to dedicated DB columns)
      const commonData: Record<string, any> = {};
      commonFields.forEach(field => {
        if (formData[field.name] !== undefined && formData[field.name] !== '') {
          commonData[field.name] = formData[field.name];
        }
      });

      // Extract contact info (goes to metadata.contactInfo)
      const contactInfo: Record<string, any> = {};
      contactFields.forEach(field => {
        if (formData[field.name] !== undefined && formData[field.name] !== '') {
          contactInfo[field.name.replace('contact', '').toLowerCase()] = formData[field.name];
        }
      });

      // Extract media files (go to metadata arrays)
      const mediaData: Record<string, any> = {};
      mediaFields.forEach(field => {
        if (formData[field.name] && Array.isArray(formData[field.name])) {
          mediaData[field.name] = formData[field.name];
        }
      });

      // Extract dynamic fields (go to fields JSON)
      const dynamicData: Record<string, any> = {};
      dynamicFields.forEach(field => {
        if (formData[field.name] !== undefined && formData[field.name] !== '') {
          dynamicData[field.name] = formData[field.name];
        }
      });

      // Special handling for service listings - move serviceCategory to dynamic data
      if (selectedListingType.id === 'OTHER_SERVICES' && commonData.serviceCategory) {
        dynamicData.serviceCategory = commonData.serviceCategory;
        delete commonData.serviceCategory;
      }

      // Special handling for pricing fields - move to dynamic data
      if (selectedListingType.id === 'OTHER_SERVICES') {
        if (commonData.startingPrice !== undefined) {
          dynamicData.startingPrice = commonData.startingPrice;
          delete commonData.startingPrice;
        }
        if (commonData.priceDetailsAndAddOns !== undefined) {
          dynamicData.priceDetailsAndAddOns = commonData.priceDetailsAndAddOns;
          delete commonData.priceDetailsAndAddOns;
        }
      }

      // Also collect all file fields from dynamic fields for media arrays
      const allImages: string[] = [];
      const allVideos: string[] = [];
      const allDocuments: string[] = [];

      dynamicFields.forEach(field => {
        if (field.type === 'file' && formData[field.name]) {
          const files = Array.isArray(formData[field.name]) ? formData[field.name] : [];
          if (field.fileConfig?.accept?.includes('image/*')) {
            allImages.push(...files);
          } else if (field.fileConfig?.accept?.includes('video/*')) {
            allVideos.push(...files);
          } else {
            allDocuments.push(...files);
          }
        }
      });

      // Merge media data
      if (mediaData.images) allImages.push(...mediaData.images);
      if (mediaData.videos) allVideos.push(...mediaData.videos);
      if (mediaData.documents) allDocuments.push(...mediaData.documents);

      if (editId) {
        // Update existing listing
        const updateData: UpdateListingDto = {
          title: commonData.title,
          description: commonData.description,
          breed: commonData.breed,
          breedId: breedId,
          location: commonData.location,
          fields: dynamicData,
          contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
          images: allImages.length > 0 ? allImages : undefined,
          videos: allVideos.length > 0 ? allVideos : undefined,
          documents: allDocuments.length > 0 ? allDocuments : undefined,
          tags: baseForm.extractTags(commonData, dynamicData),
        };

        await updateListingMutation.mutateAsync({
          id: editId,
          data: updateData
        });
      } else {
        // Create new listing
        const listingData: CreateListingDto = {
          title: commonData.title,
          description: commonData.description,
          type: selectedListingType.id as ListingTypeEnum,
          category: baseForm.getCategoryFromType(selectedListingType.id as ListingTypeEnum),
          breed: commonData.breed,
          breedId: breedId,
          location: commonData.location,
          fields: dynamicData,
          contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
          images: allImages.length > 0 ? allImages : undefined,
          videos: allVideos.length > 0 ? allVideos : undefined,
          documents: allDocuments.length > 0 ? allDocuments : undefined,
          tags: baseForm.extractTags(commonData, dynamicData),
          isFeatured: isFeatured,
          isPremium: false,
        };

        await createListingMutation.mutateAsync(listingData);
      }

      // Mark as submitted to prevent further clicks
      setIsSubmitted(true);

      // Delete pending files from R2 after successful form submission
      const deleteResult = await baseForm.deleteAllPendingFiles();
      if (!deleteResult.success) {
        console.warn('Some pending files could not be deleted:', deleteResult.message);
      }

      // Navigate immediately after successful submission
      router.push('/account/listings');

    } catch (error) {
      console.error('Error submitting listing:', error);
      setIsSubmitting(false);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) {
      return;
    }

    if (!baseForm.validateForm()) {
      toast({
        title: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      setTimeout(() => {
        scrollToFirstError(errors);
      }, 100);
      return;
    }

    // Skip payment for edit mode
    if (editId) {
      await createListingAfterPayment(false);
      return;
    }

    // Show payment modal for new listings
    console.log('Opening payment modal...');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: { isFeatured: boolean; paymentMethod: string }) => {
    try {
      await createListingAfterPayment(paymentData.isFeatured);
    } catch (error: any) {
      toast({
        title: 'Error creating listing',
        description: error.message || 'Failed to create listing after payment',
        variant: 'destructive',
      });
    }
  };

  // Get categorized fields
  const commonFields = getCommonFields(selectedListingType);
  const contactFields = getContactFields(selectedListingType);
  const dynamicRequiredFields = selectedListingType.requiredFields.filter((field: ListingField) => field.fieldCategory === 'dynamic');
  const dynamicOptionalFields = selectedListingType.optionalFields.filter((field: ListingField) => field.fieldCategory === 'dynamic');
  // const specialRequiredFields = selectedListingType.optionalFields.filter((field: ListingField) => field.fieldCategory === 'special');

  return (
    <div className="w-full">
      {/* Basic Information */}
      {commonFields.length > 0 && baseForm.renderFieldGroup(commonFields, 'Basic Information', 'basic')}
      {/* {specialRequiredFields.length > 0 && baseForm.renderFieldGroup(specialRequiredFields, 'Basic Information', 'basic')} */}

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

      {/* Payment Modal */}
      <ListingPaymentModal
        open={showPaymentModal}
        onOpenChange={(open) => {
          console.log('Payment modal onOpenChange:', open);
          setShowPaymentModal(open);
        }}
        listingType={selectedListingType.id as ListingTypeEnum}
        listingTitle={getListingPreviewData().title}
        listingBreed={getListingPreviewData().breed}
        listingLocation={getListingPreviewData().location}
        listingImage={getListingPreviewData().image}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={(error) => {
          toast({
            title: 'Payment Error',
            description: error,
            variant: 'destructive',
          });
        }}
      />
    </div>
  );
}
