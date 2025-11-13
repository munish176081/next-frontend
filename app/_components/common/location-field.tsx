"use client";

import { useState, useRef, useEffect } from 'react';
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import { MapPin } from "lucide-react";

interface LocationFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  label?: string;
  variant?: 'default' | 'form-field';
}

const libraries: ("places")[] = ["places"];

export default function LocationField({ 
  value, 
  onChange, 
  placeholder = "Enter Australian location", 
  error, 
  required = false,
  label = "Location",
  variant = 'default'
}: LocationFieldProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [autocompleteError, setAutocompleteError] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Sync internal state with prop value changes (for edit forms)
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Listen for Google Maps API errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Window error event:', event);
      if (event.message?.toLowerCase().includes('maps') || 
          event.message?.toLowerCase().includes('google') ||
          event.filename?.toLowerCase().includes('maps')) {
        console.error('Google Maps error detected:', event);
        setAutocompleteError(true);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', event);
      if (event.reason?.message?.toLowerCase().includes('maps') || 
          event.reason?.message?.toLowerCase().includes('google')) {
        console.error('Google Maps promise rejection:', event);
        setAutocompleteError(true);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [setAutocompleteError]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "" ,
    libraries,
  });

  console.log("rvg",process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY )

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        // Check if the place is in Australia
        const isInAustralia = place.address_components?.some(component => 
          component.types.includes('country') && component.short_name === 'AU'
        );

        // Allow only suburb (locality) or postcode (postal_code)
        const isSuburbOrPostcode = place.types?.includes('locality') || place.types?.includes('postal_code');
        
        if (isInAustralia && isSuburbOrPostcode) {
          // Extract only suburb, state, postcode, and country parts
          const suburb = place.address_components?.find((c) =>
            c.types.includes('locality')
          )?.long_name;
          const state = place.address_components?.find((c) =>
            c.types.includes('administrative_area_level_1')
          )?.short_name;
          const postcode = place.address_components?.find((c) =>
            c.types.includes('postal_code')
          )?.long_name;
          const country = place.address_components?.find((c) =>
            c.types.includes('country')
          )?.long_name;

          // Construct clean address
          const parts = [suburb, state, postcode, country].filter(Boolean);
          const formattedAddress = parts.join(' ');

          setInputValue(formattedAddress);
          onChange(formattedAddress);
        } else {
          // If not in Australia, clear the input and show an error
          setInputValue('');
          onChange('');
          // You could add a toast notification here if you want
          console.warn('Please select an Australian address');
        }
      }
    }
  };

  const handleAutocompleteError = () => {
    setAutocompleteError(true);
  };

  useEffect(() => {
    // Set a timeout to detect if Google Maps API is not working properly
    if (isLoaded && !loadError) {
      // Check for Google's error dialog being present on the page
      const checkForGoogleError = () => {
        // Look for Google's error dialog elements
        const googleErrorElements = document.querySelectorAll('div[style*="z-index"]');
        let hasGoogleError = false;
        
        googleErrorElements.forEach(el => {
          const text = el.textContent || '';
          if (text.includes("can't load Google Maps") || 
              text.includes("Do you own this website") ||
              text.includes("Google Maps error")) {
            hasGoogleError = true;
            console.warn('Google Maps error dialog detected');
          }
        });

        if (hasGoogleError) {
          setAutocompleteError(true);
          return;
        }

        // Also check if Google Maps API is actually available
        try {
          if (!window.google?.maps?.places) {
            console.warn('Google Maps Places API not available');
            setAutocompleteError(true);
          }
        } catch (e) {
          console.error('Error checking Google Maps:', e);
          setAutocompleteError(true);
        }
      };

      // Check immediately and repeatedly
      checkForGoogleError();
      
      // Set up an observer to watch for Google error dialogs
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              const element = node as Element;
              const text = element.textContent || '';
              if (text.includes("can't load Google Maps") || 
                  text.includes("Do you own this website")) {
                console.warn('Google Maps error dialog detected via MutationObserver');
                setAutocompleteError(true);
              }
            }
          });
        });
      });

      // Observe the document body for changes (Google dialogs are added to body)
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Also set a delayed check in case of slow loading issues
      const timer = setTimeout(() => {
        checkForGoogleError();
      }, 3000); // 3 seconds timeout

      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }
  }, [isLoaded, loadError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  // Styling based on variant
  const baseClasses = variant === 'form-field' 
    ? "block peer w-full bg-transparent font-normal focus:outline-none transition duration-200 disabled:bg-gray-100 disabled:placeholder:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 px-4 py-2 text-sm h-10 lg:h-11 2xl:h-12 leading-[40px] lg:leading-[44px] 2xl:leading-[48px] rounded-md border border-gray-300 placeholder:text-gray-500 not-read-only:hover:enabled:border-gray-1000 focus:border-gray-1000 not-read-only:focus:enabled:border-gray-1000 focus:ring-gray-900/20"
    : "text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12";
  
  const errorClasses = error 
    ? (variant === 'form-field' ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : "border-red-500")
    : "";

  // Show fallback input if there's an error loading maps or if autocomplete fails
  if (loadError || autocompleteError) {
    // Fallback to regular input if Google Maps fails to load
    return (
      <div className="flex flex-col w-full">
        {/* <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label> */}
        <div className="relative">
          <MapPin className={`absolute top-1/2 transform -translate-y-1/2 text-gray-600 max-md:text-gray-700 z-10 ${variant === 'form-field' ? 'left-3 w-4 h-4 max-md:w-5 max-md:h-5' : 'left-6 w-5 h-5 max-md:w-6 max-md:h-6 max-md:left-4'}`} />
          <input
            type="text"
            placeholder="Enter address manually"
            value={inputValue}
            onChange={handleInputChange}
            className={`${baseClasses} ${errorClasses} ${variant === 'form-field' ? 'pl-10 max-md:pl-12' : 'pl-12 max-md:pl-14 cursor-pointer hover:border-gray-400 transition-colors focus:ring-2 focus:ring-CPrimary focus:ring-opacity-50 focus:border-CPrimary'}`}
          />
        </div>
        <span className="text-amber-600 text-sm mt-1">
          Unable to fetch address suggestions. Please enter the address manually.
        </span>
        {error && (
          <span className="text-red-500 text-sm mt-1">{error}</span>
        )}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col w-full">
        {/* <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label> */}
        <div className="relative">
          <MapPin className={`absolute top-1/2 transform -translate-y-1/2 text-gray-600 max-md:text-gray-700 z-10 ${variant === 'form-field' ? 'left-3 w-4 h-4 max-md:w-5 max-md:h-5' : 'left-6 w-5 h-5 max-md:w-6 max-md:h-6 max-md:left-4'}`} />
          <input
            type="text"
            placeholder="Loading Australian locations..."
            disabled
            className={`${baseClasses} ${errorClasses} ${variant === 'form-field' ? 'pl-10 max-md:pl-12' : 'pl-12 max-md:pl-14'} opacity-50 cursor-not-allowed`}
          />
        </div>
        {error && (
          <span className="text-red-500 text-sm mt-1">{error}</span>
        )}
      </div>
    );
  }

  // If we're showing the Google error, show fallback immediately
  if (autocompleteError && !loadError && isLoaded) {
    return (
      <div className="flex flex-col w-full">
        <div className="relative">
          <MapPin className={`absolute top-1/2 transform -translate-y-1/2 text-gray-600 max-md:text-gray-700 z-10 ${variant === 'form-field' ? 'left-3 w-4 h-4 max-md:w-5 max-md:h-5' : 'left-6 w-5 h-5 max-md:w-6 max-md:h-6 max-md:left-4'}`} />
          <input
            type="text"
            placeholder="Enter address manually"
            value={inputValue}
            onChange={handleInputChange}
            className={`${baseClasses} ${errorClasses} ${variant === 'form-field' ? 'pl-10 max-md:pl-12' : 'pl-12 max-md:pl-14 cursor-pointer hover:border-gray-400 transition-colors focus:ring-2 focus:ring-CPrimary focus:ring-opacity-50 focus:border-CPrimary'}`}
          />
        </div>
        <span className="text-amber-600 text-sm mt-1">
          Unable to fetch address suggestions. Please enter the address manually.
        </span>
        {error && (
          <span className="text-red-500 text-sm mt-1">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label> */}
              <Autocomplete
          onLoad={(autocomplete) => {
            try {
              autocompleteRef.current = autocomplete;
              setAutocompleteError(false); // Reset error when autocomplete loads successfully
            } catch (error) {
              console.error('Error loading autocomplete:', error);
              setAutocompleteError(true);
            }
          }}
          onPlaceChanged={handlePlaceChanged}
          options={{
            componentRestrictions: { country: "AU" },
            types: ["(regions)"],
            bounds: {
              north: -10.0,  // Northern Australia
              south: -44.0,  // Southern Australia
              east: 154.0,   // Eastern Australia
              west: 113.0    // Western Australia
            }
          }}
        >
        <div className="relative">
          <MapPin className={`absolute top-1/2 transform -translate-y-1/2 text-gray-600 max-md:text-gray-700 z-10 ${variant === 'form-field' ? 'left-3 w-4 h-4 max-md:w-5 max-md:h-5' : 'left-6 w-5 h-5 max-md:w-6 max-md:h-6 max-md:left-4'}`} />
          <input
            type="text"
            placeholder="Enter Australian location"
            value={inputValue}
            onChange={handleInputChange}
            className={`${baseClasses} ${errorClasses} ${variant === 'form-field' ? 'pl-10 max-md:pl-12' : 'pl-12 max-md:pl-14 cursor-text hover:border-gray-400 transition-colors focus:ring-2 focus:ring-CPrimary focus:ring-opacity-50 focus:border-CPrimary'}`}
          />
        </div>
      </Autocomplete>
      {error && (
        <span className="text-red-500 text-sm mt-1">{error}</span>
      )}
    </div>
  );
} 