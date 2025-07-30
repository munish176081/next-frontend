"use client";

import { useState } from "react";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
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
import { Search, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

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

  const { data, isLoading, error } = useAdminBreeds(filters);
  const deleteBreed = useDeleteBreed();
  const toggleStatus = useToggleBreedStatus();

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
        <Button
          onClick={onCreate}
          className="flex items-center gap-2 bg-black text-white rounded-full px-6 py-2"
        >
          <Plus className="w-4 h-4" />
          Add Breed
        </Button>
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
                  <th className="px-8 py-3 font-medium">Name</th>
                  <th className="px-8 py-3 font-medium">Category</th>
                  <th className="px-8 py-3 font-medium">Size</th>
                  <th className="px-8 py-3 font-medium text-center">Status</th>
                  <th className="px-8 py-3 font-medium">Sort Order</th>
                  <th className="px-8 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.breeds?.map((breed) => (
                  <tr key={breed.id} className="border-b border-[#E9EDF7]">
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
                Showing {(data.page - 1) * data.limit + 1} to{" "}
                {Math.min(data.page * data.limit, data.total)} of {data.total}{" "}
                breeds
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
