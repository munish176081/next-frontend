import { axios } from "@/_lib/axios";
import { objectToFormData } from "@/_lib/utils";
import { UnknownRecord } from "@/_types/global";
import { ListingType } from "@/_types/listing";
import { useMutation } from "@tanstack/react-query";

async function createListing(data: UnknownRecord) {
  const formData = objectToFormData(data);

  const { data: response } = await axios.post<ListingType>(
    "/listings",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response;
}

export const useCreateListing = () => {
  return useMutation({
    mutationFn: createListing,
  });
};
