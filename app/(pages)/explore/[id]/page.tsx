"use client";
import React, { useRef, useState } from 'react';
import { ListingCard } from "@/_components/common/listing-card";
import { CtaBlock } from "../../(home)/_components/cta-block";
import ActionIcon from "@/_components/ui/action-icon";
import {
  Autoplay,
  Navigation,
  Swiper,
  SwiperSlide,
} from "@/_components/ui/slider";
import { FreeMode, Thumbs } from 'swiper/modules';
import { usePublicListing, useSimilarListings } from "@/_services/hooks/listings";
import { useSellerListings } from "@/_services/hooks/listings/use-seller-listings";
import { useParams } from "next/navigation";
import { formatListingType } from "@/_utils/listing";
import { ListingTypeEnum, getListingLabel } from "@/_types/listing";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from "@/_services/hooks/user/use-user";
import { useGetListingById } from "@/_services/hooks/listings/use-get-listing-by-id";
import { chatApiService } from "@/_services/chat/chatApiService";
import { toast } from '@/_hooks/use-toast';
import MeetingScheduleForm from "@/_components/meetings/meeting-schedule-form";
import { getPricingInfo, getPricingDisplayProps, getListingPricingDisplay } from "@/_utils/pricing";
import { useWishlist } from "@/_contexts/wishlist-context";
import { DatePicker } from "@/_components/ui/date-picker";
import { FileViewerModal } from "@/_components/common/file-viewer-modal";

const ExploreDetail = () => {
  const params = useParams();
  const listingId = params.id as string;
  const router = useRouter();
  
  // Get current user
  const { data: currentUser } = useUser();
  
  // Meeting scheduling state
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Wishlist functionality
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  
  // State for expanded details
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
  
  // State for file viewer modals
  const [showDnaResultsModal, setShowDnaResultsModal] = useState(false);
  const [showHealthCertificatesModal, setShowHealthCertificatesModal] = useState(false);
  
  // Fetch listing data
  const { data: listing, isLoading, error } = usePublicListing(listingId);

  // Fetch similar listings based on current listing
  const { data: similarListingsData } = useSimilarListings({
    breed: listing?.breed,
    type: listing?.type,
    category: listing?.category,
    excludeId: listingId,
    limit: 4,
  });

  // Fetch seller listings
  const { data: sellerListingsData } = useSellerListings({
    userId: listing?.userId || '',
    excludeId: listingId,
    limit: 4,
  });

  // Transform similar listings data to match the expected format
  const similarListings = similarListingsData?.data?.map(listing => ({
    id: listing.id,
    title: listing.title,
    location: listing.location,
    description: listing.description || `Beautiful ${listing.breed} - ${formatListingType(listing.type)}`,
    price: listing.price,
    rating: 4.5, // Default rating since it's not in the API
    reviews: Math.floor(Math.random() * 50) + 10, // Random reviews for now
    listingType: formatListingType(listing.type),
    type: listing.type, // Add type field for listing type detection
    image: listing.featuredImage || "/images/breed-by-type/1.png", // Use featured image or fallback
    userId: listing.user?.id, // Add userId for own listing check
    fields: listing.fields || {}, // Add fields for pricing options, images, etc.
    metadata: listing.metadata || {}, // Add metadata for Other Services images
    breed: listing.breed, // Add breed field
    availability: listing.availability, // Add availability field
    individualPuppies: listing.fields?.individualPuppies || [], // Add individualPuppies for puppy listings
  })) || [];

  // Transform seller listings data to match the expected format
  const sellerListings = sellerListingsData?.data?.map(listing => ({
    id: listing.id,
    title: listing.title,
    location: listing.location,
    description: listing.description || `Beautiful ${listing.breed} - ${formatListingType(listing.type)}`,
    price: listing.price,
    rating: 4.5, // Default rating since it's not in the API
    reviews: Math.floor(Math.random() * 50) + 10, // Random reviews for now
    listingType: formatListingType(listing.type),
    type: listing.type, // Add type field for listing type detection
    image: listing.featuredImage || "/images/breed-by-type/1.png", // Use featured image or fallback
    userId: listing.user?.id, // Add userId for own listing check
    fields: listing.fields || {}, // Add fields for pricing options, images, etc.
    metadata: listing.metadata || {}, // Add metadata for Other Services images
    breed: listing.breed, // Add breed field
    availability: listing.availability, // Add availability field
    individualPuppies: listing.fields?.individualPuppies || [], // Add individualPuppies for puppy listings
  })) || [];

  // Transform API data to match the design expectations
  const transformedListing = listing ? {
    title: listing.title || "Untitled Listing",
    //breed: listing.breed || "Unknown Breed",
    breed: (() => {
      if (listing.type == ListingTypeEnum.OTHER_SERVICES) return;
      return listing.breed || "Unknown Breed";
    })(),
    type : listing.type || "Unknown Type",
    location: listing.location || "Location not specified",
    price: (() => {
      if (typeof listing.price === 'number') return listing.price;
      if (typeof listing.price === 'string') {
        const parsed = parseFloat(listing.price);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    })(),
    // Add pricing information
    pricingInfo: getPricingInfo(listing.fields || {}, listing.price),
    pricingProps: getPricingDisplayProps(getPricingInfo(listing.fields || {}, listing.price)),
    description: listing.description || "No description available",
    listingType: formatListingType(listing.type),
    images: (() => {
      // For puppy/litter listings, extract images from individualPuppies
      if (listing.type === ListingTypeEnum.PUPPY_LITTER_LISTING && listing.fields?.individualPuppies && Array.isArray(listing.fields.individualPuppies)) {
        const allPuppyImages: string[] = [];
        listing.fields.individualPuppies.forEach((puppy: any) => {
          if (puppy.puppyImages && Array.isArray(puppy.puppyImages)) {
            allPuppyImages.push(...puppy.puppyImages);
          }
        });
        // Remove duplicates and filter out non-image files (like PDFs)
        const uniqueImages = Array.from(new Set(allPuppyImages)).filter(img => {
          const lowerImg = img.toLowerCase();
          return lowerImg.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
        });
        if (uniqueImages.length > 0) {
          return uniqueImages;
        }
      }
      
      // For Other Services listings, prioritize serviceImages from fields
      if (listing.type === ListingTypeEnum.OTHER_SERVICES && listing.fields?.serviceImages) {
        let serviceImgs: string[] = [];
        
        // Handle different formats: array, string, or comma-separated string
        if (Array.isArray(listing.fields.serviceImages)) {
          serviceImgs = listing.fields.serviceImages;
        } else if (typeof listing.fields.serviceImages === 'string') {
          // Check if it's a comma-separated string
          if (listing.fields.serviceImages.includes(',')) {
            serviceImgs = listing.fields.serviceImages.split(',').map((img: string) => img.trim()).filter(Boolean);
          } else {
            serviceImgs = [listing.fields.serviceImages.trim()];
          }
        }
        
        const validServiceImages = serviceImgs
          .map((img: string) => {
            if (!img) return null;
            // Remove trailing commas and whitespace
            const cleaned = img.trim().replace(/,$/, '').trim();
            return cleaned || null;
          })
          .filter((img: string | null): img is string => {
            if (!img) return false;
            const lowerImg = img.toLowerCase();
            return !!lowerImg.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
          });
        if (validServiceImages.length > 0) {
          return validServiceImages;
        }
      }
      
      // For other listings or if no puppy images found, check metadata.images
      // Filter out non-image files (like PDFs)
      if (listing.metadata?.images && Array.isArray(listing.metadata.images) && listing.metadata.images.length > 0) {
        const validImages = listing.metadata.images.filter((img: string) => {
          const lowerImg = img.toLowerCase();
          return lowerImg.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
        });
        if (validImages.length > 0) {
          return validImages;
        }
      }
      
      // Fallback to default images if no images are provided
      return ["/images/vectors/detailSlide1.png", "/images/vectors/detailSlide2.png", "/images/vectors/detailSlide3.png"];
    })(),
    videos: (() => {
      const allVideos: string[] = [];
      
      // For puppy/litter listings, extract videos from individualPuppies
      if (listing.type === ListingTypeEnum.PUPPY_LITTER_LISTING && listing.fields?.individualPuppies && Array.isArray(listing.fields.individualPuppies)) {
        listing.fields.individualPuppies.forEach((puppy: any) => {
          if (puppy.puppyImages && Array.isArray(puppy.puppyImages)) {
            const puppyVideos = puppy.puppyImages.filter((file: string) => {
              const lowerFile = file.toLowerCase();
              return lowerFile.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|3gp|ogg|m4v)$/);
            });
            allVideos.push(...puppyVideos);
          }
        });
      }
      
      // For Other Services listings, check serviceImages for videos
      if (listing.type === ListingTypeEnum.OTHER_SERVICES && listing.fields?.serviceImages) {
        let serviceFiles: string[] = [];
        
        if (Array.isArray(listing.fields.serviceImages)) {
          serviceFiles = listing.fields.serviceImages;
        } else if (typeof listing.fields.serviceImages === 'string') {
          if (listing.fields.serviceImages.includes(',')) {
            serviceFiles = listing.fields.serviceImages.split(',').map((file: string) => file.trim()).filter(Boolean);
          } else {
            serviceFiles = [listing.fields.serviceImages.trim()];
          }
        }
        
        const serviceVideos = serviceFiles
          .map((file: string) => {
            if (!file) return null;
            const cleaned = file.trim().replace(/,$/, '').trim();
            return cleaned || null;
          })
          .filter((file: string | null): file is string => {
            if (!file) return false;
            const lowerFile = file.toLowerCase();
            return !!lowerFile.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|3gp|ogg|m4v)$/);
          });
        allVideos.push(...serviceVideos);
      }
      
      // Extract videos from metadata.videos
      if (listing.metadata?.videos && Array.isArray(listing.metadata.videos) && listing.metadata.videos.length > 0) {
        const validVideos = listing.metadata.videos.filter((video: string) => {
          const lowerVideo = video.toLowerCase();
          return lowerVideo.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|3gp|ogg|m4v)$/);
        });
        allVideos.push(...validVideos);
      }
      
      // Remove duplicates and return
      return Array.from(new Set(allVideos));
    })(),
    motherImages: listing.metadata?.motherImages || [],
    fatherImages: listing.metadata?.fatherImages || [],
    motherVideos: listing.metadata?.motherVideos || [],
    fatherVideos: listing.metadata?.fatherVideos || [],
    serviceImages: (() => {
      // For Other Services listings, get service images from fields
      if (listing.type === ListingTypeEnum.OTHER_SERVICES && listing.fields?.serviceImages) {
        let serviceImgs: string[] = [];
        
        // Handle different formats: array, string, or comma-separated string
        if (Array.isArray(listing.fields.serviceImages)) {
          serviceImgs = listing.fields.serviceImages;
        } else if (typeof listing.fields.serviceImages === 'string') {
          // Check if it's a comma-separated string
          if (listing.fields.serviceImages.includes(',')) {
            serviceImgs = listing.fields.serviceImages.split(',').map((img: string) => img.trim()).filter(Boolean);
          } else {
            serviceImgs = [listing.fields.serviceImages.trim()];
          }
        }
        
        // Filter out non-image files and clean URLs
        return serviceImgs
          .map((img: string) => {
            if (!img) return null;
            // Remove trailing commas and whitespace
            const cleaned = img.trim().replace(/,$/, '').trim();
            return cleaned || null;
          })
          .filter((img: string | null): img is string => {
            if (!img) return false;
            const lowerImg = img.toLowerCase();
            return !!lowerImg.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
          });
      }
      return [];
    })(),
    featuredImage: listing.featuredImage || listing.metadata?.featuredImage || (() => {
      // For puppy/litter listings, get first image from individualPuppies
      if (listing.type === ListingTypeEnum.PUPPY_LITTER_LISTING && listing.fields?.individualPuppies && Array.isArray(listing.fields.individualPuppies)) {
        for (const puppy of listing.fields.individualPuppies) {
          if (puppy.puppyImages && Array.isArray(puppy.puppyImages) && puppy.puppyImages.length > 0) {
            const firstImage = puppy.puppyImages.find((img: string) => img.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/));
            if (firstImage) return firstImage;
          }
        }
      }
      // Fallback to metadata images
      if (listing.metadata?.images && Array.isArray(listing.metadata.images) && listing.metadata.images.length > 0) {
        const firstImage = listing.metadata.images.find((img: string) => img.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/));
        if (firstImage) return firstImage;
      }
      return null;
    })(),
    availability: listing.availability || 'available',
    user: listing.user,
    fields: listing.fields || {},
    motherInfo: listing.motherInfo,
    fatherInfo: listing.fatherInfo,
    viewCount: listing.viewCount || 0,
    favoriteCount: listing.favoriteCount || 0,
    createdAt: listing.createdAt || new Date(),
  } : null;

  // Debug logging for fields data
  console.log('Listing fields:', listing?.fields);
  console.log('Transformed fields:', transformedListing?.fields);
  console.log('Badges from fields:', transformedListing?.fields?.badges);
  console.log('DNA Results from fields:', transformedListing?.fields?.dnaResults);

  // Wishlist logic
  const isOwnListing = currentUser && listing?.user?.id && currentUser.id === listing.user.id;
  const shouldShowWishlist = !isOwnListing;
  const isWishlistedItem = isWishlisted(listingId);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent action if it's own listing or already toggling
    if (isOwnListing || isTogglingWishlist) {
      console.log('Wishlist toggle prevented:', { isOwnListing, isTogglingWishlist });
      return;
    }

    // If user is not logged in, show login message
    if (!currentUser) {
      console.log('User not logged in, showing login message');
      // The wishlist context will handle showing the login message
    }

    setIsTogglingWishlist(true);
    try {
      await toggleWishlist(listingId);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Generate dog details dynamically from API data
  const dogDetails = transformedListing ? (() => {
   
    const details: Array<{ label: string; value: string; title?: boolean }> = [];
    
    // Add header
    details.push({ label: "Attribute", value: "Details", title: true });
    
    // Helper function to format field values
    const formatValue = (value: any): string => {
      if (value === null || value === undefined || value === '') {
        return '';
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length === 0) return '';
        return value.join(', ');
      }
      
      // Handle booleans
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      // Handle dates
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          }
        } catch (e) {
          // If date parsing fails, return as is
        }
      }
      
      // Handle numbers
      if (typeof value === 'number') {
        return value.toString();
      }
      
      return String(value);
    };
    
    // Helper function to format field labels (convert camelCase to Title Case)
    const formatLabel = (key: string): string => {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    };
    
    // Always include these core fields if they exist
    const coreFields: Record<string, () => string> = {
      'Dog Name': () => transformedListing.fields?.dogName || transformedListing.title || '',
      'Breed': () => transformedListing.breed || '',
      'Location': () => transformedListing.fields?.hideAddress ? '' : (transformedListing.location || ''),
      'Age': () => formatValue(transformedListing.fields?.age),
      'Listing Type': () => transformedListing.listingType || '',
    };
    
    // Add core fields
    Object.entries(coreFields).forEach(([label, getValue]) => {
      const value = getValue();
      if (value) {
        details.push({ label, value });
      }
    });
    
    // Add all other fields from listing.fields
    if (transformedListing.fields && typeof transformedListing.fields === 'object') {
      const fieldKeys = Object.keys(transformedListing.fields);
      
      // Fields to exclude (already handled or not needed)
      const excludeFields = [
        'dogName', // Already handled
        'age', // Already handled
        'badges', // Displayed separately
        'dnaResults', // Displayed separately
        'individualPuppies', // Complex nested data
        'puppyImages', // Part of individualPuppies
        'healthCertificates', // Could be displayed separately
        'images', // Displayed in gallery
        'videos', // Displayed in gallery
        'serviceImages', // Displayed in main image gallery
        'registrationNumber', // Handled separately
        'litterSize', // Handled separately
        'deliveryOptions', // Handled separately
        'minPrice', // Part of pricing
        'maxPrice', // Part of pricing
        'pricingOption', // Internal field
        'fixedPrice', // remove duplicate pricing
        'listLitterOption', // Internal field
      ];

      // remove breed for other service
      if(transformedListing.type == ListingTypeEnum.OTHER_SERVICES){
        excludeFields.push('breed');
      }
      
      // Special handling for specific fields
      const specialFieldLabels: Record<string, string> = {
        'semenType': 'Semen Type',
        'shippingAvailable': 'Shipping Available',
        'collectionDate': 'Collection Date',
        'ankcBreederRegister': 'ANKC Breeder Register',
        'studFee': 'Stud Fee',
        'microchipNumber': 'Microchip Number',
        'vaccinationStatus': 'Vaccination Status',
        'puppyDateOfBirth': 'Date of Birth',
        'puppyGender': 'Gender',
        'puppyColour': 'Color',
      };
      
      fieldKeys.forEach(key => {
        if (excludeFields.includes(key)) return;
        
        const value = transformedListing.fields[key];
        const formattedValue = formatValue(value);
        
        // Only add if value exists and is not empty
        if (formattedValue) {
          // Use special label if available, otherwise format the key
          const label = specialFieldLabels[key] || formatLabel(key);
          // Check if this field is not already added
          if (!details.some(d => d.label === label)) {
            details.push({ label, value: formattedValue });
          }
        }
      });
    }
    
    // Add pricing information if available
    if (transformedListing.pricingInfo) {
      const pricing = transformedListing.pricingInfo;
      if (pricing.minPrice && pricing.maxPrice) {
        const minPrice = Math.round(Number(pricing.minPrice));
        const maxPrice = Math.round(Number(pricing.maxPrice));
        details.push({ label: 'Price Range', value: `$${minPrice} - $${maxPrice}` });
      } else if (pricing.price) {
        const price = Math.round(Number(pricing.price));
        details.push({ label: 'Price', value: `$${price}` });
      }
    }
    
    // Add registration number if available
    if (transformedListing.fields?.registrationNumber) {
      details.push({ label: 'Registration Number', value: String(transformedListing.fields.registrationNumber) });
    }
    
    // Add litter size if available
    const listLitterOption = transformedListing?.fields.listLitterOption;
    if (transformedListing.fields?.litterSize && listLitterOption !== 'add-individually') {
      details.push({ label: 'Litter Size', value: String(transformedListing.fields.litterSize) });
    }
    
    // Add delivery options if available
    if (transformedListing.fields?.deliveryOptions && Array.isArray(transformedListing.fields.deliveryOptions)) {
      // Map delivery option values to their display labels
      const deliveryOptionLabels: Record<string, string> = {
        'pickup': 'Pickup',
        'road-transport': 'Road Transport',
        'air-transport': 'Air Transport',
        // Handle case variations
        'Pickup': 'Pickup',
        'Road Transport': 'Road Transport',
        'Air Transport': 'Air Transport',
        // Handle any other variations
        'roadTransport': 'Road Transport',
        'airTransport': 'Air Transport',
        'Road-Transport': 'Road Transport',
        'Air-Transport': 'Air Transport',
      };
      
      // Debug: Log the raw delivery options data
      console.log('🔍 Delivery Options Debug:', {
        raw: transformedListing.fields.deliveryOptions,
        listingId: listing?.id,
      });
      
      // Remove duplicates by normalizing and using a Set
      const uniqueOptions = Array.from(
        new Set(
          transformedListing.fields.deliveryOptions
            .filter((opt: string) => opt && opt.trim())
            .map((opt: string) => opt.trim().toLowerCase())
        )
      );
      
      const deliveryOptions = uniqueOptions
        .map((normalized: string) => {
          // Try to find a match (case-insensitive)
          const matchedKey = Object.keys(deliveryOptionLabels).find(
            key => key.toLowerCase() === normalized
          );
          // Use mapping if available, otherwise format the label
          return matchedKey ? deliveryOptionLabels[matchedKey] : formatLabel(normalized.replace(/-/g, ' '));
        })
        .filter((label: string) => label && label.trim()) // Remove any empty labels
        .join(', ');
      
      if (deliveryOptions) {
        details.push({ label: 'Delivery Options', value: deliveryOptions });
      }
    }
    console.log('transformedListing.listingType',transformedListing.listingType)
    return details;
  })() : [];

  const testimonials = [
    {
      image: "/images/vectors/profile.jpg",
      message:
        "Im absolutely in love with @gather_place. It's the first video calling software built for people who meet to get work done. Feeling whole lot productive.",
      name: "Andrew Jones",
      title: "Product Developer at Webflow",
    },
    {
      image: "/images/vectors/profile.jpg",
      message:
        "@gather_place is the best. We've moved all of our meetings to this new platform and it's made them all better and efficient.",
      name: "Adam Smith",
      title: "Web Designer at Spotify",
    },
    {
      image: "/images/vectors/profile.jpg",
      message:
        "@gather_place amazing concept. It really brings me joy 💜 Bring a sense of play to your software and consider how it impacts the humans using it. Best way to build.",
      name: "Lauren White",
      title: "Product Manager at Zapier",
    },
    {
      image: "/images/vectors/profile.jpg",
      message:
        "It works really wonders in the hybrid culture. No echo and seamless integration with the current workflow. Love this application.",
      name: "Beth Wilson",
      title: "Product Manager at LinkedIn",
    },
    {
      image: "/images/vectors/profile.jpg",
      message:
        "Absolutely in love with @gather_place. It's the first video calling software built for people who meet to get work done.",
      name: "Mike Warren",
      title: "Product Manager at Zapier",
    },
    {
      image: "/images/vectors/profile.jpg",
      message:
        "Absolutely in love with @gather_place. It's the first video calling software built for people who meet to get work done.",
      name: "Mike Warren",
      title: "Product Manager at Zapier",
    },
  ];

  const reviewTopics = [
    { name: "Product Quality", },
    { name: "Seller Services", },
    { name: "Product Price", },
    { name: "Shipment", },
    { name: "Match with Description", },
  ];
  const ratingData = [
    { rating: 5.0, count: 2823 },
    { rating: 4.0, count: 1238 },
    { rating: 3.0, count: 4 },
    { rating: 2.0, count: 0 },
    { rating: 1.0, count: 0 },
  ];
  const [showReviews, setShowReviews] = useState(false);
  const total = ratingData.reduce((sum, item) => sum + item.count, 0);
  const ratingSum = ratingData.reduce((sum, item) => sum + item.rating * item.count, 0);
  const rating = total > 0 ? ratingSum / total : 0;

  const percentage = (rating / 5) * 100;
  const dashOffset = 314 - (314 * percentage) / 100;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  const fullStarSvg = (
    <svg key="full-star" width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#FFA439" /></svg>
  );
  const halfStarSvg = (
    <svg key="half-star" width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="half-grad"><stop offset="50%" stopColor="#FFA439" /><stop offset="50%" stopColor="#E0E0E0" /></linearGradient></defs><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="url(#half-grad)" /></svg>
  );
  const emptyStarSvg = (
    <svg key="empty-star" width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.4421 1.47865L11.9087 4.41198C12.1087 4.82031 12.6421 5.21198 13.0921 5.28698L15.7504 5.72865C17.4504 6.01198 17.8504 7.24531 16.6254 8.46198L14.5587 10.5286C14.2087 10.8786 14.0171 11.5536 14.1254 12.037L14.7171 14.5953C15.1837 16.6203 14.1087 17.4036 12.3171 16.3453L9.82541 14.8703C9.37541 14.6036 8.63375 14.6036 8.17541 14.8703L5.68375 16.3453C3.90041 17.4036 2.81708 16.612 3.28375 14.5953L3.87541 12.037C3.98375 11.5536 3.79208 10.8786 3.44208 10.5286L1.37541 8.46198C0.158746 7.24531 0.550413 6.01198 2.25041 5.72865L4.90875 5.28698C5.35041 5.21198 5.88375 4.82031 6.08375 4.41198L7.55041 1.47865C8.35041 -0.11302 9.65041 -0.11302 10.4421 1.47865Z" fill="#E0E0E0" /></svg>
  );
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state
  if (error || !transformedListing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Listing Not Found</h1>
          <p className="text-gray-600">The listing you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <section className="container relative overflow-hidden p-8 rounded-40 bg-white grid grid-cols-2 gap-8 items-start max-md:grid-cols-1 max-md:p-4 max-md:rounded-[20px]">
        <div className="flex flex-col">
          <div className="flex flex-col relative border border-black/20 rounded-40 overflow-hidden max-md:rounded-[20px]">
            {/* Wishlist Heart Icon - Show for all listings except own listings */}
            {shouldShowWishlist && (
              <button
                onClick={handleWishlistToggle}
                disabled={isTogglingWishlist}
                className={`w-20 h-20 max-md:w-12 max-md:h-12 bg-CPrimary rounded-full absolute right-4 top-4 overflow-hidden flex items-center justify-center z-10 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${isTogglingWishlist ? 'animate-pulse' : ''}`}
                title={isWishlistedItem ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isTogglingWishlist ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin max-md:w-4 max-md:h-4" />
                ) : (
                  <>
                    <img 
                      className={`w-11 max-md:w-6 transition-opacity duration-300 ${isWishlistedItem ? 'opacity-0' : 'opacity-100'}`} 
                      src="/images/vectors/favorite.svg" 
                      alt="Add to wishlist"
                    />
                    <img 
                      className={`w-11 max-md:w-6 absolute transition-opacity duration-300 ${isWishlistedItem ? 'opacity-100' : 'opacity-0'}`} 
                      src="/images/vectors/favorite_Fill.svg" 
                      alt="Remove from wishlist"
                    />
                  </>
                )}
              </button>
            )}
            <div className="absolute w-[220px] h-[195px] max-md:w-[100px] max-md:h-[100px] z-10 flex items-center justify-center top-0">
              <span className="bg-yellow-400 text-4xl font-semibold text-black -rotate-45 whitespace-nowrap px-20 h-16 flex items-center text-center w-min max-md:text-[18px] max-md:h-auto">
                {(() => {
                  const listLitterOption = listing?.fields?.listLitterOption;
                  
                  // Check listLitterOption first
                  if (listLitterOption === 'single-puppy') {
                    return 'Puppy Listing';
                  }
                  if (listLitterOption === 'add-individually' || listLitterOption === 'same-details') {
                    return 'Litter Listing';
                  }
                  
                  // Fallback to listing type
                  // if (listing?.type === ListingTypeEnum.PUPPY_LITTER_LISTING) {
                  //   return 'Litter Listing';
                  // }

                  // // Fallback to future listing type
                  // if (listing?.type === ListingTypeEnum.FUTURE_LISTING) {
                  //   return 'Future Litter';
                  // }

                  //  // Fallback to other services listing type
                  // if (listing?.type === ListingTypeEnum.OTHER_SERVICES) {
                  //   return 'Other Services';
                  // }

                  //  // Fallback to wanted listing type
                  // if (listing?.type === ListingTypeEnum.WANTED_LISTING) {
                  //   return 'Wanted Puppy';
                  // }
                  return getListingLabel(listing?.type);
                  // Use formatted listing type with "Listing" suffix
                  //return `${transformedListing.listingType} Listing`;
                })()}
              </span>
            </div>
            <Swiper className="w-full" loop={false} modules={[Autoplay, Navigation, FreeMode, Thumbs]} slidesPerView={1} spaceBetween={0} navigation={{ nextEl: ".swipperNextBtn", prevEl: ".swipperPrevBtn", }}
              thumbs={{ swiper: thumbsSwiper }}>
              {(() => {
                // Combine images and videos
                const media = [
                  ...(transformedListing.images || []).map((url: string) => ({ url, type: 'image' as const })),
                  ...(transformedListing.videos || []).map((url: string) => ({ url, type: 'video' as const }))
                ];
                
                if (media.length > 0) {
                  return media.map((item, index: number) => (
                    <SwiperSlide key={index} className="group relative flex flex-col overflow-hidden">
                      {item.type === 'video' ? (
                        <video 
                          src={item.url} 
                          controls
                          className="object-cover w-full h-[554px] max-md:h-[260px]"
                          playsInline
                        />
                      ) : (
                        <Image src={item.url} className="object-cover w-full h-[554px] max-md:h-[260px]" alt={`${transformedListing.title} - Image ${index + 1}`} width={100} height={100} />
                      )}
                    </SwiperSlide>
                  ));
                } else {
                  return (
                    <SwiperSlide className="group relative flex flex-col overflow-hidden">
                      <img src="/images/vectors/detailSlide1.png" className="object-cover w-full h-[554px] max-md:h-[260px]" alt="Default listing image" />
                    </SwiperSlide>
                  );
                }
              })()}
            </Swiper>
            <ActionIcon rounded="full" className="bg-black !h-16 max-md:hidden !w-16 absolute top-0 bottom-0 m-auto z-10 left-4 swipperPrevBtn"><img className="-scale-x-100 max-w-3" src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
            <ActionIcon rounded="full" className="bg-black !h-16 max-md:hidden !w-16 absolute top-0 bottom-0 m-auto z-10 right-4 swipperNextBtn"><img className="max-w-3" src="/images/vectors/nextPrevArrow.svg" /></ActionIcon>
          </div>
          <Swiper onSwiper={setThumbsSwiper} spaceBetween={20} slidesPerView={3} freeMode={true} watchSlidesProgress={true} modules={[FreeMode, Navigation, Thumbs]} className="w-full mt-8 max-md:mt-4">
            {(() => {
              // Combine images and videos for thumbnails
              const media = [
                ...(transformedListing.images || []).map((url: string) => ({ url, type: 'image' as const })),
                ...(transformedListing.videos || []).map((url: string) => ({ url, type: 'video' as const }))
              ];
              
              if (media.length > 0) {
                return media.map((item, index: number) => (
                  <SwiperSlide key={index} className="!border-4 border-transparent !rounded-3xl max-md:!rounded-lg !overflow-hidden cursor-pointer [&.swiper-slide-thumb-active]:border-CSecondary relative">
                    {item.type === 'video' ? (
                      <div className="relative w-full h-[238px] max-md:h-[100px]">
                        <video 
                          src={item.url} 
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/90 rounded-full p-2">
                            <svg fill="#000000" height="20px" width="20px" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                              <path d="M45.563,29.174l-22-15c-0.307-0.208-0.703-0.231-1.031-0.058C22.205,14.289,22,14.629,22,15v30 c0,0.371,0.205,0.711,0.533,0.884C22.679,45.962,22.84,46,23,46c0.197,0,0.394-0.059,0.563-0.174l22-15 C45.836,30.64,46,30.331,46,30S45.836,29.36,45.563,29.174z M24,43.107V16.893L43.225,30L24,43.107z"></path>
                              <path d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30 S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Image className='w-full h-[238px] max-md:h-[100px] object-cover' src={item.url} alt={`${transformedListing.title} - Thumbnail ${index + 1}`} width={100} height={100} />
                    )}
                  </SwiperSlide>
                ));
              } else {
                return (
                  <SwiperSlide className="!border-4 border-transparent !rounded-3xl max-md:!rounded-lg !overflow-hidden cursor-pointer [&.swiper-slide-thumb-active]:border-CSecondary">
                    <Image className='w-full h-[238px] max-md:h-[100px] object-cover' src="/images/vectors/detailSlide1.png" alt="Default listing thumbnail" width={100} height={100} />
                  </SwiperSlide>
                );
              }
            })()}
          </Swiper>
        </div>
        <div className="flex flex-col gap-3 max-md:gap-2">
          <div className="flex items-start justify-between gap-4 max-md:flex-col max-md:gap-2">
            <span className="text-5xl font-medium max-md:text-3xl flex-1">{transformedListing.title}</span>
            {transformedListing.user?.username && (
              <Link
                href={`/user/${transformedListing.user.username}`}
                className="bg-[#EFC951] hover:bg-[#E6B847] text-black px-6 py-3 rounded-full text-base font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap max-md:px-4 max-md:py-2 max-md:text-sm"
              >
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </Link>
            )}
          </div>
          {transformedListing.type !== ListingTypeEnum.OTHER_SERVICES && (
            <span className="text-[22px] mt-3 max-md:text-base max-md:mt-1">
              {transformedListing.breed}
            </span>
          )}
          {transformedListing.location && !transformedListing.fields?.hideAddress && (
            <span className='max-md:text-xs'>{transformedListing.location}</span>
          )}
          <div className="flex gap-2 max-md:gap-1">
            <span className="h-10 border max-md:h-8 max-md:text-[11px] max-md:px-2 border-[#87D78E4D] bg-[#87D78E4D]/30 px-4 rounded-full flex items-center">
              {transformedListing.availability === 'available' ? 'Available' :
                transformedListing.availability === 'reserved' ? 'Reserved' :
                  transformedListing.availability === 'sold_out' ? 'Sold Out' : 'Draft'}
            </span>
            {/* <span className="h-10 border max-md:h-8 max-md:text-[11px] max-md:px-2 border-black/20 px-4 rounded-full flex items-center gap-2 max-md:gap-1">
              <img className='max-md:w-4' src="/images/vectors/verified.png" />Pups4Sale Breeder Conditions Verified
            </span> */}
          </div>
          <span className="flex items-baseline gap-2">
            {(() => {
              // Use getListingPricingDisplay for consistent pricing/budget display
              const pricingResult = getListingPricingDisplay({
                price: listing?.price,
                fields: listing?.fields || {},
                type: listing?.type
              });
              
              return (
                <text className="text-[32px] max-md:text-xl font-medium">
                  {pricingResult.displayText}
                </text>
              );
            })()}
          </span>
          <div className="border border-black/20 p-8 rounded-40 gap-4 flex flex-col mt-4 max-md:p-4 max-md:rounded-[20px] max-md:gap-2 max-md:mt-2">
            {/* Dynamic DNA Results Button */}
            {(() => {
              const dnaResults = transformedListing?.fields?.dnaResults;
              console.log('Rendering DNA Results section with:', dnaResults);

              if (dnaResults && Array.isArray(dnaResults) && dnaResults.length > 0) {
                return (
                  <button 
                    className="h-20 text-[18px] font-medium justify-center border border-black/20 px-4 rounded-full flex items-center gap-2 max-md:text-sm max-md:h-11 hover:bg-gray-50 transition-colors" 
                    onClick={() => setShowDnaResultsModal(true)}
                  >
                    <img className='max-md:w-4' src="/images/vectors/DNA.png" />
                    View DNA Results of Parents ({dnaResults.length} file{dnaResults.length !== 1 ? 's' : ''})
                  </button>
                );
              } else {
                return (
                  <button className="h-20 text-[18px] font-medium justify-center border border-black/20 px-4 rounded-full flex items-center gap-2 max-md:text-sm max-md:h-11 opacity-50 cursor-not-allowed">
                    <img className='max-md:w-4' src="/images/vectors/DNA.png" />
                    DNA Results Not Available
                  </button>
                );
              }
            })()}
            
            {/* Dynamic Health Certificates Button */}
            {(() => {
              const healthCertificates = transformedListing?.fields?.healthCertificates;
              console.log('Rendering Health Certificates section with:', healthCertificates);

              if (healthCertificates && Array.isArray(healthCertificates) && healthCertificates.length > 0) {
                return (
                  <button 
                    className="h-20 text-[18px] font-medium justify-center border border-black/20 px-4 rounded-full flex items-center gap-2 max-md:text-sm max-md:h-11 hover:bg-gray-50 transition-colors" 
                    onClick={() => setShowHealthCertificatesModal(true)}
                  >
                    <img className='max-md:w-4' src="/images/vectors/badges/vet-checked.svg" alt="Health Certificate" />
                    View Health Certificates ({healthCertificates.length} file{healthCertificates.length !== 1 ? 's' : ''})
                  </button>
                );
              } else {
                return (
                  <button className="h-20 text-[18px] font-medium justify-center border border-black/20 px-4 rounded-full flex items-center gap-2 max-md:text-sm max-md:h-11 opacity-50 cursor-not-allowed">
                    <img className='max-md:w-4' src="/images/vectors/badges/vet-checked.svg" alt="Health Certificate" />
                    Health Certificates Not Available
                  </button>
                );
              }
            })()}
            
            <span className="text-[34px] font-medium mt-3 max-md:text-xl">Schedule Meeting</span>
            
            {showMeetingForm ? (
              <MeetingScheduleForm
                listingId={listingId}
                listingTitle={transformedListing.title}
                sellerName={transformedListing.user?.name || "Seller"}
                onMeetingScheduled={() => {
                  setShowMeetingForm(false);
                  toast({
                    title: "Success!",
                    description: "Meeting scheduled successfully. Check your meetings page for details.",
                  });
                }}
                onCancel={() => setShowMeetingForm(false)}
              />
            ) : (
              <>
                <div className="flex gap-4 w-full max-md:gap-2 max-md:grid max-md:grid-cols-2">
                  <div className="flex w-full relative group">
                    <DatePicker
                      variant="rounded-full"
                      date={selectedDate}
                      setDate={setSelectedDate}
                      placeholder="Select Date"
                      className="border border-black text-[#4B4A4A] hover:border-black/40 focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                  <div className="flex w-full relative group">
                    <span className="absolute h-16 max-md:h-10 w-14 max-md:w-10 flex items-center justify-center top-0 left-0 z-10 pointer-events-none">
                      <img className="max-md:w-4 transition-opacity group-hover:opacity-80" src="/images/vectors/selectTime.png" alt="Time icon" />
                    </span>
                    <input
                      className="border relative max-md:text-xs z-10 max-md:pl-8 max-md:pr-2 bg-transparent border-black text-[#4B4A4A] rounded-full h-16 max-md:h-10 w-full px-6 pl-12 pr-4 transition-all duration-200 hover:border-black/40 focus:border-black focus:ring-2 focus:ring-black/10 cursor-pointer
                      [&::-webkit-calendar-picker-indicator]:opacity-0
                      [&::-webkit-calendar-picker-indicator]:absolute
                      [&::-webkit-calendar-picker-indicator]:right-4
                      [&::-webkit-calendar-picker-indicator]:w-6
                      [&::-webkit-calendar-picker-indicator]:h-6
                      [&::-webkit-calendar-picker-indicator]:cursor-pointer
                      [&::-webkit-calendar-picker-indicator]:z-20"
                      type="time"
                      placeholder="Select Time"
                      defaultValue={new Date().toTimeString().slice(0, 5)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none max-md:hidden">
                      <svg className="w-5 h-5 text-[#4B4A4A] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMeetingForm(true)}
                  disabled={!!(currentUser && listing?.user?.id && currentUser.id === listing.user.id)} 
                  className="h-20 max-md:h-10 max-md:text-base w-full rounded-full bg-black text-white text-xl font-semibold flex items-center justify-center gap-2 mt-2 hover:bg-gray-800 transition-colors bg-black text-white hover:bg-gray-800 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <img className='max-md:w-3' src="/images/vectors/scheduleMeeting.png" />Schedule meeting
                </button>
              </>
            )}
            <span className="flex justify-center text-xl font-medium max-md:text-base">Or</span>
                          <button
                onClick={async () => {
                  if (listing) {
                    try {
                      console.log('🚀 LIVE CHAT: Calling initiateChat API with listingId:', listing.id);
                      const result = await chatApiService.initiateChat(listing.id);
                      console.log('🚀 LIVE CHAT: API response:', result);
                      
                      const { conversationId } = result;
                      console.log('🚀 LIVE CHAT: Extracted conversationId:', conversationId);
                      
                      const redirectUrl = `/account/inbox?conversationId=${conversationId}`;
                      console.log('🚀 LIVE CHAT: Redirecting to:', redirectUrl);
                      
                      router.push(redirectUrl);
                    } catch (error) {
                      console.error('🚀 LIVE CHAT: Error occurred:', error);
                      toast({
                        title: "Error",
                        description: "Failed to start chat. Please try again.",
                        variant: "destructive",
                      });
                    }
                  } else {
                    console.error('🚀 LIVE CHAT: No listing found!');
                  }
                }}
                disabled={!!(currentUser && listing?.user?.id && currentUser.id === listing.user.id)}
                className={`h-20 max-md:h-10 max-md:text-base w-full rounded-full text-xl font-semibold flex items-center justify-center gap-2 transition-colors
                bg-black text-white hover:bg-gray-800 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              <img className='max-md:w-3' src="/images/vectors/liveChat.png" />
              Live Chat
            </button>
             
          </div>
        </div>
      </section >
      <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white flex gap-12 max-md:flex-col-reverse max-md:p-4 max-md:rounded-[20px] max-md:gap-3">
        <div className="flex w-1/2 max-md:w-full flex-col gap-5 max-md:gap-2">
          <span className="text-[40px] font-medium leading-tight max-md:text-[30px]">Detailed Description</span>
          <span className="text-2xl font-medium leading-tight max-md:text-base">About This {transformedListing.title.split(' ')[0]}</span>
          {typeof transformedListing.description === "string" && /<[a-z][\s\S]*>/i.test(transformedListing.description) ? (
            <span
              className="text-[21px] text-[#7E7E7E] leading-tight max-md:text-xs"
              dangerouslySetInnerHTML={{ __html: transformedListing.description }}
            />
          ) : (
            <span className="text-[21px] text-[#7E7E7E] leading-tight max-md:text-xs">
              {transformedListing.description}
            </span>
          )}
          <div className="flex p-2 rounded-full border border-black/20 text-lg gap-4 pr-8 items-center leading-snug max-md:text-xs max-md:gap-2 max-md:pr-2">
            <img className='max-md:w-16' src="/images/vectors/detailDescription1.png" />
            Your new pup comes with essentials like food, a blanket, and a few goodies—provided by the seller to help you get started right.
          </div>

          <div className="grid grid-cols-3 gap-6 max-md:grid-cols-2 max-md:gap-4">
            {/* Dynamic Badges - Only show if they exist */}
            {(() => {
              const badges = transformedListing?.fields?.badges;
              console.log('Rendering badges section with:', badges);

              if (badges && Array.isArray(badges) && badges.length > 0) {
                return badges.map((badge, index) => (
                  <div key={index} className="text-center flex flex-col justify-center items-center gap-2 p-2">
                    <img src="/images/vectors/detailDescription2.png" className="w-16 h-16 max-md:w-12 max-md:h-12" />
                    <span className="text-xs max-md:text-[10px] font-bold text-center leading-tight">{badge}</span>
                  </div>
                ));
              }
              return null;
            })()}
          </div>
        </div>
        <div className="flex w-1/2 max-md:w-full rounded-3xl overflow-hidden max-md:rounded-xl relative">
          <Image 
            src={transformedListing.featuredImage || "/images/vectors/detailSlide1.png"} 
            alt="Featured listing image"
            fill
            className="object-cover"
          />
        </div>
      </section>
      
     
      
      {/* Individual Puppies Section */}
      {listing?.fields?.individualPuppies && 
       Array.isArray(listing.fields.individualPuppies) && 
       listing.fields.individualPuppies.length > 0 && (
      <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white max-md:p-4">
        <img className="mix-blend-multiply absolute top-0 left-0" src="/images/vectors/parentLeft.png" />
        <img className="mix-blend-multiply absolute top-0 right-0 max-md:bottom-0 max-md:top-auto" src="/images/vectors/parentRight.png" />
        <span className="text-[40px] font-medium flex justify-center w-full max-md:text-[32px]">Individual Puppies</span>
        <div className="grid grid-cols-2 gap-6 relative z-10 mt-8 max-md:grid-cols-1 max-md:gap-4 max-md:mt-4">
          {(() => {
  const listLitterOption = transformedListing?.fields?.listLitterOption;
  const puppies = listing?.fields?.individualPuppies || [];

  // SAME-DETAILS → Only 1 combined card
  if (listLitterOption === "same-details" && puppies.length > 0) {
    const firstPuppy = puppies[0];
    const allMicrochips = puppies
      .map(p => p.microchipNumber)
      .filter(Boolean);

    const puppyImages = Array.isArray(firstPuppy.puppyImages)
      ? firstPuppy.puppyImages.filter((img: string) => {
            if (!img) return false;
            const lowerImg = img.toLowerCase();
            return lowerImg.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
          })
      : [];
    if (puppyImages.length === 0) return null;

    return (
      <div className="overflow-hidden flex flex-col gap-2 w-full">
        <span className="text-[32px] font-medium flex justify-center">
          All Puppies (Same Details)
        </span>

        <div className="p-6 border border-black/20 rounded-40 bg-white gap-2 flex flex-col">
          <div className="relative w-full h-[350px] rounded-2xl overflow-hidden">
            {puppyImages.length > 1 ? (
              <Swiper slidesPerView={1}>
                {puppyImages.map((img, i) => (
                  <SwiperSlide key={i}>
                    <Image src={img} fill className="object-cover" alt={`Puppy image ${i}`} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <Image src={puppyImages[0]} fill className="object-cover" alt="Puppy" />
            )}
          </div>

          <ul className="list-disc list-inside text-xs text-[#8A8585]">
            {allMicrochips.length > 0 && (
              <li>Microchip Numbers: {allMicrochips.join(", ")}</li>
            )}
            {firstPuppy.puppyGender && <li>Gender: {firstPuppy.puppyGender}</li>}
            {firstPuppy.puppyColour && <li>Color: {firstPuppy.puppyColour}</li>}
            {firstPuppy.puppyDateOfBirth && (
              <li>Date of Birth: {(() => {
                try {
                  const date = new Date(firstPuppy.puppyDateOfBirth);
                  if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  }
                  return firstPuppy.puppyDateOfBirth;
                } catch (e) {
                  return firstPuppy.puppyDateOfBirth;
                }
              })()}</li>
            )}
            {firstPuppy.vaccinationStatus && (
              <li>Vaccination Status: {firstPuppy.vaccinationStatus}</li>
            )}
          </ul>
        </div>
      </div>
    );
  }

  // ADD-INDIVIDUALLY → Show your existing loop
  if (listLitterOption === "add-individually") {
    {listing.fields.individualPuppies.map((puppy: any, index: number) => {
            // Filter out non-image files from puppyImages
            const puppyImages = Array.isArray(puppy.puppyImages) 
              ? puppy.puppyImages.filter((img: string) => {
                  if (!img) return false;
                  const lowerImg = img.toLowerCase();
                  return lowerImg.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
                })
              : [];
            
            if (puppyImages.length === 0) return null;
            
            return (
              <div key={index} className="overflow-hidden flex flex-col gap-2 w-full">
                <span className="text-[32px] font-medium flex justify-center max-md:text-[22px]">Puppy {index + 1}</span>
                <div className="p-6 border border-black/20 rounded-40 bg-white gap-2 flex flex-col max-md:p-4 max-md:rounded-[20px]">
                  <div className="relative w-full h-[350px] max-md:h-[170px] rounded-2xl overflow-hidden">
                    {puppyImages.length > 1 ? (
                      <>
                        <Swiper 
                          className="w-full h-full" 
                          loop={false} 
                          modules={[Navigation]} 
                          slidesPerView={1} 
                          spaceBetween={0}
                          navigation={{ 
                            nextEl: `.puppy${index}NextBtn-${listingId}`, 
                            prevEl: `.puppy${index}PrevBtn-${listingId}` 
                          }}
                        >
                          {puppyImages.map((image: string, imgIndex: number) => (
                            <SwiperSlide key={imgIndex} className="relative w-full h-full">
                              <Image 
                                src={image} 
                                alt={`Puppy ${index + 1} image ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                        <ActionIcon 
                          rounded="full" 
                          className={`bg-black !h-12 max-md:!h-8 !w-12 max-md:!w-8 absolute top-0 bottom-0 m-auto z-10 left-2 puppy${index}PrevBtn-${listingId}`}
                        >
                          <img className="-scale-x-100 max-w-3" src="/images/vectors/nextPrevArrow.svg" />
                        </ActionIcon>
                        <ActionIcon 
                          rounded="full" 
                          className={`bg-black !h-12 max-md:!h-8 !w-12 max-md:!w-8 absolute top-0 bottom-0 m-auto z-10 right-2 puppy${index}NextBtn-${listingId}`}
                        >
                          <img className="max-w-3" src="/images/vectors/nextPrevArrow.svg" />
                        </ActionIcon>
                      </>
                    ) : (
                      <span className="w-full h-full flex rounded-2xl overflow-hidden relative">
                        <Image 
                          src={puppyImages[0]} 
                          alt={`Puppy ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </span>
                    )}
                  </div>
                  
                  {(puppy.microchipNumber || 
                    puppy.puppyGender || 
                    puppy.puppyColour || 
                    puppy.puppyDateOfBirth || 
                    puppy.vaccinationStatus) && (
                    <ul className="list-disc list-inside text-xs text-[#8A8585]">
                      {puppy.microchipNumber && (
                        <li>Microchip Number: {puppy.microchipNumber}</li>
                      )}
                      {puppy.puppyGender && (
                        <li>Gender: {puppy.puppyGender === 'male' ? 'Male' : puppy.puppyGender === 'female' ? 'Female' : puppy.puppyGender}</li>
                      )}
                      {puppy.puppyColour && (
                        <li>Color: {puppy.puppyColour}</li>
                      )}
                      {puppy.puppyDateOfBirth && (
                        <li>Date of Birth: {(() => {
                          try {
                            const date = new Date(puppy.puppyDateOfBirth);
                            if (!isNaN(date.getTime())) {
                              return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                            }
                            return puppy.puppyDateOfBirth;
                          } catch (e) {
                            return puppy.puppyDateOfBirth;
                          }
                        })()}</li>
                      )}
                      {puppy.vaccinationStatus && (
                        <li>Vaccination Status: {puppy.vaccinationStatus}</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            );
    })}
  }

  //return null;
})()}
        </div>
      </section>
      )}

{transformedListing.listingType !== ListingTypeEnum.OTHER_SERVICES && 
       transformedListing.listingType !== ListingTypeEnum.WANTED_LISTING && 
       (transformedListing.fatherInfo || transformedListing.motherInfo) && (
      <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white max-md:p-4">
        <img className="mix-blend-multiply absolute top-0 left-0" src="/images/vectors/parentLeft.png" />
        <img className="mix-blend-multiply absolute top-0 right-0 max-md:bottom-0 max-md:top-auto" src="/images/vectors/parentRight.png" />
        <span className="text-[40px] font-medium flex justify-center w-full max-md:text-[32px]">Puppy Parents</span>
        {(() => {
          const hasBoth = transformedListing.fatherInfo && transformedListing.motherInfo;
          return (
            <div className={`flex gap-6 relative z-10 mt-8 max-md:flex-col max-md:gap-4 max-md:mt-4 ${hasBoth ? '' : 'justify-center'}`}>
              {transformedListing.fatherInfo && (
                <div className={`overflow-hidden flex flex-col gap-2 ${hasBoth ? 'w-full' : 'w-1/2 max-md:w-full'}`}>
                  <span className="text-[32px] font-medium flex justify-center max-md:text-[22px]">Father</span>
              <div className="p-6 border border-black/20 rounded-40 bg-white gap-2 flex flex-col max-md:p-4 max-md:rounded-[20px]">
                {(() => {
                  // Combine images and videos
                  const fatherMedia = [
                    ...(transformedListing.fatherImages || []).map((url: string) => ({ url, type: 'image' as const })),
                    ...(transformedListing.fatherVideos || []).map((url: string) => ({ url, type: 'video' as const }))
                  ];
                  
                  if (fatherMedia.length === 0) return null;
                  
                  return (
                    <div className="relative w-full h-[350px] max-md:h-[170px] rounded-2xl overflow-hidden">
                      {fatherMedia.length > 1 ? (
                        <>
                          <Swiper 
                            className="w-full h-full" 
                            loop={false} 
                            modules={[Navigation]} 
                            slidesPerView={1} 
                            spaceBetween={0}
                            navigation={{ 
                              nextEl: `.fatherNextBtn-${listingId}`, 
                              prevEl: `.fatherPrevBtn-${listingId}` 
                            }}
                          >
                            {fatherMedia.map((media, index: number) => (
                              <SwiperSlide key={index} className="relative w-full h-full">
                                {media.type === 'video' ? (
                                  <video 
                                    src={media.url} 
                                    controls
                                    className="w-full h-full object-cover"
                                    playsInline
                                  />
                                ) : (
                                  <Image 
                                    src={media.url} 
                                    alt={`Father dog ${media.type} ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </SwiperSlide>
                            ))}
                          </Swiper>
                          <ActionIcon 
                            rounded="full" 
                            className={`bg-black !h-12 max-md:!h-8 !w-12 max-md:!w-8 absolute top-0 bottom-0 m-auto z-10 left-2 fatherPrevBtn-${listingId}`}
                          >
                            <img className="-scale-x-100 max-w-3" src="/images/vectors/nextPrevArrow.svg" />
                          </ActionIcon>
                          <ActionIcon 
                            rounded="full" 
                            className={`bg-black !h-12 max-md:!h-8 !w-12 max-md:!w-8 absolute top-0 bottom-0 m-auto z-10 right-2 fatherNextBtn-${listingId}`}
                          >
                            <img className="max-w-3" src="/images/vectors/nextPrevArrow.svg" />
                          </ActionIcon>
                        </>
                      ) : (
                        <>
                          {fatherMedia[0].type === 'video' ? (
                            <video 
                              src={fatherMedia[0].url} 
                              controls
                              className="w-full h-full object-cover rounded-2xl"
                              playsInline
                            />
                          ) : (
                            <span className="w-full h-full flex rounded-2xl overflow-hidden relative">
                              <Image 
                                src={fatherMedia[0].url} 
                                alt="Father dog image"
                                fill
                                className="object-cover"
                              />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
                {transformedListing.fatherInfo.name && (
                  <span className="text-[22px] font-medium max-md:text-[18px]">Name: {transformedListing.fatherInfo.name}</span>
                )}
                {(transformedListing.fatherInfo.breed || 
                  transformedListing.fatherInfo.color || 
                  transformedListing.fatherInfo.weight || 
                  transformedListing.fatherInfo.temperament || 
                  transformedListing.fatherInfo.healthInfo) && (
                  <ul className="list-disc list-inside text-xs text-[#8A8585]">
                    {transformedListing.fatherInfo.breed && (
                      <li>Breed: {transformedListing.fatherInfo.breed}</li>
                    )}
                    {transformedListing.fatherInfo.color && (
                      <li>Color: {transformedListing.fatherInfo.color}</li>
                    )}
                    {transformedListing.fatherInfo.weight && (
                      <li>Weight: {transformedListing.fatherInfo.weight}</li>
                    )}
                    {transformedListing.fatherInfo.temperament && (
                      <li>Temperament: {transformedListing.fatherInfo.temperament}</li>
                    )}
                    {transformedListing.fatherInfo.healthInfo && (
                      <li>Health Info: {transformedListing.fatherInfo.healthInfo}</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}
          {transformedListing.motherInfo && (
            <div className={`overflow-hidden flex flex-col gap-2 ${hasBoth ? 'w-full' : 'w-1/2 max-md:w-full'}`}>
              <span className="text-[32px] font-medium flex justify-center max-md:text-[22px]">Mother</span>
              <div className="p-6 border border-black/20 rounded-40 bg-white gap-2 flex flex-col max-md:p-4 max-md:rounded-[20px]">
                {(() => {
                  // Combine images and videos
                  const motherMedia = [
                    ...(transformedListing.motherImages || []).map((url: string) => ({ url, type: 'image' as const })),
                    ...(transformedListing.motherVideos || []).map((url: string) => ({ url, type: 'video' as const }))
                  ];
                  
                  if (motherMedia.length === 0) return null;
                  
                  return (
                    <div className="relative w-full h-[350px] max-md:h-[170px] rounded-2xl overflow-hidden">
                      {motherMedia.length > 1 ? (
                        <>
                          <Swiper 
                            className="w-full h-full" 
                            loop={false} 
                            modules={[Navigation]} 
                            slidesPerView={1} 
                            spaceBetween={0}
                            navigation={{ 
                              nextEl: `.motherNextBtn-${listingId}`, 
                              prevEl: `.motherPrevBtn-${listingId}` 
                            }}
                          >
                            {motherMedia.map((media, index: number) => (
                              <SwiperSlide key={index} className="relative w-full h-full">
                                {media.type === 'video' ? (
                                  <video 
                                    src={media.url} 
                                    controls
                                    className="w-full h-full object-cover object-top"
                                    playsInline
                                  />
                                ) : (
                                  <Image 
                                    src={media.url} 
                                    alt={`Mother dog ${media.type} ${index + 1}`}
                                    fill
                                    className="object-top object-cover"
                                  />
                                )}
                              </SwiperSlide>
                            ))}
                          </Swiper>
                          <ActionIcon 
                            rounded="full" 
                            className={`bg-black !h-12 max-md:!h-8 !w-12 max-md:!w-8 absolute top-0 bottom-0 m-auto z-10 left-2 motherPrevBtn-${listingId}`}
                          >
                            <img className="-scale-x-100 max-w-3" src="/images/vectors/nextPrevArrow.svg" />
                          </ActionIcon>
                          <ActionIcon 
                            rounded="full" 
                            className={`bg-black !h-12 max-md:!h-8 !w-12 max-md:!w-8 absolute top-0 bottom-0 m-auto z-10 right-2 motherNextBtn-${listingId}`}
                          >
                            <img className="max-w-3" src="/images/vectors/nextPrevArrow.svg" />
                          </ActionIcon>
                        </>
                      ) : (
                        <>
                          {motherMedia[0].type === 'video' ? (
                            <video 
                              src={motherMedia[0].url} 
                              controls
                              className="w-full h-full object-cover object-top rounded-2xl"
                              playsInline
                            />
                          ) : (
                            <span className="w-full h-full flex rounded-2xl overflow-hidden relative">
                              <Image 
                                src={motherMedia[0].url} 
                                alt="Mother dog image"
                                fill
                                className="object-top object-cover"
                              />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
                {transformedListing.motherInfo.name && (
                  <span className="text-[22px] font-medium max-md:text-[18px]">Name: {transformedListing.motherInfo.name}</span>
                )}
                {(transformedListing.motherInfo.breed || 
                  transformedListing.motherInfo.color || 
                  transformedListing.motherInfo.weight || 
                  transformedListing.motherInfo.temperament || 
                  transformedListing.motherInfo.healthInfo) && (
                  <ul className="list-disc list-inside text-xs text-[#8A8585]">
                    {transformedListing.motherInfo.breed && (
                      <li>Breed: {transformedListing.motherInfo.breed}</li>
                    )}
                    {transformedListing.motherInfo.color && (
                      <li>Color: {transformedListing.motherInfo.color}</li>
                    )}
                    {transformedListing.motherInfo.weight && (
                      <li>Weight: {transformedListing.motherInfo.weight}</li>
                    )}
                    {transformedListing.motherInfo.temperament && (
                      <li>Temperament: {transformedListing.motherInfo.temperament}</li>
                    )}
                    {transformedListing.motherInfo.healthInfo && (
                      <li>Health Info: {transformedListing.motherInfo.healthInfo}</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
          );
        })()}
      </section>
      )}
      
      <section className="relative">
        <img className="mix-blend-multiply absolute bottom-0 max-md:max-w-52 max-md:top-0 max-md:my-auto max-md:-ml-4" src="/images/vectors/gradientLeft.png" />
        <img className="mix-blend-multiply absolute right-0 top-0 max-md:hidden" src="/images/vectors/gradientRight.png" />
        <div className="container relative z-10">
          <span className="text-[40px] font-semibold flex justify-center w-full max-md:text-[32px]">{(transformedListing.type == ListingTypeEnum.OTHER_SERVICES) ? 'Service Details' : 'Puppy Details'}</span>
          {dogDetails.map((item, index) => {
            if (item.label === "Dog Images" || item.label === "Dog Name" || item.label === "Semen Images" || item.label === "Hide Address" || item.label === "Listing Type" || item.label === "Location" || item.title) {
              return (
                <React.Fragment key={index}>
                  {(item.label !== "Dog Images" && item.label !== "Dog Name" && item.label !== "Semen Images" && item.label !== "Hide Address" && item.label !== "Listing Type" && item.label !== "Location") && (
                    <>
                      <div className={`flex justify-center py-3 text-[32px] ${item.title ? 'font-semibold' : ''}`}>
                        <span className={`w-1/3 max-md:w-1/2 text-center max-md:text-base max-md:text-left ${item.title ? 'max-md:text-xl' : ''}`}>{item.label}</span>
                        <span className={`w-1/3 max-md:w-1/2 text-center max-md:text-base max-md:text-right ${item.title ? 'max-md:text-xl' : ''}`}>{item.value}</span>
                      </div>
                      <hr className="border-0 h-0.5 bg-gradient-to-r from-white/0 via-[#EFC951] to-white/0" />
                    </>
                  )}
                </React.Fragment>
              );
            }
            
            const isExpanded = expandedDetails[index] || false;
            const value = item.value || '';
            // Consider text long if it's more than ~80 characters (roughly 2 lines at 32px font)
            const isLongText = typeof value === 'string' && value.length > 80;
            
            return (
              <React.Fragment key={index}>
                <div className={`flex justify-center py-3 text-[32px] max-md:text-base`}>
                  <span className="w-1/3 max-md:w-1/2 text-center max-md:text-base max-md:text-left">{item.label}</span>
                  <div className="w-1/3 max-md:w-1/2 text-center max-md:text-base max-md:text-right flex flex-col items-center max-md:items-center">
                    <span 
                      className={`${isLongText && !isExpanded ? 'line-clamp-2' : ''}`}
                      style={{
                        display: isLongText && !isExpanded ? '-webkit-box' : 'block',
                        WebkitLineClamp: isLongText && !isExpanded ? 2 : undefined,
                        WebkitBoxOrient: isLongText && !isExpanded ? 'vertical' : undefined,
                        overflow: isLongText && !isExpanded ? 'hidden' : 'visible',
                      }}
                    >
                      {value}
                    </span>
                    {isLongText && (
                      <button
                        onClick={() => setExpandedDetails(prev => ({ ...prev, [index]: !isExpanded }))}
                        className="text-sm text-[#EFC951] hover:text-[#E6B847] mt-1 font-medium underline max-md:text-xs"
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </div>
                <hr className="border-0 h-0.5 bg-gradient-to-r from-white/0 via-[#EFC951] to-white/0" />
              </React.Fragment>
            );
          })}
        </div>
      </section>
      <section className="container relative overflow-hidden p-8 border border-black/20 rounded-40 bg-white flex flex-col items-center bg-aboutOwner bg-no-repeat bg-center bg-container max-md:p-4 max-md:rounded-[20px]">
        <span className="text-[40px] font-medium relative max-md:text-[32px]">
          <img className="absolute -left-32 top-6 max-md:w-14 max-md:-left-14" src="/images/vectors/line-12.png" />About Owner
        </span>
        <div className="flex items-center gap-4 mt-2">
          {transformedListing.user?.imageUrl ? (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#EFC951] relative">
              <Image
                src={transformedListing.user.imageUrl}
                alt="Owner Profile"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#EFC951] relative">
              <Image
                src="/images/vectors/profile.jpg"
                alt="Owner Profile"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col flex-1">
            <span className="text-xl font-medium max-md:text-base text-center">
              {transformedListing.user?.name || "Owner Name Not Available"}
              <img className="absolute -bottom-2" src="/images/vectors/line-11.png" />
            </span>
            {transformedListing.user?.email && (
              <span className="text-lg text-[#5A5A5A] mt-1 max-md:text-sm">
                {transformedListing.user.email}
              </span>
            )}
          </div>
          {transformedListing.user?.username && (
            <a
              href={`/user/${transformedListing.user.username}`}
              className="bg-[#EFC951] hover:bg-[#E6B847] text-black px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </a>
          )}
        </div>
        <span className="text-[21px] text-[#7E7E7E] mt-5 max-md:text-sm max-md:mt-3">
          Member since: {transformedListing.createdAt ?
            (() => {
              try {
                const date = new Date(transformedListing.createdAt);
                if (isNaN(date.getTime())) {
                  return 'Date not available';
                }
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              } catch (error) {
                return 'Date not available';
              }
            })() :
            'Date not available'
          }
        </span>
      </section>
       {/* More from this Seller section */}
       {sellerListingsData && sellerListings.length > 0 && (
        <section className="flex flex-col gap-6 container">
          <span className="text-[40px] font-medium max-md:text-[32px]">{transformedListing.user?.name}'s Previous Listings</span>
          <div className="flex gap-6 items-start max-md:flex-col max-md:gap-4">
            {/* Spacer to match explore page sidebar width */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-4 max-md:grid-cols-1 gap-6 max-md:gap-4 items-stretch">
                {sellerListings.map((listing) => (
                  <div key={listing.id} className="w-full">
                    <ListingCard 
                      listing={{ ...listing, favourite: true }} 
                      currentUserId={currentUser?.id}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
     
      <section className="flex flex-col gap-6 container">
        <span className="text-[40px] font-medium max-md:text-[32px]">Similar listings you may like</span>
          <div className="flex gap-6 items-start max-md:flex-col max-md:gap-4">
            {/* Spacer to match explore page sidebar width */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-4 max-md:grid-cols-1 gap-6 max-md:gap-4 items-stretch">
                {similarListingsData ? (
                  similarListings.length > 0 ? (
                    similarListings.map((listing) => (
                      <div key={listing.id} className="w-full">
                        <ListingCard 
                          listing={{ ...listing, favourite: true }} 
                          currentUserId={currentUser?.id}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-8 text-gray-500">
                      No similar listings found at the moment.
                    </div>
                  )
                ) : (
                  <div className="w-full text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    Loading similar listings...
                  </div>
                )}
              </div>
            </div>
          </div>
      </section>
      <CtaBlock />
      
      {/* File Viewer Modals */}
      {transformedListing?.fields?.dnaResults && Array.isArray(transformedListing.fields.dnaResults) && transformedListing.fields.dnaResults.length > 0 && (
        <FileViewerModal
          isOpen={showDnaResultsModal}
          onClose={() => setShowDnaResultsModal(false)}
          title="DNA Results of Parents"
          files={transformedListing.fields.dnaResults}
        />
      )}
      
      {transformedListing?.fields?.healthCertificates && Array.isArray(transformedListing.fields.healthCertificates) && transformedListing.fields.healthCertificates.length > 0 && (
        <FileViewerModal
          isOpen={showHealthCertificatesModal}
          onClose={() => setShowHealthCertificatesModal(false)}
          title="Health Certificates"
          files={transformedListing.fields.healthCertificates}
        />
      )}
    </>
  );
};

export default ExploreDetail;
