import { ListingTypeEnum } from "@/_types/listing";

/**
 * Stripe Price IDs for subscription listing types
 * These should match the backend environment variables
 */
export const STRIPE_PRICE_IDS: Record<string, string> = {
  SEMEN_LISTING: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SEMEN || '',
  STUD_LISTING: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STUD || '',
  FUTURE_LISTING: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FUTURE || '',
  OTHER_SERVICES: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_OTHER_SERVICES || '',
  FEATURED_ADDON: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FEATURED || '',
  PUPPY_LITTER_WITH_FEATURED: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PUPPY_LITTER_WITH_FEATURED || '',
  PUPPY_LITTER_WITHOUT_FEATURED: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PUPPY_LITTER_WITHOUT_FEATURED || '',
};

/**
 * PayPal Plan IDs for subscription listing types
 * These should match the backend environment variables
 */
export const PAYPAL_PLAN_IDS: Record<string, string> = {
  SEMEN_LISTING: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_SEMEN || '',
  STUD_LISTING: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_STUD || '',
  FUTURE_LISTING: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_FUTURE || '',
  OTHER_SERVICES: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_OTHER_SERVICES || '',
  FEATURED_ADDON: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_FEATURED || '',
  PUPPY_LITTER_WITH_FEATURED: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_PUPPY_LITTER_WITH_FEATURED || '',
  PUPPY_LITTER_WITHOUT_FEATURED: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_PUPPY_LITTER_WITHOUT_FEATURED || '',
};

/**
 * Check if a listing type has a Stripe price ID configured (meaning it's a subscription type)
 */
export function hasStripePriceId(listingType: ListingTypeEnum | string): boolean {
  const listingTypeStr = listingType as string;
  
  // Check direct mapping
  if (STRIPE_PRICE_IDS[listingTypeStr] && STRIPE_PRICE_IDS[listingTypeStr].trim() !== '') {
    return true;
  }
  
  // Special case for PUPPY_LITTER_LISTING - check both with and without featured
  if (listingTypeStr === 'PUPPY_LITTER_LISTING') {
    return (
      (STRIPE_PRICE_IDS.PUPPY_LITTER_WITH_FEATURED && STRIPE_PRICE_IDS.PUPPY_LITTER_WITH_FEATURED.trim() !== '') ||
      (STRIPE_PRICE_IDS.PUPPY_LITTER_WITHOUT_FEATURED && STRIPE_PRICE_IDS.PUPPY_LITTER_WITHOUT_FEATURED.trim() !== '')
    ) as boolean;
  }
  
  return false;
}

/**
 * Check if a listing type has a PayPal plan ID configured (meaning it's a subscription type)
 */
export function hasPayPalPlanId(listingType: ListingTypeEnum | string): boolean {
  const listingTypeStr = listingType as string;
  
  // Check direct mapping
  if (PAYPAL_PLAN_IDS[listingTypeStr] && PAYPAL_PLAN_IDS[listingTypeStr].trim() !== '') {
    return true;
  }
  
  // Special case for PUPPY_LITTER_LISTING - check both with and without featured
  if (listingTypeStr === 'PUPPY_LITTER_LISTING') {
    return (
      (PAYPAL_PLAN_IDS.PUPPY_LITTER_WITH_FEATURED && PAYPAL_PLAN_IDS.PUPPY_LITTER_WITH_FEATURED.trim() !== '') ||
      (PAYPAL_PLAN_IDS.PUPPY_LITTER_WITHOUT_FEATURED && PAYPAL_PLAN_IDS.PUPPY_LITTER_WITHOUT_FEATURED.trim() !== '')
    ) as boolean;
  }
  
  return false;
}

/**
 * Get Stripe price ID for a listing type
 */
export function getStripePriceId(
  listingType: ListingTypeEnum | string,
  includesFeatured: boolean = false
): string | null {
  const listingTypeStr = listingType as string;
  
  // Special handling for PUPPY_LITTER_LISTING
  if (listingTypeStr === 'PUPPY_LITTER_LISTING') {
    return includesFeatured
      ? (STRIPE_PRICE_IDS.PUPPY_LITTER_WITH_FEATURED || null)
      : (STRIPE_PRICE_IDS.PUPPY_LITTER_WITHOUT_FEATURED || null);
  }
  
  // For other listing types
  const priceId = STRIPE_PRICE_IDS[listingTypeStr];
  return priceId && priceId.trim() !== '' ? priceId : null;
}

/**
 * Get PayPal plan ID for a listing type
 */
export function getPayPalPlanId(
  listingType: ListingTypeEnum | string,
  includesFeatured: boolean = false
): string | null {
  const listingTypeStr = listingType as string;
  
  // Special handling for PUPPY_LITTER_LISTING
  if (listingTypeStr === 'PUPPY_LITTER_LISTING') {
    return includesFeatured
      ? (PAYPAL_PLAN_IDS.PUPPY_LITTER_WITH_FEATURED || null)
      : (PAYPAL_PLAN_IDS.PUPPY_LITTER_WITHOUT_FEATURED || null);
  }
  
  // For other listing types
  const planId = PAYPAL_PLAN_IDS[listingTypeStr];
  return planId && planId.trim() !== '' ? planId : null;
}

/**
 * Get all subscription listing types based on configured price/plan IDs
 */
export function getSubscriptionListingTypes(): ListingTypeEnum[] {
  const subscriptionTypes: ListingTypeEnum[] = [];
  
  // Check each listing type
  Object.keys(ListingTypeEnum).forEach((key) => {
    const listingType = ListingTypeEnum[key as keyof typeof ListingTypeEnum];
    if (hasStripePriceId(listingType) || hasPayPalPlanId(listingType)) {
      subscriptionTypes.push(listingType);
    }
  });
  
  return subscriptionTypes;
}

/**
 * Check if a listing type requires a subscription based on Stripe price ID or PayPal plan ID configuration
 */
export function isSubscriptionTypeByPriceId(listingType: ListingTypeEnum | string): boolean {
  return hasStripePriceId(listingType) || hasPayPalPlanId(listingType);
}

