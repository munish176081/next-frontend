import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

interface UserProfileData {
  id: string;
  name: string;
  username: string;
  imageUrl?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  businessName?: string;
  businessABN?: string;
  description?: string;
  bio?: string;
  joinedDate?: string;
  isVerified?: boolean;
  stateRegistration?: string;
  totalLitters?: number;
  createdAt: string;
}

interface UserListings {
  puppies: any[];
  litters: any[];
  stud: any[];
  semen: any[];
  wanted: any[];
  services: any[];
}

export const useUserProfile = (username: string) => {
  return useQuery({
    queryKey: ['user-profile', username],
    queryFn: async (): Promise<UserProfileData> => {
      const { data } = await axios.get(`/users/profile/${username}`);
      return data;
    },
    enabled: !!username,
  });
};

export const useUserListings = (username: string, type?: string) => {
  return useQuery({
    queryKey: ['user-listings', username, type],
    queryFn: async (): Promise<UserListings> => {
      const { data } = await axios.get(`/users/${username}/listings`);
      return data;
    },
    enabled: !!username,
  });
};
