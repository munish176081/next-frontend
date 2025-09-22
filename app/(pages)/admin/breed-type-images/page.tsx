"use client";

import { useState } from 'react';
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { AdminGuard } from "@/_components/common/admin-guard";
import { VerificationGuard } from "@/_components/common/verification-guard";
import { BreedTypeImageList } from "@/_components/admin/breed-type-images/breed-type-image-list";
import { BreedTypeImageForm } from "@/_components/admin/breed-type-images/breed-type-image-form";
import { 
  useUpdateBreedTypeImage, 
  type BreedTypeImage,
  type UpdateBreedTypeImageData 
} from "@/_services/hooks/admin";
import { Button } from "@/_components/ui/button";
import { ArrowLeft } from "lucide-react";

type ViewMode = 'list' | 'edit';

export default function AdminBreedTypeImagesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBreedTypeImage, setSelectedBreedTypeImage] = useState<BreedTypeImage | null>(null);

  const updateBreedTypeImage = useUpdateBreedTypeImage();


  const handleEdit = (breedTypeImage: BreedTypeImage) => {
    setSelectedBreedTypeImage(breedTypeImage);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedBreedTypeImage(null);
  };


  const handleUpdateSubmit = async (data: UpdateBreedTypeImageData) => {
    if (selectedBreedTypeImage) {
      await updateBreedTypeImage.mutateAsync({ id: selectedBreedTypeImage.id, data });
      setViewMode('list');
      setSelectedBreedTypeImage(null);
    }
  };

  const renderContent = () => {
    switch (viewMode) {
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
              <h1 className="text-2xl font-semibold">Edit Breed Type Image</h1>
            </div>
            {selectedBreedTypeImage && (
              <BreedTypeImageForm
                breedTypeImage={selectedBreedTypeImage}
                onSubmit={handleUpdateSubmit}
                onCancel={handleCancel}
                isLoading={updateBreedTypeImage.isPending}
              />
            )}
          </div>
        );

      default:
        return (
          <BreedTypeImageList
            onEdit={handleEdit}
          />
        );
    }
  };

  return (
    <VerificationGuard>
      <AdminGuard>
        <DashboardLayout 
          title={viewMode === 'list' ? 'Manage Breed Type (Categories)' : 'Edit Breed Type Image'} 
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
