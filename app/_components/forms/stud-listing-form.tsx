"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DynamicFormField from "@/_components/common/dynamic-form-field";
import { ListingField, getCommonFields, getContactFields, getDynamicFields, GENDER_FIELD } from "@/_config/listing-types";
import { isParentInfoRequired, getParentFields } from "@/_config/parent-fields";
import { useCreateListing } from "@/_services/hooks/listings/use-create-listing";
import { useUpdateListing } from "@/_services/hooks/listings/use-update-listing";
import { CreateListingDto, UpdateListingDto, ListingTypeEnum, ListingCategoryEnum, ListingStatusEnum } from "@/_types/listing";
import { isSubscriptionType } from "@/_lib/pricing";
import { hasStripePriceId, hasPayPalPlanId } from "@/_config/subscription-prices";
import { toast } from "@/_hooks/use-toast";
import { LoadingButton } from "@/_components/ui/loading-button";
import { STUD_LISTING_FIELD_CONFIG } from "./field-configs/stud-listing-config";
import BaseListingForm, { BaseFormProps } from "./base-listing-form";
import { scrollToFirstError } from "@/_utils/scroll-to-error";
import { ListingPaymentModal } from "@/_components/payments/listing-payment-modal";

interface StudListingFormProps extends BaseFormProps {}

export default function StudListingForm({
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
}: StudListingFormProps) {
  const router = useRouter();
  const createListingMutation = useCreateListing();
  const updateListingMutation = useUpdateListing();
  
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, string[]>>({});
  const [showMotherSection, setShowMotherSection] = useState(false);
  const [showFatherSection, setShowFatherSection] = useState(false);
  const [showStudSection, setShowStudSection] = useState(false);
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
    fieldConfig: STUD_LISTING_FIELD_CONFIG
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

  // Extract form data into structured format
  const extractFormData = () => {
    const commonFields = getCommonFields(selectedListingType);
    const contactFields = getContactFields(selectedListingType);
    const mediaFields = getDynamicFields(selectedListingType).filter(field => field.type === 'file');
    const dynamicFields = getDynamicFields(selectedListingType);

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
      if (formData[field.name] !== undefined && formData[field.name] !== '') {
        dynamicData[field.name] = formData[field.name];
      }
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

    const studInfo = {
      name: formData.gender === 'bitch' ? formData.bitchName : formData.studName,
      breed: formData.gender === 'bitch' ? formData.bitchBreed : formData.studBreed,
      color: formData.gender === 'bitch' ? formData.bitchColor : formData.studColor,
      weight: formData.gender === 'bitch' ? formData.bitchWeight : formData.studWeight,
      temperament: formData.gender === 'bitch' ? formData.bitchTemperament : formData.studTemperament,
      healthInfo: formData.gender === 'bitch' ? formData.bitchHealthInfo : formData.studHealthInfo
    };

    // Extract parent media
    const motherImages = formData.motherImages || [];
    const fatherImages = formData.fatherImages || [];
    const studImages = formData.gender === 'bitch' ? (formData.bitchImages || []) : (formData.studImages || []);
    const motherVideos = formData.motherVideos || [];
    const fatherVideos = formData.fatherVideos || [];
    const studVideos = formData.gender === 'bitch' ? (formData.bitchVideos || []) : (formData.studVideos || []);

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
    if (studImages.length > 0) {
      if (formData.gender === 'bitch') {
        metadata.bitchImages = studImages;
      } else {
        metadata.studImages = studImages;
      }
    }
    if (motherVideos.length > 0) metadata.motherVideos = motherVideos;
    if (fatherVideos.length > 0) metadata.fatherVideos = fatherVideos;
    if (studVideos.length > 0) {
      if (formData.gender === 'bitch') {
        metadata.bitchVideos = studVideos;
      } else {
        metadata.studVideos = studVideos;
      }
    }

    // Extract price
    const price = commonData.price || formData.fee || null;

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
      studInfo,
      price,
    };
  };

  // Create draft listing before payment
  const createDraftListing = async (isFeatured: boolean): Promise<string> => {
    setIsSubmitting(true);
    try {
      const { commonData, contactInfo, dynamicData, allImages, allVideos, allDocuments, metadata, motherInfo, fatherInfo, studInfo, price } = extractFormData();

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
        studInfo: Object.values(studInfo).some(v => v) ? studInfo : undefined,
        images: allImages.length > 0 ? allImages : undefined,
        videos: allVideos.length > 0 ? allVideos : undefined,
        documents: allDocuments.length > 0 ? allDocuments : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        tags: baseForm.extractTags(commonData, dynamicData),
        isFeatured: isFeatured,
        isPremium: false,
        status: ListingStatusEnum.DRAFT,
        isActive: false,
      };

      const createdListing = await createListingMutation.mutateAsync(listingData);
      toast({
        title: 'Draft Listing Created',
        description: 'Your listing has been saved as a draft. Proceed to payment to publish it.',
        variant: 'default',
      });
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
  const activateListing = async (listingId: string, subscriptionId?: string, paymentId?: string) => {
    setIsSubmitting(true);
    try {
      const updateData: UpdateListingDto = {
        status: ListingStatusEnum.ACTIVE,
        isActive: true,
      };

      if (subscriptionId) {
        updateData.subscriptionId = subscriptionId;
      } else if (paymentId) {
        updateData.paymentId = paymentId;
      }

      await updateListingMutation.mutateAsync({
        id: listingId,
        data: updateData,
      });

      toast({
        title: 'Listing Published!',
        description: 'Your listing is now live.',
        variant: 'success',
      });

      setIsSubmitted(true);
      await baseForm.deleteAllPendingFiles();
      router.push('/account/listings');
    } catch (error: any) {
      console.error('Error activating listing:', error);
      toast({
        title: 'Error publishing listing',
        description: error.message || 'Failed to activate listing after payment.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
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
        if (formData[field.name] !== undefined && formData[field.name] !== '') {
          dynamicData[field.name] = formData[field.name];
        }
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

      const studInfo = {
        name: formData.gender === 'bitch' ? formData.bitchName : formData.studName,
        breed: formData.gender === 'bitch' ? formData.bitchBreed : formData.studBreed,
        color: formData.gender === 'bitch' ? formData.bitchColor : formData.studColor,
        weight: formData.gender === 'bitch' ? formData.bitchWeight : formData.studWeight,
        temperament: formData.gender === 'bitch' ? formData.bitchTemperament : formData.studTemperament,
        healthInfo: formData.gender === 'bitch' ? formData.bitchHealthInfo : formData.studHealthInfo
      };

      // Extract parent media
      const motherImages = formData.motherImages || [];
      const fatherImages = formData.fatherImages || [];
      const studImages = formData.gender === 'bitch' ? (formData.bitchImages || []) : (formData.studImages || []);
      const motherVideos = formData.motherVideos || [];
      const fatherVideos = formData.fatherVideos || [];
      const studVideos = formData.gender === 'bitch' ? (formData.bitchVideos || []) : (formData.studVideos || []);

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
      if (studImages.length > 0) {
        if (formData.gender === 'bitch') {
          metadata.bitchImages = studImages;
        } else {
          metadata.studImages = studImages;
        }
      }
      if (motherVideos.length > 0) metadata.motherVideos = motherVideos;
      if (fatherVideos.length > 0) metadata.fatherVideos = fatherVideos;
      if (studVideos.length > 0) {
        if (formData.gender === 'bitch') {
          metadata.bitchVideos = studVideos;
        } else {
          metadata.studVideos = studVideos;
        }
      }

      // Extract price from various possible fields
      const price = commonData.price || formData.fee || null;

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
          studInfo: Object.values(studInfo).some(v => v) ? studInfo : undefined,
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
          studInfo: Object.values(studInfo).some(v => v) ? studInfo : undefined,
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

    // Create draft listing before opening payment modal
    try {
      // Store current form data in session storage before redirecting to PayPal
      sessionStorage.setItem('pendingFormData', JSON.stringify(formData));

      const draftListingId = await createDraftListing(false);
      setDraftListingId(draftListingId);
      sessionStorage.setItem('pendingListingId', draftListingId);

      // Show payment modal for new listings
      console.log('Opening payment modal with draft listing ID:', draftListingId);
    setShowPaymentModal(true);
    } catch (error) {
      console.error('Error in handleSubmit before payment:', error);
    }
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

      await activateListing(listingId, subscriptionId, paymentData.paymentId);
      
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
  const studdynamicRequiredFields = [
    ...selectedListingType.requiredFields.filter((field: ListingField) => field.fieldCategory === 'studDynamic'),
    ...selectedListingType.optionalFields.filter((field: ListingField) => field.fieldCategory === 'studDynamic')
  ];
  const dynamicOptionalFields = selectedListingType.optionalFields.filter((field: ListingField) => field.fieldCategory === 'dynamic');

  return (
    <div className="w-full">
      {/* Gender Selection - Only for Stud Listings - At the very top */}
      <div className="w-full mt-6">
        <DynamicFormField
          field={GENDER_FIELD}
          value={formData.gender}
          onChange={handleFieldChange}
          error={errors.gender}
          layout="single"
          getDynamicLabel={baseForm.getDynamicLabel}
        />
      </div>

      {/* Basic Information */}
      {commonFields.length > 0 && baseForm.renderFieldGroup(commonFields, 'Basic Information', 'basic')}

      {/* Required Information */}
      {dynamicRequiredFields.length > 0 && baseForm.renderFieldGroup(dynamicRequiredFields, 'Required Information', 'required')}
      {studdynamicRequiredFields.length > 0 && baseForm.renderFieldGroup(studdynamicRequiredFields, 'Required Information', 'required', false)}

      {/* Additional Information */}
      {dynamicOptionalFields.length > 0 && baseForm.renderFieldGroup(dynamicOptionalFields, 'Additional Information', 'additional')}

      {/* Stud/Bitch Details Section */}
      <div className="w-full mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-100 pb-4">
          {formData.gender === 'bitch' ? 'Bitch Details' : 'Stud Details'}
        </h2>

        <div className="space-y-6">
          {/* Stud Information Section - Only show for stud listings */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <div
              className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setShowStudSection(!showStudSection)}
              aria-expanded={showStudSection}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-50 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 15c3 0 5-2 5-5v-2h-2v2c0 2-1 3-3 3s-3-1-3-3v-2H7v2c0 3 2 5 5 5z" />
                    <circle cx="12" cy="8" r="3" />
                    <path d="M12 15v4m-2 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {formData.gender === 'bitch' ? 'Bitch Details' : 'Stud Details'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isParentInfoRequired(selectedListingType.id as ListingTypeEnum) 
                      ? `Required information about the ${formData.gender === 'bitch' ? 'bitch' : 'stud'}` 
                      : `Optional information about the ${formData.gender === 'bitch' ? 'bitch' : 'stud'}`}
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
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${!baseForm.isParentSectionComplete(formData.gender === 'bitch' ? 'bitch' : 'stud')
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                      {!baseForm.isParentSectionComplete(formData.gender === 'bitch' ? 'bitch' : 'stud') ? 'Incomplete' : 'Complete'}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${showStudSection ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {showStudSection && (
              <div className="border-t border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getParentFields(formData.gender === 'bitch' ? 'bitch' : 'stud').map((field) => {
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

          {/* Mother Information Section - Only show for non-semen listings */}
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
