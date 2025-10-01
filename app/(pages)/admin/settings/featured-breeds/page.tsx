"use client";

import React, { useState } from 'react';
import { useAdminBreeds } from '@/_services/hooks/admin';
import { useToggleFeaturedBreed } from '@/_services/hooks/breeds/use-toggle-featured-breed';
import { Switch } from '@/_components/ui/switch';
import { Input } from '@/_components/ui/input';
import { Button } from '@/_components/ui/button';
import { Search, Star, StarOff, Filter } from 'lucide-react';
import { toast } from '@/_hooks/use-toast';

export default function FeaturedBreedsSettings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'not-featured'>('all');
  
  const { data: breedsData, isLoading, error } = useAdminBreeds({
    search: searchTerm,
    page: 1,
    limit: 1000, // Get all breeds for management
  });

  const toggleFeaturedBreed = useToggleFeaturedBreed();

  const handleToggleFeatured = async (breedId: string) => {
    try {
      await toggleFeaturedBreed.mutateAsync(breedId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const breeds = breedsData?.breeds || [];
  const filteredBreeds = breeds.filter(breed => {
    if (filterFeatured === 'featured') return breed.isFeatured;
    if (filterFeatured === 'not-featured') return !breed.isFeatured;
    return true;
  });

  const featuredCount = breeds.filter(breed => breed.isFeatured).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading breeds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Error loading breeds. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Featured Breeds Management</h1>
          <p className="text-gray-600 mt-1">
            Manage which breeds are featured on the homepage
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>{featuredCount} featured breeds</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search breeds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterFeatured === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterFeatured('all')}
          >
            All ({breeds.length})
          </Button>
          <Button
            variant={filterFeatured === 'featured' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterFeatured('featured')}
            className="text-yellow-600"
          >
            <Star className="h-4 w-4 mr-1" />
            Featured ({featuredCount})
          </Button>
          <Button
            variant={filterFeatured === 'not-featured' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterFeatured('not-featured')}
          >
            <StarOff className="h-4 w-4 mr-1" />
            Not Featured
          </Button>
        </div>
      </div>

      {/* Breeds List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Breeds ({filteredBreeds.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredBreeds.map((breed) => (
            <div key={breed.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                {breed.imageUrl ? (
                  <img
                    src={breed.imageUrl}
                    alt={breed.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-medium">
                      {breed.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{breed.name}</h3>
                  <p className="text-sm text-gray-500">{breed.category}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {breed.isFeatured ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {breed.isFeatured ? 'Featured' : 'Not Featured'}
                  </span>
                </div>
                
                <Switch
                  checked={breed.isFeatured}
                  onCheckedChange={() => handleToggleFeatured(breed.id)}
                  disabled={toggleFeaturedBreed.isPending}
                />
              </div>
            </div>
          ))}
        </div>

        {filteredBreeds.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No breeds found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No breeds match the current filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
