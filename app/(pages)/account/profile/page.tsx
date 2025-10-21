"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard } from "@/_components/common/dashboard-widgets";
import { Input } from "@/_components/ui/form-fields/input";
import Textarea from "@/_components/ui/form-fields/textarea";
import LocationField from "@/_components/common/location-field";
import { LoadingButton } from "@/_components/ui/loading-button";
import { ProfileImageUpload } from "@/_components/common/profile-image-upload";
import { useFileUpload } from "@/_services/hooks/upload/use-file-upload";
import { useDeleteUpload } from "@/_services/hooks/upload/use-delete-upload";
import { useUser } from "@/_services/hooks/user/use-user";
import { useUpdateUserProfile } from "@/_services/hooks/user/use-update-user-profile";
import { updateUserProfileSchema, UpdateUserProfileType } from "@/_config/validate-schema";
import { toast } from "@/_hooks/use-toast";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { RequireUser } from "@/_components/common/require-user";

const Profile = () => {
  const { data: user, isLoading: userLoading } = useUser();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateUserProfile();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateUserProfileType>({
    resolver: zodResolver(updateUserProfileSchema),
  });

  const imageUrl = watch("imageUrl");
  
  // File upload state
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [governmentIdUploading, setGovernmentIdUploading] = useState(false);
  const [selfieWithIdUploading, setSelfieWithIdUploading] = useState(false);
  const governmentIdRef = useRef<HTMLInputElement>(null);
  const selfieWithIdRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, isUploading } = useFileUpload({
    onSuccess: (result) => {
      // Remove from uploading set
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(result.fileName);
        return newSet;
      });
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      // Remove any file from uploading set on error
      setUploadingFiles(prev => new Set());
    }
  });

  const { mutate: deleteUpload } = useDeleteUpload();

  // Separate upload hooks for each field
  const { uploadFile: uploadGovernmentId, isUploading: isGovernmentIdUploading } = useFileUpload({
    onSuccess: (result) => {
      const currentUrls = watch("idVerification.governmentId") || [];
      const newUrls = [...currentUrls, result.finalUrl];
      setValue("idVerification.governmentId", newUrls);
      setGovernmentIdUploading(false);
    },
    onError: (error) => {
      console.error('Government ID upload failed:', error);
      setGovernmentIdUploading(false);
    }
  });

  const { uploadFile: uploadSelfieWithId, isUploading: isSelfieWithIdUploading } = useFileUpload({
    onSuccess: (result) => {
      const currentUrls = watch("idVerification.selfieWithId") || [];
      const newUrls = [...currentUrls, result.finalUrl];
      setValue("idVerification.selfieWithId", newUrls);
      setSelfieWithIdUploading(false);
    },
    onError: (error) => {
      console.error('Selfie with ID upload failed:', error);
      setSelfieWithIdUploading(false);
    }
  });

  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldType: 'governmentId' | 'selfieWithId') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (fieldType === 'governmentId') {
        setGovernmentIdUploading(true);
        uploadGovernmentId({ 
          file, 
          fileType: 'image'
        });
      } else if (fieldType === 'selfieWithId') {
        setSelfieWithIdUploading(true);
        uploadSelfieWithId({ 
          file, 
          fileType: 'image'
        });
      }
    });
  };

  const handleDeleteFile = (url: string, fieldType: 'governmentId' | 'selfieWithId') => {
    deleteUpload({ fileUrl: url }, {
      onSuccess: () => {
        const currentUrls = watch(`idVerification.${fieldType}`) || [];
        const newUrls = currentUrls.filter((u: string) => u !== url);
        setValue(`idVerification.${fieldType}`, newUrls);
      }
    });
  };

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        imageUrl: user.imageUrl || "",
        phone: user.phone || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
        businessName: user.businessName || "",
        businessABN: user.businessABN || "",
        description: user.description || "",
        idVerification: user.idVerification || {
          governmentId: [],
          selfieWithId: [],
        },
      });
    }
  }, [user, reset]);

  const onSubmit = (data: UpdateUserProfileType) => {
    updateProfile(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Your profile has been updated successfully!",
        });
      },
      onError: (error: any) => {
        const err = parseAxiosError(error);
        toast({
          title: "Error",
          description: err?.message ?? "Something went wrong",
          variant: "destructive",
        });
      },
    });
  };

  if (userLoading) {
    return (
      <DashboardLayout title="Profile" showTimeFilter={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <RequireUser>
      <DashboardLayout title="Profile" showTimeFilter={false}>
        <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
          <div className="flex flex-col w-full gap-4">
            <DashboardCard title="Personal Information" className="w-full">
              <div className="p-4 space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ProfileImageUpload
                    value={imageUrl}
                    onChange={(url) => setValue("imageUrl", url)}
                    error={errors.imageUrl?.message}
                  />
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-semibold">{user?.name || "User"}</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-600">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      }) : 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name *"
                        placeholder="Enter your full name"
                        {...register("name")}
                        error={errors.name?.message}
                        variant="outline"
                        size="DEFAULT"
                      />
                      
                      <Input
                        label="Email *"
                        type="email"
                        placeholder="Enter your email"
                        {...register("email")}
                        error={errors.email?.message}
                        variant="outline"
                        size="DEFAULT"
                      />
                      
                      <Input
                        label="Phone *"
                        type="text"
                        placeholder="Enter your phone number"
                        {...register("phone")}
                        error={errors.phone?.message}
                        variant="outline"
                        size="DEFAULT"
                      />
                      
                      <Input
                        label="Website"
                        type="url"
                        placeholder="https://your-website.com"
                        {...register("website")}
                        error={errors.website?.message}
                        variant="outline"
                        size="DEFAULT"
                      />
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Location *
                        </label>
                        <LocationField
                          value={watch("location") || ""}
                          onChange={(value) => setValue("location", value)}
                          placeholder="Enter Australian location"
                          error={errors.location?.message}
                          required={true}
                          variant="form-field"
                        />
                      </div>
                    </div>
                    
                    <Textarea
                      label="Bio"
                      placeholder="Tell us about yourself (250 characters max)"
                      {...register("bio")}
                      error={errors.bio?.message}
                      rows={3}
                      maxLength={250}
                    />
                  </div>

                  {/* Business Information Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Business or Breeders Name *"
                        placeholder="Enter your business name"
                        {...register("businessName")}
                        error={errors.businessName?.message}
                        variant="outline"
                        size="DEFAULT"
                      />
                      
                      <Input
                        label="Business ABN *"
                        placeholder="Enter 11-digit ABN"
                        {...register("businessABN")}
                        error={errors.businessABN?.message}
                        variant="outline"
                        size="DEFAULT"
                      />
                    </div>
                    
                    <Textarea
                      label="Description *"
                      placeholder="Describe your business or breeding practices (1000 characters max)"
                      {...register("description")}
                      error={errors.description?.message}
                      rows={4}
                      maxLength={1000}
                    />
                  </div>

                  {/* ID Verification Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">ID Verification</h4>
                    <p className="text-sm text-gray-600">
                      Upload 1 government-issued ID and 1 image of yourself holding the ID
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Government ID Upload */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Government Issued ID
                        </label>
                        <div className="relative">
                          <div className={`border-2 rounded-2xl p-6 relative h-[300px] items-center justify-center flex flex-col ${errors.idVerification?.governmentId ? 'border-red-500' : 'border-gray-300'} ${governmentIdUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input
                              ref={governmentIdRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'governmentId')}
                              className="absolute top-0 left-0 w-full h-full cursor-pointer opacity-0"
                            />
                            <img className="w-24" src="/images/vectors/uploadImage.png" alt="" />
                            <span className="text-[22px] font-medium text-black text-center flex flex-col">
                              Upload Government ID
                              <small className="text-sm font-normal text-[#4B4A4A8C]">
                                (Max size: 5 MB)
                              </small>
                              {governmentIdUploading && (
                                <small className="text-sm font-normal text-blue-600 mt-2">
                                  Uploading...
                                </small>
                              )}
                            </span>
                          </div>
                          
                          {/* Uploaded Files */}
                          {(watch("idVerification.governmentId") || []).length > 0 && (
                            <div className="mt-4 w-full border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <p className="text-sm font-medium text-gray-700">
                                  Uploaded Files ({(watch("idVerification.governmentId") || []).length})
                                </p>
                              </div>
                              <div className="space-y-2">
                                {(watch("idVerification.governmentId") || []).map((url: string, index: number) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <img src={url} alt={`Upload ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                                      <span className="text-sm text-gray-700">Government ID</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteFile(url, 'governmentId')}
                                      className="text-red-600 hover:text-red-800 p-1"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {errors.idVerification?.governmentId && (
                          <p className="text-sm text-red-600">{errors.idVerification.governmentId.message}</p>
                        )}
                      </div>

                      {/* Selfie with ID Upload */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Selfie with ID
                        </label>
                        <div className="relative">
                          <div className={`border-2 rounded-2xl p-6 relative h-[300px] items-center justify-center flex flex-col ${errors.idVerification?.selfieWithId ? 'border-red-500' : 'border-gray-300'} ${selfieWithIdUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input
                              ref={selfieWithIdRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'selfieWithId')}
                              className="absolute top-0 left-0 w-full h-full cursor-pointer opacity-0"
                            />
                            <img className="w-24" src="/images/vectors/uploadImage.png" alt="" />
                            <span className="text-[22px] font-medium text-black text-center flex flex-col">
                              Upload Selfie with ID
                              <small className="text-sm font-normal text-[#4B4A4A8C]">
                                (Max size: 5 MB)
                              </small>
                              {selfieWithIdUploading && (
                                <small className="text-sm font-normal text-blue-600 mt-2">
                                  Uploading...
                                </small>
                              )}
                            </span>
                          </div>
                          
                          {/* Uploaded Files */}
                          {(watch("idVerification.selfieWithId") || []).length > 0 && (
                            <div className="mt-4 w-full border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <p className="text-sm font-medium text-gray-700">
                                  Uploaded Files ({(watch("idVerification.selfieWithId") || []).length})
                                </p>
                              </div>
                              <div className="space-y-2">
                                {(watch("idVerification.selfieWithId") || []).map((url: string, index: number) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <img src={url} alt={`Upload ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                                      <span className="text-sm text-gray-700">Selfie with ID</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteFile(url, 'selfieWithId')}
                                      className="text-red-600 hover:text-red-800 p-1"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {errors.idVerification?.selfieWithId && (
                          <p className="text-sm text-red-600">{errors.idVerification.selfieWithId.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <LoadingButton
                    type="submit"
                    loading={isUpdating}
                    loadingText="Updating Profile..."
                    className="w-full h-12 bg-black text-white rounded-full hover:bg-gray-800"
                  >
                    Update Profile
                  </LoadingButton>
                </form>
              </div>
            </DashboardCard>
          </div>
        </div>
      </DashboardLayout>
    </RequireUser>
  );
};

export default Profile;
