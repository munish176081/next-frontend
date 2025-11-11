"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GoBackButton from "@/_components/common/go-back-button";
import {
  getListingTypeById,
  getListingTypeByShortCode,
  ListingField,
  getCommonFields,
  getContactFields,
  getMediaFields,
  getDynamicFields,
  GENDER_FIELD
} from "@/_config/listing-types";
import { isParentInfoRequired, getParentFields } from "@/_config/parent-fields";
import { useCreateListing } from "@/_services/hooks/listings/use-create-listing";
import { useUpdateListing } from "@/_services/hooks/listings/use-update-listing";
import { useGetListingById } from "@/_services/hooks/listings/use-get-listing-by-id";
import { useDeletePendingFiles } from "@/_services/hooks/upload/use-delete-pending-files";
import { CreateListingDto, UpdateListingDto, ListingTypeEnum, ListingCategoryEnum } from "@/_types/listing";
import { toast } from "@/_hooks/use-toast";
import { LoadingButton } from "@/_components/ui/loading-button";
import ListingFormFactory from "@/_components/forms/listing-form-factory";

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Helper function to get dynamic labels based on gender selection
  const getDynamicLabel = (fieldName: string, defaultLabel: string) => {
    if (fieldName === 'fee') {
      // Use the current gender value or default to 'stud' if not set
      const currentGender = formData.gender || 'stud';
      console.log('getDynamicLabel - fieldName:', fieldName, 'currentGender:', currentGender, 'formData.gender:', formData.gender);
      return currentGender === 'bitch' 
        ? 'Price for Bitch Service' 
        : 'Price for Stud Service';
    }
    return defaultLabel;
  };

  // Add breedId to track the selected breed ID separately
  const [breedId, setBreedId] = useState<string | undefined>();

  const createListingMutation = useCreateListing();
  const updateListingMutation = useUpdateListing();
  const deletePendingFilesMutation = useDeletePendingFiles();
  
  // Track pending deletions across all file fields
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, string[]>>({});

  // Get edit parameters
  const editId = searchParams.get('edit');
  const type = searchParams.get('type');

  // Redirect puppy type to puppy_litter (we don't have normal puppy listing)
  useEffect(() => {
    if (type === 'puppy' && !editId) {
      router.replace('/startlistingform?type=puppy_litter');
    }
  }, [type, editId, router]);

  // Fetch listing data if in edit mode
  const { data: existingListing, isLoading: isLoadingListing, error: listingError, refetch } = useGetListingById(editId);

  // Force refetch when navigating to edit mode to ensure fresh data
  useEffect(() => {
    if (editId) {
      refetch();
    }
  }, [editId, refetch]);

  // Cleanup effect to handle abandoned forms
  useEffect(() => {
    return () => {
      // If user navigates away without submitting, clear pending deletions
      // This prevents orphaned files from being deleted later
      if (!isSubmitted && Object.keys(pendingDeletions).length > 0) {
        console.log('Form abandoned - clearing pending deletions');
        setPendingDeletions({});
      }
    };
  }, [isSubmitted, pendingDeletions]);

  
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
    console.log('URL type parameter:', listingType);

    if (listingType) {
      // Try to get listing type by short code first, then by full ID for backward compatibility
      const listingData = getListingTypeByShortCode(listingType) || getListingTypeById(listingType);
      console.log('Resolved listing type:', listingData?.id);
      setSelectedListingType(listingData);

      if (listingData) {
        // Initialize form data
        const initialData: Record<string, any> = {};
        [...listingData.requiredFields, ...listingData.optionalFields].forEach(field => {
          if (field.name === 'deliveryOptions') {
            initialData[field.name] = ['Pickup'];
          } else if (field.type === 'checkbox') {
            initialData[field.name] = [];
          } else if (field.name === 'pricingOption') {
            // Set default value for pricing option to fixed price
            initialData[field.name] = 'fixedPrice';
          } else if (field.name === 'listingType') {
            // Set default value for listing type to 'litter'
            initialData[field.name] = 'litter';
          } else if (field.name === 'listLitterOption') {
            // Set default value for litter listing option to 'same-details'
            initialData[field.name] = 'same-details';
          } else if (field.name === 'litterSize') {
            // Set default value for litter size
            initialData[field.name] = 1;
          } else if (field.name === 'individualPuppies') {
            // Initialize individual puppies as empty array
            initialData[field.name] = [];
          }
          else {
            initialData[field.name] = '';
          }
        });

        // Initialize gender field for stud listings
        if (listingData.id === 'STUD_LISTING') {
          initialData.gender = 'stud';
        }

        // Initialize parent fields
        const motherFields = getParentFields('mother');
        const fatherFields = getParentFields('father');
        
        // Only initialize stud fields for stud listings
        const fieldsToInitialize = [...motherFields, ...fatherFields];
        if (selectedListingType?.id === ListingTypeEnum.STUD_LISTING) {
          const studFields = getParentFields('stud');
          fieldsToInitialize.push(...studFields);
        }

        fieldsToInitialize.forEach(field => {
          if (field.type === 'file') {
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
          if (existingListing.breed) {
            // For wanted listings, use breedWanted field name
            if (selectedListingType?.id === 'WANTED_LISTING') {
              initialData.breedWanted = existingListing.breed;
            } else {
              initialData.breed = existingListing.breed;
            }
          }
          if (existingListing.breedId) setBreedId(existingListing.breedId);
          if (existingListing.price) initialData.price = existingListing.price;
          if (existingListing.price) initialData.fee = existingListing.price; // Also populate fee field for stud listings
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

          // Populate parent media from metadata
          if (existingListing.metadata?.motherImages) {
            initialData.motherImages = existingListing.metadata.motherImages;
          }
          if (existingListing.metadata?.fatherImages) {
            initialData.fatherImages = existingListing.metadata.fatherImages;
          }
          if (existingListing.metadata?.motherVideos) {
            initialData.motherVideos = existingListing.metadata.motherVideos;
          }
          if (existingListing.metadata?.fatherVideos) {
            initialData.fatherVideos = existingListing.metadata.fatherVideos;
          }
          if (existingListing.metadata?.studImages) {
            initialData.studImages = existingListing.metadata.studImages;
          }
          if (existingListing.metadata?.bitchImages) {
            initialData.bitchImages = existingListing.metadata.bitchImages;
          }
          if (existingListing.metadata?.studVideos) {
            initialData.studVideos = existingListing.metadata.studVideos;
          }
          if (existingListing.metadata?.bitchVideos) {
            initialData.bitchVideos = existingListing.metadata.bitchVideos;
          }

          // Populate parent info from dedicated columns
          if (existingListing.motherInfo) {
            initialData.motherName = existingListing.motherInfo.name;
            initialData.motherBreed = existingListing.motherInfo.breed;
            initialData.motherColor = existingListing.motherInfo.color;
            initialData.motherWeight = existingListing.motherInfo.weight;
            initialData.motherTemperament = existingListing.motherInfo.temperament;
            initialData.motherHealthInfo = existingListing.motherInfo.healthInfo;
          }

          if (existingListing.fatherInfo) {
            initialData.fatherName = existingListing.fatherInfo.name;
            initialData.fatherBreed = existingListing.fatherInfo.breed;
            initialData.fatherColor = existingListing.fatherInfo.color;
            initialData.fatherWeight = existingListing.fatherInfo.weight;
            initialData.fatherTemperament = existingListing.fatherInfo.temperament;
            initialData.fatherHealthInfo = existingListing.fatherInfo.healthInfo;
          }

          if (existingListing.studInfo) {
            // Check if this is a bitch or stud based on the gender field
            const isBitch = existingListing.fields?.gender === 'bitch';
            if (isBitch) {
              initialData.bitchName = existingListing.studInfo.name;
              initialData.bitchBreed = existingListing.studInfo.breed;
              initialData.bitchColor = existingListing.studInfo.color;
              initialData.bitchWeight = existingListing.studInfo.weight;
              initialData.bitchTemperament = existingListing.studInfo.temperament;
              initialData.bitchHealthInfo = existingListing.studInfo.healthInfo;
            } else {
              initialData.studName = existingListing.studInfo.name;
              initialData.studBreed = existingListing.studInfo.breed;
              initialData.studColor = existingListing.studInfo.color;
              initialData.studWeight = existingListing.studInfo.weight;
              initialData.studTemperament = existingListing.studInfo.temperament;
              initialData.studHealthInfo = existingListing.studInfo.healthInfo;
            }
          }

          // Populate dynamic fields from the listing's fields
          if (existingListing.fields) {
            Object.entries(existingListing.fields).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                initialData[key] = value;
              }
            });
          }

          // Special handling for puppy litter listings - load individual puppy data
          if (selectedListingType?.id === 'PUPPY_LITTER_LISTING' && existingListing.fields) {
            // Load individual puppies data
            if (existingListing.fields.individualPuppies && Array.isArray(existingListing.fields.individualPuppies)) {
              initialData.individualPuppies = existingListing.fields.individualPuppies;
            }

            // Load microchip numbers for same-details option
            console.log('🔍 Debug microchip loading:', {
              listLitterOption: existingListing.fields.listLitterOption,
              hasMicrochipNumbers: !!existingListing.fields.microchipNumbers,
              hasIndividualPuppies: !!existingListing.fields.individualPuppies,
              individualPuppies: existingListing.fields.individualPuppies
            });
            
            // First try the old format (microchipNumbers array)
            if (existingListing.fields.microchipNumbers && Array.isArray(existingListing.fields.microchipNumbers)) {
              console.log('📱 Loading microchip numbers from old format');
              const microchipNumbers = existingListing.fields.microchipNumbers;
              microchipNumbers.forEach((microchip: string, index: number) => {
                initialData[`microchipNumber_${index}`] = microchip;
                console.log(`📱 Set microchipNumber_${index}:`, microchip);
              });
            }
            // Then try the new format (individualPuppies array)
            else if (existingListing.fields.individualPuppies && Array.isArray(existingListing.fields.individualPuppies)) {
              console.log('📱 Loading microchip numbers from individualPuppies format');
              existingListing.fields.individualPuppies.forEach((puppy: any, index: number) => {
                if (puppy.microchipNumber) {
                  initialData[`microchipNumber_${index}`] = puppy.microchipNumber;
                  console.log(`📱 Set microchipNumber_${index} from puppy:`, puppy.microchipNumber);
                }
              });
            }

            // Load shared puppy details for same-details option
            if (existingListing.fields.listLitterOption === 'same-details' && existingListing.fields.individualPuppies?.length > 0) {
              const firstPuppy = existingListing.fields.individualPuppies[0];
              if (firstPuppy) {
                // For puppy litter listings, use only the first puppy's images (not all puppies)
                // This prevents duplication when the same image is used for all puppies
                initialData.puppyImages = firstPuppy.puppyImages || [];
                initialData.puppyGender = firstPuppy.puppyGender || '';
                initialData.puppyColour = firstPuppy.puppyColour || '';
                initialData.puppyDateOfBirth = firstPuppy.puppyDateOfBirth || '';
                initialData.vaccinationStatus = firstPuppy.vaccinationStatus || '';
                
                console.log('📱 Loaded puppy images for litter:', {
                  puppyImages: initialData.puppyImages,
                  firstPuppyImages: firstPuppy.puppyImages,
                  individualPuppies: existingListing.fields.individualPuppies.map((p: any) => p.puppyImages)
                });
              }
            }

            // Load single puppy details for single-puppy option
            if (existingListing.fields.listLitterOption === 'single-puppy' && existingListing.fields.individualPuppies?.length > 0) {
              // Set listing type to 'puppy' for single puppy listings
              initialData.listingType = 'puppy';
              
              const singlePuppy = existingListing.fields.individualPuppies[0];
              if (singlePuppy) {
                initialData.puppyImages = singlePuppy.puppyImages || [];
                initialData.puppyGender = singlePuppy.puppyGender || '';
                initialData.puppyColour = singlePuppy.puppyColour || '';
                initialData.puppyDateOfBirth = singlePuppy.puppyDateOfBirth || '';
                initialData.vaccinationStatus = singlePuppy.vaccinationStatus || '';
                initialData.microchipNumber = singlePuppy.microchipNumber || '';
              }
            }
          }

          // Ensure gender field is properly set for stud listings
          if (selectedListingType?.id === 'STUD_LISTING' && existingListing.fields?.gender) {
            initialData.gender = existingListing.fields.gender;
          }

          // Special handling for wanted listings - populate fields from different sources
          if (selectedListingType?.id === 'WANTED_LISTING') {
            console.log('🔍 Wanted listing edit debug:');
            console.log('📊 Existing listing:', existingListing);
            console.log('📋 Fields object:', existingListing.fields);
            console.log('✅ breedWanted already set above:', initialData.breedWanted);
            
            // Populate other wanted listing fields from the fields object
            if (existingListing.fields) {
              // Map the fields to the correct form field names
              if (existingListing.fields.preferredGender) {
                initialData.preferredGender = existingListing.fields.preferredGender;
                console.log('✅ Set preferredGender:', existingListing.fields.preferredGender);
              }
              if (existingListing.fields.budget) {
                initialData.budget = existingListing.fields.budget;
                console.log('✅ Set budget:', existingListing.fields.budget);
              }
              if (existingListing.fields.agePreference) {
                initialData.agePreference = existingListing.fields.agePreference;
                console.log('✅ Set agePreference:', existingListing.fields.agePreference);
              }
              if (existingListing.fields.specificColor) {
                initialData.specificColor = existingListing.fields.specificColor;
                console.log('✅ Set specificColor:', existingListing.fields.specificColor);
              }
              if (existingListing.fields.readyToPurchase) {
                initialData.readyToPurchase = existingListing.fields.readyToPurchase;
                console.log('✅ Set readyToPurchase:', existingListing.fields.readyToPurchase);
              }
              if (existingListing.fields.messageToBreeders) {
                initialData.messageToBreeders = existingListing.fields.messageToBreeders;
                console.log('✅ Set messageToBreeders:', existingListing.fields.messageToBreeders);
              }
            }
          }

          // Special handling for service listings - populate serviceCategory from fields
          if (selectedListingType?.id === 'OTHER_SERVICES' && existingListing.fields?.serviceCategory) {
            initialData.serviceCategory = existingListing.fields.serviceCategory;
            console.log('✅ Set serviceCategory:', existingListing.fields.serviceCategory);
          }
        }

          console.log('Setting initial form data:', initialData);
          console.log('Gender field value:', initialData.gender);
          console.log('🔍 Microchip numbers in initial data:', {
            microchipNumber_0: initialData.microchipNumber_0,
            microchipNumber_1: initialData.microchipNumber_1,
            microchipNumber_2: initialData.microchipNumber_2,
            microchipNumber_3: initialData.microchipNumber_3,
          });
          console.log('🔍 Puppy images in initial data:', {
            puppyImages: initialData.puppyImages,
            puppyGender: initialData.puppyGender,
            puppyColour: initialData.puppyColour,
            puppyDateOfBirth: initialData.puppyDateOfBirth,
            vaccinationStatus: initialData.vaccinationStatus,
          });
          setFormData(initialData);
      }
    }
  }, [searchParams, existingListing, selectedListingType, type]);

  // Handle breed updates for wanted listings when breedId changes
  useEffect(() => {
    if (selectedListingType?.id === 'WANTED_LISTING' && existingListing && breedId) {
      console.log('🔄 Updating breedWanted with breedId:', breedId);
      setFormData(prev => ({
        ...prev,
        breedWanted: existingListing.breed || existingListing.breedName
      }));
    }
  }, [breedId, existingListing, selectedListingType]);

  const handleFieldChange = (name: string, value: any, breedId?: string) => {
    console.log('handleFieldChange - name:', name, 'value:', value);
    if (name === 'gender') {
      console.log('Gender changed to:', value);
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log('Updated form data:', newData);
      return newData;
    });

    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Handle breed selection
    if (name === 'breed' && breedId) {
      setBreedId(breedId);
    }
  };

  // Validation and submission logic is now handled by individual form components

  // Form submission logic is now handled by individual form components

  // Helper functions are now handled by individual form components

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

  // Field configuration and rendering logic is now handled by individual form components

  return (
    <>
      <section className={`container grid grid-cols-2 gap-8 max-md:p-4 max-md:gap-4 rounded-40 p-8 bg-white relative max-md:grid-cols-1 ${isSubmitting || isSubmitted ? 'pointer-events-none opacity-50' : ''}`}>
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

          {/* Use the modular form factory */}
          <ListingFormFactory
            selectedListingType={selectedListingType}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
            editId={editId}
            existingListing={existingListing}
            breedId={breedId}
            setBreedId={setBreedId}
          />
        </div>
        <div className="flex max-md:w-full flex-col gap-6 bg-listingBG bg-cover h-full bg-bottom rounded-40 border border-black/20 max-md:hidden">
          <div className="flex relative flex-col h-full justify-evenly">
            <span className="text-5xl font-medium w-full text-center">Create a Winning Ad!</span>
            {listingTips.map((tip, i) => (
              <div key={i} className="flex flex-col relative mb-12">
                <img className={`absolute ${tip.alignRight ? "right-0" : "left-0"} -top-12 z-10`} src={tip.image} alt={`Tip ${i + 1}`} />
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
