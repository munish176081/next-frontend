export type ListingTypeEnum =
  | "puppy"
  | "semen"
  | "stud_bitch"
  | "future"
  | "wanted_puppy"
  | "other";
export type ListingStatusEnum = "active" | "draft" | "expired";

export interface ListingProductType {
  type: ListingTypeEnum;
  products: {
    price: number;
    durationInDays: number;
    title?: string;
    description?: string;
  }[];
}

export interface ListingAdType {
  id: number;
  listingType: ListingTypeEnum;
  title: string;
  description: string | null;
  adType: string;
  products: {
    description?: string;
    price: number;
    durationInDays: number;
  }[];
}

export interface ListingCheckoutType {
  listingId: string;
  durationInDays: number;
  adId?: number;
  adDurationInDays?: number;
}

export interface ContactDetailsType {
  name: string;
  email: string;
  location: ListingLocationType;
  phoneNumber: string;
  additionalNotes: string;
}

export interface ListingLocationType {
  address?: string;
  lat?: number;
  lng?: number;
}

export interface ListingFields {
  title: string;
  description: string;
  age?: number;
  minAge?: number;
  maxAge?: number;
  budget?: number;
  fee?: number;
  pricePerPuppy?: number;
  breed: string;
  referenceImages?: string[];
  images?: string[];
  genderPreference?: string;
  isAnkcNumberRequired?: boolean;
  isHealthCeritificateRequired?: boolean;
  contactDetails: ContactDetailsType;
}

export interface ListingType {
  id: string;
  userId: string;
  status: ListingStatusEnum;
  type: ListingTypeEnum;
  fields: ListingFields;
  createdAt: string;
  updatedAt: string;
}

export interface UserListingType extends ListingType {
  expiresAt: string;
  startedOrRenewedAt: string;
}
