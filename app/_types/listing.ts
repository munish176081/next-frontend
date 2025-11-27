export enum ListingTypeEnum {
  SEMEN_LISTING = 'SEMEN_LISTING',
  PUPPY_LISTING = 'PUPPY_LISTING',
  PUPPY_LITTER_LISTING = 'PUPPY_LITTER_LISTING',
  LITTER_LISTING = 'LITTER_LISTING',
  STUD_LISTING = 'STUD_LISTING',
  FUTURE_LISTING = 'FUTURE_LISTING',
  WANTED_LISTING = 'WANTED_LISTING',
  OTHER_SERVICES = 'OTHER_SERVICES',
}

export enum ListingTypeShortCodeEnum {
  SEMEN_LISTING = 'semen_listing',
  PUPPY_LISTING = 'puppy_listing',
  PUPPY_LITTER_LISTING = 'puppy_litter_listing',
  STUD_LISTING = 'stud_listing',
  FUTURE_LISTING = 'future_listing',
  WANTED_LISTING = 'wanted_listing',
  OTHER_SERVICES = 'other_services_listing',
}

export enum ListingStatusEnum {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum ListingCategoryEnum {
  BREEDING = 'breeding',
  PUPPY = 'puppy',
  SERVICE = 'service',
  WANTED = 'wanted',
}

export enum ListingAvailabilityEnum {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD_OUT = 'sold_out',
  DRAFT = 'draft',
}

export interface ListingProductType {
  type: ListingTypeEnum;
  products: {
    id: string;
    name: string;
    title: string;
    price: number;
    description: string;
    image: string;
    durationInDays: number;
  }[];
}

export interface ListingAdType {
  id: string;
  listingType: ListingTypeEnum;
  title: string;
  description: string;
  products: {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    durationInDays: number;
  }[];
}

export interface ListingCheckoutType {
  listingId: string;
  durationInDays: number;
  adId?: string;
  adDurationInDays?: number;
}

export interface ListingLocationType {
  city: string;
  state: string;
  country: string;
  fullAddress: string;
}

export interface ListingFields {
  [key: string]: any;
}

export interface ListingType {
  id: string;
  userId: string;
  status: ListingStatusEnum;
  type: ListingTypeEnum;
  category: ListingCategoryEnum;
  title: string;
  description: string;
  fields: Record<string, any>;
  metadata: Record<string, any>;
  price: number;
  breed: string;
  location: string;
  expiresAt: string;
  startedOrRenewedAt: string;
  publishedAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  viewCount: number;
  favoriteCount: number;
  contactCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  isActive: boolean;
  seoData: Record<string, any>;
  analytics: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserListingType extends ListingType {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    imageUrl?: string;
  };
}

// Backend DTO types
export interface ParentInfo {
  name?: string;
  breed?: string;
  color?: string;
  weight?: string;
  temperament?: string;
  healthInfo?: string;
}

export interface CreateListingDto {
  title: string;
  description?: string;
  type: ListingTypeEnum;
  category: ListingCategoryEnum;
  availability?: ListingAvailabilityEnum;
  fields?: Record<string, any>;
  price?: number;
  breed?: string;
  breedId?: string;
  location?: string;
  expiresAt?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  images?: string[];
  videos?: string[];
  documents?: string[];
  tags?: string[];
  isFeatured?: boolean;
  isPremium?: boolean;
  motherInfo?: ParentInfo;
  fatherInfo?: ParentInfo;
  studInfo?: ParentInfo;
  seoData?: {
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  metadata?: Record<string, any>;
  paymentId?: string;
}

export interface UpdateListingDto extends Partial<CreateListingDto> {}

export interface ListingResponseDto {
  id: string;
  userId: string;
  type: ListingTypeEnum;
  status: ListingStatusEnum;
  category: ListingCategoryEnum;
  title: string;
  description: string;
  fields: Record<string, any>;
  metadata: Record<string, any>;
  price: number;
  breed: string;
  breedId?: string;
  breedName: string;
  location: string;
  featuredImage?: string;
  expiresAt: Date;
  startedOrRenewedAt: Date;
  publishedAt: Date;
  viewCount: number;
  favoriteCount: number;
  contactCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  isActive: boolean;
  seoData: Record<string, any>;
  analytics: Record<string, any>;
  motherInfo?: ParentInfo;
  fatherInfo?: ParentInfo;
  studInfo?: ParentInfo;
  createdAt: Date;
  updatedAt: Date;
  availability: ListingAvailabilityEnum;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    imageUrl?: string;
  };
}

export interface ListingSummaryDto {
  id: string;
  type: ListingTypeEnum;
  status: ListingStatusEnum;
  category: ListingCategoryEnum;
  title: string;
  price: number;
  description: string;
  breed: string;
  breedId?: string;
  breedName: string;
  age?: string;
  location: string;
  featuredImage: string;
  metadata: Record<string, any>;
  fields: Record<string, any>; // Add fields for pricing options
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  createdAt: Date;
  availability: ListingAvailabilityEnum;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    imageUrl?: string;
  };
  paymentId?: string | null;
  expiresAt?: Date;
  isActive?: boolean;
}

export interface PaginatedListingsResponseDto {
  data: ListingSummaryDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
