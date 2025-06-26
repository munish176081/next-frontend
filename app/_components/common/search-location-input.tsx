"use client";

import { FieldError, Input } from "@/_components/ui/form-fields";
import { LocationAutoComplete } from "./location-auto-complete";
import { MapPin } from "lucide-react";

interface SearchLocationInputProps {
  locationInputAddress?: string;
  onChangeSearchInput(input: string): void;
  onChangePlace(place?: google.maps.places.PlaceResult): void;
  error?: string;
}

export const SearchLocationInput = ({
  locationInputAddress = "",
  onChangePlace,
  onChangeSearchInput,
  error,
}: SearchLocationInputProps) => {
  return (
    <div className="w-full flex-1 ">
      <LocationAutoComplete
        onSearchPlace={(place) => {
          if (!place) return;

          console.log({ place, j: place.geometry?.location?.toJSON() });

          onChangePlace(place);
        }}
        loader={
          <Input
            type="text"
            label="Search Destination"
            inputClassName="!text-sm !pl-12 "
            labelClassName="lg:!text-base !mb-2 text-gray-dark"
            startIconClassName="!left-1"
            placeholder="Loading . . ."
            disabled
          />
        }
      >
        <Input
          type="text"
          startIconClassName=""
          inputClassName="text-black flex items-center gap-4 w-full h-20 min-h-20 max-md:h-12 max-md:min-h-12 border border-black rounded-[51px] px-8 outline-none focus:outline-none !text-base !px-[70px]  max-md:!px-[50px]"
          // placeholder="Queen St, Melbourne VIC 3000, Australia..."
          placeholder="Location"
          required
          clearable={locationInputAddress ? true : false}
          endIcon={true}
          startIcon={<MapPin className="text-black" />}
          onClearClick={() => {
            onChangePlace(undefined);
            onChangeSearchInput("");
          }}
          value={locationInputAddress || "Location"}
          variant="flat"
          onChange={(event) => {
            onChangeSearchInput(event.target.value);
          }}
        />
      </LocationAutoComplete>
      {error && <FieldError size="lg" error={error} />}
    </div>
  );
};
