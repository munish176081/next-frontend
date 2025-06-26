import { axios } from "@/_lib/axios";
import { ListingCheckoutType } from "@/_types/listing";
import { useMutation } from "@tanstack/react-query";

async function checkoutListing({
  listingId,
  durationInDays,
  adId,
  adDurationInDays,
}: ListingCheckoutType) {
  const { data: response } = await axios.post<{ checkoutUrl: string }>(
    `/listings/${listingId}/checkout`,
    { durationInDays, adId, adDurationInDays }
  );

  return response;
}

export const useCheckoutListing = () => {
  return useMutation({
    mutationFn: checkoutListing,
  });
};
