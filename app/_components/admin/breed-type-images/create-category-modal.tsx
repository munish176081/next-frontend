"use client";

import { useState } from 'react';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { useCreateCategory } from '@/_services/hooks/admin';
import { Plus, X } from 'lucide-react';

interface CreateCategoryModalProps {
  disabled?: boolean;
}

export function CreateCategoryModal({ disabled }: CreateCategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [errors, setErrors] = useState<string>('');
  
  const createCategory = useCreateCategory();

  const validateCategoryName = (name: string): string => {
    if (!name || typeof name !== 'string') {
      return 'Category name is required';
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < 3) {
      return 'Category name must be at least 3 characters long';
    }

    if (trimmedName.length > 50) {
      return 'Category name must be less than 50 characters';
    }

    // Check for valid format: lowercase, alphanumeric, hyphens, underscores only
    const validFormat = /^[a-z0-9_-]+$/.test(trimmedName);
    if (!validFormat) {
      return 'Category name must contain only lowercase letters, numbers, hyphens, and underscores';
    }

    // Check for consecutive special characters
    if (/[-_]{2,}/.test(trimmedName)) {
      return 'Category name cannot have consecutive hyphens or underscores';
    }

    // Check for starting/ending with special characters
    if (/^[-_]|[-_]$/.test(trimmedName)) {
      return 'Category name cannot start or end with hyphens or underscores';
    }

    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase(); // Convert to lowercase as user types
    setCategoryName(value);
    
    // Clear errors when user starts typing
    if (errors) {
      setErrors('');
    }
  };

  const handleSubmit = async () => {
    const validationError = validateCategoryName(categoryName);
    if (validationError) {
      setErrors(validationError);
      return;
    }

    try {
      await createCategory.mutateAsync({ category: categoryName.trim() });
      setCategoryName('');
      setErrors('');
      setIsOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    setCategoryName('');
    setErrors('');
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={disabled}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Breed Type
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Breed Type</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={categoryName}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="e.g., hunting, guard, family"
              disabled={createCategory.isPending}
              className={`border-2 rounded-lg h-12 focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                errors ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors && (
              <p className="text-red-500 text-sm mt-1">{errors}</p>
            )}
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">Naming Rules:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Use lowercase letters only</li>
                <li>• Numbers, hyphens (-), and underscores (_) allowed</li>
                <li>• 3-50 characters long</li>
                <li>• No spaces or special characters</li>
                <li>• Examples: hunting, guard-dogs, family_pets</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createCategory.isPending}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createCategory.isPending || !categoryName.trim()}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              {createCategory.isPending ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
