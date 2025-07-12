import { useMutation } from "@tanstack/react-query";
import { axios } from "@/_lib/axios";
import { ContactFormType } from "@/_config/validate-schema";

interface ContactResponse {
  message: string;
  success: boolean;
}

export const useContact = () => {
  return useMutation({
    mutationFn: async (data: ContactFormType): Promise<ContactResponse> => {
      const response = await axios.post("/contact", data);
      return response.data;
    },
  });
}; 