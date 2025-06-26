import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import { useRef } from "react";

interface SearchLocationInputProps {
  restrictedToCountry?: string;
  children: React.ReactChild;
  loader?: React.ReactNode;
  onSearchPlace: (place?: google.maps.places.PlaceResult) => void;
}

type l = "places"[];
const libraries: l = ["places"];

export const LocationAutoComplete = ({
  restrictedToCountry = "AU",
  children,
  onSearchPlace,
  loader,
}: SearchLocationInputProps) => {
  const { isLoaded } = useLoadScript({
    // TODO!: move env from public
    googleMapsApiKey: `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async`,
    libraries,
  });
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onPlaceChanged = () => {
    const place = autocompleteRef.current!.getPlace();

    onSearchPlace(place);
  };

  const options = restrictedToCountry
    ? {
        componentRestrictions: { country: restrictedToCountry },
      }
    : undefined;

  return (
    <div className="w-full flex-1">
      {!isLoaded && loader}
      {isLoaded && (
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
          options={options}
        >
          {children}
        </Autocomplete>
      )}
    </div>
  );
};
