"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DynamicFormField from "@/_components/common/dynamic-form-field";
import { ListingField, getCommonFields, getContactFields, getDynamicFields, GENDER_FIELD } from "@/_config/listing-types";
import { isParentInfoRequired, getParentFields } from "@/_config/parent-fields";
import { useCreateListing } from "@/_services/hooks/listings/use-create-listing";
import { useUpdateListing } from "@/_services/hooks/listings/use-update-listing";
import { useDeletePendingFiles } from "@/_services/hooks/upload/use-delete-pending-files";
import { CreateListingDto, UpdateListingDto, ListingTypeEnum, ListingCategoryEnum } from "@/_types/listing";
import { toast } from "@/_hooks/use-toast";
import { LoadingButton } from "@/_components/ui/loading-button";
import { PUPPY_LITTER_LISTING_FIELD_CONFIG } from "./field-configs/puppy-litter-listing-config";
import { puppyLitterListingSchema } from "@/_config/validate-schema";
import BaseListingForm, { BaseFormProps } from "./base-listing-form";
import { scrollToFirstError } from "@/_utils/scroll-to-error";
import { ListingPaymentModal } from "@/_components/payments/listing-payment-modal";
import { createStripeSubscription, createPayPalSubscription, checkActiveSubscription } from "@/_lib/api/subscriptions";
import { isFeaturedAddonEligible, isSubscriptionType } from "@/_lib/pricing";
import { hasStripePriceId, hasPayPalPlanId } from "@/_config/subscription-prices";
import { getPaymentById } from "@/_lib/api/payments";

interface PuppyLitterListingFormProps extends BaseFormProps {}

// Custom component for individual puppies with single layout
const IndividualPuppiesField = ({ field, value, onChange, error, onPendingDeletionsChange, getDynamicLabel }: {
  field: any;
  value: any;
  onChange: (name: string, value: any, breedId?: string) => void;
  error?: string;
  onPendingDeletionsChange?: (fieldName: string, pendingUrls: string[]) => void;
  getDynamicLabel?: (fieldName: string, defaultLabel: string) => string;
}) => {
  const repeaterValue = Array.isArray(value) ? value : [];
  const config = field.repeaterConfig;
  const [collapsedItems, setCollapsedItems] = useState<Set<number>>(new Set());
  
  const addItem = () => {
    if (config?.subFieldType === 'group' && config.subFieldGroup) {
      const newItem: Record<string, any> = {};
      config.subFieldGroup.forEach((groupField: any) => {
        newItem[groupField.name] = groupField.type === 'checkbox' ? [] : '';
      });
      const newValue = [...repeaterValue, newItem];
      onChange(field.name, newValue);
    } else {
      const newValue = [...repeaterValue, ''];
      onChange(field.name, newValue);
    }
    
    // Collapse all existing puppies when adding a new one
    const newIndex = repeaterValue.length;
    setCollapsedItems(new Set([...Array(newIndex).keys()]));
    
    // Scroll to the new accordion after a brief delay to allow DOM update
    setTimeout(() => {
      const newAccordionElement = document.querySelector(`[data-puppy-index="${newIndex}"]`);
      if (newAccordionElement) {
        newAccordionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };
  
  const removeItem = (index: number) => {
    const newValue = repeaterValue.filter((_, i) => i !== index);
    onChange(field.name, newValue);
  };
  
  const updateItem = (index: number, fieldName: string, fieldValue: any) => {
    const newValue = [...repeaterValue];
    if (config?.subFieldType === 'group') {
      newValue[index] = { ...newValue[index], [fieldName]: fieldValue };
    } else {
      newValue[index] = fieldValue;
    }
    onChange(field.name, newValue);
  };

  const toggleCollapse = (index: number) => {
    setCollapsedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  const canAddMore = !config?.maxItems || repeaterValue.length < config.maxItems;
  const canRemove = !config?.minItems || repeaterValue.length > config.minItems;
  
  return (
    <div className="space-y-4">
      {repeaterValue.map((item, index) => (
        <div key={index} data-puppy-index={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm relative">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {field.label} {index + 1}
            </h4>
            
            <button
              type="button"
              onClick={() => toggleCollapse(index)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title={collapsedItems.has(index) ? 'Expand' : 'Collapse'}
            >
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  collapsedItems.has(index) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          
          {!collapsedItems.has(index) && (
            <>
              {config?.subFieldType === 'group' && config.subFieldGroup ? (
                <div className="grid grid-cols-1 gap-4">
                  {config.subFieldGroup.map((groupField: any) => (
                    <DynamicFormField
                      key={groupField.name}
                      field={groupField}
                      value={item?.[groupField.name] || (groupField.type === 'checkbox' ? [] : '')}
                      onChange={(name, val) => updateItem(index, name, val)}
                      error={error}
                      layout="single"
                      onPendingDeletionsChange={onPendingDeletionsChange}
                      getDynamicLabel={getDynamicLabel}
                    />
                  ))}
                </div>
                
              ) : null}
            </>
          )}
          
          {!collapsedItems.has(index) && canRemove && (
            <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors text-sm"
                title={config?.removeButtonText || 'Remove'}
              >
                Remove Puppy
              </button>
            </div>
          )}
        </div>
      ))}
      
      {canAddMore && (
        <button
          type="button"
          onClick={addItem}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {config?.addButtonText || 'Add Item'}
        </button>
      )}
    </div>
  );
};

export default function PuppyLitterListingForm({
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
}: PuppyLitterListingFormProps) {
  const router = useRouter();
  const createListingMutation = useCreateListing();
  const updateListingMutation = useUpdateListing();
  const deletePendingFilesMutation = useDeletePendingFiles();
  
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, string[]>>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMotherSection, setShowMotherSection] = useState(false);
  const [showFatherSection, setShowFatherSection] = useState(false);

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
    fieldConfig: PUPPY_LITTER_LISTING_FIELD_CONFIG
  });

  const handleFieldChange = (name: string, value: any, breedId?: string) => {
    // Special handling for listingType field to clear old data when switching
    if (name === 'listingType') {
      const currentListingType = formData.listingType;
      const newListingType = value;
      
      // If switching from litter to puppy, clear litter-specific data
      if (currentListingType === 'litter' && newListingType === 'puppy') {
        const updatedFormData = { ...formData };
        
        // Clear litter-specific fields
        delete updatedFormData.listLitterOption;
        delete updatedFormData.litterSize;
        delete updatedFormData.litterPuppyDetails;
        delete updatedFormData.individualPuppiesLitter;
        delete updatedFormData.microchipNumbers;
        
        // Clear microchip number fields
        Object.keys(updatedFormData).forEach(key => {
          if (key.startsWith('microchipNumber_')) {
            delete updatedFormData[key];
          }
        });
        
        // Set the new listing type
        updatedFormData[name] = value;
        
        setFormData(updatedFormData);
        return;
      }
      
      // If switching from puppy to litter, clear puppy-specific data
      if (currentListingType === 'puppy' && newListingType === 'litter') {
        const updatedFormData = { ...formData };
        
        // Clear puppy-specific fields
        delete updatedFormData.microchipNumber;
        delete updatedFormData.puppyImages;
        delete updatedFormData.puppyGender;
        delete updatedFormData.puppyColour;
        delete updatedFormData.puppyDateOfBirth;
        delete updatedFormData.vaccinationStatus;
        delete updatedFormData.individualPuppies;
        
        // Set the new listing type
        updatedFormData[name] = value;
        
        setFormData(updatedFormData);
        return;
      }
    }
    
    baseForm.handleFieldChange(name, value, breedId);
  };

  const handlePendingDeletions = (fieldName: string, urls: string[]) => {
    setPendingDeletions(prev => ({
      ...prev,
      [fieldName]: urls
    }));
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
  const createListingAfterPayment = async (isFeatured: boolean, paymentId: string, paymentData?: { isFeatured: boolean; paymentMethod: string; paymentId: string }) => {
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

      // Clean up litter-specific fields when switching to single puppy mode
      if (formData.listingType === 'puppy') {
        // Remove litter-specific fields that shouldn't be saved for single puppy
        delete dynamicData.litterSize;
        delete dynamicData.litterPuppyDetails;
        delete dynamicData.individualPuppiesLitter;
        delete dynamicData.microchipNumbers;
        
        // Clean up microchip number fields (microchipNumber_0, microchipNumber_1, etc.)
        Object.keys(dynamicData).forEach(key => {
          if (key.startsWith('microchipNumber_')) {
            delete dynamicData[key];
          }
        });
      }

      // Process puppy details for same-details option
      if (formData.listLitterOption === 'same-details' && formData.litterSize) {
        const litterSize = parseInt(formData.litterSize) || 1;
        const microchipNumbers: string[] = [];
        
        // Collect microchip numbers
        for (let i = 0; i < litterSize; i++) {
          const microchipKey = `microchipNumber_${i}`;
          if (formData[microchipKey]) {
            microchipNumbers.push(formData[microchipKey]);
          }
        }
        
        if (microchipNumbers.length > 0) {
          dynamicData.microchipNumbers = microchipNumbers;
        }

        // Create individual puppy records for same-details option
        const individualPuppies: any[] = [];
        
        // Deduplicate puppy images to prevent duplicates
        const uniquePuppyImages = formData.puppyImages ? [...new Set(formData.puppyImages)] : [];
        
        for (let i = 0; i < litterSize; i++) {
          const puppyData: any = {
            microchipNumber: formData[`microchipNumber_${i}`] || '',
            puppyImages: uniquePuppyImages, // Use deduplicated images
            puppyGender: formData.puppyGender || '',
            puppyColour: formData.puppyColour || '',
            puppyDateOfBirth: formData.puppyDateOfBirth || '',
            vaccinationStatus: formData.vaccinationStatus || ''
          };
          
          // Only add if at least microchip number is provided
          if (puppyData.microchipNumber) {
            individualPuppies.push(puppyData);
          }
        }
        
        if (individualPuppies.length > 0) {
          dynamicData.individualPuppies = individualPuppies;
        }
      }

      // Process single puppy data when listing type is 'puppy'
      if (formData.listingType === 'puppy') {
        // Add listLitterOption to indicate this is a single puppy
        dynamicData.listLitterOption = 'single-puppy';
        
        // Create individual puppy record for single puppy
        const singlePuppyData: any = {
          microchipNumber: formData.microchipNumber || '',
          puppyImages: formData.puppyImages || [],
          puppyGender: formData.puppyGender || '',
          puppyColour: formData.puppyColour || '',
          puppyDateOfBirth: formData.puppyDateOfBirth || '',
          vaccinationStatus: formData.vaccinationStatus || ''
        };
        
        // Always add the single puppy data (validation will catch if required fields are missing)
        dynamicData.individualPuppies = [singlePuppyData];
      }

      // Validate the processed data using the puppy litter schema
      try {
        // Include all formData fields for validation, not just processed ones
        // Also ensure required fields have default values if missing for proper validation
        const dataToValidate = {
          listingType: formData.listingType || 'litter',
          pricingOption: formData.pricingOption || 'fixedPrice',
          deliveryOptions: formData.deliveryOptions || [],
          dnaResults: formData.dnaResults || [],
          ...formData,
          ...commonData,
          ...dynamicData
        };
        const validatedData = puppyLitterListingSchema.parse(dataToValidate);
        console.log('Form validation passed:', validatedData);
      } catch (error: any) {
        console.log('Form data:', formData);
        console.log('Dynamic data:', dynamicData);
        console.error('Form validation failed:', error);
        const validationErrors: Record<string, string> = {};
        
        if (error.errors) {
          error.errors.forEach((err: any) => {
            const fieldName = err.path.join('.');
            validationErrors[fieldName] = err.message;
          });
        } else if (error.message) {
          // Handle refine errors that might not have a path
          validationErrors._form = error.message;
        }
        
        setErrors(validationErrors);
        
        // Show specific error messages if available
        const errorCount = Object.keys(validationErrors).length;
        const firstError = Object.values(validationErrors)[0];
        console.log("PUPPY LISTING FORM VALIDATION ERRORS", errors);
        toast({
          title: errorCount === 1 ? firstError : 'Please fix the errors before submitting.',
          description: errorCount > 1 ? `${errorCount} field(s) need attention` : undefined,
          variant: 'destructive',
        });
        // Scroll to first error field
        setTimeout(() => {
          scrollToFirstError(validationErrors);
        }, 100);
        setIsSubmitting(false);
        return;
      }

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
      const price = commonData.price || formData.pricePerPuppy || formData.fixedPrice || null;

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
        
        // For all subscription listing types, subscription is already created in payment modal
        // We just need to link it to the listing
        // paymentId here is actually subscriptionId for subscription types
        if ((hasStripePriceId(selectedListingType.id as ListingTypeEnum) || hasPayPalPlanId(selectedListingType.id as ListingTypeEnum) || isSubscriptionType(selectedListingType.id as ListingTypeEnum)) && paymentId) {
          console.log('🔔 [Frontend] Linking subscription to listing:', { listingId: createdListing.id, subscriptionId: paymentId, listingType: selectedListingType.id });
          await updateListingMutation.mutateAsync({
            id: createdListing.id,
            data: { subscriptionId: paymentId } // paymentId is actually subscriptionId
          });
          console.log('✅ [Frontend] Listing linked to subscription');
        }
        // For other listing types, if featured add-on is selected, create a subscription for it
        else if (isFeatured && isFeaturedAddonEligible(selectedListingType.id as ListingTypeEnum)) {
          try {
            console.log('🔔 [Frontend] Creating featured add-on subscription for listing:', {
              listingId: createdListing.id,
              listingType: selectedListingType.id,
              paymentId,
            });
            
            const paymentMethod = paymentData?.paymentMethod || 'stripe';
            console.log('🔔 [Frontend] Payment method:', paymentMethod);
            
            // For featured add-on, we create a subscription with the listing type and includesFeatured=true
            // The backend will handle creating a subscription with only the featured add-on price
            if (paymentMethod === 'paypal') {
              console.log('🔔 [Frontend] Creating PayPal subscription...');
              const subscriptionResponse = await createPayPalSubscription({
                listingType: selectedListingType.id as string,
                listingId: createdListing.id,
                includesFeatured: true,
              });
              
              console.log('✅ [Frontend] Featured add-on PayPal subscription created:', subscriptionResponse);
              
              // Update listing with subscription ID
              if (subscriptionResponse.subscriptionId) {
                console.log('🔔 [Frontend] Updating listing with subscription ID:', subscriptionResponse.subscriptionId);
                await updateListingMutation.mutateAsync({
                  id: createdListing.id,
                  data: { subscriptionId: subscriptionResponse.subscriptionId }
                });
                console.log('✅ [Frontend] Listing updated with subscription ID');
              }
              
              // Redirect to PayPal approval if needed
              if (subscriptionResponse.approvalUrl) {
                console.log('🔔 [Frontend] Redirecting to PayPal approval URL');
                window.location.href = subscriptionResponse.approvalUrl;
                return; // Don't continue with navigation
              }
            } else {
              // For Stripe, fetch payment details to get payment method ID
              try {
                console.log('🔔 [Frontend] Fetching payment details for paymentId:', paymentId);
                const paymentDetails = await getPaymentById(paymentId);
                console.log('✅ [Frontend] Payment details fetched:', {
                  paymentId: paymentDetails.id,
                  paymentMethodId: paymentDetails.paymentMethodId,
                  amount: paymentDetails.amount,
                });
                
                if (!paymentDetails.paymentMethodId) {
                  const error = 'Payment method ID not found in payment record';
                  console.error('❌ [Frontend]', error, paymentDetails);
                  throw new Error(error);
                }

                console.log('🔔 [Frontend] Creating Stripe subscription with payment method:', paymentDetails.paymentMethodId);
                
                const subscriptionResponse = await createStripeSubscription({
                  listingType: selectedListingType.id as string,
                  listingId: createdListing.id,
                  paymentMethodId: paymentDetails.paymentMethodId,
                  includesFeatured: true,
                });
                
                console.log('✅ [Frontend] Featured add-on Stripe subscription created:', subscriptionResponse);
                
                // Update listing with subscription ID
                if (subscriptionResponse.subscriptionId) {
                  console.log('🔔 [Frontend] Updating listing with subscription ID:', subscriptionResponse.subscriptionId);
                  await updateListingMutation.mutateAsync({
                    id: createdListing.id,
                    data: { subscriptionId: subscriptionResponse.subscriptionId }
                  });
                  console.log('✅ [Frontend] Listing updated with subscription ID');
                }
              } catch (stripeError: any) {
                console.error('❌ [Frontend] Error creating Stripe subscription for featured add-on:', {
                  error: stripeError,
                  message: stripeError.message,
                  stack: stripeError.stack,
                  listingId: createdListing.id,
                  paymentId,
                });
                toast({
                  title: 'Listing created but subscription setup failed',
                  description: stripeError.message || 'Please contact support to set up your featured subscription',
                  variant: 'destructive',
                });
              }
            }
          } catch (subscriptionError: any) {
            console.error('❌ [Frontend] Error creating featured add-on subscription:', {
              error: subscriptionError,
              message: subscriptionError.message,
              stack: subscriptionError.stack,
              listingId: createdListing.id,
              isFeatured,
              listingType: selectedListingType.id,
            });
            // Don't fail the listing creation if subscription creation fails
            toast({
              title: 'Listing created but subscription setup failed',
              description: subscriptionError.message || 'Please contact support to set up your featured subscription',
              variant: 'destructive',
            });
          }
        } else {
          console.log('ℹ️ [Frontend] No subscription needed:', {
            isFeatured,
            isEligible: isFeaturedAddonEligible(selectedListingType.id as ListingTypeEnum),
            listingType: selectedListingType.id,
          });
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

    if (!baseForm.validateForm()) {
      console.log("PUPPY LITTER LISTING FORM VALIDATION ERRORS", errors);
      toast({
        title: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      setTimeout(() => {
        scrollToFirstError(errors);
      }, 100);
      return;
    }

    // Additional validation for puppy litter listing
    try {
      const commonFields = getCommonFields(selectedListingType);
      const dynamicFields = getDynamicFields(selectedListingType);
      const commonData: Record<string, any> = {};
      commonFields.forEach(field => {
        // Include all fields, even if empty, so schema can validate them
        if (formData[field.name] !== undefined) {
          commonData[field.name] = formData[field.name];
        }
      });

      const dynamicData: Record<string, any> = {};
      dynamicFields.forEach(field => {
        // Include all fields, even if empty, so schema can validate them
        if (formData[field.name] !== undefined) {
          dynamicData[field.name] = formData[field.name];
        }
      });

      // Clean up litter-specific fields when switching to single puppy mode
      if (formData.listingType === 'puppy') {
        Object.keys(dynamicData).forEach(key => {
          if (key.startsWith('microchipNumber_')) {
            delete dynamicData[key];
          }
        });
      }

      // Include all formData fields for validation, not just non-empty ones
      // Also ensure required fields have default values if missing for proper validation
      const dataToValidate = {
        listingType: formData.listingType || 'litter',
        pricingOption: formData.pricingOption || 'fixedPrice',
        deliveryOptions: formData.deliveryOptions || [],
        dnaResults: formData.dnaResults || [],
        ...formData,
        ...commonData,
        ...dynamicData
      };
      await puppyLitterListingSchema.parseAsync(dataToValidate);
    } catch (error: any) {
      const validationErrors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const fieldName = err.path.join('.');
          validationErrors[fieldName] = err.message;
        });
      } else if (error.message) {
        // Handle refine errors that might not have a path
        validationErrors._form = error.message;
      }
      setErrors(validationErrors);
      
      // Show specific error messages if available
      const errorCount = Object.keys(validationErrors).length;
      const firstError = Object.values(validationErrors)[0];
      toast({
        title: errorCount === 1 ? firstError : 'Please fix the errors before submitting.',
        description: errorCount > 1 ? `${errorCount} field(s) need attention` : undefined,
        variant: 'destructive',
      });
      setTimeout(() => {
        scrollToFirstError(validationErrors);
      }, 100);
      return;
    }

    // Skip payment for edit mode
    if (editId) {
      await createListingAfterPayment(false);
      return;
    }

    // For subscription listing types, check if user already has an active subscription
    const listingType = selectedListingType.id as ListingTypeEnum;
    if (isSubscriptionType(listingType)) {
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
  const specialRequiredFields = selectedListingType.requiredFields.filter((field: ListingField) => field.fieldCategory === 'special');
  const dynamicOptionalFields = selectedListingType.optionalFields.filter((field: ListingField) => field.fieldCategory === 'dynamic');

  return (
    <div className="w-full">
      {/* Special Information - Listing Type Selection */}
      {specialRequiredFields.length > 0 && baseForm.renderFieldGroup(specialRequiredFields, 'Listing Type', 'required')}
      
      {/* Basic Information */}
      {commonFields.length > 0 && baseForm.renderFieldGroup(commonFields, 'Basic Information', 'basic')}

      {/* Required Information */}
      {dynamicRequiredFields.length > 0 && (
        <div className="w-full">
          <h2 className="text-[32px] font-medium mt-8 max-md:text-[28px] max-md:mt-10">Required Information</h2>
          
          {/* Registration Number field - at the very top */}
          {(() => {
            const registrationFields = dynamicRequiredFields.filter(field => 
              field.name === 'registrationNumber' && 
              baseForm.shouldDisplayField(field)
            );
            
            if (registrationFields.length > 0) {
              return (
                <div className="grid grid-cols-1 gap-6 w-full max-md:gap-4 mb-6">
                  {registrationFields.map((field) => (
                    <div key={field.name} className="w-full">
                      <DynamicFormField
                        field={field}
                        value={formData[field.name]}
                        onChange={handleFieldChange}
                        error={errors[field.name]}
                        layout="single"
                        onPendingDeletionsChange={handlePendingDeletions}
                        getDynamicLabel={baseForm.getDynamicLabel}
                      />
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })()}
          
          {/* Pricing fields */}
          {(() => {
            const pricingFields = dynamicRequiredFields.filter(field => 
              PUPPY_LITTER_LISTING_FIELD_CONFIG.layouts.pricing.includes(field.name) && 
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
                        onPendingDeletionsChange={handlePendingDeletions}
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
                        onPendingDeletionsChange={handlePendingDeletions}
                        getDynamicLabel={baseForm.getDynamicLabel}
                      />
                    </div>
                  ))}
                  
                  {/* Min/Max Price - Side by Side with Gray Background */}
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
                            onPendingDeletionsChange={handlePendingDeletions}
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
          
          {/* Litter Options - Only show when "Litter" is selected */}
          {formData.listingType === 'litter' && (() => {
            const litterFields = dynamicRequiredFields.filter(field => 
              ['listLitterOption', 'litterSize'].includes(field.name) && 
              baseForm.shouldDisplayField(field)
            );
            
            if (litterFields.length > 0) {
              return (
                <div className="grid grid-cols-1 gap-6 w-full max-md:gap-4 mb-6">
                  {litterFields.map((field) => (
                    <div key={field.name} className="w-full">
                      <DynamicFormField
                        field={field}
                        value={formData[field.name]}
                        onChange={handleFieldChange}
                        error={errors[field.name]}
                        layout="single"
                        onPendingDeletionsChange={handlePendingDeletions}
                        getDynamicLabel={baseForm.getDynamicLabel}
                      />
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })()}

          {/* Litter Puppy Details - Only show when "Litter" is selected and "same-details" option is chosen */}
          {formData.listingType === 'litter' && formData.listLitterOption === 'same-details' && (() => {
            const litterPuppyFields = dynamicRequiredFields.filter(field => 
              field.name === 'litterPuppyDetails' && 
              baseForm.shouldDisplayField(field)
            );
            
            if (litterPuppyFields.length > 0) {
              const field = litterPuppyFields[0];
              const litterSize = parseInt(formData.litterSize) || 1;
              const groupFields = field.groupConfig?.fields || [];
              
              return (
                <div className="grid grid-cols-1 gap-6 w-full max-md:gap-4 mb-6">
                  <div key={field.name} className="w-full">
                    <div className="space-y-4 p-4 border-2 border-bcolor rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 gap-4">
                        {groupFields.map((groupField) => {
                          // Special handling for microchip numbers - show multiple based on litter size
                          if (groupField.name === 'microchipNumber') {
                            return (
                              <div key={groupField.name} className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                  Microchip Numbers *
                                </label>
                                <p className="text-sm text-gray-500">
                                  Enter microchip numbers for all {litterSize} puppy(ies)
                                </p>
                                {Array.from({ length: litterSize }, (_, index) => {
                                  const microchipKey = `microchipNumber_${index}`;
                                  const microchipError = errors[microchipKey];
                                  return (
                                    <div key={index} className="space-y-1">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-600 w-20">
                                          Puppy {index + 1}:
                                        </span>
                                        <div className="flex-1">
                                          <input
                                            type="text"
                                            placeholder="Enter microchip number"
                                            value={formData[microchipKey] || ''}
                                            onChange={(e) => handleFieldChange(microchipKey, e.target.value)}
                                            className={`text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border max-md:h-12 ${
                                              microchipError 
                                                ? 'border-red-500 focus:border-red-500' 
                                                : 'border-[#B5B5B5] focus:border-gray-400'
                                            }`}
                                          />
                                          {microchipError && (
                                            <p className="text-sm text-red-500 mt-1 ml-6">{microchipError}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          
                          // Regular field rendering for other fields
                          return (
                            <DynamicFormField
                              key={groupField.name}
                              field={groupField}
                              value={formData[groupField.name] || ''}
                              onChange={handleFieldChange}
                              error={errors[groupField.name]}
                              layout="single"
                              onPendingDeletionsChange={handlePendingDeletions}
                              getDynamicLabel={baseForm.getDynamicLabel}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Individual Puppies - Only show when "Litter" is selected and "add-individually" option is chosen */}
          {formData.listingType === 'litter' && formData.listLitterOption === 'add-individually' && (() => {
            const individualPuppyFields = dynamicRequiredFields.filter(field => 
              field.name === 'individualPuppiesLitter' && 
              baseForm.shouldDisplayField(field)
            );
            
            if (individualPuppyFields.length > 0) {
              const field = individualPuppyFields[0];
              return (
                <div className="grid grid-cols-1 gap-6 w-full max-md:gap-4 mb-6">
                  <div key={field.name} className="w-full">
                    <div className="space-y-4 p-4 border-2 border-bcolor rounded-lg bg-gray-50">
                      <IndividualPuppiesField
                        field={field}
                        value={formData[field.name]}
                        onChange={handleFieldChange}
                        error={errors[field.name]}
                        onPendingDeletionsChange={handlePendingDeletions}
                        getDynamicLabel={baseForm.getDynamicLabel}
                      />
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Single Puppy Details - Only show when "Puppy" is selected */}
          {formData.listingType === 'puppy' && (() => {
            const singlePuppyFields = dynamicRequiredFields.filter(field => 
              field.name === 'individualPuppies' && 
              baseForm.shouldDisplayField(field)
            );
            
            if (singlePuppyFields.length > 0) {
              const field = singlePuppyFields[0];
              const groupFields = field.repeaterConfig?.subFieldGroup || [];
              
              return (
                <div className="grid grid-cols-1 gap-6 w-full max-md:gap-4 mb-6">
                  <div key={field.name} className="w-full">
                    <div className="space-y-4 p-4 border-2 border-bcolor rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 gap-4">
                        {groupFields.map((groupField: any) => (
                          <DynamicFormField
                            key={groupField.name}
                            field={groupField}
                            value={formData[groupField.name] || (groupField.type === 'checkbox' ? [] : '')}
                            onChange={handleFieldChange}
                            error={errors[groupField.name]}
                            layout="single"
                            onPendingDeletionsChange={handlePendingDeletions}
                            getDynamicLabel={baseForm.getDynamicLabel}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
           {/* Other required fields */}
           {(() => {
             const nonPricingFields = dynamicRequiredFields.filter(field => 
               !PUPPY_LITTER_LISTING_FIELD_CONFIG.layouts.pricing.includes(field.name) && 
               !['registrationNumber', 'listLitterOption', 'litterSize', 'litterPuppyDetails', 'individualPuppies', 'individualPuppiesLitter'].includes(field.name) &&
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
                data-parent-type="mother"
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
                data-parent-type="father"
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
          console.log('selectedListingType:', selectedListingType);
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
