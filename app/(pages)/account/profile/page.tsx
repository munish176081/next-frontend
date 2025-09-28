"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard } from "@/_components/common/dashboard-widgets";
import { Input } from "@/_components/ui/form-fields/input";
import { LoadingButton } from "@/_components/ui/loading-button";
import { ProfileImageUpload } from "@/_components/common/profile-image-upload";
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

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        imageUrl: user.imageUrl || "",
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
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
                      {...register("name")}
                      error={errors.name?.message}
                      variant="outline"
                      size="DEFAULT"
                    />
                    
                    {/* <Input
                      label="Username"
                      placeholder="Enter your username"
                      {...register("username")}
                      error={errors.username?.message}
                      variant="outline"
                      size="DEFAULT"
                    /> */}
                    
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email")}
                      error={errors.email?.message}
                      variant="outline"
                      size="DEFAULT"
                    />
                    
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
