import { axios } from "@/_lib/axios";
import { useQuery } from "@tanstack/react-query";

async function getUserUploads() {
  const { data } = await axios.get("/uploads/my-uploads");
  return data;
}

export const useGetUserUploads = () => {
  return useQuery({
    queryKey: ["user-uploads"],
    queryFn: getUserUploads,
  });
}; 