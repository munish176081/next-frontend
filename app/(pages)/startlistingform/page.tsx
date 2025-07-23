"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GoBackButton from "@/_components/common/go-back-button";
import DynamicFormField from "@/_components/common/dynamic-form-field";
import { 
  getListingTypeById, 
  ListingField, 
  getCommonFields, 
  getContactFields, 
  getMediaFields, 
  getDynamicFields 
} from "@/_config/listing-types";
import { useCreateListing } from "@/_services/hooks/listings/use-create-listing";
import { useUpdateListing } from "@/_services/hooks/listings/use-update-listing";
import { useGetListingById } from "@/_services/hooks/listings/use-get-listing-by-id";
import { CreateListingDto, UpdateListingDto, ListingTypeEnum, ListingCategoryEnum } from "@/_types/listing";
import { toast } from "@/_hooks/use-toast";

export const dynamic = 'force-dynamic';

const listingTips = [
  {
    title: "1. Upload Clear, Bright Photos",
    points: [
      "Minimum 4 high-quality photos",
      "Include front, side, and close-up shots",
      "Ensure good lighting and no filters",
    ],
    image: "/images/vectors/listtingDetailImage1.png",
    alignRight: true,
  },
  {
    title: "2. Write a Detailed Description",
    points: [
      "Mention the breed, personality, health, and temperament",
      "Include vaccination and training info",
    ],
    image: "/images/vectors/listtingDetailImage2.png",
    alignRight: false,
  },
  {
    title: "3. Be Honest & Transparent",
    points: [
      "Include real facts: age, breed, microchip, location",
      "Add any quirks to build trust",
    ],
    image: "/images/vectors/listtingDetailImage3.png",
    alignRight: true,
  },
  {
    title: "4. Add a Short Video",
    points: [
      "10-30 seconds of playtime/interaction",
      "Shows energy, behavior, and charm",
    ],
    image: "/images/vectors/listtingDetailImage4.png",
    alignRight: false,
  },
  {
    title: '5. Use the "DNA Verified" Badge',
    points: [
      "Adds credibility and increases trust",
      "Available for DNA-tested purebred pups",
    ],
    image: "/images/vectors/listtingDetailImage5.png",
    alignRight: true,
  },
];

function Startlistingform() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedListingType, setSelectedListingType] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createListingMutation = useCreateListing();
  const updateListingMutation = useUpdateListing();
  
  // Get edit parameters
  const editId = searchParams.get('edit');
  const type = searchParams.get('type');
  
  // Fetch listing data if in edit mode
  const { data: existingListing, isLoading: isLoadingListing, error: listingError } = useGetListingById(editId);
  
  console.log('Edit mode debug:', {
    editId,
    type,
    existingListing,
    isLoadingListing,
    listingError,
    formData: {
      images: formData.images,
      videos: formData.videos,
      documents: formData.documents
    }
  });

  useEffect(() => {
    const listingType = type || searchParams.get('type');
    if (listingType) {
      const listingData = getListingTypeById(listingType);
      setSelectedListingType(listingData);
      
      if (listingData) {
        // Initialize form data
        const initialData: Record<string, any> = {};
        [...listingData.requiredFields, ...listingData.optionalFields].forEach(field => {
          if (field.type === 'checkbox') {
            initialData[field.name] = [];
          } else {
            initialData[field.name] = '';
          }
        });
        
        // If editing, populate with existing data
        if (existingListing) {
          console.log('Loading existing listing data:', existingListing);
          
          // Populate common fields from dedicated DB columns
          if (existingListing.title) initialData.title = existingListing.title;
          if (existingListing.description) initialData.description = existingListing.description;
          if (existingListing.breed) initialData.breed = existingListing.breed;
          if (existingListing.price) initialData.price = existingListing.price;
          if (existingListing.location) initialData.location = existingListing.location;
          
          // Populate contact info from metadata
          if (existingListing.metadata?.contactInfo) {
            const contact = existingListing.metadata.contactInfo;
            if (contact.name) initialData.contactName = contact.name;
            if (contact.email) initialData.contactEmail = contact.email;
            if (contact.phone) initialData.contactPhone = contact.phone;
            if (contact.location) initialData.contactLocation = contact.location;
          }
          
          // Populate media files from metadata
          if (existingListing.metadata?.images) {
            initialData.images = existingListing.metadata.images;
          }
          if (existingListing.metadata?.videos) {
            initialData.videos = existingListing.metadata.videos;
          }
          if (existingListing.metadata?.documents) {
            initialData.documents = existingListing.metadata.documents;
          }
          
          // Populate dynamic fields from the listing's fields
          if (existingListing.fields) {
            Object.entries(existingListing.fields).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                initialData[key] = value;
              }
            });
          }
        }
        
        setFormData(initialData);
      }
    }
  }, [searchParams, existingListing]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!selectedListingType) return false;

    const newErrors: Record<string, string> = {};

    // Validate required fields
    selectedListingType.requiredFields.forEach((field: ListingField) => {
      const value = formData[field.name];
      
      if (field.required) {
        if (field.type === 'checkbox') {
          if (!Array.isArray(value) || value.length === 0) {
            newErrors[field.name] = `${field.label} is required`;
          }
        } else if (field.type === 'file') {
          // For file fields, check if we have the required number of uploaded URLs
          const urls = Array.isArray(value) ? value : [];
          if (field.fileConfig?.minCount && urls.length < field.fileConfig.minCount) {
            newErrors[field.name] = `Please upload at least ${field.fileConfig.minCount} ${field.fileConfig.accept?.includes('image/*') ? 'photo(s)' : 'file(s)'}`;
          }
        } else if (!value || value.toString().trim() === '') {
          newErrors[field.name] = `${field.label} is required`;
        }
      }

      // Additional validation for specific field types
      if (field.type === 'number' && value) {
        const numValue = parseFloat(value);
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          newErrors[field.name] = `${field.label} must be at most ${field.validation.max}`;
        }
      }

      // File validation for non-required fields
      if (field.type === 'file' && !field.required && value && field.fileConfig?.minCount) {
        const urls = Array.isArray(value) ? value : [];
        if (urls.length > 0 && urls.length < field.fileConfig.minCount) {
          newErrors[field.name] = `Please upload at least ${field.fileConfig.minCount} ${field.fileConfig.accept?.includes('image/*') ? 'photo(s)' : 'file(s)'}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Separate form data by category
      const commonFields = getCommonFields(selectedListingType);
      const contactFields = getContactFields(selectedListingType);
      const mediaFields = getMediaFields(selectedListingType);
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

      // Extract price from various possible fields
      const price = commonData.price || formData.pricePerPuppy || formData.fee || null;

      if (editId) {
        // Update existing listing
        const updateData: UpdateListingDto = {
          title: commonData.title,
          description: commonData.description,
          price: price ? parseFloat(price) : undefined,
          breed: commonData.breed,
          location: commonData.location,
          fields: dynamicData,
          contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
          images: allImages.length > 0 ? allImages : undefined,
          videos: allVideos.length > 0 ? allVideos : undefined,
          documents: allDocuments.length > 0 ? allDocuments : undefined,
          tags: extractTags(commonData, dynamicData),
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
          category: getCategoryFromType(selectedListingType.id as ListingTypeEnum),
          price: price ? parseFloat(price) : undefined,
          breed: commonData.breed,
          location: commonData.location,
          fields: dynamicData,
          contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
          images: allImages.length > 0 ? allImages : undefined,
          videos: allVideos.length > 0 ? allVideos : undefined,
          documents: allDocuments.length > 0 ? allDocuments : undefined,
          tags: extractTags(commonData, dynamicData),
          isFeatured: false,
          isPremium: false,
        };

        await createListingMutation.mutateAsync(listingData);
      }
      
      // Success toast is handled by the mutation
      // Add a small delay to ensure the user sees the success message
      setTimeout(() => {
        router.push('/account/listings');
      }, 1500);
      
    } catch (error) {
      // Error toast is handled by the mutation
      console.error('Error submitting listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryFromType = (type: ListingTypeEnum): ListingCategoryEnum => {
    const categoryMap: Record<ListingTypeEnum, ListingCategoryEnum> = {
      [ListingTypeEnum.SEMEN_LISTING]: ListingCategoryEnum.BREEDING,
      [ListingTypeEnum.PUPPY_LISTING]: ListingCategoryEnum.PUPPY,
      [ListingTypeEnum.STUD_LISTING]: ListingCategoryEnum.BREEDING,
      [ListingTypeEnum.FUTURE_LISTING]: ListingCategoryEnum.PUPPY,
      [ListingTypeEnum.WANTED_LISTING]: ListingCategoryEnum.WANTED,
      [ListingTypeEnum.OTHER_SERVICES]: ListingCategoryEnum.SERVICE,
    };
    return categoryMap[type];
  };

  const extractTags = (commonData: Record<string, any>, dynamicData: Record<string, any>): string[] => {
    const tags: string[] = [];
    
    // Add breed as tag
    if (commonData.breed) {
      tags.push(commonData.breed.toLowerCase());
    }
    
    // Add listing type as tag
    if (selectedListingType) {
      tags.push(selectedListingType.id.toLowerCase());
    }
    
    // Add location as tag
    if (commonData.location) {
      tags.push(commonData.location.toLowerCase());
    }
    
    return tags;
  };

  if (isLoadingListing) {
    return (
      <div className="container p-8">
        <div className="text-center">
          <h1 className="text-2xl font-medium">Loading listing...</h1>
          <p className="text-gray-600 mt-2">Please wait while we load your listing data.</p>
        </div>
      </div>
    );
  }

  if (listingError) {
    console.error('Error loading listing:', listingError);
    return (
      <div className="container p-8">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-red-600">Error loading listing</h1>
          <p className="text-gray-600 mt-2">Failed to load listing data. Please try again.</p>
          <pre className="mt-4 text-xs text-left bg-gray-100 p-4 rounded">
            {JSON.stringify(listingError, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (!selectedListingType) {
    return (
      <div className="container p-8">
        <div className="text-center">
          <h1 className="text-2xl font-medium">No listing type selected</h1>
          <p className="text-gray-600 mt-2">Please go back and select a listing type.</p>
        </div>
      </div>
    );
  }

  const renderFieldGroup = (fields: ListingField[], title: string) => {
    if (fields.length === 0) return null;

    // Separate fields that should be in single row vs two columns
    const singleRowFields = fields.filter(field => 
      field.type === 'textarea' || 
      field.type === 'file' || 
      field.name === 'title' ||
      field.name === 'description' ||
      field.name === 'serviceTitle' ||
      field.name === 'registrationNumber' ||
      field.name === 'serviceCategory'
    );
    
    const twoColumnFields = fields.filter(field => 
      !singleRowFields.includes(field)
    );

    return (
      <div className="w-full">
        <h2 className="text-[32px] font-medium mt-8 max-md:text-[28px] max-md:mt-10">{title}</h2>

        {/* Single row fields */}
        <div className="grid grid-cols-1 gap-6 w-full max-md:gap-4">
          {singleRowFields.map((field) => (
            <DynamicFormField
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={handleFieldChange}
              error={errors[field.name]}
              layout="single"
            />
          ))}
        </div>

        {/* Two column fields */}
        {twoColumnFields.length > 0 && (
          <div className="grid grid-cols-2 gap-6 w-full max-md:grid-cols-1 max-md:gap-4">
            {twoColumnFields.map((field) => (
              <DynamicFormField
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={handleFieldChange}
                error={errors[field.name]}
                layout="double"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Get categorized fields
  const commonFields = getCommonFields(selectedListingType);
  const contactFields = getContactFields(selectedListingType);
  const dynamicRequiredFields = selectedListingType.requiredFields.filter((field: ListingField) => field.fieldCategory === 'dynamic');
  const dynamicOptionalFields = selectedListingType.optionalFields.filter((field: ListingField) => field.fieldCategory === 'dynamic');

  return (
    <>
    <section className="container grid grid-cols-2 gap-8 max-md:p-4 max-md:gap-4 rounded-40 p-8 bg-white relative max-md:grid-cols-1">
      <div className="absolute left-8 top-8 max-md:top-4 max-md:left-4 max-md:static max-w-max">
        <GoBackButton />
      </div>
      <div className="flex max-md:w-full flex-col items-start max-md:p-0">
        <span className="text-[32px] font-medium mt-16 max-md:text-[28px] max-md:mt-0">
          {editId ? 'Edit listing' : 'Start a new listing'}
        </span>
        
        {/* Selected Listing Type Display */}
        <div className="w-full mt-4 p-4 bg-gray-50 border border-gray-200 rounded-20">
          <span className="text-sm text-gray-600">Selected Listing Type:</span>
          <div className="mt-1">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{selectedListingType.title}</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">{selectedListingType.price}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{selectedListingType.description}</p>
          </div>
        </div>

        {/* Common Fields */}
        {commonFields.length > 0 && renderFieldGroup(commonFields, 'Basic Information')}

        {/* Required Dynamic Fields */}
        {dynamicRequiredFields.length > 0 && renderFieldGroup(dynamicRequiredFields, 'Required Information')}

        {/* Optional Dynamic Fields */}
        {dynamicOptionalFields.length > 0 && renderFieldGroup(dynamicOptionalFields, 'Additional Information')}

        {/* Contact Details Section */}
        {contactFields.length > 0 && (
          <div className="w-full mt-6">
            <span className="text-[32px] font-medium max-md:text-[28px] max-md:mt-10">Contact Details</span>
            <div className="grid grid-cols-2 gap-6 w-full max-md:grid-cols-1 max-md:gap-4">
              {contactFields.map((field) => (
                <DynamicFormField
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  onChange={handleFieldChange}
                  error={errors[field.name]}
                  layout="double"
                />
              ))}
            </div>
          </div>
        )}

        <button 
          className="w-full h-20 bg-black text-white text-[22px] rounded-full mt-7 max-md:h-12 max-md:text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Submit'}
        </button>
      </div>
      <div className="flex max-md:w-full flex-col gap-6 bg-listingBG bg-cover h-full bg-bottom rounded-40 border border-black/20 max-md:hidden">
        <div className="flex relative flex-col h-full justify-evenly">
          <span className="text-5xl font-medium w-full text-center">Create a Winning Ad!</span>
          {listingTips.map((tip, i) => (
            <div key={i} className="flex flex-col relative mb-12">
              <img className={`absolute ${tip.alignRight ? "right-0" : "left-0"} -top-12 z-10`} src={tip.image} alt={`Tip ${i + 1}`}/>
              <div className={`bg-[#4D4D4D]/15 border border-black/30 backdrop-blur-xl p-8 ${tip.alignRight ? "pr-20 rounded-r-full" : "pl-24 rounded-l-full ml-auto"} w-[calc(100%-60px)] text-white gap-5 min-h-60 flex flex-col justify-center`}>
                <span className="text-3xl font-medium">{tip.title}</span>
                <ul className="list-disc list-outside pl-4 text-xl font-medium">
                  {tip.points.map((point, j) => (<li key={j}>{point}</li>))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Startlistingform />
    </Suspense>
  );
}
