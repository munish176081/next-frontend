"use client";

import { useState } from "react";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Checkbox } from "@/_components/ui/form-fields/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import {
  useAdminBreeds,
  useDeleteBreed,
  useToggleBreedStatus,
  type Breed,
  type BreedQueryParams,
} from "@/_services/hooks/admin";
import { useToggleFeaturedBreed } from "@/_services/hooks/breeds/use-toggle-featured-breed";
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Trash, Star, StarOff } from "lucide-react";
import { CSVImport } from "./csv-import";
import { toast } from "@/_hooks/use-toast";
import Image from "next/image";

interface BreedListProps {
  onEdit: (breed: Breed) => void;
  onCreate: () => void;
}

const CATEGORIES = [
  "toy",
  "sporting",
  "herding",
  "working",
  "terrier",
  "hound",
  "companion",
  "mixed",
];

const SIZES = ["small", "medium", "large", "giant"];

export function BreedList({ onEdit, onCreate }: BreedListProps) {
  const [filters, setFilters] = useState<BreedQueryParams>({
    page: 1,
    limit: 20,
    sortBy: "sortOrder",
    sortOrder: "ASC",
  });

  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [searchText, setSearchText] = useState<string>("");

  const { data, isLoading, error } = useAdminBreeds(filters);
  const deleteBreed = useDeleteBreed();
  const toggleStatus = useToggleBreedStatus();
  const toggleFeatured = useToggleFeaturedBreed();

  const handleFilterChange = (
    key: keyof BreedQueryParams,
    value: string | number | boolean | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Debounce search input
  const onChangeSearch = (value: string) => {
    setSearchText(value);
    // Basic debounce
    if ((onChangeSearch as any).t) clearTimeout((onChangeSearch as any).t);
    (onChangeSearch as any).t = setTimeout(() => {
      const trimmedValue = value.trim();
      // Set to undefined if empty to properly remove the filter
      handleFilterChange("search", trimmedValue === "" ? undefined : trimmedValue);
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleDelete = async (breed: Breed) => {
    if (confirm(`Are you sure you want to deactivate "${breed.name}"?`)) {
      await deleteBreed.mutateAsync(breed.id);
    }
  };

  const handleToggleStatus = async (breed: Breed) => {
    await toggleStatus.mutateAsync({ id: breed.id, isActive: !breed.isActive });
  };

  const handleToggleFeatured = async (breed: Breed) => {
    await toggleFeatured.mutateAsync(breed.id);
  };

  const handleSelectBreed = (breedId: string, checked: boolean) => {
    if (checked) {
      setSelectedBreeds(prev => [...prev, breedId]);
    } else {
      setSelectedBreeds(prev => prev.filter(id => id !== breedId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBreeds(data?.breeds?.map(breed => breed.id) || []);
    } else {
      setSelectedBreeds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBreeds.length === 0) {
      toast({
        title: 'No breeds selected',
        description: 'Please select breeds to delete.',
        variant: 'destructive',
      });
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedBreeds.length} breed(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsBulkDeleting(true);
    try {
      // Delete breeds one by one
      for (const breedId of selectedBreeds) {
        try {
          await deleteBreed.mutateAsync(breedId);
        } catch (error: any) {
          // Check if the error is about active listings
          if (error.response?.data?.message?.includes('listings')) {
            toast({
              title: 'Cannot delete breed',
              description: `This breed has active listings associated with it and cannot be deleted.`,
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error deleting breed',
              description: error.response?.data?.message || 'Failed to delete breed',
              variant: 'destructive',
            });
          }
        }
      }
      
      setSelectedBreeds([]);
      toast({
        title: 'Bulk delete completed',
        description: `Successfully processed ${selectedBreeds.length} breeds.`,
      });
    } catch (error) {
      toast({
        title: 'Bulk delete failed',
        description: 'An error occurred during bulk deletion.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Failed to load breeds</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col border border-black/20 rounded-[20px] pb-4">
      <div className="flex gap-4 items-center p-6 justify-between">
        <span className="text-[22px] font-semibold">Breed Management</span>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              value={searchText}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Search breeds..."
              className="pl-9 w-[240px]"
            />
          </div>
          {selectedBreeds.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="flex items-center gap-2 bg-red-600 text-white rounded-full px-6 py-2 hover:bg-red-700"
            >
              <Trash className="w-4 h-4" />
              {isBulkDeleting ? 'Deleting...' : `Delete ${selectedBreeds.length} Selected`}
            </Button>
          )}
          <CSVImport onImportComplete={() => window.location.reload()} />
          <Button
            onClick={onCreate}
            className="flex items-center gap-2 bg-black text-white rounded-full px-6 py-2"
          >
            <Plus className="w-4 h-4" />
            Add Breed
          </Button>
        </div>
      </div>

      {/* Breeds Table */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading breeds...</p>
        </div>
      ) : (
        <>
          {!data?.breeds && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No breeds found or failed to load breeds.
              </p>
            </div>
          )}

          <div className="overflow-auto w-full px-6">
            <table className="w-full text-left">
              <thead className="text-[#A3AED0] text-sm border-b border-[#E9EDF7]">
                <tr>
                  <th className="px-8 py-3 font-medium">
                    <Checkbox
                      checked={selectedBreeds.length === data?.breeds?.length && data?.breeds?.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                  </th>
                  <th className="px-8 py-3 font-medium">Image</th>
                  <th className="px-8 py-3 font-medium">Name</th>
                  <th className="px-8 py-3 font-medium">Category</th>
                  <th className="px-8 py-3 font-medium">Size</th>
                  <th className="px-8 py-3 font-medium text-center">Status</th>
                  <th className="px-8 py-3 font-medium text-center">Featured</th>
                  <th className="px-8 py-3 font-medium">Sort Order</th>
                  <th className="px-8 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.breeds?.map((breed) => (
                  <tr key={breed.id} className="border-b border-[#E9EDF7]">
                    <td className="px-8 py-3 text-sm font-medium">
                      <Checkbox
                        checked={selectedBreeds.includes(breed.id)}
                        onCheckedChange={(checked) => handleSelectBreed(breed.id, checked as boolean)}
                        className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                    </td>
                    <td className="px-8 py-3 text-sm font-medium">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                        {breed.imageUrl && breed.imageUrl.trim() !== '' ? (
                          <>
                            {/* <img
                              src={breed.imageUrl}
                              alt={breed.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const img = e.currentTarget;
                                img.style.display = 'none';
                                const placeholder = img.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                                if (placeholder) {
                                  placeholder.classList.remove('hidden');
                                }
                              }}
                              onLoad={(e) => {
                                const img = e.currentTarget;
                                const placeholder = img.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                                if (placeholder) {
                                  placeholder.classList.add('hidden');
                                }
                              }}
                            /> */}
                            <Image
                              src={breed.imageUrl}
                              alt={breed.name}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                            <div className="image-placeholder hidden w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs absolute inset-0">
                              No Image
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-3 text-sm font-medium">
                      <div>
                        <div className="font-medium">{breed.name}</div>
                        <div className="text-sm text-gray-500">
                          {breed.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-3 text-sm font-medium">
                      {breed.category && (
                        <span className="capitalize">{breed.category}</span>
                      )}
                    </td>
                    <td className="px-8 py-3 text-sm font-medium">
                      {breed.size && (
                        <span className="capitalize">{breed.size}</span>
                      )}
                    </td>
                    <td className="px-8 py-3 text-sm font-medium text-center">
                      <span
                        className={`min-h-6 text-[10px] rounded-full w-14 mx-auto flex items-center justify-center ${
                          breed.isActive
                            ? "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E]"
                            : "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50]"
                        }`}
                      >
                        {breed.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-8 py-3 text-sm font-medium text-center">
                      <button
                        onClick={() => handleToggleFeatured(breed)}
                        disabled={toggleFeatured.isPending}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          breed.isFeatured
                            ? "text-yellow-600 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100"
                            : "text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {breed.isFeatured ? (
                          <Star className="w-3 h-3 fill-current" />
                        ) : (
                          <StarOff className="w-3 h-3" />
                        )}
                        {breed.isFeatured ? "Featured" : "Not Featured"}
                      </button>
                    </td>
                    <td className="px-8 py-3 text-sm font-medium">
                      <span className="text-gray-600">{breed.sortOrder}</span>
                    </td>
                    <td className="px-8 py-3 text-sm font-medium text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(breed)}
                          disabled={toggleStatus.isPending}
                          className="w-8 h-8 p-0"
                        >
                          {breed.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(breed)}
                          className="w-8 h-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(breed)}
                          disabled={deleteBreed.isPending}
                          className="w-8 h-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-6">
              <div className="text-sm text-gray-600">
                Showing {(data.page - 1) * data.limit + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} breeds
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page <= 1}
                  className="border-black/20"
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {data.page} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page >= data.totalPages}
                  className="border-black/20"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {data?.breeds?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No breeds found matching your criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
