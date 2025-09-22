"use client";

import { useState } from "react";
import { Button } from "@/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import {
  useAdminBreedTypeImages,
  useDeleteBreedTypeImage,
  useToggleBreedTypeImageStatus,
  useAvailableCategories,
  useCreateCategoryImage,
  type BreedTypeImage,
  type AvailableCategory,
} from "@/_services/hooks/admin";
import { Search, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { CategoryImageUpload } from "./category-image-upload";
import { CreateCategoryModal } from "./create-category-modal";

interface BreedTypeImageListProps {
  onEdit: (breedTypeImage: BreedTypeImage) => void;
}

// Categories are now dynamically managed through the backend

export function BreedTypeImageList({ onEdit }: BreedTypeImageListProps) {
  const { data: breedTypeImages, isLoading, error } = useAdminBreedTypeImages();
  const { data: availableCategories, isLoading: categoriesLoading } = useAvailableCategories();
  const deleteBreedTypeImage = useDeleteBreedTypeImage();
  const toggleStatus = useToggleBreedTypeImageStatus();
  const createCategoryImage = useCreateCategoryImage();

  const handleDelete = async (breedTypeImage: BreedTypeImage) => {
    if (confirm(`Are you sure you want to delete the breed type image for "${breedTypeImage.category}"?`)) {
      await deleteBreedTypeImage.mutateAsync(breedTypeImage.id);
    }
  };

  const handleToggleStatus = async (breedTypeImage: BreedTypeImage) => {
    await toggleStatus.mutateAsync({ id: breedTypeImage.id, isActive: !breedTypeImage.isActive });
  };

  const handleCreateCategoryImage = async (category: string, imageUrl: string, title?: string, description?: string) => {
    await createCategoryImage.mutateAsync({
      category,
      data: {
        imageUrl,
        title: title || category.charAt(0).toUpperCase() + category.slice(1),
        description: description || `Image for ${category} breed category`
      }
    });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Failed to load breed type images</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col border border-black/20 rounded-[20px] pb-4">
      <div className="flex gap-4 items-center p-6 justify-between">
        <span className="text-[22px] font-semibold">Manage Breed Type (Categories)</span>
        <div className="flex gap-3">
          <CreateCategoryModal disabled={isLoading} />
        </div>
      </div>

      {/* Breed Type Images Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading breed type images...</p>
        </div>
      ) : (
        <>
          {!breedTypeImages || breedTypeImages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No breed type images found. Create your first one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {breedTypeImages.map((breedTypeImage) => (
                <Card key={breedTypeImage.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="aspect-video w-full overflow-hidden">
                      {breedTypeImage.imageUrl ? (
                        <img
                          src={breedTypeImage.imageUrl}
                          alt={breedTypeImage.title || breedTypeImage.category}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 ${breedTypeImage.imageUrl ? 'hidden' : ''}`}>
                        No Image
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={breedTypeImage.isActive ? "default" : "secondary"}
                        className={breedTypeImage.isActive ? "bg-green-lighter text-green-dark" : "bg-gray-100 text-gray-600"}
                      >
                        {breedTypeImage.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg capitalize">
                      {breedTypeImage.title || breedTypeImage.category}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Category: {breedTypeImage.category}
                    </p>
                    {breedTypeImage.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {breedTypeImage.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Sort Order: {breedTypeImage.sortOrder}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(breedTypeImage)}
                          disabled={toggleStatus.isPending}
                          className="w-8 h-8 p-0"
                        >
                          {breedTypeImage.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(breedTypeImage)}
                          className="w-8 h-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(breedTypeImage)}
                          disabled={deleteBreedTypeImage.isPending}
                          className="w-8 h-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Available Categories Section */}
          {availableCategories && availableCategories.length > 0 && (
            <div className="px-6">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Available Categories (No Images Yet)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCategories
                    .filter(cat => !cat.hasImage)
                    .map((category) => (
                      <Card key={category.category} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium capitalize">{category.category}</h4>
                            <p className="text-sm text-gray-500">No image uploaded</p>
                          </div>
                          <CategoryImageUpload
                            category={category.category}
                            onUpload={(imageUrl, title, description) => 
                              handleCreateCategoryImage(category.category, imageUrl, title, description)
                            }
                            disabled={createCategoryImage.isPending}
                          />
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
