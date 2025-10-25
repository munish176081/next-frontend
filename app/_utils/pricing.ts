/**
 * Utility functions for handling pricing display logic
 */

export interface PricingData {
  pricingOption?: 'displayPriceRange' | 'priceOnRequest' | 'fixedPrice';
  minPrice?: number;
  maxPrice?: number;
  price?: number;
  fixedPrice?: number;
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
  const { pricingOption, minPrice, maxPrice, price, fixedPrice } = pricingData;

  // If no pricing option is specified, fall back to using the price field
  if (!pricingOption) {
    // Convert to number and validate price
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (price === undefined || price === null || numericPrice === undefined || isNaN(numericPrice) || numericPrice <= 0) {
      return {
        displayText: 'Price not available',
        isValid: false,
        hasError: true,
        errorMessage: 'No valid pricing data found'
      };
    }

    // Format the price
    const formattedPrice = formatCurrency(numericPrice);
    
    return {
      displayText: `$${formattedPrice}`,
      isValid: true,
      hasError: false
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
    // Convert to numbers and validate min and max prices
    const numericMinPrice = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
    const numericMaxPrice = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
    
    if (minPrice === undefined || minPrice === null || numericMinPrice === undefined || isNaN(numericMinPrice) || numericMinPrice <= 0) {
      return {
        displayText: 'Price range not available',
        isValid: false,
        hasError: true,
        errorMessage: 'Minimum price not specified or invalid'
      };
    }

    if (maxPrice === undefined || maxPrice === null || numericMaxPrice === undefined || isNaN(numericMaxPrice) || numericMaxPrice <= 0) {
      return {
        displayText: 'Price range not available',
        isValid: false,
        hasError: true,
        errorMessage: 'Maximum price not specified or invalid'
      };
    }

   
    // Format the price range
    const formattedMinPrice = formatCurrency(numericMinPrice);
    const formattedMaxPrice = formatCurrency(numericMaxPrice);
    
    return {
      displayText: `$${formattedMinPrice} - $${formattedMaxPrice}`,
      isValid: true,
      hasError: false
    };
  }

  // Handle "Fixed Price" option
  if (pricingOption === 'fixedPrice') {
    // Convert to number and validate fixed price
    const numericFixedPrice = typeof fixedPrice === 'string' ? parseFloat(fixedPrice) : fixedPrice;
    
    if (fixedPrice === undefined || fixedPrice === null || numericFixedPrice === undefined || isNaN(numericFixedPrice) || numericFixedPrice <= 0) {
      return {
        displayText: 'Fixed price not available',
        isValid: false,
        hasError: true,
        errorMessage: 'Fixed price not specified or invalid'
      };
    }

    // Format the fixed price
    const formattedFixedPrice = formatCurrency(numericFixedPrice);
    
    return {
      displayText: `$${formattedFixedPrice}`,
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
  type?: string;
}): PricingDisplayResult => {
  if (!listingReference) {
    return {
      displayText: 'Price not available',
      isValid: false,
      hasError: true,
      errorMessage: 'Listing reference not provided'
    };
  }

  // Handle wanted listings - show budget instead of price
  if (listingReference.type === 'WANTED_LISTING') {
    const budget = listingReference.fields?.budget;
    
    if (!budget) {
      return {
        displayText: 'Budget Not Specified',
        isValid: true,
        hasError: false
      };
    }

    // If budget is a range (e.g., "$500 - $1,000"), extract min and max
    if (budget.includes(' - ')) {
      const [minStr, maxStr] = budget.split(' - ');
      const min = parseInt(minStr.replace(/[^0-9]/g, ''));
      const max = parseInt(maxStr.replace(/[^0-9]/g, ''));
      return {
        displayText: `$${min?.toLocaleString()} - $${max?.toLocaleString()}`,
        isValid: true,
        hasError: false
      };
    }
    
    // If budget is a single value or "No Budget"
    if (budget.toLowerCase().includes('no budget') || budget.toLowerCase().includes('flexible')) {
      return {
        displayText: 'Budget Flexible',
        isValid: true,
        hasError: false
      };
    }
    
    // If it's a single value
    const value = parseInt(budget.replace(/[^0-9]/g, ''));
    if (value && !isNaN(value)) {
      return {
        displayText: `$${value?.toLocaleString()}`,
        isValid: true,
        hasError: false
      };
    }

    // Fallback to original budget text
    return {
      displayText: budget,
      isValid: true,
      hasError: false
    };
  }

  const pricingData: PricingData = {
    pricingOption: listingReference.fields?.pricingOption,
    minPrice: listingReference.fields?.minPrice,
    maxPrice: listingReference.fields?.maxPrice,
    price: listingReference.price,
    fixedPrice: listingReference.fields?.fixedPrice
  };

  console.log(pricingData, "SUSHILssss", listingReference.fields  ) ; 

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
    price: price,
    fixedPrice: fields?.fixedPrice
  };
};

/**
 * Gets pricing display props for listing cards
 */
export const getPricingDisplayProps = (pricingInfo: ReturnType<typeof getPricingInfo>) => {
  const { pricingOption, minPrice, maxPrice, price, fixedPrice } = pricingInfo;
  
  return {
    isPriceOnRequest: pricingOption === 'priceOnRequest',
    hasPriceRange: pricingOption === 'displayPriceRange' && minPrice != null && maxPrice != null,
    hasFixedPrice: pricingOption === 'fixedPrice' && fixedPrice != null,
    hasBasicPrice: !pricingOption && price != null, // Handle case where no pricing option but has price
    minPrice,
    maxPrice,
    price: pricingOption === 'fixedPrice' ? fixedPrice : price
  };
};