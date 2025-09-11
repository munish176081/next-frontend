/**
 * Utility functions for handling pricing display logic
 */

export interface PricingData {
  pricingOption?: 'displayPriceRange' | 'priceOnRequest';
  minPrice?: number;
  maxPrice?: number;
  price?: number;
}

export interface PricingDisplayResult {
  displayText: string;
  isValid: boolean;
  hasError: boolean;
  errorMessage?: string;
}

/**
 * Formats a number as currency with proper locale formatting
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0';
  }
  
  return amount.toLocaleString('en-AU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Validates pricing data and returns display information
 */
export const getPricingDisplay = (pricingData: PricingData): PricingDisplayResult => {
  const { pricingOption, minPrice, maxPrice, price } = pricingData;

  // Check if pricing option is valid
  if (!pricingOption) {
    return {
      displayText: 'Price not available',
      isValid: false,
      hasError: true,
      errorMessage: 'Pricing option not specified'
    };
  }

  // Handle "Price on Request" option
  if (pricingOption === 'priceOnRequest') {
    return {
      displayText: 'Price on Request',
      isValid: true,
      hasError: false
    };
  }

  // Handle "Display Price Range" option
  if (pricingOption === 'displayPriceRange') {
    // Validate min and max prices
    if (minPrice === undefined || minPrice === null || isNaN(minPrice)) {
      return {
        displayText: 'Price range not available',
        isValid: false,
        hasError: true,
        errorMessage: 'Minimum price not specified or invalid'
      };
    }

    if (maxPrice === undefined || maxPrice === null || isNaN(maxPrice)) {
      return {
        displayText: 'Price range not available',
        isValid: false,
        hasError: true,
        errorMessage: 'Maximum price not specified or invalid'
      };
    }

   
    // Format the price range
    const formattedMinPrice = formatCurrency(minPrice);
    const formattedMaxPrice = formatCurrency(maxPrice);
    
    return {
      displayText: `$${formattedMinPrice} - $${formattedMaxPrice}`,
      isValid: true,
      hasError: false
    };
  }

  // Fallback to single price
  if (price !== undefined && price !== null && !isNaN(price)) {
    const formattedPrice = formatCurrency(price);
    return {
      displayText: `$${formattedPrice}`,
      isValid: true,
      hasError: false
    };
  }

  // No valid pricing data found
  return {
    displayText: 'Price not available',
    isValid: false,
    hasError: true,
    errorMessage: 'No valid pricing data found'
  };
};

/**
 * Gets pricing display for a listing reference object
 */
export const getListingPricingDisplay = (listingReference: {
  price?: number;
  fields?: Record<string, any>;
}): PricingDisplayResult => {
  if (!listingReference) {
    return {
      displayText: 'Price not available',
      isValid: false,
      hasError: true,
      errorMessage: 'Listing reference not provided'
    };
  }

  const pricingData: PricingData = {
    pricingOption: listingReference.fields?.pricingOption,
    minPrice: listingReference.fields?.minPrice,
    maxPrice: listingReference.fields?.maxPrice,
    price: listingReference.price
  };

  return getPricingDisplay(pricingData);
};

/**
 * Gets pricing information from fields and price
 */
export const getPricingInfo = (fields: Record<string, any>, price?: number) => {
  return {
    pricingOption: fields?.pricingOption,
    minPrice: fields?.minPrice,
    maxPrice: fields?.maxPrice,
    price: price
  };
};

/**
 * Gets pricing display props for listing cards
 */
export const getPricingDisplayProps = (pricingInfo: ReturnType<typeof getPricingInfo>) => {
  const { pricingOption, minPrice, maxPrice, price } = pricingInfo;
  
  return {
    isPriceOnRequest: pricingOption === 'priceOnRequest',
    hasPriceRange: pricingOption === 'displayPriceRange' && minPrice != null && maxPrice != null,
    hasFixedPrice: pricingOption !== 'displayPriceRange' && pricingOption !== 'priceOnRequest' && price != null,
    minPrice,
    maxPrice,
    price
  };
};