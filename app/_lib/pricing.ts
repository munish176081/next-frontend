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
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
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

