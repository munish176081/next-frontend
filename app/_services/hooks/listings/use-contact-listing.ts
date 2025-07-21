import { useMutation } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

async function contactListing(id: string) {
  await axios.post(`/listings/${id}/contact`);
}

export const useContactListing = () => {
  return useMutation({
    mutationFn: contactListing,
  });
}; 