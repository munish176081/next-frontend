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
}

const libraries: ("places")[] = ["places"];

export default function LocationField({ 
  value, 
  onChange, 
  placeholder = "Enter Australian location", 
  error, 
  required = false,
  label = "Location"
}: LocationFieldProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Sync internal state with prop value changes (for edit forms)
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });
  console.log({ isLoaded, loadError, googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY });

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        // Check if the place is in Australia
        const isInAustralia = place.address_components?.some(component => 
          component.types.includes('country') && component.short_name === 'AU'
        );
        
        if (isInAustralia) {
          const address = place.formatted_address;
          setInputValue(address);
          onChange(address);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const baseClasses = "text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12";
  const errorClasses = error ? "border-red-500" : "";

  if (loadError) {
    // Fallback to regular input if Google Maps fails to load
    return (
      <div className="flex flex-col w-full">
        {/* <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label> */}
        <div className="relative">
          <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Enter Australian location"
            value={inputValue}
            onChange={handleInputChange}
            className={`${baseClasses} ${errorClasses} pl-12 cursor-pointer hover:border-gray-400 transition-colors focus:ring-2 focus:ring-CPrimary focus:ring-opacity-50 focus:border-CPrimary`}
          />
        </div>
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
          <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Loading Australian locations..."
            disabled
            className={`${baseClasses} ${errorClasses} pl-12 opacity-50 cursor-not-allowed`}
          />
        </div>
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
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={handlePlaceChanged}
          options={{
            componentRestrictions: { country: "AU" },
            types: ["geocode"],
            bounds: {
              north: -10.0,  // Northern Australia
              south: -44.0,  // Southern Australia
              east: 154.0,   // Eastern Australia
              west: 113.0    // Western Australia
            }
          }}
        >
        <div className="relative">
          <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <input
            type="text"
            placeholder="Enter Australian location"
            value={inputValue}
            onChange={handleInputChange}
            className={`${baseClasses} ${errorClasses} pl-12 cursor-text hover:border-gray-400 transition-colors focus:ring-2 focus:ring-CPrimary focus:ring-opacity-50 focus:border-CPrimary`}
          />
        </div>
      </Autocomplete>
      {error && (
        <span className="text-red-500 text-sm mt-1">{error}</span>
      )}
    </div>
  );
} 