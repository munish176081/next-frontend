import React from 'react';
import { useBreeds } from '../../_services/hooks/breeds/useBreeds';
import { Combobox } from '../ui';

interface BreedSelectProps {
  value: string | undefined;
  onChange: (value: string, breedId?: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
  placeholder?: string;
  btnClassName?: string;
  popoverClassName?: string;
}

export const BreedSelect: React.FC<BreedSelectProps> = ({
  value,
  onChange,
  label = 'Breed',
  required = false,
  error,
  disabled = false,
  className = '',
  showLabel = true,
  placeholder = 'Select a breed',
  btnClassName = '',
  popoverClassName = '',
}) => {
  const { breeds, isLoading, isError } = useBreeds();

  const handleChange = (selectedBreedName: string) => {
    const selectedBreed = breeds.find(breed => breed.name === selectedBreedName);
    
    if (selectedBreed) {
      // Pass both breed name and ID
      onChange(selectedBreed.name, selectedBreed.id);
    } else {
      onChange('', undefined);
    }
  };

  const options = breeds.map(breed => ({
    value: breed.name,
    label: breed.name,
  }));

  if (isLoading) {
    return (
      <div className={className}>
        {showLabel && label && (
          <label className="block mb-1 font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className={`text-base max-md:text-xs max-md:px-4 font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12 bg-[#F1F1F1] flex items-center justify-center text-sm text-[#736E6E] ${btnClassName}`}>
          Loading breeds...
        </div>
        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={className}>
        {showLabel && label && (
          <label className="block mb-1 font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className={`text-base max-md:text-xs max-md:px-4 font-normal outline-none px-6 w-full h-[70px] rounded-full border border-red-500 max-md:h-12 bg-[#F1F1F1] flex items-center justify-center text-sm text-red-500 ${btnClassName}`}>
          Failed to load breeds
        </div>
        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      </div>
    );
  }

  return (
    
      <Combobox
        showLabel={false}
        label={placeholder}
        value={value || ""}
        setValue={handleChange}
        options={options}
        btnClassName={btnClassName + " " + className}
        popoverClassName={popoverClassName}
        error={error }
      />
  );
}; 