"use client";

import { SearchLocationInput } from "@/_components/common/search-location-input";
import { Button } from "@/_components/ui/button";
import { BreedSelect } from "@/_components/form-fields/breed-select";
import { Routes } from "@/_config/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { SyntheticEvent, useState } from "react";

export function FindForm() {
  const [breed, setBreed] = useState("");
  const searchParams = useSearchParams();
  const [searchLocation, setSearchLocation] = useState<{
    address?: string;
    lat?: number;
    lng?: number;
  }>();

  const formatAustralianLocation = (place: google.maps.places.PlaceResult) => {
    const components = place.address_components ?? [];

    const isInAustralia = components.some(
      (c) => c.types.includes("country") && c.short_name === "AU"
    );

    if (!isInAustralia) {
      return place.formatted_address ?? "";
    }

    const suburb = components.find((c) =>
      c.types.includes("locality")
    )?.long_name;
    const postcode = components.find((c) =>
      c.types.includes("postal_code")
    )?.long_name;
    const state = components.find((c) =>
      c.types.includes("administrative_area_level_1")
    )?.short_name;

    const parts = [suburb, postcode, state].filter(Boolean);
    return parts.length ? parts.join(", ") : place.formatted_address ?? "";
  };

  const router = useRouter();

  const handleFormSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams);

    if (breed) params.set("breed", breed);
    if (searchLocation?.address) params.set("address", searchLocation.address);
    if (searchLocation?.lat) params.set("lat", searchLocation.lat.toString());
    if (searchLocation?.lng) params.set("lng", searchLocation.lng.toString());

    router.push(`${Routes.public.explore}?${params.toString()}`);
  };

  return (
    <form noValidate onSubmit={handleFormSubmit} className="confidenceform flex flex-col gap-5">
      <SearchLocationInput
        locationInputAddress={searchLocation?.address}
        onChangeSearchInput={(value) => {
          setSearchLocation({
            address: value,
          });
        }}
        onChangePlace={(place) => {
          if (!place) return;

          const formattedAddress = formatAustralianLocation(place);

          setSearchLocation({
            address: formattedAddress,
            ...(place.geometry?.location?.toJSON() ?? {}),
          });
        }}
      />
      <BreedSelect 
        value={breed} 
        onChange={(value) => setBreed(value)} 
        label="Select breed"
        required={false}
        showLabel={false}
        className="w-full active:!scale-100 h-20 min-h-20 max-md:h-12 max-md:min-h-12 hover:bg-transparent border border-black rounded-full text-base px-8 py-2"
      />
      <Button type="submit" className="w-full h-20 max-md:h-12 bg-black text-1xl max-md:text-base font-semibold rounded-full">Submit</Button>
    </form>
  );
}

// NOTE: This component uses useSearchParams and must be wrapped in <Suspense> by the parent.
// export default function FindFormWithSuspense(props: React.ComponentProps<typeof FindForm>) {
//   return (
//     <Suspense fallback={null}>
//       <FindForm {...props} />
//     </Suspense>
//   );
// }
