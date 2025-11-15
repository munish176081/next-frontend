import { ListingTypeEnum } from "@/_types/listing";

/**
 * Base prices for each listing type (in USD)
 */
const BASE_PRICES: Record<ListingTypeEnum, number> = {
  [ListingTypeEnum.SEMEN_LISTING]: 19,
  [ListingTypeEnum.PUPPY_LISTING]: 49,
  [ListingTypeEnum.PUPPY_LITTER_LISTING]: 49,
  [ListingTypeEnum.STUD_LISTING]: 39,
  [ListingTypeEnum.FUTURE_LISTING]: 19,
  [ListingTypeEnum.WANTED_LISTING]: 0, // Free
  [ListingTypeEnum.OTHER_SERVICES]: 19,
};

/**
 * Subscription-based listing types (monthly recurring)
 */
export const SUBSCRIPTION_LISTING_TYPES: ListingTypeEnum[] = [
  ListingTypeEnum.SEMEN_LISTING, // $19/mo
  ListingTypeEnum.STUD_LISTING, // $39/mo
  ListingTypeEnum.FUTURE_LISTING, // $19/mo
  ListingTypeEnum.OTHER_SERVICES, // $19/mo
  ListingTypeEnum.PUPPY_LITTER_LISTING, // $49/mo or $128/mo with featured (always subscription)
];

/**
 * One-time payment listing types
 */
export const ONE_TIME_PAYMENT_LISTING_TYPES: ListingTypeEnum[] = [
  ListingTypeEnum.PUPPY_LISTING, // $49 one-time + optional $79/mo featured
  // PUPPY_LITTER_LISTING is now a subscription type (always subscription)
];

/**
 * Free listing types (no payment required)
 */
export const FREE_LISTING_TYPES: ListingTypeEnum[] = [
  ListingTypeEnum.WANTED_LISTING, // Free
];

/**
 * Check if a listing type requires a subscription
 */
export function isSubscriptionType(listingType: ListingTypeEnum): boolean {
  return SUBSCRIPTION_LISTING_TYPES.includes(listingType);
}

/**
 * Check if a listing type is a one-time payment
 */
export function isOneTimePaymentType(listingType: ListingTypeEnum): boolean {
  return ONE_TIME_PAYMENT_LISTING_TYPES.includes(listingType);
}

/**
 * Check if a listing type is free
 */
export function isFreeListingType(listingType: ListingTypeEnum): boolean {
  return FREE_LISTING_TYPES.includes(listingType);
}

/**
 * Listing duration in days for each listing type
 */
const LISTING_DURATION_DAYS: Record<ListingTypeEnum, number> = {
  [ListingTypeEnum.SEMEN_LISTING]: 30,
  [ListingTypeEnum.PUPPY_LISTING]: 90,
  [ListingTypeEnum.PUPPY_LITTER_LISTING]: 90,
  [ListingTypeEnum.STUD_LISTING]: 30,
  [ListingTypeEnum.FUTURE_LISTING]: 180,
  [ListingTypeEnum.WANTED_LISTING]: 90,
  [ListingTypeEnum.OTHER_SERVICES]: 30,
};

/**
 * Add-on prices
 */
export const ADDON_PRICES = {
  FEATURED_HOMEPAGE_GALLERY: 79,
};

/**
 * Listing types that support featured/homepage gallery add-on
 */
export const FEATURED_ADDON_ELIGIBLE_TYPES = [
  ListingTypeEnum.PUPPY_LISTING,
  ListingTypeEnum.PUPPY_LITTER_LISTING,
];

/**
 * Parse price string to extract numeric value
 * Examples:
 * - "$19/mo" -> 19
 * - "$49 listing fee + add-ons" -> 49
 * - "Free" -> 0
 */
export function parsePriceString(priceString: string): number {
  if (!priceString || priceString.toLowerCase() === "free") {
    return 0;
  }

  // Extract first number from price string
  const match = priceString.match(/\$?(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }

  return 0;
}

/**
 * Get base price for a listing type
 */
export function getBasePrice(listingType: ListingTypeEnum): number {
  return BASE_PRICES[listingType] || 0;
}

/**
 * Get listing duration in days for a listing type
 */
export function getListingDuration(listingType: ListingTypeEnum): number {
  return LISTING_DURATION_DAYS[listingType] || 30;
}

/**
 * Check if a listing type is eligible for featured add-on
 */
export function isFeaturedAddonEligible(listingType: ListingTypeEnum): boolean {
  return FEATURED_ADDON_ELIGIBLE_TYPES.includes(listingType);
}

/**
 * Calculate total price including add-ons
 */
export function calculateTotalPrice(
  listingType: ListingTypeEnum,
  includeFeatured: boolean = false
): number {
  const basePrice = getBasePrice(listingType);
  let total = basePrice;

  if (includeFeatured && isFeaturedAddonEligible(listingType)) {
    total += ADDON_PRICES.FEATURED_HOMEPAGE_GALLERY;
  }

  return total;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number | string | undefined | null): string {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === '') {
    return '$0.00';
  }
  
  // Convert string to number if needed
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if it's a valid number
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    console.warn('formatPrice: Invalid amount provided:', amount);
    return '$0.00';
  }
  
  return `$${numAmount.toFixed(2)}`;
}

/**
 * Get price breakdown for display
 */
export interface PriceBreakdown {
  basePrice: number;
  addons: Array<{ name: string; price: number }>;
  total: number;
  duration: number;
}

export function getPriceBreakdown(
  listingType: ListingTypeEnum,
  includeFeatured: boolean = false
): PriceBreakdown {
  const basePrice = getBasePrice(listingType);
  const addons: Array<{ name: string; price: number }> = [];

  if (includeFeatured && isFeaturedAddonEligible(listingType)) {
    addons.push({
      name: "Featured & Homepage Gallery",
      price: ADDON_PRICES.FEATURED_HOMEPAGE_GALLERY,
    });
  }

  const total = basePrice + addons.reduce((sum, addon) => sum + addon.price, 0);
  const duration = getListingDuration(listingType);

  return {
    basePrice,
    addons,
    total,
    duration,
  };
}

/**
 * Get subscription pricing for a listing type (monthly amount)
 */
export function getSubscriptionPrice(listingType: ListingTypeEnum): number {
  if (!isSubscriptionType(listingType)) {
    return 0;
  }
  return getBasePrice(listingType);
}

