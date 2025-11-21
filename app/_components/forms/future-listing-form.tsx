"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DynamicFormField from "@/_components/common/dynamic-form-field";
import { ListingField, getCommonFields, getContactFields, getDynamicFields, getAllFields } from "@/_config/listing-types";
import { isParentInfoRequired, getParentFields } from "@/_config/parent-fields";
import { useCreateListing } from "@/_services/hooks/listings/use-create-listing";
import { useUpdateListing } from "@/_services/hooks/listings/use-update-listing";
import { CreateListingDto, UpdateListingDto, ListingTypeEnum, ListingCategoryEnum } from "@/_types/listing";
import { isSubscriptionType } from "@/_lib/pricing";
import { hasStripePriceId, hasPayPalPlanId } from "@/_config/subscription-prices";
import { toast } from "@/_hooks/use-toast";
import { LoadingButton } from "@/_components/ui/loading-button";
import { FUTURE_LISTING_FIELD_CONFIG } from "./field-configs/future-listing-config";
import BaseListingForm, { BaseFormProps } from "./base-listing-form";
import { scrollToFirstError } from "@/_utils/scroll-to-error";
import { ListingPaymentModal } from "@/_components/payments/listing-payment-modal";
import { checkActiveSubscription } from "@/_lib/api/subscriptions";

interface FutureListingFormProps extends BaseFormProps {}

export default function FutureListingForm({
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
}: FutureListingFormProps) {
  const router = useRouter();
  const createListingMutation = useCreateListing();
  const updateListingMutation = useUpdateListing();
  
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, string[]>>({});
  const [showMotherSection, setShowMotherSection] = useState(false);
  const [showFatherSection, setShowFatherSection] = useState(false);
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
    fieldConfig: FUTURE_LISTING_FIELD_CONFIG
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
  const createListingAfterPayment = async (isFeatured: boolean, paymentId?: string) => {
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
        // Always include the field if it exists in formData (even if empty string)
        const fieldValue = formData[field.name];
        if (fieldValue !== undefined) {
          dynamicData[field.name] = fieldValue;
        }
      });
      
      // Explicitly ensure registrationNumber is always included (required field)
      // This handles cases where the field might not be initialized in formData
      // Check all fields (including studDynamic) for registrationNumber
      const allFields = getAllFields(selectedListingType);
      const registrationField = allFields.find(f => f.name === 'registrationNumber');
      if (registrationField) {
        // Always include registrationNumber in dynamicData, even if it's not in formData
        // Use formData value if it exists, otherwise default to empty string
        dynamicData.registrationNumber = formData.registrationNumber !== undefined 
          ? formData.registrationNumber 
          : '';
      }
      
      // Debug: Log registrationNumber specifically
      console.log('🔍 Dynamic fields extraction:', {
        registrationNumberInFormData: formData.registrationNumber,
        registrationNumberInDynamicData: dynamicData.registrationNumber,
        registrationFieldExists: !!registrationField,
        registrationFieldRequired: registrationField?.required,
        allDynamicFields: dynamicFields.map(f => f.name),
        dynamicDataKeys: Object.keys(dynamicData),
        formDataKeys: Object.keys(formData)
      });

      // Extract parent information
      const motherInfo = {
        name: formData.motherName,
        breed: formData.motherBreed,
        color: formData.motherColor,
        weight: formData.motherWeight,
        temperament: formData.motherTemperament,
        healthInfo: formData.motherHealthInfo
      };

      const fatherInfo = {
        name: formData.fatherName,
        breed: formData.fatherBreed,
        color: formData.fatherColor,
        weight: formData.fatherWeight,
        temperament: formData.fatherTemperament,
        healthInfo: formData.fatherHealthInfo
      };

      // Extract parent media
      const motherImages = formData.motherImages || [];
      const fatherImages = formData.fatherImages || [];
      const motherVideos = formData.motherVideos || [];
      const fatherVideos = formData.fatherVideos || [];

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

      // Prepare metadata with parent media
      const metadata: Record<string, any> = {};
      if (motherImages.length > 0) metadata.motherImages = motherImages;
      if (fatherImages.length > 0) metadata.fatherImages = fatherImages;
      if (motherVideos.length > 0) metadata.motherVideos = motherVideos;
      if (fatherVideos.length > 0) metadata.fatherVideos = fatherVideos;

      // Extract price from various possible fields
      const price = commonData.price || formData.fixedPrice || null;

      if (editId) {
        // Update existing listing
        const updateData: UpdateListingDto = {
          title: commonData.title,
          description: commonData.description,
          price: price ? parseFloat(price) : undefined,
          breed: commonData.breed,
          breedId: breedId,
          location: commonData.location,
          fields: dynamicData,
          contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
          motherInfo: Object.values(motherInfo).some(v => v) ? motherInfo : undefined,
          fatherInfo: Object.values(fatherInfo).some(v => v) ? fatherInfo : undefined,
          images: allImages.length > 0 ? allImages : undefined,
          videos: allVideos.length > 0 ? allVideos : undefined,
          documents: allDocuments.length > 0 ? allDocuments : undefined,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
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
          price: price ? parseFloat(price) : undefined,
          breed: commonData.breed,
          breedId: breedId,
          location: commonData.location,
          fields: dynamicData,
          contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
          motherInfo: Object.values(motherInfo).some(v => v) ? motherInfo : undefined,
          fatherInfo: Object.values(fatherInfo).some(v => v) ? fatherInfo : undefined,
          images: allImages.length > 0 ? allImages : undefined,
          videos: allVideos.length > 0 ? allVideos : undefined,
          documents: allDocuments.length > 0 ? allDocuments : undefined,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
          tags: baseForm.extractTags(commonData, dynamicData),
          isFeatured: isFeatured,
          isPremium: false,
          paymentId: paymentId,
        };

        const createdListing = await createListingMutation.mutateAsync(listingData);
        
        // For subscription listing types, subscription is already created in payment modal
        // We just need to link it to the listing
        // paymentId here is actually subscriptionId for subscription types
        if ((hasStripePriceId(selectedListingType.id as ListingTypeEnum) || hasPayPalPlanId(selectedListingType.id as ListingTypeEnum) || isSubscriptionType(selectedListingType.id as ListingTypeEnum)) && paymentId) {
          console.log('🔔 [Frontend] Linking subscription to listing:', { listingId: createdListing.id, subscriptionId: paymentId });
          await updateListingMutation.mutateAsync({
            id: createdListing.id,
            data: { subscriptionId: paymentId } // paymentId is actually subscriptionId
          });
          console.log('✅ [Frontend] Listing linked to subscription');
        }
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

    // Skip payment for edit mode
    if (editId) {
      await createListingAfterPayment(false);
      return;
    }

    // For subscription listing types, check if user already has an active subscription
    const listingType = selectedListingType.id as ListingTypeEnum;
    // Use price/plan ID check - more reliable than enum check
    if (hasStripePriceId(listingType) || hasPayPalPlanId(listingType) || isSubscriptionType(listingType)) {
      try {
        const subscriptionCheck = await checkActiveSubscription(listingType);
        if (subscriptionCheck.hasSubscription && subscriptionCheck.subscription) {
          // User has active subscription, create listing directly without payment
          console.log('✅ User has active subscription, creating listing directly:', subscriptionCheck.subscription.id);
          await createListingAfterPayment(false, subscriptionCheck.subscription.id);
          return;
        }
      } catch (error: any) {
        console.error('Error checking subscription:', error);
        // If check fails, proceed to payment modal
      }
    }

    // Show payment modal for new listings (no subscription or one-time payment types)
    console.log('Opening payment modal...');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: { isFeatured: boolean; paymentMethod: string; paymentId: string; subscriptionId?: string }) => {
    try {
      // For subscription types, use subscriptionId if provided, otherwise use paymentId (which is subscriptionId for subscriptions)
      const listingTypeCheck = selectedListingType.id as ListingTypeEnum;
      const isSubscription = hasStripePriceId(listingTypeCheck) || hasPayPalPlanId(listingTypeCheck) || isSubscriptionType(listingTypeCheck);
      const subscriptionId = paymentData.subscriptionId || (isSubscription ? paymentData.paymentId : undefined);
      console.log('🔔 [Form] Payment success:', {
        paymentId: paymentData.paymentId,
        subscriptionId,
        listingType: selectedListingType.id,
        isSubscription
      });
      await createListingAfterPayment(paymentData.isFeatured, subscriptionId || paymentData.paymentId);
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
  const studDynamicRequiredFields = selectedListingType.requiredFields.filter((field: ListingField) => field.fieldCategory === 'studDynamic');

  return (
    <div className="w-full">
      {/* Basic Information */}
      {commonFields.length > 0 && baseForm.renderFieldGroup(commonFields, 'Basic Information', 'basic')}
      {studDynamicRequiredFields.length > 0 && baseForm.renderFieldGroup(studDynamicRequiredFields, 'Required Information', 'basic')}

      {/* Required Information */}
      {dynamicRequiredFields.length > 0 && (
        <div className="w-full">
          {/* Pricing fields first - at the top */}
          {(() => {
            const pricingFields = dynamicRequiredFields.filter(field => 
              FUTURE_LISTING_FIELD_CONFIG.layouts.pricing.includes(field.name) && 
              baseForm.shouldDisplayField(field)
            );
            
            if (pricingFields.length > 0) {
              return (
                <div className="grid grid-cols-2 gap-6 w-full max-md:grid-cols-1 max-md:gap-4 mb-6">
                  {/* Pricing Option - Full Width */}
                  {pricingFields.filter(field => field.name === 'pricingOption').map((field) => (
                    <div key={field.name} className="col-span-2">
                      <DynamicFormField
                        field={field}
                        value={formData[field.name]}
                        onChange={handleFieldChange}
                        error={errors[field.name]}
                        layout="single"
                        onPendingDeletionsChange={baseForm.handlePendingDeletions}
                        getDynamicLabel={baseForm.getDynamicLabel}
                      />
                    </div>
                  ))}
                  
                  {/* Fixed Price - Full Width */}
                  {pricingFields.filter(field => field.name === 'fixedPrice').map((field) => (
                    <div key={field.name} className="col-span-2">
                      <DynamicFormField
                        field={field}
                        value={formData[field.name]}
                        onChange={handleFieldChange}
                        error={errors[field.name]}
                        layout="single"
                        onPendingDeletionsChange={baseForm.handlePendingDeletions}
                        getDynamicLabel={baseForm.getDynamicLabel}
                      />
                    </div>
                  ))}
                  
                  {/* Min/Max Price - Side by Side with Gray Background (matching future listing) */}
                  {pricingFields.filter(field => field.name === 'minPrice' || field.name === 'maxPrice').length > 0 && (
                    <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="grid grid-cols-2 gap-6 w-full max-md:grid-cols-1 max-md:gap-4">
                        {pricingFields.filter(field => field.name === 'minPrice' || field.name === 'maxPrice').map((field) => (
                          <DynamicFormField
                            key={field.name}
                            field={field}
                            value={formData[field.name]}
                            onChange={handleFieldChange}
                            error={errors[field.name]}
                            layout="double"
                            onPendingDeletionsChange={baseForm.handlePendingDeletions}
                            getDynamicLabel={baseForm.getDynamicLabel}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}
          
          {/* Other required fields */}
          {(() => {
            const nonPricingFields = dynamicRequiredFields.filter(field => 
              !FUTURE_LISTING_FIELD_CONFIG.layouts.pricing.includes(field.name) && 
              baseForm.shouldDisplayField(field)
            );
            
            if (nonPricingFields.length > 0) {
              return baseForm.renderFieldGroup(nonPricingFields, '', 'required');
            }
            return null;
          })()}
        </div>
      )}

      {/* Additional Information */}
      {dynamicOptionalFields.length > 0 && baseForm.renderFieldGroup(dynamicOptionalFields, 'Additional Information', 'additional')}

      {/* Parent Information Section */}
      {selectedListingType.id !== ListingTypeEnum.OTHER_SERVICES &&
       selectedListingType.id !== ListingTypeEnum.WANTED_LISTING && (
        <div className="w-full mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-100 pb-4">
            Parent Information
          </h2>

          <div className="space-y-6">
            {/* Mother Information Section */}
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
              <div
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setShowMotherSection(!showMotherSection)}
                aria-expanded={showMotherSection}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-pink-50 rounded-lg">
                    <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 15c3 0 5-2 5-5v-2h-2v2c0 2-1 3-3 3s-3-1-3-3v-2H7v2c0 3 2 5 5 5z" />
                      <circle cx="12" cy="8" r="3" />
                      <circle cx="12" cy="18" r="1.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Mother's Details</h3>
                    <p className="text-sm text-gray-500">
                      {isParentInfoRequired(selectedListingType.id as ListingTypeEnum) 
                        ? "Required information about the dame" 
                        : "Optional information about the dame"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isParentInfoRequired(selectedListingType.id as ListingTypeEnum) && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        Required
                      </span>
                    )}
                    {isParentInfoRequired(selectedListingType.id as ListingTypeEnum) && (
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${!baseForm.isParentSectionComplete('mother')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                        {!baseForm.isParentSectionComplete('mother') ? 'Incomplete' : 'Complete'}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${showMotherSection ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {showMotherSection && (
                <div className="border-t border-gray-100 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getParentFields('mother').map((field) => {
                      const isRequired = isParentInfoRequired(selectedListingType.id as ListingTypeEnum);
                      return (
                        <DynamicFormField
                          key={field.name}
                          field={{
                            ...field,
                            required: isRequired ? (field.validation.required || false) : false,
                            label: field.uploadConfig?.customLabel || field.label,
                            fileConfig: field.type === 'file' ? {
                              minCount: isRequired ? field.validation.minCount : undefined,
                              maxCount: field.validation.maxCount,
                              accept: field.uploadConfig?.accept
                            } : undefined
                          }}
                          value={formData[field.name]}
                          onChange={handleFieldChange}
                          error={errors[field.name]}
                          layout="double"
                          category={field.uploadConfig?.category}
                          onPendingDeletionsChange={baseForm.handlePendingDeletions}
                          getDynamicLabel={baseForm.getDynamicLabel}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Father Information Section */}
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
              <div
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setShowFatherSection(!showFatherSection)}
                aria-expanded={showFatherSection}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 15c3 0 5-2 5-5v-2h-2v2c0 2-1 3-3 3s-3-1-3-3v-2H7v2c0 3 2 5 5 5z" />
                      <path d="M12 15v4m-2 0h4" />
                      <circle cx="12" cy="8" r="3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Father's Details</h3>
                    <p className="text-sm text-gray-500">
                      {isParentInfoRequired(selectedListingType.id as ListingTypeEnum) 
                        ? "Required information about the sire" 
                        : "Optional information about the sire"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isParentInfoRequired(selectedListingType.id as ListingTypeEnum) && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        Required
                      </span>
                    )}
                    {isParentInfoRequired(selectedListingType.id as ListingTypeEnum) && (
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${!baseForm.isParentSectionComplete('father')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                        {!baseForm.isParentSectionComplete('father') ? 'Incomplete' : 'Complete'}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${showFatherSection ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {showFatherSection && (
                <div className="border-t border-gray-100 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getParentFields('father').map((field) => {
                      const isRequired = isParentInfoRequired(selectedListingType.id as ListingTypeEnum);
                      return (
                        <DynamicFormField
                          key={field.name}
                          field={{
                            ...field,
                            required: isRequired ? (field.validation.required || false) : false,
                            label: field.uploadConfig?.customLabel || field.label,
                            fileConfig: field.type === 'file' ? {
                              minCount: isRequired ? field.validation.minCount : undefined,
                              maxCount: field.validation.maxCount,
                              accept: field.uploadConfig?.accept
                            } : undefined
                          }}
                          value={formData[field.name]}
                          onChange={handleFieldChange}
                          error={errors[field.name]}
                          layout="double"
                          category={field.uploadConfig?.category}
                          onPendingDeletionsChange={baseForm.handlePendingDeletions}
                          getDynamicLabel={baseForm.getDynamicLabel}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
