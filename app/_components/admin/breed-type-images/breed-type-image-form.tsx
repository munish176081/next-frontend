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
import { BreedTypeImage, CreateBreedTypeImageData, UpdateBreedTypeImageData, useAvailableCategories } from '@/_services/hooks/admin';
import { Save, X, RotateCcw } from 'lucide-react';
import { BreedImageUpload } from '../breeds/breed-image-upload';

const breedTypeImageSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  imageUrl: z.string().min(1, 'Image URL is required').max(500, 'Image URL must be less than 500 characters'),
  title: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0, 'Sort order must be 0 or greater').default(0),
});

type BreedTypeImageFormData = z.infer<typeof breedTypeImageSchema>;

interface BreedTypeImageFormProps {
  breedTypeImage?: BreedTypeImage;
  onSubmit: (data: CreateBreedTypeImageData | UpdateBreedTypeImageData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Categories are now dynamically managed through the backend

export function BreedTypeImageForm({ breedTypeImage, onSubmit, onCancel, isLoading }: BreedTypeImageFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: availableCategories, isLoading: categoriesLoading } = useAvailableCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BreedTypeImageFormData>({
    resolver: zodResolver(breedTypeImageSchema),
    defaultValues: {
      category: '',
      imageUrl: '',
      title: '',
      description: '',
      isActive: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (breedTypeImage) {
      reset({
        category: breedTypeImage.category,
        imageUrl: breedTypeImage.imageUrl,
        title: breedTypeImage.title || '',
        description: breedTypeImage.description || '',
        isActive: breedTypeImage.isActive,
        sortOrder: breedTypeImage.sortOrder,
      });
      setIsEditing(true);
    }
  }, [breedTypeImage, reset]);

  const handleFormSubmit = async (data: BreedTypeImageFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
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
            {breedTypeImage ? 'Edit Breed Type Image' : 'Create New Breed Type Image'}
          </h2>
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
            
            {/* Category and Image URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch('category')}
                  onValueChange={(value) => setValue('category', value)}
                  disabled={isLoading || isEditing}
                >
                  <SelectTrigger className="border border-gray-300 rounded-md h-10 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="" disabled>Loading categories...</SelectItem>
                    ) : availableCategories && availableCategories.length > 0 ? (
                      availableCategories.map((category) => (
                        <SelectItem key={category.category} value={category.category}>
                          {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breed Type Image <span className="text-red-500">*</span>
                </label>
                <BreedImageUpload
                  value={watch('imageUrl')}
                  onChange={(value) => setValue('imageUrl', value)}
                  disabled={isLoading}
                  error={errors.imageUrl?.message}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                {...register('title')}
                placeholder="e.g., Toy Breeds"
                disabled={isLoading}
                className="border border-gray-300 rounded-md h-10 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>


          {/* Description Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Description
            </h3>
            <Textarea
              {...register('description')}
              placeholder="Enter a description for this breed type..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Additional Information
            </h3>
            
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
            {breedTypeImage && (
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
              {isLoading || isSubmitting ? 'Saving...' : breedTypeImage ? 'Update Breed Type Image' : 'Create Breed Type Image'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
