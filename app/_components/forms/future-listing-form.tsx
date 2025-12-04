"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { axios } from "@/_lib/axios";
import DynamicFormField from "@/_components/common/dynamic-form-field";
import { ListingField, getCommonFields, getContactFields, getDynamicFields, getAllFields } from "@/_config/listing-types";
import { isParentInfoRequired, getParentFields } from "@/_config/parent-fields";
import { useCreateListing } from "@/_services/hooks/listings/use-create-listing";
import { useUpdateListing } from "@/_services/hooks/listings/use-update-listing";
import { CreateListingDto, UpdateListingDto, ListingTypeEnum, ListingCategoryEnum, ListingStatusEnum } from "@/_types/listing";
import { isSubscriptionType } from "@/_lib/pricing";
import { hasStripePriceId, hasPayPalPlanId } from "@/_config/subscription-prices";
import { toast } from "@/_hooks/use-toast";
import { LoadingButton } from "@/_components/ui/loading-button";
import { FUTURE_LISTING_FIELD_CONFIG } from "./field-configs/future-listing-config";
import BaseListingForm, { BaseFormProps } from "./base-listing-form";
import { scrollToFirstError } from "@/_utils/scroll-to-error";
import { ListingPaymentModal } from "@/_components/payments/listing-payment-modal";

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
  const queryClient = useQueryClient();
  const createListingMutation = useCreateListing();
  const updateListingMutation = useUpdateListing();
  
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, string[]>>({});
  const [showMotherSection, setShowMotherSection] = useState(false);
  const [showFatherSection, setShowFatherSection] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [draftListingId, setDraftListingId] = useState<string | null>(null);

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

    // Get first image or video
    const allImages: string[] = [];
    const allVideos: string[] = [];
    const dynamicFields = getDynamicFields(selectedListingType);
    dynamicFields.forEach(field => {
      if (field.type === 'file' && formData[field.name]) {
        const files = Array.isArray(formData[field.name]) ? formData[field.name] : [];
        if (field.fileConfig?.accept?.includes('image/*')) {
          allImages.push(...files);
        } else if (field.fileConfig?.accept?.includes('video/*')) {
          allVideos.push(...files);
        }
      }
    });

    return {
      title: commonData.title || '',
      breed: commonData.breed || '',
      location: commonData.location || '',
      image: allImages[0] || allVideos[0] || undefined,
      images: allImages, // All available images
    };
  };

  // Extract form data into structured format
  const extractFormData = () => {
    const commonFields = getCommonFields(selectedListingType);
    const contactFields = getContactFields(selectedListingType);
    const mediaFields = getDynamicFields(selectedListingType).filter(field => field.type === 'file');
    const dynamicFields = getDynamicFields(selectedListingType);
    const allFields = getAllFields(selectedListingType);

    // Extract common fields
    const commonData: Record<string, any> = {};
    commonFields.forEach(field => {
      if (formData[field.name] !== undefined && formData[field.name] !== '') {
        commonData[field.name] = formData[field.name];
      }
    });

    // Extract contact info
    const contactInfo: Record<string, any> = {};
    contactFields.forEach(field => {
      if (formData[field.name] !== undefined && formData[field.name] !== '') {
        contactInfo[field.name.replace('contact', '').toLowerCase()] = formData[field.name];
      }
    });

    // Extract media files
    const mediaData: Record<string, any> = {};
    mediaFields.forEach(field => {
      if (formData[field.name] && Array.isArray(formData[field.name])) {
        mediaData[field.name] = formData[field.name];
      }
    });

    // Extract dynamic fields
    const dynamicData: Record<string, any> = {};
    dynamicFields.forEach(field => {
      const fieldValue = formData[field.name];
      if (fieldValue !== undefined) {
        dynamicData[field.name] = fieldValue;
      }
    });
    
    // Ensure registrationNumber is always included
    const registrationField = allFields.find(f => f.name === 'registrationNumber');
    if (registrationField) {
      dynamicData.registrationNumber = formData.registrationNumber !== undefined 
        ? formData.registrationNumber 
        : '';
    }
    
    // Always include hideAddress (from location field toggle)
    // This field is not in the configured fields but is set by the location field toggle
    // Explicitly set as boolean (false if not true)
    dynamicData.hideAddress = Boolean(formData.hideAddress);

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

    // Collect all file fields
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

    // Extract price
    const price = commonData.price || formData.fixedPrice || null;

    return {
      commonData,
      contactInfo,
      dynamicData,
      allImages,
      allVideos,
      allDocuments,
      metadata,
      motherInfo,
      fatherInfo,
      price,
    };
  };

  // Create draft listing before payment
  const createDraftListing = async (isFeatured: boolean): Promise<string> => {
    setIsSubmitting(true);
    try {
      const { commonData, contactInfo, dynamicData, allImages, allVideos, allDocuments, metadata, motherInfo, fatherInfo, price } = extractFormData();

      // Ensure hideAddress is explicitly set (force include even if false)
      dynamicData.hideAddress = Boolean(formData.hideAddress);
      
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
        status: ListingStatusEnum.DRAFT,
      } as CreateListingDto & { status?: ListingStatusEnum };

      const createdListing = await createListingMutation.mutateAsync(listingData);
      return createdListing.id;
    } catch (error: any) {
      console.error('Error creating draft listing:', error);
      toast({
        title: 'Error creating draft listing',
        description: error.message || 'Failed to create draft listing.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Activate listing after payment success
  // Link payment/subscription to listing after payment success (change DRAFT to PENDING_REVIEW for admin approval)
  const activateListing = async (listingId: string, subscriptionId?: string, paymentId?: string, isPayPal: boolean = false) => {
    setIsSubmitting(true);
    try {
      const updateData: UpdateListingDto & { status?: ListingStatusEnum; subscriptionId?: string } = {};

      if (subscriptionId) {
        updateData.subscriptionId = subscriptionId;
      } else if (paymentId) {
        updateData.paymentId = paymentId;
      }

      // For PayPal: Keep status as DRAFT until webhook processes it (will show "Payment Processing")
      // For Stripe: Set to PENDING_REVIEW immediately (webhook processes faster)
      if (!isPayPal) {
        updateData.status = ListingStatusEnum.PENDING_REVIEW;
      }
      // For PayPal, don't set status - let webhook change it from DRAFT to PENDING_REVIEW

      await updateListingMutation.mutateAsync({
        id: listingId,
        data: updateData,
      });

      console.log('✅ [activateListing] Payment processed successfully, showing toast', {
        listingId,
        isPayPal,
        subscriptionId,
        paymentId
      });

      // Show success toast for both PayPal and Stripe payments
      toast({
        title: 'Payment Successful!',
        description: 'Your listing has been submitted and is pending admin approval. You will be notified once it is approved.',
        variant: 'success',
      });
      
      console.log('✅ [activateListing] Toast called');

      setIsSubmitted(true);
      await baseForm.deleteAllPendingFiles();
      
      // Delay navigation slightly to ensure toast is visible
      setTimeout(() => {
        router.push(`/account/listings`);
      }, 500);
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Error updating listing',
        description: error.message || 'Failed to update listing after payment.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing draft listing with current form data
  const updateDraftListing = async (listingId: string): Promise<void> => {
    try {
      const { commonData, contactInfo, dynamicData, allImages, allVideos, allDocuments, metadata, motherInfo, fatherInfo, price } = extractFormData();

      // Ensure hideAddress is explicitly set (force include even if false)
      dynamicData.hideAddress = Boolean(formData.hideAddress);

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
        id: listingId,
        data: updateData,
      });
    } catch (error: any) {
      console.error('Error updating draft listing:', error);
      toast({
        title: 'Error updating draft listing',
        description: error.message || 'Failed to update draft listing.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // DEPRECATED: Keep for backward compatibility but use createDraftListing + activateListing instead
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
        // Ensure hideAddress is explicitly set (force include even if false)
        dynamicData.hideAddress = Boolean(formData.hideAddress);
        
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
        
        // Mark as submitted to prevent further clicks
        setIsSubmitted(true);

        // Delete pending files from R2 after successful form submission
        const deleteResult = await baseForm.deleteAllPendingFiles();
        if (!deleteResult.success) {
          console.warn('Some pending files could not be deleted:', deleteResult.message);
        }

        // Navigate to explore detail page
        // router.push(`/explore/${editId}`);
        router.push(`/account/listings`);
        return;
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
            data: { subscriptionId: paymentId } as UpdateListingDto & { subscriptionId?: string } // paymentId is actually subscriptionId
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

      // Navigate to explore detail page
      router.push(`/account/listings`);

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

    // Check for existing draft listing before creating a new one
    let existingDraftId = draftListingId || sessionStorage.getItem('pendingListingId');
    
    // If no existing draft, create a new one
    if (!existingDraftId) {
      try {
        // Store current form data in session storage before redirecting to PayPal
        sessionStorage.setItem('pendingFormData', JSON.stringify(formData));

        const newDraftListingId = await createDraftListing(false);
        setDraftListingId(newDraftListingId);
        sessionStorage.setItem('pendingListingId', newDraftListingId);
        existingDraftId = newDraftListingId;
      } catch (error) {
        console.error('Error in handleSubmit before payment:', error);
        return;
      }
    } else {
      // Reuse existing draft - update form data in session storage and update draft in database
      sessionStorage.setItem('pendingFormData', JSON.stringify(formData));
      // Ensure state is synced with sessionStorage
      if (!draftListingId && existingDraftId) {
        setDraftListingId(existingDraftId);
      }
      // Update the draft listing in database with current form data
      try {
        setIsSubmitting(true);
        await updateDraftListing(existingDraftId);
        console.log('✅ Draft listing updated successfully with ID:', existingDraftId);
        setIsSubmitting(false);
      } catch (error: any) {
        console.error('❌ Error updating draft listing:', error);
        setIsSubmitting(false);
        toast({
          title: 'Warning: Could not update draft listing',
          description: 'Your changes are saved in session. The draft will be updated when you complete payment.',
          variant: 'default',
        });
        // Continue anyway - the form data is in sessionStorage and will be used during payment
      }
    }

    // Show payment modal with existing or newly created draft listing
    console.log('Opening payment modal with draft listing ID:', existingDraftId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: { isFeatured: boolean; paymentMethod: string; paymentId: string; subscriptionId?: string }) => {
    try {
      const listingId = draftListingId || sessionStorage.getItem('pendingListingId');
      if (!listingId) {
        throw new Error('Draft listing ID not found');
      }

      // For subscription types, use subscriptionId if provided, otherwise use paymentId
      const listingTypeCheck = selectedListingType.id as ListingTypeEnum;
      const isSubscription = hasStripePriceId(listingTypeCheck) || hasPayPalPlanId(listingTypeCheck) || isSubscriptionType(listingTypeCheck);
      const subscriptionId = paymentData.subscriptionId || (isSubscription ? paymentData.paymentId : undefined);
      
      console.log('🔔 [Form] Payment success, activating listing:', {
        listingId,
        paymentId: paymentData.paymentId,
        subscriptionId,
        listingType: selectedListingType.id,
        isSubscription
      });

      // For PayPal, the webhook might take a moment, so we'll poll for status updates
      const isPayPal = paymentData.paymentMethod === 'paypal';
      
      console.log('🔔 [handlePaymentSuccess] About to activate listing', {
        listingId,
        isPayPal,
        paymentId: paymentData.paymentId,
        subscriptionId,
        paymentMethod: paymentData.paymentMethod
      });
      
      // For PayPal: Keep as DRAFT (will show "Payment Processing" until webhook processes)
      // For Stripe: Set to PENDING_REVIEW immediately
      await activateListing(listingId, subscriptionId, paymentData.paymentId, isPayPal);
      
      console.log('✅ [handlePaymentSuccess] activateListing completed');
      
      // For PayPal subscriptions, poll for status update from webhook
      if (isPayPal && isSubscription) {
        let pollCount = 0;
        const maxPolls = 10; // Poll for up to 10 seconds (10 * 1 second intervals)
        const pollInterval = 1000; // 1 second

        const pollListingStatus = setInterval(async () => {
          pollCount++;
          try {
            const { data: listing } = await axios.get(`/listings/${listingId}`);
            
            // If status is no longer DRAFT, webhook has processed
            if (listing.status !== ListingStatusEnum.DRAFT) {
              clearInterval(pollListingStatus);
              // Invalidate queries to refresh listing data
              queryClient.invalidateQueries({ queryKey: ['current-user-listing', listingId] });
              queryClient.invalidateQueries({ queryKey: ['user-listings'] });
              queryClient.invalidateQueries({ queryKey: ['current-user-listings'] });
            } else if (pollCount >= maxPolls) {
              clearInterval(pollListingStatus);
              // Max polls reached, status will update on next page refresh
            }
          } catch (error) {
            console.error('Error polling listing status:', error);
            clearInterval(pollListingStatus);
          }
        }, pollInterval);
      }
      
      // Clear session storage
      sessionStorage.removeItem('pendingListingId');
      sessionStorage.removeItem('pendingFormData');
      setDraftListingId(null);
    } catch (error: any) {
      console.error('Error activating listing after payment:', error);
      toast({
        title: 'Error activating listing',
        description: error.message || 'Failed to activate listing after payment',
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 parentInfo">
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
        disabled={isSubmitting || isSubmitted || baseForm.isAnyUploadInProgress}
        loading={isSubmitting }
      >
        Submit
      </LoadingButton>

      {/* Payment Modal */}
      <ListingPaymentModal
        open={showPaymentModal}
        listingId={draftListingId || undefined}
        onOpenChange={(open) => {
          console.log('Payment modal onOpenChange:', open);
          setShowPaymentModal(open);
        }}
        listingType={selectedListingType.id as ListingTypeEnum}
        listingTitle={getListingPreviewData().title}
        listingBreed={getListingPreviewData().breed}
        listingLocation={getListingPreviewData().location}
        listingImage={getListingPreviewData().image}
        listingImages={getListingPreviewData().images}
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
