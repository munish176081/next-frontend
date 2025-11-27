"use client";

import { useState } from 'react';
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { AdminGuard } from "@/_components/common/admin-guard";
import { VerificationGuard } from "@/_components/common/verification-guard";
import { BreedList } from "@/_components/admin/breeds/breed-list";
import { BreedForm } from "@/_components/admin/breeds/breed-form";
import { 
  useCreateBreed, 
  useUpdateBreed, 
  type Breed,
  type CreateBreedData,
  type UpdateBreedData 
} from "@/_services/hooks/admin";
import { Button } from "@/_components/ui/button";
import { ArrowLeft } from "lucide-react";

type ViewMode = 'list' | 'create' | 'edit';

export default function AdminBreedsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);

  const createBreed = useCreateBreed();
  const updateBreed = useUpdateBreed();

  const handleCreate = () => {
    setSelectedBreed(null);
    setViewMode('create');
  };

  const handleEdit = (breed: Breed) => {
    setSelectedBreed(breed);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedBreed(null);
  };

  const handleCreateSubmit = async (data: CreateBreedData) => {
    await createBreed.mutateAsync(data);
    setViewMode('list');
  };

  const handleUpdateSubmit = async (data: UpdateBreedData) => {
    if (selectedBreed) {
      await updateBreed.mutateAsync({ id: selectedBreed.id, data });
      setViewMode('list');
      setSelectedBreed(null);
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </Button>
              <h1 className="text-2xl font-semibold">Create New Breed</h1>
            </div>
            {/* @ts-ignore */}
            <BreedForm
              onSubmit={handleCreateSubmit}
              onCancel={handleCancel}
              isLoading={createBreed.isPending}
            />
          </div>
        );

      case 'edit':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </Button>
              <h1 className="text-2xl font-semibold">Edit Breed</h1>
            </div>
            {selectedBreed && (
              <BreedForm
                breed={selectedBreed}
                onSubmit={handleUpdateSubmit}
                onCancel={handleCancel}
                isLoading={updateBreed.isPending}
              />
            )}
          </div>
        );

      default:
        return (
          <BreedList
            onEdit={handleEdit}
            onCreate={handleCreate}
          />
        );
    }
  };

  return (
    <VerificationGuard>
      <AdminGuard>
        <DashboardLayout 
          title={viewMode === 'list' ? 'Breed Management' : viewMode === 'create' ? 'Create Breed' : 'Edit Breed'} 
          showTimeFilter={false}
        >
          <div className="space-y-6">
            {renderContent()}
          </div>
        </DashboardLayout>
      </AdminGuard>
    </VerificationGuard>
  );
} 