"use client";

import { SearchLocationInput } from "@/_components/common/search-location-input";
import { PawsIcon } from "@/_components/icons/paws-icon";
import { Combobox } from "@/_components/ui";
import { Button } from "@/_components/ui/button";
import { DOG_BREEDS_OPTIONS } from "@/_config/data";
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
      <SearchLocationInput locationInputAddress={searchLocation?.address} onChangeSearchInput={(value) => {setSearchLocation({address: value,});}} onChangePlace={(place) => {if (!place) return;setSearchLocation({address: place.formatted_address!, ...(place.geometry?.location?.toJSON() ?? {}),});}}/>
      <Combobox showLabel={false} label="Select breed" Icon={PawsIcon} hasIcon={true} options={DOG_BREEDS_OPTIONS.map((option) => ({value: option.value, label: option.label, }))} btnClassName="w-full active:!scale-100 flex items-center gap-4 h-20 min-h-20 max-md:gap-2 max-md:px-4 max-md:h-12 max-md:min-h-12 hover:bg-transparent border border-black rounded-full !text-base px-8" popoverClassName="w-[--radix-popover-trigger-width]" value={breed} setValue={(value) => setBreed(value)}/>
      <Button type="submit" className="w-full h-20 max-md:h-12 bg-black text-1xl max-md:text-base font-semibold rounded-full">Submit</Button>
    </form>
  );
}
