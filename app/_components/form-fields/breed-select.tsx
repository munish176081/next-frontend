import React from 'react';
import { useBreeds } from '../../_services/hooks/breeds/useBreeds';

interface BreedSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
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
}) => {
  const { breeds, isLoading, isError } = useBreeds();

  return (
    <div>
      {showLabel && label && (
        <label className="block mb-1 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        required={required}
        disabled={isLoading || isError || disabled}
      >
        <option value="" disabled>
          {isLoading ? 'Loading breeds...' : isError ? 'Failed to load breeds' : 'Select a breed'}
        </option>
        {!isLoading && !isError && breeds.length === 0 && (
          <option value="" disabled>
            No breeds available
          </option>
        )}
        {breeds.map(breed => (
          <option key={breed.id} value={breed.id}>
            {breed.name}
          </option>
        ))}
      </select>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
}; 