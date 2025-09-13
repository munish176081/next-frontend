"use client";

import React, { useState } from 'react';
import { 
  StandardDropdown,
  StandardDropdownContent,
  StandardDropdownItem,
  StandardDropdownTrigger,
  StandardDropdownValue,
  StandardDropdownWrapper
} from './standard-dropdown';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from './select';
import { Combobox } from './combobox';
import { BreedSelect } from '../form-fields/breed-select';

const DropdownExamples: React.FC = () => {
  const [standardValue, setStandardValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [comboboxValue, setComboboxValue] = useState('');
  const [breedValue, setBreedValue] = useState('');

  const sampleOptions = [
    { value: 'fresh', label: 'Fresh' },
    { value: 'chilled', label: 'Chilled' },
    { value: 'frozen', label: 'Frozen' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Standardized Dropdown Components</h1>
        <p className="text-gray-600">All dropdowns now follow the same design theme with consistent styling</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Standard Dropdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Standard Dropdown</h3>
          <StandardDropdownWrapper label="Select Type" required>
            <StandardDropdown value={standardValue} onValueChange={setStandardValue}>
              <StandardDropdownTrigger>
                <StandardDropdownValue placeholder="Select Type" />
              </StandardDropdownTrigger>
              <StandardDropdownContent>
                {sampleOptions.map((option) => (
                  <StandardDropdownItem key={option.value} value={option.value}>
                    {option.label}
                  </StandardDropdownItem>
                ))}
              </StandardDropdownContent>
            </StandardDropdown>
          </StandardDropdownWrapper>
        </div>

        {/* Updated Select Component */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Updated Select Component</h3>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">
              Select Type
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {sampleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Updated Combobox */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Updated Combobox</h3>
          <Combobox
            label="Select Type"
            value={comboboxValue}
            setValue={setComboboxValue}
            options={sampleOptions}
            className="w-full"
          />
        </div>

        {/* Breed Select */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Breed Select</h3>
          <div className="flex flex-col w-full">
            <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">
              Breed
              <span className="text-red-500 ml-1">*</span>
            </label>
            <BreedSelect
              value={breedValue}
              onChange={(value) => setBreedValue(value)}
              label="Select a breed"
              required
              showLabel={false}
            />
          </div>
        </div>

      </div>

      {/* Design Guidelines */}
      <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Design Guidelines</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-CPrimary rounded-full flex-shrink-0"></div>
            <span><strong>Primary Color:</strong> #B699CA (CPrimary) for focus states and selections</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-[#B5B5B5] rounded-full flex-shrink-0"></div>
            <span><strong>Border:</strong> #B5B5B5 for default state</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border rounded-full flex-shrink-0"></div>
            <span><strong>Height:</strong> 70px on desktop, 48px on mobile</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border rounded-full flex-shrink-0"></div>
            <span><strong>Border Radius:</strong> Fully rounded (rounded-full)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border rounded-full flex-shrink-0"></div>
            <span><strong>Padding:</strong> 24px horizontal (px-6), responsive on mobile</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border rounded-full flex-shrink-0"></div>
            <span><strong>Typography:</strong> 16px base size, placeholder text in #4B4A4A8C</span>
          </div>
        </div>
      </div>

      {/* Selected Values Display */}
      {(standardValue || selectValue || comboboxValue || breedValue) && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Selected Values:</h4>
          <div className="space-y-1 text-sm text-blue-800">
            {standardValue && <div>Standard Dropdown: {standardValue}</div>}
            {selectValue && <div>Select Component: {selectValue}</div>}
            {comboboxValue && <div>Combobox: {comboboxValue}</div>}
            {breedValue && <div>Breed Select: {breedValue}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownExamples;
