"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import Textarea from '@/_components/ui/form-fields/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/_components/ui/select';
import { Switch } from '@/_components/ui/switch';
import { toast } from '@/_hooks/use-toast';
import { Breed, CreateBreedData, UpdateBreedData } from '@/_services/hooks/admin';
import { Save, X, RotateCcw } from 'lucide-react';
import { BreedImageUpload } from './breed-image-upload';

const breedSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug must be less than 255 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  category: z.string().optional(),
  size: z.string().optional(),
  temperament: z.string().optional(),
  lifeExpectancy: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().min(0, 'Sort order must be 0 or greater').default(0),
  imageUrl: z.string().optional(),
});

type BreedFormData = z.infer<typeof breedSchema>;

interface BreedFormProps {
  breed?: Breed;
  onSubmit: (data: CreateBreedData | UpdateBreedData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  'toy', 'sporting', 'herding', 'working', 'terrier', 'hound', 'companion', 'mixed'
];

// Normalize category value for comparison
const normalizeCategory = (category: string | undefined) => {
  if (!category) return '';
  return category.toLowerCase();
};

// Normalize size value for comparison
const normalizeSize = (size: string | undefined) => {
  if (!size) return '';
  return size.toLowerCase();
};

const SIZES = [
  'small', 'medium', 'large', 'giant'
];

export function BreedForm({ breed, onSubmit, onCancel, isLoading = false }: BreedFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BreedFormData>({
    resolver: zodResolver(breedSchema),
    defaultValues: {
      name: breed?.name || '',
      slug: breed?.slug || '',
      description: breed?.description || '',
      category: breed?.category || '',
      size: breed?.size || '',
      temperament: breed?.temperament || '',
      lifeExpectancy: breed?.lifeExpectancy || '',
      isActive: breed?.isActive ?? true,
      isFeatured: breed?.isFeatured ?? false,
      sortOrder: breed?.sortOrder || 0,
      imageUrl: breed?.imageUrl || '',
    },
  });

  const watchedName = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !isEditing) {
      const generatedSlug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setValue('slug', generatedSlug);
    }
  }, [watchedName, setValue, isEditing]);

  // Enable editing when user manually changes slug
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditing(true);
    setValue('slug', e.target.value);
  };

  const handleFormSubmit = (data: BreedFormData) => {
    // Ensure required fields are present for create operations
    if (!breed) {
      // Creating new breed - ensure all required fields
      const createData: CreateBreedData = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        size: data.size,
        temperament: data.temperament,
        lifeExpectancy: data.lifeExpectancy,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        imageUrl: data.imageUrl,
      };
      onSubmit(createData);
    } else {
      // Updating existing breed - allow partial updates
      const updateData: UpdateBreedData = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        size: data.size,
        temperament: data.temperament,
        lifeExpectancy: data.lifeExpectancy,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        imageUrl: data.imageUrl,
      };
      onSubmit(updateData);
    }
  };

  const handleReset = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col border border-black/20 rounded-[20px] pb-4">
      {/* Header */}
      <div className="flex gap-4 items-center p-6 justify-between border-b border-[#E9EDF7]">
        <div className="flex items-center gap-4">
          <h2 className="text-[22px] font-semibold">
            {breed ? 'Edit Breed' : 'Create New Breed'}
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                  disabled={isLoading}
                />
                <span className={`text-sm font-medium ${
                  watch('isActive') ? 'text-[#74D27E]' : 'text-[#EE5D50]'
                }`}>
                  {watch('isActive') ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Featured:</span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch('isFeatured')}
                  onCheckedChange={(checked) => setValue('isFeatured', checked)}
                  disabled={isLoading}
                />
                <span className={`text-sm font-medium ${
                  watch('isFeatured') ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  {watch('isFeatured') ? 'Featured' : 'Not Featured'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Basic Information
            </h3>
            
            {/* Name and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breed Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name')}
                  placeholder="e.g., Golden Retriever"
                  disabled={isLoading}
                  className={`border border-gray-300 rounded-md h-10 focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('slug')}
                  onChange={handleSlugChange}
                  placeholder="e.g., golden-retriever"
                  disabled={isLoading}
                  className={`border border-gray-300 rounded-md h-10 focus:ring-2 focus:ring-blue-500 ${
                    errors.slug ? 'border-red-500' : ''
                  }`}
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                )}
              </div>
            </div>

            {/* Category and Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={normalizeCategory(watch('category'))}
                  onValueChange={(value) => setValue('category', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border border-gray-300 rounded-md h-10 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <Select
                  value={normalizeSize(watch('size'))}
                  onValueChange={(value) => setValue('size', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border border-gray-300 rounded-md h-10 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Breed Image
            </h3>
            <BreedImageUpload
              value={watch('imageUrl')}
              onChange={(value) => setValue('imageUrl', value)}
              disabled={isLoading}
              error={errors.imageUrl?.message}
            />
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Breed Description
            </h3>
                          <Textarea
                {...register('description')}
                placeholder="Enter a detailed description of the breed..."
                rows={4}
                disabled={isLoading}
              />
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Additional Information
            </h3>
            
            {/* Temperament and Life Expectancy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperament
                </label>
                <Textarea
                  {...register('temperament')}
                  placeholder="e.g., Friendly, Energetic, Loyal, Intelligent"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Life Expectancy
                </label>
                <Input
                  {...register('lifeExpectancy')}
                  placeholder="e.g., 10-12 years"
                  disabled={isLoading}
                  className="border border-gray-300 rounded-md h-10 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <Input
                {...register('sortOrder', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
                disabled={isLoading}
                className={`border border-gray-300 rounded-md h-10 focus:ring-2 focus:ring-blue-500 ${
                  errors.sortOrder ? 'border-red-500' : ''
                }`}
              />
              {errors.sortOrder && (
                <p className="text-red-500 text-sm mt-1">{errors.sortOrder.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Lower numbers appear first in lists
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-[#E9EDF7]">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex items-center gap-2 border-black/20"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            {breed && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
                className="flex items-center gap-2 border-black/20"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
            >
              <Save className="w-4 h-4" />
              {isLoading || isSubmitting ? 'Saving...' : breed ? 'Update Breed' : 'Create Breed'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 